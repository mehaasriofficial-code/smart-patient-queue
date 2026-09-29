document.addEventListener('DOMContentLoaded', () => {
  render();

  document.getElementById('refreshBtn').addEventListener('click', () => {
    render();
    showToast('Queue refreshed', 'good');
  });

  document.getElementById('advanceBtn').addEventListener('click', () => {
    const patients = getJSON(STORE.patients, []);
    const tokens = patients.map((p) => p.token);
    const current = localStorage.getItem(STORE.currentToken) || tokens[0];
    const idx = tokens.indexOf(current);

    if (idx === -1 || idx >= tokens.length - 1) {
      showToast('No further tokens to call today', 'bad');
      return;
    }
    const next = tokens[idx + 1];
    localStorage.setItem(STORE.currentToken, next);
    showToast('Now serving token ' + next, 'good');
    render();
  });

  function render() {
    const patients = getJSON(STORE.patients, []);
    const tokens = patients.map((p) => p.token);
    const current = localStorage.getItem(STORE.currentToken) || (tokens[0] || '—');
    const mine = localStorage.getItem(STORE.activeToken) || (tokens[tokens.length - 1] || '—');

    const curIdx = tokens.indexOf(current);
    const myIdx = tokens.indexOf(mine);
    const before = myIdx > -1 && curIdx > -1 ? Math.max(0, myIdx - curIdx) : 0;
    const waitMins = before * 5;

    document.getElementById('curToken').textContent = current;
    document.getElementById('myToken').textContent = mine;
    document.getElementById('beforeCount').textContent = before;
    document.getElementById('waitTime').textContent = waitMins + ' min';

    const total = tokens.length || 1;
    const pct = curIdx > -1 ? Math.min(100, Math.round(((curIdx + 1) / total) * 100)) : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressCap').textContent = pct + '% of today\u2019s queue served';

    const statusPill = document.getElementById('statusPill');
    if (myIdx > -1 && curIdx > -1 && myIdx <= curIdx) {
      statusPill.textContent = 'Being served';
      statusPill.className = 'badge badge-good';
    } else if (myIdx === -1) {
      statusPill.textContent = 'Not in queue';
      statusPill.className = 'badge badge-wait';
    } else {
      statusPill.textContent = 'Waiting';
      statusPill.className = 'badge badge-wait';
    }

    const strip = document.getElementById('queueStrip');
    strip.innerHTML = tokens.map((t, i) => {
      let cls = 'upcoming';
      if (i < curIdx) cls = 'served';
      if (i === curIdx) cls = 'current';
      const arrow = i < tokens.length - 1
        ? '<span class="queue-arrow" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>'
        : '';
      return `<div class="queue-pill ${cls}">${t}</div>${arrow}`;
    }).join('');

    const table = document.getElementById('patientTable');
    if (!patients.length) {
      table.innerHTML = '<div class="empty-state"><p>No patients registered yet today.</p></div>';
      return;
    }
    table.innerHTML = patients.map((p) => {
      let status = 'Upcoming', cls = 'badge-wait';
      const i = tokens.indexOf(p.token);
      if (i < curIdx) { status = 'Served'; cls = 'badge-good'; }
      if (i === curIdx) { status = 'In progress'; cls = 'badge-primary'; }
      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--line);">
          <div>
            <strong style="font-size:.92rem;">${escapeHTML(p.name)}</strong>
            <div style="font-size:.78rem; color:var(--ink-soft);">${escapeHTML(p.department)} · Token ${p.token}</div>
          </div>
          <span class="badge ${cls}">${status}</span>
        </div>`;
    }).join('');
  }
});
