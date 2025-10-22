const Livro = require('../models/livro');

exports.cadastrarLivro = async (req, res) => {
    try {
        const { titulo, autor } = req.body;

        // Validações corrigidas
        if (!titulo || !autor) {
            return res.status(400).json({
                success: false,
                error: 'Título e autor são obrigatórios'
            });
        }

        const result = await Livro.criar({ titulo, autor });
        
        res.status(201).json({
            success: true,
            message: 'Livro cadastrado com sucesso',
            data: { 
                id: result.insertId, 
                titulo, 
                autor
            }
        });

    } catch (error) {
        console.error('Erro ao cadastrar livro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarLivrosDisponiveis = async (req, res) => {
    try {
        const livros = await Livro.listarDisponiveis();

        res.json({
            success: true,
            data: livros,
            total: livros.length
        });

    } catch (error) {
        console.error('Erro ao listar livros disponíveis:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarLivros = async (req, res) => {
    try {
        const { titulo, autor } = req.query;
        let livros;

        if (titulo) {
            livros = await Livro.buscarPorTitulo(titulo);
        } else if (autor) {
            livros = await Livro.buscarPorAutor(autor);
        } else {
            livros = await Livro.listarTodos();
        }

        res.json({
            success: true,
            data: livros,
            total: livros.length
        });

    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarTodosLivros = async (req, res) => {
    try {
        const livros = await Livro.listarTodos();

        res.json({
            success: true,
            data: livros,
            total: livros.length
        });

    } catch (error) {
        console.error('Erro ao listar todos os livros:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarLivroPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const livro = await Livro.buscarPorId(id);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        res.json({
            success: true,
            data: livro
        });

    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarLivrosComExemplares = async (req, res) => {
    try {
        const livros = await Livro.listarComExemplares();

        res.json({
            success: true,
            data: livros,
            total: livros.length
        });

    } catch (error) {
        console.error('Erro ao listar livros com exemplares:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.atualizarLivro = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, autor } = req.body;

        // Verificar se livro existe
        const livroExistente = await Livro.buscarPorId(id);
        if (!livroExistente) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        // Validações
        if (!titulo || !autor) {
            return res.status(400).json({
                success: false,
                error: 'Título e autor são obrigatórios'
            });
        }

        const result = await Livro.atualizar(id, { titulo, autor });

        res.json({
            success: true,
            message: 'Livro atualizado com sucesso',
            data: {
                id: parseInt(id),
                titulo,
                autor
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.excluirLivro = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se livro existe
        const livro = await Livro.buscarPorId(id);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        await Livro.deletar(id);

        res.json({
            success: true,
            message: 'Livro excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir livro:', error);
        
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


// o metódo obterEstatiscas irá retornar uma estatísca geral do sistema da biblioteca, falar quantos livros tem, quantos livros tem pelo menos 1 exemplar, quantos
// disponiveis, quantos emprestados e quantos extraviados.

{/*
    
    Exemplo prático:
    
    "success": true,
    "data": {
        "total_livros": 15,           // Total de livros cadastrados
        "livros_com_exemplares": 12,  // Quantos livros têm pelo menos 1 exemplar
        "resumo_exemplares": {
            "total": 45,              // Total de exemplares no sistema
            "disponiveis": 28,        // Exemplares disponíveis para empréstimo
            "emprestados": 15,        // Exemplares atualmente emprestados
            "extraviados": 2          // Exemplares marcados como extraviados
    
    
    */}

exports.obterEstatisticas = async (req, res) => {
    try {
        const totalLivros = await Livro.contarLivros();
        const livrosComExemplares = await Livro.listarComExemplares();

        const estatisticas = {
            total_livros: totalLivros,
            livros_com_exemplares: livrosComExemplares.length,
            resumo_exemplares: {
                total: livrosComExemplares.reduce((acc, livro) => acc + livro.total_exemplares, 0),
                disponiveis: livrosComExemplares.reduce((acc, livro) => acc + (livro.disponiveis || 0), 0),
                emprestados: livrosComExemplares.reduce((acc, livro) => acc + (livro.emprestados || 0), 0),
                extraviados: livrosComExemplares.reduce((acc, livro) => acc + (livro.extraviados || 0), 0)
            }
        };

        res.json({
            success: true,
            data: estatisticas
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};