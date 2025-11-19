/// Pesquisa de livros para retirar
async function pesquisar() {
  const input = document.getElementById('pesquisa');
  const termo = input.value.trim().toLowerCase();

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

    const tbody = document.querySelector('#tabelaLivros tbody');
    tbody.innerHTML = '';

    const filtrados = resultado.data.filter(ex =>
      ex.titulo.toLowerCase().includes(termo)
    );

    if (filtrados.length === 0) {
      const linha = document.createElement('tr');
      linha.innerHTML = `<td colspan="4">Nenhum livro encontrado.</td>`;
      tbody.appendChild(linha);
      return;
    }

    filtrados.forEach(ex => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${ex.exemplar_id}</td>
        <td>${ex.titulo}</td>
        <td>${ex.autor}</td>
        <td>${ex.exemplar_status}</td>
      `;
      tbody.appendChild(linha);
    });

  } catch (erro) {
    console.error('Erro ao buscar exemplares:', erro);
  }
}
// Formulário de retirada
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

      console.log("Status da resposta:", resposta.status);
      console.log("Headers da resposta:", resposta.headers);

      if (resposta.ok) {
        mostrarPopupSucesso("Livro alugado com sucesso!");
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
  document.getElementById('popupSucesso').style.display = 'block';
}

function fecharPopupSucesso() {
  document.getElementById('popupSucesso').style.display = 'none';
}
