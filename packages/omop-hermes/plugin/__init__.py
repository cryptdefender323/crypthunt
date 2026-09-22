"""Oh My Open Pentest (OMOP) Hermes plugin.

Registers:
- pre_llm_call: inject fullscan/pentest engagement context when user says fullscan/ulw
- on_session_start: short banner + skills path hint
- tools: omop_fullscan_hint, omop_engagement_status
- skill: omop-pentest-workflow (bundled)
"""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path

logger = logging.getLogger("omop.hermes")

_PLUGIN_DIR = Path(__file__).resolve().parent

FULLSCAN_RE = re.compile(
    r"\b(fullscan|ulw|/fullscan)\b",
    re.IGNORECASE,
)

FULLSCAN_CONTEXT = """\
[OMOP fullscan mode]
You are running under Oh My Open Pentest engagement rules:
1. Parse scope and Rules of Engagement before any active testing.
2. Prefer skill playbooks under the OMOP skills tree (pentest-recon, pentest-enum, pentest-exploit, pentest-report, …).
3. Every finding needs verification (minimal PoC) before reporting.
4. Write durable state under .omop/engagement/ when available.
5. End with a submission-ready report (Hermes/report phase): CVSS, PoC, impact, remediation.
Refuse out-of-scope targets. Prefer non-destructive proof first.
"""


def _on_session_start(session_id: str = "", model: str = "", platform: str = "", **kwargs):
    del kwargs
    logger.info("OMOP Hermes plugin active session=%s model=%s platform=%s", session_id, model, platform)


def _on_pre_llm_call(
    session_id: str = "",
    user_message: str = "",
    conversation_history=None,
    is_first_turn: bool = False,
    model: str = "",
    platform: str = "",
    **kwargs,
):
    del session_id, conversation_history, is_first_turn, model, platform, kwargs
    text = user_message or ""
    if FULLSCAN_RE.search(text):
        return {"context": FULLSCAN_CONTEXT}
    return None


def _on_post_tool_call(tool_name: str = "", args=None, result: str = "", task_id: str = "", **kwargs):
    del args, result, task_id, kwargs
    # observer only — keep lightweight
    if tool_name and tool_name.startswith("omop_"):
        logger.debug("omop tool finished: %s", tool_name)


def _fullscan_hint(params: dict, **kwargs) -> str:
    del kwargs
    target = (params or {}).get("target", "")
    return json.dumps(
        {
            "ok": True,
            "mode": "fullscan",
            "target": target,
            "guidance": (
                "Load OMOP skills for recon→enum→exploit→verify→report. "
                "Enforce scope. Persist findings under .omop/engagement/."
            ),
            "context": FULLSCAN_CONTEXT,
        }
    )


def _engagement_status(params: dict, **kwargs) -> str:
    del kwargs, params
    skills = _PLUGIN_DIR / "skills"
    skill_names = []
    if skills.is_dir():
        for child in sorted(skills.iterdir()):
            if child.is_dir() and (child / "SKILL.md").exists():
                skill_names.append(child.name)
    return json.dumps(
        {
            "ok": True,
            "plugin": "omop",
            "bundled_skills": skill_names,
            "hint": "Use skill_view('omop:omop-pentest-workflow') or external OMOP skills dirs from config.",
        }
    )


def register(ctx):
    ctx.register_hook("on_session_start", _on_session_start)
    ctx.register_hook("pre_llm_call", _on_pre_llm_call)
    ctx.register_hook("post_tool_call", _on_post_tool_call)

    ctx.register_tool(
        name="omop_fullscan_hint",
        toolset="omop",
        schema={
            "name": "omop_fullscan_hint",
            "description": (
                "Return OMOP fullscan engagement guidance for a target. "
                "Use when the user asks for fullscan/ulw or a full pentest engagement."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "target": {
                        "type": "string",
                        "description": "In-scope target URL, host, or CIDR",
                    }
                },
                "required": [],
            },
        },
        handler=_fullscan_hint,
    )

    ctx.register_tool(
        name="omop_engagement_status",
        toolset="omop",
        schema={
            "name": "omop_engagement_status",
            "description": "Report OMOP Hermes plugin status and bundled skills.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
        handler=_engagement_status,
    )

    skills_dir = _PLUGIN_DIR / "skills"
    if skills_dir.is_dir():
        for child in sorted(skills_dir.iterdir()):
            skill_md = child / "SKILL.md"
            if child.is_dir() and skill_md.exists():
                try:
                    ctx.register_skill(child.name, skill_md)
                except Exception as exc:  # noqa: BLE001 — plugin must not crash Hermes
                    logger.warning("register_skill failed for %s: %s", child.name, exc)

    def _omop_status_cmd(raw: str = ""):
        del raw
        return _engagement_status({})

    try:
        ctx.register_command(
            "omop-status",
            _omop_status_cmd,
            description="Show OMOP Hermes plugin status",
        )
    except Exception as exc:  # noqa: BLE001
        logger.debug("register_command unavailable: %s", exc)
