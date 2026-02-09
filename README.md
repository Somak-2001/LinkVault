# LinkVault

LinkVault is a full-stack web application that allows users to securely upload **text or files** and share them using a **unique, hard-to-guess link**. The uploaded content is accessible **only to users who possess the link** and is automatically deleted after a specified expiry time.

The application is inspired by link-based sharing systems such as Pastebin and Google Drive’s “anyone with the link” feature.

---

## Features

- Upload **plain text or a file** (one per upload)
- Generate a **unique shareable URL**
- Access content strictly via the generated link
- View and copy uploaded text
- Download uploaded files
- Automatic expiry of content
- Clean and simple user interface
- No authentication or login system (as per assignment requirements)

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- Multer (for file uploads)

### Database
- MongoDB (Atlas)
- Mongoose ODM

---

## Design Decisions

### Database Choice
MongoDB was chosen due to its flexible schema and built-in support for **TTL (Time-To-Live) indexes**. TTL indexes allow expired content to be deleted automatically at the database level without requiring background cleanup jobs.

### Access Control
No authentication system is implemented. Instead, access control is enforced through:
- Secure, randomly generated IDs
- No public listing or search functionality
- Returning `403` responses for invalid or expired links

### Expiry Handling
- Users may optionally specify an expiry date and time
- If no expiry is provided, content expires **10 minutes after upload**
- Expired content is automatically deleted by MongoDB

### File Storage
Uploaded files are stored locally on the server (`uploads/` directory), while metadata is stored in MongoDB. This design keeps the implementation simple and allows future migration to object storage services if required.

---

## API Overview

### POST `/api/upload`
Uploads text or a file and returns a shareable link.

**Request**
- `multipart/form-data`
- Fields:
  - `text` (optional)
  - `file` (optional)
  - `expiry` (optional)

**Response**
```json
{
  "url": "http://localhost:5173/view/<id>"
}
