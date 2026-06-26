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
                <label style="margin-bottom: 0;">Recurso Específico</label>
                <div style="display: flex; gap: 8px;">
                  <button v-if="form.recurso && recursosDisponiveis.includes(form.recurso)" type="button" @click="apagarRecursoExtra(form.categoria, form.recurso)" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px; color: #ef4444; border-color: #fca5a5;" title="Apagar recurso selecionado">
                    Apagar
                  </button>
                  <button type="button" @click="abrirModalCadastro('recurso')" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px;">
                    + Novo Recurso
                  </button>
                </div>
              </div>
              <select id="recursoSelecionado" v-model="form.recurso" required :disabled="!recursosDisponiveis.length">
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
            
            <!-- Secao de Presets -->
            <div style="grid-column: 1 / -1; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); margin-bottom: 8px;">
              <label>Presets de Cronograma</label>
              
              <div>
                <select v-model="presetSelecionado" @change="carregarPreset">
                  <option value="">-- Carregar um preset de horário (Opcional) --</option>
                  <option v-for="preset in presetsDisponiveis" :key="preset.id" :value="preset.nome">{{ preset.nome.split('||')[0] }}</option>
                </select>
                <div style="margin-top: 6px; display: flex; justify-content: flex-end; gap: 8px;">
                  <button v-if="presetSelecionado" type="button" @click="apagarRecursoExtra('preset_horario', presetSelecionado)" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px; color: #ef4444; border-color: #fca5a5;">
                    Apagar Preset
                  </button>
                  <button type="button" @click="abrirModalCadastro('preset')" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px;">
                    + Novo Preset
                  </button>
                </div>
              </div>
            </div>

            <div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; background: var(--input-bg); padding: 12px; border: 1px solid var(--border-color); border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="margin-bottom: 0; font-weight: 600; font-size: 12px; color: var(--text-color);">Semestre Letivo:</label>
                <button v-if="isAdmin" type="button" @click="abrirModalConfig" class="btn-cadastrar-recurso" style="padding: 2px 8px; font-size: 11px; margin: 0;">
                  ⚙️ Editar
                </button>
              </div>
              <div style="display: flex; gap: 16px;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: normal; font-size: 13px;">
                  <input type="radio" value="1" v-model="semestreAtivo" @change="validarDatasSemestre"> 1º Semestre
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: normal; font-size: 13px;">
                  <input type="radio" value="2" v-model="semestreAtivo" @change="validarDatasSemestre"> 2º Semestre
                </label>
              </div>
            </div>
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
              <input type="date" id="dateInicio" v-model="form.dataInicio" :min="minDate" :max="maxDate" @change="() => { replicarDataPontual(); validarInputManual() }" required>
            </div>
            <div :style="{ opacity: form.tipoAgendamento === 'pontual' || !form.tipoAgendamento ? 0.5 : 1 }">
              <label for="dateFim">Data Final</label>
              <input type="date" id="dateFim" v-model="form.dataFim" :min="minDate" :max="maxDate" :disabled="form.tipoAgendamento === 'pontual' || !form.tipoAgendamento" @change="validarInputManual" required>
            </div>

            <div v-show="form.tipoAgendamento === 'periodo'" style="grid-column: 1 / -1;">
              <label>Dias da Semana (Recorrência)</label>
              <div class="checkbox-group" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px; margin-top: 8px; background: var(--input-bg); padding: 16px; border: 1px solid var(--border-color); border-radius: 6px;">
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
              
              <div>
                <select id="professor" v-model="form.professor" @change="aoSelecionarProfessor" required>
                  <option value="">-- Selecione o Professor --</option>
                  <option v-for="prof in professoresDisponiveis" :key="prof.nome" :value="prof.nome">{{ prof.nome }}</option>
                </select>
                <div style="margin-top: 6px; display: flex; justify-content: flex-end; gap: 8px;">
                  <button v-if="form.professor" type="button" @click="apagarRecursoExtra('professor', professoresDisponiveisObj.find(p => p.nome === form.professor)?.originalNome)" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px; color: #ef4444; border-color: #fca5a5;">
                    Apagar Prof.
                  </button>
                  <button type="button" @click="abrirModalCadastro('professor')" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px;">
                    + Cadastrar Novo
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label for="curso">Curso Alvo</label>
              
              <div>
                <select id="curso" v-model="form.curso" required>
                  <option value="">-- Selecione o Curso --</option>
                  <option v-for="cur in cursosDisponiveis" :key="cur" :value="cur">{{ cur }}</option>
                </select>
                <div style="margin-top: 6px; display: flex; justify-content: flex-end; gap: 8px;">
                  <button v-if="form.curso" type="button" @click="apagarRecursoExtra('curso', form.curso)" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px; color: #ef4444; border-color: #fca5a5;">
                    Apagar Curso
                  </button>
                  <button type="button" @click="abrirModalCadastro('curso')" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px;">
                    + Cadastrar Novo
                  </button>
                </div>
              </div>
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
            <strong style="display:block; margin-bottom: 4px; font-size: 12px; text-transform: uppercase;">Período Letivo Base ({{ semestreAtivo }}º Sem)</strong>
            <span style="font-weight: 500;">{{ minDateBr }} até {{ maxDateBr }}</span>
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
      <!-- Modal de Cadastro -->
      <div class="modal-overlay" v-if="modalCadastro.aberto">
        <div class="modal-content">
          <h3 style="margin-top: 0; margin-bottom: 24px; color: var(--primary-color);">
            {{ 
              modalCadastro.tipo === 'recurso' ? 'Cadastrar Novo Recurso' :
              modalCadastro.tipo === 'preset' ? 'Cadastrar Novo Preset' :
              modalCadastro.tipo === 'professor' ? 'Cadastrar Novo Professor' :
              'Cadastrar Novo Curso'
            }}
          </h3>

          <div v-if="modalCadastro.tipo === 'recurso'" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="input-group">
              <label>Nome do Recurso</label>
              <input type="text" v-model="novoRecursoNome" placeholder="Ex: Laboratório 01" required>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
              <button type="button" @click="fecharModalCadastro" class="btn-cancel" style="width: auto; margin: 0;">Cancelar</button>
              <button type="button" @click="salvarNovoRecurso" class="btn-submit" style="width: auto; margin: 0;">Salvar</button>
            </div>
          </div>

          <div v-if="modalCadastro.tipo === 'preset'" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="alert-info" style="font-size: 13px; text-align: left; padding: 12px; margin-bottom: 8px;">
              Preencha os campos de <strong>data e horário</strong> no formulário principal antes de criar o preset.
            </div>
            <div class="input-group">
              <label>Nome do Preset</label>
              <input type="text" v-model="novoPresetNome" placeholder="Ex: Matutino - Seg e Qua" required>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
              <button type="button" @click="fecharModalCadastro" class="btn-cancel" style="width: auto; margin: 0;">Cancelar</button>
              <button type="button" @click="salvarNovoPreset" class="btn-submit" style="width: auto; margin: 0;">Salvar Preset</button>
            </div>
          </div>

          <div v-if="modalCadastro.tipo === 'professor'" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="input-group">
              <label>Nome do Professor</label>
              <input type="text" v-model="novoProfessorNome" placeholder="Ex: João da Silva" required>
            </div>
            <div class="input-group">
              <label>Vincular a um Curso Padrão (Opcional)</label>
              <select v-model="novoProfessorCurso">
                <option value="">-- Nenhum --</option>
                <option v-for="cur in cursosDisponiveis" :key="cur" :value="cur">{{ cur }}</option>
              </select>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
              <button type="button" @click="fecharModalCadastro" class="btn-cancel" style="width: auto; margin: 0;">Cancelar</button>
              <button type="button" @click="salvarNovoProfessor" class="btn-submit" style="width: auto; margin: 0;">Salvar Professor</button>
            </div>
          </div>

          <div v-if="modalCadastro.tipo === 'curso'" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="input-group">
              <label>Nome do Curso</label>
              <input type="text" v-model="novoCursoNome" placeholder="Ex: Engenharia de Software" required>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
              <button type="button" @click="fecharModalCadastro" class="btn-cancel" style="width: auto; margin: 0;">Cancelar</button>
              <button type="button" @click="salvarNovoCurso" class="btn-submit" style="width: auto; margin: 0;">Salvar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Configuração de Semestres (Admin) -->
      <div class="modal-overlay" v-if="modalConfigSemestre" style="z-index: 2000;">
        <div class="modal-content" style="max-width: 500px;">
          <h3 style="margin-top: 0; margin-bottom: 24px; color: var(--primary-color);">Editar Períodos Letivos</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="grid-column: 1 / -1; font-weight: bold; margin-bottom: -8px;">1º Semestre</div>
            <div class="input-group">
              <label>Data de Início</label>
              <input type="date" v-model="formConfigSemestre.sem1Inicio" required>
            </div>
            <div class="input-group">
              <label>Data de Fim</label>
              <input type="date" v-model="formConfigSemestre.sem1Fim" required>
            </div>

            <div style="grid-column: 1 / -1; font-weight: bold; margin-bottom: -8px; margin-top: 8px;">2º Semestre</div>
            <div class="input-group">
              <label>Data de Início</label>
              <input type="date" v-model="formConfigSemestre.sem2Inicio" required>
            </div>
            <div class="input-group">
              <label>Data de Fim</label>
              <input type="date" v-model="formConfigSemestre.sem2Fim" required>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button type="button" @click="modalConfigSemestre = false" class="btn-cancel" style="width: auto; margin: 0;">Cancelar</button>
            <button type="button" @click="salvarConfigSemestre" class="btn-submit" style="width: auto; margin: 0;">Salvar Datas</button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useReservas } from '../composables/useReservas'
