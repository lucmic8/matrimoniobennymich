# La Quest degli Sposi - Le Gilde delle Grandi Cime

Un'applicazione web per gestire sfide fotografiche durante matrimoni, con tema montano delle Dolomiti.

## 🏔️ Caratteristiche

- **10 Gilde delle Montagne**: Ogni tavolo rappresenta una montagna delle Dolomiti
- **15 Sfide Fotografiche**: Missioni divertenti da completare durante il banchetto
- **Upload Foto**: Caricamento sicuro delle foto su Dropbox (server-side)
- **Sincronizzazione**: Database Supabase per sincronizzazione multi-dispositivo
- **Responsive**: Ottimizzato per mobile e desktop

## 🚀 Tecnologie

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Dropbox (server-side)
- **Deploy**: Vercel/Netlify

## ⚙️ Configurazione

### 1. Variabili d'Ambiente

Crea un file `.env` basato su `.env.example`:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Dropbox (Server-side) - OPZIONE 1: Refresh Token (RACCOMANDATO)
DROPBOX_REFRESH_TOKEN=your_dropbox_refresh_token
DROPBOX_APP_KEY=your_dropbox_app_key
DROPBOX_APP_SECRET=your_dropbox_app_secret

# Dropbox (Server-side) - OPZIONE 2: Access Token (DEPRECATO)
DROPBOX_ACCESS_TOKEN=your_dropbox_access_token
```

### 2. Setup Dropbox

#### Opzione A: Refresh Token (Raccomandato)

1. Vai su [Dropbox Developers](https://www.dropbox.com/developers/apps)
2. Crea una nuova app con "Scoped access" e "Full Dropbox"
3. Nella sezione "Permissions", abilita:
   - `files.content.write`
   - `files.content.read`
   - `sharing.write`
   - `sharing.read`
4. Ottieni `App key` e `App secret`
5. Genera un `Refresh token` usando OAuth2 flow
6. Configura le variabili d'ambiente

#### Opzione B: Access Token (Deprecato)

1. Vai su [Dropbox Developers](https://www.dropbox.com/developers/apps)
2. Crea una nuova app e abilita i permessi sopra elencati
3. Genera un "Access token" (scade dopo poche ore)
4. Configura `DROPBOX_ACCESS_TOKEN`

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

## 📱 Architettura

### Upload Foto (Server-Side)

L'applicazione usa un'architettura server-side per l'upload delle foto:

1. **Client** → Invia file al server Express
2. **Server** → Refresha automaticamente il token Dropbox
3. **Server** → Carica la foto su Dropbox
4. **Server** → Restituisce l'URL pubblico al client
5. **Client** → Salva i metadati su Supabase

Questo approccio risolve:
- ✅ Token scaduti (refresh automatico)
- ✅ Sicurezza (token non esposti al client)
- ✅ Problemi CORS
- ✅ Gestione errori centralizzata

### Storage

- **Foto**: Dropbox (storage sicuro e condiviso)
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

### Vercel/Netlify (Frontend + API)

1. Connetti il repository
2. Configura le variabili d'ambiente
3. Deploy automatico

### Server Separato (Opzionale)

Se preferisci separare frontend e backend:

1. Deploy frontend su Vercel/Netlify
2. Deploy server Express su Railway/Render
3. Aggiorna gli endpoint API nel frontend

## 🤝 Contributi

Questo progetto è stato creato per un matrimonio specifico, ma sentiti libero di forkarlo e adattarlo per i tuoi eventi!

## 📄 Licenza

MIT License - Vedi [LICENSE](LICENSE) per dettagli.

---

*Che la vostra sfida sia leggendaria! 🏔️✨*