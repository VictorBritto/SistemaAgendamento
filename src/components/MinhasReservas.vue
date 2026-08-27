<template>
  <div class="minhas-reservas-container">
    <div class="header-section">
      <div>
        <h2 style="margin: 0; font-size: 24px; color: var(--text-color); font-weight: 600;">Minhas Reservas</h2>
        <p style="margin: 4px 0 0 0; color: var(--text-muted); font-size: 14px;">Gerencie os agendamentos que você solicitou.</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando suas reservas...</p>
    </div>

    <div v-else-if="minhasReservas.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <h3>Nenhuma reserva encontrada</h3>
      <p>Você ainda não realizou nenhum agendamento de sala ou laboratório.</p>
    </div>

    <div v-else class="grid-list">
      <div v-for="reserva in minhasReservas" :key="reserva.id" class="reserva-card" :class="reserva.status">
        <div class="reserva-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 16px;">
            <div class="reserva-date" style="display: flex; align-items: center; gap: 6px; font-weight: 600; color: var(--text-color);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {{ formatarDataBr(reserva.dataIso || reserva.data) }}
            </div>
            <div class="reserva-time" style="display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              {{ reserva.horaInicio }} - {{ reserva.horaFim }}
            </div>
          </div>
          <span v-if="reserva.status === 'pendente'" class="badge-status" style="background-color: #f59e0b; color: #ffffff; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">Aguardando Aprovação</span>
          <span v-else class="badge-status" style="background-color: #10b981; color: #ffffff; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">Aprovado</span>
        </div>
        
        <div class="reserva-body" style="padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="info-group" style="display: flex; flex-direction: column; gap: 4px;">
            <span class="info-label" style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Disciplina</span>
            <span class="info-value" style="font-size: 14px; color: var(--text-color);">{{ reserva.disciplina || '-' }}</span>
          </div>
          
          <div class="info-group" style="display: flex; flex-direction: column; gap: 4px;">
            <span class="info-label" style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Recurso</span>
            <span class="info-value" style="font-size: 14px; font-weight: 600; color: var(--primary-color);">{{ reserva.recurso || '-' }}</span>
          </div>
          
          <div class="info-group" style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 4px;" v-if="reserva.observacao && reserva.observacao.replace(/\[DELPHI_SYNC\]/g, '').trim()">
            <span class="info-label" style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Observação</span>
            <span class="info-value obs-text" style="font-size: 13px; color: var(--text-color); background: #f8fafc; padding: 8px; border-radius: 4px; border: 1px solid #e2e8f0;">{{ reserva.observacao.replace(/\[DELPHI_SYNC\]/g, '').trim() }}</span>
          </div>
        </div>
        
        <div class="reserva-footer" style="padding: 16px; background-color: var(--card-bg); border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
          <button @click="cancelar(reserva.id)" class="btn-cancel" style="background: white; border: 1px solid #ef4444; color: #ef4444; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s;">
            Cancelar Reserva
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReservas } from '../composables/useReservas'
import { useAuth } from '../composables/useAuth'
import Swal from 'sweetalert2'

const { reservas, carregarReservas, deletarReserva } = useReservas()
const { user } = useAuth()

const isLoading = ref(true)

onMounted(async () => {
  isLoading.value = true
  if (reservas.value.length === 0) {
    await carregarReservas()
  }
  isLoading.value = false
})

const minhasReservas = computed(() => {
  if (!user.value) return []
  return reservas.value
    .filter(r => r.user_id === user.value.id)
    .sort((a, b) => {
      const dateA = a.dataIso || a.data
      const dateB = b.dataIso || b.data
      if (dateA === dateB) {
        return b.horaInicio.localeCompare(a.horaInicio)
      }
      return dateB.localeCompare(dateA)
    })
})

const formatarDataBr = (dataIso) => {
  if (!dataIso) return ''
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

const cancelar = async (id) => {
  const result = await Swal.fire({
    title: 'Cancelar Reserva?',
    text: "Esta ação removerá a reserva do sistema.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sim, cancelar',
    cancelButtonText: 'Manter reserva'
  })

  if (result.isConfirmed) {
    try {
      await deletarReserva(id)
      Swal.fire('Cancelada!', 'Sua reserva foi cancelada com sucesso.', 'success')
    } catch (e) {
      Swal.fire('Erro!', 'Não foi possível cancelar a reserva.', 'error')
    }
  }
}
</script>

<style scoped>
.minhas-reservas-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.reserva-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.reserva-card.pendente {
  border-left: 4px solid #f59e0b;
}
.reserva-card.aprovado {
  border-left: 4px solid #10b981;
}

.reserva-header {
  padding: 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid var(--border-color);
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}

.empty-state h3 {
  margin: 16px 0 8px;
  color: var(--text-color);
}

.empty-state p {
  margin: 0;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-cancel:hover {
  background-color: #fef2f2 !important;
}
</style>
