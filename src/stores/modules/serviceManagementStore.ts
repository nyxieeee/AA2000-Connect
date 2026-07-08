import { create } from 'zustand';
import { storage } from '../../services/storage';

export type TicketType = 'preventive' | 'corrective';
export type TicketStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface ServiceTicket {
  id: string;
  type: TicketType;
  clientName: string;
  clientId: string;
  systemType: 'FDAS' | 'CCTV' | 'Access Control' | 'Networking' | 'Structured Cabling' | 'Suppression';
  description: string;
  status: TicketStatus;
  scheduledDate: string;
  completedDate?: string;
  assignedTechnician: string;
  warrantyExpiry?: string;
  contractRef?: string;
  serviceReport?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

interface ServiceManagementStore {
  tickets: ServiceTicket[];
  fetchTickets: () => void;
  addTicket: (data: Omit<ServiceTicket, 'id' | 'createdAt'>) => void;
  updateTicket: (id: string, updates: Partial<ServiceTicket>) => void;
  deleteTicket: (id: string) => void;
}

const seedTickets: ServiceTicket[] = [
  { id: 'svc-1', type: 'preventive', clientName: 'SM Megamall', clientId: 'comp-1', systemType: 'FDAS', description: 'Quarterly FDAS inspection and testing', status: 'scheduled', scheduledDate: '2026-07-20', assignedTechnician: 'Tech. Ramirez', warrantyExpiry: '2027-06-15', contractRef: 'CT-2026-0045', priority: 'medium', createdAt: new Date(Date.now() - 604800000).toISOString() },
  { id: 'svc-2', type: 'corrective', clientName: 'Ayala Tower One', clientId: 'comp-2', systemType: 'CCTV', description: 'Camera #14 offline — NVR connection issue', status: 'in_progress', scheduledDate: '2026-07-10', assignedTechnician: 'Tech. Santos', priority: 'high', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'svc-3', type: 'preventive', clientName: 'BDO Corporate Center', clientId: 'comp-3', systemType: 'Access Control', description: 'Annual access control audit and firmware update', status: 'completed', scheduledDate: '2026-06-28', completedDate: '2026-06-28', assignedTechnician: 'Tech. Reyes', warrantyExpiry: '2028-01-10', priority: 'low', createdAt: new Date(Date.now() - 1209600000).toISOString() },
  { id: 'svc-4', type: 'corrective', clientName: 'Manila City Hall', clientId: 'comp-4', systemType: 'FDAS', description: 'False alarm trigger on Zone 3 — sensor recalibration needed', status: 'overdue', scheduledDate: '2026-07-05', assignedTechnician: 'Tech. Ramirez', contractRef: 'CT-2026-0089', priority: 'critical', createdAt: new Date(Date.now() - 864000000).toISOString() },
];

const stored = storage.get<ServiceTicket[]>('module_service_tickets');
if (!stored) storage.set('module_service_tickets', seedTickets);

export const useServiceManagementStore = create<ServiceManagementStore>((set, get) => ({
  tickets: stored || seedTickets,
  fetchTickets: () => { set({ tickets: storage.get<ServiceTicket[]>('module_service_tickets') || [] }); },
  addTicket: (data) => {
    const ticket: ServiceTicket = { ...data, id: `svc-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().tickets, ticket];
    storage.set('module_service_tickets', updated); set({ tickets: updated });
  },
  updateTicket: (id, updates) => {
    const updated = get().tickets.map(t => t.id === id ? { ...t, ...updates } : t);
    storage.set('module_service_tickets', updated); set({ tickets: updated });
  },
  deleteTicket: (id) => {
    const updated = get().tickets.filter(t => t.id !== id);
    storage.set('module_service_tickets', updated); set({ tickets: updated });
  },
}));
