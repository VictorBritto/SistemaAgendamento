<template>
  <div class="agendamento-container">
    <div class="platform-header" style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px; margin-bottom: 24px;">
      <div>
        <h2>Cronograma de Ocupação</h2>
        <p class="text-muted">Visualize a distribuição dos recursos e gerencie os agendamentos realizados.</p>
      </div>
      <div class="action-bar" style="margin-top: 0;">
        <button class="btn-excel" @click="exportarExcel" style="background-color: #059669;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: text-bottom;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Exportar XLSX
        </button>
        <button class="btn-pdf" @click="exportarPDF">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: text-bottom;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Imprimir
        </button>
        <button v-if="isAdmin" class="btn-danger" @click="abrirExclusaoLote" style="background-color: #c2410c;">Apagar por Lote</button>
        <button v-if="isAdmin" class="btn-danger" @click="confirmarLimpeza">Apagar Tudo</button>
      </div>
    </div>

    <div class="card section-card compact-filters">
      <h3 style="margin-bottom: 12px; font-size: 15px; display: flex; align-items: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtros de Pesquisa
      </h3>
      <div class="input-grid">
        <div>
          <label for="filtroCampus">Campus</label>
          <select id="filtroCampus" v-model="filtros.campus" @change="gerarRelatorio">
            <option value="">-- Selecione --</option>
            <option value="Araras">Araras</option>
            <option value="SBO">Santa Bárbara d'Oeste (SBO)</option>
          </select>
        </div>
        <div>
          <label for="filtroCategoria">Categoria</label>
            <select id="filtroCategoria" v-model="filtros.categoria" @change="gerarRelatorio">
              <option value="">-- Selecione --</option>
              <option value="metodologias">Lab. Metodologia</option>
              <option value="informatica">Lab. Informática</option>
              <option value="salas">Salas de Aula</option>
              <option value="videoconf">Videoconf.</option>
            </select>
        </div>
        <div>
          <label for="filtroModoData">Modo de Busca</label>
          <select id="filtroModoData" v-model="filtros.modoData" @change="alternarModoFiltroData">
            <option value="">-- Selecione --</option>
            <option value="periodo">Por Período</option>
            <option value="individual">Dia Único</option>
          </select>
        </div>
        
        <div>
          <label for="filtroDataInicio">Data Inicial / Única</label>
          <input type="date" id="filtroDataInicio" v-model="filtros.dataInicio" :min="configuracaoGlobal.minDate" :max="configuracaoGlobal.maxDate" @change="gerarRelatorio">
        </div>
        <div :style="{ opacity: filtros.modoData === 'individual' ? 0.5 : 1, pointerEvents: filtros.modoData === 'individual' ? 'none' : 'auto' }">
          <label for="filtroDataFim">Data Final</label>
          <input type="date" id="filtroDataFim" v-model="filtros.dataFim" :min="configuracaoGlobal.minDate" :max="configuracaoGlobal.maxDate" @change="gerarRelatorio">
        </div>
        <div>
          <label for="filtroSala">Filtrar por Sala</label>
          <input type="text" id="filtroSala" v-model="filtros.sala" placeholder="Nome ou número" @input="gerarRelatorio">
        </div>
        <div>
          <label for="filtroProfessor">Filtrar por Professor</label>
          <input type="text" id="filtroProfessor" v-model="filtros.professor" placeholder="Nome do prof." @input="gerarRelatorio">
        </div>
      </div>
    </div>

    <div v-if="!temDados" class="no-data-alert">
      {{ mensagemVazio }}
    </div>

    <div v-else id="blocoDadosVisuais">
      <DashboardCharts :countCat="countCat" :countStatus="countStatus" />

      <div class="card">
        <h3 style="margin-bottom: 16px;">Distribuição de Ocupação (Apenas Reservados)</h3>
        
        <div v-if="mesesDisponiveis.length > 1" class="month-filters" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
          <button 
            v-for="mes in mesesDisponiveis" 
            :key="mes.valor"
            class="month-tab"
            :class="{ active: mesFiltroSelecionado === mes.valor }"
            @click="mesFiltroSelecionado = mes.valor"
            style="padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1px solid var(--border-color); background: var(--pill-bg); color: var(--text-color); cursor: pointer; transition: all 0.2s;"
          >
            {{ mes.rotulo }}
          </button>
        </div>

        <div v-if="linhasFiltradasPorMes.length > 0" class="day-pills-container">
          <button 
            v-for="linha in linhasFiltradasPorMes" 
            :key="'pill-'+linha.dataIso"
            class="day-pill"
            :class="{ active: diaSelecionado === linha.dataIso }"
            @click="diaSelecionado = linha.dataIso"
          >
            <span class="pill-weekday">{{ linha.diaSemana }}</span>
            <strong class="pill-day">{{ linha.dataBr.split('/')[0] }}</strong>
            <span class="pill-month">{{ mesAbreviado(linha.dataBr.split('/')[1]) }}</span>
          </button>
        </div>

        <div class="agenda-list" v-if="diaSelecionado">
          <div v-for="linha in linhasTabela.filter(l => l.dataIso === diaSelecionado)" :key="linha.dataIso" class="agenda-day animate-fade">
            <div class="day-header" style="display: flex; justify-content: space-between; align-items: center;">
               <h4>{{ linha.dataBr }} <span style="color: var(--text-muted); font-weight: 400; font-size: 14px; margin-left: 8px;">{{ linha.diaSemana }}</span></h4>
               <span class="badge-count">{{ totalEventos(linha) }} reservas neste dia</span>
            </div>
            
            <div class="events-grid">
               <template v-for="col in colunasFixas" :key="col">
                  <div 
                    v-for="info in linha.recursos[col]" 
                    :key="info.id"
                    class="event-card"
                    style="padding: 0; overflow: hidden; display: flex; flex-direction: column;"
                  >
                    <!-- Header Colorido -->
                    <div :style="getCorFundoFull(info.recurso)">
                      <div class="card-header" style="margin-bottom: 0;">
                         <span class="room-name" style="font-size: 14px; color: inherit;">{{ info.recurso }}</span>
                         <span class="badge-status" :style="{ backgroundColor: statusBgColor(info.status), color: '#ffffff', border: 'none', padding: '4px 10px' }">{{ statusTexto(info.status) }}</span>
                      </div>
                    </div>
                    
                    <!-- Corpo Branco/Escuro -->
                    <div style="padding: 16px; background-color: var(--card-bg); flex: 1; display: flex; flex-direction: column;">
                      <div class="time-badge">{{ info.horaInicio }} - {{ info.horaFim }}</div>
                    
                    <div class="details">
                       <strong>{{ info.disciplina }}</strong>
                       <div class="prof">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                         {{ info.professor }}
                       </div>
                       <div v-if="info.observacao" style="font-size: 12px; color: var(--text-muted); font-style: italic; background-color: #f1f5f9; padding: 6px; border-radius: 4px; border-left: 2px solid var(--primary-color);">
                         <strong>Obs:</strong> {{ info.observacao }}
                       </div>
                    </div>

                    <div class="actions">
                       <select v-if="isAdmin" :value="info.status" @change="mudarStatus(info.id, $event.target.value)">
                          <option value="pendente">Reservado</option>
                          <option value="usado">Utilizado</option>
                          <option value="noshow">Não Usou</option>
                       </select>
                       
                       <div style="display: flex; gap: 8px; width: 100%; justify-content: flex-end;">
                         <button type="button" class="btn-cancel" v-if="isAdmin || info.user_id === user?.id" @click="abrirEdicao(info)">Editar</button>
                         <button type="button" class="btn-cancel" v-if="isAdmin || info.user_id === user?.id" @click="remover(info.id)">Cancelar</button>
                       </div>
                     </div>
                    </div>
                  </div>
               </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <EditModal 
      v-if="reservaEmEdicao" 
      :reserva="reservaEmEdicao" 
      @fechar="reservaEmEdicao = null" 
      @salvar="salvarEdicao"
    />

    <div v-if="exibindoModalLote" class="modal-overlay">
      <div class="modal-content" style="max-width: 600px;">
        <h3 style="margin-top: 0; color: var(--primary-color);">Exceção em Lote</h3>
        <p class="text-muted" style="margin-bottom: 16px;">Selecione os parâmetros abaixo para cancelar as agendas em lote.</p>
        
        <div class="input-grid" style="grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label>Sala / Recurso</label>
            <input type="text" v-model="filtroLote.recurso" placeholder="Opcional (Ex: SL 01)">
          </div>
          <div>
            <label>Professor</label>
            <input type="text" v-model="filtroLote.professor" placeholder="Opcional (Ex: Nome)">
          </div>
          <div>
            <label>Data Inicial (Opcional)</label>
            <input type="date" v-model="filtroLote.dataInicio">
          </div>
          <div>
            <label>Data Final (Opcional)</label>
            <input type="date" v-model="filtroLote.dataFim">
          </div>
          <div>
            <label>Hora Início (Opcional)</label>
            <input type="time" v-model="filtroLote.horaInicio">
          </div>
          <div>
            <label>Hora Fim (Opcional)</label>
            <input type="time" v-model="filtroLote.horaFim">
          </div>
          
          <div style="grid-column: 1 / -1;">
            <label>Dias da Semana (Opcional)</label>
            <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px; background: var(--input-bg); padding: 12px; border: 1px solid var(--border-color); border-radius: 6px;">
              <label style="cursor:pointer; display:flex; gap: 4px; align-items: center; margin: 0;"><input type="checkbox" value="1" v-model="filtroLote.diasSemana"> Segunda</label>
              <label style="cursor:pointer; display:flex; gap: 4px; align-items: center; margin: 0;"><input type="checkbox" value="2" v-model="filtroLote.diasSemana"> Terça</label>
              <label style="cursor:pointer; display:flex; gap: 4px; align-items: center; margin: 0;"><input type="checkbox" value="3" v-model="filtroLote.diasSemana"> Quarta</label>
              <label style="cursor:pointer; display:flex; gap: 4px; align-items: center; margin: 0;"><input type="checkbox" value="4" v-model="filtroLote.diasSemana"> Quinta</label>
              <label style="cursor:pointer; display:flex; gap: 4px; align-items: center; margin: 0;"><input type="checkbox" value="5" v-model="filtroLote.diasSemana"> Sexta</label>
              <label style="cursor:pointer; display:flex; gap: 4px; align-items: center; margin: 0;"><input type="checkbox" value="6" v-model="filtroLote.diasSemana"> Sábado</label>
              <label style="cursor:pointer; display:flex; gap: 4px; align-items: center; margin: 0;"><input type="checkbox" value="0" v-model="filtroLote.diasSemana"> Domingo</label>
            </div>
          </div>
        </div>
        
        <div v-if="reservasAExcluir.length > 0" style="margin-top: 16px; border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; background: var(--pill-bg); max-height: 150px; overflow-y: auto;">
          <div style="font-size: 13px; font-weight: bold; color: var(--text-color); margin-bottom: 8px;">
            Aviso: {{ reservasAExcluir.length }} agendamento(s) serão apagado(s):
          </div>
          <div v-for="res in reservasAExcluir" :key="res.id" style="font-size: 12px; color: var(--text-muted); border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 4px;">
            <strong>{{ res.recurso }}</strong> | {{ res.data.split('-').reverse().join('/') }} ({{ res.horaInicio }}) - {{ res.professor }}
          </div>
        </div>
        <div v-else-if="filtroLote.recurso || filtroLote.professor" style="margin-top: 16px; font-size: 13px; color: #ef4444;">
          Nenhum agendamento encontrado com esses filtros.
        </div>

        <div class="modal-actions" style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" @click="fecharExclusaoLote" class="btn-cancel">Cancelar</button>
          <button type="button" @click="confirmarExclusaoLote" class="btn-danger" :disabled="(!filtroLote.recurso && !filtroLote.professor) || reservasAExcluir.length === 0">Apagar Registros</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import Swal from 'sweetalert2'
