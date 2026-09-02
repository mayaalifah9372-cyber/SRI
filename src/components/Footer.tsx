import React from 'react';
import { LogoTEFA } from './LogoTEFA';
import { MapPin, Phone, Mail, Clock, CheckCircle2, Shield, HeartHandshake, FileSpreadsheet, HardDrive, Smartphone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#141414] text-neutral-400 text-xs border-t-2 border-[#1a1a1a]">
      {/* Brand & USP Bar */}
      <div className="border-b-2 border-neutral-800 bg-[#1a1a1a] py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#00a3e0] text-white border-2 border-[#1a1a1a] shadow-artistic-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase font-display tracking-tight">Standar Industri ISO</h4>
              <p className="text-neutral-400 text-xs mt-0.5 font-medium">Dikerjakan mesin offset & digital presisi tinggi bimbingan instruktur ahli.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#ffd100] text-[#1a1a1a] border-2 border-[#1a1a1a] shadow-artistic-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase font-display tracking-tight">Harga Grosir TEFA</h4>
              <p className="text-neutral-400 text-xs mt-0.5 font-medium">Biaya produksi kompetitif untuk UMKM, instansi, dan masyarakat umum.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#e4007b] text-white border-2 border-[#1a1a1a] shadow-artistic-sm">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase font-display tracking-tight">Drive & Cloud HD</h4>
              <p className="text-neutral-400 text-xs mt-0.5 font-medium">File desain tersimpan aman dalam Google Drive asli & sinkron Spreadsheet.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white border-2 border-[#1a1a1a] shadow-artistic-sm">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase font-display tracking-tight">Kasir Dual Mode</h4>
              <p className="text-neutral-400 text-xs mt-0.5 font-medium">Pesan via web dikirim ekspedisi atau bayar langsung di kasir workshop.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <LogoTEFA size="lg" />
            <p className="text-neutral-400 text-xs leading-relaxed font-medium">
              <strong className="text-[#ffd100] font-black uppercase font-mono tracking-wider">“Cetak Kreativitas Wujudkan Inspirasi”</strong>
              <br />
              Platform E-Commerce & Unit Produksi Teaching Factory (TEFA) Kompetensi Keahlian Teknik Grafika SMK Negeri 1 Kaligondang.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 font-mono">
              <span className="text-[11px] font-bold text-white bg-neutral-800 px-2.5 py-1 rounded border border-neutral-700">
                PWA Smartphone Ready
              </span>
              <span className="text-[11px] font-bold text-[#ffd100] bg-neutral-800 px-2.5 py-1 rounded border border-neutral-700">
                NPSN: 20303123
              </span>
            </div>
          </div>

          {/* Col 2: Workshop Location & Contact */}
          <div className="space-y-3 font-mono">
            <h3 className="text-white font-black text-xs uppercase tracking-widest text-[#00a3e0]">
              // WORKSHOP TEFA GRAFIKA
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#00a3e0] shrink-0 mt-0.5" />
                <span className="font-sans">Jl. Raya Kaligondang, Kec. Kaligondang, Kabupaten Purbalingga, Jawa Tengah 53391</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#00a3e0] shrink-0" />
                <span>CS WA: 0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#00a3e0] shrink-0" />
                <span>tefa.grafika@smkn1kaligondang.sch.id</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#00a3e0] shrink-0" />
                <span>Senin - Jumat: 07.30 - 16.00 WIB</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan & Produk TEFA */}
          <div className="space-y-3 font-mono">
            <h3 className="text-white font-black text-xs uppercase tracking-widest text-[#e4007b]">
              // DIVISI LAYANAN CETAK
            </h3>
            <ul className="space-y-1.5 text-xs text-neutral-400 font-sans">
              <li className="hover:text-white transition-colors">• Cetak Dus Kemasan & Box Makanan (Foodgrade)</li>
              <li className="hover:text-white transition-colors">• Cetak Stiker Vinyl & Cromo (Kiss/Die Cut)</li>
              <li className="hover:text-white transition-colors">• Sablon Kaos & Jersey DTF 4-Head High-Res</li>
              <li className="hover:text-white transition-colors">• Cetak Buku, Majalah, Modul & Buku Tahunan</li>
              <li className="hover:text-white transition-colors">• Brosur, Flyer, Undangan & Sertifikat</li>
              <li className="hover:text-white transition-colors">• Spanduk Banner Outdoor & Roll-Up Display</li>
              <li className="hover:text-white transition-colors">• Jasa Desain Grafis & Setting Plat CTP</li>
            </ul>
          </div>

          {/* Col 4: Pembayaran & Kurir */}
          <div className="space-y-4 font-mono">
            <div>
              <h3 className="text-white font-black text-xs uppercase tracking-widest text-[#ffd100] mb-2">
                // PEMBAYARAN
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-[#00a3e0] px-2 py-1 rounded text-white font-black text-[10px] border border-[#1a1a1a]">QRIS</span>
                <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-200 text-[10px] border border-neutral-700">Cash / Kasir POS</span>
                <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-200 text-[10px] border border-neutral-700">Transfer Bank</span>
              </div>
            </div>

            <div>
              <h3 className="text-white font-black text-xs uppercase tracking-widest text-[#ffd100] mb-2">
                // EKSPEDISI & LOGISTIK
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-200 text-[10px] border border-neutral-700">J&T Express</span>
                <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-200 text-[10px] border border-neutral-700">JNE Express</span>
                <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-200 text-[10px] border border-neutral-700">SiCepat</span>
                <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-200 text-[10px] border border-neutral-700">Pos Indonesia</span>
                <span className="bg-[#e4007b]/30 text-[#e4007b] font-bold px-2 py-1 rounded text-[10px] border border-[#e4007b]/40">Ambil di Workshop</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t-2 border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500 font-mono">
          <p>© {new Date().getFullYear()} SRI (Seni Rancang Inspirasi) - TEFA Teknik Grafika SMKN 1 Kaligondang.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#00a3e0]">Google Spreadsheet DB</span>
            <span>•</span>
            <span className="text-[#ffd100]">Google Drive HD Storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

