<template>
  <div class="navbar">
    <button 
      class="nav-btn" 
      :class="{ active: abaAtiva === 'cadastro' }" 
      @click="mudarAba('cadastro')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: text-bottom;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
      Novo Agendamento
    </button>
    <button 
      class="nav-btn" 
      :class="{ active: abaAtiva === 'visualizacao' }" 
      @click="mudarAba('visualizacao')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: text-bottom;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      Consultar Cronograma
    </button>
    
    <!-- Divisor visual -->
    <div style="width: 1px; background: var(--border-color); margin: 0 8px;"></div>

    <button 
      class="nav-btn" 
      @click="deslogar"
      style="color: #dc2626;"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: text-bottom;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      Sair
    </button>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'

defineProps({
  abaAtiva: String
})

const emit = defineEmits(['update:abaAtiva'])
const { user, logout } = useAuth()

const mudarAba = (aba) => {
  emit('update:abaAtiva', aba)
}

const deslogar = async () => {
  await logout()
  mudarAba('visualizacao')
}
</script>
