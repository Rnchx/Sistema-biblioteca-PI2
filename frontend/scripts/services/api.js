class ApiService {
    static BASE_URL = 'http://localhost:3000';
    
    static async getAlunoPorRA(ra) {
        const response = await fetch(`${this.BASE_URL}/alunos/ra/${ra}`);
        return await response.json();
    }
    
    static async cadastrarAluno(alunoData) {
        const response = await fetch(`${this.BASE_URL}/alunos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(alunoData)
        });
        return await response.json();
    }
}