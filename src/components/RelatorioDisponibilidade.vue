<template>
  <div class="agendamento-container">
    <div class="platform-header" style="margin-bottom: 24px;">
      <div>
        <h2>Relatório de Disponibilidade de Salas</h2>
        <p class="text-muted">Consulte quais dias as salas e laboratórios estão totalmente livres.</p>
      </div>
    </div>

    <!-- Filtros e Resultados lado a lado -->
    <div class="relatorio-layout">
      <!-- Sidebar de Filtros -->
      <div class="relatorio-sidebar">
        <div class="card sticky-card" style="padding: 24px;">
          <div class="section-header" style="margin-bottom: 16px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path></svg>
            <h3 style="margin: 0;">Filtros</h3>
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>
              <label class="filtro-label">Mês de Consulta</label>
              <select v-model="mesSelecionado" required class="filtro-select">
                <option v-for="(nome, index) in nomesMeses" :key="index" :value="index.toString()">{{ nome }} {{ anoBase }}</option>
              </select>
            </div>

            <div>
              <label class="filtro-label">Dias da Semana</label>
              <div class="dias-semana-grid">
                <label v-for="d in diasSemanaOpcoes" :key="d.value" class="dia-check" :class="{ 'dia-check-active': diasSemanaFiltro.includes(d.value) }">
                  <input type="checkbox" :value="d.value" v-model="diasSemanaFiltro" style="display: none;">
                  <span class="dia-check-indicator">
                    <svg v-if="diasSemanaFiltro.includes(d.value)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                  <span>{{ d.short }}</span>
                </label>
              </div>
            </div>

            <button @click="gerarRelatorio" class="btn-submit" style="width: 100%; margin-top: 4px;" :disabled="gerando">
              {{ gerando ? 'Analisando...' : 'Gerar Relatório' }}
            </button>
          </div>

          <!-- Resumo após gerar -->
          <div v-if="relatorioGerado" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color);">
            <div style="font-size: 12px; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Salas analisadas:</span>
                <strong style="color: var(--text-color);">{{ totalSalas }}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Dias no período:</span>
                <strong style="color: var(--text-color);">{{ totalDiasPeriodo }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área Principal de Resultados -->
      <div class="relatorio-main">
        <!-- Estado inicial -->
        <div v-if="!relatorioGerado" class="card section-card" style="text-align: center; padding: 60px 24px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; display: block; opacity: 0.5;">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h4 style="margin: 0 0 8px 0; color: var(--text-color);">Nenhum relatório gerado</h4>
          <p style="margin: 0; color: var(--text-muted); font-size: 14px;">Selecione o mês e os dias desejados nos filtros ao lado e clique em <strong>Gerar Relatório</strong>.</p>
        </div>

        <!-- Resultados -->
        <div v-if="relatorioGerado && salasComReservas.length > 0">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
              <h3 style="margin: 0 0 4px 0; color: var(--primary-color);">{{ nomesMeses[parseInt(mesSelecionado)] }} de {{ anoBase }}</h3>
              <p style="margin: 0; color: var(--text-muted); font-size: 13px;">Dias totalmente livres por sala</p>
            </div>
            <button @click="imprimirRelatorio" class="btn-cadastrar-recurso" style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 13px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Imprimir
            </button>
          </div>

          <div id="area-impressao" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px;">
            <div v-for="sala in salasComReservas" :key="sala.nome" style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; page-break-inside: avoid;">
              <!-- Cabeçalho da sala com cor -->
              <div :style="{ backgroundColor: getCorRecurso(sala.nome).bg, color: getCorRecurso(sala.nome).text, padding: '10px 16px', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }">
                <span>{{ formatarNomeRecurso(sala.nome) }}</span>
                <span style="font-size: 12px; opacity: 0.85;">{{ sala.diasLivres.length }} dia(s) livre(s)</span>
              </div>
              <!-- Corpo -->
              <div style="padding: 16px; background: var(--card-bg);">
                <div v-if="sala.diasLivres.length === 0" style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 8px 0;">
                  Nenhum dia livre neste mês.
                </div>
                <div v-else style="display: flex; flex-wrap: wrap; gap: 6px;">
                  <span v-for="(item, idx) in sala.diasLivres" :key="idx" class="date-pill">
                    <strong>{{ item.dia }}</strong>
                    <span class="date-pill-weekday">{{ item.diaSemana }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="relatorioGerado && salasComReservas.length === 0" class="card section-card" style="text-align: center; padding: 40px 24px; color: var(--text-muted);">
          <p style="font-size: 15px; margin: 0;">Nenhuma sala com reservas encontrada no sistema.<br>Somente salas que possuem pelo menos uma reserva no banco de dados serão exibidas.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useReservas } from '../composables/useReservas'

const { carregarReservas } = useReservas()

const anoBase = 2026
const mesSelecionado = ref('0')
const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const diasSemanaOpcoes = [
  { value: '1', label: 'Segunda-feira', short: 'Seg' },
  { value: '2', label: 'Terça-feira', short: 'Ter' },
  { value: '3', label: 'Quarta-feira', short: 'Qua' },
  { value: '4', label: 'Quinta-feira', short: 'Qui' },
  { value: '5', label: 'Sexta-feira', short: 'Sex' },
  { value: '6', label: 'Sábado', short: 'Sáb' },
  { value: '0', label: 'Domingo', short: 'Dom' }
]
const diasSemanaFiltro = ref(['1', '2', '3', '4', '5', '6'])

const feriadosIso = ref([])
const reservas = ref([])

const gerando = ref(false)
const relatorioGerado = ref(false)
const salasComReservas = ref([]) // [{ nome: 'Sala X', diasLivres: [{dia: '10/08', diaSemana: 'Seg'}] }]
const totalSalas = ref(0)
const totalDiasPeriodo = ref(0)

onMounted(async () => {
  const { data: recData } = await supabase.from('recursos_extras').select('*')
  const recursosExtras = recData || []
  
  const config = recursosExtras.find(r => r.categoria === 'configuracao_semestre')
  if (config) {
    try {
      const parsed = JSON.parse(config.nome)
      if (parsed.feriados) {
        feriadosIso.value = parsed.feriados.split(',').map(f => f.trim()).filter(f => f.length === 10)
      }
    } catch(e) {}
  }
  
  // Define o mês atual como padrão
  const dataAtual = new Date()
  if (dataAtual.getFullYear() === anoBase) {
    mesSelecionado.value = dataAtual.getMonth().toString()
  }
})

const formatarNomeRecurso = (nome) => {
  if (!nome) return ''
  return nome.replace(/\s*-\s*HEX:#[0-9A-Fa-f]{6}$/i, '').trim()
}

const getCorRecurso = (recurso) => {
  if (!recurso) return { bg: '#6366f1', text: '#ffffff' }
  const hexMatch = recurso.match(/- HEX:(#[0-9A-Fa-f]{6})$/i)
  if (hexMatch) {
    const hex = hexMatch[1]
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const textColor = luminance > 0.5 ? '#000000' : '#ffffff'
    return { bg: hex, text: textColor }
  }

  const recUpper = recurso.toUpperCase()
  if (recUpper.includes('AZUL ESC')) return { bg: '#1E40AF', text: '#ffffff' }
  if (recUpper.includes('AZUL CLR') || recUpper.includes('AZUL CLARO')) return { bg: '#7DD3FC', text: '#000000' }
  if (recUpper.includes('AMARELA')) return { bg: '#FDE047', text: '#000000' }
  if (recUpper.includes('LARANJA')) return { bg: '#F97316', text: '#ffffff' }
  if (recUpper.includes('ROXA')) return { bg: '#9333EA', text: '#ffffff' }
  if (recUpper.includes('VERDE')) return { bg: '#22C55E', text: '#ffffff' }
  return { bg: '#6366f1', text: '#ffffff' }
}

const gerarRelatorio = async () => {
  if (!mesSelecionado.value) return
  gerando.value = true
  relatorioGerado.value = false
  
  const mes = parseInt(mesSelecionado.value)
  const dataInicioStr = `${anoBase}-${String(mes + 1).padStart(2, '0')}-01`
  const totalDiasMes = new Date(anoBase, mes + 1, 0).getDate()
  const dataFimStr = `${anoBase}-${String(mes + 1).padStart(2, '0')}-${totalDiasMes}`
  
  // 1. Carregar reservas do mês selecionado
  reservas.value = await carregarReservas(dataInicioStr, dataFimStr)
  
  // 2. Buscar TODAS as reservas do ano para descobrir quais salas realmente existem no banco
  const todasReservasAno = await carregarReservas(`${anoBase}-01-01`, `${anoBase}-12-31`)
  
  // 3. Extrair salas REAIS: apenas aquelas que possuem ao menos uma reserva no banco
  const salasReaisSet = new Set()
  todasReservasAno.forEach(r => {
    if (r.recurso && !r.recurso.toLowerCase().includes('microfone')) {
      salasReaisSet.add(r.recurso)
    }
  })
  const salasReais = Array.from(salasReaisSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
  
  // 4. Criar array de datas do mês filtradas
  const datasPeriodo = []
  let dtAtual = new Date(dataInicioStr + 'T12:00:00')
  const dtFim = new Date(dataFimStr + 'T12:00:00')
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  while (dtAtual <= dtFim) {
    const iso = dtAtual.toISOString().split('T')[0]
    const diaSem = dtAtual.getDay().toString()
    
    if (!feriadosIso.value.includes(iso) && diasSemanaFiltro.value.includes(diaSem)) {
      datasPeriodo.push({
        iso,
        dia: `${String(dtAtual.getDate()).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}`,
        diaSemana: diasSemana[dtAtual.getDay()]
      })
    }
    dtAtual.setDate(dtAtual.getDate() + 1)
  }

  totalDiasPeriodo.value = datasPeriodo.length

  // 5. Pré-processar ocupações do mês por dia e sala
  const ocupacoesPorDia = {}
  reservas.value.forEach(r => {
    const dataIso = r.dataIso || r.data
    if (!ocupacoesPorDia[dataIso]) {
      ocupacoesPorDia[dataIso] = new Set()
    }
    ocupacoesPorDia[dataIso].add(r.recurso)
  })

  // 6. Montar resultado
  const resultado = []
  salasReais.forEach(sala => {
    const diasLivres = []
    datasPeriodo.forEach(d => {
      const ocupadasHoje = ocupacoesPorDia[d.iso] || new Set()
      if (!ocupadasHoje.has(sala)) {
        diasLivres.push({ dia: d.dia, diaSemana: d.diaSemana })
      }
    })
    resultado.push({ nome: sala, diasLivres })
  })

  salasComReservas.value = resultado
  totalSalas.value = salasReais.length
  gerando.value = false
  relatorioGerado.value = true
}

const imprimirRelatorio = () => {
  const printContents = document.getElementById('area-impressao').innerHTML
  const originalContents = document.body.innerHTML
  
  const printStyle = `
    <style>
      body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
      h2 { color: #333; margin-bottom: 4px; }
      p { color: #666; }
      @media print {
        @page { margin: 1cm; }
      }
    </style>
  `
  
  document.body.innerHTML = `
    ${printStyle}
    <h2>Relatório de Disponibilidade de Salas</h2>
    <p>Período: ${nomesMeses[parseInt(mesSelecionado.value)]} de ${anoBase}</p>
    ${printContents}
  `
  
  window.print()
  
  document.body.innerHTML = originalContents
  window.location.reload()
}
</script>

<style scoped>
.relatorio-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.relatorio-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.relatorio-main {
  flex: 1;
  min-width: 0;
}

.date-pill {
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-color);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.date-pill:hover {
  background: var(--pill-bg);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.date-pill-weekday {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
}

.alert-info {
  background: var(--pill-bg);
  border: 1px solid var(--border-color);
  padding: 16px;
  border-radius: 8px;
  color: var(--text-color);
}

/* Responsive */
@media (max-width: 768px) {
  .relatorio-layout {
    flex-direction: column;
  }
  .relatorio-sidebar {
    width: 100%;
  }
}

/* Filter labels */
.filtro-label {
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  display: block;
  color: var(--text-muted);
}

.filtro-select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.filtro-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

/* Days of week grid */
.dias-semana-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.dia-check {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.15s ease;
  user-select: none;
}
.dia-check:hover {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.04);
}
.dia-check-active {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.08);
  color: var(--primary-color);
  font-weight: 600;
}

.dia-check-indicator {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.dia-check-active .dia-check-indicator {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}
</style>
