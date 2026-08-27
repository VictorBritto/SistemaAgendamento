<template>
  <div class="navbar">
    <!-- Branding -->
    <div class="navbar-brand">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span class="brand-text">SA</span>
    </div>

    <button 
      class="nav-btn" 
      :class="{ active: abaAtiva === 'cadastro' }" 
      @click="mudarAba('cadastro')"
      title="Novo Agendamento"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
      <span class="nav-label">Novo Agendamento</span>
    </button>
    <button 
      class="nav-btn" 
      :class="{ active: abaAtiva === 'visualizacao' }" 
      @click="mudarAba('visualizacao')"
      title="Consultar Cronograma"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      <span class="nav-label">Consultar Cronograma</span>
    </button>
    <button 
      class="nav-btn" 
      :class="{ active: abaAtiva === 'calendario' }" 
      @click="mudarAba('calendario')"
      title="Calendário de Ocupação"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
      <span class="nav-label">Calendário</span>
    </button>
    <button 
      class="nav-btn" 
      :class="{ active: abaAtiva === 'relatorio' }" 
      @click="mudarAba('relatorio')"
      title="Relatório de Disponibilidade"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
      <span class="nav-label">Relatórios</span>
    </button>
    <button 
      class="nav-btn" 
      :class="{ active: abaAtiva === 'filaDelphi' }" 
      @click="mudarAba('filaDelphi')"
      title="Fila de Sincronização Delphi"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><polyline points="9 11 12 14 22 4"></polyline></svg>
      <span class="nav-label">Fila Delphi</span>
    </button>
    
    <div style="flex-grow: 1;"></div>
    
    <div class="user-profile-section" v-if="user">
      <div class="user-avatar">
        {{ user.email ? user.email.charAt(0).toUpperCase() : 'U' }}
      </div>
      <div class="user-info">
        <span class="user-email">{{ user.email }}</span>
        <span class="user-role">{{ isAdmin ? 'Administrador' : 'Usuário Padrão' }}</span>
      </div>
    </div>
    
    <button 
      class="nav-btn logout-btn" 
      @click="deslogar"
      title="Sair"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      <span class="nav-label">Sair</span>
    </button>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'
import { ref, onMounted } from 'vue'

defineProps({
  abaAtiva: String
})

const emit = defineEmits(['update:abaAtiva'])
const { user, logout, isAdmin } = useAuth()

const mudarAba = (aba) => {
  emit('update:abaAtiva', aba)
}

const deslogar = async () => {
  await logout()
  mudarAba('visualizacao')
}


</script>

<style scoped>
.user-profile-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin: 0 12px 12px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
}

.user-email {
  font-size: 13px;
  font-weight: 500;
  color: var(--sidebar-text-hover);
  text-overflow: ellipsis;
  overflow: hidden;
}

.user-role {
  font-size: 11px;
  color: var(--sidebar-text);
  margin-top: 2px;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.logout-btn {
  color: #ef4444;
  margin: 0 12px 12px 12px;
  width: calc(100% - 24px);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

@media (max-width: 768px) {
  .user-profile-section {
    padding: 12px;
    justify-content: center;
  }
  .user-info {
    display: none;
  }
}
</style>
