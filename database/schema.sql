-- ==========================================================
-- Banco de Dados: adocao_animais
-- Sistema de Gerenciamento de Animais para Adoção
-- ==========================================================

-- Criação do banco de dados com charset UTF-8 completo
CREATE DATABASE IF NOT EXISTS adocao_animais
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE adocao_animais;

-- Desabilitar verificação de chaves estrangeiras temporariamente para recriação limpa
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS adocoes;
DROP TABLE IF EXISTS animais;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- Tabela: animais
-- ==========================================================
CREATE TABLE IF NOT EXISTS animais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especie VARCHAR(50) NOT NULL,
  raca VARCHAR(50) NOT NULL,
  idade INT NOT NULL,
  porte VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Disponível',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para otimização de filtros e buscas frequentes
  INDEX idx_animais_status (status),
  INDEX idx_animais_especie (especie),
  INDEX idx_animais_porte (porte),
  INDEX idx_animais_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- Tabela: adocoes
-- ==========================================================
CREATE TABLE IF NOT EXISTS adocoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_adotante VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  id_animal INT NOT NULL,
  data_adocao DATE NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Chave estrangeira com integridade referencial
  CONSTRAINT fk_adocoes_animal
    FOREIGN KEY (id_animal) 
    REFERENCES animais(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- Índices para otimização de buscas e integridade
  INDEX idx_adocoes_id_animal (id_animal),
  INDEX idx_adocoes_data (data_adocao),
  INDEX idx_adocoes_adotante (nome_adotante)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- Dados Iniciais de Demonstração / Teste
-- ==========================================================

INSERT INTO animais (id, nome, especie, raca, idade, porte, status) VALUES
  (1, 'Rex', 'Cachorro', 'Caramelo (SRD)', 3, 'Médio', 'Adotado'),
  (2, 'Luna', 'Gato', 'Siamês', 2, 'Pequeno', 'Disponível'),
  (3, 'Thor', 'Cachorro', 'Golden Retriever', 4, 'Grande', 'Disponível'),
  (4, 'Mel', 'Cachorro', 'Poodle', 1, 'Pequeno', 'Disponível'),
  (5, 'Mingau', 'Gato', 'Persa', 3, 'Pequeno', 'Adotado'),
  (6, 'Bob', 'Cachorro', 'Beagle', 2, 'Médio', 'Disponível'),
  (7, 'Pipoca', 'Cachorro', 'Shih Tzu', 5, 'Pequeno', 'Disponível'),
  (8, 'Simba', 'Gato', 'SRD Amarelo', 1, 'Pequeno', 'Disponível');

-- Inserir adoções correspondentes aos animais já marcados como Adotado
INSERT INTO adocoes (id, nome_adotante, telefone, email, id_animal, data_adocao) VALUES
  (1, 'Maria Silva', '(83) 99999-9999', 'maria.silva@email.com', 1, '2026-09-20'),
  (2, 'Carlos Oliveira', '(11) 98888-7777', 'carlos.oliveira@email.com', 5, '2026-09-25');
