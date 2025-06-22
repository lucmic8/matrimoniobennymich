import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Mountain, 
  Crown,
  Star,
  CheckCircle,
  Circle
} from 'lucide-react';
import { guilds } from '../data/guilds';
import { challenges } from '../data/challenges';

function GuildPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const navigate = useNavigate();
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());

  const guild = guilds.find(g => g.id === guildId);

  if (!guild) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center bg-white/80 p-8 rounded-2xl border-2 border-amber-200 shadow-lg">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Gilda non trovata</h1>
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

  const toggleChallenge = (challengeId: number) => {
    const newCompleted = new Set(completedChallenges);
    if (newCompleted.has(challengeId)) {
      newCompleted.delete(challengeId);
    } else {
      newCompleted.add(challengeId);
    }
    setCompletedChallenges(newCompleted);
  };

  const completionPercentage = (completedChallenges.size / challenges.length) * 100;

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
              Torna alle Gilde
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
                  <span className="text-amber-700 font-semibold">Progresso della Quest</span>
                  <span className="text-amber-800">{completedChallenges.size}/{challenges.length} Prove</span>
                </div>
                <div className="w-full bg-amber-200/50 rounded-full h-3 border border-amber-300">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-amber-700 mt-2">
                  {completionPercentage === 100 ? '🏆 Quest Completata! Siete degni della gloria eterna!' : 
                   completionPercentage >= 50 ? '⚔️ Ottimo lavoro, continuate così!' : 
                   '🗡️ La vostra avventura è appena iniziata!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Section */}
        <div className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-cyan-700 mr-3" />
                <h3 className="text-3xl md:text-4xl font-bold text-amber-900">Le 10 Prove Fotografiche</h3>
                <Camera className="h-8 w-8 text-cyan-700 ml-3" />
              </div>
              <p className="text-lg text-amber-800 max-w-3xl mx-auto">
                Completate tutte le missioni per conquistare la vetta della gloria. Ogni prova deve essere immortalata con una foto!
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
                        
                        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center text-sm font-medium shadow-md hover:shadow-lg">
                          <Upload className="h-4 w-4 mr-2" />
                          Carica la Prova
                        </button>
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
                  La <span className="text-amber-700 font-bold">{guild.subtitle}</span> ha conquistato tutte le vette!
                </p>
                <p className="text-lg text-amber-700">
                  Siete degni di essere ricordati nelle leggende delle Grandi Cime! 
                  La vostra gloria risuonerà per l'eternità tra le montagne!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuildPage;