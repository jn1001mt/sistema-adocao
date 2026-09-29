/**
 * adocoes.js - Listagem, busca e visualização do histórico de adoções
 */

let listaAdocoesCompleta = [];

document.addEventListener('DOMContentLoaded', async () => {
  configurarBusca();
  await carregarAdocoes();
});

function configurarBusca() {
  const inputBusca = document.getElementById('filtro-busca-adocao');
  const btnLimpar = document.getElementById('btn-limpar-busca');

  inputBusca.addEventListener('input', filtrarAdocoes);
  btnLimpar.addEventListener('click', () => {
    inputBusca.value = '';
    filtrarAdocoes();
  });
}

async function carregarAdocoes() {
  const statusContainer = document.getElementById('adocoes-status-container');
  const tbody = document.getElementById('tbody-adocoes');

  statusContainer.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <span>Carregando histórico de adoções...</span>
    </div>
  `;
  tbody.innerHTML = '';

  try {
    listaAdocoesCompleta = await api.getAdocoes();
    statusContainer.innerHTML = '';
    filtrarAdocoes();
  } catch (error) {
    console.error('Erro ao listar adoções:', error);
    statusContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Erro ao carregar adoções</h3>
        <p class="empty-description">${error.message}</p>
        <button class="btn btn-secondary" onclick="carregarAdocoes()">Tentar Novamente</button>
      </div>
    `;
  }
}

function filtrarAdocoes() {
  const termo = document.getElementById('filtro-busca-adocao').value.trim().toLowerCase();

  const adocoesFiltradas = listaAdocoesCompleta.filter(adocao => {
    if (!termo) return true;
    const nomeAdotante = (adocao.nome_adotante || '').toLowerCase();
    const nomeAnimal = (adocao.animal || '').toLowerCase();
    const email = (adocao.email || '').toLowerCase();
    return nomeAdotante.includes(termo) || nomeAnimal.includes(termo) || email.includes(termo);
  });

  renderizarTabela(adocoesFiltradas);
}

function renderizarTabela(adocoes) {
  const tbody = document.getElementById('tbody-adocoes');
  const statusContainer = document.getElementById('adocoes-status-container');

  tbody.innerHTML = '';

  // Mensagem amigável quando não há adoções registradas (Requisito 16)
  if (!adocoes || adocoes.length === 0) {
    statusContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3 class="empty-title">Nenhuma adoção registrada.</h3>
        <p class="empty-description">Ainda não foram registradas adoções no sistema ou nenhum resultado correspondeu à busca.</p>
        <a href="cadastrar-adocao.html" class="btn btn-accent btn-sm">❤️ Registrar Adoção</a>
      </div>
    `;
    return;
  }

  statusContainer.innerHTML = '';

  adocoes.forEach(item => {
    const tr = document.createElement('tr');
    const icone = (item.especie_animal || '').toLowerCase().includes('gato') ? '🐱' : '🐶';

    tr.innerHTML = `
      <td><strong>#${item.id}</strong></td>
      <td>
        <strong style="color: var(--text-main);">${item.nome_adotante}</strong>
      </td>
      <td>${formatarTelefone(item.telefone)}</td>
      <td>
        <a href="mailto:${item.email}" style="color: var(--info); text-decoration: underline;">
          ${item.email}
        </a>
      </td>
      <td>
        <span class="badge badge-especie" style="font-weight: 600;">
          ${icone} ${item.animal}
        </span>
        <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.35rem;">
          (#${item.id_animal})
        </span>
      </td>
      <td>
        <strong>${formatarData(item.data_adocao)}</strong>
      </td>
    `;

    tbody.appendChild(tr);
  });
}
