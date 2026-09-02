export type ProductCategory = 
  | 'semua'
  | 'cetak_offset'
  | 'digital_printing'
  | 'sablon_dtf'
  | 'kemasan_packaging'
  | 'merchandise'
  | 'stiker_label'
  | 'banner_display'
  | 'jasa_desain';

export type ProductType = 'barang' | 'jasa';

export interface ProductFinishingOption {
  id: string;
  name: string;
  pricePerUnit: number;
}

export interface PaperMaterialOption {
  id: string;
  name: string;
  gramature: string;
  priceModifier: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  type: ProductType;
  basePrice: number;
  unit: string;
  minOrder: number;
  shortDesc: string;
  description: string;
  image: string;
  drivePreviewUrl?: string;
  tags: string[];
  materials?: PaperMaterialOption[];
  sizes?: string[];
  finishings?: ProductFinishingOption[];
  leadTimeDays: number;
  featured?: boolean;
  rating: number;
  reviewCount: number;
}

export interface CustomPrintSpecs {
  size?: string;
  material?: string;
  finishings?: string[];
  notes?: string;
  designFile?: {
    name: string;
    size: string;
    type: string; // 'pdf' | 'jpg' | 'png' | 'cdr' | 'ai'
    driveUrl: string;
    previewUrl?: string;
    uploadedAt: string;
  };
  hasOwnDesign: boolean; // true = upload file, false = butuh jasa desain TEFA
  customDimension?: {
    widthCm: number;
    heightCm: number;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  specs: CustomPrintSpecs;
  subtotal: number;
}

export type OrderType = 'online' | 'offline_pos';

export type PaymentMethod = 'qris' | 'cash' | 'transfer_bank';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export type ProductionStatus = 
  | 'menunggu_pembayaran'
  | 'antrian_desain'
  | 'pra_cetak' // CTP / Rip file
  | 'proses_cetak'
  | 'finishing' // Laminasi / Potong / Jilid
  | 'siap_ambil'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export interface CourierOption {
  id: string;
  name: string;
  service: string;
  estimatedDays: string;
  cost: number;
  logo: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "SRI-20250814-001"
  orderType: OrderType;
  createdAt: string;
  customer: CustomerInfo;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string;
  productionStatus: ProductionStatus;
  productionTimeline: {
    status: ProductionStatus;
    label: string;
    timestamp: string;
    note?: string;
  }[];
  courier?: {
    courierName: string;
    service: string;
    trackingNumber?: string;
  };
  isPickupInStore?: boolean;
  cashierName?: string;
  cashReceived?: number;
  cashChange?: number;
  googleDriveFolderUrl?: string;
  syncedToGoogleSheet?: boolean;
  spkNumber?: string; // Surat Perintah Kerja number
}

export interface User {
  id: string;
  username?: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'admin' | 'cashier';
  institution?: string; // SMKN 1 Kaligondang, Umum, Perusahaan, UMKM
  address?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface GoogleDriveDocument {
  id: string;
  name: string;
  fileType: 'image' | 'pdf' | 'vector';
  mimeType: string;
  sizeFormatted: string;
  orderNumber: string;
  productName: string;
  uploadedAt: string;
  driveViewUrl: string;
  driveDownloadUrl: string;
  thumbnailUrl: string;
  colorMode: 'CMYK' | 'RGB';
  dpi: number;
}
