const Classificacao = require('../models/classificacao');
const Aluno = require('../models/Aluno');
const { connection } = require('../database/connection');

exports.obterClassificacaoPorAluno = async (req, res) => {
  try {
    const { ra } = req.params;

    // Buscar aluno
    const [alunoRows] = await connection.execute(
      'SELECT * FROM aluno WHERE ra = ?',
      [ra]
    );
    
    if (alunoRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Aluno não encontrado'
      });
    }
    
    const aluno = alunoRows[0];
    
    // Contar livros lidos (devolvidos = TRUE)
    const [livrosLidosResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM emprestimo WHERE id_aluno = ? AND devolvido = TRUE',
      [aluno.id]
    );
    
    const totalLivrosLidos = livrosLidosResult[0].total;
    
    // Contar livros ativos (devolvidos = FALSE)
    const [livrosAtivosResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM emprestimo WHERE id_aluno = ? AND devolvido = FALSE',
      [aluno.id]
    );
    
    const livrosAtivos = livrosAtivosResult[0].total;
    
    // Buscar classificação atual
    const [classificacaoRows] = await connection.execute(
      'SELECT * FROM classificacao WHERE idAluno = ?',
      [aluno.id]
    );
    
    // Se não tiver classificação, criar uma
    let classificacao;
    if (classificacaoRows.length > 0) {
      classificacao = classificacaoRows[0];
    } else {
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
      
      // Inserir nova classificação
      const [result] = await connection.execute(
        'INSERT INTO classificacao (tipo, descricao, idAluno) VALUES (?, ?, ?)',
        [tipo, descricao, aluno.id]
      );
      
      classificacao = {
        id: result.insertId,
        tipo,
        descricao,
        idAluno: aluno.id
      };
    }
    
    res.json({
      success: true,
      data: {
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          ra: aluno.ra
        },
        estatisticas: {
          totalLivrosLidos,
          livrosAtivos
        },
        classificacao
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

exports.recalcularClassificacao = async (req, res) => {
  try {
    const { ra } = req.params;
    
    // Buscar aluno
    const [alunoRows] = await connection.execute(
      'SELECT * FROM aluno WHERE ra = ?',
      [ra]
    );
    
    if (alunoRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Aluno não encontrado'
      });
    }
    
    const aluno = alunoRows[0];
    
    // Recalcular classificação
    const classificacao = await atualizarClassificacaoAluno(aluno.id);
    
    res.json({
      success: true,
      message: 'Classificação recalculada com sucesso',
      data: classificacao
    });
    
  } catch (error) {
    console.error('Erro ao recalcular classificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

async function atualizarClassificacaoAluno(idAluno) {
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
}

exports.listarClassificacaoGeral = async (req, res) => {
  try {
    const [classificacoes] = await connection.execute(`
      SELECT 
        a.id as aluno_id,
        a.nome,
        a.ra,
        COALESCE(c.tipo, 'INICIANTE') as tipo,
        COALESCE(c.descricao, 'Leitor Iniciante - até 5 livros') as descricao,
        COALESCE(
          (SELECT COUNT(*) FROM emprestimo WHERE id_aluno = a.id AND devolvido = TRUE), 
          0
        ) as livros_lidos,
        COALESCE(
          (SELECT COUNT(*) FROM emprestimo WHERE id_aluno = a.id AND devolvido = FALSE), 
          0
        ) as livros_ativos
      FROM aluno a
      LEFT JOIN classificacao c ON a.id = c.idAluno
      ORDER BY livros_lidos DESC, a.nome
    `);
    
    // Garantir que todos os alunos apareçam
    res.json({
      success: true,
      data: classificacoes,
      total: classificacoes.length
    });
    
  } catch (error) {
    console.error('Erro ao listar classificação geral:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

exports.listarPorNivel = async (req, res) => {
  try {
    const { nivel } = req.params;
    
    const niveisValidos = ['INICIANTE', 'REGULAR', 'ATIVO', 'EXTREMO'];
    
    if (!niveisValidos.includes(nivel.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Nível inválido. Use: INICIANTE, REGULAR, ATIVO ou EXTREMO'
      });
    }
    
    const [alunos] = await connection.execute(`
      SELECT 
        a.id,
        a.nome,
        a.ra,
        c.tipo,
        c.descricao,
        (SELECT COUNT(*) FROM emprestimo WHERE id_aluno = a.id AND devolvido = TRUE) as livros_lidos
      FROM aluno a
      JOIN classificacao c ON a.id = c.idAluno
      WHERE c.tipo = ?
      ORDER BY livros_lidos DESC, a.nome
    `, [nivel.toUpperCase()]);
    
    res.json({
      success: true,
      data: alunos,
      total: alunos.length,
      nivel: nivel.toUpperCase()
    });
    
  } catch (error) {
    console.error('Erro ao listar por nível:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

exports.sincronizarClassificacoes = async (req, res) => {
  try {
    // Buscar todos os alunos
    const [alunos] = await connection.execute('SELECT * FROM aluno');
    
    let atualizados = 0;
    let criados = 0;
    
    for (const aluno of alunos) {
      // Contar livros lidos do aluno
      const [result] = await connection.execute(
        'SELECT COUNT(*) as total FROM emprestimo WHERE id_aluno = ? AND devolvido = TRUE',
        [aluno.id]
      );
      
      const totalLivrosLidos = result[0].total;
      
      // Determinar classificação
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
      
      // Verificar se já existe classificação
      const [classificacaoExistente] = await connection.execute(
        'SELECT * FROM classificacao WHERE idAluno = ?',
        [aluno.id]
      );
      
      if (classificacaoExistente.length > 0) {
        // Atualizar
        await connection.execute(
          'UPDATE classificacao SET tipo = ?, descricao = ? WHERE idAluno = ?',
          [tipo, descricao, aluno.id]
        );
        atualizados++;
      } else {
        // Criar nova
        await connection.execute(
          'INSERT INTO classificacao (tipo, descricao, idAluno) VALUES (?, ?, ?)',
          [tipo, descricao, aluno.id]
        );
        criados++;
      }
    }
    
    res.json({
      success: true,
      message: `Classificações sincronizadas com sucesso!`,
      detalhes: {
        totalAlunos: alunos.length,
        classificacoesAtualizadas: atualizados,
        classificacoesCriadas: criados
      }
    });
    
  } catch (error) {
    console.error('Erro ao sincronizar classificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};