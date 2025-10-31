-- CRIAÇÃO DO BANCO

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



-- INSERIR MAIS ALUNOS
INSERT INTO aluno (nome, ra, cpf, email, telefone, endereco) VALUES
('João Pedro Rocha', 25003959, '12345678901', 'joao.pedro@puc.com', '11999999999', 'Rua A, 100'),
('Maria Silva', 25000000, '23456789012', 'maria.silva@puc.com', '11988888888', 'Rua B, 200'),
('Lucas Oliveira', 25003595, '34567890123', 'lucas.oliveira@puc.com', '11977777777', 'Rua C, 300'),
('Ana Costa', 25001234, '45678901234', 'ana.costa@puc.com', '11966666666', 'Rua D, 400'),
('Pedro Santos', 25005678, '56789012345', 'pedro.santos@puc.com', '11955555555', 'Rua E, 500'),
('Carla Mendes', 25007890, '67890123456', 'carla.mendes@puc.com', '11944444444', 'Rua F, 600'),
('Rafael Lima', 25009012, '78901234567', 'rafael.lima@puc.com', '11933333333', 'Rua G, 700'),
('Fernanda Oliveira', 25003456, '89012345678', 'fernanda.oliveira@puc.com', '11922222222', 'Rua H, 800');

-- INSERIR MAIS LIVROS
INSERT INTO livro (titulo, isbn, autor, editora) VALUES
('Fundamentos de Programação', '978-85-12345-01-1', 'José da Silva', 'Tecnologia Press'),
('O Senhor dos Anéis', '561-76-31835-01-1', 'J.R.R. Tolkien', 'Data Books'),
('História do Brasil', '978-85-12345-03-3', 'Maria Fernandes', 'Defalcântara'),
('Orgulho e Preconceito', '978-85-12345-04-4', 'Jane Austen', 'Bigger historys'),
('Dom Casmurro', '978-85-12345-05-5', 'Machado de Assis', 'Clássicos BR'),
('1984', '978-85-12345-06-6', 'George Orwell', 'Futuro Distópico'),
('A Revolução dos Bichos', '978-85-12345-07-7', 'George Orwell', 'Fábulas Modernas'),
('O Pequeno Príncipe', '978-85-12345-08-8', 'Antoine de Saint-Exupéry', 'Literatura Infantil'),
('Cem Anos de Solidão', '978-85-12345-09-9', 'Gabriel García Márquez', 'Realismo Mágico'),
('Harry Potter e a Pedra Filosofal', '978-85-12345-10-5', 'J.K. Rowling', 'Magia Press'),
('O Hobbit', '978-85-12345-11-6', 'J.R.R. Tolkien', 'Aventura Fantástica'),
('Clean Code', '978-85-12345-12-7', 'Robert C. Martin', 'Dev Masters'),
('O Nome do Vento', '978-85-12345-13-8', 'Patrick Rothfuss', 'Crônicas Edições');

-- INSERIR MAIS EXEMPLARES (agora com mais variedade)
INSERT INTO exemplar (status, id_livro) VALUES
-- Exemplares para Fundamentos de Programação (3 exemplares)
('Disponível', 1), ('Disponível', 1), ('Emprestado', 1),

-- Exemplares para O Senhor dos Anéis (2 exemplares)
('Disponível', 2), ('Emprestado', 2),

-- Exemplares para História do Brasil (2 exemplares)
('Disponível', 3), ('Emprestado', 3),

-- Exemplares para Orgulho e Preconceito (2 exemplares)
('Disponível', 4), ('Emprestado', 4),

-- Exemplares para Dom Casmurro (3 exemplares)
('Disponível', 5), ('Disponível', 5), ('Emprestado', 5),

-- Exemplares para 1984 (2 exemplares)
('Disponível', 6), ('Emprestado', 6),

-- Exemplares para A Revolução dos Bichos (2 exemplares)
('Disponível', 7), ('Emprestado', 7),

-- Exemplares para O Pequeno Príncipe (4 exemplares - livro popular)
('Disponível', 8), ('Disponível', 8), ('Emprestado', 8), ('Emprestado', 8),

-- Exemplares para Cem Anos de Solidão (2 exemplares)
('Disponível', 9), ('Emprestado', 9),

-- Exemplares para Harry Potter (3 exemplares)
('Disponível', 10), ('Disponível', 10), ('Emprestado', 10),

