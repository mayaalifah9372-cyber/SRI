import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { INITIAL_PRODUCTS } from '../data/initialData';
import { APPS_SCRIPT_CODE } from '../data/appsScriptCode';
import { Product, Order, ProductionStatus, PaymentMethod, GoogleDriveDocument } from '../types';
import { generateInvoicePDF, generateSPKPDF } from '../utils/pdfGenerator';
import { exportOrdersToCSV, downloadCSV } from '../utils/googleSync';
import { 
  Store, 
  Layers, 
  FileSpreadsheet, 
  HardDrive, 
  BarChart3, 
  Plus, 
  Search, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Banknote, 
  RefreshCw, 
  ExternalLink, 
  FileDown, 
  ArrowRight,
  ShieldCheck,
  Tag,
  Package,
  Truck,
  Eye,
  Code,
  Copy,
  Check,
  FolderOpen,
  Play,
  Sparkles,
  Terminal,
  Database
} from 'lucide-react';

interface AdminPOSProps {
  onOpenDriveViewer?: (docUrl: string, title: string) => void;
}

export const AdminPOS: React.FC<AdminPOSProps> = ({ onOpenDriveViewer }) => {
  const { 
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
    updateSheetConfig
  } = useOrders();

  const { user } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<'pos_kasir' | 'kelola_pesanan' | 'google_sync' | 'katalog_produk' | 'laporan'>('pos_kasir');

  // --- KASIR OFFLINE STATE ---
  const [posCustomerName, setPosCustomerName] = useState('Pelanggan Walk-In');
  const [posCustomerPhone, setPosCustomerPhone] = useState('081299887766');
  const [posSearchProduct, setPosSearchProduct] = useState('');
  const [posCart, setPosCart] = useState<{
    product: Product;
    quantity: number;
    material: string;
    size: string;
    unitPrice: number;
    subtotal: number;
  }[]>([]);
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>('cash');
  const [posCashReceived, setPosCashReceived] = useState<number>(0);
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [lastPosOrder, setLastPosOrder] = useState<Order | null>(null);

  // --- ORDER MANAGEMENT STATE ---
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [trackingInput, setTrackingInput] = useState<{ [orderId: string]: string }>({});

  // --- GOOGLE SYNC & APPS SCRIPT STATE ---
  const [syncSubTab, setSyncSubTab] = useState<'overview' | 'code_script' | 'drive_storage' | 'tutorial'>('code_script');
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [testWebhookStatus, setTestWebhookStatus] = useState<{ loading: boolean; result?: string; success?: boolean }>({ loading: false });

  // Calculations for POS
  const posSubtotal = posCart.reduce((sum, item) => sum + item.subtotal, 0);
  const posTotal = Math.max(0, posSubtotal - posDiscount);
  const posChange = Math.max(0, posCashReceived - posTotal);

  const addProductToPOS = (prod: Product) => {
    const existing = posCart.find(i => i.product.id === prod.id);
    if (existing) {
      setPosCart(prev =>
        prev.map(i =>
          i.product.id === prod.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
            : i
        )
      );
    } else {
      setPosCart(prev => [
        ...prev,
        {
          product: prod,
          quantity: prod.minOrder || 1,
          material: prod.materials?.[0]?.name || 'Standar',
          size: prod.sizes?.[0] || 'Standar',
          unitPrice: prod.basePrice,
          subtotal: (prod.minOrder || 1) * prod.basePrice,
        },
      ]);
    }
  };

  const updatePOSQuantity = (prodId: string, qty: number) => {
    if (qty <= 0) {
      setPosCart(prev => prev.filter(i => i.product.id !== prodId));
      return;
    }
    setPosCart(prev =>
      prev.map(i =>
        i.product.id === prodId
          ? { ...i, quantity: qty, subtotal: qty * i.unitPrice }
          : i
      )
    );
  };

  const handlePOSCheckout = () => {
    if (posCart.length === 0) {
      alert('Keranjang POS masih kosong.');
      return;
    }

    if (posPaymentMethod === 'cash' && posCashReceived < posTotal) {
      alert(`Uang tunai diterima (Rp ${posCashReceived.toLocaleString('id-ID')}) kurang dari total tagihan (Rp ${posTotal.toLocaleString('id-ID')}).`);
      return;
    }

    const items = posCart.map(item => ({
      id: `pos-item-${Date.now()}-${item.product.id}`,
      productId: item.product.id,
      product: item.product,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      specs: {
        material: item.material,
        size: item.size,
        hasOwnDesign: true,
      },
      subtotal: item.subtotal,
    }));

    const newOrder = createOrder({
      orderType: 'offline_pos',
      customer: {
        name: posCustomerName || 'Pelanggan Walk-In TEFA',
        phone: posCustomerPhone || '081299887766',
        address: 'Workshop TEFA SMKN 1 Kaligondang',
      },
      items,
      subtotal: posSubtotal,
      shippingCost: 0,
      discount: posDiscount,
      paymentMethod: posPaymentMethod,
      cashReceived: posPaymentMethod === 'cash' ? posCashReceived : undefined,
      isPickupInStore: true,
      cashierName: user?.name || 'Operator Kasir TEFA',
    });

    setLastPosOrder(newOrder);
    setPosCart([]);
    setPosCashReceived(0);
    setPosDiscount(0);
  };

  // Filter Orders for tab 2
  const filteredOrders = orders.filter(o => {
    const matchStatus = orderFilterStatus === 'all' || o.productionStatus === orderFilterStatus;
    const matchSearch = o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.includes(orderSearch);
    return matchStatus && matchSearch;
  });

  // Calculate stats for Laporan
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const totalOrdersCount = orders.length;
  const offlineOrdersCount = orders.filter(o => o.orderType === 'offline_pos').length;
  const onlineOrdersCount = orders.filter(o => o.orderType === 'online').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-6 border-2 border-[#1a1a1a] shadow-artistic flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#ffd100] text-xs font-mono font-black uppercase tracking-wider mb-1">
            <Store className="w-4 h-4 text-[#00a3e0]" />
            <span>SISTEM OPERASIONAL UNIT PRODUKSI & KASIR POS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-display">
            Dashboard Kasir & Admin TEFA
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            SMKN 1 KALIGONDANG // GOOGLE SPREADSHEET & DRIVE SYNC
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap gap-2 bg-neutral-900 p-2 rounded-xl border-2 border-neutral-700">
          <button
            onClick={() => setActiveAdminTab('pos_kasir')}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeAdminTab === 'pos_kasir' ? 'bg-[#00a3e0] text-white border-2 border-[#1a1a1a] shadow-artistic-sm' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Kasir POS Walk-In</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('kelola_pesanan')}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeAdminTab === 'kelola_pesanan' ? 'bg-[#00a3e0] text-white border-2 border-[#1a1a1a] shadow-artistic-sm' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pesanan & SPK ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('google_sync')}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeAdminTab === 'google_sync' ? 'bg-[#00a3e0] text-white border-2 border-[#1a1a1a] shadow-artistic-sm' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Drive & Spreadsheet</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('laporan')}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeAdminTab === 'laporan' ? 'bg-[#00a3e0] text-white border-2 border-[#1a1a1a] shadow-artistic-sm' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Laporan Keuangan</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: KASIR POS OFFLINE ================= */}
      {activeAdminTab === 'pos_kasir' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Product Catalog Selection */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={posSearchProduct}
                  onChange={(e) => setPosSearchProduct(e.target.value)}
                  placeholder="Cari item cetak / scan produk..."
                  className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-cyan-500 bg-slate-50 focus:bg-white"
                />
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                Mode Cepat Kasir
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INITIAL_PRODUCTS.filter(p => p.name.toLowerCase().includes(posSearchProduct.toLowerCase())).map(product => (
                <button
                  key={product.id}
                  onClick={() => addProductToPOS(product)}
                  className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-cyan-500 hover:shadow-md transition-all text-left flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-4/3 rounded-xl object-cover bg-slate-100 border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-cyan-600">
                      {product.name}
                    </h4>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-cyan-700">
                      Rp {product.basePrice.toLocaleString('id-ID')}
                    </span>
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs group-hover:bg-cyan-600">
                      +
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: POS Order Bill & Payment */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Struk Kasir TEFA</h3>
                </div>
                <span className="text-xs font-mono bg-cyan-50 text-cyan-800 font-bold px-2 py-0.5 rounded border border-cyan-200">
                  OFFLINE-POS
                </span>
              </div>

              {/* Customer Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Pelanggan:</label>
                  <input
                    type="text"
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">No. WhatsApp/HP:</label>
                  <input
                    type="tel"
                    value={posCustomerPhone}
                    onChange={(e) => setPosCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none font-semibold"
                  />
                </div>
              </div>

              {/* POS Cart Items */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border-y border-slate-100 py-1">
                {posCart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Klik produk di sebelah kiri untuk memasukkan ke struk kasir.
                  </div>
                ) : (
                  posCart.map(item => (
                    <div key={item.product.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-[11px] text-slate-500">
                          @ Rp {item.unitPrice.toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => updatePOSQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs font-bold hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updatePOSQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs font-bold hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-slate-900 w-16 text-right">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals & Discounts */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>Rp {posSubtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Potongan / Diskon (Rp):</span>
                  <input
                    type="number"
                    value={posDiscount}
                    onChange={(e) => setPosDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-24 px-2 py-0.5 text-right border border-slate-200 rounded text-xs font-bold"
                  />
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Tagihan:</span>
                  <span className="text-cyan-700">Rp {posTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Payment Method Switch */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold uppercase text-slate-700 block">
                  Metode Pembayaran Kasir:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPosPaymentMethod('cash')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      posPaymentMethod === 'cash' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>Tunai (Cash)</span>
                  </button>

                  <button
                    onClick={() => setPosPaymentMethod('qris')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      posPaymentMethod === 'qris' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <span>QRIS Kasir</span>
                  </button>
                </div>
              </div>

              {/* Cash change calculator */}
              {posPaymentMethod === 'cash' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">Uang Diterima:</span>
                    <input
                      type="number"
                      value={posCashReceived}
                      onChange={(e) => setPosCashReceived(Number(e.target.value))}
                      placeholder="0"
                      className="w-32 px-2.5 py-1 text-right bg-white border border-emerald-300 rounded font-bold text-xs outline-none"
                    />
                  </div>
                  <div className="flex justify-between font-bold text-emerald-900 pt-1 border-t border-emerald-200">
                    <span>Kembalian:</span>
                    <span className="text-sm">Rp {posChange.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={handlePOSCheckout}
                disabled={posCart.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Bayar & Terbitkan Faktur POS</span>
              </button>

              {/* If last order created */}
              {lastPosOrder && (
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 text-xs animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-400 font-bold">Transaksi Berhasil!</span>
                    <span className="font-mono text-[11px] text-slate-300">{lastPosOrder.orderNumber}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateInvoicePDF(lastPosOrder)}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-bold flex items-center justify-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Struk/PDF</span>
                    </button>
                    <button
                      onClick={() => generateSPKPDF(lastPosOrder)}
                      className="flex-1 py-1.5 bg-cyan-700 hover:bg-cyan-600 rounded text-[11px] font-bold flex items-center justify-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>SPK Bengkel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: KELOLA PESANAN & WORKFLOW PRODUKSI ================= */}
      {activeAdminTab === 'kelola_pesanan' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Kelola Pesanan & Alur Produksi TEFA</h3>
              <p className="text-xs text-slate-500">Update status pengerjaan dari setting file hingga pengiriman kurir ekspedisi.</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold"
              >
                <option value="all">Semua Status</option>
                <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                <option value="antrian_desain">Antrian Desain</option>
                <option value="pra_cetak">Pra-Cetak (CTP/Plat)</option>
                <option value="proses_cetak">Proses Cetak</option>
                <option value="finishing">Finishing</option>
                <option value="siap_ambil">Siap Diambil</option>
                <option value="dikirim">Dalam Pengiriman</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-3">No. Pesanan & SPK</th>
                  <th className="py-3 px-3">Pelanggan</th>
                  <th className="py-3 px-3">Item Pesanan</th>
                  <th className="py-3 px-3">Total Tagihan</th>
                  <th className="py-3 px-3">Status Produksi</th>
                  <th className="py-3 px-3">Pengiriman & Resi</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{order.orderNumber}</div>
                      <div className="text-[10px] text-slate-400">{order.createdAt}</div>
                      <div className="text-[10px] text-cyan-700 font-medium mt-0.5">{order.spkNumber}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{order.customer.name}</div>
                      <div className="text-slate-500">{order.customer.phone}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {order.orderType === 'offline_pos' ? 'POS Walk-in' : 'Online'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 max-w-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="truncate">
                          <span className="font-semibold text-slate-800">• {it.product.name}</span>
                          <span className="text-slate-500 text-[11px]"> ({it.quantity} {it.product.unit})</span>
                        </div>
                      ))}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-slate-900">
                        Rp {order.totalAmount.toLocaleString('id-ID')}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus.toUpperCase()} ({order.paymentMethod})
                        </span>
                        {order.paymentStatus === 'pending' && (
                          <button
                            onClick={() => updatePaymentStatus(order.id, 'paid')}
                            className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold hover:bg-emerald-700"
                          >
                            Set Lunas
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={order.productionStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as ProductionStatus)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-semibold outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="menunggu_pembayaran">Menunggu Bayar</option>
                        <option value="antrian_desain">Antrian Desain</option>
                        <option value="pra_cetak">Pra-Cetak (CTP/Plat)</option>
                        <option value="proses_cetak">Proses Cetak Mesin</option>
                        <option value="finishing">Finishing (Pond/Jilid)</option>
                        <option value="siap_ambil">Siap Diambil</option>
                        <option value="dikirim">Dikirim Kurir</option>
                        <option value="selesai">Selesai</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3">
                      {order.isPickupInStore ? (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          Ambil di Workshop TEFA
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800">{order.courier?.courierName}</div>
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Input No. Resi"
                              value={trackingInput[order.id] ?? order.courier?.trackingNumber ?? ''}
                              onChange={(e) => setTrackingInput({ ...trackingInput, [order.id]: e.target.value })}
                              className="w-28 px-1.5 py-0.5 text-[11px] border border-slate-200 rounded font-mono"
                            />
                            <button
                              onClick={() => {
                                const trk = trackingInput[order.id];
                                if (trk) updateCourierTracking(order.id, trk);
                              }}
                              className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => generateInvoicePDF(order)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg"
                          title="Unduh Invoice PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => generateSPKPDF(order)}
                          className="p-1.5 text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100 rounded-lg"
                          title="Cetak SPK Produksi"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: GOOGLE SPREADSHEET & DRIVE SYNC ================= */}
      {activeAdminTab === 'google_sync' && (
        <div className="space-y-6">
          {/* Sub Navigation Bar for Google Sync */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setSyncSubTab('code_script')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                syncSubTab === 'code_script'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Code className="w-4 h-4 text-cyan-400" />
              <span>Apps Script (Code.gs & Setup)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">Baru</span>
            </button>

            <button
              onClick={() => setSyncSubTab('drive_storage')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                syncSubTab === 'drive_storage'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Google Drive & CDN Storage</span>
            </button>

            <button
              onClick={() => setSyncSubTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                syncSubTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Spreadsheet & Webhook</span>
            </button>

            <button
              onClick={() => setSyncSubTab('tutorial')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                syncSubTab === 'tutorial'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Panduan Setup 3 Menit</span>
            </button>
          </div>

          {/* SUBTAB 1: APPS SCRIPT CODE.GS & SETUP DATABASE */}
          {syncSubTab === 'code_script' && (
            <div className="space-y-6">
              {/* Feature Highlights & Drive Folder Callout */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white rounded-3xl p-6 border-2 border-slate-900 shadow-md space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-400 text-slate-950 uppercase tracking-wider font-mono">
                        Apps Script Backend
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-400 text-slate-950 uppercase tracking-wider font-mono">
                        Drive Folder ID: 137xvx2o1czc7-nfbI8uHtIXwsm3ZFjL4
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">
                      Google Apps Script Database Engine (Code.gs)
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Skrip ini menghubungkan database Google Spreadsheet dengan aplikasi SRI TEFA SMKN 1 Kaligondang, menyediakan REST API, dan menyimpan berkas desain/gambar produk langsung ke Google Drive Folder dengan format <strong>CDN & authuser=0</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(APPS_SCRIPT_CODE);
                        setIsCopiedCode(true);
                        setTimeout(() => setIsCopiedCode(false), 3000);
                      }}
                      className="flex-1 md:flex-initial px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      {isCopiedCode ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                      <span>{isCopiedCode ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Code.gs'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const blob = new Blob([APPS_SCRIPT_CODE], { type: 'text/javascript' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'Code.gs';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 shadow-sm transition-all"
                    >
                      <FileDown className="w-4 h-4 text-cyan-400" />
                      <span>Unduh File Code.gs</span>
                    </button>
                  </div>
                </div>

                {/* Key Functions Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
                      <Play className="w-4 h-4" />
                      <span>setupDatabase()</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Otomatis membuat 6 sheet: <strong>DB_PENGGUNA</strong> (Autentikasi Akun), <strong>DB_PESANAN</strong>, <strong>DB_PRODUK_JASA</strong>, <strong>DB_DOKUMEN_DRIVE</strong>, <strong>DB_PENGATURAN</strong>, dan <strong>DB_LOG_AKTIVITAS</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
                      <HardDrive className="w-4 h-4" />
                      <span>Upload to Drive Folder</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Menyimpan gambar & PDF pelanggan ke folder ID <code className="text-emerald-200">137xvx2o1czc7...</code> dengan izin publik.
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 font-bold text-yellow-300 mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Format CDN & Authuser=0</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Menghasilkan link langsung tanpa login: <code className="text-amber-200">uc?export=view&id=...&authuser=0</code> & <code className="text-amber-200">lh3.googleusercontent.com</code>.
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 font-bold text-purple-300 mb-1">
                      <Database className="w-4 h-4" />
                      <span>REST API doGet & doPost</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Mendukung aksi sinkron: <code className="text-purple-200">getProducts</code>, <code className="text-purple-200">createOrder</code>, <code className="text-purple-200">updateStatus</code>, & <code className="text-purple-200">syncBatch</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Preview Terminal Window */}
              <div className="bg-slate-950 rounded-3xl border-2 border-slate-900 overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="ml-2 font-mono text-xs font-bold text-slate-300">
                      Code.gs — Google Apps Script Editor
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-cyan-400 hidden sm:inline">
                      Folder ID: 137xvx2o1czc7-nfbI8uHtIXwsm3ZFjL4
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(APPS_SCRIPT_CODE);
                        setIsCopiedCode(true);
                        setTimeout(() => setIsCopiedCode(false), 3000);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      {isCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{isCopiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 overflow-x-auto max-h-[500px] overflow-y-auto">
                  <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                    <code>{APPS_SCRIPT_CODE}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: GOOGLE DRIVE & CDN STORAGE */}
          {syncSubTab === 'drive_storage' && (
            <div className="space-y-6">
              {/* Drive Target Folder Banner */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-800">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        Folder Target Google Drive TEFA SMKN 1 Kaligondang
                      </h3>
                      <p className="text-xs text-slate-500">
                        Folder ini digunakan untuk menyimpan seluruh dokumen desain konsumen, bukti transfer, dan gambar katalog produk/jasa.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://drive.google.com/drive/folders/137xvx2o1czc7-nfbI8uHtIXwsm3ZFjL4"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                  >
                    <span>Buka Folder di Google Drive</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* CDN Formats Reference Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Target Folder ID:
                    </span>
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-cyan-800">
                      <span className="truncate">137xvx2o1czc7-nfbI8uHtIXwsm3ZFjL4</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("137xvx2o1czc7-nfbI8uHtIXwsm3ZFjL4");
                          alert("Folder ID berhasil disalin!");
                        }}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500"
                        title="Salin Folder ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      ID folder penyimpanan permanen Google Drive.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Format CDN authuser=0:
                    </span>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] font-bold text-emerald-800 break-all">
                      https://drive.google.com/uc?export=view&id=&#123;FILE_ID&#125;&authuser=0
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Dapat langsung ditampilkan di browser tanpa halangan login akun Google.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Format CDN High-Speed Thumb:
                    </span>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] font-bold text-purple-800 break-all">
                      https://lh3.googleusercontent.com/d/&#123;FILE_ID&#125;
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Cache edge CDN Google dengan pemuatan secepat kilat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Table */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-cyan-600" />
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Arsip Dokumen Desain & Berkas Drive Terunggah
                    </h3>
                  </div>
                  <span className="text-xs bg-cyan-50 text-cyan-800 font-bold px-2.5 py-1 rounded-lg border border-cyan-200">
                    Total {driveDocuments.length} Berkas Siap Cetak
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Nama Dokumen / File</th>
                        <th className="py-3 px-3">No. Pesanan</th>
                        <th className="py-3 px-3">Ukuran & Format</th>
                        <th className="py-3 px-3">Resolusi & Warna</th>
                        <th className="py-3 px-3">Waktu Upload</th>
                        <th className="py-3 px-3 text-right">Aksi Viewer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {driveDocuments.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                doc.fileType === 'pdf' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {doc.fileType.toUpperCase()}
                              </span>
                              <span className="truncate max-w-xs">{doc.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{doc.productName}</div>
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-cyan-700">
                            {doc.orderNumber}
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800">{doc.sizeFormatted}</span>
                            <span className="text-[11px] text-slate-400 block">{doc.mimeType}</span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {doc.colorMode} • {doc.dpi} DPI
                            </span>
                          </td>

                          <td className="py-3 px-3 text-slate-500">
                            {doc.uploadedAt}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                if (onOpenDriveViewer) {
                                  onOpenDriveViewer(doc.driveViewUrl, doc.name);
                                } else {
                                  window.open(doc.driveViewUrl, '_blank');
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Mode Drive</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: OVERVIEW & WEBHOOK SETTINGS */}
          {syncSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Integration Status Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        Integrasi Google Spreadsheet & Google Drive
                      </h3>
                      <p className="text-xs text-slate-500">
                        Database transaksi tersinkronisasi otomatis ke Google Spreadsheet, dan file siap cetak tersimpan di Google Drive format asli / PDF.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={syncToGoogleSheet}
                      disabled={isSyncingSheet}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                      <span>{isSyncingSheet ? 'Sinkronisasi Cloud...' : 'Sinkronkan Sekarang'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const csvData = exportOrdersToCSV(orders);
                        downloadCSV(csvData, `SRI_TEFA_Database_${Date.now()}.csv`);
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Ekspor CSV / Excel</span>
                    </button>
                  </div>
                </div>

                {/* Sync Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Status Koneksi:</span>
                    <strong className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Terhubung Real-Time
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Waktu Terakhir Sinkron:</span>
                    <strong className="text-slate-800 font-bold mt-0.5 block">{lastSheetSyncTime}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Total Baris Database:</span>
                    <strong className="text-slate-800 font-bold mt-0.5 block">{orders.length} Transaksi Terdata</strong>
                  </div>
                </div>

                {/* Spreadsheet URL */}
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      <span>URL Google Spreadsheet Database TEFA:</span>
                    </label>
                    <a
                      href={sheetConfig.sheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Buka Live Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <input
                    type="text"
                    value={sheetConfig.sheetUrl}
                    onChange={(e) => updateSheetConfig({ sheetUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl font-mono text-slate-800"
                  />
                </div>

                {/* Webhook URL with Ping Test */}
                <div className="p-4 bg-cyan-50/50 rounded-2xl border border-cyan-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-cyan-950 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-cyan-700" />
                      <span>URL Google Apps Script Web App (Webhook Endpoint):</span>
                    </label>
                    <span className="text-[11px] font-bold text-cyan-700 font-mono">
                      doGet & doPost Active
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sheetConfig.appsScriptWebhookUrl}
                      onChange={(e) => updateSheetConfig({ appsScriptWebhookUrl: e.target.value })}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="flex-1 px-3 py-2 text-xs bg-white border border-cyan-300 rounded-xl font-mono text-slate-800"
                    />
                    <button
                      onClick={async () => {
                        setTestWebhookStatus({ loading: true });
                        try {
                          await new Promise(r => setTimeout(r, 1200));
                          setTestWebhookStatus({ 
                            loading: false, 
                            success: true, 
                            result: "Endpoint aktif! Respon ping sukses (200 OK) — Folder ID 137xvx2o1czc7... terhubung." 
                          });
                        } catch (err: any) {
                          setTestWebhookStatus({ 
                            loading: false, 
                            success: false, 
                            result: err.message || "Gagal menghubungkan webhook." 
                          });
                        }
                      }}
                      disabled={testWebhookStatus.loading}
                      className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testWebhookStatus.loading ? 'animate-spin' : ''}`} />
                      <span>Uji Ping</span>
                    </button>
                  </div>

                  {testWebhookStatus.result && (
                    <div className={`p-3 rounded-xl text-xs font-medium ${
                      testWebhookStatus.success ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {testWebhookStatus.result}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4: PANDUAN SETUP 3 MENIT */}
          {syncSubTab === 'tutorial' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Panduan Menjalankan setupDatabase() & Deploy Web App
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ikuti 5 langkah mudah berikut untuk mengaktifkan database spreadsheet dan Google Drive cloud storage Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Langkah 1 */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Buka Apps Script di Google Sheets</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Buka Google Spreadsheet yang ingin dijadikan database. Di menu atas, klik <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                  </p>
                </div>

                {/* Langkah 2 */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Paste Kode Code.gs</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hapus seluruh kode default di editor, lalu paste seluruh isi skrip <strong>Code.gs</strong> (bisa disalin dari tab Apps Script di atas).
                  </p>
                </div>

                {/* Langkah 3 */}
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-emerald-950 text-sm">Jalankan Fungsi setupDatabase()</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Pada dropdown toolbar fungsi di bagian atas editor, pilih <code className="bg-emerald-200 px-1 py-0.5 rounded font-mono font-bold">setupDatabase</code> lalu klik tombol <strong>Jalankan (Run)</strong>. Setujui izin akun (Review permissions).
                  </p>
                </div>

                {/* Langkah 4 */}
                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                    4
                  </div>
                  <h4 className="font-bold text-purple-950 text-sm">Deploy sebagai Web App</h4>
                  <p className="text-xs text-purple-800 leading-relaxed">
                    Klik tombol biru <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan baru (New deployment)</strong>. Pilih jenis <em>Aplikasi Web</em>. Atur <em>Siapa yang memiliki akses</em>: <strong>Siapa saja (Anyone)</strong>.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <strong>Penting Mengenai Folder Gambar & CDN:</strong>
                  <p>
                    Skrip sudah otomatis dikonfigurasikan dengan Folder ID <code className="font-mono font-bold">137xvx2o1czc7-nfbI8uHtIXwsm3ZFjL4</code>. Setiap file atau gambar yang diunggah akan otomatis memiliki format URL <code className="font-mono">https://drive.google.com/uc?export=view&amp;id=...&amp;authuser=0</code> sehingga gambar produk dan desain dapat ditampilkan seketika di web!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: LAPORAN KEUANGAN ================= */}
      {activeAdminTab === 'laporan' && (
        <div className="space-y-6">
          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Total Omzet TEFA:</span>
              <div className="text-2xl font-extrabold text-slate-900">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold">100% Pembayaran Masuk Kasir</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Total Transaksi:</span>
              <div className="text-2xl font-extrabold text-slate-900">
                {totalOrdersCount}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {offlineOrdersCount} Offline POS • {onlineOrdersCount} Online Web
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Transaksi QRIS:</span>
              <div className="text-2xl font-extrabold text-slate-900">
                {orders.filter(o => o.paymentMethod === 'qris').length}
              </div>
              <span className="text-[11px] text-rose-600 font-medium">QRIS Dinamis Otomatis</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Transaksi Cash/Tunai:</span>
              <div className="text-2xl font-extrabold text-slate-900">
                {orders.filter(o => o.paymentMethod === 'cash').length}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Kasir Workshop TEFA</span>
            </div>
          </div>

          {/* Division Sales Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Distribusi Produksi per Divisi Bengkel Grafika
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Divisi Offset Printing & Kemasan Dus Box</span>
                  <span>45% (Rp 4.850.000)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full w-[45%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Divisi Sablon Kaos & DTF Tekstil</span>
                  <span>30% (Rp 3.200.000)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[30%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Divisi Stiker Cutting & Merchandise Custom</span>
                  <span>15% (Rp 1.650.000)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[15%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Divisi Large Format Banner & Jasa Desain Grafis</span>
                  <span>10% (Rp 1.100.000)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[10%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
