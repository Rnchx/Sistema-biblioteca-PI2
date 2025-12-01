const Emprestimo = require('../models/emprestimo');
const Aluno = require('../models/Aluno');
const Exemplar = require('../models/exemplar');
const { connection } = require('../database/connection'); // IMPORTADO!

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

    // Criar empréstimo com devolvido = FALSE por padrão
    const conn = await connection.getConnection();
    try {
      await conn.query('START TRANSACTION');

      const [result] = await conn.query(
        'INSERT INTO emprestimo (id_exemplar, id_aluno, devolvido) VALUES (?, ?, FALSE)',
        [idExemplar, aluno.id]
      );

      await conn.query(
        'UPDATE exemplar SET status = "Emprestado" WHERE id = ?',
        [idExemplar]
      );

      await conn.query('COMMIT');
      
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
      await conn.query('ROLLBACK');
      throw error;
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('Erro ao realizar empréstimo:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor: ' + error.message });
  }
};

exports.registrarDevolucao = async (req, res) => {
  try {
    const { ra, codigoLivro } = req.body;

    console.log(`=== TENTANDO DEVOLUÇÃO ===`);
    console.log(`RA: ${ra}, Exemplar: ${codigoLivro}`);

    // Validação básica
    if (!ra || !codigoLivro) {
      return res.status(400).json({
        success: false,
        mensagem: 'RA e código do livro são obrigatórios.'
      });
    }

    // 1. Buscar aluno pelo RA
    const aluno = await Aluno.buscarPorRa(ra);
    if (!aluno) {
      return res.status(404).json({
        success: false,
        mensagem: 'Aluno não encontrado.'
      });
    }

    // 2. Buscar exemplar
    const exemplar = await Exemplar.listarExemplarPorId(codigoLivro);
    if (!exemplar) {
      return res.status(404).json({
        success: false,
        mensagem: 'Exemplar não encontrado.'
      });
    }

    // 3. Verificar se exemplar está emprestado
    if (exemplar.status !== 'Emprestado') {
      return res.status(400).json({
        success: false,
        mensagem: 'Este exemplar não está alugado.'
      });
    }

    // 4. Buscar empréstimo ativo (não devolvido)
    const emprestimoAtivo = await Emprestimo.buscarEmprestimoAtivo(aluno.id, exemplar.id);
    
    if (!emprestimoAtivo) {
      return res.status(400).json({
        success: false,
        mensagem: 'Este exemplar não está alugado por este aluno.'
      });
    }

    // 5. Atualizar status do exemplar para "Disponível"
    await Exemplar.atualizarStatus(exemplar.id, 'Disponível');

    // 6. MARCAR EMPRÉSTIMO COMO DEVOLVIDO (NÃO DELETAR!)
    await connection.execute(
      `UPDATE emprestimo SET devolvido = TRUE WHERE id = ?`,
      [emprestimoAtivo.id]
    );

    // 7. ATUALIZAR CLASSIFICAÇÃO DO ALUNO
    const novaClassificacao = await atualizarClassificacaoAluno(aluno.id);

    console.log(`✓ Devolução concluída com sucesso!`);

    res.json({
      success: true,
      message: 'Devolução realizada com sucesso!',
      data: {
        aluno: {
          nome: aluno.nome,
          ra: aluno.ra
        },
        livro: {
          titulo: exemplar.titulo || 'Livro desconhecido',
          autor: exemplar.autor || 'Autor desconhecido',
          exemplarId: exemplar.id
        },
        classificacao: novaClassificacao
      }
    });

  } catch (error) {
    console.error('❌ ERRO COMPLETO AO REGISTRAR DEVOLUÇÃO:', error);
    res.status(500).json({
      success: false,
      mensagem: 'Erro no servidor: ' + error.message
    });
  }
};

async function atualizarClassificacaoAluno(idAluno) {
  try {
    // Contar todos os empréstimos DEVOLVIDOS do aluno
    const [result] = await connection.execute(
      `SELECT COUNT(*) as total_lidos 
       FROM emprestimo 
       WHERE id_aluno = ? AND devolvido = TRUE`,
      [idAluno]
    );
    
    const totalLivrosLidos = result[0].total_lidos;
    
    // Determinar classificação baseada no total
    let tipo, descricao;
    
    if (totalLivrosLidos <= 5) {
      tipo = 'INICIANTE';
      descricao = 'Leitor Iniciante - até 5 livros';
    } else if (totalLivrosLidos <= 10) {
      tipo = 'REGULAR';
      descricao = 'Leitor Regular - 6 a 10 livros';
    } else if (totalLivrosLidos <= 20) {
      tipo = 'ATIVO';
      descricao = 'Leitor Ativo - 11 a 20 livros';
    } else {
      tipo = 'EXTREMO';
      descricao = 'Leitor Extremo - mais de 20 livros';
    }
    
    // Verificar se já existe classificação para este aluno
    const [classificacaoExistente] = await connection.execute(
      'SELECT * FROM classificacao WHERE idAluno = ?',
      [idAluno]
    );
    
    if (classificacaoExistente.length > 0) {
      // Atualizar classificação existente
      await connection.execute(
        `UPDATE classificacao 
         SET tipo = ?, descricao = ? 
         WHERE idAluno = ?`,
        [tipo, descricao, idAluno]
      );
    } else {
      // Criar nova classificação
      await connection.execute(
        `INSERT INTO classificacao (tipo, descricao, idAluno) 
         VALUES (?, ?, ?)`,
        [tipo, descricao, idAluno]
      );
    }
    
    return {
      tipo,
      descricao,
      totalLivrosLidos
    };
    
  } catch (error) {
    console.error('Erro ao atualizar classificação:', error);
    return {
      tipo: 'DESCONHECIDO',
      descricao: 'Classificação não atualizada',
      totalLivrosLidos: 0
    };
  }
}

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
    const emprestimos = await Emprestimo.listarTodosEmprestimosAtivos();

    res.json({
      success: true,
      data: emprestimos,
      total: emprestimos.length
    });

  } catch (error) {
    console.error('Erro ao listar todos os empréstimos ativos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor: ' + error.message
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