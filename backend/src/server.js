const express = require('express');
const cors = require('cors');
const { connection } = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// // DEBUG: Verificar cada controller individualmente
// console.log('=== INICIANDO DEBUG DOS CONTROLLERS ===');

// try {
//     const alunoController = require('./controllers/alunoController');
//     console.log('✅ alunoController - carregado');
//     console.log('   cadastrarAluno:', typeof alunoController.cadastrarAluno);
//     console.log('   listarAlunos:', typeof alunoController.listarAlunos);
// } catch (error) {
//     console.log('❌ alunoController - ERRO:', error.message);
// }

// try {
//     const livroController = require('./controllers/livroController');
//     console.log('✅ livroController - carregado');
//     console.log('   cadastrarLivro:', typeof livroController.cadastrarLivro);
// } catch (error) {
//     console.log('❌ livroController - ERRO:', error.message);
// }

// try {
//     const exemplarController = require('./controllers/exemplarController');
//     console.log('✅ exemplarController - carregado');
//     console.log('   listarExemplares:', typeof exemplarController.listarExemplares);
// } catch (error) {
//     console.log('❌ exemplarController - ERRO:', error.message);
// }

// try {
//     const emprestimoController = require('./controllers/emprestimoController');
//     console.log('✅ emprestimoController - carregado');
//     console.log('   realizarEmprestimo:', typeof emprestimoController.realizarEmprestimo);
// } catch (error) {
//     console.log('❌ emprestimoController - ERRO:', error.message);
// }

// try {
//     const classificacaoController = require('./controllers/classificacaoController');
//     console.log('✅ classificacaoController - carregado');
//     console.log('   obterClassificacaoPorAluno:', typeof classificacaoController.obterClassificacaoPorAluno);
// } catch (error) {
//     console.log('❌ classificacaoController - ERRO:', error.message);
// }

// console.log('=== FIM DO DEBUG ===');

// Importar controllers
const alunoController = require('./controllers/alunoController');
const livroController = require('./controllers/livroController');
const exemplarController = require('./controllers/exemplarController');
const emprestimoController = require('./controllers/emprestimoController');
const classificacaoController = require('./controllers/classificacaoController');

// Rotas de Aluno
app.post('/alunos', alunoController.cadastrarAluno);
app.get('/alunos', alunoController.listarAlunos);
app.get('/alunos/ra/:ra', alunoController.buscarAlunoPorRa);
app.get('/alunos/:id', alunoController.buscarAlunoPorId);
app.get('/alunos/cpf/:cpf', alunoController.buscarAlunoPorCpf);
app.get('/alunos/telefone/:telefone', alunoController.buscarAlunoPorTelefone);
app.get('/alunos/verificar-ra/:ra', alunoController.verificarRaExistente);
app.get('/alunos/verificar-cpf/:cpf', alunoController.verificarCpfExistente);
app.get('/alunos/verificar-telefone/:telefone', alunoController.verificarTelefoneExistente);
app.get('/alunos/verificar-email/:email', alunoController.verificarEmailExistente);
app.put('/alunos/:id', alunoController.atualizarAluno);
app.delete('/alunos/:id', alunoController.excluirAluno);

// Rotas de Livro
app.post('/livros', livroController.cadastrarLivro);
app.get('/livros', livroController.listarTodosLivros);
app.get('/livros/disponiveis', livroController.listarLivrosDisponiveis);
app.get('/livros/com-exemplares', livroController.listarLivrosComExemplares);
app.get('/livros/buscar', livroController.buscarLivros);
app.get('/livros/estatisticas', livroController.obterEstatisticas);
app.get('/livros/:id', livroController.buscarLivroPorId);
app.put('/livros/:id', livroController.atualizarLivro);
app.delete('/livros/:id', livroController.excluirLivro);

// Rotas de Exemplar
app.get('/exemplares', exemplarController.listarExemplares);
app.get('/exemplares/disponiveis', exemplarController.listarExemplaresDisponiveis);
app.get('/exemplares/livro/:id_livro/estatisticas', exemplarController.obterEstatisticasLivro);
app.get('/exemplares/:id', exemplarController.buscarExemplarPorId);
app.get('/exemplares/:id/disponivel', exemplarController.verificarDisponibilidade);
app.post('/exemplares', exemplarController.adicionarExemplar);
app.put('/exemplares/:id/status', exemplarController.atualizarStatus);
app.put('/exemplares/:id/extraviado', exemplarController.marcarComoExtraviado);
app.delete('/exemplares/:id', exemplarController.excluirExemplar);

// Rotas de Empréstimo
app.post('/emprestimos', emprestimoController.realizarEmprestimo);
app.post('/emprestimos/devolucao', emprestimoController.registrarDevolucao);
app.get('/emprestimos/ativos', emprestimoController.listarTodosEmprestimosAtivos);
app.get('/emprestimos/exemplares/disponiveis', emprestimoController.listarExemplaresDisponiveis);
app.get('/emprestimos/aluno/:ra/ativos', emprestimoController.listarEmprestimosAtivosPorAluno);
app.get('/emprestimos/aluno/:ra/historico', emprestimoController.listarHistoricoPorAluno);
app.get('/emprestimos/:id', emprestimoController.buscarEmprestimoPorId);

// Rotas de Classificação
app.get('/classificacao/aluno/:ra', classificacaoController.obterClassificacaoPorAluno);
app.get('/classificacao/geral', classificacaoController.listarClassificacaoGeral);
app.post('/classificacao/recalcular/:ra', classificacaoController.recalcularClassificacao);
app.get('/classificacao/nivel/:nivel', classificacaoController.listarPorNivel);

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Sistema da Biblioteca está funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota padrão
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bem-vindo ao Sistema de Biblioteca!',
        endpoints: {
            alunos: '/alunos',
            livros: '/livros', 
            exemplares: '/exemplares',
            emprestimos: '/emprestimos',
            classificacao: '/classificacao'
        }
    });
});

// Middleware de tratamento de erro 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada'
    });
});

// Middleware de tratamento de erros global
app.use((error, req, res, next) => {
    console.error('Erro global:', error);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// Testar conexão com banco e iniciar servidor
async function startServer() {
    try {
        // Testar conexão com o banco
        await connection.execute('SELECT 1');
        console.log('✅ Conectado ao banco de dados MySQL');
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📚 Sistema de Biblioteca API`);
            console.log(`📍 URL: http://localhost:${PORT}`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error.message);
        process.exit(1);
    }
}

// Iniciar servidor
startServer();

module.exports = app;