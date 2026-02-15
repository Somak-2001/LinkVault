# LinkVault - Simple Data Flow Diagram

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER / CLIENT                               │
│                       (Browser - React Application)                      │
└────────────┬────────────────────────────────────────────┬────────────────┘
             │                                            │
             │ 1. Upload Request                          │ 6. Receive Link
             │ (Text/File + Optional: Password,           │    & Display
             │  Expiry, View Limit, JWT Token)            │    Success
             │                                            │
             ▼                                            │
┌─────────────────────────────────────────────────────────▼────────────────┐
│                     BACKEND SERVER                                       │
│                   (Node.js + Express.js)                                 │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  2. Authentication Middleware (Optional)                      │       │
│  │     • Verify JWT token if provided                           │       │
│  │     • Extract userId if authenticated                        │       │
│  │     • Continue without userId if guest                       │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                              ▼                                            │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  3. Upload Controller Processing                             │       │
│  │     • Validate input                                         │       │
│  │     • Hash password if provided                              │       │
│  │     • Calculate expiry time                                  │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                              ▼                                            │
└─────────────┬──────────────────────────────────────┬─────────────────────┘
              │                                      │
              │ 4a. Upload File                      │ 4b. Prepare Metadata
              │    (if file type)                    │     (text, fileUrl,
              │                                      │      userId, expiry)
              ▼                                      ▼
┌──────────────────────────────┐      ┌──────────────────────────────────┐
│     CLOUDINARY STORAGE       │      │      MONGODB DATABASE            │
│   (Cloud File Storage)       │      │    (Atlas Cloud Database)        │
│                              │      │                                  │
│  • Receives uploaded file    │      │  Collections:                   │
│  • Stores in cloud           │      │  ┌────────────────────────────┐ │
│  • Generates public URL      │      │  │ Users Collection           │ │
│  • Returns:                  │      │  │ • _id, name, email,        │ │
│    - File URL                │      │  │   password (hashed)        │ │
│    - Public ID               │      │  └────────────────────────────┘ │
│    - Resource Type           │      │                                  │
│                              │      │  ┌────────────────────────────┐ │
│                              │      │  │ Contents Collection        │ │
│                              │◄─────┤  │ • _id (unique link ID)     │ │
│                              │ 5a.  │  │ • type (text/file)         │ │
│  5b. Return file metadata    │ Store│  │ • text or fileUrl          │ │
│                              │ Meta │  │ • cloudinaryPublicId       │ │
└──────────────┬───────────────┘ data │  │ • passwordHash             │ │
               │                      │  │ • viewsRemaining           │ │
               │                      │  │ • userId (user ref/null)   │ │
               └──────────────────────┤  │ • expiresAt (TTL index)    │ │
                                      │  │ • createdAt                │ │
                                      │  └────────────────────────────┘ │
                                      │                                  │
                                      │  5c. MongoDB generates unique    │
                                      │      _id for content             │
                                      │                                  │
                                      └──────────────┬───────────────────┘
                                                     │
                                 6. Return shareable link to backend
                                    (http://localhost:5173/view/{_id})
                                                     │
                                                     ▼
                                            Back to User (step 6)
```

---

## Upload Flow Step-by-Step

**Step 1**: User uploads text or file through the frontend form

**Step 2**: Backend optionally checks JWT token
- If logged in → extracts userId
- If guest → continues with userId = null

**Step 3**: Backend validates and processes the upload
- Validates input fields
- Hashes password if provided
- Sets expiry time (default: 10 minutes)

**Step 4**: Parallel storage operations
- **4a**: If file type → upload to Cloudinary
- **4b**: Prepare metadata for database

**Step 5**: Store in database
- **5a**: Cloudinary returns file URL and metadata
- **5b**: Backend receives file information
- **5c**: MongoDB creates content document with unique ID

**Step 6**: Return shareable link to user
- Format: `http://localhost:5173/view/{unique_id}`
- User can share this link with others

---

## Data Storage

### Text Upload Example:
```
Content Document in MongoDB:
{
  _id: "507f1f77bcf86cd799439011",
  type: "text",
  text: "This is my secret message",
  userId: "699223d8bc523fef3ad57b96",  // or null for guest
  passwordHash: null,
  viewsRemaining: null,
  expiresAt: "2026-02-16T02:00:00Z",
  createdAt: "2026-02-16T01:50:00Z"
}
```

### File Upload Example:
```
Content Document in MongoDB:
{
  _id: "507f1f77bcf86cd799439012",
  type: "file",
  fileUrl: "https://res.cloudinary.com/dx96hjpar/...",
  cloudinaryPublicId: "uploads/abc123def456",
  originalFileName: "document.pdf",
  userId: "699223d8bc523fef3ad57b96",  // or null for guest
  passwordHash: "$2b$10$...",  // if password protected
  viewsRemaining: 5,  // if view limit set
  expiresAt: "2026-02-16T02:00:00Z",
  createdAt: "2026-02-16T01:50:00Z"
}
```

---

## Key Features

✅ **Authenticated Upload**: userId links content to user account  
✅ **Guest Upload**: userId = null, content not tied to account  
✅ **File Storage**: Cloudinary CDN for scalable file delivery  
✅ **Metadata Storage**: MongoDB for searchable content information  
✅ **Auto-Expiry**: TTL index automatically deletes expired content  
✅ **Unique Links**: MongoDB ObjectID ensures hard-to-guess URLs  

---

## Security & Access Control

1. **Link-based Access**: Only users with the exact link can view content
2. **No Public Listing**: No way to browse or search all uploads
3. **Password Protection**: Optional password adds extra security layer
4. **View Limits**: Content auto-deletes after X views
5. **Time-based Expiry**: Content auto-deletes after expiration time
6. **User Ownership**: Only content owner can delete their uploads

---

**Created**: February 16, 2026  
**LinkVault Version**: 1.0 with Full Authentication
