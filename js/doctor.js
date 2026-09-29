document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('patientSelect');
  populateSelect();

  select.addEventListener('change', () => {
    renderPatientDetails();
    renderRx();
  });

  renderPatientDetails();
  renderRx();

  const form = document.getElementById('rxForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!select.value) {
      showToast('Select a patient first', 'bad');
      return;
    }

    let ok = true;
    const name = document.getElementById('medName').value.trim();
    const dosage = document.getElementById('medDosage').value.trim();
    const time = document.getElementById('medTime').value;
    const duration = document.getElementById('medDuration').value;

    toggleError('fMedName', name.length < 2); if (name.length < 2) ok = false;
    toggleError('fDosage', dosage.length < 1); if (dosage.length < 1) ok = false;
    toggleError('fMedTime', !time); if (!time) ok = false;
    const durOk = duration && Number(duration) >= 1 && Number(duration) <= 90;
    toggleError('fDuration', !durOk); if (!durOk) ok = false;

    if (!ok) {
      showToast('Please fix the highlighted fields', 'bad');
      return;
    }

    const meds = getJSON(STORE.medicines, []);
    meds.push({
      id: 'm' + Date.now(),
      token: select.value,
      name, dosage, time,
      duration: Number(duration),
      status: 'upcoming',
    });
    setJSON(STORE.medicines, meds);
    form.reset();
    showToast(name + ' added to prescription', 'good');
    renderRx();
  });

  function toggleError(id, show) {
    document.getElementById(id).classList.toggle('has-error', show);
  }

  function populateSelect() {
    const patients = getJSON(STORE.patients, []);
    const active = localStorage.getItem(STORE.activeToken);
    select.innerHTML = patients.map((p) =>
      `<option value="${p.token}">${p.token} — ${escapeHTML(p.name)}</option>`
    ).join('');
    if (active && patients.some((p) => p.token === active)) select.value = active;
  }

  function renderPatientDetails() {
    const patients = getJSON(STORE.patients, []);
    const p = patients.find((x) => x.token === select.value);
    const el = document.getElementById('patientDetails');
    if (!p) {
      el.innerHTML = '<div class="empty-state"><p>No patients registered yet.</p></div>';
      return;
    }
    el.innerHTML = `
      <div class="grid-3" style="grid-template-columns:repeat(3,1fr);">
        <div class="token-box"><span class="lbl">Token</span><span class="num" style="font-size:1.3rem;">${p.token}</span></div>
        <div class="token-box"><span class="lbl">Patient</span><span class="num" style="font-size:1.1rem;">${escapeHTML(p.name)}</span></div>
        <div class="token-box"><span class="lbl">Department</span><span class="num" style="font-size:1.1rem;">${escapeHTML(p.department)}</span></div>
      </div>`;
  }

  function renderRx() {
    const meds = getJSON(STORE.medicines, []).filter((m) => m.token === select.value);
    const list = document.getElementById('rxList');
    if (!meds.length) {
      list.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 12h6M9 16h6M9 8h1"/><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/></svg>
        <p>No medicines prescribed yet for this token.</p>
      </div>`;
      return;
    }
    list.innerHTML = meds.map((m) => `
      <div class="rx-card">
        <div>
          <h4>${escapeHTML(m.name)}</h4>
          <div class="meta">Dosage: ${escapeHTML(m.dosage)} · Time: ${m.time} · Duration: ${m.duration} days</div>
        </div>
        <button class="rx-remove" type="button" onclick="__removeRx('${m.id}')">Remove</button>
      </div>`).join('');
  }

  window.__removeRx = (id) => {
    const meds = getJSON(STORE.medicines, []).filter((m) => m.id !== id);
    setJSON(STORE.medicines, meds);
    showToast('Prescription entry removed', 'good');
    renderRx();
  };
});
