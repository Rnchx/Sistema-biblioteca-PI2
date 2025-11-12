/// Pesquisa de livros para retirar
async function pesquisar() {
    try {
        const resposta = await fetch('http://localhost:3000/exemplares/disponiveis');
        const resultado = await resposta.json();

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
        console.error('Erro ao buscar exemplares:', erro);
    }
}

// Formulário de retirada
async function formulario() {
    try {
        const ra = document.getElementById("ra").value;
        const codigo = document.getElementById("codigolivro").value;

        if (!ra || !codigo) {
            alert("Preencha todos os campos antes de enviar.");
            return;
        }

        const resposta = await fetch("http://localhost:3000/emprestimos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ra: ra, codigolivro: codigo }) // ajuste se necessário
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