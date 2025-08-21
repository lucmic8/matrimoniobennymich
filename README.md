# La Quest degli Sposi - Le Gilde delle Grandi Cime

Un'applicazione web per gestire sfide fotografiche durante matrimoni, con tema montano delle Dolomiti.

## 🚀 Demo Live

- **Frontend**: [Vercel/Netlify URL]
- **Backend**: [Railway/Render URL]

## 🏔️ Caratteristiche

- **10 Gilde delle Montagne**: Ogni tavolo rappresenta una montagna delle Dolomiti
- **15 Sfide Fotografiche**: Missioni divertenti da completare durante il banchetto
- **Upload Foto**: Caricamento sicuro delle foto su Google Drive (server-side)
- **Sincronizzazione**: Database Supabase per sincronizzazione multi-dispositivo
- **Responsive**: Ottimizzato per mobile e desktop

## 🚀 Tecnologie

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Google Drive API
- **Database**: Supabase (PostgreSQL)
- **Storage**: Google Drive API (Vercel API routes)
- **Deploy**: Vercel (frontend) + Railway/Render (backend)

## ⚙️ Configurazione

### 1. Variabili d'Ambiente

Crea un file `.env` basato su `.env.example`:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Drive API (Server-side)
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON={"type":"service_account",...}
```

### 2. Setup Google Drive

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto
3. Abilita Google Drive API
4. Crea un Service Account con ruolo Editor
5. Genera una chiave JSON per il Service Account
6. Crea una cartella su Google Drive chiamata `sfida-cime-foto`
7. Condividi la cartella con l'email del Service Account (Editor)
8. Copia l'ID della cartella dall'URL e configuralo in `GOOGLE_DRIVE_FOLDER_ID`
9. Converti il file JSON delle credenziali in una stringa e configuralo in `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON`
### 3. Setup Supabase

1. Crea un progetto su [Supabase](https://supabase.com)
2. Esegui le migrazioni in `supabase/migrations/`
3. Configura le variabili d'ambiente

## 🛠️ Sviluppo

```bash
# Installa dipendenze
npm install

# Avvia in sviluppo
npm run dev

# Avvia server backend
npm run server

# Build per produzione
npm run build
```

## 🌐 Deploy

### Frontend (Vercel/Netlify)

1. **Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**:
   - Connetti il repository GitHub
   - Build command: `npm run build`
   - Publish directory: `dist`

### Backend (Railway/Render)

1. **Railway**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway deploy
   ```

2. **Render**:
   - Connetti il repository GitHub
   - Build command: `npm install`
   - Start command: `npm start`

### Variabili d'Ambiente per Deploy

**Frontend (Vercel/Netlify)**:
```
VITE_SUPABASE_URL=https://rsuxvabiajlqdtjkzbii.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GOOGLE_DRIVE_FOLDER_ID=1pODDZOf0PfIUrUcQdxiO3PEkCkv_C4Pi
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

## 📱 Architettura

### Upload Foto (Server-Side con Google Drive)

L'applicazione usa Google Drive API tramite Vercel API routes:

1. **Client** → Invia file alle API routes Vercel
2. **API Route** → Autentica con Google Drive usando Service Account
3. **API Route** → Carica la foto su Google Drive
4. **API Route** → Restituisce l'URL pubblico al client
5. **Client** → Salva i metadati su Supabase

Questo approccio risolve:
- ✅ Autenticazione sicura (Service Account)
- ✅ 15 GB di spazio gratuito (vs 2 GB Dropbox)
- ✅ Problemi CORS
- ✅ Gestione errori centralizzata
- ✅ API più stabile e documentata

### Architettura Serverless

- **Frontend**: React SPA
- **API Routes**: Vercel serverless functions per Google Drive
- **Database**: Supabase per metadati e sincronizzazione
- **Storage**: Google Drive per file immagini

### Storage

- **Foto**: Google Drive (storage sicuro e condiviso)
- **Metadati**: Supabase (database relazionale)
- **Fallback**: LocalStorage (offline)

## 🎯 Le 10 Gilde

1. **Sorapis** - Cima del Lago di Cristallo
2. **Antermoia** - Cima delle Nebbie Rosate
3. **Puez** - Cima dei Custodi del Silenzio
4. **Tre Cime di Lavaredo** - Cima dei Tre Picchi
5. **Sassolungo** - Cima della Pietra Antica
6. **Piz Boè** - Cima del Picco del Tuono
7. **Monte Sole** - Cima dei Guardiani del Sole
8. **Catinaccio** - Cima delle Vette Rosate
9. **Sella** - Cima delle Rocce Erranti
10. **Pejo 3000** - Cima delle Nevi Eterne

## 📸 Le 15 Sfide

Dalle più semplici come "Il Brindisi Epico" alle più complesse come "Il Salto della Vittoria", ogni sfida è pensata per divertire e unire gli invitati.

## 🚀 Deploy

### Deploy Vercel (Consigliato)

**Full-stack su Vercel**:
- Build automatico da GitHub
- CDN globale per performance
- HTTPS automatico
- API routes serverless integrate

## 🔧 Troubleshooting

### Errori Comuni

1. **"connect ECONNREFUSED"**: Backend non avviato
   ```bash
   npm run server
   ```

2. **"Google Drive non configurato"**: Credenziali mancanti
   - Verifica `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON`
   - Verifica `GOOGLE_DRIVE_FOLDER_ID`

3. **"Supabase non raggiungibile"**: URL/Key errati
   - Verifica `VITE_SUPABASE_URL`
   - Verifica `VITE_SUPABASE_ANON_KEY`

### Debug

```bash
# Test connessioni
curl http://localhost:3000/api/test-googledrive

# Logs server
npm run server

# Logs frontend
npm run dev
```

## 📊 Monitoraggio

- **Frontend**: Vercel Analytics / Netlify Analytics
- **Backend**: Railway Metrics / Render Metrics
- **Database**: Supabase Dashboard
- **Storage**: Google Drive Storage Usage

## 🔐 Sicurezza

- Service Account per Google Drive (no OAuth)
- Row Level Security su Supabase
- Variabili d'ambiente per credenziali
- HTTPS obbligatorio in produzione
- CORS configurato per domini specifici

## 🤝 Contributi

Questo progetto è stato creato per un matrimonio specifico, ma sentiti libero di forkarlo e adattarlo per i tuoi eventi!

## 📄 Licenza

MIT License - Vedi [LICENSE](LICENSE) per dettagli.

---

*Che la vostra sfida sia leggendaria! 🏔️✨*