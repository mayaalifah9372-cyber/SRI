import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider, useOrders } from './context/OrderContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingHero } from './components/LandingHero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminPOS } from './components/AdminPOS';
import { PriceCalculatorWidget } from './components/PriceCalculatorWidget';
import { TefaFacilitiesSection } from './components/TefaFacilitiesSection';
import { GoogleDriveViewerModal } from './components/GoogleDriveViewerModal';
import { INITIAL_PRODUCTS, PRODUCT_CATEGORIES } from './data/initialData';
import { Product, ProductCategory, Order } from './types';
import { 
  Sparkles, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Layers, 
  CheckCircle2, 
  Package, 
  Store, 
  Phone, 
  FileSpreadsheet, 
  HardDrive,
  Printer
} from 'lucide-react';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'beranda' | 'katalog' | 'kalkulator' | 'fasilitas' | 'pos' | 'status'>('beranda');

  // Product Selection Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Drive Viewer Modal
  const [driveViewerState, setDriveViewerState] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
  }>({
    isOpen: false,
    title: '',
    url: '',
  });

  // Catalog Filtering State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'min_order'>('popular');

  const { setIsCartOpen } = useCart();
  const { user } = useAuth();

  // Filter and sort products
  const filteredProducts = INITIAL_PRODUCTS.filter(product => {
    const matchCat = selectedCategory === 'all' || product.category === selectedCategory;
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === 'price_low') return a.basePrice - b.basePrice;
    if (sortBy === 'price_high') return b.basePrice - a.basePrice;
    if (sortBy === 'min_order') return a.minOrder - b.minOrder;
    return (b.rating || 0) - (a.rating || 0);
  });

  const handleOrderSuccess = (order: Order) => {
    // switch view to tracking timeline
    setCurrentTab('status');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfd] text-[#1a1a1a] font-sans selection:bg-[#00a3e0] selection:text-white">
      {/* Universal Header Navigation */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Tab Views */}
      <main className="flex-1">
        {/* TAB 1: BERANDA / LANDING PAGE */}
        {currentTab === 'beranda' && (
          <div className="space-y-12 pb-16">
            {/* Hero Section */}
            <LandingHero
              onExploreProducts={() => setCurrentTab('katalog')}
              onOpenCalculator={() => setCurrentTab('kalkulator')}
              onOpenPOS={() => setCurrentTab('pos')}
            />

            {/* Quick Category Shortcut Pills */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#1a1a1a] shadow-artistic space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-neutral-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#ffd100] text-[#1a1a1a] px-2 py-0.5 rounded border border-[#1a1a1a]">
                        UNIT PRODUKSI TEFA
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#1a1a1a] font-display">
                      Kategori Produk & Jasa Percetakan
                    </h3>
                    <p className="text-xs text-neutral-600 font-medium">
                      Layanan cetak terstandarisasi untuk UMKM, Sekolah, Dinas, Komunitas, dan Umum
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('katalog')}
                    className="text-xs font-black uppercase tracking-wider text-[#00a3e0] hover:text-[#0077a8] self-start sm:self-center flex items-center gap-1 group"
                  >
                    <span>Lihat Semua Produk</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  {PRODUCT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentTab('katalog');
                      }}
                      className="p-4 rounded-xl bg-[#fafafa] hover:bg-[#00a3e0]/10 hover:border-[#00a3e0] border-2 border-[#1a1a1a]/20 hover:shadow-artistic-sm transition-all text-center group flex flex-col items-center justify-center space-y-2 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] group-hover:text-[#0077a8] leading-tight">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Products Showcase */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#1a1a1a] pb-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#e4007b] text-white text-[11px] font-mono font-black uppercase tracking-wider mb-1 border border-[#1a1a1a]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PRODUK UNGGULAN TEFA TERLARIS</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#1a1a1a] font-display">
                    Karya Siswa Berstandar Industri
                  </h3>
                </div>

                <button
                  onClick={() => setCurrentTab('katalog')}
                  className="px-4 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 self-start sm:self-center shadow-artistic-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Buka Seluruh Katalog ({INITIAL_PRODUCTS.length} Item) &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {INITIAL_PRODUCTS.slice(0, 4).map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetail={setSelectedProduct}
                  />
                ))}
              </div>
            </div>

            {/* Price Calculator Widget Preview on Landing */}
            <PriceCalculatorWidget
              onSelectProductForOrder={(product) => {
                setSelectedProduct(product);
              }}
            />

            {/* Workshop & Facilities Section */}
            <TefaFacilitiesSection />
          </div>
        )}

        {/* TAB 2: KATALOG LENGKAP PRODUK */}
        {currentTab === 'katalog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Catalog Banner & Header */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 text-white border-2 border-[#1a1a1a] shadow-artistic flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#00a3e0]/20 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#ffd100] text-[#1a1a1a] font-mono text-[10px] font-black uppercase tracking-wider">
                  KATALOG RESMI TEACHING FACTORY
                </div>
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-display">
                  Semua Produk & Jasa Percetakan
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-medium">
                  Bebas kustomisasi bahan, gramatur kertas, finishing, ukuran, dan upload file desain langsung ke Google Drive TEFA.
                </p>
              </div>

              <div className="bg-[#262626] p-4 rounded-xl border-2 border-neutral-700 text-xs text-neutral-300 space-y-1 font-mono relative z-10 shrink-0">
                <div className="flex items-center gap-1.5 text-emerald-400 font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>JAMINAN LOLOS PRE-FLIGHT 300 DPI</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Pembayaran fleksibel via QRIS, Tunai Kasir, & Transfer Bank.
                </p>
              </div>
            </div>

            {/* Search, Category Filter, and Sort Toolbar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#1a1a1a] shadow-artistic-sm space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari dus, stiker, kaos, banner, nota..."
                    className="w-full pl-10 pr-4 py-2 text-xs font-semibold border-2 border-[#1a1a1a]/20 rounded-xl outline-none focus:border-[#00a3e0] bg-neutral-50 focus:bg-white text-[#1a1a1a]"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <span className="text-xs text-neutral-600 font-black uppercase tracking-wider flex items-center gap-1 font-mono">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#00a3e0]" />
                    Urutkan:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 text-xs bg-neutral-50 border-2 border-[#1a1a1a]/20 rounded-xl font-bold outline-none focus:border-[#00a3e0] text-[#1a1a1a]"
                  >
                    <option value="popular">Paling Populer (Rating)</option>
                    <option value="price_low">Harga: Rendah ke Tinggi</option>
                    <option value="price_high">Harga: Tinggi ke Rendah</option>
                    <option value="min_order">Minimal Order Terkecil</option>
                  </select>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 border-[#1a1a1a] cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#1a1a1a] text-white shadow-artistic-sm'
                      : 'bg-neutral-100 text-[#1a1a1a] hover:bg-neutral-200'
                  }`}
                >
                  Semua ({INITIAL_PRODUCTS.length})
                </button>

                {PRODUCT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 transition-all border-2 border-[#1a1a1a] cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#00a3e0] text-white shadow-artistic-sm'
                        : 'bg-neutral-100 text-[#1a1a1a] hover:bg-neutral-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-[#1a1a1a] shadow-artistic space-y-3">
                <Package className="w-12 h-12 text-neutral-400 mx-auto" />
                <h3 className="font-black text-[#1a1a1a] text-base uppercase tracking-tight">Tidak Ada Produk Sesuai Pencarian</h3>
                <p className="text-xs text-neutral-600">
                  Coba gunakan kata kunci lain atau pilih kategori 'Semua'.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-artistic-sm"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetail={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: KALKULATOR HARGA */}
        {currentTab === 'kalkulator' && (
          <div className="py-8">
            <PriceCalculatorWidget
              onSelectProductForOrder={(product) => {
                setSelectedProduct(product);
              }}
            />
          </div>
        )}

        {/* TAB 4: FASILITAS MESIN TEFA */}
        {currentTab === 'fasilitas' && (
          <div className="py-6">
            <TefaFacilitiesSection />
          </div>
        )}

        {/* TAB 5: KASIR POS & ADMIN MANAGEMENT */}
        {currentTab === 'pos' && (
          <AdminPOS
            onOpenDriveViewer={(docUrl, title) => {
              setDriveViewerState({
                isOpen: true,
                title,
                url: docUrl,
              });
            }}
          />
        )}

        {/* TAB 6: STATUS PESANAN PELANGGAN */}
        {currentTab === 'status' && (
          <CustomerDashboard
            onOpenDriveViewer={(docUrl, title) => {
              setDriveViewerState({
                isOpen: true,
                title,
                url: docUrl,
              });
            }}
            onExploreProducts={() => setCurrentTab('katalog')}
          />
        )}
      </main>

      {/* Product Customization & Order Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenCheckout={() => {
            setSelectedProduct(null);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Cart Drawer Slide-over */}
      <CartDrawer
        onOpenCheckout={() => {
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout & Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Authentication (Login / Register / Demo) Modal */}
      <AuthModal />

      {/* Google Drive Document Viewer Modal */}
      <GoogleDriveViewerModal
        isOpen={driveViewerState.isOpen}
        onClose={() => setDriveViewerState({ isOpen: false, title: '', url: '' })}
        documentTitle={driveViewerState.title}
        documentUrl={driveViewerState.url}
      />

      {/* Universal Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <MainContent />
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}
