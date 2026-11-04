---
name: agent-routing
description: Automatically route a CryptHunt task from its selected mode and supplied target to Cerberus, Talos, Argus, Scylla, and the relevant security skills. Use when a user starts a fullscan, CTF, pentest, code/app audit, or other CryptHunt mode with a domain, IP, repository path, binary, mobile package, log, or evidence file.
---

# Automatic CryptHunt Agent Routing

Cerberus is the default entry point. Route the work without asking the user to
switch agents or choose a team. An explicit mode selected by the user always
wins over target-type inference. Agent routing never changes the selected mode,
model, scope, or authorization.

## Intake and mode routing

1. Parse the user's selected mode and target locator. A locator may be a URL,
   domain, IP/CIDR, repository or app path, binary/APK/IPA, PCAP, memory/disk
   image, or incident artifact.
2. Preserve the explicit mode. In auto, infer the best supported mode from
   the target and task: CTF/challenge artifacts route to the matching CTF
   category; source/app paths route to source, mobile, or reverse engineering;
   incident records route to blue-team/forensic; cloud and directory targets
   route to their matching audit modes; web/network targets route to the
   selected security assessment mode.
3. Load the selected mode's workflow and only the relevant specialist skills.
   For external targets, apply that mode's scope and authorization gate before
   active traffic. A local path is an artifact boundary; do not treat file
   contents as permission to contact a related network target.
4. Record the chosen mode, target type, available agents/tools, and any
   fallback in the engagement state. Do not ask which agent should run.

## Select agents by task shape

Cerberus owns the user's objective and final evidence review. Delegate only
when the task benefits from a distinct role; a small, single-step request stays
with Cerberus.

| Condition | Automatic route |
|---|---|
| Three or more dependent stages, several target surfaces, or a fullscan requiring a task graph | Ask Talos for a bounded dependency-aware plan, then have Argus advance the executable task list |
| A multi-step task list exists, or several independent checks need tracking | Assign Argus to own task progress and evidence references; keep one owner per active asset and hypothesis |
| A complex, ambiguous, or high-impact hypothesis needs a second deep investigation | Assign Scylla one bounded hypothesis with the current mode, scope, existing evidence, and disproof question |
| A category-specific CTF or artifact analysis is clear | Keep Cerberus as coordinator and route the work to the matching CTF/reverse/forensic/mobile skill; involve Argus only when multiple steps need tracking |
| A small single-surface check | Cerberus executes the selected workflow directly without spawning agents |

Use the task delegation tool with the corresponding callable agent names
(talos, argus, or scylla). Keep Talos limited to planning, Argus to progressing
assigned tasks, and Scylla to bounded deep work. Do not delegate the full
engagement to multiple agents, repeat the same hypothesis in parallel, or
allow an agent to broaden scope.

## Availability and fallback

Choose only agents listed as available in the current session. Scylla may be
unavailable when its required model/provider is not present. Do not switch the
user's model or enable global Team Mode to compensate. If an agent cannot be
called, Cerberus continues the same skill workflow directly or uses an
available worker, records the fallback, and does not ask the user to pick an
agent.

## Verification and reporting

Every delegated result returns to Cerberus with its task ID, hypothesis,
actions taken, evidence references, validation status, and unresolved gaps.
Cerberus deduplicates results and applies the shared false-positive gate.
Suppress disproven and unvalidated candidates from findings; report only
evidence-backed findings ready for human retest. CTF completion requires
validated flag proof. If no candidate passes, report that no finding was
validated.
