'use client'

import { Mensagem } from '../types/mensagem'
import { MensagemItem } from './MensagemItem'

interface MensagemListProps {
    mensagens: Mensagem[]
    onSelectMensagem?: (mensagem: Mensagem | null) => void
    mensagemSelecionada?: Mensagem | null
}

export function MensagemList({
    mensagens,
    onSelectMensagem,
    mensagemSelecionada
}: MensagemListProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 p-2 overflow-y-auto space-y-1">
                {mensagens.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        Nenhuma mensagem encontrada
                    </div>
                ) : (
                    mensagens.map((mensagem) => (
                        <MensagemItem
                            key={mensagem.id}
                            mensagem={mensagem}
                            selecionada={mensagemSelecionada?.id === mensagem.id}
                            onClick={() => onSelectMensagem?.(mensagem)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
