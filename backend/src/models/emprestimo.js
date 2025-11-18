const { connection } = require('../database/connection');

class Emprestimo {
    
static async criar(emprestimo) {
    const { idExemplar, idAluno } = emprestimo;
    const conn = await connection.getConnection();

    try {
        await conn.query('START TRANSACTION');

        const [result] = await conn.query(
            'INSERT INTO emprestimo (id_exemplar, id_aluno) VALUES (?, ?)',
            [idExemplar, idAluno]
        );

        await conn.query(
            'UPDATE exemplar SET status = "Emprestado" WHERE id = ?',
            [idExemplar]
        );

        await conn.query('COMMIT');
        return result;
    } catch (error) {
        await conn.query('ROLLBACK');
        throw error;
    } finally {
        conn.release();
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

    static async buscarEmprestimoAtivo(idAluno, idExemplar) {
  const [rows] = await connection.execute(
    `SELECT emp.*, ex.status as exemplar_status
     FROM emprestimo emp
     JOIN exemplar ex ON emp.id_exemplar = ex.id
     WHERE emp.id_aluno = ? AND emp.id_exemplar = ? AND emp.data_devolucao IS NULL`,
    [idAluno, idExemplar]
  );
  return rows[0]; s
}

static async registrarDevolucao(idEmprestimo) {
  const conn = await connection.getConnection();

  try {
    await conn.query('START TRANSACTION');

    const [rows] = await conn.query(
      'SELECT id_exemplar FROM emprestimo WHERE id = ?',
      [idEmprestimo]
    );

    if (rows.length === 0) {
      throw new Error('Empréstimo não encontrado');
    }

    const idExemplar = rows[0].id_exemplar;

    // Atualiza o status do exemplar para "Disponível"
    await conn.query(
      'UPDATE exemplar SET status = "Disponível" WHERE id = ?',
      [idExemplar]
    );

    // Atualiza o registro do empréstimo com a data de devolução
    await conn.query(
      'UPDATE emprestimo SET data_devolucao = NOW() WHERE id = ?',
      [idEmprestimo]
    );

    await conn.query('COMMIT');
    return { success: true, message: 'Devolução registrada com sucesso' };
  } catch (error) {
    await conn.query('ROLLBACK');
    throw error;
  } finally {
    conn.release();
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