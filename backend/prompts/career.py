"""
Prompt templates for the Career layer.

Two generators, both returning strict JSON so the frontend can render
structured cards:

  build_profile_prompt()    → an evidence-backed career profile / resume
                              bullets, built from the mastery graph + the
                              assignments the student has actually completed.
                              This is the 'Sup "profile is the spine" idea:
                              fill it once, everything else pulls from it —
                              except here we auto-fill it from real coursework.

  build_interview_prompt()  → mock interview questions DRILLED ON the
                              student's real projects (not generic prompts),
                              mirroring 'Sup's Prep pillar.

Both prompts are sent directly to OpenAI (see routers/career.py), so they must
be self-contained.
"""


def build_profile_prompt(
    profile_summary: str,
    target: str | None = None,
) -> str:
    """Build a prompt that turns a mastery-weighted coursework summary into a
    career profile + resume bullets as JSON."""

    target_block = ""
    if target:
        target_block = f"\n## Target\nTailor the positioning toward: {target}\n"

    return f"""You are a career coach building a candidate's professional profile from their VERIFIED academic record. Every claim must be grounded in the coursework below — do not invent experience.

## Student's Mastery-Weighted Coursework
{profile_summary}
{target_block}
## Your Task
Produce a profile a strong CS undergrad could put in front of a recruiter. Lead with the highest-mastery, most differentiated skills. Resume bullets must reference REAL projects/assignments from the record above and read like accomplishments, not course descriptions.

## Output Format
Respond ONLY with a JSON object, no prose, no markdown fences:
{{
  "headline": "One-line positioning, e.g. 'CS undergrad — systems & programming languages'",
  "summary": "2-3 sentence professional summary written in third-of-resume voice. Concrete, specific, no fluff.",
  "strengths": [
    {{"skill": "Skill name", "mastery": 85, "evidence": "The specific course/project that demonstrates it"}}
  ],
  "developing": ["Skill the student is mid-mastery on and actively building"],
  "resume_bullets": [
    "Action-verb bullet grounded in a real project, e.g. 'Built a regex engine in OCaml using Thompson's construction (NFA from regular expressions)'"
  ],
  "suggested_roles": ["Concrete role title this profile is competitive for"]
}}

## Guidelines
- 4-6 strengths (mastery >= 67), each with real course evidence.
- 3-5 resume bullets, each tied to a specific assignment/project by name.
- 3-5 suggested roles, realistic for a CS undergrad with this record.
- Never claim a skill the coursework doesn't support.
"""


def build_interview_prompt(
    role: str,
    profile_summary: str,
    projects: str,
    count: int = 6,
) -> str:
    """Build a prompt for mock interview questions grounded in the student's
    actual projects, targeting a specific role."""

    return f"""You are an interviewer preparing a candidate for a "{role}" interview. Generate questions DRILLED ON THE CANDIDATE'S REAL PROJECTS below — not generic textbook prompts. Each question should be something an interviewer could plausibly ask after reading this candidate's resume.

## Target Role
{role}

## Candidate's Real Projects & Coursework
{projects}

## Candidate's Skill Profile
{profile_summary}

## Your Task
Generate exactly {count} interview questions: a mix of technical (grounded in their projects) and behavioral. For technical ones, anchor to a specific project the candidate actually did so the prep feels personal.

## Output Format
Respond ONLY with a JSON object, no prose, no markdown fences:
{{
  "questions": [
    {{
      "type": "technical",
      "question": "The interview question, specific and answerable",
      "grounded_in": "The real project/course this draws from (or 'General' for behavioral)",
      "assesses": "What signal the interviewer is looking for (1 phrase)",
      "answer_hint": "1-2 sentence pointer to a strong answer, referencing what the candidate actually did"
    }}
  ]
}}

## Guidelines
- ~{max(1, count - 2)} technical questions anchored to specific named projects, ~2 behavioral.
- Technical questions should test depth ('walk me through how you...', 'why did you...', 'what would break if...').
- answer_hint should reference the candidate's actual work, giving them a real edge.
- Calibrate difficulty to the role: intern = fundamentals + one project deep-dive; new-grad/quant = harder.
"""
