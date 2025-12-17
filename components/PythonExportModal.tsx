import React from 'react';
import { X, Copy, CheckCircle, Terminal } from 'lucide-react';
import { getPythonScript } from '../utils/pythonTemplate';

interface PythonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonExportModal: React.FC<PythonExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const code = getPythonScript();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-100 text-yellow-700 rounded-md">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Python Integration</h3>
              <p className="text-xs text-slate-500">Automate this extraction using the Gemini Python SDK</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Block */}
        <div className="flex-1 overflow-auto bg-[#1e1e1e] p-6">
          <pre className="font-mono text-sm text-slate-300 whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Requires <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">google-genai</code> package.
          </p>
          <div className="flex gap-3">
             <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard' : 'Copy Script'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
