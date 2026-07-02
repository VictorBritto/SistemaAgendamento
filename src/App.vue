<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import Navbar from './components/Navbar.vue'
import AgendamentoForm from './components/AgendamentoForm.vue'
import VisualizacaoGrid from './components/VisualizacaoGrid.vue'
import Login from './components/Login.vue'

const { user } = useAuth()
const abaAtiva = ref('cadastro')

// Garantir que não caia em uma aba inválida ao logar
watch(user, (newVal) => {
  if (newVal && abaAtiva.value === 'login') {
    abaAtiva.value = 'cadastro'
  }
})

// Inicializar o tema preferido do usuário (padrão: claro)
onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme')
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark')
  } else {
    document.body.removeAttribute('data-theme')
  }
})
</script>

<template>
  <div>
    <!-- Aplicativo restrito -->
    <template v-if="user">
      <Navbar v-model:abaAtiva="abaAtiva" />
      
      <div class="container">
        <div v-show="abaAtiva === 'cadastro'" class="page-panel active">
          <AgendamentoForm />
        </div>

        <div v-show="abaAtiva === 'visualizacao'" class="page-panel active">
          <VisualizacaoGrid />
        </div>
      </div>
    </template>

    <!-- Tela de Login Independente -->
    <template v-else>
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: var(--bg-color);">
        <div style="width: 100%; max-width: 450px;">
          <h1 style="text-align: center; color: var(--primary-color); margin-bottom: 8px;">Sistema de Agendamento</h1>
          <p style="text-align: center; color: var(--text-muted); margin-bottom: 24px;">Faça login para gerenciar os recursos.</p>
          <Login />
        </div>
      </div>
    </template>
  </div>
</template>

<style>
/* Os estilos globais foram migrados para assets/main.css */
</style>
