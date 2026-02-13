'use client'

import React, { useEffect, useState } from 'react'
import { Mensagem } from '../types/mensagem'
import { useMensagensStore } from '../store/mensagensStore'
import { formatarData } from '@/utils/format'
import Image from 'next/image'

interface MensagemThreadProps {
    mensagemId: string
}

export const MensagemThread: React.FC<MensagemThreadProps> = ({ mensagemId }) => {
    const [messages, setMessages] = useState<Mensagem[]>([])
    const [loading, setLoading] = useState(true)
    const { carregarMensagemComResposta, marcarComoLida } = useMensagensStore()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const data = await carregarMensagemComResposta(mensagemId)
            setMessages(data)
            setLoading(false)

            // Marcar as mensagens carregadas como lidas
            data.forEach(msg => {
                if (!msg.lida) marcarComoLida(msg.id)
            })
        }
        load()
    }, [mensagemId, carregarMensagemComResposta, marcarComoLida])

    if (loading) return <div className="p-4 text-center">Carregando...</div>

    return (
        <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex flex-col space-y-2 ${msg.tipo === 'pergunta' ? 'items-end' : 'items-start'}`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">{formatarData(msg.data)}</span>
                    </div>
                    <div
                        className={`max-w-[85%] p-4 rounded-2xl ${msg.tipo === 'pergunta'
                                ? 'bg-primary text-black rounded-tr-none'
                                : 'bg-gray-800 text-gray-100 rounded-tl-none border border-primary/20'
                            }`}
                    >
                        <p className="whitespace-pre-wrap">{msg.conteudo}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
