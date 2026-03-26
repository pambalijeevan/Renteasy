"""
RentalHub - Python Flask Backend API
This file provides the backend API for the RentalHub platform.

Installation Requirements:
pip install flask flask-cors mysql-connector-python PyJWT bcrypt pillow

Run the server:
python backend.py
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import bcrypt
import jwt
import datetime
import os
from werkzeug.utils import secure_filename
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

app = Flask(__name__, static_folder=PUBLIC_DIR, static_url_path='')
CORS(app)  # Enable CORS for frontend communication

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', os.path.join(BASE_DIR, 'uploads'))
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'glb', 'gltf'}

# Create upload directories if they don't exist
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'properties'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], '3d_views'), exist_ok=True)

# Database Configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'rentalhub')
}

def get_db_connection():
    """Create and return a database connection"""
    return mysql.connector.connect(**DB_CONFIG)

def allowed_file(filename):
    """Check if uploaded file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_token(user_id, email, role):
    """Generate JWT token for authenticated users"""
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    """Verify JWT token and return payload"""
    try:
        return jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    except:
        return None


@app.route('/')
def serve_index():
    """Serve the public frontend entry page."""
    return send_from_directory(PUBLIC_DIR, 'index.html')


@app.route('/<path:filename>')
def serve_public_file(filename):
    """Serve frontend static assets from the public directory."""
    return send_from_directory(PUBLIC_DIR, filename)

# ==== AUTHENTICATION ENDPOINTS ====

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user (owner or tenant)"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role')  # 'owner' or 'tenant'
        phone = data.get('phone', '')

        if not all([email, password, name, role]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Insert into database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO users (email, password, name, role, phone)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (email, hashed_password, name, role, phone))
        conn.commit()
        
        user_id = cursor.lastrowid
        cursor.close()
        conn.close()

        # Generate token
        token = generate_token(user_id, email, role)

        return jsonify({
            'success': True,
            'token': token,
            'user': {'id': user_id, 'email': email, 'name': name, 'role': role}
        }), 201

    except mysql.connector.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if not all([email, password, role]):
            return jsonify({'error': 'Missing credentials'}), 400

        # Query database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM users WHERE email = %s AND role = %s"
        cursor.execute(query, (email, role))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()

        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Generate token
        token = generate_token(user['id'], user['email'], user['role'])

        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role']
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==== PROPERTY ENDPOINTS ====

@app.route('/api/properties', methods=['GET'])
def get_properties():
    """Get all properties or filter by query parameters"""
    try:
        city = request.args.get('city')
        property_type = request.args.get('type')
        owner_id = request.args.get('owner_id')

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            WHERE 1=1
        """
        params = []

        if city:
            query += " AND p.city LIKE %s"
            params.append(f"%{city}%")
        if property_type:
            query += " AND p.type = %s"
            params.append(property_type)
        if owner_id:
            query += " AND p.owner_id = %s"
            params.append(owner_id)

        query += " ORDER BY p.created_at DESC"

        cursor.execute(query, params)
        properties = cursor.fetchall()

        # Get images, amenities, and nearby places for each property
        for prop in properties:
            prop_id = prop['id']

            # Get images
            cursor.execute("SELECT image_url, is_main FROM property_images WHERE property_id = %s", (prop_id,))
            images = cursor.fetchall()
            prop['images'] = [img['image_url'] for img in images]

            # Get amenities
            cursor.execute("SELECT amenity FROM property_amenities WHERE property_id = %s", (prop_id,))
            amenities = cursor.fetchall()
            prop['amenities'] = [a['amenity'] for a in amenities]

            # Get nearby places
            cursor.execute("SELECT name, distance FROM nearby_places WHERE property_id = %s", (prop_id,))
            nearby = cursor.fetchall()
            prop['nearbyPlaces'] = nearby

            # Get 3D view if exists
            cursor.execute("SELECT view_3d_url FROM property_3d_views WHERE property_id = %s", (prop_id,))
            view_3d = cursor.fetchone()
            prop['view3D'] = view_3d['view_3d_url'] if view_3d else None

        cursor.close()
        conn.close()

        return jsonify(properties), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/properties/<int:property_id>', methods=['GET'])
def get_property(property_id):
    """Get a single property by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            WHERE p.id = %s
        """
        cursor.execute(query, (property_id,))
        prop = cursor.fetchone()

        if not prop:
            return jsonify({'error': 'Property not found'}), 404

        # Get additional data
        cursor.execute("SELECT image_url FROM property_images WHERE property_id = %s", (property_id,))
        prop['images'] = [img['image_url'] for img in cursor.fetchall()]

        cursor.execute("SELECT amenity FROM property_amenities WHERE property_id = %s", (property_id,))
        prop['amenities'] = [a['amenity'] for a in cursor.fetchall()]

        cursor.execute("SELECT name, distance FROM nearby_places WHERE property_id = %s", (property_id,))
        prop['nearbyPlaces'] = cursor.fetchall()

        cursor.execute("SELECT view_3d_url FROM property_3d_views WHERE property_id = %s", (property_id,))
        view_3d = cursor.fetchone()
        prop['view3D'] = view_3d['view_3d_url'] if view_3d else None

        cursor.close()
        conn.close()

        return jsonify(prop), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/properties', methods=['POST'])
def create_property():
    """Create a new property listing"""
    try:
        # Verify token
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        
        if not user_data or user_data['role'] != 'owner':
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert property
        query = """
            INSERT INTO properties (title, description, type, price, bedrooms, bathrooms, 
                                   area, location, city, available_from, owner_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['title'], data['description'], data['type'], data['price'],
            data['bedrooms'], data['bathrooms'], data['area'], data['location'],
            data['city'], data['availableFrom'], user_data['user_id']
        )
        cursor.execute(query, values)
        property_id = cursor.lastrowid

        # Insert images
        if 'images' in data:
            for idx, image_url in enumerate(data['images']):
                cursor.execute(
                    "INSERT INTO property_images (property_id, image_url, is_main) VALUES (%s, %s, %s)",
                    (property_id, image_url, idx == 0)
                )

        # Insert amenities
        if 'amenities' in data:
            for amenity in data['amenities']:
                cursor.execute(
                    "INSERT INTO property_amenities (property_id, amenity) VALUES (%s, %s)",
                    (property_id, amenity)
                )

        # Insert nearby places
        if 'nearbyPlaces' in data:
            for place in data['nearbyPlaces']:
                cursor.execute(
                    "INSERT INTO nearby_places (property_id, name, distance) VALUES (%s, %s, %s)",
                    (property_id, place['name'], place['distance'])
                )

        # Insert 3D view
        if 'view3D' in data and data['view3D']:
            cursor.execute(
                "INSERT INTO property_3d_views (property_id, view_3d_url) VALUES (%s, %s)",
                (property_id, data['view3D'])
            )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'property_id': property_id}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/properties/<int:property_id>', methods=['DELETE'])
