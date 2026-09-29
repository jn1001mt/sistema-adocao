/**
 * animais.js - Lógica de listagem, busca, filtros e ações da página de animais
 */

let listaAnimaisCompleta = [];

document.addEventListener('DOMContentLoaded', async () => {
  configurarFiltrosDaUrl();
  configurarEventosFiltros();
  await carregarAnimais();
});

/**
 * Lê parâmetros da URL (ex: ?status=Disponível) para pré-selecionar filtros
 */
function configurarFiltrosDaUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const statusParam = urlParams.get('status');
  if (statusParam) {
    const selectStatus = document.getElementById('filtro-status');
    if (selectStatus) selectStatus.value = statusParam;
  }
}

/**
 * Registra listeners nos campos de filtro e busca
 */
function configurarEventosFiltros() {
  const inputBusca = document.getElementById('filtro-busca');
  const selectEspecie = document.getElementById('filtro-especie');
  const selectStatus = document.getElementById('filtro-status');
  const selectPorte = document.getElementById('filtro-porte');
  const btnLimpar = document.getElementById('btn-limpar-filtros');

  inputBusca.addEventListener('input', aplicarFiltros);
  selectEspecie.addEventListener('change', aplicarFiltros);
  selectStatus.addEventListener('change', aplicarFiltros);
  selectPorte.addEventListener('change', aplicarFiltros);

  btnLimpar.addEventListener('click', () => {
    inputBusca.value = '';
    selectEspecie.value = '';
    selectStatus.value = '';
    selectPorte.value = '';
    aplicarFiltros();
  });
}

/**
 * Carrega a lista completa de animais da API local
 */
async function carregarAnimais() {
  const statusContainer = document.getElementById('animais-status-container');
  const tbody = document.getElementById('tbody-animais');

  statusContainer.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <span>Carregando animais do banco de dados...</span>
    </div>
  `;
  tbody.innerHTML = '';

  try {
    listaAnimaisCompleta = await api.getAnimais();
    statusContainer.innerHTML = '';
    aplicarFiltros();
  } catch (error) {
    console.error('Erro ao carregar lista de animais:', error);
    statusContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Erro ao carregar animais</h3>
        <p class="empty-description">${error.message}</p>
        <button class="btn btn-secondary" onclick="carregarAnimais()">Tentar Novamente</button>
      </div>
    `;
  }
}

/**
 * Filtra a lista em memória com base nos campos de busca e filtros
 */
function aplicarFiltros() {
  const termoBusca = document.getElementById('filtro-busca').value.trim().toLowerCase();
  const filtroEspecie = document.getElementById('filtro-especie').value;
  const filtroStatus = document.getElementById('filtro-status').value;
  const filtroPorte = document.getElementById('filtro-porte').value;

  const animaisFiltrados = listaAnimaisCompleta.filter(animal => {
    // Filtro por nome
    const atendeBusca = !termoBusca || animal.nome.toLowerCase().includes(termoBusca);
    // Filtro por espécie
    const atendeEspecie = !filtroEspecie || animal.especie.toLowerCase() === filtroEspecie.toLowerCase();
    // Filtro por status
    const atendeStatus = !filtroStatus || animal.status === filtroStatus;
    // Filtro por porte
    const atendePorte = !filtroPorte || animal.porte === filtroPorte;

    return atendeBusca && atendeEspecie && atendeStatus && atendePorte;
  });

  renderizarTabela(animaisFiltrados);
}

/**
 * Renderiza as linhas na tabela HTML
 */
