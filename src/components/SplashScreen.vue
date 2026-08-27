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
    <!-- Floating particles -->
    <div class="splash-particle splash-particle-1"></div>
    <div class="splash-particle splash-particle-2"></div>
    <div class="splash-particle splash-particle-3"></div>
    <div class="splash-particle splash-particle-4"></div>

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
  background-color: var(--bg-color);
  z-index: 9999;
  animation: fadeOut 0.5s ease-in-out 2.5s forwards;
  overflow: hidden;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  position: relative;
  z-index: 1;
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
  animation: logoGlow 2.5s ease-in-out infinite;
  position: relative;
}

.logo-circle::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: var(--btn-gradient);
  opacity: 0.15;
  filter: blur(16px);
  animation: logoGlow 2.5s ease-in-out infinite reverse;
}

.splash-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-color);
  margin: 0 0 8px 0;
  letter-spacing: -0.03em;
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
  background: linear-gradient(90deg, var(--primary-color), #a855f7, var(--primary-color));
  background-size: 200% 100%;
  border-radius: 4px;
  animation: loading 2s cubic-bezier(0.4, 0, 0.2, 1) forwards, shimmer 1.5s ease-in-out infinite;
}

/* Floating particles */
.splash-particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.3;
}

.splash-particle-1 {
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  top: 20%;
  left: 15%;
  animation: particleFloat 4s ease-in-out infinite;
}

.splash-particle-2 {
  width: 6px;
  height: 6px;
  background: #a855f7;
  top: 70%;
  right: 20%;
  animation: particleFloat 5s ease-in-out infinite reverse;
}

.splash-particle-3 {
  width: 10px;
  height: 10px;
  background: var(--primary-color);
  bottom: 25%;
  left: 25%;
  animation: particleFloat 6s ease-in-out infinite;
  animation-delay: -2s;
}

.splash-particle-4 {
  width: 5px;
  height: 5px;
  background: #a855f7;
  top: 35%;
  right: 30%;
  animation: particleFloat 4.5s ease-in-out infinite;
  animation-delay: -1s;
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes logoGlow {
  0%, 100% { 
    box-shadow: var(--btn-shadow), 0 0 0 0 rgba(99, 102, 241, 0.25);
  }
  50% { 
    box-shadow: var(--btn-shadow), 0 0 0 20px rgba(99, 102, 241, 0), 0 0 40px 8px rgba(99, 102, 241, 0.1);
  }
}

@keyframes loading {
  0% { width: 0%; }
  100% { width: 100%; }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes particleFloat {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
  25% { transform: translate(20px, -30px) scale(1.2); opacity: 0.5; }
  50% { transform: translate(-15px, -50px) scale(0.8); opacity: 0.2; }
  75% { transform: translate(10px, -20px) scale(1.1); opacity: 0.4; }
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
