import { Dropbox } from 'dropbox';

// Sistema di debug mobile
class MobileDebugger {
  static log(message: string, data?: any) {
    const timestamp = new Date().toLocaleTimeString();
    const fullMessage = `[${timestamp}] ${message}`;
    
    console.log(fullMessage, data || '');
    
    // Mostra debug su mobile
    const debugDiv = document.getElementById('dropbox-debug');
    const contentDiv = document.getElementById('debug-content');
    
    if (debugDiv && contentDiv) {
      debugDiv.style.display = 'block';
      const logEntry = document.createElement('div');
      logEntry.style.marginBottom = '3px';
      logEntry.style.padding = '2px';
      logEntry.style.backgroundColor = message.includes('❌') ? '#fee' : 
                                      message.includes('✅') ? '#efe' : '#f9f9f9';
      logEntry.innerHTML = `${fullMessage}${data ? '<br><small>' + JSON.stringify(data, null, 2) + '</small>' : ''}`;
      contentDiv.appendChild(logEntry);
      contentDiv.scrollTop = contentDiv.scrollHeight;
    }
  }

  static clear() {
    const contentDiv = document.getElementById('debug-content');
    if (contentDiv) {
      contentDiv.innerHTML = '';
    }
  }
}

export class DropboxService {
  private static dbx: Dropbox | null = null;
  private static accessToken: string | null = null;
  