import { useAuth } from '../composables/useAuth'

const { isAdmin } = useAuth()
const { reservas, carregarReservas, adicionarReservas, recursosExtras, carregarRecursosExtras, adicionarRecursoExtra, deletarRecursoExtra, atualizarRecursoExtra } = useReservas()

const mesAtual = new Date().getMonth()
const semestreAtivo = ref(mesAtual > 5 ? '2' : '1')

const configuracaoSemestreId = ref('')
const configsSemestre = reactive({
  sem1Inicio: '2026-02-23',
  sem1Fim: '2026-06-26',
  sem2Inicio: '2026-08-10',
  sem2Fim: '2026-12-18'
})

const minDate = computed(() => semestreAtivo.value === '1' ? configsSemestre.sem1Inicio : configsSemestre.sem2Inicio)
const maxDate = computed(() => semestreAtivo.value === '1' ? configsSemestre.sem1Fim : configsSemestre.sem2Fim)

const minDateBr = computed(() => minDate.value.split('-').reverse().join('/'))
const maxDateBr = computed(() => maxDate.value.split('-').reverse().join('/'))

const validarDatasSemestre = () => {
  if (form.dataInicio) {
    if (form.dataInicio < minDate.value || form.dataInicio > maxDate.value) {
      Swal.fire('Aviso', `Você mudou para o ${semestreAtivo.value}º Semestre, mas a data inicial estava no outro semestre. A data foi redefinida.`, 'info')
      form.dataInicio = ''
    }
  }
  if (form.dataFim) {
    if (form.dataFim < minDate.value || form.dataFim > maxDate.value) {
      form.dataFim = ''
    }
  }
}

