import { Dropbox } from 'dropbox';

export class DropboxService {
  private static dbx: Dropbox | null = null;
  private static accessToken: string | null = null;
  
  // IMPORTANTE: Il token predefinito potrebbe essere scaduto
  // Gli utenti devono configurare il proprio token Dropbox
  private static readonly DEFAULT_ACCESS_TOKEN = '';

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
      // Prima prova con token salvato dall'utente
      const savedToken = localStorage.getItem('dropbox_access_token');
      if (savedToken && savedToken.length > 50) {
        this.initialize(savedToken);
        console.log('Dropbox inizializzato con token utente salvato');
        return this.verifyConnection();
      }
      
      // Fallback al token predefinito (se presente)
      if (this.DEFAULT_ACCESS_TOKEN && this.DEFAULT_ACCESS_TOKEN.length > 50) {
        this.initialize(this.DEFAULT_ACCESS_TOKEN);
        console.log('Dropbox inizializzato con token predefinito');
        return this.verifyConnection();
      }
      
      console.warn('Nessun token Dropbox disponibile');
      return false;
    } catch (error) {
      console.error('Errore inizializzazione automatica Dropbox:', error);
      return false;
    }
  }

  // Verifica la connessione Dropbox
  private static async verifyConnection(): Promise<boolean> {
    try {
      if (!this.dbx) return false;
      
      // Test rapido per verificare che il token funzioni
      await this.dbx.usersGetCurrentAccount();
      console.log('✅ Connessione Dropbox verificata');
      return true;
    } catch (error) {
      console.error('❌ Token Dropbox non valido:', error);
      // Reset se il token non funziona
      this.dbx = null;
      this.accessToken = null;
      return false;
    }
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
    // Verifica e inizializza Dropbox se necessario
    if (!this.isConfigured()) {
      console.log('Dropbox non configurato, tentativo di inizializzazione...');
      const initialized = await this.initializeWithDefaultToken();
      if (!initialized) {
        throw new Error('❌ DROPBOX NON CONFIGURATO\n\nDevi configurare il tuo token Dropbox personale:\n1. Vai su https://www.dropbox.com/developers/apps\n2. Crea una nuova app\n3. Genera un token di accesso\n4. Inseriscilo nelle impostazioni del sito');
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
        console.log('Creazione link condiviso...');
        sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
          path: response.result.path_lower!,
          settings: {
            requested_visibility: 'public'
          }
        });
        console.log('Link condiviso creato:', sharedLink.result.url);
      } catch (linkError) {
        console.warn('Errore creazione link condiviso, tentativo con metodo alternativo:', linkError);
        
        // Fallback: prova con metodo semplice
        try {
          const simpleLinkResponse = await this.dbx.sharingCreateSharedLink({
            path: response.result.path_lower!
          });
          sharedLink = simpleLinkResponse;
          console.log('Link semplice creato:', sharedLink.result.url);
        } catch (simpleLinkError) {
          console.error('Anche il link semplice è fallito:', simpleLinkError);
          throw new Error('Impossibile creare link condiviso per la foto');
        }
      }

      // Converti il link Dropbox in un link diretto per le immagini
      const directLink = sharedLink.result.url.replace('?dl=0', '?raw=1');
      console.log('Link diretto creato:', directLink);
      
      return directLink;
    } catch (error) {
      console.error('Errore nel caricamento su Dropbox:', error);
      
      // Errori specifici più utili
      if (error instanceof Error) {
        if (error.message.includes('invalid_access_token') || error.message.includes('expired_access_token')) {
          throw new Error('❌ TOKEN DROPBOX SCADUTO\n\nIl tuo token di accesso Dropbox è scaduto o non valido.\nDevi generarne uno nuovo su https://www.dropbox.com/developers/apps');
        } else if (error.message.includes('insufficient_space')) {
          throw new Error('❌ SPAZIO DROPBOX INSUFFICIENTE\n\nNon hai abbastanza spazio su Dropbox per caricare la foto.');
        } else if (error.message.includes('rate_limit')) {
          throw new Error('❌ TROPPI CARICAMENTI\n\nHai superato il limite di caricamenti Dropbox. Riprova tra qualche minuto.');
        }
      }
      
      throw new Error('❌ ERRORE CARICAMENTO DROPBOX\n\n' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
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