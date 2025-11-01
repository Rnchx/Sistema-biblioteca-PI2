// managementBooks.js
// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
let campoBusca, botaoBusca, corpoTabelaDisponiveis, corpoTabelaEmprestados;
let botaoCarregarMaisDisponiveis, botaoCarregarMaisEmprestados;

// Cache para dados de alunos
const cacheAlunos = new Map();

// Variáveis para controle da busca
let timeoutBusca = null;
let todosLivrosDisponiveis = [];
let todosEmprestimosAtivos = [];

// Variáveis para paginação
let limiteItens = 5;
let disponiveisExibidos = 0;
let emprestimosExibidos = 0;
let disponiveisFiltradosAtuais = [];
let emprestimosFiltradosAtuais = [];

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Página de gerenciamento de livros carregada');
    inicializarElementos();
    configurarEventos();
    carregarDadosIniciais();
});

function inicializarElementos() {
    campoBusca = document.getElementById('campoBusca');
    botaoBusca = document.getElementById('botaoBusca');
    corpoTabelaDisponiveis = document.getElementById('corpoTabelaDisponiveis');
    corpoTabelaEmprestados = document.getElementById('corpoTabelaEmprestados');
    botaoCarregarMaisDisponiveis = document.getElementById('botaoCarregarMaisDisponiveis');
    botaoCarregarMaisEmprestados = document.getElementById('botaoCarregarMaisEmprestados');
}

function configurarEventos() {
    if (botaoBusca) {
        botaoBusca.addEventListener('click', function() {
            realizarBusca();
        });
    }
    
    if (campoBusca) {
        // Busca automática enquanto digita
        campoBusca.addEventListener('input', function() {
            clearTimeout(timeoutBusca);
            timeoutBusca = setTimeout(function() {
                realizarBusca();
            }, 500);
        });
        
        // Enter ainda funciona
        campoBusca.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(timeoutBusca);
                realizarBusca();
            }
        });
    }
    
    if (botaoCarregarMaisDisponiveis) {
        botaoCarregarMaisDisponiveis.addEventListener('click', function() {
            carregarMaisDisponiveis();
        });
    }
    
    if (botaoCarregarMaisEmprestados) {
        botaoCarregarMaisEmprestados.addEventListener('click', function() {
            carregarMaisEmprestados();
        });
    }
}

// Carregar dados iniciais
async function carregarDadosIniciais() {
    try {
        console.log('🔄 Carregando dados iniciais...');
        
        // Carregar todos os livros
        const responseLivros = await fetch(`${API_BASE_URL}/livros`);
        if (!responseLivros.ok) {
            throw new Error(`Erro HTTP: ${responseLivros.status}`);
        }
        const dataLivros = await responseLivros.json();
        console.log('📖 Resposta todos os livros:', dataLivros);
        
        // Extrair array de livros da resposta
        todosLivrosDisponiveis = extrairDadosLivros(dataLivros);
        
        // Buscar TODOS os exemplares disponíveis de uma vez
        const exemplaresDisponiveis = await buscarTodosExemplaresDisponiveis();
        console.log('📚 Todos os exemplares disponíveis:', exemplaresDisponiveis);
        
        // Contar exemplares por livro
        todosLivrosDisponiveis = contarExemplaresPorLivro(todosLivrosDisponiveis, exemplaresDisponiveis);
        
        // Inicializar a exibição dos livros disponíveis
        disponiveisFiltradosAtuais = [...todosLivrosDisponiveis];
        resetarPaginacaoDisponiveis();
        exibirProximosDisponiveis();
        
        // Carregar empréstimos ativos
        const responseEmprestimos = await fetch(`${API_BASE_URL}/emprestimos/ativos`);
        if (!responseEmprestimos.ok) {
            throw new Error(`Erro HTTP: ${responseEmprestimos.status}`);
        }
        const dataEmprestimos = await responseEmprestimos.json();
        console.log('📚 Resposta empréstimos ativos:', dataEmprestimos);
        
        // Extrair array de empréstimos da resposta
        const emprestimosAtivos = extrairDadosEmprestimos(dataEmprestimos);
        
        // Buscar dados completos dos alunos para cada empréstimo
        todosEmprestimosAtivos = await buscarDadosCompletosAlunos(emprestimosAtivos);
        
        // Inicializar a exibição dos empréstimos
        emprestimosFiltradosAtuais = [...todosEmprestimosAtivos];
        resetarPaginacaoEmprestimos();
        exibirProximosEmprestimos();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error);
        alert('Erro ao carregar dados: ' + error.message);
    }
}

