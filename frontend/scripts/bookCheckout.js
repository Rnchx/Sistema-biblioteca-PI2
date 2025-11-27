/// Pesquisa de livros para retirar
let resultadosFiltrados = [];
let offset = 0;
const limite = 6;

async function realizarBusca() {
  const input = document.getElementById('pesquisa');
  const termo = input.value.trim().toLowerCase();

  const tbody = document.querySelector('#tabelaLivros tbody');
  tbody.innerHTML = ''; // limpa resultados anteriores

  if (!termo) {
    const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
    botaoContainer.innerHTML = '';
    return;
  }

  try {
    const resposta = await fetch('http://localhost:3000/exemplares/disponiveis');
    const resultado = await resposta.json();

    if (!resultado.success) {
      console.error("Erro da API:", resultado.error);
      return;
    }

    function normalizar(str) {
      return str
        .toLowerCase()
        .normalize("NFD") 
        .replace(/[\u0300-\u036f]/g, ""); 
    }

    resultadosFiltrados = resultado.data.filter(ex =>
      normalizar(ex.titulo).startsWith(normalizar(termo))
    );

    offset = 0;
    renderizarResultados();
  } catch (erro) {
    console.error('Erro ao buscar exemplares:', erro);
  }
}

function renderizarResultados() {
  const tbody = document.querySelector('#tabelaLivros tbody');
  tbody.innerHTML = '';

  const slice = resultadosFiltrados.slice(offset, offset + limite);

  if (slice.length === 0 && document.getElementById('pesquisa').value.trim() !== '') {
    const linha = document.createElement('tr');
    linha.innerHTML = `<td colspan="4">Nenhum livro encontrado.</td>`;
    tbody.appendChild(linha);
    return;
  }

  slice.forEach(ex => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${ex.exemplar_id}</td>
      <td>${ex.titulo}</td>
      <td>${ex.autor}</td>
      <td>${ex.exemplar_status}</td>
    `;
    tbody.appendChild(linha);
  });

  const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
  botaoContainer.innerHTML = '';

  if (offset + limite < resultadosFiltrados.length) {
    const botao = document.createElement('button');
    botao.textContent = 'Carregar mais';
    botao.addEventListener('click', carregarMaisDisponiveis);
    botaoContainer.appendChild(botao);
  }
}

function carregarMaisDisponiveis() {
  offset = 0;
  const tbody = document.querySelector('#tabelaLivros tbody');
  tbody.innerHTML = '';

  resultadosFiltrados.forEach(ex => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${ex.exemplar_id}</td>
      <td>${ex.titulo}</td>
      <td>${ex.autor}</td>
      <td>${ex.exemplar_status}</td>
    `;
    tbody.appendChild(linha);
  });

  const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
  botaoContainer.innerHTML = '';
}

