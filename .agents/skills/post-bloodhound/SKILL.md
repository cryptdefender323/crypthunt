---
name: post-bloodhound
description: "BloodHound Active Directory attack path analysis. bloodhound-python collection, Neo4j Cypher queries, shortest path to DA, Kerberoastable accounts, ASREPRoastable, ACL edges, unconstrained delegation, session data. Triggers: 'bloodhound', 'bloodhound-python', 'attack path', 'ad attack path', 'domain admin path', 'cypher query ad', 'neo4j bloodhound', 'ad enumeration', 'kerberoastable', 'asreproastable'."
---

# BloodHound — Active Directory Attack Path Analysis

Map AD relationships and find paths to Domain Admin. Uses bloodhound-python + Neo4j Cypher queries.

## Install

```bash
pip install bloodhound --break-system-packages

sudo apt-get install -y neo4j
sudo neo4j start

docker run -p 8080:8080 specterops/bloodhound:latest

```

---

## Phase 1: Collection

```bash
DC_IP="10.10.10.1"
DOMAIN="CORP.LOCAL"
USERNAME="validuser"
PASSWORD="password"

bloodhound-python -u "$USERNAME" -p "$PASSWORD" \
  -d "$DOMAIN" -ns $DC_IP \
  -c all --zip

bloodhound-python -u "$USERNAME" -p "$PASSWORD" \
  -d "$DOMAIN" -ns $DC_IP \
  -c DCOnly --zip

bloodhound-python -u "administrator" --hashes ":NTHASH" \
  -d "$DOMAIN" -ns $DC_IP -c all --zip

KRB5CCNAME=/tmp/admin.ccache bloodhound-python -u "administrator" \
  -d "$DOMAIN" -ns $DC_IP -c all --zip -k --no-pass

bloodhound-python -u '' -p '' -d "$DOMAIN" -ns $DC_IP -c DCOnly

ls -la *.zip  # bloodhound_*.zip
```

---

## Phase 2: Import to Neo4j

```bash

sudo neo4j start

NEO4J_AUTH="neo4j:your_password"
cypher() {
    curl -s -X POST http://localhost:7474/db/neo4j/tx/commit \
        -H "Content-Type: application/json" \
        -u "$NEO4J_AUTH" \
        -d "{\"statements\":[{\"statement\":\"$1\"}]}" | python3 -m json.tool
}
```

---

## Phase 3: Key Attack Path Queries

```bash
cypher "MATCH p=shortestPath((u:User {name:'LOWPRIV@CORP.LOCAL'})-[*1..]->(g:Group {name:'DOMAIN ADMINS@CORP.LOCAL'})) RETURN p"

cypher "MATCH (u:User),(g:Group {name:'DOMAIN ADMINS@CORP.LOCAL'}) WHERE EXISTS shortestPath((u)-[*1..5]->(g)) RETURN u.name LIMIT 20"

cypher "MATCH (u:User {hasspn:true, enabled:true}) RETURN u.name, u.serviceprincipalnames ORDER BY u.name"

cypher "MATCH (u:User {dontreqpreauth:true, enabled:true}) RETURN u.name, u.memberof"

cypher "MATCH (u:User {hasspn:true, enabled:true, admincount:true}) RETURN u.name, u.serviceprincipalnames"
```

---

## Phase 4: ACL Edge Discovery

```bash
cypher "MATCH (a)-[r:GenericAll|GenericWrite|WriteDacl|WriteOwner|Owns]->(b:User) WHERE b.admincount=true RETURN a.name, TYPE(r), b.name LIMIT 20"

cypher "MATCH (u)-[r:GenericAll|WriteDacl|WriteOwner|DCSync]->(d:Domain) RETURN u.name, TYPE(r), d.name"

cypher "MATCH (u:User)-[:AdminTo]->(c:Computer) RETURN u.name, c.name LIMIT 30"

cypher "MATCH (a)-[:ForceChangePassword]->(b:User) RETURN a.name, b.name LIMIT 20"
```

---

## Phase 5: Delegation & Session Analysis

```bash
# Unconstrained delegation computers (capture any TGT):
cypher "MATCH (c:Computer {unconstraineddelegation:true}) RETURN c.name, c.enabled"

cypher "MATCH (c)-[:AllowedToDelegate]->(t) RETURN c.name, t.name LIMIT 20"

cypher "MATCH (da:User)-[:MemberOf*1..]->(g:Group {name:'DOMAIN ADMINS@CORP.LOCAL'}) MATCH (da)-[:HasSession]->(c:Computer) RETURN da.name, c.name LIMIT 20"

cypher "MATCH (u:User {admincount:true})-[:HasSession]->(c:Computer) RETURN u.name, c.name LIMIT 15"
```

---

## Phase 6: RBAC / Group Analysis

```bash
cypher "MATCH (g:Group)-[r]->(d:Domain) RETURN g.name, TYPE(r), d.name"

cypher "MATCH p=(u:User)-[:MemberOf*1..5]->(g:Group {name:'DOMAIN ADMINS@CORP.LOCAL'}) RETURN u.name, [x IN nodes(p) | x.name]"

cypher "MATCH (u:User {hasspn:true})-[:MemberOf*1..]->(g:Group {name:'DOMAIN ADMINS@CORP.LOCAL'}) RETURN u.name"
```

---

## Phase 7: Manual LDAP Enumeration (No BloodHound)

```bash
DC_IP="10.10.10.1"
BASE_DN="DC=corp,DC=local"

ldapsearch -x -H ldap://$DC_IP -b "$BASE_DN" \
  -D "corp\user" -w "pass" \
  "(&(objectClass=user)(servicePrincipalName=*)(!(samAccountName=krbtgt)))" \
  sAMAccountName servicePrincipalName

ldapsearch -x -H ldap://$DC_IP -b "$BASE_DN" \
  -D "corp\user" -w "pass" \
  "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=4194304))" \
  sAMAccountName

ldapsearch -x -H ldap://$DC_IP -b "$BASE_DN" \
  -D "corp\user" -w "pass" \
  "(&(objectClass=user)(adminCount=1))" sAMAccountName

ldapsearch -x -H ldap://$DC_IP -b "$BASE_DN" \
  -D "corp\user" -w "pass" \
  "(&(objectClass=computer)(userAccountControl:1.2.840.113556.1.4.803:=524288))" \
  sAMAccountName dNSHostName
```

---

## Priority Attack Order

```
1. Kerberoastable + admincount=1 → crack → DA
2. Short DA path (≤ 3 hops) → follow path
3. ACL edges → GenericAll/WriteDacl on privileged accounts → reset password → DA
4. DA sessions on reachable computers → credential dump
5. Unconstrained delegation → wait for DA connection → capture TGT
6. ASREPRoastable → crack → check group memberships
```

---

## Output

Save to `.omop/engagement/post-exploit/bloodhound/`:
- `collection.zip` — raw bloodhound data
- `attack-paths.txt` — shortest paths to DA
- `kerberoastable.txt` — SPN accounts to attack
- `acl-edges.txt` — exploitable ACL relationships

## Next Phase

→ `ad-attacks` for Kerberoasting, DCSync, Pass-the-Hash
→ `ad-netexec` for credential validation and lateral movement
