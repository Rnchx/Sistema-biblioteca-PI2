const { connection } = require('../database/connection');

class Emprestimo {
    
    static async criar(emprestimo) {
        const { idExemplar, idAluno } = emprestimo;
        
        await connection.execute('START TRANSACTION');
        
        try {
            const [result] = await connection.execute(
                'INSERT INTO emprestimo (id_exemplar, id_aluno) VALUES (?, ?)',
                [idExemplar, idAluno]
            );

            await connection.execute(
                'UPDATE exemplar SET status = "Emprestado" WHERE id = ?',
                [idExemplar]
            );
            
            await connection.execute('COMMIT');
            return result;
            
        } catch (error) {
            await connection.execute('ROLLBACK');
            throw error;
        }
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            `SELECT emp.*, 
                    a.nome as aluno_nome, a.ra, 
                    l.titulo as livro_titulo, l.autor,
                    ex.id as exemplar_id, ex.status as exemplar_status
             FROM emprestimo emp
             JOIN aluno a ON emp.id_aluno = a.id
             JOIN exemplar ex ON emp.id_exemplar = ex.id
             JOIN livro l ON ex.id_livro = l.id
             WHERE emp.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async listarAtivosPorAluno(idAluno) {
        const [rows] = await connection.execute(
            `SELECT emp.*, 
                    l.titulo as livro_titulo, l.autor,
                    ex.id as exemplar_id, ex.status as exemplar_status
             FROM emprestimo emp
             JOIN exemplar ex ON emp.id_exemplar = ex.id
             JOIN livro l ON ex.id_livro = l.id
             WHERE emp.id_aluno = ? AND ex.status = "Emprestado"`,
            [idAluno]
        );
        return rows;
    }

    static async listarTodosPorAluno(idAluno) {
        const [rows] = await connection.execute(
            `SELECT emp.*, 
                    l.titulo as livro_titulo, l.autor,
                    ex.id as exemplar_id, ex.status as exemplar_status
             FROM emprestimo emp
             JOIN exemplar ex ON emp.id_exemplar = ex.id
             JOIN livro l ON ex.id_livro = l.id
             WHERE emp.id_aluno = ?`,
            [idAluno]
        );
        return rows;
    }

    static async listarEmprestimosAtivos() {
        const [rows] = await connection.execute(
            `SELECT emp.*, 
                    a.nome as aluno_nome, a.ra, 
                    l.titulo as livro_titulo, l.autor,
                    ex.id as exemplar_id
             FROM emprestimo emp
             JOIN aluno a ON emp.id_aluno = a.id
             JOIN exemplar ex ON emp.id_exemplar = ex.id
             JOIN livro l ON ex.id_livro = l.id
             WHERE ex.status = "Emprestado"`
        );
        return rows;
    }

    static async registrarDevolucao(idEmprestimo) {
        await connection.execute('START TRANSACTION');
        
        try {
            const [emprestimo] = await connection.execute(
                'SELECT id_exemplar FROM emprestimo WHERE id = ?',
                [idEmprestimo]
            );
            
            if (emprestimo.length === 0) {
                throw new Error('Empréstimo não encontrado');
            }
            
            const idExemplar = emprestimo[0].id_exemplar;

            await connection.execute(
                'UPDATE exemplar SET status = "Disponível" WHERE id = ?',
                [idExemplar]
            );
            
            await connection.execute('COMMIT');
            return { success: true, message: 'Devolução registrada com sucesso' };
            
        } catch (error) {
            await connection.execute('ROLLBACK');
            throw error;
        }
    }

    static async verificarExemplarDisponivel(idExemplar) {
        const [rows] = await connection.execute(
            'SELECT status FROM exemplar WHERE id = ?',
            [idExemplar]
        );
        
        if (rows.length === 0) {
            throw new Error('Exemplar não encontrado');
        }
        
        return rows[0].status === 'Disponível';
    }

    static async buscarExemplaresDisponiveis() {
        const [rows] = await connection.execute(
            `SELECT ex.*, l.titulo, l.autor
             FROM exemplar ex
             JOIN livro l ON ex.id_livro = l.id
             WHERE ex.status = "Disponível"`
        );
        return rows;
    }

    static async contarEmprestimosPorAluno(idAluno) {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as total FROM emprestimo WHERE id_aluno = ?',
            [idAluno]
        );
        return rows[0].total;
    }
}

module.exports = Emprestimo;