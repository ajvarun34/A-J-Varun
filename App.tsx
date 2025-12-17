import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { BOMResults } from './components/BOMResults';
import { AppState, ExtractionResult } from './types';
import { extractBOM } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { Loader2, FileImage, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setErrorMsg('');
    setExtractionResult(null);
    setAppState(AppState.ANALYZING);

    try {
      const base64 = await fileToBase64(file);
      const result = await extractBOM(base64, file.type);
      setExtractionResult(result);
      setAppState(AppState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Failed to extract data from image.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setSelectedFile(null);
    setExtractionResult(null);
    setErrorMsg('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:w-full">
        <div className="space-y-8 print:space-y-4">
          
          {/* Hero Section / Instructions */}
          {appState === AppState.IDLE && (
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Turn Drawings into Data
              </h2>
              <p className="text-lg text-slate-600">
                Upload a projection drawing, blueprint, or technical diagram. 
                Our AI will identify the Parts List and Title Block readings instantly.
              </p>
            </div>
          )}

          {/* Upload Section */}
          <div className={`${appState === AppState.IDLE ? 'bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8' : ''}`}>
            {appState === AppState.IDLE ? (
              <FileUpload onFileSelect={handleFileSelect} />
            ) : (
              <div className="flex flex-col md:flex-row print:flex-col gap-8 print:gap-4">
                {/* Left Column: Image Preview */}
                <div className="w-full md:w-1/3 print:w-full space-y-4 print:space-y-2">
                  {/* Image container - adjusted for print to avoid breaks */}
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-[3/4] group print:aspect-auto print:max-h-[50vh] break-inside-avoid">
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Drawing Preview" 
                        className="w-full h-full object-contain mix-blend-multiply print:object-contain print:h-auto print:max-h-full"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none print:hidden" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 no-print">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white rounded-md border border-slate-200 shadow-sm">
                        <FileImage className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {selectedFile?.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {(selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2))} MB
                        </span>
                      </div>
                    </div>
                    {appState !== AppState.ANALYZING && (
                       <button 
                       onClick={handleReset}
                       className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                       title="Upload new file"
                     >
                       <RefreshCw className="w-4 h-4" />
                     </button>
                    )}
                  </div>
                </div>

                {/* Right Column: Status & Results */}
                <div className="w-full md:w-2/3 print:w-full">
                  {appState === AppState.ANALYZING && (
                    <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-white p-4 rounded-full shadow-md border border-slate-100">
                          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900">Reading Blueprint...</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">
                          Extracting Title Block info, Parts List, and dimensions. This may take a moment.
                        </p>
                      </div>
                    </div>
                  )}

                  {appState === AppState.ERROR && (
                    <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                      <div className="bg-red-50 p-4 rounded-full">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900">Extraction Failed</h3>
                        <p className="text-red-500 max-w-md mx-auto">{errorMsg}</p>
                        <button 
                          onClick={handleReset}
                          className="mt-4 px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Try Another File
                        </button>
                      </div>
                    </div>
                  )}

                  {appState === AppState.SUCCESS && extractionResult && (
                    <BOMResults result={extractionResult} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}