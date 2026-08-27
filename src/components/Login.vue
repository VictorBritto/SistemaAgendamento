<template>
  <div class="login-card card">
    <!-- Lock icon -->
    <div class="login-icon-wrapper">
      <div class="login-icon-circle">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
    </div>

    <h2 class="login-title">{{ isLogin ? 'Acessar Painel' : 'Criar Conta' }}</h2>
    <p class="login-subtitle">{{ isLogin ? 'Entre com suas credenciais para continuar' : 'Preencha os dados para se cadastrar' }}</p>
    
    <div v-if="authError" class="login-error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
      {{ authError }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="login-field">
        <label for="email">E-mail</label>
        <div class="login-input-wrapper">
          <svg class="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <input type="email" id="email" v-model="email" required placeholder="seu@email.com">
        </div>
      </div>
      
      <div class="login-field">
        <label for="password">Senha</label>
        <div class="login-input-wrapper">
          <svg class="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <input type="password" id="password" v-model="password" required placeholder="••••••••">
        </div>
      </div>

      <button type="submit" class="btn-submit login-btn" :disabled="loading">
        <span v-if="loading" class="login-spinner"></span>
        {{ loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar') }}
      </button>
    </form>

    <div class="login-toggle">
      <a href="#" @click.prevent="isLogin = !isLogin">
        {{ isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login' }}
      </a>
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
.login-card {
  max-width: 420px;
  margin: 0 auto;
  padding: 40px 36px 36px;
}

.login-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.login-icon-circle {
  width: 64px;
  height: 64px;
  background: var(--btn-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--btn-shadow);
  animation: loginPulse 3s ease-in-out infinite;
}

@keyframes loginPulse {
  0%, 100% { box-shadow: var(--btn-shadow), 0 0 0 0 rgba(99, 102, 241, 0.2); }
  50% { box-shadow: var(--btn-shadow), 0 0 0 12px rgba(99, 102, 241, 0); }
}

.login-title {
  text-align: center;
  margin-bottom: 6px;
  font-size: 24px;
}

.login-subtitle {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 28px 0;
}

.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
}
[data-theme="dark"] .login-error {
  background-color: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.25);
}

.login-field {
  margin-bottom: 20px;
}
.login-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-color);
  text-transform: none;
  letter-spacing: 0;
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
  transition: color 0.3s;
}
.login-input-wrapper input {
  padding-left: 44px;
}
.login-input-wrapper input:focus + .login-input-icon,
.login-input-wrapper:focus-within .login-input-icon {
  color: var(--primary-color);
}

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-top: 4px;
  margin-bottom: 0;
  gap: 8px;
}

.login-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-toggle {
  text-align: center;
  font-size: 14px;
  margin-top: 20px;
}
.login-toggle a {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}
.login-toggle a:hover {
  opacity: 0.8;
}
</style>

