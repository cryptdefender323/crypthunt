# Manifesto

The principles and philosophy behind oh-my-open-pentest.
Agentic automation for bug bounty and penetration testing.

Project reality check:

- Name: oh-my-open-pentest
- Focus: Autonomous bug bounty hunting and penetration testing
- Platforms: HackerOne, Bugcrowd, Intigriti, YesWeHack
- Philosophy: Human defines scope. Agent finds vulnerabilities.

---

## Human Intervention is a Failure Signal

**HUMAN IN THE LOOP = BOTTLENECK**

Think about autonomous red team operations. When a human has to manually chain recon tools, copy-paste PoCs, or babysit each step of an engagement, that's not automation. It's a glorified script runner.

**Why is pentesting any different from other automation domains?**

When you find yourself:
- Manually correlating subdomain enumeration results
- Copying curl commands from one tool to another
- Writing PoC scripts by hand for each finding
- Double-checking scope boundaries for every target
- Formatting reports after every finding

That's not "human expertise." That's wasted cognitive bandwidth on mechanical work.

**oh-my-open-pentest is built on this premise**: Human intervention during an engagement is fundamentally a failure signal. If the system is designed correctly, the agent should complete the engagement cycle — recon through report — without requiring babysitting.

---

## Indistinguishable Findings

**Goal: Findings submitted by the agent should be indistinguishable from those submitted by a top-tier bug bounty hunter.**

Not "a scan result that needs triage." Not "a starting point for manual verification." The actual, final, validated submission.

This means:
- Clear vulnerability description with root cause analysis
- Working Proof of Concept (reproducible, not theoretical)
- Accurate CVSS scoring with proper vector strings
- Impact statement that resonates with program owners
- Remediation guidance that developers can actually implement
- No false-positive spam, no "low-hanging fruit" noise

If a triager can tell whether a report was written by a human hunter or an agent, the agent has failed.

---

## Token Cost vs Coverage

**Higher token usage is acceptable if it significantly increases attack surface coverage and exploit depth.**

Using more tokens to:
- Enumerate broader attack surface in parallel
- Chain multiple vulnerabilities into high-impact exploits
- Verify findings through multiple attack vectors
- Generate comprehensive PoCs for each confirmed vulnerability

That's a worthwhile investment when it means finding P.s that manual testers miss.

**However:**

Unnecessary token waste is not pursued. The system optimizes for:
- Using lightweight scans for initial reconnaissance
- Avoiding redundant enumeration of already-mapped assets
- Caching scope intelligence across engagements
- Stopping deep exploitation when scope boundaries are reached

Token efficiency matters. But not at the cost of coverage or finding quality.

---

## Minimize Human Cognitive Load

**The human should only need to provide: scope definition + program rules. Everything else is the agent's job.**

### Autonomous Engagement

You provide:
- Target scope (domains, IPs, applications)
- Program rules / Rules of Engagement
- Any specific focus areas (optional)

The agent:
- Parses and enforces scope boundaries autonomously
- Conducts reconnaissance across the attack surface
- Identifies and validates vulnerabilities
- Builds exploit chains where applicable
- Generates submission-ready reports with PoCs
- Tracks tested vectors to avoid redundant work

**You define the boundaries. The agent finds what's inside them.**

---

## Predictable, Continuous, Delegatable

**The ideal agent should work like a disciplined pentester**: scope goes in, validated findings come out.

### Predictable

Given the same inputs:
- Same target scope
- Same program rules
- Same testing methodology

The output should be consistent. Not random, not "creative" in ways that violate scope or RoE.

### Continuous

Engagements should survive interruptions:
- Session interrupted? Resume from last checkpoint
- Multi-day engagement? State is preserved across sessions
- New assets discovered? Agent incorporates them into the engagement
- Previously tested? Agent remembers and doesn't repeat work

The agent maintains engagement state. You don't have to.

### Delegatable

Just like you delegate to a trusted pentester:
- Clear scope, verified and enforced
- Self-correcting when encountering unexpected responses
- Escalation only when truly ambiguous (not routine)
- Complete findings, not "mostly verified"

---

## Agent-Enforced Boundaries

**The agent autonomously parses, interprets, and enforces scope and Rules of Engagement.**

This is not optional. This is the foundation.

The agent:
- Reads and parses program scope (in-scope assets, out-of-scope exclusions)
- Validates every target against scope before any active testing
- Refuses to engage out-of-scope assets, even if they appear in the attack path
- Logs scope decisions for audit trail
- Alerts when scope ambiguity is detected

**You don't police the agent. The agent polices itself.**

---

## The Core Loop

```
Scope Definition → Recon → Enumerate → Exploit → Verify → Report
       ↑                                                ↓
       └─────────── Agent-Enforced Boundaries ──────────┘
                    (scope validated at every step)
```

Everything in oh-my-open-pentest is designed to make this loop work:

| Feature | Purpose |
|---------|---------|
| **Cerberus** (Orchestrator) | Multi-headed coordination across recon, exploit, and report agents |
| **Hydra** (Recon) | Parallel subdomain, port, service, and technology enumeration |
| **Argus** (Monitor) | Hundred-eyed observation of scope boundaries and engagement state |
| **Scylla** (Exploit) | Multi-vector exploitation and chain building |
| **Hermes** (Reporter) | Submission-ready report generation with PoCs |
| **Talos** (Scope Guard) | Autonomous scope enforcement and RoE compliance |
| **Engagement State** | Persistent tracking across sessions |
| **Finding Validation** | Multi-vector verification before reporting |

---

## What This Means in Practice

**You should be able to:**

.. Define scope and paste program rules
2. Let the agent parse and validate the scope
3. Confirm the engagement plan (or let autonomous mode handle it)
.. Walk away
5. Come back to validated findings with working PoCs and submission-ready reports

**If you can't do this, something in the system needs to improve.**

---

## The Future We're Building

A world where:
- Human hunters focus on **strategy**, not mechanical recon
- Finding quality is independent of who (or what) found it
- Complex exploit chains are as routine as simple XSS
- "Manual testing" means "strategic thinking," not "running tools"

**The agent should be invisible.** Not hidden, but seamless. Like a well-oiled pentest engagement where the client only sees the polished report, never the grind.

You define the scope. The findings arrive. You don't think about the recon.

That's the goal.

---

## Further Reading

- [Engagement Workflow](./guide/pentest-workflow.md)
- [Engagement Modes](./guide/modes.md)
- [Tool Reference](./guide/tools.md)
- [Team Mode](./guide/team-mode.md)
