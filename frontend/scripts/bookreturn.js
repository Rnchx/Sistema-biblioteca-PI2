/// Pesquisa de livros alugados
let resultadosFiltrados = [];
let offset = 0;
const limite = 6;

async function realizarBusca() {
  const input = document.getElementById('pesquisa');
  const termo = input.value.trim().toLowerCase();

  const tbody = document.querySelector('#tabelaLivros tbody');
  tbody.innerHTML = ''; // limpa resultados anteriores

  // Se o campo estiver vazio, apenas limpa os resultados
  if (!termo) {
    const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
    botaoContainer.innerHTML = '';
    return;
  }

  try {
    const resposta = await fetch('http://localhost:3000/emprestimos/ativos');
    const resultado = await resposta.json();

    if (!resultado.success) {
      console.error("Erro da API:", resultado.error);
      return;
    }

    // Filtra os resultados
    function normalizar(str) {
      return str
        .toLowerCase()
        .normalize("NFD") 
        .replace(/[\u0300-\u036f]/g, ""); 
    }

    resultadosFiltrados = resultado.data.filter(ex =>
      normalizar(ex.livro_titulo).startsWith(normalizar(termo))
    );

    offset = 0; // reinicia a paginação
    renderizarResultados();
  } catch (erro) {
    console.error('Erro ao buscar empréstimos ativos:', erro);
  }
}

function renderizarResultados() {
  const tbody = document.querySelector('#tabelaLivros tbody');
  tbody.innerHTML = '';

  const slice = resultadosFiltrados.slice(offset, offset + limite);

  if (slice.length === 0 && document.getElementById('pesquisa').value.trim() !== '') {
    // Só mostra "Nenhum livro encontrado" se realmente houve uma pesquisa
    const linha = document.createElement('tr');
    linha.innerHTML = `<td colspan="4">Nenhum livro alugado encontrado.</td>`;
    tbody.appendChild(linha);
    return;
  }

  slice.forEach(ex => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${ex.exemplar_id}</td>
      <td>${ex.livro_titulo}</td>
      <td>${ex.autor}</td>
      <td>Alugado</td>
    `;
    tbody.appendChild(linha);
  });

  // Botão "Carregar mais"
  const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
  botaoContainer.innerHTML = ''; // limpa antes

  if (offset + limite < resultadosFiltrados.length) {
    const botao = document.createElement('button');
    botao.textContent = 'Carregar mais';
    botao.addEventListener('click', carregarMaisAlugados);
    botaoContainer.appendChild(botao);
  }
}

function carregarMaisAlugados() {
  // Mostra todos os resultados de uma vez
  offset = 0;
  const tbody = document.querySelector('#tabelaLivros tbody');
  tbody.innerHTML = '';

  resultadosFiltrados.forEach(ex => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${ex.exemplar_id}</td>
      <td>${ex.livro_titulo}</td>
      <td>${ex.autor}</td>
      <td>Alugado</td>
    `;
    tbody.appendChild(linha);
  });

  // Esconde o botão depois de carregar tudo
  const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
  botaoContainer.innerHTML = '';
}

// Configuração dos eventos
function configurarEventos() {
  const campoBusca = document.getElementById('pesquisa');
  
  let timeoutBusca;

  if (campoBusca) {
    campoBusca.addEventListener('input', function() {
      clearTimeout(timeoutBusca);
      timeoutBusca = setTimeout(function() {
        realizarBusca();
      }, 500); 
    });

    campoBusca.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        clearTimeout(timeoutBusca);
        realizarBusca();
      }
    });
  }

  // Configurar evento do formulário de devolução
  const formDevolucao = document.getElementById("formDevolucao");
  if (formDevolucao) {
    formDevolucao.addEventListener("submit", async function (event) {
      event.preventDefault();
      console.log("=== INICIANDO PROCESSO DE DEVOLUÇÃO ===");

      try {
        const raInput = document.getElementById("ra");
        const codigoInput = document.getElementById("codigoLivro");

        if (!raInput || !codigoInput) {
          mostrarPopupErro("Campos de entrada não encontrados no HTML.");
          return;
        }

        const ra = raInput.value.trim();
        const codigo = codigoInput.value.trim();

        // VALIDAÇÃO 1: Campos vazios
        if (!ra || !codigo) {
          mostrarPopupErro("Por favor, preencha todos os campos obrigatórios.");
          return;
        }

        // VALIDAÇÃO 2: Formato do RA (EXATAMENTE 8 números)
        if (!/^\d{8}$/.test(ra)) {
          mostrarPopupErro("RA inválido. Deve conter exatamente 8 números.");
          return;
        }

        // VALIDAÇÃO 3: Formato do código do exemplar (apenas números)
        if (!/^\d+$/.test(codigo)) {
          mostrarPopupErro("Código do livro inválido. Deve ser um número.");
          return;
        }

        console.log(`Enviando para API: RA=${ra}, Código=${codigo}`);

        // Enviar para API
        const resposta = await fetch("http://localhost:3000/emprestimos/devolucao", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            ra: ra, 
            codigoLivro: codigo 
          })
        });

        console.log("Status da resposta:", resposta.status);

        const resultado = await resposta.json();
        console.log("Resposta da API:", resultado);

        if (resposta.ok && resultado.success) {
          mostrarPopupSucesso(`Livro devolvido com sucesso!\n\n` +
            `Aluno: ${resultado.data.aluno.nome}\n` +
            `RA: ${resultado.data.aluno.ra}\n` +
            `Livro: ${resultado.data.livro.titulo}\n` +
            `Autor: ${resultado.data.livro.autor}\n` +
            `Exemplar: ${resultado.data.livro.exemplarId}`);
          
          // Limpar formulário
          formDevolucao.reset();
          
          // Atualizar lista de livros alugados
          realizarBusca();
          
        } else {
          mostrarPopupErro(resultado.mensagem || resultado.error || "Erro ao processar devolução.");
        }

      } catch (erro) {
        console.error("Erro completo:", erro);
        if (erro.message.includes('Failed to fetch')) {
          mostrarPopupErro("Erro de conexão com o servidor. Verifique se a API está rodando.");
        } else {
          mostrarPopupErro("Erro inesperado: " + erro.message);
        }
      }
    });
  }
}

// Inicializar eventos quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", function() {
  configurarEventos();
  console.log("✅ Sistema de devolução inicializado!");
});

//Popups de ERRO e SUCESSO
function mostrarPopupErro(mensagem) {
  const popup = document.getElementById("popupErro");
  const texto = document.getElementById("mensagemErro");
  texto.textContent = mensagem;
  popup.style.display = "flex";
}

function fecharPopup() {
  document.getElementById("popupErro").style.display = "none";
}

function mostrarPopupSucesso(mensagem) {
  const popup = document.getElementById("popupSucesso");
  const texto = document.getElementById("mensagemSucesso");
  texto.textContent = mensagem;
  popup.style.display = "flex";
}

function fecharPopupSucesso() {
  document.getElementById("popupSucesso").style.display = "none";
}