//Pesquisa de livros alugados

async function pesquisar() {
  try {
    const termo = document.getElementById("pesquisa").value;

    const resposta = await fetch('http://localhost:3000/api/exemplares');
    const livros = await resposta.json();

    if (resultado.success) {
    const tbody = document.querySelector('#tabelaLivros tbody');
    tbody.innerHTML = '';

    resultado.data.forEach(ex => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${ex.id}</td>
        <td>${ex.titulo}</td>
        <td>${ex.autor}</td>
        <td>${ex.status}</td>
      `;
      tbody.appendChild(linha);
     });
    } else {
      console.error('Erro na resposta da API:', resultado.error);
    }
  } catch (erro) {
    console.error('Erro ao buscar exemplares alugados:', erro);
}
}


//Formulário de devolução
async function formulario() {
  try {
    const ra = document.getElementById("ra").value;
    const codigo = document.getElementById("codigoLivro").value;

    const resposta = await fetch("http://localhost:3000/emprestimos/devolucao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ra, codigoLivro: codigo })
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      alert("Livro devolvido com sucesso!");
    } else {
      alert("Erro: " + resultado.mensagem);
    }
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao enviar dados.");
  }
}
