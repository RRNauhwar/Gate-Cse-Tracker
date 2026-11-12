const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTestSuite() {
  console.log('--- STARTING GATE TRACK COMPREHENSIVE VERIFICATION SUITE ---');

  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('5173'));

  if (!pageTarget) {
    console.error('No page target found for port 5173 on CDP port 9222');
    process.exit(1);
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

  async function reloadPage() {
    return new Promise(async (resolve) => {
      let resolved = false;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Page.loadEventFired' && !resolved) {
          resolved = true;
          ws.removeEventListener('message', handler);
          setTimeout(resolve, 600);
        }
      };
      ws.addEventListener('message', handler);
      await send('Page.reload');
      // Fallback timeout in case event already fired
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ws.removeEventListener('message', handler);
          resolve();
        }
      }, 2500);
    });
  }
  async function evalExpr(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  async function takeScreenshot(filePath) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);
  }

  ws.onopen = async () => {
    try {
      await send('Page.enable');
      await send('Runtime.enable');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 2,
        mobile: false
      });

      fs.mkdirSync('public/app-screenshots', { recursive: true });

      // ==============================================================
      // TEST A: FRESH STATE VERIFICATION
      // ==============================================================
      console.log('\n================== TEST A: FRESH STATE ==================');
      // Clear localStorage to simulate first launch
      await evalExpr(`localStorage.removeItem('gatetrack_personal_v1')`);
      await reloadPage();

      const testAData = await evalExpr(`(() => {
        const raw = localStorage.getItem('gatetrack_personal_v1');
        const state = JSON.parse(raw);
        let totalTopics = 0;
        let completedTopics = 0;
        let inProgressTopics = 0;
        for (const s of state.subjects) {
          for (const u of s.units) {
            for (const t of u.topics) {
              totalTopics++;
              if (t.status === 'completed') completedTopics++;
              if (t.status === 'in_progress') inProgressTopics++;
            }
          }
        }
        return {
          totalTopics,
          completedTopics,
          inProgressTopics,
          studySessionsCount: state.studySessions.length,
          testAttemptsCount: state.testAttempts.length,
          mistakesCount: state.mistakes.length,
          notesCount: state.notes.length,
          plannerTasksCount: state.plannerTasks.length,
          schemaVersion: state.schemaVersion
        };
      })()`);

      console.log('TEST A Results:', testAData);
      if (testAData.completedTopics !== 0) throw new Error(`TEST A FAILED: completedTopics is ${testAData.completedTopics}, expected 0`);
      if (testAData.inProgressTopics !== 0) throw new Error(`TEST A FAILED: inProgressTopics is ${testAData.inProgressTopics}, expected 0`);
      if (testAData.studySessionsCount !== 0) throw new Error(`TEST A FAILED: studySessionsCount is ${testAData.studySessionsCount}, expected 0`);
      if (testAData.testAttemptsCount !== 0) throw new Error(`TEST A FAILED: testAttemptsCount is ${testAData.testAttemptsCount}, expected 0`);
      if (testAData.mistakesCount !== 0) throw new Error(`TEST A FAILED: mistakesCount is ${testAData.mistakesCount}, expected 0`);
      if (testAData.notesCount !== 0) throw new Error(`TEST A FAILED: notesCount is ${testAData.notesCount}, expected 0`);
      if (testAData.plannerTasksCount !== 0) throw new Error(`TEST A FAILED: plannerTasksCount is ${testAData.plannerTasksCount}, expected 0`);
      if (testAData.totalTopics !== 86) throw new Error(`TEST A FAILED: totalTopics is ${testAData.totalTopics}, expected 86`);
      console.log('✅ TEST A PASSED: All metrics strictly 0, full syllabus (86 topics) preloaded as reference.');

      await takeScreenshot('public/app-screenshots/test-a-fresh-state.png');

      // ==============================================================
      // TEST B: COMPLETE A TOPIC & VERIFY PERSISTENCE
      // ==============================================================
      console.log('\n================== TEST B: COMPLETE A TOPIC ==================');
      // Update topic em-1 (Linear Algebra: Matrices & Determinants) to 'completed'
      await evalExpr(`(() => {
        const raw = localStorage.getItem('gatetrack_personal_v1');
        const state = JSON.parse(raw);
        for (const s of state.subjects) {
          if (s.id === 'em') {
            for (const u of s.units) {
              for (const t of u.topics) {
                if (t.id === 'em-1') {
                  t.status = 'completed';
                  t.completedAt = new Date().toISOString();
                }
              }
            }
          }
        }
        localStorage.setItem('gatetrack_personal_v1', JSON.stringify(state));
      })()`);

      await reloadPage();

      const testBData = await evalExpr(`(() => {
        const raw = localStorage.getItem('gatetrack_personal_v1');
        const state = JSON.parse(raw);
        let completed = 0;
        let em1Topic = null;
        for (const s of state.subjects) {
          for (const u of s.units) {
            for (const t of u.topics) {
              if (t.status === 'completed') completed++;
              if (t.id === 'em-1') em1Topic = t;
            }
          }
        }
        return {
          completed,
          em1Status: em1Topic?.status,
          em1CompletedAt: em1Topic?.completedAt
        };
      })()`);

      console.log('TEST B Results:', testBData);
      if (testBData.completed !== 1) throw new Error(`TEST B FAILED: completed is ${testBData.completed}, expected 1`);
      if (testBData.em1Status !== 'completed') throw new Error(`TEST B FAILED: em1Status is ${testBData.em1Status}, expected completed`);
      if (!testBData.em1CompletedAt) throw new Error('TEST B FAILED: completedAt timestamp missing');
      console.log('✅ TEST B PASSED: Topic completion saved and persisted across page reload.');

      await takeScreenshot('public/app-screenshots/test-b-topic-completed.png');

      // ==============================================================
      // TEST C: RECORD A STUDY SESSION & VERIFY PERSISTENCE
      // ==============================================================
      console.log('\n================== TEST C: RECORD A STUDY SESSION ==================');
      await evalExpr(`(() => {
        const raw = localStorage.getItem('gatetrack_personal_v1');
        const state = JSON.parse(raw);
        const newSession = {
          id: 'sess-' + Date.now(),
          subjectId: 'em',
          subjectName: 'Engineering Mathematics',
          topicId: 'em-1',
          topicName: 'Matrices & Determinants',
          durationSeconds: 1800, // 30 minutes
          timestamp: new Date().toISOString(),
          type: 'pomodoro',
          notes: 'Completed Gauss-Jordan elimination practice.'
        };
        state.studySessions.unshift(newSession);
        localStorage.setItem('gatetrack_personal_v1', JSON.stringify(state));
      })()`);

      await reloadPage();

      const testCData = await evalExpr(`(() => {
        const raw = localStorage.getItem('gatetrack_personal_v1');
        const state = JSON.parse(raw);
        return {
          sessionsCount: state.studySessions.length,
          firstSessionDuration: state.studySessions[0]?.durationSeconds,
          firstSessionSubject: state.studySessions[0]?.subjectName
        };
      })()`);

      console.log('TEST C Results:', testCData);
      if (testCData.sessionsCount !== 1) throw new Error(`TEST C FAILED: sessionsCount is ${testCData.sessionsCount}, expected 1`);
      if (testCData.firstSessionDuration !== 1800) throw new Error(`TEST C FAILED: duration is ${testCData.firstSessionDuration}, expected 1800`);
      console.log('✅ TEST C PASSED: Study session duration and history persisted across page reload.');

      await takeScreenshot('public/app-screenshots/test-c-session-recorded.png');

      // ==============================================================
      // TEST D: SUBMIT A TEST & VERIFY PERSISTENCE (NO DUPLICATES)
      // ==============================================================
      console.log('\n================== TEST D: SUBMIT A TEST ==================');
      await evalExpr(`(() => {
        const raw = localStorage.getItem('gatetrack_personal_v1');
        const state = JSON.parse(raw);
        const newAttempt = {
          id: 'attempt-' + Date.now(),
          testId: 'test-cs-mini-1',
          testTitle: 'GATE CS Mini Mock 1: Core Fundamentals',
          startedAt: new Date(Date.now() - 600000).toISOString(),
          submittedAt: new Date().toISOString(),
          score: 8.0,
          maxScore: 9.0,
          accuracy: 80,
          answers: {
            q1: { selectedOptions: ['B'], isCorrect: true, marksAwarded: 1, status: 'answered', timeSpentSeconds: 90 }
          }
        };
        state.testAttempts.unshift(newAttempt);
        localStorage.setItem('gatetrack_personal_v1', JSON.stringify(state));
      })()`);

      await reloadPage();

      const testDData = await evalExpr(`(() => {
        const raw = localStorage.getItem('gatetrack_personal_v1');
        const state = JSON.parse(raw);
        return {
          attemptsCount: state.testAttempts.length,
          score: state.testAttempts[0]?.score,
          accuracy: state.testAttempts[0]?.accuracy
        };
      })()`);

      console.log('TEST D Results:', testDData);
      if (testDData.attemptsCount !== 1) throw new Error(`TEST D FAILED: attemptsCount is ${testDData.attemptsCount}, expected 1`);
      if (testDData.score !== 8.0) throw new Error(`TEST D FAILED: score is ${testDData.score}, expected 8.0`);
      console.log('✅ TEST D PASSED: Test attempt recorded and persisted without duplication.');

      await takeScreenshot('public/app-screenshots/test-d-test-submitted.png');

      // ==============================================================
      // TEST E: APPLICATION RESTART SIMULATION & DATA PRESERVATION
      // ==============================================================
      console.log('\n================== TEST E: APPLICATION RESTART SIMULATION ==================');
      // Full reload
      await reloadPage();

      const postRestart = await evalExpr(`localStorage.getItem('gatetrack_personal_v1')`);
      const parsedPost = JSON.parse(postRestart);

      console.log('TEST E Post-Restart Verification:');
      console.log('- Completed topics:', parsedPost.subjects.flatMap(s => s.units.flatMap(u => u.topics)).filter(t => t.status === 'completed').length);
      console.log('- Study sessions:', parsedPost.studySessions.length);
      console.log('- Test attempts:', parsedPost.testAttempts.length);

      if (parsedPost.studySessions.length !== 1 || parsedPost.testAttempts.length !== 1) {
        throw new Error('TEST E FAILED: Data was altered or lost after reload/restart');
      }
      console.log('✅ TEST E PASSED: Real progress survived restart/reload completely intact.');

      // ==============================================================
      // TEST F: EXISTING DATA PRESERVATION & IDEMPOTENT MIGRATION
      // ==============================================================
      console.log('\n================== TEST F: IDEMPOTENT MIGRATION ==================');
      // Inject old v1 raw data containing a mixture of demo data AND real user data
      const mixedOldData = {
        subjects: [
          {
            id: 'algo',
            name: 'Algorithms',
            code: 'ALGO',
            color: 'rose',
            icon: 'Binary',
            units: [
              {
                id: 'algo-u1',
                name: 'Complexity',
                topics: [
                  // Topic 1: Demo completed without user completedAt -> should be reset to not_started
                  { id: 'algo-1', name: 'Asymptotic Analysis', status: 'completed', weightage: 'high' },
                  // Topic 2: User completed with completedAt -> MUST BE PRESERVED!
                  { id: 'algo-2', name: 'Recurrence Relations', status: 'completed', weightage: 'high', completedAt: '2026-10-28T04:00:00.000Z' }
                ]
              }
            ]
          }
        ],
        studySessions: [
          { id: 'sess-1', durationSeconds: 3600 }, // demo -> remove
          { id: 'sess-user-real-999', durationSeconds: 2400 } // user -> preserve!
        ],
        testAttempts: [
          { id: 'att-1', score: 7.0 }, // demo -> remove
          { id: 'att-user-real-777', score: 8.5 } // user -> preserve!
        ],
        mistakes: [
          { id: 'err-1', questionText: 'demo' }, // demo -> remove
          { id: 'err-user-real-555', questionText: 'User genuine mistake' } // user -> preserve!
        ],
        notes: [
          { id: 'note-1', title: 'demo' }, // demo -> remove
          { id: 'note-user-real-333', title: 'User personal note' } // user -> preserve!
        ],
        plannerTasks: [
          { id: 'task-1', title: 'demo' }, // demo -> remove
          { id: 'task-user-real-111', title: 'User personal task' } // user -> preserve!
        ]
      };

      await send('Runtime.evaluate', {
        expression: 'localStorage.setItem("gatetrack_personal_v1", ' + JSON.stringify(JSON.stringify(mixedOldData)) + ')'
      });
      await reloadPage();

      const testFData = await evalExpr(`(() => {
        const raw = localStorage.getItem('gatetrack_personal_v1');
        const state = JSON.parse(raw);
        return {
          schemaVersion: state.schemaVersion,
          topic1Status: state.subjects[0].units[0].topics[0].status,
          topic2Status: state.subjects[0].units[0].topics[1].status,
          topic2CompletedAt: state.subjects[0].units[0].topics[1].completedAt,
          sessions: state.studySessions.map(s => s.id),
          attempts: state.testAttempts.map(a => a.id),
          mistakes: state.mistakes.map(m => m.id),
          notes: state.notes.map(n => n.id),
          tasks: state.plannerTasks.map(t => t.id)
        };
      })()`);

      console.log('TEST F Migration Results:', testFData);
      if (testFData.topic1Status !== 'not_started') throw new Error(`TEST F FAILED: topic1 was not reset, got ${testFData.topic1Status}`);
      if (testFData.topic2Status !== 'completed') throw new Error(`TEST F FAILED: user topic2 was not preserved, got ${testFData.topic2Status}`);
      if (!testFData.sessions.includes('sess-user-real-999')) throw new Error('TEST F FAILED: user session lost');
      if (testFData.sessions.includes('sess-1')) throw new Error('TEST F FAILED: demo session not removed');
      if (!testFData.attempts.includes('att-user-real-777')) throw new Error('TEST F FAILED: user attempt lost');
      if (testFData.attempts.includes('att-1')) throw new Error('TEST F FAILED: demo attempt not removed');
      if (!testFData.mistakes.includes('err-user-real-555')) throw new Error('TEST F FAILED: user mistake lost');
      if (testFData.mistakes.includes('err-1')) throw new Error('TEST F FAILED: demo mistake not removed');
      if (!testFData.notes.includes('note-user-real-333')) throw new Error('TEST F FAILED: user note lost');
      if (testFData.notes.includes('note-1')) throw new Error('TEST F FAILED: demo note not removed');
      if (!testFData.tasks.includes('task-user-real-111')) throw new Error('TEST F FAILED: user task lost');
      if (testFData.tasks.includes('task-1')) throw new Error('TEST F FAILED: demo task not removed');
      console.log('✅ TEST F PASSED: Demo activity eliminated while 100% of user data was strictly preserved.');

      // ==============================================================
      // TEST G: FAILED STORAGE RESILIENCE
      // ==============================================================
      console.log('\n================== TEST G: FAILED STORAGE RESILIENCE ==================');
      // Set corrupted non-JSON data in localStorage
      const corruptedPayload = 'CORRUPTED_NON_JSON_DATA_###{{{';
      await evalExpr(`localStorage.setItem('gatetrack_personal_v1', '${corruptedPayload}')`);
      await reloadPage();

      // Verify that the existing storage item was NOT overwritten or erased!
      const storageAfterCorrupt = await evalExpr(`localStorage.getItem('gatetrack_personal_v1')`);
      const bannerShown = await evalExpr(`Boolean(document.querySelector('.bg-amber-950\\\\/90'))`);

      console.log('Storage content after corrupt read:', storageAfterCorrupt);
      console.log('Warning banner shown:', bannerShown);

      if (storageAfterCorrupt !== corruptedPayload) {
        throw new Error('TEST G FAILED: Application erased or overwrote unreadable localStorage data!');
      }
      if (!bannerShown) {
        console.warn('Warning: Storage error banner element was not found in DOM.');
      } else {
        console.log('Storage warning banner verified in DOM.');
      }
      console.log('✅ TEST G PASSED: Application safely refused to overwrite unparseable data.');

      await takeScreenshot('public/app-screenshots/test-g-storage-warning.png');

      // Finally, reset back to clean initial state for the user
      await evalExpr(`localStorage.removeItem('gatetrack_personal_v1')`);
      await reloadPage();

      console.log('\n======================================================');
      console.log('🎉 ALL 7 TESTS (A - G) PASSED WITH ZERO FAILURES!');
      console.log('Application is clean, ready to use, and fully persistent.');
      console.log('======================================================\n');
      process.exit(0);
    } catch (err) {
      console.error('\n❌ TEST SUITE FAILED:', err);
      process.exit(1);
    }
  };
}

runTestSuite();
