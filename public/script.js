// ==== GLOBAL STATE ====
let currentUser = null;
let allProperties = [];
let allUsers = [];
let uploadedPropertyImages = [];
let uploaded3DFile = null;
let uploaded3DFileName = '';
let uploaded3DFileType = '';
let uploadedNearbyImages = [];
let uploadedFoodImages = [];
let isSignupMode = true; // Start with signup mode
let currentImageGallery = [];
let currentImageIndex = 0;
let messageThreads = [];
let messages = [];
let activeThreadId = null;
let threadDrafts = {};
let messagesReturnPage = 'landing-page';
let currentViewingPropertyId = null;

const MESSAGE_THREADS_KEY = 'rentEasy_messageThreads';
const MESSAGES_KEY = 'rentEasy_messages';
const LOCAL_MESSAGES_UPDATED_EVENT = 'rentEasy:messagesUpdated';
const CURRENT_USER_KEY = 'currentUser';

// ==== INITIALIZATION ====
document.addEventListener('DOMContentLoaded', function() {
    loadUsersFromStorage();
    loadPropertiesFromStorage();
    loadMessagingFromStorage();
    bindMessagingSyncEvents();
    checkAuthStatus();
});

// ==== USER MANAGEMENT ====
function loadUsersFromStorage() {
    const stored = localStorage.getItem('users');
    if (stored) {
        allUsers = JSON.parse(stored);
    } else {
        allUsers = [];
        saveUsersToStorage();
    }
}

function saveUsersToStorage() {
    localStorage.setItem('users', JSON.stringify(allUsers));
}

function findUser(email, role) {
    return allUsers.find(u => u.email === email && u.role === role);
}

