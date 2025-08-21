import express from 'express';
import fileUpload from 'express-fileupload';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  abortOnLimit: false
}));
app.use(express.json());

// Serve static files from dist directory
app.use(express.static('dist'));

// Configurazione Dropbox - Carica da variabili d'ambiente
const DROPBOX_REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY;
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET;

// Fallback per token di accesso diretto (deprecato)
let DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN || process.env.DROPBOX_TOKEN;

if (!DROPBOX_REFRESH_TOKEN && !DROPBOX_ACCESS_TOKEN) {
  console.error('❌ Nessun token Dropbox configurato. Serve DROPBOX_REFRESH_TOKEN o DROPBOX_ACCESS_TOKEN');
}

if (DROPBOX_REFRESH_TOKEN && DROPBOX_APP_KEY && DROPBOX_APP_SECRET) {
  console.log('✅ Configurazione Dropbox completa con refresh token');
} else if (DROPBOX_ACCESS_TOKEN) {
  console.log('⚠️ Usando access token diretto (scadrà)');
} else {
  console.log('❌ Configurazione Dropbox incompleta');
}

// Funzione per ottenere un access token valido
async function getValidAccessToken() {
  // Se abbiamo refresh token, usalo per ottenere un nuovo access token
  if (DROPBOX_REFRESH_TOKEN && DROPBOX_APP_KEY && DROPBOX_APP_SECRET) {
    try {
      console.log('🔄 Refreshing Dropbox access token...');
      
      const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: DROPBOX_REFRESH_TOKEN,
          client_id: DROPBOX_APP_KEY,
          client_secret: DROPBOX_APP_SECRET
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Errore refresh token:', response.status, errorText);
        throw new Error(`Refresh token failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.access_token) {
        // Aggiorna il token in memoria
        DROPBOX_ACCESS_TOKEN = data.access_token;
        console.log('✅ Access token refreshed successfully');
        return data.access_token;
      } else {
        throw new Error('No access token in refresh response');
      }
    } catch (error) {
      console.error('❌ Errore nel refresh del token:', error);
      // Fallback al token esistente se disponibile
      if (DROPBOX_ACCESS_TOKEN) {
        console.log('⚠️ Usando access token esistente come fallback');
        return DROPBOX_ACCESS_TOKEN;
      }
      throw error;
    }
  }
  
  // Fallback: usa il token diretto se disponibile
  if (DROPBOX_ACCESS_TOKEN) {
    return DROPBOX_ACCESS_TOKEN;
  }
  
  throw new Error('Nessun token Dropbox disponibile');
}

// Endpoint per upload file su Dropbox
app.post('/api/upload-dropbox', async (req, res) => {
  console.log('📤 Richiesta upload ricevuta');
  
  try {
    // Check for file size limit error
    if (req.fileUploadError && req.fileUploadError.code === 'LIMIT_FILE_SIZE') {
      console.log('❌ File troppo grande');
      return res.status(413).json({ 
        success: false,
        error: 'File troppo grande (max 50MB)' 
      });
    }

    // Verifica presenza file
    if (!req.files || !req.files.file) {
      console.log('❌ Nessun file nella richiesta');
      return res.status(400).json({ 
        success: false, 
        error: 'Nessun file caricato' 
      });
    }

    const file = req.files.file;
    const { guildId, challengeId } = req.body;

    console.log('📋 File ricevuto:', {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      guildId,
      challengeId
    });

    // Genera nome file e path
    const fileExt = getFileExtension(file);
    const fileName = `${guildId}_challenge_${challengeId}_${Date.now()}.${fileExt}`;
    const filePath = `/sfida-cime/${guildId}/${fileName}`;

    console.log('📂 Path generato:', filePath);

    // Ottieni un access token valido
    const accessToken = await getValidAccessToken();

    // Upload su Dropbox
    console.log('📤 Caricamento su Dropbox...');
    const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: filePath,
          mode: 'add',
          autorename: true,
          mute: false
        })
      },
      body: file.data
    });

    console.log('📊 Risposta upload:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      ok: uploadResponse.ok
    });

    // Leggi sempre come testo per evitare errori JSON
    const uploadText = await uploadResponse.text();
    console.log('📄 Corpo risposta upload:', uploadText.substring(0, 200));

    // Prova a parsare JSON, altrimenti usa testo grezzo
    let uploadResult;
    try {
      uploadResult = JSON.parse(uploadText);
    } catch (e) {
      console.log('⚠️ Risposta Dropbox non è JSON, uso testo grezzo');
      uploadResult = { raw: uploadText };
    }

    // Se upload non è riuscito, restituisci errore ma sempre in formato JSON
    if (!uploadResponse.ok) {
      console.log('❌ Errore upload Dropbox');
      return res.status(uploadResponse.status).json({
        success: false,
        error: uploadResult.error_summary || uploadResult.error?.message || uploadResult.raw || 'Errore Dropbox upload',
        result: uploadResult,
        status: uploadResponse.status
      });
    }

    console.log('✅ Upload completato:', uploadResult.name || 'file caricato');

    // Solo se upload è riuscito, prova a creare link condiviso
    if (uploadResult.path_lower) {
      console.log('🔗 Creazione link condiviso...');
      const linkResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: uploadResult.path_lower,
          settings: {
            requested_visibility: 'public'
          }
        })
      });

      const linkText = await linkResponse.text();
      let linkResult;
      try {
        linkResult = JSON.parse(linkText);
      } catch (e) {
        linkResult = { raw: linkText };
      }

      if (linkResponse.ok && linkResult.url) {
        const sharedLink = linkResult.url.replace('?dl=0', '?raw=1');
        console.log('✅ Link condiviso creato');
        
        return res.status(200).json({ 
          success: true, 
          photoUrl: sharedLink,
          fileName: uploadResult.name || fileName,
          size: uploadResult.size || file.size,
          result: uploadResult
        });
      } else {
        // Fallback: prova link semplice
        console.log('⚠️ Tentativo link semplice...');
        const simpleLinkResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: uploadResult.path_lower
          })
        });

        const simpleLinkText = await simpleLinkResponse.text();
        let simpleLinkResult;
        try {
          simpleLinkResult = JSON.parse(simpleLinkText);
        } catch (e) {
          simpleLinkResult = { raw: simpleLinkText };
        }

        if (simpleLinkResponse.ok && simpleLinkResult.url) {
          const sharedLink = simpleLinkResult.url.replace('?dl=0', '?raw=1');
          console.log('✅ Link semplice creato');
          
          return res.status(200).json({ 
            success: true, 
            photoUrl: sharedLink,
            fileName: uploadResult.name || fileName,
            size: uploadResult.size || file.size,
            result: uploadResult
          });
        } else {
          console.log('❌ Errore creazione link');
          return res.status(500).json({ 
            success: false, 
            error: linkResult.error_summary || linkResult.error?.message || simpleLinkResult.error_summary || simpleLinkResult.error?.message || 'Impossibile creare link condiviso',
            result: { upload: uploadResult, link: simpleLinkResult }
          });
        }
      }
    } else {
      // Upload riuscito ma senza path_lower (caso anomalo)
      console.log('⚠️ Upload riuscito ma senza path per link');
      return res.status(200).json({
        success: true,
        photoUrl: null,
        fileName: fileName,
        size: file.size,
        result: uploadResult,
        warning: 'File caricato ma link non disponibile'
      });
    }

  } catch (error) {
    console.error('❌ Errore server:', error);
    return res.status(500).json({ 
      success: false, 
      error: `Errore server: ${error.message}` || 'Errore server sconosciuto',
      details: error.stack
    });
  }
});

// Endpoint per test connessione
app.get('/api/test-dropbox', async (req, res) => {
  try {
    const accessToken = await getValidAccessToken();
    
    const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const account = await response.json();
      res.json({ 
        success: true, 
        account: account.name?.display_name || account.email 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Token Dropbox non valido' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Funzione helper per estensione file
function getFileExtension(file) {
  if (file.name && file.name.includes('.')) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return ext;
    }
  }
  
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };
  
  return mimeToExt[file.mimetype] || 'jpg';
}

// Serve React app per tutte le altre route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`📱 App disponibile su http://localhost:${PORT}`);
});