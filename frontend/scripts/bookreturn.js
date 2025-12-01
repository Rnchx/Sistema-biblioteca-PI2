/// Pesquisa de livros alugados
let resultadosFiltrados = [];
let offset = 0;
const limite = 6;

async function realizarBusca() {
  const input = document.getElementById('pesquisa');
  const termo = input.value.trim().toLowerCase();

  const tbody = document.querySelector('#tabelaLivros tbody');
  const thead = document.querySelector('#tabelaLivros thead');
  const tabela = document.getElementById('tabelaLivros');
  
  tbody.innerHTML = '';
  
  const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
  botaoContainer.innerHTML = '';
  botaoContainer.style.display = 'none';

  if (!termo) {
    // Se o campo estiver vazio, esconder a tabela completamente
    if (tabela) {
      tabela.style.display = 'none';
    }
    if (thead) {
      thead.style.display = 'none';
    }
    return;
  }

  // Mostrar a tabela quando houver pesquisa
  if (tabela) {
    tabela.style.display = 'table';
  }
  if (thead) {
    thead.style.display = '';
  }

  // Mostrar loading durante a busca
  botaoContainer.style.display = 'flex';
  botaoContainer.innerHTML = '<div class="sem-resultados"><i class="fas fa-spinner fa-spin"></i> Buscando livros alugados...</div>';

  try {
    const resposta = await fetch('http://localhost:3000/emprestimos/ativos');
    const resultado = await resposta.json();

    if (!resultado.success) {
      console.error("Erro da API:", resultado.error);
      botaoContainer.innerHTML = '<div class="sem-resultados">Erro ao buscar livros alugados. Tente novamente.</div>';
      return;
    }

    // Função auxiliar para normalizar texto
    function normalizarTexto(texto) {
      if (!texto) return '';
      return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    }

    const termoNormalizado = normalizarTexto(termo);
    
    // Função para calcular relevância da busca
    function calcularRelevancia(emprestimo) {
      const tituloNormalizado = normalizarTexto(emprestimo.livro_titulo);
      const autorNormalizado = normalizarTexto(emprestimo.autor);
      
      let pontuacao = 0;
      
      // 1. Título começa exatamente com o termo (maior relevância)
      if (tituloNormalizado.startsWith(termoNormalizado)) {
        pontuacao += 100;
      }
      
      // 2. Título contém o termo em qualquer posição
      if (tituloNormalizado.includes(termoNormalizado)) {
        pontuacao += 50;
      }
      
      // 3. Autor começa com o termo
      if (autorNormalizado.startsWith(termoNormalizado)) {
        pontuacao += 40;
      }
      
      // 4. Autor contém o termo
      if (autorNormalizado.includes(termoNormalizado)) {
        pontuacao += 20;
      }
      
      // 8. Busca por palavras individuais no título
      const palavrasTermo = termoNormalizado.split(/\s+/).filter(p => p.length > 2);
      const palavrasTitulo = tituloNormalizado.split(/\s+/);
      
      palavrasTermo.forEach(palavra => {
        if (palavrasTitulo.some(tituloPalavra => tituloPalavra.includes(palavra))) {
          pontuacao += 30;
        }
      });
      
      // 9. Busca por palavras individuais no autor
      const palavrasAutor = autorNormalizado.split(/\s+/);
      palavrasTermo.forEach(palavra => {
        if (palavrasAutor.some(autorPalavra => autorPalavra.includes(palavra))) {
          pontuacao += 15;
        }
      });
      
      return pontuacao;
    }

    // Filtrar e classificar resultados por relevância
    resultadosFiltrados = resultado.data
      .filter(emprestimo => {
        const tituloNormalizado = normalizarTexto(emprestimo.livro_titulo);
        const autorNormalizado = normalizarTexto(emprestimo.autor);
        
        // Aceita se encontrou em qualquer um desses campos
        return (
          tituloNormalizado.includes(termoNormalizado) ||
          autorNormalizado.includes(termoNormalizado) ||
          termoNormalizado.split(/\s+/).some(palavra => 
            palavra.length > 2 && (
              tituloNormalizado.includes(palavra) ||
              autorNormalizado.includes(palavra)
            )
          )
        );
      })
      .map(emprestimo => ({
        ...emprestimo,
        relevancia: calcularRelevancia(emprestimo)
      }))
      .sort((a, b) => b.relevancia - a.relevancia); // Ordenar por relevância decrescente

    offset = 0;
    
    // Pequeno delay para melhor UX
    setTimeout(() => {
      renderizarResultados();
    }, 300);
    
  } catch (erro) {
    console.error('Erro ao buscar empréstimos ativos:', erro);
    botaoContainer.innerHTML = '<div class="sem-resultados"><i class="fas fa-exclamation-triangle"></i> Erro na conexão com o servidor</div>';
  }
}

