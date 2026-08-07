<template>
  <div v-show="!exibirRelatorioLotePrint" class="agendamento-container">
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
        <button class="btn-pdf" style="background-color: #6366f1;" @click="exportarRelatorioLotePDF">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: text-bottom;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Gerar PDF por Lote
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
            <option value="todos">Todos</option>
            <option value="Araras">Araras</option>
            <option value="SBO">Santa Bárbara d'Oeste (SBO)</option>
          </select>
        </div>
        <div>
          <label for="filtroCategoria">Categoria</label>
            <select id="filtroCategoria" v-model="filtros.categoria" @change="gerarRelatorio">
              <option value="">-- Selecione --</option>
              <option value="todos">Todos</option>
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
            <option value="todos">Todo o Semestre</option>
            <option value="periodo">Por Período</option>
            <option value="individual">Dia Único</option>
          </select>
        </div>
        
        <div :style="{ opacity: filtros.modoData === 'todos' ? 0.5 : 1, pointerEvents: filtros.modoData === 'todos' ? 'none' : 'auto' }">
          <label for="filtroDataInicio">Data Inicial / Única</label>
          <input type="date" id="filtroDataInicio" v-model="filtros.dataInicio" :min="configuracaoGlobal.minDate" :max="configuracaoGlobal.maxDate" @change="gerarRelatorio">
        </div>
        <div :style="{ opacity: (filtros.modoData === 'individual' || filtros.modoData === 'todos') ? 0.5 : 1, pointerEvents: (filtros.modoData === 'individual' || filtros.modoData === 'todos') ? 'none' : 'auto' }">
          <label for="filtroDataFim">Data Final</label>
          <input type="date" id="filtroDataFim" v-model="filtros.dataFim" :min="configuracaoGlobal.minDate" :max="configuracaoGlobal.maxDate" @change="gerarRelatorio">
        </div>
        <div>
          <label for="filtroDiaSemana">Dia da Semana</label>
          <select id="filtroDiaSemana" v-model="filtros.diaSemana" @change="gerarRelatorio">
            <option value="">Todos os Dias</option>
            <option value="Seg">Segunda-feira</option>
            <option value="Ter">Terça-feira</option>
            <option value="Qua">Quarta-feira</option>
            <option value="Qui">Quinta-feira</option>
            <option value="Sex">Sexta-feira</option>
            <option value="Sáb">Sábado</option>
            <option value="Dom">Domingo</option>
          </select>
        </div>
        <div>
          <label for="filtroSala">Filtrar por Sala</label>
          <select id="filtroSala" v-model="filtros.sala" @change="gerarRelatorio">
            <option value="">Todas as Salas</option>
            <option v-for="s in salasUnicas" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div>
          <label for="filtroProfessor">Filtrar por Professor</label>
          <select id="filtroProfessor" v-model="filtros.professor" @change="gerarRelatorio">
            <option value="">Todos os Professores</option>
            <option v-for="p in professoresUnicos" :key="p" :value="p">{{ p }}</option>
          </select>
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

        <div v-if="carregando" style="margin-top: 24px;">
          <div style="display: flex; gap: 16px; margin-bottom: 24px;">
            <div style="height: 36px; width: 60px; background: #e2e8f0; border-radius: 20px; animation: pulse 1.5s infinite;"></div>
            <div style="height: 36px; width: 60px; background: #e2e8f0; border-radius: 20px; animation: pulse 1.5s infinite; animation-delay: 0.1s;"></div>
            <div style="height: 36px; width: 60px; background: #e2e8f0; border-radius: 20px; animation: pulse 1.5s infinite; animation-delay: 0.2s;"></div>
          </div>
          <div style="height: 30px; width: 200px; background: #e2e8f0; border-radius: 8px; animation: pulse 1.5s infinite; margin-bottom: 16px;"></div>
          <div class="events-grid">
            <div style="height: 200px; background: #e2e8f0; border-radius: 12px; animation: pulse 1.5s infinite;"></div>
            <div style="height: 200px; background: #e2e8f0; border-radius: 12px; animation: pulse 1.5s infinite; animation-delay: 0.2s;"></div>
            <div style="height: 200px; background: #e2e8f0; border-radius: 12px; animation: pulse 1.5s infinite; animation-delay: 0.4s;"></div>
          </div>
        </div>
        <div class="agenda-list" v-else-if="diaSelecionado">
          <div v-for="linha in linhasTabela.filter(l => l.dataIso === diaSelecionado)" :key="linha.dataIso" class="agenda-day animate-fade">
            <div class="day-header" style="display: flex; justify-content: space-between; align-items: center;">
               <h4>{{ linha.dataBr }} <span style="color: var(--text-muted); font-weight: 400; font-size: 14px; margin-left: 8px;">{{ linha.diaSemana }}</span></h4>
               <span class="badge-count">{{ totalEventos(linha) }} reservas neste dia</span>
            </div>
            
            <div class="events-grid">
               <template v-for="(recursosArray, roomName) in linha.recursos" :key="roomName">
                  <div 
                    v-for="info in recursosArray" 
                    :key="info.id"
                    class="event-card"
                    style="padding: 0; overflow: hidden; display: flex; flex-direction: column;"
                  >
                    <!-- Header Colorido -->
                    <div :style="getCorFundoFull(info.recurso)">
                      <div class="card-header" style="margin-bottom: 0;">
                         <span class="room-name" style="font-size: 14px; color: inherit;">{{ formatarNomeRecurso(info.recurso) }}</span>
                         <span class="badge-status" :style="{ backgroundColor: statusBgColor(info.status), color: '#ffffff', border: 'none', padding: '4px 10px' }">{{ statusTexto(info.status) }}</span>
                      </div>
                    </div>
                    
                    <!-- Corpo Branco/Escuro -->
                    <div style="padding: 16px; background-color: var(--card-bg); flex: 1; display: flex; flex-direction: column;">
                      <div class="time-badge">{{ info.horaInicio }} - {{ info.horaFim }}</div>
                    
                    <div class="details">
                       <strong>{{ info.disciplina }}</strong>
                       <div class="curso">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                        <strong>{{ info.curso}}</strong> 
                       </div>
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

    <!-- CALENDÁRIO VISUAL -->
    <div v-if="temDados" class="card" style="margin-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="margin: 0; margin-bottom: 4px;">Calendário de Ocupação</h3>
          <p class="text-muted" style="margin: 0; font-size: 13px;">Datas coloridas = ocupadas. Branco = vaga disponível. Clique em um dia para ver os detalhes.</p>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; font-size: 12px;">
          <span style="display: flex; align-items: center; gap: 6px;"><span style="width:14px;height:14px;border-radius:3px;background:#4f46e5;display:inline-block;"></span> Ocupado</span>
          <span style="display: flex; align-items: center; gap: 6px;"><span style="width:14px;height:14px;border-radius:3px;background:#ef4444;display:inline-block;"></span> Feriado</span>
          <span style="display: flex; align-items: center; gap: 6px;"><span style="width:14px;height:14px;border-radius:3px;border:1px solid var(--border-color);background:var(--card-bg);display:inline-block;"></span> Vaga</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
        <div v-for="mesCalendario in mesesCalendario" :key="mesCalendario.chave" class="cal-month-block">
          <div style="text-align: center; font-weight: 700; font-size: 15px; color: var(--primary-color); margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-color);">
            {{ mesCalendario.nomeCompleto }}
          </div>
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;">
            <div v-for="d in ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']" :key="d" style="text-align: center; font-size: 10px; font-weight: 700; color: var(--text-muted); padding: 4px 0;">{{ d }}</div>
            <!-- Espaços em branco antes do primeiro dia -->
            <div v-for="n in mesCalendario.primeiroDia" :key="'empty-'+n"></div>
            <!-- Dias do mês -->
            <div
              v-for="dia in mesCalendario.dias"
              :key="dia.iso"
              class="cal-day"
              :class="{ 'cal-day-occupied': dia.reservas.length > 0, 'cal-day-today': dia.iso === hoje, 'cal-day-selected': calDiaSelecionado === dia.iso }"
              :style="dia.reservas.length > 0 ? { background: dia.corPrincipal, color: dia.corTexto, cursor: 'pointer' } : {}"
              @click="dia.reservas.length > 0 ? selecionarDiaCalendario(dia) : null"
              :title="dia.reservas.length > 0 ? dia.reservas.length + ' reserva(s)' : 'Sem reservas'"
            >
              <span class="cal-day-num">{{ dia.numero }}</span>
              <span v-if="dia.reservas.length > 0" class="cal-day-count">{{ dia.reservas.length }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Painel de detalhes do dia clicado -->
      <div v-if="calDiaSelecionado && calDetalhesDia" style="margin-top: 24px; border-top: 2px solid var(--border-color); padding-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="margin: 0; color: var(--primary-color);">📅 {{ calDetalhesDia.dataBr }} — {{ calDetalhesDia.diaSemana }}</h4>
          <button type="button" @click="calDiaSelecionado = null" style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 18px;">✕</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
          <div v-for="(reservasDoRecurso, nomeRecurso) in calDetalhesDia.recursos" :key="nomeRecurso"
            style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
            <div :style="getCorFundoFull(nomeRecurso)" style="padding: 10px 14px;">
              <strong>{{ formatarNomeRecurso(nomeRecurso) }}</strong>
            </div>
            <div style="padding: 12px; display: flex; flex-direction: column; gap: 8px;">
              <div v-for="res in reservasDoRecurso" :key="res.id" style="font-size: 13px; padding: 8px; background: var(--input-bg); border-radius: 6px; border-left: 3px solid var(--primary-color);">
                <div style="font-weight: 600;">{{ res.horaInicio }} – {{ res.horaFim }}</div>
                <div>{{ res.disciplina }}</div>
                <div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">👨‍🏫 {{ res.professor }} &nbsp;|&nbsp; {{ res.curso }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <EditModal 
      v-if="reservaEmEdicao" 
      :reserva="reservaEmEdicao"
      :lote="loteEdicao"
      :recursosDisponiveis="obterListaRecursosDisponiveis(reservaEmEdicao.campus, reservaEmEdicao.categoria)"
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
            <select v-model="filtroLote.recurso">
              <option value="">Opcional (Todas)</option>
              <option v-for="s in salasUnicas" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label>Professor</label>
            <select v-model="filtroLote.professor">
              <option value="">Opcional (Todos)</option>
              <option v-for="p in professoresUnicos" :key="p" :value="p">{{ p }}</option>
            </select>
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
            <strong>{{ formatarNomeRecurso(res.recurso) }}</strong> | {{ res.data.split('-').reverse().join('/') }} ({{ res.horaInicio }}) - {{ res.professor }}
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
    <RelatorioLotePrint v-if="exibirRelatorioLotePrint" :reservas="reservasFiltradasParaImpressao" />
  </div>

  <!-- Container fora do v-show para html2canvas capturar corretamente -->
  <div id="relatorio-pdf-wrapper" style="position:fixed; left:-9999px; top:0; z-index:-999; background:#fff; width:1100px; min-height:1px;">
    <RelatorioLotePrint v-if="exibirRelatorioLotePrint" :reservas="reservasFiltradasParaImpressao" />
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, nextTick } from 'vue'
import Swal from 'sweetalert2'
import DashboardCharts from './DashboardCharts.vue'
import { useReservas } from '../composables/useReservas'
import { useAuth } from '../composables/useAuth'
import EditModal from './EditModal.vue'
import RelatorioLotePrint from './RelatorioLotePrint.vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import html2pdf from 'html2pdf.js'

