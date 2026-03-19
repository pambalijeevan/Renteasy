/* ── Login Page ───────────────────────────────────────────────── */

'use strict';

let currentRole = 'tenant';

// Redirect if already logged in
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
  document.getElementById('btn-text').textContent =
    `Sign In as ${role === 'owner' ? 'Owner' : 'Tenant'}`;
  hideError();
}

function showError(msg, showRegisterLink = false) {
  const box  = document.getElementById('error-box');
  const text = document.getElementById('error-text');
  const link = document.getElementById('error-link');
  text.textContent = msg;
  box.classList.remove('hidden');
  if (showRegisterLink) link.classList.remove('hidden');
  else link.classList.add('hidden');
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

async function handleLogin(e) {
  e.preventDefault();
  hideError();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) { showError('Please fill in all fields.'); return; }

  const btn     = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const spinner = document.getElementById('btn-spinner');
  btn.disabled  = true;
  btnText.textContent = 'Signing in...';
  spinner.classList.remove('hidden');

  try {
    const available = await checkApiAvailability();

    if (available) {
      const { ok, data } = await apiCall('/login', {
        method: 'POST',
        body: { email, password, role: currentRole },
      });
      if (ok && data.success) {
        setToken(data.token);
        setSession(data.user);
        showToast(data.message || `Welcome back, ${data.user.name}!`);
        setTimeout(() => {
          window.location.href = data.user.role === 'owner'
            ? 'owner-dashboard.html'
            : 'tenant-dashboard.html';
        }, 600);
        return;
      }
      showError(data.error || 'Login failed. Please try again.',
        (data.error || '').toLowerCase().includes('create'));
    } else {
      // Fallback: localStorage auth
      const result = loginLocalUser(email, password, currentRole);
      if (result.success) {
        setSession(result.user);
        showToast(result.message);
        setTimeout(() => {
          window.location.href = result.user.role === 'owner'
            ? 'owner-dashboard.html'
            : 'tenant-dashboard.html';
        }, 600);
        return;
      }
      showError(result.message, result.message.includes('create'));
    }
  } catch (err) {
    showError('An error occurred. Please try again.');
  } finally {
    btn.disabled = false;
    btnText.textContent = `Sign In as ${currentRole === 'owner' ? 'Owner' : 'Tenant'}`;
    spinner.classList.add('hidden');
  }
}
