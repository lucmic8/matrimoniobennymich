import React, { useState, useEffect } from 'react';
import { X, Cloud, Check, AlertCircle, Info } from 'lucide-react';
import { DropboxService } from '../services/dropboxService';

interface DropboxConfigProps {
  onClose: () => void;
  onConfigured: () => void;
}

function DropboxConfig({ onClose, onConfigured }: DropboxConfigProps) {
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  useEffect(() => {
    // Prova prima l'inizializzazione automatica
    if (DropboxService.initializeWithDefaultToken()) {
      setIsConnected(true);
      loadAccountInfo();
      return;
    }
    
    // Controlla se Dropbox è già configurato con token salvato
    const savedToken = localStorage.getItem('dropbox_access_token');
    if (savedToken) {
      DropboxService.initialize(savedToken);
      if (DropboxService.isConfigured()) {
        setIsConnected(true);
        setAccessToken('***configurato***');
        loadAccountInfo();
      }
    }
  }, []);

  const loadAccountInfo = async () => {
    try {
      const info = await DropboxService.getAccountInfo();
      setAccountInfo(info);
    } catch (error) {
      console.error('Errore nel caricamento info account:', error);
    }
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      setError('Inserisci un token di accesso valido');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Inizializza Dropbox con il token
      DropboxService.initialize(accessToken.trim());
      
      // Verifica la connessione ottenendo le info dell'account
      const info = await DropboxService.getAccountInfo();
      
      // Salva il token nel localStorage
      localStorage.setItem('dropbox_access_token', accessToken.trim());
      
      setIsConnected(true);
      setAccountInfo(info);
      onConfigured();
      
    } catch (error) {
      console.error('Errore connessione Dropbox:', error);
      setError('Token non valido o errore di connessione. Verifica il token e riprova.');
      DropboxService.initialize(''); // Reset
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('dropbox_access_token');
    DropboxService.initialize('');
    setIsConnected(false);
    setAccountInfo(null);
    setAccessToken('');
  };

  const generateDropboxAppUrl = () => {
    return 'https://www.dropbox.com/developers/apps/create';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-blue-200 shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Configurazione Dropbox</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {isConnected && accountInfo ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">Connesso a Dropbox</span>
                </div>
                <p className="text-green-700 text-sm">
                  Account: {accountInfo.name?.display_name || accountInfo.email}
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Le foto verranno salvate nella cartella "/sfida-cime" del tuo Dropbox
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDisconnect}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  Disconnetti
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  Chiudi
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-2">🔑 Come ottenere il tuo token di accesso Dropbox:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Vai su <a href={generateDropboxAppUrl()} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Dropbox Developers</a></li>
                      <li><strong>Crea una nuova app</strong> (scegli "Scoped access" e "Full Dropbox")</li>
                      <li>Vai nella sezione "Settings" della tua app</li>
                      <li><strong>CRITICO:</strong> Nella sezione "Permissions" abilita:</li>
                      <li className="ml-4">
                        <div className="bg-red-50 border border-red-200 rounded p-2 mt-1">
                          <div className="text-xs font-mono space-y-1">
                            <div>✅ <code>files.content.write</code></div>
                            <div>✅ <code>sharing.write</code></div>
                            <div>✅ <code>sharing.read</code></div>
                            <div>✅ <code>files.content.read</code></div>
                          </div>
                        </div>
                      </li>
                      <li>Scorri fino a "Generated access token"</li>
                      <li>Clicca "Generate" per creare il token</li>
                      <li>Copia il token e incollalo qui sotto</li>
                    </ol>
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <strong>🚨 ATTENZIONE:</strong> Senza TUTTI i permessi sopra elencati, il caricamento e la condivisione delle foto falliranno!
                    </div>
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <strong>💡 Suggerimento:</strong> Dopo aver aggiunto i permessi, clicca "Submit" nella pagina Dropbox e rigenera il token!
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token di Accesso Dropbox
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Incolla qui il tuo token di accesso..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isConnecting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !accessToken.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connessione...
                    </>
                  ) : (
                    'Connetti Dropbox'
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isConnecting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 disabled:text-gray-500 py-2 px-4 rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
                >
                  Annulla
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-xs">
                  <strong>Nota:</strong> Il token verrà salvato localmente nel tuo browser. 
                  Le foto saranno caricate nel tuo Dropbox personale e accessibili da tutti i dispositivi.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DropboxConfig;