const validarInputManual = () => {
  if (form.dataInicio && (form.dataInicio < minDate.value || form.dataInicio > maxDate.value)) {
    Swal.fire('Atenção', `A data inicial não pertence ao ${semestreAtivo.value}º Semestre. Limites: ${minDateBr.value} a ${maxDateBr.value}.`, 'warning')
    form.dataInicio = ''
  }
  if (form.dataFim && (form.dataFim < minDate.value || form.dataFim > maxDate.value)) {
    Swal.fire('Atenção', `A data final não pertence ao ${semestreAtivo.value}º Semestre. Limites: ${minDateBr.value} a ${maxDateBr.value}.`, 'warning')
    form.dataFim = ''
  }
}

const modalConfigSemestre = ref(false)
const formConfigSemestre = reactive({ sem1Inicio: '', sem1Fim: '', sem2Inicio: '', sem2Fim: '' })

const abrirModalConfig = () => {
  formConfigSemestre.sem1Inicio = configsSemestre.sem1Inicio
  formConfigSemestre.sem1Fim = configsSemestre.sem1Fim
  formConfigSemestre.sem2Inicio = configsSemestre.sem2Inicio
  formConfigSemestre.sem2Fim = configsSemestre.sem2Fim
  modalConfigSemestre.value = true
}

