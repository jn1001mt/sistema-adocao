/**
 * cadastrar-animal.js - Validação e envio do formulário de cadastro de novo animal
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-cadastrar-animal');
  form.addEventListener('submit', lidarComEnvio);
});

async function lidarComEnvio(evento) {
  evento.preventDefault();

  const form = evento.target;
  const btnSubmit = document.getElementById('btn-submit');

  // Limpar mensagens de erro anteriores
  limparErros();

  const nome = document.getElementById('nome').value.trim();
  const especie = document.getElementById('especie').value.trim();
  const raca = document.getElementById('raca').value.trim();
  const idadeStr = document.getElementById('idade').value.trim();
  const porte = document.getElementById('porte').value.trim();

  // Validação no frontend
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
    mostrarErroCampo('raca', 'Informe a raça do animal (ou SRD).');
    formularioValido = false;
  }

  const idade = Number(idadeStr);
  if (idadeStr === '' || isNaN(idade) || !Number.isInteger(idade) || idade < 0 || idade > 40) {
    mostrarErroCampo('idade', 'Informe uma idade válida (número inteiro entre 0 e 40).');
    formularioValido = false;
  }

  if (!porte) {
    mostrarErroCampo('porte', 'Selecione o porte físico.');
    formularioValido = false;
  }

  if (!formularioValido) {
    showToast('Por favor, corrija os campos destacados.', 'warning');
    return;
  }

  // Desabilitar botão para evitar envios duplicados
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '⏳ Salvando...';

  try {
    const dados = { nome, especie, raca, idade, porte };
    const animalCadastrado = await api.createAnimal(dados);

    showToast(`Animal "${animalCadastrado.nome}" cadastrado com sucesso!`, 'success');
    form.reset();

    // Redirecionamento amigável após breve intervalo
    setTimeout(() => {
      window.location.href = 'animais.html';
    }, 1500);
  } catch (error) {
    console.error('Erro ao cadastrar animal:', error);
    showToast(error.message, 'error');
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '💾 Salvar Animal';
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
