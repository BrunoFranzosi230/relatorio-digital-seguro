// backend/src/routes/authRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator'); // Import express-validator for input validation
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return 400 Bad Request with validation errors
        return res.status(400).json({ errors: errors.array() });
    }
    next(); // If no errors, proceed to the next middleware/controller
};

// Route for user registration with validation
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Nome é obrigatório'),
        body('email').isEmail().withMessage('Email inválido'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('A senha deve ter pelo menos 6 caracteres'),
        // Optionally, validate role if it's sent from frontend for specific user types
        // body('role').optional().isIn(['colaborador', 'gerente', 'diretor']).withMessage('Role inválida'),
    ],
    validate, // Apply the validation middleware
    registerUser // Then call the controller function
);

// Route for user login with validation
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('password').notEmpty().withMessage('A senha é obrigatória'),
    ],
    validate, // Apply the validation middleware
    loginUser // Then call the controller function
);

// Route to get user profile (protected, no validation needed for GET requests)
router.get('/profile', protect, getUserProfile); // This route uses the 'protect' middleware to ensure authentication

module.exports = router;
