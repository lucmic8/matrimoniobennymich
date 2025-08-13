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
  abortOnLimit: true
}));
app.use(express.json());

// Serve static files from dist directory
app.use(express.static('dist'));

// Token Dropbox - In produzione usare variabili d'ambiente
const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN || 'sl.u.AF7hxWVqLn0us-e3Y9-qrwd_II587Mgt773rRADcwDUgKVlpXRJYikYqSwkJOIq2lnZlgG77b_bX9DTxhUlmx8mY97MXqHCanOxMucziM0LJXVUo7mojZSoPMkcxLFaI0IxVBxc0cjFgXkDC8N2SQObR4-_bk6mcI3gj3eUxSABRc0ULB0JS81by6NtnITNkX1FY1g8feG5x6ATzUqI61UXlWB2GyrmrcXkp_KilMTjiRRBA3d5CW4RjasUXoyt2liJXWmStfShJIHROyVChkh2QPncI_qyn2S14mvISKPp4UD04CmUC6M5zr8GMWW3jKA60fsm5PpV2N3SMY1wNp_-a-MaoZeZyhDkXXRb6dpKIq4efKRUUucMHjCCHJaqOnpPq_jHgrtLjIX1bmFEQidQSzmT6k9qBG0G51PGJBeTS-AtRGRCHutvNkvMbFWQXB1eNAuNZsostaboUi3rQ9gI6GPmQqtk2dhwR953RSnBeS58JDdn_87s8s_lJqS788TCYudqUK-VeCTcb-qg6PGM_cZITbABonaQ4mMiIdyxiIfBoAYanV9exgrdMwyaLx5L2heb4_Wwwasol_BA8hjQWG3hwh-kdsVJGpsoHnxhl3wawQVFkU7SZ3pmpf-Mb3a5xu2ZD-VRXaycS9o5V9-1-JO2nj4cfRCWK8QYcrraaKlkBagJd8tL4ixma2K_IRgxS9TY8iER5YgLVVyfUijLLM3zzCrDJcS4VNNyerW5JECe85g1lfTm5aEX6ul4y-oPq50EX_aMX2I_gSAFFF6gUiNnmdK6GZJsmizYTRAX789Sy_oKvWCdkhGhUnqcQqEC2YxtGPQAVS6LXLy0Chjd426Pq-jJaFADrSKQir3EytzjK66Xl7jUl1qIdP-sQZHzgOGDJ2dr4sEq_085pH-vMeWOg1FVY_AatTb_vaCrlr-RuLSbwzgJau4ryN5t0fLIC84A3TKWp6tz9Od884ODMqqqH3kxOeEMifpvFoN_URgJ3Px1k58TdTPUSN1F-ZI5nhwdn_Dca1RMHErWCYOd9YYXmmj6pZPlPgUEE3iOE_nD0ymGm7CdXfih-IJvPeJpXSix61qX7YyUTyzT5y1iJPm0x_SmsXvz4YM0bUMy3BzjrPwjKobTkGKFX9B901y5-YgOSNKWyOSgRuja4zeGWpPVSS6Ar8-bQ3_2gdrwnzUR2cvvOyLi4gNT-k4rrnpUHeVDVjUC5JlCxShKM7Q9p_8saYuzaMwFXnJPbnMyTWy6-yXuv6IQWwoywQe5XdwuwD9o7d2yqTvw9DBwwYCXlGhzZEZCHrl5BK8FXD2txhps7otjUSJCpVb9s0jyw_RtIRS6a3Ys-7-zUXRPSyfMtFrj-05GsisndInyYeMDNM_Z1mj1CgM3x-LAQU-Qt_-eN0fD4IM0KpCZA2JxAA8RtH2qBOyr6tfz21yowIMxTtQ';

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