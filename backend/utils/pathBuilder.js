const Folder = require("../models/Folder");

/**
 * Build folder path recursively from root to current folder
 * @param {String} folderId - The folder ID to build path for
 * @returns {String} - The full path like "/My Folder/Subfolder A/Level 2"
 */
const buildFolderPath = async (folderId) => {
  if (!folderId) {
    return "/";
  }

  const pathSegments = [];
  let currentFolder = await Folder.findById(folderId);

  if (!currentFolder) {
    return "/";
  }

  // Build path by traversing up to root
  while (currentFolder) {
    pathSegments.unshift(currentFolder.name);
    
    if (currentFolder.parentId) {
      currentFolder = await Folder.findById(currentFolder.parentId);
    } else {
      break;
    }
  }

  // Join with "/" and add leading "/"
  // Handle empty segments and encode special characters if needed
  const filteredSegments = pathSegments.filter(segment => segment && segment.trim());
  const path = "/" + filteredSegments.join("/");
  return path;
};

/**
 * Update paths for a folder and all its descendants
 * @param {String} folderId - The folder ID whose path changed
 */
const updateDescendantPaths = async (folderId) => {
  if (!folderId) {
    return;
  }

  const folder = await Folder.findById(folderId);
  if (!folder) {
    return;
  }

  // Get all direct children
  const children = await Folder.find({ parentId: folderId });

  // Update each child's path
  for (const child of children) {
    const newPath = await buildFolderPath(child._id);
    await Folder.updateOne(
      { _id: child._id },
      { path: newPath }
    );

    // Recursively update grandchildren
    await updateDescendantPaths(child._id);
  }
};

module.exports = {
  buildFolderPath,
  updateDescendantPaths,
};

