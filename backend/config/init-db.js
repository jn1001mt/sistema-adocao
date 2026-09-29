const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function initDatabase() {
  console.log('🔄 Inicializando banco de dados MySQL para o Sistema de Adoção...');

  // Conectar inicialmente sem especificar banco de dados para poder criar se não existir
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log(' Executando arquivo schema.sql com suporte UTF-8...');
    await connection.query(sql);

    console.log(' Banco de dados e tabelas configurados com sucesso!');
  } catch (err) {
    console.error(' Erro ao inicializar banco de dados:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
