import { google } from "googleapis";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // necessario per usare formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log('📤 Richiesta upload ricevuta su Vercel API');
    
    // Parsing file dal form-data
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const file = files.file[0]; // il file caricato
    
    if (!file) {
      return res.status(400).json({ error: "Nessun file caricato" });
    }

    console.log('📋 File ricevuto:', {
      name: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype
    });

    // Verifica variabili d'ambiente (nuovo formato)
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
      console.error('❌ Variabili d\'ambiente mancanti');
      return res.status(500).json({ 
        error: "Configurazione Google Drive mancante",
        details: "GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY o GOOGLE_DRIVE_FOLDER_ID non configurati"
      });
    }

    // Autenticazione con service account (nuovo formato)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Converte \n letterali in ritorni a capo reali
        project_id: "your-project-id" // Questo può essere qualsiasi valore per Google Drive
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Genera nome file unico
    const { guildId, challengeId } = fields;
    const fileExt = getFileExtension(file);
    const fileName = `${guildId}_challenge_${challengeId}_${Date.now()}.${fileExt}`;

    console.log('📤 Caricamento su Google Drive...');

    // Upload su Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // ID cartella su Drive
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.filepath),
      },
      fields: "id, webViewLink, webContentLink",
    });

    console.log('✅ Upload completato:', response.data.id);

    // Rendi il file pubblico
    try {
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
      console.log('✅ File reso pubblico');
    } catch (permError) {
      console.warn('⚠️ Impossibile rendere il file pubblico:', permError.message);
    }

    // Genera URL pubblico diretto
    const publicUrl = `https://drive.google.com/uc?id=${response.data.id}`;

    return res.status(200).json({
      success: true,
      photoUrl: publicUrl,
      fileName: fileName,
      size: file.size,
      fileId: response.data.id,
      link: response.data.webViewLink,
    });

  } catch (err) {
    console.error("❌ Errore upload:", err);
    return res.status(500).json({ 
      error: "Upload failed", 
      details: err.message 
    });
  }
}

// Funzione helper per estensione file
function getFileExtension(file) {
  if (file.originalFilename && file.originalFilename.includes('.')) {
    const ext = file.originalFilename.split('.').pop().toLowerCase();
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