/**
 * api.js - Módulo centralizado de comunicação com o Backend (100% local)
 * e utilitários de interface (Toasts, Modais, Formatadores)
 */

// Define a URL base da API local
// Se estiver rodando na porta 3000 (servido pelo Express), usa caminhos relativos
// Se estiver aberto via Live Server ou arquivo direto, aponta para http://localhost:3000
const API_BASE_URL = window.location.port === '3000' 
  ? '' 
  : 'http://localhost:3000';

/**
 * Função utilitária para requisições fetch com tratamento padronizado de erros
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const mensagemErro = (data && data.mensagem) 
        ? data.mensagem 
        : `Erro na requisição (Código HTTP ${response.status})`;
      
      const error = new Error(mensagemErro);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Falha de conexão com o servidor local:', error);
      throw new Error('Não foi possível conectar ao servidor local. Verifique se o backend está rodando em http://localhost:3000');
    }
    throw error;
  }
}

/**
 * Métodos da API REST do sistema de adoção
 */
const api = {
  // Animais
  async getAnimais(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.especie) params.append('especie', filtros.especie);
    if (filtros.porte) params.append('porte', filtros.porte);
    if (filtros.busca) params.append('busca', filtros.busca);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/animais${queryString}`, { method: 'GET' });
  },

  async getAnimal(id) {
    return await request(`/animais/${id}`, { method: 'GET' });
  },

  async createAnimal(dadosAnimal) {
    return await request('/animais', {
      method: 'POST',
      body: JSON.stringify(dadosAnimal)
    });
  },

  async updateAnimal(id, dadosAnimal) {
    return await request(`/animais/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dadosAnimal)
    });
  },

  async deleteAnimal(id) {
    return await request(`/animais/${id}`, { method: 'DELETE' });
  },

  // Adoções
  async getAdocoes() {
    return await request('/adocoes', { method: 'GET' });
  },

  async createAdocao(dadosAdocao) {
    return await request('/adocoes', {
      method: 'POST',
      body: JSON.stringify(dadosAdocao)
    });
  },

  // Estatísticas para o Dashboard
  async getEstatisticas() {
    return await request('/animais/estatisticas', { method: 'GET' });
  }
};

/**
 * ==========================================================
 * SISTEMA DE FEEDBACK VISUAL: TOAST NOTIFICATIONS
 * ==========================================================
 */

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

/**
 * Exibe uma mensagem Toast flutuante
 * @param {string} mensagem - Texto a ser exibido
 * @param {'success'|'error'|'warning'|'info'} tipo - Tipo da notificação
 * @param {number} duracao - Tempo de exibição em milissegundos (padrão 4000)
 */
function showToast(mensagem, tipo = 'success', duracao = 4000) {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;

  // Ícones representativos
  const icones = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icones[tipo] || '•'}</span>
    <span class="toast-message">${mensagem}</span>
    <button class="toast-close" title="Fechar">&times;</button>
  `;

  const btnClose = toast.querySelector('.toast-close');
  const remover = () => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 250);
  };

  btnClose.addEventListener('click', remover);

  container.appendChild(toast);

  if (duracao > 0) {
    setTimeout(remover, duracao);
  }
}

/**
 * ==========================================================
 * SISTEMA DE MODAL GENÉRICO E DE CONFIRMAÇÃO
 * ==========================================================
 */

let globalModalOverlay = null;

function getModalElements() {
  if (!globalModalOverlay) {
    let overlay = document.getElementById('global-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-modal-overlay';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title">Título</h3>
            <button class="modal-close-btn" id="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body" id="modal-body">
            <!-- Conteúdo dinâmico -->
          </div>
          <div class="modal-footer" id="modal-footer">
            <!-- Botões dinâmicos -->
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }
    globalModalOverlay = overlay;
  }
  return globalModalOverlay;
}

function closeModal() {
  const overlay = getModalElements();
  overlay.classList.remove('active');
}

/**
 * Abre um modal de confirmação personalizável
 */
function showConfirmModal({
  titulo = 'Confirmação',
  mensagem = 'Deseja continuar?',
  detalhes = null, // Array de { label, value } para exibir resumo estilizado
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  tipoConfirmar = 'primary', // 'primary' | 'danger' | 'accent'
  onConfirm = () => {}
}) {
  const overlay = getModalElements();
  const titleEl = overlay.querySelector('#modal-title');
  const bodyEl = overlay.querySelector('#modal-body');
  const footerEl = overlay.querySelector('#modal-footer');

  titleEl.innerHTML = titulo;

  let bodyHtml = `<p style="color: var(--text-main); font-size: 0.95rem;">${mensagem}</p>`;

  if (detalhes && Array.isArray(detalhes) && detalhes.length > 0) {
    bodyHtml += `<div class="confirm-details-list">`;
    detalhes.forEach(item => {
      bodyHtml += `
        <div class="confirm-details-row">
          <span class="confirm-details-label">${item.label}:</span>
          <span class="confirm-details-value">${item.value}</span>
        </div>
      `;
    });
    bodyHtml += `</div>`;
  }

  bodyEl.innerHTML = bodyHtml;

  footerEl.innerHTML = `
    <button class="btn btn-secondary" id="modal-btn-cancel">${textoCancelar}</button>
    <button class="btn btn-${tipoConfirmar}" id="modal-btn-confirm">${textoConfirmar}</button>
  `;

  overlay.querySelector('#modal-btn-cancel').onclick = closeModal;
  overlay.querySelector('#modal-btn-confirm').onclick = async () => {
    closeModal();
    try {
      await onConfirm();
    } catch (err) {
      console.error('Erro ao executar ação confirmada:', err);
    }
  };

  overlay.classList.add('active');
}

/**
 * Abre um modal com conteúdo HTML livre (ex: visualização de animal)
 */
function showCustomModal({ titulo, conteudoHtml, botoesHtml = '' }) {
  const overlay = getModalElements();
  const titleEl = overlay.querySelector('#modal-title');
  const bodyEl = overlay.querySelector('#modal-body');
  const footerEl = overlay.querySelector('#modal-footer');

  titleEl.innerHTML = titulo;
  bodyEl.innerHTML = conteudoHtml;

  if (botoesHtml) {
    footerEl.innerHTML = botoesHtml;
    footerEl.style.display = 'flex';
  } else {
    footerEl.innerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Fechar</button>`;
  }

  overlay.classList.add('active');
}

/**
 * ==========================================================
 * FORMATADORES E HELPERS
 * ==========================================================
 */

function formatarData(dataString) {
  if (!dataString) return '-';
  // Formato retornado pelo MySQL: YYYY-MM-DD
  const partes = dataString.split('T')[0].split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataString;
}

function formatarTelefone(telefone) {
  if (!telefone) return '-';
  const nums = telefone.replace(/\D/g, '');
  if (nums.length === 11) {
    return `(${nums.substring(0, 2)}) ${nums.substring(2, 7)}-${nums.substring(7)}`;
  }
  if (nums.length === 10) {
    return `(${nums.substring(0, 2)}) ${nums.substring(2, 6)}-${nums.substring(6)}`;
  }
  return telefone;
}

function obterBadgeStatus(status) {
  if (status === 'Disponível') {
    return `<span class="badge badge-disponivel">● Disponível</span>`;
  }
  return `<span class="badge badge-adotado">✓ Adotado</span>`;
}

function setupMobileNav() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
  }
}

// Inicializa o menu mobile ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
});
