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
  
  // IMPORTANTE: Il token predefinito potrebbe essere scaduto
  // Gli utenti devono configurare il proprio token Dropbox
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
    }
  }
  static async uploadPhoto(file: File, guildId: string, challengeId: number): Promise<string> {
    MobileDebugger.clear();
    MobileDebugger.log('🚀 UPLOAD VIA SERVER BACKEND');
    MobileDebugger.log('📁 File info', {
      name: file.name || 'NO_NAME',
      size: file.size,
      type: file.type || 'NO_TYPE',
      sizeKB: (file.size / 1024).toFixed(2) + ' KB',
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    try {
      // Crea FormData per inviare al server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('guildId', guildId);
      formData.append('challengeId', challengeId.toString());

      MobileDebugger.log('📤 Invio al server backend...');
      
      // Invia al nostro server Express
      const response = await fetch('/api/upload-dropbox', {
        method: 'POST',
        body: formData
      });

      MobileDebugger.log('📊 Risposta server', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await response.json();
      MobileDebugger.log('📄 Risultato completo', result);

      if (!response.ok || !result.success) {
        MobileDebugger.log('❌ Errore dal server', result);
        throw new Error(result.error || 'Errore server sconosciuto');
      }

      MobileDebugger.log('✅ 🎉 UPLOAD COMPLETATO VIA SERVER!', {
        photoUrl: result.photoUrl?.substring(0, 50) + '...',
        fileName: result.fileName,
        size: result.size
      });

      return result.photoUrl;
    } catch (error) {
      MobileDebugger.log('❌ ERRORE UPLOAD SERVER', error);
      throw new Error(error instanceof Error ? error.message : 'Errore caricamento server');
    }
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Upload diretto con fetch per debug dettagliato
  private static async debugDirectUpload(arrayBuffer: ArrayBuffer, filePath: string): Promise<string | null> {
    try {
      MobileDebugger.log('🌐 DEBUG: Upload diretto con fetch');
      
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

      MobileDebugger.log('📊 RISPOSTA FETCH COMPLETA', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Leggi la risposta come testo per vedere tutto
      const responseText = await response.text();
      MobileDebugger.log('📄 CORPO RISPOSTA COMPLETO', {
        length: responseText.length,
        text: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
      });

      if (!response.ok) {
        MobileDebugger.log('❌ ERRORE HTTP', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        return null;
      } else {
        MobileDebugger.log('✅ FETCH UPLOAD RIUSCITO', {
          status: response.status,
          bodyPreview: responseText.substring(0, 200)
        });
        
        // Se l'upload è riuscito, crea il link condiviso
        try {
          const uploadResult = JSON.parse(responseText);
          const sharedLink = await this.createSharedLink(uploadResult.path_lower);
          return sharedLink;
        } catch (parseError) {
          MobileDebugger.log('❌ Errore parsing risposta upload', parseError);
          return null;
        }
      }
    } catch (fetchError: any) {
      MobileDebugger.log('❌ ERRORE FETCH DIRETTO', {
        message: fetchError.message,
        name: fetchError.name,
        stack: fetchError.stack?.substring(0, 200),
        isCORS: this.isCORSError(fetchError)
      });
      return null;
    }
    
    return null;
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

  // Test CORS per rilevare problemi di connettività
  private static async testCORS(): Promise<any> {
    try {
      MobileDebugger.log('🧪 Esecuzione test CORS...');
      
      // Test semplice con HEAD request
      const testResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Dropbox-API-Arg'
        }
      });
      
      return {
        corsSupported: testResponse.ok,
        status: testResponse.status,
        headers: Object.fromEntries(testResponse.headers.entries()),
        corsHeaders: {
          allowOrigin: testResponse.headers.get('Access-Control-Allow-Origin'),
          allowMethods: testResponse.headers.get('Access-Control-Allow-Methods'),
          allowHeaders: testResponse.headers.get('Access-Control-Allow-Headers')
        }
      };
    } catch (error) {
      MobileDebugger.log('❌ Test CORS fallito', error);
      return {
        corsSupported: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        isCORSBlocked: this.isCORSError(error)
      };
    }
  }

  // Rileva se un errore è causato da CORS
  private static isCORSError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = error.message?.toLowerCase() || '';
    const errorString = error.toString?.()?.toLowerCase() || '';
    
    // Segnali tipici di errori CORS
    const corsIndicators = [
      'cors',
      'cross-origin',
      'access-control',
      'network error',
      'failed to fetch',
      'blocked by cors',
      'preflight',
      'opaque response'
    ];
    
    return corsIndicators.some(indicator => 
      errorMessage.includes(indicator) || errorString.includes(indicator)
    ) || error.status === 0 || error.type === 'opaque';
  }

  // Sistema fallback per problemi CORS
  private static async uploadWithFallback(file: File, arrayBuffer: ArrayBuffer, filePath: string): Promise<string> {
    MobileDebugger.log('🔄 ATTIVAZIONE SISTEMA FALLBACK');
    
    try {
      // Fallback 1: Prova con FormData invece di ArrayBuffer
      MobileDebugger.log('📋 Fallback 1: Upload con FormData...');
      const formData = new FormData();
      formData.append('file', file);
      
      const formResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
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
      
      if (formResponse.ok) {
        const result = await formResponse.text();
        MobileDebugger.log('✅ Fallback FormData riuscito');
        const uploadResult = JSON.parse(result);
        return await this.createSharedLink(uploadResult.path_lower);
      }
      
      // Fallback 2: Upload tramite base64
      MobileDebugger.log('📋 Fallback 2: Upload con base64...');
      const base64Data = await this.fileToBase64(file);
      const base64Response = await this.uploadBase64(base64Data, filePath);
      
      if (base64Response) {
        MobileDebugger.log('✅ Fallback base64 riuscito');
        return base64Response;
      }
      
      throw new Error('Tutti i fallback CORS sono falliti');
      
    } catch (fallbackError) {
      MobileDebugger.log('❌ Errore sistema fallback', fallbackError);
      throw new Error('❌ PROBLEMA CORS MOBILE\n\nIl tuo browser mobile sta bloccando le richieste a Dropbox.\nProva:\n1. Usa Chrome invece di Safari\n2. Disabilita modalità risparmio dati\n3. Connettiti a WiFi invece di dati mobili');
    }
  }

  // Upload tramite base64 per aggirare CORS
  private static async uploadBase64(base64Data: string, filePath: string): Promise<string | null> {
    try {
      // Rimuovi il prefisso data:image/...;base64,
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
      
      if (response.ok) {
        const result = await response.text();
        const uploadResult = JSON.parse(result);
        return await this.createSharedLink(uploadResult.path_lower);
      }
      
      return null;
    } catch (error) {
      MobileDebugger.log('❌ Errore upload base64', error);
      return null;
    }
  }

  // Crea link condiviso con gestione errori
  private static async createSharedLink(filePath: string): Promise<string> {
    try {
      const sharedLink = await this.dbx!.sharingCreateSharedLinkWithSettings({
        path: filePath,
        settings: {
          requested_visibility: 'public'
        }
      });
      return sharedLink.result.url.replace('?dl=0', '?raw=1');
    } catch (linkError) {
      // Fallback link semplice
      try {
        const simpleLinkResponse = await this.dbx!.sharingCreateSharedLink({
          path: filePath
        });
        return simpleLinkResponse.result.url.replace('?dl=0', '?raw=1');
      } catch (simpleLinkError) {
        throw new Error('Impossibile creare link condiviso');
      }
    }
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