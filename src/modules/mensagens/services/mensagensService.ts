import { supabase } from '@/lib/supabase'
import { Mensagem, MensagemFormData } from '../types/mensagem'

export async function carregarMensagens(userId?: string) {
    try {
        let query = supabase
            .from('mensagens')
            .select(`
        *,
        oraculista:oraculistas (
          id,
          nome,
          foto
        )
      `)
            .order('data', { ascending: false })

        if (userId) {
            query = query.eq('user_id', userId)
        }

        const { data, error } = await query

        if (error) throw error

        return (data || []).map(formatarMensagem)
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error)
        throw error
    }
}

export async function marcarComoLida(mensagemId: string) {
    try {
        const { error } = await supabase
            .from('mensagens')
            .update({ lida: true })
            .eq('id', mensagemId)

        if (error) throw error
    } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error)
        throw error
    }
}

export async function deletarMensagem(mensagemId: string, userId: string) {
    try {
        const { data: mensagem, error: buscaError } = await supabase
            .from('mensagens')
            .select('*')
            .eq('id', mensagemId)
            .single()

        if (buscaError) throw buscaError

        if (mensagem && mensagem.user_id === userId) {
            if (mensagem.tipo === 'pergunta') {
                await supabase
                    .from('mensagens')
                    .delete()
                    .eq('pergunta_ref', mensagem.id)
            }

            await supabase
                .from('mensagens')
                .delete()
                .eq('id', mensagemId)
        }
    } catch (error) {
        console.error('Erro ao deletar mensagem:', error)
        throw error
    }
}

function formatarMensagem(data: any): Mensagem {
    return {
        id: data.id,
        user_id: data.user_id,
        oraculista_id: data.oraculista_id,
        conteudo: data.conteudo,
        tipo: data.tipo,
        data: new Date(data.data),
        lida: data.lida,
        updatedAt: new Date(data.updated_at || data.data),
        status: data.status || 'enviada',
        thread_id: data.thread_id,
        pergunta_ref: data.pergunta_ref,
        perguntaOriginal: data.pergunta_original,
        oraculista: data.oraculista
    }
}
