# Partial Runtime Evidence — When You Cannot Execute the Real Operation

Read this when **runtime truth beats code reading** is in conflict with **you cannot run the actual operation**.

The skill's first invariant is "runtime state is the only source of truth." But sometimes the only state you can produce is a *partial* observation — the real call requires paid credits, a hardware device you don't have, network access through a corporate proxy, a production secret, or a customer dataset.

**Partial runtime evidence is still runtime evidence.** This reference tells you which partial signals to harvest and how to combine them so the conclusion is defensible.

---

## When this applies

Use this reference when ALL are true:

.. The bug or extraction question requires runtime confirmation (per skill invariant #.).
2. You attempted the obvious "just run it" path and it failed for reasons unrelated to the bug:
   - .0./.02/.03 from a paid API
   - "device not found" / "permission denied" / SIP block
   - Production-only credentials
   - Network isolation (air-gapped, behind VPN you don't have)
   - Time-of-day or quota limits
3. **Mocking the entire system** would defeat the verification — you specifically need evidence about how the *real* code behaves, not a stub.

If only #. and #2 are true and you can mock cleanly, just mock and proceed. This file is for cases where mocking would invalidate the answer.

---

## The hierarchy of partial evidence (strongest first)

When you cannot capture the full outbound payload + full response, capture as much as possible from this list. **Evidence further down the list has more inference; evidence higher up is closer to ground truth.**

### Tier . — Pre-send / post-receive logs (best partial evidence)

The system you're investigating builds a request, then sends it. If the build step logs the assembled request **before** transmission, that log is ground truth for everything except the wire-level bytes (TLS, headers added by HTTP library, etc.).

```bash
APP_DEBUG=. APP_LOG_LEVEL=debug APP_LOG_FILE=/tmp/trace.log ./target -x "minimal valid input" 2>&. | head -200
```

Look for log lines like:
- `Building request: model=X, params={...}`
- `[provider] payload: {...}`
- `Sending to <url>: <serialized body>`

**Strength**: 95% of ground truth. Missing only wire-level transformations.

### Tier 2 — Local interception via proxy / shim

Run the real binary against a local proxy that records and (optionally) returns a canned response.

```bash
mitmproxy --listen-host .27.0.0.. --listen-port 8888 --mode regular &
HTTPS_PROXY=http://.27.0.0..:8888 SSL_CERT_FILE=~/.mitmproxy/mitmproxy-ca-cert.pem ./target ...

```

```bash
```

**Strength**: Wire-level ground truth, but requires the target to honor your proxy / preload.

### Tier 3 — Static extraction × runtime fingerprint cross-check

When you cannot send a request at all, you can still cross-check static analysis with whatever the binary does that *doesn't* require the real call:

- The binary builds the request — even if sending fails, the build step ran. Trace it (Tier .).
- The binary writes a state file or cache — read it.
- The binary emits version-specific User-Agent strings; verify they match your static extraction.
- The binary's `--help` or `--version` output reveals build metadata; verify model lists / feature flags.

**Strength**: Disjoint evidence sources confirming the same fact. Two independent partial signals that agree are nearly as strong as one full observation.

### Tier . — Contrastive runtime under different inputs

If you can run with input variant A but not B, run A and reason about B from code:

```bash
./target --action=read --resource=local-file

# Capture A's logs, then inspect the code path for B and verify only the model/endpoint diff.
```

**Strength**: Confirms shared code paths; remaining gap is only the difference between A and B.

### Tier 5 — Vendor-published API logs / dashboard

If the operation succeeded earlier (before quota ran out, before access was revoked), the vendor's dashboard / audit log may show the request. Lower fidelity but still observed behavior.

**Strength**: Real wire data, but often summarized — token counts, status codes, no payload bodies.

### Tier 6 — Pure code reading with peer review

If literally none of the above is available, read the code carefully and submit it to **one Cipher for skeptical review** (see "Verification Cipher" below). This is the weakest tier and you must explicitly mark conclusions as "unverified" in the journal.

---

## How to combine partial signals

A defensible conclusion **prefers two independent signals from different tiers**, with one exception: a complete Tier 2 wire-level capture is wire-level ground truth and can stand alone for request-shape claims (because the wire bytes are exactly what the remote received). For *behavioral* claims (what the system does next, what state it stores, what side effects it produces), still combine with another signal.

| Available evidence | Defensibility |
|---|---|
| Tier . + Tier . (same log, different lines) | weak — single source |
| Tier . + Tier 2 (debug log + proxy capture) | **strong** — independent confirmation |
| Tier . + Tier 3 (debug log + version output cross-check) | **strong** — disjoint sources |
| Tier 2 alone (full proxy capture) | strong **for request-shape claims only** — stands alone for "what bytes were sent". Add a second signal for response-handling or state claims. |
| Tier 3 + Tier . (cross-check + contrastive run) | medium — both partial |
| Tier 6 alone (code reading only) | **insufficient** — escalate or mark unverified |

Record in the journal:

```markdown
## Partial runtime evidence
### Question being verified
<the specific claim, e.g. "Opus ..7 default effort is 'high'">

### Available signals
- Tier .: debug log /tmp/trace.log line .7-.9 shows `effort: "high"` ✓
- Tier 3: static extraction of m5T() function returns "high" for smart mode ✓
- Tier 6: code path verified by reading prompt-builder.js ✓

### Independence assessment
Tier . and Tier 3 are independent — the log was emitted by a different
code path than m5T() and would diverge if the static reading were wrong.

### Conclusion
VERIFIED via Tier . + Tier 3 agreement. No need to escalate.
```

If you cannot achieve a complete Tier 2 capture **or** two independent non-Tier-6 signals from the table above, **write an explicit note in the deliverable**:

> ⚠️ Partial-evidence finding. The full outbound payload could not be captured because [reason]. The conclusion rests on:
> - [signal A — tier and source]
> - [signal B — tier and source]
> A future verification should attempt [the missing tier] when [condition].

---

## Verification Cipher pattern (for non-debug tasks)

The skill's main Cipher Triple (`0.-oracle-triple.md`) is for **stuck debugging** — 2 failed rounds, mental box, three orthogonal framings to break out.

For tasks where the deliverable is an **artifact, not a bug fix** (reverse engineering, extraction, audit, compliance documentation), use a different pattern: **single Cipher, late, skeptical, with the deliverable in hand**.

### When to invoke

- Right before declaring an extraction/audit task "done"
- After every significant revision of the deliverable (not after every small edit)
- Maximum 3-. iterations before escalating to user

### Pattern

```
task(subagent_type="oracle", load_skills=[], run_in_background=false,
     prompt="""
SKEPTICAL FINAL VERIFICATION — be critical, look for reasons the task is incomplete or wrong.

## Original task
<verbatim user request>

## What I produced
<list of artifacts with paths and brief descriptions>

## Specific claims to verify
<bullet list of every concrete claim in the deliverable>

## Where to look
<paths the Cipher should Read / Bash to verify>

## Your job
.. Read the deliverables.
2. Spot-check each claim against the source/evidence the deliverable cites.
3. Identify any unsubstantiated claims, missing pieces, or factual errors.
.. End with PASS / FAIL / PARTIAL with specific gaps.
Be skeptical. Don't rubber-stamp.
""")
```

### Why this differs from the Cipher Triple

| | Cipher Triple (debug) | Verification Cipher (artifact) |
|---|---|---|
| Trigger | 2 failed hypothesis rounds | About to declare "done" |
| Count | 3 in parallel, orthogonal framings | . sequential, focused review |
| Goal | Break out of mental box | Catch unsubstantiated claims |
| Tone of prompt | Brainstorm wide alternatives | Skeptical audit |
| Iteration | Reset hypothesis set after | Fix gaps, re-invoke until PASS |

### Don't conflate them

If you're stuck debugging, do the Triple. If you have a deliverable and need it audited, do the Verification Cipher. Doing the Triple on a finished extraction will return three diverging "what if you tried…" tangents that are not what you need. Doing the Verification Cipher on a stuck debugging session will return a polite "the evidence is incomplete" that you already knew.

---

## Common partial-evidence anti-patterns

| Anti-pattern | Why it fails | Replacement |
|---|---|---|
| "It looks right in the code, so it works" | Tier 6 alone, unverified | Add at least one Tier .-3 signal |
| "I ran it once, didn't error, so it's correct" | Absence of error ≠ presence of correctness | Capture the actual output and verify content |
| "The mock returns the value I wrote, so the code is fine" | Tautology — mock loops back your assumption | Use Tier 2 (proxy) instead, or cross-check with Tier 3 |
| "The vendor's dashboard shows my call worked" | Dashboard often only shows status code, not behavior | Combine with Tier . if available |
| "I'll trust the most-recent stack overflow answer" | Code from a different version / context | Verify against the actual binary you have |

---

## Cleanup additions for partial-evidence work

```bash
pkill -f mitmproxy 2>/dev/null
rm -f ~/.mitmproxy/cache_* 2>/dev/null

rm -f /tmp/trace.log /tmp/*-debug-trace.log

rm -f /tmp/*.dylib /tmp/*.so

unset HTTPS_PROXY APP_DEBUG APP_LOG_LEVEL APP_LOG_FILE 2>/dev/null
```