function renderizarTabela(animais) {
  const tbody = document.getElementById('tbody-animais');
  const statusContainer = document.getElementById('animais-status-container');

  tbody.innerHTML = '';

  if (!animais || animais.length === 0) {
    statusContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🐾</div>
        <h3 class="empty-title">Nenhum animal encontrado</h3>
        <p class="empty-description">Não há registros correspondentes aos critérios de busca ou filtros aplicados.</p>
        <a href="cadastrar-animal.html" class="btn btn-primary btn-sm">➕ Cadastrar Novo Animal</a>
      </div>
    `;
    return;
  }

  statusContainer.innerHTML = '';

  animais.forEach(animal => {
    const tr = document.createElement('tr');
    const icone = animal.especie.toLowerCase().includes('gato') ? '🐱' : '🐶';
    const isDisponivel = animal.status === 'Disponível';

    tr.innerHTML = `
      <td><strong>#${animal.id}</strong></td>
      <td>
        <strong style="color: var(--text-main); font-size: 0.95rem;">${animal.nome}</strong>
      </td>
      <td>
        <span class="badge badge-especie">${icone} ${animal.especie}</span>
      </td>
      <td>${animal.raca}</td>
      <td>${animal.idade} ${animal.idade === 1 ? 'ano' : 'anos'}</td>
      <td><span class="badge badge-porte">${animal.porte}</span></td>
      <td>${obterBadgeStatus(animal.status)}</td>
      <td style="text-align: center;">
        <div class="table-actions" style="justify-content: center;">
          <button class="btn btn-secondary btn-sm" onclick="visualizarAnimal(${animal.id})" title="Visualizar detalhes">
            👁️ Ver
          </button>
          <a href="editar-animal.html?id=${animal.id}" class="btn btn-secondary btn-sm" title="Editar dados">
            ✏️ Editar
          </a>
          <button class="btn btn-danger btn-sm" onclick="confirmarExclusao(${animal.id}, '${animal.nome.replace(/'/g, "\\'")}')" title="Excluir animal">
            🗑️ Excluir
          </button>
          ${isDisponivel 
            ? `<a href="cadastrar-adocao.html?animalId=${animal.id}" class="btn btn-accent btn-sm" title="Registrar adoção">❤️ Adotar</a>`
            : `<button class="btn btn-secondary btn-sm" disabled title="Este animal já foi adotado">✓ Adotado</button>`
          }
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/**
 * Exibe modal com detalhes completos do animal
 */
async function visualizarAnimal(id) {
  try {
    const animal = await api.getAnimal(id);
    const icone = animal.especie.toLowerCase().includes('gato') ? '🐱' : '🐶';
    const isDisponivel = animal.status === 'Disponível';

    const conteudoHtml = `
      <div class="animal-profile-card">
        <div class="animal-hero-info">
          <div class="animal-avatar">${icone}</div>
          <div class="animal-title-wrap">
            <h2>${animal.nome}</h2>
            <div style="margin-top: 0.25rem;">${obterBadgeStatus(animal.status)}</div>
          </div>
        </div>

        <div class="animal-specs-grid">
          <div class="spec-box">
            <span class="spec-title">Espécie</span>
            <div class="spec-data">${animal.especie}</div>
          </div>
          <div class="spec-box">
            <span class="spec-title">Raça</span>
            <div class="spec-data">${animal.raca}</div>
          </div>
          <div class="spec-box">
            <span class="spec-title">Idade Estimada</span>
            <div class="spec-data">${animal.idade} ${animal.idade === 1 ? 'ano' : 'anos'}</div>
          </div>
          <div class="spec-box">
            <span class="spec-title">Porte Físico</span>
            <div class="spec-data">${animal.porte}</div>
          </div>
        </div>
      </div>
    `;

    let botoesHtml = `<button class="btn btn-secondary" onclick="closeModal()">Fechar</button>`;
    if (isDisponivel) {
      botoesHtml += `<a href="cadastrar-adocao.html?animalId=${animal.id}" class="btn btn-accent">❤️ Iniciar Adoção</a>`;
    }

    showCustomModal({
      titulo: `🐾 Detalhes de ${animal.nome}`,
      conteudoHtml,
      botoesHtml
    });
  } catch (error) {
    showToast(error.message, 'error');
  }
}

/**
 * Exibe confirmação antes de excluir o animal
 */
function confirmarExclusao(id, nome) {
  showConfirmModal({
    titulo: '🗑️ Confirmar Exclusão',
    mensagem: `Tem certeza que deseja remover este animal do sistema? Esta ação é irreversível.`,
    detalhes: [
      { label: 'ID', value: `#${id}` },
      { label: 'Animal', value: nome }
    ],
    textoConfirmar: 'Sim, Excluir',
    textoCancelar: 'Cancelar',
    tipoConfirmar: 'danger',
    onConfirm: async () => {
      try {
        const resultado = await api.deleteAnimal(id);
        showToast(resultado.mensagem || 'Animal removido com sucesso!', 'success');
        await carregarAnimais();
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  });
}
