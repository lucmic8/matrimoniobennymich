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
  private static readonly DEFAULT_ACCESS_TOKEN = 'sl.u.AF7hxWVqLn0us-e3Y9-qrwd_II587Mgt773rRADcwDUgKVlpXRJYikYqSwkJOIq2lnZlgG77b_bX9DTxhUlmx8mY97MXqHCanOxMucziM0LJXVUo7mojZSoPMkcxLFaI0IxVBxc0cjFgXkDC8N2SQObR4-_bk6mcI3gj3eUxSABRc0ULB0JS81by6NtnITNkX1FY1g8feG5x6ATzUqI61UXlWB2GyrmrcXkp_KilMTjiRRBA3d5CW4RjasUXoyt2liJXWmStfShJIHROyVChkh2QPncI_qyn2S14mvISKPp4UD04CmUC6M5zr8GMWW3jKA60fsm5PpV2N3SMY1wNp_-a-MaoZeZyhDkXXRb6dpKIq4efKRUUucMHjCCHJaqOnpPq_jHgrtLjIX1bmFEQidQSzmT6k9qBG0G51PGJBeTS-AtRGRCHutvNkvMbFWQXB1eNAuNZsostaboUi3rQ9gI6GPmQqtk2dhwR953RSnBeS58JDdn_87s8s_lJqS788TCYudqUK-VeCTcb-qg6PGM_cZITbABonaQ4mMiIdyxiIfBoAYanV9exgrdMwyaLx5L2heb4_Wwwasol_BA8hjQWG3hwh-kdsVJGpsoHnxhl3wawQVFkU7SZ3pmpf-Mb3a5xu2ZD-VRXaycS9o5V9-1-JO2nj4cfRCWK8QYcrraaKlkBagJd8tL4ixma2K_IRgxS9TY8iER5YgLVVyfUijLLM3zzCrDJcS4VNNyerW5JECe85g1lfTm5aEX6ul4y-oPq50EX_aMX2I_gSAFFF6gUiNnmdK6GZJsmizYTRAX789Sy_oKvWCdkhGhUnqcQqEC2YxtGPQAVS6LXLy0Chjd426Pq-jJaFADrSKQir3EytzjK66Xl7jUl1qIdP-sQZHzgOGDJ2dr4sEq_085pH-vMeWOg1FVY_AatTb_vaCrlr-RuLSbwzgJau4ryN5t0fLIC84A3TKWp6tz9Od884ODMqqqH3kxOeEMifpvFoN_URgJ3Px1k58TdTPUSN1F-ZI5nhwdn_Dca1RMHErWCYOd9YYXmmj6pZPlPgUEE3iOE_nD0ymGm7CdXfih-IJvPeJpXSix61qX7YyUTyzT5y1iJPm0x_SmsXvz4YM0bUMy3BzjrPwjKobTkGKFX9B901y5-YgOSNKWyOSgRuja4zeGWpPVSS6Ar8-bQ3_2gdrwnzUR2cvvOyLi4gNT-k4rrnpUHeVDVjUC5JlCxShKM7Q9p_8saYuzaMwFXnJPbnMyTWy6-yXuv6IQWwoywQe5XdwuwD9o7d2yqTvw9DBwwYCXlGhzZEZCHrl5BK8FXD2txhps7otjUSJCpVb9s0jyw_RtIRS6a3Ys-7-zUXRPSyfMtFrj-05GsisndInyYeMDNM_Z1mj1CgM3x-LAQU-Qt_-eN0fD4IM0KpCZA2JxAA8RtH2qBOyr6tfz21yowIMxTtQ';

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
      if (!this.DEFAULT_ACCESS_TOKEN || this.DEFAULT_ACCESS_TOKEN.length < 50) {
        console.error('❌ Token Dropbox predefinito non configurato');
        return false;
      }
      this.initialize(this.DEFAULT_ACCESS_TOKEN);
      console.log('✅ Dropbox inizializzato con fallback');
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
    MobileDebugger.clear();
    MobileDebugger.log('🚀 INIZIO UPLOAD DROPBOX');
    MobileDebugger.log('📁 File info', {
      name: file.name || 'NO_NAME',
      size: file.size,
      type: file.type || 'NO_TYPE',
      sizeKB: (file.size / 1024).toFixed(2) + ' KB',
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    // Verifica e inizializza Dropbox se necessario
    if (!this.isConfigured()) {
      MobileDebugger.log('⚙️ Dropbox non configurato, inizializzazione...');
      const initialized = await this.initializeWithDefaultToken();
      if (!initialized) {
        MobileDebugger.log('❌ ERRORE: Impossibile inizializzare Dropbox');
        throw new Error('❌ DROPBOX NON CONFIGURATO\n\nDevi configurare il tuo token Dropbox personale:\n1. Vai su https://www.dropbox.com/developers/apps\n2. Crea una nuova app\n3. Genera un token di accesso\n4. Inseriscilo nelle impostazioni del sito');
      }
      MobileDebugger.log('✅ Dropbox inizializzato con successo');
    }

    try {
      const fileExt = this.getFileExtension(file);
      const fileName = `${guildId}_challenge_${challengeId}_${Date.now()}.${fileExt}`;
      const filePath = `/sfida-cime/${guildId}/${fileName}`;
      
      MobileDebugger.log('📂 Path generato', {
        fileName,
        filePath,
        extension: fileExt
      });

      // Converti il file in ArrayBuffer con gestione errori migliorata
      let arrayBuffer: ArrayBuffer;
      try {
        MobileDebugger.log('🔄 Conversione in ArrayBuffer...');
        arrayBuffer = await file.arrayBuffer();
        MobileDebugger.log('✅ ArrayBuffer creato', {
          byteLength: arrayBuffer.byteLength,
          bytes: arrayBuffer.byteLength + ' bytes'
        });
      } catch (error) {
        MobileDebugger.log('❌ ERRORE conversione ArrayBuffer', error);
        throw new Error('Impossibile elaborare il file immagine');
      }

      if (arrayBuffer.byteLength === 0) {
        MobileDebugger.log('❌ ERRORE: ArrayBuffer vuoto');
        throw new Error('File vuoto o corrotto');
      }

      // Verifica che il file sia effettivamente un'immagine
      if (!this.isValidImageFile(file)) {
        MobileDebugger.log('❌ ERRORE: File non valido secondo isValidImageFile');
        throw new Error('Il file selezionato non è un\'immagine valida');
      }
      MobileDebugger.log('✅ File validato come immagine');

      // Carica il file su Dropbox
      MobileDebugger.log('📤 Caricamento su Dropbox...', { path: filePath });
      
      // UPLOAD CON DEBUG COMPLETO
      let response;
      try {
        response = await this.dbx.filesUpload({
          path: filePath,
          contents: arrayBuffer,
          mode: 'add',
          autorename: true,
          strict_conflict: false
        });
        MobileDebugger.log('✅ Upload completato', {
          name: response.result.name,
          size: response.result.size,
          path: response.result.path_lower
        });
      } catch (uploadError: any) {
        MobileDebugger.log('❌ ERRORE UPLOAD DETTAGLIATO', {
          message: uploadError.message,
          status: uploadError.status || 'N/A',
          error: uploadError.error || 'N/A',
          response: uploadError.response || 'N/A',
          stack: uploadError.stack?.substring(0, 200) || 'N/A'
        });
        
        // Prova upload diretto con fetch per debug
        MobileDebugger.log('🔄 Tentativo upload diretto con fetch...');
        await this.debugDirectUpload(arrayBuffer, filePath);
        throw uploadError;
      }
      
      MobileDebugger.log('✅ Upload completato', {
        name: response.result.name,
        size: response.result.size,
        path: response.result.path_lower
      });

      // Crea un link condiviso per il file con retry
      let sharedLink;
      try {
        MobileDebugger.log('🔗 Creazione link condiviso...');
        sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
          path: response.result.path_lower!,
          settings: {
            requested_visibility: 'public'
          }
        });
        MobileDebugger.log('✅ Link condiviso creato', {
          url: sharedLink.result.url.substring(0, 50) + '...'
        });
      } catch (linkError) {
        MobileDebugger.log('⚠️ Errore link condiviso, provo metodo alternativo', linkError);
        
        // Fallback: prova con metodo semplice
        try {
          const simpleLinkResponse = await this.dbx.sharingCreateSharedLink({
            path: response.result.path_lower!
          });
          sharedLink = simpleLinkResponse;
          MobileDebugger.log('✅ Link semplice creato', {
            url: sharedLink.result.url.substring(0, 50) + '...'
          });
        } catch (simpleLinkError) {
          MobileDebugger.log('❌ ERRORE: Anche link semplice fallito', simpleLinkError);
          throw new Error('Impossibile creare link condiviso per la foto');
        }
      }

      // Converti il link Dropbox in un link diretto per le immagini
      const directLink = sharedLink.result.url.replace('?dl=0', '?raw=1');
      MobileDebugger.log('✅ 🎉 UPLOAD COMPLETATO CON SUCCESSO!', {
        directLink: directLink.substring(0, 50) + '...'
      });
      
      return directLink;
    } catch (error) {
      MobileDebugger.log('❌ ERRORE FINALE nel caricamento', error);
      
      // Errori specifici più utili
      if (error instanceof Error) {
        if (error.message.includes('invalid_access_token') || error.message.includes('expired_access_token')) {
          MobileDebugger.log('❌ ERRORE: Token scaduto/invalido');
          throw new Error('❌ TOKEN DROPBOX SCADUTO\n\nIl tuo token di accesso Dropbox è scaduto o non valido.\nDevi generarne uno nuovo su https://www.dropbox.com/developers/apps');
        } else if (error.message.includes('insufficient_space')) {
          MobileDebugger.log('❌ ERRORE: Spazio insufficiente');
          throw new Error('❌ SPAZIO DROPBOX INSUFFICIENTE\n\nNon hai abbastanza spazio su Dropbox per caricare la foto.');
        } else if (error.message.includes('rate_limit')) {
          MobileDebugger.log('❌ ERRORE: Rate limit');
          throw new Error('❌ TROPPI CARICAMENTI\n\nHai superato il limite di caricamenti Dropbox. Riprova tra qualche minuto.');
        }
      }
      
      throw new Error('❌ ERRORE CARICAMENTO DROPBOX\n\n' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  }

  // Upload diretto con fetch per debug dettagliato
  private static async debugDirectUpload(arrayBuffer: ArrayBuffer, filePath: string): Promise<void> {
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
      } else {
        MobileDebugger.log('✅ FETCH UPLOAD RIUSCITO', {
          status: response.status,
          bodyPreview: responseText.substring(0, 200)
        });
      }
    } catch (fetchError: any) {
      MobileDebugger.log('❌ ERRORE FETCH DIRETTO', {
        message: fetchError.message,
        name: fetchError.name,
        stack: fetchError.stack?.substring(0, 200)
      });
    }
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