const Aluno = require('../models/aluno');

exports.cadastrarAluno = async (req, res) => {
    try {
        const { nome, ra, cpf, email, telefone, endereco } = req.body;

        if (!nome || !ra || !cpf) {
            return res.status(400).json({ 
                success: false,
                error: 'Nome, RA e CPF são obrigatórios' 
            });
        }

        const alunoExistenteRA = await Aluno.buscarPorRa(ra);
        if (alunoExistenteRA) {
            return res.status(400).json({
                success: false,
                error: 'RA já cadastrado'
            });
        }

        const alunoExistenteCPF = await Aluno.buscarPorCpf(cpf);
        if (alunoExistenteCPF) {
            return res.status(400).json({
                success: false,
                error: 'CPF já cadastrado'
            });
        }

        const result = await Aluno.criar({ 
            nome, ra, cpf, email, telefone, endereco 
        });
        
        res.status(201).json({
            success: true,
            message: 'Aluno cadastrado com sucesso',
            data: { id: result.insertId, nome, ra, cpf, email, telefone, endereco }
        });

    } catch (error) {
        console.error('Erro ao cadastrar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarAlunoPorRa = async (req, res) => {
    try {
        const { ra } = req.params;

        const aluno = await Aluno.buscarPorRa(ra);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data: aluno
        });

    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarAlunoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const aluno = await Aluno.buscarPorId(id);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data: aluno
        });

    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarAlunoPorCpf = async (req, res) => {
    try {
        const { cpf } = req.params;

        const aluno = await Aluno.buscarPorCpf(cpf);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data: aluno
        });

    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarAlunos = async (req, res) => {
    try {
        const alunos = await Aluno.listarTodos();

        res.json({
            success: true,
            data: alunos,
            total: alunos.length
        });

    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.atualizarAluno = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, endereco } = req.body;

        // Verificar se aluno existe
        const alunoExistente = await Aluno.buscarPorId(id);
        if (!alunoExistente) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        // Validações
        if (!nome) {
            return res.status(400).json({
                success: false,
                error: 'Nome é obrigatório'
            });
        }

        const result = await Aluno.atualizar(id, { 
            nome, email, telefone, endereco 
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Aluno atualizado com sucesso',
            data: {
                id: parseInt(id),
                nome,
                email,
                telefone,
                endereco
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.excluirAluno = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se aluno existe
        const aluno = await Aluno.buscarPorId(id);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        await Aluno.deletar(id);

        res.json({
            success: true,
            message: 'Aluno excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarAlunoPorTelefone = async (req, res) => {
    try {
        const { telefone } = req.params;

        const aluno = await Aluno.buscarPorTelefone(telefone);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data: aluno
        });

    } catch (error) {
        console.error('Erro ao buscar aluno por telefone:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};