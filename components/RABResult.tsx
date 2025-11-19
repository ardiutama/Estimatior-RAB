import React, { useState, useCallback } from 'react';
import { RABResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Legend } from 'recharts';
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

// Komponen Custom untuk Render Bagian Tengah & Efek Hover
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      {/* Teks Tengah Dinamis */}
      <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill="#64748b" className="text-[10px] font-medium uppercase tracking-wider">
        {payload.name.length > 25 ? `${payload.name.substring(0, 25)}...` : payload.name}
      </text>
      <text x={cx} y={cy + 5} dy={8} textAnchor="middle" fill="#1e293b" className="text-2xl font-bold">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="#334155" className="text-xs font-mono font-semibold">
        {formatCurrency(value)}
      </text>

      {/* Highlight Sektor Utama */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Efek Membesar
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-md filter"
      />
      {/* Ring Dalam Dekoratif */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 8}
        outerRadius={innerRadius - 4}
        fill={fill}
        fillOpacity={0.6}
      />
    </g>
  );
};

export const RABResultView: React.FC<RABResultViewProps> = ({ result, onReset }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Biaya (Inc. PPN 11%)</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{formatCurrency(result.grandTotal)}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium mb-1">Estimasi Waktu</p>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800">{result.estimatedDuration}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
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

      {/* Table Details - POSISI DI ATAS (Full Width) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h4 className="font-semibold text-slate-800">Rincian Anggaran Biaya</h4>
          <button className="text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-50 flex items-center gap-1 transition-colors">
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
                    <tr key={`${catIndex}-${itemIndex}`} className="hover:bg-slate-50 transition-colors">
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

      {/* Chart Section - INTERAKTIF & DI BAWAH */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="mb-2 text-center">
          <h4 className="font-bold text-slate-800">Proporsi Biaya Pekerjaan</h4>
          <p className="text-xs text-slate-400 mt-1">Arahkan kursor ke grafik atau legenda untuk melihat detail</p>
        </div>
        
        <div className="w-full h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="40%"
                innerRadius={85}
                outerRadius={115}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={onPieEnter}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              
              <Legend 
                onMouseEnter={(_, index) => setActiveIndex(index)} 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ 
                  fontSize: '11px', 
                  paddingTop: '24px', 
                  borderTop: '1px solid #f1f5f9',
                  marginTop: '20px'
                }} 
                iconSize={12}
                iconType="circle"
                formatter={(value) => <span className="text-slate-600 font-medium ml-1 cursor-pointer hover:text-slate-900">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};