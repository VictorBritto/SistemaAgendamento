<template>
  <div class="agendamento-container">
    <div class="platform-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2>Painel de Agendamento</h2>
        <p class="text-muted">Configure os parâmetros abaixo para reservar um ambiente no sistema.</p>
      </div>
      <button @click="modalImportacaoTextoAberta = true" class="btn-cadastrar-recurso" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; font-size: 14px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        Importar Solicitação
      </button>
    </div>
    
    <form @submit.prevent="processarAgendamento" class="form-layout" :class="{ 'form-submitted': formSubmitted }">
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
            <div style="grid-column: 1 / -1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px;">
                <label style="margin-bottom: 0; line-height: 1.2;">Recursos Específicos<br><span style="font-size: 10px; font-weight: normal; color: var(--text-muted);">(Múltipla Escolha)</span></label>
                <button type="button" @click="abrirModalCadastro('recurso')" class="btn-cadastrar-recurso" style="padding: 4px 8px; font-size: 10px; white-space: nowrap; flex-shrink: 0;">
                  + Novo Recurso
                </button>
              </div>
              
              <div v-if="!recursosDisponiveis.length" style="padding: 12px; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-muted); font-size: 13px;">
                -- Escolha o Campus e Categoria primeiro --
              </div>
              <div v-else class="checkbox-group" style="display: flex; flex-direction: column; gap: 8px; background: var(--input-bg); padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; max-height: 250px; overflow-y: auto; overflow-x: hidden;">
                <div v-for="rec in recursosDisponiveis" :key="rec" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 10px; background: var(--card-bg); min-width: 0;">
                  <label class="checkbox-label" style="margin: 0; width: 100%; font-size: 12px; display: flex; align-items: flex-start; gap: 6px; cursor: pointer; min-width: 0;">
                    <input type="checkbox" :value="rec" v-model="form.recursos" style="margin-top: 2px; flex-shrink: 0;"> 
                    <span style="flex-grow: 1; min-width: 0; line-height: 1.3; word-break: break-word;">{{ rec }}</span>
                  </label>
                  <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: 2px;">
                    <button type="button" @click="editarRecursoExtra(form.categoria, rec)" style="background: none; border: none; color: #f59e0b; cursor: pointer; padding: 2px; display: flex; align-items: center;" title="Editar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button type="button" @click="apagarRecursoExtra(form.categoria, rec)" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px; display: flex; align-items: center;" title="Apagar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div><!-- /input-grid -->

          <!-- Legenda de Categorias -->
          <div style="margin-top: 20px; padding: 14px; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 8px;">
            <span style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 10px;">Tipos de Espaço</span>
            <div style="display: flex; flex-direction: column; gap: 7px;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #1e3a8a; flex-shrink: 0;"></span>
                <span style="color: var(--text-color);">Lab. Metodologia</span>
                <span style="margin-left: auto; font-size: 11px; color: var(--text-muted);">Salas Ativas</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #0d9488; flex-shrink: 0;"></span>
                <span style="color: var(--text-color);">Lab. Informática</span>
                <span style="margin-left: auto; font-size: 11px; color: var(--text-muted);">Máquinas / PCs</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #7c3aed; flex-shrink: 0;"></span>
                <span style="color: var(--text-color);">Salas de Aula</span>
                <span style="margin-left: auto; font-size: 11px; color: var(--text-muted);">Padrão</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #e11d48; flex-shrink: 0;"></span>
                <span style="color: var(--text-color);">Videoconferência</span>
                <span style="margin-left: auto; font-size: 11px; color: var(--text-muted);">Camera / Link</span>
              </div>
            </div>
          </div>
          <!-- Status de Preenchimento -->
          <div class="card-status-bar">
            <span class="status-bar-title">Status da seção</span>
            <div class="status-bar-items">
              <div class="status-bar-item" :class="form.campus ? 'done' : 'pending'">
                <svg v-if="form.campus" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Campus
              </div>
              <div class="status-bar-item" :class="form.categoria ? 'done' : 'pending'">
                <svg v-if="form.categoria" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Categoria
              </div>
              <div class="status-bar-item" :class="form.recursos.length > 0 ? 'done' : 'pending'">
                <svg v-if="form.recursos.length > 0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                {{ form.recursos.length > 0 ? form.recursos.length + ' recurso(s)' : 'Recurso' }}
              </div>
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
                <div style="margin-top: 6px; display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
                  <button v-if="presetSelecionado" type="button" @click="editarRecursoExtra('preset_horario', presetSelecionado)" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px; color: #f59e0b; border-color: #fcd34d;">
                    Editar Preset
                  </button>
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

            <div class="periodos-scroll-container">
              <div v-for="(periodo, index) in form.periodos" :key="index" style="border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; background: var(--card-bg);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <span style="font-weight: bold; font-size: 13px; white-space: nowrap; color: var(--text-color);">Período {{ index + 1 }}</span>
                  <button v-if="form.periodos.length > 1" type="button" @click="removerPeriodo(index)" style="background: transparent; border: none; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 4px; flex-shrink: 0;" title="Remover" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.background='transparent'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div>
                    <label :for="'dateInicio' + index" style="font-size: 10px; margin-bottom: 4px;">Data Inicio</label>
                    <input type="date" :id="'dateInicio' + index" v-model="periodo.dataInicio" :min="minDate" :max="maxDate" @change="() => { replicarDataPontual(index); validarInputManual(index) }" required style="padding: 8px 10px; font-size: 12px;">
                  </div>
                  <div :style="{ opacity: form.tipoAgendamento === 'pontual' || !form.tipoAgendamento ? 0.5 : 1 }">
                    <label :for="'dateFim' + index" style="font-size: 10px; margin-bottom: 4px;">Data Fim</label>
                    <input type="date" :id="'dateFim' + index" v-model="periodo.dataFim" :min="minDate" :max="maxDate" :disabled="form.tipoAgendamento === 'pontual' || !form.tipoAgendamento" @change="() => validarInputManual(index)" required style="padding: 8px 10px; font-size: 12px;">
                  </div>
                </div>
              </div>
            </div>
            
            <button type="button" @click="adicionarPeriodo" style="margin-bottom: 16px; background: var(--input-bg); border: 1px dashed var(--border-color); color: var(--text-color); padding: 8px; width: 100%; cursor: pointer; border-radius: 6px;">+ Adicionar Data Inicial e Final</button>

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

            <div style="grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 130px), 1fr)); gap: 16px;">
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
            <div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 16px;">
              <div>
                <label for="professor">Professor Responsável</label>
                <div>
                  <select id="professor" v-model="form.professor" required>
                    <option value="">-- Selecione o Professor --</option>
                    <option v-for="prof in professoresDisponiveis" :key="prof.nome" :value="prof.nome">{{ prof.nome }}</option>
                  </select>
                  <div style="margin-top: 6px; display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
                    <button v-if="form.professor" type="button" @click="editarRecursoExtra('professor', professoresDisponiveisObj.find(p => p.nome === form.professor)?.originalNome)" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px; color: #f59e0b; border-color: #fcd34d;">
                      Editar Prof.
                    </button>
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
                <label for="emailProfessor">E-mail do Professor</label>
                <input type="email" id="emailProfessor" v-model="form.emailProfessor" placeholder="professor@fho.edu.br">
              </div>
            </div>
            
            <div>
              <label for="curso">Curso Alvo</label>
              
              <div>
                <select id="curso" v-model="form.curso" required>
                  <option value="">-- Selecione o Curso --</option>
                  <option v-for="cur in cursosDisponiveis" :key="cur" :value="cur">{{ cur }}</option>
                </select>
                <div style="margin-top: 6px; display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
                  <button v-if="form.curso" type="button" @click="editarRecursoExtra('curso', form.curso)" class="btn-cadastrar-recurso" style="padding: 4px 10px; font-size: 11px; color: #f59e0b; border-color: #fcd34d;">
                    Editar Curso
                  </button>
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
              <textarea id="observacao" v-model="form.observacao" placeholder="Ex: Preciso de adaptador HDMI, microfone, etc...&#10;&#10;Use este campo para informar qualquer necessidade especial, configuração do ambiente ou observação relevante para quem for preparar o espaço." rows="6" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: inherit; resize: vertical; box-sizing: border-box;"></textarea>
            </div>
          </div><!-- /input-grid -->
          <!-- Status de Preenchimento -->
          <div class="card-status-bar">
            <span class="status-bar-title">Status da seção</span>
            <div class="status-bar-items">
              <div class="status-bar-item" :class="form.disciplina ? 'done' : 'pending'">
                <svg v-if="form.disciplina" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Disciplina
              </div>
              <div class="status-bar-item" :class="form.professor ? 'done' : 'pending'">
                <svg v-if="form.professor" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Professor
              </div>
              <div class="status-bar-item" :class="form.curso ? 'done' : 'pending'">
                <svg v-if="form.curso" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Curso
              </div>
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
              <span>Recurso(s):</span>
              <span class="truncate">{{ form.recursos.length > 0 ? form.recursos.length + ' selecionado(s)' : '-' }}</span>
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

          <div v-if="indexEdicao !== null" style="margin-top: 16px; display: flex; gap: 8px;">
            <button type="button" style="flex: 1; background: var(--input-bg); color: var(--text-color); border: 1px solid var(--border-color); padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600;" @click="cancelarEdicao">
              Cancelar
            </button>
            <button type="button" style="flex: 2; background: var(--primary-color); color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600;" @click="salvarEdicao">
              Salvar Edição
            </button>
          </div>
          <div v-else style="margin-top: 16px;">
            <button type="button" style="width: 100%; background: var(--input-bg); color: var(--text-color); border: 1px dashed var(--border-color); padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;" @click="adicionarAoCarrinho">
              + Adicionar Reserva
            </button>
          </div>

          <div v-if="carrinho.length > 0" style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
            <h4 style="margin-top: 0; margin-bottom: 12px; font-size: 13px; color: var(--text-color);">Agendamentos Aguardando ({{ carrinho.length }})</h4>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
              <div v-for="(item, idx) in carrinho" :key="idx" style="background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <strong style="color: var(--primary-color);">{{ item.recursos.join(', ') }}</strong>
                  <span style="color: var(--text-muted);">{{ item.horaInicio }} as {{ item.horaFim }}</span>
                </div>
                <div style="display: flex; gap: 4px;">
                  <button type="button" @click="editarDoCarrinho(idx)" style="background: none; border: none; color: #f59e0b; cursor: pointer; padding: 4px;" title="Editar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button type="button" @click="removerDoCarrinho(idx)" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Remover">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top: 24px;">
            <button type="submit" class="btn-submit" style="width: 100%;" @click="formSubmitted = true">
              Processar {{ itemsParaProcessarCount > 1 ? itemsParaProcessarCount + ' Reservas' : 'Reserva' }}
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

          <div style="grid-column: 1 / -1; margin-top: 16px;">
            <label style="font-weight: bold; display: block; margin-bottom: 8px;">Feriados e Recessos</label>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Digite as datas no formato AAAA-MM-DD (ex: 2026-04-21, 2026-05-01), separadas por vírgula. O sistema pulará automaticamente esses dias ao agendar lotes.</p>
            <textarea v-model="formConfigSemestre.feriados" rows="3" placeholder="2026-04-21, 2026-05-01" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit; resize: vertical; box-sizing: border-box;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button type="button" @click="modalConfigSemestre = false" class="btn-cancel" style="width: auto; margin: 0;">Cancelar</button>
            <button type="button" @click="salvarConfigSemestre" class="btn-submit" style="width: auto; margin: 0;">Salvar Datas</button>
          </div>
        </div>
      </div>
      <!-- Modal de Importação de Texto -->
      <div class="modal-overlay" v-if="modalImportacaoTextoAberta" style="z-index: 2000;">
        <div class="modal-content" style="max-width: 600px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; color: var(--primary-color);">Importar Dados de Agendamento</h3>
          <p class="text-muted" style="margin-bottom: 16px; font-size: 13px;">Cole abaixo o texto recebido (ex: e-mail) para preencher o formulário automaticamente.</p>
          <div class="input-group">
            <textarea v-model="textoImportacao" rows="12" placeholder="Cole o texto aqui..." style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-family: monospace; font-size: 12px; resize: vertical; box-sizing: border-box;"></textarea>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
            <button type="button" @click="fecharModalImportacao" class="btn-cancel" style="width: auto; margin: 0;">Cancelar</button>
            <button type="button" @click="processarImportacao" class="btn-submit" style="width: auto; margin: 0; background: var(--primary-color);">Processar Texto</button>
          </div>
        </div>
      </div>

    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { useReservas } from '../composables/useReservas'