// Buscar TODOS os exemplares disponíveis de uma vez
async function buscarTodosExemplaresDisponiveis() {
    try {
        const response = await fetch(`${API_BASE_URL}/exemplares/disponiveis`);
        if (response.ok) {
            const data = await response.json();
            console.log('📚 Resposta exemplares disponíveis:', data);
            return extrairDadosExemplares(data);
        } else {
            console.warn('⚠️ Não foi possível buscar exemplares disponíveis');
            return [];
        }
    } catch (error) {
        console.error('❌ Erro ao buscar exemplares disponíveis:', error);
        return [];
    }
}

// Função para extrair dados de exemplares da resposta da API
function extrairDadosExemplares(data) {
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.data)) {
        return data.data;
    } else if (data && Array.isArray(data.exemplares)) {
        return data.exemplares;
    } else if (data && Array.isArray(data.results)) {
        return data.results;
    } else {
        console.warn('⚠️ Estrutura de exemplares inesperada:', data);
        return [];
    }
}

// Contar exemplares disponíveis por livro
function contarExemplaresPorLivro(livros, exemplaresDisponiveis) {
    return livros.map(livro => {
        // Contar quantos exemplares deste livro estão disponíveis
        const count = exemplaresDisponiveis.filter(exemplar => 
            exemplar.id_livro === livro.id || exemplar.livro_id === livro.id
        ).length;
        
        livro.exemplares_disponiveis = count;
        console.log(`📊 Livro ${livro.titulo}: ${count} exemplares disponíveis`);
        
        return livro;
    });
}

// Função para extrair dados de livros da resposta da API
function extrairDadosLivros(data) {
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.data)) {
        return data.data;
    } else if (data && Array.isArray(data.livros)) {
        return data.livros;
    } else if (data && Array.isArray(data.results)) {
        return data.results;
    } else {
        console.warn('⚠️ Estrutura de dados inesperada:', data);
        return [];
    }
}

// Função para extrair dados de empréstimos da resposta da API
function extrairDadosEmprestimos(data) {
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.data)) {
        return data.data;
    } else if (data && Array.isArray(data.emprestimos)) {
        return data.emprestimos;
    } else if (data && Array.isArray(data.results)) {
        return data.results;
    } else {
        console.warn('⚠️ Estrutura de empréstimos inesperada:', data);
        return [];
    }
}

// Buscar dados completos dos alunos para os empréstimos
async function buscarDadosCompletosAlunos(emprestimos) {
    if (!Array.isArray(emprestimos)) return [];
    
    const emprestimosCompletos = [];
    
    for (const emprestimo of emprestimos) {
        try {
            const raAluno = emprestimo.ra_aluno || emprestimo.ra || emprestimo.aluno?.ra;
            
            if (raAluno) {
                let dadosAluno;
                
                if (cacheAlunos.has(raAluno)) {
                    dadosAluno = cacheAlunos.get(raAluno);
                } else {
                    const responseAluno = await fetch(`${API_BASE_URL}/alunos/ra/${raAluno}`);
                    if (responseAluno.ok) {
                        const dataAluno = await responseAluno.json();
                        dadosAluno = extrairDadosAluno(dataAluno);
                        cacheAlunos.set(raAluno, dadosAluno);
                    }
                }
                
                const emprestimoCompleto = {
                    ...emprestimo,
                    aluno_nome: dadosAluno?.nome || emprestimo.aluno_nome || emprestimo.nome_aluno || 'N/A',
                    ra_aluno: raAluno,
                    email: dadosAluno?.email || 'N/A',
                    telefone: dadosAluno?.telefone || 'N/A',
                    endereco: dadosAluno?.endereco || 'N/A'
                };
                
                emprestimosCompletos.push(emprestimoCompleto);
            } else {
                emprestimosCompletos.push({
                    ...emprestimo,
                    aluno_nome: emprestimo.aluno_nome || emprestimo.nome_aluno || 'N/A',
                    ra_aluno: 'N/A',
                    email: 'N/A',
                    telefone: 'N/A',
                    endereco: 'N/A'
                });
            }
        } catch (error) {
            console.error(`❌ Erro ao buscar dados do aluno para RA ${emprestimo.ra_aluno}:`, error);
            emprestimosCompletos.push({
                ...emprestimo,
                aluno_nome: emprestimo.aluno_nome || emprestimo.nome_aluno || 'N/A',
                ra_aluno: emprestimo.ra_aluno || emprestimo.ra || 'N/A',
                email: 'N/A',
                telefone: 'N/A',
                endereco: 'N/A'
            });
        }
    }
    
    return emprestimosCompletos;
}

// Função para extrair dados do aluno da resposta da API
function extrairDadosAluno(data) {
    if (data && typeof data === 'object' && data.nome) {
        return data;
    } else if (data && data.data && typeof data.data === 'object') {
        return data.data;
    }
    return null;
}

// PAGINAÇÃO PARA LIVROS DISPONÍVEIS
function resetarPaginacaoDisponiveis() {
    disponiveisExibidos = 0;
    atualizarBotaoCarregarMaisDisponiveis();
}

