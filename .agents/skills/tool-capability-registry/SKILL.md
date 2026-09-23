---
name: tool-capability-registry
description: "Structured capability registry for top 20 security tools. Defines WHY, WHEN, WHAT question each tool answers, WHAT evidence it produces, WHAT action follows, risk level, failure interpretation, validation relevance, related and alternative tools. Load this skill to make intelligent tool selection decisions — not 'which tool do I have' but 'which tool answers my hypothesis'. Triggers: 'tool selection', 'which tool', 'what tool should I use', 'tool registry', 'capability lookup'."
version: 1.0.0
phase: ["all"]
category: ["all"]
tags: ["tool-selection", "capability", "registry", "intelligence", "decision"]    
---

# Tool Capability Registry — Intelligent Selection Engine

## HOW TO USE THIS REGISTRY

Before selecting a tool, answer:

```
HYPOTHESIS:    What specific claim am I testing?
QUESTION:      What question would confirm or deny it?
→ Find the tool that answers THAT question
→ Not: "I have nmap, let me run nmap"
→ Yes: "I need to know if port 443 serves HTTPS with a valid cert — use curl -I"
```

**Tool selection anti-patterns:**
- Running tools because they are "standard" — every tool run needs a reason
- Running multiple tools that answer the same question — pick one
- Running a tool before forming a hypothesis — state the hypothesis first
- Using heavy tools when light tools suffice — curl before sqlmap

---

## REGISTRY

---

### nmap

```yaml
capability: Network port scanner and service fingerprinter
input_requirements:
  - target: IP address, hostname, CIDR range, or file of targets
  - authorization: explicit written permission required
output_schema:
  - open_ports: list of TCP/UDP ports with state
  - service_versions: service name, version string
  - os_guess: operating system estimate
  - nse_scripts: script-specific structured output
scope_requirements: Active scanning — authorized targets only
risk_level: Medium (default) to High (-A, -sV aggressive)
what_question_it_answers:
  - "What ports are open on this host?"
  - "What service and version is running on port X?"
  - "What OS is this target running?"
evidence_produced: Port/service map — L1 signal for service-specific hypotheses
failure_interpretation:
  - All ports filtered: firewall or host down — try -Pn to skip host discovery
  - No version info: service not responding to version probes — try specific NSE scripts
  - Scan hangs: rate limiting or IDS dropping packets — use -T2, reduce parallelism
validation_relevance: L1 only — nmap open port ≠ exploitable; requires service verification
related_tools: [masscan, naabu, rustscan]
alternative_tools:
  - masscan: faster for large ranges, less accurate on service detection
  - naabu: optimized for bug bounty scope enumeration
  - rustscan: fast port open detection, pipes to nmap for service detection
action_after:
  - Port 22 open → test SSH credential reuse
  - Port 445 open → test SMB authentication, Kerberos
  - Port 80/443 open → run httpx for HTTP details
  - Unusual ports → research service, form specific hypothesis
```

---

### httpx

```yaml
capability: HTTP/HTTPS probe and fingerprinting at scale
input_requirements:
  - targets: list of hosts/URLs (file or stdin)
  - optional: custom headers, follow-redirects flag
output_schema:
  - url: final URL after redirects
  - status_code: HTTP response code
  - title: page title
  - server: Server header value
  - tech: detected technologies
  - ip: resolved IP
risk_level: Low — read-only HTTP requests
what_question_it_answers:
  - "Which hosts in this list serve HTTP/HTTPS?"
  - "What is the server technology on each host?"
  - "Which hosts redirect where?"
  - "What page titles suggest admin/login panels?"
evidence_produced: Live host confirmation + technology stack — L1 for tech-specific hypotheses
failure_interpretation:
  - Connection refused: host down or not serving HTTP on that port
  - All timeouts: rate limiting — reduce -rate and -timeout
  - 0 results from large list: wrong ports — add -ports 80,443,8080,8443
validation_relevance: Confirms liveness — required before running any web-specific tools
related_tools: [curl, whatweb, gobuster]
alternative_tools:
  - curl: single-target detailed request, more control over headers
  - whatweb: deeper tech fingerprinting per host
action_after:
  - Login/admin title found → add to high-value target list
  - Unusual server header → research known CVEs for that version
  - 401/403 → test auth bypass techniques
```

