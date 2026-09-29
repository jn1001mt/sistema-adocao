/**
 * editar-animal.js - Carregamento, validação e atualização dos dados de um animal
 */

let animalId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  animalId = urlParams.get('id');

  if (!animalId || isNaN(Number(animalId))) {
    showToast('Identificador de animal inválido ou ausente.', 'error');
    setTimeout(() => window.location.href = 'animais.html', 1500);
    return;
  }

  await carregarDadosAnimal();

  const form = document.getElementById('form-editar-animal');
  form.addEventListener('submit', salvarAlteracoes);
});

async function carregarDadosAnimal() {
  const loadingState = document.getElementById('loading-state');
  const form = document.getElementById('form-editar-animal');
  const pageTitle = document.getElementById('page-title');

  try {
    const animal = await api.getAnimal(animalId);

    pageTitle.textContent = `✏️ Editar dados de "${animal.nome}"`;
    document.getElementById('badge-status-atual').innerHTML = obterBadgeStatus(animal.status);

    document.getElementById('nome').value = animal.nome;
    document.getElementById('especie').value = animal.especie;
    document.getElementById('raca').value = animal.raca;
    document.getElementById('idade').value = animal.idade;
    document.getElementById('porte').value = animal.porte;

    loadingState.style.display = 'none';
    form.style.display = 'block';
  } catch (error) {
    console.error('Erro ao carregar animal para edição:', error);
    loadingState.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Não foi possível carregar os dados</h3>
        <p class="empty-description">${error.message}</p>
        <a href="animais.html" class="btn btn-secondary">Voltar para a Lista</a>
      </div>
    `;
  }
}

async function salvarAlteracoes(evento) {
  evento.preventDefault();
  limparErros();

  const btnSubmit = document.getElementById('btn-submit');
  const nome = document.getElementById('nome').value.trim();
  const especie = document.getElementById('especie').value.trim();
  const raca = document.getElementById('raca').value.trim();
  const idadeStr = document.getElementById('idade').value.trim();
  const porte = document.getElementById('porte').value.trim();

  let formularioValido = true;

  if (!nome || nome.length < 2) {
    mostrarErroCampo('nome', 'Informe o nome do animal (mínimo de 2 caracteres).');
    formularioValido = false;
  }

  if (!especie) {
    mostrarErroCampo('especie', 'Selecione uma espécie.');
    formularioValido = false;
  }

  if (!raca) {
    mostrarErroCampo('raca', 'Informe a raça.');
    formularioValido = false;
  }

  const idade = Number(idadeStr);
  if (idadeStr === '' || isNaN(idade) || !Number.isInteger(idade) || idade < 0 || idade > 40) {
    mostrarErroCampo('idade', 'Informe uma idade válida (0 a 40 anos).');
    formularioValido = false;
  }

  if (!porte) {
    mostrarErroCampo('porte', 'Selecione o porte físico.');
    formularioValido = false;
  }

  if (!formularioValido) {
    showToast('Por favor, verifique os campos com erro.', 'warning');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '⏳ Atualizando...';

  try {
    const dados = { nome, especie, raca, idade, porte };
    const animalAtualizado = await api.updateAnimal(animalId, dados);

    showToast(`Animal "${animalAtualizado.nome}" atualizado com sucesso!`, 'success');

    setTimeout(() => {
      window.location.href = 'animais.html';
    }, 1200);
  } catch (error) {
    console.error('Erro ao atualizar animal:', error);
    showToast(error.message, 'error');
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '💾 Salvar Alterações';
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
