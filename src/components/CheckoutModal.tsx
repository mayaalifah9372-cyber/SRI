import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { INITIAL_COURIERS } from '../data/initialData';
import { generateInvoicePDF, generateSPKPDF } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import { 
  X, 
  Truck, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Building, 
  CheckCircle2, 
  FileDown, 
  MapPin, 
  Clock, 
  ArrowRight, 
  ExternalLink,
  Store,
  Sparkles,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { PaymentMethod, CourierOption, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();

  if (!isOpen) return null;

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(user?.address || '');
  const [customerCity, setCustomerCity] = useState('Purbalingga');
  const [customerPostalCode, setCustomerPostalCode] = useState('53391');
  const [orderNotes, setOrderNotes] = useState('');

  // Shipping & Delivery Option
  const [selectedCourierId, setSelectedCourierId] = useState<string>('pickup-workshop');
  const selectedCourier = INITIAL_COURIERS.find(c => c.id === selectedCourierId) || INITIAL_COURIERS[0];
  const isPickupInStore = selectedCourierId === 'pickup-workshop';
  const shippingCost = isPickupInStore ? 0 : selectedCourier.cost;

  // Payment Option
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // QRIS Simulation timer
  const [qrisPaidSimulated, setQrisPaidSimulated] = useState(false);

  const grandTotal = subtotal + shippingCost;

  const handleSimulateQRISScan = () => {
    setQrisPaidSimulated(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Mohon lengkapi nama dan nomor WhatsApp Anda.');
      return;
    }

    if (!isPickupInStore && !customerAddress) {
      alert('Mohon masukkan alamat lengkap pengiriman untuk jasa ekspedisi.');
      return;
    }

    setIsProcessing(true);

    // Simulate API network handshake
    await new Promise(resolve => setTimeout(resolve, 800));

    const newOrder = createOrder({
      orderType: 'online',
      customer: {
        name: customerName,
        phone: customerPhone,
        address: isPickupInStore ? 'Ambil Sendiri di Workshop TEFA SMKN 1 Kaligondang' : customerAddress,
        city: customerCity,
        postalCode: customerPostalCode,
        notes: orderNotes,
      },
      userId: user?.id,
      items,
      subtotal,
      shippingCost,
      discount: 0,
      paymentMethod,
      courier: isPickupInStore ? undefined : {
        courierName: selectedCourier.name,
        service: selectedCourier.service,
      },
      isPickupInStore,
    });

    setIsProcessing(false);
    setCompletedOrder(newOrder);
    clearCart();

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {completedOrder ? 'Pesanan Berhasil Dibuat!' : 'Checkout & Pembayaran SRI TEFA'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedOrder ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">
                Terima Kasih! Pesanan Anda Diterima
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                No. Registrasi: <strong className="text-slate-900 font-mono">{completedOrder.orderNumber}</strong>
                <br />
                File siap cetak dan data otomatis tersimpan di Google Drive & Spreadsheet TEFA SMKN 1 Kaligondang.
              </p>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pemesan:</span>
                <span className="font-bold text-slate-800">{completedOrder.customer.name} ({completedOrder.customer.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pengiriman:</span>
                <span className="font-bold text-slate-800">
                  {completedOrder.isPickupInStore ? 'Ambil di Workshop TEFA' : `${completedOrder.courier?.courierName} (${completedOrder.courier?.service})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Pembayaran:</span>
                <span className="font-bold text-slate-800 uppercase">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                <span>Total Biaya:</span>
                <span className="text-cyan-700">Rp {completedOrder.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => generateInvoicePDF(completedOrder)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <FileDown className="w-4 h-4" />
                <span>Unduh Invoice (PDF)</span>
              </button>

              <button
                onClick={() => generateSPKPDF(completedOrder)}
                className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <FileDown className="w-4 h-4 text-cyan-200" />
                <span>Unduh SPK Bengkel (PDF)</span>
              </button>
            </div>

            <button
              onClick={() => {
                onOrderSuccess(completedOrder);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Lihat Status Produksi di Timeline Pelanggan
            </button>
          </div>
        ) : (
          /* Active Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Step 1: Customer Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-600" />
                1. Data Penerima & Kontak WhatsApp
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Nama Lengkap / Instansi / UMKM *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzi / OSIS SMKN 1"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Nomor WhatsApp / HP Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-cyan-600" />
                2. Metode Pengiriman & Ekspedisi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INITIAL_COURIERS.map(courier => (
                  <button
                    key={courier.id}
                    type="button"
                    onClick={() => setSelectedCourierId(courier.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedCourierId === courier.id
                        ? 'border-cyan-600 bg-cyan-50/70 ring-2 ring-cyan-500/20 text-cyan-950 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{courier.name}</div>
                      <div className="text-[11px] text-slate-500">{courier.service} ({courier.estimatedDays})</div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {courier.cost === 0 ? 'GRATIS' : `Rp ${courier.cost.toLocaleString('id-ID')}`}
                    </span>
                  </button>
                ))}
              </div>

              {!isPickupInStore && (
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Alamat Lengkap Pengiriman *
                  </label>
                  <textarea
                    required={!isPickupInStore}
                    rows={2}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kabupaten"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-cyan-600" />
                3. Pilihan Metode Pembayaran
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'qris'
                      ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-400/20 text-rose-950 font-bold'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-rose-600" />
                  <span className="text-xs block">QRIS Otomatis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/20 text-emerald-950 font-bold'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs block">Tunai / COD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer_bank')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'transfer_bank'
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-400/20 text-blue-950 font-bold'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span className="text-xs block">Transfer Bank</span>
                </button>
              </div>

              {/* Payment Details Container */}
              {paymentMethod === 'qris' && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 text-center">
                  <p className="text-xs font-bold text-cyan-300">
                    Scan QRIS Dinamis TEFA SMKN 1 Kaligondang
                  </p>
                  
                  {/* Dynamic QR Code generator display */}
                  <div className="bg-white p-3 rounded-xl w-44 h-44 mx-auto flex flex-col items-center justify-center shadow-lg">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                      <rect x="0" y="0" width="30" height="30" fill="#0f172a" />
                      <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="10" width="10" height="10" fill="#0f172a" />

                      <rect x="70" y="0" width="30" height="30" fill="#0f172a" />
                      <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="80" y="10" width="10" height="10" fill="#0f172a" />

                      <rect x="0" y="70" width="30" height="30" fill="#0f172a" />
                      <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="80" width="10" height="10" fill="#0f172a" />

                      {/* Random stylized QR data blocks */}
                      <rect x="40" y="10" width="15" height="10" fill="#0f172a" />
                      <rect x="40" y="30" width="20" height="10" fill="#0f172a" />
                      <rect x="15" y="40" width="15" height="15" fill="#0f172a" />
                      <rect x="45" y="50" width="15" height="15" fill="#0f172a" />
                      <rect x="70" y="40" width="20" height="10" fill="#0f172a" />
                      <rect x="65" y="65" width="25" height="25" fill="#0f172a" />
                      <rect x="40" y="75" width="15" height="15" fill="#0f172a" />
                    </svg>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    Bisa di-scan menggunakan GoPay, OVO, Dana, ShopeePay, BCA Mobile, Livin, BRImo, dll.
                  </p>

                  <button
                    type="button"
                    onClick={handleSimulateQRISScan}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 transition-colors"
                  >
                    {qrisPaidSimulated ? '✓ Pembayaran Berhasil Disimulasikan' : 'Simulasikan Pembayaran QRIS Berhasil'}
                  </button>
                </div>
              )}

              {paymentMethod === 'transfer_bank' && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-2 text-slate-800">
                  <p className="font-bold text-blue-950">Rekening Resmi TEFA SMKN 1 Kaligondang:</p>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between bg-white p-2 rounded-lg border border-blue-100">
                      <span>Bank BPD Jateng (Cab. Purbalingga)</span>
                      <strong className="text-blue-700">1-023-998877-1</strong>
                    </div>
                    <div className="flex justify-between bg-white p-2 rounded-lg border border-blue-100">
                      <span>Bank BRI (Unit Kaligondang)</span>
                      <strong className="text-blue-700">0123-01-002345-53-8</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Atas Nama: <strong>TEFA TEKNIK GRAFIKA SMKN 1 KALIGONDANG</strong>
                  </p>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1 text-slate-800">
                  <p className="font-bold text-emerald-950">Pembayaran Tunai / Kasir Workshop:</p>
                  <p className="text-slate-600">
                    Anda dapat membayar secara langsung di Front Office / Kasir TEFA Teknik Grafika SMKN 1 Kaligondang saat mengambil pesanan atau saat pengerjaan dimulai.
                  </p>
                </div>
              )}
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Barang & Jasa ({items.length} jenis):</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Kirim ({isPickupInStore ? 'Ambil Sendiri' : selectedCourier.name}):</span>
                <span>{shippingCost === 0 ? 'GRATIS' : `Rp ${shippingCost.toLocaleString('id-ID')}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                <span>Total Pembayaran:</span>
                <span className="text-cyan-700">Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <>
                    <span>Konfirmasi & Buat Pesanan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
