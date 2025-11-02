// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
let nomeInput, raInput, cpfInput, telefoneInput, emailInput, enderecoInput, botaoCadastrar;

// Variável para controle de redirecionamento
let cadastroSucessoData = null;

// Cache para verificação em tempo real
let dadosVerificados = {
    ra: { valor: '', disponivel: true },
    cpf: { valor: '', disponivel: true },
    telefone: { valor: '', disponivel: true },
    email: { valor: '', disponivel: true }
};

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    inicializarElementos();
    configurarEventos();
    inicializarPopup();
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
        cpfInput.addEventListener('input', function(e) {
            formatarCPF(this);
        });
        
        cpfInput.addEventListener('blur', function(e) {
            formatarCPF(this);
        });
        
        // Adicionar verificação de duplicação apenas quando o campo estiver completo
        cpfInput.addEventListener('change', function(e) {
            const cpfLimpo = this.value.replace(/\D/g, '');
            if (cpfLimpo.length === 11) {
                verificarDuplicacao('cpf', this.value);
            }
        });
    }
    
    // FORMATAÇÃO E VALIDAÇÃO ROBUSTA DO TELEFONE - CORRIGIDA
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            formatarTelefone(this);
            
            // Validação em tempo real para números completos
            const telefoneLimpo = this.value.replace(/\D/g, '');
            if (telefoneLimpo.length === 10 || telefoneLimpo.length === 11) {
                const validacao = validarTelefoneCompleto(this.value);
                if (!validacao.valido) {
                    this.style.borderColor = '#dc3545';
                    this.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                    this.title = validacao.mensagem;
                }
            }
        });
        
        telefoneInput.addEventListener('blur', function(e) {
            formatarTelefone(this);
            
            // Verificação de duplicação apenas se o telefone for válido e completo
            const telefoneLimpo = this.value.replace(/\D/g, '');
            const validacao = validarTelefoneCompleto(this.value);
            
            if (validacao.valido) {
                verificarDuplicacao('telefone', this.value);
            }
        });
        
        // Adicionar placeholder dinâmico
        telefoneInput.addEventListener('focus', function(e) {
            const telefoneLimpo = this.value.replace(/\D/g, '');
            if (telefoneLimpo.length === 0) {
                this.placeholder = '(11) 91234-5678 (exemplo)';
            }
        });
    }
    
    // Validação em tempo real do RA
    if (raInput) {
        raInput.addEventListener('input', function(e) {
            // Permitir apenas números
            this.value = this.value.replace(/\D/g, '');
            
            // Limitar a exatamente 8 caracteres
            if (this.value.length > 8) {
                this.value = this.value.substring(0, 8);
            }
            
            // Adicionar feedback visual
            atualizarFeedbackRA(this.value);
        });
        
        // Validar quando perde o foco
        raInput.addEventListener('blur', function(e) {
            if (this.value.length === 8) {
                verificarDuplicacao('ra', this.value);
            }
        });
    }
    
    // Validação em tempo real do email
    if (emailInput) {
        emailInput.addEventListener('blur', function(e) {
            const valor = this.value.trim();
            if (valor && validarEmailPUC(valor)) {
                verificarDuplicacao('email', valor);
            }
        });
        
        emailInput.addEventListener('input', function(e) {
            const valor = this.value.trim();
            if (valor && validarEmailPUC(valor)) {
                this.style.borderColor = '#28a745';
                this.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
            } else if (valor && !validarEmailPUC(valor)) {
                this.style.borderColor = '#dc3545';
                this.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
            } else {
                this.style.borderColor = '#e9ecef';
                this.style.boxShadow = 'none';
            }
        });
    }
    
    // Validação em tempo real do nome
    if (nomeInput) {
        nomeInput.addEventListener('blur', function(e) {
            const valor = this.value.trim();
            atualizarFeedbackNome(valor);
        });
        
        nomeInput.addEventListener('input', function(e) {
            const valor = this.value.trim();
            if (valor.length >= 3) {
                this.style.borderColor = '#28a745';
                this.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
            } else if (valor.length > 0) {
                this.style.borderColor = '#ffc107';
                this.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
            } else {
                this.style.borderColor = '#e9ecef';
                this.style.boxShadow = 'none';
            }
        });
    }
    
    // Validação em tempo real do endereço
    if (enderecoInput) {
        enderecoInput.addEventListener('blur', function(e) {
            const valor = this.value.trim();
            atualizarFeedbackEndereco(valor);
        });
        
        enderecoInput.addEventListener('input', function(e) {
            const valor = this.value.trim();
            if (valor.length >= 5) {
                this.style.borderColor = '#28a745';
                this.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
            } else if (valor.length > 0) {
                this.style.borderColor = '#ffc107';
                this.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
            } else {
                this.style.borderColor = '#e9ecef';
                this.style.boxShadow = 'none';
            }
        });
    }
}

