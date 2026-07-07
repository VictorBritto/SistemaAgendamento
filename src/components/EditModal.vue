<template>
  <div class="modal-overlay" v-if="reserva">
    <div class="modal-content">
      <h3 style="margin-top: 0; color: var(--primary-color);">Editar Agendamento</h3>
      
      <div class="alert-info" style="padding: 12px; margin-bottom: 16px; font-size: 13px; text-align: left; background: var(--pill-bg); border: 1px solid var(--border-color); border-radius: 8px;">
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

      <div v-if="tamanhoLote > 1" style="margin-top: 16px; padding: 12px; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: bold; cursor: pointer; margin: 0; color: var(--primary-color);">
          <input type="checkbox" v-model="form.aplicarLote" style="width: auto; margin: 0; transform: scale(1.1);">
          Aplicar edição para todas as {{ tamanhoLote }} ocorrências (dias/salas) deste lote?
        </label>
        <p style="margin: 4px 0 0 20px; font-size: 11px; color: var(--text-muted);">
          Altera os dados e o horário para todas as reservas no histórico que possuem exatamente a mesma disciplina, professor e horário originais desta sala.
        </p>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button type="button" @click="$emit('fechar')" class="btn-cancel" style="width: auto; margin: 0; padding: 10px 16px;">Cancelar</button>
        <button type="button" @click="salvar" class="btn-submit" style="width: auto; margin: 0; padding: 10px 24px;">Salvar Alterações</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps({
  reserva: {
    type: Object,
    default: null
  },
  tamanhoLote: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['fechar', 'salvar'])

const form = reactive({
  disciplina: '',
  professor: '',
  curso: '',
  horaInicio: '',
  horaFim: '',
  observacao: '',
  aplicarLote: false
})

watch(() => props.reserva, (newVal) => {
  if (newVal) {
    form.disciplina = newVal.disciplina
    form.professor = newVal.professor
    form.curso = newVal.curso
    form.horaInicio = newVal.horaInicio
    form.horaFim = newVal.horaFim
    form.observacao = newVal.observacao || ''
    form.aplicarLote = props.tamanhoLote > 1
  }
}, { immediate: true })

const salvar = () => {
  if (!form.disciplina || !form.professor || !form.horaInicio || !form.horaFim) {
    Swal.fire('Atenção', 'Preencha todos os campos obrigatórios.', 'warning')
    return
  }
  if (form.horaInicio >= form.horaFim) {
    Swal.fire('Atenção', 'A hora de término deve ser posterior à hora de início.', 'warning')
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
  background: var(--card-bg);
  color: var(--text-color);
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
  background: var(--input-bg);
  color: var(--text-color);
}
</style>
