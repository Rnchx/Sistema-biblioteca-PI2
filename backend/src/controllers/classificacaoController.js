const Classificacao = require('../models/classificacao');
const Aluno = require('../models/Aluno');
const { connection } = require('../database/connection');

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
                    tipo: classificacao.tipo,
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
        console.log('🔍🔍🔍 DEBUG COMPLETO DA QUERY 🔍🔍🔍');
        
        // TESTE 1: Contagem total de empréstimos
        console.log('🧪 TESTE 1: Contagem TOTAL de empréstimos...');
        const [totalGeral] = await connection.execute('SELECT COUNT(*) as total FROM emprestimo');
        console.log('📊 TOTAL de empréstimos no sistema:', totalGeral[0].total);
        
        // TESTE 2: Ver alguns empréstimos
        console.log('🧪 TESTE 2: Ver alguns empréstimos...');
        const [algunsEmprestimos] = await connection.execute('SELECT * FROM emprestimo LIMIT 5');
        console.log('📊 Primeiros empréstimos:', algunsEmprestimos);
        
        // TESTE 3: Ver estrutura da tabela emprestimo
        console.log('🧪 TESTE 3: Estrutura da tabela emprestimo...');
        const [estrutura] = await connection.execute('DESCRIBE emprestimo');
        console.log('📊 Estrutura:', estrutura);
        
        // TESTE 4: Contagem por aluno específico (João ID 1)
        console.log('🧪 TESTE 4: Contagem para João (ID 1)...');
        const [joaoCount] = await connection.execute('SELECT COUNT(*) as total FROM emprestimo WHERE id_aluno = 1');
        console.log('📊 João (ID 1) tem:', joaoCount[0].total, 'empréstimos');
        
        // TESTE 5: Ver empréstimos do João
        console.log('🧪 TESTE 5: Empréstimos do João (ID 1)...');
        const [joaoEmprestimos] = await connection.execute('SELECT * FROM emprestimo WHERE id_aluno = 1');
        console.log('📊 Empréstimos do João:', joaoEmprestimos);
        
        // TESTE 6: Ver todos os alunos e seus IDs
        console.log('🧪 TESTE 6: Todos os alunos...');
        const [todosAlunos] = await connection.execute('SELECT id, nome, ra FROM aluno');
        console.log('📊 Alunos:', todosAlunos);
        
        // AGORA testar a query problemática
        console.log('\n🧪🧪�️️ TESTANDO A QUERY PROBLEMÁTICA 🧪🧪🧪');
        for (let aluno of todosAlunos) {
            const [result] = await connection.execute(
                'SELECT COUNT(*) as total_livros FROM emprestimo WHERE id_aluno = ?',
                [aluno.id]
            );
            console.log(`📊 ${aluno.nome} (ID: ${aluno.id}): ${result[0].total_livros} empréstimos`);
        }
        
        // Continuar com o processamento normal...
        const classificacoesComAlunos = await Classificacao.listarClassificacoesComAlunos();
        
        const classificacoesAtualizadas = await Promise.all(
            classificacoesComAlunos.map(async (classificacao) => {
                try {
                    const [rows] = await connection.execute(
                        'SELECT COUNT(*) as total_livros FROM emprestimo WHERE id_aluno = ?',
                        [classificacao.idAluno]
                    );
                    
                    const totalLivrosReal = rows[0].total_livros;
                    
                    let tipoCorreto, descricaoCorreta;
                    if (totalLivrosReal <= 5) {
                        tipoCorreto = 'INICIANTE';
                        descricaoCorreta = 'Leitor Iniciante - até 5 livros';
                    } else if (totalLivrosReal <= 10) {
                        tipoCorreto = 'REGULAR';
                        descricaoCorreta = 'Leitor Regular - 6 a 10 livros';
                    } else if (totalLivrosReal <= 20) {
                        tipoCorreto = 'ATIVO';
                        descricaoCorreta = 'Leitor Ativo - 11 a 20 livros';
                    } else {
                        tipoCorreto = 'EXTREMO';
                        descricaoCorreta = 'Leitor Extremo - mais de 20 livros';
                    }
                    
                    return {
                        aluno: {
                            id: classificacao.idAluno,
                            nome: classificacao.aluno_nome,
                            ra: classificacao.ra
                        },
                        classificacao: {
                            tipo: tipoCorreto,
                            descricao: descricaoCorreta,
                            totalLivros: totalLivrosReal
                        }
                    };
                    
                } catch (error) {
                    console.error(`❌ Erro:`, error);
                    return {
                        aluno: {
                            id: classificacao.idAluno,
                            nome: classificacao.aluno_nome,
                            ra: classificacao.ra
                        },
                        classificacao: {
                            tipo: 'INICIANTE',
                            descricao: 'Leitor Iniciante - até 5 livros',
                            totalLivros: 0
                        }
                    };
                }
            })
        );
        
        res.json({
            success: true,
            data: classificacoesAtualizadas,
            total: classificacoesAtualizadas.length
        });

    } catch (error) {
        console.error('❌ ERRO GRAVE:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno: ' + error.message
        });
    }
};

exports.recalcularClassificacao = async (req, res) => {
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
            message: 'Classificação recalculada com sucesso',
            data: {
                aluno: {
                    id: aluno.id,
                    nome: aluno.nome,
                    ra: aluno.ra
                },
                classificacao: {
                    tipo: classificacao.tipo,
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

        const classificacoes = await Classificacao.listarClassificacoesComAlunos();
        const alunosFiltrados = classificacoes.filter(c => c.tipo === nivel.toUpperCase());

        const resultado = alunosFiltrados.map(classificacao => ({
            id: classificacao.idAluno,
            nome: classificacao.aluno_nome,
            ra: classificacao.ra,
            tipo: classificacao.tipo,
            descricao: classificacao.descricao
        }));

        res.json({
            success: true,
            data: resultado,
            total: resultado.length
        });

    } catch (error) {
        console.error('Erro ao listar por nível:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};