// VALIDAÇÃO ROBUSTA DE TELEFONE - CORRIGIDA
function validarTelefoneCompleto(telefone) {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    
    // Verificar se tem pelo menos 10 dígitos (DDD + número)
    if (telefoneLimpo.length < 10) {
        return {
            valido: false,
            mensagem: 'Telefone deve ter pelo menos 10 dígitos (DDD + número)'
        };
    }
    
    // Verificar se tem mais de 11 dígitos
    if (telefoneLimpo.length > 11) {
        return {
            valido: false,
            mensagem: 'Telefone deve ter no máximo 11 dígitos'
        };
    }
    
    // Validar DDD (deve ser entre 11 e 99)
    const ddd = telefoneLimpo.substring(0, 2);
    if (ddd < 11 || ddd > 99) {
        return {
            valido: false,
            mensagem: 'DDD inválido. Deve ser entre 11 e 99'
        };
    }
    
    // Validar formato do número
    const numero = telefoneLimpo.substring(2);
    
    // Para telefones de 8 dígitos (formato antigo - fixo)
    if (telefoneLimpo.length === 10) {
        if (!/^[2-5]\d{7}$/.test(numero)) {
            return {
                valido: false,
                mensagem: 'Número de telefone fixo inválido'
            };
        }
    }
    
    // Para telefones de 9 dígitos (formato atual - celular)
    if (telefoneLimpo.length === 11) {
        if (!/^9[6-9]\d{7}$/.test(numero)) {
            return {
                valido: false,
                mensagem: 'Número de celular inválido. Deve começar com 9 e ter 9 dígitos'
            };
        }
    }
    
    return {
        valido: true,
        telefoneLimpo: telefoneLimpo,
        formato: telefoneLimpo.length === 10 ? 'FIXO' : 'CELULAR'
    };
}

// Formatar CPF automaticamente
function formatarCPF(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    // Aplicar máscara
    if (value.length <= 11) {
        if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        }
    }
    
    input.value = value;
    
    // Feedback visual
    const cpfLimpo = value.replace(/\D/g, '');
    if (cpfLimpo.length === 11) {
        input.style.borderColor = '#28a745';
        input.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
    } else if (cpfLimpo.length > 0) {
        input.style.borderColor = '#ffc107';
        input.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
    } else {
        input.style.borderColor = '#e9ecef';
        input.style.boxShadow = 'none';
    }
}

