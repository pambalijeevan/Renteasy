/* ── Add Property Page ─────────────────────────────────────────── */

'use strict';

const AMENITIES_LIST = [
  'High-Speed WiFi','Covered Parking','Visitor Parking','Gym & Fitness Center',
  'Swimming Pool','24/7 Security','CCTV Surveillance','Power Backup',
  'Lift/Elevator','Air Conditioning','Modular Kitchen','Water Supply 24/7',
  'Gated Community',"Children's Play Area",'Community Hall','Jogging Track',
  'Garden / Terrace','Servant Quarters','Home Theater','Pet Friendly',
  'Intercom','Rain Water Harvesting',
];
const NEARBY_CATEGORIES = [
  { value:'metro',      label:'Metro Station'     },
  { value:'mall',       label:'Shopping Mall'      },
  { value:'hospital',   label:'Hospital'           },
  { value:'school',     label:'School / College'   },
  { value:'park',       label:'Park / Garden'      },
  { value:'restaurant', label:'Restaurant / Café'  },
  { value:'other',      label:'Other'              },
];

// ─── State ────────────────────────────────────────────────────
let mainImages    = [];    // {dataUrl, file}
let nearbyImages  = [];
let foodImages    = [];
let tourFileName  = '';
let tourFile      = null;
let tourDataUrl   = '';
let tourReadPromise = Promise.resolve();
let nearbyPlaces  = [{ id: '1', name: '', distance: '', category: 'metro' }];
let selectedAmenities = new Set();
let currentUser   = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
  currentUser = getSession();
  if (!currentUser || currentUser.role !== 'owner') {
    window.location.href = 'login.html'; return;
  }

  // Pre-fill phone
  if (currentUser.phone) document.getElementById('owner-phone').value = currentUser.phone;

  // Populate Hyderabad areas
  const sel = document.getElementById('location');
  HYDERABAD_AREAS.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    sel.appendChild(opt);
  });

  renderNearbyPlaces();
  renderAmenities();
}

// ─── Image Handling ────────────────────────────────────────────
function handleImageFiles(files, type) {
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (type === 'main') {
        mainImages.push({ dataUrl, file, name: file.name });
        updateImgPreview('main-preview', mainImages, 'main');
        updateMainBadge();
      } else if (type === 'nearby') {
        nearbyImages.push({ dataUrl, file, name: file.name });
        updateImgPreview('nearby-preview', nearbyImages, 'nearby');
      } else if (type === 'food') {
        foodImages.push({ dataUrl, file, name: file.name });
        updateImgPreview('food-preview', foodImages, 'food');
      }
    };
    reader.readAsDataURL(file);
  });
  // Reset input so same file can be re-selected
  if (type === 'main')   document.getElementById('main-input').value   = '';
  if (type === 'nearby') document.getElementById('nearby-input').value = '';
  if (type === 'food')   document.getElementById('food-input').value   = '';
}

function updateImgPreview(containerId, images, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = images.map((img, idx) => `
    <div class="img-thumb">
      <img src="${img.dataUrl}" alt="Preview ${idx+1}" loading="lazy">
      ${idx === 0 && type === 'main' ? '<span class="img-main-badge">Main</span>' : ''}
      <div class="img-thumb-remove" onclick="removeImage('${type}', ${idx})">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
    </div>
  `).join('');
}

function removeImage(type, idx) {
  if (type === 'main') {
    mainImages.splice(idx, 1);
    updateImgPreview('main-preview', mainImages, 'main');
    updateMainBadge();
  } else if (type === 'nearby') {
    nearbyImages.splice(idx, 1);
    updateImgPreview('nearby-preview', nearbyImages, 'nearby');
  } else {
    foodImages.splice(idx, 1);
    updateImgPreview('food-preview', foodImages, 'food');
  }
}

function updateMainBadge() {
  const badge = document.getElementById('main-img-count');
  const count = mainImages.length;
  badge.textContent = `${count}/3 min`;
  badge.classList.toggle('met', count >= 3);
  const errEl = document.getElementById('err-images');
  if (count >= 3) { errEl.classList.add('hidden'); }
}

// ─── Tour File ─────────────────────────────────────────────────
function handleTourFile(files) {
  const file = files[0];
  if (!file) return;
  tourFileName = file.name;
  tourFile     = file;
  tourDataUrl  = '';
  document.getElementById('tour-file-name').textContent = file.name;
  document.getElementById('tour-file-display').classList.remove('hidden');
  tourReadPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload  = (e) => { tourDataUrl = e.target.result; resolve(); };
    reader.onerror = () => resolve();
    reader.readAsDataURL(file);
  });
}
function removeTourFile() {
  tourFileName    = '';
  tourFile        = null;
  tourDataUrl     = '';
  tourReadPromise = Promise.resolve();
  document.getElementById('tour-file-display').classList.add('hidden');
  document.getElementById('tour-input').value = '';
}

