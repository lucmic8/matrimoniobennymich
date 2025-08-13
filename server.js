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

// Token Dropbox - In produzione usare variabili d'ambiente
const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN || 'sl.u.AF5x1KLlnZT5XUU6lKpjJU3nQynsLYr-b60WCALUvGoOqlXtLNX_0M4xH7d0zzYFQDZXzbqSdjLe2Y-m7pJtvDOQJk5mMFmGgTJRD5z3DDaRbrI097w87UDkQ6ZlrDdvNIZRWzK4Kc0VYZhJ2G5RueIDdscR8S4pjgFHlgbvYwpQm6pYBttv1CiicHiz3KVCjbvplygbL6yqvldsKvq9FFnT9mnzZZqznUTdn8QixsijqKSQRqU2yzWLunfI6oldx76g2Kro9iU59SreOzZ3oYDwu3wtMFrFnEJmWNmW70JNg0CLNaJ2--r-TPodmlh7JCnKd57Bb1SioaeOFVoVyFbUW0N-XR6IzL64MfU0vSG3SxFs7qunPxwQ4V6Mo8Bk4RFmyjuFOCiE14oo4GcdwJHMsUwo-NZzY41cT86e8iUFWeLFzG0xqYsbaExweGbh4GJFOBFi_riG2Nj5T18QmEjUkwZs8h6KwbCg2L6e3G1qhSDaspXtQgIwjQ_JzHHZANNB_ui_BBhY1H_6Sn_MYikCQCPbOTzHj5V5BR5pWKHlWtM3OAzbaa8KRpefeadhppjiF7h55UW33ap_tVYu3ImoMFXLtGBvP_GKToBAjAQVBUv6j7g59Ram5GTbIDRRc1xCtD1Hx2w1w74nHltSoOyH71D4SvguMhv8KdrJceIpUWcxr9vaqGarS5PqjlU9d4ZgHGU9juZ7dSf9-C9YRsYe1ORcASZ03t4ARX2QR59l1kdezKbO12wAYLL1ebrf8ugui_sjSY1E6P20vS1Xm6IlsCL_imqh8vpNNyKNZQN6ybUcSJjJyWdMhdtmla6syuyw1tRGBqaYbPYPF9YggOWjyJTcJAtM3w60UoBg6KwzpO3RfINW3zgZLl_rTvuKUIW4W2ad7cH6IDm_qSiCHawuYSK3bFb1xmV2BA6FyZxWx6WsTYBN-4hXs76duqmWj4CgKXNplshXh2wUwSdWkMY3wKv4nxKSP07miPBXFPQaUGN6aSV4TxnCb5DmegTQAQIU3qL_59SCWaziK_9DaSlq_Zp_pxe9UXUMX_w8PMkoiOJl4cO_gFOl6dwnEnB-Df_rbLFj6eH5VcW74JJrFHUPEOy4m5yQHNwIGcqYdo2ROEVli6iV7cObR73KgJBuF7a5QkbmiElbnAkfu7s5lSAwLGJLfeWhDqltfbdOqlsv11rthsTPmwnVrWBTGwvCEMGZ1Ls2CkoBnltXrlFUfwobuPqY7NtrMsmME2GtjErhK483N9UNgF7XVMqVwGhIByf76QyEadxfWQb9_8K61gaCipRmNlPd0tPrTmvFp5bzpcD7UtFmLtNDcTXF5ja3szNvHo_WsiD1s-VtGD54WSVmP-z8n7YW44mczDrqCLpO01AO2IdCm3Ut0j0suWY1gfE0G-ZBqDojjaDladKCX25q88eKsDoQ_2JNknNUgZPqtw';

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

    const uploadText = await uploadResponse.text();
    console.log('📄 Corpo risposta upload:', uploadText.substring(0, 200));

    if (!uploadResponse.ok) {
      console.log('❌ Errore upload Dropbox');
      let errorData;
      try {
        errorData = JSON.parse(uploadText);
      } catch (e) {
        errorData = { error_summary: uploadText };
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'Errore Dropbox upload',
        details: errorData,
        status: uploadResponse.status
      });
    }

    const uploadResult = JSON.parse(uploadText);
    console.log('✅ Upload completato:', uploadResult.name);

    // Crea link condiviso
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

    console.log('📊 Risposta link:', {
      status: linkResponse.status,
      ok: linkResponse.ok
    });

    let sharedLink;
    if (linkResponse.ok) {
      const linkResult = await linkResponse.json();
      sharedLink = linkResult.url.replace('?dl=0', '?raw=1');
      console.log('✅ Link condiviso creato');
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

      if (simpleLinkResponse.ok) {
        const simpleLinkResult = await simpleLinkResponse.json();
        sharedLink = simpleLinkResult.url.replace('?dl=0', '?raw=1');
        console.log('✅ Link semplice creato');
      } else {
        console.log('❌ Errore creazione link');
        return res.status(500).json({ 
          success: false, 
          error: 'Impossibile creare link condiviso' 
        });
      }
    }

    console.log('🎉 Upload completato con successo!');
    res.json({ 
      success: true, 
      photoUrl: sharedLink,
      fileName: uploadResult.name,
      size: uploadResult.size
    });

  } catch (error) {
    console.error('❌ Errore server:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
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