// FORMATAÇÃO DO TELEFONE COM VALIDAÇÃO - CORRIGIDA
function formatarTelefone(input) {
    let value = input.value.replace(/\D/g, '');
    
    // Limitar a 11 dígitos
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    // Aplicar máscara baseada no tamanho
    let valorFormatado = value;
    if (value.length > 0) {
        if (value.length <= 2) {
            valorFormatado = value.replace(/(\d{0,2})/, '($1');
        } else if (value.length <= 6) {
            valorFormatado = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
        } else if (value.length <= 10) {
            valorFormatado = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            valorFormatado = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
    }
    
    input.value = valorFormatado;
    
    // Feedback visual com validação completa - CORREÇÃO APLICADA AQUI
    const telefoneLimpo = value.replace(/\D/g, '');
    
    if (telefoneLimpo.length === 0) {
        input.style.borderColor = '#e9ecef';
        input.style.boxShadow = 'none';
        input.title = '';
    } else if (telefoneLimpo.length < 10) {
        // Telefone incompleto - mostrar mensagem de mínimo de dígitos
        input.style.borderColor = '#ffc107';
        input.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
        input.title = `Telefone incompleto (mínimo 10 dígitos). Faltam ${10 - telefoneLimpo.length} dígitos`;
    } else {
        // Telefone tem dígitos suficientes, validar formato
        const validacao = validarTelefoneCompleto(valorFormatado);
        
        if (validacao.valido) {
            input.style.borderColor = '#28a745';
            input.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
            input.title = `Telefone ${validacao.formato} válido`;
        } else {
            // Telefone tem dígitos suficientes mas é inválido
            input.style.borderColor = '#dc3545';
            input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
            input.title = validacao.mensagem || 'Telefone inválido';
        }
    }
}

// Verificar duplicação em tempo real
async function verificarDuplicacao(campo, valor) {
    if (!valor || valor.length === 0) return;
    
    try {
        // Limpar valor para busca (remover formatação)
        let valorLimpo = valor;
        if (campo === 'cpf') {
            valorLimpo = valor.replace(/\D/g, '');
        } else if (campo === 'telefone') {
            // PARA TELEFONE: usar a validação completa
            const validacao = validarTelefoneCompleto(valor);
            if (!validacao.valido) return;
            valorLimpo = validacao.telefoneLimpo;
        }
        
        // Verificar se o campo está completo antes de fazer a requisição
        if (campo === 'cpf' && valorLimpo.length !== 11) return;
        if (campo === 'telefone' && (valorLimpo.length !== 10 && valorLimpo.length !== 11)) return;
        if (campo === 'ra' && valorLimpo.length !== 8) return;
        if (campo === 'email' && !validarEmailPUC(valor)) return;
        
        const response = await fetch(`${API_BASE_URL}/alunos/verificar-${campo}/${valorLimpo}`);
        
        if (!response.ok) {
            throw new Error('Erro na verificação');
        }
        
        const resultado = await response.json();
        
        // Atualizar cache e interface
        dadosVerificados[campo] = {
            valor: valor,
            disponivel: !resultado.existe
        };
        
        // Atualizar feedback visual
        atualizarFeedbackDuplicacao(campo, !resultado.existe);
        
    } catch (error) {
        console.error(`Erro ao verificar ${campo}:`, error);
        // Em caso de erro, assumir que está disponível para não bloquear o usuário
        dadosVerificados[campo] = {
            valor: valor,
            disponivel: true
        };
    }
}

// Funções auxiliares para feedback visual
function atualizarFeedbackRA(valor) {
    if (valor.length === 8) {
        if (dadosVerificados.ra.valor === valor && !dadosVerificados.ra.disponivel) {
            raInput.style.borderColor = '#dc3545';
            raInput.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
        } else {
            raInput.style.borderColor = '#28a745';
            raInput.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
        }
    } else if (valor.length > 0) {
        raInput.style.borderColor = '#ffc107';
        raInput.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
    } else {
        raInput.style.borderColor = '#e9ecef';
        raInput.style.boxShadow = 'none';
    }
}

function atualizarFeedbackNome(valor) {
    if (valor && valor.length >= 3) {
        nomeInput.style.borderColor = '#28a745';
        nomeInput.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
    } else if (valor && valor.length > 0) {
        nomeInput.style.borderColor = '#ffc107';
        nomeInput.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
    } else {
        nomeInput.style.borderColor = '#e9ecef';
        nomeInput.style.boxShadow = 'none';
    }
}

function atualizarFeedbackEndereco(valor) {
    if (valor && valor.length >= 5) {
        enderecoInput.style.borderColor = '#28a745';
        enderecoInput.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
    } else if (valor && valor.length > 0) {
        enderecoInput.style.borderColor = '#ffc107';
        enderecoInput.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
    } else {
        enderecoInput.style.borderColor = '#e9ecef';
        enderecoInput.style.boxShadow = 'none';
    }
}

function atualizarFeedbackDuplicacao(campo, disponivel) {
    let input;
    switch (campo) {
        case 'ra':
            input = raInput;
            break;
        case 'cpf':
            input = cpfInput;
            break;
        case 'telefone':
            input = telefoneInput;
            break;
        case 'email':
            input = emailInput;
            break;
        default:
            return;
    }
    
    if (!input) return;
    
    const valor = input.value.trim();
    if (!valor) {
        input.style.borderColor = '#e9ecef';
        input.style.boxShadow = 'none';
        return;
    }
    
    if (!disponivel) {
        input.style.borderColor = '#dc3545';
        input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
        input.title = `❌ Este ${campo.toUpperCase()} já está em uso`;
    } else {
        // Manter a cor original baseada na validação do campo
        if (campo === 'ra' && valor.length === 8) {
            input.style.borderColor = '#28a745';
            input.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
            input.title = '✅ RA válido e disponível';
        } else if (campo === 'cpf' && valor.replace(/\D/g, '').length === 11) {
            input.style.borderColor = '#28a745';
            input.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
            input.title = '✅ CPF válido e disponível';
        } else if (campo === 'telefone') {
            const validacao = validarTelefoneCompleto(valor);
            if (validacao.valido) {
                input.style.borderColor = '#28a745';
                input.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
                input.title = `✅ Telefone ${validacao.formato} válido e disponível`;
            }
        } else if (campo === 'email' && validarEmailPUC(valor)) {
            input.style.borderColor = '#28a745';
            input.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
            input.title = '✅ Email válido e disponível';
        }
    }
}

// Sistema de Popup
function inicializarPopup() {
    if (document.getElementById('popupOverlay')) return;
    
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
    
    document.getElementById('popupButtonOk').addEventListener('click', function() {
        fecharPopup();
        if (cadastroSucessoData) {
            redirecionarParaLogin();
        }
    });
    
    document.getElementById('popupOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharPopup();
            if (cadastroSucessoData) {
                redirecionarParaLogin();
            }
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharPopup();
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
    
    container.className = 'popup-container';
    if (tipo === 'success') {
        container.classList.add('popup-success');
        icon.innerHTML = '<i class="fas fa-check-circle"></i>';
    } else if (tipo === 'error') {
        container.classList.add('popup-error');
        icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    }
    
    title.textContent = titulo;
    message.textContent = mensagem;
    
    overlay.style.display = 'flex';
    
    if (focarInput) {
        setTimeout(() => {
            if (focarInput === 'ra') raInput.focus();
            if (focarInput === 'cpf') cpfInput.focus();
            if (focarInput === 'email') emailInput.focus();
            if (focarInput === 'telefone') telefoneInput.focus();
            if (focarInput === 'nome') nomeInput.focus();
            if (focarInput === 'endereco') enderecoInput.focus();
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
    const alunoData = {
        nome: nomeInput.value.trim(),
        ra: raInput.value.trim(),
        cpf: cpfInput.value.trim(),
        telefone: telefoneInput.value.trim(),
        email: emailInput.value.trim(),
        endereco: enderecoInput.value.trim()
    };

    // Verificação final de duplicação antes do cadastro
    if (!await verificarDuplicacaoFinal(alunoData)) {
        return;
    }

    if (!validarFormulario(alunoData)) {
        return;
    }

    botaoCadastrar.innerHTML = '<span class="loading-spinner"></span>CADASTRANDO...';
    botaoCadastrar.disabled = true;

    try {
        const resultado = await fazerCadastro(alunoData);
        
        if (resultado.success) {
            await cadastroSucesso(resultado);
        } else {
            if (resultado.error && resultado.error.includes('já cadastrado')) {
                cadastroFalhou(resultado.error);
            } else {
                cadastroFalhou(resultado.error || 'Erro ao cadastrar aluno');
            }
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        cadastroFalhou('Erro de conexão com o servidor. Tente novamente.');
    } finally {
        botaoCadastrar.innerHTML = 'CADASTRAR';
        botaoCadastrar.disabled = false;
    }
}

// Verificação final de duplicação antes do cadastro
async function verificarDuplicacaoFinal(alunoData) {
    const camposParaVerificar = [
        { campo: 'ra', valor: alunoData.ra, nome: 'RA' },
        { campo: 'cpf', valor: alunoData.cpf.replace(/\D/g, ''), nome: 'CPF' },
        { campo: 'email', valor: alunoData.email, nome: 'Email' }
    ];
    
    // Se telefone foi preenchido, também verificar
    if (alunoData.telefone) {
        const validacaoTelefone = validarTelefoneCompleto(alunoData.telefone);
        if (validacaoTelefone.valido) {
            camposParaVerificar.push({
                campo: 'telefone', 
                valor: validacaoTelefone.telefoneLimpo, 
                nome: 'Telefone'
            });
        }
    }
    
    for (const item of camposParaVerificar) {
        // Verificar no cache primeiro
        if (dadosVerificados[item.campo].valor === item.valor && !dadosVerificados[item.campo].disponivel) {
            mostrarPopup('error', `${item.nome} já cadastrado`, `O ${item.nome} informado já está em uso. Por favor, use um ${item.nome} diferente.`, item.campo);
            return false;
        }
        
        // Fazer verificação final no servidor
        try {
            const response = await fetch(`${API_BASE_URL}/alunos/verificar-${item.campo}/${item.valor}`);
            if (response.ok) {
                const resultado = await response.json();
                if (resultado.existe) {
                    mostrarPopup('error', `${item.nome} já cadastrado`, `O ${item.nome} informado já está em uso. Por favor, use um ${item.nome} diferente.`, item.campo);
                    return false;
                }
            }
        } catch (error) {
            console.error(`Erro na verificação final do ${item.campo}:`, error);
        }
    }
    
    return true;
}

// VALIDAÇÕES DO FORMULÁRIO
function validarFormulario(dados) {
    if (!dados.nome || !dados.ra || !dados.cpf || !dados.email) {
        mostrarPopup('error', 'Campos obrigatórios', 'Nome, RA, CPF e Email são obrigatórios');
        return false;
    }

    // Nome deve ter pelo menos 3 caracteres
    if (dados.nome.length < 3) {
        mostrarPopup('error', 'Nome muito curto', 'O nome deve ter pelo menos 3 caracteres', 'nome');
        return false;
    }

    // RA deve ter exatamente 8 dígitos
    const raRegex = /^\d+$/;
    if (!raRegex.test(dados.ra) || dados.ra.length !== 8) {
        mostrarPopup('error', 'RA inválido', 'RA deve conter exatamente 8 dígitos numéricos', 'ra');
        return false;
    }

    const cpfLimpo = dados.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        mostrarPopup('error', 'CPF inválido', 'CPF deve conter 11 dígitos', 'cpf');
        return false;
    }

    // Email deve ser da PUC Campinas
    if (!validarEmailPUC(dados.email)) {
        mostrarPopup('error', 'Email inválido', 'Por favor, use um email institucional da PUC Campinas (@puccampinas.edu.br)', 'email');
        return false;
    }

    // VALIDAÇÃO ROBUSTA DO TELEFONE - CORRIGIDA
    if (dados.telefone) {
        const telefoneLimpo = dados.telefone.replace(/\D/g, '');
        
        // Verificar quantidade mínima de dígitos
        if (telefoneLimpo.length < 10) {
            mostrarPopup('error', 'Telefone incompleto', 'Telefone deve ter pelo menos 10 dígitos (DDD + número)', 'telefone');
            return false;
        }
        
        const validacaoTelefone = validarTelefoneCompleto(dados.telefone);
        if (!validacaoTelefone.valido) {
            mostrarPopup('error', 'Telefone inválido', validacaoTelefone.mensagem, 'telefone');
            return false;
        }
    }

    // Endereço deve ter pelo menos 5 caracteres
    if (dados.endereco && dados.endereco.length < 5) {
        mostrarPopup('error', 'Endereço muito curto', 'O endereço deve ter pelo menos 5 caracteres', 'endereco');
        return false;
    }

    return true;
}

// Validar email da PUC Campinas
function validarEmailPUC(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@puccampinas\.edu\.br$/;
    return emailRegex.test(email.toLowerCase());
}

// Requisição para a API
async function fazerCadastro(alunoData) {
    try {
        // Para o telefone, usar a validação completa
        let telefoneLimpo = '';
        if (alunoData.telefone) {
            const validacao = validarTelefoneCompleto(alunoData.telefone);
            telefoneLimpo = validacao.valido ? validacao.telefoneLimpo : alunoData.telefone.replace(/\D/g, '');
        }
        
        const dadosCompletos = {
            ...alunoData,
            cpf: alunoData.cpf.replace(/\D/g, ''),
            telefone: telefoneLimpo
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
    cadastroSucessoData = resultado.data;
    
    limparFormulario();
    
    mostrarPopup('success', 'Cadastro realizado!', 
        `Aluno cadastrado com sucesso!\n\nNome: ${resultado.data.nome}\nRA: ${resultado.data.ra}\nEmail: ${resultado.data.email}`);
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
    
    // Resetar estilos dos inputs e cache
    const inputs = document.querySelectorAll('.inputsFormulario');
    inputs.forEach(input => {
        input.style.borderColor = '#e9ecef';
        input.style.boxShadow = 'none';
        input.title = '';
    });
    
    // Limpar cache de verificações
    dadosVerificados = {
        ra: { valor: '', disponivel: true },
        cpf: { valor: '', disponivel: true },
        telefone: { valor: '', disponivel: true },
        email: { valor: '', disponivel: true }
    };
}

console.log('✅ JavaScript do cadastro de alunos carregado com sucesso!');