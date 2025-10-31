// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
let tituloInput, isbnInput, autorInput, editoraInput, quantidadeInput, botaoCadastrar;

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

function mostrarPopup(tipo, titulo, mensagem) {
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

    // Validações
    if (!validarFormulario(livroData)) {
        return;
    }

    // Mostrar loading no botão
    const textoOriginal = botaoCadastrar.innerHTML;
    botaoCadastrar.innerHTML = '<span class="loading-spinner"></span>CADASTRANDO...';
    botaoCadastrar.disabled = true;

    try {
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

// Validações do formulário
function validarFormulario(dados) {
    // Verificar campos obrigatórios (todos os campos)
    if (!dados.titulo || !dados.isbn || !dados.autor || !dados.editora) {
        mostrarPopup('error', 'Campos obrigatórios', 'Todos os campos são obrigatórios');
        return false;
    }

    // Validar se título tem pelo menos 2 caracteres
    if (dados.titulo.length < 2) {
        mostrarPopup('error', 'Título inválido', 'O título deve ter pelo menos 2 caracteres');
        tituloInput.focus();
        return false;
    }

    // Validar se autor tem pelo menos 2 caracteres
    if (dados.autor.length < 2) {
        mostrarPopup('error', 'Autor inválido', 'O autor deve ter pelo menos 2 caracteres');
        autorInput.focus();
        return false;
    }

    // Validar se editora tem pelo menos 2 caracteres
    if (dados.editora.length < 2) {
        mostrarPopup('error', 'Editora inválida', 'A editora deve ter pelo menos 2 caracteres');
        editoraInput.focus();
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
    
    // Focar no primeiro campo
    tituloInput.focus();
}

console.log('✅ JavaScript do cadastro de livros carregado!');