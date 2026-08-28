<template>
  <div class="login-screen">
    <!-- Left decorative panel -->
    <div class="login-left">
      <div class="login-left-content">
        <div class="brand-logo">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Sistema de Agendamentos</span>
        </div>

        <div class="hero-text">
          <h1>Gerencie seus espaços com <span class="highlight">inteligência</span></h1>
          <p>Plataforma unificada de agendamento de salas, laboratórios e recursos audiovisuais.</p>
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span>Agendamento rápido e sem conflitos</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span>Notificações automáticas por e-mail</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span>Relatórios e calendário de ocupação</span>
          </div>
        </div>

        <!-- Decorative blobs -->
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>
    </div>

    <!-- Right login panel -->
    <div class="login-right">
      <div class="login-card-wrapper">
        <div class="login-card">
          <!-- Icon -->
          <div class="login-icon-wrapper">
            <div class="login-icon-circle">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </div>

          <h2 class="login-title">Bem-vindo de volta</h2>
          <p class="login-subtitle">Entre com suas credenciais institucionais</p>

          <!-- Error -->
          <div v-if="authError" class="login-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            {{ authError }}
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit">
            <div class="login-field">
              <label for="email">E-mail</label>
              <div class="login-input-wrapper">
                <svg class="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input type="email" id="email" v-model="email" required placeholder="seu@fho.edu.br">
              </div>
            </div>

            <div class="login-field">
              <label for="password">Senha</label>
              <div class="login-input-wrapper">
                <svg class="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input type="password" id="password" v-model="password" required placeholder="••••••••">
              </div>
            </div>

            <button type="submit" class="login-btn" :disabled="loading">
              <span v-if="loading" class="login-spinner"></span>
              <span>{{ loading ? 'Autenticando...' : 'Entrar no sistema' }}</span>
              <svg v-if="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </form>

          <p class="login-footer">
            Acesso restrito a colaboradores
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import Swal from 'sweetalert2'

const { login, register, authError } = useAuth()

const emit = defineEmits(['logged-in'])

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  let response;
  
  if (isLogin.value) {
    response = await login(email.value, password.value)
  } else {
    response = await register(email.value, password.value)
    if (!response.error) {
      Swal.fire('Sucesso!', 'Conta criada com sucesso! Você já pode entrar.', 'success')
      isLogin.value = true
      password.value = ''
    }
  }

  if (!response.error && isLogin.value) {
    emit('logged-in')
  }
  
  loading.value = false
}
</script>

<style scoped>
/* =============================================
   TELA COMPLETA
   ============================================= */
.login-screen {
  display: flex;
  min-height: 100vh;
  width: 100vw;
}

/* =============================================
   PAINEL ESQUERDO (decorativo)
   ============================================= */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%);
  position: relative;
  overflow: hidden;
  display: none;
}

@media (min-width: 900px) {
  .login-left {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.login-left-content {
  position: relative;
  z-index: 2;
  padding: 60px;
  max-width: 520px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255,255,255,0.9);
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 64px;
  letter-spacing: -0.02em;
}

.hero-text h1 {
  font-size: 42px;
  font-weight: 800;
  color: white;
  line-height: 1.15;
  letter-spacing: -0.04em;
  margin: 0 0 18px 0;
}

.hero-text h1 .highlight {
  background: linear-gradient(90deg, #a5b4fc, #c4b5fd, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-text p {
  font-size: 16px;
  color: rgba(255,255,255,0.65);
  line-height: 1.7;
  margin: 0 0 40px 0;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255,255,255,0.85);
  font-size: 15px;
}

.feature-icon {
  width: 34px;
  height: 34px;
  background: rgba(255,255,255,0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}

/* Blobs decorativos */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  pointer-events: none;
  animation: blobFloat 8s ease-in-out infinite alternate;
}
.blob-1 {
  width: 400px;
  height: 400px;
  background: #818cf8;
  top: -100px;
  right: -100px;
}
.blob-2 {
  width: 300px;
  height: 300px;
  background: #c084fc;
  bottom: -80px;
  left: -50px;
  animation-delay: -4s;
}

@keyframes blobFloat {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(30px, 20px) scale(1.08); }
}

/* =============================================
   PAINEL DIREITO (formulário)
   ============================================= */
.login-right {
  width: 100%;
  background-color: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
}

@media (min-width: 900px) {
  .login-right {
    width: 480px;
    flex-shrink: 0;
  }
}

/* Fundo animado sutil no painel direito */
.login-right::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 70% 20%, rgba(99,102,241,0.07) 0%, transparent 65%),
              radial-gradient(ellipse at 30% 80%, rgba(139,92,246,0.06) 0%, transparent 60%);
  pointer-events: none;
}

.login-card-wrapper {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 44px 40px 36px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
  backdrop-filter: blur(12px);
}

/* =============================================
   CARD INTERIOR
   ============================================= */
.login-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
}

.login-icon-circle {
  width: 62px;
  height: 62px;
  background: var(--btn-gradient);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(99,102,241,0.35);
  animation: iconPulse 3s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { box-shadow: 0 8px 24px rgba(99,102,241,0.35), 0 0 0 0 rgba(99,102,241,0.2); }
  50%       { box-shadow: 0 8px 24px rgba(99,102,241,0.35), 0 0 0 10px rgba(99,102,241,0); }
}

.login-title {
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0 0 6px;
  color: var(--text-color);
}

.login-subtitle {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 32px;
  line-height: 1.5;
}

/* Error */
.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(239,68,68,0.08);
  color: #dc2626;
  border: 1px solid rgba(239,68,68,0.2);
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 500;
  margin-bottom: 20px;
}
[data-theme="dark"] .login-error {
  background-color: rgba(239,68,68,0.12);
  color: #fca5a5;
  border-color: rgba(239,68,68,0.25);
}

/* Fields */
.login-field {
  margin-bottom: 18px;
}
.login-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-color);
}
.login-input-wrapper {
  position: relative;
}
.login-input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  transition: color 0.25s;
}
.login-input-wrapper:focus-within .login-input-icon {
  color: var(--primary-color);
}
.login-input-wrapper input {
  padding-left: 44px !important;
  border-radius: 12px;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.login-input-wrapper input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  outline: none;
}

/* Button */
.login-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 20px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 8px;
  background: var(--btn-gradient);
  color: white;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  letter-spacing: -0.01em;
}
.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99,102,241,0.45);
}
.login-btn:active:not(:disabled) {
  transform: translateY(0);
}
.login-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.login-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  text-align: center;
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 20px 0 0;
  opacity: 0.75;
}
</style>
