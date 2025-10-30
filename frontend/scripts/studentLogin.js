document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do DOM
    const loginForm = document.querySelector('#containerLabelsInputs');
    const raInput = document.querySelector('.inputsFormulario');
    const entrarBtn = document.querySelector('#botaoFormulario');
    
    // URL da sua API - ajuste conforme necessário
    const API_BASE_URL = 'http://localhost:3000';
    
    // Evento de clique no botão ENTRAR
    entrarBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const ra = raInput.value.trim();
        
        // Validação básica
        if (!ra) {
            alert('Por favor, digite seu RA');
            return;
        }
        
        if (!validarRA(ra)) {
            alert('RA deve conter apenas números (ex: 25003959)');
            return;
        }
        
        // Mostrar loading
        entrarBtn.textContent = 'ENTRANDO...';
        entrarBtn.disabled = true;
        
        try {
            // Verificar se aluno existe
            const aluno = await verificarAluno(ra);
            
            if (aluno) {
                // Login bem-sucedido
                loginSucesso(aluno);
            } else {
                // Aluno não encontrado
                loginFalhou('RA não encontrado. Verifique o número ou faça cadastro.');
            }
            
        } catch (error) {
            console.error('Erro no login:', error);
            loginFalhou('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            // Restaurar botão
            entrarBtn.textContent = 'ENTRAR';
            entrarBtn.disabled = false;
        }
    });
    
    // Validar formato do RA
    function validarRA(ra) {
        const raRegex = /^\d+$/; // Apenas números
        return raRegex.test(ra) && ra.length >= 7; // Pelo menos 7 dígitos
    }
    
    // Verificar se aluno existe na API
    async function verificarAluno(ra) {
        try {
            const response = await fetch(`${API_BASE_URL}/alunos/ra/${ra}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null; // Aluno não encontrado
                }
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                return data.data; // Retorna os dados do aluno
            } else {
                return null;
            }
            
        } catch (error) {
            console.error('Erro ao verificar aluno:', error);
            throw error;
        }
    }
    
    // Login bem-sucedido
    function loginSucesso(aluno) {
        // Salvar dados do aluno no localStorage/sessionStorage
        sessionStorage.setItem('alunoLogado', JSON.stringify({
            id: aluno.id,
            nome: aluno.nome,
            ra: aluno.ra,
            loggedIn: true,
            timestamp: new Date().getTime()
        }));
        
        // Mostrar mensagem de sucesso
        alert(`Bem-vindo, ${aluno.nome}!`);
        
        // Redirecionar para a página principal
        window.location.href = '../studentProgramPages/optionsPage.html';
    }
    
    // Login falhou
    function loginFalhou(mensagem) {
        alert(mensagem);
        raInput.focus();
        raInput.select();
    }
    
    // Enter no input também submete o formulário
    raInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            entrarBtn.click();
        }
    });
    
    // Focar no input ao carregar a página
    raInput.focus();
});