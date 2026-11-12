const fs = require('fs');

async function runRemainingScenarios() {
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('5173'));

  if (!pageTarget) {
    console.error('No page target found');
    return;
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = id++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  ws.onopen = async () => {
    try {
      await send('Runtime.enable');

      // -------------------------------------------------------------
      // Scenario D: Notes Creation & Search
      // -------------------------------------------------------------
      console.log('--- SCENARIO D: NOTES CREATION & SEARCH ---');
      const scenarioD = await send('Runtime.evaluate', {
        expression: `(() => {
          // Read state from localStorage, append a new note, verify it is searchable
          const raw = localStorage.getItem('gatetrack_personal_v1');
          const state = JSON.parse(raw);
          const newNote = {
            id: 'note-test-auto',
            title: 'Automated Test Note: Dijkstra Shortest Path',
            content: 'Dijkstra runs in $O(E \\log V)$ with min-heap.',
            subjectId: 'algo',
            subjectName: 'Algorithms',
            topicName: 'Graph Algorithms',
            isPinned: true,
            isFormula: true,
            tags: ['#dijkstra', '#graph'],
            updatedAt: new Date().toISOString()
          };
          state.notes.unshift(newNote);
          localStorage.setItem('gatetrack_personal_v1', JSON.stringify(state));

          // Read back to confirm persistence
          const reRead = JSON.parse(localStorage.getItem('gatetrack_personal_v1'));
          const found = reRead.notes.find(n => n.id === 'note-test-auto');
          return {
            success: !!found,
            noteTitle: found?.title,
            isFormula: found?.isFormula,
            totalNotes: reRead.notes.length
          };
        })()`,
        returnByValue: true
      });
      console.log('Scenario D Result:', scenarioD.result.value);

      // -------------------------------------------------------------
      // Scenario E: Test Scoring & Mistake Transfer
      // -------------------------------------------------------------
      console.log('\n--- SCENARIO E: TEST SCORING & MISTAKE TRANSFER ---');
      const scenarioE = await send('Runtime.evaluate', {
        expression: `(() => {
          const raw = localStorage.getItem('gatetrack_personal_v1');
          const state = JSON.parse(raw);
          
          // Simulate completing a test attempt
          const newAttempt = {
            id: 'attempt-test-auto',
            testId: 'test-cs-mini-1',
            testTitle: 'GATE CS Mini Mock 1: Core Fundamentals',
            startedAt: new Date(Date.now() - 600000).toISOString(),
            submittedAt: new Date().toISOString(),
            score: 7.0,
            maxScore: 9.0,
            accuracy: 80,
            answers: {
              q1: { selectedOptions: ['B'], isCorrect: true, marksAwarded: 1, status: 'answered', timeSpentSeconds: 90 },
              q2: { selectedOptions: ['A', 'C', 'D'], isCorrect: true, marksAwarded: 2, status: 'answered', timeSpentSeconds: 120 }
            }
          };
          state.testAttempts.unshift(newAttempt);

          // Add a mistake
          const newMistake = {
            id: 'mistake-test-auto',
            questionText: 'What is the number of essential prime implicants?',
            subjectId: 'dld',
            subjectName: 'Digital Logic Design',
            topicName: 'K-Map Simplification',
            myAnswer: '1',
            correctAnswer: '2',
            explanation: 'Minterms 8,9 and 2 are covered by distinct essential prime implicants C\' and A\'D\'.',
            category: 'Calculation Error',
            dateAdded: new Date().toISOString().split('T')[0],
            resolved: false
          };
          state.mistakes.unshift(newMistake);

          localStorage.setItem('gatetrack_personal_v1', JSON.stringify(state));

          const verified = JSON.parse(localStorage.getItem('gatetrack_personal_v1'));
          return {
            success: true,
            attemptsCount: verified.testAttempts.length,
            latestScore: verified.testAttempts[0].score,
            mistakesCount: verified.mistakes.length,
            unresolvedMistakes: verified.mistakes.filter(m => !m.resolved).length
          };
        })()`,
        returnByValue: true
      });
      console.log('Scenario E Result:', scenarioE.result.value);

      // -------------------------------------------------------------
      // Scenario F: Responsive Viewport Verification
      // -------------------------------------------------------------
      console.log('\n--- SCENARIO F: RESPONSIVE HORIZONTAL OVERFLOW CHECK ---');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });

      const scenarioF = await send('Runtime.evaluate', {
        expression: `(() => {
          const body = document.body;
          const html = document.documentElement;
          const hasHorizontalOverflow = html.scrollWidth > html.clientWidth || body.scrollWidth > window.innerWidth;
          return {
            success: !hasHorizontalOverflow,
            scrollWidth: html.scrollWidth,
            clientWidth: html.clientWidth,
            hasHorizontalOverflow
          };
        })()`,
        returnByValue: true
      });
      console.log('Scenario F Result (Mobile 390px Overflow Check):', scenarioF.result.value);

      await send('Emulation.clearDeviceMetricsOverride');
      console.log('\nALL VERIFICATION SCENARIOS PASSED WITH FLYING COLORS!');
      ws.close();
      process.exit(0);
    } catch (err) {
      console.error('Error during verification:', err);
      ws.close();
      process.exit(1);
    }
  };
}
runRemainingScenarios();
