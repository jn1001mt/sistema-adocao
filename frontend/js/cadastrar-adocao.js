/**
 * cadastrar-adocao.js - Registro de nova adoção com modal de confirmação e transação no backend
 */

let animaisDisponiveis = [];

document.addEventListener('DOMContentLoaded', async () => {
  configurarMascaraTelefone();
  await carregarAnimaisDisponiveis();

  const form = document.getElementById('form-cadastrar-adocao');
  form.addEventListener('submit', lidarComSubmissao);
});

/**
 * Aplica máscara de telefone dinamicamente enquanto o usuário digita
 */
function configurarMascaraTelefone() {
  const inputTel = document.getElementById('telefone');
  inputTel.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);

    if (valor.length > 6) {
      valor = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7)}`;
    } else if (valor.length > 2) {
      valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
    } else if (valor.length > 0) {
      valor = `(${valor}`;
    }
    e.target.value = valor;
  });
}

/**
 * Carrega a lista de animais com status = 'Disponível'
 */
async function carregarAnimaisDisponiveis() {
  const selectAnimal = document.getElementById('id_animal');
  const urlParams = new URLSearchParams(window.location.search);
  const animalIdPreSelecionado = urlParams.get('animalId');

  try {
    animaisDisponiveis = await api.getAnimais({ status: 'Disponível' });

    if (!animaisDisponiveis || animaisDisponiveis.length === 0) {
      selectAnimal.innerHTML = '<option value="">Nenhum animal disponível para adoção no momento</option>';
      selectAnimal.disabled = true;
      document.getElementById('btn-submit').disabled = true;
      showToast('No momento não há animais com status "Disponível" para adoção.', 'info', 6000);
      return;
    }

    selectAnimal.innerHTML = '<option value="">Selecione o animal...</option>';
    animaisDisponiveis.forEach(animal => {
      const option = document.createElement('option');
      option.value = animal.id;
      option.textContent = `${animal.nome} - ${animal.especie} (Raça: ${animal.raca}, Porte: ${animal.porte})`;
      
      if (animalIdPreSelecionado && String(animal.id) === String(animalIdPreSelecionado)) {
        option.selected = true;
      }
      selectAnimal.appendChild(option);
    });

    selectAnimal.disabled = false;
  } catch (error) {
    console.error('Erro ao buscar animais disponíveis:', error);
    selectAnimal.innerHTML = '<option value="">Erro ao carregar lista de animais</option>';
    showToast(error.message, 'error');
  }
}

/**
 * Valida o formulário e abre a tela de confirmação visual antes do envio
 */
function lidarComSubmissao(evento) {
  evento.preventDefault();
  limparErros();

  const idAnimal = document.getElementById('id_animal').value;
  const nomeAdotante = document.getElementById('nome_adotante').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const email = document.getElementById('email').value.trim();

  let formularioValido = true;

  if (!idAnimal) {
    mostrarErroCampo('id_animal', 'Selecione um animal disponível da lista.');
    formularioValido = false;
  }

  if (!nomeAdotante || nomeAdotante.length < 3) {
    mostrarErroCampo('nome_adotante', 'Informe o nome completo do adotante (mínimo de 3 caracteres).');
    formularioValido = false;
  }

  const telNums = telefone.replace(/\D/g, '');
  if (telNums.length < 10) {
    mostrarErroCampo('telefone', 'Informe um telefone válido com DDD (mínimo de 10 dígitos).');
    formularioValido = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    mostrarErroCampo('email', 'Informe um endereço de e-mail válido.');
    formularioValido = false;
  }

  if (!formularioValido) {
    showToast('Por favor, preencha corretamente os campos destacados.', 'warning');
    return;
  }

  const animalSelecionado = animaisDisponiveis.find(a => String(a.id) === String(idAnimal));
  const nomeAnimal = animalSelecionado ? animalSelecionado.nome : `Animal #${idAnimal}`;

  // Apresentar confirmação visual antes de enviar (Requisito 15)
  showConfirmModal({
    titulo: '❤️ Confirmar Adoção?',
    mensagem: 'Por favor, revise atentamente os dados da adoção antes de confirmar:',
    detalhes: [
      { label: 'Adotante', value: nomeAdotante },
      { label: 'Animal', value: `${nomeAnimal} (${animalSelecionado ? animalSelecionado.especie : ''})` },
      { label: 'Telefone', value: telefone },
      { label: 'E-mail', value: email }
    ],
    textoConfirmar: 'Confirmar Adoção',
    textoCancelar: 'Cancelar',
    tipoConfirmar: 'accent',
    onConfirm: async () => {
      await enviarAdocao({
        id_animal: Number(idAnimal),
        nome_adotante: nomeAdotante,
        telefone,
        email
      });
    }
  });
}

/**
 * Envia a requisição POST /adocoes ao backend
 */
async function enviarAdocao(dados) {
  const btnSubmit = document.getElementById('btn-submit');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '⏳ Processando adoção...';

  try {
    const resposta = await api.createAdocao(dados);
    showToast(resposta.mensagem || 'Adoção registrada com sucesso!', 'success');

    // Redireciona para o histórico de adoções
    setTimeout(() => {
      window.location.href = 'adocoes.html';
    }, 1500);
  } catch (error) {
    console.error('Falha ao registrar adoção:', error);
    showToast(error.message, 'error', 6000);
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '❤️ Registrar Adoção';
  }
}

function mostrarErroCampo(campoId, mensagem) {
  const input = document.getElementById(campoId);
  const feedback = document.getElementById(`feedback-${campoId}`);
  if (input) input.classList.add('is-invalid');
  if (feedback) feedback.textContent = mensagem;
}

function limparErros() {
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  document.querySelectorAll('.form-feedback').forEach(el => el.textContent = '');
}
