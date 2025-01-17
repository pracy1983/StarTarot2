import { create } from 'zustand'

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

// Mock user para desenvolvimento
const mockUser: User = {
  id: '1',
  name: 'Usuário Teste',
  email: 'teste@exemplo.com',
  isAdmin: true,
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      // Simulando uma verificação de autenticação
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
      if (isAuthenticated) {
        set({ user: mockUser, isAuthenticated: true, isLoading: false })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    try {
      // Simulando um delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock de autenticação - em produção isso seria uma chamada real à API
      if (email === 'teste@exemplo.com' && password === '123456') {
        localStorage.setItem('isAuthenticated', 'true')
        set({ user: mockUser, isAuthenticated: true })
        return { success: true }
      }

      return { success: false, error: 'Email ou senha inválidos' }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' }
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem('isAuthenticated')
      set({ user: null, isAuthenticated: false })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  },
}))
