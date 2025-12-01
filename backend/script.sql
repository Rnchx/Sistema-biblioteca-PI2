-- CREATE DATABASE IF NOT EXISTS pi2;
-- USE pi2;

-- -- DELETAR AS TABELAS ANTES

-- DROP TABLE IF EXISTS emprestimo;
-- DROP TABLE IF EXISTS exemplar;
-- DROP TABLE IF EXISTS classificacao;
-- DROP TABLE IF EXISTS livro;
-- DROP TABLE IF EXISTS aluno;


-- -- TABELA DE ALUNOS

-- CREATE TABLE IF NOT EXISTS aluno (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     nome VARCHAR(120) NOT NULL,
--     ra INT(8) UNIQUE NOT NULL,
--     cpf VARCHAR(11) UNIQUE NOT NULL,
--     email VARCHAR(120),
--     telefone VARCHAR(20),
--     endereco VARCHAR(200)
-- );


-- -- TABELA DE LIVROS

-- CREATE TABLE IF NOT EXISTS livro (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     titulo VARCHAR(200) NOT NULL,
--     isbn VARCHAR(20) UNIQUE,
--     autor VARCHAR(100) NOT NULL,
--     editora VARCHAR(100) NOT NULL
-- );


-- -- TABELA DE EXEMPLARES

-- CREATE TABLE IF NOT EXISTS exemplar (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     status ENUM('Disponível', 'Emprestado', 'Extraviado') DEFAULT 'Disponível',
--     id_livro INT,
--     FOREIGN KEY (id_livro) REFERENCES livro(id)
-- );


-- -- TABELA DE EMPRESTIMOS

-- CREATE TABLE IF NOT EXISTS emprestimo (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     id_exemplar INT,
--     id_aluno INT,
--     FOREIGN KEY (id_exemplar) REFERENCES exemplar(id),
--     FOREIGN KEY (id_aluno) REFERENCES aluno(id)
-- );


-- -- TABELA DE CLASSIFICACAO

-- CREATE TABLE IF NOT EXISTS classificacao (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     tipo VARCHAR(20) NOT NULL,
--     descricao TEXT NOT NULL,
--     idAluno INT NOT NULL,
--     FOREIGN KEY (idAluno) REFERENCES aluno(id)
-- );



-- INSERT INTO aluno (nome, ra, cpf, email, telefone, endereco) VALUES
-- ('João Pedro Rocha', 25003959, '12345678901', 'joao.pedro@puc.com', '11999999999', 'Rua A, 100'),
-- ('Maria Silva', 25000000, '23456789012', 'maria.silva@puc.com', '11988888888', 'Rua B, 200'),
-- ('Lucas Oliveira', 25003595, '34567890123', 'lucas.oliveira@puc.com', '11977777777', 'Rua C, 300'),
-- ('Ana Costa', 25001234, '45678901234', 'ana.costa@puc.com', '11966666666', 'Rua D, 400'),
-- ('Pedro Santos', 25005678, '56789012345', 'pedro.santos@puc.com', '11955555555', 'Rua E, 500'),
-- ('Carla Mendes', 25007890, '67890123456', 'carla.mendes@puc.com', '11944444444', 'Rua F, 600'),
-- ('Rafael Lima', 25009012, '78901234567', 'rafael.lima@puc.com', '11933333333', 'Rua G, 700'),
-- ('Fernanda Oliveira', 25003456, '89012345678', 'fernanda.oliveira@puc.com', '11922222222', 'Rua H, 800');

-- INSERT INTO livro (titulo, isbn, autor, editora) VALUES
-- ('Fundamentos de Programação', '978-85-12345-01-1', 'José da Silva', 'Tecnologia Press'),
-- ('O Senhor dos Anéis', '561-76-31835-01-1', 'J.R.R. Tolkien', 'Data Books'),
-- ('História do Brasil', '978-85-12345-03-3', 'Maria Fernandes', 'Defalcântara'),
-- ('Orgulho e Preconceito', '978-85-12345-04-4', 'Jane Austen', 'Bigger historys'),
-- ('Dom Casmurro', '978-85-12345-05-5', 'Machado de Assis', 'Clássicos BR'),
-- ('1984', '978-85-12345-06-6', 'George Orwell', 'Futuro Distópico'),
-- ('A Revolução dos Bichos', '978-85-12345-07-7', 'George Orwell', 'Fábulas Modernas'),
-- ('O Pequeno Príncipe', '978-85-12345-08-8', 'Antoine de Saint-Exupéry', 'Literatura Infantil'),
-- ('Cem Anos de Solidão', '978-85-12345-09-9', 'Gabriel García Márquez', 'Realismo Mágico'),
-- ('Harry Potter e a Pedra Filosofal', '978-85-12345-10-5', 'J.K. Rowling', 'Magia Press'),
-- ('O Hobbit', '978-85-12345-11-6', 'J.R.R. Tolkien', 'Aventura Fantástica'),
-- ('Clean Code', '978-85-12345-12-7', 'Robert C. Martin', 'Dev Masters'),
-- ('O Nome do Vento', '978-85-12345-13-8', 'Patrick Rothfuss', 'Crônicas Edições');

