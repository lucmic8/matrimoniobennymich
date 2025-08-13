import { Dropbox } from 'dropbox';

export class DropboxService {
  private static dbx: Dropbox | null = null;
  private static accessToken: string | null = null;
  
  // Token di accesso Dropbox aggiornato
  private static readonly DEFAULT_ACCESS_TOKEN = 'sl.u.AF6tfAApzv0qFDTuYAaNhOgjQjgn3mjvJKa6pqqfVtfqZj3HNEYufcSkghT_KMD8TrG1gGQ4arBD1sL-FX4E-dbAZfrN5G961rTiCxQjiqVj9f0ePIEp5lYfSw3XH-ylQflS9GLLBHcH0nwCjgyYnXf5TRZSOyTChIhRitlDWnlYuczuab3HDF343Mpob2ZucRW6GBAXKpFrBqRxJpUMcREZycWWFDSxjB2UVmPzHWKep5j5WNikxs-vuF17hif4cMzNP1zQJveE_EmyGuajX9diCb7p1cql0lfSiC-s97Mbc-Qrs4xB07cQUof6IzympOO0psTH6E6D0HE8tDHbHM2-GS_tDAuq6RMpPms8aW6IJfmLtVMDh5fb2Bl024OcP8dPoDdjGMBMYeOsp169g8uKpt6q6DmINN8dHQLrheKVZ0cRqYY7-IxW0pY1EaNvghKX-DYdTsK6ZF0y4qSov9HN-Ar76G5_oFmegffoT5AZG3iJsAk4qtn5dSxfNPWvMWH91E6dOXrgpeCTqhWMhf8ET5Pz0IRICaaWWcZfp4ejQQhWizbApzc7EtDZi-4AE5wcuQhE05HcO719U6gM73gSFwxv9gN4WXOlWekw3cVcLbgvdOxmNjZ7BxoruhgfWFpGv48dAByH1vQkzXc-aPzKoLYVVqB2P6_nadaECXDAuJOaOLD2TkCjWGqeouIqxj4oz5haTYJPn-lu5i_dBzMI51qqdrtqrx1MnQbRGKC2AKq-RoSIO6wUlXs2QVDXsCP3-idMjMyUaytCaeUcmvbhxFiltkkeQqH3-Jsj1BwMBaBZ1S5Ki3Xighjqx1YKo9s4qk_dw8_JdCs0dez7RiSYSY7yek9DkIZGgHSblOi8QuBXFUSZ4SKqvjPFBcFT7w4C1sKDW9-AMnhrpWnKcxi4OYtlALzN3K6FGkHbm82-1QElXS103hfujqWivdGomH_dF_DTwicFg5XVQLRQT9Ta0LJgcY0KkgfPgGTbQwiAAbKLMFxSOVWt3WffeFViXNk3MgfWuv-l6V_P50XIqM1O8S8emAN3vC940ga4d34SMD6t7q-8fR0exdzU8vYIiXlDhEUUfuM2Cwu_GoQk0AqN1z2lbKKyB6HltYvsTZGyY1dDXkO8-oSPt-pWr7xTFFl-qYNV5viKUj5w7g3Kp8fbjvnN0zgIvyreJ6bUHocFpHxtxuc0shmAisP2C6A1keJda0bNTroxxKsAsSS8fstHPzUjz4QgnEmKtfm2bwmFRZ-VvYCM7An1gYLQUZ-6DOqz6YRxBOZBFpDMKKa2qlFUSWTMjXXRy4IrTM-rTWviLx7fIaibfDUrr3i13rjo6bXb73tpvzTpGPuI8dBaUr3s_xbTa5ZBZ-BukqDlN5VZsZnQnVAzBgQwGdb_0e-7qWD2W_8LUKxpR1WROP637qpbSzHkdrrKuJ5re40eV5NMmQ';

  // Inizializza Dropbox con il token di accesso
  static initialize(accessToken: string) {
    this.accessToken = accessToken;
    this.dbx = new Dropbox({ 
      accessToken: accessToken,
      fetch: fetch
    });
  }

