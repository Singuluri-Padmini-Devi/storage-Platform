# 📚 Postman Documentation Setup Guide

## Step-by-Step Instructions

### Step 1: Import the Collection (Easiest Method)

1. **Open Postman** (you're already signed in ✅)

2. **Click "Import" button** (top left corner)

3. **Import the collection file:**
   - Click "Upload Files"
   - Select `Storage-Platform-API.postman_collection.json` from this project
   - Click "Import"

4. **You should now see "Storage Platform API" collection** in your sidebar

### Step 2: Set Up Environment Variables

1. **Create Environment:**
   - Click the gear icon (⚙️) next to "Environments" in left sidebar
   - Click "Add" or "+" button
   - Name it: `Storage Platform Local`
   - Add these variables:

   | Variable | Initial Value | Current Value |
   |----------|---------------|---------------|
   | `base_url` | `http://localhost:5000` | `http://localhost:5000` |
   | `token` | (leave empty) | (leave empty) |

2. **Save the environment**

3. **Select the environment** from the dropdown (top right)

### Step 3: Test Authentication First

1. **Register a new user:**
   - Go to: `Auth` → `Register`
   - Click "Send"
   - Copy the `token` from response

2. **Set the token:**
   - Go to environment variables
   - Paste the token in `token` variable
   - Save

3. **Now all protected routes will use this token automatically!**

### Step 4: Publish Documentation

1. **Click on your collection** "Storage Platform API"

2. **Click the "..." (three dots)** next to collection name

3. **Select "Publish"** or "View Documentation"

4. **In the documentation page:**
   - Click "Publish" button (top right)
   - Choose visibility: **Public** or **Team** (Public is recommended for submission)
   - Click "Publish Collection"

5. **Copy the public link** - This is what you submit! ✅

---

## Alternative: Manual Setup (If Import Doesn't Work)

### Create Collection Manually

1. **Click "New" → "Collection"**
   - Name: `Storage Platform API`
   - Description: `Full-stack storage platform API with authentication, folders, files, and sharing`

2. **Create folders:**
   - `Auth` (for authentication endpoints)
   - `Folders` (for folder operations)
   - `Files` (for file operations)
   - `Shares` (for share link operations)

3. **Add each endpoint** (see API endpoints list below)

---

## 📋 All API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register
- **Method:** `POST`
- **URL:** `/auth/register`
- **Auth:** None
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 2. Login
- **Method:** `POST`
- **URL:** `/auth/login`
- **Auth:** None
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 3. Get Current User
- **Method:** `GET`
- **URL:** `/auth/me`
- **Auth:** Bearer Token (required)

---

### Folder Endpoints (All require Auth)

#### 4. Get Root Folders
- **Method:** `GET`
- **URL:** `/folders/root`
- **Auth:** Bearer Token

#### 5. Get All Folders
- **Method:** `GET`
- **URL:** `/folders/all`
- **Auth:** Bearer Token

#### 6. Get Folder by ID
- **Method:** `GET`
- **URL:** `/folders/:folderId`
- **Auth:** Bearer Token
- **Example:** `/folders/507f1f77bcf86cd799439011`

#### 7. Get Sub-Folders
- **Method:** `GET`
- **URL:** `/folders/:folderId/subfolders`
- **Auth:** Bearer Token

#### 8. Get Root Contents
- **Method:** `GET`
- **URL:** `/folders/root/contents`
- **Auth:** Bearer Token

#### 9. Get Folder Contents
- **Method:** `GET`
- **URL:** `/folders/:folderId/contents`
- **Auth:** Bearer Token

#### 10. Create Folder
- **Method:** `POST`
- **URL:** `/folders`
- **Auth:** Bearer Token
- **Body:**
```json
{
  "name": "My New Folder",
  "parentId": null
}
```

#### 11. Rename Folder
- **Method:** `PUT` or `PATCH`
- **URL:** `/folders/:folderId`
- **Auth:** Bearer Token
- **Body:**
```json
{
  "name": "Renamed Folder"
}
```

#### 12. Delete Folder
- **Method:** `DELETE`
- **URL:** `/folders/:folderId`
- **Auth:** Bearer Token

---

### File Endpoints (All require Auth)

#### 13. Create File
- **Method:** `POST`
- **URL:** `/files`
- **Auth:** Bearer Token
- **Body:**
```json
{
  "name": "document.pdf",
  "folderId": null,
  "fileUrl": "https://example.com/file.pdf"
}
```

#### 14. Rename File
- **Method:** `PUT` or `PATCH`
- **URL:** `/files/:fileId`
- **Auth:** Bearer Token
- **Body:**
```json
{
  "name": "renamed-document.pdf"
}
```

#### 15. Delete File
- **Method:** `DELETE`
- **URL:** `/files/:fileId`
- **Auth:** Bearer Token

---

### Share Link Endpoints

#### 16. Generate Share Link (Protected)
- **Method:** `POST`
- **URL:** `/shares/generate`
- **Auth:** Bearer Token
- **Body:**
```json
{
  "resourceType": "folder",
  "resourceId": "507f1f77bcf86cd799439011"
}
```

#### 17. Get My Share Links (Protected)
- **Method:** `GET`
- **URL:** `/shares/my`
- **Auth:** Bearer Token

#### 18. Revoke Share Link (Protected)
- **Method:** `DELETE`
- **URL:** `/shares/:shareId`
- **Auth:** Bearer Token

#### 19. Get Public Resource (Public - No Auth)
- **Method:** `GET`
- **URL:** `/shares/public/:shareId`
- **Auth:** None
- **Example:** `/shares/public/abc123def456...`

#### 20. Get Public Folder (Public - No Auth)
- **Method:** `GET`
- **URL:** `/shares/public/:shareId/folder/:folderId`
- **Auth:** None

---

## 🔑 Setting Up Authentication

### For Protected Routes:

1. **Go to request** → **Authorization** tab
2. **Type:** Bearer Token
3. **Token:** `{{token}}` (uses environment variable)

OR manually:
- **Type:** Bearer Token
- **Token:** Paste your JWT token here

---

## 📝 Adding Descriptions to Requests

For each request:

1. **Click on the request**
2. **Go to "Description" tab** (below URL)
3. **Add description**, example:
   ```
   Creates a new folder in the storage platform.
   
   - If parentId is null, creates a root folder
   - If parentId is provided, creates a sub-folder
   - Returns the created folder with path information
   ```

4. **Add example response:**
   - Click "Save Response" → "Save as Example"
   - After making a successful request, save the response

---

## 🎨 Tips for Better Documentation

1. **Add examples to all requests** - Save successful responses as examples
2. **Add descriptions** - Explain what each endpoint does
3. **Use environment variables** - Makes it easier to switch between local/production
4. **Organize in folders** - Group related endpoints
5. **Add pre-request scripts** - Auto-generate tokens if needed

---

## ✅ Final Checklist Before Publishing

- [ ] All endpoints added
- [ ] All requests have descriptions
- [ ] Example responses saved for each request
- [ ] Environment variables set up
- [ ] Authentication working
- [ ] Tested all endpoints
- [ ] Collection is well-organized

---

## 📤 Submitting Your Documentation

Once published, you'll get a link like:
```
https://documenter.getpostman.com/view/12345678/...
```

**Submit this link** along with your GitHub repository links!

---

## 🆘 Troubleshooting

**Issue: Can't import collection**
- Make sure you're using Postman desktop app or web version
- Check that the JSON file is valid

**Issue: Authentication not working**
- Make sure you've set the `token` environment variable
- Check that you're using `{{token}}` in Authorization tab
- Verify the token is valid (not expired)

**Issue: Can't publish**
- Make sure you're signed in to Postman
- Check your internet connection
- Try making the collection public first

---

Need help? Check the Postman documentation or ask for assistance!