  // Token aggiornato
  private static readonly DEFAULT_ACCESS_TOKEN = 'sl.u.AF5x1KLlnZT5XUU6lKpjJU3nQynsLYr-b60WCALUvGoOqlXtLNX_0M4xH7d0zzYFQDZXzbqSdjLe2Y-m7pJtvDOQJk5mMFmGgTJRD5z3DDaRbrI097w87UDkQ6ZlrDdvNIZRWzK4Kc0VYZhJ2G5RueIDdscR8S4pjgFHlgbvYwpQm6pYBttv1CiicHiz3KVCjbvplygbL6yqvldsKvq9FFnT9mnzZZqznUTdn8QixsijqKSQRqU2yzWLunfI6oldx76g2Kro9iU59SreOzZ3oYDwu3wtMFrFnEJmWNmW70JNg0CLNaJ2--r-TPodmlh7JCnKd57Bb1SioaeOFVoVyFbUW0N-XR6IzL64MfU0vSG3SxFs7qunPxwQ4V6Mo8Bk4RFmyjuFOCiE14oo4GcdwJHMsUwo-NZzY41cT86e8iUFWeLFzG0xqYsbaExweGbh4GJFOBFi_riG2Nj5T18QmEjUkwZs8h6KwbCg2L6e3G1qhSDaspXtQgIwjQ_JzHHZANNB_ui_BBhY1H_6Sn_MYikCQCPbOTzHj5V5BR5pWKHlWtM3OAzbaa8KRpefeadhppjiF7h55UW33ap_tVYu3ImoMFXLtGBvP_GKToBAjAQVBUv6j7g59Ram5GTbIDRRc1xCtD1Hx2w1w74nHltSoOyH71D4SvguMhv8KdrJceIpUWcxr9vaqGarS5PqjlU9d4ZgHGU9juZ7dSf9-C9YRsYe1ORcASZ03t4ARX2QR59l1kdezKbO12wAYLL1ebrf8ugui_sjSY1E6P20vS1Xm6IlsCL_imqh8vpNNyKNZQN6ybUcSJjJyWdMhdtmla6syuyw1tRGBqaYbPYPF9YggOWjyJTcJAtM3w60UoBg6KwzpO3RfINW3zgZLl_rTvuKUIW4W2ad7cH6IDm_qSiCHawuYSK3bFb1xmV2BA6FyZxWx6WsTYBN-4hXs76duqmWj4CgKXNplshXh2wUwSdWkMY3wKv4nxKSP07miPBXFPQaUGN6aSV4TxnCb5DmegTQAQIU3qL_59SCWaziK_9DaSlq_Zp_pxe9UXUMX_w8PMkoiOJl4cO_gFOl6dwnEnB-Df_rbLFj6eH5VcW74JJrFHUPEOy4m5yQHNwIGcqYdo2ROEVli6iV7cObR73KgJBuF7a5QkbmiElbnAkfu7s5lSAwLGJLfeWhDqltfbdOqlsv11rthsTPmwnVrWBTGwvCEMGZ1Ls2CkoBnltXrlFUfwobuPqY7NtrMsmME2GtjErhK483N9UNgF7XVMqVwGhIByf76QyEadxfWQb9_8K61gaCipRmNlPd0tPrTmvFp5bzpcD7UtFmLtNDcTXF5ja3szNvHo_WsiD1s-VtGD54WSVmP-z8n7YW44mczDrqCLpO01AO2IdCm3Ut0j0suWY1gfE0G-ZBqDojjaDladKCX25q88eKsDoQ_2JNknNUgZPqtw';

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
        console.log('✅ Dropbox inizializzato con token predefinito configurato');
        return this.verifyConnection();
      }
      
      console.warn('Nessun token Dropbox disponibile');
      return false;
    } catch (error) {
      console.error('Errore inizializzazione automatica Dropbox:', error);
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
      console.error('❌ Token Dropbox non valido:', error);
      return false;
    }
  }

  // ANALISI APPROFONDITA: Differenze PC vs Mobile
  static async uploadPhoto(file: File, guildId: string, challengeId: number): Promise<string> {
    MobileDebugger.clear();
    MobileDebugger.log('🚀 ANALISI APPROFONDITA PC vs MOBILE');
    
    // 1. ANALISI AMBIENTE
    const environment = this.analyzeEnvironment();
    MobileDebugger.log('🔍 AMBIENTE RILEVATO', environment);
    
    // 2. ANALISI FILE
    const fileAnalysis = this.analyzeFile(file);
    MobileDebugger.log('📁 ANALISI FILE', fileAnalysis);
    
    // 3. ANALISI BROWSER
    const browserAnalysis = this.analyzeBrowser();
    MobileDebugger.log('🌐 ANALISI BROWSER', browserAnalysis);

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

      MobileDebugger.log('📂 PERCORSO GENERATO', { fileName, filePath });

      // Converti file in ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      MobileDebugger.log('🔄 CONVERSIONE COMPLETATA', { 
        arrayBufferSize: arrayBuffer.byteLength,
        originalSize: file.size,
        match: arrayBuffer.byteLength === file.size
      });

      // STRATEGIA DIFFERENZIATA PC vs MOBILE
      let uploadResult;
      
      if (environment.isMobile) {
        MobileDebugger.log('📱 STRATEGIA MOBILE ATTIVATA');
        uploadResult = await this.mobileUploadStrategy(arrayBuffer, filePath, file);
      } else {
        MobileDebugger.log('💻 STRATEGIA PC ATTIVATA');
        uploadResult = await this.pcUploadStrategy(arrayBuffer, filePath);
      }

      if (!uploadResult) {
        throw new Error('Upload fallito con tutte le strategie');
      }

      // Crea link condiviso
      MobileDebugger.log('🔗 CREAZIONE LINK CONDIVISO...');
      const sharedLink = await this.createSharedLink(uploadResult.path_lower);
      
      MobileDebugger.log('✅ 🎉 UPLOAD COMPLETATO!', {
        fileName: uploadResult.name,
        size: uploadResult.size,
        linkPreview: sharedLink.substring(0, 50) + '...'
      });

      return sharedLink;
    } catch (error) {
      MobileDebugger.log('❌ ERRORE UPLOAD', error);
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
      MobileDebugger.log('💻 PC: Upload diretto con SDK Dropbox');
      
      const result = await this.dbx!.filesUpload({
        path: filePath,
        contents: arrayBuffer,
        mode: 'add',
        autorename: true,
        mute: false
      });

      MobileDebugger.log('✅ PC: Upload SDK riuscito', {
        name: result.result.name,
        size: result.result.size,
        path: result.result.path_lower
      });

      return result.result;
    } catch (error) {
      MobileDebugger.log('❌ PC: Errore upload SDK', error);
      throw error;
    }
  }

  // Strategia upload per Mobile (da ottimizzare)
  private static async mobileUploadStrategy(arrayBuffer: ArrayBuffer, filePath: string, originalFile: File) {
    MobileDebugger.log('📱 MOBILE: Tentativo strategie multiple');
    
    // Strategia 1: SDK Dropbox (come PC)
    try {
      MobileDebugger.log('📱 Strategia 1: SDK Dropbox');
      const result = await this.dbx!.filesUpload({
        path: filePath,
        contents: arrayBuffer,
        mode: 'add',
        autorename: true,
        mute: false
      });
      
      MobileDebugger.log('✅ MOBILE: SDK riuscito!', result.result);
      return result.result;
    } catch (sdkError) {
      MobileDebugger.log('❌ MOBILE: SDK fallito', sdkError);
    }

    // Strategia 2: Fetch diretto
    try {
      MobileDebugger.log('📱 Strategia 2: Fetch diretto');
      const fetchResult = await this.directFetchUpload(arrayBuffer, filePath);
      if (fetchResult) {
        MobileDebugger.log('✅ MOBILE: Fetch riuscito!', fetchResult);
        return fetchResult;
      }
    } catch (fetchError) {
      MobileDebugger.log('❌ MOBILE: Fetch fallito', fetchError);
    }

    // Strategia 3: FormData
    try {
      MobileDebugger.log('📱 Strategia 3: FormData');
      const formResult = await this.formDataUpload(originalFile, filePath);
      if (formResult) {
        MobileDebugger.log('✅ MOBILE: FormData riuscito!', formResult);
        return formResult;
      }
    } catch (formError) {
      MobileDebugger.log('❌ MOBILE: FormData fallito', formError);
    }

    // Strategia 4: Base64
    try {
      MobileDebugger.log('📱 Strategia 4: Base64');
      const base64Result = await this.base64Upload(originalFile, filePath);
      if (base64Result) {
        MobileDebugger.log('✅ MOBILE: Base64 riuscito!', base64Result);
        return base64Result;
      }
    } catch (base64Error) {
      MobileDebugger.log('❌ MOBILE: Base64 fallito', base64Error);
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
    MobileDebugger.log('🔗 TENTATIVO CREAZIONE LINK', { filePath });
    
    // Prima controlla se esiste già un link per questo file
    try {
      MobileDebugger.log('🔗 Strategia 0: Cerca link esistenti');
      const existingLinks = await this.dbx!.sharingListSharedLinks({
        path: filePath,
        direct_only: true
      });
      
      if (existingLinks.result.links && existingLinks.result.links.length > 0) {
        const existingUrl = existingLinks.result.links[0].url.replace('?dl=0', '?raw=1');
        MobileDebugger.log('✅ Link esistente trovato', { url: existingUrl.substring(0, 50) + '...' });
        return existingUrl;
      }
      MobileDebugger.log('ℹ️ Nessun link esistente trovato');
    } catch (existingError) {
      MobileDebugger.log('⚠️ Errore ricerca link esistenti', existingError);
    }

    // Strategia 1: Link semplice (più compatibile)
    try {
      MobileDebugger.log('🔗 Strategia 1: Link semplice');
      const simpleLinkResponse = await this.dbx!.sharingCreateSharedLink({
        path: filePath
      });
      const finalUrl = simpleLinkResponse.result.url.replace('?dl=0', '?raw=1');
      MobileDebugger.log('✅ Link semplice creato', { url: finalUrl.substring(0, 50) + '...' });
      return finalUrl;
    } catch (simpleLinkError) {
      MobileDebugger.log('❌ Link semplice fallito', simpleLinkError);
      
      // Strategia 2: Link con settings (più specifico)
      try {
        MobileDebugger.log('🔗 Strategia 2: Link con settings');
        const sharedLink = await this.dbx!.sharingCreateSharedLinkWithSettings({
          path: filePath,
          settings: {
            requested_visibility: 'public',
            audience: 'public',
            access: 'viewer'
          }
        });
        const finalUrl = sharedLink.result.url.replace('?dl=0', '?raw=1');
        MobileDebugger.log('✅ Link con settings creato', { url: finalUrl.substring(0, 50) + '...' });
        return finalUrl;
      } catch (linkError) {
        MobileDebugger.log('❌ Link con settings fallito', linkError);
      }
    }

    // Strategia 3: Prova con settings minimi
    try {
      MobileDebugger.log('🔗 Strategia 3: Settings minimi');
      const minimalLink = await this.dbx!.sharingCreateSharedLinkWithSettings({
        path: filePath,
        settings: {
          requested_visibility: 'public'
        }
      });
      const finalUrl = minimalLink.result.url.replace('?dl=0', '?raw=1');
      MobileDebugger.log('✅ Link settings minimi creato', { url: finalUrl.substring(0, 50) + '...' });
      return finalUrl;
    } catch (minimalError) {
      MobileDebugger.log('❌ Link settings minimi fallito', minimalError);
    }

    // Strategia 4: Controlla di nuovo se il link è stato creato nel frattempo
    try {
      MobileDebugger.log('🔗 Strategia 4: Ricontrolla link esistenti');
      const recheckLinks = await this.dbx!.sharingListSharedLinks({
        path: filePath,
        direct_only: true
      });
      
      if (recheckLinks.result.links && recheckLinks.result.links.length > 0) {
        const existingUrl = recheckLinks.result.links[0].url.replace('?dl=0', '?raw=1');
        MobileDebugger.log('✅ Link trovato al ricontrollo', { url: existingUrl.substring(0, 50) + '...' });
        return existingUrl;
      }
    } catch (recheckError) {
      MobileDebugger.log('❌ Ricontrollo fallito', recheckError);
    }

    // Strategia 5: Prova con path diverso (senza caratteri speciali)
    try {
      const safePath = filePath.replace(/[^a-zA-Z0-9\/\-_.]/g, '_');
      if (safePath !== filePath) {
        MobileDebugger.log('🔗 Strategia 5: Path sicuro', { originalPath: filePath, safePath });
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
          MobileDebugger.log('✅ Link path sicuro creato', { url: finalUrl.substring(0, 50) + '...' });
          return finalUrl;
        } catch (safeError) {
          MobileDebugger.log('❌ Path sicuro fallito', safeError);
        }
      }
    } catch (pathError) {
      MobileDebugger.log('❌ Strategia path sicuro fallita', pathError);
    }

    // Strategia finale: URL diretto costruito
    MobileDebugger.log('🔗 Strategia finale: URL diretto costruito');
    
    // Estrai informazioni dal path per costruire URL diretto
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    // Costruisci URL diretto basato sulla struttura Dropbox
    const directUrl = `https://dl.dropboxusercontent.com/s/auto${filePath}`;
    MobileDebugger.log('⚠️ Usando URL diretto costruito', { 
      originalPath: filePath,
      fileName,
      directUrl: directUrl.substring(0, 50) + '...'
    });
    
    return directUrl;
  }

  // Verifica che il file sia un'immagine valida
  private static isValidImageFile(file: File): boolean {
    MobileDebugger.log('🔍 VALIDAZIONE FILE MOBILE', { 
      name: file.name || 'NO_NAME', 
      type: file.type, 
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
      constructor: file.constructor.name
    });
    
    // VALIDAZIONE ULTRA-PERMISSIVA PER MOBILE
    
    // 1. Verifica che il file abbia contenuto (priorità assoluta)
    if (file.size === 0) {
      MobileDebugger.log('❌ File vuoto');
      return false;
    }
    
    // 2. Verifica dimensione minima ragionevole per un'immagine
    if (file.size < 50) {
      MobileDebugger.log('❌ File troppo piccolo', { size: file.size });
      return false;
    }
    
    // 3. REGOLA MOBILE: Se ha dimensione > 1KB, è probabilmente un'immagine valida
    if (file.size >= 1000) {
      MobileDebugger.log('✅ MOBILE: File >1KB - ACCETTATO AUTOMATICAMENTE');
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
      MobileDebugger.log('✅ MOBILE: Tipo MIME valido - ACCETTATO');
      return true;
    }
    
    // 6. Controlla l'estensione se presente
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];
    if (file.name && file.name.includes('.')) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && validExtensions.includes(ext)) {
        MobileDebugger.log('✅ MOBILE: Estensione valida - ACCETTATO');
        return true;
      }
    }
    
    // 7. FALLBACK FINALE: Se è arrivato qui e ha dimensione > 50 bytes, accetta comunque
    MobileDebugger.log('✅ MOBILE: FALLBACK - ACCETTATO');
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