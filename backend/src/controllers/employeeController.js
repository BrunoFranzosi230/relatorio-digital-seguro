const User = require('../models/User'); // Funcionários são Users com roles específicas

// @desc    Obter todos os funcionários
// @route   GET /api/employees
// @access  Privado/Gerente, Diretor
const getEmployees = async (req, res) => {
    try {
        // Encontra todos os utilizadores que não sejam apenas "colaboradores" ou que tenham a role de "colaborador"
        // dependendo de como quer gerir quem é funcionário no sistema
        const employees = await User.find({ role: { $in: ['colaborador', 'gerente', 'diretor'] } }).select('-password');
        res.status(200).json(employees);
    } catch (error) {
        console.error("Erro ao obter funcionários:", error);
        res.status(500).json({ message: "Erro interno do servidor ao obter funcionários." });
    }
};

// @desc    Obter um único funcionário por ID
// @route   GET /api/employees/:id
// @access  Privado/Gerente, Diretor
const getEmployeeById = async (req, res) => {
    try {
        const employee = await User.findById(req.params.id).select('-password');
        if (employee) {
            res.status(200).json(employee);
        } else {
            res.status(404).json({ message: 'Funcionário não encontrado' });
        }
    } catch (error) {
        console.error("Erro ao obter funcionário por ID:", error);
        res.status(500).json({ message: "Erro interno do servidor ao obter funcionário." });
    }
};

// @desc    Criar um novo funcionário
// @route   POST /api/employees
// @access  Privado/Diretor
const createEmployee = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Utilizador com este email já existe' });
        }

        // A password será hashed pelo hook 'pre-save' no modelo User
        const employee = await User.create({ name, email, password, role: role || 'colaborador' });
        if (employee) {
            res.status(201).json({
                _id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role
            });
        } else {
            res.status(400).json({ message: 'Dados de funcionário inválidos' });
        }
    } catch (error) {
        console.error("Erro ao criar funcionário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao criar funcionário." });
    }
};

// @desc    Atualizar um funcionário
// @route   PUT /api/employees/:id
// @access  Privado/Gerente, Diretor
const updateEmployee = async (req, res) => {
    const { name, email, role } = req.body;

    try {
        const employee = await User.findById(req.params.id);

        if (employee) {
            employee.name = name || employee.name;
            employee.email = email || employee.email;
            // A role só deve ser alterada por um diretor ou com lógica específica
            if (req.user.role === 'diretor') { // req.user vem do middleware de proteção
                employee.role = role || employee.role;
            } else if (role && employee.role !== role) {
                return res.status(403).json({ message: 'Não autorizado para alterar a role do funcionário.' });
            }

            const updatedEmployee = await employee.save();
            res.json({
                _id: updatedEmployee._id,
                name: updatedEmployee.name,
                email: updatedEmployee.email,
                role: updatedEmployee.role
            });
        } else {
            res.status(404).json({ message: 'Funcionário não encontrado' });
        }
    } catch (error) {
        console.error("Erro ao atualizar funcionário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar funcionário." });
    }
};

// @desc    Excluir um funcionário
// @route   DELETE /api/employees/:id
// @access  Privado/Diretor
const deleteEmployee = async (req, res) => {
    try {
        const employee = await User.findById(req.params.id);

        if (employee) {
            await employee.deleteOne();
            res.json({ message: 'Funcionário removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Funcionário não encontrado' });
        }
    } catch (error) {
        console.error("Erro ao excluir funcionário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao excluir funcionário." });
    }
};

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };