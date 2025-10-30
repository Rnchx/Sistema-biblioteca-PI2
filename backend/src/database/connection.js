const mysql = require('mysql2/promise');
require('dotenv').config();

// const connection = mysql.createPool({
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root', 
//     password: process.env.DB_PASSWORD || 'SeltR150610',
//     database: process.env.DB_NAME || 'pi2',
//     port: process.env.DB_PORT || 3306,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// conexao puc

const connection = mysql.createPool({
    host: process.env.DB_HOST || '172.16.12.14',
    user: process.env.DB_USER || 'BD240225246', 
    password: process.env.DB_PASSWORD || 'Gcgts5',
    database: process.env.DB_NAME || 'BD240225246',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        const conn = await connection.getConnection();
        console.log('✅ Conectado ao MySQL com sucesso!');
        console.log(`📊 Banco: ${process.env.DB_NAME || 'pi2'}`);
        conn.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com MySQL:', error.message);
        console.log('🔧 Verifique suas credenciais no arquivo .env');
        return false;
    }
}

// Testar conexão
testConnection();

module.exports = { connection, testConnection };