---

### nuclei

```yaml
capability: Template-based vulnerability scanner (5000+ signatures)
input_requirements:
  - targets: URL list or single URL
  - templates: severity filter, tag filter, or specific template IDs
output_schema:
  - template_id: unique template identifier
  - matched_at: URL where match occurred
  - info.name: vulnerability name
  - info.severity: critical/high/medium/low/info
  - extracted_results: template-specific output
scope_requirements: Active scanning — generates traffic; authorized targets only
risk_level: Low to Medium (most templates read-only; some active exploit templates exist)
what_question_it_answers:
  - "Are there known misconfigurations or CVEs visible on this target?"
  - "Does this target expose admin panels, debug endpoints, or sensitive files?"
  - "Are there technology-specific known vulnerabilities?"
evidence_produced: Pattern matches — ALL results are L1 (scanner signal) until manually reproduced
failure_interpretation:
  - Zero results: WAF blocking template signatures, or target genuinely clean
  - False positives common: always verify manually before reporting
  - High rate of 403s: WAF active — try -H "User-Agent: Mozilla/5.0..." to reduce filtering
validation_relevance:
  - L1 by default — nuclei hit ≠ confirmed vulnerability
  - Requires manual reproduction to advance to L2
  - Never report nuclei-only findings without manual verification
related_tools: [nikto, nessus, openvas]
alternative_tools:
  - nikto: older, less maintained, but good for quick web server checks
action_after:
  - Critical/high hit → manual reproduction immediately
  - Medium hit → add to hypothesis queue, test after priority items
  - CVE hit → check patch status, test version-specific PoC
```

---

### subfinder

```yaml
capability: Passive subdomain enumeration from 50+ data sources
input_requirements:
  - domain: root domain to enumerate
  - api_keys: optional — increases coverage significantly
output_schema:
  - subdomains: list of discovered subdomain strings
risk_level: None — passive API queries only, zero target traffic
what_question_it_answers:
  - "What subdomains exist for this domain according to passive sources?"
  - "What is the full attack surface breadth?"
evidence_produced: Subdomain list — attack surface expansion
failure_interpretation:
  - Few results: missing API keys — add Shodan, Censys, VirusTotal, SecurityTrails keys
  - No results: domain too new or obscure — try amass, crt.sh directly
validation_relevance: Subdomains require httpx confirmation before testing
related_tools: [amass, assetfinder, crt.sh]
alternative_tools:
  - amass: more thorough, slower, better for comprehensive engagements
  - assetfinder: faster, fewer sources
action_after: Feed to httpx for live host confirmation
```

---

### ffuf

```yaml
capability: High-speed HTTP fuzzer for directory, file, parameter, and value discovery
input_requirements:
  - url: target URL with FUZZ placeholder
  - wordlist: path to wordlist
  - filters: status code, response size, word count
output_schema:
  - matched_urls: list of discovered paths/parameters
  - status_codes: HTTP status for each match
  - response_size: bytes in response
scope_requirements: Active fuzzing — generates substantial traffic; authorized only
risk_level: Medium — high request volume, may trigger rate limiting or WAF alerts
what_question_it_answers:
  - "Are there hidden directories or files at this URL?"
  - "What parameters does this endpoint accept?"
  - "What values for this parameter return different responses?"
evidence_produced: Discovered endpoints/params — L1 for further testing
failure_interpretation:
  - Too many 200s: soft 404 — add -fs to filter by response size
  - All 403: WAF or access control — try authenticated requests, different UA
  - No matches: wrong wordlist — try domain-specific or technology-specific lists
validation_relevance: Discovery only — found paths require manual testing for vulnerabilities
related_tools: [gobuster, feroxbuster, wfuzz, arjun]
alternative_tools:
  - gobuster: simpler, DNS mode for subdomain brute-force
  - feroxbuster: recursive directory scanning with smart filtering
  - arjun: specifically for parameter discovery (smarter than ffuf for params)
action_after:
  - Admin path found → test authentication, default credentials
  - Backup files found → download, search for credentials
  - Hidden API route → map full API surface
```

