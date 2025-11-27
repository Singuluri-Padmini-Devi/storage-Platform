const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createFile, renameFile, deleteFile } = require("../controllers/fileController");

// All routes require authentication
router.use(authMiddleware);

router.post("/", createFile);
router.put("/:fileId", renameFile);
router.patch("/:fileId", renameFile); // Support both PUT and PATCH
router.delete("/:fileId", deleteFile);

module.exports = router;


