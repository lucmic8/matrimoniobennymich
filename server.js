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

// Token Dropbox - Carica solo da variabili d'ambiente
const DROPBOX_TOKEN = process.env.DROPBOX_ACCESS_TOKEN || process.env.DROPBOX_TOKEN;

if (!DROPBOX_TOKEN) {
  console.error('❌ DROPBOX_ACCESS_TOKEN non configurato nelle variabili d\'ambiente');
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

    // Upload su Dropbox
    console.log('📤 Caricamento su Dropbox...');
    const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_TOKEN}`,
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
          'Authorization': `Bearer ${DROPBOX_TOKEN}`,
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
            'Authorization': `Bearer ${DROPBOX_TOKEN}`,
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
    const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_TOKEN}`,
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