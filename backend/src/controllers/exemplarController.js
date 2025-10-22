const Exemplar = require('../models/exemplar');
const Livro = require('../models/livro');

exports.listarExemplares = async (req, res) => {
    try {
        const exemplares = await Exemplar.listarExemplares();

        res.json({
            success: true,
            data: exemplares,
            total: exemplares.length
        });

    } catch (error) {
        console.error('Erro ao listar exemplares:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarExemplarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const exemplar = await Exemplar.listarExemplarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        res.json({
            success: true,
            data: exemplar
        });

    } catch (error) {
        console.error('Erro ao buscar exemplar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarExemplaresDisponiveis = async (req, res) => {
    try {
        const exemplares = await Exemplar.listarDisponiveis();

        res.json({
            success: true,
            data: exemplares,
            total: exemplares.length
        });

    } catch (error) {
        console.error('Erro ao listar exemplares disponíveis:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.obterEstatisticasLivro = async (req, res) => {
    try {
        const { id_livro } = req.params;

        // Verificar se livro existe
        const livro = await Livro.buscarPorId(id_livro);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        const estatisticas = await Exemplar.listarQtdExemplarDeUmLivro(id_livro);

        res.json({
            success: true,
            data: {
                livro: {
                    id: livro.id,
                    titulo: livro.titulo,
                    autor: livro.autor
                },
                estatisticas: estatisticas
            }
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas do livro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.adicionarExemplar = async (req, res) => {
    try {
        const { id_livro } = req.body;

        // Verificar se livro existe
        const livro = await Livro.buscarPorId(id_livro);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        const result = await Exemplar.adicionarExemplar(id_livro);

        res.status(201).json({
            success: true,
            message: 'Exemplar adicionado com sucesso',
            data: {
                id: result.insertId,
                livro: {
                    id: livro.id,
                    titulo: livro.titulo,
                    autor: livro.autor
                },
                status: 'Disponível'
            }
        });

    } catch (error) {
        console.error('Erro ao adicionar exemplar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.atualizarStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Verificar se exemplar existe
        const exemplar = await Exemplar.listarExemplarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        const result = await Exemplar.atualizarStatus(id, status);

        res.json({
            success: true,
            message: 'Status do exemplar atualizado com sucesso',
            data: {
                id: parseInt(id),
                status: status
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        
        if (error.message.includes('Status inválido')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.verificarDisponibilidade = async (req, res) => {
    try {
        const { id } = req.params;

        const disponivel = await Exemplar.verificarDisponibilidade(id);

        res.json({
            success: true,
            data: {
                id: parseInt(id),
                disponivel: disponivel
            }
        });

    } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        
        if (error.message.includes('Exemplar não encontrado')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.excluirExemplar = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se exemplar existe
        const exemplar = await Exemplar.listarExemplarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        await Exemplar.deletarExemplar(id);

        res.json({
            success: true,
            message: 'Exemplar excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir exemplar:', error);
        
        if (error.message.includes('Não é possível excluir')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.marcarComoExtraviado = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se exemplar existe
        const exemplar = await Exemplar.listarExemplarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        await Exemplar.atualizarStatus(id, 'Extraviado');

        res.json({
            success: true,
            message: 'Exemplar marcado como extraviado com sucesso',
            data: {
                id: parseInt(id),
                status: 'Extraviado'
            }
        });

    } catch (error) {
        console.error('Erro ao marcar como extraviado:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};