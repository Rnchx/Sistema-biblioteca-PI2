document.addEventListener("DOMContentLoaded", async () => {
  const colunaDisponiveis = document.getElementById("livrosDisponiveis");
  const colunaEmprestados = document.getElementById("livrosEmprestados");

  try {
    const livros = [
      { titulo: "Dom Casmurro", codigo: "L001", status: "disponível" },
      { titulo: "O Cortiço", codigo: "L002", status: "emprestado" },
      { titulo: "Iracema", codigo: "L003", status: "disponível" },
      { titulo: "Senhora", codigo: "L004", status: "emprestado" },
      { titulo: "A Moreninha", codigo: "L005", status: "disponível" },
      { titulo: "Memórias Póstumas", codigo: "L006", status: "emprestado" }
    ];

    // 🔹 Preencher dinamicamente
    livros.forEach((livro, index) => {
      const linha = document.createElement("div");
      linha.classList.add("linhaLivro");
      if (index % 2 !== 0) linha.classList.add("fundoCinza");
      linha.textContent = `${livro.titulo} / ${livro.codigo}`;

      if (livro.status === "disponível") {
        colunaDisponiveis.appendChild(linha);
      } else {
        colunaEmprestados.appendChild(linha);
      }
    });

  } catch (erro) {
    console.error("Erro ao carregar livros:", erro);
    colunaDisponiveis.innerHTML = `<div class="linhaLivro">Erro ao carregar dados.</div>`;
  }
});
