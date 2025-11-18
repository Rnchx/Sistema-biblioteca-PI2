//Pesquisa de livros alugados

async function pesquisar() {
  const termo = document.getElementById("pesquisa").value.trim().toLowerCase();

  try {
    const resposta = await fetch('http://localhost:3000/emprestimos/ativos');
    const resultado = await resposta.json();

    if (resultado.success) {
      const tbody = document.querySelector('#tabelaLivros tbody');
      tbody.innerHTML = '';

      const filtrados = resultado.data.filter(ex => {
      if (!termo) return true;
      return ex.livro_titulo.toLowerCase().includes(termo);
    });

      if (filtrados.length === 0) {
        const linha = document.createElement('tr');
        linha.innerHTML = `<td colspan="4" style="text-align:center; padding:12px;">Nenhum exemplar alugado encontrado.</td>`;
        tbody.appendChild(linha);
        return;
      }

      filtrados.forEach(ex => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${ex.exemplar_id}</td>
          <td>${ex.livro_titulo}</td>
          <td>${ex.autor}</td>
          <td>Alugado</td>
        `;
        tbody.appendChild(linha);
      });
    } else {
      console.error('Erro na resposta da API:', resultado.error);
    }
  } catch (erro) {
    console.error('Erro ao buscar exemplares para devolução:', erro);
  }
}


//Formulário de devolução
document.addEventListener("DOMContentLoaded", function () {
  const formDevolucao = document.getElementById("formDevolucao");

  formDevolucao.addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Interceptando envio do formulário de devolução");

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

      const resposta = await fetch("http://localhost:3000/emprestimos/devolucao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ra, codigoLivro: codigo })
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        mostrarPopupSucesso("Livro devolvido com sucesso!");
      } else {
        const mensagem = resultado.mensagem || "Erro ao processar devolução.";
        mostrarPopupErro("Erro: " + mensagem);
        console.error("Detalhes do erro:", mensagem);
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
