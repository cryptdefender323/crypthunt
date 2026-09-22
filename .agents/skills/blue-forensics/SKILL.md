---
name: blue-forensics
description: "Blue team forensics skill. Memory forensics, disk analysis, timeline reconstruction, and evidence preservation. Use for deep forensic analysis and evidence collection. Triggers: 'blue forensics', 'memory forensics', 'disk forensics', 'evidence', 'timeline reconstruction'."
version: 1.0.0
phase: ["reporting"]
category: ["utility"]
tools: ["volatility", "autopsy", "wireshark", "yara"]
tags: ["blue-team", "forensics", "memory", "disk", "evidence", "timeline"]
---

# Blue Team Forensics

You are performing **deep forensic analysis**. Your goal is to extract evidence, reconstruct timelines, and preserve chain of custody.

## Tool Usage

```bash
vol -f memory.dmp windows.info
vol -f memory.dmp windows.pslist
vol -f memory.dmp windows.netscan
vol -f memory.dmp windows.filescan
vol -f memory.dmp windows.malfind
vol -f memory.dmp windows.dumpfiles --physoffset <offset>

autopsy <case_directory>

tshark -r capture.pcap -z conv,tcp
tshark -r capture.pcap -Y "http.request" -T fields -e http.host -e http.request.uri

file suspicious_file
strings suspicious_file | grep -E "(http|ftp|cmd|shell|password)"
exiftool suspicious_file
```

## Forensic Workflow

### Evidence Collection
```bash

# Network capture
tshark -i eth0 -w evidence/capture.pcap
```

### Memory Analysis
```bash
# 1. System information
vol -f memory.dmp windows.info

# 2. Process list
vol -f memory.dmp windows.pslist

# 3. Network connections
vol -f memory.dmp windows.netscan

# 4. File scan
vol -f memory.dmp windows.filescan | grep -i "suspicious\|malware\|payload"

# 5. Malware detection
vol -f memory.dmp windows.malfind

# 6. Dump suspicious files
vol -f memory.dmp windows.dumpfiles --physoffset <offset> --dump-dir evidence/
```

### Timeline Reconstruction
```bash
vol -f memory.dmp windows.filescan | sort -k2 > evidence/file-timeline.txt

vol -f memory.dmp windows.pslist | sort -k3 > evidence/process-timeline.txt

tshark -r capture.pcap -T fields -e frame.time -e ip.src -e ip.dst -e tcp.dstport > evidence/network-timeline.txt

vol -f memory.dmp windows.evtlogs > evidence/event-logs.txt
```

### Evidence Preservation
```bash
sha256sum evidence/* > evidence/hashes.txt

ls -la evidence/ > evidence/manifest.txt

echo "Evidence collected: $(date)" >> evidence/chain-of-custody.txt
```

## Output

Save to `.omop/blue-team/<engagement>/forensics/`:
- `memory-analysis.txt` — Memory forensics findings
- `disk-analysis.txt` — Disk forensics findings
- `timeline.txt` — Reconstructed timeline
- `evidence/` — Preserved evidence files
- `chain-of-custody.txt` — Chain of custody documentation

## Next Phase

After forensics, compile findings into the **IR report**.
