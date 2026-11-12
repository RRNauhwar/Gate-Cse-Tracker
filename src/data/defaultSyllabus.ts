import { Subject } from '../types';

export const defaultSubjects: Subject[] = [
  {
    id: 'em',
    name: 'Engineering Mathematics',
    code: 'MATH',
    color: 'indigo',
    icon: 'Sigma',
    units: [
      {
        id: 'em-la',
        name: 'Linear Algebra',
        topics: [
          { id: 'em-1', name: 'Matrices & Determinants', status: 'not_started', weightage: 'high' },
          { id: 'em-2', name: 'Systems of Linear Equations', status: 'not_started', weightage: 'high' },
          { id: 'em-3', name: 'Eigenvalues and Eigenvectors', status: 'not_started', weightage: 'high' },
          { id: 'em-4', name: 'LU Decomposition & Vector Spaces', status: 'not_started', weightage: 'medium' }
        ]
      },
      {
        id: 'em-calc',
        name: 'Calculus',
        topics: [
          { id: 'em-5', name: 'Limits, Continuity & Differentiability', status: 'not_started', weightage: 'medium' },
          { id: 'em-6', name: 'Maxima and Minima (Single & Multivariable)', status: 'not_started', weightage: 'high' },
          { id: 'em-7', name: 'Mean Value Theorems & Definite Integrals', status: 'not_started', weightage: 'medium' }
        ]
      },
      {
        id: 'em-prob',
        name: 'Probability & Statistics',
        topics: [
          { id: 'em-8', name: 'Conditional Probability & Bayes Theorem', status: 'not_started', weightage: 'high' },
          { id: 'em-9', name: 'Random Variables & Expectation', status: 'not_started', weightage: 'high' },
          { id: 'em-10', name: 'Distributions (Binomial, Poisson, Normal, Exponential)', status: 'not_started', weightage: 'high' }
        ]
      }
    ]
  },
  {
    id: 'dm',
    name: 'Discrete Mathematics',
    code: 'DM',
    color: 'blue',
    icon: 'Binary',
    units: [
      {
        id: 'dm-logic',
        name: 'Mathematical Logic',
        topics: [
          { id: 'dm-1', name: 'Propositional Logic & Equivalence', status: 'not_started', weightage: 'high' },
          { id: 'dm-2', name: 'First-Order Predicate Logic & Quantifiers', status: 'not_started', weightage: 'high' },
          { id: 'dm-3', name: 'Rules of Inference & Validity', status: 'not_started', weightage: 'medium' }
        ]
      },
      {
        id: 'dm-set',
        name: 'Sets, Relations & Functions',
        topics: [
          { id: 'dm-4', name: 'Equivalence Relations & Partitions', status: 'not_started', weightage: 'high' },
          { id: 'dm-5', name: 'Partial Orders, Lattices & Hasse Diagrams', status: 'not_started', weightage: 'high' },
          { id: 'dm-6', name: 'Functions, Invertibility & Pigeonhole Principle', status: 'not_started', weightage: 'medium' }
        ]
      },
      {
        id: 'dm-comb',
        name: 'Combinatorics & Graph Theory',
        topics: [
          { id: 'dm-7', name: 'Permutations, Combinations & Counting', status: 'not_started', weightage: 'high' },
          { id: 'dm-8', name: 'Recurrence Relations & Generating Functions', status: 'not_started', weightage: 'high' },
          { id: 'dm-9', name: 'Graph Connectivity, Trees & Coloring', status: 'not_started', weightage: 'high' },
          { id: 'dm-10', name: 'Euler and Hamiltonian Graphs, Planarity', status: 'not_started', weightage: 'high' }
        ]
      }
    ]
  },
  {
    id: 'dld',
    name: 'Digital Logic Design',
    code: 'DLD',
    color: 'cyan',
    icon: 'Cpu',
    units: [
      {
        id: 'dld-bool',
        name: 'Boolean Algebra & Minimization',
        topics: [
          { id: 'dld-1', name: 'Boolean Functions, Canonical Forms & Minterms', status: 'not_started', weightage: 'medium' },
          { id: 'dld-2', name: 'Karnaugh Maps (K-Map) Simplification', status: 'not_started', weightage: 'high' },
          { id: 'dld-3', name: 'Number Representations & 2s Complement Arithmetic', status: 'not_started', weightage: 'medium' }
        ]
      },
      {
        id: 'dld-comb',
        name: 'Combinational & Sequential Circuits',
        topics: [
          { id: 'dld-4', name: 'Multiplexers, Decoders & Adders', status: 'not_started', weightage: 'high' },
          { id: 'dld-5', name: 'Latches, Flip-Flops (SR, JK, D, T) & Timing', status: 'not_started', weightage: 'high' },
          { id: 'dld-6', name: 'Synchronous & Asynchronous Counters', status: 'not_started', weightage: 'high' },
          { id: 'dld-7', name: 'Shift Registers & Finite State Machines', status: 'not_started', weightage: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'coa',
    name: 'Computer Organization & Architecture',
    code: 'COA',
    color: 'emerald',
    icon: 'Server',
    units: [
      {
        id: 'coa-cpu',
        name: 'CPU & Instruction Pipeline',
        topics: [
          { id: 'coa-1', name: 'Machine Instructions & Addressing Modes', status: 'not_started', weightage: 'high' },
          { id: 'coa-2', name: 'ALU, Data Path & Control Unit (Hardwired vs Microprogrammed)', status: 'not_started', weightage: 'medium' },
          { id: 'coa-3', name: 'Instruction Pipelining & Pipeline Hazards', status: 'not_started', weightage: 'high' }
        ]
      },
      {
        id: 'coa-mem',
        name: 'Memory Hierarchy & I/O',
        topics: [
          { id: 'coa-4', name: 'Cache Memory Mapping (Direct, Associative, Set-Associative)', status: 'not_started', weightage: 'high' },
          { id: 'coa-5', name: 'Cache Replacement & Write Policies', status: 'not_started', weightage: 'high' },
          { id: 'coa-6', name: 'Main Memory, Virtual Memory & TLB', status: 'not_started', weightage: 'high' },
          { id: 'coa-7', name: 'Interrupts & Direct Memory Access (DMA)', status: 'not_started', weightage: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'dsa',
    name: 'Programming & Data Structures',
    code: 'DSA',
    color: 'teal',
    icon: 'Code2',
    units: [
      {
        id: 'dsa-c',
        name: 'Programming in C',
        topics: [
          { id: 'dsa-1', name: 'Pointers, Arrays & Dynamic Memory Allocation', status: 'not_started', weightage: 'high' },
          { id: 'dsa-2', name: 'Recursion, Parameter Passing & Scoping', status: 'not_started', weightage: 'high' },
          { id: 'dsa-3', name: 'Structures, Unions & File I/O', status: 'not_started', weightage: 'medium' }
        ]
      },
      {
        id: 'dsa-struct',
        name: 'Linear & Non-Linear Structures',
        topics: [
          { id: 'dsa-4', name: 'Stacks, Queues & Evaluation of Expressions', status: 'not_started', weightage: 'high' },
          { id: 'dsa-5', name: 'Linked Lists (Singly, Doubly, Circular)', status: 'not_started', weightage: 'medium' },
          { id: 'dsa-6', name: 'Binary Trees, BST & AVL Trees', status: 'not_started', weightage: 'high' },
          { id: 'dsa-7', name: 'Binary Heaps, Priority Queues & Hashing', status: 'not_started', weightage: 'high' }
        ]
      }
    ]
  },
  {
    id: 'algo',
    name: 'Algorithms',
    code: 'ALGO',
    color: 'amber',
    icon: 'Sparkles',
    units: [
      {
        id: 'algo-asymp',
        name: 'Asymptotic Analysis & Sorting',
        topics: [
          { id: 'algo-1', name: 'Asymptotic Notations (Big-O, Omega, Theta)', status: 'not_started', weightage: 'high' },
          { id: 'algo-2', name: 'Divide & Conquer & Master Theorem', status: 'not_started', weightage: 'high' },
          { id: 'algo-3', name: 'Comparison Sorts, QuickSort, MergeSort, HeapSort', status: 'not_started', weightage: 'high' }
        ]
      },
      {
        id: 'algo-design',
        name: 'Algorithm Design Paradigms',
        topics: [
          { id: 'algo-4', name: 'Greedy Techniques (Huffman, MST Kruskal & Prim)', status: 'not_started', weightage: 'high' },
          { id: 'algo-5', name: 'Dynamic Programming (LCS, Matrix Chain, 0/1 Knapsack)', status: 'not_started', weightage: 'high' },
          { id: 'algo-6', name: 'Graph Algorithms (BFS, DFS, Dijkstra, Bellman-Ford)', status: 'not_started', weightage: 'high' },
          { id: 'algo-7', name: 'P, NP, NP-Complete & NP-Hard Concepts', status: 'not_started', weightage: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'toc',
    name: 'Theory of Computation',
    code: 'TOC',
    color: 'orange',
    icon: 'CpuIcon',
    units: [
      {
        id: 'toc-reg',
        name: 'Regular Languages & Finite Automata',
        topics: [
          { id: 'toc-1', name: 'DFA, NFA & Conversion / Minimization', status: 'not_started', weightage: 'high' },
          { id: 'toc-2', name: 'Regular Expressions & Pumping Lemma for Regular Languages', status: 'not_started', weightage: 'high' },
          { id: 'toc-3', name: 'Closure & Decidability Properties of Regular Languages', status: 'not_started', weightage: 'high' }
        ]
      },
      {
        id: 'toc-cfl',
        name: 'Context-Free Languages & Pushdown Automata',
        topics: [
          { id: 'toc-4', name: 'Context-Free Grammars, Ambiguity & Normal Forms', status: 'not_started', weightage: 'high' },
          { id: 'toc-5', name: 'Pushdown Automata (DPDA vs NPDA)', status: 'not_started', weightage: 'high' },
          { id: 'toc-6', name: 'Closure & Decidability of CFLs', status: 'not_started', weightage: 'high' }
        ]
      },
      {
        id: 'toc-turing',
        name: 'Turing Machines & Decidability',
        topics: [
          { id: 'toc-7', name: 'Turing Machines, Recursive & RE Languages', status: 'not_started', weightage: 'high' },
          { id: 'toc-8', name: 'Halting Problem, Rice Theorem & Undecidability', status: 'not_started', weightage: 'high' }
        ]
      }
    ]
  },
  {
    id: 'cd',
    name: 'Compiler Design',
    code: 'CD',
    color: 'rose',
    icon: 'FileCode',
    units: [
      {
        id: 'cd-parse',
        name: 'Lexical Analysis & Parsing',
        topics: [
          { id: 'cd-1', name: 'Lexical Analysis & Regular Expression Tokenization', status: 'not_started', weightage: 'medium' },
          { id: 'cd-2', name: 'Top-Down Parsing (LL(1), FIRST & FOLLOW)', status: 'not_started', weightage: 'high' },
          { id: 'cd-3', name: 'Bottom-Up Parsing (LR(0), SLR(1), CLR(1), LALR(1))', status: 'not_started', weightage: 'high' }
        ]
      },
      {
        id: 'cd-trans',
        name: 'Syntax Directed Translation & Code Generation',
        topics: [
          { id: 'cd-4', name: 'Syntax-Directed Translation (S-attributed, L-attributed)', status: 'not_started', weightage: 'high' },
          { id: 'cd-5', name: 'Intermediate Code Generation (Three-Address Code)', status: 'not_started', weightage: 'medium' },
          { id: 'cd-6', name: 'Control Flow Graphs, Basic Blocks & Code Optimization', status: 'not_started', weightage: 'high' }
        ]
      }
    ]
  },
  {
    id: 'os',
    name: 'Operating Systems',
    code: 'OS',
    color: 'purple',
    icon: 'Terminal',
    units: [
      {
        id: 'os-proc',
        name: 'Processes & Concurrency',
        topics: [
          { id: 'os-1', name: 'Process States, PCB, Context Switching & System Calls', status: 'not_started', weightage: 'medium' },
          { id: 'os-2', name: 'CPU Scheduling Algorithms (FCFS, SJF, SRTF, RR, Priority)', status: 'not_started', weightage: 'high' },
          { id: 'os-3', name: 'Process Synchronization, Semaphores & Critical Section', status: 'not_started', weightage: 'high' },
          { id: 'os-4', name: 'Classical Sync Problems (Producer-Consumer, Dining Philosophers)', status: 'not_started', weightage: 'high' },
          { id: 'os-5', name: 'Deadlock Detection, Prevention & Bankers Algorithm', status: 'not_started', weightage: 'high' }
        ]
      },
      {
        id: 'os-mem',
        name: 'Memory Management & File Systems',
        topics: [
          { id: 'os-6', name: 'Paging, Segmentation, Multi-level Paging & Inverted Tables', status: 'not_started', weightage: 'high' },
          { id: 'os-7', name: 'Virtual Memory, Page Replacement (FIFO, LRU, Optimal)', status: 'not_started', weightage: 'high' },
          { id: 'os-8', name: 'Disk Scheduling Algorithms (SCAN, C-SCAN, LOOK, SSTF)', status: 'not_started', weightage: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'dbms',
    name: 'Databases (DBMS)',
    code: 'DBMS',
    color: 'sky',
    icon: 'Database',
    units: [
      {
        id: 'dbms-rel',
        name: 'Relational Model & SQL',
        topics: [
          { id: 'dbms-1', name: 'ER Diagrams to Relational Schema Mapping', status: 'not_started', weightage: 'medium' },
          { id: 'dbms-2', name: 'Relational Algebra & Tuple Relational Calculus', status: 'not_started', weightage: 'high' },
          { id: 'dbms-3', name: 'SQL Queries, Joins, Aggregations & Nested Subqueries', status: 'not_started', weightage: 'high' }
        ]
      },
      {
        id: 'dbms-norm',
        name: 'Normalization & Transactions',
        topics: [
          { id: 'dbms-4', name: 'Functional Dependencies & Normal Forms (1NF, 2NF, 3NF, BCNF)', status: 'not_started', weightage: 'high' },
          { id: 'dbms-5', name: 'Lossless Decomposition & Dependency Preservation', status: 'not_started', weightage: 'high' },
          { id: 'dbms-6', name: 'Transaction ACID Properties & Schedules (Conflict / View Serializability)', status: 'not_started', weightage: 'high' },
          { id: 'dbms-7', name: 'Concurrency Control (2PL, Timestamp Ordering, Deadlocks)', status: 'not_started', weightage: 'high' },
          { id: 'dbms-8', name: 'File Organization, B-Trees & B+ Tree Indexing', status: 'not_started', weightage: 'high' }
        ]
      }
    ]
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    code: 'CN',
    color: 'emerald',
    icon: 'Network',
    units: [
      {
        id: 'cn-layer',
        name: 'Data Link & Network Layers',
        topics: [
          { id: 'cn-1', name: 'Framing, Error Detection (CRC, Checksum, Parity)', status: 'not_started', weightage: 'high' },
          { id: 'cn-2', name: 'Flow Control: Stop-and-Wait, Go-Back-N, Selective Repeat', status: 'not_started', weightage: 'high' },
          { id: 'cn-3', name: 'IPv4 Addressing, Subnetting, CIDR & Supernetting', status: 'not_started', weightage: 'high' },
          { id: 'cn-4', name: 'Routing Protocols: Distance Vector, Link State, OSPF, BGP', status: 'not_started', weightage: 'high' }
        ]
      },
      {
        id: 'cn-trans',
        name: 'Transport & Application Layers',
        topics: [
          { id: 'cn-5', name: 'TCP Header, 3-Way Handshake, Flow Control & Window Sizing', status: 'not_started', weightage: 'high' },
          { id: 'cn-6', name: 'TCP Congestion Control (Slow Start, Congestion Avoidance)', status: 'not_started', weightage: 'high' },
          { id: 'cn-7', name: 'UDP Protocol & Socket Addressing', status: 'not_started', weightage: 'medium' },
          { id: 'cn-8', name: 'Application Protocols: DNS, HTTP, SMTP, FTP, DHCP', status: 'not_started', weightage: 'medium' }
        ]
      }
    ]
  }
];