---

### sqlmap

```yaml
capability: Automated SQL injection detection and exploitation
input_requirements:
  - target: URL with parameter or request file
  - level: 1-5 (depth of tests)
  - risk: 1-3 (aggressiveness, higher = more destructive potential)
output_schema:
  - injectable_params: list of confirmed injectable parameters
  - dbms: database management system detected
  - databases: list of accessible databases (if exploitation authorized)
  - tables: table names within databases
risk_level: Medium to High — can trigger heavy database load; --risk=3 can modify data
what_question_it_answers:
  - "Is this parameter vulnerable to SQL injection?"
  - "What database system is this?"
  - "What data is accessible via this injection?"
evidence_produced: SQLi confirmation + DBMS fingerprint — L3-L4 when exploitation confirmed
failure_interpretation:
  - No injection found: parameter may not be injectable, or WAF blocking
  - Connection errors: target rate-limiting sqlmap — add --delay=2
  - Partial results: server-side timeout — use --time-sec=10 for time-based
validation_relevance:
  - Always run with --level=1 --risk=1 first (non-destructive)
  - Confirmed injection at L3; data extraction at L4-L5
  - Never run --risk=3 on production without explicit authorization
related_tools: [manual curl, ghauri]
alternative_tools:
  - manual curl: hypothesis testing before sqlmap, lower noise
  - ghauri: more modern, WAF bypass capabilities
action_after: Extract minimum proof (DB name) for PoC; escalate to data extraction only if scoped
```

---

### dalfox

```yaml
capability: XSS scanner with DOM analysis and PoC generation
input_requirements:
  - target: URL with parameters or URL list
  - optional: custom headers, cookies for authenticated testing
output_schema:
  - xss_findings: parameter name, payload, context, PoC URL
  - dom_issues: DOM-based XSS candidates
risk_level: Low — no persistent injection in scanning mode
what_question_it_answers:
  - "Which parameters reflect unsanitized input?"
  - "What XSS context does each parameter use (HTML/attr/JS/URL)?"
  - "What payload achieves code execution in this context?"
evidence_produced: XSS PoC URL — L2-L3 when PoC verified
failure_interpretation:
  - No findings: strong input sanitization, or scan missed params
  - False positives: verify each finding manually in browser
  - Timeouts: reduce concurrency
validation_relevance: Verify each PoC in browser before reporting — dalfox can produce false positives
related_tools: [xsstrike, manual testing]
alternative_tools:
  - xsstrike: better for CSP bypass, more bypass techniques
  - manual curl: context analysis before automated scanning
action_after: Verify PoC in browser, assess impact (session theft possible?), test stored/DOM variants
```

---

### netexec (nxc / crackmapexec)

