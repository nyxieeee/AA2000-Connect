import { useState } from 'react';
import { Upload, FileText, Trash2, Download, Search, ExternalLink } from 'lucide-react';
import { useDocumentsStore } from '../../stores/modules/documentsStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument } = useDocumentsStore();
  const [search, setSearch] = useState('');

  const filtered = documents.filter(d => d.fileName.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = () => {
    const name = window.prompt('Enter file name:');
    if (name && name.trim()) {
      addDocument({
        fileName: name.trim(),
        storagePath: `/storage/${Date.now()}_${name.trim()}`,
        uploadedBy: 'current-user',
        fileSize: Math.floor(Math.random() * 5000) + 50,
      });
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} KB`;
    return `${(bytes / 1024).toFixed(1)} MB`;
  };

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Documents</h1>
          <p className="text-xs text-slate-500 mt-0.5">Upload and manage files attached to leads, deals, and projects</p>
        </div>
        <button onClick={handleUpload} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
          <Upload size={16} /> Upload File
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="w-full pl-9 pr-3 py-2 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
          <p className="text-sm text-slate-500">No documents yet</p>
          <button onClick={handleUpload} className="mt-3 px-4 py-2 text-xs font-bold text-brand-blue border border-brand-blue/30 rounded-xl hover:bg-brand-blue/5 transition-all">Upload your first file</button>
        </div>
      ) : (
        <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <AnimatedListItem key={doc.id}>
            <div className="glass-card p-4 group hover:border-brand-blue/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy-900 truncate group-hover:text-brand-blue transition-colors">{doc.fileName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{formatSize(doc.fileSize)}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{doc.uploadedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-surface-border opacity-0 group-hover:opacity-100 transition-all">
                <button className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-all"><Download size={14} /></button>
                <button className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-all"><ExternalLink size={14} /></button>
                <button onClick={() => deleteDocument(doc.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all ml-auto"><Trash2 size={14} /></button>
              </div>
            </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      )}
    </AnimatedPage>
  );
}
