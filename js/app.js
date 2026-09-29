/* ============================================================
   Shared application logic: storage, demo data, UI helpers
   ============================================================ */

const STORE = {
  patients: 'spq_patients',       // [{token,name,age,phone,department,registeredAt}]
  currentToken: 'spq_currentToken', // e.g. "A03" — token currently being served
  medicines: 'spq_medicines',     // [{id,token,name,dosage,time,duration,status}]
  activeToken: 'spq_activeToken', // the token treated as "you" across pages
};

/* ---------- storage helpers ---------- */
function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- demo data ---------- */
function seedDemoData(force) {
  if (!force && localStorage.getItem(STORE.patients)) return;

  const patients = [
    { token: 'A01', name: 'Ananya Rao', age: 34, phone: '9876500011', department: 'Cardiology', registeredAt: Date.now() - 1000 * 60 * 46 },
    { token: 'A02', name: 'Vikram Shah', age: 58, phone: '9876500022', department: 'Orthopedics', registeredAt: Date.now() - 1000 * 60 * 38 },
    { token: 'A03', name: 'Meera Iyer', age: 27, phone: '9876500033', department: 'General Medicine', registeredAt: Date.now() - 1000 * 60 * 25 },
    { token: 'A04', name: 'Rohan Verma', age: 45, phone: '9876500044', department: 'Dermatology', registeredAt: Date.now() - 1000 * 60 * 12 },
    { token: 'A05', name: 'Priya Nair', age: 31, phone: '9876500055', department: 'Cardiology', registeredAt: Date.now() - 1000 * 60 * 4 },
  ];

  const medicines = [
    { id: 'm1', token: 'A05', name: 'Paracetamol', dosage: '1 Tablet', time: '08:00', duration: 5, status: 'taken' },
    { id: 'm2', token: 'A05', name: 'Amoxicillin', dosage: '500mg Capsule', time: '14:30', duration: 5, status: 'upcoming' },
    { id: 'm3', token: 'A05', name: 'Cetirizine', dosage: '1 Tablet', time: '20:30', duration: 3, status: 'upcoming' },
    { id: 'm4', token: 'A05', name: 'Vitamin D3', dosage: '1 Capsule', time: '09:00', duration: 30, status: 'missed' },
  ];

  setJSON(STORE.patients, patients);
  setJSON(STORE.medicines, medicines);
  localStorage.setItem(STORE.currentToken, 'A03');
  localStorage.setItem(STORE.activeToken, 'A05');
}

function resetDemoData() {
  Object.values(STORE).forEach((k) => localStorage.removeItem(k));
  seedDemoData(true);
}

function nextTokenCode() {
  const patients = getJSON(STORE.patients, []);
  const nums = patients
    .map((p) => parseInt((p.token || 'A00').slice(1), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return 'A' + String(next).padStart(2, '0');
}

/* ---------- toast ---------- */
function ensureToastStack() {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('aria-live', 'polite');
    stack.setAttribute('role', 'status');
    document.body.appendChild(stack);
  }
  return stack;
}
function showToast(message, kind) {
  const stack = ensureToastStack();
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : '');
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 250);
  }, 2800);
}

/* ---------- modal (used for reset-demo confirmation) ---------- */
function openConfirmModal({ title, body, confirmLabel, onConfirm }) {
  const backdrop = document.getElementById('confirmModal');
  if (!backdrop) return;
  backdrop.querySelector('[data-modal-title]').textContent = title;
  backdrop.querySelector('[data-modal-body]').textContent = body;
  const confirmBtn = backdrop.querySelector('[data-modal-confirm]');
  confirmBtn.textContent = confirmLabel || 'Confirm';
  backdrop.classList.add('open');

  const cleanup = () => {
    backdrop.classList.remove('open');
    confirmBtn.removeEventListener('click', handleConfirm);
  };
  const handleConfirm = () => { onConfirm(); cleanup(); };
  confirmBtn.addEventListener('click', handleConfirm);

  backdrop.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.onclick = cleanup;
  });
  backdrop.onclick = (e) => { if (e.target === backdrop) cleanup(); };
}

/* ---------- nav (mobile toggle + active link + reset button) ---------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === current) a.classList.add('active');
  });

  document.querySelectorAll('[data-reset-demo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openConfirmModal({
        title: 'Reset demo data?',
        body: 'This clears every registration, queue position and medicine log stored in this browser, then reloads fresh sample data.',
        confirmLabel: 'Reset data',
        onConfirm: () => {
          resetDemoData();
          showToast('Demo data has been reset', 'good');
          setTimeout(() => location.reload(), 500);
        },
      });
    });
  });
}

function timeAgo(ts) {
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.round(mins / 60);
  return hrs + ' hr' + (hrs > 1 ? 's' : '') + ' ago';
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  seedDemoData(false);
  initNav();
});
