NOTES = [
    # ══════════════════════════════════════════════════════════════════
    # SC2002 — Object Oriented Design & Programming (12 notes)
    # ══════════════════════════════════════════════════════════════════
    {
        "id": "note-sc2002-1",
        "course_id": "sc2002",
        "title": "OCaml Pattern Matching & Recursion",
        "content": (
            "Pattern matching in OCaml allows destructuring data types directly in function "
            "definitions. Use `match expr with | pattern -> result` syntax. Recursive functions "
            "over lists follow the pattern: base case for empty list [], recursive case for "
            "hd::tl. Tail recursion avoids stack overflow by passing an accumulator. Key "
            "functions: List.map, List.fold_left, List.filter. Type inference means OCaml "
            "deduces types without explicit annotations in most cases."
        ),
        "created_at": "2026-02-05T14:30:00Z",
        "tags": ["ocaml", "pattern-matching", "recursion"],
        "week_number": 2,
    },
    {
        "id": "note-sc2002-2",
        "course_id": "sc2002",
        "title": "Higher-Order Functions & Closures",
        "content": (
            "Higher-order functions take functions as arguments or return them. In OCaml: "
            "`let apply f x = f x`. Map applies a function to every element: "
            "`List.map (fun x -> x*2) [1;2;3]` yields [2;4;6]. Fold accumulates a value: "
            "`List.fold_left (+) 0 [1;2;3]` yields 6. Closures capture their enclosing "
            "environment — a returned function remembers variables from its defining scope. "
            "Anonymous functions use `fun x -> expr` syntax. Partial application: "
            "`let add x y = x + y in let add5 = add 5` creates a new function."
        ),
        "created_at": "2026-02-12T10:00:00Z",
        "tags": ["ocaml", "higher-order-functions", "closures"],
        "week_number": 3,
    },
    {
        "id": "note-sc2002-3",
        "course_id": "sc2002",
        "title": "Type Inference & Polymorphism",
        "content": (
            "OCaml uses Hindley-Milner type inference to deduce types at compile time. "
            "Polymorphic types use type variables: `'a -> 'a` means any type goes in and "
            "the same type comes out. `'a list -> int` means a list of anything returns an int. "
            "Parametric polymorphism: one implementation works for all types. "
            "Ad-hoc polymorphism (overloading) is NOT supported in OCaml — use modules/functors. "
            "Type annotations are optional but useful for documentation: `let f (x: int) : int = x + 1`."
        ),
        "created_at": "2026-02-19T11:00:00Z",
        "tags": ["ocaml", "type-inference", "polymorphism"],
        "week_number": 4,
    },
    {
        "id": "note-sc2002-4",
        "course_id": "sc2002",
        "title": "Regular Expressions & Finite Automata",
        "content": (
            "Regular expressions describe regular languages. Operators: concatenation (ab), "
            "union (a|b), Kleene star (a*). Every regex has an equivalent NFA (Thompson's "
            "construction). NFAs can be converted to DFAs via subset construction. DFAs can be "
            "minimized using Hopcroft's algorithm. Pumping lemma proves a language is NOT "
            "regular. Context-free grammars (CFGs) are more expressive — they handle nested "
            "structures like balanced parentheses that regex cannot."
        ),
        "created_at": "2026-03-02T10:00:00Z",
        "tags": ["regex", "nfa", "dfa", "automata"],
        "week_number": 5,
    },
    {
        "id": "note-sc2002-5",
        "course_id": "sc2002",
        "title": "NFA to DFA Conversion (Subset Construction)",
        "content": (
            "Subset construction converts an NFA to an equivalent DFA. Each DFA state is a "
            "SET of NFA states. Start: epsilon-closure of NFA start state. For each DFA state "
            "and input symbol, compute the set of NFA states reachable. A DFA state is "
            "accepting if it contains any NFA accepting state. Worst case: 2^n DFA states for "
            "n NFA states (exponential blowup). In practice, most states are unreachable. "
            "The resulting DFA can then be minimized by merging equivalent states."
        ),
        "created_at": "2026-03-05T14:30:00Z",
        "tags": ["nfa", "dfa", "subset-construction"],
        "week_number": 6,
    },
    {
        "id": "note-sc2002-6",
        "course_id": "sc2002",
        "title": "Context-Free Grammars & Parsing",
        "content": (
            "A CFG is defined by (V, Σ, R, S) where V=variables, Σ=terminals, R=rules, S=start. "
            "Example: S → aSb | ε generates {aⁿbⁿ : n≥0}. Derivations can be leftmost or "
            "rightmost. Parse trees represent the structure of a derivation. A grammar is "
            "ambiguous if some string has multiple parse trees. Recursive descent parsing: "
            "write one function per nonterminal, each consuming tokens matching its productions. "
            "CFLs are closed under union, concatenation, and Kleene star but NOT intersection."
        ),
        "created_at": "2026-03-09T10:00:00Z",
        "tags": ["cfg", "parsing", "formal-languages"],
        "week_number": 7,
    },
    {
        "id": "note-sc2002-7",
        "course_id": "sc2002",
        "title": "Lambda Calculus Foundations",
        "content": (
            "Lambda calculus is a formal system for expressing computation. Syntax: "
            "variables (x), abstractions (λx.M), applications (M N). Beta-reduction: "
            "(λx.M) N → M[x:=N] (substitute N for x in M). Alpha-renaming avoids variable "
            "capture: λx.x and λy.y are alpha-equivalent. Church encodings represent data "
            "as functions: TRUE = λx.λy.x, FALSE = λx.λy.y, ZERO = λf.λx.x, "
            "SUCC = λn.λf.λx.f(n f x). Y combinator enables recursion without named functions."
        ),
        "created_at": "2026-03-16T14:00:00Z",
        "tags": ["lambda-calculus", "beta-reduction", "church-encoding"],
        "week_number": 8,
    },
    {
        "id": "note-sc2002-8",
        "course_id": "sc2002",
        "title": "Lambda Calculus: Reduction Strategies",
        "content": (
            "Call-by-value (CBV): evaluate argument before substitution — (λx.M) N reduces "
            "only when N is a value. Call-by-name (CBN): substitute argument without evaluating "
            "first. CBN may not terminate when CBV does (and vice versa). Normal-order: always "
            "reduce leftmost-outermost redex first — guaranteed to find normal form if one exists. "
            "Church-Rosser theorem: if M reduces to both N₁ and N₂, there exists some N₃ "
            "reachable from both. This means normal forms are unique (up to alpha-equivalence)."
        ),
        "created_at": "2026-03-23T10:00:00Z",
        "tags": ["lambda-calculus", "reduction-strategies", "evaluation"],
        "week_number": 9,
    },
    {
        "id": "note-sc2002-9",
        "course_id": "sc2002",
        "title": "Rust Ownership & Borrowing",
        "content": (
            "Rust enforces memory safety without garbage collection through ownership rules: "
            "1) Each value has exactly one owner. 2) When the owner goes out of scope, the "
            "value is dropped. 3) You can have either one mutable reference OR any number of "
            "immutable references. Borrowing (&T for shared, &mut T for exclusive) allows "
            "temporary access without transferring ownership. Lifetimes ('a) ensure references "
            "don't outlive the data they point to. The borrow checker enforces all of this at "
            "compile time."
        ),
        "created_at": "2026-04-01T09:15:00Z",
        "tags": ["rust", "ownership", "borrowing", "lifetimes"],
        "week_number": 11,
    },
    {
        "id": "note-sc2002-10",
        "course_id": "sc2002",
        "title": "Rust Structs, Enums & Pattern Matching",
        "content": (
            "Structs group related data: `struct Point { x: f64, y: f64 }`. Enums define "
            "variants: `enum Shape { Circle(f64), Rect(f64, f64) }`. Match expressions "
            "destructure enums: `match s { Circle(r) => ..., Rect(w,h) => ... }`. Must be "
            "exhaustive — all variants handled. Option<T> = Some(T) | None replaces null. "
            "Result<T,E> = Ok(T) | Err(E) for error handling. The ? operator propagates errors: "
            "`let val = risky_fn()?;` returns Err early if it fails."
        ),
        "created_at": "2026-03-30T14:00:00Z",
        "tags": ["rust", "structs", "enums", "pattern-matching"],
        "week_number": 10,
    },
    {
        "id": "note-sc2002-11",
        "course_id": "sc2002",
        "title": "Rust Lifetimes & Error Handling",
        "content": (
            "Lifetime annotations tell the compiler how long references live. Syntax: "
            "`fn longest<'a>(x: &'a str, y: &'a str) -> &'a str`. The returned reference "
            "lives as long as the shorter of x and y. Struct lifetimes: "
            "`struct Excerpt<'a> { part: &'a str }`. Lifetime elision rules handle common "
            "cases automatically. Error handling: panic! for unrecoverable errors, "
            "Result<T,E> for recoverable ones. unwrap() panics on Err, expect() adds a message. "
            "The ? operator is idiomatic for propagating errors up the call stack."
        ),
        "created_at": "2026-04-07T10:00:00Z",
        "tags": ["rust", "lifetimes", "error-handling"],
        "week_number": 12,
    },
    {
        "id": "note-sc2002-12",
        "course_id": "sc2002",
        "title": "Rust Traits & Generics",
        "content": (
            "Traits define shared behavior: `trait Summary { fn summarize(&self) -> String; }`. "
            "Implement for types: `impl Summary for Article { ... }`. Trait bounds constrain "
            "generics: `fn notify<T: Summary>(item: &T)` or `fn notify(item: &impl Summary)`. "
            "Multiple bounds: `T: Summary + Display`. Where clause for readability: "
            "`fn f<T>(t: &T) where T: Summary + Clone`. Common traits: Debug, Clone, Copy, "
            "PartialEq, Eq, Hash, Iterator. Derive macros auto-implement: `#[derive(Debug, Clone)]`."
        ),
        "created_at": "2026-04-09T14:00:00Z",
        "tags": ["rust", "traits", "generics"],
        "week_number": 13,
    },

    # ══════════════════════════════════════════════════════════════════
    # MH2802 — Linear Algebra (13 notes)
    # ══════════════════════════════════════════════════════════════════
    {
        "id": "note-mh2802-1",
        "course_id": "mh2802",
        "title": "Vectors in Rⁿ & Dot Product",
        "content": (
            "A vector in Rⁿ is an ordered n-tuple. Addition: component-wise. Scalar mult: "
            "multiply each component. Dot product: u·v = Σuᵢvᵢ. Properties: commutative, "
            "distributive, u·u = ||u||². Cauchy-Schwarz: |u·v| ≤ ||u|| ||v||. Two vectors "
            "are orthogonal iff u·v = 0. Geometric interpretation: u·v = ||u|| ||v|| cos θ. "
            "Projection of u onto v: projᵥu = (u·v / v·v) v."
        ),
        "created_at": "2026-02-03T11:00:00Z",
        "tags": ["vectors", "dot-product", "projection"],
        "week_number": 1,
    },
    {
        "id": "note-mh2802-2",
        "course_id": "mh2802",
        "title": "Systems of Linear Equations & Row Reduction",
        "content": (
            "A system Ax = b can be represented as an augmented matrix [A|b]. Row operations: "
            "swap rows, scale a row, add a multiple of one row to another. Gaussian elimination "
            "produces row echelon form (REF). Gauss-Jordan produces reduced REF (RREF). "
            "Pivot positions determine the rank. Free variables correspond to non-pivot columns. "
            "Solutions: unique (no free vars), infinite (free vars), or none (inconsistent row 0=c)."
        ),
        "created_at": "2026-02-05T13:00:00Z",
        "tags": ["systems", "row-reduction", "gaussian-elimination"],
        "week_number": 2,
    },
    {
        "id": "note-mh2802-3",
        "course_id": "mh2802",
        "title": "Matrix Operations & Inverses",
        "content": (
            "Matrix multiplication: (AB)ᵢⱼ = Σ aᵢₖbₖⱼ. NOT commutative (AB ≠ BA in general). "
            "Transpose: (Aᵀ)ᵢⱼ = Aⱼᵢ. Properties: (AB)ᵀ = BᵀAᵀ. Inverse: AA⁻¹ = A⁻¹A = I. "
            "Finding A⁻¹: row reduce [A|I] → [I|A⁻¹]. A is invertible iff det(A) ≠ 0 iff "
            "rank(A) = n iff Ax=0 has only trivial solution. (AB)⁻¹ = B⁻¹A⁻¹."
        ),
        "created_at": "2026-02-10T11:00:00Z",
        "tags": ["matrices", "inverse", "transpose"],
        "week_number": 3,
    },
    {
        "id": "note-mh2802-4",
        "course_id": "mh2802",
        "title": "Determinants",
        "content": (
            "For 2×2: det = ad - bc. For n×n: cofactor expansion along any row/column. "
            "Properties: det(AB) = det(A)det(B). det(Aᵀ) = det(A). Swapping rows negates det. "
            "Scaling a row scales det. det(A) = 0 iff A is singular. Row operations on the "
            "augmented matrix track sign changes. Cramer's rule: xᵢ = det(Aᵢ)/det(A) where "
            "Aᵢ replaces column i with b. Geometric: |det(A)| = volume of parallelepiped."
        ),
        "created_at": "2026-02-17T13:00:00Z",
        "tags": ["determinants", "cofactor", "cramers-rule"],
        "week_number": 4,
    },
    {
        "id": "note-mh2802-5",
        "course_id": "mh2802",
        "title": "Vector Spaces & Subspaces",
        "content": (
            "A vector space V over field F satisfies closure under addition and scalar "
            "multiplication, plus 8 axioms (commutativity, associativity, identity, inverse, "
            "etc.). A subspace W of V must: contain the zero vector, be closed under addition, "
            "and be closed under scalar multiplication. Column space Col(A) = span of columns "
            "of A. Null space Nul(A) = {x : Ax = 0}. Row space Row(A) = span of rows. "
            "Examples of vector spaces: Rⁿ, polynomials of degree ≤ n, continuous functions."
        ),
        "created_at": "2026-02-20T11:00:00Z",
        "tags": ["vector-spaces", "subspaces", "axioms"],
        "week_number": 5,
    },
    {
        "id": "note-mh2802-6",
        "course_id": "mh2802",
        "title": "Basis, Dimension & Rank-Nullity",
        "content": (
            "A basis is a linearly independent spanning set. Dimension = number of vectors "
            "in any basis. Standard basis for Rⁿ: {e₁, ..., eₙ}. Finding a basis for Col(A): "
            "pivot columns of A. Basis for Nul(A): solve Ax=0, express free variables. "
            "Rank = dim(Col(A)) = number of pivots. Nullity = dim(Nul(A)) = number of free vars. "
            "Rank-Nullity Theorem: rank(A) + nullity(A) = n (number of columns)."
        ),
        "created_at": "2026-03-03T11:00:00Z",
        "tags": ["basis", "dimension", "rank-nullity"],
        "week_number": 6,
    },
    {
        "id": "note-mh2802-7",
        "course_id": "mh2802",
        "title": "Null Space & Column Space Applications",
        "content": (
            "Null space Nul(A) = solution set of Ax=0. It's always a subspace of Rⁿ. "
            "To find Nul(A): row reduce A, express solution in parametric vector form. "
            "Column space Col(A) = {b : Ax=b is consistent} = subspace of Rᵐ. "
            "Col(A) = span of pivot columns of the ORIGINAL matrix (not RREF). "
            "Ax=b is consistent iff b ∈ Col(A). The left null space Nul(Aᵀ) is orthogonal "
            "complement of Col(A). These four fundamental subspaces fully describe A."
        ),
        "created_at": "2026-03-05T13:00:00Z",
        "tags": ["null-space", "column-space", "fundamental-subspaces"],
        "week_number": 7,
    },
    {
        "id": "note-mh2802-8",
        "course_id": "mh2802",
        "title": "Linear Transformations",
        "content": (
            "A linear transformation T: V → W satisfies T(u+v) = T(u)+T(v) and T(cv) = cT(v). "
            "Every linear transformation from Rⁿ to Rᵐ can be represented as matrix "
            "multiplication T(x) = Ax. The kernel (null space) of T is {v : T(v) = 0}. "
            "The image (range) of T is {T(v) : v in V}. Rank-nullity theorem: "
            "dim(kernel) + dim(image) = dim(domain). Invertible iff kernel = {0}."
        ),
        "created_at": "2026-03-10T10:30:00Z",
        "tags": ["linear-transformations", "kernel", "image"],
        "week_number": 8,
    },
    {
        "id": "note-mh2802-9",
        "course_id": "mh2802",
        "title": "Kernel, Image & Composition",
        "content": (
            "Kernel of T = Nul(A) where A is the standard matrix. Image of T = Col(A). "
            "T is one-to-one iff ker(T) = {0} iff columns of A are linearly independent. "
            "T is onto iff im(T) = Rᵐ iff every b has a solution. Composition: if T₁ has "
            "matrix A and T₂ has matrix B, then T₂ ∘ T₁ has matrix BA (note the order). "
            "T is invertible iff A is invertible iff T is both one-to-one and onto."
        ),
        "created_at": "2026-03-17T11:00:00Z",
        "tags": ["kernel", "image", "composition", "invertibility"],
        "week_number": 9,
    },
    {
        "id": "note-mh2802-10",
        "course_id": "mh2802",
        "title": "Eigenvalues & Eigenvectors",
        "content": (
            "Eigenvalue equation: Av = λv where A is n×n, v ≠ 0. Find eigenvalues by solving "
            "det(A - λI) = 0 (characteristic polynomial). For each eigenvalue λ, the "
            "eigenspace is Nul(A - λI). A matrix is diagonalizable if it has n linearly "
            "independent eigenvectors: A = PDP⁻¹ where D is diagonal with eigenvalues and P "
            "has eigenvectors as columns. Symmetric matrices always have real eigenvalues and "
            "orthogonal eigenvectors."
        ),
        "created_at": "2026-03-25T13:00:00Z",
        "tags": ["eigenvalues", "eigenvectors", "characteristic-polynomial"],
        "week_number": 10,
    },
    {
        "id": "note-mh2802-11",
        "course_id": "mh2802",
        "title": "Eigenspaces & Multiplicity",
        "content": (
            "Algebraic multiplicity of λ = its multiplicity as a root of the characteristic "
            "polynomial. Geometric multiplicity = dim(eigenspace) = dim(Nul(A - λI)). "
            "Always: 1 ≤ geometric mult ≤ algebraic mult. If geometric = algebraic for all "
            "eigenvalues, A is diagonalizable. Distinct eigenvalues always give linearly "
            "independent eigenvectors. An n×n matrix with n distinct eigenvalues is always "
            "diagonalizable. Complex eigenvalues come in conjugate pairs for real matrices."
        ),
        "created_at": "2026-04-01T11:00:00Z",
        "tags": ["eigenspaces", "multiplicity", "diagonalizability"],
        "week_number": 11,
    },
    {
        "id": "note-mh2802-12",
        "course_id": "mh2802",
        "title": "Diagonalization",
        "content": (
            "A = PDP⁻¹ where D = diag(λ₁,...,λₙ) and P = [v₁|...|vₙ]. Steps: "
            "1) Find eigenvalues from det(A-λI)=0. 2) Find eigenvectors for each. "
            "3) Check if you have n linearly independent eigenvectors. 4) Form P and D. "
            "Application: Aⁿ = PDⁿP⁻¹ makes computing matrix powers trivial. "
            "Discrete dynamical systems: xₖ = Aᵏx₀ = PDᵏP⁻¹x₀. Dominant eigenvalue "
            "determines long-term behavior."
        ),
        "created_at": "2026-04-08T13:00:00Z",
        "tags": ["diagonalization", "matrix-powers", "dynamical-systems"],
        "week_number": 12,
    },
    {
        "id": "note-mh2802-13",
        "course_id": "mh2802",
        "title": "Orthogonality & Gram-Schmidt",
        "content": (
            "Orthogonal vectors: u·v = 0. Orthogonal set: all pairs orthogonal. Orthonormal: "
            "orthogonal and all unit length. Orthogonal projection: projW(y) = Σ (y·uᵢ/uᵢ·uᵢ)uᵢ. "
            "Gram-Schmidt process converts any basis to an orthogonal basis: "
            "v₁ = u₁, v₂ = u₂ - projv₁(u₂), v₃ = u₃ - projv₁(u₃) - projv₂(u₃), etc. "
            "QR factorization: A = QR where Q is orthogonal and R is upper triangular. "
            "Spectral theorem: symmetric matrices are orthogonally diagonalizable."
        ),
        "created_at": "2026-04-10T11:00:00Z",
        "tags": ["orthogonality", "gram-schmidt", "qr-factorization"],
        "week_number": 14,
    },
]
