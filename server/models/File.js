const mongoose = require('mongoose');

// File schema for storing file metadata
const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  mimetype: {
    type: String,
    required: [true, 'File type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  shareId: {
    type: String,
    unique: true,
    required: true,
    index: true // Index for faster lookups
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Index for faster queries
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ shareId: 1 });
fileSchema.index({ expiresAt: 1 });

// Method to check if file has expired
fileSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to increment download count
fileSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

// Static method to find expired files
fileSchema.statics.findExpired = function() {
  return this.find({ expiresAt: { $lt: new Date() } });
};

// Pre-remove middleware to delete actual file from filesystem
fileSchema.pre('deleteOne', { document: true, query: false }, async function() {
  const fs = require('fs').promises;
  try {
    await fs.unlink(this.path);
    console.log(`🗑️ Deleted file: ${this.path}`);
  } catch (error) {
    console.error(`❌ Error deleting file ${this.path}:`, error.message);
  }
});

module.exports = mongoose.model('File', fileSchema);