// ==== AUTHENTICATION ====
function checkAuthStatus() {
    const user = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
    if (user) {
        currentUser = JSON.parse(user);
        sessionStorage.setItem(CURRENT_USER_KEY, user);
        localStorage.removeItem(CURRENT_USER_KEY);
        if (currentUser.role === 'owner') {
            showOwnerDashboard();
        } else {
            showTenantDashboard();
        }
        updateMessageBadges();
    } else {
        showPage('landing-page');
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}-form`).classList.add('active');
}

function toggleAuthMode() {
    isSignupMode = !isSignupMode;
    
    const subtitle = document.getElementById('auth-subtitle');
    const toggleText = document.getElementById('auth-toggle-text');
    const tenantBtnText = document.getElementById('tenant-btn-text');
    const ownerBtnText = document.getElementById('owner-btn-text');

    if (isSignupMode) {
        subtitle.textContent = 'Create your account to continue';
        toggleText.textContent = 'Already have an account? Sign in';
        tenantBtnText.textContent = 'Create Tenant Account';
        ownerBtnText.textContent = 'Create Owner Account';
    } else {
        subtitle.textContent = 'Sign in to continue';
        toggleText.textContent = "Don't have an account? Sign up";
        tenantBtnText.textContent = 'Sign In as Tenant';
        ownerBtnText.textContent = 'Sign In as Owner';
    }
}

function handleAuth(event, role) {
    event.preventDefault();
    
    const email = document.getElementById(`${role}-email`).value;
    const password = document.getElementById(`${role}-password`).value;
    const name = document.getElementById(`${role}-name`).value;
    const phone = document.getElementById(`${role}-phone`).value;

    if (isSignupMode) {
        // SIGN UP MODE
        if (!name || !email || !password || !phone) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        // Check if user already exists
        const existingUser = findUser(email, role);
        if (existingUser) {
            showToast('An account with this email already exists. Please sign in.', 'error');
            return;
        }

        // Create new user
        const newUser = { email, password, name, phone, role };
        allUsers.push(newUser);
        saveUsersToStorage();

        currentUser = { email, role, name, phone };
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

        showToast(`Account created successfully! Welcome, ${name}!`, 'success');

        if (role === 'owner') {
            showOwnerDashboard();
        } else {
            showTenantDashboard();
        }
    } else {
        // SIGN IN MODE
        if (!email || !password) {
            showToast('Please enter email and password', 'error');
            return;
        }

        const user = findUser(email, role);
        if (!user) {
            showToast('No account found. Please create an account first.', 'error');
            return;
        }

        if (user.password !== password) {
            showToast('Incorrect password', 'error');
            return;
        }

        currentUser = { email: user.email, role: user.role, name: user.name, phone: user.phone };
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

        showToast(`Welcome back, ${user.name}!`, 'success');

        if (role === 'owner') {
            showOwnerDashboard();
        } else {
            showTenantDashboard();
        }
    }
}

function logout() {
    currentUser = null;
    activeThreadId = null;
    currentViewingPropertyId = null;
    threadDrafts = {};
    sessionStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    showPage('landing-page');
    showToast('Logged out successfully', 'success');
}

// ==== PROPERTIES DATA ====
function loadPropertiesFromStorage() {
    const stored = localStorage.getItem('properties');
    if (stored) {
        allProperties = JSON.parse(stored);
    } else {
        allProperties = [];
        savePropertiesToStorage();
    }
}

function savePropertiesToStorage() {
    localStorage.setItem('properties', JSON.stringify(allProperties));
}

// ==== MESSAGING DATA ====
function loadMessagingFromStorage() {
    const storedThreads = localStorage.getItem(MESSAGE_THREADS_KEY);
    const storedMessages = localStorage.getItem(MESSAGES_KEY);
    messageThreads = storedThreads ? JSON.parse(storedThreads) : [];
    messages = storedMessages ? JSON.parse(storedMessages) : [];
}

function saveMessagingToStorage() {
    localStorage.setItem(MESSAGE_THREADS_KEY, JSON.stringify(messageThreads));
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent(LOCAL_MESSAGES_UPDATED_EVENT));
}

function bindMessagingSyncEvents() {
    window.addEventListener('storage', function(event) {
        if (event.key !== MESSAGE_THREADS_KEY && event.key !== MESSAGES_KEY) {
            return;
        }
        loadMessagingFromStorage();
        refreshMessagingUI();
    });

    window.addEventListener(LOCAL_MESSAGES_UPDATED_EVENT, function() {
        refreshMessagingUI();
    });
}

function refreshMessagingUI() {
    updateMessageBadges();

    if (document.getElementById('messages-page')?.classList.contains('active')) {
        renderMessagesPage();
    }

    if (document.getElementById('property-details')?.classList.contains('active') && currentViewingPropertyId) {
        const property = allProperties.find((p) => p.id === currentViewingPropertyId);
        if (property && currentUser?.role === 'tenant') {
            renderTenantContactSection(property);
        }
    }
}

function formatTime(ts) {
    return new Date(ts).toLocaleString();
}

function makeThreadId(propertyId, ownerEmail, tenantEmail) {
    return [propertyId, ownerEmail.toLowerCase(), tenantEmail.toLowerCase()].join('__');
}

function getThreadMessages(threadId) {
    return messages
        .filter((m) => m.threadId === threadId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function getThreadsForCurrentUser() {
    if (!currentUser) return [];
    const filtered = messageThreads.filter((thread) => (
        currentUser.role === 'owner'
            ? thread.ownerEmail === currentUser.email
            : thread.tenantEmail === currentUser.email
    ));
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function getUnreadCountForCurrentUser() {
    if (!currentUser) return 0;
    const threadIds = new Set(getThreadsForCurrentUser().map((thread) => thread.threadId));
    return messages.filter((m) => {
        if (!threadIds.has(m.threadId)) return false;
        if (m.senderEmail === currentUser.email) return false;
        return !Array.isArray(m.readBy) || !m.readBy.includes(currentUser.email);
    }).length;
}

function updateMessageBadges() {
    const unread = getUnreadCountForCurrentUser();
    ['owner-messages-badge', 'tenant-messages-badge', 'details-messages-badge'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = unread;
        if (unread > 0) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

function ensureThread(property, tenantUser) {
    const threadId = makeThreadId(property.id, property.ownerEmail, tenantUser.email);
    let thread = messageThreads.find((t) => t.threadId === threadId);

    if (!thread) {
        const now = new Date().toISOString();
        thread = {
            threadId,
            propertyId: property.id,
            propertyTitle: property.title,
            ownerEmail: property.ownerEmail,
            ownerName: property.ownerName,
            tenantEmail: tenantUser.email,
            tenantName: tenantUser.name,
            createdAt: now,
            updatedAt: now,
        };
        messageThreads.push(thread);
    }

    return thread;
}

function appendMessage(threadId, senderRole, senderEmail, text) {
    const now = new Date().toISOString();
    const cleaned = (text || '').trim();
    if (!cleaned) return null;

    const msg = {
        id: `msg_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
        threadId,
        senderRole,
        senderEmail,
        text: cleaned,
        timestamp: now,
        readBy: [senderEmail],
    };
    messages.push(msg);

    const thread = messageThreads.find((t) => t.threadId === threadId);
    if (thread) {
        thread.updatedAt = now;
    }

    saveMessagingToStorage();
    return msg;
}

