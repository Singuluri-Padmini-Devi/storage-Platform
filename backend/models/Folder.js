const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null, // null means root folder
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    path: {
      type: String,
      default: null, // Will be set explicitly, not using default
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
folderSchema.index({ ownerId: 1, parentId: 1 });
folderSchema.index({ ownerId: 1 });

module.exports = mongoose.model("Folder", folderSchema);


