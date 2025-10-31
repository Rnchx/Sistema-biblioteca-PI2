const API_BASE_URL = 'http://localhost:3000';

let alunoLogado = null;

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página de classificação carregada');
    
    // Verificar login e carregar dados
    alunoLogado = verificarLogin();
    
    if (alunoLogado) {
        console.log('✅ Aluno logado:', alunoLogado.nome);
        inicializarPagina();
    } else {
        console.log('❌ Aluno não logado');
    }
});

// Verificação de login
function verificarLogin() {
    const alunoLogado = JSON.parse(sessionStorage.getItem('alunoLogado'));
    
    if (!alunoLogado || !alunoLogado.loggedIn) {
        alert('Você precisa fazer login para acessar esta página');
        window.location.href = './loginPage.html';
        return null;
    }
    
    // Verificar se a sessão expirou (8 horas)
    const tempoExpiracao = 8 * 60 * 60 * 1000;
    const tempoAtual = new Date().getTime();
    
    if (tempoAtual - alunoLogado.timestamp > tempoExpiracao) {
        alert('Sessão expirou. Faça login novamente.');
        sessionStorage.removeItem('alunoLogado');
        window.location.href = './loginPage.html';
        return null;
    }
    
    return alunoLogado;
}

// Inicializar página
async function inicializarPagina() {
    try {
        console.log('🎯 Inicializando página...');
        
        // Adicionar informações do aluno no header
        adicionarInfoAlunoHeader(alunoLogado);
        
        // Atualizar nome do aluno
        document.getElementById('nomeAlunoTexto').textContent = alunoLogado.nome;
        
        // Carregar classificação do leitor
        await carregarClassificacaoLeitor();
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        mostrarErroClassificacao();
    }
}

// Adicionar informações do aluno no header
function adicionarInfoAlunoHeader(aluno) {
    const faixaAzul = document.getElementById('containerFaixaAzul');
    if (faixaAzul) {
        // Remover info anterior se existir
        const infoAnterior = faixaAzul.querySelector('.info-aluno-header');
        if (infoAnterior) {
            infoAnterior.remove();
        }

        const infoAluno = document.createElement('div');
        infoAluno.className = 'info-aluno-header';
        infoAluno.innerHTML = `
            <i class="fas fa-user" style="margin-right: 5px;"></i>
            ${aluno.nome} | RA: ${aluno.ra}
        `;
        faixaAzul.appendChild(infoAluno);
        
        console.log('📝 Informações do aluno adicionadas no header');
    }
}