import DashboardCharts from './DashboardCharts.vue'
import { useReservas } from '../composables/useReservas'
import { useAuth } from '../composables/useAuth'
import EditModal from './EditModal.vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const { reservas, carregarReservas, atualizarStatus, deletarReserva, deletarReservasLote, limparBanco, recursosExtras, carregarRecursosExtras, atualizarReserva } = useReservas()
const { user, isAdmin } = useAuth()

const reservaEmEdicao = ref(null)

const abrirEdicao = (res) => {
  reservaEmEdicao.value = { ...res }
}

const verificarConflitoHorario = (h1Inicio, h1Fim, h2Inicio, h2Fim) => {
  return (h1Inicio < h2Fim && h1Fim > h2Inicio)
}

const salvarEdicao = async (dadosNovos) => {
  const dataIso = dadosNovos.data
  const reservasValidas = reservas.value.filter(r => r.id !== dadosNovos.id)

  const choqueSala = reservasValidas.find(i => 
    i.campus === dadosNovos.campus && i.categoria === dadosNovos.categoria && i.recurso === dadosNovos.recurso &&
    i.data === dataIso && verificarConflitoHorario(dadosNovos.horaInicio, dadosNovos.horaFim, i.horaInicio, i.horaFim)
  )

  const choqueProfessor = reservasValidas.find(i => 
    i.professor === dadosNovos.professor &&
    i.data === dataIso && verificarConflitoHorario(dadosNovos.horaInicio, dadosNovos.horaFim, i.horaInicio, i.horaFim)
  )

  if (choqueSala) {
    Swal.fire('Conflito!', `O horário [${dadosNovos.horaInicio}-${dadosNovos.horaFim}] já está ocupado nesta sala por: ${choqueSala.disciplina}`, 'error')
    return
  }
  
  if (choqueProfessor) {
    Swal.fire('Conflito!', `O professor selecionado já está alocado neste horário no espaço: ${choqueProfessor.recurso}`, 'error')
    return
  }

  try {
    await atualizarReserva(dadosNovos.id, dadosNovos)
    reservaEmEdicao.value = null
    gerarRelatorio()
  } catch(e) {
    Swal.fire('Erro', 'Falha ao salvar a edição.', 'error')
  }
}

