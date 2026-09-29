document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('regForm');
  const successCard = document.getElementById('successCard');

  renderRecent();

  function setError(fieldId, show) {
    document.getElementById(fieldId).classList.toggle('has-error', show);
  }

  function validate() {
    let ok = true;
    const name = document.getElementById('pName').value.trim();
    const age = document.getElementById('pAge').value;
    const phone = document.getElementById('pPhone').value.trim();
    const dept = document.getElementById('pDept').value;

    const nameOk = name.length >= 2;
    setError('fName', !nameOk); if (!nameOk) ok = false;

    const ageNum = Number(age);
    const ageOk = age !== '' && ageNum >= 0 && ageNum <= 120;
    setError('fAge', !ageOk); if (!ageOk) ok = false;

    const phoneOk = /^\d{10}$/.test(phone);
    setError('fPhone', !phoneOk); if (!phoneOk) ok = false;

    const deptOk = dept !== '';
    setError('fDept', !deptOk); if (!deptOk) ok = false;

    return ok;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the highlighted fields', 'bad');
      return;
    }

    const token = nextTokenCode();
    const patient = {
      token,
      name: document.getElementById('pName').value.trim(),
      age: Number(document.getElementById('pAge').value),
      phone: document.getElementById('pPhone').value.trim(),
      department: document.getElementById('pDept').value,
      registeredAt: Date.now(),
    };

    const patients = getJSON(STORE.patients, []);
    patients.push(patient);
    setJSON(STORE.patients, patients);
    localStorage.setItem(STORE.activeToken, token);

    document.getElementById('outName').textContent = patient.name;
    document.getElementById('outToken').textContent = token;
    successCard.hidden = false;
    successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    form.reset();
    showToast('Patient registered — token ' + token + ' issued', 'good');
    renderRecent();
  });

  function renderRecent() {
    const list = document.getElementById('recentList');
    const patients = getJSON(STORE.patients, []).slice().reverse().slice(0, 6);
    if (!patients.length) {
      list.innerHTML = '<p style="font-size:.88rem; color:var(--ink-soft);">No patients registered yet.</p>';
      return;
    }
    list.innerHTML = patients.map((p) => `
      <div style="display:flex; align-items:center; justify-content:space-between; background:var(--surface); border-radius:12px; padding:12px 14px;">
        <div>
          <strong style="font-size:.92rem;">${escapeHTML(p.name)}</strong>
          <div style="font-size:.78rem; color:var(--ink-soft);">${escapeHTML(p.department)} · ${timeAgo(p.registeredAt)}</div>
        </div>
        <span class="badge badge-primary">${p.token}</span>
      </div>
    `).join('');
  }
});
