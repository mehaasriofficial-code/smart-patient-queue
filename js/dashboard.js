document.addEventListener('DOMContentLoaded', () => {
  const patients = getJSON(STORE.patients, []);
  const myToken = localStorage.getItem(STORE.activeToken) || (patients[patients.length - 1] || {}).token;
  const me = patients.find((p) => p.token === myToken);

  document.getElementById('patientName').textContent = me ? me.name : 'No patient selected';
  document.getElementById('patientToken').textContent = myToken || '—';

  const tokens = patients.map((p) => p.token);
  const current = localStorage.getItem(STORE.currentToken) || tokens[0];
  const curIdx = tokens.indexOf(current);
  const myIdx = tokens.indexOf(myToken);
  const before = myIdx > -1 && curIdx > -1 ? Math.max(0, myIdx - curIdx) : 0;

  document.getElementById('dToken').textContent = myToken || '—';
  document.getElementById('dCurrent').textContent = current || '—';
  document.getElementById('dBefore').textContent = before;
  document.getElementById('dWait').textContent = (before * 5) + ' min';

  const meds = getJSON(STORE.medicines, []).filter((m) => m.token === myToken);
  const medEl = document.getElementById('medSummary');
  if (!meds.length) {
    medEl.innerHTML = '<div class="empty-state"><p>No medicines prescribed yet.</p></div>';
  } else {
    medEl.innerHTML = meds.map((m) => {
      const badgeClass = m.status === 'taken' ? 'badge-good' : m.status === 'missed' ? 'badge-bad' : 'badge-wait';
      const label = m.status === 'taken' ? 'Taken' : m.status === 'missed' ? 'Missed' : 'Upcoming';
      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:11px 0; border-bottom:1px solid var(--line);">
          <div>
            <strong style="font-size:.92rem;">${escapeHTML(m.name)}</strong>
            <div style="font-size:.78rem; color:var(--ink-soft);">${m.time} · ${escapeHTML(m.dosage)}</div>
          </div>
          <span class="badge ${badgeClass}">${label}</span>
        </div>`;
    }).join('');
  }

  const rxEl = document.getElementById('rxSummary');
  if (!meds.length) {
    rxEl.innerHTML = '<div class="empty-state"><p>No prescriptions on file yet.</p></div>';
  } else {
    rxEl.innerHTML = meds.map((m) => `
      <div class="rx-card">
        <div>
          <h4>${escapeHTML(m.name)}</h4>
          <div class="meta">Dosage: ${escapeHTML(m.dosage)} · Time: ${m.time} · Duration: ${m.duration} days</div>
        </div>
      </div>`).join('');
  }
});
