const adocoesService = require('../services/adocoesService');

class AdocoesController {
  /**
   * GET /adocoes
   * Lista todas as adoções registradas
   */
  async listar(req, res) {
    try {
      const adocoes = await adocoesService.listarTodas();
      return res.status(200).json(adocoes);
    } catch (error) {
      console.error('Erro ao listar adoções:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor ao listar adoções.' });
    }
  }

  /**
   * POST /adocoes
   * Registra uma nova adoção com verificação transacional
   */
  async cadastrar(req, res) {
    try {
      const { nome_adotante, telefone, email, id_animal } = req.body;

      // Validação de presença dos campos
      if (!nome_adotante || !telefone || !email || id_animal === undefined || id_animal === null) {
        return res.status(400).json({
          mensagem: 'Todos os campos são obrigatórios: nome do adotante, telefone, e-mail e animal.'
        });
      }

      // Validação de nome
      if (nome_adotante.trim().length < 3) {
        return res.status(400).json({
          mensagem: 'O nome do adotante deve conter pelo menos 3 caracteres.'
        });
      }

      // Validação simples de telefone (ao menos 8 dígitos numéricos)
      const apenasNumerosTel = telefone.replace(/\D/g, '');
      if (apenasNumerosTel.length < 8 || apenasNumerosTel.length > 15) {
        return res.status(400).json({
          mensagem: 'Informe um número de telefone válido com DDD.'
        });
      }

      // Validação de formato de e-mail com regex padrão
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          mensagem: 'Informe um endereço de e-mail válido.'
        });
      }

      // Validação do ID do animal
      const idAnimalNum = Number(id_animal);
      if (isNaN(idAnimalNum) || !Number.isInteger(idAnimalNum) || idAnimalNum <= 0) {
        return res.status(400).json({
          mensagem: 'O identificador do animal selecionado é inválido.'
        });
      }

      const novaAdocao = await adocoesService.registrarAdocao({
        nome_adotante,
        telefone,
        email,
        id_animal: idAnimalNum
      });

      return res.status(201).json(novaAdocao);
    } catch (error) {
      console.error('Erro ao registrar adoção:', error.message);

      // Tratar erros de regra de negócio com status code apropriado
      if (error.statusCode) {
        return res.status(error.statusCode).json({ mensagem: error.message });
      }

      return res.status(500).json({
        mensagem: 'Erro interno ao processar a adoção. As alterações foram revertidas.'
      });
    }
  }
}

module.exports = new AdocoesController();
