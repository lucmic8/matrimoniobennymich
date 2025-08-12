import React, { useRef, useState } from 'react';
import { Upload, Camera, Check, X } from 'lucide-react';

interface PhotoUploadProps {
  challengeId: number;
  challengeTitle: string;
  onClose: () => void;
}

function PhotoUpload({ challengeId, challengeTitle, onClose }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    // Simula il caricamento (qui dovresti implementare il vero caricamento)
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      
      // Chiudi il modal dopo 2 secondi
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 2000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-amber-200 shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-amber-900">Carica la Prova</h3>
            <button
              onClick={onClose}
              className="text-amber-600 hover:text-amber-800 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-amber-800 font-medium mb-2">Prova #{challengeId}</p>
            <p className="text-amber-700 text-sm">{challengeTitle}</p>
          </div>

          {uploadSuccess ? (
            <div className="text-center py-8">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-green-700 mb-2">Foto Caricata!</h4>
              <p className="text-green-600">La tua prova è stata salvata con successo.</p>
            </div>
          ) : (
            <>
              {previewUrl ? (
                <div className="mb-6">
                  <img
                    src={previewUrl}
                    alt="Anteprima"
                    className="w-full h-48 object-cover rounded-lg border-2 border-amber-200"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="mt-2 text-amber-600 hover:text-amber-800 text-sm transition-colors"
                  >
                    Cambia foto
                  </button>
                </div>
              ) : (
                <div
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors mb-6"
                >
                  <Camera className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                  <p className="text-amber-800 font-medium mb-2">Scatta o scegli una foto</p>
                  <p className="text-amber-600 text-sm">Tocca per aprire la fotocamera o la galleria</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  Annulla
                </button>
                <button
                  onClick={selectedFile ? handleUpload : triggerFileInput}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-lg transition-all font-medium flex items-center justify-center"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : selectedFile ? (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Carica
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Scegli Foto
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhotoUpload;