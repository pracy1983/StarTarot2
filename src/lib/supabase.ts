import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Log para debug em produção (remover depois)
console.log('[Supabase Config] URL:', supabaseUrl)
console.log('[Supabase Config] Key length:', supabaseAnonKey?.length)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
