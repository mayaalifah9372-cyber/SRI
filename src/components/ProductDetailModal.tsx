import React, { useState } from 'react';
import { Product, CustomPrintSpecs } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Upload, 
  FileText, 
  Check, 
  Sparkles, 
  Info, 
  HardDrive, 
  Layers, 
  ShieldCheck, 
  ShoppingBag, 
  CreditCard,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectCheckout?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onDirectCheckout,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { addItem, calculateItemPrice } = useCart();

  if (!product) return null;

  const [selectedMaterial, setSelectedMaterial] = useState<string>(
    product.materials?.[0]?.name || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] || 'Standar'
  );
  const [selectedFinishings, setSelectedFinishings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(product.minOrder || 1);
  const [notes, setNotes] = useState<string>('');
  const [hasOwnDesign, setHasOwnDesign] = useState<boolean>(true);
  
  // Custom uploaded design simulation (Google Drive storage)
  const [designFile, setDesignFile] = useState<{
    name: string;
    size: string;
    type: string;
    driveUrl: string;
    previewUrl?: string;
    uploadedAt: string;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [customWidthCm, setCustomWidthCm] = useState<number>(100);
  const [customHeightCm, setCustomHeightCm] = useState<number>(100);

  const toggleFinishing = (name: string) => {
    setSelectedFinishings(prev =>
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      setDesignFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: isPdf ? 'pdf' : 'image',
        driveUrl: `https://drive.google.com/file/d/sri_tefa_${Date.now()}/view?usp=sharing`,
        previewUrl: isPdf ? undefined : URL.createObjectURL(file),
        uploadedAt: new Date().toLocaleString('id-ID'),
      });
      setIsUploading(false);
    }, 800);
  };

  const currentSpecs: CustomPrintSpecs = {
    material: selectedMaterial,
    size: selectedSize === 'Ukuran Bebas Custom' ? `${customWidthCm} x ${customHeightCm} cm` : selectedSize,
    finishings: selectedFinishings,
    notes,
    hasOwnDesign,
    designFile: hasOwnDesign ? designFile || undefined : undefined,
    customDimension: selectedSize.includes('Custom') ? { widthCm: customWidthCm, heightCm: customHeightCm } : undefined,
  };

  const unitPrice = calculateItemPrice(product, currentSpecs);
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openAuthModal('login', () => {
        addItem(product, quantity, currentSpecs);
        onClose();
      });
      return;
    }
    addItem(product, quantity, currentSpecs);
    onClose();
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      openAuthModal('login', () => {
        addItem(product, quantity, currentSpecs);
        onClose();
        if (onDirectCheckout) onDirectCheckout();
      });
      return;
    }
    addItem(product, quantity, currentSpecs);
    onClose();
    if (onDirectCheckout) onDirectCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white">
              {product.type === 'jasa' ? 'Jasa Percetakan' : 'Produk TEFA'}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-md">
              Kustomisasi Spesifikasi & Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Top Product Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pb-6 border-b border-slate-200">
            <div className="md:col-span-4 rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="md:col-span-8 space-y-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                {product.name}
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map(tag => (
                  <span key={tag} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 1: Material Selection */}
          {product.materials && product.materials.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-600" />
                1. Pilih Bahan & Gramatur Kertas
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.materials.map(mat => (
                  <button
                    key={mat.id}
                    onClick={() => setSelectedMaterial(mat.name)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedMaterial === mat.name
                        ? 'border-cyan-600 bg-cyan-50/70 ring-2 ring-cyan-500/20 text-cyan-950 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{mat.name}</div>
                      <div className="text-[11px] text-slate-500">{mat.gramature}</div>
                    </div>
                    {mat.priceModifier !== 0 && (
                      <span className="text-[11px] font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {mat.priceModifier > 0 ? `+Rp ${mat.priceModifier.toLocaleString('id-ID')}` : `-Rp ${Math.abs(mat.priceModifier).toLocaleString('id-ID')}`}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Pilih Ukuran
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedSize === sz
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              {selectedSize.includes('Custom') && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">Dimensi (cm):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={customWidthCm}
                      onChange={(e) => setCustomWidthCm(Math.max(10, Number(e.target.value)))}
                      className="w-20 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold"
                      placeholder="Lebar"
                    />
                    <span className="text-xs text-slate-500">x</span>
                    <input
                      type="number"
                      value={customHeightCm}
                      onChange={(e) => setCustomHeightCm(Math.max(10, Number(e.target.value)))}
                      className="w-20 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold"
                      placeholder="Tinggi"
                    />
                    <span className="text-xs text-slate-500">cm ({(customWidthCm * customHeightCm / 10000).toFixed(2)} m²)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Finishing Options */}
          {product.finishings && product.finishings.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                3. Tambahan Finishing (Opsional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.finishings.map(fin => {
                  const isChecked = selectedFinishings.includes(fin.name);
                  return (
                    <button
                      key={fin.id}
                      onClick={() => toggleFinishing(fin.name)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/20 text-amber-950 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs">{fin.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">
                        +Rp {fin.pricePerUnit.toLocaleString('id-ID')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: File Desain & Format Google Drive */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-cyan-600" />
                4. File Desain & Dokumen Google Drive
              </label>
              <span className="text-[11px] font-medium text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded">
                Mode Dokumen: Asli / PDF 300 DPI
              </span>
            </div>

            {/* Design Type Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setHasOwnDesign(true)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  hasOwnDesign
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ✓ Sudah Ada Desain (Upload File)
              </button>
              <button
                onClick={() => setHasOwnDesign(false)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  !hasOwnDesign
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ✦ Belum Ada (Bantu Desain TEFA)
              </button>
            </div>

            {hasOwnDesign ? (
              <div className="space-y-2.5 pt-1">
                {designFile ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-300 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-200">
                        {designFile.type === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-xs">{designFile.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {designFile.size} • Tersimpan di Google Drive Format Asli
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDesignFile(null)}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Ganti File
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-white rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                    <Upload className="w-6 h-6 text-cyan-600 mb-1.5 animate-bounce" />
                    <span className="text-xs font-bold text-slate-800">
                      {isUploading ? 'Mengunggah ke Google Drive TEFA...' : 'Klik atau Tarik File Desain ke Sini'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Mendukung format: PDF Siap Cetak, CDR (Corel), AI, PSD, JPG/PNG (Min. 300 DPI CMYK)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.cdr,.ai,.psd,.jpg,.jpeg,.png,.tiff"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ) : (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Tim desainer TEFA Teknik Grafika akan menghubungi Anda via WhatsApp setelah pemesanan untuk koordinasi konsep desain, materi teks/logo, dan preview revisi sebelum cetak.
                </span>
              </div>
            )}
          </div>

          {/* Step 5: Quantity & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                5. Jumlah Pesanan ({product.unit})
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min={product.minOrder}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.minOrder, Number(e.target.value)))}
                  className="w-full text-center font-bold text-sm text-slate-900 outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Min. order: {product.minOrder} {product.unit}
              </p>
            </div>

            <div className="sm:col-span-7 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Catatan Produksi Khusus (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Warna merah cabe, sisi potong presisi, dsb."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer: Sticky Price Bar & Action Buttons */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">
              Estimasi Subtotal ({quantity} {product.unit}):
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-cyan-400">
                Rp {totalPrice.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (@ Rp {unitPrice.toLocaleString('id-ID')})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>+ Keranjang</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Beli Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
