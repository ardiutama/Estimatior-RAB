import React, { useState, useCallback, useMemo } from 'react';
import { RABResult } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LabelList
} from 'recharts';
import { Download, RefreshCw, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const formatCompactCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    notation: "compact",
    compactDisplay: "short",
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 1,
  }).format(amount);
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#8B5CF6', '#0EA5E9', '#D946EF'];

const getRomanValue = (str: string): number => {
  const match = str.match(/^([XIV]+)\./); 
  if (!match) return 999;
  
  const roman = match[1];
  const map: Record<string, number> = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
    'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
    'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15
  };
  
  return map[roman] || 999;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
        <p className="text-xs font-bold text-slate-700 mb-1">{label}</p>
        <p className="text-sm font-mono text-blue-600 font-semibold">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const RABResultView: React.FC<RABResultViewProps> = ({ result, onReset }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const sortedCategories = useMemo(() => {
    return [...result.categories].sort((a, b) => {
      return getRomanValue(a.categoryName) - getRomanValue(b.categoryName);
    });
  }, [result.categories]);

  const constructionCost = sortedCategories.reduce((acc, curr) => acc + curr.subtotal, 0);
  const ppnAmount = result.grandTotal - constructionCost;
  
  const chartData = sortedCategories.map(cat => ({
    name: cat.categoryName,
    shortName: cat.categoryName.length > 25 ? cat.categoryName.substring(0, 25) + '...' : cat.categoryName,
    fullName: cat.categoryName,
    value: cat.subtotal
  }));

  const dynamicHeight = Math.max(500, chartData.length * 60);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text("RENCANA ANGGARAN BIAYA (RAB)", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Estimasi Proyek Konstruksi • Dibuat: ${today}`, pageWidth / 2, 26, { align: "center" });

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 35, pageWidth - 28, 25, 3, 3, "FD");

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text("Estimasi Waktu:", 20, 45);
      doc.text("Total Biaya (Est):", pageWidth - 80, 45);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(result.estimatedDuration, 20, 52);
      doc.text(formatCurrency(result.grandTotal), pageWidth - 80, 52);

      const tableBody: any[] = [];

      sortedCategories.forEach((cat) => {
        tableBody.push([
          { 
            content: cat.categoryName, 
            colSpan: 5, 
            styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [51, 65, 85] } 
          }
        ]);

        cat.items.forEach((item) => {
          tableBody.push([
            item.description,
            { content: item.unit, styles: { halign: 'center' } },
            { content: item.volume.toString(), styles: { halign: 'right' } },
            { content: formatCurrency(item.unitPrice), styles: { halign: 'right' } },
            { content: formatCurrency(item.totalPrice), styles: { halign: 'right' } },
          ]);
        });

        tableBody.push([
          { content: 'Subtotal', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: formatCurrency(cat.subtotal), styles: { halign: 'right', fontStyle: 'bold' } },
        ]);
      });

      tableBody.push(
        [
          { content: 'Biaya Konstruksi Fisik', colSpan: 4, styles: { halign: 'right' } },
          { content: formatCurrency(constructionCost), styles: { halign: 'right' } }
        ],
        [
          { content: 'PPN 11%', colSpan: 4, styles: { halign: 'right' } },
          { content: formatCurrency(ppnAmount), styles: { halign: 'right' } }
        ],
        [
          { content: 'GRAND TOTAL ESTIMASI', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [15, 23, 42], fontSize: 11 } },
          { content: formatCurrency(result.grandTotal), styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [15, 23, 42], fontSize: 11 } }
        ]
      );

      autoTable(doc, {
        startY: 70,
        head: [['Uraian Pekerjaan', 'Sat', 'Vol', 'Harga Satuan', 'Jumlah Harga']],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 15 },
          2: { cellWidth: 20 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
        },
        margin: { top: 70 },
        didDrawPage: (data) => {
           const pageHeight = doc.internal.pageSize.height;
           doc.setFontSize(8);
           doc.setTextColor(148, 163, 184);
           doc.setFont("helvetica", "italic");
           doc.text("*Dokumen ini adalah estimasi awal (Owner Estimate) berbasis AI dan acuan SNI/AHSP. Tidak mengikat secara hukum.", 14, pageHeight - 10);
        }
      });

      doc.save(`RAB_Estimasi_${new Date().getTime()}.pdf`);

    } catch (error) {
      console.error("Error generating PDF", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

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

      {/* Table Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h4 className="font-semibold text-slate-800">Rincian Anggaran Biaya</h4>
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="text-xs bg-blue-50 border border-blue-200 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
             {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
             {isDownloading ? 'Memproses...' : 'Download PDF'}
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
              {sortedCategories.map((category, catIndex) => (
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

      {/* HORIZONTAL BAR CHART */}
      <div 
        className="bg-white p-6 pt-8 rounded-xl border border-slate-200 shadow-sm flex flex-col" 
        style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }} 
      >
        <div className="mb-4 text-center">
          <h4 className="font-bold text-slate-800">Proporsi Biaya Pekerjaan</h4>
          <p className="text-xs text-slate-400 mt-1">Diagram batang perbandingan biaya per kategori</p>
        </div>
        
        <div style={{ width: '100%', height: dynamicHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="shortName" 
                type="category" 
                width={120} 
                tick={{ fontSize: 11, fill: '#475569' }}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              
              <Bar dataKey="value" barSize={28} radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  formatter={formatCompactCurrency}
                  style={{ fontSize: '11px', fill: '#64748b', fontWeight: 500 }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};