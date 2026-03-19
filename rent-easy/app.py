"""
Rent Easy - Flask Backend API
Hyderabad Property Rental Platform

Requirements (install with pip):
    pip install flask flask-cors mysql-connector-python bcrypt PyJWT

MySQL Setup:
    1. Create database:  mysql -u root -p < schema.sql
    2. Update DB_CONFIG below with your credentials

Run the server:
    python app.py
    → API available at http://localhost:5000
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import jwt
import datetime
import os
import uuid
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
try:
    from PIL import Image
except Exception:
    Image = None

# ─── App & Config ────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app, origins='*')

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'rent-easy-hyderabad-secret-2026')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024             # 50 MB

UPLOAD_FOLDER = os.path.join('src', 'uploads')
ALLOWED_IMAGE_EXT = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_TOUR_EXT  = {'glb', 'gltf', 'obj', 'zip', 'mp4', '360'}

# Create upload dirs
for sub in ('properties', 'nearby', 'food', 'tours'):
    os.makedirs(os.path.join(UPLOAD_FOLDER, sub), exist_ok=True)

# ─── MySQL Config ─────────────────────────────────────────────────────────────

DB_CONFIG = {
    'host':     os.getenv('DB_HOST', 'localhost'),
    'port':     int(os.getenv('DB_PORT', '3306')),
    'user':     os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'rent_easy'),
    'charset':  'utf8mb4',
}

def get_db():
    """Return a fresh MySQL connection."""
    return mysql.connector.connect(**DB_CONFIG)

# ─── Helpers ─────────────────────────────────────────────────────────────────

def allowed_image(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXT

def allowed_tour(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_TOUR_EXT

def make_token(user_id, email, role):
    payload = {
        'user_id': user_id,
        'email':   email,
        'role':    role,
        'exp':     datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token():
    """Extract & verify JWT from Authorization header. Returns payload or None."""
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '').strip()
    if not token:
        return None
    try:
        return jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    except Exception:
        return None

def json_err(msg, code=400):
    return jsonify({'success': False, 'error': msg}), code

def serialize_dates(row):
    """Convert date/datetime objects in a dict to ISO strings."""
    if not row:
        return row
    for k, v in row.items():
        if isinstance(v, (datetime.date, datetime.datetime)):
            row[k] = v.isoformat()
    return row

# ─── Auth Endpoints ───────────────────────────────────────────────────────────

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new owner or tenant account."""
    data = request.get_json(silent=True) or {}
    name     = (data.get('name')     or '').strip()
    email    = (data.get('email')    or '').strip().lower()
    phone    = (data.get('phone')    or '').strip()
    password = (data.get('password') or '').strip()
    role     = (data.get('role')     or '').strip()

    if not all([name, email, phone, password, role]):
        return json_err('All fields are required.')
    if role not in ('owner', 'tenant'):
        return json_err('Role must be owner or tenant.')
    if len(password) < 6:
        return json_err('Password must be at least 6 characters.')

    hashed = generate_password_hash(password)

    try:
        conn = get_db()
        cur  = conn.cursor(dictionary=True)
        cur.execute(
            "INSERT INTO users (name, email, phone, password_hash, role) VALUES (%s,%s,%s,%s,%s)",
            (name, email, phone, hashed, role)
        )
        conn.commit()
        user_id = cur.lastrowid
        cur.close(); conn.close()
    except mysql.connector.IntegrityError:
        return json_err(f'An {role} account with this email already exists. Please sign in.', 409)
    except Exception as e:
        return json_err(str(e), 500)

    token = make_token(user_id, email, role)
    return jsonify({
        'success': True,
        'message': 'Account created successfully!',
        'token':   token,
        'user':    {'id': user_id, 'name': name, 'email': email, 'phone': phone, 'role': role}
    }), 201


