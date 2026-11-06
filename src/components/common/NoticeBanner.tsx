import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AppNotice } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Megaphone,
  X,
  ExternalLink,
  AlertTriangle,
  Info,
  Trophy,
  Calendar,
  Pin,
  Pause,
  Play,
  Gauge,
  Eye,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { formatTanggalWaktu } from '../../utils/formatters';

export const NoticeBanner: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<AppNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<AppNotice | null>(null);

  const loadNotices = async () => {
    try {
      const all = await api.getNotices(true);
      // Filter notices applicable to current user role and active
      const filtered = all.filter((n) => {
        if (!n.aktif) return false;
        if (n.target === 'ATLIT' && user?.role !== 'ATLIT') return false;
        if (n.target === 'ADMIN' && user?.role !== 'ADMIN') return false;
        return true;
      });
      setNotices(filtered);
    } catch (err) {
      console.error('Failed to load notices for ticker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
    const handleUpdate = () => loadNotices();
    window.addEventListener('ikspi_notices_updated', handleUpdate);
    return () => window.removeEventListener('ikspi_notices_updated', handleUpdate);
  }, [user]);

  if (loading || notices.length === 0) return null;

  // Marquee duration calculation based on speed
  const getDurationInSeconds = () => {
    const baseDuration = Math.max(28, notices.length * 18);
    switch (speed) {
      case 'slow':
        return `${baseDuration * 1.5}s`;
      case 'fast':
        return `${baseDuration * 0.65}s`;
      default:
        return `${baseDuration}s`;
    }
  };

  const getCategoryBadgeClass = (kategori: string) => {
    switch (kategori) {
      case 'PENTING':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'KEJUARAAN':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'PERINGATAN':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'AGENDA':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    }
  };

  // If user minimized the banner, render a discreet restore chip
  if (isMinimized) {
    return (
      <div className="fixed top-16 right-4 z-30">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-amber-400 border border-amber-500/40 text-xs font-semibold shadow-lg backdrop-blur-md transition-all cursor-pointer group"
          title="Tampilkan kembali teks pengumuman berjalan"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <Megaphone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>Pengumuman ({notices.length})</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  // Double the array for seamless infinite loop (0% -> -50%)
  const marqueeItems = [...notices, ...notices];

  return (
    <>
      <div className="relative z-20 bg-slate-950/95 border-b border-amber-500/30 backdrop-blur-md text-xs shadow-md pause-on-hover">
        <div className="max-w-7xl mx-auto flex items-center h-10 px-3 sm:px-4 gap-2">
          {/* Static Left Brand / Ticker Header */}
          <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-slate-800 bg-slate-950 z-10">
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute"></span>
              <span className="w-2 h-2 rounded-full bg-amber-400 relative"></span>
            </div>
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 hidden xs:flex">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-400 whitespace-nowrap">
              NOTICE BERJALAN
            </span>
          </div>

          {/* Scrolling Marquee Container */}
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            {/* Left and Right Fade Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>

            {/* Continuous Running Text Animation */}
            <div
              className={`animate-marquee ${isPaused ? 'animate-marquee-paused' : ''} flex items-center gap-8`}
              style={{
                ['--marquee-speed' as any]: getDurationInSeconds(),
              }}
            >
              {marqueeItems.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex items-center gap-2.5 whitespace-nowrap cursor-pointer group hover:bg-slate-900/60 py-1 px-2.5 rounded-lg transition-colors"
                  onClick={() => setSelectedNotice(item)}
                  title="Klik untuk membaca pengumuman lengkap"
                >
                  {/* Category Pill */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${getCategoryBadgeClass(
                      item.kategori
                    )}`}
                  >
                    {item.kategori}
                  </span>

                  {item.pinTop && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Pin className="w-2.5 h-2.5" />
                      <span>PIN</span>
                    </span>
                  )}

                  {/* Title */}
                  <span className="font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1">
                    <span>{item.judul}</span>
                    <span className="text-amber-400">:</span>
                  </span>

                  {/* Message snippet */}
                  <span className="text-slate-300 font-normal opacity-90 group-hover:text-white">
                    {item.isi}
                  </span>

                  {/* Optional Link Button */}
                  {item.tautanUrl && (
                    <a
                      href={item.tautanUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[10px] font-semibold border border-amber-500/30 transition-colors ml-1"
                    >
                      <span>{item.tautanLabel || 'Buka Link'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}

                  {/* Separator Star */}
                  <span className="text-amber-500/40 ml-4 select-none">✦</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Action / Control Buttons */}
          <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-slate-800 bg-slate-950 z-10">
            {/* Pause / Play Toggle */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title={isPaused ? 'Lanjutkan teks berjalan' : 'Jeda animasi teks'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Speed Toggle: Normal -> Slow -> Fast */}
            <button
              type="button"
              onClick={() => {
                if (speed === 'normal') setSpeed('slow');
                else if (speed === 'slow') setSpeed('fast');
                else setSpeed('normal');
              }}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors cursor-pointer"
              title={`Kecepatan: ${speed === 'normal' ? 'Normal' : speed === 'slow' ? 'Lambat' : 'Cepat'}`}
            >
              <Gauge className="w-3 h-3 text-amber-400" />
              <span className="uppercase">{speed === 'normal' ? '1x' : speed === 'slow' ? '0.6x' : '1.5x'}</span>
            </button>

            {/* Minimize / Close */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Sembunyikan notice berjalan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notice Detail Popup Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getCategoryBadgeClass(
                    selectedNotice.kategori
                  )}`}
                >
                  {selectedNotice.kategori}
                </span>
                {selectedNotice.pinTop && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                    <Pin className="w-3 h-3" /> PENTING
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white font-serif leading-snug">
                {selectedNotice.judul}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {selectedNotice.isi}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span>Waktu: {formatTanggalWaktu(selectedNotice.updatedAt || selectedNotice.createdAt)}</span>
              {selectedNotice.tautanUrl ? (
                <a
                  href={selectedNotice.tautanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  <span>{selectedNotice.tautanLabel || 'Buka Tautan'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