```yaml
capability: Swiss-army network authentication tester — SMB, WMI, LDAP, RDP, SSH, MSSQL
input_requirements:
  - targets: IP, CIDR, or host list
  - credentials: username+password, username+hash, or Kerberos ticket
  - protocol: smb, winrm, ldap, rdp, ssh, mssql
output_schema:
  - pwned_hosts: hosts where credentials worked
  - shell_access: hosts where code execution succeeded
  - domain_info: users, groups, shares, policies
risk_level: Medium — authentication attempts logged; credential spray can lock accounts
what_question_it_answers:
  - "Do these credentials work on this host?"
  - "Which hosts in this range accept these credentials?"
  - "Can I execute commands on this host with these credentials?"
  - "What SMB shares are accessible?"
evidence_produced: Valid authentication + optional RCE — L3-L4 for lateral movement
failure_interpretation:
  - STATUS_LOGON_FAILURE: wrong credentials
  - STATUS_ACCOUNT_LOCKED: lockout triggered — STOP spraying immediately
  - Access denied on exec: credentials valid but no admin — try WinRM or other protocols
validation_relevance: Authentication success = L3; command execution = L4
related_tools: [impacket suite, smbclient]
alternative_tools:
  - impacket-psexec: deeper SMB shell but more detectable
  - smbclient: manual SMB browsing without execution
action_after:
  - Admin shell obtained → dump credentials (secretsdump), escalate
  - Valid user found → use for Kerberoasting, BloodHound collection
  - Shares found → search for sensitive files
```

---

### impacket suite

```yaml
capability: Collection of Python tools for Windows/AD protocol interaction
key_tools:
  - secretsdump: extract NTLM hashes from SAM/NTDS/LSA
  - psexec: SMB-based command execution
  - wmiexec: WMI-based command execution (less detectable than psexec)
  - GetUserSPNs: Kerberoasting
  - GetNPUsers: AS-REP roasting
  - ticketer: Kerberos ticket forging (Golden/Silver Ticket)
input_requirements: Domain credentials, NTLM hashes, or Kerberos tickets
output_schema:
  - credentials: NTLM hashes, Kerberos tickets, plaintext passwords
  - shell: interactive command execution
risk_level: Medium to High — secretsdump on DC is very high (triggers event 4662)
what_question_it_answers:
  - "What credentials are stored on this system?" (secretsdump)
  - "Which service accounts have crackable tickets?" (GetUserSPNs)
  - "Can I execute code on this host?" (psexec/wmiexec)
evidence_produced: Credential material — L4 when credentials used for further access
failure_interpretation:
  - Connection errors: SMB blocked or credentials invalid
  - Kerberos errors: clock skew too large — sync clocks (max 5 min skew)
  - Access denied on secretsdump: insufficient privileges
validation_relevance: Hash extraction = L4 evidence of credential access
related_tools: [netexec, mimikatz, Rubeus]
alternative_tools:
  - mimikatz: richer credential extraction but requires on-host execution
  - Rubeus: better Kerberos manipulation on Windows
action_after:
  - NTLM hashes → PTH to other hosts, crack with hashcat
  - Kerberoast hashes → offline crack with hashcat -m 13100
  - Domain Admin hash → DCSync for full domain credential dump
```

---

### bloodhound + sharphound/bloodhound-python

```yaml
capability: Active Directory attack path visualization and analysis
input_requirements:
  - collection: domain credentials + domain controller access
  - database: Neo4j instance for data storage and querying
output_schema:
  - nodes: users, computers, groups, GPOs, OUs, domains
  - edges: ACL relationships, group memberships, session data
  - paths: attack paths from owned nodes to high-value targets
risk_level: Low (collection) to Medium (collection creates significant LDAP queries)
what_question_it_answers:
  - "What is the shortest attack path from my owned user to Domain Admin?"
  - "Which users have GenericAll/WriteDACL/DCSync rights?"
  - "Which computers have DA sessions active?"
  - "What ACL abuses exist in this domain?"
evidence_produced: Visualized attack paths — strategic planning tool, L1 until path executed
failure_interpretation:
  - Collection fails: credentials insufficient for LDAP queries
  - Partial data: run with different user with more domain access
  - No DA path: look for indirect paths via constrained delegation, resource-based delegation
validation_relevance: Path visualization = L1; executing each step advances evidence level
related_tools: [netexec, impacket, ADExplorer]
alternative_tools:
  - ADExplorer: manual AD exploration
  - PingCastle: AD security scoring
action_after:
  - Shortest path identified → execute each edge in order
  - DCSync rights found → run impacket-secretsdump immediately
  - Constrained delegation → use Rubeus for S4U2Proxy attack
```

