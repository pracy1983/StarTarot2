import { supabase } from '@/lib/supabase'
import { ProfileData } from '../types/profile'

export class ProfileService {
    async getProfile(userId: string): Promise<ProfileData | null> {
        try {
            const { data: profile, error } = await supabase
                .from('usuarios')
                .select(`
          nome,
          email,
          created_at,
          credits,
          phone_ddd,
          phone_number,
          birth_date,
          avatar_url
        `)
                .eq('id', userId)
                .maybeSingle()

            if (error) throw error
            if (!profile) return null

            // Buscar o número de consultas realizadas
            const { count: consultasRealizadas } = await supabase
                .from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('role', 'user')

            // Buscar a data da última consulta
            const { data: ultimaConsulta } = await supabase
                .from('chat_messages')
                .select('created_at')
                .eq('user_id', userId)
                .eq('role', 'user')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            const nomePartes = (profile.nome || '').split(' ')
            const primeiroNome = nomePartes[0] || ''
            const sobrenome = nomePartes.slice(1).join(' ') || ''

            return {
                primeiroNome,
                sobrenome,
                email: profile.email || '',
                dataCadastro: profile.created_at,
                creditos: profile.credits || 0,
                consultasRealizadas: consultasRealizadas || 0,
                ultimaConsulta: ultimaConsulta?.created_at || null,
                telefone: {
                    codigoPais: '+55',
                    ddd: profile.phone_ddd || '',
                    numero: profile.phone_number || ''
                },
                dataNascimento: profile.birth_date || '',
                foto: profile.avatar_url
            }
        } catch (error) {
            console.error('Erro ao buscar perfil:', error)
            return null
        }
    }

    async updateProfile(userId: string, data: Partial<ProfileData>): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('usuarios')
                .update({
                    nome: `${data.primeiroNome} ${data.sobrenome}`.trim(),
                    phone_ddd: data.telefone?.ddd,
                    phone_number: data.telefone?.numero,
                    birth_date: data.dataNascimento
                })
                .eq('id', userId)

            if (error) throw error

            return true
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error)
            return false
        }
    }

    async uploadPhoto(userId: string, photoData: string): Promise<string | null> {
        try {
            const base64Data = photoData.split(',')[1]
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'image/jpeg' })

            const filename = `${userId}/${Date.now()}.jpg`
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filename, blob, {
                    contentType: 'image/jpeg',
                    upsert: true
                })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filename)

            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ avatar_url: publicUrl })
                .eq('id', userId)

            if (updateError) throw updateError

            return publicUrl
        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error)
            return null
        }
    }
}
