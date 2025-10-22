const Emprestimo = require('../models/emprestimo');
const Aluno = require('../models/aluno');
const Exemplar = require('../models/exemplar');
const Classificacao = require('../models/classificacao');

exports.realizarEmprestimo = async (req, res) => {
    try {
        const { raAluno, idExemplar } = req.body;

        // Verificar se aluno existe
        const aluno = await Aluno.buscarPorRa(raAluno);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        const exemplarDisponivel = await Emprestimo.verificarExemplarDisponivel(idExemplar);
        if (!exemplarDisponivel) {
            return res.status(400).json({
                success: false,
                error: 'Exemplar não disponível para empréstimo'
            });
        }

        const exemplar = await Exemplar.buscarPorId(idExemplar);

        const result = await Emprestimo.criar({
            idExemplar: idExemplar,
            idAluno: aluno.id
        });

        res.status(201).json({
            success: true,
            message: 'Empréstimo realizado com sucesso',
            data: {
                id: result.insertId,
                aluno: {
                    id: aluno.id,
                    nome: aluno.nome,
                    ra: aluno.ra
                },
                exemplar: {
                    id: exemplar.id,
                    livro_titulo: exemplar.titulo,
                    livro_autor: exemplar.autor
                }
            }
        });

    } catch (error) {
        console.error('Erro ao realizar empréstimo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor: ' + error.message
        });
    }
};

exports.registrarDevolucao = async (req, res) => {
    try {
        const { idEmprestimo } = req.body;

        const emprestimo = await Emprestimo.buscarPorId(idEmprestimo);
        if (!emprestimo) {
            return res.status(404).json({
                success: false,
                error: 'Empréstimo não encontrado'
            });
        }

        if (emprestimo.exemplar_status === 'Disponível') {
            return res.status(400).json({
                success: false,
                error: 'Exemplar já devolvido'
            });
        }

        await Emprestimo.registrarDevolucao(idEmprestimo);

        const classificacao = await Classificacao.classificarEAtualizarAluno(emprestimo.id_aluno);

        res.json({
            success: true,
            message: 'Devolução registrada com sucesso',
            data: {
                emprestimo: idEmprestimo,
                aluno: {
                    id: emprestimo.id_aluno,
                    nome: emprestimo.aluno_nome,
                    ra: emprestimo.ra
                },
                classificacao: {
                    codigo: classificacao.codigo,
                    descricao: classificacao.descricao,
                    totalLivros: classificacao.totalLivros
                }
            }
        });

    } catch (error) {
        console.error('Erro ao registrar devolução:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor: ' + error.message
        });
    }
};

exports.listarEmprestimosAtivosPorAluno = async (req, res) => {
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

        const emprestimos = await Emprestimo.listarAtivosPorAluno(aluno.id);

        res.json({
            success: true,
            data: emprestimos,
            total: emprestimos.length
        });

    } catch (error) {
        console.error('Erro ao listar empréstimos ativos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarTodosEmprestimosAtivos = async (req, res) => {
    try {
        const emprestimos = await Emprestimo.listarEmprestimosAtivos();

        res.json({
            success: true,
            data: emprestimos,
            total: emprestimos.length
        });

    } catch (error) {
        console.error('Erro ao listar todos os empréstimos ativos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarHistoricoPorAluno = async (req, res) => {
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

        const emprestimos = await Emprestimo.listarTodosPorAluno(aluno.id);

        res.json({
            success: true,
            data: emprestimos,
            total: emprestimos.length
        });

    } catch (error) {
        console.error('Erro ao listar histórico:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarEmprestimoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const emprestimo = await Emprestimo.buscarPorId(id);
        if (!emprestimo) {
            return res.status(404).json({
                success: false,
                error: 'Empréstimo não encontrado'
            });
        }

        res.json({
            success: true,
            data: emprestimo
        });

    } catch (error) {
        console.error('Erro ao buscar empréstimo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarExemplaresDisponiveis = async (req, res) => {
    try {
        const exemplares = await Emprestimo.buscarExemplaresDisponiveis();

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