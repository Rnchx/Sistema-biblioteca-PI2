// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
let nomeInput, raInput, cpfInput, telefoneInput, emailInput, enderecoInput, botaoCadastrar;

// Variável para controle de redirecionamento
let cadastroSucessoData = null;

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    inicializarElementos();
    configurarEventos();
    inicializarPopup(); // Inicializar o sistema de popup
});

function inicializarElementos() {
    nomeInput = document.querySelector('input[placeholder*="Maria Fernanda"]');
    raInput = document.querySelector('input[placeholder*="2511111"]');
    cpfInput = document.querySelector('input[placeholder*="123.456.789-00"]');
    telefoneInput = document.querySelector('input[placeholder*="(11) 1 1111"]');
    emailInput = document.querySelector('input[placeholder*="mariafernanda01"]');
    enderecoInput = document.querySelector('input[placeholder*="Rua Joaquim Alves"]');
    botaoCadastrar = document.getElementById('botaoFormulario');
}

function configurarEventos() {
    if (botaoCadastrar) {
        botaoCadastrar.addEventListener('click', cadastrarAluno);
    }
    
    // Enter nos inputs também submete o formulário
    const inputs = document.querySelectorAll('.inputsFormulario');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                cadastrarAluno();
            }
        });
    });
    
    // Formatação automática do CPF
    if (cpfInput) {
        cpfInput.addEventListener('input', formatarCPF);
    }
    
    // Formatação automática do telefone
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatarTelefone);
    }
}

// Sistema de Popup (igual ao login)
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
        // Se tiver dados de cadastro bem-sucedido, redirecionar
        if (cadastroSucessoData) {
            redirecionarParaLogin();
        }
    });
    
    // Fechar popup clicando fora
    document.getElementById('popupOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharPopup();
            // Se tiver dados de cadastro bem-sucedido, redirecionar mesmo clicando fora
            if (cadastroSucessoData) {
                redirecionarParaLogin();
            }
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharPopup();
            // Se tiver dados de cadastro bem-sucedido, redirecionar mesmo com ESC
            if (cadastroSucessoData) {
                redirecionarParaLogin();
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
            if (focarInput === 'ra') raInput.focus();
            if (focarInput === 'cpf') cpfInput.focus();
            if (focarInput === 'email') emailInput.focus();
            if (focarInput === 'telefone') telefoneInput.focus();
        }, 300);
    }
}

function fecharPopup() {
    const overlay = document.getElementById('popupOverlay');
    overlay.style.display = 'none';
}

function redirecionarParaLogin() {
    window.location.href = './loginPage.html';
}

// Função principal de cadastro
async function cadastrarAluno() {
    // Coletar dados do formulário
    const alunoData = {
        nome: nomeInput.value.trim(),
        ra: raInput.value.trim(),
        cpf: cpfInput.value.trim(),
        telefone: telefoneInput.value.trim(),
        email: emailInput.value.trim(),
        endereco: enderecoInput.value.trim()
    };

    // Validações
    if (!validarFormulario(alunoData)) {
        return;
    }

    // Mostrar loading no botão
    botaoCadastrar.innerHTML = '<span class="loading-spinner"></span>CADASTRANDO...';
    botaoCadastrar.disabled = true;

    try {
        // Fazer requisição para a API
        const resultado = await fazerCadastro(alunoData);
        
        if (resultado.success) {
            await cadastroSucesso(resultado);
        } else {
            cadastroFalhou(resultado.error);
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        cadastroFalhou('Erro de conexão com o servidor. Tente novamente.');
    } finally {
        // Restaurar botão
        botaoCadastrar.innerHTML = 'CADASTRAR';
        botaoCadastrar.disabled = false;
    }
}

// Validações do formulário
function validarFormulario(dados) {
    // Verificar campos obrigatórios
    if (!dados.nome || !dados.ra || !dados.cpf) {
        mostrarPopup('error', 'Campos obrigatórios', 'Nome, RA e CPF são obrigatórios');
        return false;
    }

    // Validar RA (apenas números, mínimo 7 dígitos)
    const raRegex = /^\d+$/;
    if (!raRegex.test(dados.ra) || dados.ra.length < 7) {
        mostrarPopup('error', 'RA inválido', 'RA deve conter apenas números e ter pelo menos 7 dígitos', 'ra');
        return false;
    }

    // Validar CPF (11 dígitos)
    const cpfLimpo = dados.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        mostrarPopup('error', 'CPF inválido', 'CPF deve conter 11 dígitos', 'cpf');
        return false;
    }

    // Validar email
    if (dados.email && !validarEmail(dados.email)) {
        mostrarPopup('error', 'Email inválido', 'Por favor, insira um email válido', 'email');
        return false;
    }

    // Validar telefone
    if (dados.telefone && !validarTelefone(dados.telefone)) {
        mostrarPopup('error', 'Telefone inválido', 'Por favor, insira um telefone válido com DDD', 'telefone');
        return false;
    }

    return true;
}

function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 10 && numeros.length <= 11;
}

// Requisição para a API
async function fazerCadastro(alunoData) {
    try {
        // Limpar CPF para enviar apenas números
        const dadosCompletos = {
            ...alunoData,
            cpf: alunoData.cpf.replace(/\D/g, '')
        };

        const response = await fetch(`${API_BASE_URL}/alunos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosCompletos)
        });

        return await response.json();
        
    } catch (error) {
        throw new Error('Erro na comunicação com o servidor');
    }
}

// Cadastro bem-sucedido
async function cadastroSucesso(resultado) {
    // Armazenar dados para redirecionamento posterior
    cadastroSucessoData = resultado.data;
    
    // Limpar formulário
    limparFormulario();
    
    // Mostrar popup de sucesso
    mostrarPopup('success', 'Cadastro realizado!', 
        `Aluno cadastrado com sucesso!\n\nNome: ${resultado.data.nome}\nRA: ${resultado.data.ra}`);
}

// Cadastro falhou
function cadastroFalhou(mensagemErro) {
    mostrarPopup('error', 'Erro no cadastro', mensagemErro, 'ra');
}

// Limpar formulário
function limparFormulario() {
    nomeInput.value = '';
    raInput.value = '';
    cpfInput.value = '';
    telefoneInput.value = '';
    emailInput.value = '';
    enderecoInput.value = '';
}

// Formatar CPF automaticamente
function formatarCPF(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    input.value = value;
}

// Formatar telefone automaticamente
function formatarTelefone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    input.value = value;
}