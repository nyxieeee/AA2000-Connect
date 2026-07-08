import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'product' | 'consumable';
  subcategory: 'CCTV' | 'Access Control' | 'Networking' | 'Fire & Alarm' | 'Structured Cabling' | 'Power' | 'Other';
  brand: string;
  supplier?: string;
  specifications: Record<string, string>;
  datasheetUrl?: string;
  imageUrl?: string;
  compatibleWith: string[];
  tags: string[];
  price?: number;
  createdAt: string;
}

interface ProductCatalogStore {
  products: Product[];
  fetchProducts: () => void;
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const seedProducts: Product[] = [
  { id: 'prod-1', sku: 'HIK-DS2CD1043G2', name: 'Hikvision DS-2CD1043G2-I 4MP IP Camera', category: 'product', subcategory: 'CCTV', brand: 'Hikvision', specifications: { resolution: '4MP (2560×1440)', lens: '2.8mm', ir_range: '30m', protection: 'IP67', poe: 'Yes', compression: 'H.265+' }, compatibleWith: ['prod-2', 'prod-8'], tags: ['IP camera', 'outdoor', '4MP', 'ColorVu'], price: 4500, createdAt: new Date(Date.now() - 2592000000).toISOString() },
  { id: 'prod-2', sku: 'HIK-DS7608NI', name: 'Hikvision DS-7608NI-K2 8-Ch NVR', category: 'product', subcategory: 'CCTV', brand: 'Hikvision', specifications: { channels: '8', max_resolution: '8MP', hdd_bays: '2', bandwidth: '80Mbps', poe_ports: '8' }, compatibleWith: ['prod-1'], tags: ['NVR', '8-channel', 'PoE'], price: 18000, createdAt: new Date(Date.now() - 2592000000).toISOString() },
  { id: 'prod-3', sku: 'RUI-ES226GC', name: 'Ruijie RG-ES226GC-P 24-Port PoE Switch', category: 'product', subcategory: 'Networking', brand: 'Ruijie', specifications: { ports: '24 GE + 2 SFP', poe_budget: '370W', management: 'Cloud Managed', layer: 'L2+' }, compatibleWith: ['prod-1', 'prod-8'], tags: ['switch', 'PoE', 'managed', 'enterprise'], price: 15000, createdAt: new Date(Date.now() - 1728000000).toISOString() },
  { id: 'prod-4', sku: 'EDW-EST3', name: 'Edwards EST3 Fire Alarm Control Panel', category: 'product', subcategory: 'Fire & Alarm', brand: 'Edwards', specifications: { type: 'Addressable', max_devices: '2500', loops: '64', listing: 'UL/FM', protocol: 'Enhanced' }, compatibleWith: ['prod-5'], tags: ['FACP', 'addressable', 'fire alarm', 'EST3'], price: 85000, createdAt: new Date(Date.now() - 3456000000).toISOString() },
  { id: 'prod-5', sku: 'EDW-SIGA-PS', name: 'Edwards SIGA-PS Photoelectric Smoke Detector', category: 'product', subcategory: 'Fire & Alarm', brand: 'Edwards', specifications: { type: 'Photoelectric', protocol: 'Signature Series', listing: 'UL', compatibility: 'EST3/EST4' }, compatibleWith: ['prod-4'], tags: ['smoke detector', 'addressable', 'SIGA'], price: 3200, createdAt: new Date(Date.now() - 3456000000).toISOString() },
  { id: 'prod-6', sku: 'AJX-HUB2PLUS', name: 'Ajax Hub 2 Plus Security Panel', category: 'product', subcategory: 'Access Control', brand: 'Ajax', specifications: { protocol: 'Jeweller + Wings', range: '2000m', max_devices: '200', connectivity: 'Ethernet, Wi-Fi, 4G', battery_backup: '15 hours' }, compatibleWith: [], tags: ['security', 'wireless', 'smart home', 'Ajax'], price: 22000, createdAt: new Date(Date.now() - 864000000).toISOString() },
  { id: 'prod-7', sku: 'CAB-CAT6A-BL-305', name: 'Cat6A UTP Cable — 305m Box (Blue)', category: 'consumable', subcategory: 'Structured Cabling', brand: 'Generic', specifications: { type: 'Cat6A', shielding: 'UTP', length: '305m', color: 'Blue', conductor: '23AWG Solid Copper' }, compatibleWith: ['prod-8'], tags: ['cable', 'Cat6A', 'ethernet', 'bulk'], price: 6500, createdAt: new Date(Date.now() - 1296000000).toISOString() },
  { id: 'prod-8', sku: 'CON-RJ45-CAT6-100', name: 'RJ45 Cat6 Connectors (100pcs)', category: 'consumable', subcategory: 'Structured Cabling', brand: 'Generic', specifications: { type: 'RJ45', category: 'Cat6/Cat6A', quantity: '100', material: 'Gold-plated contacts' }, compatibleWith: ['prod-7'], tags: ['connector', 'RJ45', 'Cat6'], price: 450, createdAt: new Date(Date.now() - 1296000000).toISOString() },
  { id: 'prod-9', sku: 'UPS-APC-1500VA', name: 'APC Back-UPS 1500VA', category: 'product', subcategory: 'Power', brand: 'APC', specifications: { va_rating: '1500VA / 900W', battery_type: 'Lead-acid', runtime_half: '11 min', outlets: '6', avr: 'Yes' }, compatibleWith: [], tags: ['UPS', 'backup power', 'APC'], price: 8500, createdAt: new Date(Date.now() - 604800000).toISOString() },
  { id: 'prod-10', sku: 'DAH-IPC-HFW2439S', name: 'Dahua DH-IPC-HFW2439S-SA-LED 4MP Full-Color', category: 'product', subcategory: 'CCTV', brand: 'Dahua', specifications: { resolution: '4MP', lens: '3.6mm', led_range: '30m', protection: 'IP67', poe: 'Yes', type: 'Full-Color (LED)' }, compatibleWith: [], tags: ['IP camera', 'full-color', 'Dahua', '4MP'], price: 5200, createdAt: new Date(Date.now() - 432000000).toISOString() },
];

const stored = storage.get<Product[]>('module_product_catalog');
if (!stored) storage.set('module_product_catalog', seedProducts);

export const useProductCatalogStore = create<ProductCatalogStore>((set, get) => ({
  products: stored || seedProducts,
  fetchProducts: () => { set({ products: storage.get<Product[]>('module_product_catalog') || [] }); },
  addProduct: (data) => {
    const p: Product = { ...data, id: `prod-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().products, p];
    storage.set('module_product_catalog', updated); set({ products: updated });
  },
  updateProduct: (id, updates) => {
    const updated = get().products.map(p => p.id === id ? { ...p, ...updates } : p);
    storage.set('module_product_catalog', updated); set({ products: updated });
  },
  deleteProduct: (id) => {
    const updated = get().products.filter(p => p.id !== id);
    storage.set('module_product_catalog', updated); set({ products: updated });
  },
}));
