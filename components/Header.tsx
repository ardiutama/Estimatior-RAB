import React from 'react';
import { Calculator, Hammer } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Hammer className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AutoRAB AI</h1>
            <p className="text-xs text-slate-400">Estimator Biaya Konstruksi Cerdas</p>
          </div>
        </div>
        <div className="hidden md:flex items-center text-sm text-slate-300 space-x-6">
          <span className="flex items-center gap-1"><Calculator className="w-4 h-4" /> Powered by Google Labs - Ideas by Indovma</span>
        </div>
      </div>
    </header>
  );
};