const configuracaoGlobal = reactive({
  minDate: '2026-02-23',
  maxDate: '2026-06-26'
})

const filtros = reactive({
  campus: '',
  categoria: '',
  modoData: '',
  dataInicio: '2026-02-23',
  dataFim: '2026-06-26',
  sala: '',
  professor: ''
})

onMounted(async () => {
  await carregarRecursosExtras()
  const config = recursosExtras.value.find(r => r.categoria === 'configuracao_semestre')
  if (config) {
    try {
      const parsed = JSON.parse(config.nome)
      const mesAtual = new Date().getMonth()
      const isSemestre1 = mesAtual <= 5
      
      configuracaoGlobal.minDate = parsed.sem1Inicio || '2026-02-23'
      configuracaoGlobal.maxDate = parsed.sem2Fim || '2026-12-18'
      
      filtros.dataInicio = configuracaoGlobal.minDate
      filtros.dataFim = configuracaoGlobal.maxDate
    } catch(e) {}
  }
})

const temDados = ref(false)
const mensagemVazio = ref("Escolha o Campus, Espaço e Modo de Busca para gerar o relatório.")
const colunasFixas = ref([])
const linhasTabela = ref([])
const diaSelecionado = ref(null)

const countCat = reactive({ metodologias: 0, informatica: 0, salas: 0, notebooks: 0, videoconf: 0 })
const countStatus = reactive({ usado: 0, noshow: 0, pendente: 0 })

