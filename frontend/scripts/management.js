document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script de navegação carregado com sucesso.");
  function redirecionar(url) {
    window.location.href = url;
  }

  const botoes = {
    botaoVoltar: "Management.html",
    botaoCadastrar: "registerBooksPage.html",
    botaoGerenciar: "ManagementBooks.html",
    botaoClassificacao: "ClassificationBooks.html",
  };

  Object.entries(botoes).forEach(([id, destino]) => {
    const botao = document.getElementById(id);
    if (botao) {
      botao.addEventListener("click", (e) => {
        e.preventDefault();
        console.log(`➡ Redirecionando para: ${destino}`);
        redirecionar(destino);
      });
    }
  });
});