---

### volatility3

```yaml
capability: Memory forensics framework — process analysis, credential extraction, artifact recovery
input_requirements:
  - memory_dump: raw memory image (.mem, .vmem, .dmp, .raw)
  - profile: OS version (auto-detected in v3)
output_schema:
  - processes: running processes with PIDs, parents, command lines
  - network: active connections at time of capture
  - credentials: NTLM hashes, LSA secrets (windows.hashdump)
  - artifacts: injected code, hidden processes, rootkit indicators
risk_level: None — offline analysis of dump
what_question_it_answers:
  - "What processes were running at time of capture?"
  - "What network connections existed?"
  - "Are there credentials in memory?" (Windows LSASS)
  - "Is there malware/rootkit present?"
evidence_produced: Forensic artifacts — L3-L4 for incident response findings
failure_interpretation:
  - Profile not found: use --single-location and --symbol-path for custom builds
  - Plugin errors: dump may be corrupt or partial — try with -o offset
  - No credentials: LSASS may not be in dump or credentials already cleared
validation_relevance: Memory evidence is strong — L4 when credentials used post-extraction
related_tools: [rekall, strings, bulk_extractor]
alternative_tools:
  - strings: quick triage before full analysis
  - bulk_extractor: faster artifact extraction without full framework
action_after:
  - Credentials found → test against live systems
  - Hidden process found → extract and analyze binary
  - Network connections → correlate with IDS logs
```

---

### hashcat

```yaml
capability: GPU-accelerated password hash cracking
input_requirements:
  - hashes: hash file in hashcat format
  - mode: hash type (-m flag: 1000=NTLM, 13100=Kerberoast, 18200=AS-REP, 22000=WPA2)
  - attack: wordlist (-a 0), brute-force (-a 3), rule-based (-a 0 -r rules)
output_schema:
  - cracked: plaintext password for each cracked hash
  - speed: hashes per second
risk_level: None — offline, no network activity
what_question_it_answers:
  - "What is the plaintext password for this hash?"
  - "Is this hash crackable with common wordlists?"
evidence_produced: Plaintext credential — L4 when used for authentication
failure_interpretation:
  - No results with rockyou: try larger wordlist + rules (best64, OneRuleToRuleThemAll)
  - GPU not detected: install CUDA/OpenCL drivers; use --opencl-platform 1
  - Hash format error: verify correct -m mode; check hashcat example hashes
validation_relevance: Cracked hash = L3; using cracked password for access = L4
related_tools: [john the ripper, ophcrack]
alternative_tools:
  - john: slower but better auto-detection, good for unusual formats
action_after: Test cracked password immediately before it changes; spray carefully (lockout risk)
```

---

### burpsuite (Community/Pro)

```yaml
capability: Web application proxy, scanner, and manual testing platform
input_requirements:
  - proxy: browser configured to use 127.0.0.1:8080
  - scope: define target scope to avoid testing out-of-scope hosts
output_schema:
  - intercepted_requests: full HTTP request/response pairs
  - scanner_findings: automated vulnerability detections (Pro)
  - repeater: modified requests and responses
  - intruder: fuzzing results
risk_level: Low (manual/proxy mode) to Medium (active scanner in Pro)
what_question_it_answers:
  - "What exactly is this application sending and receiving?"
  - "How does this parameter behave with modified values?"
  - "What vulnerabilities does the active scanner detect?" (Pro)
evidence_produced: Request/response pairs — strongest evidence for web vulns at any level
failure_interpretation:
  - SSL errors: install Burp CA certificate in browser
  - Missing traffic: verify proxy settings match browser config
  - Scanner misses obvious issues: supplement with manual testing
validation_relevance: Manual PoC in Burp Repeater = L3-L4 depending on demonstrated impact
related_tools: [zap proxy, mitmproxy]
alternative_tools:
  - zap: free, good automation but less feature-rich for manual testing
  - mitmproxy: scriptable, good for automation
action_after:
  - Interesting parameter found → test in Repeater systematically
  - Auth token captured → test reuse, forgery, privilege escalation
```

