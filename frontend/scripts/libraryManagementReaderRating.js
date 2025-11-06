// libaryManagementReaderRating.js - VERSÃO CORRIGIDA
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
}

// Carregar classificação geral
async function carregarClassificacao() {
    try {
        console.log('🔄 Carregando classificação geral...');
        mostrarLoading();
        
        const response = await fetch(`${API_BASE_URL}/classificacao/geral`);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        
        const data = await response.json();
        console.log('📊 Resposta COMPLETA da API:', data);
        
        processarDadosClassificacao(data);
        
    } catch (error) {
        console.error('❌ Erro ao carregar classificação:', error);
        mostrarMensagemErro('Erro ao carregar a classificação. Tente novamente.');
    }
}

// Processar dados da classificação - CORRIGIDO
function processarDadosClassificacao(data) {
    const classificacao = extrairDadosClassificacao(data);
    
    console.log('📋 Dados brutos da classificação:', classificacao);
    
    // Limpar arrays
    leitoresExtremo = [];
    leitoresAtivo = [];
    leitoresRegular = [];
    leitoresIniciante = [];
    
    // Processar cada aluno
    classificacao.forEach(item => {
        const aluno = item.aluno || {};
        const classificacaoInfo = item.classificacao || {};
        
        const nome = aluno.nome || 'Leitor Anônimo';
        const ra = aluno.ra || '';
        const tipo = classificacaoInfo.tipo || '';
        
        // ⚠️ IMPORTANTE: Usar totalLivros REAL do backend, não estimar!
        const totalLivros = classificacaoInfo.totalLivros || 0;
        
        console.log(`📖 Processando: ${nome}, Tipo: ${tipo}, Livros REAL: ${totalLivros}, RA: ${ra}`);
        
        const leitor = {
            nome,
            ra,
            tipo,
            quantidade_livros: totalLivros // Usar o valor REAL
        };
        
        // Classificar pelo tipo CORRETO
        if (tipo === 'EXTREMO') {
            leitoresExtremo.push(leitor);
        } else if (tipo === 'ATIVO') {
            leitoresAtivo.push(leitor);
        } else if (tipo === 'REGULAR') {
            leitoresRegular.push(leitor);
        } else {
            leitoresIniciante.push(leitor);
        }
    });
    
    console.log('📈 Leitores Extremo:', leitoresExtremo);
    console.log('📈 Leitores Ativo:', leitoresAtivo);
    console.log('📈 Leitores Regular:', leitoresRegular);
    console.log('📈 Leitores Iniciante:', leitoresIniciante);
    
    exibirTodosLeitores();
    atualizarBotaoVerMais();
}

function extrairDadosClassificacao(data) {
    if (data && data.success && Array.isArray(data.data)) {
        return data.data;
    }
    return [];
}

function exibirTodosLeitores() {
    console.log('🎯 Exibindo leitores...');
    exibirLeitoresCategoria(listaExtremo, leitoresExtremo);
    exibirLeitoresCategoria(listaAtivo, leitoresAtivo);
    exibirLeitoresCategoria(listaRegular, leitoresRegular);
    exibirLeitoresCategoria(listaIniciante, leitoresIniciante);
}

// Exibir leitores - CORREÇÃO DA FORMATAÇÃO
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
    
    leitores.forEach(leitor => {
        const nome = leitor.nome || 'Leitor Anônimo';
        const quantidadeLivros = leitor.quantidade_livros || 0;
        const ra = leitor.ra || '';
        
        const item = document.createElement('li');
        
        // CORREÇÃO: Criar elementos corretamente
        const nomeSpan = document.createElement('span');
        nomeSpan.className = 'nome-leitor';
        nomeSpan.textContent = `${nome} ${ra ? `(RA: ${ra})` : ''}`;
        
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

// Funções de debug
async function testarAPI() {
    try {
        console.log('🧪 TESTANDO API...');
        const response = await fetch('http://localhost:3000/classificacao/geral');
        const data = await response.json();
        console.log('🧪 RESPOSTA DA API:', data);
        
        if (data && data.success && data.data) {
            console.log('🧪 Estrutura do primeiro aluno:', data.data[0]);
            console.log('🧪 TotalLivros do primeiro aluno:', data.data[0].classificacao.totalLivros);
        }
        
        return data;
    } catch (error) {
        console.error('🧪 ERRO NO TESTE:', error);
    }
}

function recarregarClassificacao() {
    carregarClassificacao();
}

console.log('✅ JavaScript da classificação de leitores carregado!');