const salvarConfigSemestre = async () => {
  if (!configuracaoSemestreId.value) return Swal.fire('Erro', 'ID de configuração não encontrado', 'error')
  
  try {
    const jsonStr = JSON.stringify(formConfigSemestre)
    await atualizarRecursoExtra(configuracaoSemestreId.value, { nome: jsonStr })
    
    configsSemestre.sem1Inicio = formConfigSemestre.sem1Inicio
    configsSemestre.sem1Fim = formConfigSemestre.sem1Fim
    configsSemestre.sem2Inicio = formConfigSemestre.sem2Inicio
    configsSemestre.sem2Fim = formConfigSemestre.sem2Fim
    
    modalConfigSemestre.value = false
    Swal.fire('Sucesso', 'Datas do período letivo atualizadas com sucesso!', 'success')
  } catch(e) {
    Swal.fire('Erro', 'Falha ao salvar novas datas', 'error')
  }
}

const novoRecursoNome = ref('')
const novoProfessorNome = ref('')
const novoProfessorCurso = ref('')
const novoCursoNome = ref('')
const presetSelecionado = ref('')
const novoPresetNome = ref('')

const modalCadastro = ref({ aberto: false, tipo: '' })

const abrirModalCadastro = (tipo) => {
  modalCadastro.value = { aberto: true, tipo }
}

const fecharModalCadastro = () => {
  modalCadastro.value.aberto = false
}

const professoresDisponiveisObj = computed(() => {
  return recursosExtras.value.filter(r => r.categoria === 'professor').map(r => {
    const partes = r.nome.split('||')
    return { nome: partes[0], curso: partes[1] || '', originalNome: r.nome }
  })
})
const professoresDisponiveis = computed(() => professoresDisponiveisObj.value)
const cursosDisponiveis = computed(() => recursosExtras.value.filter(r => r.categoria === 'curso').map(r => r.nome))
const presetsDisponiveis = computed(() => recursosExtras.value.filter(r => r.categoria === 'preset_horario'))

const salvarNovoRecurso = async () => {
  if (!novoRecursoNome.value.trim()) return
  try {
    const nome = novoRecursoNome.value.trim()
    await adicionarRecursoExtra(form.campus, form.categoria, nome)
    renderizarCamposRecursoDinamico()
    form.recurso = nome
    novoRecursoNome.value = ''
    fecharModalCadastro()
  } catch(e) {
    Swal.fire('Erro', 'Falha ao salvar o novo recurso.', 'error')
  }
}

const salvarNovoProfessor = async () => {
  if (!novoProfessorNome.value.trim()) return
  try {
    const nomeBase = novoProfessorNome.value.trim()
    const nomeFinal = novoProfessorCurso.value ? `${nomeBase}||${novoProfessorCurso.value}` : nomeBase
    
    await adicionarRecursoExtra('Geral', 'professor', nomeFinal)
    form.professor = nomeBase
    if (novoProfessorCurso.value) {
      form.curso = novoProfessorCurso.value
    }
    
    novoProfessorNome.value = ''
    novoProfessorCurso.value = ''
    fecharModalCadastro()
  } catch(e) {
    Swal.fire('Erro', 'Falha ao salvar o novo professor.', 'error')
  }
}

const aoSelecionarProfessor = () => {
  const profObj = professoresDisponiveis.value.find(p => p.nome === form.professor)
  if (profObj && profObj.curso) {
    form.curso = profObj.curso
  }
}

const salvarNovoCurso = async () => {
  if (!novoCursoNome.value.trim()) return
  try {
    const nome = novoCursoNome.value.trim()
    await adicionarRecursoExtra('Geral', 'curso', nome)
    form.curso = nome
    novoCursoNome.value = ''
    fecharModalCadastro()
  } catch(e) {
    Swal.fire('Erro', 'Falha ao salvar o novo curso.', 'error')
  }
}