---

### chisel

```yaml
capability: TCP/UDP tunneling over HTTP — creates SOCKS5 proxy through pivot host
input_requirements:
  - server: chisel server running on attacker machine
  - client: chisel client binary on pivot host
  - ports: reverse port forward specification
output_schema:
  - socks5_proxy: SOCKS5 proxy at 127.0.0.1:1080 (default)
  - port_forwards: specific port forwarding rules
risk_level: Medium — tunnel traffic may appear anomalous; HTTP on unusual ports
what_question_it_answers:
  - "Can I route traffic through this pivot host to reach the internal network?"
  - "Can I access a specific internal service through this host?"
evidence_produced: Network access to previously unreachable segments — enables further attack steps
failure_interpretation:
  - Connection refused: check firewall allows outbound HTTP from pivot
  - Tunnel drops: unstable connection — add --keepalive flag
  - SOCKS not routing: verify proxychains.conf points to correct port
validation_relevance: Tunnel establishment enables further testing — prerequisite, not finding itself
related_tools: [ligolo-ng, ssh -D, socat]
alternative_tools:
  - ligolo-ng: more transparent (TUN interface), no proxychains needed
  - ssh -D: simplest if SSH is available on pivot
action_after: Test internal target reachability; run tools via proxychains through tunnel
```

---

### gitleaks

```yaml
capability: Secret scanning for Git repositories and file systems
input_requirements:
  - source: git repository path, directory, or GitHub organization
  - config: optional custom regex rules
output_schema:
  - findings: secret type, file, line number, match content, commit hash
risk_level: None — read-only scanning
what_question_it_answers:
  - "Are there API keys, passwords, or tokens in this codebase?"
  - "Has sensitive data been committed to version control?"
  - "What secrets exist in this directory structure?"
evidence_produced: Exposed credentials — L3 when credential type identified, L4 when used
failure_interpretation:
  - Too many false positives: tune with .gitleaks.toml to filter known safe patterns
  - Missed secrets: supplement with custom regex rules for target-specific formats
validation_relevance: Found secret = L3; successful authentication with secret = L4
related_tools: [trufflehog, semgrep, detect-secrets]
alternative_tools:
  - trufflehog: better entropy analysis, finds secrets even without regex match
  - semgrep: more customizable, also catches security bugs beyond just secrets
action_after:
  - API key found → test immediately (may be rotated soon once notified)
  - DB password found → test on exposed database endpoints
  - Private key found → test SSH/TLS access
```

---

### tshark / wireshark

```yaml
capability: Network packet capture and protocol analysis
input_requirements:
  - interface: network interface name (live capture) OR pcap file (offline)
  - filter: BPF or display filter expression
output_schema:
  - packets: full protocol decode for each packet
  - flows: reconstructed TCP/UDP streams
  - statistics: protocol hierarchy, conversation summaries
risk_level: None (pcap analysis) / Low (live capture — passive)
what_question_it_answers:
  - "What protocols and hosts are communicating in this traffic?"
  - "What cleartext credentials are being transmitted?"
  - "What C2 communication patterns exist?"
  - "What happened on the network at time T?"
evidence_produced: Network-level evidence — strong forensic artifact for any network finding
failure_interpretation:
  - Encrypted traffic: TLS inspection needed; look for certificate details, JA3 fingerprints
  - No capture: missing permission (need root/cap_net_raw) or wrong interface
  - Too much traffic: apply specific BPF filters to focus on target
validation_relevance: Packet evidence = L3-L4 depending on content captured
related_tools: [tcpdump, zeek, suricata]
alternative_tools:
  - tcpdump: CLI-only, good for quick captures and remote sessions
  - zeek: better for high-volume analysis with structured logs
action_after:
  - Cleartext credentials → test immediately
  - C2 pattern identified → extract IOCs, correlate with threat intel
  - Unusual protocol → research, test exploitation of that protocol
```

