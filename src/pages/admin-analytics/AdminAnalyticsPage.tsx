import { useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, Target, Activity, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_DATA: Record<string, any[]> = {
  'team-performance': [
    { name: 'Anna', leads: 45, deals: 12 }, { name: 'Ben', leads: 38, deals: 9 }, { name: 'Carla', leads: 52, deals: 15 }, { name: 'Dennis', leads: 29, deals: 7 },
  ],
  'lead-volume': [
    { name: 'Jan', leads: 120 }, { name: 'Feb', leads: 145 }, { name: 'Mar', leads: 98 }, { name: 'Apr', leads: 162 }, { name: 'May', leads: 188 }, { name: 'Jun', leads: 134 },
  ],
  'pipeline-health': [
    { name: 'New', deals: 24 }, { name: 'Qualified', deals: 18 }, { name: 'Proposal', deals: 12 }, { name: 'Negotiation', deals: 7 }, { name: 'Closed Won', deals: 9 }, { name: 'Closed Lost', deals: 5 },
  ],
  'app-usage': [
    { name: 'Mon', users: 22 }, { name: 'Tue', users: 26 }, { name: 'Wed', users: 24 }, { name: 'Thu', users: 28 }, { name: 'Fri', users: 20 }, { name: 'Sat', users: 8 }, { name: 'Sun', users: 3 },
  ],
};

const REPORTS = [
  { id: 'team-performance', name: 'Team Performance', type: 'team_performance', icon: Users, description: 'Conversion rates, lead volume, and activity by rep' },
  { id: 'lead-volume', name: 'Lead Volume', type: 'lead_volume', icon: TrendingUp, description: 'Lead sources, trends, and channel performance' },
  { id: 'pipeline-health', name: 'Pipeline Health', type: 'conversion_rate', icon: Target, description: 'Stage-by-stage conversion and deal velocity' },
  { id: 'app-usage', name: 'App Usage', type: 'app_usage', icon: Activity, description: 'Who\'s actively using the system and how' },
];

export default function AdminAnalyticsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Admin Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Reports on team performance, leads, and system usage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map(report => (
          <button key={report.id} onClick={() => setSelectedReport(report.id === selectedReport ? null : report.id)}
            className={cn('glass-card p-5 text-left transition-all', selectedReport === report.id ? 'border-brand-blue/40 ring-2 ring-brand-blue/10' : 'hover:border-brand-blue/20')}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                <report.icon size={18} className="text-brand-blue" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy-900">{report.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{report.description}</p>
              </div>
            </div>

            {selectedReport === report.id && (
              <div className="mt-4 pt-4 border-t border-surface-border space-y-3 animate-in">
                <div className="h-48 bg-white rounded-2xl border border-surface-border p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHART_DATA[report.id] || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey={report.id === 'team-performance' ? 'deals' : report.id === 'pipeline-health' ? 'deals' : report.id === 'app-usage' ? 'users' : 'leads'} fill="#6366f1" radius={[4, 4, 0, 0]} />
                      {report.id === 'team-performance' && <Bar dataKey="leads" fill="#a5b4fc" radius={[4, 4, 0, 0]} />}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-xs font-bold text-white bg-brand-blue rounded-xl hover:bg-brand-light transition-all flex items-center gap-1.5">
                    <FileText size={13} /> Generate PDF
                  </button>
                  <button className="px-4 py-2 text-xs font-semibold text-slate-600 border border-surface-border rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5">
                    <Download size={13} /> Export CSV
                  </button>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </AnimatedPage>
  );
}
