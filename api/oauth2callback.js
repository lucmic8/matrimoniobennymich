import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: 'Missing code' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    console.log("👉 Copia questo refresh_token e salvalo su Vercel:", tokens.refresh_token);

    res.status(200).json({
      message: "Autenticazione completata. Controlla i log per il refresh_token."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