---

### john the ripper

```yaml
capability: Password hash cracker with broad format support and auto-detection
input_requirements:
  - hash_file: file containing hashes (john auto-detects format in most cases)
  - wordlist: optional — defaults to built-in wordlist
  - rules: optional — john has built-in mangling rules
output_schema:
  - cracked: password:hash pairs for successfully cracked hashes
risk_level: None — offline, no network activity
what_question_it_answers:
  - "What is the plaintext for this hash?" (especially non-common formats)
  - "Can john auto-identify and crack this hash format?"
evidence_produced: Plaintext credential — L4 when used for authentication
failure_interpretation:
  - No cracks: try --wordlist=rockyou.txt --rules=best64
  - Format detection wrong: use --format= to specify explicitly
  - Slow: john is CPU-based — use hashcat for speed when GPU available
validation_relevance: Same as hashcat — cracked hash alone = L3
related_tools: [hashcat, ophcrack]
alternative_tools:
  - hashcat: much faster for supported formats with GPU
action_after: Same as hashcat — test cracked password immediately
```

---

### pwntools

```yaml
capability: CTF and exploit development framework — process/network interaction, ROP, format string
input_requirements:
  - target: binary path (local) or host:port (remote)
  - context: architecture (x86/x64/arm), OS
output_schema:
  - interactive_shell: post-exploit shell interaction
  - rop_chains: gadget-based ROP chain construction
  - packing: auto-pack integers to correct endianness
risk_level: Varies — depends on exploit being developed
what_question_it_answers:
  - "Can I interact with this binary/service programmatically?"
  - "What ROP gadgets are available in this binary?"
  - "Does my exploit produce a shell?"
evidence_produced: Working exploit PoC — L4 when shell obtained
failure_interpretation:
  - Segfault: wrong offset or bad gadget — check with gdb-pwndbg
  - No shell but no crash: bad payload — verify with manual gdb testing
  - Connection refused: check binary is running, correct port
validation_relevance: Shell obtained = L4 demonstrated attacker capability
related_tools: [gdb-pwndbg, ropper, ROPgadget]
alternative_tools:
  - ropper: better gadget search UI
  - ROPgadget: fast gadget enumeration
action_after: Weaponize working exploit for report PoC; document exact binary offsets and environment
```

---

## TOOL SELECTION DECISION TREE

```
What phase am I in?

RECON
  → Need subdomain list?              → subfinder + amass (passive)
  → Need live hosts?                  → httpx
  → Need port/service info?           → nmap (targeted) or naabu (fast)

ENUMERATION
  → Need vuln signatures?             → nuclei
  → Need hidden paths/params?         → ffuf
  → Need tech fingerprint?            → whatweb + httpx
  → Need WAF detection?               → wafw00f

EXPLOITATION
  → Testing SQLi?                     → manual curl first → sqlmap if positive
  → Testing XSS?                      → dalfox
  → Testing command injection?        → manual curl + commix
  → Need Burp for complex flows?      → burpsuite repeater

POST-EXPLOITATION
  → Cracking hashes?                  → hashcat (GPU) or john (auto-detect)
  → AD lateral movement?              → netexec + impacket + bloodhound
  → Memory forensics?                 → volatility3
  → Network capture analysis?        → tshark

CTF / BINARY EXPLOITATION
  → Binary interaction?               → pwntools
  → ROP chain building?               → ropper + pwntools
  → Memory forensics in CTF?          → volatility3 + strings

PIVOTING
  → Simple HTTP tunnel?               → chisel
  → Full transparent routing?         → ligolo-ng
  → SSH available?                    → ssh -D

SECRET HUNTING
  → Git repos?                        → gitleaks or trufflehog
  → Directories?                      → gitleaks filesystem mode
```
