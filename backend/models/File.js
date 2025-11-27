const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null, // null means root level
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
      default: "", // Can be a dummy URL or actual file storage URL
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "application/octet-stream",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
fileSchema.index({ ownerId: 1, folderId: 1 });
fileSchema.index({ ownerId: 1 });

module.exports = mongoose.model("File", fileSchema);


