const File = require("../models/File");
const Folder = require("../models/Folder");

// Create file
const createFile = async (req, res) => {
  try {
    // Support both "folderId" and "folder" field names
    // Support both "fileUrl" and "url" field names
    const { 
      name, 
      folderId, 
      folder,  // Alternative field name
      fileUrl, 
      url,     // Alternative field name
      size, 
      mimeType 
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "File name is required" });
    }

    // Use folderId or folder (whichever is provided)
    const finalFolderId = folderId || folder || null;
    
    // Use fileUrl or url (whichever is provided)
    const finalFileUrl = fileUrl || url || "";

    // Verify folder ownership if folderId is provided
    if (finalFolderId) {
      const folderDoc = await Folder.findOne({
        _id: finalFolderId,
        ownerId: req.user._id,
      });

      if (!folderDoc) {
        return res.status(404).json({ message: "Folder not found" });
      }
    }

    const file = new File({
      name: name.trim(),
      folderId: finalFolderId,
      ownerId: req.user._id,
      fileUrl: finalFileUrl,
      size: size || 0,
      mimeType: mimeType || "application/octet-stream",
    });

    await file.save();

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rename file
const renameFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "File name is required" });
    }

    const file = await File.findOneAndUpdate(
      { _id: fileId, ownerId: req.user._id },
      { name: name.trim() },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOne({
      _id: fileId,
      ownerId: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    await File.deleteOne({ _id: fileId });

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFile,
  renameFile,
  deleteFile,
};


