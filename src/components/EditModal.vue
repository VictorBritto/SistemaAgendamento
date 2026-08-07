<template>
  <div class="modal-overlay" v-if="reserva">
    <div class="modal-content">
      <h3 style="margin-top: 0; color: var(--primary-color);">Editar Agendamento</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div class="input-group">
          <label>Laboratório / Recurso</label>
          <select v-model="form.recurso" required>
            <option value="">-- Selecione --</option>
            <option v-for="r in recursosLivres" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <div class="input-group">
          <label>Data</label>
          <input class="input-date" type="date" v-model="form.data" required>
        </div>
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

      <div v-if="lote.length > 1" class="batch-edit-section" :class="{ 'is-active': form.aplicarLote }">
        <label class="batch-edit-header">
          <input type="checkbox" v-model="form.aplicarLote" class="batch-checkbox">
          <div class="batch-header-texts">
            <span class="batch-title">Aplicar edição para múltiplas ocorrências deste lote?</span>
            <p class="batch-subtitle">Altera os dados e o horário para todas as reservas selecionadas abaixo.</p>
          </div>
        </label>
        
        <div v-if="form.aplicarLote" class="batch-items-container">
           <label 
             v-for="res in lote" 
             :key="res.id" 
             class="batch-item"
             :class="{ 'item-selected': form.selecionadosLote.includes(res.id) }"
           >
             <input type="checkbox" :value="res.id" v-model="form.selecionadosLote" class="item-checkbox">
             <div class="item-info">
               <span class="item-recurso">{{ formatarNomeRecurso(res.recurso) }}</span>
               <span class="item-data">{{ res.data.split('-').reverse().join('/') }} ({{ res.horaInicio }})</span>
             </div>
           </label>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button type="button" @click="$emit('fechar')" class="btn-cancel" style="width: auto; margin: 0; padding: 10px 16px;">Cancelar</button>
        <button type="button" @click="salvar" class="btn-submit" style="width: auto; margin: 0; padding: 10px 24px;">Salvar Alterações</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import Swal from 'sweetalert2'
import { useReservas } from '../composables/useReservas'

const props = defineProps({
  reserva: {
    type: Object,
    default: null
  },
  lote: {
    type: Array,
    default: () => []
  },
  recursosDisponiveis: {
    type: Array,
    default: () => []
  }
})

const { reservas } = useReservas()

const emit = defineEmits(['fechar', 'salvar'])

const form = reactive({
  recurso: '',
  data: '',
  disciplina: '',
  professor: '',
  curso: '',
  horaInicio: '',
  horaFim: '',
  observacao: '',
  aplicarLote: false,
  selecionadosLote: []
})

const formatarNomeRecurso = (nome) => {
  if (!nome) return ''
  return nome.replace(/\s*-\s*HEX:#[0-9A-Fa-f]{6}$/i, '').trim()
}

watch(() => [props.reserva, props.lote], ([newRes, newLote]) => {
  if (newRes) {
    form.recurso = newRes.recurso || ''
    form.data = newRes.data || ''
    form.disciplina = newRes.disciplina
    form.professor = newRes.professor
    form.curso = newRes.curso
    form.horaInicio = newRes.horaInicio
    form.horaFim = newRes.horaFim
    form.observacao = newRes.observacao || ''
    
    if (newLote && newLote.length > 1) {
      form.aplicarLote = true
      form.selecionadosLote = newLote.map(r => r.id)
    } else {
      form.aplicarLote = false
      form.selecionadosLote = []
    }
  }
}, { immediate: true })

const verificarConflitoHorario = (h1Inicio, h1Fim, h2Inicio, h2Fim) => {
  return (h1Inicio < h2Fim && h1Fim > h2Inicio)
}

const recursosLivres = computed(() => {
  if (!form.data || !form.horaInicio || !form.horaFim) return props.recursosDisponiveis
  
  return props.recursosDisponiveis.filter(recurso => {
    const conflito = reservas.value.find(r => 
      r.campus === props.reserva?.campus &&
      r.categoria === props.reserva?.categoria &&
      r.recurso === recurso &&
      r.dataIso === form.data &&
      r.id !== props.reserva?.id &&
      verificarConflitoHorario(form.horaInicio, form.horaFim, r.horaInicio, r.horaFim)
    )
    return !conflito
  })
})

const salvar = () => {
  if (!form.recurso || !form.data || !form.disciplina || !form.professor || !form.horaInicio || !form.horaFim) {
    Swal.fire('Atenção', 'Preencha todos os campos obrigatórios.', 'warning')
    return
  }
  if (form.horaInicio >= form.horaFim) {
    Swal.fire('Atenção', 'A hora de término deve ser posterior à hora de início.', 'warning')
    return
  }
  if (form.aplicarLote && form.selecionadosLote.length === 0) {
    Swal.fire('Atenção', 'Selecione ao menos uma ocorrência do lote para editar, ou desmarque a opção de edição em lote.', 'warning')
    return
  }
  
  const aplicarIds = form.aplicarLote ? form.selecionadosLote : []
  emit('salvar', { ...props.reserva, ...form, aplicarIds })
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
  max-height: 90vh;
  overflow-y: auto;
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
.input-date {
  height: 50px;
}

/* Batch Edit Styles */
.batch-edit-section {
  margin-top: 20px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}
.batch-edit-section.is-active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}
.batch-edit-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  margin: 0;
  background: rgba(99, 102, 241, 0.03); /* Subtle primary tint */
}
.batch-checkbox {
  margin: 2px 0 0 0 !important;
  width: 18px !important;
  height: 18px !important;
  cursor: pointer;
  accent-color: var(--primary-color);
}
.batch-header-texts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.batch-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: none;
}
.batch-subtitle {
  font-size: 11.5px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
  text-transform: none;
}
.batch-items-container {
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--card-bg);
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.batch-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  margin: 0;
  transition: all 0.2s ease;
}
.batch-item:hover {
  background: var(--card-bg);
  border-color: #cbd5e1;
}
.batch-item.item-selected {
  background: rgba(99, 102, 241, 0.05);
  border-color: var(--primary-color);
}
.item-checkbox {
  margin: 0 !important;
  width: 16px !important;
  height: 16px !important;
  cursor: pointer;
  accent-color: var(--primary-color);
  flex-shrink: 0;
}
.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-grow: 1;
}
.item-recurso {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  text-transform: none;
}
.item-data {
  font-size: 11.5px;
  color: var(--text-muted);
  text-transform: none;
}
</style>
