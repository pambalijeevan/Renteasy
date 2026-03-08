/* ── Property Details Page ─────────────────────────────────────── */

'use strict';

let currentUser   = null;
let property      = null;
let activeImgIdx  = 0;
let contactSent   = false;
let showInquiry   = false;

const CAT_COLORS = {
  metro:      'cat-metro',
  mall:       'cat-mall',
  hospital:   'cat-hospital',
  school:     'cat-school',
  park:       'cat-park',
  restaurant: 'cat-restaurant',
  other:      'cat-other',
};
const CAT_ICONS = {
  metro:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/></svg>`,
  mall:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  hospital:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  school:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  park:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 14h.01"/><path d="M7 7h.01"/><path d="M12 11V3"/><path d="M7 10.354V21"/><path d="M17 10.354V21"/><path d="M7 3H3l4 7H3l4 7h3M17 3h4l-4 7h4l-4 7h-3"/></svg>`,
  restaurant: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  other:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  currentUser = getSession();
  if (!currentUser) { window.location.href = 'login.html'; return; }

  const params   = new URLSearchParams(window.location.search);
  const propId   = params.get('id');
  const backLink = currentUser.role === 'owner' ? 'owner-dashboard.html' : 'tenant-dashboard.html';

  document.getElementById('back-link').href   = backLink;
  document.getElementById('back-link-2').href = backLink;
  document.getElementById('header-logo').href = backLink;

  if (!propId) {
    showToast('Property not found.', 'error');
    window.location.href = backLink; return;
  }

  await loadProperty(propId, backLink);
}

async function loadProperty(propId, backLink) {
  try {
    const available = await checkApiAvailability();
    if (available) {
      const { ok, data } = await apiCall(`/properties/${propId}`);
      if (ok && data.success) {
        property = normalizeProperty(data.property);
      }
    }
    if (!property) {
      const all = getLocalProperties();
      property = all.find(p => String(p.id) === String(propId));
      if (property) property = normalizeProperty(property);
    }
  } catch {
    const all = getLocalProperties();
    const found = all.find(p => String(p.id) === String(propId));
    if (found) property = normalizeProperty(found);
  }

  if (!property) {
    showToast('Property not found.', 'error');
    setTimeout(() => { window.location.href = backLink; }, 1000);
    return;
  }

  renderPage();
}

// Normalize API response vs localStorage shape
function normalizeProperty(p) {
  return {
    ...p,
    ownerName:    p.ownerName    || p.owner_name    || '',
    ownerPhone:   p.ownerPhone   || p.owner_phone   || '',
    ownerEmail:   p.ownerEmail   || p.owner_email   || '',
    tourFileName: p.tourFileName || p.tour_file_name || '',
    availableFrom:p.availableFrom|| p.available_from || '',
    nearbyPlacesImages: p.nearbyPlacesImages || [],
    foodCourtImages:    p.foodCourtImages    || [],
    nearbyPlaces:       (p.nearbyPlaces || []).map(np => ({
      name:     np.name,
      distance: np.distance,
      category: np.category || 'other',
    })),
    amenities: p.amenities || [],
    images:    p.images    || [],
  };
}

