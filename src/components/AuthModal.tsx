import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoTEFA } from './LogoTEFA';
import { 
  X, 
  Phone, 
  User as UserIcon, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Building2, 
  Mail, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    closeAuthModal, 
    login, 
    register, 
    isAuthLoading, 
    authError, 
    clearAuthError 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  
  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regInstitution, setRegInstitution] = useState('Pelanggan Umum');
  const [regAddress, setRegAddress] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Keep internal mode in sync with context
  React.useEffect(() => {
    setMode(authModalMode);
    clearAuthError();
    setValidationError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleTabSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    clearAuthError();
    setValidationError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearAuthError();

    if (!identifier.trim()) {
      setValidationError('Silakan masukkan Username atau Nomor WhatsApp Anda.');
      return;
    }

    if (!loginPassword.trim()) {
      setValidationError('Silakan masukkan Password akun Anda.');
      return;
    }

    await login(identifier.trim(), loginPassword.trim());
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearAuthError();

    if (!regName.trim()) {
      setValidationError('Nama lengkap atau nama bisnis wajib diisi.');
      return;
    }

    if (!regUsername.trim()) {
      setValidationError('Username akun wajib diisi.');
      return;
    }

    if (regUsername.includes(' ')) {
      setValidationError('Username tidak boleh mengandung spasi (gunakan huruf/angka/garis bawah).');
      return;
    }

    if (!regPhone.trim()) {
      setValidationError('Nomor WhatsApp aktif wajib diisi.');
      return;
    }

    if (regPassword.length < 4) {
      setValidationError('Password minimal terdiri dari 4 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setValidationError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    await register({
      username: regUsername.trim().toLowerCase(),
      password: regPassword.trim(),
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      institution: regInstitution,
      address: regAddress.trim(),
      role: 'customer',
    });
  };

  const displayError = validationError || authError;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-[#1a1a1a] overflow-hidden">
        
        {/* Top Header */}
        <div className="p-6 text-center border-b-2 border-[#1a1a1a] bg-neutral-50 relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-200 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <LogoTEFA size="lg" showText={false} className="justify-center mb-3 scale-105" />
          
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#4338ca]/10 text-[#4338ca] text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 border border-[#4338ca]/30">
            <FileSpreadsheet className="w-3 h-3" />
            <span>Database Google Sheet (DB_PENGGUNA)</span>
          </div>

          <h2 className="text-lg font-black uppercase tracking-tight text-[#1a1a1a] font-display">
            {mode === 'login' ? 'Masuk ke Platform SRI TEFA' : 'Registrasi Pengguna Baru'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Teaching Factory Teknik Grafika SMK Negeri 1 Kaligondang
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b-2 border-[#1a1a1a]">
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all ${
              mode === 'login'
                ? 'bg-[#1a1a1a] text-white shadow-xs'
                : 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('register')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all ${
              mode === 'register'
                ? 'bg-[#1a1a1a] text-white shadow-xs'
                : 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Error Notification Alert */}
        {displayError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border-2 border-rose-500 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] font-medium leading-relaxed">
              {displayError}
            </div>
          </div>
        )}

        {/* MODE 1: LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] block mb-1">
                Username / Nomor WhatsApp / Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: admin / kasir / 081234567890"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border-2 border-[#1a1a1a]/20 rounded-xl outline-none focus:border-[#00a3e0] bg-neutral-50 focus:bg-white text-[#1a1a1a]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] block mb-1">
                Password Akun
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password tersimpan di Google Sheet"
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-medium border-2 border-[#1a1a1a]/20 rounded-xl outline-none focus:border-[#00a3e0] bg-neutral-50 focus:bg-white text-[#1a1a1a]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                Akun & hak akses (Admin, Kasir, Pelanggan) diverifikasi langsung ke tabel DB_PENGGUNA.
              </p>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3 rounded-xl bg-[#1a1a1a] hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-artistic-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {isAuthLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi Akun ke Google Sheet...</span>
                </div>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4 text-[#ffd100]" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => handleTabSwitch('register')}
                className="text-xs font-bold text-[#00a3e0] hover:text-[#0077a8] transition-colors"
              >
                Belum memiliki akun? Daftar pengguna baru di sini &rarr;
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] block mb-1">
                Nama Lengkap / Nama Usaha / Sekolah *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Budi Santoso / CV Berkah Grafika"
                  className="w-full pl-10 pr-4 py-2 text-xs font-medium border-2 border-[#1a1a1a]/20 rounded-xl outline-none focus:border-[#00a3e0] bg-neutral-50 focus:bg-white text-[#1a1a1a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] block mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="budisantoso"
                  className="w-full px-3 py-2 text-xs font-mono border-2 border-[#1a1a1a]/20 rounded-xl outline-none focus:border-[#00a3e0] bg-neutral-50 focus:bg-white text-[#1a1a1a]"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] block mb-1">
                  No. WhatsApp Aktif *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full pl-8 pr-3 py-2 text-xs font-medium border-2 border-[#1a1a1a]/20 rounded-xl outline-none focus:border-[#00a3e0] bg-neutral-50 focus:bg-white text-[#1a1a1a]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] block mb-1">
                Email (Opsional untuk Bukti SPK & Invoice)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="budi@example.com"
                  className="w-full pl-10 pr-4 py-2 text-xs font-medium border-2 border-[#1a1a1a]/20 rounded-xl outline-none focus:border-[#00a3e0] bg-neutral-50 focus:bg-white text-[#1a1a1a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full pl-8 pr-8 py-2 text-xs font-medium border-2 border-[#1a1a1a]/20 rounded-xl outline-none focus:border-[#00a3e0] bg-neutral-50 focus:bg-white text-[#1a1a1a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] block mb-1">
                  Ulangi Password *
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password"
                  className="w-full px-3 py-2 text-xs font-medium border-2 border-[#1a1a1a]/20 rounded-xl outline-none focus:border-[#00a3e0] bg-neutral-50 focus:bg-white text-[#1a1a1a]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] block mb-1">
                Kategori Instansi / Tipe Pelanggan
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <select
                  value={regInstitution}
                  onChange={(e) => setRegInstitution(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs font-bold border-2 border-[#1a1a1a]/20 rounded-xl outline-none bg-neutral-50 focus:bg-white focus:border-[#00a3e0] text-[#1a1a1a]"
                >
                  <option value="Pelanggan Umum">Pelanggan Umum / Pribadi</option>
                  <option value="UMKM Makanan / Produk">Pelaku Usaha / UMKM Produk</option>
                  <option value="Sekolah / Kampus">Sekolah / Instansi Pendidikan</option>
                  <option value="Organisasi / OSIS / Komunitas">Organisasi / OSIS / Komunitas</option>
                  <option value="Perusahaan Swasta / Kantor">Perusahaan Swasta / Kantor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] block mb-1">
                Alamat Lengkap Pengiriman (Opsional)
              </label>
              <textarea
                rows={2}
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                placeholder="Jl. Raya Kaligondang No. 12, RT 02/03, Purbalingga..."
                className="w-full p-2.5 text-xs font-medium border-2 border-[#1a1a1a]/20 rounded-xl outline-none focus:border-[#00a3e0] bg-neutral-50 focus:bg-white text-[#1a1a1a] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3 rounded-xl bg-[#1a1a1a] hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-artistic-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAuthLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan Akun ke Google Sheet...</span>
                </div>
              ) : (
                <>
                  <span>Daftarkan Akun ke DB_PENGGUNA</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Database Sync Indicator */}
        <div className="p-3.5 bg-neutral-100 border-t-2 border-[#1a1a1a] text-center text-[10px] text-neutral-600 font-mono flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Google Apps Script DB & Drive CDN Active</span>
        </div>
      </div>
    </div>
  );
};
