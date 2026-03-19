/* ============================================================
   Rent Easy — Common JavaScript
   Shared utilities, session management, API helpers, mock data
   ============================================================ */

'use strict';

// ─── API Base URL ─────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

// ─── Mock Hyderabad Properties (fallback when API is unavailable) ──
const MOCK_PROPERTIES = [
  {
    id: 'mock-1',
    title: 'Luxury 3BHK Apartment in Banjara Hills',
    description: 'Stunning 3BHK luxury apartment in the heart of Banjara Hills. Fully furnished with premium interiors, modular kitchen, and spacious balcony offering breathtaking views of Hyderabad skyline. Just minutes from GVK One Mall, Apollo Hospital, and Hyderabad Metro.',
    type: 'Apartment', price: 45000, bedrooms: 3, bathrooms: 3, area: 1800,
    location: 'Banjara Hills, Road No. 12', city: 'Hyderabad', furnishing: 'Fully Furnished',
    images: [
      'https://images.unsplash.com/photo-1711869206287-33a83984d6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    nearbyPlacesImages: [
      'https://images.unsplash.com/photo-1766486232326-ea3937a1a9c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1661695013579-9cdd5d1ef425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    foodCourtImages: [
      'https://images.unsplash.com/photo-1722573783453-2976e515fe3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    nearbyPlaces: [
      { name: 'Banjara Hills Metro Station', distance: '0.3 km', category: 'metro' },
      { name: 'GVK One Mall',               distance: '1.2 km', category: 'mall' },
      { name: 'Apollo Hospital',            distance: '0.8 km', category: 'hospital' },
      { name: 'KBR National Park',          distance: '2.5 km', category: 'park' },
      { name: 'Eat Street',                 distance: '1.8 km', category: 'restaurant' },
    ],
    amenities: ['High-Speed WiFi','Gym & Fitness Center','Swimming Pool','Covered Parking','24/7 Security','CCTV Surveillance','Power Backup','Lift/Elevator','Modular Kitchen','Air Conditioning'],
    ownerId: 'mock-owner-1', ownerName: 'Ravi Reddy', ownerPhone: '+91 98480 12345', ownerEmail: 'ravi.reddy@gmail.com',
    availableFrom: '2026-03-15', createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mock-2',
    title: 'Modern 2BHK Flat in Hitech City',
    description: 'Brand new 2BHK apartment in the IT hub of Hyderabad, Hitech City. Walking distance to Cyber Towers and major tech companies. Semi-furnished with modular kitchen, wardrobe, and AC in all rooms. Easy access to IKEA and Inorbit Mall.',
    type: 'Apartment', price: 32000, bedrooms: 2, bathrooms: 2, area: 1200,
    location: 'Hitech City, Madhapur', city: 'Hyderabad', furnishing: 'Semi-Furnished',
    images: [
      'https://images.unsplash.com/photo-1737305457496-dc7503cdde1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1711869206287-33a83984d6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    nearbyPlacesImages: [
      'https://images.unsplash.com/photo-1766486232326-ea3937a1a9c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1661695013579-9cdd5d1ef425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    foodCourtImages: [
      'https://images.unsplash.com/photo-1722573783453-2976e515fe3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    nearbyPlaces: [
      { name: 'Hitech City Metro Station', distance: '0.5 km', category: 'metro' },
      { name: 'Inorbit Mall',              distance: '1.0 km', category: 'mall' },
      { name: 'IKEA Hyderabad',            distance: '3.2 km', category: 'mall' },
      { name: 'Cyber Towers IT Park',      distance: '0.8 km', category: 'other' },
    ],
    amenities: ['High-Speed WiFi','Parking','24/7 Security','CCTV Surveillance','Power Backup','Lift/Elevator','Air Conditioning','Modular Kitchen','Gym & Fitness Center'],
    ownerId: 'mock-owner-2', ownerName: 'Lakshmi Narayanan', ownerPhone: '+91 99490 56789', ownerEmail: 'lakshmi.n@gmail.com',
    availableFrom: '2026-03-01', createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'mock-3',
    title: 'Premium 4BHK Villa in Jubilee Hills',
    description: 'Magnificent 4BHK independent villa in posh Jubilee Hills with a private garden, car porch, and stunning interiors. Ideal for large families seeking a blend of luxury and privacy. Close to Jubilee Hills Check Post and Film Nagar.',
    type: 'Villa', price: 85000, bedrooms: 4, bathrooms: 4, area: 3500,
    location: 'Jubilee Hills, Road No. 36', city: 'Hyderabad', furnishing: 'Fully Furnished',
    images: [
      'https://images.unsplash.com/photo-1647147092965-579d93ed773e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1711869206287-33a83984d6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    nearbyPlacesImages: [
      'https://images.unsplash.com/photo-1661695013579-9cdd5d1ef425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    foodCourtImages: [
      'https://images.unsplash.com/photo-1722573783453-2976e515fe3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    nearbyPlaces: [
      { name: 'Jubilee Hills Check Post', distance: '0.4 km', category: 'other' },
      { name: "Ohri's Restaurant",        distance: '1.0 km', category: 'restaurant' },
      { name: 'Hyderabad Public School',  distance: '1.5 km', category: 'school' },
      { name: 'KIMS Hospital',            distance: '2.2 km', category: 'hospital' },
    ],
    amenities: ['Private Garden','Car Porch','Swimming Pool','High-Speed WiFi','24/7 Security','Power Backup','Air Conditioning','Modular Kitchen','Home Theater','Servant Quarters','Terrace','CCTV Surveillance'],
    ownerId: 'mock-owner-3', ownerName: 'Suresh Babu', ownerPhone: '+91 97000 34567', ownerEmail: 'suresh.babu@gmail.com',
    availableFrom: '2026-04-01', createdAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'mock-4',
    title: 'Affordable 1BHK Studio in Kondapur',
    description: 'Well-maintained 1BHK studio apartment in Kondapur, ideal for working professionals. Unfurnished but has all basic fixtures. Very close to Gachibowli IT corridor. Good connectivity with TSRTC buses and shared autos.',
    type: 'Studio', price: 16000, bedrooms: 1, bathrooms: 1, area: 650,
    location: 'Kondapur, Near Raheja IT Park', city: 'Hyderabad', furnishing: 'Unfurnished',
    images: [
      'https://images.unsplash.com/photo-1737305457496-dc7503cdde1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    nearbyPlacesImages: [
      'https://images.unsplash.com/photo-1766486232326-ea3937a1a9c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    foodCourtImages: [],
    nearbyPlaces: [
      { name: 'Kondapur Metro Station', distance: '0.7 km', category: 'metro' },
      { name: 'Raheja IT Park',         distance: '0.3 km', category: 'other' },
      { name: 'Kondapur Market',        distance: '0.5 km', category: 'other' },
    ],
    amenities: ['High-Speed WiFi','Parking','24/7 Water Supply','Security Guard','Power Backup','Lift/Elevator'],
    ownerId: 'mock-owner-4', ownerName: 'Anitha Rao', ownerPhone: '+91 91000 78901', ownerEmail: 'anitha.rao@gmail.com',
    availableFrom: '2026-03-10', createdAt: '2026-01-04T00:00:00.000Z',
  },
];

// ─── Session Management ────────────────────────────────────────
function getSession() {
  try { return JSON.parse(localStorage.getItem('rentEasy_session') || 'null'); }
  catch { return null; }
}
function setSession(user) {
  if (user) localStorage.setItem('rentEasy_session', JSON.stringify(user));
  else localStorage.removeItem('rentEasy_session');
}
function clearSession() {
  localStorage.removeItem('rentEasy_session');
}
function getToken() {
  return localStorage.getItem('rentEasy_token') || '';
}
function setToken(token) {
  if (token) localStorage.setItem('rentEasy_token', token);
  else localStorage.removeItem('rentEasy_token');
}

// ─── Local Storage Property Helpers ───────────────────────────
function getLocalProperties() {
  try {
    const stored = JSON.parse(localStorage.getItem('rentEasy_properties') || '[]');
    const storedIds = new Set(stored.map(p => String(p.id)));
    const extras = MOCK_PROPERTIES.filter(m => !storedIds.has(String(m.id)));
    return [...extras, ...stored];
  } catch { return MOCK_PROPERTIES; }
}
function saveLocalProperty(property) {
  const existing = JSON.parse(localStorage.getItem('rentEasy_properties') || '[]');
  existing.push(property);
  localStorage.setItem('rentEasy_properties', JSON.stringify(existing));
}
function deleteLocalProperty(id) {
  const existing = JSON.parse(localStorage.getItem('rentEasy_properties') || '[]');
  const updated = existing.filter(p => String(p.id) !== String(id));
  localStorage.setItem('rentEasy_properties', JSON.stringify(updated));
}

// ─── Local Auth Helpers ────────────────────────────────────────
function getLocalAccounts() {
  try { return JSON.parse(localStorage.getItem('rentEasy_accounts') || '[]'); }
  catch { return []; }
}
function registerLocalUser({ name, email, phone, password, role }) {
  const accounts = getLocalAccounts();
  const existing = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.role === role);
  if (existing) return { success: false, message: `An ${role} account with this email already exists. Please sign in.` };
  const newAcc = { id: Date.now().toString(), name, email, phone, password, role, createdAt: new Date().toISOString() };
  accounts.push(newAcc);
  localStorage.setItem('rentEasy_accounts', JSON.stringify(accounts));
  return { success: true, message: 'Account created successfully!' };
}
function loginLocalUser(email, password, role) {
  const accounts = getLocalAccounts();
  const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.role === role);
  if (!account) return { success: false, message: `No ${role} account found with this email. Please create an account first.` };
  if (account.password !== password) return { success: false, message: 'Incorrect password. Please try again.' };
  return {
    success: true,
    message: `Welcome back, ${account.name}!`,
    user: { id: account.id, name: account.name, email: account.email, phone: account.phone, role: account.role }
  };
}

