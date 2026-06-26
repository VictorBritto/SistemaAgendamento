<template>
  <div class="agendamento-container">
    <div class="platform-header">
      <h2>Painel de Agendamento</h2>
      <p class="text-muted">Configure os parâmetros abaixo para reservar um ambiente no sistema.</p>
    </div>
    
    <form @submit.prevent="processarAgendamento" class="form-layout">
      <!-- Coluna Principal -->
      <div class="form-main">
        
        <!-- Localização -->
        <div class="card section-card">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <h3>Localização e Recurso</h3>
          </div>
          <div class="input-grid">
            <div>
              <label for="campus">Campus Local</label>
              <select id="campus" v-model="form.campus" required @change="renderizarCamposRecursoDinamico">
                <option value="">-- Selecione o Campus --</option>
                <option value="Araras">Araras</option>
                <option value="SBO">Santa Bárbara d'Oeste (SBO)</option>
              </select>
            </div>
            <div>
              <label for="tipoRecurso">Categoria do Espaço</label>
              <select id="tipoRecurso" v-model="form.categoria" required @change="renderizarCamposRecursoDinamico">
                <option value="">-- Selecione o Tipo --</option>
                <option value="metodologias">Laboratórios de Metodologia</option>
                <option value="informatica">Laboratórios de Informática</option>
                <option value="salas">Salas de Aula Comuns</option>
                <option value="videoconf">Videoconferência</option>
              </select>
            </div>
            <div style="grid-column: 1 / -1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label for="recursoSelecionado" style="margin-bottom: 0;">Recurso Específico</label>
                <button 
                  type="button" 
                  v-if="form.categoria === 'informatica' || form.categoria === 'salas'" 
                  @click="modoCadastroRecurso = !modoCadastroRecurso" 
                  class="btn-cadastrar-recurso"
                  :class="{ 'cancel': modoCadastroRecurso }"
                >
                  <svg v-if="!modoCadastroRecurso" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  {{ modoCadastroRecurso ? 'Cancelar Cadastro' : 'Cadastrar Novo' }}
                </button>
              </div>

              <div v-if="modoCadastroRecurso" style="margin-bottom: 8px;">
                <div style="display: flex; gap: 8px;">
                  <input type="text" id="novoRecurso" v-model="novoRecursoNome" placeholder="Digite o nome do novo recurso/sala">
                  <button type="button" @click="salvarNovoRecurso" class="btn-submit" style="width: auto; padding: 0 16px; margin: 0; background-color: #10b981;">Salvar</button>
                </div>
                <small class="text-muted" style="display: block; margin-top: 4px;">Após salvo, este recurso ficará disponível para sempre neste campus.</small>
              </div>

              <select v-else id="recursoSelecionado" v-model="form.recurso" required :disabled="!recursosDisponiveis.length">
                <option value="" v-if="!recursosDisponiveis.length">-- Escolha o Campus e Categoria primeiro --</option>
                <option value="" v-else>-- Selecione o Recurso --</option>
                <option v-for="rec in recursosDisponiveis" :key="rec" :value="rec">{{ rec }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Data e Hora -->
        <div class="card section-card">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <h3>Cronograma</h3>
          </div>
          <div class="input-grid">
            <div style="grid-column: 1 / -1;">
              <label for="tipoAgendamento">Modelo de Distribuição</label>
              <select id="tipoAgendamento" v-model="form.tipoAgendamento" @change="alternarTipoAgendamento">
                <option value="">-- Selecione o Modelo --</option>
                <option value="pontual">Evento Pontual (Dia Único)</option>
                <option value="periodo">Lote Semestral (Recorrente)</option>
              </select>
            </div>

            <div>
              <label for="dateInicio">Data Inicial</label>
              <input type="date" id="dateInicio" v-model="form.dataInicio" min="2026-08-10" max="2026-12-18" @change="replicarDataPontual" required>
            </div>
            <div :style="{ opacity: form.tipoAgendamento === 'pontual' || !form.tipoAgendamento ? 0.5 : 1 }">
              <label for="dateFim">Data Final</label>
              <input type="date" id="dateFim" v-model="form.dataFim" min="2026-08-10" max="2026-12-18" :disabled="form.tipoAgendamento === 'pontual' || !form.tipoAgendamento" required>
            </div>

            <div v-show="form.tipoAgendamento === 'periodo'" style="grid-column: 1 / -1;">
              <label>Dias da Semana (Recorrência)</label>
              <div class="checkbox-group" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px; margin-top: 8px; background: #f8fafc; padding: 16px; border: 1px solid var(--border-color); border-radius: 6px;">
                <label class="checkbox-label"><input type="checkbox" value="1" v-model="form.diasSemana"> Segunda</label>
                <label class="checkbox-label"><input type="checkbox" value="2" v-model="form.diasSemana"> Terça</label>
                <label class="checkbox-label"><input type="checkbox" value="3" v-model="form.diasSemana"> Quarta</label>
                <label class="checkbox-label"><input type="checkbox" value="4" v-model="form.diasSemana"> Quinta</label>
                <label class="checkbox-label"><input type="checkbox" value="5" v-model="form.diasSemana"> Sexta</label>
                <label class="checkbox-label"><input type="checkbox" value="6" v-model="form.diasSemana"> Sábado</label>
                <label class="checkbox-label"><input type="checkbox" value="0" v-model="form.diasSemana"> Domingo</label>
              </div>
            </div>

            <div>
              <label for="horaInicio">Hora Início</label>
              <input type="time" id="horaInicio" v-model="form.horaInicio" required>
            </div>
            <div>
              <label for="horaFim">Hora Término</label>
              <input type="time" id="horaFim" v-model="form.horaFim" required>
            </div>
          </div>
        </div>

        <!-- Detalhes Acadêmicos -->
        <div class="card section-card">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            <h3>Vínculo Acadêmico</h3>
          </div>
          <div class="input-grid">
            <div style="grid-column: 1 / -1;">
              <label for="disciplina">Disciplina ou Evento</label>
              <input type="text" id="disciplina" v-model="form.disciplina" placeholder="Ex: Arquitetura de Software" required>
            </div>
            <div>
              <label for="professor">Professor Responsável</label>
              <input type="text" id="professor" v-model="form.professor" placeholder="Ex: Prof. Silva" required>
            </div>
            <div>
              <label for="curso">Curso Alvo</label>
              <input type="text" id="curso" v-model="form.curso" placeholder="Ex: Eng. Computação" required>
            </div>
            <div style="grid-column: 1 / -1;">
              <label for="observacao">Observação Adicional (Opcional)</label>
              <textarea id="observacao" v-model="form.observacao" placeholder="Ex: Preciso de adaptador HDMI, microfone, etc..." rows="2" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: inherit; resize: vertical; box-sizing: border-box;"></textarea>
            </div>
          </div>
        </div>

      </div>

      <!-- Coluna Lateral (Sidebar) -->
      <div class="form-sidebar">
        <div class="card sticky-card">
          <h3 style="margin-bottom: 0;">Resumo da Operação</h3>
          
          <div class="alert-info" style="text-align: left; margin-top: 16px; padding: 12px; font-size: 13px;">
            <strong style="display:block; margin-bottom: 4px; font-size: 12px; text-transform: uppercase;">Período Letivo Base</strong>
            <span style="font-weight: 500;">10/08/2026 até 18/12/2026</span>
          </div>

          <div class="summary-details">
            <div class="summary-item">
              <span>Campus:</span>
              <span>{{ form.campus || '-' }}</span>
            </div>
            <div class="summary-item">
              <span>Recurso:</span>
              <span class="truncate">{{ form.recurso || '-' }}</span>
            </div>
            <div class="summary-item">
              <span>Modelo:</span>
              <span>{{ form.tipoAgendamento === 'pontual' ? 'Único' : (form.tipoAgendamento === 'periodo' ? (form.diasSemana.length ? form.diasSemana.length + ' dias/sem' : 'Recorrente') : '-') }}</span>
            </div>
            <div class="summary-item" v-if="form.horaInicio && form.horaFim">
              <span>Horário:</span>
              <span>{{ form.horaInicio }} as {{ form.horaFim }}</span>
            </div>
          </div>

          <div style="margin-top: 24px;">
            <button type="submit" class="btn-submit" style="width: 100%;">
              Processar Reserva
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useReservas } from '../composables/useReservas'

