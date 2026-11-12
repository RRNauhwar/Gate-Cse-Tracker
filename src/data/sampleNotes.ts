import { Note } from '../types';

export const sampleNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Master Theorem for Divide & Conquer',
    content: `For recurrences of the form:
$$T(n) = a T(n/b) + f(n)$$
where $a \\ge 1$, $b > 1$:

1. **Case 1:** If $f(n) = O(n^{\\log_b a - \\epsilon})$ for $\\epsilon > 0$, then:
   $$T(n) = \\Theta(n^{\\log_b a})$$
2. **Case 2:** If $f(n) = \\Theta(n^{\\log_b a} \\log^k n)$ for $k \\ge 0$, then:
   $$T(n) = \\Theta(n^{\\log_b a} \\log^{k+1} n)$$
3. **Case 3:** If $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ for $\\epsilon > 0$, and regularity condition $a f(n/b) \\le c f(n)$ holds for $c < 1$, then:
   $$T(n) = \\Theta(f(n))$$`,
    subjectId: 'algo',
    subjectName: 'Algorithms',
    topicName: 'Master Theorem',
    isPinned: true,
    isFormula: true,
    tags: ['#formula', '#divide-conquer', '#high-yield'],
    updatedAt: '2026-10-27T14:30:00.000Z'
  },
  {
    id: 'note-2',
    title: 'Euler’s Planar Graph Formula & Corollaries',
    content: `For any connected simple planar graph with $V$ vertices, $E$ edges, and $F$ faces:
$$V - E + F = 2$$

**Corollaries for simple connected planar graphs with $V \\ge 3$:**
- If every face is bounded by at least 3 edges:
  $$E \\le 3V - 6$$
- If the graph has NO triangles (every face bounded by $\\ge 4$ edges):
  $$E \\le 2V - 4$$
- Every simple planar graph contains at least one vertex of degree $\\le 5$.`,
    subjectId: 'dm',
    subjectName: 'Discrete Mathematics',
    topicName: 'Graph Theory',
    isPinned: true,
    isFormula: true,
    tags: ['#formula', '#graphs', '#gate-must-know'],
    updatedAt: '2026-10-26T10:15:00.000Z'
  },
  {
    id: 'note-3',
    title: 'Cache Memory Mapping Equations',
    content: `In a physical byte-addressable system with address size $N$ bits:

1. **Direct Mapped:**
   - Offset bits $= \\log_2(\\text{Block size in bytes})$
   - Index bits $= \\log_2(\\text{Number of cache lines})$
   - Tag bits $= N - (\\text{Index} + \\text{Offset})$

2. **$K$-Way Set Associative:**
   - Number of Sets $= \\frac{\\text{Total cache lines}}{K}$
   - Set Index bits $= \\log_2(\\text{Number of Sets})$
   - Tag bits $= N - (\\text{Set Index} + \\text{Offset})$`,
    subjectId: 'coa',
    subjectName: 'Computer Organization & Architecture',
    topicName: 'Cache Memory',
    isPinned: false,
    isFormula: true,
    tags: ['#coa', '#cache', '#numerical-short-trick'],
    updatedAt: '2026-10-25T18:20:00.000Z'
  }
];