const salvarNovoPreset = async () => {
  if (!novoPresetNome.value.trim()) return
  
  if (!form.dataInicio || !form.horaInicio || !form.horaFim || !form.tipoAgendamento) {
    Swal.fire('Atenção', 'Preencha ao menos o modelo de distribuição, data inicial, hora de início e hora de término para salvar um preset.', 'warning')
    return
  }

  if (form.horaInicio >= form.horaFim) {
    Swal.fire('Atenção', 'A hora de término deve ser posterior à hora de início para salvar o preset.', 'warning')
    return
  }
  
  try {
    const presetData = {
      tipoAgendamento: form.tipoAgendamento,
      dataInicio: form.dataInicio,
      dataFim: form.dataFim,
      diasSemana: [...form.diasSemana],
      horaInicio: form.horaInicio,
      horaFim: form.horaFim
    }
    
    // Armazena no banco de dados como JSON string acoplada ao nome
    const nomeCustom = `${novoPresetNome.value.trim()}||${JSON.stringify(presetData)}`
    
    await adicionarRecursoExtra('Geral', 'preset_horario', nomeCustom)
    presetSelecionado.value = nomeCustom
    novoPresetNome.value = ''
    fecharModalCadastro()
  } catch(e) {
    Swal.fire('Erro', 'Falha ao salvar o preset.', 'error')
  }
}

const carregarPreset = () => {
  if (!presetSelecionado.value) return
  try {
    const jsonStr = presetSelecionado.value.split('||')[1]
    const data = JSON.parse(jsonStr)
    form.tipoAgendamento = data.tipoAgendamento || ''
    form.dataInicio = data.dataInicio || ''
    form.dataFim = data.dataFim || ''
    form.diasSemana = data.diasSemana || []
    form.horaInicio = data.horaInicio || ''
    form.horaFim = data.horaFim || ''
  } catch(e) {
    console.error("Erro ao fazer parse do preset:", e)
  }
}

