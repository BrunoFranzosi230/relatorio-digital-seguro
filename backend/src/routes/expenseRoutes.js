// backend/src/routes/expenseRoutes.js
const express = require('express');
const multer = require('multer'); // Para carregamento de ficheiros
const path = require('path'); // Módulo nativo do Node.js para manipulação de paths
const fs = require('fs'); // Para criar diretório de uploads se não existir

const { submitExpenseReport, getMyExpenseReports, getPendingExpenseReports, getExpenseReportById, validateExpenseReport } = require('../controllers/expenseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Configuração do Multer para armazenamento de recibos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Cria um diretório 'uploads' se não existir
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // 'recursive: true' cria pastas aninhadas se necessário
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Nome do ficheiro: campo-data-extensão_original
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
    fileFilter: (req, file, cb) => {
        // Permite apenas JPEG, JPG, PNG e PDF
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas imagens (JPEG/JPG/PNG) e PDFs são permitidos.'));
    }
});

// Rotas para relatórios de despesa
router.post('/submit', protect, authorizeRoles('colaborador'), upload.single('receipt'), submitExpenseReport);
router.get('/my', protect, authorizeRoles('colaborador'), getMyExpenseReports); // Relatórios do próprio utilizador
router.get('/pending', protect, authorizeRoles('gerente'), getPendingExpenseReports); // Relatórios pendentes para gerentes
router.route('/:id')
    .get(protect, getExpenseReportById) // Qualquer utilizador autorizado pode ver um relatório específico
    .put(protect, authorizeRoles('gerente'), validateExpenseReport); // Gerentes validam

module.exports = router;
