import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Verifica variabili d'ambiente (nuovo formato)
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return res.status(500).json({ 
        success: false,
        error: "Google Drive non configurato" 
      });
    }
    
    const { photoUrl, fileId } = req.body;
    
    let targetFileId = fileId;
    if (!targetFileId && photoUrl) {
      // Estrai l'ID dall'URL
      const match = photoUrl.match(/[?&]id=([^&]+)/);
      targetFileId = match ? match[1] : null;
    }
    
    if (!targetFileId) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID file non trovato' 
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
    
    await drive.files.delete({ fileId: targetFileId });
    console.log('🗑️ File eliminato da Google Drive:', targetFileId);
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('❌ Errore eliminazione Google Drive:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}