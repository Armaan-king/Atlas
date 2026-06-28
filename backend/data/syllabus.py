SYLLABUS = [
    {
        'course_id': 'sc2002',
        'weeks': [
            {
                'week': 1,
                'topic': 'Introduction to OCaml',
                'concept_ids': [
                    'c330-ocaml',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Set up OCaml development environment',
                    'Write basic expressions and let bindings',
                ],
            },
            {
                'week': 2,
                'topic': 'Pattern Matching & Lists',
                'concept_ids': [
                    'c330-ocaml',
                    'c330-pattern-match',
                ],
                'assignment_ids': [
                    'sc2002-hw1',
                ],
                'outcomes': [
                    'Use match expressions to destructure data',
                    'Process lists with head::tail patterns',
                ],
            },
            {
                'week': 3,
                'topic': 'Recursion & Higher-Order Functions',
                'concept_ids': [
                    'c330-recursion',
                    'c330-pattern-match',
                ],
                'assignment_ids': [
                    'sc2002-quiz1',
                ],
                'outcomes': [
                    'Write recursive functions over lists and trees',
                    'Use map, fold, and filter',
                    'Convert to tail-recursive form',
                ],
            },
            {
                'week': 4,
                'topic': 'Type Inference & Polymorphism',
                'concept_ids': [
                    'c330-type-inference',
                    'c330-ocaml',
                ],
                'assignment_ids': [
                    'sc2002-hw2',
                ],
                'outcomes': [
                    'Understand Hindley-Milner type inference',
                    'Write polymorphic functions',
                ],
            },
            {
                'week': 5,
                'topic': 'Regular Expressions',
                'concept_ids': [
                    'c330-regex',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Construct regex for language description',
                    'Understand union, concatenation, and Kleene star',
                ],
            },
            {
                'week': 6,
                'topic': 'Finite Automata',
                'concept_ids': [
                    'c330-regex',
                    'c330-nfa-dfa',
                ],
                'assignment_ids': [
                    'sc2002-hw3',
                    'sc2002-quiz2',
                ],
                'outcomes': [
                    "Convert regex to NFA via Thompson's construction",
                    'Convert NFA to DFA via subset construction',
                ],
            },
            {
                'week': 7,
                'topic': 'Context-Free Grammars & Parsing',
                'concept_ids': [
                    'c330-cfg',
                    'c330-nfa-dfa',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Write CFGs for nested structures',
                    'Understand the limits of regular languages via pumping lemma',
                    'Parse simple grammars recursively',
                ],
            },
            {
                'week': 8,
                'topic': 'Midterm 1 Review & Lambda Calculus Intro',
                'concept_ids': [
                    'c330-lambda',
                ],
                'assignment_ids': [
                    'sc2002-midterm1',
                ],
                'outcomes': [
                    'Review OCaml, regex, automata, and CFGs',
                    'Understand lambda abstraction and application',
                ],
            },
            {
                'week': 9,
                'topic': 'Lambda Calculus & Computation',
                'concept_ids': [
                    'c330-lambda',
                    'c330-type-inference',
                ],
                'assignment_ids': [
                    'sc2002-quiz3',
                ],
                'outcomes': [
                    'Perform alpha-renaming and beta-reduction',
                    'Encode booleans and numbers in lambda calculus',
                ],
            },
            {
                'week': 10,
                'topic': 'Introduction to Rust',
                'concept_ids': [
                    'c330-rust',
                ],
                'assignment_ids': [
                    'sc2002-hw4',
                ],
                'outcomes': [
                    "Understand Rust's design goals vs garbage-collected languages",
                    'Write basic Rust programs with structs and enums',
                ],
            },
            {
                'week': 11,
                'topic': 'Rust Ownership & Borrowing',
                'concept_ids': [
                    'c330-rust',
                    'c330-ownership',
                ],
                'assignment_ids': [
                    'sc2002-hw5',
                ],
                'outcomes': [
                    'Apply ownership rules to avoid use-after-free',
                    'Use shared and mutable references correctly',
                ],
            },
            {
                'week': 12,
                'topic': 'Rust Lifetimes & Error Handling',
                'concept_ids': [
                    'c330-ownership',
                    'c330-rust',
                ],
                'assignment_ids': [
                    'sc2002-quiz4',
                    'sc2002-hw6',
                ],
                'outcomes': [
                    'Annotate lifetimes in function signatures',
                    'Use Result and Option for error handling',
                ],
            },
            {
                'week': 13,
                'topic': 'Rust Traits & Generics',
                'concept_ids': [
                    'c330-rust',
                    'c330-type-inference',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Define and implement traits',
                    'Write generic functions with trait bounds',
                ],
            },
            {
                'week': 14,
                'topic': 'Midterm 2 Review',
                'concept_ids': [
                    'c330-lambda',
                    'c330-rust',
                    'c330-ownership',
                ],
                'assignment_ids': [
                    'sc2002-midterm2',
                ],
                'outcomes': [
                    'Review lambda calculus, Rust ownership, and borrowing',
                    'Practice midterm-style problems',
                ],
            },
            {
                'week': 15,
                'topic': 'Course Wrap-Up & PL Landscape',
                'concept_ids': [
                    'c330-ocaml',
                    'c330-rust',
                    'c330-lambda',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Compare paradigms: functional, imperative, systems',
                    'Reflect on type safety across languages',
                ],
            },
        ],
    },
    {
        'course_id': 'mh2802',
        'weeks': [
            {
                'week': 1,
                'topic': 'Vectors in Rⁿ',
                'concept_ids': [
                    'm240-vectors',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Perform vector addition and scalar multiplication',
                    'Compute dot products and understand geometric interpretation',
                ],
            },
            {
                'week': 2,
                'topic': 'Systems of Linear Equations & Matrices',
                'concept_ids': [
                    'm240-vectors',
                    'm240-matrices',
                ],
                'assignment_ids': [
                    'mh2802-hw1',
                ],
                'outcomes': [
                    'Set up augmented matrices',
                    'Apply Gaussian elimination and row reduction',
                ],
            },
            {
                'week': 3,
                'topic': 'Matrix Operations & Inverses',
                'concept_ids': [
                    'm240-matrices',
                ],
                'assignment_ids': [
                    'mh2802-hw2',
                ],
                'outcomes': [
                    'Multiply matrices and compute transposes',
                    'Find inverse matrices using row reduction',
                ],
            },
            {
                'week': 4,
                'topic': 'Determinants',
                'concept_ids': [
                    'm240-determinant',
                    'm240-matrices',
                ],
                'assignment_ids': [
                    'mh2802-hw3',
                ],
                'outcomes': [
                    'Compute determinants via cofactor expansion',
                    'Use determinants to test invertibility',
                ],
            },
            {
                'week': 5,
                'topic': 'Vector Spaces & Subspaces',
                'concept_ids': [
                    'm240-vector-spaces',
                    'm240-vectors',
                ],
                'assignment_ids': [
                    'mh2802-hw4',
                ],
                'outcomes': [
                    'Verify vector space axioms',
                    'Identify subspaces and check closure properties',
                ],
            },
            {
                'week': 6,
                'topic': 'Basis, Dimension & Rank',
                'concept_ids': [
                    'm240-basis-dim',
                    'm240-vector-spaces',
                ],
                'assignment_ids': [
                    'mh2802-hw5',
                ],
                'outcomes': [
                    'Find a basis for a given subspace',
                    'Compute rank and understand rank-nullity theorem',
                ],
            },
            {
                'week': 7,
                'topic': 'Null Space & Column Space',
                'concept_ids': [
                    'm240-null-col-space',
                    'm240-basis-dim',
                ],
                'assignment_ids': [
                    'mh2802-exam1',
                ],
                'outcomes': [
                    'Compute null space and column space of a matrix',
                    'Relate dimensions via rank-nullity',
                ],
            },
            {
                'week': 8,
                'topic': 'Linear Transformations',
                'concept_ids': [
                    'm240-lin-transform',
                    'm240-matrices',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Verify linearity of a transformation',
                    'Find the standard matrix of a linear transformation',
                ],
            },
            {
                'week': 9,
                'topic': 'Kernel, Image & Exam 1 Review',
                'concept_ids': [
                    'm240-lin-transform',
                    'm240-null-col-space',
                ],
                'assignment_ids': [
                    'mh2802-hw6',
                ],
                'outcomes': [
                    'Compute kernel and image of a linear transformation',
                    'Review all topics through linear transformations',
                ],
            },
            {
                'week': 10,
                'topic': 'Eigenvalues & Characteristic Polynomial',
                'concept_ids': [
                    'm240-eigenvalues',
                    'm240-determinant',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Compute characteristic polynomial det(A − λI)',
                    'Find eigenvalues by solving the characteristic equation',
                ],
            },
            {
                'week': 11,
                'topic': 'Eigenvectors & Eigenspaces',
                'concept_ids': [
                    'm240-eigenvalues',
                    'm240-eigenvectors',
                ],
                'assignment_ids': [
                    'mh2802-hw7',
                ],
                'outcomes': [
                    'Find eigenvectors for each eigenvalue',
                    'Describe eigenspaces as null spaces of A − λI',
                ],
            },
            {
                'week': 12,
                'topic': 'Diagonalization',
                'concept_ids': [
                    'm240-diagonalization',
                    'm240-eigenvectors',
                ],
                'assignment_ids': [
                    'mh2802-exam2',
                    'mh2802-hw8',
                ],
                'outcomes': [
                    'Determine if a matrix is diagonalizable',
                    'Construct P and D such that A = PDP⁻¹',
                ],
            },
            {
                'week': 13,
                'topic': 'Applications of Diagonalization',
                'concept_ids': [
                    'm240-diagonalization',
                    'm240-eigenvalues',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Compute matrix powers via diagonalization',
                    'Apply to discrete dynamical systems',
                ],
            },
            {
                'week': 14,
                'topic': 'Orthogonality & Symmetric Matrices',
                'concept_ids': [
                    'm240-eigenvectors',
                    'm240-vector-spaces',
                ],
                'assignment_ids': [
                    'mh2802-hw9',
                ],
                'outcomes': [
                    'Understand orthogonal vectors and projections',
                    'Diagonalize symmetric matrices with orthogonal eigenvectors',
                ],
            },
            {
                'week': 15,
                'topic': 'Final Review & Applications',
                'concept_ids': [
                    'm240-eigenvalues',
                    'm240-diagonalization',
                    'm240-lin-transform',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Synthesize all topics from vectors to diagonalization',
                    'Apply linear algebra to real-world problems',
                ],
            },
        ],
    },
    {
        'course_id': 'mh1812',
        'weeks': [
            {
                'week': 1,
                'topic': 'Propositional Logic',
                'concept_ids': [
                    'c250-proplogic',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Build truth tables',
                    "Prove logical equivalences via De Morgan's laws",
                ],
            },
            {
                'week': 2,
                'topic': 'Predicate Logic',
                'concept_ids': [
                    'c250-proplogic',
                    'c250-predlogic',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Use quantifiers',
                    'Translate English statements to predicate logic',
                ],
            },
            {
                'week': 3,
                'topic': 'Proof Techniques',
                'concept_ids': [
                    'c250-predlogic',
                    'c250-proofs',
                ],
                'assignment_ids': [
                    'mh1812-hw1',
                ],
                'outcomes': [
                    'Write direct proofs',
                    'Apply proof by contradiction and contrapositive',
                ],
            },
            {
                'week': 4,
                'topic': 'Set Theory',
                'concept_ids': [
                    'c250-proofs',
                    'c250-sets',
                ],
                'assignment_ids': [
                    'mh1812-hw2',
                ],
                'outcomes': [
                    'Prove set identities',
                    'Work with power sets and Cartesian products',
                ],
            },
            {
                'week': 5,
                'topic': 'Relations & Functions',
                'concept_ids': [
                    'c250-sets',
                    'c250-relations',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Classify relations',
                    'Prove bijectivity and function composition',
                ],
            },
            {
                'week': 6,
                'topic': 'Mathematical Induction',
                'concept_ids': [
                    'c250-relations',
                    'c250-induction',
                ],
                'assignment_ids': [
                    'mh1812-hw3',
                ],
                'outcomes': [
                    'Write weak and strong induction proofs',
                    'Apply well-ordering principle',
                ],
            },
            {
                'week': 7,
                'topic': 'Induction Applications',
                'concept_ids': [
                    'c250-induction',
                    'c250-recurrences',
                ],
                'assignment_ids': [
                    'mh1812-hw4',
                ],
                'outcomes': [
                    'Prove summation formulas',
                    'Solve recurrences by substitution',
                ],
            },
            {
                'week': 8,
                'topic': 'Combinatorics',
                'concept_ids': [
                    'c250-combinatorics',
                ],
                'assignment_ids': [
                    'mh1812-exam1',
                ],
                'outcomes': [
                    'Apply inclusion-exclusion',
                    'Use pigeonhole principle',
                ],
            },
            {
                'week': 9,
                'topic': 'Number Theory',
                'concept_ids': [
                    'c250-numtheory',
                    'c250-combinatorics',
                ],
                'assignment_ids': [
                    'mh1812-hw5',
                ],
                'outcomes': [
                    "GCD, modular arithmetic, Fermat's little theorem",
                ],
            },
            {
                'week': 10,
                'topic': 'Intro Graph Theory',
                'concept_ids': [
                    'c250-graphs',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Define graphs',
                    'Prove basic graph properties',
                ],
            },
            {
                'week': 11,
                'topic': 'Graph Theory Deep Dive',
                'concept_ids': [
                    'c250-graphs',
                ],
                'assignment_ids': [
                    'mh1812-hw6',
                    'mh1812-quiz2',
                ],
                'outcomes': [
                    'Trees, connectivity, Euler and Hamiltonian paths',
                ],
            },
            {
                'week': 12,
                'topic': 'Review: Logic to Graphs',
                'concept_ids': [
                    'c250-proplogic',
                    'c250-induction',
                    'c250-graphs',
                ],
                'assignment_ids': [
                    'mh1812-exam2',
                ],
                'outcomes': [
                    'Connect all proof structures for final exam',
                ],
            },
        ],
    },
    {
        'course_id': 'sc2001',
        'weeks': [
            {
                'week': 1,
                'topic': 'Asymptotic Notation',
                'concept_ids': [
                    'c351-bigo',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Prove Big-O/Theta/Omega claims',
                    'Classify functions by growth rate',
                ],
            },
            {
                'week': 2,
                'topic': 'Recurrences',
                'concept_ids': [
                    'c351-bigo',
                    'c351-dc',
                ],
                'assignment_ids': [
                    'sc2001-hw1',
                ],
                'outcomes': [
                    'Apply Master Theorem',
                    'Draw recurrence trees',
                ],
            },
            {
                'week': 3,
                'topic': 'Divide & Conquer',
                'concept_ids': [
                    'c351-dc',
                    'c351-sort',
                ],
                'assignment_ids': [
                    'sc2001-hw2',
                ],
                'outcomes': [
                    'Implement and analyze merge sort',
                    'Prove D&C correctness',
                ],
            },
            {
                'week': 4,
                'topic': 'Sorting Lower Bounds',
                'concept_ids': [
                    'c351-sort',
                ],
                'assignment_ids': [
                    'sc2001-quiz1',
                ],
                'outcomes': [
                    'Prove Ω(n log n) lower bound for comparison sorts',
                ],
            },
            {
                'week': 5,
                'topic': 'Greedy Algorithms',
                'concept_ids': [
                    'c351-greedy',
                    'c351-sort',
                ],
                'assignment_ids': [
                    'sc2001-hw3',
                ],
                'outcomes': [
                    'Prove greedy correctness via exchange argument',
                    'Huffman coding',
                ],
            },
            {
                'week': 6,
                'topic': 'Dynamic Programming I',
                'concept_ids': [
                    'c351-dp',
                    'c351-greedy',
                ],
                'assignment_ids': [
                    'sc2001-exam1',
                ],
                'outcomes': [
                    'Identify optimal substructure and overlapping subproblems',
                ],
            },
            {
                'week': 7,
                'topic': 'Dynamic Programming II',
                'concept_ids': [
                    'c351-dp',
                ],
                'assignment_ids': [
                    'sc2001-hw4',
                ],
                'outcomes': [
                    'Implement LCS, 0/1 knapsack, matrix chain multiplication',
                ],
            },
            {
                'week': 8,
                'topic': 'Graph Traversal',
                'concept_ids': [
                    'c351-graphs',
                    'c351-hashing',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'BFS/DFS with timestamps',
                    'Topological sort',
                ],
            },
            {
                'week': 9,
                'topic': 'Shortest Paths',
                'concept_ids': [
                    'c351-shortpath',
                    'c351-graphs',
                ],
                'assignment_ids': [
                    'sc2001-hw5',
                ],
                'outcomes': [
                    'Implement Dijkstra and Bellman-Ford',
                    'Detect negative cycles',
                ],
            },
            {
                'week': 10,
                'topic': 'Minimum Spanning Trees',
                'concept_ids': [
                    'c351-mst',
                    'c351-shortpath',
                ],
                'assignment_ids': [
                    'sc2001-quiz2',
                ],
                'outcomes': [
                    'Kruskal with union-find',
                    "Prim's algorithm",
                ],
            },
            {
                'week': 11,
                'topic': 'NP-Completeness',
                'concept_ids': [
                    'c351-np',
                    'c351-mst',
                ],
                'assignment_ids': [
                    'sc2001-hw6',
                ],
                'outcomes': [
                    '3-SAT reductions',
                    'Cook-Levin theorem',
                ],
            },
            {
                'week': 12,
                'topic': 'Approximation & Review',
                'concept_ids': [
                    'c351-greedy',
                    'c351-np',
                ],
                'assignment_ids': [
                    'sc2001-exam2',
                ],
                'outcomes': [
                    'Vertex cover approximation',
                    'TSP 2-approximation',
                ],
            },
        ],
    },
    {
        'course_id': 'sc2005',
        'weeks': [
            {
                'week': 1,
                'topic': 'C Basics & Compilation',
                'concept_ids': [
                    'c216-c',
                    'c216-bits',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Write C with pointers',
                    'Compile with gcc, understand object files',
                ],
            },
            {
                'week': 2,
                'topic': 'Pointers & Arrays',
                'concept_ids': [
                    'c216-c',
                    'c216-mem',
                ],
                'assignment_ids': [
                    'sc2005-hw1',
                ],
                'outcomes': [
                    'Pointer arithmetic',
                    'Arrays as pointers, pointer-to-pointer',
                ],
            },
            {
                'week': 3,
                'topic': 'Dynamic Memory',
                'concept_ids': [
                    'c216-mem',
                ],
                'assignment_ids': [
                    'sc2005-hw2',
                ],
                'outcomes': [
                    'malloc/free',
                    'Valgrind memory checks, linked list in C',
                ],
            },
            {
                'week': 4,
                'topic': 'Intro x86 Assembly',
                'concept_ids': [
                    'c216-asm',
                    'c216-bits',
                ],
                'assignment_ids': [
                    'sc2005-proj1',
                ],
                'outcomes': [
                    'Read basic x86',
                    'Understand calling conventions and stack frames',
                ],
            },
            {
                'week': 5,
                'topic': 'Assembly & C Interop',
                'concept_ids': [
                    'c216-asm',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Write assembly functions called from C',
                    'AT&T vs Intel syntax',
                ],
            },
            {
                'week': 6,
                'topic': 'Processes & Fork',
                'concept_ids': [
                    'c216-proc',
                    'c216-syscall',
                ],
                'assignment_ids': [
                    'sc2005-hw3',
                ],
                'outcomes': [
                    'fork/exec/wait',
                    'Process tree, zombie and orphan processes',
                ],
            },
            {
                'week': 7,
                'topic': 'System Calls & I/O',
                'concept_ids': [
                    'c216-syscall',
                ],
                'assignment_ids': [
                    'sc2005-exam1',
                ],
                'outcomes': [
                    'read/write syscalls',
                    'File descriptors, open/close',
                ],
            },
            {
                'week': 8,
                'topic': 'Signals & Pipes',
                'concept_ids': [
                    'c216-proc',
                    'c216-link',
                ],
                'assignment_ids': [
                    'sc2005-proj2',
                ],
                'outcomes': [
                    'Signal handlers',
                    'IPC with pipes and dup2',
                ],
            },
            {
                'week': 9,
                'topic': 'Linking & Loading',
                'concept_ids': [
                    'c216-link',
                ],
                'assignment_ids': [
                    'sc2005-hw4',
                ],
                'outcomes': [
                    'Static vs dynamic linking',
                    'ELF format, symbol resolution',
                ],
            },
            {
                'week': 10,
                'topic': 'Virtual Memory',
                'concept_ids': [
                    'c216-vm',
                    'c216-link',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Page tables',
                    'TLB, demand paging, page faults',
                ],
            },
            {
                'week': 11,
                'topic': 'Caching',
                'concept_ids': [
                    'c216-cache',
                    'c216-vm',
                ],
                'assignment_ids': [
                    'sc2005-quiz1',
                ],
                'outcomes': [
                    'Cache miss analysis',
                    'Write-back vs write-through, associativity',
                ],
            },
            {
                'week': 12,
                'topic': 'Review: Memory Hierarchy',
                'concept_ids': [
                    'c216-mem',
                    'c216-vm',
                    'c216-cache',
                ],
                'assignment_ids': [
                    'sc2005-exam2',
                ],
                'outcomes': [
                    'Connect C → assembly → virtual memory → cache hierarchy',
                ],
            },
        ],
    },
    {
        'course_id': 'sc4001',
        'weeks': [
            {
                'week': 1,
                'topic': 'ML Intro & Linear Regression',
                'concept_ids': [
                    'c422-linreg',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'Fit OLS regression',
                    'Compute MSE cost function',
                ],
            },
            {
                'week': 2,
                'topic': 'Gradient Descent',
                'concept_ids': [
                    'c422-linreg',
                    'c422-gd',
                ],
                'assignment_ids': [
                    'sc4001-hw1',
                ],
                'outcomes': [
                    'Implement batch GD',
                    'Tune learning rate, visualize convergence',
                ],
            },
            {
                'week': 3,
                'topic': 'Classification Basics',
                'concept_ids': [
                    'c422-gd',
                ],
                'assignment_ids': [
                    'sc4001-hw2',
                ],
                'outcomes': [
                    'Logistic regression',
                    'Sigmoid function, binary cross-entropy',
                ],
            },
            {
                'week': 4,
                'topic': 'Decision Trees',
                'concept_ids': [
                    'c422-dtree',
                    'c422-gd',
                ],
                'assignment_ids': [
                    'sc4001-quiz1',
                ],
                'outcomes': [
                    'Build ID3 tree',
                    'Compute information gain, handle overfitting',
                ],
            },
            {
                'week': 5,
                'topic': 'Ensembles & SVMs',
                'concept_ids': [
                    'c422-dtree',
                    'c422-svm',
                ],
                'assignment_ids': [
                    'sc4001-hw3',
                ],
                'outcomes': [
                    'Bootstrap, bagging, random forests',
                    'Hard/soft margin SVM',
                ],
            },
            {
                'week': 6,
                'topic': 'Neural Networks',
                'concept_ids': [
                    'c422-nn',
                    'c422-svm',
                ],
                'assignment_ids': [
                    'sc4001-exam1',
                ],
                'outcomes': [
                    'Build MLP forward pass',
                    'Choose activation functions',
                ],
            },
            {
                'week': 7,
                'topic': 'Backpropagation',
                'concept_ids': [
                    'c422-backprop',
                    'c422-nn',
                ],
                'assignment_ids': [
                    'sc4001-hw4',
                ],
                'outcomes': [
                    'Derive backprop via chain rule',
                    'Implement from scratch in NumPy',
                ],
            },
            {
                'week': 8,
                'topic': 'Regularization & Dropout',
                'concept_ids': [
                    'c422-reg',
                    'c422-backprop',
                ],
                'assignment_ids': [
                    'sc4001-hw5',
                ],
                'outcomes': [
                    'L1/L2 weight decay',
                    'Dropout as approximate model averaging',
                ],
            },
            {
                'week': 9,
                'topic': 'Model Evaluation',
                'concept_ids': [
                    'c422-cv',
                    'c422-reg',
                ],
                'assignment_ids': [
                    'sc4001-quiz2',
                ],
                'outcomes': [
                    'k-fold cross-validation',
                    'Precision, recall, F1, ROC-AUC',
                ],
            },
            {
                'week': 10,
                'topic': 'Clustering',
                'concept_ids': [
                    'c422-cluster',
                    'c422-cv',
                ],
                'assignment_ids': [
                    'sc4001-proj1',
                ],
                'outcomes': [
                    'k-means, DBSCAN',
                    'Evaluate with silhouette score',
                ],
            },
            {
                'week': 11,
                'topic': 'Dimensionality Reduction',
                'concept_ids': [
                    'c422-pca',
                    'c422-cluster',
                ],
                'assignment_ids': [],
                'outcomes': [
                    'PCA via SVD',
                    'Variance explained, scree plot',
                ],
            },
            {
                'week': 12,
                'topic': 'Review & Project Clinic',
                'concept_ids': [
                    'c422-linreg',
                    'c422-nn',
                    'c422-backprop',
                ],
                'assignment_ids': [
                    'sc4001-exam2',
                ],
                'outcomes': [
                    'End-to-end ML pipeline from data to evaluation',
                ],
            },
        ],
    },
    {
        'course_id': 'sc1015',
        'weeks': [
            {
                'week': 1,
                'topic': 'Intro & Writing',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 2,
                'topic': 'Data Vis & Presenting',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 3,
                'topic': 'Pandas, Python, SQL',
                'concept_ids': [
                    'c320-pandas',
                ],
                'assignment_ids': [
                    'sc1015-pandas',
                ],
            },
            {
                'week': 4,
                'topic': 'Probability & Distributions',
                'concept_ids': [
                    'c320-stats',
                ],
                'assignment_ids': [],
            },
            {
                'week': 5,
                'topic': 'Hypothesis Testing',
                'concept_ids': [
                    'c320-stats',
                ],
                'assignment_ids': [],
            },
            {
                'week': 6,
                'topic': 'Data Exploration Demo',
                'concept_ids': [
                    'c320-pandas',
                ],
                'assignment_ids': [
                    'sc1015-data-exp1',
                ],
            },
            {
                'week': 7,
                'topic': 'Exam 1 & Data Cleaning',
                'concept_ids': [
                    'c320-pandas',
                ],
                'assignment_ids': [
                    'sc1015-exam1',
                ],
            },
            {
                'week': 8,
                'topic': 'Intro to Machine Learning',
                'concept_ids': [
                    'c320-ml-intro',
                ],
                'assignment_ids': [],
            },
            {
                'week': 9,
                'topic': 'Neural Networks',
                'concept_ids': [
                    'c320-ml-intro',
                ],
                'assignment_ids': [],
            },
            {
                'week': 10,
                'topic': 'Classification & Regression',
                'concept_ids': [
                    'c320-ml-intro',
                ],
                'assignment_ids': [
                    'sc1015-ml-proj',
                ],
            },
        ],
    },
    {
        'course_id': 'bu8201',
        'weeks': [
            {
                'week': 1,
                'topic': 'Data Prep & Visualization',
                'concept_ids': [],
                'assignment_ids': [
                    'bu8201-ch2',
                ],
            },
            {
                'week': 2,
                'topic': 'Summary Measures',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 3,
                'topic': 'Probability',
                'concept_ids': [
                    'b230-prob',
                ],
                'assignment_ids': [],
            },
            {
                'week': 4,
                'topic': 'Exam 1',
                'concept_ids': [
                    'b230-prob',
                ],
                'assignment_ids': [
                    'bu8201-exam1',
                ],
            },
            {
                'week': 5,
                'topic': 'Discrete/Continuous Distributions',
                'concept_ids': [
                    'b230-prob',
                ],
                'assignment_ids': [],
            },
            {
                'week': 6,
                'topic': 'Sampling Distributions',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 7,
                'topic': 'Interval Estimation',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 8,
                'topic': 'Exam 2',
                'concept_ids': [],
                'assignment_ids': [
                    'bu8201-exam2',
                ],
            },
            {
                'week': 9,
                'topic': 'Hypothesis Testing',
                'concept_ids': [
                    'b230-hyp-test',
                ],
                'assignment_ids': [
                    'bu8201-disc8',
                ],
            },
            {
                'week': 10,
                'topic': 'Correlation & Regression',
                'concept_ids': [
                    'b230-regression',
                ],
                'assignment_ids': [],
            },
        ],
    },
    {
        'course_id': 'he2001',
        'weeks': [
            {
                'week': 1,
                'topic': 'Getting Started',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 2,
                'topic': 'Cost Functions (SR/LR)',
                'concept_ids': [
                    'e306-cost',
                ],
                'assignment_ids': [
                    'he2001-hw2',
                ],
            },
            {
                'week': 3,
                'topic': 'Monopoly',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 4,
                'topic': 'Externalities',
                'concept_ids': [
                    'e306-externality',
                ],
                'assignment_ids': [
                    'he2001-exam1',
                ],
            },
            {
                'week': 5,
                'topic': 'Game Theory Basics',
                'concept_ids': [
                    'e306-game',
                ],
                'assignment_ids': [
                    'he2001-game',
                ],
            },
            {
                'week': 6,
                'topic': 'Cournot Duopoly and Cartels',
                'concept_ids': [
                    'e306-game',
                ],
                'assignment_ids': [],
            },
            {
                'week': 7,
                'topic': 'Final Exam',
                'concept_ids': [
                    'e306-cost',
                    'e306-game',
                    'e306-externality',
                ],
                'assignment_ids': [
                    'he2001-final',
                ],
            },
        ],
    },
    {
        'course_id': 'sc4024',
        'weeks': [
            {
                'week': 1,
                'topic': 'Intro & Data Types',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 2,
                'topic': 'Visual Encodings & Scale',
                'concept_ids': [
                    'c471-vis',
                ],
                'assignment_ids': [
                    'sc4024-lab1',
                ],
            },
            {
                'week': 3,
                'topic': 'Perception & Tasks',
                'concept_ids': [
                    'c471-vis',
                ],
                'assignment_ids': [
                    'sc4024-assign1',
                ],
            },
            {
                'week': 4,
                'topic': 'Multivariate Data & Quiz 1',
                'concept_ids': [],
                'assignment_ids': [
                    'sc4024-quiz1',
                ],
            },
            {
                'week': 5,
                'topic': 'Interaction & Authoring',
                'concept_ids': [
                    'c471-interact',
                ],
                'assignment_ids': [],
            },
            {
                'week': 6,
                'topic': 'Time Series & Maps',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 7,
                'topic': 'Trees & Networks',
                'concept_ids': [
                    'c471-network',
                ],
                'assignment_ids': [],
            },
            {
                'week': 8,
                'topic': 'Uncertainty & Texts',
                'concept_ids': [],
                'assignment_ids': [
                    'sc4024-assign4',
                ],
            },
        ],
    },
    {
        'course_id': 'sc4001',
        'weeks': [
            {
                'week': 1,
                'topic': 'Decision Trees & K-NN',
                'concept_ids': [
                    'c422-sup',
                ],
                'assignment_ids': [],
            },
            {
                'week': 2,
                'topic': 'Perceptron & Linear Models',
                'concept_ids': [
                    'c422-sup',
                ],
                'assignment_ids': [
                    'sc4001-proj1',
                ],
            },
            {
                'week': 3,
                'topic': 'SVM & Naive Bayes',
                'concept_ids': [
                    'c422-sup',
                ],
                'assignment_ids': [],
            },
            {
                'week': 4,
                'topic': 'Midterm Exam',
                'concept_ids': [
                    'c422-sup',
                ],
                'assignment_ids': [
                    'sc4001-midterm',
                ],
            },
            {
                'week': 5,
                'topic': 'Neural Networks',
                'concept_ids': [
                    'c422-nn',
                ],
                'assignment_ids': [],
            },
            {
                'week': 6,
                'topic': 'Kernels & Ensemble Learning',
                'concept_ids': [],
                'assignment_ids': [
                    'sc4001-proj3',
                ],
            },
            {
                'week': 7,
                'topic': 'Clustering & PCA',
                'concept_ids': [
                    'c422-unsup',
                    'c422-pca',
                ],
                'assignment_ids': [],
            },
            {
                'week': 8,
                'topic': 'Final Exam',
                'concept_ids': [
                    'c422-sup',
                    'c422-unsup',
                    'c422-nn',
                ],
                'assignment_ids': [
                    'sc4001-final',
                ],
            },
        ],
    },
    {
        'course_id': 'sc3000',
        'weeks': [
            {
                'week': 1,
                'topic': 'Intro & Intelligent Agents',
                'concept_ids': [],
                'assignment_ids': [
                    'sc3000-hw1',
                ],
            },
            {
                'week': 2,
                'topic': 'Heuristic & Adversarial Search',
                'concept_ids': [
                    'c421-search',
                ],
                'assignment_ids': [
                    'sc3000-proj1',
                ],
            },
            {
                'week': 3,
                'topic': 'Constraint Satisfaction',
                'concept_ids': [
                    'c421-search',
                ],
                'assignment_ids': [],
            },
            {
                'week': 4,
                'topic': 'Exam 1: Search',
                'concept_ids': [
                    'c421-search',
                ],
                'assignment_ids': [
                    'sc3000-exam1',
                ],
            },
            {
                'week': 5,
                'topic': 'Knowledge Rep & Logic',
                'concept_ids': [
                    'c421-kr',
                ],
                'assignment_ids': [],
            },
            {
                'week': 6,
                'topic': 'Inference & Planning',
                'concept_ids': [
                    'c421-kr',
                ],
                'assignment_ids': [],
            },
            {
                'week': 7,
                'topic': 'Probabilistic Reasoning',
                'concept_ids': [
                    'c421-bayes',
                ],
                'assignment_ids': [],
            },
            {
                'week': 8,
                'topic': 'Bayes Filters & RL',
                'concept_ids': [
                    'c421-bayes',
                ],
                'assignment_ids': [
                    'sc3000-proj3',
                ],
            },
        ],
    },
    {
        'course_id': 'mh3700',
        'weeks': [
            {
                'week': 1,
                'topic': 'Vector Spaces & Linear Maps',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 2,
                'topic': 'Spectral Theorem & SVD',
                'concept_ids': [
                    'm401-svd',
                ],
                'assignment_ids': [],
            },
            {
                'week': 3,
                'topic': 'Image Compression & Markov Chains',
                'concept_ids': [
                    'm401-svd',
                    'm401-markov',
                ],
                'assignment_ids': [],
            },
            {
                'week': 4,
                'topic': 'Midterm 1',
                'concept_ids': [
                    'm401-svd',
                ],
                'assignment_ids': [
                    'mh3700-midterm1',
                ],
            },
            {
                'week': 5,
                'topic': 'Least Squares & Data Matrices',
                'concept_ids': [],
                'assignment_ids': [
                    'mh3700-deliv1',
                ],
            },
            {
                'week': 6,
                'topic': 'Quantum Bits & Measurement',
                'concept_ids': [
                    'm401-quantum',
                ],
                'assignment_ids': [],
            },
            {
                'week': 7,
                'topic': 'Midterm 2 & Graph Theory',
                'concept_ids': [],
                'assignment_ids': [
                    'mh3700-midterm2',
                ],
            },
            {
                'week': 8,
                'topic': 'Diff Eq & Portfolio Optimization',
                'concept_ids': [],
                'assignment_ids': [],
            },
        ],
    },
    {
        'course_id': 'sc4002',
        'weeks': [
            {
                'week': 1,
                'topic': 'N-Gram Language Models',
                'concept_ids': [
                    'c470-ngram',
                ],
                'assignment_ids': [
                    'sc4002-hw1',
                ],
            },
            {
                'week': 2,
                'topic': 'Perceptron & Logistic Regression',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 3,
                'topic': 'Distributional Semantics',
                'concept_ids': [
                    'c470-ngram',
                ],
                'assignment_ids': [],
            },
            {
                'week': 4,
                'topic': 'Midterm 1',
                'concept_ids': [
                    'c470-ngram',
                ],
                'assignment_ids': [
                    'sc4002-midterm1',
                ],
            },
            {
                'week': 5,
                'topic': 'CFG & Dependency Parsing',
                'concept_ids': [
                    'c470-cfg',
                ],
                'assignment_ids': [
                    'sc4002-hw3',
                ],
            },
            {
                'week': 6,
                'topic': 'Feed-Forward & RNNs',
                'concept_ids': [],
                'assignment_ids': [],
            },
            {
                'week': 7,
                'topic': 'Transformer Architecture',
                'concept_ids': [
                    'c470-transformer',
                ],
                'assignment_ids': [],
            },
            {
                'week': 8,
                'topic': 'Prompting & Final Exam',
                'concept_ids': [
                    'c470-transformer',
                    'c470-cfg',
                ],
                'assignment_ids': [
                    'sc4002-final',
                ],
            },
        ],
    },
]
