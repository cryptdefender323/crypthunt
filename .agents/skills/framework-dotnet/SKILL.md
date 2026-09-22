---
name: framework-dotnet
description: "ASP.NET/Core security testing — ViewState deserialization, TRACE method info leak, Razor SSTI, Windows auth bypass, IIS misconfiguration, web.config exposure, machineKey extraction. Triggers: 'dotnet', 'asp.net', '.net framework', 'aspx', 'razor', 'iis security', 'viewstate', 'machinekey'."
---

# ASP.NET / .NET Core Security Testing

ASP.NET attack surface: ViewState, IIS config, Razor SSTI, machineKey, Windows auth.

## Phase 1: Fingerprinting

```bash
TARGET="https://TARGET"

curl -sI "$TARGET" | grep -i "x-aspnet-version\|x-powered-by\|asp.net\|x-aspnetmvc-version"

gobuster dir -u "$TARGET" -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -x aspx,ashx,asmx,svc,config -o /workspace/output/dotnet-endpoints.txt

for f in web.config global.asax elmah.axd trace.axd ScriptResource.axd; do
  code=$(curl -so /dev/null -w "%{http_code}" "$TARGET/$f")
  echo "$code $f"
done | tee /workspace/output/iis-files.txt
```

## Phase 2: ViewState Deserialization

```bash
curl -s "$TARGET/default.aspx" | grep -oP '__VIEWSTATE.*?value="\K[^"]+'

curl -s "$TARGET/elmah.axd" | grep -i "exception\|error\|stack"
```

## Phase 3: TRACE & Debug Methods

```bash
curl -X TRACE "$TARGET/" -H "Cookie: .ASPXAUTH=SESSION_TOKEN" -v

curl -X OPTIONS "$TARGET/" -v 2>&1 | grep "Allow:"

for path in /trace.axd /WebResource.axd /ScriptResource.axd /_blazor/negotiate; do
  curl -so /dev/null -w "%{http_code} $path\n" "$TARGET$path"
done
```

## Phase 4: web.config Exposure

```bash
for f in "web.config" "Web.config" "WEB.CONFIG" "web.config.bak" "web.config.old"; do
  curl -s "$TARGET/$f" | grep -i "connectionString\|machineKey\|appSettings"
done

curl -s -X POST "$TARGET/render" -d "template=@(1+1)" | grep "^2$"
```

## Phase 5: Windows Auth / NTLM

```bash
curl -sI "$TARGET/" | grep -i "www-authenticate\|negotiate\|ntlm"

# Capture NTLM hash with Responder (if internal)

nmap -p 445 --script smb2-security-mode TARGET_IP
```

## Output

Save to `/workspace/output/`:
- `dotnet-endpoints.txt` — discovered .aspx/.asmx endpoints
- `iis-files.txt` — IIS sensitive file probes

## Next Phase

→ `vuln-deserialization` for ViewState/BinaryFormatter exploitation
→ `vuln-ssti` for Razor template injection
