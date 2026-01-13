const express = require('express');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const path = require('path');
const fs = require('fs').promises;
const { sendFileShareEmail } = require('../services/emailService');

const router = express.Router();

// @route   POST /api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', authenticateToken, upload.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate unique share ID
    const shareId = uuidv4();

    // Create file document
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: req.user._id,
      shareId: shareId
    });

    await file.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        file: {
          id: file._id,
          filename: file.filename,
          originalName: file.originalName,
          mimetype: file.mimetype,
          size: file.size,
          shareId: file.shareId,
          downloadCount: file.downloadCount,
          createdAt: file.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if database save fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error uploading file'
    });
  }
});

// @route   GET /api/files/my-files
// @desc    Get user's uploaded files
// @access  Private
router.get('/my-files', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const files = await File.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-path');

    const total = await File.countDocuments({ uploadedBy: req.user._id });

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching files'
    });
  }
});

// @route   GET /api/files/recent
// @desc    Get user's recent files
// @access  Private
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const files = await File.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-path');

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Get recent files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recent files'
    });
  }
});

// @route   GET /api/files/share/:shareId
// @desc    Get shared file information
// @access  Public
router.get('/share/:shareId', async (req, res) => {
  try {
    const file = await File.findOne({ shareId: req.params.shareId }).select('-path');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if file has expired
    if (file.isExpired()) {
      return res.status(410).json({
        success: false,
        message: 'File has expired'
      });
    }

    res.json({
      success: true,
      data: {
        id: file._id,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        downloadCount: file.downloadCount,
        createdAt: file.createdAt,
        expiresAt: file.expiresAt
      }
    });
  } catch (error) {
    console.error('Get shared file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching file information'
    });
  }
});

// @route   GET /api/files/download/:shareId
// @desc    Download a shared file
// @access  Public
router.get('/download/:shareId', async (req, res) => {
  try {
    console.log(`📥 Download request for shareId: ${req.params.shareId}`);
    console.log(`📅 Current time: ${new Date().toISOString()}`);
    
    const file = await File.findOne({ shareId: req.params.shareId });

    if (!file) {
      console.log(`❌ File not found for shareId: ${req.params.shareId}`);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    console.log(`✅ Found file: ${file.originalName}, path: ${file.path}`);
    console.log(`⏰ File expires at: ${file.expiresAt.toISOString()}`);
    console.log(`⏰ Is expired: ${file.isExpired()}`);

    // Check if file has expired
    if (file.isExpired()) {
      console.log(`❌ File expired: ${file.originalName}`);
      return res.status(410).json({
        success: false,
        message: 'File has expired'
      });
    }

    // Check if file exists
    try {
      await fs.access(file.path);
      console.log(`✅ File exists on disk: ${file.path}`);
    } catch (error) {
      console.log(`❌ File not found on disk: ${file.path}`);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    file.downloadCount += 1;
    await file.save();
    console.log(`📈 Download count updated: ${file.downloadCount}`);

    // Set headers for file download
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);

    console.log(`🚀 Sending file: ${file.originalName}`);
    // Send file
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error('❌ Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error downloading file'
    });
  }
});

// @route   DELETE /api/files/:fileId
// @desc    Delete a file
// @access  Private
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      uploadedBy: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete physical file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    // Delete file document
    await File.findByIdAndDelete(req.params.fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting file'
    });
  }
});

// @route   POST /api/files/share-email
// @desc    Share file via email
// @access  Private
router.post('/share-email', authenticateToken, async (req, res) => {
  try {
    const { shareId, email } = req.body;

    if (!shareId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Share ID and email are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Find the file
    const file = await File.findOne({ shareId });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${file.shareId}`;
    // Check if user owns the file
    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only share your own files'
      });
    }

    // Check if file has expired
    if (file.isExpired()) {
      return res.status(410).json({
        success: false,
        message: 'File has expired and cannot be shared'
      });
    }

    // Send the actual email
    try {
      console.log(`Attempting to send email to ${email} for file: ${file.originalName}`);
      console.log(`Using EMAIL_USER: ${process.env.EMAIL_USER ? 'SET' : 'NOT SET'}`);
      console.log(`Using EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET' : 'NOT SET'}`);
      
      const result = await sendFileShareEmail(
        email,
        req.user.username || req.user.email,
        file.originalName,
        shareUrl,
        file.size
      );
      
      console.log(`Email successfully sent to ${email}. Message ID: ${result.messageId}`);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      console.error('Email error details:', emailError.message);
      
      // Return error to client instead of silent failure
      return res.status(500).json({
        success: false,
        message: 'Failed to send email. Please check email configuration.',
        error: emailError.message
      });
    }

    res.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        email: email,
        fileName: file.originalName,
        shareUrl: shareUrl
      }
    });
  } catch (error) {
    console.error('Share file by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending email'
    });
  }
});

// @route   GET /api/files/stats
// @desc    Get user's file statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await File.aggregate([
      { $match: { uploadedBy: req.user._id } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ]);

    const result = stats[0] || {
      totalFiles: 0,
      totalSize: 0,
      totalDownloads: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
});

module.exports = router;
