<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReservas } from '../composables/useReservas'
import { useAuth } from '../composables/useAuth'

const { reservas, carregarReservas, atualizarSincronizacaoDelphi } = useReservas()
const { isAdmin } = useAuth()

const isLoading = ref(true)
const mostrarApenasPendentes = ref(true)
const termoBusca = ref('')

onMounted(async () => {
  isLoading.value = true
  await carregarReservas()
  isLoading.value = false
})

const reservasFiltradas = computed(() => {
  let resultado = reservas.value

  // Filtrar apenas pendentes de sincronização
  if (mostrarApenasPendentes.value) {
    resultado = resultado.filter(r => !(r.observacao && r.observacao.includes('[DELPHI_SYNC]')))
  }

  // Filtrar por texto (professor, disciplina, recurso)
  if (termoBusca.value.trim() !== '') {
    const termo = termoBusca.value.toLowerCase()
    resultado = resultado.filter(r => 
      (r.professor && r.professor.toLowerCase().includes(termo)) ||
      (r.disciplina && r.disciplina.toLowerCase().includes(termo)) ||
      (r.recurso && r.recurso.toLowerCase().includes(termo))
    )
  }

  // Ordenar por data (decrescente ou crescente, escolhi crescente)
  return resultado.sort((a, b) => {
    if (a.dataIso === b.dataIso) {
      return a.horaInicio.localeCompare(b.horaInicio)
    }
    return a.dataIso.localeCompare(b.dataIso)
  })
})

const formatarDataBr = (dataIso) => {
  if (!dataIso) return ''
  return dataIso.split('-').reverse().join('/')
}

const formatarObservacao = (obs) => {
  if (!obs) return '-'
  return obs.replace(/\[DELPHI_SYNC\]/g, '').trim() || '-'
}

const isSynced = (obs) => {
  if (!obs) return false
  return obs.includes('[DELPHI_SYNC]')
}

const toggleSync = async (id, currentSyncState) => {
  await atualizarSincronizacaoDelphi(id, !currentSyncState)
}

const isMarkingAll = ref(false)
const marcarTodosComoLancados = async () => {
  if (reservasFiltradas.value.length === 0) return
  isMarkingAll.value = true
  try {
    // Pegar todos que ainda não estão lançados
    const pendentes = reservasFiltradas.value.filter(r => !isSynced(r.observacao))
    for (const reserva of pendentes) {
      await atualizarSincronizacaoDelphi(reserva.id, true)
    }
  } finally {
    isMarkingAll.value = false
  }
}
</script>

