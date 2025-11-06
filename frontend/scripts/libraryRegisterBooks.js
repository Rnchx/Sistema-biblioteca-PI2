// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
let tituloInput, isbnInput, autorInput, editoraInput, quantidadeInput, botaoCadastrar;

// Cache para verificação em tempo real
let dadosVerificados = {
    isbn: { valor: '', disponivel: true }
};

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Página de cadastro de livros carregada');
    inicializarElementos();
    configurarEventos();
    inicializarPopup();
});

function inicializarElementos() {
    tituloInput = document.getElementById('titulo');
    isbnInput = document.getElementById('isbn');
    autorInput = document.getElementById('autor');
    editoraInput = document.getElementById('editora');
    quantidadeInput = document.getElementById('quantidade');
    botaoCadastrar = document.getElementById('botaoFormulario');
}

function configurarEventos() {
    if (botaoCadastrar) {
        botaoCadastrar.addEventListener('click', function(e) {
            e.preventDefault();
            cadastrarLivro();
        });
    }
    
    // Formatação automática do ISBN enquanto digita
    if (isbnInput) {
        isbnInput.addEventListener('input', function(e) {
            formatarISBN(e.target);
        });
        
        // Permitir apenas números
        isbnInput.addEventListener('keydown', function(e) {
            const key = e.key;
            // Permitir: números, teclas de controle (backspace, delete, tab, etc.)
            if (!/\d|Backspace|Delete|Tab|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End/.test(key)) {
                e.preventDefault();
            }
        });
        
        // Validação em tempo real do ISBN
        isbnInput.addEventListener('blur', function(e) {
            const valor = this.value.trim();
            if (valor && validarISBN(valor)) {
                verificarDuplicacao('isbn', valor);
            }
        });
        
        isbnInput.addEventListener('input', function(e) {
            const valor = this.value.trim();
            atualizarFeedbackISBN(valor);
        });
    }
    
    // Validação em tempo real do título
    if (tituloInput) {
        tituloInput.addEventListener('blur', function(e) {
            const valor = this.value.trim();
            atualizarFeedbackTitulo(valor);
        });
        
        tituloInput.addEventListener('input', function(e) {
            const valor = this.value.trim();
            if (valor.length >= 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(valor)) {
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
    
    // Validação em tempo real do autor
    if (autorInput) {
        autorInput.addEventListener('blur', function(e) {
            const valor = this.value.trim();
            atualizarFeedbackAutor(valor);
        });
        
        autorInput.addEventListener('input', function(e) {
            const valor = this.value.trim();
            if (valor.length >= 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(valor)) {
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
    
    // Validação em tempo real da editora
    if (editoraInput) {
        editoraInput.addEventListener('blur', function(e) {
            const valor = this.value.trim();
            atualizarFeedbackEditora(valor);
        });
        
        editoraInput.addEventListener('input', function(e) {
            const valor = this.value.trim();
            if (valor.length >= 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(valor)) {
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
    
    // Validação em tempo real da quantidade
    if (quantidadeInput) {
        quantidadeInput.addEventListener('blur', function(e) {
            const valor = parseInt(this.value);
            atualizarFeedbackQuantidade(valor);
        });
        
        quantidadeInput.addEventListener('input', function(e) {
            const valor = parseInt(this.value);
            if (!isNaN(valor) && valor >= 1) {
                this.style.borderColor = '#28a745';
                this.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
            } else if (this.value.length > 0) {
                this.style.borderColor = '#ffc107';
                this.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
            } else {
                this.style.borderColor = '#e9ecef';
                this.style.boxShadow = 'none';
            }
        });
    }
    
    // Enter nos inputs também submete o formulário
    const inputs = document.querySelectorAll('.inputsFormulario');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                cadastrarLivro();
            }
        });
    });
}

// Função para formatar ISBN automaticamente no padrão: 978-85-12345-13-8
function formatarISBN(input) {
    let value = input.value.replace(/[^\d]/g, ''); // Remove tudo que não é número
    
    // Limitar a 13 dígitos
    if (value.length > 13) {
        value = value.substring(0, 13);
    }
    
    // Aplicar formatação: XXX-XX-XXXXX-XX-X
    let formattedValue = value;
    if (value.length > 3) {
        formattedValue = value.substring(0, 3) + '-' + value.substring(3);
    }
    if (value.length > 5) {
        formattedValue = formattedValue.substring(0, 6) + '-' + formattedValue.substring(6);
    }
    if (value.length > 10) {
        formattedValue = formattedValue.substring(0, 12) + '-' + formattedValue.substring(12);
    }
    if (value.length > 12) {
        formattedValue = formattedValue.substring(0, 15) + '-' + formattedValue.substring(15);
    }
    
    input.value = formattedValue;
    
    // Feedback visual em tempo real
    atualizarFeedbackISBN(formattedValue);
}

// Função para validar ISBN formatado
function validarISBN(isbn) {
    // Remover hífens para contar apenas os dígitos
    const digitos = isbn.replace(/[^\d]/g, '');
    
    // Verificar se tem exatamente 13 dígitos numéricos
    if (digitos.length !== 13) {
        return false;
    }
    
    // Verificar se o formato está correto: XXX-XX-XXXXX-XX-X
    // Isso é opcional, o importante são os 13 dígitos
    const digitosCount = digitos.length;
    const formatoEsperado = 
        isbn.length === 17 && 
        isbn[3] === '-' && 
        isbn[6] === '-' && 
        isbn[12] === '-' && 
        isbn[15] === '-';
    
    // Se já está formatado, verificar o formato, senão só os dígitos bastam
    if (isbn.includes('-') && !formatoEsperado) {
        return false;
    }
    
    return true;
}

// Funções auxiliares para feedback visual
function atualizarFeedbackISBN(valor) {
    if (validarISBN(valor)) {
        if (dadosVerificados.isbn.valor === valor && !dadosVerificados.isbn.disponivel) {
            isbnInput.style.borderColor = '#dc3545';
            isbnInput.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
        } else {
            isbnInput.style.borderColor = '#28a745';
            isbnInput.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
        }
    } else if (valor.length > 0) {
        isbnInput.style.borderColor = '#ffc107';
        isbnInput.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
    } else {
        isbnInput.style.borderColor = '#e9ecef';
        isbnInput.style.boxShadow = 'none';
    }
}

function atualizarFeedbackTitulo(valor) {
    if (valor && valor.length >= 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(valor)) {
        tituloInput.style.borderColor = '#28a745';
        tituloInput.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
    } else if (valor && valor.length > 0) {
        tituloInput.style.borderColor = '#ffc107';
        tituloInput.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
    } else {
        tituloInput.style.borderColor = '#e9ecef';
        tituloInput.style.boxShadow = 'none';
    }
}

function atualizarFeedbackAutor(valor) {
    if (valor && valor.length >= 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(valor)) {
        autorInput.style.borderColor = '#28a745';
        autorInput.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
    } else if (valor && valor.length > 0) {
        autorInput.style.borderColor = '#ffc107';
        autorInput.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
    } else {
        autorInput.style.borderColor = '#e9ecef';
        autorInput.style.boxShadow = 'none';
    }
}

function atualizarFeedbackEditora(valor) {
    if (valor && valor.length >= 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(valor)) {
        editoraInput.style.borderColor = '#28a745';
        editoraInput.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
    } else if (valor && valor.length > 0) {
        editoraInput.style.borderColor = '#ffc107';
        editoraInput.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
    } else {
        editoraInput.style.borderColor = '#e9ecef';
        editoraInput.style.boxShadow = 'none';
    }
}

function atualizarFeedbackQuantidade(valor) {
    if (!isNaN(valor) && valor >= 1) {
        quantidadeInput.style.borderColor = '#28a745';
        quantidadeInput.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
    } else if (quantidadeInput.value.length > 0) {
        quantidadeInput.style.borderColor = '#ffc107';
        quantidadeInput.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
    } else {
        quantidadeInput.style.borderColor = '#e9ecef';
        quantidadeInput.style.boxShadow = 'none';
    }
}

function atualizarFeedbackDuplicacao(campo, disponivel) {
    let input;
    switch (campo) {
        case 'isbn':
            input = isbnInput;
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
    } else {
        // Manter a cor original baseada na validação do campo
        if (campo === 'isbn' && validarISBN(valor)) {
            input.style.borderColor = '#28a745';
            input.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
        }
    }
}

// Verificar duplicação em tempo real
async function verificarDuplicacao(campo, valor) {
    if (!valor || valor.length === 0) return;
    
    try {
        // Limpar valor para busca (remover formatação)
        let valorLimpo = valor;
        if (campo === 'isbn') {
            valorLimpo = valor.replace(/[^\d]/g, '');
        }
        
        // Verificar se o campo está completo antes de fazer a requisição
        if (campo === 'isbn' && valorLimpo.length !== 13) return;
        
        console.log(`Verificando ${campo}:`, valorLimpo);
        
        const response = await fetch(`${API_BASE_URL}/livros`);
        
        if (!response.ok) {
            throw new Error('Erro na verificação');
        }
        
        const livros = await response.json();
        
        let existe = false;
        
        // Verificar se é um array e se contém o ISBN
        if (Array.isArray(livros)) {
            existe = livros.some(livro => 
                livro.isbn && livro.isbn.replace(/[^\d]/g, '') === valorLimpo
            );
        } else if (livros.data && Array.isArray(livros.data)) {
            existe = livros.data.some(livro => 
                livro.isbn && livro.isbn.replace(/[^\d]/g, '') === valorLimpo
            );
        }
        
        // Atualizar cache e interface
        dadosVerificados[campo] = {
            valor: valor,
            disponivel: !existe
        };
        
        // Atualizar feedback visual
        atualizarFeedbackDuplicacao(campo, !existe);
        
    } catch (error) {
        console.error(`Erro ao verificar ${campo}:`, error);
        // Em caso de erro, assumir que está disponível para não bloquear o usuário
        dadosVerificados[campo] = {
            valor: valor,
            disponivel: true
        };
    }
}

// Função para verificar se ISBN já existe no sistema (para validação final)
async function verificarISBNExistente(isbn) {
    try {
        // Buscar todos os livros para verificar se o ISBN já existe
        const response = await fetch(`${API_BASE_URL}/livros`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar livros');
        }
        
        const livros = await response.json();
        
        // Verificar se é um array e se contém o ISBN
        if (Array.isArray(livros)) {
            const isbnExistente = livros.find(livro => 
                livro.isbn && livro.isbn.replace(/[^\d]/g, '') === isbn.replace(/[^\d]/g, '')
            );
            return !!isbnExistente;
        }
        
        // Se a resposta não for um array, verificar em resultado.data
        if (livros.data && Array.isArray(livros.data)) {
            const isbnExistente = livros.data.find(livro => 
                livro.isbn && livro.isbn.replace(/[^\d]/g, '') === isbn.replace(/[^\d]/g, '')
            );
            return !!isbnExistente;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Erro ao verificar ISBN existente:', error);
        // Em caso de erro, permitir o cadastro (não bloquear por falha na verificação)
        return false;
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
    });
    
    document.getElementById('popupOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharPopup();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharPopup();
        }
    });
}

function mostrarPopup(tipo, titulo, mensagem, focarInput = false) {
    const overlay = document.getElementById('popupOverlay');
    const container = document.getElementById('popupContainer');
    const icon = document.getElementById('popupIcon');
    const title = document.getElementById('popupTitle');
    const message = document.getElementById('popupMessage');
    
    if (!overlay) {
        alert(`${titulo}\n\n${mensagem}`);
        return;
    }
    
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
            if (focarInput === 'titulo') tituloInput.focus();
            if (focarInput === 'isbn') isbnInput.focus();
            if (focarInput === 'autor') autorInput.focus();
            if (focarInput === 'editora') editoraInput.focus();
            if (focarInput === 'quantidade') quantidadeInput.focus();
        }, 300);
    }
}

function fecharPopup() {
    const overlay = document.getElementById('popupOverlay');
    overlay.style.display = 'none';
}

// Função principal de cadastro
async function cadastrarLivro() {
    // Coletar dados do formulário - TODOS OS CAMPOS
    const livroData = {
        titulo: tituloInput.value.trim(),
        isbn: isbnInput.value.trim(),
        autor: autorInput.value.trim(),
        editora: editoraInput.value.trim()
    };

    const quantidade = parseInt(quantidadeInput.value) || 1;

    console.log('📤 Dados a serem enviados para a API:', livroData);

    // Verificação final de duplicação antes do cadastro
    if (!await verificarDuplicacaoFinal(livroData)) {
        return;
    }

    // Validações
    if (!validarFormulario(livroData)) {
        return;
    }

    // Mostrar loading no botão
    const textoOriginal = botaoCadastrar.innerHTML;
    botaoCadastrar.innerHTML = '<span class="loading-spinner"></span>VERIFICANDO...';
    botaoCadastrar.disabled = true;

    try {
        // Verificar se ISBN já existe antes de cadastrar
        const isbnExistente = await verificarISBNExistente(livroData.isbn);
        
        if (isbnExistente) {
            mostrarPopup('error', 'ISBN já cadastrado', 
                `Já existe um livro cadastrado com este ISBN:\n\n${livroData.isbn}\n\nCada livro deve ter um ISBN único.`, 'isbn');
            botaoCadastrar.innerHTML = textoOriginal;
            botaoCadastrar.disabled = false;
            return;
        }

        // Atualizar texto do botão para "CADASTRANDO"
        botaoCadastrar.innerHTML = '<span class="loading-spinner"></span>CADASTRANDO...';

        // Primeiro cadastra o livro
        const resultadoLivro = await fazerCadastroLivro(livroData);
        
        console.log('📨 Resposta da API (livro):', resultadoLivro);
        
        if (resultadoLivro.success) {
            // Depois adiciona os exemplares
            await adicionarExemplares(resultadoLivro.data.id, quantidade);
            cadastroSucesso(resultadoLivro, quantidade);
        } else {
            cadastroFalhou(resultadoLivro.error || 'Erro ao cadastrar livro');
        }
        
    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        cadastroFalhou('Erro de conexão com o servidor. Tente novamente.');
    } finally {
        // Restaurar botão
        botaoCadastrar.innerHTML = textoOriginal;
        botaoCadastrar.disabled = false;
    }
}

// Verificação final de duplicação antes do cadastro
async function verificarDuplicacaoFinal(livroData) {
    // Verificar no cache primeiro
    if (dadosVerificados.isbn.valor === livroData.isbn && !dadosVerificados.isbn.disponivel) {
        mostrarPopup('error', 'ISBN já cadastrado', 
            `O ISBN informado já está em uso. Por favor, use um ISBN diferente.`, 'isbn');
        return false;
    }
    
    return true;
}

// Validações do formulário ATUALIZADA
function validarFormulario(dados) {
    // Verificar campos obrigatórios (todos os campos)
    if (!dados.titulo || !dados.isbn || !dados.autor || !dados.editora) {
        mostrarPopup('error', 'Campos obrigatórios', 'Todos os campos são obrigatórios');
        return false;
    }

    // Validar se título tem pelo menos 3 letras
    if (dados.titulo.length < 3 || !/[a-zA-ZÀ-ÿ]{3,}/.test(dados.titulo)) {
        mostrarPopup('error', 'Título inválido', 'O título deve ter pelo menos 3 letras', 'titulo');
        return false;
    }

    // Validar ISBN - deve ter 13 dígitos numéricos
    if (!validarISBN(dados.isbn)) {
        mostrarPopup('error', 'ISBN inválido', 
            'O ISBN deve ter 13 dígitos numéricos\n\nFormato correto: 978-85-12345-13-8\n(13 números no total)', 'isbn');
        return false;
    }

    // Validar se autor tem pelo menos 3 letras
    if (dados.autor.length < 3 || !/[a-zA-ZÀ-ÿ]{3,}/.test(dados.autor)) {
        mostrarPopup('error', 'Autor inválido', 'O autor deve ter pelo menos 3 letras', 'autor');
        return false;
    }

    // Validar se editora tem pelo menos 3 letras
    if (dados.editora.length < 3 || !/[a-zA-ZÀ-ÿ]{3,}/.test(dados.editora)) {
        mostrarPopup('error', 'Editora inválida', 'A editora deve ter pelo menos 3 letras', 'editora');
        return false;
    }

    // Validar quantidade de exemplares
    const quantidade = parseInt(quantidadeInput.value);
    if (isNaN(quantidade) || quantidade < 1) {
        mostrarPopup('error', 'Quantidade inválida', 'A quantidade de exemplares deve ser no mínimo 1', 'quantidade');
        return false;
    }

    return true;
}

// Cadastrar livro na API
async function fazerCadastroLivro(livroData) {
    try {
        const response = await fetch(`${API_BASE_URL}/livros`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(livroData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro detalhado:', errorText);
            throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }

        return await response.json();
        
    } catch (error) {
        console.error('❌ Erro na requisição do livro:', error);
        throw error;
    }
}

// Adicionar exemplares
async function adicionarExemplares(idLivro, quantidade) {
    try {
        for (let i = 0; i < quantidade; i++) {
            const response = await fetch(`${API_BASE_URL}/exemplares`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_livro: idLivro
                })
            });

            if (!response.ok) {
                throw new Error(`Erro ao adicionar exemplar ${i + 1}`);
            }

            console.log(`✅ Exemplar ${i + 1} adicionado`);
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar exemplares:', error);
        throw error;
    }
}

// Cadastro bem-sucedido
function cadastroSucesso(resultado, quantidade) {
    console.log('✅ Cadastro realizado com sucesso:', resultado);
    
    mostrarPopup('success', 'Livro cadastrado!', 
        `Livro cadastrado com sucesso!\n\nTítulo: ${resultado.data.titulo}\nAutor: ${resultado.data.autor}\nISBN: ${resultado.data.isbn}\nEditora: ${resultado.data.editora}\nExemplares: ${quantidade}\nID: ${resultado.data.id}`);
    
    // Limpar formulário após sucesso
    setTimeout(() => {
        limparFormulario();
    }, 2000);
}

// Cadastro falhou
function cadastroFalhou(mensagemErro) {
    console.error('❌ Erro no cadastro:', mensagemErro);
    mostrarPopup('error', 'Erro no cadastro', mensagemErro);
}

// Limpar formulário
function limparFormulario() {
    tituloInput.value = '';
    isbnInput.value = '';
    autorInput.value = '';
    editoraInput.value = '';
    quantidadeInput.value = '1';
    
    // Resetar estilos dos inputs
    const inputs = document.querySelectorAll('.inputsFormulario');
    inputs.forEach(input => {
        input.style.borderColor = '#e9ecef';
        input.style.boxShadow = 'none';
    });
    
    // Limpar cache de verificações
    dadosVerificados = {
        isbn: { valor: '', disponivel: true }
    };
    
    // Focar no primeiro campo
    tituloInput.focus();
}

console.log('✅ JavaScript do cadastro de livros carregado!');