import React from 'react';
import { LogoTEFA } from './LogoTEFA';
import { Sparkles, ArrowRight, Calculator, Store, ShieldCheck, Printer, FileText, CheckCircle2 } from 'lucide-react';

interface LandingHeroProps {
  onExploreProducts: () => void;
  onOpenCalculator: () => void;
  onOpenPOS?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onExploreProducts,
  onOpenCalculator,
  onOpenPOS = () => {},
}) => {
  return (
    <section className="relative overflow-hidden bg-[#1a1a1a] text-white pt-8 pb-16 px-4 sm:px-6 border-b-2 border-[#1a1a1a]">
      {/* Decorative Technical Print Grid & Registration Marks */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33333330_1px,transparent_1px),linear-gradient(to_bottom,#33333330_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      
      {/* Editorial Graphic Flares */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#00a3e0]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#e4007b]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-[#ffd100]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Technical Print Header Banner */}
        <div className="flex items-center justify-between border-b border-neutral-700/80 pb-3 mb-8 font-mono text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-[#00a3e0] font-bold">⌖ REG-MK</span>
            <span>//</span>
            <span className="tracking-widest uppercase text-white font-bold">ISO-12647-2 PRINT STANDARD</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-[#00a3e0] font-bold">● CYAN</span>
            <span className="text-[#e4007b] font-bold">● MAGENTA</span>
            <span className="text-[#ffd100] font-bold">● YELLOW</span>
            <span className="text-white font-bold">● KEY/BLACK</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline & Call To Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-neutral-900 border-2 border-neutral-700 text-xs font-mono font-bold text-[#ffd100] shadow-artistic-sm">
              <span className="w-2 h-2 rounded-full bg-[#00a3e0] animate-ping"></span>
              <span>TEFA TEKNIK GRAFIKA // SMKN 1 KALIGONDANG</span>
            </div>

            {/* Main Title */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none font-display">
                <span className="text-[#fdfdfd] underline decoration-[#00a3e0] decoration-4 underline-offset-8">
                  SRI
                </span>
                <span className="block text-2xl sm:text-4xl lg:text-5xl font-black text-neutral-200 mt-2">
                  SENI RANCANG INSPIRASI
                </span>
              </h1>
              
              <div className="inline-block bg-[#e4007b] text-white px-4 py-1.5 rounded-lg font-black text-base sm:text-xl tracking-wider uppercase transform -rotate-1 shadow-artistic-sm">
                “Cetak Kreativitas Wujudkan Inspirasi”
              </div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-medium">
              Platform e-commerce & unit produksi percetakan resmi SMK Negeri 1 Kaligondang. Melayani cetak dus kemasan box, sablon kaos DTF 4-head, stiker cutting label, buku majalah offset, hingga jasa desain grafis profesional berstandar industri.
            </p>

            {/* CTA Action Buttons with Artistic Flair Tactile Style */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onExploreProducts}
                className="px-6 py-3.5 rounded-xl bg-[#00a3e0] hover:bg-[#0092ca] text-white text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-[#1a1a1a] shadow-artistic flex items-center gap-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <span>Lihat Katalog Produk</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenCalculator}
                className="px-5 py-3.5 rounded-xl bg-[#ffd100] hover:bg-[#ebc100] text-[#1a1a1a] border-2 border-[#1a1a1a] text-xs sm:text-sm font-black uppercase tracking-wider shadow-artistic flex items-center gap-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <Calculator className="w-4 h-4 text-[#1a1a1a]" />
                <span>Kalkulator Cetak</span>
              </button>

              <button
                onClick={onOpenPOS}
                className="px-5 py-3.5 rounded-xl bg-[#1a1a1a] hover:bg-neutral-800 text-white border-2 border-neutral-600 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all hover:border-[#00a3e0]"
              >
                <Store className="w-4 h-4 text-[#00a3e0]" />
                <span>Kasir POS Walk-In</span>
              </button>
            </div>

            {/* Key Value Points */}
            <div className="pt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-neutral-800 text-xs text-neutral-300 font-mono">
              <div className="flex items-center gap-2 bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
                <CheckCircle2 className="w-4 h-4 text-[#00a3e0] shrink-0" />
                <span className="font-bold">Bebas Akses Tanpa Login</span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
                <CheckCircle2 className="w-4 h-4 text-[#e4007b] shrink-0" />
                <span className="font-bold">QRIS & Kasir Offline</span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
                <CheckCircle2 className="w-4 h-4 text-[#ffd100] shrink-0" />
                <span className="font-bold">Ekspedisi J&T, JNE, SiCepat</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Graphic Emblem Showcase Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-[#242424] rounded-2xl p-6 border-2 border-[#383838] shadow-artistic">
              {/* Badge Top Header */}
              <div className="flex items-center justify-between border-b-2 border-[#333333] pb-3 mb-5 font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#00a3e0]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#e4007b]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffd100]"></div>
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <span className="text-[11px] font-bold text-neutral-300 tracking-wider">
                  TEFA-GRF // UNIT PRODUKSI
                </span>
              </div>

              {/* Center Logo Display */}
              <div className="flex flex-col items-center text-center py-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00a3e0] to-[#e4007b] rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <LogoTEFA size="xl" showText={false} className="relative z-10 scale-125 my-4" />
                </div>

                <h3 className="text-2xl font-black tracking-wider uppercase text-white font-display mt-2">
                  TEKNIK GRAFIKA
                </h3>
                <p className="text-xs text-[#ffd100] font-mono font-bold tracking-wider uppercase mt-0.5">
                  SMK NEGERI 1 KALIGONDANG
                </p>

                {/* Cloud & Drive Badges */}
                <div className="mt-6 w-full bg-[#171717] rounded-xl p-3.5 border-2 border-neutral-700 text-left space-y-2.5 font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400">Penyimpanan Desain:</span>
                    <span className="font-bold text-[#00a3e0] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00a3e0]"></span>
                      Google Drive HD (PDF/Ori)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400">Database Transaksi:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Google Spreadsheet Real-Time
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400">Sistem Kasir:</span>
                    <span className="font-bold text-[#ffd100] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ffd100]"></span>
                      Dual POS (Online + Offline)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