// ─── Nearby Places ─────────────────────────────────────────────
function renderNearbyPlaces() {
  const container = document.getElementById('nearby-places-list');
  container.innerHTML = nearbyPlaces.map((place, idx) => `
    <div class="nearby-place-row" id="np-row-${place.id}">
      <div class="place-num">${idx + 1}</div>
      <div class="nearby-place-fields">
        <input type="text" placeholder="Place name (e.g., Hitech City Metro)"
          value="${place.name}" oninput="updateNearbyPlace('${place.id}','name',this.value)">
        <input type="text" placeholder="Distance (e.g., 0.5 km)"
          value="${place.distance}" oninput="updateNearbyPlace('${place.id}','distance',this.value)">
        <select onchange="updateNearbyPlace('${place.id}','category',this.value)">
          ${NEARBY_CATEGORIES.map(c => `<option value="${c.value}" ${place.category===c.value?'selected':''}>${c.label}</option>`).join('')}
        </select>
      </div>
      ${nearbyPlaces.length > 1 ? `
        <button type="button" onclick="removeNearbyPlace('${place.id}')" style="color:var(--gray-400);padding:.25rem;flex-shrink:0;margin-top:.5rem;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      ` : ''}
    </div>
  `).join('');
}
function addNearbyPlace() {
  nearbyPlaces.push({ id: Date.now().toString(), name: '', distance: '', category: 'other' });
  renderNearbyPlaces();
}
function updateNearbyPlace(id, field, value) {
  nearbyPlaces = nearbyPlaces.map(p => p.id === id ? { ...p, [field]: value } : p);
}
function removeNearbyPlace(id) {
  nearbyPlaces = nearbyPlaces.filter(p => p.id !== id);
  renderNearbyPlaces();
}

// ─── Amenities ─────────────────────────────────────────────────
function renderAmenities() {
  const grid = document.getElementById('amenities-grid');
  grid.innerHTML = AMENITIES_LIST.map(a => {
    const checked = selectedAmenities.has(a);
    return `
      <label class="amenity-checkbox ${checked ? 'checked' : ''}" onclick="toggleAmenity('${a.replace(/'/g,"\\'")}', this)">
        <span class="check-icon">
          ${checked
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`}
        </span>
        ${a}
      </label>
    `;
  }).join('');
}
function toggleAmenity(amenity, el) {
  if (selectedAmenities.has(amenity)) {
    selectedAmenities.delete(amenity);
    el.classList.remove('checked');
    el.querySelector('.check-icon').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`;
  } else {
    selectedAmenities.add(amenity);
    el.classList.add('checked');
    el.querySelector('.check-icon').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`;
  }
}

