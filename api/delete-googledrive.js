import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Verifica variabili d'ambiente
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
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

    // Autenticazione con service account
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY), 
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