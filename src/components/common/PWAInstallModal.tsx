import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Share2,
  Copy,
  Check,
  Zap,
  Wifi,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'apk'>('android');

  if (!isOpen) return null;

  const appUrl = window.location.origin + window.location.pathname;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Aplikasi Tabungan Atlit IKS PI Kota Kediri',
          text: 'Pasang aplikasi Tabungan Atlit IKS PI Kera Sakti di HP Android Anda:',
          url: appUrl,
        });
      } catch {
        // User cancelled or failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-5 text-slate-950 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 p-2 shadow-lg flex items-center justify-center border border-amber-300 shrink-0">
              <img src="/icon.svg" alt="IKS PI Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-400 text-[10px] font-bold tracking-wider uppercase font-mono">
                  Aplikasi Android / Mobile
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-950 leading-tight mt-0.5 font-serif">
                Pasang di HP Anggota
              </h3>
              <p className="text-xs text-slate-900/90 font-medium">
                Tabungan Digital IKS PI Kera Sakti Cabang Kota Kediri
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-3 pt-2 gap-2 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition ${
              activeTab === 'android'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Panduan Android (Chrome)
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition ${
              activeTab === 'ios'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            iPhone / iOS
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition ${
              activeTab === 'apk'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Info File APK
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
          {/* Quick Install Button if browser supports it */}
          {isInstallable && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Ponsel Mendukung 1-Klik Pasang!
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Tekan tombol di bawah untuk langsung memasang ke layar utama HP Anda.
                  </p>
                </div>
                <button
                  onClick={handleDirectInstall}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-lg hover:from-amber-300 hover:to-amber-400 transition flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Pasang Sekarang
                </button>
              </div>
            </div>
          )}

          {isInstalled && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Aplikasi ini telah terpasang di perangkat Anda sebagai aplikasi mandiri!</span>
            </div>
          )}

          {/* TAB 1: ANDROID GUIDE */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                  Cara Memasang di HP Android (Google Chrome):
                </h4>
                <ol className="space-y-3 text-xs">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-white">Buka link aplikasi di Google Chrome HP</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Pastikan menggunakan peramban Google Chrome atau Samsung Internet pada smartphone Android.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-white">Ketuk Menu Titik Tiga (⋮) di Kanan Atas</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Buka menu opsi Google Chrome di pojok kanan atas layar ponsel Anda.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-white">
                        Pilih menu <span className="text-amber-300 font-bold">"Instal aplikasi"</span> atau <span className="text-amber-300 font-bold">"Tambahkan ke Layar Utama"</span>
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Konfirmasi dengan menekan tombol <strong>"Instal"</strong>.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0 text-[11px]">
                      4
                    </span>
                    <div>
                      <p className="font-semibold text-white">Selesai! Ikon aplikasi muncul di Beranda HP</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Aplikasi siap dibuka kapan saja seperti aplikasi Android bawaan Play Store tanpa perlu mengetik alamat website lagi.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Keuntungan Fitur Android App */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <Zap className="w-4 h-4 text-amber-400 mb-1" />
                  <p className="font-bold text-white text-[11px]">Layar Penuh (Full Screen)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tanpa bilah alamat browser, pengalaman seperti aplikasi native.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <Wifi className="w-4 h-4 text-emerald-400 mb-1" />
                  <p className="font-bold text-white text-[11px]">Akses Cepat Offline</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Buku tabungan dan riwayat tersimpan aman di memori HP.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IOS GUIDE */}
          {activeTab === 'ios' && (
            <div className="space-y-3 text-xs bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-2">
                Cara Memasang di iPhone / iPad (Safari):
              </h4>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-amber-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-white">Buka link aplikasi di Safari</p>
                    <p className="text-slate-400 text-[11px]">Buka halaman ini menggunakan browser bawaan Safari di iPhone.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-amber-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-white">Ketuk tombol Bagikan (Share)</p>
                    <p className="text-slate-400 text-[11px]">Ikon kotak dengan panah mengarah ke atas di bagian bawah Safari.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-amber-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-white">Pilih "Add to Home Screen" (Tambah ke Layar Utama)</p>
                    <p className="text-slate-400 text-[11px]">Gulir ke bawah dan ketuk Tambah ke Layar Utama.</p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* TAB 3: APK INFO */}
          {activeTab === 'apk' && (
            <div className="space-y-3 text-xs bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-1">
                Ingin Mengubah Jadi File .APK untuk Dibagikan?
              </h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Aplikasi ini sudah berstandar <strong>PWA (Progressive Web App) Resmi</strong> yang dapat langsung di-install di Android tanpa perlu instalasi file APK dari luar Play Store.
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-2 text-[11px]">
                <p className="text-amber-300 font-semibold">Opsi Pembuatan File APK Mandiri:</p>
                <p className="text-slate-400">
                  Pengurus cabang dapat membuat file installer <strong>.APK</strong> siap pasang menggunakan layanan gratis:
                </p>
                <div className="flex flex-col gap-1.5 mt-1">
                  <a
                    href="https://www.pwabuilder.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded bg-slate-800 hover:bg-slate-700 text-white transition"
                  >
                    <span>1. Buka <strong>PWABuilder.com</strong> (Layanan Resmi Microsoft)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                  <p className="text-[10px] text-slate-400 pl-1">
                    Cukup masukkan URL aplikasi Anda &gt; Klik "Package for Android" &gt; File APK langsung siap diunduh!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Share with Members section */}
          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-300 mb-2">
              Bagikan Link Aplikasi ke WhatsApp Anggota:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium flex items-center gap-1.5 shrink-0 border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
              <button
                onClick={handleShare}
                className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                Bagikan
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400">
            IKS PI Kera Sakti Cabang Kota Kediri
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