function exibirProximosDisponiveis() {
    const disponiveisParaExibir = disponiveisFiltradosAtuais.slice(
        disponiveisExibidos, 
        disponiveisExibidos + limiteItens
    );
    
    // Sempre limpar a tabela quando exibir novos dados
    preencherTabelaDisponiveis(disponiveisParaExibir, true);
    
    disponiveisExibidos += disponiveisParaExibir.length;
    atualizarBotaoCarregarMaisDisponiveis();
}

function adicionarDisponiveisATabela(disponiveis) {
    if (!corpoTabelaDisponiveis) return;
    
    disponiveis.forEach(livro => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${livro.titulo || livro.nome || 'N/A'}</td>
            <td>${livro.exemplares_disponiveis !== undefined ? livro.exemplares_disponiveis : 'N/A'}</td>
            <td>${livro.autor || 'N/A'}</td>
            <td>${livro.editora || 'N/A'}</td>
        `;
        corpoTabelaDisponiveis.appendChild(linha);
    });
}

function atualizarBotaoCarregarMaisDisponiveis() {
    if (!botaoCarregarMaisDisponiveis) return;
    
    const haMaisDisponiveis = disponiveisExibidos < disponiveisFiltradosAtuais.length;
    
    if (haMaisDisponiveis) {
        botaoCarregarMaisDisponiveis.style.display = 'flex';
        botaoCarregarMaisDisponiveis.disabled = false;
        botaoCarregarMaisDisponiveis.innerHTML = '<i class="fas fa-chevron-down"></i> Carregar Mais Livros';
    } else {
        botaoCarregarMaisDisponiveis.style.display = 'none';
    }
}

function carregarMaisDisponiveis() {
    if (botaoCarregarMaisDisponiveis) {
        botaoCarregarMaisDisponiveis.disabled = true;
        botaoCarregarMaisDisponiveis.innerHTML = '<span class="loading-spinner"></span> Carregando...';
    }
    
    setTimeout(() => {
        const disponiveisParaExibir = disponiveisFiltradosAtuais.slice(
            disponiveisExibidos, 
            disponiveisExibidos + limiteItens
        );
        
        adicionarDisponiveisATabela(disponiveisParaExibir);
        disponiveisExibidos += disponiveisParaExibir.length;
        atualizarBotaoCarregarMaisDisponiveis();
    }, 300);
}

// PAGINAÇÃO PARA EMPRÉSTIMOS
function resetarPaginacaoEmprestimos() {
    emprestimosExibidos = 0;
    atualizarBotaoCarregarMaisEmprestados();
}

function exibirProximosEmprestimos() {
    const emprestimosParaExibir = emprestimosFiltradosAtuais.slice(
        emprestimosExibidos, 
        emprestimosExibidos + limiteItens
    );
    
    // Sempre limpar a tabela quando exibir novos dados
    preencherTabelaEmprestados(emprestimosParaExibir, true);
    
    emprestimosExibidos += emprestimosParaExibir.length;
    atualizarBotaoCarregarMaisEmprestados();
}

function adicionarEmprestimosATabela(emprestimos) {
    if (!corpoTabelaEmprestados) return;
    
    emprestimos.forEach(emprestimo => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${emprestimo.livro_titulo || emprestimo.titulo || emprestimo.livro?.titulo || 'N/A'}</td>
            <td>${emprestimo.aluno_nome || 'N/A'}</td>
            <td>${emprestimo.ra_aluno || 'N/A'}</td>
            <td>${emprestimo.email || 'N/A'}</td>
            <td>${emprestimo.telefone || 'N/A'}</td>
            <td>${emprestimo.endereco || 'N/A'}</td>
        `;
        corpoTabelaEmprestados.appendChild(linha);
    });
}

function atualizarBotaoCarregarMaisEmprestados() {
    if (!botaoCarregarMaisEmprestados) return;
    
    const haMaisEmprestimos = emprestimosExibidos < emprestimosFiltradosAtuais.length;
    
    if (haMaisEmprestimos) {
        botaoCarregarMaisEmprestados.style.display = 'flex';
        botaoCarregarMaisEmprestados.disabled = false;
        botaoCarregarMaisEmprestados.innerHTML = '<i class="fas fa-chevron-down"></i> Carregar Mais Empréstimos';
    } else {
        botaoCarregarMaisEmprestados.style.display = 'none';
    }
}

function carregarMaisEmprestados() {
    if (botaoCarregarMaisEmprestados) {
        botaoCarregarMaisEmprestados.disabled = true;
        botaoCarregarMaisEmprestados.innerHTML = '<span class="loading-spinner"></span> Carregando...';
    }
    
    setTimeout(() => {
        const emprestimosParaExibir = emprestimosFiltradosAtuais.slice(
            emprestimosExibidos, 
            emprestimosExibidos + limiteItens
        );
        
        adicionarEmprestimosATabela(emprestimosParaExibir);
        emprestimosExibidos += emprestimosParaExibir.length;
        atualizarBotaoCarregarMaisEmprestados();
    }, 300);
}

