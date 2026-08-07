<template>
  <div class="print-report-container">
    <div class="print-header">
      <h2>Relatório de Agendamentos por Lote</h2>
      <p>Gerado em: {{ new Date().toLocaleDateString('pt-BR') }}</p>
    </div>
    
    <template v-for="(lote, index) in lotesProcessados" :key="index">
      <div v-if="index > 0" class="html2pdf__page-break"></div>

      <div class="lote-row">
        <!-- Left Card -->
        <div class="lote-card">
          <div class="card-header" :style="{ background: getCorFundo(lote.recurso), color: getCorTexto(lote.recurso) }">
            <span class="room-name">{{ formatarNomeRecurso(lote.recurso) }}</span>
            <span class="badge-status">RESERVADO</span>
          </div>
          <div class="card-body">
            <div class="time-badge">{{ lote.horaInicio }} - {{ lote.horaFim }}</div>
            <div class="disciplina">{{ lote.disciplina }}</div>
            <div class="curso">{{ lote.curso }}</div>
            <div class="prof">{{ lote.professor }}</div>
          </div>
        </div>

        <!-- Right side: Calendars -->
        <div class="calendars-wrapper">
          <div v-for="mes in lote.mesesCalendario" :key="mes.chave" class="mini-calendar">
            <div class="month-name">{{ mes.nomeCompleto }}</div>
            <table class="days-table">
              <thead>
                <tr>
                  <th>D</th><th>S</th><th>T</th><th>Q</th><th>Q</th><th>S</th><th>S</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(semana, si) in mes.semanas" :key="si">
                  <td
                    v-for="(dia, di) in semana"
                    :key="di"
                    :class="dia && dia.isOccupied ? 'occupied' : ''"
                    :style="dia && dia.isOccupied ? { background: getCorFundo(lote.recurso), color: getCorTexto(lote.recurso) } : {}"
                  >{{ dia ? dia.numero : '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div style="clear:both"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  reservas: {
    type: Array,
    required: true
  }
})

