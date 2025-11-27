const Folder = require("../models/Folder");
const File = require("../models/File");
const { buildFolderPath, updateDescendantPaths } = require("../utils/pathBuilder");

// Get all root folders
const getAllRootFolders = async (req, res) => {
  try {
    const folders = await Folder.find({
      ownerId: req.user._id,
      parentId: null,
    }).sort({ createdAt: -1 });

    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all folders (for "Find All Folders" view)
const getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single folder by ID
const getFolderById = async (req, res) => {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findOne({
      _id: folderId,
      ownerId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Ensure path is up to date
    if (!folder.path || folder.path === "/") {
      folder.path = await buildFolderPath(folderId);
      await folder.save();
    }

    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sub-folders of a specific folder
const getSubFolders = async (req, res) => {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findOne({
      _id: folderId,
      ownerId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const subFolders = await Folder.find({
      parentId: folderId,
      ownerId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(subFolders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get folder contents (folders + files)
const getFolderContents = async (req, res) => {
  try {
    // Check if this is the root/contents route (no folderId param)
    const folderId = req.params.folderId;
    const folderIdParam = !folderId || folderId === "root" ? null : folderId;

    // Verify ownership if folderId is provided
    if (folderIdParam) {
      const folder = await Folder.findOne({
        _id: folderIdParam,
        ownerId: req.user._id,
      });

      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
    }

    const folders = await Folder.find({
      parentId: folderIdParam,
      ownerId: req.user._id,
    }).sort({ name: 1 });

    const files = await File.find({
      folderId: folderIdParam,
      ownerId: req.user._id,
    }).sort({ name: 1 });

    // Get current folder and ensure path is up to date
    let currentFolder = folderIdParam
      ? await Folder.findById(folderIdParam)
      : null;
    
    // Ensure path is set for current folder
    if (currentFolder && (!currentFolder.path || currentFolder.path === "/")) {
      currentFolder.path = await buildFolderPath(folderIdParam);
      await currentFolder.save();
    }

    // Get parent folder info if not root
    let parentFolder = null;
    if (currentFolder && currentFolder.parentId) {
      parentFolder = await Folder.findById(currentFolder.parentId);
    }

    res.json({
      folders,
      files,
      currentFolder,
      parentFolder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create folder
const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    // Verify parent folder ownership if parentId is provided
    let parent = null;
    let path = "/";

    if (parentId) {
      parent = await Folder.findOne({
        _id: parentId,
        ownerId: req.user._id,
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent folder not found" });
      }

      // Build path from parent
      // First, ensure parent has a correct path
      if (!parent.path || parent.path === "/") {
        parent.path = await buildFolderPath(parentId);
        await parent.save();
      }

      // Build child path: parentPath + "/" + childName
      path = parent.path === "/" ? `/${name}` : `${parent.path}/${name}`;
    } else {
      // Root folder - path is just the folder name
      path = `/${name}`;
    }

    // Create folder with explicit path
    const folder = new Folder({
      name: name.trim(),
      parentId: parentId || null,
      ownerId: req.user._id,
      path: path, // Explicitly set the path
    });

    // Save the folder
    await folder.save();

    // Verify path was saved correctly
    const savedFolder = await Folder.findById(folder._id);
    
    // If path is still "/", rebuild it
    if (savedFolder && (!savedFolder.path || savedFolder.path === "/")) {
      const correctPath = await buildFolderPath(folder._id);
      savedFolder.path = correctPath;
      await savedFolder.save();
    }

    // Return the folder with correct path
    const finalFolder = await Folder.findById(folder._id);
    res.status(201).json(finalFolder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rename folder
const renameFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await Folder.findOne({
      _id: folderId,
      ownerId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Update the folder name
    folder.name = name.trim();
    
    // Save the name change first
    await folder.save();
    
    // Rebuild the path for this folder (after name is saved)
    const newPath = await buildFolderPath(folderId);
    folder.path = newPath;
    await folder.save();

    // Update paths for all descendant folders (children, grandchildren, etc.)
    await updateDescendantPaths(folderId);

    // Fetch updated folder with new path
    const updatedFolder = await Folder.findById(folderId);

    res.json(updatedFolder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete folder
const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findOne({
      _id: folderId,
      ownerId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Check if folder has sub-folders or files
    const subFolders = await Folder.countDocuments({ parentId: folderId });
    const files = await File.countDocuments({ folderId });

    if (subFolders > 0 || files > 0) {
      return res
        .status(400)
        .json({
          message: "Cannot delete folder. It contains sub-folders or files",
        });
    }

    await Folder.deleteOne({ _id: folderId });

    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRootFolders,
  getAllFolders,
  getFolderById,
  getSubFolders,
  getFolderContents,
  createFolder,
  renameFolder,
  deleteFolder,
};

