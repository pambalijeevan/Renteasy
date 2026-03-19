/* ── Owner Dashboard ───────────────────────────────────────────── */

'use strict';

let currentUser = null;
let allProperties = [];
let pendingDeleteId = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  currentUser = getSession();
  if (!currentUser || currentUser.role !== 'owner') {
    window.location.href = 'login.html'; return;
  }
  document.getElementById('user-display-name').textContent = currentUser.name;
  document.getElementById('user-avatar-letter').textContent = currentUser.name.charAt(0).toUpperCase();
  await loadProperties();
}

async function loadProperties() {
  try {
    const available = await checkApiAvailability();
    if (available) {
      const { ok, data } = await apiCall(`/properties?owner_email=${encodeURIComponent(currentUser.email)}`);
      if (ok && data.success) {
        allProperties = data.properties || [];
      } else {
        allProperties = filterMockByOwner();
      }
    } else {
      allProperties = filterMockByOwner();
    }
  } catch {
    allProperties = filterMockByOwner();
  }
  renderProperties();
}

function filterMockByOwner() {
  return getLocalProperties().filter(p => p.ownerEmail === currentUser.email || p.owner_email === currentUser.email);
}

function renderProperties() {
  document.getElementById('loading-state').classList.add('hidden');
  const count = allProperties.length;
  document.getElementById('listing-count').textContent =
    `${count} ${count === 1 ? 'listing' : 'listings'} in Hyderabad`;

  if (count === 0) {
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('properties-grid').classList.add('hidden');
    return;
  }
  document.getElementById('empty-state').classList.add('hidden');
  const grid = document.getElementById('properties-grid');
  grid.classList.remove('hidden');
  grid.innerHTML = allProperties.map(p => buildOwnerCard(p)).join('');

  // Attach delete listeners
  grid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      openDeleteModal(btn.dataset.id);
    });
  });
}

function buildOwnerCard(property) {
  const mainImg = property.images && property.images[0] ? property.images[0] : '';
  const imgCount = property.images ? property.images.length : 0;
  const hasTour = property.tourFileName || property.tour_file_name;
  const price = formatPrice(property.price);
  const availDate = formatDate(property.availableFrom || property.available_from);

  return `
    <div class="property-card" style="cursor:default;">
      <div class="property-card-image">
        ${mainImg
          ? `<img src="${mainImg}" alt="${property.title}" loading="lazy">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><span style="color:var(--gray-300);width:3rem;height:3rem;">${ICONS.home}</span></div>`}
        <div class="property-card-badges">
          <span class="badge badge-orange" style="font-size:.7rem;">${property.type}</span>
        </div>
        <div class="property-card-badges-right">
          ${imgCount > 1 ? `<span class="badge badge-dark" style="font-size:.7rem;">${ICONS.image.replace('xmlns="http://www.w3.org/2000/svg" ','').substring(0,5)}${imgCount}</span>` : ''}
          ${hasTour ? `<span class="badge badge-blue" style="font-size:.7rem;">3D</span>` : ''}
        </div>
      </div>
      <div class="property-card-body">
        <div class="property-card-title truncate">${property.title}</div>
        <div class="property-card-location">
          <span style="width:.875rem;height:.875rem;display:inline-flex;flex-shrink:0;">${ICONS.mapPin}</span>
          <span class="truncate">${property.location}</span>
        </div>
        <div class="property-card-price">
          <span class="property-card-price-value">₹${price}</span>
          <span class="property-card-price-unit">/month</span>
        </div>
        <div class="property-card-specs">
          <span><span style="width:.875rem;height:.875rem;display:inline-flex;">${ICONS.bed}</span>${property.bedrooms} Bed</span>
          <span><span style="width:.875rem;height:.875rem;display:inline-flex;">${ICONS.bath}</span>${property.bathrooms} Bath</span>
          <span><span style="width:.875rem;height:.875rem;display:inline-flex;">${ICONS.maximize}</span>${property.area} sqft</span>
        </div>
        <div style="display:flex;align-items:center;gap:.375rem;font-size:.75rem;color:var(--gray-500);padding-top:.75rem;border-top:1px solid var(--gray-100);">
          <span style="width:.875rem;height:.875rem;display:inline-flex;">${ICONS.calendar}</span>
          Available from ${availDate}
        </div>
      </div>
      <div class="card-actions">
        <a href="property-details.html?id=${property.id}" class="btn btn-outline btn-sm" style="flex:1;justify-content:center;" onclick="event.stopPropagation()">
          <span style="width:.875rem;height:.875rem;display:inline-flex;">${ICONS.eye}</span> View
        </a>
        <button class="btn btn-ghost btn-sm delete-btn" data-id="${property.id}" title="Delete property" style="color:var(--gray-500);">
          <span style="width:.875rem;height:.875rem;display:inline-flex;pointer-events:none;">${ICONS.trash}</span>
        </button>
      </div>
    </div>
  `;
}

function openDeleteModal(id) {
  pendingDeleteId = id;
  document.getElementById('delete-modal').classList.remove('hidden');
}
function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('delete-modal').classList.add('hidden');
}
async function confirmDelete() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;
  closeDeleteModal();
  try {
    const available = await checkApiAvailability();
    if (available) {
      const { ok, data } = await apiCall(`/properties/${id}`, { method: 'DELETE' });
      if (!ok) { showToast(data.error || 'Could not delete property.', 'error'); }
    }
    // Always remove from localStorage too
    deleteLocalProperty(id);
    allProperties = allProperties.filter(p => String(p.id) !== String(id));
    renderProperties();
    showToast('Property deleted successfully.');
  } catch {
    showToast('Failed to delete property.', 'error');
  }
}

function handleLogout() {
  clearSession();
  setToken(null);
  showToast('Logged out successfully.');
  setTimeout(() => { window.location.href = 'index.html'; }, 600);
}