<template>
  <div class="fila-delphi-container">
    <div class="header-section">
      <div>
        <h2 style="margin: 0; font-size: 24px; color: var(--text-color); font-weight: 600;">Fila de Sincronização Delphi</h2>
        <p style="margin: 4px 0 0 0; color: var(--text-muted); font-size: 14px;">Gerencie quais agendamentos já foram repassados para o sistema legado.</p>
      </div>
      <button 
        v-if="reservasFiltradas.some(r => !isSynced(r.observacao))"
        @click="marcarTodosComoLancados" 
        class="sync-btn pending" 
        style="width: auto; padding: 10px 20px;"
        :disabled="isMarkingAll"
      >
        <svg v-if="!isMarkingAll" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        {{ isMarkingAll ? 'Marcando...' : 'Marcar Todos como Lançados' }}
      </button>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" v-model="termoBusca" placeholder="Buscar por professor, disciplina ou recurso...">
      </div>
      
      <label class="toggle-container">
        <input type="checkbox" v-model="mostrarApenasPendentes">
        <span class="toggle-slider"></span>
        <span style="font-size: 14px; font-weight: 500; color: var(--text-color);">Ocultar Lançados</span>
      </label>
    </div>

    <div v-if="isLoading" class="loading-state">
      Carregando fila...
    </div>

    <div v-else-if="reservasFiltradas.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <h3>Tudo Limpo!</h3>
      <p>Nenhum agendamento pendente de sincronização encontrado.</p>
    </div>

    <div v-else class="grid-list">
      <div v-for="reserva in reservasFiltradas" :key="reserva.id" class="reserva-card" :class="{ 'is-synced': isSynced(reserva.observacao) }">
        <div class="reserva-header">
          <div class="reserva-date">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {{ formatarDataBr(reserva.dataIso) }}
          </div>
          <div class="reserva-time">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            {{ reserva.horaInicio }} - {{ reserva.horaFim }}
          </div>
        </div>

        <div class="reserva-body">
          <div class="info-group">
            <span class="info-label">Professor</span>
            <span class="info-value">{{ reserva.professor || '-' }}</span>
          </div>
          <div class="info-group">
            <span class="info-label">Disciplina</span>
            <span class="info-value">{{ reserva.disciplina || '-' }}</span>
          </div>
          <div class="info-group">
            <span class="info-label">Recurso</span>
            <span class="info-value" style="font-weight: 600; color: var(--primary-color);">{{ reserva.recurso || '-' }}</span>
          </div>
          <div class="info-group" style="grid-column: 1 / -1;">
            <span class="info-label">Observação</span>
            <span class="info-value obs-text">{{ formatarObservacao(reserva.observacao) }}</span>
          </div>
        </div>

        <div class="reserva-footer">
          <button 
            class="sync-btn" 
            :class="isSynced(reserva.observacao) ? 'synced' : 'pending'"
            @click="toggleSync(reserva.id, isSynced(reserva.observacao))"
          >
            <svg v-if="isSynced(reserva.observacao)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><polyline points="9 11 12 14 22 4"></polyline></svg>
            {{ isSynced(reserva.observacao) ? 'Lançado no Delphi' : 'Marcar Lançado' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fila-delphi-container {
  padding: 24px;
  background: transparent;
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  background: var(--card-bg);
  padding: 16px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  border-radius: 8px;
  flex-grow: 1;
  max-width: 400px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-family: inherit;
  color: var(--text-color);
}

.search-box svg {
  color: #94a3b8;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-container input {
  display: none;
}

.toggle-slider {
  width: 36px;
  height: 20px;
  background-color: #cbd5e1;
  border-radius: 20px;
  position: relative;
  transition: .3s;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: .3s;
}

.toggle-container input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle-container input:checked + .toggle-slider::before {
  transform: translateX(16px);
}

.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.reserva-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.reserva-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--card-border-hover);
}

.reserva-card.is-synced {
  opacity: 0.6;
}

.reserva-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--table-header-bg);
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
  font-weight: 600;
  color: var(--table-header-text);
}

.reserva-date, .reserva-time {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reserva-body {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex-grow: 1;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: var(--text-color);
}

.obs-text {
  font-size: 13px;
  color: var(--text-muted);
  background: var(--input-bg);
  padding: 8px;
  border-radius: 6px;
  border: 1px dashed var(--border-color);
}

.reserva-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: transparent;
}

.sync-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.sync-btn.pending {
  background: var(--primary-soft);
  color: var(--primary-color);
}

.sync-btn.pending:hover {
  background: var(--primary-color);
  color: white;
}

.sync-btn.synced {
  background: var(--pill-bg);
  color: var(--primary-color);
  border-color: transparent;
}

.sync-btn.synced:hover {
  background: var(--alert-bg);
  color: var(--alert-text);
  border-color: var(--alert-border);
}
.sync-btn.synced:hover::after {
  content: 'Desfazer';
  position: absolute;
  background: var(--alert-bg);
  color: var(--alert-text);
  width: calc(100% - 32px);
  padding: 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  color: #94a3b8;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: #475569;
}

.loading-state {
  text-align: center;
  padding: 48px;
  color: #64748b;
  font-weight: 500;
}
</style>
