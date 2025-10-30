// VERIFICAÇÃO DE LOGIN
function verificarLogin() {
    const alunoLogado = JSON.parse(sessionStorage.getItem('alunoLogado'));
    
    if (!alunoLogado || !alunoLogado.loggedIn) {
        alert('Você precisa fazer login para acessar esta página');
        window.location.href = '../studentProgramPages/loginPage.html';
        return null;
    }
    
    // Verificar se a sessão expirou (8 horas)
    const tempoExpiracao = 8 * 60 * 60 * 1000;
    const tempoAtual = new Date().getTime();
    
    if (tempoAtual - alunoLogado.timestamp > tempoExpiracao) {
        alert('Sessão expirada. Faça login novamente.');
        sessionStorage.removeItem('alunoLogado');
        window.location.href = '../studentProgramPages/loginPage.html';
        return null;
    }
    
    return alunoLogado;
}

// ATUALIZAR INTERFACE COM DADOS DO ALUNO
function atualizarDadosAluno(aluno) {
    const elementoNome = document.querySelector('#containerFormulario h1');
    const elementoRA = document.querySelector('#containerFormulario h4');
    
    if (elementoNome) {
        elementoNome.textContent = aluno.nome;
    }
    
    if (elementoRA) {
        elementoRA.textContent = `RA: ${aluno.ra}`;
    }
}

// CONFIGURAR LINKS DOS BOTÕES
function configurarLinks(aluno) {
    const botaoLivros = document.querySelector('#containerBotoesFormulario a:first-child');
    const botaoPontuacao = document.querySelector('#containerBotoesFormulario a:last-child');
    
    if (botaoLivros) {
        // Ajustado para a página de consulta de livros no studentProgramPages
        botaoLivros.href = '../studentProgramPages/consultBooks.html';
    }
    
    if (botaoPontuacao) {
        // Ajustado para a página de pontuação de leitura no studentProgramPages
        botaoPontuacao.href = '../studentProgramPages/checkReadingScore.html';
    }
}

// FUNÇÃO DE LOGOUT
function logout() {
    sessionStorage.removeItem('alunoLogado');
    window.location.href = '../studentProgramPages/loginPage.html';
}

// BOTÃO VOLTAR COM LOGOUT
function configurarBotaoVoltar() {
    const botaoVoltar = document.getElementById('botaoVoltarPagina');
    if (botaoVoltar) {
        // Remove o link atual e adiciona logout
        const link = botaoVoltar.querySelector('a');
        if (link) {
            link.removeAttribute('href');
            link.onclick = function(e) {
                e.preventDefault();
                if (confirm('Deseja realmente sair do sistema?')) {
                    logout();
                }
            };
        }
    }
}

// INICIALIZAÇÃO DA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    // ✅ VERIFICAÇÃO DE LOGIN SEMPRE NO INÍCIO
    const aluno = verificarLogin();
    
    if (aluno) {
        console.log(`✅ Aluno logado: ${aluno.nome} (RA: ${aluno.ra})`);

        atualizarDadosAluno(aluno);

        configurarLinks(aluno);

        configurarBotaoVoltar();

        adicionarBotaoLogout();
    }
});

// BOTÃO LOGOUT NO HEADER (OPCIONAL) -> para implementar futuramente talvez
function adicionarBotaoLogout() {
    const faixaAzul = document.getElementById('containerFaixaAzul');
    if (faixaAzul) {
        const botaoLogout = document.createElement('button');
        botaoLogout.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Sair';
        botaoLogout.style.cssText = `
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 5px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-family: "Public Sans", sans-serif;
            font-size: 0.8rem;
            transition: all 0.3s ease;
        `;
        botaoLogout.onmouseover = function() {
            this.style.background = 'rgba(255,255,255,0.3)';
        };
        botaoLogout.onmouseout = function() {
            this.style.background = 'rgba(255,255,255,0.2)';
        };
        botaoLogout.onclick = function() {
            if (confirm('Deseja realmente sair do sistema?')) {
                logout();
            }
        };
        
        faixaAzul.style.position = 'relative';
        faixaAzul.appendChild(botaoLogout);
    }
}