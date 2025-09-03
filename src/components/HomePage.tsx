import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mountain, 
  Camera, 
  Trophy, 
  Scroll, 
  Crown,
  Upload,
  Star,
  Heart,
  Users,
  MapPin,
  Sparkles
} from 'lucide-react';
import { guilds } from '../data/guilds';

function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleGuildSelect = (guildId: string) => {
    navigate(`/guild/${guildId}`);
  };

  return (
    <div className="min-h-screen relative bg-amber-50">
      {/* Summer Mountain Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=1920')`
        }}
      />
      
      {/* Pergamena Texture Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 opacity-95"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center justify-center mb-6">
                  <Mountain className="h-12 w-12 text-amber-700 mr-4" />
                  <Crown className="h-16 w-16 text-amber-600" />
                  <Mountain className="h-12 w-12 text-amber-700 ml-4" />
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-6 leading-tight drop-shadow-sm">
                  <span className="bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-900 bg-clip-text text-transparent">
                    Sfida all'ultima Cima
                  </span>
                </h1>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto border-2 border-amber-200 shadow-lg">
                  <p className="text-xl md:text-2xl text-amber-900 leading-relaxed">
                    Cari amici e parenti, abbiamo organizzato per voi alcune sfide.
                    <br />
                    Trovate la vostra cima e...che vinca il miglior tavolo!
                    <br />
                    <span className="text-amber-800 font-bold">Completate le missioni fotografiche per la gloria!</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rules Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm border-y border-amber-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Scroll className="h-8 w-8 text-amber-700 mr-3" />
                <h3 className="text-3xl md:text-4xl font-bold text-amber-900">Regole del Gioco</h3>
                <Scroll className="h-8 w-8 text-amber-700 ml-3" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/70 rounded-2xl p-8 border-2 border-green-400 shadow-lg">
                <Mountain className="h-12 w-12 text-green-700 mb-4" />
                <h4 className="text-xl font-bold text-amber-900 mb-4">Le Cime</h4>
                <p className="text-amber-800">Ogni tavolo appartiene a una Cima delle Dolomiti. Unite le forze per la gloria!</p>
              </div>
              
              <div className="bg-white/70 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
                <Camera className="h-12 w-12 text-purple-700 mb-4" />
                <h4 className="text-xl font-bold text-amber-900 mb-4">Le Missioni</h4>
                <p className="text-amber-800">10 missioni fotografiche epiche vi aspettano durante il banchetto!</p>
              </div>
              
              <div className="bg-white/70 rounded-2xl p-8 border-2 border-yellow-400 shadow-lg">
                <Trophy className="h-12 w-12 text-yellow-600 mb-4" />
                <h4 className="text-xl font-bold text-amber-900 mb-4">La Gloria</h4>
                <p className="text-amber-800">Completate tutte le prove per scalare la vetta della gloria eterna!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Upload className="h-8 w-8 text-cyan-700 mr-3" />
              <h3 className="text-3xl md:text-4xl font-bold text-amber-900">Caricamento delle Prove</h3>
              <Upload className="h-8 w-8 text-cyan-700 ml-3" />
            </div>
            
            <div className="bg-white/70 rounded-2xl p-8 border-2 border-cyan-200 shadow-lg">
              <p className="text-xl text-amber-900 mb-6">
                Usate il link <span className="text-cyan-700 font-semibold">"Carica la Prova"</span> presente sotto ogni missione.
              </p>
              <p className="text-lg text-amber-800">
                Tutti gli scatti verranno caricati in una galleria condivisa per essere ammirate da tutti.
              </p>
            </div>
          </div>
        </div>

        {/* Guild Selection */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm border-y border-amber-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-emerald-700 mr-3" />
                <h3 className="text-3xl md:text-4xl font-bold text-amber-900">Scegli la Tua Montagna</h3>
                <MapPin className="h-8 w-8 text-emerald-700 ml-3" />
              </div>
              <p className="text-xl text-amber-800 max-w-3xl mx-auto">
                Ogni montagna rappresenta un tavolo. Clicca sulla tua per accedere alla pagina delle missioni. 
                Solo completando tutte le prove potrete scalare la vetta della gloria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {guilds.map((guild, index) => (
                <div
                  key={guild.id}
                  className={`group cursor-pointer transition-all duration-500 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onClick={() => handleGuildSelect(guild.id)}
                  onContextMenu={(e) => e.preventDefault()}
                  onTouchStart={(e) => {
                    // Previene il menu contestuale su iOS
                    e.currentTarget.style.webkitTouchCallout = 'none';
                    e.currentTarget.style.webkitUserSelect = 'none';
                  }}
                >
                  <div className="relative bg-white/80 rounded-2xl overflow-hidden border-2 border-amber-200 group-hover:scale-105 transition-transform duration-300 group-hover:border-amber-400 shadow-lg group-hover:shadow-xl">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={guild.image}
                        alt={guild.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          'group-hover:scale-110'
                        }`}
                        loading="lazy"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        onTouchStart={(e) => {
                          // Previene il menu contestuale specifico per l'immagine
                          e.preventDefault();
                        }}
                        style={{
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          userSelect: 'none',
                          pointerEvents: 'none' // L'immagine non intercetta i touch events
                        }}
                        onError={(e) => {
                          console.warn(`Errore caricamento immagine per ${guild.name}`);
                          // Fallback a un'immagine placeholder
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=800';
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 border border-amber-300">
                          <Mountain className="h-5 w-5 text-amber-700" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors">
                        {guild.name}
                      </h4>
                      <h5 className="text-amber-700 font-semibold mb-3 text-sm">
                        {guild.subtitle}
                      </h5>
                      <p className="text-amber-800 text-sm leading-relaxed">
                        {guild.description}
                      </p>
                      
                      <div className="mt-4 flex items-center text-amber-700 text-sm font-medium">
                        <span>Entra nella Cima</span>
                        <Star className="h-4 w-4 ml-2 group-hover:animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Notes */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-pink-700 mr-3" />
              <h3 className="text-3xl md:text-4xl font-bold text-amber-900">Note Finali</h3>
              <Sparkles className="h-8 w-8 text-pink-700 ml-3" />
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/70 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-52 h-52 rounded-full overflow-hidden border-4 border-pink-300 shadow-lg bg-gradient-to-br from-pink-200/80 to-purple-200/80">
                    <img
                      src="/images/FotoNoteFinalipng.png"
                      alt="Note Finali"
                      className="w-full h-full object-cover object-[center_25%]"
                    />
                  </div>
                </div>
                <p className="text-xl text-amber-900 mb-4">
                  Le prove sono pensate per <span className="text-pink-700 font-semibold">divertire, unire e far ridere</span>.
                </p>
                <p className="text-xl text-amber-900">
                  Grazie a tutti della vostra presenza e speriamo che vi divertiate in questa avventura fotografica tra le nostre amate Dolomiti. 
                  La vostra <span className="text-pink-700 font-bold">creatività</span> e il vostro spirito di squadra renderanno questa giornata indimenticabile.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-8 px-4 bg-white/60 backdrop-blur-sm border-t-2 border-amber-200">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-6 w-6 text-amber-700 mr-2" />
              <span className="text-amber-800 font-semibold">Benny & Mich</span>
              <Crown className="h-6 w-6 text-amber-700 ml-2" />
            </div>
            <p className="text-amber-700">
              Che la vostra sfida sia leggendaria! 🏔️✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;