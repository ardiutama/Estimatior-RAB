import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { RABResultView } from './components/RABResult';
import { ProjectDetails, RABResult } from './types';
import { generateRABEstimate } from './services/geminiService';
import { AlertCircle, Info } from 'lucide-react';

function App() {
  const [result, setResult] = useState<RABResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (details: ProjectDetails) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateRABEstimate(details);
      setResult(data);
    } catch (err) {
      setError("Gagal menghasilkan estimasi RAB. Pastikan API Key valid atau coba lagi nanti.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero Section (Only show when no result) */}
        {!result && !isLoading && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              Estimator RAB Bangunan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Acuan SNI & AHSP menggunakan SNI 2835:2023-AHSP PUPR dan disesuaikan dengan lokasi di Bali
            </p>
          </div>
        )}

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">Terjadi Kesalahan</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Main Content Switch */}
        {result ? (
          <RABResultView result={result} onReset={handleReset} />
        ) : (
          <div className="max-w-3xl mx-auto">
            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
        )}

        {/* Professional Disclaimer */}
        <div className="mt-16 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-600 space-y-2">
                    <h4 className="font-bold text-slate-800">Batasan Pertanggungjawaban (Disclaimer)</h4>
                    <p>
                        Aplikasi ini adalah alat bantu <strong>Estimasi Awal (Owner's Estimate)</strong> yang menggunakan standar SNI 2835:2023 dan AHSP. 
                        Hasil perhitungan <strong>TIDAK</strong> bersifat mengikat secara hukum dan tidak dapat menggantikan peran konsultan Quantity Surveyor (QS) atau Kontraktor profesional.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500">
                        <li>Volume pekerjaan dihitung berdasarkan rasio luas (taksiran), bukan berdasarkan pengukuran gambar kerja (DED) yang presisi.</li>
                        <li>Harga satuan mengikuti rata-rata pasar Bali, namun harga riil toko dapat berubah sewaktu-waktu (fluktuasi).</li>
                        <li>Kondisi tanah diasumsikan normal (tanah datar & keras). Biaya tambahan mungkin timbul untuk lahan miring, rawa, atau akses sulit.</li>
                    </ul>
                    <p className="text-xs text-slate-400 mt-2">
                        *Disarankan menggunakan hasil ini sebagai acuan negosiasi atau perencanaan budget, bukan sebagai nilai kontrak final.
                    </p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;