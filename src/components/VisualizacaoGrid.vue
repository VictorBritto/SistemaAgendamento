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
        
        <div v-if="linhasTabela.length > 1" class="day-pills-container">
          <button 
            v-for="linha in linhasTabela" 
            :key="'pill-'+linha.dataIso"
            class="day-pill"
            :class="{ active: diaSelecionado === linha.dataIso }"
            @click="diaSelecionado = linha.dataIso"
          >
            <strong>{{ linha.dataBr }}</strong>
            <span>{{ linha.diaSemana }}</span>
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

const { reservas, carregarReservas, atualizarStatus, deletarReserva, limparBanco, recursosExtras, carregarRecursosExtras, atualizarReserva } = useReservas()
const { user, isAdmin } = useAuth()

const reservaEmEdicao = ref(null)

const abrirEdicao = (res) => {
  reservaEmEdicao.value = { ...res }
}

const salvarEdicao = async (dadosNovos) => {
  await atualizarReserva(dadosNovos.id, dadosNovos)
  reservaEmEdicao.value = null
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
  const labsMetodologiaFixos = [
    "SL 01 - AZUL ESCURO", "SL 02 - AMARELA", "SL 03 - AZUL CLARO", "SL 04 - LARANJA",
    "SL 05 - ROXA", "SL 06 - VERDE", "SL 07 - AZUL ESCURO", "SL 08 - AMARELA",
    "SL 09 - AZUL CLARO", "SL 10 - LARANJA", "SL 11 - ROXA", "SL 12 - VERDE"
  ]
  let lista = []
  if (!campus || !categoria) return []
  const blocos = blocosConfig[campus]
  if (categoria === 'metodologias') return labsMetodologiaFixos
  if (categoria === 'informatica') {
    blocos.forEach(b => { lista.push(`${b} - Lab 1`, `${b} - Lab 2`, `${b} - Lab 3`) })
  } else if (categoria === 'salas') {
    blocos.forEach(b => { lista.push(`${b} - Sala 1`, `${b} - Sala 2`, `${b} - Sala 3`) })
  } else if (categoria === 'videoconf') {
    lista = ["Camera"]
  }

  if (categoria === 'informatica' || categoria === 'salas') {
    const extras = recursosExtras.value
      .filter(r => r.campus === campus && r.categoria === categoria)
      .map(r => r.nome)
    lista.push(...extras)
  }

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
      if (filtros.sala && !item.recurso.toLowerCase().includes(filtros.sala.toLowerCase())) return
      if (filtros.professor && !item.professor.toLowerCase().includes(filtros.professor.toLowerCase())) return
      
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
