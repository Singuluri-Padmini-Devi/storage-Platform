const ShareLink = require("../models/ShareLink");
const Folder = require("../models/Folder");
const File = require("../models/File");

// Generate share link
const generateShareLink = async (req, res) => {
  console.log("REQ.BODY:", req.body);
  try {
    const { resourceType, resourceId } = req.body;

    if (!resourceType || !resourceId) {
      return res
        .status(400)
        .json({ message: "Resource type and ID are required" });
    }

    // Verify ownership
    if (resourceType === "folder") {
      const folder = await Folder.findOne({
        _id: resourceId,
        ownerId: req.user._id,
      });
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
    } else if (resourceType === "file") {
      const file = await File.findOne({
        _id: resourceId,
        ownerId: req.user._id,
      });
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
    }

    // Check if share link already exists
    let shareLink = await ShareLink.findOne({
      resourceType,
      resourceId,
      ownerId: req.user._id,
      isActive: true,
    });

    if (!shareLink) {
      shareLink = new ShareLink({
        resourceType,
        resourceId,
        ownerId: req.user._id,
      });
      await shareLink.save();
    }

    res.json({
      shareId: shareLink.shareId,
      shareUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/public/${shareLink.shareId}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Revoke share link
const revokeShareLink = async (req, res) => {
  try {
    const { shareId } = req.params;

    const shareLink = await ShareLink.findOne({
      shareId,
      ownerId: req.user._id,
    });

    if (!shareLink) {
      return res.status(404).json({ message: "Share link not found" });
    }

    shareLink.isActive = false;
    await shareLink.save();

    res.json({ message: "Share link revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to check if a folder is within a shared folder tree
const isFolderInSharedTree = async (folderId, rootSharedFolderId) => {
  if (folderId.toString() === rootSharedFolderId.toString()) {
    return true;
  }

  let currentFolder = await Folder.findById(folderId);
  if (!currentFolder) return false;

  // Traverse up the tree to see if we reach the root shared folder
  while (currentFolder && currentFolder.parentId) {
    if (currentFolder.parentId.toString() === rootSharedFolderId.toString()) {
      return true;
    }
    currentFolder = await Folder.findById(currentFolder.parentId);
    if (!currentFolder) break;
  }

  return false;
};

// Get public resource (for public view)
const getPublicResource = async (req, res) => {
  try {
    const { shareId, folderId } = req.params;

    const shareLink = await ShareLink.findOne({
      shareId,
      isActive: true,
    });

    if (!shareLink) {
      return res.status(404).json({ message: "Share link not found or expired" });
    }

    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return res.status(410).json({ message: "Share link has expired" });
    }

    // If folderId is provided, it means we're navigating into a nested folder
    if (shareLink.resourceType === "folder" && folderId) {
      // Verify the folder is within the shared folder tree
      const isValid = await isFolderInSharedTree(folderId, shareLink.resourceId);
      if (!isValid) {
        return res.status(403).json({ message: "Access denied to this folder" });
      }

      const folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      // Get sub-folders and files
      const subFolders = await Folder.find({
        parentId: folderId,
      }).sort({ name: 1 });

      const files = await File.find({
        folderId: folderId,
      }).sort({ name: 1 });

      // Get parent folder info
      let parentFolder = null;
      if (folder.parentId) {
        // Only show parent if it's still within the shared tree
        const parentIsValid = await isFolderInSharedTree(folder.parentId, shareLink.resourceId);
        if (parentIsValid) {
          parentFolder = await Folder.findById(folder.parentId);
        }
      }

      res.json({
        type: "folder",
        folder,
        subFolders,
        files,
        parentFolder,
        rootShareId: shareLink.shareId,
        rootFolderId: shareLink.resourceId.toString(),
      });
      return;
    }

    // Original shared resource (root of the share)
    if (shareLink.resourceType === "folder") {
      const folder = await Folder.findById(shareLink.resourceId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      // Get sub-folders and files
      const subFolders = await Folder.find({
        parentId: shareLink.resourceId,
      }).sort({ name: 1 });

      const files = await File.find({
        folderId: shareLink.resourceId,
      }).sort({ name: 1 });

      res.json({
        type: "folder",
        folder,
        subFolders,
        files,
        parentFolder: null,
        rootShareId: shareLink.shareId,
        rootFolderId: shareLink.resourceId.toString(),
      });
    } else {
      const file = await File.findById(shareLink.resourceId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json({
        type: "file",
        file,
        rootShareId: shareLink.shareId,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all share links for current user
const getMyShareLinks = async (req, res) => {
  try {
    const shareLinks = await ShareLink.find({
      ownerId: req.user._id,
      isActive: true,
    })
      .populate("resourceId")
      .sort({ createdAt: -1 });

    res.json(shareLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateShareLink,
  revokeShareLink,
  getPublicResource,
  getMyShareLinks,
};
