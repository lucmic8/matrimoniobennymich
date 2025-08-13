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
  // Carica una foto con gestione migliorata per fotocamera
  static async uploadPhoto(file: File, guildId: string, challengeId: number): Promise<string> {
    try {
      console.log('=== 📱 INIZIO CARICAMENTO FOTO (ULTRA DEBUG) ===');
      console.log('📋 File info completa:', { 
        name: file.name || 'FOTO_DA_TELEFONO', 
        size: file.size, 
        type: file.type || 'TIPO_NON_SPECIFICATO',
        lastModified: file.lastModified,
        sizeKB: (file.size / 1024).toFixed(2) + ' KB',
        sizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        constructor: file.constructor.name
      });
      
      // VALIDAZIONE ULTRA-SEMPLIFICATA
      console.log('🔍 VALIDAZIONE ULTRA-SEMPLIFICATA...');
      
      if (!file || file.size === 0) {
        console.error('❌ ERRORE CRITICO: File nullo o vuoto');
        throw new Error('File nullo o completamente vuoto');
      }
      console.log('✅ File esiste e ha contenuto');

      if (file.size < 100) {
        console.error('❌ ERRORE: File troppo piccolo');
        throw new Error(`File troppo piccolo: ${file.size} bytes`);
      }
      console.log('✅ Dimensione accettabile');

      if (file.size > 50 * 1024 * 1024) {
        console.error('❌ ERRORE: File troppo grande');
        throw new Error(`File troppo grande: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      }
      console.log('✅ Tutte le validazioni superate');
      
      // Assicurati che Dropbox sia sempre configurato
      if (!DropboxService.isConfigured()) {
        console.log('🔧 Dropbox non configurato, inizializzo automaticamente...');
        DropboxService.initializeWithDefaultToken();
        console.log('✅ Tentativo inizializzazione Dropbox completato');
      }

      // Carica sempre su Dropbox
      let photoUrl: string;
      try {
        console.log('=== 📤 CARICAMENTO SU DROPBOX ===');
        photoUrl = await DropboxService.uploadPhoto(file, guildId, challengeId);
        console.log('✅ Caricamento Dropbox completato:', photoUrl.substring(0, 100) + '...');
      } catch (error) {
        console.error('❌ Errore Dropbox dettagliato:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
        
        // Messaggio di errore più specifico
        let errorMessage = 'Impossibile caricare la foto su Dropbox';
        if (error instanceof Error) {
          if (error.message.includes('token')) {
            errorMessage += ': Token di accesso non valido';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += ': Problema di connessione internet';
          } else if (error.message.includes('file') || error.message.includes('image')) {
            errorMessage += ': File immagine non valido';
          } else {
            errorMessage += ': ' + error.message;
          }
        }
        throw new Error(errorMessage);
      }

      // Salva i metadati localmente e sincronizza
      console.log('=== 💾 SALVATAGGIO METADATI ===');
      await this.savePhotoMetadata(guildId, challengeId, photoUrl);
      await this.syncDataToDropbox(guildId);
      
      console.log('✅ 🎉 CARICAMENTO COMPLETATO CON SUCCESSO');
      return photoUrl;
    } catch (error) {
      console.error('❌ ERRORE FINALE nel caricamento della foto:', error);
      throw new Error(error instanceof Error ? error.message : 'Impossibile caricare la foto');
    }
  }

  // Converte un file in base64 con gestione migliorata
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = () => {
          if (reader.result) {
            resolve(reader.result as string);
          } else {
            reject(new Error('Impossibile leggere il file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Errore nella lettura del file'));
        };
        
        reader.onabort = () => {
          reject(new Error('Lettura del file interrotta'));
        };
        
        // Usa readAsDataURL per compatibilità con tutti i tipi di file immagine
        reader.readAsDataURL(file);
      } catch (error) {
        reject(new Error('Errore nell\'elaborazione del file'));
      }
    });
  }

  // Salva i metadati della foto
  static async savePhotoMetadata(guildId: string, challengeId: number, photoUrl: string): Promise<void> {
    const metadata = {
      id: `${guildId}_${challengeId}`,
      guild_id: guildId,
      challenge_id: challengeId,
      photo_url: photoUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Salva localmente
    const photoKey = `photo_${guildId}_${challengeId}`;
    const metadataKey = `metadata_${guildId}_${challengeId}`;
    
    localStorage.setItem(photoKey, photoUrl);
    localStorage.setItem(metadataKey, JSON.stringify(metadata));
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
          console.log(`📸 Foto trovata per sfida ${i}:`, metadata.photo_url?.substring(0, 50) + '...');
        } catch (error) {
          console.error('Errore nel parsing dei metadati:', error);
        }
      }
    }
    
    console.log(`📊 Totale foto caricate per ${guildId}:`, photos.length);
    return photos.sort((a, b) => a.challenge_id - b.challenge_id);
  }

  // Ottieni una foto specifica
  static async getChallengePhoto(guildId: string, challengeId: number): Promise<ChallengePhoto | null> {
    const metadataKey = `metadata_${guildId}_${challengeId}`;
    const savedMetadata = localStorage.getItem(metadataKey);
    
    if (savedMetadata) {
      try {
        const metadata = JSON.parse(savedMetadata);
        console.log(`📸 Foto specifica trovata per sfida ${challengeId}:`, metadata.photo_url?.substring(0, 50) + '...');
        return metadata;
      } catch (error) {
        console.error('Errore nel parsing dei metadati:', error);
      }
    }
    
    console.log(`📭 Nessuna foto trovata per sfida ${challengeId}`);
    return null;
  }

  // Elimina una foto
  static async deletePhoto(guildId: string, challengeId: number): Promise<void> {
    try {
      // Assicurati che Dropbox sia configurato
      if (!DropboxService.isConfigured()) {
        DropboxService.initializeWithDefaultToken();
      }

      // Elimina da Dropbox
      const photo = await this.getChallengePhoto(guildId, challengeId);
      if (photo && photo.photo_url.includes('dropbox')) {
        try {
          await DropboxService.deletePhoto(photo.photo_url);
        } catch (error) {
          console.warn('Errore eliminazione Dropbox:', error);
        }
      }

      // Rimuovi dal localStorage
      const photoKey = `photo_${guildId}_${challengeId}`;
      const metadataKey = `metadata_${guildId}_${challengeId}`;
      
      localStorage.removeItem(photoKey);
      localStorage.removeItem(metadataKey);
      
      console.log('🗑️ Foto eliminata:', { photoKey, metadataKey });
      
    } catch (error) {
      console.error('Errore nell\'eliminazione della foto:', error);
      throw new Error('Impossibile eliminare la foto');
    }
  }

  // Gestione del progresso delle sfide
  static async updateChallengeProgress(guildId: string, challengeId: number, completed: boolean): Promise<void> {
    const progressData = {
      id: `${guildId}_${challengeId}`,
      guild_id: guildId,
      challenge_id: challengeId,
      completed: completed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const progressKey = `progress_${guildId}_${challengeId}`;
    localStorage.setItem(progressKey, JSON.stringify(progressData));
    
    console.log('✅ Progresso aggiornato:', { challengeId, completed });
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
          console.log(`✅ Progresso trovato per sfida ${i}:`, parsed.completed);
        } catch (error) {
          console.error('Errore nel parsing del progresso:', error);
        }
      }
    }
    
    console.log(`📊 Totale progress caricati per ${guildId}:`, progress.length);
    return progress.sort((a, b) => a.challenge_id - b.challenge_id);
  }

}