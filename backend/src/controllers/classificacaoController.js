const Classificacao = require('../models/classificacao');
const Aluno = require('../models/aluno');

exports.obterClassificacaoPorAluno = async (req, res) => {
    try {
        const { ra } = req.params;

        const aluno = await Aluno.buscarPorRa(ra);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        const classificacao = await Classificacao.classificarEAtualizarAluno(aluno.id);

        res.json({
            success: true,
            data: {
                aluno: {
                    id: aluno.id,
                    nome: aluno.nome,
                    ra: aluno.ra
                },
                classificacao: {
                    codigo: classificacao.codigo,
                    descricao: classificacao.descricao,
                    totalLivros: classificacao.totalLivros
                }
            }
        });

    } catch (error) {
        console.error('Erro ao obter classificação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarClassificacaoGeral = async (req, res) => {
    try {
        // Buscar todas as classificações do banco
        const [classificacoes] = await connection.execute(`
            SELECT c.*, a.nome as aluno_nome, a.ra 
            FROM classificacao c
            JOIN aluno a ON c.idAluno = a.id
        `);

        // Formatar resposta
        const classificacoesFormatadas = classificacoes.map(classificacao => ({
            aluno: {
                id: classificacao.idAluno,
                nome: classificacao.aluno_nome,
                ra: classificacao.ra
            },
            classificacao: {
                codigo: classificacao.codigo,
                descricao: classificacao.descricao
            }
        }));

        res.json({
            success: true,
            data: classificacoesFormatadas,
            total: classificacoesFormatadas.length
        });

    } catch (error) {
        console.error('Erro ao listar classificação geral:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.recalcularClassificacao = async (req, res) => {
    try {
        const { ra } = req.params;

        // Verificar se aluno existe
        const aluno = await Aluno.buscarPorRa(ra);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        // Forçar recálculo
        const classificacao = await Classificacao.classificarEAtualizarAluno(aluno.id);

        res.json({
            success: true,
            message: 'Classificação recalculada com sucesso',
            data: {
                aluno: {
                    id: aluno.id,
                    nome: aluno.nome,
                    ra: aluno.ra
                },
                classificacao: {
                    codigo: classificacao.codigo,
                    descricao: classificacao.descricao,
                    totalLivros: classificacao.totalLivros
                }
            }
        });

    } catch (error) {
        console.error('Erro ao recalcular classificação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarPorNivel = async (req, res) => {
    try {
        const { nivel } = req.params;

        const [alunos] = await connection.execute(`
            SELECT a.id, a.nome, a.ra, c.codigo, c.descricao
            FROM aluno a
            JOIN classificacao c ON a.id = c.idAluno
            WHERE c.codigo = ?
        `, [nivel.toUpperCase()]);

        res.json({
            success: true,
            data: alunos,
            total: alunos.length
        });

    } catch (error) {
        console.error('Erro ao listar por nível:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};