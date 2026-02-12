import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  checkAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    console.log('StarTarot Auth Version: 2.1 (Pushed at 19:18)')
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Buscar dados extras do usuário na tabela 'usuarios'
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (userError) console.warn('Aviso: Perfil de usuário não encontrado ou erro na busca:', userError.message)

        set({
          user: {
            id: session.user.id,
            name: userData?.nome || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            isAdmin: userData?.is_admin || false
          },
          isAuthenticated: true,
          isLoading: false
        })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (userError) console.warn('Aviso: Perfil não encontrado ao logar:', userError.message)

        set({
          user: {
            id: data.user.id,
            name: userData?.nome || data.user.email?.split('@')[0] || 'Usuário',
            email: data.user.email || '',
            isAdmin: userData?.is_admin || false
          },
          isAuthenticated: true
        })
        return { success: true }
      }

      return { success: false, error: 'Erro inesperado ao fazer login' }
    } catch (error: any) {
      console.error('Erro no login:', error)
      return { success: false, error: error.message || 'Email ou senha inválidos' }
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null, isAuthenticated: false })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  },
}))