import { useAuth } from '../composables/useAuth'
import emailjs from '@emailjs/browser'

// Modal de importação
const modalImportacaoTextoAberta = ref(false)
const textoImportacao = ref('')

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

const gerarCalendarioHtml = (reservas) => {
  if (!reservas || reservas.length === 0) return ''
  
  const reservasPorMes = {}
  reservas.forEach(r => {
    const dataObj = new Date(r.data + 'T12:00:00')
    const ano = dataObj.getFullYear()
    const mes = dataObj.getMonth()
    const key = `${ano}-${mes}`
    if (!reservasPorMes[key]) {
      reservasPorMes[key] = { ano, mes, dias: {} }
    }
    reservasPorMes[key].dias[dataObj.getDate()] = r.recurso
  })

  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
  
  let html = `<div style="margin-top: 24px;">`
  html += `<h4 style="margin: 0 0 12px 0; color: #111827; font-size: 15px;">Visualização no Calendário</h4>`
  
  const keysSorted = Object.keys(reservasPorMes).sort((a, b) => {
    const [aAno, aMes] = a.split('-').map(Number)
    const [bAno, bMes] = b.split('-').map(Number)
    return aAno !== bAno ? aAno - bAno : aMes - bMes
  })

  keysSorted.forEach(key => {
    const { ano, mes, dias } = reservasPorMes[key]
    const primeiroDia = new Date(ano, mes, 1)
    const diaSemanaPrimeiro = primeiroDia.getDay()
    const totalDias = new Date(ano, mes + 1, 0).getDate()
    
    html += `
    <table style="border-collapse: collapse; background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 12px; text-align: center; margin-bottom: 16px; width: 100%; max-width: 320px;">
      <thead>
        <tr>
          <th colspan="7" style="padding: 10px; color: #4f46e5; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
            ${nomesMeses[mes]} ${ano}
          </th>
        </tr>
        <tr style="color: #6b7280;">
          <th style="padding: 6px 2px;">Dom</th>
          <th style="padding: 6px 2px;">Seg</th>
          <th style="padding: 6px 2px;">Ter</th>
          <th style="padding: 6px 2px;">Qua</th>
          <th style="padding: 6px 2px;">Qui</th>
          <th style="padding: 6px 2px;">Sex</th>
          <th style="padding: 6px 2px;">Sáb</th>
        </tr>
      </thead>
      <tbody>
        <tr>
    `
    
    let diaAtualNaSemana = 0
    for (let i = 0; i < diaSemanaPrimeiro; i++) {
      html += `<td></td>`
      diaAtualNaSemana++
    }
    
    for (let dia = 1; dia <= totalDias; dia++) {
      if (diaAtualNaSemana === 7) {
        html += `</tr><tr>`
        diaAtualNaSemana = 0
      }
      const recursoDia = dias[dia]
      if (recursoDia) {
        const cor = getCorRecurso(recursoDia)
        html += `<td style="padding: 4px;">
                   <div style="background-color: ${cor.bg}; color: ${cor.text}; border-radius: 6px; width: 24px; height: 24px; line-height: 24px; margin: auto; font-weight: bold;">
                     ${dia}
                   </div>
                 </td>`
      } else {
        html += `<td style="padding: 4px; color: #d1d5db;">${dia}</td>`
      }
      diaAtualNaSemana++
    }
    
    while (diaAtualNaSemana < 7) {
      html += `<td></td>`
      diaAtualNaSemana++
    }
    html += `</tr></tbody></table>`
  })
  
  html += `</div>`
  return html
}

