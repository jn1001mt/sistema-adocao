const { pool } = require('../config/database');

class AdocoesService {
  /**
   * Retorna todas as adoções com os dados do animal relacionado
   */
  async listarTodas() {
    const sql = `
      SELECT 
        a.id,
        a.nome_adotante,
        a.telefone,
        a.email,
        a.id_animal,
        an.nome AS animal,
        an.especie AS especie_animal,
        an.porte AS porte_animal,
        DATE_FORMAT(a.data_adocao, '%Y-%m-%d') AS data_adocao,
        a.criado_em
      FROM adocoes a
      INNER JOIN animais an ON a.id_animal = an.id
      ORDER BY a.id DESC
    `;

    const [rows] = await pool.execute(sql);
    return rows;
  }

  /**
   * Registra uma nova adoção com transação e validação de regras de negócio
   * Passos:
   * 1. Iniciar transação
   * 2. Verificar se o animal existe (com FOR UPDATE para controle de concorrência)
   * 3. Verificar se o animal está Disponível
   * 4. Inserir registro na tabela adocoes
   * 5. Atualizar o status do animal para 'Adotado'
   * 6. Confirmar transação (COMMIT)
   * Se qualquer etapa falhar, reverter (ROLLBACK)
   */
  async registrarAdocao({ nome_adotante, telefone, email, id_animal }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1 & 2. Verificar se o animal existe e travar a linha para evitar concorrência
      const [animais] = await connection.execute(
        'SELECT id, nome, status FROM animais WHERE id = ? FOR UPDATE',
        [id_animal]
      );

      if (animais.length === 0) {
        const error = new Error('Animal não encontrado.');
        error.statusCode = 404;
        throw error;
      }

      const animal = animais[0];

      // 3. Verificar se o animal está Disponível
      if (animal.status !== 'Disponível') {
        const error = new Error('Não foi possível realizar a adoção. O animal já foi adotado.');
        error.statusCode = 400;
        throw error;
      }

      // 4. Inserir a adoção com a data atual (CURDATE())
      const [resultAdocao] = await connection.execute(
        'INSERT INTO adocoes (nome_adotante, telefone, email, id_animal, data_adocao) VALUES (?, ?, ?, ?, CURDATE())',
        [nome_adotante.trim(), telefone.trim(), email.trim(), id_animal]
      );

      // 5. Atualizar o status do animal para 'Adotado'
      await connection.execute(
        "UPDATE animais SET status = 'Adotado' WHERE id = ?",
        [id_animal]
      );

      // 6. Confirmar transação
      await connection.commit();

      return {
        id: resultAdocao.insertId,
        nome_adotante: nome_adotante.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        id_animal,
        animal: animal.nome,
        mensagem: 'Adoção registrada com sucesso.'
      };
    } catch (error) {
      // Reverter transação em caso de erro
      await connection.rollback();
      throw error;
    } finally {
      // Liberar conexão de volta ao pool
      connection.release();
    }
  }
}

module.exports = new AdocoesService();
