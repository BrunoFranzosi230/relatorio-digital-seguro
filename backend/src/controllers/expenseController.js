// backend/src/controllers/expenseController.js
const ExpenseReport = require('../models/ExpenseReport');
const User = require('../models/User'); // Para popular dados do utilizador
const sendEmail = require('../utils/sendEmail'); // Para notificações por email

// Defina a URL base para os recibos estáticos.
// Em produção, isto seria uma URL de um serviço de armazenamento de objetos (ex: AWS S3, Google Cloud Storage)
const BASE_RECEIPT_URL = 'http://localhost:3001/uploads/'; // Ajuste se a sua configuração for diferente

// @desc    Submeter um novo relatório de despesa
// @route   POST /api/expenses/submit
// @access  Privado/Colaborador
const submitExpenseReport = async (req, res) => {
    const { description, amount } = req.body;
    let receiptUrl = '';

    // Verifica se um ficheiro foi carregado pelo Multer (middleware de upload)
    if (req.file) {
        // Constrói a URL para o recibo com base no nome do ficheiro guardado localmente
        receiptUrl = BASE_RECEIPT_URL + req.file.filename;
    }

    try {
        const report = await ExpenseReport.create({
            description,
            amount,
            submittedBy: req.user._id, // O ID do utilizador é obtido do pedido autenticado
            receiptUrl: receiptUrl
        });

        if (report) {
            res.status(201).json({ message: 'Relatório de despesa submetido com sucesso', report });
        } else {
            res.status(400).json({ message: 'Dados de relatório de despesa inválidos' });
        }
    } catch (error) {
        console.error("Erro ao submeter relatório de despesa:", error);
        res.status(500).json({ message: "Erro interno do servidor ao submeter relatório." });
    }
};

// @desc    Obter relatórios de despesa do utilizador autenticado
// @route   GET /api/expenses/my
// @access  Privado/Colaborador
const getMyExpenseReports = async (req, res) => {
    try {
        // Encontra relatórios submetidos pelo utilizador autenticado
        const reports = await ExpenseReport.find({ submittedBy: req.user._id }).populate('submittedBy', 'name email');
        res.status(200).json(reports);
    } catch (error) {
        console.error("Erro ao obter meus relatórios de despesa:", error);
        res.status(500).json({ message: "Erro interno do servidor ao obter relatórios." });
    }
};

// @desc    Obter todos os relatórios de despesa pendentes (para Gerente)
// @route   GET /api/expenses/pending
// @access  Privado/Gerente
const getPendingExpenseReports = async (req, res) => {
    try {
        // Encontra relatórios com status 'pendente'
        const reports = await ExpenseReport.find({ status: 'pendente' }).populate('submittedBy', 'name email');
        res.status(200).json(reports);
    } catch (error) {
        console.error("Erro ao obter relatórios pendentes:", error);
        res.status(500).json({ message: "Erro interno do servidor ao obter relatórios pendentes." });
    }
};

// @desc    Obter detalhes de um relatório de despesa por ID
// @route   GET /api/expenses/:id
// @access  Privado/Gerente, Diretor, Colaborador (se for o submetedor)
const getExpenseReportById = async (req, res) => {
    try {
        const report = await ExpenseReport.findById(req.params.id).populate('submittedBy', 'name email');

        if (report) {
            // Verifica autorização: o submetedor, gerente ou diretor podem ver
            const isAuthorized = report.submittedBy._id.toString() === req.user._id.toString() ||
                                 req.user.role === 'gerente' ||
                                 req.user.role === 'diretor';

            if (isAuthorized) {
                res.status(200).json(report);
            } else {
                res.status(403).json({ message: 'Não autorizado para visualizar este relatório' });
            }
        } else {
            res.status(404).json({ message: 'Relatório de despesa não encontrado' });
        }
    } catch (error) {
        console.error("Erro ao obter relatório por ID:", error);
        res.status(500).json({ message: "Erro interno do servidor ao obter relatório." });
    }
};

// @desc    Validar um relatório de despesa (aprovar/rejeitar)
// @route   PUT /api/expenses/:id/validate
// @access  Privado/Gerente
const validateExpenseReport = async (req, res) => {
    const { status, comment } = req.body; // 'status' pode ser 'aprovado' ou 'rejeitado'
    try {
        // Popula 'submittedBy' para ter acesso ao email do utilizador para enviar notificações
        const report = await ExpenseReport.findById(req.params.id).populate('submittedBy');

        if (!report) {
            return res.status(404).json({ message: 'Relatório de despesa não encontrado' });
        }

        // Verifica se o utilizador é um gerente e se o relatório está pendente
        if (req.user.role !== 'gerente') {
            return res.status(403).json({ message: 'Apenas gerentes podem validar relatórios' });
        }
        if (report.status !== 'pendente') {
            return res.status(400).json({ message: 'Relatório não está pendente ou já foi processado' });
        }

        report.status = status;
        report.validation = {
            validatedBy: req.user._id, // O ID do gerente que validou
            comment: comment || '',
            validatedAt: Date.now()
        };
        const updatedReport = await report.save();

        // Lógica de notificação por email
        const submitter = updatedReport.submittedBy; // O utilizador submetedor já está populado
        if (submitter) {
            const emailOptions = {
                email: submitter.email,
                subject: '',
                html: ''
            };

            if (status === 'aprovado') {
                emailOptions.subject = `Seu relatório de despesa (${report.description}) foi APROVADO!`;
                emailOptions.html = `<p>Olá ${submitter.name},</p><p>Seu relatório de despesa para <b>${report.description}</b> no valor de R$${report.amount.toFixed(2)} foi <b>APROVADO</b> pelo gerente.</p><p>Agora ele está disponível para assinatura digital.</p>`;
            } else if (status === 'rejeitado') {
                emailOptions.subject = `Seu relatório de despesa (${report.description}) foi REJEITADO.`;
                emailOptions.html = `<p>Olá ${submitter.name},</p><p>Seu relatório de despesa para <b>${report.description}</b> no valor de R$${report.amount.toFixed(2)} foi <b>REJEITADO</b> pelo gerente. Comentário: ${comment || 'Nenhum'}</p><p>Por favor, verifique o sistema para mais detalhes.</p>`;
            }

            try {
                await sendEmail(emailOptions);
                console.log(`Email de ${status} enviado para:`, submitter.email);
            } catch (emailError) {
                console.error(`Erro ao enviar email de ${status}:`, emailError);
            }
        }

        res.json({ message: `Relatório ${status} com sucesso`, report: updatedReport });
    } catch (error) {
        console.error("Erro ao validar relatório de despesa:", error);
        res.status(500).json({ message: "Erro interno do servidor ao validar relatório." });
    }
};

module.exports = { submitExpenseReport, getMyExpenseReports, getPendingExpenseReports, getExpenseReportById, validateExpenseReport };
