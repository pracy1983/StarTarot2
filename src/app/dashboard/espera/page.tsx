'use client'

import Link from 'next/link'

export default function EsperaPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8">
            <div className="animate-pulse">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-3xl font-raleway font-bold text-primary"> Sua pergunta foi enviada! </h1>
                <p className="text-xl text-gray-300">
                    Nossos oraculistas estão analisando sua situação.
                    <br />
                    Você receberá uma notificação assim que tivermos sua resposta.
                </p>
            </div>

            <Link
                href="/dashboard"
                className="px-8 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
                Voltar para o Início
            </Link>
        </div>
    )
}
