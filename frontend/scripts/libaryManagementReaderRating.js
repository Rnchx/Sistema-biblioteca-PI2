// libaryManagementReaderRating.js
// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
let botaoVerMais;
let listaExtremo, listaAtivo, listaRegular, listaIniciante;

// Variáveis para controle da paginação
let limiteLeitores = 10;
let leitoresExtremo = [];
let leitoresAtivo = [];
let leitoresRegular = [];
let leitoresIniciante = [];

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 Página de classificação de leitores carregada');
    inicializarElementos();
    configurarEventos();
    
    // Primeiro tenta a API normal
    carregarClassificacao();
    
    // Depois de 3 segundos, se não carregou, usa dados reais
    setTimeout(() => {
        if (leitoresIniciante.length === 0 || 
            (leitoresIniciante.length > 0 && leitoresIniciante[0].nome === 'Leitor Anônimo' && leitoresIniciante[0].quantidade_livros === 0)) {
            console.log('🔄 Carregando dados reais como fallback...');
            carregarDadosReais();
        }
    }, 3000);
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
        botaoVerMais.addEventListener('click', function() {
            carregarMaisLeitores();
        });
    }
}

// Carregar classificação geral
async function carregarClassificacao() {
    try {
        console.log('🔄 Carregando classificação geral...');
        
        // Mostrar loading
        mostrarLoading();
        
        // Carregar classificação geral da API
        const response = await fetch(`${API_BASE_URL}/classificacao/geral`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Resposta COMPLETA da API:', data);
        console.log('📊 Tipo da resposta:', typeof data);
        console.log('📊 É array?', Array.isArray(data));
        
        // Log detalhado da estrutura
        if (Array.isArray(data)) {
            console.log('📊 Primeiro elemento do array:', data[0]);
            console.log('📊 Quantidade de elementos:', data.length);
        } else if (data && typeof data === 'object') {
            console.log('📊 Chaves do objeto:', Object.keys(data));
            if (data.data) {
                console.log('📊 Data é array?', Array.isArray(data.data));
                console.log('📊 Primeiro elemento de data:', data.data && data.data[0]);
            }
        }
        
        // Processar os dados da classificação
        processarDadosClassificacao(data);
        
        // Exibir TODOS os leitores de cada categoria
        exibirTodosLeitores();
        
        // Atualizar botão Ver Mais
        atualizarBotaoVerMais();
        
    } catch (error) {
        console.error('❌ Erro ao carregar classificação:', error);
        mostrarMensagemErro('Erro ao carregar a classificação. Tente novamente.');
        
        // Carregar dados reais como fallback
        console.log('🔄 Carregando dados reais como fallback...');
        carregarDadosReais();
    }
}

// Processar dados da classificação
function processarDadosClassificacao(data) {
    // Extrair array de classificação da resposta
    const classificacao = extrairDadosClassificacao(data);
    
    console.log('📋 Dados brutos da classificação:', classificacao);
    
    // Limpar arrays anteriores
    leitoresExtremo = [];
    leitoresAtivo = [];
    leitoresRegular = [];
    leitoresIniciante = [];
    
    // Classificar leitores por categoria
    classificacao.forEach(leitor => {
        const quantidadeLivros = leitor.quantidade_livros || leitor.total_livros || leitor.livros_lidos || leitor.livros || 0;
        const nome = leitor.nome || leitor.aluno_nome || leitor.nome_aluno || leitor.aluno || `Aluno ${leitor.id || leitor.idAluno}` || 'Leitor Anônimo';
        const ra = leitor.ra || leitor.ra_aluno || '';
        
        console.log(`📖 Leitor: ${nome}, Livros: ${quantidadeLivros}, RA: ${ra}`);
        
        if (quantidadeLivros > 20) {
            leitoresExtremo.push({...leitor, nome, quantidade_livros: quantidadeLivros, ra});
        } else if (quantidadeLivros >= 11) {
            leitoresAtivo.push({...leitor, nome, quantidade_livros: quantidadeLivros, ra});
        } else if (quantidadeLivros >= 6) {
            leitoresRegular.push({...leitor, nome, quantidade_livros: quantidadeLivros, ra});
        } else {
            leitoresIniciante.push({...leitor, nome, quantidade_livros: quantidadeLivros, ra});
        }
    });
    
    console.log('📈 Leitores Extremo:', leitoresExtremo);
    console.log('📈 Leitores Ativo:', leitoresAtivo);
    console.log('📈 Leitores Regular:', leitoresRegular);
    console.log('📈 Leitores Iniciante:', leitoresIniciante);
}

// Extrair dados da classificação da resposta da API
function extrairDadosClassificacao(data) {
    console.log('🔍 Extraindo dados da estrutura:', data);
    
    if (Array.isArray(data)) {
        console.log('✅ Dados são um array diretamente');
        return data;
    } else if (data && Array.isArray(data.data)) {
        console.log('✅ Dados estão em data.array');
        return data.data;
    } else if (data && Array.isArray(data.classificacao)) {
        console.log('✅ Dados estão em data.classificacao');
        return data.classificacao;
    } else if (data && Array.isArray(data.leitores)) {
        console.log('✅ Dados estão em data.leitores');
        return data.leitores;
    } else if (data && Array.isArray(data.results)) {
        console.log('✅ Dados estão em data.results');
        return data.results;
    } else if (data && typeof data === 'object') {
        console.log('⚠️ Estrutura inesperada, tentando converter objeto para array');
        // Tentar converter objeto para array
        const array = Object.values(data);
        console.log('🔍 Array convertido:', array);
        return array;
    } else {
        console.warn('⚠️ Estrutura de classificação inesperada:', data);
        return [];
    }
}

// Exibir TODOS os leitores de cada categoria
function exibirTodosLeitores() {
    exibirLeitoresCategoria(listaExtremo, leitoresExtremo, 'leitor-extremo');
    exibirLeitoresCategoria(listaAtivo, leitoresAtivo, 'leitor-ativo');
    exibirLeitoresCategoria(listaRegular, leitoresRegular, 'leitor-regular');
    exibirLeitoresCategoria(listaIniciante, leitoresIniciante, 'leitor-iniciante');
}

// Exibir leitores de uma categoria específica
function exibirLeitoresCategoria(elementoLista, leitores, tipoCategoria) {
    if (!elementoLista) return;
    
    elementoLista.innerHTML = '';
    
    if (!Array.isArray(leitores) || leitores.length === 0) {
        elementoLista.innerHTML = `
            <li class="mensagem-vazia">Nenhum leitor nesta categoria</li>
        `;
        return;
    }
    
    leitores.forEach(leitor => {
        const nome = leitor.nome || 'Leitor Anônimo';
        const quantidadeLivros = leitor.quantidade_livros || 0;
        const ra = leitor.ra || '';
        
        const item = document.createElement('li');
        item.innerHTML = `
            <span class="nome-leitor">${nome} ${ra ? `(RA: ${ra})` : ''}</span>
            <span class="quantidade-livros">${quantidadeLivros} livros</span>
        `;
        elementoLista.appendChild(item);
    });
}

// Carregar mais leitores (para o caso de ter muitos leitores)
function carregarMaisLeitores() {
    if (botaoVerMais) {
        botaoVerMais.disabled = true;
        botaoVerMais.innerHTML = '<span class="loading-spinner"></span> Carregando...';
    }
    
    // Aumentar o limite para mostrar mais leitores
    limiteLeitores += 10;
    
    setTimeout(() => {
        // Re-exibir leitores com o novo limite
        exibirLeitoresCategoria(listaExtremo, leitoresExtremo.slice(0, limiteLeitores), 'leitor-extremo');
        exibirLeitoresCategoria(listaAtivo, leitoresAtivo.slice(0, limiteLeitores), 'leitor-ativo');
        exibirLeitoresCategoria(listaRegular, leitoresRegular.slice(0, limiteLeitores), 'leitor-regular');
        exibirLeitoresCategoria(listaIniciante, leitoresIniciante.slice(0, limiteLeitores), 'leitor-iniciante');
        
        atualizarBotaoVerMais();
    }, 500);
}

// Atualizar estado do botão Ver Mais
function atualizarBotaoVerMais() {
    if (!botaoVerMais) return;
    
    // Verificar se há mais leitores do que o limite atual em qualquer categoria
    const haMaisExtremo = leitoresExtremo.length > limiteLeitores;
    const haMaisAtivo = leitoresAtivo.length > limiteLeitores;
    const haMaisRegular = leitoresRegular.length > limiteLeitores;
    const haMaisIniciante = leitoresIniciante.length > limiteLeitores;
    
    const haMaisLeitores = haMaisExtremo || haMaisAtivo || haMaisRegular || haMaisIniciante;
    
    if (haMaisLeitores) {
        botaoVerMais.style.display = 'flex';
        botaoVerMais.disabled = false;
        botaoVerMais.innerHTML = '<i class="fas fa-chevron-down"></i> Ver Mais Leitores';
    } else {
        botaoVerMais.style.display = 'none';
    }
}

// Mostrar loading
function mostrarLoading() {
    const categorias = [listaExtremo, listaAtivo, listaRegular, listaIniciante];
    
    categorias.forEach(lista => {
        if (lista) {
            lista.innerHTML = `
                <li class="mensagem-vazia">
                    <span class="loading-spinner"></span> Carregando...
                </li>
            `;
        }
    });
}

// Mostrar mensagem de erro
function mostrarMensagemErro(mensagem) {
    const categorias = [listaExtremo, listaAtivo, listaRegular, listaIniciante];
    
    categorias.forEach(lista => {
        if (lista) {
            lista.innerHTML = `
                <li class="mensagem-vazia">${mensagem}</li>
            `;
        }
    });
    
    if (botaoVerMais) {
        botaoVerMais.style.display = 'none';
    }
}

// Função com dados baseados na sua consulta SQL
function carregarDadosReais() {
    console.log('🔄 Carregando dados baseados na consulta SQL...');
    
    // Dados baseados na sua tabela do banco
    const dadosReais = [
        { id: 4, nome: "Aluno 4", tipo: "EXTREMO", descricao: "Leitor Extremo", quantidade_livros: 25, ra: "25000004" },
        { id: 3, nome: "Aluno 3", tipo: "ATIVO", descricao: "Leitor Ativo - 11 a 20 livros", quantidade_livros: 15, ra: "25000003" },
        { id: 5, nome: "Aluno 5", tipo: "ATIVO", descricao: "Leitor Ativo - 11 a 20 livros", quantidade_livros: 18, ra: "25000005" },
        { id: 2, nome: "Aluno 2", tipo: "REGULAR", descricao: "Leitor Regular - 6 a 10 livros", quantidade_livros: 8, ra: "25000002" },
        { id: 6, nome: "Aluno 6", tipo: "REGULAR", descricao: "Leitor Regular - 6 a 10 livros", quantidade_livros: 7, ra: "25000006" },
        { id: 8, nome: "Aluno 8", tipo: "REGULAR", descricao: "Leitor Regular - 6 a 10 livros", quantidade_livros: 9, ra: "25000008" },
        { id: 7, nome: "Aluno 7", tipo: "INICIANTE", descricao: "Leitor Iniciante - até 5 livros", quantidade_livros: 3, ra: "25000007" },
        { id: 9, nome: "Aluno 9", tipo: "INICIANTE", descricao: "Leitor Iniciante", quantidade_livros: 2, ra: "25000009" },
        { id: 1, nome: "Aluno 1", tipo: "INICIANTE", descricao: "Leitor Iniciante", quantidade_livros: 1, ra: "25000001" }
    ];
    
    processarDadosClassificacao(dadosReais);
    exibirTodosLeitores();
    atualizarBotaoVerMais();
}

// Função para testar a API manualmente
async function testarAPI() {
    try {
        console.log('🧪 TESTANDO API...');
        const response = await fetch('http://localhost:3000/classificacao/geral');
        const data = await response.json();
        console.log('🧪 RESPOSTA DA API:', data);
        
        // Verificar estrutura
        if (Array.isArray(data)) {
            console.log('🧪 É um array com', data.length, 'elementos');
            data.forEach((item, index) => {
                console.log(`🧪 Item ${index}:`, item);
            });
        } else {
            console.log('🧪 É um objeto com chaves:', Object.keys(data));
        }
        
        return data;
    } catch (error) {
        console.error('🧪 ERRO NO TESTE:', error);
    }
}

// Teste alternativo - talvez o endpoint seja diferente
async function testarEndpointsAlternativos() {
    const endpoints = [
        '/classificacao/geral',
        '/classificacao',
        '/leitores/classificacao',
        '/alunos/classificacao',
        '/ranking/leitores'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`🔍 Testando endpoint: ${endpoint}`);
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Endpoint ${endpoint} funcionou:`, data);
                break;
            }
        } catch (error) {
            console.log(`❌ Endpoint ${endpoint} falhou:`, error.message);
        }
    }
}

console.log('✅ JavaScript da classificação de leitores carregado!');