const { reservas, carregarReservas, adicionarReservas, recursosExtras, carregarRecursosExtras, adicionarRecursoExtra } = useReservas()

const novoRecursoNome = ref('')
const modoCadastroRecurso = ref(false)

const salvarNovoRecurso = async () => {
  if (!novoRecursoNome.value.trim()) return
  try {
    const nome = novoRecursoNome.value.trim()
    await adicionarRecursoExtra(form.campus, form.categoria, nome)
    renderizarCamposRecursoDinamico()
    form.recurso = nome
    novoRecursoNome.value = ''
    modoCadastroRecurso.value = false
  } catch(e) {
    alert("Falha ao salvar o novo recurso.")
  }
}

const form = reactive({
  campus: '',
  categoria: '',
  recurso: '',
  tipoAgendamento: '',
  dataInicio: '',
  dataFim: '',
  diasSemana: [],
  horaInicio: '',
  horaFim: '',
  disciplina: '',
  professor: '',
  curso: '',
  observacao: ''
})

const recursosDisponiveis = ref([])

const blocosConfig = {
  "Araras": ["Bloco A", "Bloco B", "Bloco C"],
  "SBO": ["Bloco 1", "Bloco 2", "Bloco 3"]
}

const labsMetodologiaFixos = [
  "SL 01 - AZUL ESCURO", "SL 02 - AMARELA", "SL 03 - AZUL CLARO", "SL 04 - LARANJA",
  "SL 05 - ROXA", "SL 06 - VERDE", "SL 07 - AZUL ESCURO", "SL 08 - AMARELA",
  "SL 09 - AZUL CLARO", "SL 10 - LARANJA", "SL 11 - ROXA", "SL 12 - VERDE"
]

