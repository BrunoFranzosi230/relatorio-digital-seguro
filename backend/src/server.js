// backend/src/server.js
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Para criar o diretório de uploads

// Importe todas as rotas
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const signatureRoutes = require('./routes/signatureRoutes'); // Não se esqueça de criar este ficheiro!

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(express.json()); // Para fazer parse de application/json
app.use(express.urlencoded({ extended: true })); // Para fazer parse de application/x-www-form-urlencoded

// Configuração CORS (ajuste para produção)
app.use(cors({
    origin: 'http://localhost:3000', // Permite pedidos do seu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Cria o diretório 'uploads' se não existir e serve ficheiros estáticos
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Conexão ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Fix para Mongoose 7+ DeprecationWarning
mongoose.set('strictQuery', true);

// Rota de teste básica
app.get('/', (req, res) => {
  res.send('Backend de Gestão de Relatórios Online está a funcionar!');
});

// Uso das rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/signatures', signatureRoutes); // Adicione a rota de assinaturas

// Middleware de tratamento de erros (opcional, mas boa prática)
app.use((err, req, res, next) => {
    console.error(err.stack); // Registra o stack trace do erro no console do servidor
    // Para erros específicos (ex: validação), pode dar respostas mais detalhadas
    res.status(500).send('Algo correu mal no servidor!');
});

app.listen(PORT, () => {
  console.log(`Servidor backend a rodar na porta ${PORT}`);
});
