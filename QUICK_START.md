# 🚀 Quick Start Guide

## Prerequisites Check

```bash
# Check Node.js version (should be v16+)
node --version

# Check if MongoDB is installed
mongod --version
```

## Step-by-Step Setup

### 1️⃣ Start MongoDB

**Windows:**
- MongoDB should start automatically as a service
- Or run: `mongod` in a terminal

**Mac/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod
# Or
mongod
```

### 2️⃣ Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Install packages
npm install

# Create environment file
# Windows PowerShell:
Copy-Item .env.example .env

# Or manually create .env with:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/storage-platform
# JWT_SECRET=your-secret-key-12345
# FRONTEND_URL=http://localhost:3000

# Start backend server
npm start
```

**✅ You should see:**
```
✅ MongoDB Connected
✅ Server running on http://localhost:5000
```

**Keep this terminal open!**

### 3️⃣ Frontend Setup (Terminal 2 - NEW TERMINAL)

```bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start frontend server
npm run dev
```

**✅ You should see:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:3000/
```

**Keep this terminal open!**

### 4️⃣ Open Browser

1. Go to: **http://localhost:3000**
2. You'll see the **Login** page
3. Click **"Don't have an account? Register"**
4. Fill in:
   - Email: `admin@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
5. Click **Register**
6. You'll be automatically logged in and redirected to the Dashboard!

## 🎉 You're Ready!

Now you can:
- ✅ Create folders
- ✅ Add files
- ✅ Navigate through folders
- ✅ Generate share links
- ✅ View public shared content

## 📝 Common Commands Reference

### Backend
```bash
cd backend
npm install      # First time only
npm start        # Start server
```

### Frontend
```bash
cd frontend
npm install      # First time only
npm run dev      # Start dev server
```

## 🐛 Troubleshooting

### "MongoDB Connection Error"
- Make sure MongoDB is running
- Check your MONGO_URI in backend/.env

### "Port 5000 already in use"
- Change PORT in backend/.env to another port (e.g., 5001)
- Update FRONTEND_URL if needed

### "Cannot connect to API"
- Make sure backend is running
- Check backend terminal for errors
- Verify backend URL in browser console

## 📚 Need More Help?

See `SETUP.md` for detailed instructions and troubleshooting.


