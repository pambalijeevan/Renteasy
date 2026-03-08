/* ── Tenant Dashboard ──────────────────────────────────────────── */

'use strict';

let currentUser = null;
let allProperties = [];
let filtered = [];
let filtersVisible = false;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  currentUser = getSession();
  if (!currentUser || currentUser.role !== 'tenant') {
    window.location.href = 'login.html'; return;
  }
  document.getElementById('user-display-name').textContent = currentUser.name;
  document.getElementById('user-avatar-letter').textContent = currentUser.name.charAt(0).toUpperCase();

  // Populate area dropdown
  const sel = document.getElementById('f-area');
  HYDERABAD_AREAS.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a; sel.appendChild(opt);
  });

  await loadProperties();
}

async function loadProperties() {
  try {
    const available = await checkApiAvailability();
    if (available) {
      const { ok, data } = await apiCall('/properties');
      if (ok && data.success) {
        allProperties = data.properties || [];
      } else {
        allProperties = getLocalProperties();
      }
    } else {
      allProperties = getLocalProperties();
    }
  } catch {
    allProperties = getLocalProperties();
  }

  document.getElementById('total-count').textContent =
    `Browse ${allProperties.length}+ verified rental listings`;

  applyFilters();
}

function applyFilters() {
  const q          = (document.getElementById('search-input').value || '').toLowerCase().trim();
  const area       = document.getElementById('f-area').value;
  const type       = document.getElementById('f-type').value;
  const maxPrice   = document.getElementById('f-price').value;
  const beds       = document.getElementById('f-beds').value;
  const furnishing = document.getElementById('f-furnishing').value;

  let result = [...allProperties];

  if (q) {
    result = result.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.location || '').toLowerCase().includes(q) ||
      (p.type || '').toLowerCase().includes(q) ||
      (p.ownerName || p.owner_name || '').toLowerCase().includes(q)
    );
  }
  if (area) result = result.filter(p => (p.location || '').toLowerCase().includes(area.toLowerCase()));
  if (type) result = result.filter(p => p.type === type);
  if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
  if (beds && beds !== 'Any' && beds !== '') {
    if (beds === '4+') result = result.filter(p => p.bedrooms >= 4);
    else result = result.filter(p => p.bedrooms === Number(beds));
  }
  if (furnishing) result = result.filter(p => p.furnishing === furnishing);

  filtered = result;

  // Search clear button
  document.getElementById('search-clear').classList.toggle('hidden', !q);

  // Filter count badge
  const activeCount = [area, type, maxPrice, (beds && beds !== 'Any' && beds !== '') ? beds : '', furnishing].filter(Boolean).length;
  const badge = document.getElementById('filter-count');
  badge.textContent = activeCount;
  badge.classList.toggle('hidden', activeCount === 0);
  document.getElementById('clear-filters-btn').classList.toggle('hidden', activeCount === 0);

  renderProperties();
}

function renderProperties() {
  document.getElementById('loading-state').classList.add('hidden');

  const count = filtered.length;
  document.getElementById('results-count').innerHTML =
    `<strong>${count}</strong> ${count === 1 ? 'property' : 'properties'} found`;

  const grid = document.getElementById('properties-grid');

  if (count === 0) {
    document.getElementById('empty-results').classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }
  document.getElementById('empty-results').classList.add('hidden');
  grid.classList.remove('hidden');
  grid.innerHTML = filtered.map(p => buildPropertyCardHTML(p)).join('');
}

function toggleFilters() {
  filtersVisible = !filtersVisible;
  document.getElementById('filter-panel').classList.toggle('hidden', !filtersVisible);
  document.getElementById('filter-btn').classList.toggle('active', filtersVisible);
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  applyFilters();
}

function clearFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('f-area').value       = '';
  document.getElementById('f-type').value       = '';
  document.getElementById('f-price').value      = '';
  document.getElementById('f-beds').value       = '';
  document.getElementById('f-furnishing').value = '';
  applyFilters();
}

function handleLogout() {
  clearSession();
  setToken(null);
  showToast('Logged out successfully.');
  setTimeout(() => { window.location.href = 'index.html'; }, 600);
}
