import React, { useEffect, useState, useRef } from 'react';
import {
  QrCode,
  Barcode as BarcodeIcon,
  Download,
  Copy,
  Check,
  RefreshCw,
  Printer,
  Sparkles,
  ShieldCheck,
  Edit3,
  Save,
  Palette,
  Sliders,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  CheckCircle,
  Camera,
} from 'lucide-react';
import { ScanCardInputModal } from './ScanCardInputModal';
import {
  CardThemeId,
  CardOrientation,
  QrCenterLogoType,
  CARD_THEMES,
  QrCustomOptions,
  DEFAULT_QR_CUSTOM_OPTIONS,
} from '../../types/barcodeCustom';
import {
  generateBarcodeBars,
  generateCustomQrDataUrl,
  downloadCardAsPng,
  downloadQrOnlyAsPng,
} from '../../utils/qrCustomRenderer';

export interface BarcodeCardProps {
  code: string;
  namaLengkap: string;
  nomorInduk?: string;
  unitRanting?: string;
  fotoUrl?: string;
  role?: 'ADMIN' | 'ATLIT';
  editable?: boolean;
  onSaveBarcode?: (newCode: string) => Promise<void> | void;
  // Optional initial customization overrides
  initialOptions?: Partial<QrCustomOptions>;
  showCustomizerByDefault?: boolean;
}

