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

// ==== INITIALIZATION ====
document.addEventListener('DOMContentLoaded', function() {
    loadUsersFromStorage();
    loadPropertiesFromStorage();
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
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        if (currentUser.role === 'owner') {
            showOwnerDashboard();
        } else {
            showTenantDashboard();
        }
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
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

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
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

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
    localStorage.removeItem('currentUser');
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

// ==== OWNER DASHBOARD ====
function showOwnerDashboard() {
    showPage('owner-dashboard');
    document.getElementById('owner-name-display').textContent = currentUser.name;
    
    const ownerProperties = allProperties.filter(p => p.ownerEmail === currentUser.email);
    renderOwnerProperties(ownerProperties);
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
    document.getElementById('tenant-name-display').textContent = currentUser.name;
    renderTenantProperties(allProperties);
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
        contactSection.innerHTML = `
            <button class="btn btn-primary btn-block btn-lg" onclick="contactOwner('${property.id}')">
                <i class="fas fa-phone"></i> Contact Owner
            </button>
            <p style="text-align: center; font-size: 0.75rem; color: var(--gray-600); margin-top: 0.5rem;">
                The owner will receive your contact information
            </p>
        `;
    } else if (currentUser.email === property.ownerEmail) {
        contactSection.innerHTML = `
            <div style="background: var(--orange-50); padding: 1rem; border-radius: var(--border-radius); text-align: center;">
                <p style="color: var(--orange-800); font-weight: 500; font-size: 0.875rem;">
                    <i class="fas fa-info-circle"></i> This is your property listing
                </p>
            </div>
        `;
    }
}

function changeMainImage(imageSrc, event) {
    document.getElementById('main-image').innerHTML = `<img src="${imageSrc}" alt="Property">`;
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function contactOwner(propertyId) {
    showToast('Contact request sent! The owner will reach out to you soon.', 'success');
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
