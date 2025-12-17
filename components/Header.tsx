import React from 'react';
import { Layers, Github } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">BOM Extractor</h1>
              <p className="text-xs text-slate-500 font-medium">POWERED BY GEMINI</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">
               <span className="text-sm font-medium">Documentation</span>
             </a>
          </div>
        </div>
      </div>
    </header>
  );
};