const mesAbreviado = (mesNum) => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return meses[parseInt(mesNum, 10) - 1] || '';
}

const mesFiltroSelecionado = ref(null)

const mesesDisponiveis = computed(() => {
  if (!linhasTabela.value.length) return []
  const mapMeses = new Map()
  linhasTabela.value.forEach(l => {
    const mesStr = l.dataIso.substring(0, 7) // "YYYY-MM"
    if (!mapMeses.has(mesStr)) {
      const parts = l.dataBr.split('/')
      mapMeses.set(mesStr, `${mesAbreviado(parts[1])} ${parts[2]}`)
    }
  })
  return Array.from(mapMeses.entries()).map(([valor, rotulo]) => ({ valor, rotulo }))
})

const linhasFiltradasPorMes = computed(() => {
  if (!mesFiltroSelecionado.value) return linhasTabela.value
  return linhasTabela.value.filter(l => l.dataIso.startsWith(mesFiltroSelecionado.value))
})

// Sempre que o mês selecionado mudar, se houver datas, selecionar a primeira do mês
watch(mesFiltroSelecionado, (novoMes) => {
  if (novoMes) {
    const primeiraLinha = linhasTabela.value.find(l => l.dataIso.startsWith(novoMes))
    if (primeiraLinha) diaSelecionado.value = primeiraLinha.dataIso
  }
})

