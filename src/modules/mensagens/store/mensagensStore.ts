import { create } from 'zustand'
import { Mensagem } from '../types/mensagem'
import { supabase } from '@/lib/supabase'

interface MensagensState {
    mensagens: Mensagem[]
    mensagemAtual: Mensagem | null
    carregando: boolean
    erro: string | null
    carregarMensagens: (userId: string) => Promise<void>
    deletarMensagem: (id: string) => Promise<void>
    marcarComoLida: (id: string) => Promise<void>
    setMensagemAtual: (mensagem: Mensagem | null) => void
    getMensagensFiltradas: (filtro: 'todas' | 'nao_lidas' | 'respondidas') => Mensagem[]
    limparMensagens: () => void
    carregarMensagemComResposta: (mensagemId: string) => Promise<Mensagem[]>
}

export const useMensagensStore = create<MensagensState>((set, get) => ({
    mensagens: [],
    mensagemAtual: null,
    carregando: false,
    erro: null,

    carregarMensagens: async (userId: string) => {
        try {
            set({ carregando: true, erro: null })

            const { data, error } = await supabase
                .from('mensagens')
                .select(`
          *,
          oraculista:oraculistas (
            id,
            nome,
            foto
          )
        `)
                .eq('user_id', userId)
                .order('data', { ascending: false })

            if (error) throw error

            const mensagens: Mensagem[] = data.map(msg => ({
                ...msg,
                data: new Date(msg.data),
                updatedAt: new Date(msg.updated_at || msg.data)
            }))

            set({ mensagens, carregando: false })
        } catch (error: any) {
            console.error('Erro ao carregar mensagens:', error)
            set({ erro: error.message, carregando: false })
        }
    },

    deletarMensagem: async (id: string) => {
        try {
            const { error } = await supabase
                .from('mensagens')
                .delete()
                .eq('id', id)

            if (error) throw error

            set(state => ({
                mensagens: state.mensagens.filter(m => m.id !== id),
                mensagemAtual: state.mensagemAtual?.id === id ? null : state.mensagemAtual
            }))
        } catch (error) {
            console.error('Erro ao deletar mensagem:', error)
        }
    },

    marcarComoLida: async (id: string) => {
        try {
            await supabase
                .from('mensagens')
                .update({ lida: true })
                .eq('id', id)

            set(state => ({
                mensagens: state.mensagens.map(m =>
                    m.id === id ? { ...m, lida: true } : m
                )
            }))
        } catch (error) {
            console.error('Erro ao marcar como lida:', error)
        }
    },

    setMensagemAtual: (mensagem) => set({ mensagemAtual: mensagem }),

    getMensagensFiltradas: (filtro) => {
        const { mensagens } = get()
        switch (filtro) {
            case 'nao_lidas':
                return mensagens.filter(m => !m.lida)
            case 'respondidas':
                return mensagens.filter(m => m.tipo === 'resposta')
            default:
                return mensagens
        }
    },

    limparMensagens: () => set({ mensagens: [], mensagemAtual: null }),

    carregarMensagemComResposta: async (mensagemId: string) => {
        try {
            const { data, error } = await supabase
                .from('mensagens')
                .select(`
          *,
          oraculista:oraculistas(*)
        `)
                .or(`id.eq.${mensagemId},pergunta_ref.eq.${mensagemId}`)
                .order('data', { ascending: true })

            if (error) throw error

            return (data || []).map(msg => ({
                ...msg,
                data: new Date(msg.data),
                updatedAt: new Date(msg.updated_at || msg.data)
            }))
        } catch (error) {
            console.error('Erro ao carregar thread:', error)
            return []
        }
    }
}))
