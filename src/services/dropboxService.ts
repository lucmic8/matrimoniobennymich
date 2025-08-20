import { Dropbox } from 'dropbox';

export class DropboxService {
  private static dbx: Dropbox | null = null;
  private static accessToken: string | null = null;
  private static refreshToken: string | null = null;
  private static appKey: string | null = null;
  private static appSecret: string | null = null;

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
      // Carica configurazione da variabili di ambiente
      this.loadEnvironmentConfig();
      
      // Prima prova con token salvato dall'utente
      const savedToken = localStorage.getItem('dropbox_access_token');
      if (savedToken && savedToken.length > 50) {
        this.initialize(savedToken);
        console.log('Dropbox inizializzato con token utente salvato');
        return this.verifyConnection();
      }
      
      // Prova con token da variabili di ambiente
      const envToken = import.meta.env.VITE_DROPBOX_ACCESS_TOKEN || import.meta.env.DROPBOX_ACCESS_TOKEN;
      if (envToken && envToken.length > 50) {
        this.initialize(envToken);
        console.log('✅ Dropbox inizializzato con token da variabili di ambiente');
        return this.verifyConnection();
      }
      
      console.warn('Nessun token Dropbox disponibile');
      return false;
    } catch (error) {
      console.error('Errore inizializzazione automatica Dropbox:', error);
      return false;
    }
  }

  // Carica configurazione da variabili di ambiente
  private static loadEnvironmentConfig() {
    this.refreshToken = import.meta.env.VITE_DROPBOX_REFRESH_TOKEN || import.meta.env.DROPBOX_REFRESH_TOKEN || null;
    this.appKey = import.meta.env.VITE_DROPBOX_APP_KEY || import.meta.env.DROPBOX_APP_KEY || null;
    this.appSecret = import.meta.env.VITE_DROPBOX_APP_SECRET || import.meta.env.DROPBOX_APP_SECRET || null;
    
    console.log('🔧 Configurazione Dropbox da env:', {
      hasRefreshToken: !!this.refreshToken,
      hasAppKey: !!this.appKey,
      hasAppSecret: !!this.appSecret
    });
  }

  // Refresh del token di accesso
  static async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken || !this.appKey || !this.appSecret) {
      console.warn('⚠️ Configurazione refresh token incompleta');
      return false;
    }

    try {
      console.log('🔄 Tentativo refresh token Dropbox...');
      
      const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.appKey,
          client_secret: this.appSecret
        })
      });

      if (!response.ok) {
        console.error('❌ Errore refresh token:', response.status, response.statusText);
        return false;
      }

      const data = await response.json();
      
      if (data.access_token) {
        // Aggiorna il token
        this.initialize(data.access_token);
        
        // Salva il nuovo token
        localStorage.setItem('dropbox_access_token', data.access_token);
        
        // Aggiorna il refresh token se fornito
        if (data.refresh_token) {
          this.refreshToken = data.refresh_token;
          localStorage.setItem('dropbox_refresh_token', data.refresh_token);
        }
        
        console.log('✅ Token Dropbox refreshato con successo');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Errore refresh token Dropbox:', error);
      return false;
    }
  }

  // Verifica se Dropbox è configurato
  static isConfigured(): boolean {
    return this.dbx !== null && this.accessToken !== null && this.accessToken.length > 0;
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
      console.error('❌ Token Dropbox non valido, provo refresh...');
      
      // Prova a refreshare il token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.verifyConnection();
      }
      
      return false;
    }
  }

  // ANALISI APPROFONDITA: Differenze PC vs Mobile
  static async uploadPhoto(file: File, guildId: string, challengeId: number): Promise<string> {
    console.log('🚀 Upload foto iniziato per:', { guildId, challengeId, fileName: file.name });

    if (!this.dbx) {
      throw new Error('Dropbox non configurato');
    }

    try {
      // Validazione file ultra-permissiva per mobile
      if (!this.isValidImageFile(file)) {
        throw new Error('File non valido per l\'upload');
      }

      // Genera percorso file con timestamp per evitare conflitti
      const fileExt = this.getFileExtension(file);
      const timestamp = Date.now();
      const fileName = `${guildId}_challenge_${challengeId}_${timestamp}.${fileExt}`;
      const filePath = `/sfida-cime/${guildId}/${fileName}`;

      console.log('📂 Percorso generato:', { fileName, filePath });

      // Converti file in ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      console.log('🔄 File convertito in ArrayBuffer:', arrayBuffer.byteLength, 'bytes');

      // STRATEGIA DIFFERENZIATA PC vs MOBILE
      let uploadResult;
      
      const environment = this.analyzeEnvironment();
      if (environment.isMobile) {
        console.log('📱 Strategia mobile attivata');
        uploadResult = await this.mobileUploadStrategy(arrayBuffer, filePath, file);
      } else {
        console.log('💻 Strategia PC attivata');
        uploadResult = await this.pcUploadStrategy(arrayBuffer, filePath);
      }

      if (!uploadResult) {
        throw new Error('Upload fallito con tutte le strategie');
      }

      // Crea link condiviso
      console.log('🔗 Creazione link condiviso...');
      const sharedLink = await this.createSharedLink(uploadResult.path_lower);
      
      console.log('✅ Upload completato con successo!');

      return sharedLink;
    } catch (error) {
      console.error('❌ Errore upload:', error);
      throw new Error(error instanceof Error ? error.message : 'Errore upload sconosciuto');
    }
  }

  // Analizza l'ambiente di esecuzione
  private static analyzeEnvironment() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    
    return {
      userAgent,
      isMobile,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      connection: (navigator as any).connection?.effectiveType || 'unknown'
    };
  }

  // Analizza il file caricato
  private static analyzeFile(file: File) {
    return {
      name: file.name || 'NO_NAME',
      size: file.size,
      type: file.type || 'NO_TYPE',
      lastModified: new Date(file.lastModified).toISOString(),
      sizeKB: (file.size / 1024).toFixed(2),
      sizeMB: (file.size / 1024 / 1024).toFixed(2),
      constructor: file.constructor.name,
      hasName: !!file.name,
      hasType: !!file.type,
      isImage: file.type.startsWith('image/') || !file.type,
      webkitRelativePath: (file as any).webkitRelativePath || 'N/A'
    };
  }

  // Analizza il browser
  private static analyzeBrowser() {
    return {
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      webdriver: (navigator as any).webdriver || false,
      permissions: 'permissions' in navigator,
      serviceWorker: 'serviceWorker' in navigator,
      geolocation: 'geolocation' in navigator
    };
  }

  // Strategia upload per PC (funzionante)
  private static async pcUploadStrategy(arrayBuffer: ArrayBuffer, filePath: string) {
    try {
      console.log('💻 PC: Upload diretto con SDK Dropbox');
      
      const result = await this.dbx!.filesUpload({
        path: filePath,
        contents: arrayBuffer,
        mode: 'add',
        autorename: true,
        mute: false
      });

      console.log('✅ PC: Upload SDK riuscito');

      return result.result;
    } catch (error) {
      console.error('❌ PC: Errore upload SDK', error);
      throw error;
    }
  }

  // Strategia upload per Mobile (da ottimizzare)
  private static async mobileUploadStrategy(arrayBuffer: ArrayBuffer, filePath: string, originalFile: File) {
    console.log('📱 Mobile: Tentativo strategie multiple');
    
    // Strategia 1: SDK Dropbox (come PC)
    try {
      console.log('📱 Strategia 1: SDK Dropbox');
      const result = await this.dbx!.filesUpload({
        path: filePath,
        contents: arrayBuffer,
        mode: 'add',
        autorename: true,
        mute: false
      });
      
      console.log('✅ Mobile: SDK riuscito!');
      return result.result;
    } catch (sdkError) {
      console.log('❌ Mobile: SDK fallito, provo fetch diretto');
    }

    // Strategia 2: Fetch diretto
    try {
      console.log('📱 Strategia 2: Fetch diretto');
      const fetchResult = await this.directFetchUpload(arrayBuffer, filePath);
      if (fetchResult) {
        console.log('✅ Mobile: Fetch riuscito!');
        return fetchResult;
      }
    } catch (fetchError) {
      console.log('❌ Mobile: Fetch fallito, provo FormData');
    }

    // Strategia 3: FormData
    try {
      console.log('📱 Strategia 3: FormData');
      const formResult = await this.formDataUpload(originalFile, filePath);
      if (formResult) {
        console.log('✅ Mobile: FormData riuscito!');
        return formResult;
      }
    } catch (formError) {
      console.log('❌ Mobile: FormData fallito, provo Base64');
    }

    // Strategia 4: Base64
    try {
      console.log('📱 Strategia 4: Base64');
      const base64Result = await this.base64Upload(originalFile, filePath);
      if (base64Result) {
        console.log('✅ Mobile: Base64 riuscito!');
        return base64Result;
      }
    } catch (base64Error) {
      console.error('❌ Mobile: Base64 fallito', base64Error);
    }

    throw new Error('Tutte le strategie mobile sono fallite');
  }

  // Upload diretto con fetch
  private static async directFetchUpload(arrayBuffer: ArrayBuffer, filePath: string) {
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: filePath,
          mode: 'add',
          autorename: true,
          mute: false
        })
      },
      body: arrayBuffer
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  // Upload con FormData
  private static async formDataUpload(file: File, filePath: string) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: filePath,
          mode: 'add',
          autorename: true
        })
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`FormData HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  // Upload con Base64
  private static async base64Upload(file: File, filePath: string) {
    const base64Data = await this.fileToBase64(file);
    const base64Content = base64Data.split(',')[1];

    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'text/plain',
        'Dropbox-API-Arg': JSON.stringify({
          path: filePath,
          mode: 'add',
          autorename: true
        })
      },
      body: base64Content
    });

    if (!response.ok) {
      throw new Error(`Base64 HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Ottieni l'estensione del file in modo sicuro
  private static getFileExtension(file: File): string {
    console.log('Determinazione estensione per:', { name: file.name, type: file.type });
    
    // Prima prova con il nome del file
    if (file.name && file.name.includes('.')) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        console.log('Estensione da nome file:', ext);
        return ext;
      }
    }
    
    // Fallback basato sul tipo MIME
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/octet-stream': 'jpg', // Fallback per foto da telefono
      '': 'jpg' // Fallback per file senza tipo MIME
    };
    
    const extension = mimeToExt[file.type] || 'jpg';
    console.log('Estensione determinata:', extension);
    return extension;
  }

  // Crea link condiviso con gestione errori
  private static async createSharedLink(filePath: string): Promise<string> {
    console.log('🔗 Tentativo creazione link per:', filePath);
    
    // Prima controlla se esiste già un link per questo file
    try {
      console.log('🔗 Strategia 0: Cerca link esistenti');
      const existingLinks = await this.dbx!.sharingListSharedLinks({
        path: filePath,
        direct_only: true
      });
      
      if (existingLinks.result.links && existingLinks.result.links.length > 0) {
        const existingUrl = existingLinks.result.links[0].url.replace('?dl=0', '?raw=1');
        console.log('✅ Link esistente trovato');
        return existingUrl;
      }
      console.log('ℹ️ Nessun link esistente trovato');
    } catch (existingError) {
      console.log('⚠️ Errore ricerca link esistenti');
    }

    // Strategia 1: Link semplice (più compatibile)
    try {
      console.log('🔗 Strategia 1: Link semplice');
      const simpleLinkResponse = await this.dbx!.sharingCreateSharedLink({
        path: filePath
      });
      const finalUrl = simpleLinkResponse.result.url.replace('?dl=0', '?raw=1');
      console.log('✅ Link semplice creato');
      return finalUrl;
    } catch (simpleLinkError) {
      console.log('❌ Link semplice fallito, provo con settings');
      
      // Strategia 2: Link con settings (più specifico)
      try {
        console.log('🔗 Strategia 2: Link con settings');
        const sharedLink = await this.dbx!.sharingCreateSharedLinkWithSettings({
          path: filePath,
          settings: {
            requested_visibility: 'public',
            audience: 'public',
            access: 'viewer'
          }
        });
        const finalUrl = sharedLink.result.url.replace('?dl=0', '?raw=1');
        console.log('✅ Link con settings creato');
        return finalUrl;
      } catch (linkError) {
        console.log('❌ Link con settings fallito');
      }
    }

    // Strategia 3: Prova con settings minimi
    try {
      console.log('🔗 Strategia 3: Settings minimi');
      const minimalLink = await this.dbx!.sharingCreateSharedLinkWithSettings({
        path: filePath,
        settings: {
          requested_visibility: 'public'
        }
      });
      const finalUrl = minimalLink.result.url.replace('?dl=0', '?raw=1');
      console.log('✅ Link settings minimi creato');
      return finalUrl;
    } catch (minimalError) {
      console.log('❌ Link settings minimi fallito');
    }

    // Strategia 4: Controlla di nuovo se il link è stato creato nel frattempo
    try {
      console.log('🔗 Strategia 4: Ricontrolla link esistenti');
      const recheckLinks = await this.dbx!.sharingListSharedLinks({
        path: filePath,
        direct_only: true
      });
      
      if (recheckLinks.result.links && recheckLinks.result.links.length > 0) {
        const existingUrl = recheckLinks.result.links[0].url.replace('?dl=0', '?raw=1');
       console.log('✅ Link trovato al ricontrollo');
        return existingUrl;
      }
    } catch (recheckError) {
     console.log('❌ Ricontrollo fallito');
    }

    // Strategia 5: Prova con path diverso (senza caratteri speciali)
    try {
      const safePath = filePath.replace(/[^a-zA-Z0-9\/\-_.]/g, '_');
      if (safePath !== filePath) {
        console.log('🔗 Strategia 5: Path sicuro');
        try {
          // Prima rinomina il file
          await this.dbx!.filesMoveV2({
            from_path: filePath,
            to_path: safePath,
            autorename: true
          });
          
          // Poi crea il link
          const safeLink = await this.dbx!.sharingCreateSharedLink({
            path: safePath
          });
          const finalUrl = safeLink.result.url.replace('?dl=0', '?raw=1');
          console.log('✅ Link path sicuro creato');
          return finalUrl;
        } catch (safeError) {
          console.log('❌ Path sicuro fallito');
        }
      }
    } catch (pathError) {
      console.log('❌ Strategia path sicuro fallita');
    }

    // Strategia finale: URL diretto costruito
    console.log('🔗 Strategia finale: URL diretto costruito');
    
    // Estrai informazioni dal path per costruire URL diretto
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    // Costruisci URL diretto basato sulla struttura Dropbox
    const directUrl = `https://dl.dropboxusercontent.com/s/auto${filePath}`;
    console.log('⚠️ Usando URL diretto costruito');
    
    return directUrl;
  }

  // Verifica che il file sia un'immagine valida
  private static isValidImageFile(file: File): boolean {
    console.log('🔍 Validazione file:', { name: file.name, type: file.type, size: file.size });
    
    // VALIDAZIONE ULTRA-PERMISSIVA PER MOBILE
    
    // 1. Verifica che il file abbia contenuto (priorità assoluta)
    if (file.size === 0) {
      console.log('❌ File vuoto');
      return false;
    }
    
    // 2. Verifica dimensione minima ragionevole per un'immagine
    if (file.size < 50) {
      console.log('❌ File troppo piccolo:', file.size);
      return false;
    }
    
    // 3. REGOLA MOBILE: Se ha dimensione > 1KB, è probabilmente un'immagine valida
    if (file.size >= 1000) {
      console.log('✅ File >1KB - accettato automaticamente');
      return true;
    }
    
    // 4. Per file più piccoli, controlli aggiuntivi
    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/octet-stream', // File generici da mobile
      '', // File senza tipo MIME
      'image/heic', 'image/heif' // Formati iPhone
    ];
    
    // 5. Se ha tipo MIME valido o è vuoto, accetta
    if (!file.type || validTypes.includes(file.type)) {
      console.log('✅ Tipo MIME valido - accettato');
      return true;
    }
    
    // 6. Controlla l'estensione se presente
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];
    if (file.name && file.name.includes('.')) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && validExtensions.includes(ext)) {
        console.log('✅ Estensione valida - accettato');
        return true;
      }
    }
    
    // 7. FALLBACK FINALE: Se è arrivato qui e ha dimensione > 50 bytes, accetta comunque
    console.log('✅ Fallback - accettato');
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
    // Funzione rimossa - non più utilizzata
    console.log('uploadDataFile: Funzione deprecata');
  }

  // Carica un file di dati JSON da Dropbox
  static async loadDataFile(guildId: string): Promise<any> {
    // Funzione rimossa - non più utilizzata
    console.log('loadDataFile: Funzione deprecata');
    return null;
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