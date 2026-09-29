/**
 * dashboard.js - Carregamento dinâmico de estatísticas e destaques na página inicial
 */

document.addEventListener('DOMContentLoaded', async () => {
  await carregarEstatisticas();
  await carregarAnimaisDisponiveis();
});

async function carregarEstatisticas() {
  try {
    const stats = await api.getEstatisticas();
    
    document.getElementById('stat-total-animais').textContent = stats.totalAnimais ?? 0;
    document.getElementById('stat-animais-disponiveis').textContent = stats.animaisDisponiveis ?? 0;
    document.getElementById('stat-animais-adotados').textContent = stats.animaisAdotados ?? 0;
    document.getElementById('stat-total-adocoes').textContent = stats.totalAdocoes ?? 0;
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    showToast(error.message, 'error');
  }
}

async function carregarAnimaisDisponiveis() {
  const container = document.getElementById('recent-animals-container');
  if (!container) return;

  try {
    const animais = await api.getAnimais({ status: 'Disponível' });
    
    if (!animais || animais.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <div class="empty-icon">🎉</div>
          <h3 class="empty-title">Nenhum animal aguardando adoção no momento!</h3>
          <p class="empty-description">Todos os animaizinhos cadastrados já foram adotados ou ainda não há cadastros.</p>
          <a href="cadastrar-animal.html" class="btn btn-primary btn-sm">➕ Cadastrar Animal</a>
        </div>
      `;
      return;
    }

    // Exibir até 4 animais em destaque
    const destaques = animais.slice(0, 4);

    let html = `
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Espécie</th>
              <th>Raça</th>
              <th>Idade</th>
              <th>Porte</th>
              <th>Status</th>
              <th style="text-align: right;">Ação</th>
            </tr>
          </thead>
          <tbody>
    `;

    destaques.forEach(animal => {
      const icone = animal.especie.toLowerCase().includes('gato') ? '🐱' : '🐶';
      html += `
        <tr>
          <td><strong>#${animal.id}</strong></td>
          <td><strong>${animal.nome}</strong></td>
          <td><span class="badge badge-especie">${icone} ${animal.especie}</span></td>
          <td>${animal.raca}</td>
          <td>${animal.idade} ${animal.idade === 1 ? 'ano' : 'anos'}</td>
          <td><span class="badge badge-porte">${animal.porte}</span></td>
          <td>${obterBadgeStatus(animal.status)}</td>
          <td style="text-align: right;">
            <a href="cadastrar-adocao.html?animalId=${animal.id}" class="btn btn-accent btn-sm">❤️ Adotar</a>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  } catch (error) {
    console.error('Erro ao carregar animais no dashboard:', error);
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--danger);">
        ⚠️ Não foi possível carregar a lista de animais. Certifique-se de que o backend local está em execução.
      </div>
    `;
  }
}
