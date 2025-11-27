const mongoose = require("mongoose");
const crypto = require("crypto");

const shareLinkSchema = new mongoose.Schema(
  {
    shareId: {
      type: String,
      required: true,
      unique: true, // unique: true automatically creates an index
      default: () => crypto.randomBytes(16).toString("hex"),
    },
    resourceType: {
      type: String,
      enum: ["folder", "file"],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "resourceType",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null, // null means no expiration
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
// Note: shareId index is already created by unique: true above
shareLinkSchema.index({ ownerId: 1 });

module.exports = mongoose.model("ShareLink", shareLinkSchema);

