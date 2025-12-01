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
        
        // Carregar dados da classificação
        await carregarDadosClassificacao();
        
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

// Carregar dados da classificação
async function carregarDadosClassificacao() {
    try {
        console.log('📊 Carregando dados da classificação...');
        
        // Mostrar estado de carregamento
        document.getElementById('tituloClassificacao').textContent = 'CARREGANDO...';
        document.getElementById('descricaoClassificacao').textContent = 'Aguarde enquanto buscamos seus dados';
        
        console.log('🔍 Buscando dados para RA:', alunoLogado.ra);
        
        // Chamar a API de classificação que já calcula tudo
        const response = await fetch(`${API_BASE_URL}/classificacao/aluno/${alunoLogado.ra}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📨 Resposta da API:', result);
        
        if (result.success && result.data) {
            const dados = result.data;
            
            // Extrair informações
            const classificacao = dados.classificacao;
            const estatisticas = dados.estatisticas;
            const totalLivrosLidos = estatisticas.totalLivrosLidos;
            
            console.log(`📚 Livros lidos (devolvidos): ${totalLivrosLidos}`);
            console.log(`📖 Livros ativos (não devolvidos): ${estatisticas.livrosAtivos}`);
            
            // Preparar dados para exibição
            const classificacaoData = {
                tipo: classificacao.tipo || 'INICIANTE',
                descricao: classificacao.descricao || 'Leitor Iniciante - até 5 livros',
                totalLivros: totalLivrosLidos
            };
            
            // Exibir na interface
            exibirClassificacao(classificacaoData);
            
        } else {
            throw new Error('Dados não retornados pela API');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar classificação:', error);
        // Tentar fallback
        await carregarDadosFallback();
    }
}

// Fallback se a API principal falhar
async function carregarDadosFallback() {
    try {
        console.log('🔄 Usando fallback para carregar dados...');
        
        // Buscar diretamente os empréstimos do aluno
        const response = await fetch(`${API_BASE_URL}/emprestimos/aluno/${alunoLogado.ra}/historico`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📨 Histórico de empréstimos:', result);
        
        if (result.success && result.data) {
            const emprestimos = result.data;
            
            // Contar empréstimos DEVOLVIDOS (devolvido = TRUE)
            const livrosLidos = emprestimos.filter(emp => emp.devolvido === true || emp.devolvido === 1);
            const totalLivrosLidos = livrosLidos.length;
            
            console.log(`📚 Total de livros lidos (devolvidos): ${totalLivrosLidos}`);
            
            // Determinar classificação
            let tipo, descricao;
            
            if (totalLivrosLidos <= 5) {
                tipo = 'INICIANTE';
                descricao = 'Leitor Iniciante - até 5 livros';
            } else if (totalLivrosLidos <= 10) {
                tipo = 'REGULAR';
                descricao = 'Leitor Regular - 6 a 10 livros';
            } else if (totalLivrosLidos <= 20) {
                tipo = 'ATIVO';
                descricao = 'Leitor Ativo - 11 a 20 livros';
            } else {
                tipo = 'EXTREMO';
                descricao = 'Leitor Extremo - mais de 20 livros';
            }
            
            const classificacaoData = {
                tipo,
                descricao,
                totalLivros: totalLivrosLidos
            };
            
            exibirClassificacao(classificacaoData);
            
        } else {
            throw new Error('Nenhum dado de histórico encontrado');
        }
        
    } catch (error) {
        console.error('❌ Erro no fallback:', error);
        mostrarErroClassificacao();
    }
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
    const totalLivros = classificacaoData.totalLivros || 0;
    
    console.log(`📝 Tipo: "${tipo}", Livros LIDOS: ${totalLivros}`);
    
    // Formatar título (adicionar "LEITOR" se necessário)
    const tituloFormatado = tipo.includes('LEITOR') ? tipo : `${tipo}`;
    tituloElement.textContent = tituloFormatado;
    
    // DESCRIÇÃO PERSONALIZADA COM NOME E QUANTIDADE
    let descricaoPersonalizada = '';
    
    if (totalLivros === 0) {
        descricaoPersonalizada = `${alunoLogado.nome} ainda não leu nenhum livro nos últimos 6 meses`;
    } else if (totalLivros === 1) {
        descricaoPersonalizada = `${alunoLogado.nome} leu ${totalLivros} livro`;
    } else {
        descricaoPersonalizada = `${alunoLogado.nome} leu ${totalLivros} livros`;
    }
    
    // Adicionar informação de período
    descricaoPersonalizada += ' (histórico completo)';
    
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
    
    // Adicionar contador de livros lidos
    adicionarContadorLivros(totalLivros);
    
    console.log('✅ Classificação exibida com sucesso!');
}

// Função para adicionar contador de livros lidos
function adicionarContadorLivros(totalLivros) {
    const container = document.querySelector('.container-classificacao');
    if (!container) return;
    
    // Remover contador anterior se existir
    const contadorAnterior = document.getElementById('contadorLivrosLidos');
    if (contadorAnterior) {
        contadorAnterior.remove();
    }
    
    if (totalLivros > 0) {
        const contadorElement = document.createElement('div');
        contadorElement.id = 'contadorLivrosLidos';
        contadorElement.className = 'contador-livros-lidos';
        contadorElement.innerHTML = `
            <div class="badge-contador">
                <i class="fas fa-book-reader"></i>
                <span>${totalLivros} livro${totalLivros !== 1 ? 's' : ''} lido${totalLivros !== 1 ? 's' : ''} no total</span>
            </div>
        `;
        
        // Inserir após a descrição
        const descricaoElement = document.getElementById('descricaoClassificacao');
        descricaoElement.parentNode.insertBefore(contadorElement, descricaoElement.nextSibling);
    }
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
    
    if (tipoUpper === 'EXTREMO') {
        classeAplicada = 'classificacao-extremo';
    } else if (tipoUpper === 'ATIVO') {
        classeAplicada = 'classificacao-ativo';
    } else if (tipoUpper === 'REGULAR') {
        classeAplicada = 'classificacao-regular';
    } else if (tipoUpper === 'INICIANTE') {
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
    badgeElement.classList.remove(
        'classificacao-extremo',
        'classificacao-ativo', 
        'classificacao-regular',
        'classificacao-iniciante'
    );
    badgeElement.classList.add('classificacao-erro');
}

// Atualizar classificação periodicamente (opcional)
function iniciarAtualizacaoAutomatica() {
    // Atualizar a cada 2 minutos
    setInterval(() => {
        if (alunoLogado) {
            console.log('🔄 Atualização automática da classificação');
            carregarDadosClassificacao();
        }
    }, 120000);
}

// Iniciar atualização automática
iniciarAtualizacaoAutomatica();