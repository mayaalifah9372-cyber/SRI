import React, { useState } from 'react';
import { Calculator, Sparkles, ArrowRight, Layers, FileCheck } from 'lucide-react';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';

interface PriceCalculatorWidgetProps {
  onSelectProductForOrder: (product: Product) => void;
}

export const PriceCalculatorWidget: React.FC<PriceCalculatorWidgetProps> = ({ onSelectProductForOrder }) => {
  const [calcType, setCalcType] = useState<'kemasan' | 'brosur' | 'kaos' | 'stiker' | 'banner'>('kemasan');

  // Kemasan State
  const [boxMaterial, setBoxMaterial] = useState('ivory-300');
  const [boxQty, setBoxQty] = useState(500);
  const [boxFinishing, setBoxFinishing] = useState({ lamDoff: true, polyGold: false, spotUv: false });

  // Brosur State
  const [brosurSize, setBrosurSize] = useState('A5');
  const [brosurPaper, setBrosurPaper] = useState('AP 150gsm');
  const [brosurQty, setBrosurQty] = useState(1000);

  // Kaos State
  const [kaosQty, setKaosQty] = useState(24);
  const [kaosSides, setKaosSides] = useState<'1_sisi' | '2_sisi'>('1_sisi');

  // Stiker State
  const [stikerQtyA3, setStikerQtyA3] = useState(10);
  const [stikerType, setStikerType] = useState('Vinyl Waterproof');

  // Banner State
  const [bannerWidthM, setBannerWidthM] = useState(3);
  const [bannerHeightM, setBannerHeightM] = useState(1);
  const [bannerMaterial, setBannerMaterial] = useState('Flexi 280g');

  // Compute Prices
  const computePrice = () => {
    switch (calcType) {
      case 'kemasan': {
        let base = boxMaterial === 'ivory-300' ? 1450 : boxMaterial === 'kraft' ? 1250 : 1100;
        if (boxFinishing.lamDoff) base += 150;
        if (boxFinishing.polyGold) base += 350;
        if (boxFinishing.spotUv) base += 300;
        return {
          unitPrice: base,
          total: base * boxQty,
          product: INITIAL_PRODUCTS[0],
        };
      }
      case 'brosur': {
        let base = brosurSize === 'A4' ? 650 : 350;
        if (brosurPaper === 'AP 150gsm') base += 100;
        return {
          unitPrice: base,
          total: base * brosurQty,
          product: INITIAL_PRODUCTS[3],
        };
      }
      case 'kaos': {
        let base = 45000;
        if (kaosSides === '2_sisi') base += 18000;
        return {
          unitPrice: base,
          total: base * kaosQty,
          product: INITIAL_PRODUCTS[2],
        };
      }
      case 'stiker': {
        let base = stikerType.includes('Vinyl') ? 8500 : 6500;
        return {
          unitPrice: base,
          total: base * stikerQtyA3,
          product: INITIAL_PRODUCTS[1],
        };
      }
      case 'banner': {
        const area = bannerWidthM * bannerHeightM;
        const ratePerM2 = bannerMaterial.includes('Korea') ? 30000 : 18000;
        const total = area * ratePerM2;
        return {
          unitPrice: total,
          total,
          product: INITIAL_PRODUCTS[5],
        };
      }
    }
  };

  const result = computePrice();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#ffd100] text-[#1a1a1a] text-xs font-mono font-black uppercase tracking-wider border-2 border-[#1a1a1a] shadow-artistic-sm">
          <Calculator className="w-3.5 h-3.5" />
          <span>SIMULASI BIAYA CETAK REAL-TIME</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#1a1a1a] font-display">
          Kalkulator Estimasi Biaya TEFA
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto font-medium">
          Hitung anggaran cetak transparan dengan parameter gramatur, finishing, dimensi, dan volume cetak.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border-2 border-[#1a1a1a] shadow-artistic overflow-hidden">
        {/* Top Type Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-5 border-b-2 border-[#1a1a1a] bg-[#fafafa]">
          <button
            onClick={() => setCalcType('kemasan')}
            className={`py-3.5 px-2 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
              calcType === 'kemasan' ? 'bg-[#00a3e0] text-white border-r-2 border-b-0 border-[#1a1a1a]' : 'text-neutral-600 hover:text-neutral-900 border-r border-[#1a1a1a]/20'
            }`}
          >
            Dus Kemasan
          </button>
          <button
            onClick={() => setCalcType('brosur')}
            className={`py-3.5 px-2 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
              calcType === 'brosur' ? 'bg-[#00a3e0] text-white border-r-2 border-b-0 border-[#1a1a1a]' : 'text-neutral-600 hover:text-neutral-900 border-r border-[#1a1a1a]/20'
            }`}
          >
            Brosur Flyer
          </button>
          <button
            onClick={() => setCalcType('kaos')}
            className={`py-3.5 px-2 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
              calcType === 'kaos' ? 'bg-[#00a3e0] text-white border-r-2 border-b-0 border-[#1a1a1a]' : 'text-neutral-600 hover:text-neutral-900 border-r border-[#1a1a1a]/20'
            }`}
          >
            Sablon DTF
          </button>
          <button
            onClick={() => setCalcType('stiker')}
            className={`py-3.5 px-2 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
              calcType === 'stiker' ? 'bg-[#00a3e0] text-white border-r-2 border-b-0 border-[#1a1a1a]' : 'text-neutral-600 hover:text-neutral-900 border-r border-[#1a1a1a]/20'
            }`}
          >
            Stiker A3+
          </button>
          <button
            onClick={() => setCalcType('banner')}
            className={`py-3.5 px-2 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
              calcType === 'banner' ? 'bg-[#00a3e0] text-white border-b-0 border-[#1a1a1a]' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Banner Flexi
          </button>
        </div>

        {/* Form Body & Output */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Controls Left */}
          <div className="md:col-span-7 space-y-4 text-xs font-sans">
            {calcType === 'kemasan' && (
              <>
                <div>
                  <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1.5">Bahan Kertas Kemasan:</label>
                  <select
                    value={boxMaterial}
                    onChange={(e) => setBoxMaterial(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border-2 border-[#1a1a1a] rounded-xl font-bold outline-none focus:border-[#00a3e0] text-[#1a1a1a]"
                  >
                    <option value="ivory-300">Ivory 300 gsm (Tebal Premium Putih Bersih)</option>
                    <option value="duplex">Duplex 310 gsm (Luar Putih Dalam Abu-abu)</option>
                    <option value="kraft">Kraft Cokelat Eco 275 gsm (Vintage)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block">Jumlah Dus ({boxQty} pcs):</label>
                    <span className="font-mono font-bold text-[#00a3e0] bg-[#00a3e0]/10 px-2 py-0.5 rounded border border-[#00a3e0]/30">{boxQty} PCS</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="50"
                    value={boxQty}
                    onChange={(e) => setBoxQty(Number(e.target.value))}
                    className="w-full accent-[#00a3e0]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>100 pcs</span>
                    <span>2.500 pcs</span>
                    <span>5.000 pcs</span>
                  </div>
                </div>

                <div>
                  <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1.5">Pilihan Finishing:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setBoxFinishing(f => ({ ...f, lamDoff: !f.lamDoff }))}
                      className={`px-3 py-1.5 rounded-lg border-2 font-mono font-bold text-xs cursor-pointer transition-all ${
                        boxFinishing.lamDoff ? 'bg-[#00a3e0] border-[#1a1a1a] text-white shadow-artistic-sm' : 'bg-white border-[#1a1a1a]/30 text-neutral-700'
                      }`}
                    >
                      ✓ Laminasi Doff (+150)
                    </button>
                    <button
                      onClick={() => setBoxFinishing(f => ({ ...f, polyGold: !f.polyGold }))}
                      className={`px-3 py-1.5 rounded-lg border-2 font-mono font-bold text-xs cursor-pointer transition-all ${
                        boxFinishing.polyGold ? 'bg-[#ffd100] border-[#1a1a1a] text-[#1a1a1a] shadow-artistic-sm' : 'bg-white border-[#1a1a1a]/30 text-neutral-700'
                      }`}
                    >
                      + Poly Emas (+350)
                    </button>
                    <button
                      onClick={() => setBoxFinishing(f => ({ ...f, spotUv: !f.spotUv }))}
                      className={`px-3 py-1.5 rounded-lg border-2 font-mono font-bold text-xs cursor-pointer transition-all ${
                        boxFinishing.spotUv ? 'bg-[#e4007b] border-[#1a1a1a] text-white shadow-artistic-sm' : 'bg-white border-[#1a1a1a]/30 text-neutral-700'
                      }`}
                    >
                      + Spot UV (+300)
                    </button>
                  </div>
                </div>
              </>
            )}

            {calcType === 'brosur' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1">Ukuran Brosur:</label>
                    <select
                      value={brosurSize}
                      onChange={(e) => setBrosurSize(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border-2 border-[#1a1a1a] rounded-xl font-bold outline-none text-[#1a1a1a]"
                    >
                      <option value="A5">A5 (14.8 x 21 cm)</option>
                      <option value="A4">A4 (21 x 29.7 cm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1">Kertas:</label>
                    <select
                      value={brosurPaper}
                      onChange={(e) => setBrosurPaper(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border-2 border-[#1a1a1a] rounded-xl font-bold outline-none text-[#1a1a1a]"
                    >
                      <option value="AP 120gsm">Art Paper 120 gsm</option>
                      <option value="AP 150gsm">Art Paper 150 gsm</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block">Kuantitas Brosur ({brosurQty} lembar):</label>
                    <span className="font-mono font-bold text-[#00a3e0] bg-[#00a3e0]/10 px-2 py-0.5 rounded border border-[#00a3e0]/30">{brosurQty} LBR</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={brosurQty}
                    onChange={(e) => setBrosurQty(Number(e.target.value))}
                    className="w-full accent-[#00a3e0]"
                  />
                </div>
              </>
            )}

            {calcType === 'kaos' && (
              <>
                <div>
                  <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1">Sisi Cetak Sablon DTF:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setKaosSides('1_sisi')}
                      className={`p-2.5 rounded-xl border-2 font-mono font-black uppercase tracking-wider cursor-pointer ${
                        kaosSides === '1_sisi' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-artistic-sm' : 'bg-neutral-50 border-[#1a1a1a]/30'
                      }`}
                    >
                      1 Sisi Depan
                    </button>
                    <button
                      onClick={() => setKaosSides('2_sisi')}
                      className={`p-2.5 rounded-xl border-2 font-mono font-black uppercase tracking-wider cursor-pointer ${
                        kaosSides === '2_sisi' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-artistic-sm' : 'bg-neutral-50 border-[#1a1a1a]/30'
                      }`}
                    >
                      2 Sisi (Depan & Belakang)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1">Jumlah Kaos ({kaosQty} pcs):</label>
                  <input
                    type="number"
                    min="1"
                    value={kaosQty}
                    onChange={(e) => setKaosQty(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 bg-neutral-50 border-2 border-[#1a1a1a] rounded-xl font-mono font-bold text-[#1a1a1a]"
                  />
                </div>
              </>
            )}

            {calcType === 'stiker' && (
              <>
                <div>
                  <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1">Jenis Bahan Stiker:</label>
                  <select
                    value={stikerType}
                    onChange={(e) => setStikerType(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border-2 border-[#1a1a1a] rounded-xl font-bold text-[#1a1a1a]"
                  >
                    <option value="Vinyl Waterproof">Vinyl Waterproof Glossy (Anti Air)</option>
                    <option value="Cromo Kertas">Cromo Kertas Label Ekonomis</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1">Jumlah Lembar A3+ ({stikerQtyA3} lembar):</label>
                  <input
                    type="number"
                    min="3"
                    value={stikerQtyA3}
                    onChange={(e) => setStikerQtyA3(Math.max(3, Number(e.target.value)))}
                    className="w-full p-2.5 bg-neutral-50 border-2 border-[#1a1a1a] rounded-xl font-mono font-bold text-[#1a1a1a]"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block font-mono">
                    *1 lembar A3+ muat puluhan stiker label (tergantung ukuran potong).
                  </span>
                </div>
              </>
            )}

            {calcType === 'banner' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1">Lebar (Meter):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={bannerWidthM}
                      onChange={(e) => setBannerWidthM(Number(e.target.value))}
                      className="w-full p-2 bg-neutral-50 border-2 border-[#1a1a1a] rounded-xl font-mono font-bold text-[#1a1a1a]"
                    />
                  </div>
                  <div>
                    <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1">Tinggi (Meter):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={bannerHeightM}
                      onChange={(e) => setBannerHeightM(Number(e.target.value))}
                      className="w-full p-2 bg-neutral-50 border-2 border-[#1a1a1a] rounded-xl font-mono font-bold text-[#1a1a1a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono font-black text-neutral-800 uppercase tracking-wider block mb-1">Jenis Bahan Flexi:</label>
                  <select
                    value={bannerMaterial}
                    onChange={(e) => setBannerMaterial(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border-2 border-[#1a1a1a] rounded-xl font-bold text-[#1a1a1a]"
                  >
                    <option value="Flexi 280g">Flexi Standar 280g (Ekonomis)</option>
                    <option value="Flexi Korea 440g">Flexi Korea 440g (Tebal & Tahan Lama)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Price Output Box Right */}
          <div className="md:col-span-5 bg-[#1a1a1a] text-white rounded-2xl p-6 space-y-4 border-2 border-[#1a1a1a] shadow-artistic">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#ffd100] tracking-widest block">
                // ESTIMASI BIAYA PRODUKSI TEFA:
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1 font-mono tracking-tight">
                Rp {result.total.toLocaleString('id-ID')}
              </div>
              <span className="text-xs text-neutral-400 font-mono block mt-0.5">
                (@ Rp {Math.round(result.unitPrice).toLocaleString('id-ID')} / satuan)
              </span>
            </div>

            <div className="p-3.5 bg-[#262626] rounded-xl border-2 border-neutral-700 text-xs space-y-1 text-neutral-300 font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <FileCheck className="w-4 h-4" />
                <span>TERMASUK QUALITY CONTROL TEFA</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Penyimpanan file desain terhubung otomatis ke Google Drive resmi.
              </p>
            </div>

            <button
              onClick={() => onSelectProductForOrder(result.product)}
              className="w-full py-3.5 bg-[#00a3e0] hover:bg-[#0092ca] text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border-2 border-[#1a1a1a] shadow-artistic transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <span>Pesan dengan Spesifikasi Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
