const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  generateShareLink,
  revokeShareLink,
  getMyShareLinks,
} = require("../controllers/shareController");
const { getPublicResource } = require("../controllers/shareController");

// Public routes (no auth required)
router.get("/public/:shareId", getPublicResource);
router.get("/public/:shareId/folder/:folderId", getPublicResource);

// Protected routes (auth required)
router.use(authMiddleware);
router.post("/generate", generateShareLink);
router.delete("/:shareId", revokeShareLink);
router.get("/my", getMyShareLinks);

module.exports = router;


