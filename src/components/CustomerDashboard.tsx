import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF, generateSPKPDF } from '../utils/pdfGenerator';
import { 
  Package, 
  Clock, 
  FileDown, 
  HardDrive, 
  ExternalLink, 
  CheckCircle2, 
  Truck, 
  Store, 
  Sparkles, 
  Layers, 
  FileText,
  Search
} from 'lucide-react';
import { Order, ProductionStatus } from '../types';

interface CustomerDashboardProps {
  onOpenDriveViewer?: (docUrl: string, title: string) => void;
  onExploreProducts: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenDriveViewer,
  onExploreProducts,
}) => {
  const { orders } = useOrders();
  const { user } = useAuth();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders by user phone or demo view
  const userOrders = orders.filter(o => 
    !user || user.role === 'admin' || user.role === 'cashier' 
      ? true 
      : o.customer.phone === user.phone || o.userId === user.id
  );

  const filteredOrders = userOrders.filter(o =>
    o.orderNumber.toLowerCase().includes(filterQuery.toLowerCase()) ||
    o.customer.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    o.items.some(i => i.product.name.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const getStatusBadge = (status: ProductionStatus) => {
    switch (status) {
      case 'menunggu_pembayaran':
        return <span className="bg-[#ffd100] text-[#1a1a1a] border-2 border-[#1a1a1a] px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase">Menunggu Pembayaran</span>;
      case 'antrian_desain':
        return <span className="bg-[#00a3e0] text-white border-2 border-[#1a1a1a] px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase">Antrian Desain</span>;
      case 'pra_cetak':
        return <span className="bg-purple-600 text-white border-2 border-[#1a1a1a] px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase">Pra-Cetak (CTP / Plat)</span>;
      case 'proses_cetak':
        return <span className="bg-[#e4007b] text-white border-2 border-[#1a1a1a] px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase animate-pulse">Proses Cetak Mesin</span>;
      case 'finishing':
        return <span className="bg-indigo-600 text-white border-2 border-[#1a1a1a] px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase">Finishing (Pond/Jilid)</span>;
      case 'siap_ambil':
        return <span className="bg-emerald-500 text-white border-2 border-[#1a1a1a] px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase">Siap Ambil di Workshop</span>;
      case 'dikirim':
        return <span className="bg-emerald-500 text-white border-2 border-[#1a1a1a] px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase">Pengiriman Kurir</span>;
      case 'selesai':
        return <span className="bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase">Selesai</span>;
      default:
        return <span className="bg-neutral-100 text-[#1a1a1a] border-2 border-[#1a1a1a] px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 text-white border-2 border-[#1a1a1a] shadow-artistic flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#00a3e0] border border-[#1a1a1a] text-xs font-mono font-black uppercase tracking-wider text-white">
            <Clock className="w-3.5 h-3.5" />
            <span>TIMELINE PRODUKSI & RIWAYAT PESANAN TEFA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-display">
            Status Pesanan & Dokumen Cetak
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-medium">
            Pantau progres percetakan dari tahap setting desain, CTP, cetak mesin, hingga finishing dan pengiriman kurir.
          </p>
        </div>

        <button
          onClick={onExploreProducts}
          className="px-5 py-2.5 rounded-xl bg-[#ffd100] text-[#1a1a1a] text-xs font-mono font-black uppercase tracking-wider border-2 border-[#1a1a1a] shadow-artistic-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
        >
          + Buat Pesanan Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Cari no pesanan / nama produk..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border-2 border-[#1a1a1a] rounded-xl outline-none font-mono focus:shadow-artistic-sm"
          />
        </div>

        <div className="text-xs text-neutral-600 font-mono font-bold self-end sm:self-center">
          MENAMPILKAN <strong>{filteredOrders.length}</strong> TRANSAKSI PESANAN
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-[#1a1a1a] shadow-artistic space-y-3">
          <Package className="w-12 h-12 text-neutral-400 mx-auto" />
          <h3 className="font-black text-[#1a1a1a] text-base uppercase font-display">Belum Ada Riwayat Pesanan</h3>
          <p className="text-xs text-neutral-600 max-w-sm mx-auto font-medium">
            Silakan pilih produk cetak atau merchandise pada katalog untuk memulai pesanan Anda.
          </p>
          <button
            onClick={onExploreProducts}
            className="mt-2 px-5 py-2 bg-[#00a3e0] text-white rounded-xl text-xs font-mono font-black uppercase border-2 border-[#1a1a1a] shadow-artistic-sm cursor-pointer"
          >
            Buka Katalog Produk
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border-2 border-[#1a1a1a] shadow-artistic hover:shadow-artistic-cyan transition-all overflow-hidden"
            >
              {/* Order Card Header */}
              <div className="p-4 sm:p-5 bg-neutral-50 border-b-2 border-[#1a1a1a] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono font-black text-xs sm:text-sm text-[#1a1a1a] bg-white px-2.5 py-1 rounded border-2 border-[#1a1a1a] shadow-artistic-sm">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-neutral-600 font-mono font-bold">{order.createdAt}</span>
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-neutral-200 text-[#1a1a1a] border border-neutral-400">
                    {order.orderType === 'offline_pos' ? 'Kasir Offline' : 'Online Web'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.productionStatus)}
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-4 sm:p-5 space-y-4">
                {/* Items in order */}
                <div className="divide-y-2 divide-neutral-100">
                  {order.items.map(item => (
                    <div key={item.id} className="py-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-[#1a1a1a] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-[#1a1a1a] uppercase font-display">{item.product.name}</h4>
                          <p className="text-xs text-neutral-600 font-mono">
                            {item.quantity} {item.product.unit} • Rp {item.unitPrice.toLocaleString('id-ID')} / unit
                          </p>
                          <div className="text-[11px] text-neutral-700 flex flex-wrap gap-2 mt-0.5 font-mono">
                            {item.specs.material && <span>Bahan: <strong>{item.specs.material}</strong></span>}
                            {item.specs.size && <span>Ukuran: <strong>{item.specs.size}</strong></span>}
                            {item.specs.finishings && item.specs.finishings.length > 0 && (
                              <span>Finishing: <strong>{item.specs.finishings.join(', ')}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:self-center font-mono">
                        <span className="text-xs sm:text-sm font-black text-[#1a1a1a]">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Production Timeline Visualizer */}
                <div className="p-4 bg-neutral-50 rounded-xl border-2 border-neutral-200 space-y-3 font-mono">
                  <h5 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00a3e0]" />
                    PROGRES PENGERJAAN WORKSHOP TEFA:
                  </h5>

                  <div className="relative pl-4 space-y-3 border-l-2 border-[#00a3e0]">
                    {order.productionTimeline.map((step, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#00a3e0] ring-4 ring-white"></div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#1a1a1a]">{step.label}</span>
                          <span className="text-[11px] text-neutral-500">{step.timestamp}</span>
                        </div>
                        {step.note && (
                          <p className="text-[11px] text-neutral-700 mt-0.5 italic bg-white p-1.5 rounded border border-neutral-300">
                            {step.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kurir Tracking info if available */}
                {order.courier?.trackingNumber && (
                  <div className="p-3 bg-cyan-50 rounded-xl border-2 border-[#00a3e0] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#00a3e0]" />
                      <span>
                        Resi <strong>{order.courier.courierName} ({order.courier.service})</strong>: <code className="bg-white px-2 py-0.5 rounded border border-[#00a3e0] font-bold text-[#1a1a1a]">{order.courier.trackingNumber}</code>
                      </span>
                    </div>
                    <span className="text-[#00a3e0] font-black text-[11px] uppercase">Sedang Dikirim</span>
                  </div>
                )}

                {/* Action Buttons: Invoice PDF, SPK, Drive File */}
                <div className="pt-3 border-t-2 border-neutral-100 flex flex-wrap items-center justify-between gap-3 font-mono">
                  <div className="text-xs">
                    <span className="text-neutral-500">TOTAL PEMBAYARAN: </span>
                    <strong className="text-[#1a1a1a] font-black text-sm">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </strong>
                    <span className="text-[11px] text-neutral-600 ml-2 font-bold">
                      ({order.paymentMethod.toUpperCase()} - {order.paymentStatus.toUpperCase()})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => generateInvoicePDF(order)}
                      className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-neutral-800 text-white text-xs font-black uppercase flex items-center gap-1.5 border-2 border-[#1a1a1a] shadow-artistic-sm cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px]"
                    >
                      <FileDown className="w-3.5 h-3.5 text-[#ffd100]" />
                      <span>Invoice (PDF)</span>
                    </button>

                    <button
                      onClick={() => generateSPKPDF(order)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-50 text-[#1a1a1a] text-xs font-black uppercase flex items-center gap-1.5 border-2 border-[#1a1a1a] shadow-artistic-sm cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#00a3e0]" />
                      <span>SPK Produksi</span>
                    </button>

                    {order.googleDriveFolderUrl && (
                      <a
                        href={order.googleDriveFolderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#00a3e0] hover:bg-[#0092c8] text-white text-xs font-black uppercase flex items-center gap-1.5 border-2 border-[#1a1a1a] shadow-artistic-sm transition-all active:translate-x-[2px] active:translate-y-[2px]"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-white" />
                        <span>Google Drive</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

