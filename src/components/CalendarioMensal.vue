<template>
  <div class="agendamento-container">
    <div class="platform-header" style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px; margin-bottom: 24px;">
      <div>
        <h2>Calendário de Ocupação Anual</h2>
        <p class="text-muted">Datas coloridas = ocupadas. Vermelho = feriado. Branco = vaga disponível.</p>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
        <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 16px; height: 16px; background: #6366f1; border-radius: 4px;"></span> Ocupado</div>
        <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 16px; height: 16px; background: #ef4444; border-radius: 4px;"></span> Feriado</div>
        <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 16px; height: 16px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 4px;"></span> Vaga</div>
      </div>
    </div>

    <div v-if="carregando" style="text-align: center; padding: 40px; color: var(--text-muted);">
      Carregando calendário...
    </div>

    <div v-else class="calendar-grid">
      <!-- Grade de Meses -->
      <div v-for="mes in mesesDoAno" :key="mes.mes" class="card calendar-month">
        <h4 style="text-align: center; color: var(--primary-color); margin-bottom: 16px;">{{ mes.nome }} {{ anoBase }}</h4>
        
        <div class="weekdays">
          <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
        </div>
        
        <div class="days-grid">
          <div v-for="empty in mes.diaSemanaPrimeiroDia" :key="'empty'+empty" class="day empty"></div>
          
          <div v-for="dia in mes.totalDias" :key="dia" 
               class="day"
               :class="getClassParaDia(mes.mes, dia)"
               :title="getTooltipParaDia(mes.mes, dia)"
               @click="abrirDetalhes(mes.mes, dia)">
            {{ dia }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../supabase'
import { useReservas } from '../composables/useReservas'
import Swal from 'sweetalert2'

const { carregarReservas } = useReservas()

const carregando = ref(true)
const recursosExtras = ref([])
const reservas = ref([])
const feriadosIso = ref([])

const anoBase = 2026 // Ano hardcoded conforme configsSemestre default do projeto

const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const mesesDoAno = computed(() => {
  const result = []
  for (let m = 0; m < 12; m++) {
    const dataPrimeiro = new Date(anoBase, m, 1)
    const diaSemanaPrimeiroDia = dataPrimeiro.getDay()
    const totalDias = new Date(anoBase, m + 1, 0).getDate()
    
    result.push({
      mes: m,
      nome: nomesMeses[m],
      diaSemanaPrimeiroDia,
      totalDias
    })
  }
  return result
})

onMounted(async () => {
  carregando.value = true
  
  // Carregar recursos para o dropdown
  const { data: recData } = await supabase.from('recursos_extras').select('*')
  recursosExtras.value = recData || []
  
  // Extrair Feriados
  const config = recursosExtras.value.find(r => r.categoria === 'configuracao_semestre')
  if (config) {
    try {
      const parsed = JSON.parse(config.nome)
      if (parsed.feriados) {
        feriadosIso.value = parsed.feriados.split(',').map(f => f.trim()).filter(f => f.length === 10)
      }
    } catch(e) {}
  }

  // Carregar todas as reservas do ano
  const inicioAno = `${anoBase}-01-01`
  const fimAno = `${anoBase}-12-31`
  reservas.value = await carregarReservas(inicioAno, fimAno)
  
  carregando.value = false
})

const getIsoDate = (mesIndex, dia) => {
  const m = (mesIndex + 1).toString().padStart(2, '0')
  const d = dia.toString().padStart(2, '0')
  return `${anoBase}-${m}-${d}`
}

const getClassParaDia = (mes, dia) => {
  const iso = getIsoDate(mes, dia)
  
  if (feriadosIso.value.includes(iso)) return 'holiday'
  
  const reservado = reservas.value.some(r => r.dataIso === iso || r.data === iso)
  if (reservado) return 'occupied'
  
  return 'available'
}

const getTooltipParaDia = (mes, dia) => {
  const iso = getIsoDate(mes, dia)
  if (feriadosIso.value.includes(iso)) return 'Feriado'
  
  const reservasDoDia = reservas.value.filter(r => r.dataIso === iso || r.data === iso)
  if (reservasDoDia.length > 0) {
    return `Ocupado:\n` + reservasDoDia.map(r => `- ${r.recurso}: ${r.horaInicio} às ${r.horaFim}`).join('\n')
  }
  return 'Livre'
}

const getCorRecurso = (recurso) => {
  if (!recurso) return { bg: '#6366f1', text: '#ffffff' }
  const recUpper = recurso.toUpperCase()
  if (recUpper.includes('AZUL ESC')) return { bg: '#1E40AF', text: '#ffffff' }
  if (recUpper.includes('AZUL CLR') || recUpper.includes('AZUL CLARO')) return { bg: '#7DD3FC', text: '#000000' }
  if (recUpper.includes('AMARELA')) return { bg: '#FDE047', text: '#000000' }
  if (recUpper.includes('LARANJA')) return { bg: '#F97316', text: '#ffffff' }
  if (recUpper.includes('ROXA')) return { bg: '#9333EA', text: '#ffffff' }
  if (recUpper.includes('VERDE')) return { bg: '#22C55E', text: '#ffffff' }
  return { bg: '#6366f1', text: '#ffffff' } // Padrão
}

const abrirDetalhes = (mes, dia) => {
  const iso = getIsoDate(mes, dia)
  const reservasDoDia = reservas.value.filter(r => r.dataIso === iso || r.data === iso)
  
  if (reservasDoDia.length === 0) return

  const dataBr = iso.split('-').reverse().join('/')
  
  let html = `<div style="text-align: left; max-height: 400px; overflow-y: auto;">`
  reservasDoDia.forEach(r => {
    const cor = getCorRecurso(r.recurso)
    html += `
      <div style="border-bottom: 1px solid var(--border-color, #e2e8f0); padding-bottom: 12px; margin-bottom: 12px;">
        <div style="background-color: ${cor.bg}; color: ${cor.text}; padding: 6px 10px; border-radius: 4px; font-weight: bold; margin-bottom: 8px; display: inline-block; width: 100%; box-sizing: border-box;">
          ${r.horaInicio} - ${r.horaFim}
        </div>
        <div style="font-size: 14px; margin-left: 4px;">
          <b style="color: var(--text-color);">Sala:</b> <span style="color: var(--text-color);">${r.recurso}</span><br/>
          <b style="color: var(--text-color);">Prof:</b> <span style="color: var(--text-color);">${r.professor}</span><br/>
          <b style="color: var(--text-color);">Disciplina:</b> <span style="color: var(--text-color);">${r.disciplina}</span>
        </div>
      </div>
    `
  })
  html += `</div>`

  Swal.fire({
    title: `Ocupação em ${dataBr}`,
    html: html,
    confirmButtonText: 'Fechar',
    confirmButtonColor: '#6366f1'
  })
}
</script>

<style scoped>
.no-data-alert {
  background-color: var(--pill-bg);
  color: var(--text-muted);
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid var(--border-color);
  font-size: 15px;
  margin-top: 20px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.calendar-month {
  padding: 20px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  color: var(--text-muted);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-radius: 6px;
  cursor: default;
}

.day:not(.empty) {
  border: 1px solid transparent;
}

.day.empty {
  background: transparent;
}

.day.available {
  background: var(--input-bg);
  color: var(--text-color);
  border-color: var(--border-color);
}
.day.available:hover {
  background: var(--pill-bg);
  border-color: #cbd5e1;
}

.day.occupied {
  background: #6366f1;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
  cursor: pointer;
}
.day.occupied:hover {
  background: #4f46e5;
}

.day.holiday {
  background: #ef4444;
  color: white;
  font-weight: bold;
}
.day.holiday:hover {
  background: #dc2626;
}

/* Dark mode tweaks */
:root[data-theme="dark"] .day.available {
  background: rgba(255, 255, 255, 0.03);
}
:root[data-theme="dark"] .day.available:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