const fecharModalImportacao = () => {
  modalImportacaoTextoAberta.value = false
  textoImportacao.value = ''
}

const processarImportacao = async () => {
  if (!textoImportacao.value) return
  
  const texto = textoImportacao.value
  
  // Extrair Solicitante (Professor)
  const solicitanteMatch = texto.match(/Solicitante:\s*(.+)/i)
  if (solicitanteMatch) {
    const profNomeCompleto = solicitanteMatch[1].trim()
    // Tenta extrair só o nome se houver " - " (ex: P3723 - Carlos Miranda)
    const partes = profNomeCompleto.split('-')
    const profNome = partes.length > 1 ? partes[partes.length - 1].trim() : profNomeCompleto
    
    // Tenta encontrar o professor na lista, se não, adiciona
    const profExistente = professoresDisponiveis.value.find(p => p.nome.toLowerCase() === profNome.toLowerCase())
    if (profExistente) {
      form.professor = profExistente.nome
    } else {
      // Se não tiver, cadastra no banco
      try {
        await adicionarRecursoExtra('Geral', 'professor', profNome)
        form.professor = profNome
      } catch (e) {
        console.error("Erro ao auto-cadastrar professor:", e)
      }
    }
  }

  // Extrair Email
  const emailMatch = texto.match(/Email:\s*([^\s]+)/i)
  if (emailMatch) {
    form.emailProfessor = emailMatch[1].trim()
  }

  // Extrair Curso
  const cursoMatch = texto.match(/Curso:\s*(.+)/i)
  if (cursoMatch) {
    const cursoNome = cursoMatch[1].trim()
    const cursoExistente = cursosDisponiveis.value.find(c => c.toLowerCase() === cursoNome.toLowerCase())
    if (cursoExistente) {
      form.curso = cursoExistente
    } else {
      // Se não tiver, cadastra no banco
      try {
        await adicionarRecursoExtra('Geral', 'curso', cursoNome)
        form.curso = cursoNome
      } catch (e) {
        console.error("Erro ao auto-cadastrar curso:", e)
      }
    }
  }

  // Extrair Disciplina
  const disciplinaMatch = texto.match(/Disciplina:\s*(.+)/i)
  if (disciplinaMatch) {
    form.disciplina = disciplinaMatch[1].trim()
  }

  // Extrair Recurso (tentar achar Campus e Categoria)
  const recursoMatch = texto.match(/Recurso:\s*(.+)/i)
  let textoRecursoOriginal = ""
  if (recursoMatch) {
    textoRecursoOriginal = recursoMatch[1].trim()
    const recursoUpper = textoRecursoOriginal.toUpperCase()
    
    if (recursoUpper.includes('ARS') || recursoUpper.includes('ARARAS')) {
      form.campus = 'Araras'
    } else if (recursoUpper.includes('SBO')) {
      form.campus = 'SBO'
    }

    if (recursoUpper.includes('MTD ATIVA') || recursoUpper.includes('METODOLOGIA')) {
      form.categoria = 'metodologias'
    } else if (recursoUpper.includes('INF') || recursoUpper.includes('LABORATÓRIO') || recursoUpper.includes('COMPUT')) {
      form.categoria = 'informatica'
    } else if (recursoUpper.includes('SALA')) {
      form.categoria = 'salas'
    }
    renderizarCamposRecursoDinamico()

    // Tenta achar número da sala no texto inteiro para marcar o checkbox
    const salaMatch = texto.match(/(?:sala|lab|laborat[óo]rio)\s*([a-z0-9]+)/i)
    if (salaMatch) {
      const salaNum = salaMatch[1].toLowerCase()
      const rec = recursosDisponiveis.value.find(r => r.toLowerCase().includes(salaNum))
      if (rec) {
        form.recursos = [rec]
      }
    }
  }

  // Extrair Observação e anexar Dados Disciplina
  let observacaoFinal = ""
  const dadosDiscMatch = texto.match(/Dados Disciplina:\s*(.+)/i)
  if (dadosDiscMatch) {
    observacaoFinal += "Dados Disciplina: " + dadosDiscMatch[1].trim() + "\n\n"
  }
  if (textoRecursoOriginal) {
    observacaoFinal += "Recurso Solicitado Original: " + textoRecursoOriginal + "\n\n"
  }
  
  const obsMatch = texto.match(/\*+\s*Observação\s*\*+\n([\s\S]*?)(?=\*|$)/i)
  if (obsMatch) {
    observacaoFinal += obsMatch[1].trim()
  }
  form.observacao = observacaoFinal.trim()

  // Extrair Agendamentos (Dias e Horários)
  const regexAgendamentos = /Dia:\s*(\d{2}\/\d{2}\/\d{4})\s*Início:\s*(\d{2}:\d{2})\s*Término:\s*(\d{2}:\d{2})/gi
  let matches
  const diasEncontrados = []
  let horaInicioExtraida = ""
  let horaFimExtraida = ""

  while ((matches = regexAgendamentos.exec(texto)) !== null) {
    const diaBr = matches[1] // DD/MM/YYYY
    const partesDia = diaBr.split('/')
    const diaIso = `${partesDia[2]}-${partesDia[1]}-${partesDia[0]}` // YYYY-MM-DD
    
    diasEncontrados.push(diaIso)

    // Pega a primeira hora que achar
    if (!horaInicioExtraida) horaInicioExtraida = matches[2]
    if (!horaFimExtraida) horaFimExtraida = matches[3]
  }

  if (diasEncontrados.length > 0) {
    form.tipoAgendamento = 'pontual'
    form.periodos = diasEncontrados.map(dia => ({ dataInicio: dia, dataFim: dia }))
    if (horaInicioExtraida) form.horaInicio = horaInicioExtraida
    if (horaFimExtraida) form.horaFim = horaFimExtraida

    // Auto-ajustar o semestre ativo para evitar que a data fique fora do limite
    const primeiraData = diasEncontrados[0]
    if (primeiraData >= configsSemestre.sem2Inicio && primeiraData <= configsSemestre.sem2Fim) {
      semestreAtivo.value = '2'
    } else if (primeiraData >= configsSemestre.sem1Inicio && primeiraData <= configsSemestre.sem1Fim) {
      semestreAtivo.value = '1'
    }
  }

  fecharModalImportacao()
  Swal.fire({
    icon: 'success',
    title: 'Texto Importado',
    text: 'Formulário preenchido! Verifique os dados (especialmente o Recurso) antes de salvar.',
    timer: 2500,
    showConfirmButton: false
  })
}

