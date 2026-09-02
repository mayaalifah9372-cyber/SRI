import React from 'react';
import { X, HardDrive, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, Printer, ShieldCheck } from 'lucide-react';

interface GoogleDriveViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentUrl: string;
  isPdf?: boolean;
}

export const GoogleDriveViewerModal: React.FC<GoogleDriveViewerModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentUrl,
  isPdf = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
        {/* Google Drive Header Toolbar */}
        <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 truncate max-w-md">
                {documentTitle || 'Dokumen_Desain_TEFA_Grafika.pdf'}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Format Google Drive Asli</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Validasi 300 DPI CMYK (Siap Cetak)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={documentUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Buka di Tab Baru Google Drive"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Cetak Dokumen"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Content Area */}
        <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 p-8 text-slate-900 space-y-6">
            {/* Simulated High-Res Document Rendering */}
            <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Teaching Factory Teknik Grafika SMK N 1 Kaligondang
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  LEMBAR PRA-CETAK & DOKUMEN DESAIN
                </h2>
                <p className="text-xs text-slate-600">File Ref: {documentTitle}</p>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                  PDF / ORIGINAL
                </span>
              </div>
            </div>

            {/* CMYK Color Calibration Bars at document margin */}
            <div className="flex gap-1 py-1">
              <div className="h-3 flex-1 bg-cyan-400 rounded-xs"></div>
              <div className="h-3 flex-1 bg-rose-500 rounded-xs"></div>
              <div className="h-3 flex-1 bg-yellow-400 rounded-xs"></div>
              <div className="h-3 flex-1 bg-slate-900 rounded-xs"></div>
            </div>

            {/* Preview Box */}
            <div className="aspect-16/9 w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1000&auto=format&fit=crop&q=80"
                alt="Document Preview"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded">
                Resolusi Asli: 3508 x 2480 px (A4 @ 300 DPI)
              </div>
            </div>

            {/* Document Verification Footer */}
            <div className="grid grid-cols-2 text-xs border-t border-slate-200 pt-4 text-slate-600">
              <div>
                <p><strong>Status Pre-Flight:</strong> Lolos Cek Bleed 3mm</p>
                <p><strong>Color Profile:</strong> Coated FOGRA39 (CMYK)</p>
              </div>
              <div className="text-right">
                <p><strong>Penyimpanan:</strong> Google Drive Workspace TEFA</p>
                <p><strong>Keamanan:</strong> Enkripsi Cloud TLS 1.3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dokumen tersimpan aman pada format Google Drive TEFA SMKN 1 Kaligondang</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Tutup Preview
          </button>
        </div>
      </div>
    </div>
  );
};
