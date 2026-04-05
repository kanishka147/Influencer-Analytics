const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);
router.put('/auth/profile', auth, authController.updateProfile);

// Influencer Routes (Public/Private based on needs, we'll keep creation open for simplicity, or protect it)
router.post('/users', auth, analyticsController.createInfluencer);
router.get('/users', auth, analyticsController.getAllInfluencers);

// Analytics & Reports (Protected)
router.post('/analyze', auth, analyticsController.generateReport);
router.get('/reports', auth, analyticsController.getAllReports);
router.get('/reports/:id', auth, analyticsController.getReportById);
router.patch('/reports/:id/status', auth, analyticsController.updateReportStatus);

// Influencer Profile
router.get('/users/:id', auth, analyticsController.getInfluencerById);
router.get('/users/:id/reports', auth, analyticsController.getInfluencerReports);

module.exports = router;
