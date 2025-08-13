import { Dropbox } from 'dropbox';

export class DropboxService {
  private static dbx: Dropbox | null = null;
  private static accessToken: string | null = null;
  
  // Token di accesso per l'account lmiciletto@gmail.com
  // Token di accesso configurato automaticamente
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
      if (this.DEFAULT_ACCESS_TOKEN && this.DEFAULT_ACCESS_TOKEN.startsWith('sl.')) {
        this.initialize(this.DEFAULT_ACCESS_TOKEN);
        return true;
      }
    } catch (error) {
      console.warn('Errore inizializzazione automatica Dropbox:', error);
    }
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
      throw new Error('Dropbox non configurato. Inserisci il token di accesso.');
    }

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${guildId}_challenge_${challengeId}_${Date.now()}.${fileExt}`;
      const filePath = `/sfida-cime/${guildId}/${fileName}`;

      // Converti il file in ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Carica il file su Dropbox
      const response = await this.dbx.filesUpload({
        path: filePath,
        contents: arrayBuffer,
        mode: 'overwrite',
        autorename: true
      });

      // Crea un link condiviso per il file
      const sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
        path: response.result.path_lower!,
        settings: {
          requested_visibility: 'public'
        }
      });

      // Converti il link Dropbox in un link diretto per le immagini
      const directLink = sharedLink.result.url.replace('?dl=0', '?raw=1');
      
      return directLink;
    } catch (error) {
      console.error('Errore nel caricamento su Dropbox:', error);
      throw new Error('Impossibile caricare la foto su Dropbox');
    }
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

  // Ottieni informazioni sull'account Dropbox
  static async getAccountInfo(): Promise<any> {
    if (!this.dbx) {
      throw new Error('Dropbox non configurato');
    }

    try {
      const response = await this.dbx.usersGetCurrentAccount();
      return response.result;
    } catch (error) {
      console.error('Errore nel recupero info account:', error);
      throw new Error('Impossibile verificare l\'account Dropbox');
    }
  }
}