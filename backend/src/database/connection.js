const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '', // senha que estiver usando no banco
    database: process.env.DB_NAME || 'pi2', // depende do nome do banco que estiver usando
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