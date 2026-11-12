const fs = require('fs');

async function testSuite() {
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('5173'));

  if (!pageTarget) {
    console.error('No page target found for port 5173');
    const all = targets.map(t => `${t.id}: ${t.url}`).join('\n');
    console.log('Available targets:\n', all);
    return;
  }

  console.log('Connected to target:', pageTarget.url);
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
      await send('Page.enable');
      await send('Runtime.enable');

      fs.mkdirSync('public/app-screenshots', { recursive: true });

      const views = [
        { id: 'dashboard', name: '01-dashboard' },
        { id: 'syllabus', name: '02-syllabus' },
        { id: 'timer', name: '03-timer' },
        { id: 'tests', name: '04-tests' },
        { id: 'analytics', name: '05-analytics' },
        { id: 'notes', name: '06-notes' },
        { id: 'mistakes', name: '07-mistakes' },
        { id: 'calculator', name: '08-calculator' },
        { id: 'planner', name: '09-planner' },
        { id: 'settings', name: '10-settings' }
      ];

      // 1. Desktop captures (1440 x 900)
      console.log('--- CAPTURING DESKTOP SCREENSHOTS (1440x900) ---');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 2,
        mobile: false
      });

      for (const v of views) {
        await send('Runtime.evaluate', {
          expression: `(() => {
            const buttons = Array.from(document.querySelectorAll('nav button'));
            const btn = buttons.find(b => b.textContent.toLowerCase().includes('${v.id}'));
            if (btn) btn.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 600));

        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`public/app-screenshots/${v.name}-desktop.png`, Buffer.from(shot.data, 'base64'));
        console.log(`Captured ${v.name}-desktop.png`);
      }

      // 2. Mobile captures (390 x 844)
      console.log('\n--- CAPTURING MOBILE SCREENSHOTS (390x844) ---');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });

      const mobileViews = ['dashboard', 'syllabus', 'timer', 'calculator'];
      for (const mid of mobileViews) {
        await send('Runtime.evaluate', {
          expression: `(() => {
            const menuBtn = document.querySelector('header button[aria-label="Toggle navigation menu"]');
            if (menuBtn) menuBtn.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 400));

        await send('Runtime.evaluate', {
          expression: `(() => {
            const drawerButtons = Array.from(document.querySelectorAll('div[class*="slide-in-from-left"] nav button'));
            const btn = drawerButtons.find(b => b.textContent.toLowerCase().includes('${mid}'));
            if (btn) btn.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 600));

        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`public/app-screenshots/${mid}-mobile.png`, Buffer.from(shot.data, 'base64'));
        console.log(`Captured ${mid}-mobile.png`);
      }

      await send('Emulation.clearDeviceMetricsOverride');

      // -------------------------------------------------------------
      // 3. Acceptance Tests Verification Scenarios
      // -------------------------------------------------------------
      console.log('\n--- EXECUTING ACCEPTANCE SCENARIOS ---');

      // Navigate to syllabus
      await send('Runtime.evaluate', {
        expression: `(() => {
          const buttons = Array.from(document.querySelectorAll('nav button'));
          const btn = buttons.find(b => b.textContent.toLowerCase().includes('syllabus'));
          if (btn) btn.click();
        })()`
      });
      await new Promise(r => setTimeout(r, 500));

      // Scenario A: Syllabus Status Update
      const scenarioA = await send('Runtime.evaluate', {
        expression: `(() => {
          const selectors = Array.from(document.querySelectorAll('select'));
          const statusSelector = selectors.find(s => s.value === 'completed' || s.value === 'not_started' || s.value === 'in_progress');
          if (!statusSelector) return { success: false, reason: 'selector not found' };
          const original = statusSelector.value;
          statusSelector.value = 'completed';
          statusSelector.dispatchEvent(new Event('change', { bubbles: true }));
          return { success: true, original, updated: statusSelector.value };
        })()`,
        returnByValue: true
      });
      console.log('Scenario A (Syllabus Status Update):', scenarioA.result.value);

      // Scenario B: Study Timer Start & Pause
      await send('Runtime.evaluate', {
        expression: `(() => {
          const buttons = Array.from(document.querySelectorAll('nav button'));
          const btn = buttons.find(b => b.textContent.toLowerCase().includes('timer'));
          if (btn) btn.click();
        })()`
      });
      await new Promise(r => setTimeout(r, 500));

      const scenarioB = await send('Runtime.evaluate', {
        expression: `(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const startBtn = buttons.find(b => b.textContent.includes('Start Session'));
          if (startBtn) {
            startBtn.click();
            return { success: true, action: 'Timer started' };
          }
          return { success: false, reason: 'start button not visible' };
        })()`,
        returnByValue: true
      });
      console.log('Scenario B (Timer Execution):', scenarioB.result.value);

      // Scenario C: LocalStorage Persistence Check
      const scenarioC = await send('Runtime.evaluate', {
        expression: `(() => {
          const raw = localStorage.getItem('gatetrack_personal_v1');
          if (!raw) return { success: false, reason: 'no item in localStorage' };
          const parsed = JSON.parse(raw);
          return {
            success: true,
            subjectsCount: parsed.subjects?.length,
            sessionsCount: parsed.studySessions?.length,
            mistakesCount: parsed.mistakes?.length,
            notesCount: parsed.notes?.length
          };
        })()`,
        returnByValue: true
      });
      console.log('Scenario C (Data Persistence):', scenarioC.result.value);

      console.log('\nALL SCREENSHOTS AND ACCEPTANCE SCENARIOS COMPLETED!');
      ws.close();
      process.exit(0);
    } catch (err) {
      console.error('Error during test execution:', err);
      ws.close();
      process.exit(1);
    }
  };
}
testSuite();