@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate an existing user."""
    data     = request.get_json(silent=True) or {}
    email    = (data.get('email')    or '').strip().lower()
    password = (data.get('password') or '').strip()
    role     = (data.get('role')     or '').strip()

    if not all([email, password, role]):
        return json_err('Email, password, and role are required.')

    try:
        conn = get_db()
        cur  = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM users WHERE email=%s AND role=%s", (email, role))
        user = cur.fetchone()
        cur.close(); conn.close()
    except Exception as e:
        return json_err(str(e), 500)

    if not user:
        return json_err(f'No {role} account found with this email. Please create an account first.', 401)

    if not check_password_hash(user['password_hash'], password):
        return json_err('Incorrect password. Please try again.', 401)

    token = make_token(user['id'], user['email'], user['role'])
    return jsonify({
        'success': True,
        'message': f'Welcome back, {user["name"]}!',
        'token':   token,
        'user': {
            'id':    user['id'],
            'name':  user['name'],
            'email': user['email'],
            'phone': user['phone'],
            'role':  user['role'],
        }
    }), 200

# ─── Properties Endpoints ─────────────────────────────────────────────────────

def fetch_property_extras(cur, prop_id):
    """Fetch images, amenities, and nearby places for a property."""
    cur.execute(
        "SELECT image_url FROM property_images WHERE property_id=%s AND image_type='main' ORDER BY display_order",
        (prop_id,)
    )
    images = [r['image_url'] for r in cur.fetchall()]

    cur.execute(
        "SELECT image_url FROM property_images WHERE property_id=%s AND image_type='nearby' ORDER BY display_order",
        (prop_id,)
    )
    nearby_images = [r['image_url'] for r in cur.fetchall()]

    cur.execute(
        "SELECT image_url FROM property_images WHERE property_id=%s AND image_type='food' ORDER BY display_order",
        (prop_id,)
    )
    food_images = [r['image_url'] for r in cur.fetchall()]

    cur.execute(
        "SELECT name, distance, category FROM nearby_places WHERE property_id=%s",
        (prop_id,)
    )
    nearby_places = cur.fetchall()

    cur.execute(
        "SELECT amenity FROM property_amenities WHERE property_id=%s",
        (prop_id,)
    )
    amenities = [r['amenity'] for r in cur.fetchall()]

    return images, nearby_images, food_images, nearby_places, amenities


@app.route('/api/properties', methods=['GET'])
def get_properties():
    """Return all properties with optional filters."""
    owner_email = request.args.get('owner_email', '')
    area_filter = request.args.get('area', '')
    type_filter = request.args.get('type', '')
    max_price   = request.args.get('max_price', '')
    bedrooms    = request.args.get('bedrooms', '')
    furnishing  = request.args.get('furnishing', '')
    q           = request.args.get('q', '').strip()

    sql    = "SELECT * FROM properties WHERE 1=1"
    params = []

    if owner_email:
        sql += " AND owner_email = %s"
        params.append(owner_email)
    if area_filter:
        sql += " AND location LIKE %s"
        params.append(f'%{area_filter}%')
    if type_filter:
        sql += " AND type = %s"
        params.append(type_filter)
    if max_price:
        sql += " AND price <= %s"
        params.append(int(max_price))
    if bedrooms and bedrooms != 'Any':
        if bedrooms == '4+':
            sql += " AND bedrooms >= 4"
        else:
            sql += " AND bedrooms = %s"
            params.append(int(bedrooms))
    if furnishing:
        sql += " AND furnishing = %s"
        params.append(furnishing)
    if q:
        sql += " AND (title LIKE %s OR location LIKE %s OR type LIKE %s OR owner_name LIKE %s)"
        like = f'%{q}%'
        params.extend([like, like, like, like])

    sql += " ORDER BY created_at DESC"

    try:
        conn = get_db()
        cur  = conn.cursor(dictionary=True)
        cur.execute(sql, params)
        props = cur.fetchall()

        result = []
        for p in props:
            p = serialize_dates(p)
            imgs, nearby_imgs, food_imgs, nearby_places, amenities = fetch_property_extras(cur, p['id'])
            p['images']              = imgs
            p['nearbyPlacesImages']  = nearby_imgs
            p['foodCourtImages']     = food_imgs
            p['nearbyPlaces']        = nearby_places
            p['amenities']           = amenities
            result.append(p)

        cur.close(); conn.close()
        return jsonify({'success': True, 'properties': result}), 200
    except Exception as e:
        return json_err(str(e), 500)


@app.route('/api/properties/<int:prop_id>', methods=['GET'])
def get_property(prop_id):
    """Return a single property by ID."""
    try:
        conn = get_db()
        cur  = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM properties WHERE id=%s", (prop_id,))
        p = cur.fetchone()
        if not p:
            cur.close(); conn.close()
            return json_err('Property not found.', 404)

        p = serialize_dates(p)
        imgs, nearby_imgs, food_imgs, nearby_places, amenities = fetch_property_extras(cur, prop_id)
        p['images']             = imgs
        p['nearbyPlacesImages'] = nearby_imgs
        p['foodCourtImages']    = food_imgs
        p['nearbyPlaces']       = nearby_places
        p['amenities']          = amenities

        cur.close(); conn.close()
        return jsonify({'success': True, 'property': p}), 200
    except Exception as e:
        return json_err(str(e), 500)


@app.route('/api/properties', methods=['POST'])
def create_property():
    """Create a new property. Expects JSON body."""
    user = verify_token()
    if not user or user['role'] != 'owner':
        return json_err('Unauthorized — owner login required.', 401)

    data = request.get_json(silent=True) or {}
    required = ['title', 'type', 'price', 'bedrooms', 'bathrooms', 'area',
                'location', 'furnishing', 'availableFrom', 'ownerPhone']
    for f in required:
        if not data.get(f):
            return json_err(f'Field "{f}" is required.')

    if len(data.get('images', [])) < 3:
        return json_err('At least 3 property images are required.')

    try:
        conn = get_db()
        cur  = conn.cursor()

        cur.execute("""
            INSERT INTO properties
              (title, description, type, price, bedrooms, bathrooms, area,
               location, city, furnishing, tour_file_name,
               owner_id, owner_name, owner_phone, owner_email, available_from)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'Hyderabad',%s,%s,%s,%s,%s,%s,%s)
        """, (
            data['title'].strip(),
            data.get('description', '').strip(),
            data['type'],
            int(data['price']),
            int(data['bedrooms']),
            int(data['bathrooms']),
            int(data['area']),
            data['location'],
            data['furnishing'],
            data.get('tourFileName') or None,
            user['user_id'],
            user.get('name', ''),
            data['ownerPhone'].strip(),
            user['email'],
            data['availableFrom'],
        ))
        prop_id = cur.lastrowid

        # Images
        for idx, url in enumerate(data.get('images', [])):
            cur.execute(
                "INSERT INTO property_images (property_id, image_url, image_type, display_order) VALUES (%s,%s,'main',%s)",
                (prop_id, url, idx)
            )
        for idx, url in enumerate(data.get('nearbyPlacesImages', [])):
            cur.execute(
                "INSERT INTO property_images (property_id, image_url, image_type, display_order) VALUES (%s,%s,'nearby',%s)",
                (prop_id, url, idx)
            )
        for idx, url in enumerate(data.get('foodCourtImages', [])):
            cur.execute(
                "INSERT INTO property_images (property_id, image_url, image_type, display_order) VALUES (%s,%s,'food',%s)",
                (prop_id, url, idx)
            )

        # Amenities
        for amenity in data.get('amenities', []):
            cur.execute(
                "INSERT INTO property_amenities (property_id, amenity) VALUES (%s,%s)",
                (prop_id, amenity)
            )

        # Nearby places
        for place in data.get('nearbyPlaces', []):
            if place.get('name') and place.get('distance'):
                cur.execute(
                    "INSERT INTO nearby_places (property_id, name, distance, category) VALUES (%s,%s,%s,%s)",
                    (prop_id, place['name'], place['distance'], place.get('category', 'other'))
                )

        conn.commit()
        cur.close(); conn.close()
        return jsonify({'success': True, 'property_id': prop_id,
                        'message': 'Property listed successfully!'}), 201
    except Exception as e:
        return json_err(str(e), 500)


@app.route('/api/properties/<int:prop_id>', methods=['DELETE'])
def delete_property(prop_id):
    """Delete a property (owner only, must own it)."""
    user = verify_token()
    if not user or user['role'] != 'owner':
        return json_err('Unauthorized.', 401)

    try:
        conn = get_db()
        cur  = conn.cursor(dictionary=True)
        cur.execute("SELECT owner_id FROM properties WHERE id=%s", (prop_id,))
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return json_err('Property not found.', 404)
        if row['owner_id'] != user['user_id']:
            cur.close(); conn.close()
            return json_err('Forbidden — you do not own this property.', 403)

        cur.execute("DELETE FROM properties WHERE id=%s", (prop_id,))
        conn.commit()
        cur.close(); conn.close()
        return jsonify({'success': True, 'message': 'Property deleted.'}), 200
    except Exception as e:
        return json_err(str(e), 500)

# ─── File Upload Endpoints ────────────────────────────────────────────────────

@app.route('/api/upload/images', methods=['POST'])
def upload_images():
    """Upload one or more property/nearby/food images. Returns URL list."""
    user = verify_token()
    if not user:
        return json_err('Unauthorized.', 401)

    img_type = request.form.get('type', 'properties')  # properties | nearby | food
    if img_type not in ('properties', 'nearby', 'food'):
        img_type = 'properties'

    files = request.files.getlist('images')
    if not files:
        return json_err('No images provided.')

    urls = []
    for f in files:
        if not f or not allowed_image(f.filename):
            continue
        ext  = f.filename.rsplit('.', 1)[1].lower()
        name = f'{uuid.uuid4().hex}.{ext}'
        path = os.path.join(UPLOAD_FOLDER, img_type, name)
        if Image is None:
            f.save(path)
            urls.append(f'/uploads/{img_type}/{name}')
            continue

        try:
            img = Image.open(f)
            img.thumbnail((1920, 1080))
            img.save(path, optimize=True, quality=85)
            urls.append(f'/uploads/{img_type}/{name}')
        except Exception:
            # Save raw if PIL fails (e.g., unsupported format)
            f.seek(0)
            f.save(path)
            urls.append(f'/uploads/{img_type}/{name}')

    return jsonify({'success': True, 'urls': urls}), 200


@app.route('/api/upload/tour', methods=['POST'])
def upload_tour():
    """Upload a 3D virtual tour file."""
    user = verify_token()
    if not user:
        return json_err('Unauthorized.', 401)

    if 'tour' not in request.files:
        return json_err('No file provided.')

    f = request.files['tour']
    if not allowed_tour(f.filename):
        return json_err('Invalid file type. Allowed: .glb .gltf .obj .zip .mp4 .360')

    ext  = f.filename.rsplit('.', 1)[1].lower()
    name = f'{uuid.uuid4().hex}.{ext}'
    path = os.path.join(UPLOAD_FOLDER, 'tours', name)
    f.save(path)
    return jsonify({
        'success':  True,
        'url':      f'/uploads/tours/{name}',
        'fileName': secure_filename(f.filename)
    }), 200


@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Serve uploaded files."""
    return send_from_directory(UPLOAD_FOLDER, filename)

