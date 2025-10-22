const { connection } = require('../database/connection');


class Exemplar {

    static async listarExemplares() {
        const [rows] = await connection.execute('SELECT * FROM exemplar');
        return rows;
    }

    static async listarExemplarPorId(id) {
        const [rows] = await connection.execute(
            'SELECT * FROM exemplar WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async listarQtdExemplarDeUmLivro(id_livro) {
    const [rows] = await connection.execute(
        `SELECT 
            COUNT(*) as total_exemplares,
            SUM(CASE WHEN status = 'Disponível' THEN 1 ELSE 0 END) as disponiveis,
            SUM(CASE WHEN status = 'Emprestado' THEN 1 ELSE 0 END) as emprestados,
            SUM(CASE WHEN status = 'Extraviado' THEN 1 ELSE 0 END) as extraviados
         FROM exemplar 
         WHERE id_livro = ?`,
        [id_livro]
    );
    return rows[0];
}

    static async listarDisponiveis() {
        const [rows] = await connection.execute(`
            SELECT ex.*, l.titulo, l.autor 
            FROM exemplar ex
            JOIN livro l ON ex.id_livro = l.id
            WHERE ex.status = 'Disponível'
        `);
        return rows;
    }

    static async adicionarExemplar(idLivro) {
        const [result] = await connection.execute(
            'INSERT INTO exemplar (status, id_livro) VALUES ("Disponível", ?)',
            [idLivro]
        );
        return result;
    }

    static async atualizarStatus(id, novoStatus) {
        const statusValidos = ['Disponível', 'Emprestado', 'Extraviado'];
        if (!statusValidos.includes(novoStatus)) {
            throw new Error('Status inválido. Use: Disponível, Emprestado ou Extraviado');
        }

        const [result] = await connection.execute(
            'UPDATE exemplar SET status = ? WHERE id = ?',
            [novoStatus, id]
        );
        return result;
    }

    static async verificarDisponibilidade(id) {
        const [rows] = await connection.execute(
            'SELECT status FROM exemplar WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            throw new Error('Exemplar não encontrado');
        }
        
        return rows[0].status === 'Disponível';
    }

    static async deletarExemplar(id) {
        await connection.execute('START TRANSACTION');
        
        try {

            // verifica primeiro se o exemplar está emprestado
            const [exemplar] = await connection.execute(
                'SELECT status FROM exemplar WHERE id = ?',
                [id]
            );
            
            if (exemplar.length === 0) {
                throw new Error('Exemplar não encontrado');
            }
            
            if (exemplar[0].status === 'Emprestado') {
                throw new Error('Não é possível excluir exemplar emprestado');
            }

            const [emprestimos] = await connection.execute(
                'SELECT COUNT(*) as total FROM emprestimo WHERE id_exemplar = ?',
                [id]
            );
            
            if (emprestimos[0].total > 0) {
                throw new Error('Não é possível excluir exemplar com histórico de empréstimos');
            }

            const [result] = await connection.execute(
                'DELETE FROM exemplar WHERE id = ?',
                [id]
            );
            
            await connection.execute('COMMIT');
            return result;
            
        } catch (error) {
            await connection.execute('ROLLBACK');
            throw error;
        }
    }

}

module.exports = Exemplar;