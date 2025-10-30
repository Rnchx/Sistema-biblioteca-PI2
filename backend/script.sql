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
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    autor VARCHAR(100) NOT NULL,
    editora VARCHAR(100) NOT NULL
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
    tipo VARCHAR(20) NOT NULL,
    descricao TEXT NOT NULL,
    idAluno INT NOT NULL,
    FOREIGN KEY (idAluno) REFERENCES aluno(id)
);



-- INSERIR ALUNOS

INSERT INTO aluno (nome, ra, cpf, email, telefone, endereco) VALUES
('João Pedro Rocha', 25003959, '12345678901', 'joao.pedro@puc.com', '11999999999', 'Rua A, 100'),
('Maria Silva', 25000000, '23456789012', 'maria.silva@puc.com', '11988888888', 'Rua B, 200'),
('Lucas Oliveira', 25003595, '34567890123', 'lucas.oliveira@puc.com', '11977777777', 'Rua C, 300');


-- INSERIR LIVROS

INSERT INTO livro (titulo, isbn, autor, editora) VALUES
('Fundamentos de Programação', '978-85-12345-01-1', 'José da Silva', 'Tecnologia Press'),
('O Senhor dos Anéis', '561-76-31835-01-1', 'J.R.R. Tolkien', 'Data Books'),
('História do Brasil', '978-85-12345-03-3', 'Maria Fernandes', 'Defalcântara'),
('Orgulho e Preconceito', '978-85-12345-04-4', 'Jane Austen', 'Bigger historys');


-- INSERIR EXEMPLARES

INSERT INTO exemplar (status, id_livro) VALUES
('Disponível', 1),
('Disponível', 1),
('Disponível', 2),
('Disponível', 3),
('Disponível', 4);


-- INSERIR EMPRESTIMOS

INSERT INTO emprestimo (id_exemplar, id_aluno) VALUES
(2, 1),
(3, 2),
(4, 3);

-- INSERIR CLASSIFICACAO

INSERT INTO classificacao (tipo, descricao, idAluno) VALUES 
('INICIANTE', 'Leitor Iniciante - até 5 livros', 1),
('REGULAR', 'Leitor Regular - 6 a 10 livros', 2),
('ATIVO', 'Leitor Ativo - 11 a 20 livros', 3);


-- INSERIR EMPRESTIMOS

UPDATE exemplar SET status = 'Emprestado' WHERE id IN (1, 2, 3, 4, 5);

INSERT INTO emprestimo (id_exemplar, id_aluno) VALUES
-- Aluno 1 (João) - 3 empréstimos (INICIANTE)
(1, 1), (2, 1), (3, 1),

-- Aluno 2 (Maria) - 7 empréstimos (REGULAR)  
(4, 2), (5, 2), (1, 2), (2, 2), (3, 2), (4, 2), (5, 2),

-- Aluno 3 (Lucas) - 12 empréstimos (ATIVO)
(1, 3), (2, 3), (3, 3), (4, 3), (5, 3), 
(1, 3), (2, 3), (3, 3), (4, 3), (5, 3),
(1, 3), (2, 3);