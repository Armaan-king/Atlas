VOICE_BRIEFS = [
    {
        "id": "brief-2026-04-11",
        "date": "2026-04-11",
        "greeting": "Good morning! Here's your Atlas brief for Friday, April 11th.",
        "summary": (
            "You have a busy week ahead. You have a deadline on Tuesday — SC2002 Project 5 "
            "on Rust Basics. MH2802 Homework 7 on Eigenvalues is due Wednesday. Your "
            "strongest area right now is Vectors in MH2802 at 85% mastery, but "
            "Diagonalization is at 35% — consider reviewing that before Exam 2 next "
            "Saturday. Overall, you're making solid progress in your core CS courses."
        ),
        "deadlineIds": [
            "sc2002-hw5",
            "mh2802-hw7",
        ],
    },
    {
        "id": "brief-2026-04-12",
        "date": "2026-04-12",
        "greeting": "Good morning! Here's your Atlas brief for Saturday, April 12th.",
        "summary": (
            "On Tuesday you have SC2002 Project 5 due. Wednesday brings MH2802 "
            "Homework 7 on Eigenvalues, and Thursday has a quiz — SC2002 Quiz 4 on "
            "Regex and CFGs. Good time to review Regular Expressions and formal languages."
        ),
        "deadlineIds": [
            "sc2002-hw5",
            "mh2802-hw7",
            "sc2002-quiz4",
        ],
    },
    {
        "id": "brief-2026-04-13",
        "date": "2026-04-13",
        "greeting": "Good morning! Here's your Atlas brief for Sunday, April 13th.",
        "summary": (
            "Looking ahead, Tuesday has SC2002 Project 5, Wednesday has MH2802 HW7, "
            "and Thursday has your SC2002 quiz. Your Rust Ownership mastery is at 40%, "
            "so spend some extra time on borrowing and lifetimes before the project is due."
        ),
        "deadlineIds": [
            "sc2002-hw5",
            "mh2802-hw7",
            "sc2002-quiz4",
        ],
    },
    {
        "id": "brief-2026-04-14",
        "date": "2026-04-14",
        "greeting": "Good morning! Here's your Atlas brief for Monday, April 14th.",
        "summary": (
            "Your main focus for tomorrow is SC2002 Project 5 on Rust Basics. "
            "Wednesday is MH2802 HW7. Thursday has SC2002 Quiz 4. This is a critical "
            "week for your core requirements — prioritize the Rust project tonight."
        ),
        "deadlineIds": [
            "sc2002-hw5",
            "mh2802-hw7",
            "sc2002-quiz4",
        ],
    },
    {
        "id": "brief-2026-04-15",
        "date": "2026-04-15",
        "greeting": "Good morning! Here's your Atlas brief for Tuesday, April 15th.",
        "summary": (
            "SC2002 Project 5 is due tonight at midnight. MH2802 HW7 on Eigenvalues "
            "is due tomorrow. Thursday brings SC2002 Quiz 4 on Regex/CFGs. "
            "MH2802 Exam 2 on Linear Transformations is Saturday — start reviewing now."
        ),
        "deadlineIds": [
            "sc2002-hw5",
            "mh2802-hw7",
            "sc2002-quiz4",
            "mh2802-exam2",
        ],
    },
    {
        "id": "brief-2026-04-16",
        "date": "2026-04-16",
        "greeting": "Good morning! Here's your Atlas brief for Wednesday, April 16th.",
        "summary": (
            "MH2802 HW7 is due tonight. Tomorrow you have your SC2002 Quiz 4 at 2 PM. "
            "MH2802 Exam 2 is Saturday morning — your Linear Transformations mastery is "
            "at 60%, consider working through kernel and image problems tonight."
        ),
        "deadlineIds": [
            "mh2802-hw7",
            "sc2002-quiz4",
            "mh2802-exam2",
        ],
    },
    {
        "id": "brief-2026-04-17",
        "date": "2026-04-17",
        "greeting": "Good morning! Here's your Atlas brief for Thursday, April 17th.",
        "summary": (
            "SC2002 Quiz 4 on Regex and CFGs is at 2 PM today. "
            "MH2802 Exam 2 is Saturday — focus your evening on Eigenvalues and "
            "Diagonalization review. You're entering the final stretch for these courses."
        ),
        "deadlineIds": [
            "sc2002-quiz4",
            "mh2802-exam2",
        ],
    },
]

SAMPLE_VOICE_RESPONSES = [
    {
        "id": "vr-1",
        "trigger": "What's due this week?",
        "response": (
            "This week you have SC2002 Project 5 due Tuesday, MH2802 Homework 7 "
            "due Wednesday, and a SC2002 quiz on Thursday."
        ),
        "shouldSpeak": True,
    },
    {
        "id": "vr-2",
        "trigger": "How am I doing in SC2002?",
        "response": (
            "You're at 62% progress in SC2002. Your strongest topic is Recursion at 80% "
            "mastery, but Ownership and Borrowing is at 40%. You have Project 5 on Rust "
            "Basics due Tuesday and Midterm 2 coming up on April 23rd."
        ),
        "shouldSpeak": True,
    },
    {
        "id": "vr-3",
        "trigger": "Explain eigenvalues",
        "response": (
            "Eigenvalues are scalars lambda where A times v equals lambda times v for some "
            "nonzero vector v. You find them by solving the characteristic polynomial, "
            "det of A minus lambda I equals zero. Your mastery on this is at 45%."
        ),
        "shouldSpeak": True,
    },
    {
        "id": "vr-4",
        "trigger": "Give me a study plan for MH2802 Exam 2",
        "response": (
            "Your MH2802 Exam 2 covers Linear Transformations, Eigenvalues, Eigenvectors, "
            "and Diagonalization. Here's a plan: Day 1 — review Linear Transformations and "
            "kernel/image problems, your mastery is 60%. Day 2 — focus on Eigenvalues and "
            "the characteristic polynomial, currently at 45%. Day 3 — Eigenvectors and "
            "eigenspaces, also 45%. Day 4 — Diagonalization, your weakest at 35%, work "
            "through PDP-inverse examples. Day 5 — full practice exam mixing all topics."
        ),
        "shouldSpeak": False,
    },
    {
        "id": "vr-5",
        "trigger": "What should I study tonight?",
        "response": (
            "Based on your upcoming deadlines and mastery levels, focus on Rust Ownership "
            "and Borrowing tonight — it's at 40% and Project 5 is due Tuesday. If you "
            "finish early, review Eigenvalues for MH2802 HW7 due Wednesday."
        ),
        "shouldSpeak": True,
    },
]
