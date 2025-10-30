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
                    tipo: classificacao.tipo, // Mudei codigo para tipo
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
        const classificacoes = await Classificacao.listarClassificacoesComAlunos();

        // Formatar resposta
        const classificacoesFormatadas = classificacoes.map(classificacao => ({
            aluno: {
                id: classificacao.idAluno,
                nome: classificacao.aluno_nome,
                ra: classificacao.ra
            },
            classificacao: {
                tipo: classificacao.tipo, // Mudei codigo para tipo
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
                    tipo: classificacao.tipo, // Mudei codigo para tipo
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
            SELECT a.id, a.nome, a.ra, c.tipo, c.descricao  -- Mudei codigo para tipo
            FROM aluno a
            JOIN classificacao c ON a.id = c.idAluno
            WHERE c.tipo = ?  -- Mudei codigo para tipo
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