const apagarRecursoExtra = async (categoria, nomeReferencia) => {
  if (!nomeReferencia) return
  
  const result = await Swal.fire({
    title: 'Tem certeza?',
    text: `Deseja apagar permanentemente '${nomeReferencia.split('||')[0]}'?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sim, apagar!',
    cancelButtonText: 'Cancelar'
  })
  
  if (!result.isConfirmed) return
  
  const rec = recursosExtras.value.find(r => r.categoria === categoria && r.nome === nomeReferencia)
  if (!rec) {
    // Tenta procurar pelo nome puro se não achou (fallback)
    const recFallback = recursosExtras.value.find(r => r.nome === nomeReferencia)
    if (!recFallback) return
    await deletarRecursoExtra(recFallback.id)
  } else {
    await deletarRecursoExtra(rec.id)
  }

  if (categoria === 'preset_horario') presetSelecionado.value = ''
  else if (categoria === 'professor') form.professor = ''
  else if (categoria === 'curso') form.curso = ''
  else {
    form.recurso = ''
    renderizarCamposRecursoDinamico()
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

onMounted(async () => {
  await carregarReservas()
  await carregarRecursosExtras()
  
  const config = recursosExtras.value.find(r => r.categoria === 'configuracao_semestre')
  if (config) {
    configuracaoSemestreId.value = config.id
    try {
      const parsed = JSON.parse(config.nome)
      configsSemestre.sem1Inicio = parsed.sem1Inicio || configsSemestre.sem1Inicio
      configsSemestre.sem1Fim = parsed.sem1Fim || configsSemestre.sem1Fim
      configsSemestre.sem2Inicio = parsed.sem2Inicio || configsSemestre.sem2Inicio
      configsSemestre.sem2Fim = parsed.sem2Fim || configsSemestre.sem2Fim
    } catch(e) { console.error('Erro ao ler config_semestre') }
  } else {
    adicionarRecursoExtra('Geral', 'configuracao_semestre', JSON.stringify(configsSemestre)).then(() => {
      carregarRecursosExtras().then(() => {
        const c = recursosExtras.value.find(r => r.categoria === 'configuracao_semestre')
        if (c) configuracaoSemestreId.value = c.id
      })
    })
  }
})

const renderizarCamposRecursoDinamico = () => {
  form.recurso = ''
  if (!form.campus || !form.categoria) {
    recursosDisponiveis.value = []
    return
  }

  const extras = recursosExtras.value
    .filter(r => r.campus === form.campus && r.categoria === form.categoria)
    .map(r => r.nome)
  
  let lista = []
  
  if (form.categoria === 'metodologias') {
    lista = [
      "SL 01 - AZUL ESCURO", "SL 02 - AMARELA", "SL 03 - AZUL CLARO", "SL 04 - LARANJA",
      "SL 05 - ROXA", "SL 06 - VERDE", "SL 07 - AZUL ESCURO", "SL 08 - AMARELA",
      "SL 09 - AZUL CLARO", "SL 10 - LARANJA", "SL 11 - ROXA", "SL 12 - VERDE"
    ]
  } else if (form.categoria === 'notebooks') {
    lista = ["Notebook 1", "Notebook 2"]
  } else if (form.categoria === 'videoconf') {
    lista = ["Camera"]
  }

  recursosDisponiveis.value = [...lista, ...extras]
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
  if (modalCadastro.value.aberto) {
    Swal.fire('Atenção', "Por favor, conclua o cadastro ou feche o modal antes de processar a reserva.", 'warning')
    return
  }

  if (!form.campus || !form.categoria || !form.recurso || !form.tipoAgendamento || !form.dataInicio || !form.dataFim || !form.horaInicio || !form.horaFim || !form.disciplina || !form.professor || !form.curso) {
    Swal.fire('Atenção', "Por favor, preencha todos os campos e seleções obrigatórias.", 'warning')
    return
  }

  if (form.tipoAgendamento === 'periodo' && (!form.diasSemana || form.diasSemana.length === 0)) {
    Swal.fire('Atenção', 'Selecione ao menos um dia da semana para a recorrência.', 'warning')
    return
  }

  if (form.horaInicio >= form.horaFim) {
    Swal.fire('Atenção', 'A hora de término deve ser posterior à hora de início.', 'warning')
    return
  }

  let dataAtual = new Date(form.dataInicio + 'T00:00:00')
  const dataFimLimit = new Date(form.dataFim + 'T00:00:00')

  if (dataFimLimit < dataAtual) {
    Swal.fire('Atenção', 'A data final não pode ser anterior à data inicial.', 'warning')
    return
  }

  let salvos = 0
  let conflitos = []
  let novasReservas = []
  
  // Feriados variam por semestre e devem se adaptar ao ano configurado
  const anoFeriados = configsSemestre.sem1Inicio ? configsSemestre.sem1Inicio.substring(0, 4) : new Date().getFullYear()
  const feriados = semestreAtivo.value === '1' 
    ? [`${anoFeriados}-04-03`, `${anoFeriados}-04-21`, `${anoFeriados}-05-01`, `${anoFeriados}-06-04`]
    : [`${anoFeriados}-09-07`, `${anoFeriados}-10-12`, `${anoFeriados}-11-02`, `${anoFeriados}-11-15`]

  while (dataAtual <= dataFimLimit) {
    const dataIso = dataAtual.toISOString().split('T')[0]
    
    // Pula os feriados apenas se for um agendamento recorrente (lote)
    if (form.tipoAgendamento === 'periodo' && feriados.includes(dataIso)) {
      dataAtual.setDate(dataAtual.getDate() + 1)
      continue
    }

    if (form.tipoAgendamento === 'pontual' || form.diasSemana.includes(dataAtual.getDay().toString())) {
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
    if (novasReservas.length === 0 && conflitos.length === 0) {
      Swal.fire('Atenção', 'Nenhuma data válida encontrada no período para os dias selecionados.', 'info')
      return
    }

    if (novasReservas.length > 0) {
      await adicionarReservas(novasReservas)
    }

    if (conflitos.length > 0) {
      Swal.fire({
        title: `${salvos} reservas confirmadas`,
        html: `❌ <b>CONFLITOS BLOQUEADOS:</b><br/>` + conflitos.join('<br/>'),
        icon: 'warning'
      })
    } else {
      Swal.fire('Sucesso!', `${salvos} reserva(s) adicionada(s) no banco de dados.`, 'success')
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
    Swal.fire('Falha crítica', error.message || "Verifique se sua chave do Supabase está correta e se a tabela 'reservas' existe.", 'error')
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
  backdrop-filter: blur(2px);
}
.modal-content {
  background: var(--card-bg);
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  border: 1px solid var(--border-color);
}
.input-group {
  margin-bottom: 16px;
}
.input-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}
.input-group input, .input-group select {
  width: 100%;
}
</style>
