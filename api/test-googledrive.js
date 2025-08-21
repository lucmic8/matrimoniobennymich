import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log('=== 🔍 TEST GOOGLE DRIVE VERCEL API ===');
    
    // Verifica variabili d'ambiente
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
      console.error('❌ Variabili d\'ambiente mancanti');
      return res.status(500).json({ 
        success: false,
        error: "Configurazione Google Drive mancante",
        details: "GOOGLE_SERVICE_ACCOUNT_KEY o GOOGLE_DRIVE_FOLDER_ID non configurati"
      });
    }

    console.log('📁 Folder ID configurato:', process.env.GOOGLE_DRIVE_FOLDER_ID);
    console.log('🔑 Credenziali presenti:', !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    
    // Autenticazione con service account
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY), 
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });
    
    const response = await drive.about.get({
      fields: 'user'
    });

    if (response.data && response.data.user) {
      console.log('✅ Google Drive connesso come:', response.data.user.displayName || response.data.user.emailAddress);
      return res.status(200).json({ 
        success: true, 
        account: response.data.user.displayName || response.data.user.emailAddress,
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID
      });
    } else {
      console.log('❌ Risposta Google Drive vuota');
      return res.status(500).json({ 
        success: false, 
        error: 'Google Drive non configurato correttamente' 
      });
    }
  } catch (error) {
    console.error('❌ Test Google Drive fallito:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      details: {
        message: error.message,
        code: error.code,
        status: error.status
      }
    });
  }
}