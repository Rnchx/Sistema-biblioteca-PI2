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
        
        // CORREÇÃO: Carregar TODOS os empréstimos ativos do sistema
        const emprestados = await carregarTodosEmprestimosAtivos();
        exibirLivrosEmprestados(emprestados);
        
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        mostrarErro('Erro ao carregar dados dos livros');
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
        return data.success ? data.data : [];
        
    } catch (error) {
        console.error('Erro ao carregar exemplares disponíveis:', error);
        return [];
    }
}

// CORREÇÃO: Carregar TODOS os empréstimos ativos do sistema
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
                    <div class="exemplar-info">Exemplar #${livro.exemplar_id}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// CORREÇÃO: Exibir TODOS os livros emprestados do sistema
function exibirLivrosEmprestados(emprestimos) {
    const container = document.getElementById('livrosEmprestados');
    
    if (!emprestimos || emprestimos.length === 0) {
        container.innerHTML = '<div class="mensagem-vazia">Nenhum livro emprestado no momento</div>';
        return;
    }
    
    let html = '';
    emprestimos.forEach((emprestimo, index) => {
        const classeFundo = index % 2 === 0 ? 'fundoCinza' : 'fundoBranco';
        
        const isMeuEmprestimo = emprestimo.ra === alunoLogado.ra;
        const destaque = isMeuEmprestimo ? 'style="font-weight: bold; color: #1c4cff;"' : '';
        
        html += `
            <div class="linhaLivro ${classeFundo} livro-emprestado">
                <div class="info-livro">
                    <div class="titulo-livro" ${destaque}>${emprestimo.livro_titulo || 'Título não disponível'}</div>
                    <div class="autor-livro">${emprestimo.autor || 'Autor não disponível'}</div>
                    <div class="exemplar-info">Exemplar #${emprestimo.exemplar_id}</div>
                    <div class="exemplar-info" style="font-size: 10px; color: #6c757d;">
                        ${isMeuEmprestimo ? '<span style="color: #1c4cff; font-weight: bold">EMPRÉSTIMO FEITO POR VOCÊ</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
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

// Atualizar dados periodicamente (opcional)
function iniciarAtualizacaoAutomatica() {
    // Atualizar a cada 30 segundos
    setInterval(() => {
        if (alunoLogado) {
            carregarLivros();
        }
    }, 30000); // Alterado para 30 segundos
}

// Iniciar atualização automática (opcional)
iniciarAtualizacaoAutomatica();