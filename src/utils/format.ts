import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatarData(data: Date | string) {
    try {
        const date = data instanceof Date ? data : new Date(data)
        return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
            locale: ptBR
        })
    } catch {
        return 'Data inválida'
    }
}
