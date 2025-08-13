import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { ChallengePhoto, GuildProgress } from '../lib/supabase'
import { DropboxService } from './dropboxService'

export class PhotoService {
  // Carica una foto nel storage di Supabase
  static async uploadPhoto(file: File, guildId: string, challengeId: number): Promise<string> {
    // Prova prima con Dropbox, poi con Supabase, infine localStorage
    if (DropboxService.isConfigured()) {
      try {
        const photoUrl = await DropboxService.uploadPhoto(file, guildId, challengeId);
        // Salva i metadati localmente
        await this.savePhotoMetadata(guildId, challengeId, photoUrl);
        return photoUrl;
      } catch (error) {
        console.error('Errore Dropbox, provo con fallback:', error);
      }
    }

    // Verifica se Supabase è configurato
    const supabaseConfigured = await isSupabaseConfigured()
    if (!supabaseConfigured) {
      // Fallback al localStorage per ora
      const base64 = await PhotoService.fileToBase64(file)
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
    const supabaseConfigured = await isSupabaseConfigured()
    if (!supabaseConfigured) {
      // Fallback al localStorage
      return PhotoService.getPhotosFromLocalStorage(guildId)
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
    // Prima prova a eliminare da Dropbox se configurato
    if (DropboxService.isConfigured()) {
      const photo = await this.getChallengePhoto(guildId, challengeId);
      if (photo && photo.photo_url.includes('dropbox')) {
        try {
          await DropboxService.deletePhoto(photo.photo_url);
        } catch (error) {
          console.warn('Errore eliminazione Dropbox:', error);
        }
      }
    }

    if (!supabase) {
      // Rimuovi dal localStorage
      const photoKey = `photo_${guildId}_${challengeId}`;
      localStorage.removeItem(photoKey);
      return;
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
    const supabaseConfigured = await isSupabaseConfigured()
    if (!supabaseConfigured) {
      // Fallback al localStorage
      const progressKey = `progress_${guildId}_${challengeId}`
      localStorage.setItem(progressKey, JSON.stringify({
        completed: completed,
        updated_at: new Date().toISOString()
      }))
      return
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
      // Fallback al localStorage in caso di errore
      const progressKey = `progress_${guildId}_${challengeId}`
      localStorage.setItem(progressKey, JSON.stringify({
        completed: completed,
        updated_at: new Date().toISOString()
      }))
    }
  }

  // Ottieni il progresso di una gilda
  static async getGuildProgress(guildId: string): Promise<GuildProgress[]> {
    const supabaseConfigured = await isSupabaseConfigured()
    if (!supabaseConfigured) {
      return PhotoService.getProgressFromLocalStorage(guildId)
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
      return PhotoService.getProgressFromLocalStorage(guildId)
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

  // Ottieni le foto dal localStorage (fallback)
  private static getPhotosFromLocalStorage(guildId: string): ChallengePhoto[] {
    const photos: ChallengePhoto[] = []
    for (let i = 1; i <= 15; i++) { // Assumendo 15 sfide
      const photoKey = `photo_${guildId}_${i}`
      const savedPhoto = localStorage.getItem(photoKey)
      if (savedPhoto) {
        photos.push({
          id: `${guildId}_${i}`,
          guild_id: guildId,
          challenge_id: i,
          photo_url: savedPhoto,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    }
    return photos
  }
}