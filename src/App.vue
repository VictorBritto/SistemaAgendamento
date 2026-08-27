<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import Navbar from './components/Navbar.vue'
import AgendamentoForm from './components/AgendamentoForm.vue'
import VisualizacaoGrid from './components/VisualizacaoGrid.vue'
import CalendarioMensal from './components/CalendarioMensal.vue'
import RelatorioDisponibilidade from './components/RelatorioDisponibilidade.vue'
import FilaDelphi from './components/FilaDelphi.vue'
import Login from './components/Login.vue'
import SplashScreen from './components/SplashScreen.vue'

const { user } = useAuth()
const abaAtiva = ref('cadastro')
const showSplash = ref(true)

// Garantir que não caia em uma aba inválida ao logar
watch(user, (newVal) => {
  if (newVal && abaAtiva.value === 'login') {
    abaAtiva.value = 'cadastro'
  }
})


</script>

<template>
  <div class="app-root">
    <!-- Tela de Apresentação (Splash Screen) -->
    <SplashScreen v-if="showSplash" @complete="showSplash = false" />
    
    <div v-else>
      <!-- Aplicativo restrito -->
    <template v-if="user">
      <div class="app-layout">
        <Navbar v-model:abaAtiva="abaAtiva" />
        
        <main class="main-panel">
          <div class="main-panel-content">
            <div v-show="abaAtiva === 'cadastro'" class="page-panel active">
              <AgendamentoForm />
            </div>

            <div v-show="abaAtiva === 'visualizacao'" class="page-panel active">
              <VisualizacaoGrid />
            </div>

            <div v-show="abaAtiva === 'calendario'" class="page-panel active">
              <CalendarioMensal />
            </div>

            <div v-show="abaAtiva === 'relatorio'" class="page-panel active">
              <RelatorioDisponibilidade />
            </div>

            <div v-show="abaAtiva === 'filaDelphi'" class="page-panel active">
              <FilaDelphi />
            </div>
          </div>
        </main>
      </div>
    </template>

    <!-- Tela de Login Independente -->
    <template v-else>
      <div class="login-page">

        <div class="login-wrapper">
          <h1 class="login-page-title">Sistema de Agendamento</h1>
          <p class="login-page-subtitle">Faça login para gerenciar os recursos.</p>
          <Login />
        </div>
      </div>
    </template>
    </div>
  </div>
</template>

<style>
/* Global App Root */
.app-root {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-color); /* Dark background */
}

.main-panel {
  flex: 1;
  background-color: var(--panel-bg);
  border-radius: 32px 0 0 32px;
  overflow-y: auto;
  box-shadow: -10px 0 30px rgba(0,0,0,0.3);
  margin-top: 16px;
  position: relative;
  /* if we want it completely full height on the right: */
}

.main-panel-content {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}/* Login Page Wrapper */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-wrapper {
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 1;
  padding: 0 20px;
}

.login-page-title {
  text-align: center;
  color: var(--primary-color);
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.login-page-subtitle {
  text-align: center;
  color: var(--text-muted);
  margin: 0 0 24px 0;
  font-size: 15px;
}
</style>
