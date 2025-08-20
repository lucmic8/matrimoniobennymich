import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ChallengePhoto {
  id: string;
  guild_id: string;
  challenge_id: number;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

export interface GuildProgress {
  id: string;
  guild_id: string;
  challenge_id: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export class SupabaseService {
  private static supabase: SupabaseClient | null = null;
  private static isInitialized = false;

  // Inizializza Supabase
  static initialize() {
    if (this.isInitialized) return;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Variabili Supabase non configurate, usando storage locale');
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.isInitialized = true;
      console.log('✅ Supabase inizializzato correttamente');
    } catch (error) {
      console.error('❌ Errore inizializzazione Supabase:', error);
    }
  }

  // Verifica se Supabase è disponibile
  static isAvailable(): boolean {
    return this.supabase !== null && this.isInitialized;
  }

  // Salva foto su Supabase
  static async savePhoto(guildId: string, challengeId: number, photoUrl: string): Promise<void> {
    if (!this.isAvailable()) {
      console.log('📱 Supabase non disponibile, salvo localmente');
      return;
    }

    try {
      const { data, error } = await this.supabase!
        .from('challenge_photos')
        .upsert({
          guild_id: guildId,
          challenge_id: challengeId,
          photo_url: photoUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'guild_id,challenge_id'
        });

      if (error) {
        console.error('❌ Errore salvataggio foto Supabase:', error);
        throw error;
      }

      console.log('✅ Foto salvata su Supabase');
    } catch (error) {
      console.error('❌ Errore Supabase savePhoto:', error);
      throw error;
    }
  }

  // Carica foto da Supabase
  static async getGuildPhotos(guildId: string): Promise<ChallengePhoto[]> {
    if (!this.isAvailable()) {
      console.log('📱 Supabase non disponibile, uso storage locale');
      return [];
    }

    try {
      const { data, error } = await this.supabase!
        .from('challenge_photos')
        .select('*')
        .eq('guild_id', guildId)
        .order('challenge_id', { ascending: true });

      if (error) {
        console.error('❌ Errore caricamento foto Supabase:', error);
        return [];
      }

      console.log(`📸 Caricate ${data?.length || 0} foto da Supabase per ${guildId}`);
      return data || [];
    } catch (error) {
      console.error('❌ Errore Supabase getGuildPhotos:', error);
      return [];
    }
  }

  // Elimina foto da Supabase
  static async deletePhoto(guildId: string, challengeId: number): Promise<void> {
    if (!this.isAvailable()) {
      console.log('📱 Supabase non disponibile');
      return;
    }

    try {
      const { error } = await this.supabase!
        .from('challenge_photos')
        .delete()
        .eq('guild_id', guildId)
        .eq('challenge_id', challengeId);

      if (error) {
        console.error('❌ Errore eliminazione foto Supabase:', error);
        throw error;
      }

      console.log('🗑️ Foto eliminata da Supabase');
    } catch (error) {
      console.error('❌ Errore Supabase deletePhoto:', error);
      throw error;
    }
  }

  // Salva progresso su Supabase
  static async saveProgress(guildId: string, challengeId: number, completed: boolean): Promise<void> {
    if (!this.isAvailable()) {
      console.log('📱 Supabase non disponibile, salvo localmente');
      return;
    }

    try {
      const { data, error } = await this.supabase!
        .from('guild_progress')
        .upsert({
          guild_id: guildId,
          challenge_id: challengeId,
          completed: completed,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'guild_id,challenge_id'
        });

      if (error) {
        console.error('❌ Errore salvataggio progresso Supabase:', error);
        throw error;
      }

      console.log('✅ Progresso salvato su Supabase');
    } catch (error) {
      console.error('❌ Errore Supabase saveProgress:', error);
      throw error;
    }
  }

  // Carica progresso da Supabase
  static async getGuildProgress(guildId: string): Promise<GuildProgress[]> {
    if (!this.isAvailable()) {
      console.log('📱 Supabase non disponibile, uso storage locale');
      return [];
    }

    try {
      const { data, error } = await this.supabase!
        .from('guild_progress')
        .select('*')
        .eq('guild_id', guildId)
        .order('challenge_id', { ascending: true });

      if (error) {
        console.error('❌ Errore caricamento progresso Supabase:', error);
        return [];
      }

      console.log(`📊 Caricato progresso da Supabase per ${guildId}:`, data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Errore Supabase getGuildProgress:', error);
      return [];
    }
  }

  // Test connessione Supabase
  static async testConnection(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const { data, error } = await this.supabase!
        .from('challenge_photos')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Test connessione Supabase fallito:', error);
        return false;
      }

      console.log('✅ Test connessione Supabase riuscito');
      return true;
    } catch (error) {
      console.error('❌ Errore test connessione Supabase:', error);
      return false;
    }
  }
}