def delete_property(property_id):
    """Delete a property listing"""
    try:
        # Verify token
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        
        if not user_data or user_data['role'] != 'owner':
            return jsonify({'error': 'Unauthorized'}), 401

        conn = get_db_connection()
        cursor = conn.cursor()

        # Verify ownership
        cursor.execute("SELECT owner_id FROM properties WHERE id = %s", (property_id,))
        result = cursor.fetchone()
        
        if not result or result[0] != user_data['user_id']:
            return jsonify({'error': 'Unauthorized'}), 401

        # Delete property (cascade will delete related records)
        cursor.execute("DELETE FROM properties WHERE id = %s", (property_id,))
        conn.commit()
        
        cursor.close()
        conn.close()

        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==== FILE UPLOAD ENDPOINTS ====

@app.route('/api/upload/images', methods=['POST'])
def upload_images():
    """Upload property images"""
    try:
        if 'images' not in request.files:
            return jsonify({'error': 'No files provided'}), 400

        files = request.files.getlist('images')
        uploaded_urls = []

        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Add timestamp to make filename unique
                filename = f"{datetime.datetime.now().timestamp()}_{filename}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'properties', filename)
                
                # Save and optimize image
                img = Image.open(file)
                img.thumbnail((1920, 1080))  # Resize to max 1920x1080
                img.save(filepath, optimize=True, quality=85)
                
                # Return URL
                url = f"/uploads/properties/{filename}"
                uploaded_urls.append(url)

        return jsonify({'success': True, 'urls': uploaded_urls}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload/3d', methods=['POST'])
def upload_3d():
    """Upload 3D view file"""
    try:
        if 'view3d' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['view3d']
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filename = f"{datetime.datetime.now().timestamp()}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], '3d_views', filename)
            file.save(filepath)
            
            url = f"/uploads/3d_views/{filename}"
            return jsonify({'success': True, 'url': url}), 200

        return jsonify({'error': 'Invalid file type'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ==== CONTACT ENDPOINT ====

@app.route('/api/contact', methods=['POST'])
def contact_owner():
    """Send contact request from tenant to owner"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        
        if not user_data or user_data['role'] != 'tenant':
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.json
        property_id = data.get('property_id')

        # Here you would typically:
        # 1. Get property owner's email from database
        # 2. Send email notification to owner
        # 3. Log the contact request
        # 4. Send SMS notification if configured

        # For now, just return success
        return jsonify({'success': True, 'message': 'Contact request sent'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==== HEALTH CHECK ====

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if API is running"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.datetime.now().isoformat()}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port)