const { isAdmin } = useAuth()
const { reservas, carregarReservas, adicionarReservas, recursosExtras, carregarRecursosExtras, adicionarRecursoExtra, deletarRecursoExtra, atualizarRecursoExtra } = useReservas()

const mesAtual = new Date().getMonth()
const semestreAtivo = ref(mesAtual > 5 ? '2' : '1')
const formSubmitted = ref(false)
const carrinho = ref([])
const indexEdicao = ref(null)

const configuracaoSemestreId = ref(null)
const configsSemestre = reactive({
  sem1Inicio: '2026-02-23',
  sem1Fim: '2026-06-26',
  sem2Inicio: '2026-08-10',
  sem2Fim: '2026-12-18',
  feriados: ''
})

const minDate = computed(() => semestreAtivo.value === '1' ? configsSemestre.sem1Inicio : configsSemestre.sem2Inicio)
const maxDate = computed(() => semestreAtivo.value === '1' ? configsSemestre.sem1Fim : configsSemestre.sem2Fim)

const minDateBr = computed(() => minDate.value ? minDate.value.split('-').reverse().join('/') : '')
const maxDateBr = computed(() => maxDate.value ? maxDate.value.split('-').reverse().join('/') : '')

const validarDatasSemestre = () => {
  form.periodos.forEach(p => {
    if (p.dataInicio) {
      if (p.dataInicio < minDate.value || p.dataInicio > maxDate.value) {
        Swal.fire('Aviso', `Você mudou para o ${semestreAtivo.value}º Semestre, mas uma data inicial estava no outro semestre. A data foi redefinida.`, 'info')
        p.dataInicio = ''
      }
    }
    if (p.dataFim) {
      if (p.dataFim < minDate.value || p.dataFim > maxDate.value) {
        p.dataFim = ''
      }
    }
  })
}

