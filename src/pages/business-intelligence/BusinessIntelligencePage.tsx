import { motion } from 'framer-motion';
import { Brain, TrendingUp, DollarSign, Users, Target, BarChart3, Award, Globe, Zap, ArrowUpRight } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';

const BIMetrics = [
  { label: 'Revenue YTD', value: '₱28.5M', change: '+12.3%', positive: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Sales Pipeline', value: '₱42.1M', change: '+8.7%', positive: true, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active Clients', value: '247', change: '+15', positive: true, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Conversion Rate', value: '34.2%', change: '+2.1%', positive: true, icon: Target, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { label: 'Avg Deal Size', value: '₱385K', change: '-₱12K', positive: false, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Bid Win Rate', value: '58%', change: '+5%', positive: true, icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'AI Visibility Score', value: '72/100', change: '+8', positive: true, icon: Globe, color: 'text-pink-600', bg: 'bg-pink-50' },
  { label: 'Employee Productivity', value: '89%', change: '+3%', positive: true, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const INSIGHTS = [
  { title: 'Revenue Forecast', desc: 'Based on current pipeline and conversion rates, projected Q3 revenue is ₱15.2M — 18% above target.', type: 'positive' },
  { title: 'Lead Source Performance', desc: 'Facebook leads have 42% higher conversion rate than website leads. Recommend increasing FB ad budget by 20%.', type: 'recommendation' },
  { title: 'Service KPI Alert', desc: '3 overdue corrective maintenance tickets. Average resolution time has increased to 4.2 days from 2.8 days last month.', type: 'warning' },
  { title: 'Marketing ROI', desc: 'Email campaigns generated 2.3x ROI vs social media at 1.8x. Top-performing campaign: FDAS Compliance webinar series.', type: 'positive' },
  { title: 'Bidding Analysis', desc: 'Government bid win rate at 62% — above industry average. Focus on FDAS/fire safety contracts where win rate is highest at 78%.', type: 'positive' },
  { title: 'Competitor Movement', desc: 'FirePro Inc. has been mentioned in 3 new AI recommendation engines. Consider content strategy to maintain visibility.', type: 'warning' },
];

const BusinessIntelligencePage = () => {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="section-title flex items-center gap-3"><Brain className="text-brand-blue" size={28} /> Business Intelligence</h1>
          <p className="text-sm text-slate-400 -mt-4">Executive dashboard with forecasts, trends, and AI-powered insights</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BIMetrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card !p-5 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${m.bg}`}><m.icon size={16} className={m.color} /></div>
                <span className={`flex items-center gap-1 text-[10px] font-bold ${m.positive ? 'text-emerald-600' : 'text-rose-500'}`}>
                  <ArrowUpRight size={12} className={m.positive ? '' : 'rotate-90'} />{m.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-navy-900">{m.value}</p>
              <p className="sub-title mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Insights */}
        <div>
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wide mb-4 flex items-center gap-2"><Zap size={16} className="text-brand-blue" /> AI-Powered Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INSIGHTS.map((insight, i) => (
              <motion.div key={insight.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className={`glass-card !p-5 hover-lift border-l-4 ${insight.type === 'positive' ? 'border-l-emerald-400' : insight.type === 'warning' ? 'border-l-amber-400' : 'border-l-brand-blue'}`}>
                <h4 className="text-sm font-bold text-navy-900 mb-2">{insight.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{insight.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default BusinessIntelligencePage;
