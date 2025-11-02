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
    console.log('🔍 [DEBUG] Executando listarClassificacoesComAlunos CORRIGIDA');
    
    // BUSCAR TODOS OS ALUNOS primeiro
    const [todosAlunos] = await connection.execute('SELECT * FROM aluno');
    console.log(`🔍 [DEBUG] Total de alunos encontrados: ${todosAlunos.length}`);
    
    // Para cada aluno, garantir que tem classificação
    const classificacoesCompletas = await Promise.all(
        todosAlunos.map(async (aluno) => {
            try {
                // Verificar se já tem classificação
                const [classificacaoExistente] = await connection.execute(
                    'SELECT * FROM classificacao WHERE idAluno = ?',
                    [aluno.id]
                );
                
                if (classificacaoExistente.length > 0) {
                    // Já tem classificação, retornar ela
                    return {
                        ...classificacaoExistente[0],
                        aluno_nome: aluno.nome,
                        ra: aluno.ra
                    };
                } else {
                    // Não tem classificação, calcular agora
                    console.log(`🔍 [DEBUG] Aluno ${aluno.nome} não tem classificação, calculando...`);
                    const novaClassificacao = await Classificacao.classificarEAtualizarAluno(aluno.id);
                    
                    // Buscar a classificação recém-criada
                    const [classificacaoCriada] = await connection.execute(
                        'SELECT * FROM classificacao WHERE idAluno = ?',
                        [aluno.id]
                    );
                    
                    return {
                        ...classificacaoCriada[0],
                        aluno_nome: aluno.nome,
                        ra: aluno.ra
                    };
                }
            } catch (error) {
                console.error(`❌ Erro ao processar aluno ${aluno.nome}:`, error);
                // Retornar estrutura básica em caso de erro
                return {
                    idAluno: aluno.id,
                    tipo: 'INICIANTE',
                    descricao: 'Leitor Iniciante',
                    aluno_nome: aluno.nome,
                    ra: aluno.ra
                };
            }
        })
    );
    
    console.log('✅ [DEBUG] Classificações completas processadas:', classificacoesCompletas.length);
    return classificacoesCompletas;
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