const validarInputManual = (index) => {
  if (index === undefined) return
  const p = form.periodos[index]
  if (p.dataInicio && (p.dataInicio < minDate.value || p.dataInicio > maxDate.value)) {
    Swal.fire('Atenção', `A data inicial não pertence ao ${semestreAtivo.value}º Semestre. Limites: ${minDateBr.value} a ${maxDateBr.value}.`, 'warning')
    p.dataInicio = ''
  }
  if (p.dataFim && (p.dataFim < minDate.value || p.dataFim > maxDate.value)) {
    Swal.fire('Atenção', `A data final não pertence ao ${semestreAtivo.value}º Semestre. Limites: ${minDateBr.value} a ${maxDateBr.value}.`, 'warning')
    p.dataFim = ''
  }
}

const modalConfigSemestre = ref(false)
const formConfigSemestre = reactive({ sem1Inicio: '', sem1Fim: '', sem2Inicio: '', sem2Fim: '', feriados: '' })

const abrirModalConfig = () => {
  formConfigSemestre.sem1Inicio = configsSemestre.sem1Inicio
  formConfigSemestre.sem1Fim = configsSemestre.sem1Fim
  formConfigSemestre.sem2Inicio = configsSemestre.sem2Inicio
  formConfigSemestre.sem2Fim = configsSemestre.sem2Fim
  formConfigSemestre.feriados = configsSemestre.feriados
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
    configsSemestre.feriados = formConfigSemestre.feriados
    
    modalConfigSemestre.value = false
    Swal.fire('Sucesso', 'Configurações de período letivo atualizadas com sucesso!', 'success')
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
      periodos: JSON.parse(JSON.stringify(form.periodos)),
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
    
    if (data.periodos) {
      form.periodos = data.periodos
    } else {
      form.periodos = [{ dataInicio: data.dataInicio || '', dataFim: data.dataFim || '' }]
    }
    
    form.diasSemana = data.diasSemana || []
    form.horaInicio = data.horaInicio || ''
    form.horaFim = data.horaFim || ''
  } catch(e) {
    console.error("Erro ao fazer parse do preset:", e)
  }
}

