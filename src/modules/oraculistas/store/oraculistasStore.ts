import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface Oraculista {
  id: string
  nome: string
  descricao: string
  especialidades: string[]
  disponivel: boolean
  consultas?: number
  prompt_formatado?: string
  prompt?: string
  emPromocao?: boolean
  precoPromocional?: number
  created_at?: string
  updated_at?: string
}

interface OraculistasState {
  oraculistas: Oraculista[]
  loading: boolean
  error: string | null
  carregarOraculistas: () => Promise<void>
  setOraculistas: (oraculistas: Oraculista[]) => void
}

export const useOraculistasStore = create<OraculistasState>((set) => ({
  oraculistas: [],
  loading: false,
  error: null,

  carregarOraculistas: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('oraculistas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const oraculistasFormatados = data.map(o => ({
        ...o,
        especialidades: o.especialidades || [],
        consultas: o.consultas || 0,
        prompt_formatado: o.prompt_formatado || '',
        prompt: o.prompt || '',
        emPromocao: o.em_promocao || false,
        precoPromocional: o.preco_promocional
      }))

      set({ 
        oraculistas: oraculistasFormatados,
        loading: false 
      })
    } catch (error) {
      console.error('Erro ao carregar oraculistas:', error)
      set({ 
        error: 'Erro ao carregar oraculistas',
        loading: false 
      })
    }
  },

  setOraculistas: (oraculistas) => set({ oraculistas })
}))
