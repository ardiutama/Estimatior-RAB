import React from 'react';
import { RABResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Download, RefreshCw } from 'lucide-react';

interface RABResultViewProps {
  result: RABResult;
  onReset: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export const RABResultView: React.FC<RABResultViewProps> = ({ result, onReset }) => {
  
  const chartData = result.categories.map((cat) => ({
    name: cat.categoryName,
    value: cat.subtotal,
  }));

  const constructionCost = result.categories.reduce((acc, cat) => acc + cat.subtotal, 0);
  const ppnAmount = result.grandTotal - constructionCost;

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hasil Estimasi RAB</h2>
          <p className="text-slate-500 text-sm">Mengacu pada SNI 2835:2023 & Harga Pasar Bali</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Hitung Ulang
        </button>
      </div>

      {/* Summary Cards - Simplifikasi ke tampilan bersih */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Biaya (Inc. PPN 11%)</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{formatCurrency(result.grandTotal)}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Estimasi Waktu</p>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800">{result.estimatedDuration}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Jumlah Kategori</p>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800">{result.categories.length} Tahapan</h3>
        </div>
      </div>

      {/* Narrative */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h4 className="font-semibold text-slate-800 mb-2">Ringkasan Teknis</h4>
        <p className="text-slate-600 text-sm leading-relaxed">
          {result.projectSummary}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-800 mb-4 text-center text-sm">Proporsi Biaya</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ color: '#1e293b', fontSize: '12px' }}
                  formatter={(value: number) => formatCurrency(value)} 
                />
                <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Details - Simplifikasi */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h4 className="font-semibold text-slate-800">Rincian Anggaran Biaya</h4>
            <button className="text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-50 flex items-center gap-1">
               <Download className="w-3 h-3" /> PDF
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-100 text-slate-600 font-semibold text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Uraian Pekerjaan</th>
                  <th className="px-3 py-3 text-center">Sat</th>
                  <th className="px-3 py-3 text-right">Vol</th>
                  <th className="px-4 py-3 text-right">Harga Satuan</th>
                  <th className="px-4 py-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.categories.map((category, catIndex) => (
                  <React.Fragment key={catIndex}>
                    <tr className="bg-slate-50">
                      <td colSpan={5} className="px-4 py-2 font-bold text-slate-700 text-xs uppercase">
                        {category.categoryName}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={`${catIndex}-${itemIndex}`} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-700 pl-6">{item.description}</td>
                        <td className="px-3 py-2 text-center text-slate-500 text-xs">{item.unit}</td>
                        <td className="px-3 py-2 text-right text-slate-600 font-mono text-xs">{item.volume}</td>
                        <td className="px-4 py-2 text-right text-slate-600 font-mono text-xs">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2 text-right font-medium text-slate-700 font-mono text-xs">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right text-slate-500 text-xs font-medium">Subtotal</td>
                      <td className="px-4 py-2 text-right text-slate-800 font-bold font-mono text-xs border-t border-slate-100">{formatCurrency(category.subtotal)}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
              
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-slate-600 font-medium">Biaya Fisik</td>
                  <td className="px-4 py-2 text-right text-slate-800 font-mono">{formatCurrency(constructionCost)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-slate-600 font-medium">PPN 11%</td>
                  <td className="px-4 py-2 text-right text-slate-800 font-mono">{formatCurrency(ppnAmount)}</td>
                </tr>
                <tr className="bg-slate-100">
                  <td colSpan={4} className="px-4 py-3 text-right font-bold text-slate-900">GRAND TOTAL</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono text-base">{formatCurrency(result.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