-- INSERT INTO exemplar (status, id_livro) VALUES
-- -- Exemplares para Fundamentos de Programação (3 exemplares)
-- ('Disponível', 1), ('Disponível', 1), ('Emprestado', 1),

-- -- Exemplares para O Senhor dos Anéis (2 exemplares)
-- ('Disponível', 2), ('Emprestado', 2),

-- -- Exemplares para História do Brasil (2 exemplares)
-- ('Disponível', 3), ('Emprestado', 3),

-- -- Exemplares para Orgulho e Preconceito (2 exemplares)
-- ('Disponível', 4), ('Emprestado', 4),

-- -- Exemplares para Dom Casmurro (3 exemplares)
-- ('Disponível', 5), ('Disponível', 5), ('Emprestado', 5),

-- -- Exemplares para 1984 (2 exemplares)
-- ('Disponível', 6), ('Emprestado', 6),

-- -- Exemplares para A Revolução dos Bichos (2 exemplares)
-- ('Disponível', 7), ('Emprestado', 7),

-- -- Exemplares para O Pequeno Príncipe (4 exemplares)
-- ('Disponível', 8), ('Disponível', 8), ('Emprestado', 8), ('Emprestado', 8),

-- -- Exemplares para Cem Anos de Solidão (2 exemplares)
-- ('Disponível', 9), ('Emprestado', 9),

-- -- Exemplares para Harry Potter (3 exemplares)
-- ('Disponível', 10), ('Disponível', 10), ('Emprestado', 10),

-- -- Exemplares para O Hobbit (2 exemplares)
-- ('Disponível', 11), ('Emprestado', 11),

-- -- Exemplares para Clean Code (2 exemplares)
-- ('Disponível', 12), ('Emprestado', 12),

-- -- Exemplares para O Nome do Vento (2 exemplares)
-- ('Disponível', 13), ('Emprestado', 13);

-- INSERT INTO classificacao (tipo, descricao, idAluno) VALUES 
-- ('INICIANTE', 'Leitor Iniciante - até 5 livros', 1),
-- ('REGULAR', 'Leitor Regular - 6 a 10 livros', 2),
-- ('ATIVO', 'Leitor Ativo - 11 a 20 livros', 3),
-- ('EXTREMO', 'Leitor Extremo - mais de 20 livros', 4),
-- ('ATIVO', 'Leitor Ativo - 11 a 20 livros', 5),
-- ('REGULAR', 'Leitor Regular - 6 a 10 livros', 6),
-- ('INICIANTE', 'Leitor Iniciante - até 5 livros', 7),
-- ('REGULAR', 'Leitor Regular - 6 a 10 livros', 8);

-- -- INSERIR TODOS OS EMPRÉSTIMOS DE UMA VEZ
-- INSERT INTO emprestimo (id_exemplar, id_aluno) VALUES
-- -- JOÃO (ID 1) - INICIANTE: 4 livros no total
-- (3, 1), (5, 1), (1, 1), (2, 1),

-- -- MARIA (ID 2) - REGULAR: 8 livros no total  
-- (7, 2), (9, 2), (15, 2), (4, 2), (6, 2), (8, 2), (10, 2), (12, 2),

-- -- LUCAS (ID 3) - ATIVO: 15 livros no total
-- (11, 3), (13, 3), (17, 3), (19, 3), (21, 3), (23, 3), (25, 3), (27, 3),
-- (14, 3), (16, 3), (18, 3), (20, 3), (22, 3), (24, 3), (26, 3),

-- -- ANA (ID 4) - EXTREMO: 25 livros no total
-- (28, 4), (5, 4), (7, 4), (9, 4), (11, 4), (13, 4), (15, 4), (17, 4), 
-- (19, 4), (21, 4), (23, 4), (25, 4), (27, 4), (1, 4), (2, 4), (4, 4),
-- (6, 4), (8, 4), (10, 4), (12, 4), (14, 4), (16, 4), (18, 4), (20, 4), (22, 4),

-- -- PEDRO (ID 5) - ATIVO: 12 livros no total
-- (24, 5), (26, 5), (28, 5), (3, 5), (5, 5), (7, 5), (9, 5), (11, 5), 
-- (13, 5), (15, 5), (17, 5), (19, 5),

-- -- CARLA (ID 6) - REGULAR: 7 livros no total
-- (21, 6), (23, 6), (25, 6), (27, 6), (1, 6), (2, 6), (4, 6),

-- -- RAFAEL (ID 7) - INICIANTE: 3 livros no total
-- (6, 7), (8, 7), (10, 7),

-- -- FERNANDA (ID 8) - INICIANTE: 5 livros no total
-- (12, 8), (14, 8), (16, 8), (18, 8), (20, 8);