function renderizarResultados() {
  const tbody = document.querySelector('#tabelaLivros tbody');
  const tabela = document.getElementById('tabelaLivros');
  const thead = document.querySelector('#tabelaLivros thead');
  const termoPesquisa = document.getElementById('pesquisa').value.trim();
  
  tbody.innerHTML = '';

  const slice = resultadosFiltrados.slice(offset, offset + limite);

  if (slice.length === 0 && document.getElementById('pesquisa').value.trim() !== '') {
    const linha = document.createElement('tr');
    linha.innerHTML = `<td colspan="5">Nenhum livro alugado encontrado para "${termoPesquisa}".</td>`;
    tbody.appendChild(linha);
    
    // Garantir que a tabela esteja visível
    if (tabela) {
      tabela.style.display = 'table';
    }
    if (thead) {
      thead.style.display = '';
    }
    
    // Mostrar mensagem no container do botão
    const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
    botaoContainer.innerHTML = `<div class="sem-resultados">Nenhum empréstimo encontrado para "<strong>${termoPesquisa}</strong>"</div>`;
    botaoContainer.style.display = 'flex';
    return;
  }

  // Garantir que a tabela esteja visível quando houver resultados
  if (slice.length > 0) {
    if (tabela) {
      tabela.style.display = 'table';
    }
    if (thead) {
      thead.style.display = '';
    }
  }

  // Função para destacar o termo encontrado
  function destacarTermo(texto, termo) {
    if (!termo || !texto) return texto;
    
    try {
      const regex = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return texto.replace(regex, '<span class="termo-destacado">$1</span>');
    } catch (e) {
      console.warn('Erro ao criar regex para destaque:', e);
      return texto;
    }
  }

  slice.forEach((ex, index) => {
    const linha = document.createElement('tr');
    linha.style.animationDelay = `${index * 0.05}s`;
    
    // Destacar o termo encontrado no título, autor e nome do aluno
    const tituloDestacado = destacarTermo(ex.livro_titulo, termoPesquisa);
    const autorDestacado = destacarTermo(ex.autor, termoPesquisa);
    
    // Verificar se está atrasado
    const hoje = new Date();
    const dataDev = new Date(ex.data_devolucao);
    const status = hoje > dataDev ? 'Em atraso' : 'Alugado';
    const statusClass = hoje > dataDev ? 'status-indisponivel' : 'status-disponivel';
    
    linha.innerHTML = `
      <td>${ex.exemplar_id}</td>
      <td>${tituloDestacado}</td>
      <td>${autorDestacado}</td>
      <td><span class="${statusClass}">${status}</span></td>
    `;
    tbody.appendChild(linha);
  });

  const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
  botaoContainer.innerHTML = '';
  botaoContainer.style.display = 'none';

  if (offset + limite < resultadosFiltrados.length) {
    const botao = document.createElement('button');
    botao.innerHTML = '<i class="fas fa-book"></i> Carregar mais empréstimos';
    botao.setAttribute('title', `Mostrar mais ${resultadosFiltrados.length - (offset + limite)} empréstimos`);
    
    botao.addEventListener('click', async function() {
      botao.classList.add('loading');
      botao.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      carregarMaisAlugados();
      
      setTimeout(() => {
        botao.classList.remove('loading');
        botao.innerHTML = '<i class="fas fa-book"></i> Carregar mais empréstimos';
      }, 500);
    });
    
    botaoContainer.appendChild(botao);
    botaoContainer.style.display = 'flex';
    
    const contador = document.createElement('div');
    contador.className = 'contador-resultados';
    contador.innerHTML = `Mostrando ${Math.min(offset + limite, resultadosFiltrados.length)} de ${resultadosFiltrados.length} empréstimos`;
    botaoContainer.appendChild(contador);
  } else if (resultadosFiltrados.length > 0) {
    const mensagem = document.createElement('div');
    mensagem.className = 'sem-resultados';
    mensagem.innerHTML = `<i class="fas fa-check-circle"></i> Todos os ${resultadosFiltrados.length} empréstimos foram carregados`;
    botaoContainer.appendChild(mensagem);
    botaoContainer.style.display = 'flex';
  }
}

