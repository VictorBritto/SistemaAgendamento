<script setup>
import { onMounted } from 'vue'

const emit = defineEmits(['complete'])

onMounted(() => {
  setTimeout(() => {
    emit('complete')
  }, 2800)
})
</script>

<template>
  <div class="splash-container">
    <div class="splash-content">
      <div class="logo-circle">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <path d="M8 14h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 14h.01"></path>
          <path d="M8 18h.01"></path>
          <path d="M12 18h.01"></path>
          <path d="M16 18h.01"></path>
        </svg>
      </div>
      <h1 class="splash-title">Sistema de Agendamento</h1>
      <p class="splash-subtitle">Organização e Eficiência</p>
      
      <div class="loading-bar-container">
        <div class="loading-bar"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-gradient);
  z-index: 9999;
  animation: fadeOut 0.5s ease-in-out 2.5s forwards;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.logo-circle {
  width: 96px;
  height: 96px;
  background: var(--btn-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 24px;
  box-shadow: var(--btn-shadow);
  animation: pulse 2s infinite;
}

.splash-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-color);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  text-align: center;
}

.splash-subtitle {
  font-size: 16px;
  color: var(--text-muted);
  margin: 0 0 40px 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 600;
}

.loading-bar-container {
  width: 240px;
  height: 6px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.loading-bar {
  height: 100%;
  width: 0%;
  background: var(--primary-color);
  border-radius: 4px;
  animation: loading 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}

@keyframes loading {
  0% { width: 0%; }
  100% { width: 100%; }
}

@keyframes fadeOut {
  0% { opacity: 1; visibility: visible; }
  100% { opacity: 0; visibility: hidden; }
}

[data-theme="dark"] .logo-circle {
  box-shadow: 0 8px 20px -4px rgba(168, 85, 247, 0.4);
}
[data-theme="dark"] .splash-title {
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