// REALIZAR BUSCA
async function realizarBusca() {
    const termo = campoBusca.value.trim();
    
    if (!termo) {
        // Sem termo - mostrar todos os dados
        disponiveisFiltradosAtuais = [...todosLivrosDisponiveis];
        emprestimosFiltradosAtuais = [...todosEmprestimosAtivos];
        resetarPaginacaoDisponiveis();
        resetarPaginacaoEmprestimos();
        exibirProximosDisponiveis();
        exibirProximosEmprestimos();
        document.getElementById('tituloResultados').textContent = 'Busque o livro que desejar';
        return;
    }
    
    try {
        console.log(`🔍 Buscando por: ${termo}`);
        document.getElementById('tituloResultados').textContent = `LIVROS SOBRE "${termo.toUpperCase()}"`;
        
        // Filtrar livros disponíveis
        disponiveisFiltradosAtuais = todosLivrosDisponiveis.filter(livro => {
            const titulo = livro.titulo || livro.nome || '';
            const autor = livro.autor || '';
            const editora = livro.editora || '';
            
            return titulo.toLowerCase().includes(termo.toLowerCase()) ||
                   autor.toLowerCase().includes(termo.toLowerCase()) ||
                   editora.toLowerCase().includes(termo.toLowerCase());
        });
        
        // Filtrar empréstimos ativos
        emprestimosFiltradosAtuais = todosEmprestimosAtivos.filter(emprestimo => {
            const livroTitulo = emprestimo.livro_titulo || emprestimo.titulo || emprestimo.livro?.titulo || '';
            const alunoNome = emprestimo.aluno_nome || '';
            const raAluno = emprestimo.ra_aluno || '';
            
            return livroTitulo.toLowerCase().includes(termo.toLowerCase()) ||
                   alunoNome.toLowerCase().includes(termo.toLowerCase()) ||
                   raAluno.toString().includes(termo);
        });
        
        // Atualizar as tabelas
        resetarPaginacaoDisponiveis();
        resetarPaginacaoEmprestimos();
        exibirProximosDisponiveis();
        exibirProximosEmprestimos();
        
    } catch (error) {
        console.error('❌ Erro na busca:', error);
        alert('Erro na busca: ' + error.message);
    }
}

// Preencher tabela de livros disponíveis
function preencherTabelaDisponiveis(livros, limpar = true) {
    if (!corpoTabelaDisponiveis) return;
    
    if (limpar) {
        corpoTabelaDisponiveis.innerHTML = '';
    }
    
    if (!Array.isArray(livros) || livros.length === 0) {
        if (limpar) {
            corpoTabelaDisponiveis.innerHTML = `
                <tr>
                    <td colspan="4" class="mensagem-vazia">Nenhum livro disponível encontrado</td>
                </tr>
            `;
        }
        return;
    }
    
    livros.forEach(livro => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${livro.titulo || livro.nome || 'N/A'}</td>
            <td>${livro.exemplares_disponiveis !== undefined ? livro.exemplares_disponiveis : 'N/A'}</td>
            <td>${livro.autor || 'N/A'}</td>
            <td>${livro.editora || 'N/A'}</td>
        `;
        corpoTabelaDisponiveis.appendChild(linha);
    });
}

// Preencher tabela de empréstimos
function preencherTabelaEmprestados(emprestimos, limpar = true) {
    if (!corpoTabelaEmprestados) return;
    
    if (limpar) {
        corpoTabelaEmprestados.innerHTML = '';
    }
    
    if (!Array.isArray(emprestimos) || emprestimos.length === 0) {
        if (limpar) {
            corpoTabelaEmprestados.innerHTML = `
                <tr>
                    <td colspan="6" class="mensagem-vazia">Nenhum empréstimo ativo encontrado</td>
                </tr>
            `;
        }
        return;
    }
    
    emprestimos.forEach(emprestimo => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${emprestimo.livro_titulo || emprestimo.titulo || emprestimo.livro?.titulo || 'N/A'}</td>
            <td>${emprestimo.aluno_nome || 'N/A'}</td>
            <td>${emprestimo.ra_aluno || 'N/A'}</td>
            <td>${emprestimo.email || 'N/A'}</td>
            <td>${emprestimo.telefone || 'N/A'}</td>
            <td>${emprestimo.endereco || 'N/A'}</td>
        `;
        corpoTabelaEmprestados.appendChild(linha);
    });
}

console.log('✅ JavaScript do gerenciamento de livros carregado!');