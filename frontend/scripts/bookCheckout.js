/// Pesquisa de livros para retirar
async function pesquisar() {
  const termo = document.getElementById('pesquisa').value.trim().toLowerCase();

  try {
    const resposta = await fetch('http://localhost:3000/exemplares/disponiveis');
    const resultado = await resposta.json();

    if (resultado.success) {
      const tbody = document.querySelector('#tabelaLivros tbody');
      tbody.innerHTML = '';

      const filtrados = termo
        ? resultado.data.filter(ex => ex.titulo.toLowerCase().includes(termo))
        : resultado.data;

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
    } else {
      console.error('Erro na resposta da API:', resultado.error);
    }
  } catch (erro) {
    console.error('Erro ao buscar exemplares:', erro);
  }
}

// Formulário de retirada
async function formulario() {
  try {
    const ra = document.getElementById("ra").value.trim();
    const codigo = document.getElementById("codigolivro").value.trim();

    // Validação do RA: deve ter exatamente 8 dígitos numéricos
    const raValido = /^\d{8}$/.test(ra);
    if (!raValido) {
      alert("RA inválido. Deve conter exatamente 8 números.");
      return;
    }

    // Validação do código do livro: deve ser um número positivo
    const codigoValido = /^\d+$/.test(codigo);
    if (!codigoValido) {
      alert("Código do livro inválido. Deve ser um número.");
      return;
    }

    const resposta = await fetch("http://localhost:3000/emprestimos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ra: ra, codigolivro: codigo })
    });

    if (resposta.ok) {
      const resultado = await resposta.json();
      alert("Livro alugado com sucesso!");
    } else {
      let mensagemErro = `Erro ${resposta.status}: Falha no empréstimo.`;

      try {
        const erroApi = await resposta.json();
        if (erroApi.error) {
          mensagemErro = erroApi.error;
        }
      } catch (jsonError) {
        console.error('Falha ao ler o JSON de erro do servidor:', jsonError);
      }

      alert("Erro: " + mensagemErro);
      console.error("Detalhes do erro:", mensagemErro);
    }

  } catch (erro) {
    console.error("Erro ao enviar dados:", erro);
    alert('Erro ao enviar dados. Verifique a conexão ou o console do navegador.');
  }
}