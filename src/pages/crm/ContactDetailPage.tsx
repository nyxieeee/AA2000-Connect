import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  Tag, 
  Activity,
  Plus,
  ChevronLeft,
  Bot,
  FileText,
  X,
  Clock,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCRMStore } from '../../stores/modules/crmStore';
import { usePipelinesStore } from '../../stores/modules/pipelinesStore';

interface ActivityEntry {
  id: string;
  type: 'email' | 'call' | 'note';
  title: string;
  description: string;
  timestamp: string;
}

const ContactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contacts, updateContact } = useCRMStore();
  const { deals, pipelines } = usePipelinesStore();
  const contact = contacts.find(c => c.id === id);

  const [activeTab, setActiveTab] = useState('Timeline');
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [activityForm, setActivityForm] = useState({ type: 'note' as 'email' | 'call' | 'note', title: '', description: '' });
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  const tabs = ['Timeline', 'Deals', 'Tasks', 'AI Drafts'];

  // Guard: contact not found
  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
          <MessageSquare size={32} />
        </div>
        <h2 className="text-xl font-bold text-navy-900">Contact Not Found</h2>
        <p className="text-sm text-slate-500">This contact may have been deleted.</p>
        <button onClick={() => navigate('/contacts')} className="premium-button text-xs">
          <ChevronLeft size={16} /> Back to Contacts
        </button>
      </div>
    );
  }

  // Get deals linked to this contact
  const contactDeals = deals.filter(d => d.contactId === contact.id || d.companyName === contact.name);

  const getStageName = (stageId: string): string => {
    for (const pipeline of pipelines) {
      const stage = pipeline.stages.find(s => s.id === stageId);
      if (stage) return stage.name;
    }
    return stageId;
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(val);

  const handleLogActivity = () => {
    if (!activityForm.title.trim()) return;
    const entry: ActivityEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type: activityForm.type,
      title: activityForm.title,
      description: activityForm.description,
      timestamp: new Date().toISOString(),
    };
    setActivities([entry, ...activities]);
    setIsLogActivityOpen(false);
    setActivityForm({ type: 'note', title: '', description: '' });
  };

  const handleAddTag = () => {
    if (!newTag.trim() || contact.tags.includes(newTag.trim())) return;
    updateContact(contact.id, { tags: [...contact.tags, newTag.trim()] });
    setNewTag('');
    setIsAddTagOpen(false);
  };

  const handleRemoveTag = (tag: string) => {
    updateContact(contact.id, { tags: contact.tags.filter(t => t !== tag) });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={14} className="text-brand-blue" />;
      case 'call': return <Phone size={14} className="text-emerald-500" />;
      default: return <FileText size={14} className="text-amber-500" />;
    }
  };

  const timeAgo = (ts: string) => {
    const diff = new Date().getTime() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {contact.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900">{contact.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight",
                  contact.status === 'Customer' ? 'bg-emerald-100 text-emerald-700' :
                  contact.status === 'Lead' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                )}>{contact.status}</span>
                <span className="text-xs text-slate-400 font-medium">Assigned to {contact.assigned}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${contact.phone}`} className="p-3 bg-white border border-surface-border rounded-xl text-slate-600 hover:text-brand-blue hover:border-brand-blue/30 transition-all">
              <Phone size={20} />
            </a>
            <a href={`mailto:${contact.email}`} className="p-3 bg-white border border-surface-border rounded-xl text-slate-600 hover:text-brand-blue hover:border-brand-blue/30 transition-all">
              <Mail size={20} />
            </a>
            <button 
              onClick={() => setIsLogActivityOpen(true)}
              className="premium-button flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Log Activity</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Info Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-bold text-navy-900">About Contact</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Email</p>
                  <p className="text-sm font-medium text-navy-900 truncate">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Phone</p>
                  <p className="text-sm font-medium text-navy-900 truncate">{contact.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag size={16} className="text-slate-400 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-100 border rounded text-[10px] font-bold text-slate-600 flex items-center gap-1 group">
                        {t}
                        <button onClick={() => handleRemoveTag(t)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {isAddTagOpen ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="text" value={newTag} onChange={e => setNewTag(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') setIsAddTagOpen(false); }}
                          className="w-20 px-2 py-0.5 text-[10px] border border-brand-blue/30 rounded outline-none focus:ring-1 focus:ring-brand-blue/20"
                          placeholder="Tag name"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button onClick={() => setIsAddTagOpen(true)} className="px-2 py-0.5 border border-dashed border-slate-300 rounded text-[10px] font-bold text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-colors">
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-brand-blue/5 border-brand-blue/20">
            <h3 className="font-bold text-brand-blue mb-4 flex items-center gap-2">
              <Activity size={18} />
              <span>Engagement Score</span>
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-brand-blue">{contact.score}</span>
              <span className="text-xs font-bold text-slate-400 pb-1 mb-1">/ 100 pts</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {contact.score >= 75 ? 'High engagement — ready for conversion.' :
               contact.score >= 40 ? 'Moderate engagement — consider a follow-up.' :
               'Low engagement — needs nurturing and outreach.'}
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-2 border-b border-surface-border">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-4 text-sm font-bold transition-all border-b-2",
                  activeTab === tab ? "border-brand-blue text-brand-blue" : "border-transparent text-slate-500 hover:text-navy-900"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="fade-in">
            {activeTab === 'Timeline' && (
              <div className="space-y-4">
                {activities.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100">
                    {activities.map(a => (
                      <div key={a.id} className="relative pl-12 flex gap-4 group">
                        <div className="absolute left-0 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center z-10 group-hover:border-brand-blue transition-all shadow-sm">
                          {getActivityIcon(a.type)}
                        </div>
                        <div className="flex-1 glass-card p-4 space-y-2 hover:shadow-md transition-all">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-navy-900">{a.title}</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{timeAgo(a.timestamp)}</span>
                          </div>
                          {a.description && <p className="text-sm text-slate-500 leading-relaxed">{a.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-12 text-center border-dashed">
                    <Clock size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-navy-900 mb-1">No Activities Yet</p>
                    <p className="text-xs text-slate-400 mb-4">Use "Log Activity" to record calls, emails, and notes for this contact.</p>
                    <button onClick={() => setIsLogActivityOpen(true)} className="text-xs font-bold text-brand-blue hover:underline">
                      + Log First Activity
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Deals' && (
              <div className="space-y-3">
                {contactDeals.length > 0 ? (
                  contactDeals.map(deal => (
                    <div key={deal.id} className="glass-card p-4 flex items-center justify-between hover:border-brand-blue/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/pipeline/${deal.id}`)}
                    >
                      <div>
                        <p className="text-sm font-bold text-navy-900">{deal.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{getStageName(deal.stageId)}</span>
                          {deal.product && <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{deal.product}</span>}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-navy-900">{formatCurrency(deal.value)}</p>
                    </div>
                  ))
                ) : (
                  <div className="glass-card p-12 text-center border-dashed">
                    <p className="text-sm font-bold text-navy-900 mb-1">No Linked Deals</p>
                    <p className="text-xs text-slate-400">Deals associated with this contact will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Tasks' && (
              <div className="glass-card p-12 text-center border-dashed">
                <p className="text-sm font-bold text-navy-900 mb-1">Task Management</p>
                <p className="text-xs text-slate-400">Task tracking for this contact will be available once connected to your project board.</p>
              </div>
            )}

            {activeTab === 'AI Drafts' && (
              <div className="space-y-6">
                <div className="glass-card p-8 bg-navy-900 text-white border-none flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center mb-6 shadow-xl animate-pulse">
                    <Bot size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">AI-Generated Follow-up Draft</h3>
                  <p className="text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
                    Based on {contact.name}'s engagement score of {contact.score} and status as "{contact.status}", here's a suggested follow-up approach.
                  </p>
                  <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
                    <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Email Content</p>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "Dear {contact.name},

I hope this message finds you well. I wanted to reach out regarding our recent discussion. We'd love to help you find the right solution for your needs.

Would you be available for a quick call this week to discuss next steps?

Best regards,
AA2000 Enterprise Team"
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <a 
                        href={`mailto:${contact.email}?subject=Follow-up from AA2000&body=Dear ${contact.name},%0D%0A%0D%0AI hope this message finds you well...`}
                        className="flex-1 py-3 bg-brand-blue hover:bg-brand-light rounded-xl font-bold transition-all shadow-lg shadow-brand-blue/20 text-center"
                      >
                        Approve & Send
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      {isLogActivityOpen && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-navy-900">Log Activity</h2>
              <button onClick={() => setIsLogActivityOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Activity Type</label>
                <div className="flex gap-2">
                  {(['note', 'email', 'call'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setActivityForm({ ...activityForm, type: t })}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all border',
                        activityForm.type === t 
                          ? 'bg-brand-blue text-white border-brand-blue' 
                          : 'bg-white text-slate-500 border-surface-border hover:border-brand-blue/30'
                      )}
                    >
                      {t === 'note' ? '📝 Note' : t === 'email' ? '📧 Email' : '📞 Call'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Title</label>
                <input 
                  type="text" value={activityForm.title}
                  onChange={e => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  placeholder="e.g. Follow-up call about CCTV proposal"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description (Optional)</label>
                <textarea 
                  value={activityForm.description}
                  onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all resize-none"
                  placeholder="Add details..."
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsLogActivityOpen(false)}
                className="flex-1 py-2.5 bg-white text-slate-600 border border-surface-border rounded-xl font-bold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogActivity}
                className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all"
              >
                Log Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetailPage;
