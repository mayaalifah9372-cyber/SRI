import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, ProductionStatus, GoogleDriveDocument, OrderType, PaymentMethod, CustomerInfo, CartItem } from '../types';
import { INITIAL_ORDERS, INITIAL_DRIVE_DOCUMENTS } from '../data/initialData';

interface OrderContextType {
  orders: Order[];
  driveDocuments: GoogleDriveDocument[];
  createOrder: (orderData: {
    orderType: OrderType;
    customer: CustomerInfo;
    userId?: string;
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    discount?: number;
    paymentMethod: PaymentMethod;
    cashReceived?: number;
    courier?: { courierName: string; service: string };
    isPickupInStore?: boolean;
    cashierName?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: ProductionStatus, note?: string) => void;
  updatePaymentStatus: (orderId: string, status: 'paid' | 'pending' | 'refunded') => void;
  updateCourierTracking: (orderId: string, trackingNumber: string) => void;
  syncToGoogleSheet: () => Promise<{ success: boolean; rowsSynced: number; timestamp: string }>;
  isSyncingSheet: boolean;
  lastSheetSyncTime: string;
  sheetConfig: {
    sheetId: string;
    sheetUrl: string;
    appsScriptWebhookUrl: string;
    autoSync: boolean;
  };
  updateSheetConfig: (config: Partial<{ sheetId: string; sheetUrl: string; appsScriptWebhookUrl: string; autoSync: boolean }>) => void;
  addDriveDocument: (doc: Omit<GoogleDriveDocument, 'id'>) => void;
  deleteOrder: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sri_tefa_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  const [driveDocuments, setDriveDocuments] = useState<GoogleDriveDocument[]>(() => {
    const saved = localStorage.getItem('sri_tefa_drive_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DRIVE_DOCUMENTS;
      }
    }
    return INITIAL_DRIVE_DOCUMENTS;
  });

  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [lastSheetSyncTime, setLastSheetSyncTime] = useState<string>('14 Agu 2026, 14:15 WIB');
  
  const [sheetConfig, setSheetConfig] = useState({
    sheetId: '1TEFA_Grafika_SMKN1Kaligondang_SRI_Database_2026',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1TEFA_Grafika_SMKN1Kaligondang_SRI_Database_2026/edit?usp=sharing',
    appsScriptWebhookUrl: 'https://script.google.com/macros/s/AKfycbz_SRI_TEFA_Grafika_SyncWebhook/exec',
    autoSync: true,
  });

  useEffect(() => {
    localStorage.setItem('sri_tefa_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sri_tefa_drive_docs', JSON.stringify(driveDocuments));
  }, [driveDocuments]);

  const updateSheetConfig = (newCfg: Partial<typeof sheetConfig>) => {
    setSheetConfig(prev => ({ ...prev, ...newCfg }));
  };

  const createOrder = (orderData: {
    orderType: OrderType;
    customer: CustomerInfo;
    userId?: string;
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    discount?: number;
    paymentMethod: PaymentMethod;
    cashReceived?: number;
    courier?: { courierName: string; service: string };
    isPickupInStore?: boolean;
    cashierName?: string;
  }): Order => {
    const orderIndex = orders.length + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `SRI-${dateStr}-${String(orderIndex).padStart(3, '0')}`;
    const spkNumber = `SPK/TEFA-GRF/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(orderIndex + 40).padStart(3, '0')}`;
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

    const totalAmount = orderData.subtotal + orderData.shippingCost - (orderData.discount || 0);
    const cashChange = orderData.cashReceived ? Math.max(0, orderData.cashReceived - totalAmount) : undefined;
    const initialStatus: ProductionStatus = orderData.paymentMethod === 'cash' || orderData.orderType === 'offline_pos' 
      ? 'antrian_desain' 
      : 'menunggu_pembayaran';

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      orderType: orderData.orderType,
      createdAt: nowStr,
      customer: orderData.customer,
      userId: orderData.userId,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      discount: orderData.discount || 0,
      totalAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: (orderData.paymentMethod === 'cash' && orderData.orderType === 'offline_pos') ? 'paid' : 'pending',
      productionStatus: initialStatus,
      productionTimeline: [
        {
          status: 'menunggu_pembayaran',
          label: orderData.orderType === 'offline_pos' ? 'Transaksi Kasir POS TEFA' : 'Pesanan Online Dibuat',
          timestamp: nowStr,
        },
      ],
      courier: orderData.courier ? {
        courierName: orderData.courier.courierName,
        service: orderData.courier.service,
        trackingNumber: orderData.orderType === 'online' ? `TRK${Date.now().toString().slice(-8)}` : undefined,
      } : undefined,
      isPickupInStore: orderData.isPickupInStore ?? (orderData.orderType === 'offline_pos'),
      cashierName: orderData.cashierName,
      cashReceived: orderData.cashReceived,
      cashChange,
      googleDriveFolderUrl: `https://drive.google.com/drive/folders/${orderNumber}?usp=sharing`,
      syncedToGoogleSheet: true,
      spkNumber,
    };

