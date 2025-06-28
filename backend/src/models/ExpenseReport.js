// backend/src/models/ExpenseReport.js
const mongoose = require('mongoose');

const expenseReportSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    submittedBy: { // Reference to the User who submitted it
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiptUrl: { // URL where the uploaded receipt is stored (e.g., cloud storage link)
        type: String,
        required: false // Can be optional
    },
    status: {
        type: String,
        enum: ['pendente', 'aprovado', 'rejeitado', 'assinado'],
        default: 'pendente'
    },
    validation: { // Details of manager's validation
        validatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        comment: String,
        validatedAt: Date
    },
    signature: { // Digital signature details
        signedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        signatureValue: String, // The actual digital signature (Base64 encoded)
        publicKeyUsed: Object, // The public key (JWK format) used to verify this specific signature
        signedAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update `updatedAt` on every save
expenseReportSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const ExpenseReport = mongoose.model('ExpenseReport', expenseReportSchema);
module.exports = ExpenseReport;