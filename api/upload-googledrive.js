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
    console.log("📤 Richiesta upload Google Drive ricevuta su Vercel API");

    // Parsing file dal form-data
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const file = files.file[0]; // il file caricato

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Nessun file caricato",
      });
    }

    console.log("📋 File ricevuto:", {
      name: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
    });

    // ✅ Verifica variabili d'ambiente
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REFRESH_TOKEN ||
      !process.env.GOOGLE_DRIVE_FOLDER_ID
    ) {
      console.error("❌ Variabili d'ambiente mancanti");
      return res.status(500).json({
        success: false,
        error: "Configurazione Google Drive mancante",
        details:
          "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN o GOOGLE_DRIVE_FOLDER_ID non configurati",
      });
    }

    // ✅ Autenticazione con OAuth2 (usa refresh token)
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Genera nome file unico
    const { guildId, challengeId } = fields;
    const fileExt = getFileExtension(file);
    const fileName = `${guildId || "upload"}_challenge_${challengeId || "x"}_${Date.now()}.${fileExt}`;

    console.log("📤 Caricamento su Google Drive...");

    // Upload su Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.filepath),
      },
      fields: "id, webViewLink, webContentLink",
    });

    console.log("✅ Upload completato:", response.data.id);

    // Rendi il file pubblico
    try {
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
      console.log("✅ File reso pubblico");
    } catch (permError) {
      console.warn("⚠️ Impossibile rendere il file pubblico:", permError.message);
    }

    // Genera URL pubblico diretto
    //const publicUrl = `https://drive.google.com/uc?id=${response.data.id}`;
    const publicUrl = `https://lh3.googleusercontent.com/d/${response.data.id}`;

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
      success: false,
      error: "Upload failed",
      details: err.message,
    });
  }
}

// Funzione helper per estensione file
function getFileExtension(file) {
  if (file.originalFilename && file.originalFilename.includes(".")) {
    const ext = file.originalFilename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return ext;
    }
  }

  const mimeToExt = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };

  return mimeToExt[file.mimetype] || "jpg";
}