    // Also register uploaded documents in Google Drive manager
    orderData.items.forEach(item => {
      if (item.specs.designFile) {
        const isPdf = item.specs.designFile.name.toLowerCase().endsWith('.pdf');
        const newDoc: GoogleDriveDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: item.specs.designFile.name,
          fileType: isPdf ? 'pdf' : 'image',
          mimeType: isPdf ? 'application/pdf' : 'image/png',
          sizeFormatted: item.specs.designFile.size || '3.5 MB',
          orderNumber,
          productName: item.product.name,
          uploadedAt: nowStr,
          driveViewUrl: item.specs.designFile.driveUrl || `https://drive.google.com/file/d/${orderNumber}/preview`,
          driveDownloadUrl: `https://drive.google.com/uc?export=download&id=${orderNumber}`,
          thumbnailUrl: item.specs.designFile.previewUrl || item.product.image,
          colorMode: 'CMYK',
          dpi: 300,
        };
        setDriveDocuments(prev => [newDoc, ...prev]);
      }
    });

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: ProductionStatus, note?: string) => {
    const statusLabels: Record<ProductionStatus, string> = {
      menunggu_pembayaran: 'Menunggu Pembayaran',
      antrian_desain: 'Verifikasi File & Antrian Desain',
      pra_cetak: 'Pra-Cetak (RIP, CTP & Plat Offset)',
      proses_cetak: 'Proses Cetak di Workshop TEFA',
      finishing: 'Proses Finishing (Laminasi/Pond/Jilid)',
      siap_ambil: 'Produk Siap Diambil di Workshop',
      dikirim: 'Paket Diserahkan ke Ekspedisi',
      selesai: 'Pesanan Selesai Diterima',
      dibatalkan: 'Pesanan Dibatalkan',
    };

    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const newTimeline = [
            ...ord.productionTimeline,
            {
              status,
              label: statusLabels[status],
              timestamp: nowStr,
              note,
            },
          ];
          return {
            ...ord,
            productionStatus: status,
            productionTimeline: newTimeline,
          };
        }
        return ord;
      })
    );
  };

  const updatePaymentStatus = (orderId: string, status: 'paid' | 'pending' | 'refunded') => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updated = { ...ord, paymentStatus: status };
          if (status === 'paid' && ord.productionStatus === 'menunggu_pembayaran') {
            updated.productionStatus = 'antrian_desain';
            updated.productionTimeline = [
              ...ord.productionTimeline,
              {
                status: 'antrian_desain',
                label: 'Pembayaran Dikonfirmasi & File Masuk Antrian',
                timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
              },
            ];
          }
          return updated;
        }
        return ord;
      })
    );
  };

  const updateCourierTracking = (orderId: string, trackingNumber: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            courier: ord.courier ? { ...ord.courier, trackingNumber } : { courierName: 'J&T Express', service: 'EZ', trackingNumber },
            productionStatus: 'dikirim',
          };
        }
        return ord;
      })
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const syncToGoogleSheet = async () => {
    setIsSyncingSheet(true);
    // Simulate real cloud sync handshake with Google Sheets API / Apps Script
    await new Promise(resolve => setTimeout(resolve, 1400));
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    setLastSheetSyncTime(nowStr);
    setIsSyncingSheet(false);
    return {
      success: true,
      rowsSynced: orders.length,
      timestamp: nowStr,
    };
  };

  const addDriveDocument = (doc: Omit<GoogleDriveDocument, 'id'>) => {
    const newDoc: GoogleDriveDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
    };
    setDriveDocuments(prev => [newDoc, ...prev]);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        driveDocuments,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        updateCourierTracking,
        syncToGoogleSheet,
        isSyncingSheet,
        lastSheetSyncTime,
        sheetConfig,
        updateSheetConfig,
        addDriveDocument,
        deleteOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