// Carregar classificação do leitor da API
async function carregarClassificacaoLeitor() {
    try {
        console.log('📊 Iniciando carregamento da classificação...');
        
        // Mostrar estado de carregamento
        document.getElementById('tituloClassificacao').textContent = 'CARREGANDO...';
        document.getElementById('descricaoClassificacao').textContent = 'Aguarde enquanto buscamos sua classificação';
        
        console.log('🔍 Buscando classificação para RA:', alunoLogado.ra);
        
        // Buscar classificação na API
        const response = await fetch(`${API_BASE_URL}/classificacao/aluno/${alunoLogado.ra}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📨 Resposta da API:', data);
        
        if (data.success && data.data) {
            console.log('✅ Dados recebidos da API');
            const classificacaoData = data.data.classificacao;
            exibirClassificacao(classificacaoData);
        } else {
            console.log('⚠️ Nenhum dado da API, calculando localmente...');
            // Se não tiver classificação, calcular baseada nos empréstimos
            await calcularEExibirClassificacao();
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar classificação:', error);
        // Tentar calcular localmente em caso de erro
        await calcularEExibirClassificacao();
    }
}

// Calcular classificação baseada nos empréstimos dos últimos 6 meses
async function calcularEExibirClassificacao() {
    try {
        console.log('🧮 Calculando classificação localmente...');
        
        // Buscar histórico de empréstimos dos últimos 6 meses
        const emprestimos = await buscarHistoricoEmprestimos();
        const totalLivros = emprestimos.length;
        
        console.log(`📚 Total de livros lidos nos últimos 6 meses: ${totalLivros}`);
        
        // Determinar classificação baseada nos critérios corretos
        const classificacao = determinarClassificacao(totalLivros);
        
        exibirClassificacao(classificacao);
        
    } catch (error) {
        console.error('❌ Erro ao calcular classificação:', error);
        mostrarErroClassificacao();
    }
}

// Buscar histórico de empréstimos dos últimos 6 meses
async function buscarHistoricoEmprestimos() {
    try {
        console.log('🔍 Buscando histórico de empréstimos...');
        const response = await fetch(`${API_BASE_URL}/emprestimos/aluno/${alunoLogado.ra}/historico`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📨 Histórico recebido:', data);
        return data.success ? data.data : [];
        
    } catch (error) {
        console.error('❌ Erro ao buscar histórico:', error);
        return [];
    }
}

// Determinar classificação baseada nos critérios corretos
function determinarClassificacao(totalLivros) {
    console.log(`🎯 Determinando classificação para ${totalLivros} livros...`);
    
    let tipo, descricao;
    
    if (totalLivros > 20) {
        tipo = 'EXTREMO';
        descricao = 'MAIS DE 20 LIVROS';
    } else if (totalLivros >= 11 && totalLivros <= 20) {
        tipo = 'ATIVO';
        descricao = '11 A 20 LIVROS';
    } else if (totalLivros >= 6 && totalLivros <= 10) {
        tipo = 'REGULAR';
        descricao = '6 A 10 LIVROS';
    } else {
        tipo = 'INICIANTE';
        descricao = totalLivros > 0 ? `ATÉ 5 LIVROS` : 'NENHUM LIVRO AINDA';
    }
    
    console.log(`🏷️ Classificação determinada: ${tipo} - ${descricao}`);
    
    return {
        tipo,
        descricao,
        totalLivros
    };
}

// Exibir classificação na interface
function exibirClassificacao(classificacaoData) {
    console.log('🎨 Exibindo classificação na interface...');
    console.log('📊 Dados da classificação:', classificacaoData);
    
    const tituloElement = document.getElementById('tituloClassificacao');
    const descricaoElement = document.getElementById('descricaoClassificacao');
    const badgeElement = document.getElementById('badgeLeitor');
    
    // Extrair dados da classificação
    const tipo = classificacaoData.tipo || 'INICIANTE';
    const descricao = classificacaoData.descricao || 'NENHUM LIVRO AINDA';
    const totalLivros = classificacaoData.totalLivros || 0;
    
    console.log(`📝 Tipo: "${tipo}", Descrição: "${descricao}", Livros: ${totalLivros}`);
    
    // Formatar o texto para exibição (adicionar "LEITOR" se necessário)
    const tipoFormatado = tipo.includes('LEITOR') ? tipo : `LEITOR ${tipo}`;
    tituloElement.textContent = tipoFormatado;
    
    // DESCRIÇÃO PERSONALIZADA COM NOME E QUANTIDADE
    let descricaoPersonalizada = '';
    
    if (totalLivros === 0) {
        descricaoPersonalizada = `${alunoLogado.nome} ainda não leu nenhum livro nos últimos 6 meses`;
    } else if (totalLivros === 1) {
        descricaoPersonalizada = `${alunoLogado.nome} leu ${totalLivros} livro nos últimos 6 meses`;
    } else {
        descricaoPersonalizada = `${alunoLogado.nome} leu ${totalLivros} livros nos últimos 6 meses`;
    }
    
    // // Adicionar a faixa de classificação se houver livros
    // if (totalLivros > 0) {
    //     descricaoPersonalizada += ` | ${descricao}`;
    // }
    
    descricaoElement.textContent = descricaoPersonalizada;
    
    // Aplicar classe CSS baseada no tipo
    aplicarClasseClassificacao(badgeElement, tipo);
    
    // Adicionar animação de entrada
    badgeElement.style.opacity = '0';
    badgeElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        badgeElement.style.transition = 'all 0.5s ease';
        badgeElement.style.opacity = '1';
        badgeElement.style.transform = 'translateY(0)';
    }, 100);
    
    console.log('✅ Classificação exibida com sucesso!');
}

// Aplicar classe CSS baseada no tipo de classificação
function aplicarClasseClassificacao(element, tipo) {
    console.log('🎨 Aplicando classe CSS...');
    
    // Remover TODAS as classes de classificação
    element.classList.remove(
        'classificacao-extremo',
        'classificacao-ativo', 
        'classificacao-regular',
        'classificacao-iniciante',
        'classificacao-erro'
    );
    
    // Adicionar classe específica baseada no tipo
    const tipoUpper = tipo.toUpperCase().trim();
    let classeAplicada = 'classificacao-iniciante';
    
    if (tipoUpper === 'LEITOR EXTREMO' || tipoUpper === 'EXTREMO') {
        classeAplicada = 'classificacao-extremo';
    } else if (tipoUpper === 'LEITOR ATIVO' || tipoUpper === 'ATIVO') {
        classeAplicada = 'classificacao-ativo';
    } else if (tipoUpper === 'LEITOR REGULAR' || tipoUpper === 'REGULAR') {
        classeAplicada = 'classificacao-regular';
    } else if (tipoUpper === 'LEITOR INICIANTE' || tipoUpper === 'INICIANTE') {
        classeAplicada = 'classificacao-iniciante';
    } else {
        classeAplicada = 'classificacao-iniciante';
    }
    
    element.classList.add(classeAplicada);
}

// Mostrar erro na classificação
function mostrarErroClassificacao() {
    console.error('❌ Mostrando erro de classificação');
    
    const tituloElement = document.getElementById('tituloClassificacao');
    const descricaoElement = document.getElementById('descricaoClassificacao');
    const badgeElement = document.getElementById('badgeLeitor');
    
    tituloElement.textContent = 'ERRO';
    descricaoElement.textContent = 'Não foi possível carregar sua classificação';
    
    // Aplicar estilo de erro
    aplicarClasseClassificacao(badgeElement, 'ERRO');
}

// Atualizar classificação periodicamente (opcional)
function iniciarAtualizacaoAutomatica() {
    // Atualizar a cada 2 minutos
    setInterval(() => {
        if (alunoLogado) {
            console.log('🔄 Atualização automática da classificação');
            carregarClassificacaoLeitor();
        }
    }, 120000);
}

// Iniciar atualização automática
iniciarAtualizacaoAutomatica();