<template>
  <div class="modal-overlay" v-if="reserva">
    <div class="modal-content">
      <h3 style="margin-top: 0; color: var(--primary-color);">Editar Agendamento</h3>
      
      <div class="alert-info" style="padding: 10px; margin-bottom: 16px; font-size: 13px; text-align: left;">
        <strong>Laboratório:</strong> {{ reserva.recurso }} <br>
        <strong>Data:</strong> {{ reserva.data.split('-').reverse().join('/') }}
      </div>

      <div class="input-group">
        <label>Disciplina / Evento</label>
        <input type="text" v-model="form.disciplina" required>
      </div>

      <div class="input-group">
        <label>Professor</label>
        <input type="text" v-model="form.professor" required>
      </div>

      <div class="input-group">
        <label>Curso</label>
        <input type="text" v-model="form.curso" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div class="input-group">
          <label>Hora Início</label>
          <input type="time" v-model="form.horaInicio" required>
        </div>
        <div class="input-group">
          <label>Hora Fim</label>
          <input type="time" v-model="form.horaFim" required>
        </div>
      </div>

      <div class="input-group">
        <label>Observação (Opcional)</label>
        <textarea v-model="form.observacao" rows="2"></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button type="button" @click="$emit('fechar')" style="padding: 10px 16px; background: white; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; font-weight: 600;">Cancelar</button>
        <button type="button" @click="salvar" class="btn-submit" style="width: auto; margin: 0; padding: 10px 24px;">Salvar Alterações</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  reserva: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['fechar', 'salvar'])

const form = reactive({
  disciplina: '',
  professor: '',
  curso: '',
  horaInicio: '',
  horaFim: '',
  observacao: ''
})

watch(() => props.reserva, (newVal) => {
  if (newVal) {
    form.disciplina = newVal.disciplina
    form.professor = newVal.professor
    form.curso = newVal.curso
    form.horaInicio = newVal.horaInicio
    form.horaFim = newVal.horaFim
    form.observacao = newVal.observacao || ''
  }
}, { immediate: true })

const salvar = () => {
  if (!form.disciplina || !form.professor || !form.horaInicio || !form.horaFim) {
    alert("Preencha todos os campos obrigatórios.")
    return
  }
  emit('salvar', { ...props.reserva, ...form })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.input-group {
  margin-bottom: 12px;
}
.input-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}
.input-group input, .input-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: inherit;
  box-sizing: border-box;
}
</style>
