const { connection } = require('../database/connection');

class Livro {

    static async criar(livro) {
        const { titulo, autor } = livro;
        const [result] = await connection.execute(
            'INSERT INTO livro (titulo, autor) VALUES (?, ?)',
            [titulo, autor]
        );
        return result;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            'SELECT * FROM livro WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async buscarPorTitulo(titulo) {
        const [rows] = await connection.execute(
            'SELECT * FROM livro WHERE titulo LIKE ?',
            [`%${titulo}%`]
        );
        return rows;
    }

    static async buscarPorAutor(autor) {
        const [rows] = await connection.execute(
            'SELECT * FROM livro WHERE autor LIKE ?',
            [`%${autor}%`]
        );
        return rows;
    }

    static async listarTodos() {
        const [rows] = await connection.execute('SELECT * FROM livro');
        return rows;
    }

    static async listarDisponiveis() {
        const [rows] = await connection.execute(`
            SELECT l.*, 
                   COUNT(ex.id) as total_exemplares,
                   SUM(CASE WHEN ex.status = 'Disponível' THEN 1 ELSE 0 END) as exemplares_disponiveis
            FROM livro l
            LEFT JOIN exemplar ex ON l.id = ex.id_livro
            GROUP BY l.id
            HAVING exemplares_disponiveis > 0
        `);
        return rows;
    }

    static async listarComExemplares() {
        const [rows] = await connection.execute(`
            SELECT l.*, 
                   COUNT(ex.id) as total_exemplares,
                   SUM(CASE WHEN ex.status = 'Disponível' THEN 1 ELSE 0 END) as disponiveis,
                   SUM(CASE WHEN ex.status = 'Emprestado' THEN 1 ELSE 0 END) as emprestados,
                   SUM(CASE WHEN ex.status = 'Extraviado' THEN 1 ELSE 0 END) as extraviados
            FROM livro l
            LEFT JOIN exemplar ex ON l.id = ex.id_livro
            GROUP BY l.id
        `);
        return rows;
    }

    static async atualizar(id, livro) {
        const { titulo, autor } = livro;
        const [result] = await connection.execute(
            'UPDATE livro SET titulo = ?, autor = ? WHERE id = ?',
            [titulo, autor, id]
        );
        return result;
    }

    static async deletar(id) {

        await connection.execute('START TRANSACTION');
        
        try {
            const [exemplares] = await connection.execute(
                'SELECT COUNT(*) as total FROM exemplar WHERE id_livro = ?',
                [id]
            );
            
            if (exemplares[0].total > 0) {
                throw new Error('Não é possível excluir livro com exemplares associados');
            }

            const [emprestimos] = await connection.execute(
                `SELECT COUNT(*) as total 
                 FROM emprestimo emp
                 JOIN exemplar ex ON emp.id_exemplar = ex.id
                 WHERE ex.id_livro = ?`,
                [id]
            );
            
            if (emprestimos[0].total > 0) {
                throw new Error('Não é possível excluir livro com histórico de empréstimos');
            }

            const [result] = await connection.execute(
                'DELETE FROM livro WHERE id = ?',
                [id]
            );
            
            await connection.execute('COMMIT');
            return result;
            
        } catch (error) {
            await connection.execute('ROLLBACK');
            throw error;
        }
    }

    static async contarLivros() {
        const [rows] = await connection.execute('SELECT COUNT(*) as total FROM livro');
        return rows[0].total;
    }
}

module.exports = Livro;