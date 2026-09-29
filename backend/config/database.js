const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente do arquivo .env no diretório backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'adocao_animais',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  dateStrings: true // Mantém datas no formato YYYY-MM-DD sem alteração de fuso
});

// Função para testar conexão com o banco de dados
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(' Conectado com sucesso ao MySQL!');
    connection.release();
    return true;
  } catch (error) {
    console.error(' Erro ao conectar ao MySQL:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
