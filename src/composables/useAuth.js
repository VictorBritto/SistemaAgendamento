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
  const { data } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', currentUser.email)
    .single()
  
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
