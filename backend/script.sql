CREATE DATABASE IF NOT EXISTS pi2;
USE pi2;

-- DELETAR AS TABELAS ANTES

DROP TABLE IF EXISTS emprestimo;
DROP TABLE IF EXISTS exemplar;
DROP TABLE IF EXISTS classificacao;
DROP TABLE IF EXISTS livro;
DROP TABLE IF EXISTS aluno;


-- TABELA DE ALUNOS

CREATE TABLE IF NOT EXISTS aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    ra INT(8) UNIQUE NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    email VARCHAR(120),
    telefone VARCHAR(20),
    endereco VARCHAR(200)
);


-- TABELA DE LIVROS

CREATE TABLE IF NOT EXISTS livro (
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(120) NOT NULL
);


-- TABELA DE EXEMPLARES

CREATE TABLE IF NOT EXISTS exemplar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('Disponível', 'Emprestado', 'Extraviado') DEFAULT 'Disponível',
    id_livro INT,
    FOREIGN KEY (id_livro) REFERENCES livro(id)
);


-- TABELA DE EMPRESTIMOS

CREATE TABLE IF NOT EXISTS emprestimo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_exemplar INT,
    id_aluno INT,
    FOREIGN KEY (id_exemplar) REFERENCES exemplar(id),
    FOREIGN KEY (id_aluno) REFERENCES aluno(id)
);


-- TABELA DE CLASSIFICACAO

CREATE TABLE IF NOT EXISTS classificacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao TEXT,
    idAluno INT,
    FOREIGN KEY (idAluno) REFERENCES aluno(id)
);



-- INSERIR ALUNOS

INSERT INTO aluno (nome, ra, cpf, email, telefone, endereco) VALUES
('João Pedro Rocha', 25003959, '12345678901', 'joao.pedro@puc.com', '11999999999', 'Rua A, 100'),
('Maria Silva', 25000000, '23456789012', 'maria.silva@puc.com', '11988888888', 'Rua B, 200'),
('Lucas Oliveira', 25003595, '34567890123', 'lucas.oliveira@puc.com', '11977777777', 'Rua C, 300');


-- INSERIR LIVROS

INSERT INTO livro (titulo, autor) VALUES
('Fundamentos de Programação', 'José da Silva'),
('O Senhor dos Anéis', 'J.R.R. Tolkien'),
('História do Brasil', 'Maria Fernandes'),
('Orgulho e Preconceito', 'Jane Austen');


-- INSERIR EXEMPLARES

INSERT INTO exemplar (status, id_livro) VALUES
('Disponível', 1),
('Disponível', 1),
('Disponível', 2),
('Disponível', 3),
('Disponível', 4);


-- INSERIR EMPRESTIMOS

INSERT INTO emprestimo (id_exemplar, id_aluno) VALUES
(1, 1),
(3, 2),
(4, 3);