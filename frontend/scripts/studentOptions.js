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
        botaoLivros.href = '../studentProgramPages/consultBooks.html';
    }
    
    if (botaoPontuacao) {
        botaoPontuacao.href = '../studentProgramPages/checkReadingScore.html';
    }
}

// FUNÇÃO DE LOGOUT
function logout() {
    sessionStorage.removeItem('alunoLogado');
    window.location.href = '../studentProgramPages/loginPage.html';
}

// CONFIGURAR BOTÃO DE LOGOUT COM POPUP
function configurarBotaoLogout() {
    const botaoLogout = document.getElementById('botaoLogout');
    const containerLogout = document.getElementById('containerBotaoLogout');
    
    if (botaoLogout && containerLogout) {
        botaoLogout.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Mostrar popup de confirmação
            mostrarPopupLogout();
        });
        
        // Efeito hover com tooltip
        containerLogout.title = "Clique para sair do sistema";
    }
}

// SISTEMA DE POPUP PARA LOGOUT
function mostrarPopupLogout() {
    const overlay = document.getElementById('popupOverlay');
    const container = document.getElementById('popupContainer');
    const icon = document.getElementById('popupIcon');
    const title = document.getElementById('popupTitle');
    const message = document.getElementById('popupMessage');
    const cancelButton = document.getElementById('popupButtonCancel');
    const confirmButton = document.getElementById('popupButtonConfirm');
    
    // Configurar conteúdo do popup
    container.className = 'popup-container popup-warning';
    icon.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    title.textContent = 'Confirmar Saída';
    message.textContent = 'Deseja realmente sair do sistema?';
    
    // Remover event listeners anteriores para evitar duplicação
    const newCancelButton = cancelButton.cloneNode(true);
    const newConfirmButton = confirmButton.cloneNode(true);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    
    // Configurar botão Cancelar
    newCancelButton.addEventListener('click', function() {
        fecharPopup();
    });
    
    // Configurar botão Confirmar
    newConfirmButton.addEventListener('click', function() {
        executarLogout();
    });
    
    // Mostrar popup
    overlay.style.display = 'flex';
    
    // Fechar popup clicando fora
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            fecharPopup();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', function fecharComESC(e) {
        if (e.key === 'Escape') {
            fecharPopup();
            document.removeEventListener('keydown', fecharComESC);
        }
    });
}

function fecharPopup() {
    const overlay = document.getElementById('popupOverlay');
    overlay.style.display = 'none';
}

function executarLogout() {
    const botaoLogout = document.getElementById('botaoLogout');
    const containerLogout = document.getElementById('containerBotaoLogout');
    
    // Animação de loading no botão do popup
    const confirmButton = document.getElementById('popupButtonConfirm');
    const textoOriginal = confirmButton.innerHTML;
    confirmButton.innerHTML = '<span class="loading-spinner"></span>Saindo...';
    confirmButton.disabled = true;
    
    // Animação de loading no botão principal (opcional)
    if (botaoLogout) {
        const textoPrincipal = botaoLogout.querySelector('.texto-botao-logout');
        const iconePrincipal = botaoLogout.querySelector('.icone-logout');
        
        if (textoPrincipal && iconePrincipal) {
            textoPrincipal.innerHTML = 'Saindo...';
            iconePrincipal.className = 'fas fa-spinner icone-logout fa-spin';
        }
        containerLogout.style.pointerEvents = 'none';
    }
    
    // Logout após 1 segundo (para ver a animação)
    setTimeout(() => {
        logout();
    }, 1000);
}

// FUNÇÃO DE LOGOUT (mantida igual)
function logout() {
    sessionStorage.removeItem('alunoLogado');
    window.location.href = '../studentProgramPages/loginPage.html';
}

// INICIALIZAÇÃO DA PÁGINA (mantida igual)
document.addEventListener('DOMContentLoaded', function() {
    // ✅ VERIFICAÇÃO DE LOGIN SEMPRE NO INÍCIO
    const aluno = verificarLogin();
    
    if (aluno) {
        console.log(`✅ Aluno logado: ${aluno.nome} (RA: ${aluno.ra})`);

        // ✅ Atualizar interface com dados reais
        atualizarDadosAluno(aluno);

        // ✅ Configurar links dos botões
        configurarLinks(aluno);

        // ✅ Configurar botão de logout (SUBSTITUIU O VOLTAR)
        configurarBotaoLogout();

        // ✅ Adicionar informações do aluno no header (opcional)
        adicionarInfoAlunoHeader(aluno);
    }
});

// INFORMACÕES DO ALUNO NO HEADER
function adicionarInfoAlunoHeader(aluno) {
    const faixaAzul = document.getElementById('containerFaixaAzul');
    if (faixaAzul) {
        const infoAluno = document.createElement('div');
        infoAluno.innerHTML = `
            <span style="color: white; font-family: 'Public Sans', sans-serif; font-size: 0.9rem;">
                <i class="fas fa-user" style="margin-right: 5px;"></i>
                ${aluno.nome} | RA: ${aluno.ra}
            </span>
        `;
        infoAluno.style.cssText = `
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255,255,255,0.1);
            padding: 5px 12px;
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.2);
        `;
        
        faixaAzul.style.position = 'relative';
        faixaAzul.appendChild(infoAluno);
    }
}

// DETECTAR INATIVIDADE PARA LOGOUT AUTOMÁTICO
function configurarLogoutPorInatividade() {
    let tempoInatividade;
    
    function resetarTempo() {
        clearTimeout(tempoInatividade);
        // Logout após 30 minutos de inatividade
        tempoInatividade = setTimeout(() => {
            if (confirm('Sua sessão expirou por inatividade. Deseja continuar?')) {
                resetarTempo();
            } else {
                logout();
            }
        }, 30 * 60 * 1000); // 30 minutos
    }
    
    // Eventos que resetam o tempo de inatividade
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evento => {
        document.addEventListener(evento, resetarTempo);
    });
    
    resetarTempo();
}

// Iniciar detecção de inatividade (opcional)
// configurarLogoutPorInatividade();