function carregarMaisAlugados() {
  offset += limite;
  const tbody = document.querySelector('#tabelaLivros tbody');
  const termoPesquisa = document.getElementById('pesquisa').value.trim();
  
  // Função para destacar o termo encontrado
  function destacarTermo(texto, termo) {
    if (!termo || !texto) return texto;
    
    try {
      const regex = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return texto.replace(regex, '<span class="termo-destacado">$1</span>');
    } catch (e) {
      console.warn('Erro ao criar regex para destaque:', e);
      return texto;
    }
  }

  // Manter os resultados anteriores e adicionar novos
  const novosResultados = resultadosFiltrados.slice(offset, offset + limite);
  
  novosResultados.forEach((ex, index) => {
    const linha = document.createElement('tr');
    linha.style.animationDelay = `${index * 0.05}s`;
    linha.classList.add('highlight-new'); // Adicionar classe para highlight
    
    // Destacar o termo encontrado no título, autor e nome do aluno
    const tituloDestacado = destacarTermo(ex.livro_titulo, termoPesquisa);
    const autorDestacado = destacarTermo(ex.autor, termoPesquisa);
    const alunoDestacado = ex.aluno_nome ? destacarTermo(ex.aluno_nome, termoPesquisa) : 'Não informado';
    const raDestacado = ex.ra ? destacarTermo(ex.ra, termoPesquisa) : 'Não informado';
    
    // Formatar data de devolução
    const dataDevolucao = ex.data_devolucao ? 
      new Date(ex.data_devolucao).toLocaleDateString('pt-BR') : 
      'Não definida';
    
    // Verificar se está atrasado
    const hoje = new Date();
    const dataDev = new Date(ex.data_devolucao);
    const status = hoje > dataDev ? 'Em atraso' : 'Alugado';
    const statusClass = hoje > dataDev ? 'status-indisponivel' : 'status-disponivel';
    
    linha.innerHTML = `
      <td>${ex.exemplar_id}</td>
      <td>${tituloDestacado}</td>
      <td>${autorDestacado}</td>
      <td>${alunoDestacado}<br><small>RA: ${raDestacado}</small></td>
      <td><span class="${statusClass}">${status}</span><br><small>Devolver até: ${dataDevolucao}</small></td>
    `;
    tbody.appendChild(linha);
  });

  // Atualizar botão e contador
  const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
  botaoContainer.innerHTML = '';
  botaoContainer.style.display = 'none';

  if (offset + limite < resultadosFiltrados.length) {
    const botao = document.createElement('button');
    botao.innerHTML = '<i class="fas fa-book"></i> Carregar mais empréstimos';
    botao.setAttribute('title', `Mostrar mais ${resultadosFiltrados.length - (offset + limite)} empréstimos`);
    
    botao.addEventListener('click', async function() {
      botao.classList.add('loading');
      botao.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      carregarMaisAlugados();
      
      setTimeout(() => {
        botao.classList.remove('loading');
        botao.innerHTML = '<i class="fas fa-book"></i> Carregar mais empréstimos';
      }, 500);
    });
    
    botaoContainer.appendChild(botao);
    botaoContainer.style.display = 'flex';
    
    // Atualizar contador
    const contador = document.createElement('div');
    contador.className = 'contador-resultados';
    contador.innerHTML = `Mostrando ${Math.min(offset + limite, resultadosFiltrados.length)} de ${resultadosFiltrados.length} empréstimos`;
    botaoContainer.appendChild(contador);
  } else {
    // Todos os resultados foram carregados
    const mensagem = document.createElement('div');
    mensagem.className = 'sem-resultados';
    mensagem.innerHTML = `<i class="fas fa-check-circle"></i> Todos os ${resultadosFiltrados.length} empréstimos foram carregados`;
    botaoContainer.appendChild(mensagem);
    botaoContainer.style.display = 'flex';
  }
  
  // Rolagem suave para os novos resultados
  setTimeout(() => {
    const novasLinhas = tbody.querySelectorAll('tr.highlight-new');
    if (novasLinhas.length > 0) {
      const ultimaLinha = novasLinhas[novasLinhas.length - 1];
      ultimaLinha.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Remover classe de highlight após animação
      setTimeout(() => {
        novasLinhas.forEach(linha => linha.classList.remove('highlight-new'));
      }, 1500);
    }
  }, 100);
}

