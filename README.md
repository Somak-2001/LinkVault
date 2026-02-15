# LinkVault 🔒

LinkVault is a full-stack web application that allows users to securely upload **text or files** and share them using a **unique, hard-to-guess link**. The uploaded content is accessible **only to users who possess the link** and is automatically deleted after a specified expiry time.

The application features a **full user authentication system** allowing users to create accounts, manage their uploads, and track their content through a personalized dashboard.

The application is inspired by link-based sharing systems such as Pastebin and Google Drive's "anyone with the link" feature.

---

## ✨ Features

### Core Features
- Upload **plain text or a file** (one per upload)
- Generate a **unique shareable URL**
- Access content strictly via the generated link
- View and copy uploaded text
- Download uploaded files
- **Optional password protection** for uploads
- **View limits** - restrict number of times content can be accessed
- **Custom expiry times** - set when content should automatically delete
- Automatic expiry of content (default: 10 minutes)

### User Account System 🆕
- **User Registration** - Create secure accounts with email and password
- **JWT Authentication** - Token-based authentication with session persistence
- **User Dashboard** - View and manage all your uploads in one place
- **Content Ownership** - Only you can delete your content
- **Protected Routes** - Secure access to user-specific features
- **Guest Mode** - Upload without an account (backward compatible)

### UI/UX
- Modern glassmorphism design with gradient accents
- Responsive interface that adapts to all screen sizes
- Toast notifications for user feedback
- Drag-and-drop file upload
- Beautiful animations and transitions
- Clean and intuitive navigation

---

## 🛠️ Tech Stack

### Frontend
- **React** (Vite)
- **React Router** - Client-side routing
- **Axios** - HTTP requests with interceptors
- **CSS3** - Custom styling with glassmorphism effects
- **Context API** - State management for authentication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Cloudinary** - Cloud file storage

### Database
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **TTL Indexes** - Automatic content expiration

---

## 🏗️ Architecture

> **📊 For detailed architecture diagrams and data flows, see [ARCHITECTURE.md](ARCHITECTURE.md)**

This document includes:
- System architecture overview diagram
- 7 detailed sequence diagrams (registration, login, uploads, dashboard, content access, delete)
- Component interaction tables
- Database schemas
- Security architecture

### Authentication Flow
1. User registers with name, email, and password
2. Password is hashed using bcrypt (10 salt rounds)
3. JWT token is generated and returned to client
4. Token is stored in localStorage for session persistence
5. Axios interceptors automatically attach token to requests
6. Protected routes verify token via middleware
7. Expired tokens redirect user to login

### Content Flow
- **Authenticated Users**: Content is associated with user's account via `userId`
- **Guest Users**: Content is created with `userId: null`
- All content gets unique IDs and shareable links
- Content is stored in Cloudinary (files) or database (text)
- TTL index automatically deletes expired content

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000

# Database
MONGO_URI=your_mongodb_connection_string

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Authentication
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d
```

> **⚠️ Important**: Change `JWT_SECRET` to a long, random string in production!

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd LinkVault
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**
- Create `.env` file in `backend/` with the variables listed above

5. **Start the backend server**
```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

6. **Start the frontend development server**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

7. **Access the application**
- Open http://localhost:5173 in your browser

---

## 📡 API Overview

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-15T19:51:52.021Z"
  }
}
```

---

#### `POST /api/auth/login`
Login to existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-15T19:51:52.021Z"
  }
}
```

---

#### `GET /api/auth/me`
Get current user details (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-15T19:51:52.021Z"
  }
}
```

---

### Content Endpoints

#### `POST /api/upload`
Upload text or file. Optional authentication (attaches to user if logged in).

**Request:**
- `multipart/form-data`
- Fields:
  - `text` (optional) - Text content
  - `file` (optional) - File to upload
  - `password` (optional) - Password protection
  - `maxViews` (optional) - View limit
  - `expiry` (optional) - Custom expiry date

**Headers (Optional):**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "url": "http://localhost:5173/view/<id>"
}
```

---