const { reservas, carregarReservas, atualizarStatus, deletarReserva, deletarReservasLote, limparBanco, recursosExtras, carregarRecursosExtras, atualizarReserva } = useReservas()
const { user, isAdmin } = useAuth()

const reservaEmEdicao = ref(null)
const exibirRelatorioLotePrint = ref(false)

const reservasFiltradasParaImpressao = computed(() => {
  const arr = []
  linhasTabela.value.forEach(linha => {
    Object.values(linha.recursos).forEach(reservasNoRecurso => {
      arr.push(...reservasNoRecurso)
    })
  })
  return arr
})

const abrirEdicao = (res) => {
  reservaEmEdicao.value = { ...res }
}

const exportarRelatorioLotePDF = () => {
  if (reservasFiltradasParaImpressao.value.length === 0) {
    Swal.fire('Atenção', 'Nenhuma reserva encontrada para gerar o relatório.', 'warning')
    return
  }

  Swal.fire({
    title: 'Gerando PDF...',
    text: 'Aguarde um momento.',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading() }
  })

  const nomeMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  const getCorFundo = (recurso) => {
    if (!recurso) return '#4f46e5'
    const m = recurso.match(/HEX:#([0-9A-Fa-f]{6})/i)
    if (m) return `#${m[1]}`
    const r = recurso.toUpperCase()
    if (r.includes('AZUL ESC')) return '#1E40AF'
    if (r.includes('AZUL CLR') || r.includes('AZUL CLARO')) return '#7DD3FC'
    if (r.includes('AMARELA')) return '#FDE047'
    if (r.includes('LARANJA')) return '#F97316'
    if (r.includes('ROXA')) return '#9333EA'
    if (r.includes('VERDE')) return '#22C55E'
    if (r.includes('VERMELHA') || r.includes('VERMELHO')) return '#EF4444'
    return '#4f46e5'
  }
  const getCorTexto = (recurso) => ['#FDE047','#7DD3FC'].includes(getCorFundo(recurso)) ? '#000' : '#fff'
  const formatNome = (nome) => nome ? nome.replace(/HEX:#[0-9A-Fa-f]{6}/gi, '').trim() : ''
  const buildSemanas = (primeiroDia, dias) => {
    const cells = Array(primeiroDia).fill(null).concat(dias)
    while (cells.length % 7 !== 0) cells.push(null)
    const semanas = []
    for (let i = 0; i < cells.length; i += 7) semanas.push(cells.slice(i, i + 7))
    return semanas
  }

  // Agrupar reservas em lotes
  const lotesMap = new Map()
  reservasFiltradasParaImpressao.value.forEach(r => {
    const key = `${r.recurso}|${r.disciplina}|${r.professor}|${r.horaInicio}|${r.horaFim}|${r.curso}`
    if (!lotesMap.has(key)) {
      lotesMap.set(key, { recurso: r.recurso, disciplina: r.disciplina, professor: r.professor, curso: r.curso, horaInicio: r.horaInicio, horaFim: r.horaFim, datas: new Set() })
    }
    if (r.data) lotesMap.get(key).datas.add(r.data)
  })

  const lotes = []
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
      const dias = []
      let hasEvents = false
      for (let d = 1; d <= totalDias; d++) {
        const iso = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
        const isOccupied = lote.datas.has(iso)
        if (isOccupied) hasEvents = true
        dias.push({ numero: d, isOccupied })
      }
      if (hasEvents) mesesCalendario.push({ nomeCompleto: `${nomeMeses[mes]} ${ano}`, semanas: buildSemanas(primeiroDia, dias) })
      cur = new Date(ano, mes + 1, 1)
    }
    lote.mesesCalendario = mesesCalendario
    lotes.push(lote)
  }
  lotes.sort((a, b) => {
    if ((a.recurso||'') !== (b.recurso||'')) return (a.recurso||'').localeCompare(b.recurso||'')
    return (a.disciplina||'').localeCompare(b.disciplina||'')
  })

  const gerarCalHtml = (semanas, corFundo, corTexto) => {
    const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
    let html = `<table class="cal-table">`
    html += `<thead><tr>${dias.map(d => `<th>${d}</th>`).join('')}</tr></thead>`
    html += `<tbody>`
    semanas.forEach(semana => {
      html += `<tr>`
      semana.forEach(dia => {
        if (!dia) {
          html += `<td></td>`
        } else if (dia.isOccupied) {
          html += `<td class="occupied" style="background:${corFundo};color:${corTexto};">${dia.numero}</td>`
        } else {
          html += `<td>${dia.numero}</td>`
        }
      })
      html += `</tr>`
    })
    html += `</tbody></table>`
    return html
  }

  // Gerar HTML de um único lote
  const gerarLoteHtml = (lote) => {
    const corFundo = getCorFundo(lote.recurso)
    const corTexto = getCorTexto(lote.recurso)
    const nome = formatNome(lote.recurso)

    const calsHtml = lote.mesesCalendario.map(mes =>
      `<div class="mini-cal">` +
      `<div class="month-title">${mes.nomeCompleto}</div>` +
      gerarCalHtml(mes.semanas, corFundo, corTexto) +
      `</div>`
    ).join('')

    return `<div class="lote-row">` +
      `<div class="lote-card">` +
        `<div class="card-header" style="background:${corFundo};color:${corTexto};">` +
          `<span class="room-name">${nome}</span>` +
          `<span class="badge">RESERVADO</span>` +
          `<div style="clear:both;"></div>` +
        `</div>` +
        `<div class="card-body">` +
          `<div class="time-badge">${lote.horaInicio} - ${lote.horaFim}</div>` +
          `<div class="disciplina">${lote.disciplina||''}</div>` +
          `<div class="curso"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg> ${lote.curso||''}</div>` +
          `<div class="professor"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${lote.professor||''}</div>` +
        `</div>` +
      `</div>` +
      `<div class="cals-wrapper">${calsHtml}</div>` +
      `<div class="clearfix"></div>` +
    `</div>`
  }



  // Cabeçalho do relatório
  const headerHtml = `<div style="text-align:center;margin-bottom:20px;padding:12px;background:#f1f5f9;border-radius:10px;">` +
    `<h2 style="margin:0 0 4px;color:#0f172a;font-weight:800;font-size:20px;">Relatório de Agendamentos por Lote</h2>` +
    `<p style="margin:0;color:#64748b;font-size:13px;">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>` +
    `</div>`

  // Montar HTML completo da página de impressão
  let pagesHtml = ''
  for (let i = 0; i < lotes.length; i += 2) {
    if (i > 0) pagesHtml += `<div class="page-break"></div>`
    pagesHtml += `<div class="page-content">`
    pagesHtml += gerarLoteHtml(lotes[i])
    if (lotes[i + 1]) {
      pagesHtml += `<div class="separator"></div>`
      pagesHtml += gerarLoteHtml(lotes[i + 1])
    }
    pagesHtml += `</div>`
  }

  const dataAtual = new Date().toLocaleDateString('pt-BR')
  const fullPage = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Agendamentos por Lote</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #fff; color: #1e293b; }

    .print-header {
      text-align: center;
      padding: 14px;
      background: #f1f5f9;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .print-header h2 { color: #0f172a; font-weight: 800; font-size: 20px; margin-bottom: 4px; }
    .print-header p { color: #64748b; font-size: 13px; }

    .page-content { padding: 20px; }

    .separator {
      margin: 22px 0;
      border-top: 2px dashed #e2e8f0;
      padding-top: 22px;
    }

    .lote-row { 
      display: flex; 
      gap: 24px; 
      align-items: flex-start; 
      page-break-inside: avoid; 
    }
    .lote-card {
      flex: 0 0 260px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #fff;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .card-header {
      padding: 12px 14px;
      font-weight: 700;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header .room-name { flex: 1; }
    .card-header .badge { background: rgba(255,255,255,0.28); padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
    .card-body { padding: 14px 16px; }
    .time-badge { display: inline-block; background: #eff6ff; color: #3b82f6; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 20px; margin-bottom: 14px; border: none; }
    .disciplina { font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 8px; }
    .curso { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .professor { font-size: 12px; color: #64748b; }

    .cals-wrapper { 
      flex: 1; 
      display: flex; 
      flex-direction: row; 
      flex-wrap: wrap;
      gap: 12px; 
    }
    .mini-cal { 
      width: 165px;
      border: 1px solid #e2e8f0; 
      border-radius: 8px; 
      padding: 10px; 
      background: #fff; 
    }
    .month-title { text-align: center; font-weight: 700; font-size: 11px; color: #4f46e5; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
    .cal-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .cal-table th { text-align: center; font-size: 9px; font-weight: 700; color: #94a3b8; padding: 2px 0; }
    .cal-table td { text-align: center; font-size: 10px; color: #64748b; height: 18px; padding: 0; }
    .cal-table td.occupied { font-weight: 700; border-radius: 3px; color: #fff; }

    /* Impressão */
    @media print {
      @page { size: landscape; margin: 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-after: always; }
      .no-print { display: none !important; }
    }

    /* Botão imprimir — só na tela */
    .print-btn-bar {
      position: fixed; bottom: 24px; right: 24px; z-index: 999;
      display: flex; gap: 10px;
    }
    .btn-print {
      background: #4f46e5; color: #fff; border: none; padding: 12px 28px;
      border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 14px rgba(79,70,229,0.4);
    }
    .btn-close {
      background: #e2e8f0; color: #475569; border: none; padding: 12px 20px;
      border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer;
    }
    @media print { .print-btn-bar { display: none !important; } }
  </style>
</head>
<body>
  <!-- Barra de ação -->
  <div class="print-btn-bar no-print">
    <button class="btn-close" onclick="window.close()">✕ Fechar</button>
    <button class="btn-print" onclick="window.print()">🖨️ Salvar como PDF</button>
  </div>

  <!-- Cabeçalho fixo no topo de cada página -->
  <div class="print-header" style="margin: 20px 20px 0 20px;">
    <h2>Relatório de Agendamentos por Lote</h2>
    <p>Gerado em: ${dataAtual}</p>
  </div>

  ${pagesHtml}
</body>
</html>`

  // Abre em nova aba
  const win = window.open('', '_blank')
  if (!win) {
    Swal.fire('Atenção', 'O navegador bloqueou a abertura de nova aba. Permita pop-ups para este site.', 'warning')
    return
  }
  win.document.open()
  win.document.write(fullPage)
  win.document.close()

  // Fecha o loading
  Swal.close()
}



const verificarConflitoHorario = (h1Inicio, h1Fim, h2Inicio, h2Fim) => {
  return (h1Inicio < h2Fim && h1Fim > h2Inicio)
}

const loteEdicao = computed(() => {
  if (!reservaEmEdicao.value) return []
  const ref = reservaEmEdicao.value
  return reservas.value.filter(r => 
    r.horaInicio === ref.horaInicio &&
    r.horaFim === ref.horaFim &&
    r.disciplina === ref.disciplina &&
    r.professor === ref.professor
  )
})

const salvarEdicao = async (dadosDaEdicao) => {
  const { aplicarIds, ...dadosNovos } = dadosDaEdicao
  const dataIso = dadosNovos.data
  
  // Determina quais reservas serão atualizadas
  let reservasAlvo = []
  
  if (aplicarIds && aplicarIds.length > 0) {
    reservasAlvo = reservas.value.filter(r => aplicarIds.includes(r.id))
  } else {
    reservasAlvo = [reservas.value.find(r => r.id === dadosNovos.id)]
  }

  // Verifica conflitos para todas as reservas alvo simultaneamente
  for (const reservaAlvo of reservasAlvo) {
    const outrasReservas = reservas.value.filter(r => r.id !== reservaAlvo.id)
    const novaData = (aplicarIds && aplicarIds.length > 0) ? reservaAlvo.dataIso : dadosNovos.data
    const novoRecurso = dadosNovos.recurso || reservaAlvo.recurso

    const choque = outrasReservas.find(i => 
      i.campus === reservaAlvo.campus && 
      i.categoria === reservaAlvo.categoria && 
      i.recurso === novoRecurso &&
      i.dataIso === novaData && 
      verificarConflitoHorario(dadosNovos.horaInicio, dadosNovos.horaFim, i.horaInicio, i.horaFim)
    )

    if (choque) {
      const dataBr = novaData.split('-').reverse().join('/')
      Swal.fire('Conflito!', `O novo horário [${dadosNovos.horaInicio}-${dadosNovos.horaFim}] já está ocupado na sala ${novoRecurso} do dia ${dataBr} por: ${choque.disciplina}. Nenhuma edição foi salva.`, 'error')
      return
    }
  }

  try {
    const promessas = reservasAlvo.map(r => {
      const novaData = (aplicarIds && aplicarIds.length > 0) ? r.dataIso : dadosNovos.data
      const novoRecurso = dadosNovos.recurso || r.recurso
      const novaReserva = {
        ...r,
        recurso: novoRecurso,
        data: novaData,
        dataIso: novaData,
        disciplina: dadosNovos.disciplina,
        professor: dadosNovos.professor,
        curso: dadosNovos.curso,
        horaInicio: dadosNovos.horaInicio,
        horaFim: dadosNovos.horaFim,
        observacao: dadosNovos.observacao
      }
      return atualizarReserva(novaReserva.id, novaReserva)
    })
    
    await Promise.all(promessas)
    
    Swal.fire('Sucesso', (aplicarIds && aplicarIds.length > 1) ? `${promessas.length} reservas atualizadas com sucesso.` : 'Reserva atualizada com sucesso.', 'success')
    reservaEmEdicao.value = null
    recalcularTabela()
  } catch(e) {
    Swal.fire('Erro', 'Falha ao salvar a(s) edição(ões).', 'error')
  }
}

const salasUnicas = computed(() => {
  const set = new Set(reservas.value.map(r => r.recurso).filter(Boolean))
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' }))
})

const professoresUnicos = computed(() => {
  const set = new Set(reservas.value.map(r => r.professor).filter(Boolean))
  return Array.from(set).sort((a, b) => {
    const limpoA = a.replace(/^P\d+\s*-\s*/i, '').trim().toLowerCase()
    const limpoB = b.replace(/^P\d+\s*-\s*/i, '').trim().toLowerCase()
    return limpoA.localeCompare(limpoB, 'pt-BR', { numeric: true, sensitivity: 'base' })
  })
})

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
  professor: '',
  diaSemana: ''
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
const carregando = ref(false)
const mensagemVazio = ref("Escolha o Campus, Espaço e Modo de Busca para gerar o relatório.")
const linhasTabela = ref([])
const diaSelecionado = ref(null)

const countCat = reactive({ metodologias: 0, informatica: 0, salas: 0, notebooks: 0, videoconf: 0 })
const countStatus = reactive({ usado: 0, noshow: 0, pendente: 0 })

const mesAbreviado = (mesNum) => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return meses[parseInt(mesNum, 10) - 1] || '';
}

const hoje = new Date().toISOString().split('T')[0]

// =============================================
// CALENDÁRIO VISUAL
// =============================================
const calDiaSelecionado = ref(null)

const coresPorRecurso = [
  { bg: '#4f46e5', text: '#ffffff' }, // indigo
  { bg: '#0d9488', text: '#ffffff' }, // teal
  { bg: '#dc2626', text: '#ffffff' }, // red
  { bg: '#d97706', text: '#ffffff' }, // amber
  { bg: '#7c3aed', text: '#ffffff' }, // violet
  { bg: '#059669', text: '#ffffff' }, // emerald
  { bg: '#db2777', text: '#ffffff' }, // pink
  { bg: '#2563eb', text: '#ffffff' }, // blue
  { bg: '#9333ea', text: '#ffffff' }, // purple
  { bg: '#0891b2', text: '#ffffff' }, // cyan
  { bg: '#65a30d', text: '#ffffff' }, // lime
  { bg: '#c2410c', text: '#ffffff' }, // orange
]

const mapaCoresRecurso = ref({})

const formatarNomeRecurso = (nome) => {
  if (!nome) return ''
  return nome.replace(/\s*-\s*HEX:#[0-9A-Fa-f]{6}$/i, '').trim()
}

const getCorFixa = (recurso) => {
  if (!recurso) return null
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
  return null
}

const atribuirCoresAosRecursos = () => {
  const mapa = {}
  let idx = 0
  linhasTabela.value.forEach(linha => {
    Object.keys(linha.recursos).forEach(recurso => {
      if (!mapa[recurso]) {
        const corFixa = getCorFixa(recurso)
        if (corFixa) {
          mapa[recurso] = corFixa
        } else {
          mapa[recurso] = coresPorRecurso[idx % coresPorRecurso.length]
          idx++
        }
      }
    })
  })
  mapaCoresRecurso.value = mapa
}

watch(linhasTabela, () => { atribuirCoresAosRecursos() }, { deep: true })

const mesesCalendario = computed(() => {
  if (!linhasTabela.value.length) return []
  
  // Monta mapa de data -> reservas
  const mapaReservasPorData = {}
  linhasTabela.value.forEach(linha => {
    mapaReservasPorData[linha.dataIso] = {
      recursos: linha.recursos,
      dataBr: linha.dataBr,
      diaSemana: linha.diaSemana
    }
  })
  
  // Determina o intervalo de meses
  const dataInicio = filtros.modoData === 'todos' ? configuracaoGlobal.minDate : filtros.dataInicio
  const dataFim = filtros.modoData === 'todos' ? configuracaoGlobal.maxDate : (filtros.modoData === 'individual' ? filtros.dataInicio : filtros.dataFim)
  
  if (!dataInicio || !dataFim) return []
  
  const inicio = new Date(dataInicio + 'T12:00:00')
  const fim = new Date(dataFim + 'T12:00:00')
  
  const nomeMesesCompleto = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const resultado = []
  
  let cur = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
  const limFim = new Date(fim.getFullYear(), fim.getMonth(), 1)
  
  while (cur <= limFim) {
    const ano = cur.getFullYear()
    const mes = cur.getMonth() // 0-based
    const totalDias = new Date(ano, mes + 1, 0).getDate()
    const primeiroDia = new Date(ano, mes, 1).getDay() // 0=Dom
    const chave = `${ano}-${String(mes + 1).padStart(2, '0')}`
    
    const dias = []
    for (let d = 1; d <= totalDias; d++) {
      const iso = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dadosDia = mapaReservasPorData[iso]
      let corPrincipal = 'transparent'
      let corTexto = 'inherit'
      let reservasList = []
      
      if (dadosDia) {
        reservasList = Object.values(dadosDia.recursos).flat()
        // Usa a cor do primeiro recurso
        const primeiroRecurso = Object.keys(dadosDia.recursos)[0]
        const cor = mapaCoresRecurso.value[primeiroRecurso]
        if (cor) { corPrincipal = cor.bg; corTexto = cor.text }
        else { corPrincipal = '#4f46e5'; corTexto = '#ffffff' }
      }
      
      dias.push({
        numero: d,
        iso,
        reservas: reservasList,
        corPrincipal,
        corTexto
      })
    }
    
    resultado.push({ chave, nomeCompleto: `${nomeMesesCompleto[mes]} ${ano}`, primeiroDia, dias })
    cur = new Date(ano, mes + 1, 1)
  }
  
  return resultado
})

const calDetalhesDia = computed(() => {
  if (!calDiaSelecionado.value) return null
  const linha = linhasTabela.value.find(l => l.dataIso === calDiaSelecionado.value)
  return linha || null
})

const selecionarDiaCalendario = (dia) => {
  calDiaSelecionado.value = calDiaSelecionado.value === dia.iso ? null : dia.iso
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
  if (recursoNome) {
    const nome = recursoNome.toUpperCase()
    let bg = null
    let cor = '#ffffff'
    
    if (nome.includes('AZUL ESC')) bg = '#1e3a8a'
    else if (nome.includes('AZUL CLR') || nome.includes('AZUL CLARO')) bg = '#3b82f6'
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
  // Fallback para outras categorias ou salas que não têm cor específica
  const estilo = estiloCores.value || coresEstiloMap["metodologias"]
  return { 
    backgroundColor: estilo.fundo, 
    color: estilo.borda, 
    padding: '12px 16px',
    borderTop: '4px solid ' + estilo.borda,
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

const recalcularTabela = () => {
  if (!filtros.campus || !filtros.categoria || !filtros.modoData) {
    temDados.value = false
    mensagemVazio.value = "Escolha o Campus, Espaço e Modo de Busca para gerar o relatório."
    return
  }

  let dataFimFiltro = filtros.modoData === 'individual' ? filtros.dataInicio : filtros.dataFim

  Object.keys(countCat).forEach(k => countCat[k] = 0)
  Object.keys(countStatus).forEach(k => countStatus[k] = 0)
  
  const mapa = {}
  let totalEncontrados = 0

  reservas.value.forEach(item => {
    // Contagem de Estatísticas
    if (filtros.campus === 'todos' || item.campus === filtros.campus) {
      countCat[item.categoria]++
      if (filtros.categoria === 'todos' || item.categoria === filtros.categoria) countStatus[item.status]++
    }
    
    // Filtro principal da Grid
    const campusOk = filtros.campus === 'todos' || item.campus === filtros.campus
    const categoriaOk = filtros.categoria === 'todos' || item.categoria === filtros.categoria
    const dateOk = filtros.modoData === 'todos' || (item.data >= filtros.dataInicio && item.data <= dataFimFiltro)
    
    if (campusOk && categoriaOk && dateOk) {
      if (filtros.sala && (!item.recurso || !item.recurso.toLowerCase().includes(filtros.sala.toLowerCase()))) return
      if (filtros.professor && (!item.professor || !item.professor.toLowerCase().includes(filtros.professor.toLowerCase()))) return
      
      if (filtros.diaSemana) {
        const diaObj = new Date(item.data + 'T12:00:00')
        const diaTxt = diasSemanaTexto[diaObj.getDay()]
        if (diaTxt !== filtros.diaSemana) return
      }
      
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

const gerarRelatorio = async () => {
  carregando.value = true
  await carregarReservas(configuracaoGlobal.minDate, configuracaoGlobal.maxDate)
  await carregarRecursosExtras()
  recalcularTabela()
  carregando.value = false
}

const mudarStatus = async (id, status) => {
  await atualizarStatus(id, status)
  recalcularTabela() // UI Otimista
}

const remover = async (id) => {
  const result = await Swal.fire({
    title: 'Cancelar Reserva?',
    text: "Você não poderá reverter esta ação!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, cancelar!'
  })
  
  if (result.isConfirmed) {
    await deletarReserva(id)
    recalcularTabela() // UI Otimista
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
    
    if (recUpper.includes('AZUL ESC')) { corFundo = 'FF1E40AF'; corTexto = 'FFFFFFFF' }
    else if (recUpper.includes('AZUL CLR') || recUpper.includes('AZUL CLARO')) { corFundo = 'FF7DD3FC' }
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

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ========================================
   CALENDÁRIO VISUAL
   ======================================== */
.cal-month-block {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}

.cal-day {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  user-select: none;
  min-height: 34px;
}

.cal-day:not(.cal-day-occupied) {
  color: var(--text-color);
  background: var(--input-bg);
  border-color: var(--border-color);
}

.cal-day-occupied {
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  transform: scale(1.02);
}

.cal-day-occupied:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  z-index: 2;
}

.cal-day-today {
  outline: 2px solid #f59e0b;
  outline-offset: 1px;
}

.cal-day-selected {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.25);
}

.cal-day-num {
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.cal-day-count {
  font-size: 9px;
  font-weight: 700;
  margin-top: 1px;
  opacity: 0.85;
  background: rgba(0,0,0,0.15);
  border-radius: 4px;
  padding: 1px 3px;
}
</style>
