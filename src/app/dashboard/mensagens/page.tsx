'use client'

import { useEffect, useRef } from 'react'
import { useMensagensStore } from '@/modules/mensagens/store/mensagensStore'
import { MensagemList } from '@/modules/mensagens/components/MensagemList'
import { MensagemThread } from '@/modules/mensagens/components/MensagemThread'
import { useAuthStore } from '@/stores/authStore'

export default function MensagensPage() {
    const {
        mensagens,
        mensagemAtual,
        setMensagemAtual,
        carregarMensagens,
        limparMensagens
    } = useMensagensStore()

    const user = useAuthStore(state => state.user)

    useEffect(() => {
        if (user?.id) {
            carregarMensagens(user.id)
        }
        return () => limparMensagens()
    }, [user?.id, carregarMensagens, limparMensagens])

    return (
        <div className="flex flex-col h-full p-4 md:p-8">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-primary">Caixa de Mensagens</h1>
                <p className="text-gray-400">Suas consultas e respostas dos oraculistas</p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                {/* Lista de Mensagens */}
                <div className="md:col-span-1 bg-black/40 backdrop-blur-md border border-primary/20 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-primary/10">
                        <h2 className="text-primary font-medium">Conversas</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <MensagemList
                            mensagens={mensagens}
                            onSelectMensagem={setMensagemAtual}
                            mensagemSelecionada={mensagemAtual}
                        />
                    </div>
                </div>

                {/* Thread da Mensagem */}
                <div className="md:col-span-2 bg-black/40 backdrop-blur-md border border-primary/20 rounded-2xl overflow-hidden flex flex-col">
                    {mensagemAtual ? (
                        <MensagemThread mensagemId={mensagemAtual.id} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <p>Selecione uma mensagem para visualizar o histórico da conversa</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
