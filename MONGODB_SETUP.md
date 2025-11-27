# MongoDB Setup Guide

## Issue: MongoDB Connection Error

If you see this error:
```
❌ MongoDB Connection Error: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solution Options

### Option 1: Use Local MongoDB (Recommended for Development)

1. **Install MongoDB locally** (if not installed):
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: Follow MongoDB installation guide

2. **Start MongoDB**:
   ```bash
   # Windows (usually runs as service automatically)
   # Or manually:
   mongod
   
   # Mac/Linux
   sudo systemctl start mongod
   # Or
   mongod
   ```

3. **Update your `.env` file** in `backend/`:
   ```env
   MONGO_URI=mongodb://localhost:27017/storage-platform
   ```

4. **Restart your backend server**

---

### Option 2: Use MongoDB Atlas (Cloud)

If you want to use MongoDB Atlas:

1. **Whitelist your IP address**:
   - Go to: https://cloud.mongodb.com/
   - Select your cluster
   - Click "Network Access" → "Add IP Address"
   - Click "Add Current IP Address" (or add `0.0.0.0/0` for all IPs - less secure)
   - Wait a few minutes for changes to propagate

2. **Get your connection string**:
   - In Atlas, click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

3. **Update your `.env` file**:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/storage-platform?retryWrites=true&w=majority
   ```

4. **Restart your backend server**

---

## Quick Test

After fixing the connection, you should see:
```
✅ MongoDB Connected: localhost:27017
✅ Server running on http://localhost:5000
```

Or for Atlas:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ Server running on http://localhost:5000
```

---

## Troubleshooting

### "MongoDB service not found"
- Make sure MongoDB is installed
- Check if MongoDB service is running (Windows: Services app)

### "Connection timeout"
- Check your internet connection (for Atlas)
- Verify firewall isn't blocking MongoDB port (27017 for local)

### "Authentication failed"
- Double-check your username and password in the connection string
- Make sure you've created a database user in Atlas

---

## Default Connection Strings

**Local MongoDB:**
```
mongodb://localhost:27017/storage-platform
```

**MongoDB Atlas:**
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/storage-platform?retryWrites=true&w=majority
```

Replace `<username>` and `<password>` with your actual credentials.