onMounted(async () => {
  await carregarReservas()
  await carregarRecursosExtras()
})

const renderizarCamposRecursoDinamico = () => {
  form.recurso = ''
  if (!form.campus || !form.categoria) {
    recursosDisponiveis.value = []
    return
  }

  let lista = []
  const blocos = blocosConfig[form.campus]

  if (form.categoria === 'metodologias') lista = labsMetodologiaFixos
  else if (form.categoria === 'informatica') {
    blocos.forEach(b => { lista.push(`${b} - Lab 1`, `${b} - Lab 2`, `${b} - Lab 3`) })
  } else if (form.categoria === 'salas') {
    blocos.forEach(b => { lista.push(`${b} - Sala 1`, `${b} - Sala 2`, `${b} - Sala 3`) })
  } else if (form.categoria === 'notebooks') {
    lista = ["Notebook 1", "Notebook 2"]
  } else if (form.categoria === 'videoconf') {
    lista = ["Camera"]
  }

  if (form.categoria === 'informatica' || form.categoria === 'salas') {
    const extras = recursosExtras.value
      .filter(r => r.campus === form.campus && r.categoria === form.categoria)
      .map(r => r.nome)
    lista.push(...extras)
  }
  
  recursosDisponiveis.value = lista
}

const alternarTipoAgendamento = () => {
  if (form.tipoAgendamento === 'pontual') {
    replicarDataPontual()
  } else if (form.tipoAgendamento === 'periodo') {
    form.dataFim = ''
  } else {
    form.dataFim = ''
  }
}

const replicarDataPontual = () => {
  if (form.tipoAgendamento === 'pontual') {
    form.dataFim = form.dataInicio
  }
}

const verificarConflitoHorario = (h1Inicio, h1Fim, h2Inicio, h2Fim) => {
  return (h1Inicio < h2Fim && h1Fim > h2Inicio)
}

