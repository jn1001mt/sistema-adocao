const { pool } = require('../config/database');

class AnimaisService {
  /**
   * Lista todos os animais, com suporte a filtros opcionais
   */
  async listarTodos(filtros = {}) {
    let sql = 'SELECT id, nome, especie, raca, idade, porte, status, criado_em FROM animais WHERE 1=1';
    const params = [];

    if (filtros.status) {
      sql += ' AND status = ?';
      params.push(filtros.status);
    }

    if (filtros.especie) {
      sql += ' AND especie = ?';
      params.push(filtros.especie);
    }

    if (filtros.porte) {
      sql += ' AND porte = ?';
      params.push(filtros.porte);
    }

    if (filtros.busca) {
      sql += ' AND nome LIKE ?';
      params.push(`%${filtros.busca}%`);
    }

    sql += ' ORDER BY id DESC';

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * Busca um animal específico pelo ID
   */
  async buscarPorId(id) {
    const [rows] = await pool.execute(
      'SELECT id, nome, especie, raca, idade, porte, status, criado_em FROM animais WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Cadastra um novo animal com status padrão 'Disponível'
   */
  async cadastrar({ nome, especie, raca, idade, porte }) {
    const status = 'Disponível';
    const [result] = await pool.execute(
      'INSERT INTO animais (nome, especie, raca, idade, porte, status) VALUES (?, ?, ?, ?, ?, ?)',
      [nome.trim(), especie.trim(), raca.trim(), Number(idade), porte.trim(), status]
    );

    return {
      id: result.insertId,
      nome: nome.trim(),
      especie: especie.trim(),
      raca: raca.trim(),
      idade: Number(idade),
      porte: porte.trim(),
      status
    };
  }

  /**
   * Atualiza os dados de um animal (sem permitir alteração manual de status)
   */
  async atualizar(id, { nome, especie, raca, idade, porte }) {
    // Verifica se animal existe
    const animalExistente = await this.buscarPorId(id);
    if (!animalExistente) {
      return null;
    }

    await pool.execute(
      'UPDATE animais SET nome = ?, especie = ?, raca = ?, idade = ?, porte = ? WHERE id = ?',
      [nome.trim(), especie.trim(), raca.trim(), Number(idade), porte.trim(), id]
    );

    return {
      id: Number(id),
      nome: nome.trim(),
      especie: especie.trim(),
      raca: raca.trim(),
      idade: Number(idade),
      porte: porte.trim(),
      status: animalExistente.status
    };
  }

  /**
   * Remove um animal pelo ID
   */
  async remover(id) {
    // Verifica se animal existe
    const animal = await this.buscarPorId(id);
    if (!animal) {
      return { encontrado: false };
    }

    // Verifica se há adoções vinculadas a este animal
    const [adocoes] = await pool.execute(
      'SELECT id FROM adocoes WHERE id_animal = ? LIMIT 1',
      [id]
    );

    if (adocoes.length > 0) {
      return {
        encontrado: true,
        possuiAdocao: true,
        mensagem: 'Não é possível excluir este animal pois ele possui registro de adoção no sistema.'
      };
    }

    await pool.execute('DELETE FROM animais WHERE id = ?', [id]);
    return { encontrado: true, possuiAdocao: false };
  }

  /**
   * Obtém estatísticas consolidadas para o Dashboard
   */
  async obterEstatisticas() {
    const [[{ totalAnimais }]] = await pool.execute(
      'SELECT COUNT(*) AS totalAnimais FROM animais'
    );
    const [[{ animaisDisponiveis }]] = await pool.execute(
      "SELECT COUNT(*) AS animaisDisponiveis FROM animais WHERE status = 'Disponível'"
    );
    const [[{ animaisAdotados }]] = await pool.execute(
      "SELECT COUNT(*) AS animaisAdotados FROM animais WHERE status = 'Adotado'"
    );
    const [[{ totalAdocoes }]] = await pool.execute(
      'SELECT COUNT(*) AS totalAdocoes FROM adocoes'
    );

    return {
      totalAnimais: Number(totalAnimais),
      animaisDisponiveis: Number(animaisDisponiveis),
      animaisAdotados: Number(animaisAdotados),
      totalAdocoes: Number(totalAdocoes)
    };
  }
}

module.exports = new AnimaisService();
