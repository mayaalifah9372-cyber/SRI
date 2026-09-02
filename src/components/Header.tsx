import React, { useState } from 'react';
import { LogoTEFA } from './LogoTEFA';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Menu, 
  X, 
  Calculator, 
  Layers, 
  Clock, 
  Store, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  FileSpreadsheet,
  HardDrive,
  PhoneCall,
  Sparkles,
  Printer
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery = '',
  setSearchQuery = (_q: string) => {},
}) => {
  const { user, isAuthenticated, isAdmin, isCashier, openAuthModal, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#fdfdfd] border-b-2 border-[#1a1a1a] shadow-xs">
      {/* Top micro-bar with TEFA SMKN 1 Kaligondang identity & CMYK Registration Marks */}
      <div className="bg-[#1a1a1a] text-white text-[11px] py-1.5 px-4 sm:px-6 font-mono border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-[#ffd100]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00a3e0]"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#e4007b]"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#ffd100]"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#1a1a1a] border border-white"></span>
              <span className="ml-1">TEFA TEKNIK GRAFIKA</span>
            </div>
            <span className="hidden md:inline text-neutral-500">//</span>
            <span className="hidden md:inline text-neutral-300 tracking-wide">SMK NEGERI 1 KALIGONDANG</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-sans">
            <div className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors">
              <PhoneCall className="w-3.5 h-3.5 text-[#00a3e0]" />
              <span className="font-mono text-[11px]">CS: 0812-3456-7890</span>
            </div>
            <span className="text-neutral-600">|</span>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px] text-emerald-300">Buka 07.30 - 16.00 WIB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentTab('beranda')} 
            className="cursor-pointer select-none transition-transform active:scale-95"
          >
            <LogoTEFA size="md" />
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kemasan, sablon DTF, stiker, buku, banner..."
                className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-[#f4f4f5] hover:bg-white focus:bg-white text-[#1a1a1a] placeholder:text-[#1a1a1a]/50 rounded-xl border-2 border-[#1a1a1a]/20 focus:border-[#00a3e0] focus:shadow-artistic-sm transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500 hover:text-[#1a1a1a] bg-neutral-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTab('beranda')}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                currentTab === 'beranda'
                  ? 'bg-[#1a1a1a] text-white shadow-artistic-sm'
                  : 'text-[#1a1a1a] hover:bg-neutral-100 hover:text-black'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setCurrentTab('katalog')}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                currentTab === 'katalog'
                  ? 'bg-[#1a1a1a] text-white shadow-artistic-sm'
                  : 'text-[#1a1a1a] hover:bg-neutral-100 hover:text-black'
              }`}
            >
              Katalog
            </button>
            <button
              onClick={() => setCurrentTab('kalkulator')}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                currentTab === 'kalkulator'
                  ? 'bg-[#1a1a1a] text-white shadow-artistic-sm'
                  : 'text-[#1a1a1a] hover:bg-neutral-100 hover:text-black'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-[#ffd100]" />
              Kalkulator
            </button>
            <button
              onClick={() => setCurrentTab('fasilitas')}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                currentTab === 'fasilitas'
                  ? 'bg-[#1a1a1a] text-white shadow-artistic-sm'
                  : 'text-[#1a1a1a] hover:bg-neutral-100 hover:text-black'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#00a3e0]" />
              Fasilitas
            </button>
            <button
              onClick={() => setCurrentTab('status')}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                currentTab === 'status'
                  ? 'bg-[#1a1a1a] text-white shadow-artistic-sm'
                  : 'text-[#1a1a1a] hover:bg-neutral-100 hover:text-black'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#e4007b]" />
              Cek Pesanan
            </button>
          </nav>

          {/* Right Action Icons: Cart, POS Admin Switch, User */}
          <div className="flex items-center gap-2">
            {/* Quick Kasir POS / Admin Switcher */}
            <button
              onClick={() => setCurrentTab('pos')}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                currentTab === 'pos'
                  ? 'bg-[#00a3e0] text-white border-[#1a1a1a] shadow-artistic-sm'
                  : 'bg-[#00a3e0]/10 text-[#0077a8] border-[#00a3e0]/40 hover:bg-[#00a3e0] hover:text-white hover:border-[#1a1a1a]'
              }`}
              title="Kasir POS & Dashboard Admin TEFA"
            >
              <Store className="w-4 h-4" />
              <span>Kasir POS</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-[#1a1a1a] hover:bg-neutral-100 border-2 border-transparent hover:border-[#1a1a1a] rounded-xl transition-all"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e4007b] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Login Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border-2 border-[#1a1a1a] bg-white hover:bg-neutral-50 text-[#1a1a1a] text-xs font-bold shadow-artistic-sm transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-black">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block max-w-[90px] truncate">{user?.name.split(' ')[0]}</span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border-2 border-[#1a1a1a] shadow-artistic py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b-2 border-neutral-100">
                        <p className="text-xs font-black text-[#1a1a1a] truncate">{user?.name}</p>
                        <p className="text-[11px] font-mono text-neutral-500">{user?.phone}</p>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-[#00a3e0]/20 text-[#0077a8] border border-[#00a3e0]/30">
                          {user?.role === 'admin' ? 'Kepala TEFA' : user?.role === 'cashier' ? 'Kasir TEFA' : 'Pelanggan'}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setCurrentTab('status');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-100 flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4 text-[#e4007b]" />
                          Pesanan & Timeline Produksi
                        </button>
                        <button
                          onClick={() => {
                            setCurrentTab('pos');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-100 flex items-center gap-2"
                        >
                          <Store className="w-4 h-4 text-[#00a3e0]" />
                          Kasir POS & Kelola Pesanan
                        </button>
                      </div>

                      <div className="border-t-2 border-neutral-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#e4007b] hover:bg-rose-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Keluar Akun
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a1a1a] hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-artistic-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#ffd100]" />
                  <span>Masuk</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#1a1a1a] hover:bg-neutral-100 rounded-xl border-2 border-[#1a1a1a]/20"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden mt-2.5 pt-2 border-t border-neutral-200">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kemasan, kaos DTF, stiker, buku..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-neutral-100 text-[#1a1a1a] rounded-xl outline-none border-2 border-transparent focus:border-[#00a3e0]"
            />
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t-2 border-[#1a1a1a] flex flex-col gap-1.5 pb-2">
            <button
              onClick={() => {
                setCurrentTab('beranda');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                currentTab === 'beranda' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => {
                setCurrentTab('katalog');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                currentTab === 'katalog' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              Katalog Produk & Jasa Percetakan
            </button>
            <button
              onClick={() => {
                setCurrentTab('kalkulator');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                currentTab === 'kalkulator' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <Calculator className="w-4 h-4 text-[#ffd100]" />
              Kalkulator Harga Cetak
            </button>
            <button
              onClick={() => {
                setCurrentTab('fasilitas');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                currentTab === 'fasilitas' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <Layers className="w-4 h-4 text-[#00a3e0]" />
              Mesin & Fasilitas TEFA
            </button>
            <button
              onClick={() => {
                setCurrentTab('status');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                currentTab === 'status' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <Clock className="w-4 h-4 text-[#e4007b]" />
              Cek Status & Invoice Pesanan
            </button>
            <button
              onClick={() => {
                setCurrentTab('pos');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 bg-[#00a3e0] text-white shadow-artistic-sm`}
            >
              <Store className="w-4 h-4" />
              Buka Kasir POS & Admin TEFA
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

