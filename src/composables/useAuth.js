import { ref } from 'vue'
import { supabase } from '../supabase'

const user = ref(null)
const isAdmin = ref(false)
const authError = ref(null)

const checarAdmin = async (currentUser) => {
  if (!currentUser) {
    isAdmin.value = false
    return
  }
  const { data, error } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', currentUser.email)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    // PGRST116 é o erro de 'nenhuma linha encontrada' (o que é normal se não for admin).
    // Outros erros indicam falta de permissão (RLS) ou tabela inexistente.
    console.error("Erro no admin_users:", error)
    import('sweetalert2').then(Swal => {
      Swal.default.fire('Erro de Permissão (Supabase)', 'O sistema não conseguiu verificar se você é admin. Verifique se a tabela "admin_users" existe e se o RLS (Row Level Security) está desabilitado para leitura.', 'error')
    })
  }

  isAdmin.value = !!data
}

// Recuperar a sessão inicial
supabase.auth.getSession().then(({ data }) => {
  user.value = data.session?.user || null
  checarAdmin(user.value)
})

// Ficar ouvindo mudanças (login/logout)
supabase.auth.onAuthStateChange((_, session) => {
  user.value = session?.user || null
  checarAdmin(user.value)
})

export function useAuth() {
  const login = async (email, password) => {
    authError.value = null
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) authError.value = error.message
    return { data, error }
  }

  const register = async (email, password) => {
    authError.value = null
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) authError.value = error.message
    return { data, error }
  }

  const logout = async () => {
    authError.value = null
    const { error } = await supabase.auth.signOut()
    if (error) authError.value = error.message
  }

  return {
    user,
    isAdmin,
    authError,
    login,
    register,
    logout
  }
}