const diasSemanaTexto = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const coresEstiloMap = {
  "metodologias": { fundo: "#f8fafc", borda: "#1e3a8a" },
  "informatica": { fundo: "#f0fdfa", borda: "#0d9488" },
  "salas": { fundo: "#faf5ff", borda: "#7c3aed" },
  "notebooks": { fundo: "#fff7ed", borda: "#ea580c" },
  "videoconf": { fundo: "#fff1f2", borda: "#e11d48" }
}

const getCorFundoFull = (recursoNome) => {
  if (filtros.categoria === 'metodologias' && recursoNome) {
    const nome = recursoNome.toUpperCase()
    let bg = null
    let cor = '#ffffff'
    
    if (nome.includes('AZUL ESCURO')) bg = '#1e3a8a'
    else if (nome.includes('AZUL CLARO')) bg = '#3b82f6'
    else if (nome.includes('AMARELA')) { bg = '#fde047'; cor = '#854d0e' }
    else if (nome.includes('LARANJA')) { bg = '#fed7aa'; cor = '#c2410c' }
    else if (nome.includes('ROXA')) bg = '#a855f7'
    else if (nome.includes('VERDE')) bg = '#22c55e'
    
    if (bg) {
      return { 
        backgroundColor: bg, 
        color: cor, 
        padding: '12px 16px',
        fontWeight: 'bold',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }
    }
  }
  // Fallback para outras categorias
  return { 
    backgroundColor: estiloCores.value.fundo, 
    color: estiloCores.value.borda, 
    padding: '12px 16px',
    borderTop: '4px solid ' + estiloCores.value.borda,
    fontWeight: 'bold',
    borderBottom: '1px solid var(--border-color)'
  }
}

const estiloCores = computed(() => {
  return coresEstiloMap[filtros.categoria] || coresEstiloMap["metodologias"]
})

watch(linhasTabela, (novasLinhas) => {
  if (novasLinhas.length > 0) {
    if (!diaSelecionado.value || !novasLinhas.find(l => l.dataIso === diaSelecionado.value)) {
      diaSelecionado.value = novasLinhas[0].dataIso
    }
  } else {
    diaSelecionado.value = null
  }
}, { deep: true, immediate: true })

const totalEventos = (linha) => {
  let count = 0;
  for(let col in linha.recursos) {
    count += linha.recursos[col].length
  }
  return count;
}

