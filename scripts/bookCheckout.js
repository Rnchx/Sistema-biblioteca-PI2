async function pesquisar() {
  try {
    const termo = document.getElementById("pesquisa").value;

    const resposta = await fetch(`/pesquisar?q=${encodeURIComponent(termo)}`);
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