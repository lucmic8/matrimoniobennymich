import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, Check, X, Image, Loader } from 'lucide-react';
import { PhotoService } from '../services/photoService';

interface PhotoUploadProps {
  challengeId: number;
  challengeTitle: string;
  guildId: string;
  onClose: () => void;
  onPhotoUploaded: (challengeId: number, photoUrl: string) => void;
  existingPhoto?: string;
}

function PhotoUpload({ challengeId, challengeTitle, guildId, onClose, onPhotoUploaded, existingPhoto }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingPhoto || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingPhoto) {
      setPreviewUrl(existingPhoto);
    }
  }, [existingPhoto]);

  // Cleanup degli URL blob quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, isCamera: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('=== 📱 FILE SELEZIONATO (ULTRA DEBUG) ===');
      console.log('📋 Dettagli completi:', { 
        name: file.name, 
        size: file.size, 
        type: file.type,
        isCamera,
        lastModified: new Date(file.lastModified).toISOString(),
        webkitRelativePath: (file as any).webkitRelativePath || 'N/A',
        constructor: file.constructor.name,
        sizeKB: (file.size / 1024).toFixed(2) + ' KB',
        sizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
      
      // VALIDAZIONE ULTRA-PERMISSIVA: Accetta tutto tranne file vuoti
      console.log('🔍 VALIDAZIONE ULTRA-PERMISSIVA INIZIATA...');

      // 1. Verifica che non sia vuoto
      if (file.size === 0) {
        console.error('❌ ERRORE: File completamente vuoto');
        setError('Il file selezionato è vuoto. Prova a scattare/selezionare un\'altra foto.');
        return;
      }
      console.log('✅ CHECK 1: File non vuoto');

      // 2. Verifica dimensione massima (50MB)
      if (file.size > 50 * 1024 * 1024) {
        console.error('❌ ERRORE: File troppo grande:', (file.size / 1024 / 1024).toFixed(2) + ' MB');
        setError(`Il file è troppo grande (${(file.size / 1024 / 1024).toFixed(2)} MB). Dimensione massima: 50MB`);
        return;
      }
      console.log('✅ CHECK 2: Dimensione accettabile');

      // 3. Verifica dimensione minima (almeno 100 bytes)
      if (file.size < 100) {
        console.error('❌ ERRORE: File troppo piccolo:', file.size + ' bytes');
        setError(`Il file è troppo piccolo (${file.size} bytes). Potrebbe essere corrotto.`);
        return;
      }
      console.log('✅ CHECK 3: Dimensione minima OK');

      // 4. ACCETTA TUTTO IL RESTO
      console.log('✅ VALIDAZIONE COMPLETATA: File accettato per mobile');
      console.log('📊 File finale:', {
        accepted: true,
        reason: 'Validazione ultra-permissiva per mobile',
        size: file.size,
        type: file.type || 'non specificato'
      });

      // 5. Crea preview
      try {
        setSelectedFile(file);
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        const newUrl = URL.createObjectURL(file);
        setPreviewUrl(newUrl);
        setError(null);
        console.log('✅ Preview creata con successo');
      } catch (previewError) {
        console.error('❌ Errore creazione preview:', previewError);
        setError('Impossibile creare anteprima, ma il file potrebbe essere comunque valido');
      }
    }
    
    // Reset input value per permettere di selezionare lo stesso file
    event.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile && !existingPhoto) return;

    console.log('=== INIZIO PROCESSO UPLOAD ===');
    setIsUploading(true);
    setError(null);
    
    try {
      let photoUrl: string;

      if (selectedFile) {
        // Carica la nuova foto
        console.log('Caricamento nuova foto in corso...');
        photoUrl = await PhotoService.uploadPhoto(selectedFile, guildId, challengeId);
      } else {
        // Usa la foto esistente
        photoUrl = existingPhoto!;
      }
      
      // Notifica il componente padre
      onPhotoUploaded(challengeId, photoUrl);
      console.log('✅ Upload completato con successo');
      
      setUploadSuccess(true);
      
      // Chiudi il modal dopo 2 secondi
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('❌ ERRORE nel caricamento:', error);
      if (error instanceof Error) {
        console.error('Messaggio errore:', error.message);
        console.error('Stack trace:', error.stack);
      }
      
      // Mostra un errore più user-friendly
      setError(error instanceof Error ? error.message : 'Errore nel caricamento della foto');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const removePhoto = async () => {
    try {
      setIsUploading(true);
      
      // Elimina la foto dal server se esiste
      if (existingPhoto) {
        await PhotoService.deletePhoto(guildId, challengeId);
      }
      
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      
      // Notifica il componente padre che la foto è stata rimossa
      onPhotoUploaded(challengeId, '');
      
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      setError('Impossibile eliminare la foto');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-amber-200 shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-amber-900">Gestisci Prova</h3>
            <button
              onClick={onClose}
              className="text-amber-600 hover:text-amber-800 transition-colors"
              disabled={isUploading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-amber-800 font-medium mb-2">Prova #{challengeId}</p>
            <p className="text-amber-700 text-sm">{challengeTitle}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {uploadSuccess ? (
            <div className="text-center py-8">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-green-700 mb-2">Foto Salvata!</h4>
              <p className="text-green-600">La tua prova è stata salvata e sincronizzata. Sarà visibile su tutti i tuoi dispositivi.</p>
            </div>
          ) : (
            <>
              {previewUrl ? (
                <div className="mb-6">
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Foto della prova"
                      className="w-full h-48 object-cover rounded-lg border-2 border-amber-200"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-100 rounded-full p-1 border border-green-300">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={removePhoto}
                      disabled={isUploading}
                      className="flex-1 text-red-600 hover:text-red-800 text-sm transition-colors py-2 px-3 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center">
                          <Loader className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        'Rimuovi foto'
                      )}
                    </button>
                    <button
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      className="flex-1 text-amber-600 hover:text-amber-800 text-sm transition-colors py-2 px-3 border border-amber-200 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cambia foto
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                      ✅ Foto caricata e sincronizzata
                    </div>
                  </div>
                </div>
              ) : null}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, false)}
                className="hidden"
                disabled={isUploading}
              />

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileSelect(e, true)}
                className="hidden"
                disabled={isUploading}
              />

              <div className="space-y-3">
                {/* Pulsante centrale per scattare foto */}
                <button
                  onClick={triggerCameraInput}
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-4 rounded-lg transition-all font-medium flex items-center justify-center text-lg shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Camera className="h-6 w-6 mr-3" />
                  📸 Scatta Foto
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-lg transition-all font-medium flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    📁 Carica da Galleria
                  </button>
                  
                  <button
                    onClick={onClose}
                    disabled={isUploading}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 disabled:text-gray-500 py-3 px-4 rounded-lg transition-colors font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Annulla
                  </button>
                </div>

                {(selectedFile || previewUrl) && (
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-lg transition-all font-medium flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        Caricamento...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Salva Prova
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Debug info in development */}

        </div>
      </div>
    </div>
  );
}

export default PhotoUpload;