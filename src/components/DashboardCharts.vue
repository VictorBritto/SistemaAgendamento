<template>
  <div class="dashboard-grid">
    <div class="card">
      <h3>Ocupação do Campus Selecionado</h3>
      <div style="position: relative; height: 260px; width: 100%; display: flex; justify-content: center;">
        <canvas ref="chartLabs"></canvas>
      </div>
    </div>
    <div class="card">
      <h3>Auditoria de Assiduidade e Uso Real</h3>
      <div style="position: relative; height: 260px; width: 100%; display: flex; justify-content: center;">
        <canvas ref="chartAssiduidade"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  countCat: {
    type: Object,
    required: true
  },
  countStatus: {
    type: Object,
    required: true
  }
})

const chartLabs = ref(null)
const chartAssiduidade = ref(null)

let chartLabsInstance = null
let chartAssiduidadeInstance = null

const renderizarGraficos = () => {
  if (chartLabsInstance) chartLabsInstance.destroy()
  if (chartAssiduidadeInstance) chartAssiduidadeInstance.destroy()

  if (chartLabs.value) {
    chartLabsInstance = new Chart(chartLabs.value, {
      type: 'bar',
      data: {
        labels: ['Metodologias', 'Informática', 'Salas Aula', 'Notebooks', 'VídeoConf'],
        datasets: [{ label: 'Reservas', data: Object.values(props.countCat), backgroundColor: '#1e3a8a', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    })
  }

  if (chartAssiduidade.value) {
    chartAssiduidadeInstance = new Chart(chartAssiduidade.value, {
      type: 'doughnut',
      data: {
        labels: ['Utilizado', 'Falta (No-Show)', 'Pendente'],
        datasets: [{ data: [props.countStatus.usado, props.countStatus.noshow, props.countStatus.pendente], backgroundColor: ['#10b981', '#ef4444', '#f59e0b'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })
  }
}

watch(() => props.countCat, renderizarGraficos, { deep: true })
watch(() => props.countStatus, renderizarGraficos, { deep: true })

onMounted(() => {
  renderizarGraficos()
})
</script>