const editarRecursoExtra = async (categoria, nomeReferencia) => {
  if (!nomeReferencia) return
  
  const rec = recursosExtras.value.find(r => r.categoria === categoria && r.nome === nomeReferencia)
  const recFallback = recursosExtras.value.find(r => r.nome === nomeReferencia)
  const recursoAlvo = rec || recFallback
  
  if (!recursoAlvo) return

  const { value: novoNome } = await Swal.fire({
    title: `Editar ${categoria === 'preset_horario' ? 'Preset' : categoria === 'professor' ? 'Professor' : categoria === 'curso' ? 'Curso' : 'Recurso'}`,
    input: 'text',
    inputValue: nomeReferencia.split('||')[0],
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) return 'Você precisa digitar um nome!'
    }
  })

  if (novoNome && novoNome.trim() !== '') {
    try {
      let nomeFinal = novoNome.trim()
      if (categoria === 'preset_horario' && nomeReferencia.includes('||')) {
        const dadosExtras = nomeReferencia.split('||').slice(1).join('||')
        nomeFinal = `${nomeFinal}||${dadosExtras}`
      }
      
      await atualizarRecursoExtra(recursoAlvo.id, { nome: nomeFinal })
      await carregarRecursosExtras()
      
      Swal.fire('Atualizado!', 'O recurso foi atualizado com sucesso.', 'success')
      
      // Atualizar no form se estiver selecionado
      if (categoria === 'preset_horario' && presetSelecionado.value === nomeReferencia) presetSelecionado.value = nomeFinal
      else if (categoria === 'professor' && form.professor === nomeReferencia.split('||')[0]) form.professor = novoNome.trim()
      else if (categoria === 'curso' && form.curso === nomeReferencia) form.curso = nomeFinal
      else if (form.recursos.includes(nomeReferencia)) {
        form.recursos = form.recursos.map(r => r === nomeReferencia ? nomeFinal : r)
        renderizarCamposRecursoDinamico()
      }
    } catch (e) {
      console.error(e)
      Swal.fire('Erro', 'Falha ao editar o recurso.', 'error')
    }
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
    form.recursos = form.recursos.filter(r => r !== nomeReferencia)
    renderizarCamposRecursoDinamico()
  }
}

const form = reactive({
  campus: '',
  categoria: '',
  recursos: [],
  periodos: [{ dataInicio: '', dataFim: '' }],
  diasSemana: [],
  horaInicio: '',
  horaFim: '',
  disciplina: '',
  professor: '',
  curso: '',
  emailProfessor: '',
  observacao: '',
  tipoAgendamento: 'pontual'
})

watch(() => form.professor, (novoProf) => {
  if (!novoProf) return
  const profObj = professoresDisponiveis.value.find(p => p.nome === novoProf)
  if (profObj && profObj.curso) {
    const cursoCorreto = cursosDisponiveis.value.find(c => c.trim().toLowerCase() === profObj.curso.trim().toLowerCase())
    if (cursoCorreto) {
      form.curso = cursoCorreto
    } else {
      form.curso = profObj.curso
    }
  }
})