const statusTexto = (status) => {
  return status === 'usado' ? 'Utilizado' : status === 'noshow' ? 'Não Usou' : 'Reservado'
}

const statusClass = (status) => {
  return status === 'usado' ? 'status-usado' : status === 'noshow' ? 'status-noshow' : 'status-pendente'
}

const statusBgColor = (status) => {
  if (status === 'usado') return '#10b981'
  if (status === 'noshow') return '#ef4444'
  return '#f59e0b'
}

const obterListaRecursosDisponiveis = (campus, categoria) => {
  const blocosConfig = {
    "Araras": ["Bloco A", "Bloco B", "Bloco C"],
    "SBO": ["Bloco 1", "Bloco 2", "Bloco 3"]
  }
  let lista = []
  if (!campus || !categoria) return []
  const blocos = blocosConfig[campus]
  if (categoria === 'informatica') {
    blocos.forEach(b => { lista.push(`${b} - Lab 1`, `${b} - Lab 2`, `${b} - Lab 3`) })
  } else if (categoria === 'salas') {
    blocos.forEach(b => { lista.push(`${b} - Sala 1`, `${b} - Sala 2`, `${b} - Sala 3`) })
  } else if (categoria === 'videoconf') {
    lista = ["Camera"]
  }

  const extras = recursosExtras.value
    .filter(r => r.campus === campus && r.categoria === categoria)
    .map(r => r.nome)
  lista.push(...extras)

  return lista
}

const alternarModoFiltroData = () => {
  if (filtros.modoData === 'periodo') {
    filtros.dataFim = configuracaoGlobal.maxDate
  }
  gerarRelatorio()
}

const gerarRelatorio = async () => {
  await carregarReservas()
  await carregarRecursosExtras()

  if (!filtros.campus || !filtros.categoria || !filtros.modoData) {
    temDados.value = false
    mensagemVazio.value = "Escolha o Campus, Espaço e Modo de Busca para gerar o relatório."
    return
  }

  let dataFimFiltro = filtros.modoData === 'individual' ? filtros.dataInicio : filtros.dataFim

  let colunas = obterListaRecursosDisponiveis(filtros.campus, filtros.categoria)
  if (filtros.sala) {
    colunas = colunas.filter(c => c.toLowerCase().includes(filtros.sala.toLowerCase()))
  }
  colunasFixas.value = colunas

  Object.keys(countCat).forEach(k => countCat[k] = 0)
  Object.keys(countStatus).forEach(k => countStatus[k] = 0)
  
  const mapa = {}
  let totalEncontrados = 0

  reservas.value.forEach(item => {
    if (item.campus === filtros.campus) {
      countCat[item.categoria]++
      if (item.categoria === filtros.categoria) countStatus[item.status]++
    }
    if (item.campus === filtros.campus && item.categoria === filtros.categoria && item.data >= filtros.dataInicio && item.data <= dataFimFiltro) {
      if (filtros.sala && (!item.recurso || !item.recurso.toLowerCase().includes(filtros.sala.toLowerCase()))) return
      if (filtros.professor && (!item.professor || !item.professor.toLowerCase().includes(filtros.professor.toLowerCase()))) return
      
      if (!mapa[item.data]) mapa[item.data] = {}
      if (!mapa[item.data][item.recurso]) mapa[item.data][item.recurso] = []
      mapa[item.data][item.recurso].push(item)
      totalEncontrados++
    }
  })

  if (totalEncontrados === 0) {
    temDados.value = false
    mensagemVazio.value = "Nenhuma reserva encontrada para os filtros selecionados neste período."
    return
  }

  temDados.value = true
  linhasTabela.value = []

  for (let dataIso in mapa) {
      const dataObj = new Date(dataIso + 'T12:00:00')
      const diaSemanaNum = dataObj.getDay()
      const dataBr = dataIso.split('-').reverse().join('/')
      
      Object.keys(mapa[dataIso]).forEach(rec => {
        mapa[dataIso][rec].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
      })

      linhasTabela.value.push({
        dataIso,
        dataBr,
        diaSemana: diasSemanaTexto[diaSemanaNum],
        recursos: mapa[dataIso]
      })
  }

  linhasTabela.value.sort((a, b) => a.dataIso.localeCompare(b.dataIso))
  
  // Seleciona o primeiro mês disponível automaticamente
  if (mesesDisponiveis.value.length > 0) {
    mesFiltroSelecionado.value = mesesDisponiveis.value[0].valor
  } else {
    mesFiltroSelecionado.value = null
  }
}