function renderPage() {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('main-content').style.display   = 'block';

  // Title & Location
  document.getElementById('property-title').textContent = property.title;
  document.getElementById('property-location').textContent =
    `${property.location}${property.location.toLowerCase().includes('hyderabad') ? '' : ', Hyderabad'}, Telangana`;
  document.getElementById('furnishing-badge').textContent = property.furnishing;
  document.getElementById('property-description').textContent = property.description;

  // Badges
  document.getElementById('type-badge').innerHTML =
    `<span class="badge badge-orange" style="font-size:.875rem;">${property.type}</span>`;
  if (property.tourFileName) {
    document.getElementById('tour-badge').style.display = '';
    document.getElementById('tour-badge').innerHTML =
      `<span class="badge badge-blue" style="display:flex;align-items:center;gap:.375rem;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
        3D Tour Available
      </span>`;
  }

  // Main image
  setMainImage(0);
  buildThumbnails();

  // Key stats
  document.getElementById('key-stats').innerHTML = [
    { icon: ICONS.bed,      value: property.bedrooms,   label: 'Bedrooms'       },
    { icon: ICONS.bath,     value: property.bathrooms,  label: 'Bathrooms'      },
    { icon: ICONS.maximize, value: property.area,       label: 'Sq Ft'          },
    { icon: ICONS.calendar, value: formatDateShort(property.availableFrom), label: 'Available From' },
  ].map(s => `
    <div class="stat-card">
      <div class="stat-icon">${s.icon}</div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');

  // Amenities
  if (property.amenities.length > 0) {
    document.getElementById('amenities-section').classList.remove('hidden');
    document.getElementById('amenities-list').innerHTML = property.amenities.map(a => `
      <div class="amenity-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        ${a}
      </div>
    `).join('');
  }

  // 3D Tour
  if (property.tourFileName) {
    document.getElementById('tour-section').classList.remove('hidden');
    document.getElementById('tour-file-name').textContent = property.tourFileName;
  }

  // Nearby images
  if (property.nearbyPlacesImages.length > 0) {
    document.getElementById('nearby-section').classList.remove('hidden');
    document.getElementById('nearby-gallery').innerHTML =
      property.nearbyPlacesImages.map((img, i) => `
        <div class="gallery-thumb-click" onclick="openGallery(nearbyImagesArr, ${i}, 'Nearby Places Photos')">
          <img src="${img}" alt="Nearby ${i+1}" loading="lazy">
        </div>
      `).join('');
    document.getElementById('nearby-view-all').textContent =
      `View all ${property.nearbyPlacesImages.length} photos →`;
  }

  // Food images
  if (property.foodCourtImages.length > 0) {
    document.getElementById('food-section').classList.remove('hidden');
    document.getElementById('food-gallery').innerHTML =
      property.foodCourtImages.map((img, i) => `
        <div class="gallery-thumb-click" onclick="openGallery(foodImagesArr, ${i}, 'Food Courts & Restaurants')">
          <img src="${img}" alt="Food ${i+1}" loading="lazy">
        </div>
      `).join('');
  }

  // Nearby places list
  if (property.nearbyPlaces.length > 0) {
    document.getElementById('nearby-list-section').classList.remove('hidden');
    document.getElementById('nearby-list').innerHTML = property.nearbyPlaces.map(place => {
      const colorClass = CAT_COLORS[place.category] || 'cat-other';
      const icon       = CAT_ICONS[place.category]  || CAT_ICONS.other;
      return `
        <div class="nearby-place-item">
          <div class="nearby-cat-icon ${colorClass}">${icon}</div>
          <div>
            <div class="nearby-place-name">${place.name}</div>
            <div class="nearby-place-dist">${place.distance}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Sidebar
  document.getElementById('sidebar-price').textContent = `₹${formatPrice(property.price)}`;
  document.getElementById('sidebar-avail').textContent = formatDate(property.availableFrom);
  document.getElementById('owner-initial').textContent = property.ownerName.charAt(0).toUpperCase() || '?';
  document.getElementById('owner-name').textContent    = property.ownerName;
  document.getElementById('owner-phone-text').textContent = property.ownerPhone;
  document.getElementById('owner-email-text').textContent = property.ownerEmail;

  renderContactActions();

  // Quick details
  document.getElementById('quick-details').innerHTML = [
    { label: 'Property Type', value: property.type        },
    { label: 'Furnishing',    value: property.furnishing  },
    { label: 'Floor Area',    value: `${property.area} sq ft` },
    { label: 'Bedrooms',      value: `${property.bedrooms} BHK` },
    { label: 'Bathrooms',     value: property.bathrooms   },
    { label: 'Location',      value: property.location    },
  ].map(d => `
    <div class="quick-detail-row">
      <span>${d.label}</span>
      <span>${d.value}</span>
    </div>
  `).join('');
}

// ─── Gallery helpers ───────────────────────────────────────────
let nearbyImagesArr = [];
let foodImagesArr   = [];

function setMainImage(idx) {
  if (!property.images.length) return;
  activeImgIdx = (idx + property.images.length) % property.images.length;
  document.getElementById('main-gallery-img').src = property.images[activeImgIdx];

  // Counter
  const counter = document.getElementById('gallery-counter');
  if (property.images.length > 1) {
    counter.classList.remove('hidden');
    counter.textContent = `${activeImgIdx + 1} / ${property.images.length}`;
  }
  // Thumbnails
  document.querySelectorAll('.thumb-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === activeImgIdx);
  });
}