// Configuração dos eventos
function configurarEventos() {
  const campoBusca = document.getElementById('pesquisa');
  
  let timeoutBusca;

  if (campoBusca) {
    campoBusca.addEventListener('input', function() {
      clearTimeout(timeoutBusca);
      timeoutBusca = setTimeout(function() {
        realizarBusca();
      }, 500); 
    });

    campoBusca.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        clearTimeout(timeoutBusca);
        realizarBusca();
      }
    });
  }

  // Configurar evento do formulário
  const form = document.getElementById("formEmprestimo");
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      console.log("Interceptando envio do formulário");

      try {
        const raInput = document.getElementById("ra");
        const codigoInput = document.getElementById("codigoLivro");

        if (!raInput || !codigoInput) {
          mostrarPopupErro("Campos de entrada não encontrados no HTML.");
          return;
        }

        const ra = raInput.value.trim();
        const codigo = codigoInput.value.trim();

        // VALIDAÇÃO 1: Campos vazios
        if (!ra || !codigo) {
          mostrarPopupErro("Por favor, preencha todos os campos obrigatórios.");
          return;
        }

        // VALIDAÇÃO 2: Formato do RA (EXATAMENTE 8 números)
        if (!/^\d{8}$/.test(ra)) {
          mostrarPopupErro("RA inválido. Deve conter exatamente 8 números.");
          return;
        }

        // VALIDAÇÃO 3: Formato do código do exemplar (apenas números)
        if (!/^\d+$/.test(codigo)) {
          mostrarPopupErro("Código do livro inválido. Deve ser um número.");
          return;
        }

        // VALIDAÇÃO 4: Verificar se o RA existe na API
        console.log("Verificando se o RA existe...");
        let verificaRA;
        try {
          verificaRA = await fetch(`http://localhost:3000/alunos/ra/${ra}`);
        } catch (erro) {
          console.error('Erro na requisição do RA:', erro);
          mostrarPopupErro("Erro ao verificar RA. Tente novamente.");
          return;
        }
        
        if (!verificaRA.ok) {
          if (verificaRA.status === 404) {
            mostrarPopupErro("RA não encontrado. Verifique se o número está correto.");
          } else {
            mostrarPopupErro(`Erro ${verificaRA.status} ao verificar RA.`);
          }
          return;
        }

        let alunoData;
        try {
          alunoData = await verificaRA.json();
        } catch (erro) {
          console.error('Erro ao parsear resposta do RA:', erro);
          mostrarPopupErro("Erro ao processar dados do RA.");
          return;
        }
        
        if (!alunoData || (!alunoData.success && !alunoData.data)) {
          mostrarPopupErro("RA não encontrado no sistema.");
          return;
        }

        // VALIDAÇÃO 5: Verificar se o exemplar existe e está disponível
        console.log("Verificando disponibilidade do exemplar...");
        let verificaExemplar;
        try {
          verificaExemplar = await fetch(`http://localhost:3000/exemplares/${codigo}`);
        } catch (erro) {
          console.error('Erro na requisição do exemplar:', erro);
          mostrarPopupErro("Erro ao verificar exemplar. Tente novamente.");
          return;
        }
        
        if (!verificaExemplar.ok) {
          if (verificaExemplar.status === 404) {
            mostrarPopupErro("Exemplar não encontrado. Verifique o código do livro.");
          } else {
            mostrarPopupErro(`Erro ${verificaExemplar.status} ao verificar exemplar.`);
          }
          return;
        }

        let exemplarData;
        try {
          exemplarData = await verificaExemplar.json();
          console.log("Dados completos do exemplar:", exemplarData);
        } catch (erro) {
          console.error('Erro ao parsear resposta do exemplar:', erro);
          mostrarPopupErro("Erro ao processar dados do exemplar.");
          return;
        }

        if (!exemplarData || (!exemplarData.success && !exemplarData.data)) {
          mostrarPopupErro("Exemplar não encontrado no sistema.");
          return;
        }

        // CORREÇÃO: Verificar a estrutura correta do status
        let statusExemplar;

        if (exemplarData.data && exemplarData.data.exemplar_status) {
          statusExemplar = exemplarData.data.exemplar_status;
        } 
        else if (exemplarData.data && exemplarData.data.status) {
          statusExemplar = exemplarData.data.status;
        }
        else if (exemplarData.data && typeof exemplarData.data === 'string') {
          statusExemplar = exemplarData.data;
        }
        else if (exemplarData.status) {
          statusExemplar = exemplarData.status;
        }
        else {
          console.error("Estrutura desconhecida do exemplar:", exemplarData);
          mostrarPopupErro("Erro: Estrutura de dados do exemplar não reconhecida.");
          return;
        }

        console.log("Status do exemplar encontrado:", statusExemplar);

        // VALIDAÇÃO 6: Verificar se o exemplar está disponível
        if (statusExemplar !== 'Disponível' && statusExemplar !== 'Disponivel') {
          mostrarPopupErro(`Este exemplar não está disponível para empréstimo. Status atual: ${statusExemplar}`);
          return;
        }

        // VALIDAÇÃO 7: Verificar se o aluno não tem empréstimos em atraso
        console.log("Verificando empréstimos do aluno...");
        try {
          const emprestimosAluno = await fetch(`http://localhost:3000/emprestimos/aluno/${ra}/ativos`);
          
          if (emprestimosAluno.ok) {
            const emprestimosData = await emprestimosAluno.json();
            if (emprestimosData && emprestimosData.success && emprestimosData.data) {
              const emprestimosAtraso = emprestimosData.data.filter(emp => 
                new Date(emp.data_devolucao) < new Date() && emp.status === 'Ativo'
              );
              
              if (emprestimosAtraso.length > 0) {
                mostrarPopupErro("Aluno possui empréstimos em atraso. Regularize a situação antes de novo empréstimo.");
                return;
              }
            }
          }
        } catch (erro) {
          console.warn('Erro ao verificar empréstimos do aluno:', erro);
        }

        // Se todas as validações passaram, fazer o empréstimo
        console.log("Todas as validações passaram. Efetuando empréstimo...");

        // Buscar informações completas do livro antes de mostrar o popup de sucesso
        let livroInfo = { titulo: 'Informação não disponível' };

        try {
            // Se o exemplar já tem o título, usa ele
            if (exemplarData.data && exemplarData.data.titulo) {
                livroInfo.titulo = exemplarData.data.titulo;
            } 
            // Se não, busca as informações do livro pelo ID do exemplar
            else if (exemplarData.data && exemplarData.data.livro_id) {
                console.log("Buscando informações do livro...");
                const livroResponse = await fetch(`http://localhost:3000/livros/${exemplarData.data.livro_id}`);
                if (livroResponse.ok) {
                    const livroData = await livroResponse.json();
                    if (livroData.success && livroData.data) {
                        livroInfo.titulo = livroData.data.titulo || 'Título não encontrado';
                        console.log("Título do livro encontrado:", livroInfo.titulo);
                    }
                }
            }
            // Se ainda não encontrou, tenta buscar pelo ID do exemplar na rota de livros
            else {
                console.log("Tentando buscar livro pelo ID do exemplar...");
                const livroResponse = await fetch(`http://localhost:3000/livros`);
                if (livroResponse.ok) {
                    const livrosData = await livroResponse.json();
                    if (livrosData.success && livrosData.data) {
                        // Encontra o livro que tem este exemplar
                        const livroEncontrado = livrosData.data.find(livro => 
                            livro.exemplares && livro.exemplares.some(ex => ex.exemplar_id == codigo)
                        );
                        if (livroEncontrado) {
                            livroInfo.titulo = livroEncontrado.titulo;
                            console.log("Título do livro encontrado via lista:", livroInfo.titulo);
                        }
                    }
                }
            }
        } catch (erro) {
            console.warn('Erro ao buscar informações do livro:', erro);
            livroInfo.titulo = 'Erro ao buscar título';
        }

        const resposta = await fetch("http://localhost:3000/emprestimos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ raAluno: ra, idExemplar: codigo })
        });

        if (resposta.ok) {
          const resultado = await resposta.json();
          if (resultado.success) {
            mostrarPopupSucesso("Livro emprestado com sucesso!\n\nDetalhes:\n" +
              `- Livro: ${livroInfo.titulo}\n` +
              `- Exemplar: ${codigo}\n` +
              `- Aluno: ${alunoData.data.nome}\n` +
              `- RA: ${ra}\n` +
              `- Prazo de devolução: 7 dias úteis`);
            form.reset();
            realizarBusca();
          } else {
            mostrarPopupErro(resultado.error || "Erro ao processar empréstimo.");
          }
        } else {
          let mensagemErro = `Erro ${resposta.status}: Falha no empréstimo.`;

          try {
            const contentType = resposta.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const erroApi = await resposta.json();
              if (erroApi && (erroApi.error || erroApi.message)) {
                mensagemErro = erroApi.error || erroApi.message;
              }
            }
          } catch (jsonError) {
            console.error("Falha ao ler JSON de erro:", jsonError);
          }

          mostrarPopupErro("Erro: " + (mensagemErro || "Erro desconhecido."));
        }
      } catch (erro) {
        console.error("Erro ao enviar dados:", erro);
        if (erro.message.includes('Failed to fetch')) {
          mostrarPopupErro("Erro de conexão com o servidor. Verifique se a API está rodando.");
        } else {
          mostrarPopupErro("Erro inesperado: " + erro.message);
        }
      }
    });
  }
}

// Inicializar eventos quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", function() {
  configurarEventos();
  console.log("Sistema de empréstimo inicializado!");
});

//Popups de ERRO e SUCESSO
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
  document.getElementById('popupSucesso').style.display = 'flex';
}

function fecharPopupSucesso() {
  document.getElementById('popupSucesso').style.display = 'none';
}