function markThreadRead(threadId, userEmail) {
    let changed = false;
    messages.forEach((m) => {
        if (m.threadId !== threadId) return;
        if (!Array.isArray(m.readBy)) {
            m.readBy = [];
        }
        if (!m.readBy.includes(userEmail)) {
            m.readBy.push(userEmail);
            changed = true;
        }
    });
    if (changed) {
        saveMessagingToStorage();
    }
}

function getThreadByPropertyForTenant(propertyId, tenantEmail) {
    return messageThreads.find((t) => t.propertyId === propertyId && t.tenantEmail === tenantEmail);
}

// ==== OWNER DASHBOARD ====
function showOwnerDashboard() {
    showPage('owner-dashboard');
    messagesReturnPage = 'owner-dashboard';
    document.getElementById('owner-name-display').textContent = currentUser.name;
    
    const ownerProperties = allProperties.filter(p => p.ownerEmail === currentUser.email);
    renderOwnerProperties(ownerProperties);
    updateMessageBadges();
}

function renderOwnerProperties(properties) {
    const grid = document.getElementById('owner-properties-grid');
    
    if (properties.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-home" style="font-size: 4rem; color: var(--gray-300); margin-bottom: 1rem;"></i>
                <p style="color: var(--gray-600); font-size: 1.125rem;">No properties listed yet. Add your first property!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = properties.map(property => `
        <div class="property-card">
            <img src="${property.propertyImages[0]}" alt="${property.title}" class="property-image" onclick="viewPropertyDetails('${property.id}')">
            <div class="property-content">
                <div class="property-header">
                    <h3 class="property-title">${property.title}</h3>
                    <span class="property-badge">${property.type}</span>
                </div>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${property.location}</span>
                </div>
                <div class="property-price">
                    ₹${property.price.toLocaleString('en-IN')} <span>/month</span>
                </div>
                <div class="property-features">
                    <span><i class="fas fa-bed"></i> ${property.bedrooms} Bed</span>
                    <span><i class="fas fa-bath"></i> ${property.bathrooms} Bath</span>
                    <span><i class="fas fa-ruler-combined"></i> ${property.area} sqft</span>
                </div>
                <div class="property-actions">
                    <button class="btn btn-outline btn-sm" onclick="viewPropertyDetails('${property.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="openMessagesForProperty('${property.id}')">
                        <i class="fas fa-comments"></i> View Queries
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="deleteProperty('${property.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function deleteProperty(id) {
    if (confirm('Are you sure you want to delete this property?')) {
        allProperties = allProperties.filter(p => p.id !== id);
        savePropertiesToStorage();
        showOwnerDashboard();
        showToast('Property deleted successfully', 'success');
    }
}

// ==== TENANT DASHBOARD ====
function showTenantDashboard() {
    showPage('tenant-dashboard');
    messagesReturnPage = 'tenant-dashboard';
    document.getElementById('tenant-name-display').textContent = currentUser.name;
    renderTenantProperties(allProperties);
    updateMessageBadges();
}

function renderTenantProperties(properties) {
    const grid = document.getElementById('tenant-properties-grid');
    
    if (properties.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-home" style="font-size: 4rem; color: var(--gray-300); margin-bottom: 1rem;"></i>
                <p style="color: var(--gray-600); font-size: 1.125rem;">No properties available at the moment.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = properties.map(property => `
        <div class="property-card" onclick="viewPropertyDetails('${property.id}')">
            <img src="${property.propertyImages[0]}" alt="${property.title}" class="property-image">
            <div class="property-content">
                <div class="property-header">
                    <h3 class="property-title">${property.title}</h3>
                    <span class="property-badge">${property.type}</span>
                </div>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${property.location}</span>
                </div>
                <div class="property-price">
                    ₹${property.price.toLocaleString('en-IN')} <span>/month</span>
                </div>
                <div class="property-features">
                    <span><i class="fas fa-bed"></i> ${property.bedrooms} Bed</span>
                    <span><i class="fas fa-bath"></i> ${property.bathrooms} Bath</span>
                    <span><i class="fas fa-ruler-combined"></i> ${property.area} sqft</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProperties() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const typeFilter = document.getElementById('type-filter').value;

    let filtered = allProperties.filter(property => {
        const matchesSearch = property.location.toLowerCase().includes(searchTerm) ||
                             property.title.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || property.type === typeFilter;
        return matchesSearch && matchesType;
    });

    renderTenantProperties(filtered);
}

// ==== PROPERTY DETAILS ====
function detect3DViewKind(property) {
    const src = property.view3D || '';
    const fileName = (property.view3DName || '').toLowerCase();
    const fileType = (property.view3DType || '').toLowerCase();

    const isImage =
        fileType.startsWith('image/') ||
        src.startsWith('data:image/') ||
        /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);

    const isVideo =
        fileType.startsWith('video/') ||
        src.startsWith('data:video/') ||
        /\.(mp4|webm|mov)$/i.test(fileName);

    const isModel =
        fileType.includes('gltf') ||
        fileType.startsWith('model/') ||
        src.startsWith('data:model/') ||
        /\.(glb|gltf)$/i.test(fileName);

    if (isImage) return 'image';
    if (isVideo) return 'video';
    if (isModel || src.startsWith('data:application/octet-stream')) return 'model';
    return 'file';
}

function render3DView(container, property) {
    const source = property.view3D;
    const fileLabel = property.view3DName || '3D Virtual Tour';
    const kind = detect3DViewKind(property);

    container.innerHTML = '';

    if (kind === 'model') {
        const modelViewer = document.createElement('model-viewer');
        modelViewer.className = 'inline-model-viewer';
        modelViewer.setAttribute('src', source);
        modelViewer.setAttribute('alt', `3D view of ${property.title}`);
        modelViewer.setAttribute('camera-controls', '');
        modelViewer.setAttribute('auto-rotate', '');
        modelViewer.setAttribute('touch-action', 'pan-y');
        modelViewer.setAttribute('shadow-intensity', '1');
        container.appendChild(modelViewer);

        const hint = document.createElement('p');
        hint.className = 'view-3d-help';
        hint.innerHTML = '<i class="fas fa-mouse-pointer"></i> Drag to rotate and scroll to zoom';
        container.appendChild(hint);
        return;
    }

    if (kind === 'image') {
        const image = document.createElement('img');
        image.src = source;
        image.alt = fileLabel;
        image.style.cursor = 'pointer';
        image.onclick = () => openImageModal([source], 0);
        container.appendChild(image);

        const hint = document.createElement('p');
        hint.className = 'view-3d-help';
        hint.innerHTML = '<i class="fas fa-info-circle"></i> Click image to view full size';
        container.appendChild(hint);
        return;
    }

    if (kind === 'video') {
        const video = document.createElement('video');
        video.src = source;
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        container.appendChild(video);
        return;
    }

    const fallback = document.createElement('div');
    fallback.className = 'view-3d-fallback';

    const icon = document.createElement('i');
    icon.className = 'fas fa-cube';
    icon.style.fontSize = '2.5rem';
    icon.style.color = 'var(--orange-600)';
    icon.style.marginBottom = '0.75rem';
    fallback.appendChild(icon);

    const title = document.createElement('p');
    title.style.fontWeight = '600';
    title.style.marginBottom = '0.25rem';
    title.textContent = fileLabel;
    fallback.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.style.color = 'var(--gray-600)';
    subtitle.style.marginBottom = '0.75rem';
    subtitle.textContent = 'Preview is unavailable for this format.';
    fallback.appendChild(subtitle);

    const downloadLink = document.createElement('a');
    downloadLink.href = source;
    downloadLink.download = fileLabel;
    downloadLink.className = 'btn btn-outline btn-sm view-3d-file-link';
    downloadLink.innerHTML = '<i class="fas fa-download"></i> Download 3D file';
    fallback.appendChild(downloadLink);

    container.appendChild(fallback);
}

function viewPropertyDetails(propertyId) {
    const property = allProperties.find(p => p.id === propertyId);
    if (!property) return;

    currentViewingPropertyId = propertyId;
    messagesReturnPage = 'property-details';
    showPage('property-details');

    // Property Images Gallery
    const mainImageDiv = document.getElementById('main-image');
    mainImageDiv.innerHTML = `<img src="${property.propertyImages[0]}" alt="${property.title}" onclick="openImageModal(${JSON.stringify(property.propertyImages).replace(/"/g, '&quot;')}, 0)">`;

    if (property.propertyImages.length > 1) {
        const thumbnailsDiv = document.getElementById('image-thumbnails');
        thumbnailsDiv.innerHTML = property.propertyImages.map((img, index) => `
            <img src="${img}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                 onclick="changeMainImage('${img}', event); openImageModal(${JSON.stringify(property.propertyImages).replace(/"/g, '&quot;')}, ${index})">
        `).join('');
    }

    // 3D View
    if (property.view3D) {
        document.getElementById('3d-view-section').style.display = 'block';
        render3DView(document.getElementById('3d-view-container'), property);
    } else {
        document.getElementById('3d-view-section').style.display = 'none';
    }

    // Nearby Places Images
    if (property.nearbyImages && property.nearbyImages.length > 0) {
        document.getElementById('nearby-images-section').style.display = 'block';
        document.getElementById('nearby-images-grid').innerHTML = property.nearbyImages.map((img, index) => `
            <div class="nearby-image-card" onclick="openImageModal(${JSON.stringify(property.nearbyImages).replace(/"/g, '&quot;')}, ${index})">
                <img src="${img}" alt="Nearby place">
            </div>
        `).join('');
    } else {
        document.getElementById('nearby-images-section').style.display = 'none';
    }

    // Food Courts Images
    if (property.foodImages && property.foodImages.length > 0) {
        document.getElementById('food-court-section').style.display = 'block';
        document.getElementById('food-court-grid').innerHTML = property.foodImages.map((img, index) => `
            <div class="nearby-image-card" onclick="openImageModal(${JSON.stringify(property.foodImages).replace(/"/g, '&quot;')}, ${index})">
                <img src="${img}" alt="Food court">
            </div>
        `).join('');
    } else {
        document.getElementById('food-court-section').style.display = 'none';
    }

    // Title & Location
    document.getElementById('detail-title').textContent = property.title;
    document.getElementById('detail-location').innerHTML = `
        <i class="fas fa-map-marker-alt"></i> ${property.location}
    `;

    // Features
    document.getElementById('detail-features').innerHTML = `
        <div class="feature-item">
            <i class="fas fa-bed"></i>
            <span class="feature-value">${property.bedrooms}</span>
            <span class="feature-label">Bedrooms</span>
        </div>
        <div class="feature-item">
            <i class="fas fa-bath"></i>
            <span class="feature-value">${property.bathrooms}</span>
            <span class="feature-label">Bathrooms</span>
        </div>
        <div class="feature-item">
            <i class="fas fa-ruler-combined"></i>
            <span class="feature-value">${property.area}</span>
            <span class="feature-label">Sq Ft</span>
        </div>
        <div class="feature-item">
            <i class="fas fa-calendar"></i>
            <span class="feature-value" style="font-size: 1rem;">${property.availableFrom}</span>
            <span class="feature-label">Available</span>
        </div>
    `;

    // Description
    document.getElementById('detail-description').textContent = property.description;

    // Nearby Places List
    if (property.nearbyPlaces && property.nearbyPlaces.length > 0) {
        document.getElementById('nearby-places-section').style.display = 'block';
        document.getElementById('nearby-places-list').innerHTML = property.nearbyPlaces.map(place => `
            <div class="nearby-place-item">
                <span class="nearby-place-name"><i class="fas fa-location-arrow"></i> ${place.name}</span>
                <span class="nearby-place-distance">${place.distance}</span>
            </div>
        `).join('');
    } else {
        document.getElementById('nearby-places-section').style.display = 'none';
    }

    // Amenities
    document.getElementById('detail-amenities').innerHTML = property.amenities.map(amenity => `
        <div class="amenity-item">
            <i class="fas fa-check-circle"></i>
            <span>${amenity}</span>
        </div>
    `).join('');

    // Price
    document.getElementById('detail-price').textContent = `₹${property.price.toLocaleString('en-IN')}`;

    // Owner Info
    document.getElementById('detail-owner').innerHTML = `
        <div class="owner-avatar">
            <div class="avatar-circle">${property.ownerName.charAt(0)}</div>
            <span class="owner-name">${property.ownerName}</span>
        </div>
        <div class="owner-contact">
            <i class="fas fa-phone"></i>
            <span>${property.ownerPhone}</span>
        </div>
        <div class="owner-contact">
            <i class="fas fa-envelope"></i>
            <span>${property.ownerEmail}</span>
        </div>
    `;

    // Contact Section
    const contactSection = document.getElementById('contact-section');
    if (currentUser.role === 'tenant') {
        renderTenantContactSection(property);
    } else if (currentUser.email === property.ownerEmail) {
        contactSection.innerHTML = `
            <div style="background: var(--orange-50); padding: 1rem; border-radius: var(--border-radius); text-align: center;">
                <p style="color: var(--orange-800); font-weight: 500; font-size: 0.875rem;">
                    <i class="fas fa-info-circle"></i> This is your property listing
                </p>
                <button class="btn btn-outline btn-sm" style="margin-top:0.75rem;" onclick="openMessagesForProperty('${property.id}')">
                    <i class="fas fa-comments"></i> View Queries
                </button>
            </div>
        `;
    }

    updateMessageBadges();
}

function changeMainImage(imageSrc, event) {
    document.getElementById('main-image').innerHTML = `<img src="${imageSrc}" alt="Property">`;
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function renderTenantContactSection(property) {
    const contactSection = document.getElementById('contact-section');
    if (!contactSection || !currentUser) return;

    const existingThread = getThreadByPropertyForTenant(property.id, currentUser.email);
    const previewMessages = existingThread ? getThreadMessages(existingThread.threadId).slice(-3) : [];
    const defaultInquiry = `Hi, I'm interested in renting "${property.title}". Could you please share more details?`;

    contactSection.innerHTML = `
        <div class="property-inquiry-box">
            <textarea id="property-inquiry-message" rows="3" placeholder="Write your message to owner...">${defaultInquiry}</textarea>
            <button class="btn btn-primary btn-block btn-sm" onclick="contactOwner('${property.id}')">
                <i class="fas fa-paper-plane"></i> Send Inquiry
            </button>
            <button class="btn btn-outline btn-block btn-sm" onclick="openMessagesForProperty('${property.id}')">
                <i class="fas fa-comments"></i> Open Full Conversation
            </button>
        </div>
        <div class="property-chat-preview">
            <p class="property-chat-preview-title">Recent Messages</p>
            ${
                previewMessages.length
                    ? previewMessages.map((msg) => `
                        <div class="property-chat-preview-msg ${msg.senderEmail === currentUser.email ? 'is-me' : 'is-other'}">
                            <p>${msg.text}</p>
                            <span>${formatTime(msg.timestamp)}</span>
                        </div>
                    `).join('')
                    : '<p class="property-chat-preview-empty">No messages yet for this property.</p>'
            }
        </div>
    `;
}

function contactOwner(propertyId) {
    if (!currentUser || currentUser.role !== 'tenant') return;

    const property = allProperties.find((p) => p.id === propertyId);
    if (!property) {
        showToast('Property not found', 'error');
        return;
    }

    const input = document.getElementById('property-inquiry-message');
    const inquiry = (input?.value || '').trim();
    if (!inquiry) {
        showToast('Please write a message before sending.', 'error');
        return;
    }

    const thread = ensureThread(property, currentUser);
    appendMessage(thread.threadId, 'tenant', currentUser.email, inquiry);
    activeThreadId = thread.threadId;

    showToast('Inquiry sent successfully. The owner can now see your message.', 'success');
    renderTenantContactSection(property);
}

function openMessagesForProperty(propertyId) {
    if (!currentUser) return;

    const property = allProperties.find((p) => p.id === propertyId);
    if (!property) {
        showToast('Property not found', 'error');
        return;
    }

    if (currentUser.role === 'owner') {
        const ownerThreads = getThreadsForCurrentUser().filter((t) => t.propertyId === propertyId);
        if (!ownerThreads.length) {
            showToast('No tenant queries for this property yet.', 'error');
            openMessagesPage();
            return;
        }
        activeThreadId = ownerThreads[0].threadId;
        openMessagesPage();
        return;
    }

    const thread = ensureThread(property, currentUser);
    activeThreadId = thread.threadId;
    openMessagesPage();
}

function openMessagesPage() {
    if (!currentUser) {
        showPage('login-page');
        return;
    }
    const activePage = document.querySelector('.page.active')?.id;
    if (activePage && activePage !== 'messages-page') {
        messagesReturnPage = activePage;
    }
    showPage('messages-page');
    renderMessagesPage();
}

function goBackFromMessages() {
    if (messagesReturnPage === 'property-details' && currentViewingPropertyId) {
        viewPropertyDetails(currentViewingPropertyId);
        return;
    }
    goBackToDashboard();
}

function renderMessagesPage() {
    if (!currentUser) return;

    const threads = getThreadsForCurrentUser();
    const listEl = document.getElementById('messages-thread-list');
    const chatHeader = document.getElementById('messages-chat-header');
    const emptyEl = document.getElementById('messages-chat-empty');
    const contentEl = document.getElementById('messages-chat-content');
    const chatLog = document.getElementById('messages-chat-log');
    const composeInput = document.getElementById('messages-compose-input');

    if (!listEl || !chatHeader || !emptyEl || !contentEl || !chatLog || !composeInput) return;

    if (!threads.length) {
        listEl.innerHTML = '<div class="messages-thread-empty">No conversations yet.</div>';
        activeThreadId = null;
        chatHeader.textContent = 'Select a conversation';
        emptyEl.style.display = 'block';
        contentEl.style.display = 'none';
        updateMessageBadges();
        return;
    }

    if (!activeThreadId || !threads.some((t) => t.threadId === activeThreadId)) {
        activeThreadId = threads[0].threadId;
    }

    // Mark selected thread as read before rendering unread pills so counts update immediately.
    markThreadRead(activeThreadId, currentUser.email);

    listEl.innerHTML = threads.map((thread) => {
        const threadMessages = getThreadMessages(thread.threadId);
        const last = threadMessages[threadMessages.length - 1];
        const otherName = currentUser.role === 'owner' ? thread.tenantName : thread.ownerName;
        const unread = threadMessages.filter((m) => (
            m.senderEmail !== currentUser.email &&
            (!Array.isArray(m.readBy) || !m.readBy.includes(currentUser.email))
        )).length;
        return `
            <button class="messages-thread-item ${thread.threadId === activeThreadId ? 'active' : ''}" onclick="setActiveThread('${thread.threadId}')">
                <div class="messages-thread-top">
                    <p class="messages-thread-name">${otherName}</p>
                    ${unread ? `<span class="messages-thread-unread">${unread}</span>` : ''}
                </div>
                <p class="messages-thread-property">${thread.propertyTitle}</p>
                <p class="messages-thread-last">${last ? last.text : 'No messages yet'}</p>
            </button>
        `;
    }).join('');

    const activeThread = threads.find((t) => t.threadId === activeThreadId);
    if (!activeThread) return;

    const activeMessages = getThreadMessages(activeThread.threadId);
    const otherName = currentUser.role === 'owner' ? activeThread.tenantName : activeThread.ownerName;
    chatHeader.textContent = `${otherName} • ${activeThread.propertyTitle}`;

    chatLog.innerHTML = activeMessages.map((msg) => `
        <div class="messages-bubble-row ${msg.senderEmail === currentUser.email ? 'is-me' : 'is-other'}">
            <div class="messages-bubble">
                <p>${msg.text}</p>
                <span>${formatTime(msg.timestamp)}</span>
            </div>
        </div>
    `).join('');
    chatLog.scrollTop = chatLog.scrollHeight;

    emptyEl.style.display = 'none';
    contentEl.style.display = 'flex';

    composeInput.value = threadDrafts[activeThreadId] || '';
    composeInput.oninput = function() {
        threadDrafts[activeThreadId] = composeInput.value;
    };
}

function setActiveThread(threadId) {
    activeThreadId = threadId;
    renderMessagesPage();
}

function sendActiveThreadMessage() {
    if (!currentUser || !activeThreadId) return;

    const composeInput = document.getElementById('messages-compose-input');
    if (!composeInput) return;
    const text = composeInput.value.trim();
    if (!text) {
        showToast('Message cannot be empty.', 'error');
        return;
    }

    appendMessage(activeThreadId, currentUser.role, currentUser.email, text);
    threadDrafts[activeThreadId] = '';
    composeInput.value = '';
    renderMessagesPage();
}

function goBackToDashboard() {
    if (currentUser.role === 'owner') {
        showOwnerDashboard();
    } else {
        showTenantDashboard();
    }
}

// ==== IMAGE MODAL ====
function openImageModal(images, startIndex) {
    currentImageGallery = images;
    currentImageIndex = startIndex;
    document.getElementById('modal-image').src = currentImageGallery[currentImageIndex];
    document.getElementById('image-modal').classList.add('active');
}

function closeImageModal() {
    document.getElementById('image-modal').classList.remove('active');
}

function prevModalImage() {
    currentImageIndex = (currentImageIndex - 1 + currentImageGallery.length) % currentImageGallery.length;
    document.getElementById('modal-image').src = currentImageGallery[currentImageIndex];
}

function nextModalImage() {
    currentImageIndex = (currentImageIndex + 1) % currentImageGallery.length;
    document.getElementById('modal-image').src = currentImageGallery[currentImageIndex];
}

// ==== ADD PROPERTY ====
function showAddPropertyModal() {
    document.getElementById('add-property-modal').classList.add('active');
    uploadedPropertyImages = [];
    uploaded3DFile = null;
    uploaded3DFileName = '';
    uploaded3DFileType = '';
    uploadedNearbyImages = [];
    uploadedFoodImages = [];
    document.getElementById('add-property-form').reset();
    document.getElementById('property-preview').innerHTML = '';
    document.getElementById('3d-preview').innerHTML = '';
    document.getElementById('nearby-preview').innerHTML = '';
    document.getElementById('food-preview').innerHTML = '';
}

function closeAddPropertyModal() {
    document.getElementById('add-property-modal').classList.remove('active');
}

// Property Images Upload
function handlePropertyImages(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById('property-preview');
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedPropertyImages.push(e.target.result);
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="preview-remove" type="button" onclick="removePropertyImage(${uploadedPropertyImages.length - 1})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                preview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

function removePropertyImage(index) {
    uploadedPropertyImages.splice(index, 1);
    const preview = document.getElementById('property-preview');
    preview.children[index].remove();
}

// 3D View Upload
function handle3DUpload(event) {
    const file = event.target.files[0];
    if (file) {
        uploaded3DFileName = file.name;
        uploaded3DFileType = file.type || '';

        const reader = new FileReader();
        reader.onload = function(e) {
            uploaded3DFile = e.target.result;
            document.getElementById('3d-preview').innerHTML = `
                <div class="preview-item-single">
                    ${file.type.startsWith('image') ? `<img src="${e.target.result}" alt="3D View">` : '<i class="fas fa-cube" style="font-size: 3rem; color: var(--orange-600);"></i>'}
                    <p style="margin-top: 0.5rem; font-weight: 500;">${file.name}</p>
                    <button class="preview-remove" type="button" onclick="remove3DFile()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
}

function remove3DFile() {
    uploaded3DFile = null;
    uploaded3DFileName = '';
    uploaded3DFileType = '';
    document.getElementById('3d-preview').innerHTML = '';
    document.getElementById('prop-3d').value = '';
}

// Nearby Places Images Upload
function handleNearbyImages(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById('nearby-preview');
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedNearbyImages.push(e.target.result);
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Nearby">
                    <button class="preview-remove" type="button" onclick="removeNearbyImage(${uploadedNearbyImages.length - 1})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                preview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

function removeNearbyImage(index) {
    uploadedNearbyImages.splice(index, 1);
    const preview = document.getElementById('nearby-preview');
    preview.children[index].remove();
}

// Food Courts Images Upload
function handleFoodImages(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById('food-preview');
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedFoodImages.push(e.target.result);
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Food">
                    <button class="preview-remove" type="button" onclick="removeFoodImage(${uploadedFoodImages.length - 1})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                preview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

function removeFoodImage(index) {
    uploadedFoodImages.splice(index, 1);
    const preview = document.getElementById('food-preview');
    preview.children[index].remove();
}

function addNearbyPlaceInput() {
    const container = document.getElementById('nearby-places-container');
    const newInput = document.createElement('div');
    newInput.className = 'nearby-place-input';
    newInput.innerHTML = `
        <input type="text" class="nearby-place-name" placeholder="Place name">
        <input type="text" class="nearby-place-distance" placeholder="Distance">
        <button type="button" class="btn btn-sm btn-outline" onclick="this.parentElement.remove()">
            <i class="fas fa-minus"></i>
        </button>
    `;
    container.appendChild(newInput);
}

function handleAddProperty(event) {
    event.preventDefault();

    if (uploadedPropertyImages.length < 3) {
        showToast('Please upload at least 3 property images', 'error');
        return;
    }

    // Collect form data
    const newProperty = {
        id: Date.now().toString(),
        title: document.getElementById('prop-title').value,
        type: document.getElementById('prop-type').value,
        description: document.getElementById('prop-description').value,
        price: parseInt(document.getElementById('prop-price').value),
        city: 'Hyderabad',
        location: document.getElementById('prop-location').value,
        bedrooms: parseInt(document.getElementById('prop-bedrooms').value),
        bathrooms: parseInt(document.getElementById('prop-bathrooms').value),
        area: parseInt(document.getElementById('prop-area').value),
        availableFrom: document.getElementById('prop-available').value,
        propertyImages: uploadedPropertyImages,
        view3D: uploaded3DFile,
        view3DName: uploaded3DFileName,
        view3DType: uploaded3DFileType,
        nearbyImages: uploadedNearbyImages,
        foodImages: uploadedFoodImages,
        ownerId: currentUser.email,
        ownerName: currentUser.name,
        ownerEmail: currentUser.email,
        ownerPhone: currentUser.phone,
        amenities: [],
        nearbyPlaces: []
    };

    // Collect amenities
    document.querySelectorAll('.amenities-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
        newProperty.amenities.push(checkbox.value);
    });

    // Collect nearby places
    document.querySelectorAll('.nearby-place-input').forEach(input => {
        const name = input.querySelector('.nearby-place-name').value;
        const distance = input.querySelector('.nearby-place-distance').value;
        if (name && distance) {
            newProperty.nearbyPlaces.push({ name, distance });
        }
    });

    allProperties.push(newProperty);
    savePropertiesToStorage();

    closeAddPropertyModal();
    showOwnerDashboard();
    showToast('Property added successfully!', 'success');
}

// ==== UTILITY FUNCTIONS ====
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
