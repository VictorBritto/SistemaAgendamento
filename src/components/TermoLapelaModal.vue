<template>
  <Teleport to="body">
    <div v-if="show" class="termo-modal-overlay">
    <div class="termo-modal-content">
      <div class="modal-actions hide-on-print">
        <button @click="imprimir" class="btn-print">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Imprimir Termo
        </button>
        <button @click="$emit('close')" class="btn-close">Fechar</button>
      </div>

      <div class="termo-document" id="termo-print-area">
        <!-- Cabeçalho -->
        <div class="termo-header">
          <h1 class="fho-logo">FHO</h1>
          <h2 class="fho-sub">FUNDAÇÃO HERMÍNIO OMETTO</h2>
          <h3 class="termo-title">TERMO DE EMPRÉSTIMO E RESPONSABILIDADE DE EQUIPAMENTO</h3>
          <p class="termo-desc">Pelo presente instrumento, o Departamento de Suporte à Informática realiza a cessão temporária do equipamento especificado para uso exclusivo em atividades institucionais autorizadas.</p>
        </div>

        <!-- Tabela 1: Dados -->
        <table class="termo-table dados-table">
          <tbody>
            <tr>
              <td class="bg-gray"><strong>Solicitante:</strong></td>
              <td>{{ dados.solicitante }}</td>
              <td class="bg-gray"><strong>Responsável:</strong></td>
              <td>{{ dados.responsavel }}</td>
            </tr>
            <tr>
              <td class="bg-gray"><strong>Data Solicitação:</strong></td>
              <td>{{ dados.dataSolicitacao }}</td>
              <td class="bg-gray"><strong>Data Devolução:</strong></td>
              <td>____/____/2026</td>
            </tr>
            <tr>
              <td class="bg-gray"><strong>Local Retirada/Devolução:</strong></td>
              <td colspan="3">Suporte à Informática — 4º Andar (Bloco C)</td>
            </tr>
          </tbody>
        </table>

        <!-- Tabela 2: Composição -->
        <h4 class="section-title">Composição do Equipamento: Microfone de Lapela Hollyland</h4>
        <table class="termo-table comp-table">
          <thead>
            <tr>
              <th>Item / Descrição</th>
              <th class="text-center">Qtde.</th>
              <th class="text-center">Estado na Entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1. Case de Transporte e Carregamento</td>
              <td class="text-center">1 un</td>
              <td class="text-center">[ ] Ok / Conforme</td>
            </tr>
            <tr>
              <td>2. Microfones de Lapela (Transmissores)</td>
              <td class="text-center">2 un</td>
              <td class="text-center">[ ] Ok / Conforme</td>
            </tr>
            <tr>
              <td>3. Receptor / Controlador</td>
              <td class="text-center">1 un</td>
              <td class="text-center">[ ] Ok / Conforme</td>
            </tr>
            <tr>
              <td>4. Adaptadores USB para Celular (Tipo-C / Lightning)</td>
              <td class="text-center">2 un</td>
              <td class="text-center">[ ] Ok / Conforme</td>
            </tr>
            <tr>
              <td>5. Adaptador USB para Computador / PC</td>
              <td class="text-center">1 un</td>
              <td class="text-center">[ ] Ok / Conforme</td>
            </tr>
          </tbody>
        </table>

        <!-- Termos -->
        <h4 class="section-title">Termos de Responsabilidade</h4>
        <ol class="termos-lista">
          <li><strong>Guarda e Conservação:</strong> O solicitante declara ter recebido o kit completo em perfeito funcionamento e se compromete a zelar pela sua integridade.</li>
          <li><strong>Devolução:</strong> O equipamento deve ser devolvido ao <strong>Suporte à Informática (4º andar - Bloco C)</strong> logo após a utilização.</li>
          <li><strong>Danos/Avarias:</strong> Em caso de danos, mau uso ou extravio de qualquer componente do kit, os responsáveis devem comunicar na devolução do equipamento.</li>
        </ol>

        <!-- Assinaturas -->
        <div class="assinaturas-container">
          <div class="assinatura-box">
            <div class="linha-assinatura"></div>
            <strong>{{ dados.solicitante }}</strong>
            <span>Solicitante</span>
          </div>
          <div class="assinatura-box">
            <div class="linha-assinatura"></div>
            <strong>{{ dados.responsavel }}</strong>
            <span>Responsável da Solicitação</span>
          </div>
          <div class="assinatura-box">
            <div class="linha-assinatura"></div>
            <strong>Suporte à Informática</strong>
            <span>4º Andar - Bloco C</span>
          </div>
        </div>

        <!-- Devolução -->
        <div class="devolucao-area">
          <h5 class="devolucao-title">Devolução do Equipamento (Uso Exclusivo do Suporte):</h5>
          <div class="devolucao-text" style="display: flex; flex-wrap: wrap; gap: 8px 24px; align-items: center;">
            <span style="white-space: nowrap;">Data Devolução: ____/____/2026 às ____:____h</span>
            <span style="white-space: nowrap;">Status: [ ] Ok / Completo &nbsp;&nbsp; [ ] Com Avaria/Falta de item</span>
          </div>
          <div class="visto-ti" style="display: flex; align-items: flex-end; gap: 8px;">
            <span style="white-space: nowrap;">Visto TI:</span>
            <div style="flex-grow: 1; border-bottom: 1px solid #000; height: 1em;"></div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean,
  dados: {
    type: Object,
    default: () => ({
      solicitante: '',
      responsavel: '',
      dataSolicitacao: ''
    })
  }
})

