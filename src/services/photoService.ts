import { DropboxService } from './dropboxService'

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

export class PhotoService {
  // Carica una foto
  static async uploadPhoto(file: File, guildId: string, challengeId: number): Promise<string> {
    try {
      // Prova prima con Dropbox
      if (DropboxService.isConfigured()) {
        try {
          const photoUrl = await DropboxService.uploadPhoto(file, guildId, challengeId);
          // Salva i metadati localmente
          await this.savePhotoMetadata(guildId, challengeId, photoUrl);
          return photoUrl;
        } catch (error) {
          console.error('Errore Dropbox, uso fallback locale:', error);
        }
      }

      // Fallback al localStorage
      const base64 = await PhotoService.fileToBase64(file);
      const photoKey = `photo_${guildId}_${challengeId}`;
      localStorage.setItem(photoKey, base64);
      
      // Salva anche i metadati
      await this.savePhotoMetadata(guildId, challengeId, base64);
      
      return base64;
    } catch (error) {
      console.error('Errore nel caricamento della foto:', error);
      throw new Error('Impossibile caricare la foto');
    }
  }

  // Converte un file in base64
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Salva i metadati della foto
  static async savePhotoMetadata(guildId: string, challengeId: number, photoUrl: string): Promise<void> {
    const photoKey = `photo_${guildId}_${challengeId}`;
    const metadataKey = `metadata_${guildId}_${challengeId}`;
    
    localStorage.setItem(photoKey, photoUrl);
    localStorage.setItem(metadataKey, JSON.stringify({
      id: `${guildId}_${challengeId}`,
      guild_id: guildId,
      challenge_id: challengeId,
      photo_url: photoUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  // Ottieni tutte le foto di una gilda
  static async getGuildPhotos(guildId: string): Promise<ChallengePhoto[]> {
    const photos: ChallengePhoto[] = [];
    
    for (let i = 1; i <= 15; i++) {
      const metadataKey = `metadata_${guildId}_${i}`;
      const savedMetadata = localStorage.getItem(metadataKey);
      
      if (savedMetadata) {
        try {
          const metadata = JSON.parse(savedMetadata);
          photos.push(metadata);
        } catch (error) {
          console.error('Errore nel parsing dei metadati:', error);
        }
      }
    }
    
    return photos.sort((a, b) => a.challenge_id - b.challenge_id);
  }

  // Ottieni una foto specifica
  static async getChallengePhoto(guildId: string, challengeId: number): Promise<ChallengePhoto | null> {
    const metadataKey = `metadata_${guildId}_${challengeId}`;
    const savedMetadata = localStorage.getItem(metadataKey);
    
    if (savedMetadata) {
      try {
        return JSON.parse(savedMetadata);
      } catch (error) {
        console.error('Errore nel parsing dei metadati:', error);
      }
    }
    
    return null;
  }

  // Elimina una foto
  static async deletePhoto(guildId: string, challengeId: number): Promise<void> {
    try {
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

      // Rimuovi dal localStorage
      const photoKey = `photo_${guildId}_${challengeId}`;
      const metadataKey = `metadata_${guildId}_${challengeId}`;
      
      localStorage.removeItem(photoKey);
      localStorage.removeItem(metadataKey);
      
    } catch (error) {
      console.error('Errore nell\'eliminazione della foto:', error);
      throw new Error('Impossibile eliminare la foto');
    }
  }

  // Gestione del progresso delle sfide
  static async updateChallengeProgress(guildId: string, challengeId: number, completed: boolean): Promise<void> {
    const progressKey = `progress_${guildId}_${challengeId}`;
    localStorage.setItem(progressKey, JSON.stringify({
      id: `${guildId}_${challengeId}`,
      guild_id: guildId,
      challenge_id: challengeId,
      completed: completed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  // Ottieni il progresso di una gilda
  static async getGuildProgress(guildId: string): Promise<GuildProgress[]> {
    const progress: GuildProgress[] = [];
    
    for (let i = 1; i <= 15; i++) {
      const progressKey = `progress_${guildId}_${i}`;
      const savedProgress = localStorage.getItem(progressKey);
      
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          progress.push(parsed);
        } catch (error) {
          console.error('Errore nel parsing del progresso:', error);
        }
      }
    }
    
    return progress.sort((a, b) => a.challenge_id - b.challenge_id);
  }
}