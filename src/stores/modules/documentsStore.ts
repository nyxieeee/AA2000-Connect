import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface DocumentItem {
  id: string;
  serviceRecordId?: string;
  fileName: string;
  storagePath: string;
  uploadedBy?: string;
  fileSize?: number;
  uploadedAt: string;
}

interface DocumentsStore {
  documents: DocumentItem[];
  fetchDocuments: (serviceRecordId?: string) => void;
  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Pick<DocumentItem, 'fileName' | 'fileSize'>>) => void;
  deleteDocument: (id: string) => void;
}

export const useDocumentsStore = create<DocumentsStore>((set, get) => ({
  documents: storage.get<DocumentItem[]>('module_documents') || [],
  fetchDocuments: (serviceRecordId) => { const documents = storage.get<DocumentItem[]>('module_documents') || []; set({ documents: serviceRecordId ? documents.filter(d => d.serviceRecordId === serviceRecordId) : documents }); },
  addDocument: (data) => {
    const newDoc: DocumentItem = { ...data, id: `doc-${Date.now()}`, uploadedAt: new Date().toISOString() };
    const updated = [...get().documents, newDoc];
    storage.set('module_documents', updated); set({ documents: updated });
  },
  updateDocument: (id, updates) => {
    const updated = get().documents.map(d => d.id === id ? { ...d, ...updates } : d);
    storage.set('module_documents', updated); set({ documents: updated });
  },
  deleteDocument: (id) => {
    const updated = get().documents.filter(d => d.id !== id);
    storage.set('module_documents', updated); set({ documents: updated });
  },
}));
