/*
  # Sistema di gestione sfide fotografiche

  1. Nuove Tabelle
    - `challenge_photos`
      - `id` (uuid, primary key)
      - `guild_id` (text, ID della gilda)
      - `challenge_id` (integer, ID della sfida)
      - `photo_url` (text, URL della foto)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `guild_progress`
      - `id` (uuid, primary key)
      - `guild_id` (text, ID della gilda)
      - `challenge_id` (integer, ID della sfida)
      - `completed` (boolean, se la sfida è completata)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Bucket `challenge-photos` per le immagini

  3. Sicurezza
    - RLS abilitato su tutte le tabelle
    - Policy per lettura pubblica
    - Policy per inserimento e aggiornamento pubblico (per semplicità)
*/

-- Tabella per le foto delle sfide
CREATE TABLE IF NOT EXISTS challenge_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL,
  challenge_id integer NOT NULL,
  photo_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(guild_id, challenge_id)
);

-- Tabella per il progresso delle gilde
CREATE TABLE IF NOT EXISTS guild_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL,
  challenge_id integer NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(guild_id, challenge_id)
);

-- Abilita RLS
ALTER TABLE challenge_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_progress ENABLE ROW LEVEL SECURITY;

-- Policy per lettura pubblica delle foto
CREATE POLICY "Tutti possono vedere le foto delle sfide"
  ON challenge_photos
  FOR SELECT
  TO public
  USING (true);

-- Policy per inserimento e aggiornamento delle foto
CREATE POLICY "Tutti possono caricare foto delle sfide"
  ON challenge_photos
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Tutti possono aggiornare foto delle sfide"
  ON challenge_photos
  FOR UPDATE
  TO public
  USING (true);

-- Policy per eliminazione delle foto
CREATE POLICY "Tutti possono eliminare foto delle sfide"
  ON challenge_photos
  FOR DELETE
  TO public
  USING (true);

-- Policy per lettura pubblica del progresso
CREATE POLICY "Tutti possono vedere il progresso delle gilde"
  ON guild_progress
  FOR SELECT
  TO public
  USING (true);

-- Policy per inserimento e aggiornamento del progresso
CREATE POLICY "Tutti possono aggiornare il progresso delle gilde"
  ON guild_progress
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Tutti possono modificare il progresso delle gilde"
  ON guild_progress
  FOR UPDATE
  TO public
  USING (true);

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_challenge_photos_updated_at 
  BEFORE UPDATE ON challenge_photos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guild_progress_updated_at 
  BEFORE UPDATE ON guild_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crea il bucket per le foto se non esiste
INSERT INTO storage.buckets (id, name, public)
VALUES ('challenge-photos', 'challenge-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy per il bucket storage
CREATE POLICY "Tutti possono vedere le foto"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'challenge-photos');

CREATE POLICY "Tutti possono caricare foto"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'challenge-photos');

CREATE POLICY "Tutti possono aggiornare foto"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'challenge-photos');

CREATE POLICY "Tutti possono eliminare foto"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'challenge-photos');