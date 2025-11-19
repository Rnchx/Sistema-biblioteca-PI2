const Emprestimo = require('../models/emprestimo');
const Aluno = require('../models/Aluno');
const Exemplar = require('../models/exemplar');

exports.realizarEmprestimo = async (req, res) => {
  try {
    const { raAluno, idExemplar } = req.body;

    const aluno = await Aluno.buscarPorRa(raAluno);
    if (!aluno) {
      return res.status(404).json({ success: false, error: 'Aluno não encontrado' });
    }

    const exemplarDisponivel = await Exemplar.verificarDisponibilidade(idExemplar);
    if (!exemplarDisponivel) {
      return res.status(400).json({ success: false, error: 'Exemplar não disponível para empréstimo' });
    }

    const exemplar = await Exemplar.listarExemplarPorId(idExemplar);
    if (!exemplar) {
      return res.status(404).json({ success: false, error: 'Exemplar não encontrado' });
    }

    const result = await Emprestimo.criar({ idExemplar, idAluno: aluno.id });

    await Exemplar.atualizarStatus(idExemplar, 'Emprestado');

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
    res.status(500).json({ success: false, error: 'Erro interno do servidor: ' + error.message });
  }
};

exports.registrarDevolucao = async (req, res) => {
  try {
    const { ra, codigoLivro } = req.body;

    // Validação dos campos
    if (!ra || !codigoLivro) {
      return res.status(400).json({
        success: false,
        mensagem: 'RA e código do livro são obrigatórios.'
      });
    }

    // Buscar aluno pelo RA
    const aluno = await Aluno.buscarPorRa(ra);
    if (!aluno) {
      return res.status(404).json({
        success: false,
        mensagem: 'Aluno não encontrado.'
      });
    }

    // Buscar exemplar pelo código
    const exemplar = await Exemplar.listarExemplarPorId(codigoLivro);
    if (!exemplar) {
      return res.status(404).json({
        success: false,
        mensagem: 'Exemplar não encontrado.'
      });
    }

    // Buscar empréstimo ativo
    const emprestimo = await Emprestimo.listarEmprestimosAtivos(aluno.id, exemplar.id);
    if (!emprestimo) {
      return res.status(404).json({
        success: false,
        mensagem: 'Nenhum empréstimo ativo encontrado para este aluno e exemplar.'
      });
    }

    // Verificar se já foi devolvido
    if (emprestimo.exemplar_status === 'Disponível') {
      return res.status(400).json({
        success: false,
        mensagem: 'Exemplar já devolvido.'
      });
    }

    // Registrar devolução
    await Emprestimo.registrarDevolucao(emprestimo.id);

    // Atualizar classificação do aluno
    const classificacao = await Classificacao.classificarEAtualizarAluno(aluno.id);

    // Resposta de sucesso
    res.json({
      success: true,
      message: 'Devolução registrada com sucesso',
      data: {
        emprestimo: emprestimo.id,
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          ra: aluno.ra
        },
        livro: {
          titulo: exemplar.titulo,
          autor: exemplar.autor
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
      mensagem: 'Erro interno do servidor: ' + error.message
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