-- Exemplares para O Hobbit (2 exemplares)
('Disponível', 11), ('Emprestado', 11),

-- Exemplares para Clean Code (2 exemplares)
('Disponível', 12), ('Emprestado', 12),

-- Exemplares para O Nome do Vento (2 exemplares)
('Disponível', 13), ('Emprestado', 13);

-- INSERIR CLASSIFICAÇÕES ATUALIZADAS
INSERT INTO classificacao (tipo, descricao, idAluno) VALUES 
('INICIANTE', 'Leitor Iniciante - até 5 livros', 1),
('REGULAR', 'Leitor Regular - 6 a 10 livros', 2),
('ATIVO', 'Leitor Ativo - 11 a 20 livros', 3),
('EXTREMO', 'Leitor Extremo - mais de 20 livros', 4),
('ATIVO', 'Leitor Ativo - 11 a 20 livros', 5),
('REGULAR', 'Leitor Regular - 6 a 10 livros', 6),
('INICIANTE', 'Leitor Iniciante - até 5 livros', 7),
('REGULAR', 'Leitor Regular - 6 a 10 livros', 8);

-- INSERIR EMPRÉSTIMOS ATIVOS (livros atualmente emprestados)
INSERT INTO emprestimo (id_exemplar, id_aluno) VALUES
-- João (id 1) tem 2 livros emprestados
(3, 1),  -- Fundamentos de Programação
(5, 1),  -- O Senhor dos Anéis

-- Maria (id 2) tem 3 livros emprestados
(7, 2),  -- História do Brasil
(9, 2),  -- Orgulho e Preconceito
(15, 2), -- Dom Casmurro

-- Lucas (id 3) tem 4 livros emprestados
(11, 3), -- 1984
(13, 3), -- A Revolução dos Bichos
(17, 3), -- O Pequeno Príncipe
(19, 3), -- Cem Anos de Solidão

-- Ana (id 4) tem 2 livros emprestados
(21, 4), -- Harry Potter
(23, 4), -- O Hobbit

-- Pedro (id 5) tem 3 livros emprestados
(25, 5), -- Clean Code
(27, 5), -- O Nome do Vento
(18, 5), -- O Pequeno Príncipe (segundo exemplar)

-- Carla (id 6) tem 1 livro emprestado
(20, 6), -- Harry Potter (segundo exemplar)

-- Rafael (id 7) tem 2 livros emprestados
(22, 7), -- O Hobbit (segundo exemplar)
(26, 7), -- Clean Code (segundo exemplar)

-- Fernanda (id 8) tem 1 livro emprestado
(28, 8); -- O Nome do Vento (segundo exemplar)

-- INSERIR HISTÓRICO DE EMPRÉSTIMOS (para testar a classificação - apenas IDs)
INSERT INTO emprestimo (id_exemplar, id_aluno) VALUES
-- Histórico do João (5 empréstimos no total - INICIANTE)
(1, 1), (2, 1),

-- Histórico da Maria (8 empréstimos no total - REGULAR)
(4, 2), (6, 2), (8, 2), (10, 2), (12, 2),

-- Histórico do Lucas (15 empréstimos no total - ATIVO)
(14, 3), (16, 3), (18, 3), (20, 3), (22, 3), 
(24, 3), (26, 3), (28, 3), (1, 3), (3, 3),

-- Histórico da Ana (25 empréstimos no total - EXTREMO)
(5, 4), (7, 4), (9, 4), (11, 4), (13, 4),
(15, 4), (17, 4), (19, 4), (21, 4), (23, 4),
(25, 4);

-- ATUALIZAR STATUS DOS EXEMPLARES BASEADO NOS EMPRÉSTIMOS ATIVOS
UPDATE exemplar SET status = 'Emprestado' WHERE id IN (
    3, 5,     -- João
    7, 9, 15, -- Maria
    11, 13, 17, 19, -- Lucas
    21, 23,   -- Ana
    25, 27, 18, -- Pedro
    20,       -- Carla
    22, 26,   -- Rafael
    28        -- Fernanda
);

-- Garantir que os outros exemplares estejam disponíveis
UPDATE exemplar 
SET status = 'Disponivel' 
WHERE (status IS NULL OR status = 'Disponivel')
AND id_livro IS NOT NULL;