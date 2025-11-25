/// Pesquisa de livros para retirar
let resultadosFiltrados = [];
let offset = 0;
const limite = 6;

async function realizarBusca() {
  const input = document.getElementById('pesquisa');
  const termo = input.value.trim().toLowerCase();

  const tbody = document.querySelector('#tabelaLivros tbody');
  tbody.innerHTML = ''; // limpa resultados anteriores

  if (!termo) {
    mostrarPopupErro('Por favor, preencha o campo de pesquisa.');
    input.focus();
    return;
  }

  try {
    const resposta = await fetch('http://localhost:3000/exemplares/disponiveis');
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
    normalizar(ex.titulo).startsWith(normalizar(termo))
  );

    offset = 0; // reinicia a paginação
    renderizarResultados();
  } catch (erro) {
    console.error('Erro ao buscar exemplares:', erro);
  }
}

function renderizarResultados() {
  const tbody = document.querySelector('#tabelaLivros tbody');
  tbody.innerHTML = '';

  const slice = resultadosFiltrados.slice(offset, offset + limite);

  if (slice.length === 0) {
    const linha = document.createElement('tr');
    linha.innerHTML = `<td colspan="4">Nenhum livro encontrado.</td>`;
    tbody.appendChild(linha);
    return;
  }

  slice.forEach(ex => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${ex.exemplar_id}</td>
      <td>${ex.titulo}</td>
      <td>${ex.autor}</td>
      <td>${ex.exemplar_status}</td>
    `;
    tbody.appendChild(linha);
  });

  // Botão "Carregar mais"
  const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
  botaoContainer.innerHTML = ''; // limpa antes

  if (offset + limite < resultadosFiltrados.length) {
    const botao = document.createElement('button');
    botao.textContent = 'Carregar mais';
    botao.addEventListener('click', carregarMaisDisponiveis);
    botaoContainer.appendChild(botao);
  }
}

function carregarMaisDisponiveis() {
  // Mostra todos os resultados de uma vez
  offset = 0;
  const tbody = document.querySelector('#tabelaLivros tbody');
  tbody.innerHTML = '';

  resultadosFiltrados.forEach(ex => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${ex.exemplar_id}</td>
      <td>${ex.titulo}</td>
      <td>${ex.autor}</td>
      <td>${ex.exemplar_status}</td>
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
campoBusca.addEventListener('focus', function() {
  const tbody = document.querySelector('#tabelaLivros tbody');
  tbody.innerHTML = ''; // limpa os resultados anteriores
  campoBusca.value = '';
});
  const botaoBusca = document.querySelector('#PesquisaDeLivros button');

  let timeoutBusca;

  if (botaoBusca) {
    botaoBusca.addEventListener('click', function() {
      realizarBusca();
    });
  }

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
}

// Formulário de retirada
document.addEventListener("DOMContentLoaded", configurarEventos);
document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("formEmprestimo");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Interceptando envio do formulário");
    console.log("Formulário enviado");

    try {
      const raInput = document.getElementById("ra");
      const codigoInput = document.getElementById("codigoLivro");

      if (!raInput || !codigoInput) {
        mostrarPopupErro("Campos de entrada não encontrados no HTML.");
        return;
      }

      const ra = raInput.value.trim();
      const codigo = codigoInput.value.trim();

      if (!/^\d{8}$/.test(ra)) {
        mostrarPopupErro("RA inválido. Deve conter exatamente 8 números.");
        return;
      }

      if (!/^\d+$/.test(codigo)) {
        mostrarPopupErro("Código do livro inválido. Deve ser um número.");
        return;
      }

      const resposta = await fetch("http://localhost:3000/emprestimos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raAluno: ra, idExemplar: codigo })
      });

      if (resposta.ok) {
        mostrarPopupSucesso("Livro alugado com sucesso!");
        form.reset();
      } else {
        let mensagemErro = `Erro ${resposta.status}: Falha no empréstimo.`;

        try {
          const contentType = resposta.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const erroApi = await resposta.json();
            if (erroApi && (erroApi.error || erroApi.message)) {
              mensagemErro = erroApi.error || erroApi.message;
            }
          } else {
            console.warn("Resposta não está em formato JSON.");
          }
        } catch (jsonError) {
          console.error("Falha ao ler JSON de erro:", jsonError);
        }

        mostrarPopupErro("Erro: " + (mensagemErro || "Erro desconhecido."));
        console.error("Detalhes do erro:", mensagemErro);
      }
    } catch (erro) {
      console.error("Erro ao enviar dados:", erro);
      mostrarPopupErro("Erro de conexão com o servidor.");
    }
  }); 
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
  document.getElementById('mensagemSucesso').innerText = mensagem;
  document.getElementById('popupSucesso').style.display = 'flex';
}

function fecharPopupSucesso() {
  document.getElementById('popupSucesso').style.display = 'none';
}