// ─── API Call Helper ───────────────────────────────────────────
async function apiCall(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body === 'object' && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body,
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { ok: res.ok, status: res.status, data };
}

// API available flag
let apiAvailable = null;
async function checkApiAvailability() {
  if (apiAvailable !== null) return apiAvailable;
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch(`${API_BASE}/health`, { signal: ctrl.signal });
    apiAvailable = res.ok;
  } catch { apiAvailable = false; }
  return apiAvailable;
}

// ─── Toast Notifications ────────────────────────────────────── 
let toastContainer = null;
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}
function showToast(message, type = 'success') {
  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    info:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

// ─── Format Helpers ────────────────────────────────────────────
function formatPrice(price) {
  return new Intl.NumberFormat('en-IN').format(price);
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── SVG Icons (inline) ────────────────────────────────────────
const ICONS = {
  building: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
  mapPin:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  bed:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
  bath:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.4 2 2 0 0 0-2 2 1.5 1.5 0 0 0 .4 1L6 9"/><path d="M5 8H22V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"/><path d="M10 14v3"/><path d="M14 14v3"/></svg>`,
  maximize: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  box:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  image:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><polyline points="21 15 16 10 5 21"/></svg>`,
  logOut:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  plus:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  eye:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  search:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  x:        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  chevLeft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevRight:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`,
  arrowLeft:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  arrowRight:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  check:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alert:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  info:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  phone:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 4.91 2 2 0 0 1 3.6 2.76h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>`,
  mail:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  copy:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="13" height="13" x="9" y="9" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  message:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  expand:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  sliders:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  upload:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  utensils: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  train:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/></svg>`,
  shop:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  activity: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  grad:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  tree:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 14h.01"/><path d="M7 7h.01"/><path d="M12 11V3"/><path d="M7 10.354V21"/><path d="M17 10.354V21"/><path d="M7 3H3l4 7H3l4 7h3M17 3h4l-4 7h4l-4 7h-3"/></svg>`,
  star:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  home:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  users:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  shield:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  userPlus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
  logIn:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
  user:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  square:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`,
  checkSq:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
};

// ─── Gallery Modal ─────────────────────────────────────────────
let galleryState = { images: [], index: 0, title: '' };

function openGallery(images, index, title) {
  if (!images || images.length === 0) return;
  galleryState = { images, index, title };
  renderGallery();
  document.getElementById('gallery-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeGallery() {
  const modal = document.getElementById('gallery-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}
function renderGallery() {
  const { images, index, title } = galleryState;
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;

  modal.querySelector('.gallery-modal-title').textContent = title;
  modal.querySelector('.gallery-counter').textContent = `${index + 1} / ${images.length}`;
  modal.querySelector('.gallery-main-img').src = images[index];

  const thumbs = modal.querySelector('.gallery-thumbs');
  thumbs.innerHTML = images.map((img, i) => `
    <button class="gallery-thumb ${i === index ? 'active' : ''}" onclick="galleryGoTo(${i})">
      <img src="${img}" alt="Photo ${i + 1}">
    </button>
  `).join('');
}
function galleryGoTo(index) {
  galleryState.index = (index + galleryState.images.length) % galleryState.images.length;
  renderGallery();
}

// Build gallery modal HTML (injected once per page)
function initGalleryModal() {
  if (document.getElementById('gallery-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'gallery-modal';
  modal.className = 'gallery-modal hidden';
  modal.innerHTML = `
    <div class="gallery-modal-header">
      <div>
        <div class="gallery-modal-title"></div>
        <div class="gallery-counter" style="color:rgba(255,255,255,.6);font-size:.8rem;margin-top:.1rem;"></div>
      </div>
      <button class="gallery-close" onclick="closeGallery()">${ICONS.x}</button>
    </div>
    <img class="gallery-main-img" src="" alt="Gallery image" style="user-select:none;">
    <button class="gallery-nav gallery-nav-prev" onclick="galleryGoTo(galleryState.index - 1)">${ICONS.chevLeft}</button>
    <button class="gallery-nav gallery-nav-next" onclick="galleryGoTo(galleryState.index + 1)">${ICONS.chevRight}</button>
    <div class="gallery-thumbs"></div>
  `;
  document.body.appendChild(modal);
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft')  galleryGoTo(galleryState.index - 1);
    if (e.key === 'ArrowRight') galleryGoTo(galleryState.index + 1);
    if (e.key === 'Escape')     closeGallery();
  });
  // Click backdrop to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeGallery();
  });
}

// ─── Hyderabad Areas List ──────────────────────────────────────
const HYDERABAD_AREAS = [
  'Banjara Hills','Jubilee Hills','Hitech City','Madhapur','Gachibowli',
  'Kondapur','Kukatpally','Begumpet','Secunderabad','Ameerpet',
  'Somajiguda','Panjagutta','SR Nagar','Miyapur','Manikonda',
  'Tolichowki','Mehdipatnam','Attapur','Narsingi','Financial District',
  'Uppal','LB Nagar','Dilsukhnagar','Nizampet','Bachupally',
];

// ─── Build property card HTML ──────────────────────────────────
function buildPropertyCardHTML(property, withActions = false) {
  const mainImg = property.images && property.images[0] ? property.images[0] : '';
  const imgCount = property.images ? property.images.length : 0;
  const hasTour = property.tourFileName || property.tour_file_name;
  const furnishing = property.furnishing || '';
  const price = formatPrice(property.price);
  const bedrooms = property.bedrooms;
  const bathrooms = property.bathrooms;
  const area = property.area;
  const amenities = property.amenities || [];

  const actionsHTML = withActions ? `
    <div class="card-actions" style="display:flex;gap:.5rem;padding:.75rem 1rem;border-top:1px solid var(--gray-100);">
      <a href="property-details.html?id=${property.id}" class="btn btn-outline btn-sm" style="flex:1;text-align:center;gap:.25rem;">
        <span style="width:1rem;height:1rem;display:inline-flex;">${ICONS.eye}</span> View
      </a>
      <button class="btn btn-ghost btn-sm delete-btn" data-id="${property.id}" title="Delete" style="color:var(--gray-500);">
        <span style="width:1rem;height:1rem;display:inline-flex;">${ICONS.trash}</span>
      </button>
    </div>
  ` : '';

  return `
    <div class="property-card" onclick="${withActions ? '' : `window.location.href='property-details.html?id=${property.id}'`}" style="${withActions ? 'cursor:default' : ''}">
      <div class="property-card-image">
        ${mainImg
          ? `<img src="${mainImg}" alt="${property.title}" loading="lazy">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><span style="color:var(--gray-300);width:3rem;height:3rem;">${ICONS.home}</span></div>`}
        <div class="property-card-badges">
          <span class="badge badge-orange" style="font-size:.7rem;">${property.type}</span>
        </div>
        <div class="property-card-badges-right">
          ${imgCount > 1 ? `<span class="badge badge-dark" style="font-size:.7rem;gap:.2rem;"><span style="width:.75rem;height:.75rem;display:inline-flex;">${ICONS.image}</span>${imgCount}</span>` : ''}
          ${hasTour ? `<span class="badge badge-blue" style="font-size:.7rem;gap:.2rem;"><span style="width:.75rem;height:.75rem;display:inline-flex;">${ICONS.box}</span>3D</span>` : ''}
        </div>
        ${furnishing ? `<div class="property-card-bottom-badge"><span class="badge" style="background:rgba(255,255,255,.9);color:var(--gray-700);font-size:.7rem;">${furnishing}</span></div>` : ''}
      </div>
      <div class="property-card-body">
        <div class="property-card-title line-clamp-1">${property.title}</div>
        <div class="property-card-location">
          <span style="width:.875rem;height:.875rem;display:inline-flex;flex-shrink:0;">${ICONS.mapPin}</span>
          <span class="truncate">${property.location}</span>
        </div>
        <div class="property-card-price">
          <span class="property-card-price-value">₹${price}</span>
          <span class="property-card-price-unit">/month</span>
        </div>
        <div class="property-card-specs">
          <span><span style="width:.875rem;height:.875rem;display:inline-flex;">${ICONS.bed}</span>${bedrooms} Bed</span>
          <span><span style="width:.875rem;height:.875rem;display:inline-flex;">${ICONS.bath}</span>${bathrooms} Bath</span>
          <span><span style="width:.875rem;height:.875rem;display:inline-flex;">${ICONS.maximize}</span>${area} sqft</span>
        </div>
        ${amenities.length > 0 ? `
          <div class="property-card-amenities">
            ${amenities.slice(0, 3).map(a => `<span class="amenity-pill">${a}</span>`).join('')}
            ${amenities.length > 3 ? `<span class="amenity-pill-gray">+${amenities.length - 3}</span>` : ''}
          </div>
        ` : ''}
      </div>
      ${actionsHTML}
    </div>
  `;
}

// ─── Header Logo HTML ──────────────────────────────────────────
function buildLogoHTML(href = 'index.html') {
  return `
    <a href="${href}" class="logo">
      <div class="logo-icon">${ICONS.building}</div>
      <div>
        <div class="logo-text">Rent Easy</div>
        <div class="logo-sub">Hyderabad's #1 Rental Platform</div>
      </div>
    </a>
  `;
}

// ─── Init on DOM load ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initGalleryModal();
});