const mudarStatus = async (id, novoStatus) => {
  await atualizarStatus(id, novoStatus)
  gerarRelatorio()
}

const remover = async (id) => {
  const result = await Swal.fire({
    title: 'Confirmar exclusão?',
    text: "Você não poderá reverter isso!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, deletar!'
  })
  
  if (result.isConfirmed) {
    await deletarReserva(id)
    gerarRelatorio()
  }
}

const confirmarLimpeza = async () => {
  const result = await Swal.fire({
    title: 'Limpar tudo?',
    text: "Isso removerá todas as reservas permanentemente.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Confirmar'
  })
  
  if (result.isConfirmed) {
    await limparBanco()
    gerarRelatorio()
  }
}

const exibindoModalLote = ref(false)
const filtroLote = reactive({
  recurso: '',
  professor: '',
  dataInicio: '',
  dataFim: '',
  horaInicio: '',
  horaFim: '',
  diasSemana: []
})

const reservasAExcluir = computed(() => {
  if (!filtroLote.recurso && !filtroLote.professor) return []
  return reservas.value.filter(item => {
    if (filtroLote.recurso && (!item.recurso || item.recurso.toLowerCase() !== filtroLote.recurso.toLowerCase())) return false
    if (filtroLote.professor && (!item.professor || !item.professor.toLowerCase().includes(filtroLote.professor.toLowerCase()))) return false
    if (filtroLote.dataInicio && item.dataIso < filtroLote.dataInicio) return false
    if (filtroLote.dataFim && item.dataIso > filtroLote.dataFim) return false
    if (filtroLote.horaInicio && item.horaInicio < filtroLote.horaInicio) return false
    if (filtroLote.horaFim && item.horaFim > filtroLote.horaFim) return false
    if (filtroLote.diasSemana && filtroLote.diasSemana.length > 0) {
      const dataObj = new Date(item.dataIso + 'T12:00:00')
      const dia = dataObj.getDay().toString()
      if (!filtroLote.diasSemana.includes(dia)) return false
    }
    return true
  })
})

const abrirExclusaoLote = () => {
  filtroLote.recurso = ''
  filtroLote.professor = ''
  filtroLote.dataInicio = ''
  filtroLote.dataFim = ''
  filtroLote.horaInicio = ''
  filtroLote.horaFim = ''
  filtroLote.diasSemana = []
  exibindoModalLote.value = true
}

const fecharExclusaoLote = () => {
  exibindoModalLote.value = false
}

