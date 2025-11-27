# Storage Platform

A simplified internal storage platform similar to Google Drive, built with React + TypeScript (frontend) and Node.js + Express + MongoDB (backend).

## 🚀 Quick Start

**New to this project?** Start here: **[QUICK_START.md](./QUICK_START.md)**

**MongoDB setup?** See: **[MONGODB_SETUP.md](./MONGODB_SETUP.md)**

**Assignment summary?** See: **[ASSIGNMENT_COMPLETE.md](./ASSIGNMENT_COMPLETE.md)**

## Features

- **Authentication**: Admin login system with JWT tokens
- **Folder Management**: Create, rename, delete folders with nested structure
- **File Management**: Add, rename, delete files (metadata with optional file URLs)
- **Share Links**: Generate public share links for folders and files
- **Public View**: Read-only public access via share links
- **Dashboard**: Overview of root folders and storage statistics

## Tech Stack

### Frontend
- React 18
- TypeScript
- React Router
- Axios
- Vite

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs

## Quick Start

**For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md)**

### Quick Commands

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```
✅ Expected: `Server running on http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```
✅ Expected: `Local: http://localhost:3000/`

**Browser:**
1. Open http://localhost:3000
2. Click "Register" to create your first admin account
3. Start using the platform!

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher) - Check: `node --version`
- MongoDB (running locally) - Check: `mongod --version`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
# Windows PowerShell:
Copy-Item .env.example .env

# Or manually create .env with:
PORT=5000
MONGO_URI=mongodb://localhost:27017/storage-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

4. Start backend server:
```bash
npm start
```

**Expected Output:**
```
✅ MongoDB Connected
✅ Server running on http://localhost:5000
```

### Frontend Setup

1. Navigate to frontend directory (in a NEW terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in XXX ms
  ➜  Local:   http://localhost:3000/
```

4. Open browser: **http://localhost:3000**

## Usage

### First Time Setup

1. ✅ Start MongoDB
2. ✅ Start backend server (Terminal 1)
3. ✅ Start frontend server (Terminal 2)
4. ✅ Open http://localhost:3000 in browser
5. ✅ Click "Register" on the login page
6. ✅ Create your admin account
7. ✅ You'll be automatically logged in!

### Using the Application

1. **Login**: Navigate to `/login` and enter your credentials
2. **Register**: Click "Register" link on login page (first time only)
3. **Dashboard**: View root folders and statistics
4. **All Folders**: View and manage all folders in the system
5. **Folder View**: Navigate through nested folders, create sub-folders, add files
6. **Public View**: Access shared folders/files via `/public/:shareId`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Folders
- `GET /api/folders/root` - Get root folders (protected)
- `GET /api/folders/all` - Get all folders (protected)
- `GET /api/folders/:folderId/subfolders` - Get sub-folders (protected)
- `GET /api/folders/:folderId/contents` - Get folder contents (protected)
- `GET /api/folders/root/contents` - Get root folder contents (protected)
- `POST /api/folders` - Create folder (protected)
- `PUT /api/folders/:folderId` - Rename folder (protected)
- `DELETE /api/folders/:folderId` - Delete folder (protected)

### Files
- `POST /api/files` - Create file (protected)
- `PUT /api/files/:fileId` - Rename file (protected)
- `DELETE /api/files/:fileId` - Delete file (protected)

### Shares
- `POST /api/shares/generate` - Generate share link (protected)
- `DELETE /api/shares/:shareId` - Revoke share link (protected)
- `GET /api/shares/public/:shareId` - Get public resource (public)
- `GET /api/shares/my` - Get my share links (protected)

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── folderController.js
│   │   ├── fileController.js
│   │   └── shareController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Folder.js
│   │   ├── File.js
│   │   └── ShareLink.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── folderRoutes.js
│   │   ├── fileRoutes.js
│   │   └── shareRoutes.js
│   ├── utils/
│   │   └── jwt.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Notes

- File storage is currently metadata-only. You can add file URLs, but actual file upload would require additional setup (e.g., Multer for file uploads, cloud storage integration).
- Share links don't expire by default, but the schema supports expiration dates.
- The application uses JWT tokens stored in localStorage for authentication.

