const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getAllRootFolders,
  getAllFolders,
  getFolderById,
  getSubFolders,
  getFolderContents,
  createFolder,
  renameFolder,
  deleteFolder,
} = require("../controllers/folderController");

// All routes require authentication
router.use(authMiddleware);

router.get("/root", getAllRootFolders);
router.get("/all", getAllFolders);
router.get("/root/contents", getFolderContents); // Must come before /:folderId/contents
router.get("/:folderId", getFolderById); // Get single folder - must come before other :folderId routes
router.get("/:folderId/subfolders", getSubFolders);
router.get("/:folderId/contents", getFolderContents);
router.post("/", createFolder);
router.put("/:folderId", renameFolder);
router.patch("/:folderId", renameFolder); // Support both PUT and PATCH
router.delete("/:folderId", deleteFolder);

module.exports = router;