const emit = defineEmits(['close'])

const imprimir = () => {
  window.print()
}
</script>

<style scoped>
.termo-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 2147483647; /* z-index máximo para garantir cobertura total */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  overflow-y: auto;
  backdrop-filter: blur(2px);
}

.termo-modal-content {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  width: 100%;
  max-width: 800px; /* Reduzindo para conter melhor a A4 */
  position: relative;
  margin: auto;
  overflow-x: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 8px 8px 0 0;
  position: sticky;
  top: 0;
}

.btn-print {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #4f46e5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-print:hover {
  background: #4338ca;
}

.btn-close {
  background: #fff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
}

.termo-document {
  padding: 40px 50px;
  font-family: Arial, Helvetica, sans-serif;
  color: #000;
  background: #fff;
  width: 100%;
  min-width: 700px;
  box-sizing: border-box;
}

.termo-header {
  text-align: center;
  margin-bottom: 40px;
}

.fho-logo {
  font-size: 46px;
  font-weight: 800;
  color: #1e3a8a;
  margin: 0;
  letter-spacing: -1px;
}

.fho-sub {
  font-size: 15px;
  color: #1e3a8a;
  margin: 0 0 25px 0;
  text-transform: uppercase;
}

.termo-title {
  font-size: 19px;
  font-weight: bold;
  color: #1e3a8a;
  margin: 0 0 15px 0;
  text-transform: uppercase;
}

.termo-desc {
  font-size: 14px;
  text-align: justify;
  line-height: 1.5;
  margin: 0;
}

.termo-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  font-size: 13px;
  background: #fff;
  table-layout: fixed;
  word-break: break-word;
}

.termo-table th, .termo-table td {
  border: 1px solid #94a3b8;
  padding: 8px 10px;
  text-align: left;
}

.bg-gray {
  background-color: #f1f5f9;
}

.section-title {
  font-size: 15px;
  color: #1e3a8a;
  margin: 0 0 12px 0;
  font-weight: bold;
}

.comp-table th {
  background-color: #2563eb;
  color: white;
  border-color: #1d4ed8;
  font-weight: bold;
}

.text-center {
  text-align: center !important;
}

.termos-lista {
  font-size: 14px;
  line-height: 1.6;
  padding-left: 20px;
  margin-bottom: 40px;
}

.assinaturas-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 50px;
  border: 1px solid #000;
}

.assinatura-box {
  flex: 1;
  text-align: center;
  padding: 60px 20px 20px 20px;
  border-right: 1px solid #000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.assinatura-box:last-child {
  border-right: none;
}

.linha-assinatura {
  border-top: 1px solid #000;
  margin: 0 auto 12px auto;
  width: 90%;
}

.assinatura-box strong {
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.assinatura-box span {
  font-size: 12px;
  color: #475569;
}

.devolucao-area {
  margin-top: 40px;
}

.devolucao-title {
  font-size: 15px;
  color: #1e3a8a;
  margin: 0 0 12px 0;
  font-weight: bold;
}

.devolucao-text {
  font-size: 14px;
  margin-bottom: 35px;
}

.visto-ti {
  font-size: 14px;
}
</style>

<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm 20mm;
  }
  
  body > *:not(.termo-modal-overlay) {
    display: none !important;
  }
  
  body {
    background: white !important;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .termo-modal-overlay {
    position: relative !important;
    display: block !important;
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    height: auto !important;
    overflow: visible !important;
    z-index: auto !important;
    backdrop-filter: none !important;
  }
  
  .termo-modal-content {
    box-shadow: none !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    overflow: visible !important;
  }
  
  #termo-print-area {
    position: relative !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    visibility: visible !important;
  }
  
  .termo-table th, .termo-table td {
    padding: 4px 6px !important;
    font-size: 11px !important;
  }

  .assinatura-box {
    padding: 40px 10px 10px 10px !important;
  }

  .assinatura-box strong {
    font-size: 11px !important;
  }

  .fho-logo {
    font-size: 32px !important;
  }

  .fho-sub {
    font-size: 11px !important;
    margin-bottom: 15px !important;
  }

  .termo-title {
    font-size: 14px !important;
  }

  .termo-desc {
    font-size: 11px !important;
  }

  .section-title {
    font-size: 13px !important;
  }
  
  .termos-lista {
    font-size: 11px !important;
  }

  .hide-on-print {
    display: none !important;
  }
}
</style>
