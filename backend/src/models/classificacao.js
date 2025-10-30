const { connection } = require('../database/connection');

class Classificacao {
    static async criar(classificacao) {
        const { tipo, descricao, idAluno } = classificacao; 
        const [result] = await connection.execute(
            'INSERT INTO classificacao (tipo, descricao, idAluno) VALUES (?, ?, ?)', 
            [tipo, descricao, idAluno] 
        );
        return result;
    }

    static async atualizarClassificacaoAluno(idAluno, tipo, descricao) { 
        await connection.execute(
            'DELETE FROM classificacao WHERE idAluno = ?',
            [idAluno]
        );

        const [result] = await connection.execute(
            'INSERT INTO classificacao (tipo, descricao, idAluno) VALUES (?, ?, ?)', 
            [tipo, descricao, idAluno] 
        );
        return result;
    }

    static async calcularClassificacao(idAluno) {
        const [rows] = await connection.execute(
            `SELECT COUNT(*) as total_livros
         FROM emprestimo
         WHERE id_aluno = ?`,
            [idAluno]
        );

        const totalLivros = rows[0].total_livros;
        let tipo, descricao; 

        if (totalLivros <= 5) {
            tipo = 'INICIANTE'; 
            descricao = 'Leitor Iniciante';
        } else if (totalLivros <= 10) {
            tipo = 'REGULAR'; 
            descricao = 'Leitor Regular';
        } else if (totalLivros <= 20) {
            tipo = 'ATIVO'; 
            descricao = 'Leitor Ativo';
        } else {
            tipo = 'EXTREMO'; 
            descricao = 'Leitor Extremo';
        }

        return { tipo, descricao, totalLivros }; 
    }

    static async listarClassificacoesComAlunos() {
        const [rows] = await connection.execute(`
            SELECT c.*, a.nome as aluno_nome, a.ra 
            FROM classificacao c
            JOIN aluno a ON c.idAluno = a.id
        `);
        return rows;
    }

    // método mais ágil
    static async classificarEAtualizarAluno(idAluno) {
        try {
            // Calcula a classificação
            const classificacao = await Classificacao.calcularClassificacao(idAluno);
            
            // Atualiza no banco
            await Classificacao.atualizarClassificacaoAluno(
                idAluno, 
                classificacao.tipo, 
                classificacao.descricao
            );
            
            return classificacao;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Classificacao;