// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
let nomeInput, raInput, telefoneInput, emailInput, enderecoInput, botaoCadastrar;

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    inicializarElementos();
    configurarEventos();
});

function inicializarElementos() {
    nomeInput = document.querySelector('input[placeholder*="Maria Fernanda"]');
    raInput = document.querySelector('input[placeholder*="2511111"]');
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
}

// Função principal de cadastro
async function cadastrarAluno() {
    // Coletar dados do formulário
    const alunoData = {
        nome: nomeInput.value.trim(),
        ra: raInput.value.trim(),
        telefone: telefoneInput.value.trim(),
        email: emailInput.value.trim(),
        endereco: enderecoInput.value.trim()
    };

    // Validações
    if (!validarFormulario(alunoData)) {
        return;
    }

    // Mostrar loading
    botaoCadastrar.textContent = 'CADASTRANDO...';
    botaoCadastrar.disabled = true;

    try {
        // Fazer requisição para a API
        const resultado = await fazerCadastro(alunoData);
        
        if (resultado.success) {
            cadastroSucesso(resultado);
        } else {
            cadastroFalhou(resultado.error);
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        cadastroFalhou('Erro de conexão com o servidor. Tente novamente.');
    } finally {
        // Restaurar botão
        botaoCadastrar.textContent = 'CADASTRAR';
        botaoCadastrar.disabled = false;
    }
}

// Validações do formulário
function validarFormulario(dados) {
    // Verificar campos obrigatórios
    if (!dados.nome || !dados.ra) {
        alert('Nome e RA são obrigatórios');
        return false;
    }

    // Validar RA (apenas números, mínimo 7 dígitos)
    const raRegex = /^\d+$/;
    if (!raRegex.test(dados.ra) || dados.ra.length < 7) {
        alert('RA deve conter apenas números e ter pelo menos 7 dígitos');
        raInput.focus();
        return false;
    }

    // Validar email (opcional, mas se preenchido deve ser válido)
    if (dados.email && !validarEmail(dados.email)) {
        alert('Por favor, insira um email válido');
        emailInput.focus();
        return false;
    }

    // Validar telefone (formato básico)
    if (dados.telefone && !validarTelefone(dados.telefone)) {
        alert('Por favor, insira um telefone válido');
        telefoneInput.focus();
        return false;
    }

    return true;
}

function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validarTelefone(telefone) {
    // Remove caracteres não numéricos e verifica se tem pelo menos 10 dígitos
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 10;
}

// Requisição para a API
async function fazerCadastro(alunoData) {
    try {
        // CPF é obrigatório no backend - vamos gerar um temporário baseado no RA
        // Em produção, você deve adicionar um campo CPF no formulário
        const cpfTemporario = gerarCpfTemporario(alunoData.ra);
        
        const dadosCompletos = {
            ...alunoData,
            cpf: cpfTemporario
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

// Gerar CPF temporário baseado no RA (para desenvolvimento)
function gerarCpfTemporario(ra) {
    // Em produção, substitua por um campo real de CPF no formulário
    return ra.padEnd(11, '0').substring(0, 11);
}

// Cadastro bem-sucedido
function cadastroSucesso(resultado) {
    alert(`✅ Cadastro realizado com sucesso!\n\nAluno: ${resultado.data.nome}\nRA: ${resultado.data.ra}`);
    
    // Limpar formulário
    limparFormulario();
    
    // Redirecionar para login após 2 segundos
    setTimeout(() => {
        window.location.href = './loginPage.html';
    }, 2000);
}

// Cadastro falhou
function cadastroFalhou(mensagemErro) {
    alert(`❌ Erro no cadastro:\n${mensagemErro}`);
    
    // Focar no campo problemático
    if (mensagemErro.includes('RA')) {
        raInput.focus();
    } else if (mensagemErro.includes('CPF')) {
        // Se tivesse campo CPF, focaria nele
        raInput.focus();
    }
}

// Limpar formulário
function limparFormulario() {
    nomeInput.value = '';
    raInput.value = '';
    telefoneInput.value = '';
    emailInput.value = '';
    enderecoInput.value = '';
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