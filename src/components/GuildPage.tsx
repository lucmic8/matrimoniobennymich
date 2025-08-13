import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Mountain, 
  Crown,
  Star,
  CheckCircle,
  Circle,
  Loader,
  RefreshCw,
  Cloud
} from 'lucide-react';
import { guilds } from '../data/guilds';
import { challenges } from '../data/challenges';
import PhotoUpload from './PhotoUpload';
import { PhotoService } from '../services/photoService';
import { DropboxService } from '../services/dropboxService';
import DropboxConfig from './DropboxConfig';

function GuildPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const navigate = useNavigate();
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
  const [challengePhotos, setChallengePhotos] = useState<Map<number, string>>(new Map());
  const [uploadingChallenge, setUploadingChallenge] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDropboxConfig, setShowDropboxConfig] = useState(false);
  const [dropboxConfigured, setDropboxConfigured] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Carica i dati da Supabase al mount del componente
  useEffect(() => {
    loadGuildData();
    autoConfigureDropbox();
  }, [guildId]);

  const autoConfigureDropbox = () => {
    try {
      // Prova inizializzazione automatica
      const initialized = DropboxService.initializeWithDefaultToken();
      if (initialized) {
        setDropboxConfigured(true);
        console.log('✅ Dropbox configurato automaticamente');
        return;
      }
      
      console.warn('⚠️ Dropbox non configurato - serve token utente');
      setDropboxConfigured(false);
    } catch (error) {
      console.error('❌ Errore configurazione Dropbox:', error);
      setDropboxConfigured(false);
    }
  };

  const loadGuildData = async () => {
    if (!guildId) return;
    
    setIsLoading(true);
    try {
      console.log('Caricamento dati per gilda:', guildId);
      
      // Carica le foto delle sfide
      const photos = await PhotoService.getGuildPhotos(guildId);
      const photoMap = new Map<number, string>();
      photos.forEach(photo => {
        photoMap.set(photo.challenge_id, photo.photo_url);
      });
      setChallengePhotos(photoMap);
      
      // Carica il progresso delle sfide
      const progress = await PhotoService.getGuildProgress(guildId);
      const completedSet = new Set<number>();
      progress.forEach(p => {
        if (p.completed) {
          completedSet.add(p.challenge_id);
        }
      });
      setCompletedChallenges(completedSet);
      
      console.log('Dati caricati:', { 
        photos: photos.length, 
        completed: completedSet.size 
      });
      
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Forza sincronizzazione
      if (guildId) {
        await PhotoService.forceSyncGuild(guildId);
      }
      await loadGuildData();
    } catch (error) {
      console.error('Errore nel refresh:', error);
    }
    setIsRefreshing(false);
  };

  const guild = guilds.find(g => g.id === guildId);

  if (!guild) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center bg-white/80 p-8 rounded-2xl border-2 border-amber-200 shadow-lg">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Cima non trovata</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const toggleChallenge = async (challengeId: number) => {
    if (!guildId) return;
    
    const newCompleted = new Set(completedChallenges);
    const isCompleted = !newCompleted.has(challengeId);
    
    if (newCompleted.has(challengeId)) {
      newCompleted.delete(challengeId);
    } else {
      newCompleted.add(challengeId);
    }
    setCompletedChallenges(newCompleted);
    
    // Aggiorna il progresso su Supabase
    try {
      await PhotoService.updateChallengeProgress(guildId, challengeId, isCompleted);
      console.log('Progresso aggiornato per sfida:', challengeId);
    } catch (error) {
      console.error('Errore aggiornamento progresso:', error);
    }
  };

  const handlePhotoUploaded = async (challengeId: number, photoUrl: string) => {
    if (!guildId) return;
    
    // Aggiorna la mappa delle foto
    const newPhotos = new Map(challengePhotos);
    if (photoUrl) {
      newPhotos.set(challengeId, photoUrl);
    } else {
      newPhotos.delete(challengeId);
    }
    setChallengePhotos(newPhotos);
    
    // Marca automaticamente la sfida come completata se c'è una foto
    const newCompleted = new Set(completedChallenges);
    if (photoUrl) {
      newCompleted.add(challengeId);
    } else {
      newCompleted.delete(challengeId);
    }
    setCompletedChallenges(newCompleted);
    
    // Aggiorna il progresso su Supabase
    try {
      await PhotoService.updateChallengeProgress(guildId, challengeId, !!photoUrl);
      console.log('Foto e progresso aggiornati per sfida:', challengeId);
    } catch (error) {
      console.error('Errore aggiornamento foto:', error);
    }
  };

  const completionPercentage = (completedChallenges.size / challenges.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center bg-white/80 p-8 rounded-2xl border-2 border-amber-200 shadow-lg">
          <Loader className="h-12 w-12 text-amber-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-amber-900 mb-2">Caricamento dati...</h2>
          <p className="text-amber-700">Stiamo recuperando le foto e il progresso della tua cima</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-amber-50">
      {/* Summer Mountain Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('${guild.image}')`
        }}
      />
      
      {/* Pergamena Texture Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 opacity-95"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-amber-800 hover:text-amber-700 transition-colors mb-8 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-amber-300 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Torna alle Cime
            </button>

            {/* Guild Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-amber-200 shadow-lg mb-8">
              <div className="flex items-center mb-6">
                <Mountain className="h-12 w-12 text-amber-700 mr-4" />
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-2">
                    {guild.name}
                  </h1>
                  <h2 className="text-xl md:text-2xl text-amber-700 font-semibold">
                    {guild.subtitle}
                  </h2>
                </div>
              </div>
              
              <p className="text-lg text-amber-800 mb-6 leading-relaxed">
                {guild.fullDescription}
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-700 font-semibold">Progresso della Sfida</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-800">{completedChallenges.size}/{challenges.length} Prove</span>
                    <button
                      onClick={refreshData}
                      disabled={isRefreshing}
                      className="text-amber-600 hover:text-amber-800 transition-colors disabled:opacity-50 flex items-center gap-1"
                      title="Sincronizza dati tra dispositivi"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing && <span className="text-xs">Sync...</span>}
                    </button>
                  </div>
                </div>
                <div className="w-full bg-amber-200/50 rounded-full h-3 border border-amber-300">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-amber-700 mt-2">
                  {completionPercentage === 100 ? '🏆 Sfida Completata! Siete degni della gloria eterna!' : 
                   completionPercentage >= 50 ? '⚔️ Ottimo lavoro, continuate così!' : 
                   '🗡️ La vostra avventura è appena iniziata!'}
                </p>
              </div>
            </div>
          </div>
            {/* Dropbox Configuration Button */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-amber-700 font-semibold">Storage delle Foto</span>
                <button
                  onClick={() => setShowDropboxConfig(true)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center text-sm font-medium shadow-md hover:shadow-lg ${
                    dropboxConfigured
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white cursor-default'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                  }`}
                  disabled={dropboxConfigured}
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  {dropboxConfigured ? '✅ Dropbox Attivo' : 'Configura Dropbox'}
                </button>
              </div>
              <p className="text-sm text-amber-600 mt-1">
                {dropboxConfigured 
                  ? '✅ Tutte le foto vengono salvate automaticamente su Dropbox e sincronizzate tra dispositivi'
                  : '⚠️ ATTENZIONE: Dropbox non configurato. Devi inserire il tuo token di accesso per sincronizzare le foto tra dispositivi'
                }
              </p>
            </div>
        </div>

        {/* Challenges Section */}
        <div className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-cyan-700 mr-3" />
                <h3 className="text-3xl md:text-4xl font-bold text-amber-900">Le Prove Fotografiche</h3>
                <Camera className="h-8 w-8 text-cyan-700 ml-3" />
              </div>
              <p className="text-lg text-amber-800 max-w-3xl mx-auto">
                Completate tutte le missioni per conquistare la vetta della gloria. 
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {challenges.map((challenge, index) => (
                <div
                  key={challenge.id}
                  className={`bg-white/80 rounded-2xl p-6 border-2 backdrop-blur-sm shadow-lg transition-all duration-300 ${
                    completedChallenges.has(challenge.id) 
                      ? 'border-green-400 bg-green-50/80' 
                      : 'border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => toggleChallenge(challenge.id)}
                        className="transition-colors duration-200"
                      >
                        {completedChallenges.has(challenge.id) ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <Circle className="h-8 w-8 text-amber-600 hover:text-amber-700" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center mb-3">
                        <span className="bg-amber-200/80 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold mr-3 border border-amber-300">
                          Prova {index + 1}
                        </span>
                        <div className="text-2xl mr-2">{challenge.icon}</div>
                      </div>
                      
                      <h4 className={`text-xl font-bold mb-3 transition-colors ${
                        completedChallenges.has(challenge.id) ? 'text-green-700' : 'text-amber-900'
                      }`}>
                        {challenge.title}
                      </h4>
                      
                      <p className="text-amber-800 mb-4 leading-relaxed">
                        {challenge.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {challenge.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="bg-blue-200/80 text-blue-800 px-2 py-1 rounded text-xs border border-blue-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-amber-700 text-sm">
                          <Star className="h-4 w-4 mr-1" />
                          <span className="font-medium">Difficoltà: {challenge.difficulty}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {challengePhotos.has(challenge.id) && (
                            <div className="bg-green-100 rounded-full p-1 border border-green-300">
                              <Camera className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                          <button 
                            onClick={() => setUploadingChallenge(challenge.id)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center text-sm font-medium shadow-md hover:shadow-lg ${
                              challengePhotos.has(challenge.id)
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white'
                            }`}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {challengePhotos.has(challenge.id) ? 'Gestisci Foto' : 'Carica la Prova'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Victory Message */}
            {completionPercentage === 100 && (
              <div className="mt-12 bg-gradient-to-r from-amber-200/80 to-yellow-200/80 rounded-2xl p-8 border-2 border-amber-400 backdrop-blur-sm shadow-lg text-center">
                <Crown className="h-16 w-16 text-amber-700 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-amber-900 mb-4">🏆 VITTORIA EPICA! 🏆</h3>
                <p className="text-xl text-amber-800 mb-4">
                  La <span className="text-amber-700 font-bold">{guild.subtitle}</span> ha conquistato tutte le cime!
                </p>
                <p className="text-lg text-amber-700">
                  Siete degni di essere ricordati nelle leggende delle Grandi Montagne! 
                  La vostra gloria risuonerà per l'eternità tra le montagne!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropbox Configuration Modal */}
      {showDropboxConfig && (
        <DropboxConfig
          onClose={() => setShowDropboxConfig(false)}
          onConfigured={() => {
            setDropboxConfigured(true);
            setShowDropboxConfig(false);
          }}
        />
      )}

      {/* Photo Upload Modal */}
      {uploadingChallenge && (
        <PhotoUpload
          challengeId={uploadingChallenge}
          challengeTitle={challenges.find(c => c.id === uploadingChallenge)?.title || ''}
          guildId={guildId || ''}
          onClose={() => setUploadingChallenge(null)}
          onPhotoUploaded={handlePhotoUploaded}
          existingPhoto={challengePhotos.get(uploadingChallenge)}
        />
      )}
    </div>
  );
}

export default GuildPage;