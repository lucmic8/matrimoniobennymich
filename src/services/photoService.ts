import { DropboxService } from './dropboxService'
import { SupabaseService } from './supabaseService'

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
  // Inizializza i servizi
  static initialize() {
    SupabaseService.initialize();
  }

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
      
      // Carica su Dropbox SOLO tramite backend
      let photoUrl: string;
      try {
        console.log('=== 📤 CARICAMENTO SU DROPBOX TRAMITE SERVER ===');
        
        // Prepara FormData per l'upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('guildId', guildId);
        formData.append('challengeId', challengeId.toString());
        
        // Invia al backend
        const response = await fetch('/api/upload-dropbox', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            const errorText = await response.text();
            throw new Error(`Errore server: ${response.status} - ${errorText}`);
          }
          throw new Error(errorData.error || `Errore server: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Upload fallito');
        }
        
        photoUrl = result.photoUrl;
        
        console.log('✅ Caricamento Dropbox tramite server completato:', photoUrl.substring(0, 100) + '...');
      } catch (error) {
        console.error('❌ Errore caricamento tramite server:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
        
        // Messaggio di errore più specifico
        let errorMessage = 'Impossibile caricare la foto';
        if (error instanceof Error) {
          if (error.message.includes('server') || error.message.includes('500')) {
            errorMessage += ': Errore del server';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += ': Problema di connessione internet';
          } else if (error.message.includes('413')) {
            errorMessage += ': File troppo grande per il server';
          } else if (error.message.includes('token') || error.message.includes('unauthorized')) {
            errorMessage += ': Problema di autenticazione Dropbox';
          } else {
            errorMessage += ': ' + error.message;
          }
        }
        throw new Error(errorMessage);
      }

      // Salva i metadati localmente e sincronizza
      console.log('=== 💾 SALVATAGGIO METADATI ===');
      await this.savePhotoMetadata(guildId, challengeId, photoUrl);
      
      // Prova a salvare su Supabase
      try {
        await SupabaseService.savePhoto(guildId, challengeId, photoUrl);
        console.log('✅ Foto salvata anche su Supabase');
      } catch (supabaseError) {
        console.warn('⚠️ Impossibile salvare su Supabase, continuo con storage locale');
      }
      
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
    // Prima prova con Supabase
    try {
      const supabasePhotos = await SupabaseService.getGuildPhotos(guildId);
      if (supabasePhotos.length > 0) {
        console.log(`📸 Caricate ${supabasePhotos.length} foto da Supabase per ${guildId}`);
        return supabasePhotos;
      }
    } catch (error) {
      console.warn('⚠️ Errore caricamento da Supabase, uso storage locale');
    }

    // Fallback a storage locale
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
    // Prima prova con Supabase
    try {
      const supabasePhotos = await SupabaseService.getGuildPhotos(guildId);
      const photo = supabasePhotos.find(p => p.challenge_id === challengeId);
      if (photo) {
        console.log(`📸 Foto specifica trovata su Supabase per sfida ${challengeId}`);
        return photo;
      }
    } catch (error) {
      console.warn('⚠️ Errore caricamento da Supabase, uso storage locale');
    }

    // Fallback a storage locale
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
      // Elimina da Supabase
      try {
        await SupabaseService.deletePhoto(guildId, challengeId);
        console.log('🗑️ Foto eliminata da Supabase');
      } catch (supabaseError) {
        console.warn('⚠️ Errore eliminazione da Supabase');
      }

      // Elimina da Dropbox tramite backend
      const photo = await this.getChallengePhoto(guildId, challengeId);
      if (photo && photo.photo_url.includes('dropbox')) {
        try {
          const response = await fetch('/api/delete-dropbox', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              photoUrl: photo.photo_url,
              guildId,
              challengeId
            })
          });
          
          if (response.ok) {
            console.log('🗑️ Foto eliminata da Dropbox tramite backend');
          } else {
            console.warn('⚠️ Errore eliminazione Dropbox tramite backend');
          }
        } catch (error) {
          console.warn('Errore eliminazione Dropbox tramite backend:', error);
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
    // Salva su Supabase
    try {
      await SupabaseService.saveProgress(guildId, challengeId, completed);
      console.log('✅ Progresso salvato su Supabase');
    } catch (supabaseError) {
      console.warn('⚠️ Impossibile salvare progresso su Supabase, uso storage locale');
    }

    // Salva localmente
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
    // Prima prova con Supabase
    try {
      const supabaseProgress = await SupabaseService.getGuildProgress(guildId);
      if (supabaseProgress.length > 0) {
        console.log(`📊 Caricato progresso da Supabase per ${guildId}:`, supabaseProgress.length);
        return supabaseProgress;
      }
    } catch (error) {
      console.warn('⚠️ Errore caricamento progresso da Supabase, uso storage locale');
    }

    // Fallback a storage locale
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

  // Test connessioni
  static async testConnections(): Promise<{ supabase: boolean; dropbox: boolean }> {
    const supabaseTest = await SupabaseService.testConnection();
    
    // Test connessione Dropbox tramite server
    let dropboxTest = false;
    try {
      const response = await fetch('/api/test-dropbox');
      if (response.ok) {
        const result = await response.json();
        dropboxTest = result.success;
      }
    } catch (error) {
      console.warn('Test Dropbox fallito:', error);
    }
    
    console.log('🔍 Test connessioni:', { supabase: supabaseTest, dropbox: dropboxTest });
    
    return {
      supabase: supabaseTest,
      dropbox: dropboxTest
    };
  }
}