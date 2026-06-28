CONNECTIONS = [
    # ── SC2002 Intra ────────────────────────────────────────────
    {"id": "conn-c330-1",  "source_id": "c330-ocaml",         "target_id": "c330-pattern-match",  "label": "introduces",          "cross_course": False},
    {"id": "conn-c330-2",  "source_id": "c330-ocaml",         "target_id": "c330-recursion",      "label": "introduces",          "cross_course": False},
    {"id": "conn-c330-3",  "source_id": "c330-ocaml",         "target_id": "c330-type-inference", "label": "introduces",          "cross_course": False},
    {"id": "conn-c330-4",  "source_id": "c330-regex",         "target_id": "c330-nfa-dfa",        "label": "compiled to",         "cross_course": False},
    {"id": "conn-c330-5",  "source_id": "c330-nfa-dfa",       "target_id": "c330-cfg",            "label": "generalized by",      "cross_course": False},
    {"id": "conn-c330-6",  "source_id": "c330-cfg",           "target_id": "c330-lambda",         "label": "formalized by",       "cross_course": False},
    {"id": "conn-c330-7",  "source_id": "c330-rust",          "target_id": "c330-ownership",      "label": "introduces",          "cross_course": False},
    {"id": "conn-c330-8",  "source_id": "c330-rust",          "target_id": "c330-type-inference", "label": "uses",                "cross_course": False},
    {"id": "conn-c330-9",  "source_id": "c330-type-inference","target_id": "c330-ownership",      "label": "enables",             "cross_course": False},
    {"id": "conn-c330-10", "source_id": "c330-recursion",     "target_id": "c330-lambda",         "label": "foundation for",      "cross_course": False},
    {"id": "conn-c330-11", "source_id": "c330-pattern-match", "target_id": "c330-type-inference", "label": "informs",             "cross_course": False},
    {"id": "conn-c330-12", "source_id": "c330-regex",         "target_id": "c330-cfg",            "label": "generalized by",      "cross_course": False},
    {"id": "conn-c330-13", "source_id": "c330-ownership",     "target_id": "c330-lambda",         "label": "relates to",          "cross_course": False},

    # ── MH2802 Intra ────────────────────────────────────────────
    {"id": "conn-m240-1",  "source_id": "m240-vectors",       "target_id": "m240-matrices",       "label": "organized into",      "cross_course": False},
    {"id": "conn-m240-2",  "source_id": "m240-vectors",       "target_id": "m240-vector-spaces",  "label": "abstracted by",       "cross_course": False},
    {"id": "conn-m240-3",  "source_id": "m240-vectors",       "target_id": "m240-lin-transform",  "label": "mapped by",           "cross_course": False},
    {"id": "conn-m240-4",  "source_id": "m240-matrices",      "target_id": "m240-lin-transform",  "label": "represent",           "cross_course": False},
    {"id": "conn-m240-5",  "source_id": "m240-matrices",      "target_id": "m240-determinant",    "label": "measured by",         "cross_course": False},
    {"id": "conn-m240-6",  "source_id": "m240-matrices",      "target_id": "m240-eigenvalues",    "label": "analyzed via",        "cross_course": False},
    {"id": "conn-m240-7",  "source_id": "m240-eigenvalues",   "target_id": "m240-eigenvectors",   "label": "paired with",         "cross_course": False},
    {"id": "conn-m240-8",  "source_id": "m240-eigenvectors",  "target_id": "m240-diagonalization","label": "enables",             "cross_course": False},
    {"id": "conn-m240-9",  "source_id": "m240-vector-spaces", "target_id": "m240-basis-dim",      "label": "characterized by",    "cross_course": False},
    {"id": "conn-m240-10", "source_id": "m240-vector-spaces", "target_id": "m240-null-col-space", "label": "decomposed into",     "cross_course": False},
    {"id": "conn-m240-11", "source_id": "m240-basis-dim",     "target_id": "m240-null-col-space", "label": "measures",            "cross_course": False},
    {"id": "conn-m240-12", "source_id": "m240-lin-transform", "target_id": "m240-eigenvalues",    "label": "characterized by",    "cross_course": False},
    {"id": "conn-m240-13", "source_id": "m240-determinant",   "target_id": "m240-diagonalization","label": "used in",             "cross_course": False},
    {"id": "conn-m240-14", "source_id": "m240-basis-dim",     "target_id": "m240-eigenvalues",    "label": "dimension of",        "cross_course": False},
    {"id": "conn-m240-15", "source_id": "m240-null-col-space","target_id": "m240-lin-transform",  "label": "kernel/range of",     "cross_course": False},

    # ── SC2005 Intra ────────────────────────────────────────────
    {"id": "conn-c216-1",  "source_id": "c216-c",    "target_id": "c216-mem",     "label": "uses",            "cross_course": False},
    {"id": "conn-c216-2",  "source_id": "c216-c",    "target_id": "c216-bits",    "label": "represents",      "cross_course": False},
    {"id": "conn-c216-3",  "source_id": "c216-c",    "target_id": "c216-syscall", "label": "invokes",         "cross_course": False},
    {"id": "conn-c216-4",  "source_id": "c216-c",    "target_id": "c216-proc",    "label": "creates",         "cross_course": False},
    {"id": "conn-c216-5",  "source_id": "c216-bits",  "target_id": "c216-asm",    "label": "encoded in",      "cross_course": False},
    {"id": "conn-c216-6",  "source_id": "c216-bits",  "target_id": "c216-vm",     "label": "addressed via",   "cross_course": False},
    {"id": "conn-c216-7",  "source_id": "c216-mem",   "target_id": "c216-vm",     "label": "abstracted by",   "cross_course": False},
    {"id": "conn-c216-8",  "source_id": "c216-mem",   "target_id": "c216-cache",  "label": "cached in",       "cross_course": False},
    {"id": "conn-c216-9",  "source_id": "c216-asm",   "target_id": "c216-proc",   "label": "executes in",     "cross_course": False},
    {"id": "conn-c216-10", "source_id": "c216-proc",  "target_id": "c216-syscall","label": "managed via",     "cross_course": False},
    {"id": "conn-c216-11", "source_id": "c216-vm",    "target_id": "c216-cache",  "label": "backed by",       "cross_course": False},
    {"id": "conn-c216-12", "source_id": "c216-link",  "target_id": "c216-proc",   "label": "loaded into",     "cross_course": False},
    {"id": "conn-c216-13", "source_id": "c216-link",  "target_id": "c216-syscall","label": "resolved via",    "cross_course": False},
    {"id": "conn-c216-14", "source_id": "c216-asm",   "target_id": "c216-vm",     "label": "addresses",       "cross_course": False},

    # ── MH1812 Intra ────────────────────────────────────────────
    {"id": "conn-c250-1",  "source_id": "c250-proplogic",     "target_id": "c250-predlogic",     "label": "extended by",      "cross_course": False},
    {"id": "conn-c250-2",  "source_id": "c250-proplogic",     "target_id": "c250-proofs",        "label": "proved with",      "cross_course": False},
    {"id": "conn-c250-3",  "source_id": "c250-predlogic",     "target_id": "c250-proofs",        "label": "proved with",      "cross_course": False},
    {"id": "conn-c250-4",  "source_id": "c250-predlogic",     "target_id": "c250-sets",          "label": "defines",          "cross_course": False},
    {"id": "conn-c250-5",  "source_id": "c250-proofs",        "target_id": "c250-induction",     "label": "specialized as",   "cross_course": False},
    {"id": "conn-c250-6",  "source_id": "c250-proofs",        "target_id": "c250-graphs",        "label": "applied to",       "cross_course": False},
    {"id": "conn-c250-7",  "source_id": "c250-sets",          "target_id": "c250-relations",     "label": "defines",          "cross_course": False},
    {"id": "conn-c250-8",  "source_id": "c250-sets",          "target_id": "c250-combinatorics", "label": "counted by",       "cross_course": False},
    {"id": "conn-c250-9",  "source_id": "c250-induction",     "target_id": "c250-recurrences",   "label": "solves",           "cross_course": False},
    {"id": "conn-c250-10", "source_id": "c250-recurrences",   "target_id": "c250-combinatorics", "label": "enumerates",       "cross_course": False},
    {"id": "conn-c250-11", "source_id": "c250-combinatorics", "target_id": "c250-numtheory",     "label": "connects to",      "cross_course": False},
    {"id": "conn-c250-12", "source_id": "c250-graphs",        "target_id": "c250-relations",     "label": "modeled as",       "cross_course": False},
    {"id": "conn-c250-13", "source_id": "c250-numtheory",     "target_id": "c250-proofs",        "label": "proved with",      "cross_course": False},
    {"id": "conn-c250-14", "source_id": "c250-relations",     "target_id": "c250-induction",     "label": "proved by",        "cross_course": False},

    # ── SC2001 Intra ────────────────────────────────────────────
    {"id": "conn-c351-1",  "source_id": "c351-bigo",      "target_id": "c351-dc",        "label": "analyzes",        "cross_course": False},
    {"id": "conn-c351-2",  "source_id": "c351-bigo",      "target_id": "c351-sort",      "label": "analyzes",        "cross_course": False},
    {"id": "conn-c351-3",  "source_id": "c351-bigo",      "target_id": "c351-greedy",    "label": "analyzes",        "cross_course": False},
    {"id": "conn-c351-4",  "source_id": "c351-bigo",      "target_id": "c351-dp",        "label": "analyzes",        "cross_course": False},
    {"id": "conn-c351-5",  "source_id": "c351-dc",        "target_id": "c351-sort",      "label": "used in",         "cross_course": False},
    {"id": "conn-c351-6",  "source_id": "c351-dc",        "target_id": "c351-dp",        "label": "relates to",      "cross_course": False},
    {"id": "conn-c351-7",  "source_id": "c351-greedy",    "target_id": "c351-mst",       "label": "applied in",      "cross_course": False},
    {"id": "conn-c351-8",  "source_id": "c351-greedy",    "target_id": "c351-shortpath", "label": "applied in",      "cross_course": False},
    {"id": "conn-c351-9",  "source_id": "c351-dp",        "target_id": "c351-shortpath", "label": "applied in",      "cross_course": False},
    {"id": "conn-c351-10", "source_id": "c351-dp",        "target_id": "c351-np",        "label": "contrasts with",  "cross_course": False},
    {"id": "conn-c351-11", "source_id": "c351-graphs",    "target_id": "c351-shortpath", "label": "traversed by",    "cross_course": False},
    {"id": "conn-c351-12", "source_id": "c351-graphs",    "target_id": "c351-mst",       "label": "traversed by",    "cross_course": False},
    {"id": "conn-c351-13", "source_id": "c351-graphs",    "target_id": "c351-np",        "label": "reduced to",      "cross_course": False},
    {"id": "conn-c351-14", "source_id": "c351-shortpath",  "target_id": "c351-np",       "label": "relates to",      "cross_course": False},
    {"id": "conn-c351-15", "source_id": "c351-mst",        "target_id": "c351-np",       "label": "contrasts with",  "cross_course": False},
    {"id": "conn-c351-16", "source_id": "c351-sort",       "target_id": "c351-dp",       "label": "leads to",        "cross_course": False},

    # ── SC1015 Intra ────────────────────────────────────────────
    {"id": "conn-c320-1", "source_id": "c320-pandas",  "target_id": "c320-stats",    "label": "data prep for",     "cross_course": False},
    {"id": "conn-c320-2", "source_id": "c320-pandas",  "target_id": "c320-ml-intro", "label": "data prep for",     "cross_course": False},
    {"id": "conn-c320-3", "source_id": "c320-stats",   "target_id": "c320-ml-intro", "label": "foundation for",    "cross_course": False},
    {"id": "conn-c320-4", "source_id": "c320-ml-intro","target_id": "c320-stats",    "label": "evaluates with",    "cross_course": False},

    # ── BU8201 Intra ────────────────────────────────────────────
    {"id": "conn-b230-1", "source_id": "b230-prob",       "target_id": "b230-hyp-test",   "label": "basis of",        "cross_course": False},
    {"id": "conn-b230-2", "source_id": "b230-prob",       "target_id": "b230-regression",  "label": "underlies",       "cross_course": False},
    {"id": "conn-b230-3", "source_id": "b230-hyp-test",   "target_id": "b230-regression",  "label": "validates",       "cross_course": False},
    {"id": "conn-b230-4", "source_id": "b230-regression", "target_id": "b230-hyp-test",    "label": "tested by",       "cross_course": False},
    {"id": "conn-b230-5", "source_id": "b230-hyp-test",   "target_id": "b230-prob",        "label": "grounded in",     "cross_course": False},

    # ── HE2001 Intra ────────────────────────────────────────────
    {"id": "conn-e306-1", "source_id": "e306-cost",        "target_id": "e306-game",        "label": "firms optimize",   "cross_course": False},
    {"id": "conn-e306-2", "source_id": "e306-cost",        "target_id": "e306-externality", "label": "social cost of",   "cross_course": False},
    {"id": "conn-e306-3", "source_id": "e306-game",        "target_id": "e306-externality", "label": "strategic view of","cross_course": False},
    {"id": "conn-e306-4", "source_id": "e306-externality", "target_id": "e306-cost",        "label": "shifts",           "cross_course": False},

    # ── SC4001 Intra ────────────────────────────────────────────
    {"id": "conn-c422-1", "source_id": "c422-sup",  "target_id": "c422-unsup",  "label": "contrasts with",  "cross_course": False},
    {"id": "conn-c422-2", "source_id": "c422-sup",  "target_id": "c422-nn",     "label": "extends to",      "cross_course": False},
    {"id": "conn-c422-3", "source_id": "c422-sup",  "target_id": "c422-pca",    "label": "preprocessed by", "cross_course": False},
    {"id": "conn-c422-4", "source_id": "c422-pca",  "target_id": "c422-unsup",  "label": "type of",         "cross_course": False},
    {"id": "conn-c422-5", "source_id": "c422-pca",  "target_id": "c422-nn",     "label": "reduces for",     "cross_course": False},
    {"id": "conn-c422-6", "source_id": "c422-nn",   "target_id": "c422-unsup",  "label": "applied to",      "cross_course": False},
    {"id": "conn-c422-7", "source_id": "c422-unsup","target_id": "c422-pca",    "label": "includes",        "cross_course": False},

    # ── SC3000 Intra ────────────────────────────────────────────
    {"id": "conn-c421-1", "source_id": "c421-search", "target_id": "c421-kr",    "label": "explores",          "cross_course": False},
    {"id": "conn-c421-2", "source_id": "c421-search", "target_id": "c421-bayes", "label": "extended by",       "cross_course": False},
    {"id": "conn-c421-3", "source_id": "c421-kr",     "target_id": "c421-bayes", "label": "probabilized by",   "cross_course": False},
    {"id": "conn-c421-4", "source_id": "c421-bayes",  "target_id": "c421-search","label": "informs",           "cross_course": False},
    {"id": "conn-c421-5", "source_id": "c421-kr",     "target_id": "c421-search","label": "structures",        "cross_course": False},

    # ── MH3700 Intra ────────────────────────────────────────────
    {"id": "conn-m401-1", "source_id": "m401-svd",    "target_id": "m401-markov",  "label": "matrix ops on",     "cross_course": False},
    {"id": "conn-m401-2", "source_id": "m401-svd",    "target_id": "m401-quantum", "label": "decomposes",        "cross_course": False},
    {"id": "conn-m401-3", "source_id": "m401-markov", "target_id": "m401-quantum", "label": "probabilistic for", "cross_course": False},
    {"id": "conn-m401-4", "source_id": "m401-markov", "target_id": "m401-svd",     "label": "analyzed via",      "cross_course": False},
    {"id": "conn-m401-5", "source_id": "m401-quantum","target_id": "m401-svd",     "label": "represented by",    "cross_course": False},

    # ── SC4002 Intra ────────────────────────────────────────────
    {"id": "conn-c470-1", "source_id": "c470-ngram",       "target_id": "c470-cfg",         "label": "structured by",    "cross_course": False},
    {"id": "conn-c470-2", "source_id": "c470-ngram",       "target_id": "c470-transformer", "label": "evolved into",     "cross_course": False},
    {"id": "conn-c470-3", "source_id": "c470-cfg",         "target_id": "c470-transformer", "label": "surpassed by",     "cross_course": False},
    {"id": "conn-c470-4", "source_id": "c470-transformer", "target_id": "c470-ngram",       "label": "replaces",         "cross_course": False},
    {"id": "conn-c470-5", "source_id": "c470-cfg",         "target_id": "c470-ngram",       "label": "parses",           "cross_course": False},

    # ── SC4024 Intra ────────────────────────────────────────────
    {"id": "conn-c471-1", "source_id": "c471-vis",      "target_id": "c471-interact", "label": "made interactive", "cross_course": False},
    {"id": "conn-c471-2", "source_id": "c471-vis",      "target_id": "c471-network",  "label": "applied to",      "cross_course": False},
    {"id": "conn-c471-3", "source_id": "c471-interact", "target_id": "c471-network",  "label": "renders",         "cross_course": False},
    {"id": "conn-c471-4", "source_id": "c471-network",  "target_id": "c471-vis",      "label": "type of",         "cross_course": False},
    {"id": "conn-c471-5", "source_id": "c471-interact", "target_id": "c471-vis",      "label": "displays",        "cross_course": False},

    # ── CROSS-COURSE CONNECTIONS ─────────────────────────────────
    {"id": "cross-1",  "source_id": "c330-recursion", "target_id": "m240-matrices",      "label": "recursive algorithms on",      "cross_course": True},
    {"id": "cross-3",  "source_id": "c470-cfg",       "target_id": "c330-cfg",            "label": "linguistic application of",    "cross_course": True},
    {"id": "cross-4",  "source_id": "m401-svd",       "target_id": "c422-pca",            "label": "mathematical engine for",      "cross_course": True},
    {"id": "cross-5",  "source_id": "m401-svd",       "target_id": "m240-diagonalization","label": "generalization of",            "cross_course": True},
    {"id": "cross-6",  "source_id": "c422-nn",        "target_id": "c470-transformer",    "label": "architectural foundation of",  "cross_course": True},
    {"id": "cross-7",  "source_id": "c320-stats",     "target_id": "b230-hyp-test",       "label": "equivalent framework",         "cross_course": True},
    {"id": "cross-8",  "source_id": "b230-regression","target_id": "c422-sup",             "label": "statistical framing of",       "cross_course": True},
    {"id": "cross-9",  "source_id": "c421-search",    "target_id": "e306-game",            "label": "adversarial minimax in",       "cross_course": True},
    {"id": "cross-12", "source_id": "c421-bayes",     "target_id": "b230-prob",            "label": "computational application of", "cross_course": True},
    {"id": "cross-13", "source_id": "c471-vis",       "target_id": "c320-pandas",          "label": "visualizes data from",         "cross_course": True},
    {"id": "cross-14", "source_id": "m401-quantum",   "target_id": "m240-vector-spaces",   "label": "state representations in",     "cross_course": True},
    {"id": "cross-15", "source_id": "c421-kr",        "target_id": "c330-lambda",           "label": "symbolic representation overlap","cross_course": True},

    # ── SC2005 → SC2002 (systems foundations for programming languages) ──
    {"id": "cross-16", "source_id": "c216-c",         "target_id": "c330-rust",            "label": "systems language precursor to", "cross_course": True},
    {"id": "cross-17", "source_id": "c216-mem",       "target_id": "c330-ownership",       "label": "manual memory motivates",       "cross_course": True},

    # ── MH1812 → SC2002 (discrete math foundations for formal languages) ──
    {"id": "cross-18", "source_id": "c250-proplogic", "target_id": "c330-nfa-dfa",         "label": "logical basis of",             "cross_course": True},
    {"id": "cross-19", "source_id": "c250-induction", "target_id": "c330-recursion",       "label": "proof analog of",              "cross_course": True},
    {"id": "cross-20", "source_id": "c250-graphs",    "target_id": "c330-cfg",             "label": "graph structure underlies",     "cross_course": True},

    # ── MH1812 → SC2001 (discrete math foundations for algorithms) ──
    {"id": "cross-21", "source_id": "c250-induction", "target_id": "c351-bigo",            "label": "inductive proofs in",          "cross_course": True},
    {"id": "cross-22", "source_id": "c250-recurrences","target_id": "c351-dc",             "label": "solves runtime of",            "cross_course": True},
    {"id": "cross-23", "source_id": "c250-graphs",    "target_id": "c351-graphs",          "label": "theory applied in",            "cross_course": True},
    {"id": "cross-24", "source_id": "c250-combinatorics","target_id": "c351-dp",           "label": "counting problems in",         "cross_course": True},
]