-- -- ATUALIZAR STATUS DOS EXEMPLARES BASEADO NOS EMPRÉSTIMOS ATIVOS
-- -- Considerando que os últimos empréstimos de cada aluno são os ativos
-- UPDATE exemplar SET status = 'Emprestado' WHERE id IN (
--     -- João (2 ativos)
--     1, 2,
--     -- Maria (4 ativos)
--     6, 8, 10, 12,
--     -- Lucas (todos devolvidos para este exemplo)
--     -- Ana (todos devolvidos para este exemplo)  
--     -- Pedro (todos devolvidos para este exemplo)
--     -- Carla (todos devolvidos para este exemplo)
--     -- Rafael (todos devolvidos para este exemplo)
--     -- Fernanda (todos devolvidos para este exemplo)
--     22, 24, 26, 28
-- );

-- -- Garantir que os outros exemplares estejam disponíveis
-- UPDATE exemplar 
-- SET status = 'Disponivel' 
-- WHERE (status IS NULL OR status = 'Disponivel')
-- AND id_livro IS NOT NULL;





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

-- TABELA DE EMPRESTIMOS (SIMPLIFICADA - SEM DATAS)
CREATE TABLE IF NOT EXISTS emprestimo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_exemplar INT,
    id_aluno INT,
    devolvido BOOLEAN DEFAULT FALSE, -- MARCA SE FOI DEVOLVIDO
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

-- INSERIR DADOS DE TESTE
INSERT INTO aluno (nome, ra, cpf, email, telefone, endereco) VALUES
('João Pedro Rocha', 25003959, '12345678901', 'joao.pedro@puc.com', '11999999999', 'Rua A, 100'),
('Maria Silva', 25000000, '23456789012', 'maria.silva@puc.com', '11988888888', 'Rua B, 200'),
('Lucas Oliveira', 25003595, '34567890123', 'lucas.oliveira@puc.com', '11977777777', 'Rua C, 300');

-- INSERIR LIVROS
INSERT INTO livro (titulo, isbn, autor, editora) VALUES
('Livro Teste', '978-85-12345-99-9', 'Guilhermo', 'Editora de Guilhermo'),
('Fundamentos de Programação', '978-85-12345-01-1', 'José da Silva', 'Tecnologia Press'),
('O Senhor dos Anéis', '561-76-31835-01-1', 'J.R.R. Tolkien', 'Data Books');

-- INSERIR EXEMPLARES
INSERT INTO exemplar (status, id_livro) VALUES
('Emprestado', 1),  -- Exemplar 1: Livro Teste (ATIVO)
('Disponível', 1),  -- Exemplar 2: Livro Teste
('Disponível', 2),  -- Exemplar 3: Fundamentos
('Disponível', 3);  -- Exemplar 4: Senhor dos Anéis

-- INSERIR EMPRÉSTIMOS
-- João: 3 livros já devolvidos + 1 ativo
INSERT INTO emprestimo (id_exemplar, id_aluno, devolvido) VALUES
(2, 1, TRUE),   -- Já devolvido
(3, 1, TRUE),   -- Já devolvido
(4, 1, TRUE),   -- Já devolvido
(1, 1, FALSE);  -- Ativo (não devolvido)

-- Maria: 5 livros já devolvidos
INSERT INTO emprestimo (id_exemplar, id_aluno, devolvido) VALUES
(2, 2, TRUE),
(3, 2, TRUE),
(4, 2, TRUE),
(1, 2, TRUE),
(2, 2, TRUE);

-- Lucas: nenhum empréstimo ainda
-- (vai ficar com 0 livros lidos)

-- CLASSIFICAÇÕES INICIAIS
INSERT INTO classificacao (tipo, descricao, idAluno) VALUES 
('INICIANTE', 'Leitor Iniciante - até 5 livros', 1),  -- João tem 3 devolvidos
('REGULAR', 'Leitor Regular - 6 a 10 livros', 2),     -- Maria tem 5 devolvidos
('INICIANTE', 'Leitor Iniciante - até 5 livros', 3);  -- Lucas tem 0

-- VERIFICAÇÃO DOS DADOS
SELECT '=== ALUNOS ===' as '';
SELECT * FROM aluno;

SELECT '=== EMPRÉSTIMOS ===' as '';
SELECT 
    e.id as emprestimo_id,
    a.nome,
    a.ra,
    ex.id as exemplar_id,
    l.titulo,
    e.devolvido,
    CASE 
        WHEN e.devolvido = 1 THEN 'DEVOLVIDO'
        ELSE 'ATIVO'
    END as status_emprestimo
FROM emprestimo e
JOIN aluno a ON e.id_aluno = a.id
JOIN exemplar ex ON e.id_exemplar = ex.id
JOIN livro l ON ex.id_livro = l.id
ORDER BY a.nome, e.devolvido;

SELECT '=== CLASSIFICAÇÃO ATUAL ===' as '';
SELECT 
    a.nome,
    a.ra,
    c.tipo,
    c.descricao,
    (SELECT COUNT(*) FROM emprestimo WHERE id_aluno = a.id AND devolvido = TRUE) as livros_lidos
FROM aluno a
LEFT JOIN classificacao c ON a.id = c.idAluno;