const confirmarExclusaoLote = async () => {
  if (!filtroLote.recurso && !filtroLote.professor) return
  if (reservasAExcluir.value.length === 0) return

  const result = await Swal.fire({
    title: 'Apagar agendamentos?',
    text: `Deseja realmente apagar ${reservasAExcluir.value.length} agendamento(s) que correspondem aos filtros? Esta ação é irreversível.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, apagar!'
  })
  
  if (result.isConfirmed) {
    try {
      const deletados = await deletarReservasLote({...filtroLote})
      Swal.fire('Deletado!', `${deletados} agendamento(s) apagado(s) com sucesso.`, 'success')
      exibindoModalLote.value = false
      gerarRelatorio()
    } catch (e) {
      Swal.fire('Atenção', e.message || 'Falha ao excluir em lote.', 'warning')
    }
  }
}

const exportarExcel = async () => {
  if (reservas.value.length === 0) {
    Swal.fire('Atenção', 'Sem dados para exportar.', 'info')
    return
  }
  
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Plataforma Unificada'
  workbook.created = new Date()
  
  const sheet = workbook.addWorksheet('Relatório de Reservas', {
    views: [{ state: 'frozen', ySplit: 1 }]
  })
  
  sheet.columns = [
    { header: 'Campus', key: 'campus', width: 15 },
    { header: 'Categoria', key: 'categoria', width: 25 },
    { header: 'Recurso', key: 'recurso', width: 25 },
    { header: 'Data', key: 'data', width: 15 },
    { header: 'Início', key: 'horaInicio', width: 12 },
    { header: 'Fim', key: 'horaFim', width: 12 },
    { header: 'Disciplina / Evento', key: 'disciplina', width: 40 },
    { header: 'Professor', key: 'professor', width: 30 },
    { header: 'Curso', key: 'curso', width: 25 },
    { header: 'Observação', key: 'observacao', width: 45 },
    { header: 'Status', key: 'status', width: 18 }
  ]
  
  // Estilizar Cabeçalho
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

  reservas.value.forEach(d => {
    const dataBr = d.data.split('-').reverse().join('/')
    const statusLabel = statusTexto(d.status)
    
    const row = sheet.addRow({
      campus: d.campus,
      categoria: d.categoria,
      recurso: d.recurso,
      data: dataBr,
      horaInicio: d.horaInicio,
      horaFim: d.horaFim,
      disciplina: d.disciplina,
      professor: d.professor,
      curso: d.curso,
      observacao: d.observacao || '-',
      status: statusLabel
    })
    
    row.alignment = { vertical: 'middle', horizontal: 'left' }
    row.getCell('data').alignment = { horizontal: 'center' }
    row.getCell('horaInicio').alignment = { horizontal: 'center' }
    row.getCell('horaFim').alignment = { horizontal: 'center' }
    row.getCell('status').alignment = { horizontal: 'center' }

    // Colorir célula do Recurso conforme a sala
    const recursoCell = row.getCell('recurso')
    const recUpper = d.recurso.toUpperCase()
    let corFundo = null
    let corTexto = 'FF000000' // Preto
    
    if (recUpper.includes('AZUL ESCURO')) { corFundo = 'FF1E40AF'; corTexto = 'FFFFFFFF' }
    else if (recUpper.includes('AZUL CLARO')) { corFundo = 'FF7DD3FC' }
    else if (recUpper.includes('AMARELA')) { corFundo = 'FFFDE047' }
    else if (recUpper.includes('LARANJA')) { corFundo = 'FFF97316'; corTexto = 'FFFFFFFF' }
    else if (recUpper.includes('ROXA')) { corFundo = 'FF9333EA'; corTexto = 'FFFFFFFF' }
    else if (recUpper.includes('VERDE')) { corFundo = 'FF22C55E'; corTexto = 'FFFFFFFF' }
    
    if (corFundo) {
      recursoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: corFundo } }
      recursoCell.font = { color: { argb: corTexto }, bold: true }
    }

    const statusCell = row.getCell('status')
    if(d.status === 'usado') statusCell.font = { color: { argb: 'FF15803D' }, bold: true }
    if(d.status === 'noshow') statusCell.font = { color: { argb: 'FFB91C1C' }, bold: true }
    if(d.status === 'pendente') statusCell.font = { color: { argb: 'FFB45309' }, bold: true }
  })
  
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, 'Relatorio_Cronograma_Recursos.xlsx')
}

const exportarPDF = () => {
  window.print()
}
</script>

<style scoped>
@keyframes modalFadeIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(4px); }
}

@keyframes modalSlideUp {
  from { transform: translateY(30px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.modal-content {
  background: var(--card-bg);
  padding: 32px;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
  animation: modalSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  backdrop-filter: var(--card-blur);
  max-height: 90vh;
  overflow-y: auto;
}
</style>
