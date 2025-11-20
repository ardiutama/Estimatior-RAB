import React, { useState } from 'react';
import { BuildingType, MaterialQuality, ProjectDetails } from '../types';
import { Plus } from 'lucide-react';

interface InputFormProps {
  onSubmit: (details: ProjectDetails) => void;
  isLoading: boolean;
}

const BALI_LOCATIONS = [
  "Badung",
  "Denpasar",
  "Gianyar",
  "Tabanan",
  "Buleleng",
  "Jembrana",
  "Bangli",
  "Klungkung",
  "Karangasem"
];

const NOTE_SUGGESTIONS = [
  "Pondasi Cakar Ayam",
  "Rangka Atap Baja Ringan",
  "Ada Kolam Renang",
  "Lantai Granit 60x60",
  "Kamar Mandi Dalam (Ensuite)",
  "Pagar Keliling",
  "Konsep Minimalis Modern",
  "Konsep Bali Tropis",
  "Banyak Bukaan Kaca",
  "Taman Landscape"
];

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ProjectDetails>({
    projectName: '',
    location: 'Denpasar',
    landArea: 100,
    buildingArea: 60,
    floors: 1,
    buildingType: BuildingType.RESIDENTIAL,
    customBuildingType: '',
    quality: MaterialQuality.STANDARD,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'landArea' || name === 'buildingArea' || name === 'floors') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSuggestion = (text: string) => {
    setFormData(prev => {
      const currentNotes = prev.notes.trim();
      const separator = currentNotes.length > 0 ? ', ' : '';
      return {
        ...prev,
        notes: `${currentNotes}${separator}${text}`
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-slate-800">
      <h2 className="text-xl font-semibold mb-6 text-slate-800 border-b border-slate-100 pb-4">
        Parameter Proyek
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Baris 1: Nama & Lokasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Nama Proyek</label>
            <input
              type="text"
              name="projectName"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 transition-colors"
              placeholder="Contoh: Villa Ubud View"
              value={formData.projectName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Lokasi (Kabupaten/Kota)</label>
            <select
              name="location"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 cursor-pointer"
              value={formData.location}
              onChange={handleChange}
            >
              {BALI_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              *Faktor lokasi: Badung/Denpasar (+10%), Gianyar/Tabanan (+5%), Lainnya (Standar)
            </p>
          </div>
        </div>

        {/* Baris 2: Dimensi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Luas Tanah (m²)</label>
            <input
              type="number"
              name="landArea"
              min="0"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
              value={formData.landArea || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Luas Bangunan (m²)</label>
            <input
              type="number"
              name="buildingArea"
              min="0"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
              value={formData.buildingArea || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Jumlah Lantai</label>
            <input
              type="number"
              name="floors"
              min="1"
              max="10"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
              value={formData.floors || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Baris 3: Tipe & Kualitas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Fungsi Bangunan</label>
            <div className="space-y-3">
              <select
                name="buildingType"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 cursor-pointer"
                value={formData.buildingType}
                onChange={handleChange}
              >
                {Object.values(BuildingType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              {formData.buildingType === BuildingType.OTHER && (
                <div className="animate-fade-in">
                  <input
                    type="text"
                    name="customBuildingType"
                    required
                    className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 text-sm placeholder-slate-400"
                    placeholder="Sebutkan fungsi bangunan Anda (misal: Kandang Ayam Close House, Garasi, Pura)..."
                    value={formData.customBuildingType}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Kelas Material</label>
            <select
              name="quality"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 cursor-pointer"
              value={formData.quality}
              onChange={handleChange}
            >
              {Object.values(MaterialQuality).map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <label className="block text-sm font-medium text-slate-700">Catatan Teknis (Opsional)</label>
            </div>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 placeholder:text-slate-400 text-sm"
              placeholder="Spesifikasi khusus akan membantu AI menghitung lebih akurat..."
              value={formData.notes}
              onChange={handleChange}
            />
            
            <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium">Klik untuk menambahkan saran:</p>
                <div className="flex flex-wrap gap-2">
                    {NOTE_SUGGESTIONS.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => addSuggestion(suggestion)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200 rounded-full text-xs text-slate-600 transition-all duration-200"
                        >
                            <Plus className="w-3 h-3" /> {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-sm transition-colors
              ${isLoading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isLoading ? 'Sedang Menghitung Estimasi...' : 'Hitung RAB Sekarang'}
          </button>
        </div>
      </form>
    </div>
  );
};