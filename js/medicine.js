document.addEventListener('DOMContentLoaded', () => {
  const activeToken = localStorage.getItem(STORE.activeToken) || '';
  document.getElementById('headToken').textContent = activeToken || 'none selected';

  render();

  function myMeds() {
    return getJSON(STORE.medicines, []).filter((m) => m.token === activeToken);
  }

  function setStatus(id, status) {
    const meds = getJSON(STORE.medicines, []);
    const med = meds.find((m) => m.id === id);
    if (!med) return;
    med.status = status;
    setJSON(STORE.medicines, meds);
    showToast(
      status === 'taken' ? med.name + ' marked as taken' : med.name + ' marked as missed',
      status === 'taken' ? 'good' : 'bad'
    );
    render();
  }
  window.__setMedStatus = setStatus;

  function render() {
    const meds = myMeds();
    const taken = meds.filter((m) => m.status === 'taken').length;
    const missed = meds.filter((m) => m.status === 'missed').length;
    const upcoming = meds.filter((m) => m.status === 'upcoming').length;

    document.getElementById('countTaken').textContent = taken;
    document.getElementById('countMissed').textContent = missed;
    document.getElementById('countUpcoming').textContent = upcoming;

    const next = meds.find((m) => m.status === 'upcoming');
    const nextEl = document.getElementById('nextDose');
    nextEl.innerHTML = next
      ? `<p style="font-size:1.4rem; font-family:var(--font-display); color:var(--primary-ink);">${escapeHTML(next.name)} · ${next.time}</p>
         <p style="color:var(--ink-soft); font-size:.88rem; margin-top:4px;">${escapeHTML(next.dosage)} · ${next.duration} day course</p>`
      : `<p style="color:var(--ink-soft); font-size:.9rem;">No upcoming doses — everything for today is recorded.</p>`;

    const timeline = document.getElementById('timeline');
    if (!meds.length) {
      timeline.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        <p>No medicines have been prescribed for this token yet. Ask a doctor to add a prescription.</p>
      </div>`;
      return;
    }

    timeline.innerHTML = meds.map((m) => {
      const icon = m.status === 'taken' ? '✓' : m.status === 'missed' ? '✕' : '⏳';
      const dotClass = m.status;
      return `
        <div class="timeline-item">
          <div class="timeline-dot ${dotClass}" aria-hidden="true">${icon}</div>
          <div class="timeline-body">
            <div>
              <h4>${escapeHTML(m.name)}</h4>
              <div class="meta">${escapeHTML(m.dosage)} · ${m.time} · ${m.duration} day course</div>
            </div>
            <div class="timeline-actions">
              <button class="btn btn-outline btn-sm" ${m.status === 'taken' ? 'disabled' : ''} onclick="__setMedStatus('${m.id}','taken')">Mark as taken</button>
              <button class="btn btn-ghost btn-sm" ${m.status === 'missed' ? 'disabled' : ''} onclick="__setMedStatus('${m.id}','missed')">Mark as missed</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }
});
