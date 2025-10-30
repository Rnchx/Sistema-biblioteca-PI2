document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const loginForm = document.querySelector('#containerLabelsInputs');
    const raInput = document.querySelector('.inputsFormulario');
    const entrarBtn = document.querySelector('#botaoFormulario');
    
    // URL da sua API
    const API_BASE_URL = 'http://localhost:3000';
    
    // Variável para armazenar dados do aluno logado
    let alunoLogadoData = null;
    
    // Inicializar sistema de popup
    inicializarPopup();
    
    // Evento de clique no botão ENTRAR
    entrarBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const ra = raInput.value.trim();
        
        // Validação básica
        if (!ra) {
            mostrarPopup('error', 'Campo obrigatório', 'Por favor, digite seu RA');
            return;
        }
        
        if (!validarRA(ra)) {
            mostrarPopup('error', 'RA inválido', 'RA deve conter apenas números (ex: 25003959)');
            return;
        }
        
        // Mostrar loading no botão
        entrarBtn.innerHTML = '<span class="loading-spinner"></span>ENTRANDO...';
        entrarBtn.disabled = true;
        
        try {
            // Verificar se aluno existe
            const aluno = await verificarAluno(ra);
            
            if (aluno) {
                // Login bem-sucedido
                await loginSucesso(aluno);
            } else {
                // Aluno não encontrado
                mostrarPopup('error', 'RA não encontrado', 'Verifique o número ou faça cadastro.', true);
            }
            
        } catch (error) {
            console.error('Erro no login:', error);
            mostrarPopup('error', 'Erro de conexão', 'Erro ao conectar com o servidor. Tente novamente.', true);
        } finally {
            // Restaurar botão
            entrarBtn.innerHTML = 'ENTRAR';
            entrarBtn.disabled = false;
        }
    });
    
    // Sistema de Popup
    function inicializarPopup() {
        const popupHTML = `
            <div class="popup-overlay" id="popupOverlay">
                <div class="popup-container" id="popupContainer">
                    <div class="popup-icon" id="popupIcon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2 class="popup-title" id="popupTitle">Título</h2>
                    <p class="popup-message" id="popupMessage">Mensagem</p>
                    <div class="popup-buttons" id="popupButtons">
                        <button class="popup-button" id="popupButtonOk">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        
        // Configurar evento do botão OK
        document.getElementById('popupButtonOk').addEventListener('click', function() {
            fecharPopup();
            // Se tiver dados de aluno logado, redirecionar
            if (alunoLogadoData) {
                redirecionarParaHome();
            }
        });
        
        // Fechar popup clicando fora
        document.getElementById('popupOverlay').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharPopup();
                // Se tiver dados de aluno logado, redirecionar mesmo clicando fora
                if (alunoLogadoData) {
                    redirecionarParaHome();
                }
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                fecharPopup();
                // Se tiver dados de aluno logado, redirecionar mesmo com ESC
                if (alunoLogadoData) {
                    redirecionarParaHome();
                }
            }
        });
    }
    
    function mostrarPopup(tipo, titulo, mensagem, focarInput = false) {
        const overlay = document.getElementById('popupOverlay');
        const container = document.getElementById('popupContainer');
        const icon = document.getElementById('popupIcon');
        const title = document.getElementById('popupTitle');
        const message = document.getElementById('popupMessage');
        
        // Configurar estilo baseado no tipo
        container.className = 'popup-container';
        if (tipo === 'success') {
            container.classList.add('popup-success');
            icon.innerHTML = '<i class="fas fa-check-circle"></i>';
        } else if (tipo === 'error') {
            container.classList.add('popup-error');
            icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        }
        
        // Configurar conteúdo
        title.textContent = titulo;
        message.textContent = mensagem;
        
        // Mostrar popup
        overlay.style.display = 'flex';
        
        // Focar no input se especificado
        if (focarInput) {
            setTimeout(() => {
                raInput.focus();
                raInput.select();
            }, 300);
        }
    }
    
    function fecharPopup() {
        const overlay = document.getElementById('popupOverlay');
        overlay.style.display = 'none';
    }
    
    function redirecionarParaHome() {
        window.location.href = '../studentProgramPages/optionsPage.html';
    }
    
    // Validar formato do RA
    function validarRA(ra) {
        const raRegex = /^\d+$/;
        return raRegex.test(ra) && ra.length >= 7;
    }
    
    // Verificar se aluno existe na API
    async function verificarAluno(ra) {
        try {
            const response = await fetch(`${API_BASE_URL}/alunos/ra/${ra}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data.success ? data.data : null;
            
        } catch (error) {
            console.error('Erro ao verificar aluno:', error);
            throw error;
        }
    }
    
    // Login bem-sucedido
    async function loginSucesso(aluno) {
        // Salvar dados do aluno
        sessionStorage.setItem('alunoLogado', JSON.stringify({
            id: aluno.id,
            nome: aluno.nome,
            ra: aluno.ra,
            loggedIn: true,
            timestamp: new Date().getTime()
        }));
        
        // Armazenar dados para redirecionamento posterior
        alunoLogadoData = aluno;
        
        // Mostrar popup de sucesso (NÃO redireciona automaticamente)
        mostrarPopup('success', 'Login realizado!', `Bem-vindo, ${aluno.nome}!`);
        
        // REMOVI o setTimeout que redirecionava automaticamente
        // Agora só redireciona quando o usuário clicar no OK
    }
    
    // Enter no input também submete o formulário
    raInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            entrarBtn.click();
        }
    });
    
    // Focar no input ao carregar a página
    raInput.focus();
});