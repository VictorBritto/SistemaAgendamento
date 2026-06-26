import { ref } from 'vue'
import { supabase } from '../supabase'
import { useAuth } from './useAuth'

const reservas = ref([])
const recursosExtras = ref([])

export function useReservas() {
  
  const carregarRecursosExtras = async () => {
    try {
      const { data, error } = await supabase.from('recursos_extras').select('*')
      if (error) throw error
      recursosExtras.value = data || []
    } catch (error) {
      console.error('Erro ao carregar recursos extras:', error)
    }
  }

  const adicionarRecursoExtra = async (campus, categoria, nome) => {
    try {
      const { data, error } = await supabase.from('recursos_extras').insert([{ campus, categoria, nome }]).select()
      if (error) throw error
      if (data && data.length > 0) {
        recursosExtras.value.push(data[0])
      }
    } catch (error) {
      console.error('Erro ao adicionar recurso extra:', error)
      throw error
    }
  }

  const deletarRecursoExtra = async (id) => {
    try {
      const { error } = await supabase.from('recursos_extras').delete().eq('id', id)
      if (error) throw error
      recursosExtras.value = recursosExtras.value.filter(item => item.id !== id)
    } catch (error) {
      console.error('Erro ao deletar recurso extra:', error)
      throw error
    }
  }

  const atualizarRecursoExtra = async (id, novosDados) => {
    try {
      const { error } = await supabase.from('recursos_extras').update(novosDados).eq('id', id)
      if (error) throw error
      const index = recursosExtras.value.findIndex(item => item.id === id)
      if (index !== -1) {
        recursosExtras.value[index] = { ...recursosExtras.value[index], ...novosDados }
      }
    } catch(error) {
      console.error('Erro ao atualizar recurso extra:', error)
      throw error
    }
  }

  const carregarReservas = async () => {
    try {
      const { data, error } = await supabase.from('reservas').select('*')
      if (error) throw error
      // Mapeia dataIso do banco para data no frontend
      reservas.value = (data || []).map(r => ({ ...r, data: r.dataIso }))
      return reservas.value
    } catch (error) {
      console.error('Erro ao carregar reservas:', error)
      return []
    }
  }

  const adicionarReservas = async (novasReservas) => {
    try {
      const { user } = useAuth()
      
      // Remove o id local temporário e renomeia data para dataIso para o banco
      const reservasParaInserir = novasReservas.map(r => {
        const { id, data, ...resto } = r
        const nova = { ...resto, dataIso: data }
        if (user.value) {
          nova.user_id = user.value.id
        }
        return nova
      })
      const { data, error } = await supabase.from('reservas').insert(reservasParaInserir).select()
      if (error) throw error
      if (data) {
        const inseridos = data.map(r => ({ ...r, data: r.dataIso }))
        reservas.value.push(...inseridos)
      }
      return data
    } catch (error) {
      console.error('Erro ao adicionar reserva:', error)
      throw error
    }
  }

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const { error } = await supabase.from('reservas').update({ status: novoStatus }).eq('id', id)
      if (error) throw error
      
      const index = reservas.value.findIndex(item => item.id === id)
      if (index !== -1) {
        reservas.value[index].status = novoStatus
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const deletarReserva = async (id) => {
    try {
      const { error } = await supabase.from('reservas').delete().eq('id', id)
      if (error) throw error
      
      reservas.value = reservas.value.filter(item => item.id !== id)
    } catch (error) {
      console.error('Erro ao deletar reserva:', error)
    }
  }

  const atualizarReserva = async (id, dadosAtualizados) => {
    try {
      const { error } = await supabase.from('reservas').update({
        disciplina: dadosAtualizados.disciplina,
        professor: dadosAtualizados.professor,
        curso: dadosAtualizados.curso,
        horaInicio: dadosAtualizados.horaInicio,
        horaFim: dadosAtualizados.horaFim,
        observacao: dadosAtualizados.observacao || null
      }).eq('id', id)
      if (error) throw error
      await carregarReservas()
    } catch(error) {
      console.error('Erro ao atualizar reserva:', error)
      throw error
    }
  }

  const limparBanco = async () => {
    try {
      // Apaga tudo (utilizado para limpar testes)
      const { error } = await supabase.from('reservas').delete().neq('campus', 'apagar_tudo_hack')
      if (error) throw error
      reservas.value = []
    } catch (error) {
      console.error('Erro ao limpar banco:', error)
    }
  }

  return {
    reservas,
    recursosExtras,
    carregarRecursosExtras,
    adicionarRecursoExtra,
    deletarRecursoExtra,
    atualizarRecursoExtra,
    carregarReservas,
    adicionarReservas,
    atualizarStatus,
    deletarReserva,
    atualizarReserva,
    limparBanco
  }
}
