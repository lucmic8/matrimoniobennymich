import { createClient } from '@supabase/supabase-js'

// Configurazione automatica Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

// Crea sempre il client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funzione per verificare se Supabase è configurato correttamente
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('challenge_photos').select('count').limit(1)
    return !error
  } catch (error) {
    console.warn('Supabase non configurato correttamente:', error)
    return false
  }
}

// Tipi per il database
export interface ChallengePhoto {
  id: string
  guild_id: string
  challenge_id: number
  photo_url: string
  created_at: string
  updated_at: string
}

export interface GuildProgress {
  id: string
  guild_id: string
  challenge_id: number
  completed: boolean
  created_at: string
  updated_at: string
}