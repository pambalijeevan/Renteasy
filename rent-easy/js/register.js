/* ── Register Page ─────────────────────────────────────────────── */

'use strict';

let currentRole = 'tenant';

const TENANT_BENEFITS = [
  'Browse all Hyderabad listings',
  'View full-screen image gallery',
  'Contact owners directly',
];
const OWNER_BENEFITS = [
  'List unlimited properties',
  'Upload 3D tours & photos',
  'Connect with verified tenants',
];

(function () {
  const user = getSession();
  if (user) {
    window.location.href = user.role === 'owner'
      ? 'owner-dashboard.html'
      : 'tenant-dashboard.html';
  }
})();

function selectRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === role);
  });
  const benefits = role === 'owner' ? OWNER_BENEFITS : TENANT_BENEFITS;
  document.getElementById('benefit-1').textContent = benefits[0];
  document.getElementById('benefit-2').textContent = benefits[1];
  document.getElementById('benefit-3').textContent = benefits[2];
  document.getElementById('btn-text').textContent =
    `Create ${role === 'owner' ? 'Owner' : 'Tenant'} Account`;
  hideError();
}

function showError(msg) {
  const box = document.getElementById('error-box');
  document.getElementById('error-text').textContent = msg;
  box.classList.remove('hidden');
}
function hideError() {
  document.getElementById('error-box').classList.add('hidden');
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.innerHTML = isText
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

async function handleRegister(e) {
  e.preventDefault();
  hideError();

  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirm-password').value;

  if (!name || !email || !phone || !password || !confirm) {
    showError('Please fill in all fields.'); return;
  }
  if (!/^\+?[0-9\s\-]{10,15}$/.test(phone)) {
    showError('Please enter a valid phone number (10–15 digits).'); return;
  }
  if (password.length < 6) {
    showError('Password must be at least 6 characters.'); return;
  }
  if (password !== confirm) {
    showError('Passwords do not match.'); return;
  }

  const btn     = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const spinner = document.getElementById('btn-spinner');
  btn.disabled  = true;
  btnText.textContent = 'Creating Account...';
  spinner.classList.remove('hidden');

  try {
    const available = await checkApiAvailability();

    if (available) {
      const { ok, data } = await apiCall('/register', {
        method: 'POST',
        body: { name, email, phone, password, role: currentRole },
      });
      if (ok && data.success) {
        showToast('Account created! Please sign in to continue.');
        setTimeout(() => { window.location.href = 'login.html'; }, 800);
        return;
      }
      showError(data.error || 'Registration failed. Please try again.');
    } else {
      // Fallback: localStorage auth
      const result = registerLocalUser({ name, email, phone, password, role: currentRole });
      if (result.success) {
        showToast('Account created! Please sign in to continue.');
        setTimeout(() => { window.location.href = 'login.html'; }, 800);
        return;
      }
      showError(result.message);
    }
  } catch (err) {
    showError('An error occurred. Please try again.');
  } finally {
    btn.disabled = false;
    btnText.textContent = `Create ${currentRole === 'owner' ? 'Owner' : 'Tenant'} Account`;
    spinner.classList.add('hidden');
  }
}