const itemsParaProcessarCount = computed(() => {
  let count = carrinho.value.length
  if (indexEdicao.value === null && form.campus && form.recursos.length > 0) {
    const formStr = JSON.stringify(form)
    const isInCart = carrinho.value.some(item => JSON.stringify(item) === formStr)
    if (!isInCart) {
      count++
    }
  }
  return count
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
      configsSemestre.feriados = parsed.feriados !== undefined ? parsed.feriados : configsSemestre.feriados
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
  if (!form.campus || !form.categoria) {
    recursosDisponiveis.value = []
    return
  }

  const extras = recursosExtras.value
    .filter(r => r.campus === form.campus && r.categoria === form.categoria)
    .map(r => r.nome)
  
  let lista = []
  
  if (form.categoria === 'notebooks') {
    lista = ["Notebook 1", "Notebook 2"]
  } else if (form.categoria === 'videoconf') {
    lista = ["Camera"]
  }

  const finalLista = [...lista, ...extras]
  finalLista.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
  recursosDisponiveis.value = finalLista
}

const adicionarPeriodo = () => {
  form.periodos.push({ dataInicio: '', dataFim: '' })
}

const removerPeriodo = (index) => {
  form.periodos.splice(index, 1)
}

const adicionarAoCarrinho = () => {
  if (!form.campus || !form.categoria || form.recursos.length === 0 || !form.tipoAgendamento || form.periodos.some(p => !p.dataInicio || !p.dataFim) || !form.horaInicio || !form.horaFim || !form.disciplina || !form.professor || !form.curso) {
    Swal.fire('Atenção', 'Preencha todos os campos obrigatórios antes de adicionar ao carrinho.', 'warning')
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
  carrinho.value.push(JSON.parse(JSON.stringify(form)))
  Swal.fire({ title: 'Adicionado!', text: 'Agendamento aguardando na lista.', icon: 'success', timer: 1500, showConfirmButton: false })
  formSubmitted.value = false
}

const removerDoCarrinho = (index) => {
  carrinho.value.splice(index, 1)
}

const editarDoCarrinho = (index) => {
  const item = carrinho.value[index]
  Object.assign(form, JSON.parse(JSON.stringify(item)))
  renderizarCamposRecursoDinamico()
  indexEdicao.value = index
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const salvarEdicao = () => {
  if (!form.campus || !form.categoria || form.recursos.length === 0 || !form.tipoAgendamento || form.periodos.some(p => !p.dataInicio || !p.dataFim) || !form.horaInicio || !form.horaFim || !form.disciplina || !form.professor || !form.curso) {
    Swal.fire('Atenção', 'Preencha todos os campos obrigatórios.', 'warning')
    return
  }
  carrinho.value[indexEdicao.value] = JSON.parse(JSON.stringify(form))
  indexEdicao.value = null
  Swal.fire({ title: 'Salvo!', text: 'Edição atualizada no carrinho.', icon: 'success', timer: 1500, showConfirmButton: false })
}

const cancelarEdicao = () => {
  indexEdicao.value = null
}

const alternarTipoAgendamento = () => {
  if (form.tipoAgendamento === 'pontual') {
    replicarDataPontual()
  } else {
    form.periodos.forEach(p => p.dataFim = '')
  }
}

const replicarDataPontual = (index) => {
  if (form.tipoAgendamento === 'pontual') {
    if (index !== undefined) {
      form.periodos[index].dataFim = form.periodos[index].dataInicio
    } else {
      form.periodos.forEach(p => p.dataFim = p.dataInicio)
    }
  }
}

const verificarConflitoHorario = (h1Inicio, h1Fim, h2Inicio, h2Fim) => {
  return (h1Inicio < h2Fim && h1Fim > h2Inicio)
}

const processarAgendamento = async () => {
  formSubmitted.value = true
  
  if (modalCadastro.value.aberto) {
    Swal.fire('Atenção', "Por favor, conclua o cadastro ou feche o modal antes de processar a reserva.", 'warning')
    return
  }

  const formsParaProcessar = [...carrinho.value]
  
  if (indexEdicao.value !== null) {
    formsParaProcessar[indexEdicao.value] = JSON.parse(JSON.stringify(form))
  } else if (form.campus && form.recursos.length > 0) {
    const formStr = JSON.stringify(form)
    const isInCart = carrinho.value.some(item => JSON.stringify(item) === formStr)
    if (!isInCart) {
      formsParaProcessar.push(JSON.parse(formStr))
    }
  }

  if (formsParaProcessar.length === 0) {
    Swal.fire('Atenção', "Nenhum agendamento preenchido ou no carrinho.", 'warning')
    return
  }

  for (let idx = 0; idx < formsParaProcessar.length; idx++) {
    const f = formsParaProcessar[idx]
    if (!f.campus || !f.categoria || f.recursos.length === 0 || !f.tipoAgendamento || f.periodos.some(p => !p.dataInicio || !p.dataFim) || !f.horaInicio || !f.horaFim || !f.disciplina || !f.professor || !f.curso) {
      Swal.fire('Atenção', `Agendamento ${idx + 1}: Preencha todos os campos obrigatórios.`, 'warning')
      return
    }
    if (f.tipoAgendamento === 'periodo' && (!f.diasSemana || f.diasSemana.length === 0)) {
      Swal.fire('Atenção', `Agendamento ${idx + 1}: Selecione ao menos um dia da semana para a recorrência.`, 'warning')
      return
    }
    if (f.horaInicio >= f.horaFim) {
      Swal.fire('Atenção', `Agendamento ${idx + 1}: A hora de término deve ser posterior à hora de início.`, 'warning')
      return
    }
  }

  let salvos = 0
  let conflitos = []
  let novasReservas = []
  
  // Lê os feriados configurados e limpa espaços vazios
  const feriadosStr = configsSemestre.feriados || ''
  const feriados = feriadosStr.split(',').map(f => f.trim()).filter(f => f.length === 10)

  for (const f of formsParaProcessar) {
    for (const periodo of f.periodos) {
      let dataAtual = new Date(periodo.dataInicio + 'T00:00:00')
      const dataFimLimit = new Date(periodo.dataFim + 'T00:00:00')

      if (dataFimLimit < dataAtual) {
        Swal.fire('Atenção', 'A data final não pode ser anterior à data inicial.', 'warning')
        return
      }

      while (dataAtual <= dataFimLimit) {
        const dataIso = dataAtual.toISOString().split('T')[0]
        
        if (f.tipoAgendamento === 'periodo' && feriados.includes(dataIso)) {
          dataAtual.setDate(dataAtual.getDate() + 1)
          continue
        }

        if (f.tipoAgendamento === 'pontual' || f.diasSemana.includes(dataAtual.getDay().toString())) {
          const dataBr = dataIso.split('-').reverse().join('/')

          for (const recursoSelecionado of f.recursos) {
            const choqueSala = reservas.value.find(i => 
              i.campus === f.campus && i.categoria === f.categoria && i.recurso === recursoSelecionado &&
              i.data === dataIso && verificarConflitoHorario(f.horaInicio, f.horaFim, i.horaInicio, i.horaFim)
            )

            // Choque também com os itens recém adicionados neste mesmo lote
            const choqueLote = novasReservas.find(i => 
              i.campus === f.campus && i.categoria === f.categoria && i.recurso === recursoSelecionado &&
              i.data === dataIso && verificarConflitoHorario(f.horaInicio, f.horaFim, i.horaInicio, i.horaFim)
            )

            if (choqueSala || choqueLote) {
              conflitos.push(`${dataBr} [${f.horaInicio}-${f.horaFim}] - Choque: ${recursoSelecionado}`)
            } else {
              novasReservas.push({
                id: 'id_' + Math.random().toString(36).substr(2, 9),
                campus: f.campus,
                categoria: f.categoria,
                recurso: recursoSelecionado,
                data: dataIso,
                horaInicio: f.horaInicio,
                horaFim: f.horaFim,
                disciplina: f.disciplina,
                professor: f.professor,
                curso: f.curso,
                observacao: f.observacao,
                status: 'pendente'
              })
              salvos++
            }
          }
        }
        dataAtual.setDate(dataAtual.getDate() + 1)
      }
    }
  }

  try {
    if (novasReservas.length === 0 && conflitos.length === 0) {
      Swal.fire('Atenção', 'Nenhuma data válida encontrada.', 'info')
      return
    }

    if (novasReservas.length > 0) {
      await adicionarReservas(novasReservas)
    }

    const dispararEmail = async () => {
      const formOriginal = formsParaProcessar[0]
      if (!formOriginal.emailProfessor) return

      try {
        Swal.fire({
          title: 'Enviando E-mail...',
          text: `Notificando ${formOriginal.emailProfessor}`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })
        
        let msgCorpo = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #374151; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">`
        msgCorpo += `<div style="background-color: #4f46e5; color: white; padding: 24px; text-align: center;">`
        msgCorpo += `<h2 style="margin: 0; font-size: 22px; font-weight: 600;">Confirmação de Agendamento</h2>`
        msgCorpo += `</div>`
        msgCorpo += `<div style="padding: 32px;">`
        msgCorpo += `<p style="font-size: 16px; margin-top: 0;">Olá, <strong>Prof. ${formOriginal.professor}</strong>,</p>`
        msgCorpo += `<p>Gostaríamos de confirmar que as solicitações de agendamento para a disciplina <strong>"${formOriginal.disciplina}"</strong> foram processadas com sucesso no sistema.</p>`
        
        msgCorpo += `<div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">`
        msgCorpo += `<h3 style="margin-top: 0; margin-bottom: 12px; color: #111827; font-size: 16px;">Detalhes da Solicitação</h3>`
        msgCorpo += `<ul style="margin: 0; padding-left: 20px; color: #4b5563;">`
        msgCorpo += `<li style="margin-bottom: 6px;"><strong>Sala(s):</strong> ${formOriginal.recursos.join(', ')}</li>`
        msgCorpo += `<li style="margin-bottom: 6px;"><strong>Curso:</strong> ${formOriginal.curso}</li>`
        if (formOriginal.observacao) {
          msgCorpo += `<li><strong>Observação:</strong> ${formOriginal.observacao}</li>`
        }
        msgCorpo += `</ul>`
        msgCorpo += `</div>`

        msgCorpo += `<p style="font-size: 15px;">✅ Foram aprovadas e lançadas <strong style="color: #059669; font-size: 16px;">${salvos} novas reservas</strong> no sistema.</p>`
        
        if (conflitos.length > 0) {
          msgCorpo += `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-top: 20px; border-radius: 0 8px 8px 0; color: #991b1b; font-size: 14px;">`
          msgCorpo += `⚠️ <strong>Atenção:</strong> algumas das datas solicitadas sofreram choque de horário com outras turmas e não puderam ser reservadas.`
          msgCorpo += `</div>`
        }

        // Anexando o calendário
        msgCorpo += gerarCalendarioHtml(novasReservas)

        msgCorpo += `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 24px 0;" />`
        msgCorpo += `<p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">Atenciosamente,<br><strong style="color: #374151;">Suporte Informática FHO</strong></p>`
        msgCorpo += `</div></div>`

        const templateParams = {
          to_email: formOriginal.emailProfessor,
          to_name: formOriginal.professor,
          cc_email: 'suporteinformatica@fho.edu.br',
          subject: `Confirmação de Agendamento - ${formOriginal.disciplina}`,
          message: msgCorpo
        }

        // Substitua COLOQUE_O_TEMPLATE_ID_AQUI pelo Template ID real do site
        await emailjs.send(
          'service_wrkaawp',
          'template_89sqjl2',
          templateParams,
          '0U2_PC73g93wtLvjG'
        )

        Swal.fire({
          title: 'E-mail Enviado!',
          text: 'O professor foi notificado com sucesso de forma automática.',
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        })

      } catch (error) {
        console.error("Erro no EmailJS:", error)
        Swal.fire({
          title: 'Falha no Envio',
          text: `Os agendamentos foram salvos, mas não foi possível disparar o e-mail.\n\nDetalhes do Erro:\n${error.text || error.message || error}`,
          icon: 'warning'
        })
      }
    }

    if (conflitos.length > 0) {
      Swal.fire({
        title: `${salvos} reservas confirmadas`,
        html: `❌ <b>CONFLITOS BLOQUEADOS:</b><br/>
               <div style="max-height: 200px; overflow-y: auto; text-align: left; background: var(--pill-bg, #f1f5f9); padding: 12px; border-radius: 6px; margin-top: 12px; font-size: 13px; border: 1px solid var(--border-color, #e2e8f0); line-height: 1.5;">
                 ${conflitos.join('<br/>')}
               </div>`,
        icon: 'warning'
      }).then(() => { if (salvos > 0) dispararEmail() })
    } else {
      Swal.fire('Sucesso!', `${salvos} reserva(s) salva(s).`, 'success').then(() => { if (salvos > 0) dispararEmail() })
    }

    formSubmitted.value = false
    carrinho.value = []
    indexEdicao.value = null
    form.recursos = []
    form.periodos = [{ dataInicio: '', dataFim: '' }]
    form.diasSemana = []
    form.horaInicio = ''
    form.horaFim = ''
    form.disciplina = ''
    form.professor = ''
    form.emailProfessor = ''
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

/* Colocar os cards de seção lado a lado na mesma altura */
.form-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 24px;
  align-items: stretch;
}

@media (max-width: 1200px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}

.form-submitted input:invalid,
.form-submitted select:invalid,
.form-submitted textarea:invalid {
  border-color: #ef4444 !important;
  background-color: #fef2f2 !important;
}

.section-card {
  padding: 32px;
  margin-bottom: 0;
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

/* ---- Status de Preenchimento (rodapé dos cards) ---- */
.card-status-bar {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px dashed var(--border-color);
}

.status-bar-title {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.status-bar-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-bar-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 20px;
  transition: all 0.2s;
}

.status-bar-item.done {
  background: #dcfce7;
  color: #15803d;
}

.status-bar-item.pending {
  background: var(--input-bg);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

/* Dark mode */
:root[data-theme="dark"] .status-bar-item.done {
  background: rgba(21, 128, 61, 0.2);
  color: #4ade80;
}

/* Scroll Customizado para a Lista de Períodos */
.periodos-scroll-container {
  max-height: 380px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.periodos-scroll-container::-webkit-scrollbar {
  width: 6px;
}
.periodos-scroll-container::-webkit-scrollbar-track {
  background: var(--input-bg);
  border-radius: 4px;
}
.periodos-scroll-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}
.periodos-scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
