const API_BASE_URL = 'http://localhost:3000';

let alunoLogado = null;

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar login e carregar dados
    alunoLogado = verificarLogin();
    
    if (alunoLogado) {
        inicializarPagina();
    }
});

// Verificação de login
function verificarLogin() {
    const alunoLogado = JSON.parse(sessionStorage.getItem('alunoLogado'));
    
    if (!alunoLogado || !alunoLogado.loggedIn) {
        alert('Você precisa fazer login para acessar esta página');
        window.location.href = './loginPage.html';
        return null;
    }
    
    // Verificar se a sessão expirou (8 horas)
    const tempoExpiracao = 8 * 60 * 60 * 1000;
    const tempoAtual = new Date().getTime();
    
    if (tempoAtual - alunoLogado.timestamp > tempoExpiracao) {
        alert('Sessão expirada. Faça login novamente.');
        sessionStorage.removeItem('alunoLogado');
        window.location.href = './loginPage.html';
        return null;
    }
    
    return alunoLogado;
}

// Inicializar página
function inicializarPagina() {
    // Adicionar informações do aluno no header
    adicionarInfoAlunoHeader(alunoLogado);
    
    // Carregar livros
    carregarLivros();
}

// Adicionar informações do aluno no header
function adicionarInfoAlunoHeader(aluno) {
    const faixaAzul = document.getElementById('containerFaixaAzul');
    if (faixaAzul) {
        const infoAluno = document.createElement('div');
        infoAluno.className = 'info-aluno-header';
        infoAluno.innerHTML = `
            <i class="fas fa-user" style="margin-right: 5px;"></i>
            ${aluno.nome} | RA: ${aluno.ra}
        `;
        faixaAzul.appendChild(infoAluno);
    }
}

// Carregar livros da API
async function carregarLivros() {
    try {
        // Carregar exemplares disponíveis
        const disponiveis = await carregarExemplaresDisponiveis();
        exibirLivrosDisponiveis(disponiveis);
        
        // Carregar TODOS os empréstimos ativos do sistema
        const emprestados = await carregarTodosEmprestimosAtivos();
        exibirLivrosEmprestados(emprestados);
        
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        mostrarErro('Erro ao carregar dados dos livros');
    }
}

// Função alternativa para carregar todos os exemplares e filtrar localmente
async function carregarExemplaresAlternativo() {
    try {
        // Buscar TODOS os exemplares
        const response = await fetch(`${API_BASE_URL}/exemplares`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            return [];
        }
        
        // Buscar TODOS os empréstimos ativos
        const responseEmprestimos = await fetch(`${API_BASE_URL}/emprestimos`);
        const emprestimosData = await responseEmprestimos.json();
        
        const emprestimosAtivos = emprestimosData.success ? 
            emprestimosData.data.filter(emp => emp.status === 'ativo') : [];
        
        // Filtrar exemplares disponíveis (não estão emprestados)
        const exemplaresDisponiveis = data.data.filter(exemplar => {
            return !emprestimosAtivos.some(emp => emp.exemplar_id === exemplar.id);
        });
        
        return exemplaresDisponiveis;
        
    } catch (error) {
        console.error('Erro no método alternativo:', error);
        return [];
    }
}

// Carregar exemplares disponíveis
async function carregarExemplaresDisponiveis() {
    try {
        const response = await fetch(`${API_BASE_URL}/exemplares/disponiveis`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Se não retornar dados, tentar método alternativo
        if (!data.success || !data.data || data.data.length === 0) {
            return await carregarExemplaresAlternativo();
        }
        
        return data.data;
        
    } catch (error) {
        console.error('Erro ao carregar exemplares disponíveis:', error);
        return await carregarExemplaresAlternativo();
    }
}

// Carregar TODOS os empréstimos ativos do sistema
async function carregarTodosEmprestimosAtivos() {
    try {
        const response = await fetch(`${API_BASE_URL}/emprestimos/ativos`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return data.success ? data.data : [];
        
    } catch (error) {
        console.error('Erro ao carregar todos os empréstimos ativos:', error);
        return [];
    }
}

// Exibir livros disponíveis
function exibirLivrosDisponiveis(livros) {
    const container = document.getElementById('livrosDisponiveis');
    
    if (!livros || livros.length === 0) {
        container.innerHTML = '<div class="mensagem-vazia">Nenhum livro disponível no momento</div>';
        return;
    }
    
    let html = '';
    livros.forEach((livro, index) => {
        const classeFundo = index % 2 === 0 ? 'fundoCinza' : 'fundoBranco';
        
        html += `
            <div class="linhaLivro ${classeFundo} livro-disponivel">
                <div class="info-livro">
                    <div class="titulo-livro">${livro.titulo || 'Título não disponível'}</div>
                    <div class="autor-livro">${livro.autor || 'Autor não disponível'}</div>
                    <div class="exemplar-info">Exemplar #${livro.exemplar_id || livro.id}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Exibir livros emprestados
function exibirLivrosEmprestados(emprestimos) {
    const container = document.getElementById('livrosEmprestados');
    
    if (!emprestimos || emprestimos.length === 0) {
        container.innerHTML = '<div class="mensagem-vazia">Nenhum livro emprestado no momento</div>';
        return;
    }
    
    // Agrupar empréstimos por exemplar para evitar duplicatas
    const emprestimosAgrupados = agruparEmprestimosPorExemplar(emprestimos);
    
    let html = '';
    emprestimosAgrupados.forEach((emprestimo, index) => {
        const classeFundo = index % 2 === 0 ? 'fundoCinza' : 'fundoBranco';
        
        const isMeuEmprestimo = emprestimo.ra === alunoLogado.ra;
        
        html += `
            <div class="linhaLivro ${classeFundo} livro-emprestado">
                <div class="info-livro">
                    <div class="titulo-livro" style="${isMeuEmprestimo ? 'font-weight: bold; color: #1c4cff;' : ''}">
                        ${emprestimo.livro_titulo || 'Título não disponível'}
                    </div>
                    <div class="autor-livro">${emprestimo.autor || 'Autor não disponível'}</div>
                    <div class="exemplar-info">Exemplar #${emprestimo.exemplar_id}</div>
                    ${isMeuEmprestimo ? 
                        '<div class="exemplar-info" style="color: #1c4cff; font-weight: bold">EMPRÉSTIMO FEITO POR VOCÊ</div>' : 
                        ''
                    }
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Agrupar empréstimos por exemplar para evitar duplicatas
function agruparEmprestimosPorExemplar(emprestimos) {
    const agrupados = [];
    const exemplaresProcessados = new Set();
    
    emprestimos.forEach(emprestimo => {
        const chaveExemplar = emprestimo.exemplar_id;
        
        if (!exemplaresProcessados.has(chaveExemplar)) {
            exemplaresProcessados.add(chaveExemplar);
            agrupados.push(emprestimo);
        }
    });
    
    return agrupados;
}

// Mostrar erro
function mostrarErro(mensagem) {
    const containers = [
        document.getElementById('livrosDisponiveis'),
        document.getElementById('livrosEmprestados')
    ];
    
    containers.forEach(container => {
        if (container) {
            container.innerHTML = `<div class="mensagem-vazia" style="color: #dc3545;">${mensagem}</div>`;
        }
    });
}

// Atualizar dados periodicamente
function iniciarAtualizacaoAutomatica() {
    // Atualizar a cada 30 segundos
    setInterval(() => {
        if (alunoLogado) {
            carregarLivros();
        }
    }, 30000);
}

// Iniciar atualização automática
iniciarAtualizacaoAutomatica();