const { connection } = require('../database/connection');

class Aluno {

    static async criar(aluno) {
        const { nome, ra, cpf, email, telefone, endereco } = aluno;
        const [result] = await connection.execute(
            'INSERT INTO aluno (nome, ra, cpf, email, telefone, endereco) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, ra, cpf, email, telefone, endereco]
        );
        return result;
    }

    static async listarTodos() {
        const [rows] = await connection.execute(
            'SELECT * FROM aluno'
        );
        return rows;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            'SELECT * FROM aluno WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async buscarPorRa(ra) {
        const [rows] = await connection.execute(
            'SELECT * FROM aluno WHERE ra = ?',
            [ra]
        );
        return rows[0];
    }

    static async buscarPorCpf(cpf) {
        const [rows] = await connection.execute(
            'SELECT * FROM aluno WHERE cpf = ?',
            [cpf]
        );
        return rows[0];
    }

    static async buscarPorEmail(email) {
    const [rows] = await connection.execute(
        'SELECT * FROM aluno WHERE email = ?',
        [email]
    );
    return rows[0];
}

    static async buscarPorTelefone(telefone) {
        const [rows] = await connection.execute(
            'SELECT * FROM aluno WHERE telefone = ?',
            [telefone]
        );
        return rows[0];
    }

    static async atualizar(id, aluno) {
        const { nome, email, telefone, endereco } = aluno;
        const [result] = await connection.execute(
            'UPDATE aluno SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?',
            [nome, email, telefone, endereco, id]
        );
        return result;
    }

    static async deletar(id) {
        const [result] = await connection.execute(
            'DELETE FROM aluno WHERE id = ?',
            [id]
        );
        return result;
    }
}

module.exports = Aluno;