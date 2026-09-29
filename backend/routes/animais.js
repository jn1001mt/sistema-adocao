const express = require('express');
const router = express.Router();
const animaisController = require('../controllers/animaisController');

// Rota para estatísticas consolidadas da dashboard
// Registrada antes de /:id para evitar conflito de rota
router.get('/estatisticas', (req, res) => animaisController.estatisticas(req, res));

// GET /animais - Listar todos os animais
router.get('/', (req, res) => animaisController.listar(req, res));

// GET /animais/:id - Buscar animal por ID
router.get('/:id', (req, res) => animaisController.buscarPorId(req, res));

// POST /animais - Cadastrar novo animal
router.post('/', (req, res) => animaisController.cadastrar(req, res));

// PUT /animais/:id - Atualizar dados do animal
router.put('/:id', (req, res) => animaisController.atualizar(req, res));

// DELETE /animais/:id - Remover animal
router.delete('/:id', (req, res) => animaisController.remover(req, res));

module.exports = router;
