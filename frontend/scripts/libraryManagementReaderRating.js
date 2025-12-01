// libaryManagementReaderRating.js - VERSÃO CORRIGIDA E DEPURADA
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
let botaoVerMais;
let listaExtremo, listaAtivo, listaRegular, listaIniciante;

// Variáveis para controle
let limiteLeitores = 10;
let leitoresExtremo = [];
let leitoresAtivo = [];
let leitoresRegular = [];
let leitoresIniciante = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 Página de classificação de leitores carregada');
    inicializarElementos();
    configurarEventos();
    carregarClassificacao();
    
    // Depurar API ao carregar (opcional)
    setTimeout(depurarAPI, 1000);
});

function inicializarElementos() {
    botaoVerMais = document.getElementById('botaoVerMais');
    listaExtremo = document.getElementById('listaExtremo');
    listaAtivo = document.getElementById('listaAtivo');
    listaRegular = document.getElementById('listaRegular');
    listaIniciante = document.getElementById('listaIniciante');
}

function configurarEventos() {
    if (botaoVerMais) {
        botaoVerMais.addEventListener('click', carregarMaisLeitores);
    }
    
    // Botão de recarregar para testes
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            carregarClassificacao();
        }
    });
}

// Carregar classificação geral
async function carregarClassificacao() {
    try {
        console.log('🔄 Carregando classificação geral...');
        mostrarLoading();
        
        const response = await fetch(`${API_BASE_URL}/classificacao/geral`);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        
        const data = await response.json();
        console.log('📊 Resposta da API:', data);
        
        processarDadosClassificacao(data);
        
    } catch (error) {
        console.error('❌ Erro ao carregar classificação:', error);
        mostrarMensagemErro('Erro ao carregar a classificação. Tente novamente.');
    }
}

// Processar dados da classificação - VERSÃO ROBUSTA
function processarDadosClassificacao(data) {
    if (!data || !data.success) {
        console.error('❌ Dados inválidos da API');
        mostrarMensagemErro('Dados inválidos recebidos da API');
        return;
    }

    console.log('📋 Estrutura completa dos dados:', data);

    // Limpar arrays
    leitoresExtremo = [];
    leitoresAtivo = [];
    leitoresRegular = [];
    leitoresIniciante = [];

    // Verificar diferentes estruturas de dados
    const dados = data.data;
    
    if (!Array.isArray(dados)) {
        console.error('❌ Dados não são um array:', dados);
        mostrarMensagemErro('Formato de dados inválido');
        return;
    }

    if (dados.length === 0) {
        console.warn('⚠️ Nenhum dado retornado pela API');
        mostrarMensagemErro('Nenhum dado disponível para exibição');
        return;
    }

    // ANALISAR a estrutura do primeiro item
    const primeiroItem = dados[0];
    console.log('🔍 Estrutura do primeiro item:', primeiroItem);
    console.log('🔍 Chaves do primeiro item:', Object.keys(primeiroItem));

    dados.forEach((item, index) => {
        let nome, ra, tipo, livros_lidos;

        // TENTATIVA 1: Verificar se os dados estão no formato plano
        if (item.nome !== undefined) {
            nome = item.nome;
            ra = item.ra || '';
            tipo = item.tipo || 'INICIANTE';
            livros_lidos = item.livros_lidos || item.quantidade_livros || 0;
        }
        // TENTATIVA 2: Verificar se há objeto aluno
        else if (item.aluno && item.aluno.nome !== undefined) {
            nome = item.aluno.nome;
            ra = item.aluno.ra || '';
            tipo = item.tipo || (item.classificacao ? item.classificacao.tipo : 'INICIANTE');
            livros_lidos = item.livros_lidos || 
                          (item.estatisticas ? item.estatisticas.totalLivrosLidos : 0) ||
                          (item.classificacao ? item.classificacao.totalLivrosLidos : 0);
        }
        // TENTATIVA 3: Outras estruturas possíveis
        else {
            console.warn(`⚠️ Estrutura não reconhecida para item ${index}:`, item);
            nome = `Aluno ${index + 1}`;
            ra = '';
            tipo = 'INICIANTE';
            livros_lidos = 0;
        }

        // Garantir valores válidos
        nome = nome || `Aluno ${index + 1}`;
        tipo = (tipo || 'INICIANTE').toUpperCase();
        livros_lidos = parseInt(livros_lidos) || 0;

        console.log(`✅ Processado ${index}: "${nome}", Tipo: ${tipo}, Livros: ${livros_lidos}`);

        const leitor = {
            nome: nome,
            ra: ra,
            tipo: tipo,
            quantidade_livros: livros_lidos
        };

        // Classificar
        switch(tipo) {
            case 'EXTREMO':
                leitoresExtremo.push(leitor);
                break;
            case 'ATIVO':
                leitoresAtivo.push(leitor);
                break;
            case 'REGULAR':
                leitoresRegular.push(leitor);
                break;
            default: // INICIANTE ou qualquer outro
                leitoresIniciante.push(leitor);
                break;
        }
    });

    console.log('📊 Resultado:');
    console.log('- Extremo:', leitoresExtremo.length);
    console.log('- Ativo:', leitoresAtivo.length);
    console.log('- Regular:', leitoresRegular.length);
    console.log('- Iniciante:', leitoresIniciante.length);

    exibirTodosLeitores();
    atualizarBotaoVerMais();
}

function exibirTodosLeitores() {
    console.log('🎯 Exibindo leitores...');
    exibirLeitoresCategoria(listaExtremo, leitoresExtremo);
    exibirLeitoresCategoria(listaAtivo, leitoresAtivo);
    exibirLeitoresCategoria(listaRegular, leitoresRegular);
    exibirLeitoresCategoria(listaIniciante, leitoresIniciante);
}