// ─── Error Helpers ─────────────────────────────────────────────
function showFieldError(fieldId, msg) {
  const el = document.getElementById(`err-${fieldId}`);
  if (el) {
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${msg}`;
    el.classList.remove('hidden');
  }
}
function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.classList.add('hidden'));
}

// ─── Submit ────────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  clearErrors();

  const title       = document.getElementById('title').value.trim();
  const type        = document.getElementById('type').value;
  const furnishing  = document.getElementById('furnishing').value;
  const description = document.getElementById('description').value.trim();
  const price       = document.getElementById('price').value;
  const bedrooms    = document.getElementById('bedrooms').value;
  const bathrooms   = document.getElementById('bathrooms').value;
  const area        = document.getElementById('area').value;
  const location    = document.getElementById('location').value;
  const avail       = document.getElementById('available-from').value;
  const phone       = document.getElementById('owner-phone').value.trim();

  let hasError = false;
  if (!title)                       { showFieldError('title',       'Property title is required');       hasError = true; }
  if (!type)                        { showFieldError('type',        'Property type is required');        hasError = true; }
  if (!description)                 { showFieldError('description', 'Description is required');          hasError = true; }
  if (!price || Number(price) <= 0) { showFieldError('price',       'Valid monthly rent is required');   hasError = true; }
  if (!bedrooms || Number(bedrooms) <= 0) { showFieldError('bedrooms', 'Bedrooms is required');         hasError = true; }
  if (!bathrooms || Number(bathrooms) <= 0) { showFieldError('bathrooms', 'Bathrooms is required');     hasError = true; }
  if (!area   || Number(area)   <= 0) { showFieldError('area',      'Area in sq ft is required');       hasError = true; }
  if (!location)                    { showFieldError('location',    'Area/locality is required');        hasError = true; }
  if (!furnishing)                  { showFieldError('furnishing',  'Furnishing status is required');    hasError = true; }
  if (!avail)                       { showFieldError('available',   'Available from date is required');  hasError = true; }
  if (!phone)                       { showFieldError('phone',       'Contact phone is required');        hasError = true; }
  if (mainImages.length < 3)        { showFieldError('images',      'At least 3 property images are required'); hasError = true; }

  if (hasError) {
    showToast('Please fix the errors and try again.', 'error');
    document.querySelector('.form-error:not(.hidden)')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const btn     = document.getElementById('submit-btn');
  const btnText = document.getElementById('submit-text');
  const spinner = document.getElementById('submit-spinner');
  btn.disabled  = true;
  btnText.textContent = 'Saving...';
  spinner.classList.remove('hidden');

  try {
    const validNearby = nearbyPlaces.filter(p => p.name.trim() && p.distance.trim());
    // Ensure the tour file data URL is ready before proceeding
    await tourReadPromise;
    let propertyData;
    let uploadedMainImgs    = mainImages.map(i => i.dataUrl);
    let uploadedNearbyImgs  = nearbyImages.map(i => i.dataUrl);
    let uploadedFoodImgs    = foodImages.map(i => i.dataUrl);

    const available = await checkApiAvailability();

    if (available) {
      // Try to upload images to server
      try {
        const imgUrls = await uploadImagesToServer(mainImages.map(i=>i.file), 'properties');
        if (imgUrls.length > 0) uploadedMainImgs = imgUrls;
        if (nearbyImages.length > 0) {
          const n = await uploadImagesToServer(nearbyImages.map(i=>i.file), 'nearby');
          if (n.length > 0) uploadedNearbyImgs = n;
        }
        if (foodImages.length > 0) {
          const f = await uploadImagesToServer(foodImages.map(i=>i.file), 'food');
          if (f.length > 0) uploadedFoodImgs = f;
        }
      } catch { /* Use dataUrls as fallback */ }

      let uploadedTourUrl = null;
      if (tourFile) {
        try { uploadedTourUrl = await uploadTourFileToServer(tourFile); } catch (e) { console.warn('Tour file upload failed:', e); }
      }

      propertyData = buildPropertyPayload(title, type, description, price, bedrooms, bathrooms,
        area, location, furnishing, avail, phone, tourFileName, uploadedTourUrl,
        uploadedMainImgs, uploadedNearbyImgs, uploadedFoodImgs, validNearby);

      const { ok, data } = await apiCall('/properties', { method: 'POST', body: propertyData });
      if (ok && data.success) {
        showToast('Property listed successfully!');
        setTimeout(() => { window.location.href = 'owner-dashboard.html'; }, 800);
        return;
      }
      showToast(data.error || 'Server error — saving locally.', 'error');
    }

    // Fallback: save to localStorage
    propertyData = buildPropertyPayload(title, type, description, price, bedrooms, bathrooms,
      area, location, furnishing, avail, phone, tourFileName, tourDataUrl || null,
      uploadedMainImgs, uploadedNearbyImgs, uploadedFoodImgs, validNearby);

    const localProp = {
      id: `prop-${Date.now()}`,
      ...propertyData,
      ownerId:    currentUser.id,
      ownerName:  currentUser.name,
      ownerEmail: currentUser.email,
      createdAt:  new Date().toISOString(),
    };
    saveLocalProperty(localProp);
    showToast('Property listed successfully!');
    setTimeout(() => { window.location.href = 'owner-dashboard.html'; }, 800);

  } catch (err) {
    showToast('Failed to save property. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btnText.textContent = 'List Property';
    spinner.classList.add('hidden');
  }
}

async function uploadImagesToServer(files, type) {
  const formData = new FormData();
  files.forEach(f => formData.append('images', f));
  formData.append('type', type);
  const token = getToken();
  const res = await fetch(`${API_BASE}/upload/images`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  return data.urls || [];
}

async function uploadTourFileToServer(file) {
  const formData = new FormData();
  formData.append('tour', file);
  const token = getToken();
  const res = await fetch(`${API_BASE}/upload/tour`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url || null;
}

function buildPropertyPayload(title, type, description, price, bedrooms, bathrooms,
  area, location, furnishing, avail, phone, tourFileName, tourUrl,
  images, nearbyImages, foodImages, nearbyPlaces) {
  return {
    title, type, description,
    price:       Number(price),
    bedrooms:    Number(bedrooms),
    bathrooms:   Number(bathrooms),
    area:        Number(area),
    location:    `${location}, Hyderabad`,
    city:        'Hyderabad',
    furnishing,
    availableFrom:       avail,
    ownerPhone:          phone,
    tourFileName:        tourFileName || null,
    tourUrl:             tourUrl || null,
    images,
    nearbyPlacesImages:  nearbyImages,
    foodCourtImages:     foodImages,
    nearbyPlaces,
    amenities:           Array.from(selectedAmenities),
  };
}
