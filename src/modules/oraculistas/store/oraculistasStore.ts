import { create } from 'zustand'

interface Oraculista {
  id: string
  nome: string
  descricao: string
  especialidades: string[]
  disponivel: boolean
}

interface OraculistasState {
  oraculistas: Oraculista[]
  setOraculistas: (oraculistas: Oraculista[]) => void
}

export const useOraculistasStore = create<OraculistasState>((set) => ({
  oraculistas: [],
  setOraculistas: (oraculistas) => set({ oraculistas }),
}))
