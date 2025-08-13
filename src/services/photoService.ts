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
      console.log('=== INIZIO CARICAMENTO FOTO ===');
      console.log('File info:', { 
        name: file.name || 'FOTO_DA_TELEFONO', 
        size: file.size, 
        type: file.type || 'TIPO_NON_SPECIFICATO',
        lastModified: file.lastModified 
      });
      
      // Verifica che il file sia valido
      if (!file || file.size === 0) {
        console.error('File non valido:', { file, size: file?.size });
        throw new Error('File non valido o vuoto');
      }

      // Verifica che sia un'immagine (più permissiva per foto da telefono)
      const isValidImageType = file.type.startsWith('image/') || 
                              file.type === 'application/octet-stream' || 
                              file.type === '' ||
                              file.size > 1000; // Se ha dimensione ragionevole, probabilmente è un'immagine
      
      if (!isValidImageType) {
        console.error('Tipo file non valido:', file.type);
        throw new Error('Il file deve essere un\'immagine. Tipo rilevato: ' + (file.type || 'sconosciuto'));
      }

      // Verifica dimensione minima e massima
      if (file.size < 100) {
        throw new Error('Il file è troppo piccolo per essere un\'immagine valida');
      }
      
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Il file è troppo grande (max 50MB)');
      }
      
      // Assicurati che Dropbox sia sempre configurato
      if (!DropboxService.isConfigured()) {
        console.log('Dropbox non configurato, inizializzo automaticamente...');
        if (!DropboxService.initializeWithDefaultToken()) {
          console.error('Impossibile inizializzare Dropbox automaticamente');
          throw new Error('Impossibile configurare Dropbox automaticamente');
        }
        console.log('Dropbox inizializzato con successo');
      }

      // Carica sempre su Dropbox
      let photoUrl: string;
      try {
        console.log('=== CARICAMENTO SU DROPBOX ===');
        photoUrl = await DropboxService.uploadPhoto(file, guildId, challengeId);
        console.log('✅ Caricamento Dropbox completato:', photoUrl);
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
      console.log('=== SALVATAGGIO METADATI ===');
      await this.savePhotoMetadata(guildId, challengeId, photoUrl);
      await this.syncDataToDropbox(guildId);
      
      console.log('✅ CARICAMENTO COMPLETATO CON SUCCESSO');
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

  // Sincronizza tutti i dati di una gilda su Dropbox
  static async syncDataToDropbox(guildId: string): Promise<void> {
    // Assicurati che Dropbox sia sempre configurato
    if (!DropboxService.isConfigured()) {
      console.log('Dropbox non configurato, inizializzo automaticamente...');
      if (!DropboxService.initializeWithDefaultToken()) {
        console.error('Impossibile configurare Dropbox per sincronizzazione');
        return;
      }
    }

    try {
      // Raccogli tutti i dati della gilda
      const guildData = {
        photos: {} as Record<number, any>,
        progress: {} as Record<number, any>,
        lastSync: new Date().toISOString()
      };

      // Raccogli foto e metadati
      for (let i = 1; i <= 15; i++) {
        const metadataKey = `metadata_${guildId}_${i}`;
        const progressKey = `progress_${guildId}_${i}`;
        
        const photoMetadata = localStorage.getItem(metadataKey);
        const progressData = localStorage.getItem(progressKey);
        
        if (photoMetadata) {
          try {
            guildData.photos[i] = JSON.parse(photoMetadata);
          } catch (e) {
            console.warn(`Errore parsing metadata per sfida ${i}:`, e);
          }
        }
        
        if (progressData) {
          try {
            guildData.progress[i] = JSON.parse(progressData);
          } catch (e) {
            console.warn(`Errore parsing progress per sfida ${i}:`, e);
          }
        }
      }

      // Salva il file di sincronizzazione su Dropbox
      const dataBlob = new Blob([JSON.stringify(guildData, null, 2)], { 
        type: 'application/json' 
      });
      const dataFile = new File([dataBlob], `${guildId}_data.json`, { 
        type: 'application/json' 
      });

      await DropboxService.uploadDataFile(dataFile, guildId);
      
      // Salva timestamp ultima sincronizzazione
      localStorage.setItem(`lastSync_${guildId}`, new Date().toISOString());
      
      console.log('Sincronizzazione completata per gilda:', guildId);
    } catch (error) {
      console.error('Errore nella sincronizzazione:', error);
      // Non lanciare errore per non bloccare l'operazione principale
    }
  }

  // Carica i dati sincronizzati da Dropbox
  static async loadSyncedData(guildId: string): Promise<void> {
    // Assicurati che Dropbox sia sempre configurato
    if (!DropboxService.isConfigured()) {
      console.log('Dropbox non configurato, inizializzo automaticamente...');
      if (!DropboxService.initializeWithDefaultToken()) {
        console.error('Impossibile configurare Dropbox per caricamento dati');
        return;
      }
    }

    try {
      console.log('Caricamento dati sincronizzati per gilda:', guildId);
      
      const syncedData = await DropboxService.loadDataFile(guildId);
      if (!syncedData) {
        console.log('Nessun dato sincronizzato trovato');
        return;
      }

      // Controlla se i dati remoti sono più recenti
      const localLastSync = localStorage.getItem(`lastSync_${guildId}`);
      const remoteLastSync = syncedData.lastSync;
      
      if (localLastSync && remoteLastSync) {
        const localDate = new Date(localLastSync);
        const remoteDate = new Date(remoteLastSync);
        
        if (localDate >= remoteDate) {
          console.log('Dati locali più recenti, skip caricamento');
          return;
        }
      }

      // Applica i dati sincronizzati
      console.log('Applicazione dati sincronizzati...');
      
      // Applica foto e metadati
      Object.entries(syncedData.photos || {}).forEach(([challengeId, metadata]) => {
        const photoKey = `photo_${guildId}_${challengeId}`;
        const metadataKey = `metadata_${guildId}_${challengeId}`;
        
        localStorage.setItem(photoKey, (metadata as any).photo_url);
        localStorage.setItem(metadataKey, JSON.stringify(metadata));
      });

      // Applica progresso
      Object.entries(syncedData.progress || {}).forEach(([challengeId, progress]) => {
        const progressKey = `progress_${guildId}_${challengeId}`;
        localStorage.setItem(progressKey, JSON.stringify(progress));
      });

      // Aggiorna timestamp locale
      localStorage.setItem(`lastSync_${guildId}`, syncedData.lastSync);
      
      console.log('Dati sincronizzati applicati con successo');
    } catch (error) {
      console.error('Errore nel caricamento dati sincronizzati:', error);
      // Non lanciare errore per non bloccare l'app
    }
  }

  // Ottieni tutte le foto di una gilda
  static async getGuildPhotos(guildId: string): Promise<ChallengePhoto[]> {
    // Prima carica i dati sincronizzati
    await this.loadSyncedData(guildId);
    
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
    // Prima carica i dati sincronizzati
    await this.loadSyncedData(guildId);
    
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
      
      // Sincronizza la rimozione
      await this.syncDataToDropbox(guildId);
      
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
    
    // Sincronizza su Dropbox
    await this.syncDataToDropbox(guildId);
  }

  // Ottieni il progresso di una gilda
  static async getGuildProgress(guildId: string): Promise<GuildProgress[]> {
    // Prima carica i dati sincronizzati
    await this.loadSyncedData(guildId);
    
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

  // Forza sincronizzazione manuale
  static async forceSyncGuild(guildId: string): Promise<void> {
    console.log('Forzando sincronizzazione per gilda:', guildId);
    
    // Prima carica i dati remoti
    await this.loadSyncedData(guildId);
    
    // Poi sincronizza i dati locali
    await this.syncDataToDropbox(guildId);
    
    console.log('Sincronizzazione forzata completata');
  }
}