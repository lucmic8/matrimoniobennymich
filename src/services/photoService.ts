import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { ChallengePhoto, GuildProgress } from '../lib/supabase'

export class PhotoService {
  // Carica una foto nel storage di Supabase
  static async uploadPhoto(file: File, guildId: string, challengeId: number): Promise<string> {
    // Verifica se Supabase è configurato
    const isConfigured = await isSupabaseConfigured()
    if (!isConfigured) {
      // Fallback al localStorage per ora
      const base64 = await this.fileToBase64(file)
      const photoKey = `photo_${guildId}_${challengeId}`
      localStorage.setItem(photoKey, base64)
      return base64
    }

    try {
      // Verifica che il file sia valido
      if (!file || file.size === 0) {
        throw new Error('File non valido');
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${guildId}_${challengeId}_${Date.now()}.${fileExt}`
      const filePath = `${guildId}/${fileName}`

      // Carica il file nel bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('challenge-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Errore upload Supabase:', uploadError);
        throw uploadError
      }

      // Ottieni l'URL pubblico
      const { data: urlData } = supabase.storage
        .from('challenge-photos')
        .getPublicUrl(filePath)

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Impossibile ottenere URL pubblico');
      }

      const photoUrl = urlData.publicUrl

      // Salva i metadati nel database
      await this.savePhotoMetadata(guildId, challengeId, photoUrl)

      return photoUrl
    } catch (error) {
      console.error('Errore nel caricamento della foto:', error)
      if (error instanceof Error) {
        throw new Error(`Impossibile caricare la foto: ${error.message}`);
      }
      throw new Error('Impossibile caricare la foto');
    }
  }

  // Converte un file in base64 per il fallback localStorage
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Salva i metadati della foto nel database
  static async savePhotoMetadata(guildId: string, challengeId: number, photoUrl: string): Promise<void> {
    const isConfigured = await isSupabaseConfigured()
    if (!isConfigured) {
      // Salva nel localStorage come fallback
      const photoKey = `photo_${guildId}_${challengeId}`
      localStorage.setItem(photoKey, photoUrl)
      return
    }

    try {
      const { error } = await supabase
        .from('challenge_photos')
        .upsert({
          guild_id: guildId,
          challenge_id: challengeId,
          photo_url: photoUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'guild_id,challenge_id'
        })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Errore nel salvataggio dei metadati:', error)
      throw new Error('Impossibile salvare i metadati della foto')
    }
  }

  // Ottieni tutte le foto di una gilda
  static async getGuildPhotos(guildId: string): Promise<ChallengePhoto[]> {
    const isConfigured = await isSupabaseConfigured()
    if (!isConfigured) {
      // Fallback al localStorage
      return this.getPhotosFromLocalStorage(guildId)
    }

    try {
      const { data, error } = await supabase
        .from('challenge_photos')
        .select('*')
        .eq('guild_id', guildId)
        .order('challenge_id', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Errore nel recupero delle foto:', error)
      return []
    }
  }

  // Ottieni una foto specifica
  static async getChallengePhoto(guildId: string, challengeId: number): Promise<ChallengePhoto | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('challenge_photos')
        .select('*')
        .eq('guild_id', guildId)
        .eq('challenge_id', challengeId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Errore nel recupero della foto:', error)
      return null
    }
  }

  // Elimina una foto
  static async deletePhoto(guildId: string, challengeId: number): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase non configurato. Clicca su "Connect to Supabase" per abilitare la gestione delle foto.');
    }

    try {
      // Prima ottieni i metadati per avere l'URL
      const photo = await this.getChallengePhoto(guildId, challengeId)
      
      if (photo) {
        try {
          // Estrai il path dal URL pubblico
          const url = new URL(photo.photo_url)
          const pathParts = url.pathname.split('/')
          const filePath = pathParts.slice(-2).join('/') // guild_id/filename

          // Elimina il file dal storage
          const { error: storageError } = await supabase.storage
            .from('challenge-photos')
            .remove([filePath])

          if (storageError) {
            console.error('Errore nell\'eliminazione del file:', storageError)
          }
        } catch (urlError) {
          console.error('Errore nel parsing dell\'URL:', urlError);
        }
      }

      // Elimina i metadati dal database
      const { error: dbError } = await supabase
        .from('challenge_photos')
        .delete()
        .eq('guild_id', guildId)
        .eq('challenge_id', challengeId)

      if (dbError) {
        console.error('Errore eliminazione database:', dbError);
        throw dbError
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione della foto:', error)
      if (error instanceof Error) {
        throw new Error(`Impossibile eliminare la foto: ${error.message}`);
      }
      throw new Error('Impossibile eliminare la foto');
    }
  }

  // Gestione del progresso delle sfide
  static async updateChallengeProgress(guildId: string, challengeId: number, completed: boolean): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase non configurato. Clicca su "Connect to Supabase" per sincronizzare il progresso.');
    }

    try {
      const { error } = await supabase
        .from('guild_progress')
        .upsert({
          guild_id: guildId,
          challenge_id: challengeId,
          completed: completed,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'guild_id,challenge_id'
        })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento del progresso:', error)
      throw new Error('Impossibile aggiornare il progresso')
    }
  }

  // Ottieni il progresso di una gilda
  static async getGuildProgress(guildId: string): Promise<GuildProgress[]> {
    if (!supabase) {
      console.warn('Supabase non configurato, ritorno array vuoto');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('guild_progress')
        .select('*')
        .eq('guild_id', guildId)
        .order('challenge_id', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Errore nel recupero del progresso:', error)
      return []
    }
  }

  // Ottieni il progresso dal localStorage (fallback)
  private static getProgressFromLocalStorage(guildId: string): GuildProgress[] {
    const progress: GuildProgress[] = []
    for (let i = 1; i <= 15; i++) { // Assumendo 15 sfide
      const progressKey = `progress_${guildId}_${i}`
      const savedProgress = localStorage.getItem(progressKey)
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress)
        progress.push({
          id: `${guildId}_${i}`,
          guild_id: guildId,
          challenge_id: i,
          completed: parsed.completed,
          created_at: parsed.updated_at,
          updated_at: parsed.updated_at
        })
      }
    }
    return progress
  }
}