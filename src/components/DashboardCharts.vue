<template>
  <div class="dashboard-grid">
    <div class="card" style="grid-column: 1 / -1;">
      <h3>Ocupação do Campus Selecionado</h3>
      <div style="position: relative; height: 300px; width: 100%; display: flex; justify-content: center;">
        <canvas ref="chartLabs"></canvas>
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
  }
})

const chartLabs = ref(null)
let chartLabsInstance = null

const renderizarGraficos = () => {
  if (chartLabsInstance) chartLabsInstance.destroy()

  if (chartLabs.value) {
    const ctx = chartLabs.value.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, '#7C3AED') // primary color
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.2)')

    chartLabsInstance = new Chart(chartLabs.value, {
      type: 'bar',
      data: {
        labels: ['Metodologias', 'Informática', 'Salas Aula', 'Notebooks', 'VídeoConf'],
        datasets: [{ 
          label: 'Reservas', 
          data: Object.values(props.countCat), 
          backgroundColor: gradient,
          borderColor: '#7C3AED',
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.6
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { borderDash: [4, 4], color: 'rgba(0,0,0,0.05)' },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    })
  }
}

watch(() => props.countCat, renderizarGraficos, { deep: true })

onMounted(() => {
  renderizarGraficos()
})
</script>