function changeMainImg(dir) {
  setMainImage(activeImgIdx + dir);
}

function buildThumbnails() {
  nearbyImagesArr = property.nearbyPlacesImages;
  foodImagesArr   = property.foodCourtImages;

  const strip = document.getElementById('thumb-strip');
  if (property.images.length <= 1) { strip.style.display = 'none'; return; }

  strip.innerHTML = property.images.map((img, i) => `
    <button class="thumb-btn ${i === 0 ? 'active' : ''}" onclick="setMainImage(${i})">
      <img src="${img}" alt="Thumb ${i+1}" loading="lazy">
    </button>
  `).join('') + `
    <div class="thumb-btn-all" onclick="openMainGallery()">All<br>${property.images.length}</div>
  `;
}

function openMainGallery() {
  openGallery(property.images, activeImgIdx, property.title);
}
function openNearbyGallery() {
  openGallery(property.nearbyPlacesImages, 0, 'Nearby Places Photos');
}

// ─── Contact Actions ───────────────────────────────────────────
function renderContactActions() {
  const container = document.getElementById('contact-actions');
  const isOwner   = currentUser.role === 'owner';
  const isMyProp  = isOwner && (property.ownerEmail === currentUser.email);

  if (isMyProp) {
    container.innerHTML = `
      <div class="owner-listing-box">
        <p style="font-weight:700;color:var(--orange-800);font-size:.875rem;">This is your property listing</p>
        <a href="owner-dashboard.html" style="display:block;margin-top:.5rem;font-size:.875rem;color:var(--orange-600);text-decoration:underline;">Manage in Dashboard</a>
      </div>`;
    return;
  }
  if (isOwner) return; // owner viewing another's property — no contact button

  if (contactSent) {
    container.innerHTML = `
      <div class="inquiry-sent-box">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" stroke-width="2" width="32" height="32" style="margin:0 auto .5rem;display:block;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p style="font-weight:700;color:var(--green-800);">Inquiry Sent!</p>
        <p style="font-size:.75rem;color:var(--green-700);margin-top:.375rem;">${property.ownerName} will contact you soon at your registered number.</p>
        <button onclick="resetContact()" style="margin-top:.75rem;font-size:.75rem;color:var(--green-600);text-decoration:underline;background:none;border:none;cursor:pointer;">Send another inquiry</button>
      </div>`;
    return;
  }
  if (showInquiry) {
    const defaultMsg = `Hi, I'm interested in renting "${property.title}" listed on Rent Easy. Could you please provide more details? Thank you.`;
    container.innerHTML = `
      <textarea class="inquiry-textarea" id="inquiry-msg">${defaultMsg}</textarea>
      <div class="inquiry-actions">
        <button class="inquiry-cancel-btn" onclick="toggleInquiry(false)">Cancel</button>
        <button class="inquiry-send-btn" onclick="sendInquiry()">Send Inquiry</button>
      </div>`;
    return;
  }
  container.innerHTML = `
    <button class="contact-btn-primary" onclick="toggleInquiry(true)">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="18" height="18"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      Contact Owner
    </button>
    <a href="tel:${property.ownerPhone}" class="contact-btn-call">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 4.91 2 2 0 0 1 3.6 2.76h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      Call ${property.ownerPhone}
    </a>`;
}

function toggleInquiry(show) {
  showInquiry = show;
  renderContactActions();
}

async function sendInquiry() {
  const msg = (document.getElementById('inquiry-msg')?.value || '').trim();
  if (!msg) return;

  try {
    const available = await checkApiAvailability();
    if (available) {
      await apiCall('/contact', {
        method: 'POST',
        body: { property_id: property.id, message: msg },
      });
    }
  } catch { /* ignore */ }

  contactSent  = true;
  showInquiry  = false;
  renderContactActions();
  showToast(`Inquiry sent to ${property.ownerName}! They will contact you soon.`);
}

function resetContact() {
  contactSent = false;
  showInquiry = false;
  renderContactActions();
}

function copyPhone() {
  navigator.clipboard.writeText(property.ownerPhone || '')
    .then(() => showToast('Phone number copied!'))
    .catch(() => showToast('Could not copy phone number.', 'error'));
}
