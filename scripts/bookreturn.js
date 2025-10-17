//Pesquisa de livros alugados
async function pesquisar() {
  try {
    const termo = document.getElementById("pesquisa").value;

    const resposta = await fetch(`/pesquisar-alugados?q=${encodeURIComponent(termo)}`);
    const livros = (await resposta.json()).filter(livro =>
      livro.titulo.toLowerCase().includes(termo.toLowerCase()) ||
      livro.codigo.includes(termo)
    );

    const corpoTabela = document.getElementById("resultado");
    corpoTabela.innerHTML = "";

    livros.forEach(livro => {
      const tr = document.createElement("tr");

      const tdCodigo = document.createElement("td");
      tdCodigo.textContent = livro.codigo;

      const tdTitulo = document.createElement("td");
      tdTitulo.textContent = livro.titulo;

      tr.appendChild(tdCodigo);
      tr.appendChild(tdTitulo);
      corpoTabela.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao pesquisar livros:", error);
  }
}


//Formulário de devolução
async function formulario() {
  try {
    const ra = document.getElementById("ra").value;
    const codigo = document.getElementById("codigoLivro").value;

    const resposta = await fetch("http://localhost:3000/NOME_DA_TABELA", {
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