function exibirLeitoresCategoria(elementoLista, leitores) {
    if (!elementoLista) return;
    
    elementoLista.innerHTML = '';
    
    if (!Array.isArray(leitores) || leitores.length === 0) {
        const mensagemItem = document.createElement('li');
        mensagemItem.className = 'mensagem-vazia';
        mensagemItem.textContent = 'Nenhum leitor nesta categoria';
        elementoLista.appendChild(mensagemItem);
        return;
    }
    
    leitores.forEach((leitor, index) => {
        const nome = leitor.nome || `Leitor ${index + 1}`;
        const quantidadeLivros = leitor.quantidade_livros || 0;
        const ra = leitor.ra ? `(RA: ${leitor.ra})` : '';
        
        const item = document.createElement('li');
        
        // Nome e RA
        const nomeSpan = document.createElement('span');
        nomeSpan.className = 'nome-leitor';
        nomeSpan.textContent = `${nome} ${ra}`;
        
        // Quantidade de livros
        const livrosSpan = document.createElement('span');
        livrosSpan.className = 'quantidade-livros';
        livrosSpan.textContent = `${quantidadeLivros} livro${quantidadeLivros !== 1 ? 's' : ''}`;
        
        item.appendChild(nomeSpan);
        item.appendChild(livrosSpan);
        
        elementoLista.appendChild(item);
    });
}

function carregarMaisLeitores() {
    if (botaoVerMais) {
        botaoVerMais.disabled = true;
        botaoVerMais.innerHTML = '<span class="loading-spinner"></span> Carregando...';
    }
    
    limiteLeitores += 10;
    
    setTimeout(() => {
        exibirLeitoresCategoria(listaExtremo, leitoresExtremo.slice(0, limiteLeitores));
        exibirLeitoresCategoria(listaAtivo, leitoresAtivo.slice(0, limiteLeitores));
        exibirLeitoresCategoria(listaRegular, leitoresRegular.slice(0, limiteLeitores));
        exibirLeitoresCategoria(listaIniciante, leitoresIniciante.slice(0, limiteLeitores));
        
        atualizarBotaoVerMais();
    }, 500);
}

function atualizarBotaoVerMais() {
    if (!botaoVerMais) return;
    
    const haMaisLeitores = 
        leitoresExtremo.length > limiteLeitores ||
        leitoresAtivo.length > limiteLeitores ||
        leitoresRegular.length > limiteLeitores ||
        leitoresIniciante.length > limiteLeitores;
    
    if (haMaisLeitores) {
        botaoVerMais.style.display = 'flex';
        botaoVerMais.disabled = false;
        botaoVerMais.innerHTML = '<i class="fas fa-chevron-down"></i> Ver Mais Leitores';
    } else {
        botaoVerMais.style.display = 'none';
    }
}

function mostrarLoading() {
    const categorias = [listaExtremo, listaAtivo, listaRegular, listaIniciante];
    categorias.forEach(lista => {
        if (lista) {
            lista.innerHTML = '<li class="mensagem-vazia"><span class="loading-spinner"></span> Carregando...</li>';
        }
    });
}

function mostrarMensagemErro(mensagem) {
    const categorias = [listaExtremo, listaAtivo, listaRegular, listaIniciante];
    categorias.forEach(lista => {
        if (lista) {
            lista.innerHTML = `<li class="mensagem-vazia">${mensagem}</li>`;
        }
    });
    if (botaoVerMais) botaoVerMais.style.display = 'none';
}

// FUNÇÃO DE DEPURAÇÃO CRÍTICA
async function depurarAPI() {
    try {
        console.log('🔍 =========== DEPURAÇÃO DA API ===========');
        const response = await fetch('http://localhost:3000/classificacao/geral');
        const data = await response.json();
        
        console.log('🔍 Status da resposta:', response.status);
        console.log('🔍 Dados COMPLETOS:', JSON.stringify(data, null, 2));
        
        if (data && data.success && Array.isArray(data.data)) {
            console.log('🔍 Total de itens:', data.data.length);
            
            // Analisar estrutura do primeiro item
            const primeiro = data.data[0];
            console.log('🔍 Primeiro item completo:', primeiro);
            console.log('🔍 Chaves do primeiro item:', Object.keys(primeiro));
            
            // Mostrar o nome de TODOS os alunos
            data.data.forEach((item, i) => {
                console.log(`🔍 Item ${i}:`, {
                    nome: item.nome,
                    'item.aluno?.nome': item.aluno?.nome,
                    'item.classificacao': item.classificacao,
                    'item.tipo': item.tipo,
                    'item.livros_lidos': item.livros_lidos,
                    'item.estatisticas': item.estatisticas
                });
            });
        } else {
            console.error('🔍 Estrutura de dados inválida!');
        }
        
    } catch (error) {
        console.error('🔍 Erro na depuração:', error);
    }
}

// Expor funções para testes no console
window.recarregarClassificacao = carregarClassificacao;
window.depurarAPI = depurarAPI;
window.mostrarDados = function() {
    console.log('Leitores Extremo:', leitoresExtremo);
    console.log('Leitores Ativo:', leitoresAtivo);
    console.log('Leitores Regular:', leitoresRegular);
    console.log('Leitores Iniciante:', leitoresIniciante);
};

console.log('✅ JavaScript da classificação de leitores carregado!');
console.log('💡 Dica: Use depurarAPI() no console para ver os dados da API');