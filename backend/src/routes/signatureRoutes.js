// backend/src/routes/signatureRoutes.js
const express = require('express');
const { signExpenseReport, getSignedExpenseReports, getSignedReportForVerification } = require('../controllers/signatureController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/:id/sign', protect, authorizeRoles('diretor'), signExpenseReport); // Only Director signs
router.get('/signed', protect, getSignedExpenseReports); // All authenticated users can list signed reports
router.get('/:id/verify', protect, getSignedReportForVerification); // Any authenticated user can get data for verification

module.exports = router;