# ─── Contact Endpoint ─────────────────────────────────────────────────────────

@app.route('/api/contact', methods=['POST'])
def contact_owner():
    """Record a tenant inquiry."""
    user = verify_token()
    if not user or user['role'] != 'tenant':
        return json_err('Unauthorized — tenant login required.', 401)

    data        = request.get_json(silent=True) or {}
    property_id = data.get('property_id')
    message     = data.get('message', '').strip()

    if not property_id:
        return json_err('property_id is required.')

    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            "INSERT INTO contact_requests (property_id, tenant_id, message) VALUES (%s,%s,%s)",
            (property_id, user['user_id'], message)
        )
        conn.commit()
        cur.close(); conn.close()
        return jsonify({'success': True, 'message': 'Inquiry sent successfully!'}), 200
    except Exception as e:
        return json_err(str(e), 500)

# ─── Static Page Serving ──────────────────────────────────────────────────────

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:page>')
def serve_page(page):
    # Serve .html files and static assets
    if os.path.exists(page):
        dirname  = os.path.dirname(page) or '.'
        basename = os.path.basename(page)
        return send_from_directory(dirname, basename)
    return send_from_directory('.', 'index.html')

# ─── Health Check ─────────────────────────────────────────────────────────────

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'platform': 'Rent Easy', 'city': 'Hyderabad',
                    'time': datetime.datetime.now().isoformat()}), 200

# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', '5000')))