  // Inizializzazione automatica con token predefinito
  static initializeWithDefaultToken() {
    try {
      if (this.DEFAULT_ACCESS_TOKEN && this.DEFAULT_ACCESS_TOKEN.length > 50) {
        this.initialize(this.DEFAULT_ACCESS_TOKEN);
        console.log('Dropbox inizializzato automaticamente con token predefinito');
        return true;
      }
    } catch (error) {
      console.error('Errore inizializzazione automatica Dropbox:', error);
    }
    console.error('Token predefinito non valido o mancante');
    return false;
  }

  // Inizializzazione sicura con fallback
  static initializeWithFallback() {
    try {
      this.initialize(this.DEFAULT_ACCESS_TOKEN);
      return true;
    } catch (error) {
      console.warn('Dropbox non disponibile, uso fallback locale:', error);
      return false;
    }
  }

  // Verifica se Dropbox è configurato
  static isConfigured(): boolean {
    return this.dbx !== null && this.accessToken !== null;
  }

  // Carica una foto su Dropbox
  static async uploadPhoto(file: File, guildId: string, challengeId: number): Promise<string> {
    if (!this.dbx) {
      console.error('Dropbox non configurato, tentativo di inizializzazione...');
      if (!this.initializeWithDefaultToken()) {
        throw new Error('Dropbox non configurato. Impossibile inizializzare automaticamente.');
      }
    }

    try {
      console.log('Upload Dropbox - File info:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });
      
      const fileExt = this.getFileExtension(file);
      const fileName = `${guildId}_challenge_${challengeId}_${Date.now()}.${fileExt}`;
      const filePath = `/sfida-cime/${guildId}/${fileName}`;

      // Converti il file in ArrayBuffer con gestione errori migliorata
      let arrayBuffer: ArrayBuffer;
      try {
        arrayBuffer = await file.arrayBuffer();
        console.log('ArrayBuffer creato, dimensione:', arrayBuffer.byteLength, 'bytes');
      } catch (error) {
        console.error('Errore nella conversione ArrayBuffer:', error);
        throw new Error('Impossibile elaborare il file immagine');
      }

      if (arrayBuffer.byteLength === 0) {
        throw new Error('File vuoto o corrotto');
      }

      // Verifica che il file sia effettivamente un'immagine
      if (!this.isValidImageFile(file)) {
        throw new Error('Il file selezionato non è un\'immagine valida');
      }

      // Carica il file su Dropbox
      console.log('Caricamento su Dropbox path:', filePath);
      const response = await this.dbx.filesUpload({
        path: filePath,
        contents: arrayBuffer,
        mode: 'overwrite',
        autorename: true
      });
      
      console.log('Upload completato:', response.result.name);

      // Crea un link condiviso per il file con retry
      let sharedLink;
      try {
        sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
          path: response.result.path_lower!,
          settings: {
            requested_visibility: 'public'
          }
        });
      } catch (linkError) {
        console.warn('Errore creazione link condiviso, tentativo con metodo alternativo:', linkError);
        // Fallback: usa il path diretto
        return `https://dl.dropboxusercontent.com/s/${response.result.id}/${fileName}`;
      }

      // Converti il link Dropbox in un link diretto per le immagini
      const directLink = sharedLink.result.url.replace('?dl=0', '?raw=1');
      console.log('Link diretto creato:', directLink);
      
      return directLink;
    } catch (error) {
      console.error('Errore nel caricamento su Dropbox:', error);
      throw new Error('Impossibile caricare la foto su Dropbox');
    }
  }

  // Ottieni l'estensione del file in modo sicuro
  private static getFileExtension(file: File): string {
    // Prima prova con il nome del file
    if (file.name && file.name.includes('.')) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return ext;
      }
    }
    
    // Fallback basato sul tipo MIME
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp'
    };
    
    return mimeToExt[file.type] || 'jpg';
  }

  // Verifica che il file sia un'immagine valida
  private static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    // Controlla il tipo MIME
    if (!validTypes.includes(file.type)) {
      console.warn('Tipo MIME non valido:', file.type);
      return false;
    }
    
    // Controlla l'estensione se presente
    if (file.name && file.name.includes('.')) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && !validExtensions.includes(ext)) {
        console.warn('Estensione non valida:', ext);
        return false;
      }
    }
    
    return true;
  }

  // Elimina una foto da Dropbox
  static async deletePhoto(photoUrl: string): Promise<void> {
    if (!this.dbx) {
      throw new Error('Dropbox non configurato');
    }

    try {
      // Estrai il path dal URL condiviso di Dropbox
      const urlParts = photoUrl.split('/');
      const fileId = urlParts[urlParts.length - 1].split('?')[0];
      
      // Cerca il file per eliminarlo (questo è un approccio semplificato)
      // In un'implementazione più robusta, dovresti salvare il path completo
      const searchResults = await this.dbx.filesSearchV2({
        query: fileId,
        options: {
          path: '/sfida-cime',
          max_results: 1
        }
      });

      if (searchResults.result.matches && searchResults.result.matches.length > 0) {
        const match = searchResults.result.matches[0];
        if (match.metadata && match.metadata['.tag'] === 'metadata') {
          await this.dbx.filesDeleteV2({
            path: match.metadata.path_lower!
          });
        }
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione da Dropbox:', error);
      // Non lanciamo errore per l'eliminazione, potrebbe essere già stato eliminato
    }
  }

  // Lista le foto di una gilda (opzionale, per future implementazioni)
  static async listGuildPhotos(guildId: string): Promise<string[]> {
    if (!this.dbx) {
      return [];
    }

    try {
      const result = await this.dbx.filesListFolder({
        path: `/sfida-cime/${guildId}`,
        recursive: false
      });

      const photoUrls: string[] = [];
      
      for (const entry of result.result.entries) {
        if (entry['.tag'] === 'file' && entry.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
          try {
            const sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
              path: entry.path_lower!,
              settings: {
                requested_visibility: 'public'
              }
            });
            const directLink = sharedLink.result.url.replace('?dl=0', '?raw=1');
            photoUrls.push(directLink);
          } catch (linkError) {
            console.warn('Impossibile creare link per:', entry.name);
          }
        }
      }

      return photoUrls;
    } catch (error) {
      console.error('Errore nel listing delle foto:', error);
      return [];
    }
  }

  // Carica un file di dati JSON su Dropbox
  static async uploadDataFile(file: File, guildId: string): Promise<void> {
    if (!this.dbx) {
      console.warn('Dropbox non configurato per upload dati');
      return;
    }

    try {
      const filePath = `/sfida-cime/${guildId}/${guildId}_data.json`;
      const arrayBuffer = await file.arrayBuffer();

      await this.dbx.filesUpload({
        path: filePath,
        contents: arrayBuffer,
        mode: 'overwrite',
        autorename: false
      });

      console.log('File dati sincronizzato su Dropbox:', filePath);
    } catch (error) {
      console.error('Errore nel caricamento file dati:', error);
      // Non lanciare errore per non bloccare l'operazione principale
    }
  }

  // Carica un file di dati JSON da Dropbox
  static async loadDataFile(guildId: string): Promise<any> {
    if (!this.dbx) {
      return null;
    }

    try {
      const filePath = `/sfida-cime/${guildId}/${guildId}_data.json`;
      
      const response = await this.dbx.filesDownload({
        path: filePath
      });

      // Converti il blob in testo
      const fileBlob = (response.result as any).fileBinary;
      const text = new TextDecoder().decode(fileBlob);
      
      return JSON.parse(text);
    } catch (error) {
      console.log('Nessun file dati trovato su Dropbox per gilda:', guildId);
      return null;
    }
  }

  // Ottieni informazioni sull'account Dropbox
  static async getAccountInfo(): Promise<any> {
    if (!this.dbx) {
      console.error('Dropbox non configurato per getAccountInfo');
      if (!this.initializeWithDefaultToken()) {
        throw new Error('Dropbox non configurato');
      }
    }

    try {
      const response = await this.dbx.usersGetCurrentAccount();
      console.log('Account Dropbox verificato:', response.result.name?.display_name);
      return response.result;
    } catch (error) {
      console.error('Errore nel recupero info account:', error);
      throw new Error('Impossibile verificare l\'account Dropbox: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  }
}