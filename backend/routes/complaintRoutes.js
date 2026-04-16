const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Complaint = require('../models/Complaint');
const { protect, admin } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'civiceye_complaints',
    allowedFormats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage: storage });

// Create a new complaint (with image)
router.post('/create', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, lat, lng } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const newComplaint = new Complaint({
      title,
      description,
      category,
      imageUrl,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      user: req.user._id,
    });

    const savedComplaint = await newComplaint.save();
    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Get user's own complaints (Customer)
router.get('/my', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get all complaints (Admin)
router.get('/all', protect, admin, async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all complaints' });
  }
});

// Update complaint status (Admin)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      const oldStatus = complaint.status;
      complaint.status = status || complaint.status;
      const updatedComplaint = await complaint.save();
      
      // Populate user info before returning to keep frontend synced
      await updatedComplaint.populate('user', 'name email');
      
      // --- AUTOMATED EMAIL DISPATCH TRIGGER ---
      // If the ticket transitions from pending/progress into Resolved, notify the citizen!
      if (oldStatus !== 'Resolved' && updatedComplaint.status === 'Resolved' && updatedComplaint.user && updatedComplaint.user.email) {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #2563EB;">Good News, ${updatedComplaint.user.name}!</h1>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">Your recent CivicEye report regarding <strong>"${updatedComplaint.title}"</strong> has officially been marked as <strong>RESOLVED</strong> by the authorities.</p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; color: #1E293B;"><strong>Category:</strong> ${updatedComplaint.category}</p>
              <p style="margin: 8px 0 0; color: #22C55E; font-weight: bold; font-size: 1.1rem;">Status: RESOLVED &check;</p>
            </div>
            <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">Thank you for contributing to your city.<br><br><em>— The CivicEye Administrative Team</em></p>
          </div>
        `;

        // Fire and forget asynchronous mailing
        sendEmail({
          email: updatedComplaint.user.email,
          subject: 'CivicEye: Your Reported Issue Has Been Resolved!',
          html: emailHtml
        });
      }

      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

module.exports = router;