// Configuração dos eventos
function configurarEventos() {
  const campoBusca = document.getElementById('pesquisa');
  
  let timeoutBusca;

  if (campoBusca) {
    campoBusca.addEventListener('input', function() {
      clearTimeout(timeoutBusca);
      
      // Se o campo estiver vazio, limpar tudo imediatamente
      if (!this.value.trim()) {
        const tbody = document.querySelector('#tabelaLivros tbody');
        const thead = document.querySelector('#tabelaLivros thead');
        const tabela = document.getElementById('tabelaLivros');
        const botaoContainer = document.getElementById('botaoCarregarMaisContainer');
        
        if (tbody) {
          tbody.innerHTML = '';
        }
        if (tabela) {
          tabela.style.display = 'none';
        }
        if (thead) {
          thead.style.display = 'none';
        }
        if (botaoContainer) {
          botaoContainer.innerHTML = '';
          botaoContainer.style.display = 'none';
        }
        
        // Limpar resultados filtrados
        resultadosFiltrados = [];
        offset = 0;
        return;
      }
      
      // Busca imediata se for um número (código do livro ou RA)
      if (/^\d+$/.test(this.value.trim())) {
        realizarBusca();
        return;
      }
      
      timeoutBusca = setTimeout(function() {
        realizarBusca();
      }, 400); // Reduzido para resposta mais rápida
    });

    campoBusca.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        clearTimeout(timeoutBusca);
        realizarBusca();
      }
    });
  }

  // Configurar evento do formulário de devolução
  const formDevolucao = document.getElementById("formDevolucao");
  if (formDevolucao) {
    formDevolucao.addEventListener("submit", async function (event) {
      event.preventDefault();
      console.log("=== INICIANDO PROCESSO DE DEVOLUÇÃO ===");

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

        console.log(`Enviando para API: RA=${ra}, Código=${codigo}`);

        // Enviar para API
        const resposta = await fetch("http://localhost:3000/emprestimos/devolucao", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            ra: ra, 
            codigoLivro: codigo 
          })
        });

        console.log("Status da resposta:", resposta.status);

        const resultado = await resposta.json();
        console.log("Resposta da API:", resultado);

        if (resposta.ok && resultado.success) {
          mostrarPopupSucesso(`Livro devolvido com sucesso!\n\n` +
            `Aluno: ${resultado.data.aluno.nome}\n` +
            `RA: ${resultado.data.aluno.ra}\n` +
            `Livro: ${resultado.data.livro.titulo}\n` +
            `Autor: ${resultado.data.livro.autor}\n` +
            `Exemplar: ${resultado.data.livro.exemplarId}`);
          
          // Limpar formulário
          formDevolucao.reset();
          
          // Atualizar lista de livros alugados
          realizarBusca();
          
        } else {
          mostrarPopupErro(resultado.mensagem || resultado.error || "Erro ao processar devolução.");
        }

      } catch (erro) {
        console.error("Erro completo:", erro);
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
  console.log("✅ Sistema de devolução inicializado!");
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
  const popup = document.getElementById("popupSucesso");
  const texto = document.getElementById("mensagemSucesso");
  texto.textContent = mensagem;
  popup.style.display = "flex";
}

function fecharPopupSucesso() {
  document.getElementById("popupSucesso").style.display = "none";
}

// Funções auxiliares para debug
window.recarregarBusca = realizarBusca;
window.mostrarResultados = function() {
  console.log('Resultados filtrados:', resultadosFiltrados);
  console.log('Offset atual:', offset);
  console.log('Total de empréstimos:', resultadosFiltrados.length);
};