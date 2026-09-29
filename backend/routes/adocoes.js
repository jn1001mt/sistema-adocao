const express = require('express');
const router = express.Router();
const adocoesController = require('../controllers/adocoesController');

// GET /adocoes - Listar todas as adoções com dados do animal
router.get('/', (req, res) => adocoesController.listar(req, res));

// POST /adocoes - Registrar uma nova adoção
router.post('/', (req, res) => adocoesController.cadastrar(req, res));

module.exports = router;
