import React from 'react'
import { Mensagem } from '../types/mensagem'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MensagemItemProps {
    mensagem: Mensagem
    selecionada: boolean
    onClick: (event: React.MouseEvent) => void
}

export const MensagemItem: React.FC<MensagemItemProps> = ({
    mensagem,
    selecionada,
    onClick
}) => {
    const isUserMessage = mensagem.tipo === 'pergunta'

    return (
        <div
            onClick={onClick}
            className={`
        p-4 cursor-pointer transition-all duration-200 border-b border-primary/10
        ${selecionada ? 'bg-primary/10' : 'hover:bg-primary/5'}
        ${!mensagem.lida ? 'bg-black/40' : ''}
      `}
        >
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                        {isUserMessage ? (
                            <span className="text-primary font-medium">Sua Pergunta</span>
                        ) : (
                            <span className="text-primary font-medium">Resposta de {mensagem.oraculista?.nome}</span>
                        )}
                    </span>
                    {!mensagem.lida && (
                        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                            Nova
                        </span>
                    )}
                </div>
                <h3 className={`text-sm font-medium mb-1 ${!mensagem.lida ? 'text-primary' : 'text-gray-300'}`}>
                    {format(mensagem.data, "dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">
                    {mensagem.conteudo}
                </p>
            </div>
        </div>
    )
}
