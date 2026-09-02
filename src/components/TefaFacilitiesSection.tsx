import React from 'react';
import { Layers, ShieldCheck, Cpu, Award, CheckCircle2, Factory, Sparkles } from 'lucide-react';

export const TefaFacilitiesSection: React.FC = () => {
  const facilities = [
    {
      title: 'Mesin Cetak Offset 4 Warna (Heidelberg Speedmaster)',
      category: 'Divisi Cetak Offset Komersial',
      description: 'Kecepatan hingga 10.000 lembar per jam dengan registrasi warna presisi mikron. Mampu memproduksi ratusan ribu dus kemasan, buku, majalah, dan kalender secara konsisten.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      specs: ['Area cetak max: 52 x 74 cm', 'Raster hingga 2400 DPI', 'Sistem tinta otomatis'],
      accentColor: '#00a3e0',
    },
    {
      title: 'Digital Production Press A3+ High-Speed',
      category: 'Divisi Digital Printing Kilat',
      description: 'Cocok untuk cetak satuan hingga ribuan tanpa biaya plat film. Menghasilkan warna cemerlang pada kertas Art Carton, Linen, Stiker Vinyl, dan Fancy Paper.',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      specs: ['Resolusi 2400 x 2400 DPI', 'Dukungan kertas 60 - 350 gsm', 'Warna stabil ISO 12647-2'],
      accentColor: '#e4007b',
    },
    {
      title: 'Mesin Sablon DTF 4-Head High Resolution',
      category: 'Divisi Sablon Garmen & Tekstil',
      description: 'Mesin DTF (Direct to Film) dengan print head ganda i3200 menghasilkan transfer film yang lentur, warna gradasi tajam, dan daya rekat sangat kuat setelah di-press.',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      specs: ['Tinta CMYK + White Flawless', 'Bubuk perekat powder oven merata', 'Kapasitas 100+ kaos / hari'],
      accentColor: '#ffd100',
    },
    {
      title: 'Mesin Pond (Die-Cut) & Hot Stamping Poly Emas',
      category: 'Divisi Finishing & Kemasan Box',
      description: 'Pemotongan pola lipatan dus box makanan dan kosmetik presisi tinggi, serta penambahan efek foil emas/perak mewah pada sertifikat dan undangan.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      specs: ['Presisi pisau pond 0.1 mm', 'Pemanas poly stamping digital', 'Hasil lipatan siku rapi'],
      accentColor: '#1a1a1a',
    },
    {
      title: 'Mesin Cutting Plotter Roland & Mimaki',
      category: 'Divisi Stiker & Label Labeling',
      description: 'Memotong stiker vinyl lembaran A3+ menjadi kiss-cut (tinggal kelet) atau die-cut (potong putus per biji) sesuai bentuk lekukan desain Anda.',
      image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&auto=format&fit=crop&q=80',
      specs: ['Optical sensor auto-contour', 'Kecepatan cutting tinggi', 'Support vinyl reflektif & hologram'],
      accentColor: '#00a3e0',
    },
    {
      title: 'Mesin Jilid Lem Panas (Perfect Binding Horison)',
      category: 'Divisi Penjilidan Buku & Majalah',
      description: 'Menjilid buku tebal, buku tahunan sekolah, modul ajar kurikulum merdeka dengan lem perekat panas kuat yang tidak mudah copot walau dibuka 180 derajat.',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      specs: ['Ketebalan buku hingga 5 cm', 'Pemotong 3 sisi otomatis', 'Kerapian standar toko buku'],
      accentColor: '#e4007b',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#00a3e0] text-white text-xs font-mono font-black uppercase tracking-wider border-2 border-[#1a1a1a] shadow-artistic-sm">
          <Factory className="w-3.5 h-3.5" />
          <span>FASILITAS WORKSHOP & PRODUKSI TEFA</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#1a1a1a] font-display">
          Peralatan Standar Industri SMKN 1 Kaligondang
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
          Kombinasi teknologi mesin industri offset, DTF, dan digital printing modern dengan supervisi instruktur profesional menjamin kualitas terbaik pada setiap lembar pesanan Anda.
        </p>
      </div>

      {/* Grid of machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((fac, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border-2 border-[#1a1a1a] shadow-artistic hover:shadow-artistic-cyan transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100 border-b-2 border-[#1a1a1a]">
                <img
                  src={fac.image}
                  alt={fac.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded border border-neutral-600 shadow-sm">
                  {fac.category}
                </span>
              </div>

              <div className="p-5 space-y-2.5">
                <h3 className="font-black text-[#1a1a1a] text-base leading-snug uppercase font-display tracking-tight">
                  {fac.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  {fac.description}
                </p>

                <div className="pt-2 space-y-1.5 font-mono">
                  {fac.specs.map((sp, sidx) => (
                    <div key={sidx} className="flex items-center gap-2 text-[11px] text-[#1a1a1a] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00a3e0] shrink-0" />
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="p-2.5 bg-neutral-50 rounded-xl border-2 border-neutral-200 text-[10px] text-neutral-600 font-mono font-bold flex items-center justify-between">
                <span>STATUS MESIN:</span>
                <span className="text-emerald-600 font-black flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  READY RUNNING PRODUKSI
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

