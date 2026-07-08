import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, TrendingDown, Phone, MapPin, FileText, Target, DollarSign, Clock } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useKPIStore } from '../../stores/modules/kpiStore';

const PERIODS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'annual', label: 'Annual' },
] as const;

const KPIPage = () => {
  const { metrics } = useKPIStore();
  const [period, setPeriod] = useState<string>('monthly');
  const [selectedPerson, setSelectedPerson] = useState<string>('all');

  const people = [...new Set(metrics.map(m => m.salespersonName))];
  const filtered = metrics.filter(m => m.period === period && (selectedPerson === 'all' || m.salespersonName === selectedPerson));

  const avgMetric = (key: keyof typeof filtered[0]) => {
    if (filtered.length === 0) return 0;
    const vals = filtered.map(m => typeof m[key] === 'number' ? m[key] as number : 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const sumMetric = (key: keyof typeof filtered[0]) => {
    return filtered.reduce((a, m) => a + (typeof m[key] === 'number' ? m[key] as number : 0), 0);
  };

  const fmt = (n: number) => '₱' + n.toLocaleString('en-PH');

  const kpiCards = [
    { label: 'Total Calls', value: sumMetric('calls'), icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Meetings', value: sumMetric('meetings'), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Site Surveys', value: sumMetric('siteSurveys'), icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Quotations', value: sumMetric('quotations'), icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Proposal Value', value: fmt(sumMetric('proposalValue')), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', isText: true },
    { label: 'Collection', value: fmt(sumMetric('collection')), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', isText: true },
    { label: 'Conversion Rate', value: `${avgMetric('conversionRate').toFixed(1)}%`, icon: Target, color: 'text-brand-blue', bg: 'bg-blue-50', isText: true },
    { label: 'Avg GP %', value: `${avgMetric('avgGrossProfit').toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', isText: true },
    { label: 'Discount %', value: `${avgMetric('discountPercent').toFixed(1)}%`, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50', isText: true },
    { label: 'Response Time', value: `${avgMetric('responseTimeHrs').toFixed(1)}h`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', isText: true },
    { label: 'Repeat Clients', value: sumMetric('repeatClients'), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Referral Clients', value: sumMetric('referralClients'), icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-title flex items-center gap-3"><BarChart3 className="text-brand-blue" size={28} /> KPI Monitor</h1>
            <p className="text-sm text-slate-400 -mt-4">Track performance metrics across all sales activities</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Person filter */}
            <select value={selectedPerson} onChange={e => setSelectedPerson(e.target.value)} className="input-field !w-auto !py-2">
              <option value="all">All Salespersons</option>
              {people.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-2">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${period === p.key ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card !p-5 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <card.icon size={16} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-navy-900">{card.isText ? card.value : card.value.toLocaleString()}</p>
              <p className="sub-title mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Per-person breakdown table */}
        {filtered.length > 0 && (
          <div className="glass-card overflow-x-auto">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wide mb-4">Detailed Breakdown</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Salesperson', 'Period', 'Calls', 'Meetings', 'Surveys', 'Quotes', 'Proposal ₱', 'Collection ₱', 'Conv. %', 'GP %'].map(h => (
                    <th key={h} className="sub-title pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 pr-4 text-xs font-bold text-navy-900">{m.salespersonName}</td>
                    <td className="py-3 pr-4 text-xs text-slate-500">{m.periodDate}</td>
                    <td className="py-3 pr-4 text-xs font-medium">{m.calls}</td>
                    <td className="py-3 pr-4 text-xs font-medium">{m.meetings}</td>
                    <td className="py-3 pr-4 text-xs font-medium">{m.siteSurveys}</td>
                    <td className="py-3 pr-4 text-xs font-medium">{m.quotations}</td>
                    <td className="py-3 pr-4 text-xs font-medium">{fmt(m.proposalValue)}</td>
                    <td className="py-3 pr-4 text-xs font-medium">{fmt(m.collection)}</td>
                    <td className="py-3 pr-4 text-xs font-medium">{m.conversionRate}%</td>
                    <td className="py-3 pr-4 text-xs font-medium">{m.avgGrossProfit}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default KPIPage;