const processarAgendamento = async () => {
  if (modoCadastroRecurso.value) {
    alert("Por favor, clique em 'Salvar' para concluir o cadastro do novo recurso ou em 'Cancelar Cadastro' antes de processar a reserva.")
    return
  }

  if (!form.campus || !form.categoria || !form.recurso || !form.tipoAgendamento || !form.dataInicio || !form.dataFim || !form.horaInicio || !form.horaFim || !form.disciplina || !form.professor || !form.curso) {
    alert("Por favor, preencha todos os campos e seleções obrigatórias.")
    return
  }

  let dataAtual = new Date(form.dataInicio + 'T00:00:00')
  const dataFimLimit = new Date(form.dataFim + 'T00:00:00')

  let salvos = 0
  let conflitos = []
  let novasReservas = []

  while (dataAtual <= dataFimLimit) {
    if (form.tipoAgendamento === 'pontual' || form.diasSemana.includes(dataAtual.getDay().toString())) {
      const dataIso = dataAtual.toISOString().split('T')[0]
      const dataBr = dataIso.split('-').reverse().join('/')

      const choque = reservas.value.find(i => 
        i.campus === form.campus && i.categoria === form.categoria && i.recurso === form.recurso &&
        i.data === dataIso && verificarConflitoHorario(form.horaInicio, form.horaFim, i.horaInicio, i.horaFim)
      )

      if (choque) {
        conflitos.push(`${dataBr} [${form.horaInicio}-${form.horaFim}]`)
      } else {
        novasReservas.push({
          id: 'id_' + Math.random().toString(36).substr(2, 9),
          campus: form.campus,
          categoria: form.categoria,
          recurso: form.recurso,
          data: dataIso,
          horaInicio: form.horaInicio,
          horaFim: form.horaFim,
          disciplina: form.disciplina,
          professor: form.professor,
          curso: form.curso,
          observacao: form.observacao,
          status: 'pendente'
        })
        salvos++
      }
    }
    dataAtual.setDate(dataAtual.getDate() + 1)
  }

  try {
    if (novasReservas.length > 0) {
      await adicionarReservas(novasReservas)
    }

    if (conflitos.length > 0) {
      alert(`✅ ${salvos} reservas confirmadas.\n❌ [CONFLITOS BLOQUEADOS]:\n` + conflitos.join('\n'))
    } else {
      alert(`Sucesso! ${salvos} reserva(s) adicionada(s) no banco de dados.`)
    }

    // Reset form maintaining campus/categoria for convenience
    form.recurso = ''
    form.dataInicio = ''
    form.dataFim = ''
    form.diasSemana = []
    form.horaInicio = ''
    form.horaFim = ''
    form.disciplina = ''
    form.professor = ''
    form.curso = ''
  } catch (error) {
    console.error("ERRO SUPABASE:", error)
    alert("❌ Falha crítica ao salvar no banco de dados.\n\nDetalhe: " + (error.message || "Verifique se sua chave do Supabase está correta e se a tabela 'reservas' existe."))
  }
}
</script>

<style scoped>
.platform-header {
  margin-bottom: 32px;
}
.platform-header h2 {
  text-align: left;
  margin-bottom: 8px;
}
.text-muted {
  color: var(--text-muted);
  font-size: 15px;
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  align-items: start;
}

/* Colocar os cards de seção lado a lado */
.form-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

@media (max-width: 1200px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}

.section-card {
  padding: 24px;
  margin-bottom: 0;
  height: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}
.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-color);
}
.section-header svg {
  color: var(--primary-color);
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.sticky-card {
  position: sticky;
  top: 90px;
  padding: 24px;
}

.summary-details {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  font-size: 14px;
  color: var(--text-color);
}
.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.summary-item span:first-child {
  color: var(--text-muted);
}
.summary-item span:last-child {
  font-weight: 600;
  text-align: right;
  max-width: 180px;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  user-select: none;
}
.checkbox-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--primary-color);
}
</style>
