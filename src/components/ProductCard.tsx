import React from 'react';
import { Product } from '../types';
import { Clock, Star, ArrowUpRight, Sparkles, Layers, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product) => void;
  onSelect?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail, onSelect }) => {
  const handleAction = () => {
    if (onOpenDetail) onOpenDetail(product);
    else if (onSelect) onSelect(product);
  };

  const categoryLabels: Record<string, string> = {
    cetak_offset: 'Cetak Offset',
    digital_printing: 'Digital Printing',
    sablon_dtf: 'Sablon DTF',
    kemasan_packaging: 'Kemasan Box',
    merchandise: 'Merchandise',
    stiker_label: 'Stiker & Label',
    banner_display: 'Banner & Spanduk',
    jasa_desain: 'Jasa Desain Grafis',
  };

  return (
    <div 
      onClick={handleAction}
      className="group relative bg-white rounded-2xl border-2 border-[#1a1a1a] shadow-artistic hover:shadow-artistic-cyan transition-all duration-200 flex flex-col overflow-hidden cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-artistic-sm"
    >
      {/* Product Image Box */}
      <div className="relative aspect-4/3 w-full bg-[#f4f4f5] overflow-hidden border-b-2 border-[#1a1a1a]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 font-mono">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border-2 border-[#1a1a1a] shadow-artistic-sm ${
            product.type === 'jasa' 
              ? 'bg-[#e4007b] text-white' 
              : 'bg-[#1a1a1a] text-white'
          }`}>
            {product.type === 'jasa' ? 'JASA TEFA' : 'BARANG'}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#1a1a1a] border border-[#1a1a1a] shadow-xs">
            {categoryLabels[product.category] || product.category}
          </span>
        </div>

        {/* Lead time badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-[#1a1a1a] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-neutral-700 flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#00a3e0]" />
          <span>{product.leadTimeDays} HARI</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#ffffff]">
        <div>
          {/* Rating and Min Order */}
          <div className="flex items-center justify-between text-xs text-[#1a1a1a] mb-1.5 font-mono">
            <div className="flex items-center gap-1 font-bold">
              <Star className="w-3.5 h-3.5 fill-[#ffd100] text-[#1a1a1a]" />
              <span>{product.rating}</span>
              <span className="text-neutral-400 font-normal">({product.reviewCount})</span>
            </div>
            <span className="text-[11px] font-bold bg-[#ffd100]/30 text-[#1a1a1a] px-2 py-0.5 rounded border border-[#1a1a1a]/20">
              Min. {product.minOrder} {product.unit}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-black text-[#1a1a1a] text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#00a3e0] transition-colors font-display uppercase tracking-tight">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
            {product.shortDesc}
          </p>
        </div>

        {/* Footer: Price & CTA */}
        <div className="pt-3 border-t-2 border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-500 block font-mono font-bold uppercase tracking-wider">Mulai:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-[#1a1a1a] font-mono">
                Rp {product.basePrice.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                /{product.unit}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#00a3e0] hover:bg-[#0092ca] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 border-2 border-[#1a1a1a] shadow-artistic-sm active:shadow-none"
          >
            <span>Kustom</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

