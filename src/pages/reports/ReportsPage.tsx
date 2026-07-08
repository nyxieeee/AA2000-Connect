import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Download, Calendar, Filter, BarChart3, TrendingUp, DollarSign, Users, Target, AlertTriangle, Megaphone, FileText } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useReportsStore } from '../../stores/modules/reportsStore';

const TYPE_ICONS: Record<string, typeof BarChart3> = {
  sales: BarChart3, gp: TrendingUp, collection: DollarSign, discount: AlertTriangle,
  incentive: DollarSign, kpi: Target, lead: Users, lost_sales: AlertTriangle, marketing: Megaphone,
};
const TYPE_COLORS: Record<string, string> = {
  sales: 'text-blue-600 bg-blue-50', gp: 'text-emerald-600 bg-emerald-50', collection: 'text-green-600 bg-green-50',
  discount: 'text-amber-600 bg-amber-50', incentive: 'text-purple-600 bg-purple-50', kpi: 'text-cyan-600 bg-cyan-50',
  lead: 'text-indigo-600 bg-indigo-50', lost_sales: 'text-rose-600 bg-rose-50', marketing: 'text-pink-600 bg-pink-50',
};

const ReportsPage = () => {
  const { definitions, generated, addGenerated } = useReportsStore();
  const [view, setView] = useState<'catalog' | 'history'>('catalog');

  const handleGenerate = (def: typeof definitions[0]) => {
    addGenerated({
      definitionId: def.id, title: def.name,
      dateRange: { from: '2026-06-01', to: '2026-06-30' },
      data: [
        { metric: 'Target Metric', value: Math.floor(Math.random() * 500000) },
        { metric: 'Actual Value achieved', value: Math.floor(Math.random() * 450000) },
        { metric: 'Variance / Threshold gap', value: Math.floor(Math.random() * 50000) }
      ],
      summary: `${def.name} generated for June 2026. This technical export compiles metrics, operational variance, and collection ratios for CRM sync.`,
    });
  };

  const downloadCSV = (rpt: any) => {
    let csvContent = `AA2000 Connect CRM - Generated Report\r\n`;
    csvContent += `Report Title: ${rpt.title}\r\n`;
    csvContent += `Period: ${rpt.dateRange.from} to ${rpt.dateRange.to}\r\n`;
    csvContent += `Generated At: ${new Date(rpt.generatedAt).toLocaleString()}\r\n`;
    csvContent += `Summary: ${rpt.summary}\r\n\r\n`;
    csvContent += `Metric,Value\r\n`;
    rpt.data.forEach((row: any) => {
      csvContent += `"${row.metric}","${row.value}"\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${rpt.title.toLowerCase().replace(/\s+/g, '_')}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTXT = (rpt: any) => {
    let content = `==================================================\n`;
    content += `         AA2000 CONNECT CRM - REPORT SUMMARY       \n`;
    content += `==================================================\n\n`;
    content += `Report: ${rpt.title}\n`;
    content += `Date Range: ${rpt.dateRange.from} to ${rpt.dateRange.to}\n`;
    content += `Generated: ${new Date(rpt.generatedAt).toLocaleString()}\n\n`;
    content += `SUMMARY:\n${rpt.summary}\n\n`;
    content += `METRICS:\n`;
    rpt.data.forEach((row: any) => {
      content += `- ${row.metric}: ${row.value.toLocaleString()}\n`;
    });
    content += `\n==================================================\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${rpt.title.toLowerCase().replace(/\s+/g, '_')}_report.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-3"><FileBarChart className="text-brand-blue" size={28} /> Reports</h1>
            <p className="text-sm text-slate-400 -mt-4">Generate and export comprehensive business reports</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('catalog')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'catalog' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}>Report Catalog</button>
            <button onClick={() => setView('history')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'history' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}>Generated ({generated.length})</button>
          </div>
        </div>

        {view === 'catalog' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {definitions.map((def, i) => {
              const Icon = TYPE_ICONS[def.type] || FileText;
              const colors = TYPE_COLORS[def.type] || 'text-slate-600 bg-slate-50';
              const [textColor, bgColor] = colors.split(' ');
              return (
                <motion.div key={def.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card hover-lift">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${bgColor}`}><Icon size={20} className={textColor} /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wide">{def.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{def.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${bgColor} ${textColor}`}>{def.type.replace('_', ' ')}</span>
                    <button onClick={() => handleGenerate(def)} className="premium-button !text-[9px] !px-3 !py-2 flex items-center gap-1.5"><Download size={12} /> Generate</button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {generated.length === 0 ? (
              <div className="text-center py-16 glass-card"><FileBarChart className="mx-auto text-slate-200 mb-4" size={48} /><p className="text-sm text-slate-400">No reports generated yet</p></div>
            ) : generated.map((rpt, i) => (
              <motion.div key={rpt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card !p-5 flex items-center justify-between hover-lift">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-50 rounded-xl"><FileBarChart size={16} className="text-brand-blue" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-navy-900">{rpt.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2"><Calendar size={10} /> {rpt.dateRange.from} to {rpt.dateRange.to} • Generated {new Date(rpt.generatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => downloadTXT(rpt)} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-slate-100 transition-all">PDF</button>
                  <button onClick={() => downloadCSV(rpt)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-all">Excel</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default ReportsPage;
