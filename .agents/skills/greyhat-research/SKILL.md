---
name: greyhat-research
description: "Authorized grey-hat vulnerability research. Requires explicit written authorization and exact in-scope assets before active testing. Covers broad vulnerability discovery, evidence-led hypothesis validation, and human-reviewed technical reporting; excludes stealth campaigns, C2, persistence, lateral movement, DoS, and exfiltration. Triggers: 'grey-hat', 'greyhat research', 'authorized vulnerability research'."
version: 1.0.0
phase: ["recon", "enumeration", "exploitation", "reporting"]
category: ["recon", "enumeration", "exploitation", "reporting"]
tools: ["nuclei", "httpx", "katana", "ffuf", "curl", "dalfox", "sqlmap"]
tags: ["grey-hat", "authorized", "vulnerability-research", "evidence", "scope"]
---

# Authorized Grey-hat Research

This mode performs broad, evidence-led vulnerability research on systems the
operator has explicit permission to test. The goal is a complete, reproducible
technical assessment for human review. Grey-hat is not permission to probe
public systems without consent.

## Authorization gate

Before any active request, establish and record:

- Written authorization from the asset owner or engagement authority.
- Exact hostnames, IP ranges, applications, accounts, and excluded assets.
- Allowed techniques, test window, rate limits, and data-handling rules.

Authorization for one asset does not cover related or newly discovered assets.
If permission, scope, or a technique is unclear, stop active testing and ask
for explicit approval. Passive work is allowed only when the authorization or
program policy permits it.

## Full-coverage workflow

1. Build the complete in-scope asset and task inventory from the authorization,
   selected mode, and existing evidence.
2. Reuse current target-model data to avoid identical repeated checks. Retain
   every distinct asset, endpoint, parameter, hypothesis, and test vector.
3. Run every required, permitted recon and enumeration check. Launch
   independent checks together up to the mode's configured parallelism; run
   remaining work in later waves. Keep real prerequisites ordered.
4. Convert each relevant observation into a specific, falsifiable hypothesis.
   Priority determines investigation order; it does not remove lower-priority
   in-scope hypotheses or required checks.
5. Validate each candidate with the minimum safe reproduction. Preserve
   baseline/control and negative tests, boundary analysis, disproof, clean
   reproduction, and the complete raw evidence needed to review the result.
6. Stop before denial of service, persistent changes, data access or
   exfiltration, credential attacks, stealth, C2, persistence, or lateral
   movement. These are outside this mode even if a scanner suggests them.
   For any other test whose impact exceeds the written authorization, stop and
   request explicit approval before running it.
7. Report the full required scope, all hypotheses and dispositions, validated
   findings, evidence references, limitations, and outstanding validation.
   Keep scanner signals labeled as candidates; do not claim unproven impact.
   Require human review before external submission.

## Role distinction

Grey-hat is vulnerability-led and transparent: map the approved surface,
validate security behavior, and document evidence. Red-team is objective-led
adversary emulation and may include stealth, C2, persistence, and lateral
movement when its separate rules of engagement explicitly authorize them.
Never import red-team techniques into a grey-hat engagement.
