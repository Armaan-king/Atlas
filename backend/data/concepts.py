CONCEPTS = [
    # ── SC2002 ────────────────────────────────────────────────────
    {"id": "c330-ocaml", "course_id": "sc2002", "label": "OCaml", "mastery": 75},
    {"id": "c330-pattern-match", "course_id": "sc2002", "label": "Pattern Matching", "mastery": 70},
    {"id": "c330-recursion", "course_id": "sc2002", "label": "Recursion", "mastery": 80},
    {"id": "c330-regex", "course_id": "sc2002", "label": "Regular Expressions", "mastery": 60},
    {"id": "c330-nfa-dfa", "course_id": "sc2002", "label": "NFA / DFA", "mastery": 55},
    {"id": "c330-cfg", "course_id": "sc2002", "label": "Context-Free Grammars", "mastery": 50},
    {"id": "c330-lambda", "course_id": "sc2002", "label": "Lambda Calculus", "mastery": 40},
    {"id": "c330-rust", "course_id": "sc2002", "label": "Rust", "mastery": 45},
    {"id": "c330-ownership", "course_id": "sc2002", "label": "Ownership & Borrowing", "mastery": 40},
    {"id": "c330-type-inference", "course_id": "sc2002", "label": "Type Inference", "mastery": 65},
    
    # ── MH2802 ────────────────────────────────────────────────────
    {"id": "m240-vectors", "course_id": "mh2802", "label": "Vectors", "mastery": 85},
    {"id": "m240-matrices", "course_id": "mh2802", "label": "Matrices", "mastery": 80},
    {"id": "m240-lin-transform", "course_id": "mh2802", "label": "Linear Transformations", "mastery": 60},
    {"id": "m240-eigenvalues", "course_id": "mh2802", "label": "Eigenvalues", "mastery": 45},
    {"id": "m240-eigenvectors", "course_id": "mh2802", "label": "Eigenvectors", "mastery": 45},
    {"id": "m240-diagonalization", "course_id": "mh2802", "label": "Diagonalization", "mastery": 35},
    {"id": "m240-vector-spaces", "course_id": "mh2802", "label": "Vector Spaces", "mastery": 70},
    {"id": "m240-basis-dim", "course_id": "mh2802", "label": "Basis & Dimension", "mastery": 65},
    {"id": "m240-null-col-space", "course_id": "mh2802", "label": "Null & Column Space", "mastery": 60},
    {"id": "m240-determinant", "course_id": "mh2802", "label": "Determinant", "mastery": 75},

    # ── SC2005 ────────────────────────────────────────────────────
    {"id": "c216-c", "course_id": "sc2005", "label": "C Programming Basics", "mastery": 80},
    {"id": "c216-bits", "course_id": "sc2005", "label": "Bits & Data Rep", "mastery": 85},
    {"id": "c216-mem", "course_id": "sc2005", "label": "Memory Management", "mastery": 70},
    {"id": "c216-asm", "course_id": "sc2005", "label": "x86 Assembly", "mastery": 50},
    {"id": "c216-proc", "course_id": "sc2005", "label": "Processes & Fork", "mastery": 65},
    {"id": "c216-syscall", "course_id": "sc2005", "label": "System Calls", "mastery": 60},
    {"id": "c216-link", "course_id": "sc2005", "label": "Linking & Loading", "mastery": 55},
    {"id": "c216-vm", "course_id": "sc2005", "label": "Virtual Memory", "mastery": 40},
    {"id": "c216-cache", "course_id": "sc2005", "label": "Cache Hierarchy", "mastery": 45},

    # ── MH1812 ────────────────────────────────────────────────────
    {"id": "c250-proplogic", "course_id": "mh1812", "label": "Propositional Logic", "mastery": 80},
    {"id": "c250-predlogic", "course_id": "mh1812", "label": "Predicate Logic", "mastery": 75},
    {"id": "c250-proofs", "course_id": "mh1812", "label": "Proof Techniques", "mastery": 70},
    {"id": "c250-sets", "course_id": "mh1812", "label": "Set Theory", "mastery": 85},
    {"id": "c250-relations", "course_id": "mh1812", "label": "Relations & Functions", "mastery": 70},
    {"id": "c250-induction", "course_id": "mh1812", "label": "Mathematical Induction", "mastery": 65},
    {"id": "c250-recurrences", "course_id": "mh1812", "label": "Recurrences", "mastery": 60},
    {"id": "c250-combinatorics", "course_id": "mh1812", "label": "Combinatorics", "mastery": 55},
    {"id": "c250-numtheory", "course_id": "mh1812", "label": "Number Theory", "mastery": 50},
    {"id": "c250-graphs", "course_id": "mh1812", "label": "Graph Theory", "mastery": 50},

    # ── SC2001 ────────────────────────────────────────────────────
    {"id": "c351-bigo", "course_id": "sc2001", "label": "Asymptotic Analysis", "mastery": 75},
    {"id": "c351-dc", "course_id": "sc2001", "label": "Divide & Conquer", "mastery": 70},
    {"id": "c351-sort", "course_id": "sc2001", "label": "Sorting Algorithms", "mastery": 65},
    {"id": "c351-greedy", "course_id": "sc2001", "label": "Greedy Algorithms", "mastery": 60},
    {"id": "c351-dp", "course_id": "sc2001", "label": "Dynamic Programming", "mastery": 55},
    {"id": "c351-graphs", "course_id": "sc2001", "label": "Graph Algorithms", "mastery": 50},
    {"id": "c351-shortpath", "course_id": "sc2001", "label": "Shortest Paths", "mastery": 45},
    {"id": "c351-mst", "course_id": "sc2001", "label": "Minimum Spanning Trees", "mastery": 45},
    {"id": "c351-np", "course_id": "sc2001", "label": "NP-Completeness", "mastery": 30},

    # ── SC1015 / SC1015 ──────────────────────────────────────────
    {"id": "c320-pandas", "course_id": "sc1015", "label": "Pandas & Data Cleaning", "mastery": 60},
    {"id": "c320-stats", "course_id": "sc1015", "label": "Probability & Hypothesis Testing", "mastery": 50},
    {"id": "c320-ml-intro", "course_id": "sc1015", "label": "Applied Machine Learning", "mastery": 45},

    # ── BU8201 ────────────────────────────────────────────────────
    {"id": "b230-prob", "course_id": "bu8201", "label": "Business Probability", "mastery": 65},
    {"id": "b230-hyp-test", "course_id": "bu8201", "label": "Hypothesis Testing", "mastery": 55},
    {"id": "b230-regression", "course_id": "bu8201", "label": "Linear Regression", "mastery": 50},

    # ── HE2001 ────────────────────────────────────────────────────
    {"id": "e306-cost", "course_id": "he2001", "label": "Cost Functions", "mastery": 70},
    {"id": "e306-game", "course_id": "he2001", "label": "Advanced Game Theory", "mastery": 65},
    {"id": "e306-externality", "course_id": "he2001", "label": "Advanced Externalities", "mastery": 60},

    # ── SC4024 ────────────────────────────────────────────────────
    {"id": "c471-vis", "course_id": "sc4024", "label": "Visual Encodings", "mastery": 50},
    {"id": "c471-interact", "course_id": "sc4024", "label": "Interactive D3/Web", "mastery": 40},
    {"id": "c471-network", "course_id": "sc4024", "label": "Network & Trees Vis", "mastery": 45},

    # ── SC4001 ────────────────────────────────────────────────────
    {"id": "c422-sup", "course_id": "sc4001", "label": "Supervised Learning", "mastery": 55},
    {"id": "c422-unsup", "course_id": "sc4001", "label": "Unsupervised Learning", "mastery": 50},
    {"id": "c422-nn", "course_id": "sc4001", "label": "Deep Neural Networks", "mastery": 40},
    {"id": "c422-pca", "course_id": "sc4001", "label": "PCA & Dimensionality", "mastery": 45},

    # ── SC3000 ────────────────────────────────────────────────────
    {"id": "c421-search", "course_id": "sc3000", "label": "State Space Search", "mastery": 60},
    {"id": "c421-kr", "course_id": "sc3000", "label": "Knowledge Rep & Logic", "mastery": 55},
    {"id": "c421-bayes", "course_id": "sc3000", "label": "Bayesian Inference", "mastery": 45},

    # ── MH3700 ────────────────────────────────────────────────────
    {"id": "m401-svd", "course_id": "mh3700", "label": "Singular Value Decomposition", "mastery": 30},
    {"id": "m401-markov", "course_id": "mh3700", "label": "Markov Chains", "mastery": 35},
    {"id": "m401-quantum", "course_id": "mh3700", "label": "Quantum Bits", "mastery": 20},

    # ── SC4002 ────────────────────────────────────────────────────
    {"id": "c470-ngram", "course_id": "sc4002", "label": "N-Grams & Semantics", "mastery": 50},
    {"id": "c470-cfg", "course_id": "sc4002", "label": "NLP Parsing & CFG", "mastery": 45},
    {"id": "c470-transformer", "course_id": "sc4002", "label": "Transformers & Attention", "mastery": 35},
]