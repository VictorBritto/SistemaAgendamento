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
    
    <div style="flex-grow: 1;"></div>
    
    <button class="theme-toggle-btn" @click="toggleTheme" :title="isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'">
      <svg v-if="!isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
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
import { ref, onMounted } from 'vue'

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

const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.body.setAttribute('data-theme', 'dark')
    localStorage.setItem('app-theme', 'dark')
  } else {
    document.body.removeAttribute('data-theme')
    localStorage.setItem('app-theme', 'light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme')
  if (savedTheme === 'light') {
    isDark.value = false
    document.body.removeAttribute('data-theme')
  } else {
    // Default to dark since we just overhauled it
    isDark.value = true
    document.body.setAttribute('data-theme', 'dark')
  }
})
</script>
