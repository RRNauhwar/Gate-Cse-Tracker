import { TestSeries } from '../types';

export const sampleTests: TestSeries[] = [
  {
    id: 'test-cs-mini-1',
    title: 'GATE CS Mini Mock 1: Core Fundamentals',
    description: 'A 5-question comprehensive test covering Algorithms, Discrete Mathematics, Operating Systems, and Digital Logic with MCQ, MSQ, and NAT questions.',
    subjectName: 'Core Computer Science',
    durationMinutes: 20,
    totalMarks: 9,
    questions: [
      {
        id: 'q1',
        type: 'MCQ',
        subjectId: 'algo',
        subjectName: 'Algorithms',
        topic: 'Asymptotic Analysis',
        marks: 1,
        negativeMarks: 0.33,
        questionText: 'Consider the recurrence relation:\nT(n) = 2T(n/2) + n \\log n, with T(1) = 1.\nWhich one of the following is the tight asymptotic bound for T(n)?',
        options: [
          { id: 'A', text: 'Θ(n log n)' },
          { id: 'B', text: 'Θ(n log² n)' },
          { id: 'C', text: 'Θ(n²)' },
          { id: 'D', text: 'Θ(n² log n)' }
        ],
        correctOptions: ['B'],
        explanation: 'By applying Master Theorem Case 2 extension (or recursion tree):\nHere a = 2, b = 2, f(n) = n log n.\nn^(log_b a) = n^(log_2 2) = n^1.\nSince f(n) = Θ(n^(log_b a) * log^k n) where k = 1,\nwe have T(n) = Θ(n^(log_b a) * log^(k+1) n) = Θ(n log² n).'
      },
      {
        id: 'q2',
        type: 'MSQ',
        subjectId: 'os',
        subjectName: 'Operating Systems',
        topic: 'Concurrency & Deadlocks',
        marks: 2,
        negativeMarks: 0,
        questionText: 'Which of the following conditions are NECESSARY for a deadlock to occur in a concurrent system? (Select all that apply)',
        options: [
          { id: 'A', text: 'Mutual Exclusion: At least one resource must be held in a non-shareable mode.' },
          { id: 'B', text: 'Preemption: Resources can be forcibly taken away from a process holding them.' },
          { id: 'C', text: 'Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources.' },
          { id: 'D', text: 'Circular Wait: A closed chain of processes exists such that each process holds a resource needed by the next.' }
        ],
        correctOptions: ['A', 'C', 'D'],
        explanation: 'Coffman deadlock conditions require: (1) Mutual Exclusion, (2) Hold and Wait, (3) NO Preemption (resources CANNOT be preempted), and (4) Circular Wait. Therefore, option B (Preemption) is incorrect because non-preemption is required.'
      },
      {
        id: 'q3',
        type: 'NAT',
        subjectId: 'dld',
        subjectName: 'Digital Logic Design',
        topic: 'K-Map & Boolean Minimization',
        marks: 2,
        negativeMarks: 0,
        questionText: 'Consider a 4-variable Boolean function f(A, B, C, D) given by the minterms:\n∑m(0, 1, 2, 4, 5, 6, 8, 9, 12, 13, 14).\nHow many essential prime implicants (EPIs) does this function have?',
        natRange: { min: 2, max: 2 },
        explanation: 'Plotting minterms on a 4-variable K-Map:\n- Prime implicants include:\n  1. Group of 8 minterms: (0, 1, 4, 5, 8, 9, 12, 13) -> C\'\n  2. Group of 4 minterms: (0, 2, 4, 6) -> A\' D\'\n  3. Group of 4 minterms: (4, 6, 12, 14) -> B D\'\n- Checking essentiality:\n  - Minterms 8, 9 are covered ONLY by C\', making C\' an EPI.\n  - Minterm 2 is covered ONLY by A\' D\', making A\' D\' an EPI.\n  - Minterm 14 can be covered by B D\'.\nTotal Essential Prime Implicants = 2 (namely C\' and A\' D\').'
      },
      {
        id: 'q4',
        type: 'MCQ',
        subjectId: 'dm',
        subjectName: 'Discrete Mathematics',
        topic: 'Graph Theory',
        marks: 2,
        negativeMarks: 0.67,
        questionText: 'Let G be a simple connected planar graph with 20 vertices and each face is bounded by at least 3 edges. If the number of edges in G is 30, what is the number of faces in G?',
        options: [
          { id: 'A', text: '10' },
          { id: 'B', text: '11' },
          { id: 'C', text: '12' },
          { id: 'D', text: '14' }
        ],
        correctOptions: ['C'],
        explanation: 'By Euler\'s formula for connected planar graphs:\nV - E + F = 2\nGiven V = 20, E = 30:\n20 - 30 + F = 2  =>  -10 + F = 2  =>  F = 12.'
      },
      {
        id: 'q5',
        type: 'NAT',
        subjectId: 'coa',
        subjectName: 'Computer Organization & Architecture',
        topic: 'Cache Memory',
        marks: 2,
        negativeMarks: 0,
        questionText: 'A direct-mapped cache has 64 cache blocks with 32 bytes per block. The main memory is byte-addressable with a 16-bit address space. How many bits are used for the TAG field?',
        natRange: { min: 5, max: 5 },
        explanation: '1. Block size = 32 bytes = 2^5 bytes  =>  Block offset = 5 bits.\n2. Number of cache lines/blocks = 64 = 2^6  =>  Index = 6 bits.\n3. Total physical address length = 16 bits.\nTag bits = Total address bits - (Index bits + Offset bits)\nTag = 16 - (6 + 5) = 16 - 11 = 5 bits.'
      }
    ]
  },
  {
    id: 'test-cs-algo-ds',
    title: 'GATE CS Subject Test: Data Structures & Algorithms',
    description: 'Focused test on trees, graphs, sorting, dynamic programming, and complexity analysis.',
    subjectName: 'Programming, DS & Algorithms',
    durationMinutes: 25,
    totalMarks: 8,
    questions: [
      {
        id: 'q-ds-1',
        type: 'MCQ',
        subjectId: 'dsa',
        subjectName: 'Programming & Data Structures',
        topic: 'Binary Search Trees',
        marks: 1,
        negativeMarks: 0.33,
        questionText: 'The preorder traversal of a Binary Search Tree (BST) is: 30, 20, 10, 25, 40, 35, 50.\nWhat is the postorder traversal of this BST?',
        options: [
          { id: 'A', text: '10, 25, 20, 35, 50, 40, 30' },
          { id: 'B', text: '10, 20, 25, 35, 40, 50, 30' },
          { id: 'C', text: '25, 10, 20, 50, 35, 40, 30' },
          { id: 'D', text: '10, 25, 35, 20, 50, 40, 30' }
        ],
        correctOptions: ['A'],
        explanation: 'For a BST, inorder traversal is always sorted:\nInorder = 10, 20, 25, 30, 35, 40, 50.\nGiven Preorder = 30, 20, 10, 25, 40, 35, 50:\nRoot is 30.\nLeft subtree: Inorder {10, 20, 25}, Preorder {20, 10, 25}.\nRight subtree: Inorder {35, 40, 50}, Preorder {40, 35, 50}.\nPostorder traversal (Left, Right, Root) yields:\nLeft: 10, 25, 20; Right: 35, 50, 40; Root: 30.\nCombined: 10, 25, 20, 35, 50, 40, 30.'
      },
      {
        id: 'q-ds-2',
        type: 'NAT',
        subjectId: 'algo',
        subjectName: 'Algorithms',
        topic: 'Graph Algorithms',
        marks: 2,
        negativeMarks: 0,
        questionText: 'A connected undirected weighted graph G has 7 vertices and 12 edges. What is the exact number of edges in any Minimum Spanning Tree (MST) of G?',
        natRange: { min: 6, max: 6 },
        explanation: 'A spanning tree of any connected graph with V vertices always contains exactly V - 1 edges.\nHere V = 7, so number of edges in any MST = 7 - 1 = 6 edges.'
      },
      {
        id: 'q-ds-3',
        type: 'MSQ',
        subjectId: 'algo',
        subjectName: 'Algorithms',
        topic: 'Sorting & Lower Bounds',
        marks: 2,
        negativeMarks: 0,
        questionText: 'Which of the following statements about sorting algorithms are TRUE? (Select all that apply)',
        options: [
          { id: 'A', text: 'Merge Sort is a stable sorting algorithm in its standard implementation.' },
          { id: 'B', text: 'QuickSort has a worst-case time complexity of O(n log n).' },
          { id: 'C', text: 'HeapSort has an in-place spatial requirement of O(1) auxiliary space.' },
          { id: 'D', text: 'Counting Sort is a comparison-based sort with O(n) worst-case time.' }
        ],
        correctOptions: ['A', 'C'],
        explanation: 'A is TRUE: Standard MergeSort preserves relative order of equal keys.\nB is FALSE: Standard QuickSort has worst-case O(n^2) when array is already sorted or partition is skewed.\nC is TRUE: HeapSort builds heap in-place and takes O(1) extra space.\nD is FALSE: Counting Sort is NOT a comparison-based sort (it uses key indexing).'
      },
      {
        id: 'q-ds-4',
        type: 'MCQ',
        subjectId: 'dsa',
        subjectName: 'Programming & Data Structures',
        topic: 'Hashing',
        marks: 3,
        negativeMarks: 1.0,
        questionText: 'Given a hash table of size 7 with hash function h(k) = k mod 7 and linear probing. Keys inserted in order are: 44, 45, 79, 55, 91, 18, 63.\nWhich index contains the key 63?',
        options: [
          { id: 'A', text: '0' },
          { id: 'B', text: '1' },
          { id: 'C', text: '3' },
          { id: 'D', text: '5' }
        ],
        correctOptions: ['B'],
        explanation: 'Tracing linear probing on table of size 7 (indices 0 to 6):\n1. 44 mod 7 = 2 -> Index 2\n2. 45 mod 7 = 3 -> Index 3\n3. 79 mod 7 = 2 -> Collides at 2, probes 3 (occupied), inserts at Index 4\n4. 55 mod 7 = 6 -> Index 6\n5. 91 mod 7 = 0 -> Index 0\n6. 18 mod 7 = 4 -> Collides at 4, inserts at Index 5\n7. 63 mod 7 = 0 -> Collides at 0, inserts at next free slot Index 1.\nHence, key 63 is stored at Index 1.'
      }
    ]
  }
];
