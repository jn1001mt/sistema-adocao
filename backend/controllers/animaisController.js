const animaisService = require('../services/animaisService');

class AnimaisController {
  /**
   * GET /animais
   * Retorna todos os animais com filtros opcionais
   */
  async listar(req, res) {
    try {
      const { status, especie, porte, busca } = req.query;
      const animais = await animaisService.listarTodos({ status, especie, porte, busca });
      return res.status(200).json(animais);
    } catch (error) {
      console.error('Erro ao listar animais:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao listar animais.' });
    }
  }

  /**
   * GET /animais/:id
   * Retorna um animal específico
   */
  async buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ mensagem: 'Identificador (ID) de animal inválido.' });
      }

      const animal = await animaisService.buscarPorId(id);
      if (!animal) {
        return res.status(404).json({ mensagem: 'Animal não encontrado.' });
      }

      return res.status(200).json(animal);
    } catch (error) {
      console.error('Erro ao buscar animal por ID:', error);
      return res.status(500).json({ mensagem: 'Erro interno ao buscar animal.' });
    }
  }

  /**
   * POST /animais
   * Cadastra um novo animal
   */
  async cadastrar(req, res) {
    try {
      const { nome, especie, raca, idade, porte } = req.body;

      // Validação de campos obrigatórios
      if (!nome || !especie || !raca || idade === undefined || idade === null || !porte) {
        return res.status(400).json({
          mensagem: 'Todos os campos são obrigatórios: nome, espécie, raça, idade e porte.'
        });
      }

      // Validação de tipos e formatos
      const idadeNum = Number(idade);
      if (isNaN(idadeNum) || !Number.isInteger(idadeNum) || idadeNum < 0 || idadeNum > 40) {
        return res.status(400).json({
          mensagem: 'A idade deve ser um número inteiro válido entre 0 e 40 anos.'
        });
      }

      const portesValidos = ['Pequeno', 'Médio', 'Grande'];
      if (!portesValidos.includes(porte)) {
        return res.status(400).json({
          mensagem: 'Porte inválido. Escolha entre: Pequeno, Médio ou Grande.'
        });
      }

      if (nome.trim().length < 2 || nome.trim().length > 100) {
        return res.status(400).json({
          mensagem: 'O nome do animal deve ter entre 2 e 100 caracteres.'
        });
      }

      const novoAnimal = await animaisService.cadastrar({
        nome,
        especie,
        raca,
        idade: idadeNum,
        porte
      });

      return res.status(201).json(novoAnimal);
    } catch (error) {
      console.error('Erro ao cadastrar animal:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao cadastrar animal.' });
    }
  }

  /**
   * PUT /animais/:id
   * Atualiza os dados de um animal (não altera status manualmente)
   */
  async atualizar(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ mensagem: 'Identificador (ID) de animal inválido.' });
      }

      const { nome, especie, raca, idade, porte } = req.body;

      // Validação de campos obrigatórios
      if (!nome || !especie || !raca || idade === undefined || idade === null || !porte) {
        return res.status(400).json({
          mensagem: 'Todos os campos são obrigatórios: nome, espécie, raça, idade e porte.'
        });
      }

      const idadeNum = Number(idade);
      if (isNaN(idadeNum) || !Number.isInteger(idadeNum) || idadeNum < 0 || idadeNum > 40) {
        return res.status(400).json({
          mensagem: 'A idade deve ser um número inteiro válido entre 0 e 40 anos.'
        });
      }

      const portesValidos = ['Pequeno', 'Médio', 'Grande'];
      if (!portesValidos.includes(porte)) {
        return res.status(400).json({
          mensagem: 'Porte inválido. Escolha entre: Pequeno, Médio ou Grande.'
        });
      }

      const animalAtualizado = await animaisService.atualizar(id, {
        nome,
        especie,
        raca,
        idade: idadeNum,
        porte
      });

      if (!animalAtualizado) {
        return res.status(404).json({ mensagem: 'Animal não encontrado para atualização.' });
      }

      return res.status(200).json(animalAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar animal:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao atualizar animal.' });
    }
  }

  /**
   * DELETE /animais/:id
   * Remove um animal
   */
  async remover(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ mensagem: 'Identificador (ID) de animal inválido.' });
      }

      const resultado = await animaisService.remover(id);

      if (!resultado.encontrado) {
        return res.status(404).json({ mensagem: 'Animal não encontrado para exclusão.' });
      }

      if (resultado.possuiAdocao) {
        return res.status(400).json({ mensagem: resultado.mensagem });
      }

      return res.status(200).json({ mensagem: 'Animal removido com sucesso!' });
    } catch (error) {
      console.error('Erro ao remover animal:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao remover animal.' });
    }
  }

  /**
   * GET /dashboard/estatisticas
   * Retorna os números consolidados para os cards da dashboard
   */
  async estatisticas(req, res) {
    try {
      const stats = await animaisService.obterEstatisticas();
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return res.status(500).json({ mensagem: 'Erro ao carregar estatísticas do sistema.' });
    }
  }
}

module.exports = new AnimaisController();
