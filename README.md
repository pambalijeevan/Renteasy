# RentalHub - Property Rental Platform

A complete property rental platform built with **HTML, CSS, JavaScript** frontend and **Python Flask + MySQL** backend. Property owners can upload properties with multiple images, 3D views, and nearby places information, while tenants can browse and contact owners.

## 🎨 Features

### For Property Owners
- ✅ Upload multiple property images
- ✅ Upload 3D virtual tour / 3D model
- ✅ Add nearby places with distances
- ✅ Manage property listings
- ✅ View and delete properties
- ✅ Receive contact requests from tenants

### For Tenants
- ✅ Browse all available properties
- ✅ Filter by city and property type
- ✅ View detailed property information
- ✅ View property image galleries
- ✅ View 3D virtual tours
- ✅ See nearby places
- ✅ Contact property owners

### General Features
- 🎨 Beautiful orange and white color scheme
- 💰 Indian currency (₹) formatting
- 📱 Fully responsive design
- 🔐 Separate login systems for owners and tenants
- 🌈 Colorful login/registration pages

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/)
- **pip** (Python package manager)
- A modern web browser

## 🚀 Installation & Setup

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <your-repository-url>
cd rentalhub

# Or download and extract the ZIP file
```

### Step 2: Set Up MySQL Database

1. **Start MySQL Server**
   ```bash
   # On Windows
   net start MySQL80
   
   # On Mac
   mysql.server start
   
   # On Linux
   sudo systemctl start mysql
   ```

2. **Import Database Schema**
   ```bash
   mysql -u root -p < database_schema.sql
   ```
   
   Or manually:
   ```bash
   mysql -u root -p
   ```
   Then run:
   ```sql
   source /path/to/database_schema.sql
   ```

3. **Verify Database Creation**
   ```sql
   USE rentalhub;
   SHOW TABLES;
   ```

### Step 3: Install Python Dependencies

```bash
pip install flask flask-cors mysql-connector-python PyJWT bcrypt pillow
```

Or create a `requirements.txt` file:
```
flask==3.0.0
flask-cors==4.0.0
mysql-connector-python==8.2.0
PyJWT==2.8.0
bcrypt==4.1.1
pillow==10.1.0
```

Then install:
```bash
pip install -r requirements.txt
```

### Step 4: Configure Backend

Edit `backend.py` and update the database configuration:

```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',          # Your MySQL username
    'password': 'your_password',  # Your MySQL password
    'database': 'rentalhub'
}

app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this!
```

### Step 5: Start the Backend Server

```bash
python backend.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

### Step 6: Update Frontend Configuration

Edit `public/script.js` and uncomment the fetch() API calls. Update the base URL if needed:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Example: Login function
function handleLogin(event, role) {
    event.preventDefault();
    
    const email = document.getElementById(`${role}-email`).value;
    const password = document.getElementById(`${role}-password`).value;
    
    fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            // ... rest of code
        }
    });
}
```

### Step 7: Serve the Frontend

You have several options:

**Option 1: Python HTTP Server**
```bash
cd public
python -m http.server 8000
```
Visit: `http://localhost:8000`

**Option 2: Node.js http-server**
```bash
npm install -g http-server
cd public
http-server -p 8000
```
Visit: `http://localhost:8000`

**Option 3: Use any web server (Apache, Nginx, etc.)**

## 🔑 Default Test Credentials

The database comes with sample users for testing:

### Owner Account
- **Email**: owner1@example.com
- **Password**: password123

### Tenant Account
- **Email**: tenant1@example.com
- **Password**: password123

## 📁 Project Structure

```
rentalhub/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # All CSS styles
│   └── script.js           # Frontend JavaScript
├── backend.py              # Python Flask backend
├── database_schema.sql     # MySQL database schema
├── uploads/                # Upload directory (created automatically)
│   ├── properties/         # Property images
│   └── 3d_views/          # 3D model files
└── README.md              # This file
```

## 🎯 Usage Guide

### For Property Owners

1. **Register/Login** as an owner
2. Click **"Add New Property"** button
3. Fill in property details:
   - Title, type, description
   - Price (in ₹), location, city
   - Bedrooms, bathrooms, area
   - Available from date
4. **Upload multiple images** of the property
5. **Upload 3D view** (optional) - GLB, GLTF, or 360° images
6. **Add nearby places** with distances (e.g., "Metro Station - 500m")
7. **Select amenities** from checkboxes
8. Click **"Add Property"** to publish

### For Tenants

1. **Register/Login** as a tenant
2. **Browse properties** on the dashboard
3. **Search** by city or location
4. **Filter** by property type
5. Click on any property to view **full details**
6. View **image gallery**, **3D tour**, and **nearby places**
7. Click **"Contact Owner"** to send inquiry

## 🛠️ API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create new property (owner only)
- `DELETE /api/properties/:id` - Delete property (owner only)

### File Uploads
- `POST /api/upload/images` - Upload property images
- `POST /api/upload/3d` - Upload 3D view file

### Other
- `POST /api/contact` - Send contact request
- `GET /api/health` - Health check

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control (owner/tenant)
- ✅ SQL injection protection with parameterized queries
- ✅ File upload validation
- ✅ CORS configuration

## 🎨 Customization

### Change Color Scheme

Edit `public/styles.css`:
```css
:root {
    --primary-orange: #ea580c;
    --primary-orange-dark: #c2410c;
    /* Add your custom colors here */
}
```

### Add More Property Types

Edit both `public/index.html` and `public/script.js`:
```html
<option value="Penthouse">Penthouse</option>
<option value="Duplex">Duplex</option>
```

### Modify Database Schema

Edit `database_schema.sql` and re-import:
```sql
ALTER TABLE properties ADD COLUMN new_field VARCHAR(255);
```

## 📱 Mobile Responsiveness

The platform is fully responsive and works on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops (1440px+)

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check if port 5000 is already in use
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change port in backend.py
```

### Database Connection Error
```python
# Check MySQL is running
mysql -u root -p

# Verify credentials in backend.py
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'YOUR_ACTUAL_PASSWORD',
    'database': 'rentalhub'
}
```

### File Upload Not Working
```bash
# Ensure uploads directory exists
mkdir -p uploads/properties uploads/3d_views

# Check permissions
chmod 755 uploads
```

### CORS Errors
```python
# In backend.py, ensure CORS is enabled
from flask_cors import CORS
CORS(app)

# Or specify origins:
CORS(app, origins=['http://localhost:8000'])
```

## 🚀 Production Deployment

### For Backend (Python Flask)

1. **Use Production WSGI Server**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 backend:app
   ```

2. **Use Environment Variables**
   ```python
   import os
   app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
   ```

3. **Set Debug=False**
   ```python
   app.run(debug=False)
   ```

### For Frontend

1. **Host on Web Server** (Apache, Nginx, etc.)
2. **Or use Static Hosting** (Netlify, Vercel, GitHub Pages)
3. **Update API URLs** to point to production backend

### For Database

1. **Use Cloud MySQL** (AWS RDS, Google Cloud SQL)
2. **Configure SSL** for secure connections
3. **Set up regular backups**

## 📄 License

This project is open source and available under the MIT License.

## 👥 Support

For issues or questions:
- Check the troubleshooting section above
- Review the code comments
- Ensure all dependencies are installed
- Verify MySQL database is set up correctly

## 🎉 Credits

- Icons: Font Awesome
- Images: Unsplash (for demo properties)
- Framework: Flask (Python)
- Database: MySQL

---

**Happy Renting! 🏠**
