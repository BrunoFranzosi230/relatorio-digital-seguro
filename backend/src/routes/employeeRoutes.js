// backend/src/routes/employeeRoutes.js
const express = require('express');
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes protected by authentication
router.route('/')
    .get(protect, authorizeRoles('gerente', 'diretor'), getEmployees) // Managers and Directors can list
    .post(protect, authorizeRoles('diretor'), createEmployee); // Only Directors can create

router.route('/:id')
    .get(protect, authorizeRoles('gerente', 'diretor'), getEmployeeById)
    .put(protect, authorizeRoles('gerente', 'diretor'), updateEmployee) // Manager can update their staff
    .delete(protect, authorizeRoles('diretor'), deleteEmployee); // Only Directors can delete

module.exports = router;