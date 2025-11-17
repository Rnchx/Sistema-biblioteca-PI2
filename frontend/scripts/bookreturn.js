
document.addEventListener("DOMContentLoaded", () => {
    pesquisar();
});

// PESQUISA DE LIVROS ALUGADOS
async function pesquisar() {
    const termo = document.getElementById("pesquisa").value.trim().toLowerCase();

    try {
        const resposta = await fetch('http://localhost:3000/emprestimos/ativos');
        const resultado = await resposta.json();

        if (!resultado.success) {
            console.error("Erro da API:", resultado.error);
            return;
        }

        const tbody = document.querySelector('#tabelaLivros tbody');
        tbody.innerHTML = '';

        const filtrados = resultado.data.filter(item =>
            !termo || item.livro_titulo.toLowerCase().includes(termo)
        );

        if (filtrados.length === 0) {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td colspan="4" style="text-align:center; padding:12px;">
                    Nenhum exemplar alugado encontrado.
                </td>`;
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

    } catch (erro) {
        console.error("Erro ao buscar exemplares:", erro);
    }
}

// FORMULÁRIO DE DEVOLUÇÃO
async function formulario() {
    try {
        const ra = document.getElementById("ra").value.trim();
        const codigo = document.getElementById("codigoLivro").value.trim();

        const resposta = await fetch("http://localhost:3000/emprestimos/devolver", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ra, codigo })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert("Livro devolvido com sucesso!");
            pesquisar(); // atualiza tabela
        } else {
            alert("Erro: " + resultado.mensagem);
        }

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao enviar dados.");
    }
}