const getCorFundo = (recurso) => {
  if (!recurso) return '#4f46e5'
  const r = recurso.toUpperCase()
  const m = recurso.match(/HEX:#([0-9A-Fa-f]{6})/i)
  if (m) return `#${m[1]}`
  if (r.includes('AZUL ESC')) return '#1E40AF'
  if (r.includes('AZUL CLR') || r.includes('AZUL CLARO')) return '#7DD3FC'
  if (r.includes('AMARELA')) return '#FDE047'
  if (r.includes('LARANJA')) return '#F97316'
  if (r.includes('ROXA')) return '#9333EA'
  if (r.includes('VERDE')) return '#22C55E'
  if (r.includes('VERMELHA') || r.includes('VERMELHO')) return '#EF4444'
  return '#4f46e5'
}

const getCorTexto = (recurso) => {
  const bg = getCorFundo(recurso)
  const claro = ['#FDE047', '#7DD3FC']
  return claro.includes(bg) ? '#000000' : '#ffffff'
}

const formatarNomeRecurso = (nome) => {
  if (!nome) return ''
  return nome.replace(/HEX:#[0-9A-Fa-f]{6}/gi, '').trim()
}

const nomeMeses = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const buildSemanas = (primeiroDia, dias) => {
  const cells = []
  for (let i = 0; i < primeiroDia; i++) cells.push(null)
  cells.push(...dias)
  while (cells.length % 7 !== 0) cells.push(null)
  const semanas = []
  for (let i = 0; i < cells.length; i += 7) semanas.push(cells.slice(i, i + 7))
  return semanas
}

const lotesProcessados = computed(() => {
  if (!props.reservas || !props.reservas.length) return []
  
  const lotesMap = new Map()
  props.reservas.forEach(r => {
    const key = `${r.recurso}|${r.disciplina}|${r.professor}|${r.horaInicio}|${r.horaFim}|${r.curso}`
    if (!lotesMap.has(key)) {
      lotesMap.set(key, {
        recurso: r.recurso,
        disciplina: r.disciplina,
        professor: r.professor,
        curso: r.curso,
        horaInicio: r.horaInicio,
        horaFim: r.horaFim,
        datas: new Set()
      })
    }
    if (r.data) lotesMap.get(key).datas.add(r.data)
  })
  
  const result = []
  for (const lote of lotesMap.values()) {
    const datasArray = Array.from(lote.datas).sort()
    if (!datasArray.length) continue
    
    const inicio = new Date(datasArray[0] + 'T12:00:00')
    const fim = new Date(datasArray[datasArray.length - 1] + 'T12:00:00')
    
    const mesesCalendario = []
    let cur = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
    const limFim = new Date(fim.getFullYear(), fim.getMonth(), 1)
    
    while (cur <= limFim) {
      const ano = cur.getFullYear()
      const mes = cur.getMonth()
      const totalDias = new Date(ano, mes + 1, 0).getDate()
      const primeiroDia = new Date(ano, mes, 1).getDay()
      const chave = `${ano}-${String(mes + 1).padStart(2, '0')}`
      
      const dias = []
      let hasEvents = false
      for (let d = 1; d <= totalDias; d++) {
        const iso = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        const isOccupied = lote.datas.has(iso)
        if (isOccupied) hasEvents = true
        dias.push({ iso, numero: d, isOccupied })
      }
      
      if (hasEvents) {
        mesesCalendario.push({
          chave,
          nomeCompleto: `${nomeMeses[mes]} ${ano}`,
          semanas: buildSemanas(primeiroDia, dias)
        })
      }
      cur = new Date(ano, mes + 1, 1)
    }
    
    lote.mesesCalendario = mesesCalendario
    result.push(lote)
  }
  
  return result.sort((a, b) => {
    const resA = a.recurso || ''
    const resB = b.recurso || ''
    if (resA !== resB) return resA.localeCompare(resB)
    return (a.disciplina || '').localeCompare(b.disciplina || '')
  })
})
</script>

<style scoped>
.print-report-container {
  font-family: Arial, sans-serif;
  padding: 20px;
  background: #fff;
  color: #1e293b;
}

.print-header {
  text-align: center;
  margin-bottom: 24px;
  padding: 14px;
  background: #f1f5f9;
  border-radius: 10px;
}
.print-header h2 {
  margin: 0 0 4px 0;
  color: #0f172a;
  font-weight: 800;
  font-size: 20px;
}
.print-header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.lote-row {
  width: 100%;
  margin-bottom: 28px;
}

.lote-card {
  float: left;
  width: 240px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}
.card-header {
  padding: 10px 14px;
  font-weight: 700;
  font-size: 13px;
  overflow: hidden;
}
.room-name {
  float: left;
}
.badge-status {
  float: right;
  background: rgba(255,255,255,0.25);
  padding: 3px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}
.card-body {
  padding: 12px 14px;
}
.time-badge {
  display: inline-block;
  background: #eef2ff;
  color: #4338ca;
  font-weight: 700;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 10px;
  border: 1px solid #e0e7ff;
}
.disciplina {
  font-weight: 700;
  font-size: 13px;
  color: #0f172a;
  margin-bottom: 6px;
}
.curso {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}
.prof {
  font-size: 11px;
  color: #64748b;
}

.calendars-wrapper {
  margin-left: 260px;
}

.mini-calendar {
  display: inline-block;
  vertical-align: top;
  margin-right: 12px;
  margin-bottom: 12px;
  width: 155px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}
.month-name {
  text-align: center;
  font-weight: 700;
  font-size: 11px;
  color: #334155;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e2e8f0;
}

.days-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.days-table th {
  text-align: center;
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
  padding: 2px 0;
}
.days-table td {
  text-align: center;
  font-size: 10px;
  color: #64748b;
  padding: 2px 0;
  border-radius: 3px;
  height: 18px;
}
.days-table td.occupied {
  font-weight: 700;
  border-radius: 4px;
}
</style>
