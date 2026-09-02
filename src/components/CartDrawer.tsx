import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, HardDrive } from 'lucide-react';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();

  if (!isCartOpen) return null;

  const handleProceedCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal('login', () => {
        setIsCartOpen(false);
        onOpenCheckout();
      });
      return;
    }
    setIsCartOpen(false);
    onOpenCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Cart Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-600" />
            <h2 className="font-bold text-slate-900 text-base">Keranjang Belanja TEFA</h2>
            <span className="text-xs bg-slate-200 font-bold px-2 py-0.5 rounded-full text-slate-700">
              {itemCount}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Drawer Items List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-slate-700 text-sm">Keranjang Anda Masih Kosong</p>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih produk barang atau jasa percetakan TEFA untuk mulai memesan.
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2.5">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-cyan-700">
                        Rp {item.unitPrice.toLocaleString('id-ID')} / {item.product.unit}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Specs pill badges */}
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  {item.specs.material && (
                    <div className="truncate">
                      <span className="font-medium text-slate-500">Bahan:</span> {item.specs.material}
                    </div>
                  )}
                  {item.specs.size && (
                    <div>
                      <span className="font-medium text-slate-500">Ukuran:</span> {item.specs.size}
                    </div>
                  )}
                  {item.specs.finishings && item.specs.finishings.length > 0 && (
                    <div>
                      <span className="font-medium text-slate-500">Finishing:</span> {item.specs.finishings.join(', ')}
                    </div>
                  )}
                  {item.specs.designFile && (
                    <div className="text-emerald-700 flex items-center gap-1 font-semibold">
                      <HardDrive className="w-3 h-3" />
                      <span className="truncate">Drive: {item.specs.designFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Quantity Controls & Item Subtotal */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Total Pesanan ({itemCount} item):</span>
              <span className="text-base font-extrabold text-slate-900">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearCart}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
              >
                Kosongkan
              </button>
              <button
                onClick={handleProceedCheckout}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Lanjut Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transaksi Resmi TEFA SMKN 1 Kaligondang</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