#### `GET /api/user/content`
Get all content uploaded by authenticated user (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "content": [
    {
      "_id": "...",
      "type": "text",
      "text": "Sample content",
      "userId": "...",
      "createdAt": "2026-02-15T19:51:52.021Z",
      "expiresAt": "2026-02-15T20:01:52.021Z"
    }
  ]
}
```

---

#### `DELETE /api/content/:id`
Delete user's own content (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

---

#### `GET /api/content/:id`
View uploaded content (public).

**Response:**
```json
{
  "success": true,
  "content": {
    "type": "text",
    "text": "Sample content",
    "createdAt": "2026-02-15T19:51:52.021Z"
  }
}
```

---

## 🎨 Design Decisions

### Database Choice
MongoDB was chosen due to its flexible schema and built-in support for **TTL (Time-To-Live) indexes**. TTL indexes allow expired content to be deleted automatically at the database level without requiring background cleanup jobs.

### Authentication Strategy
- **JWT Tokens**: Stateless authentication, no server-side session storage
- **bcrypt**: Industry-standard password hashing with salt rounds
- **Optional Auth**: Users can upload without accounts (guest mode)
- **Session Persistence**: localStorage for seamless user experience

### Access Control
Access control is enforced through multiple layers:
- **Link-based access**: Secure, randomly generated MongoDB ObjectIDs
- **Password protection**: Optional bcrypt-hashed passwords for uploads
- **Content ownership**: Users can only delete their own content
- **No public listing**: No search or browse functionality
- **Protected routes**: User dashboard and management require authentication

### Expiry Handling
- Users may optionally specify an expiry date and time
- If no expiry is provided, content expires **10 minutes after upload**
- Expired content is automatically deleted by MongoDB TTL index
- Background cleanup job runs every hour as backup

### File Storage
Uploaded files are stored in **Cloudinary** (cloud storage), while metadata is stored in MongoDB. This design:
- Allows for reliable, scalable file storage
- Provides CDN delivery for fast access
- Supports automatic deletion via Cloudinary API
- Separates concerns (metadata vs. actual files)

---

## 🔐 Security Features

### Backend Security
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Signed with secret key, configurable expiration
- **Protected Routes**: Middleware verification for user endpoints
- **Input Validation**: Email format, password length requirements
- **Password Exclusion**: Password field excluded from queries by default
- **Ownership Checks**: Users can only modify their own content
- **CORS**: Configured for specific origins

### Frontend Security
- **Token Storage**: localStorage with automatic attachment to requests
- **401 Handling**: Auto-redirect to login on token expiration
- **Protected Routes**: Dashboard requires authentication
- **No Password Exposure**: Passwords never stored client-side
- **Secure API Calls**: HTTPS-ready configuration

---

## 📱 User Guide

### Creating an Account
1. Navigate to LinkVault
2. Click **"Sign Up"** button
3. Enter your name, email, and password (minimum 6 characters)
4. Click **"Sign Up"** to create your account
5. You'll be automatically logged in

### Uploading Content

#### As a Registered User
1. Log in to your account
2. Upload text or files as usual
3. Content is automatically associated with your account
4. Access it anytime from your **Dashboard**

#### As a Guest
1. Upload directly without logging in
2. Content is created but not associated with any account
3. You'll get a shareable link
4. Cannot be managed or deleted later

### Managing Your Content
1. Click **"Dashboard"** in the header
2. View all your uploads in a card grid
3. Click **"View"** to access any item
4. Click **"Delete"** to permanently remove items
5. Confirm deletion when prompted

### Advanced Upload Options
- **Password Protection**: Add a password that viewers must enter
- **View Limit**: Restrict how many times content can be accessed
- **Custom Expiry**: Set a specific date/time for auto-deletion

---

## 🗂️ Project Structure

```
LinkVault/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js           # User schema with auth
│   │   │   └── Content.js        # Content schema with userId
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Auth endpoints
│   │   │   ├── upload.controller.js # Upload handling
│   │   │   └── content.controller.js # Content CRUD
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # JWT verification
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── upload.routes.js
│   │   │   └── content.routes.js
│   │   ├── utils/
│   │   │   └── cleanup.js        # Expired content cleanup
│   │   ├── app.js                # Express app
│   │   └── index.js              # Server entry point
│   ├── .env                      # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx        # Navigation with auth state
    │   │   ├── ProtectedRoute.jsx # Auth guard
    │   │   ├── UploadForm.jsx    # Main upload UI
    │   │   └── Toast.jsx         # Notifications
    │   ├── contexts/
    │   │   ├── AuthContext.jsx   # Auth state management
    │   │   └── ToastContext.jsx  # Toast notifications
    │   ├── pages/
    │   │   ├── Home.jsx          # Upload page
    │   │   ├── Login.jsx         # Login form
    │   │   ├── Register.jsx      # Registration form
    │   │   ├── Dashboard.jsx     # User content management
    │   │   ├── ViewContent.jsx   # Content display
    │   │   └── NotFound.jsx      # 404 page
    │   ├── services/
    │   │   └── api.js            # Axios with interceptors
    │   ├── styles/
    │   │   ├── Auth.css          # Auth pages styling
    │   │   ├── Dashboard.css     # Dashboard styling
    │   │   ├── Header.css        # Header styling
    │   │   └── index.css         # Global styles
    │   ├── App.jsx               # Main app with routes
    │   └── main.jsx              # Entry point
    └── package.json
```

---

## 🧪 Testing

### Backend API Testing
Test the authentication endpoints using curl:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get current user (replace <TOKEN> with actual token)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### Frontend Testing
1. Open http://localhost:5173
2. Test registration flow
3. Test login/logout
4. Test authenticated uploads
5. Test dashboard content management
6. Test guest uploads (without login)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🙏 Acknowledgments

- Inspired by Pastebin and Google Drive
- Built with modern web technologies
- Designed for security and user experience

---

**LinkVault** - Secure, Simple, Seamless 🔒✨
