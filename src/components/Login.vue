<template>
  <div class="card" style="max-width: 400px; margin: 60px auto; padding: 32px;">
    <h2 style="text-align: center; color: var(--primary-color); margin-bottom: 24px;">{{ isLogin ? 'Acessar Painel' : 'Criar Conta' }}</h2>
    
    <div v-if="authError" class="alert-info" style="background-color: #fee2e2; color: #b91c1c; border-color: #fca5a5; padding: 12px; margin-bottom: 20px;">
      {{ authError }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div style="margin-bottom: 16px;">
        <label for="email" style="display: block; margin-bottom: 8px; font-weight: 600;">E-mail</label>
        <input type="email" id="email" v-model="email" required style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); box-sizing: border-box;" placeholder="seu@email.com">
      </div>
      
      <div style="margin-bottom: 24px;">
        <label for="password" style="display: block; margin-bottom: 8px; font-weight: 600;">Senha</label>
        <input type="password" id="password" v-model="password" required style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); box-sizing: border-box;" placeholder="••••••••">
      </div>

      <button type="submit" class="btn-submit" :disabled="loading" style="width: 100%; padding: 14px; font-size: 16px; margin-bottom: 16px;">
        {{ loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar') }}
      </button>
    </form>

    <div style="text-align: center; font-size: 14px;">
      <a href="#" @click.prevent="isLogin = !isLogin" style="color: var(--primary-color); font-weight: 600; text-decoration: none;">
        {{ isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login' }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

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
      alert("Conta criada com sucesso! Você já pode entrar.")
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