export const BarcodeCard: React.FC<BarcodeCardProps> = ({
  code,
  namaLengkap,
  nomorInduk,
  unitRanting,
  fotoUrl,
  role = 'ATLIT',
  editable = false,
  onSaveBarcode,
  initialOptions,
  showCustomizerByDefault = false,
}) => {
  const [customOptions, setCustomOptions] = useState<QrCustomOptions>(() => {
    try {
      const saved = localStorage.getItem(`ikspi_card_pref_${role}`);
      if (saved) {
        return { ...DEFAULT_QR_CUSTOM_OPTIONS, ...JSON.parse(saved), ...initialOptions };
      }
    } catch {}
    return { ...DEFAULT_QR_CUSTOM_OPTIONS, ...initialOptions };
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputCode, setInputCode] = useState(code || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(showCustomizerByDefault);
  const [downloading, setDownloading] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const effectiveCode = (code || inputCode || nomorInduk || 'IKS-KDR').trim();

  // Save options preference to localStorage
  const updateCustomOptions = (updater: Partial<QrCustomOptions>) => {
    setCustomOptions((prev) => {
      const next = { ...prev, ...updater };
      try {
        localStorage.setItem(`ikspi_card_pref_${role}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    setInputCode(code || '');
  }, [code]);

  // Regenerate QR data URL whenever code or QR options change
  useEffect(() => {
    let active = true;
    generateCustomQrDataUrl(effectiveCode, customOptions, fotoUrl)
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch((err) => console.error('Failed generating custom QR:', err));
    return () => {
      active = false;
    };
  }, [effectiveCode, customOptions.qrFgColor, customOptions.qrBgColor, customOptions.qrCenterLogo, customOptions.logoSizePercent, customOptions.qrMargin, fotoUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(effectiveCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateRandom = () => {
    const prefix = role === 'ADMIN' ? 'IKS-ADM-' : 'IKS-ATL-';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setInputCode(`${prefix}${randomNum}`);
  };

  const handleSave = async () => {
    if (!onSaveBarcode) return;
    const clean = inputCode.trim();
    if (!clean) return;
    setSaving(true);
    try {
      await onSaveBarcode(clean);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadCard = async () => {
    setDownloading(true);
    try {
      await downloadCardAsPng(
        {
          code: effectiveCode,
          namaLengkap: namaLengkap || (role === 'ADMIN' ? 'Administrator IKS PI' : 'Atlit IKS PI'),
          nomorInduk,
          unitRanting,
          fotoUrl,
          role,
        },
        customOptions
      );
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadQrOnly = async () => {
    setDownloading(true);
    try {
      await downloadQrOnlyAsPng(effectiveCode, customOptions, fotoUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentTheme = CARD_THEMES[customOptions.theme] || CARD_THEMES.gold;
  const { widths, totalWidth } = generateBarcodeBars(effectiveCode);
  const isPortrait = customOptions.orientation === 'portrait';

  return (
    <div className="space-y-4">
      {/* Visual Identity Card Container */}
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 p-6 md:p-7 shadow-2xl ${
          currentTheme.borderClass
        } bg-gradient-to-br ${currentTheme.bgGradient}`}
      >
        {/* Glow ambient background */}
        <div
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${currentTheme.accentColor}18` }}
        ></div>

        {/* Card Header */}
        <div
          className="flex items-center justify-between border-b pb-4 mb-5"
          style={{ borderColor: currentTheme.canvasInnerBorder }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl p-0.5 shadow-md shrink-0 flex items-center justify-center font-bold font-serif text-sm"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.accentColor}, #B45309)`,
                color: '#020617',
              }}
            >
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span style={{ color: currentTheme.accentColor }}>IKS</span>
              </div>
            </div>
            <div>
              <p
                className="text-[10px] uppercase tracking-widest font-mono font-bold"
                style={{ color: currentTheme.accentColor }}
              >
                {customOptions.headerTitle || 'IKS.PI KERA SAKTI • KOTA KEDIRI'}
              </p>
              <h3 className="text-sm md:text-base font-bold font-serif text-white">
                {customOptions.cardSubheader || 'Kartu Barcode Login Digital'}
              </h3>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${currentTheme.badgeBg} ${currentTheme.badgeText}`}
          >
            {role === 'ADMIN' ? 'ADMIN CABANG' : 'ATLIT RESMI'}
          </span>
        </div>

        {/* Card Body - Adaptive Landscape vs Portrait */}
        {!isPortrait ? (
          /* LANDSCAPE PREVIEW */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Column 1 & 2: User details & 1D Barcode */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3.5">
                {customOptions.showPhoto && fotoUrl && (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-amber-500/40 shrink-0 shadow-md">
                    <img src={fotoUrl} alt={namaLengkap} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <span className="text-[11px] text-slate-400 block">Nama Anggota:</span>
                  <p className="text-lg md:text-xl font-extrabold text-white font-serif">
                    {namaLengkap || 'Anggota IKS PI'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Nomor Induk / NIW</span>
                  <span
                    className="font-mono font-bold text-sm block truncate"
                    style={{ color: currentTheme.accentColor }}
                  >
                    {nomorInduk || '-'}
                  </span>
                </div>
                {customOptions.showRanting && (
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Ranting / Unit</span>
                    <span className="font-semibold text-slate-200 text-xs truncate block">
                      {unitRanting || 'Cabang Kediri'}
                    </span>
                  </div>
                )}
              </div>

              {/* 1D Barcode Line Art */}
              {customOptions.show1DBarcode && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                      <BarcodeIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Linear Barcode 1D (Code 128):</span>
                    </span>
                    <span className="font-mono text-amber-300 font-bold tracking-wider">
                      {effectiveCode}
                    </span>
                  </div>

                  {/* SVG Barcode Bars */}
                  <div className="w-full overflow-hidden flex items-center justify-center py-1 bg-black/40 rounded-lg px-2">
                    <svg
                      viewBox={`0 0 ${totalWidth} 40`}
                      className="w-full h-8 max-w-[280px]"
                      preserveAspectRatio="none"
                    >
                      {(() => {
                        let currentX = 0;
                        return widths.map((w, idx) => {
                          const x = currentX;
                          currentX += w;
                          if (idx % 2 === 0) {
                            return (
                              <rect
                                key={idx}
                                x={x}
                                y={0}
                                width={w}
                                height={40}
                                fill={customOptions.barcodeLineColor || currentTheme.accentColor}
                              />
                            );
                          }
                          return null;
                        });
                      })()}
                    </svg>
                  </div>
                  {customOptions.showBarcodeText && (
                    <p className="text-[9px] text-center font-mono text-slate-400 tracking-widest">
                      * {effectiveCode} *
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Column 3: 2D QR Code */}
            <div className="flex flex-col items-center justify-center space-y-2.5">
              <div className="p-3 rounded-2xl bg-white shadow-2xl border-2 border-amber-400/40 relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code ${effectiveCode}`}
                    className="w-40 h-40 md:w-44 md:h-44 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-slate-400">
                    <QrCode className="w-12 h-12 animate-pulse" />
                  </div>
                )}
              </div>
              <span
                className="text-[10px] font-mono font-bold tracking-wider uppercase text-center"
                style={{ color: currentTheme.accentColor }}
              >
                Scan di Kamera / Scanner
              </span>
            </div>
          </div>
        ) : (
          /* PORTRAIT PREVIEW */
          <div className="flex flex-col items-center text-center space-y-4">
            {customOptions.showPhoto && fotoUrl && (
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-amber-500/50 shadow-xl">
                <img src={fotoUrl} alt={namaLengkap} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <p className="text-xl font-extrabold text-white font-serif">{namaLengkap || 'Anggota IKS PI'}</p>
              <p className="text-sm font-mono font-bold text-amber-400">{nomorInduk || '-'}</p>
              {customOptions.showRanting && (
                <p className="text-xs text-slate-300 mt-0.5">{unitRanting || 'Cabang Kota Kediri'}</p>
              )}
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-white shadow-2xl border-2 border-amber-400/40">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${effectiveCode}`}
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}
            </div>

            {customOptions.show1DBarcode && (
              <div className="w-full max-w-xs space-y-1">
                <svg
                  viewBox={`0 0 ${totalWidth} 40`}
                  className="w-full h-8"
                  preserveAspectRatio="none"
                >
                  {(() => {
                    let currentX = 0;
                    return widths.map((w, idx) => {
                      const x = currentX;
                      currentX += w;
                      if (idx % 2 === 0) {
                        return (
                          <rect
                            key={idx}
                            x={x}
                            y={0}
                            width={w}
                            height={40}
                            fill={customOptions.barcodeLineColor || currentTheme.accentColor}
                          />
                        );
                      }
                      return null;
                    });
                  })()}
                </svg>
                {customOptions.showBarcodeText && (
                  <p className="text-[10px] font-mono text-amber-400">{effectiveCode}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Card Footer notice */}
        <div
          className="mt-5 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono"
          style={{ borderColor: currentTheme.canvasInnerBorder }}
        >
          <span>{customOptions.footerText || 'PENGURUS CABANG IKS PI KERA SAKTI KOTA KEDIRI'}</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>KARTU TERVALIDASI</span>
          </span>
        </div>
      </div>

      {/* Main Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Customizer Toggle Button */}
          <button
            type="button"
            onClick={() => setShowCustomizer(!showCustomizer)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showCustomizer
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Kustomisasi Tampilan</span>
            {showCustomizer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Edit barcode string button */}
          {editable && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEditing ? 'Tutup Ubah Kode' : 'Ubah Kode Manual'}</span>
            </button>
          )}

          {/* Copy Barcode string */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
        </div>

        {/* Download & Print Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadQrOnly}
            disabled={downloading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>QR Saja (PNG)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCard}
            disabled={downloading}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Merender...' : 'Unduh Kartu HD'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Cetak Kartu"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Accordion 1: Inline Customizer Panel */}
      {showCustomizer && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Sliders className="w-4 h-4" />
              <span>Panel Kustomisasi Desain Kartu &amp; QR Barcode</span>
            </div>
            <button
              type="button"
              onClick={() => updateCustomOptions(DEFAULT_QR_CUSTOM_OPTIONS)}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset Default
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Tema Desain Kartu */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Tema Kartu Anggota
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {(Object.keys(CARD_THEMES) as CardThemeId[]).map((themeKey) => {
                  const t = CARD_THEMES[themeKey];
                  const isSel = customOptions.theme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => updateCustomOptions({ theme: themeKey })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer border ${
                        isSel
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: t.accentColor }}
                        ></span>
                        <span>{t.name}</span>
                      </div>
                      {isSel && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Orientasi Kartu & Foto */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Orientasi Kartu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateCustomOptions({ orientation: 'landscape' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      customOptions.orientation === 'landscape'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Lanskap (CR80)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCustomOptions({ orientation: 'portrait' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      customOptions.orientation === 'portrait'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Portret (Lanyard)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Tampilkan di Kartu
                </label>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customOptions.showPhoto}
                      onChange={(e) => updateCustomOptions({ showPhoto: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Foto Anggota</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customOptions.show1DBarcode}
                      onChange={(e) => updateCustomOptions({ show1DBarcode: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Linear Barcode 1D</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customOptions.showRanting}
                      onChange={(e) => updateCustomOptions({ showRanting: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Nama Unit / Ranting</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 3. Kustomisasi Warna QR */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Warna Titik QR (Foreground)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customOptions.qrFgColor}
                    onChange={(e) => updateCustomOptions({ qrFgColor: e.target.value })}
                    className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={customOptions.qrFgColor}
                      onChange={(e) => updateCustomOptions({ qrFgColor: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
                {/* Presets */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[
                    { label: 'Hitam', hex: '#020617' },
                    { label: 'Emas', hex: '#F59E0B' },
                    { label: 'Marun', hex: '#991B1B' },
                    { label: 'Hijau', hex: '#065F46' },
                    { label: 'Biru', hex: '#1E3A8A' },
                  ].map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => updateCustomOptions({ qrFgColor: p.hex })}
                      title={p.label}
                      className="w-5 h-5 rounded-full border border-slate-600 hover:scale-110 transition cursor-pointer"
                      style={{ backgroundColor: p.hex }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Warna Garis Barcode 1D
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customOptions.barcodeLineColor || '#F59E0B'}
                    onChange={(e) => updateCustomOptions({ barcodeLineColor: e.target.value })}
                    className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={customOptions.barcodeLineColor || '#F59E0B'}
                    onChange={(e) => updateCustomOptions({ barcodeLineColor: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* 4. Logo di Tengah QR */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Logo di Tengah QR Code
                </label>
                <select
                  value={customOptions.qrCenterLogo}
                  onChange={(e) =>
                    updateCustomOptions({ qrCenterLogo: e.target.value as QrCenterLogoType })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ikspi">🛡️ Lambang Resmi IKS PI</option>
                  <option value="photo">👤 Foto Profil Anggota</option>
                  <option value="shield">⚔️ Perisai Silat</option>
                  <option value="none">Polos (Tanpa Logo Tengah)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Otomatis menggunakan Error Correction Level Tinggi (H) agar QR tetap 100% terbaca scanner.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Ukuran Logo Tengah ({customOptions.logoSizePercent}%)
                </label>
                <input
                  type="range"
                  min={18}
                  max={30}
                  value={customOptions.logoSizePercent}
                  onChange={(e) => updateCustomOptions({ logoSizePercent: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accordion 2: Edit Barcode String Drawer */}
      {editable && isEditing && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Pengaturan Kode Barcode / QR Login Manual</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Ketik nomor kartu fisik, NIK, atau buat kode acak unik untuk memindai kartu saat login.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kode Barcode / QR Login Anggota
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) =>
                    setInputCode(e.target.value.toUpperCase().replace(/\s+/g, '-'))
                  }
                  placeholder="Contoh: IKS-ATL-88219 atau nomor kartu ID fisik"
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowScanModal(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Pindai QR / Barcode dari kartu sekolah fisik atau unggah foto kartu"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Pindai Kartu Sekolah / Fisik</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Acak</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !inputCode.trim()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Kode Barcode'}</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Kode Barcode berhasil diperbarui dan tersimpan ke akun!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Physical Card Scanner Modal */}
      <ScanCardInputModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onSelectCode={(scannedCode) => {
          setInputCode(scannedCode);
        }}
        title="Pindai QR / Barcode Kartu Pelajar / Fisik"
        subtitle="Arahkan kamera ke QR code pada kartu anggota sekolah / kartu fisik Anda, atau unggah foto kartu"
        targetLabel="Kode Barcode Login"
      />
    </div>
  );
};
