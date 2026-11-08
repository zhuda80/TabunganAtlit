import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { Smartphone, Download } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'card' | 'minimal';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  // If already running in standalone mode on Android/iOS, hide banner unless requested
  if (isInstalled && variant === 'navbar') {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      {variant === 'navbar' && (
        <button
          onClick={handleClick}
          title="Pasang aplikasi di HP Android Anda"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pasang di HP</span>
          <span className="sm:hidden">App HP</span>
        </button>
      )}

      {variant === 'banner' && (
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-slate-900 border border-amber-500/30 p-4 shadow-xl ${className}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 p-2 shadow-lg flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold tracking-wider uppercase font-mono">
                    Aplikasi Android
                  </span>
                  {isInstalled && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                      Terpasang
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Jadikan Aplikasi di Layar Utama HP
                </h4>
                <p className="text-xs text-slate-300">
                  Akses buku tabungan digital lebih cepat langsung dari ikon layar depan ponsel tanpa membuka browser.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={handleClick}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:from-amber-300 hover:to-amber-400 transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                {isInstallable ? 'Instal Sekarang' : 'Panduan Pasang di HP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {variant === 'card' && (
        <button
          onClick={handleClick}
          className={`w-full p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition flex items-center justify-between gap-3 group ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                Pasang Aplikasi di HP Android
              </p>
              <p className="text-[11px] text-slate-400">
                Akses cepat, hemat kuota, dan tampilan layar penuh
              </p>
            </div>
          </div>
          <span className="text-xs text-amber-400 font-semibold px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
            Pasang
          </span>
        </button>
      )}

      {variant === 'minimal' && (
        <button
          onClick={handleClick}
          className={`text-xs text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1 ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Pasang di HP
        </button>
      )}

      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
