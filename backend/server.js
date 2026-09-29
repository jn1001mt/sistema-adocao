const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { testConnection } = require('./config/database');
const animaisRoutes = require('./routes/animais');
const adocoesRoutes = require('./routes/adocoes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essenciais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir os arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API REST
app.use('/animais', animaisRoutes);
app.use('/adocoes', adocoesRoutes);

// Rota raiz opcional caso não resolva index.html automaticamente
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Middleware para tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ mensagem: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Middleware global de captura e tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado na aplicação:', err);
  res.status(err.status || 500).json({
    mensagem: err.message || 'Ocorreu um erro interno no servidor.'
  });
});

// Inicialização do servidor após validação da conexão com o banco
async function startServer() {
  console.log('🔄 Iniciando Sistema de Adoção de Animais...');
  await testConnection();

  app.listen(PORT, () => {
    console.log(` Servidor rodando com sucesso na porta ${PORT}`);
    console.log(` Acesse a aplicação em: http://localhost:${PORT}`);
    console.log(` API Animais: http://localhost:${PORT}/animais`);
    console.log(` API Adoções: http://localhost:${PORT}/adocoes`);
  });
}

startServer();

module.exports = app;
