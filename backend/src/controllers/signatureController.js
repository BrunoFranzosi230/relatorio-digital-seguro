// backend/src/controllers/signatureController.js
const ExpenseReport = require('../models/ExpenseReport');
const User = require('../models/User'); // Para obter dados do utilizador assinado

// @desc    Assinar um relatório de despesa aprovado
// @route   PUT /api/expenses/:id/sign
// @access  Privado/Diretor
const signExpenseReport = async (req, res) => {
    // Espera a assinatura em Base64 e a chave pública (JWK) do frontend
    const { signatureValue, publicKeyJwk } = req.body;
    const reportId = req.params.id;

    try {
        const report = await ExpenseReport.findById(reportId);

        if (!report) {
            return res.status(404).json({ message: 'Relatório de despesa não encontrado' });
        }

        // Verifica a autorização: apenas Diretores podem assinar
        if (req.user.role !== 'diretor') {
            return res.status(403).json({ message: 'Apenas diretores podem assinar relatórios' });
        }

        // Verifica se o relatório foi aprovado e ainda não foi assinado
        if (report.status !== 'aprovado') {
            return res.status(400).json({ message: 'Relatório deve estar aprovado antes de ser assinado' });
        }
        if (report.signature && report.signature.signatureValue) {
            return res.status(400).json({ message: 'Relatório já assinado' });
        }
        if (!signatureValue || !publicKeyJwk) {
            return res.status(400).json({ message: 'Valores de assinatura ou chave pública em falta' });
        }

        report.status = 'assinado'; // Atualiza o status para assinado
        report.signature = {
            signedBy: req.user._id, // O ID do diretor que assinou
            signatureValue: signatureValue, // A assinatura digital em Base64
            publicKeyUsed: publicKeyJwk, // A chave pública em formato JWK usada para esta assinatura
            signedAt: Date.now()
        };

        const updatedReport = await report.save();
        res.json({ message: 'Relatório assinado com sucesso', report: updatedReport });
    } catch (error) {
        console.error("Erro ao assinar relatório:", error);
        res.status(500).json({ message: "Erro interno do servidor ao assinar relatório." });
    }
};

// @desc    Obter todos os relatórios de despesa assinados
// @route   GET /api/expenses/signed
// @access  Privado/Diretor, Gerente, Colaborador (apenas os seus próprios relatórios assinados)
const getSignedExpenseReports = async (req, res) => {
    let query = { status: 'assinado' };

    // Se o utilizador não for Diretor nem Gerente, mostra apenas os seus próprios relatórios submetidos que foram assinados
    if (req.user.role === 'colaborador') {
        query = { ...query, submittedBy: req.user._id };
    }
    // Gerentes podem ver todos os relatórios assinados (ajuste esta lógica conforme a necessidade do negócio)

    try {
        const reports = await ExpenseReport.find(query)
                                            .populate('submittedBy', 'name email') // Popula o submetedor
                                            .populate('signature.signedBy', 'name email'); // Popula quem assinou
        res.status(200).json(reports);
    } catch (error) {
        console.error("Erro ao obter relatórios assinados:", error);
        res.status(500).json({ message: "Erro interno do servidor ao obter relatórios assinados." });
    }
};

// @desc    Obter detalhes de um relatório assinado para verificação (inclui assinatura e chave pública)
// @route   GET /api/expenses/:id/verify
// @access  Privado/Diretor (ou qualquer pessoa que precise verificar)
const getSignedReportForVerification = async (req, res) => {
    try {
        // Seleciona os campos necessários para a verificação da assinatura
        const report = await ExpenseReport.findById(req.params.id)
                                        .select('description amount submittedBy status signature.signatureValue signature.publicKeyUsed')
                                        .populate('submittedBy', 'name'); // Popula o submetedor para reconstruir os dados originais

        if (report && report.status === 'assinado' && report.signature && report.signature.signatureValue && report.signature.publicKeyUsed) {
            res.json({
                id: report._id,
                description: report.description,
                amount: report.amount,
                // O 'signedBy' do front-end virá dos dados populados pelo backend se precisar de exibir
                // Aqui estamos a enviar os dados originais (description, amount, submittedBy.name) que foram assinados
                originalData: { // Os dados que foram REALMENTE assinados devem ser enviados para o frontend
                    id: report._id.toString(), // ID como string
                    description: report.description,
                    amount: report.amount,
                    submittedBy: report.submittedBy.name // O nome do submetedor
                    // Adicione outros campos que foram incluídos na string para assinatura
                },
                signature: report.signature.signatureValue, // A assinatura em Base64
                publicKeyJwk: report.signature.publicKeyUsed, // A chave pública JWK para verificação
            });
        } else {
            res.status(404).json({ message: 'Relatório assinado não encontrado ou dados de assinatura incompletos' });
        }
    } catch (error) {
        console.error("Erro ao obter relatório assinado para verificação:", error);
        res.status(500).json({ message: "Erro interno do servidor ao obter relatório assinado para verificação." });
    }
};

module.exports = { signExpenseReport, getSignedExpenseReports, getSignedReportForVerification };
