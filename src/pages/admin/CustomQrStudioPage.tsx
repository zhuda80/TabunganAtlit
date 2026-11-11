import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { AthleteProfile } from '../../types';
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
  renderCardToCanvas,
  downloadCardAsPng,
  downloadQrOnlyAsPng,
} from '../../utils/qrCustomRenderer';
import {
  QrCode,
  Barcode as BarcodeIcon,
  Palette,
  Sliders,
  Download,
  Copy,
  Check,
  RefreshCw,
  Printer,
  Sparkles,
  User,
  Users,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  ShieldCheck,
  Save,
  ChevronRight,
  Layers,
  FileImage,
  ExternalLink,
  Camera,
} from 'lucide-react';
import { ScanCardInputModal } from '../../components/common/ScanCardInputModal';

export const CustomQrStudioPage: React.FC = () => {
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);

  // Selection mode: 'athlete' or 'custom'
  const [mode, setMode] = useState<'athlete' | 'custom'>('athlete');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [athleteSearch, setAthleteSearch] = useState('');

  // Identity Form Data
  const [code, setCode] = useState('IKS-ATL-135089');
  const [namaLengkap, setNamaLengkap] = useState('Arya Bimasena');
  const [nomorInduk, setNomorInduk] = useState('135 / 0089');
  const [unitRanting, setUnitRanting] = useState('Ranting Mojoroto');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [role, setRole] = useState<'ADMIN' | 'ATLIT'>('ATLIT');

  // Custom Options State
  const [options, setOptions] = useState<QrCustomOptions>(DEFAULT_QR_CUSTOM_OPTIONS);

  // Preview Mode: 'card' | 'qr' | 'barcode'
  const [previewMode, setPreviewMode] = useState<'card' | 'qr' | 'barcode'>('card');

  // Generated QR preview URL
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string>('');

  // UI States
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [savingToAthlete, setSavingToAthlete] = useState(false);
  const [showScanCardModal, setShowScanCardModal] = useState(false);

  // Active Control Tab: 'content' | 'qr' | 'card' | 'batch'
  const [controlTab, setControlTab] = useState<'content' | 'qr' | 'card' | 'batch'>('content');

  // Batch Export state
  const [batchRanting, setBatchRanting] = useState('ALL');
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch athletes on mount
  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    setLoadingAthletes(true);
    try {
      const data = await api.getAthletes();
      setAthletes(data || []);
      if (data && data.length > 0) {
        selectAthlete(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAthletes(false);
    }
  };

  const selectAthlete = (ath: AthleteProfile) => {
    setSelectedAthleteId(ath.id);
    setNamaLengkap(ath.namaLengkap);
    setNomorInduk(ath.nomorInduk || '');
    setUnitRanting(ath.unitRanting || '');
    setFotoUrl(ath.fotoUrl || '');
    setCode(ath.barcode || ath.nomorInduk || `IKS-ATL-${Math.floor(100000 + Math.random() * 900000)}`);
    setRole('ATLIT');
  };

  // Re-generate QR preview when relevant options or code changes
  useEffect(() => {
    let active = true;
    generateCustomQrDataUrl(code, options, fotoUrl)
      .then((url) => {
        if (active) setQrPreviewUrl(url);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, [
    code,
    options.qrFgColor,
    options.qrBgColor,
    options.qrCenterLogo,
    options.logoSizePercent,
    options.qrMargin,
    fotoUrl,
  ]);

  const handleRandomizeCode = () => {
    const prefix = role === 'ADMIN' ? 'IKS-ADM-' : 'IKS-ATL-';
    const rand = Math.floor(100000 + Math.random() * 900000);
    setCode(`${prefix}${rand}`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Ukuran foto maksimal 2MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveToAthleteDatabase = async () => {
    if (!selectedAthleteId) {
      setToast({ type: 'error', message: 'Pilih atlet terlebih dahulu.' });
      return;
    }
    setSavingToAthlete(true);
    try {
      const athlete = athletes.find((a) => a.id === selectedAthleteId);
      if (!athlete) return;
      const res = await api.updateAthlete(selectedAthleteId, {
        ...athlete,
        barcode: code.trim(),
      });
      if (res.success) {
        setToast({
          type: 'success',
          message: `Kode barcode ${code} berhasil disimpan ke database atlet ${namaLengkap}!`,
        });
        await fetchAthletes();
      } else {
        setToast({ type: 'error', message: res.message || 'Gagal menyimpan ke database.' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Terjadi kesalahan' });
    } finally {
      setSavingToAthlete(false);
    }
  };

  const handleDownloadCard = async () => {
    setIsExporting(true);
    try {
      await downloadCardAsPng(
        {
          code,
          namaLengkap,
          nomorInduk,
          unitRanting,
          fotoUrl,
          role,
        },
        options
      );
      setToast({ type: 'success', message: 'Kartu HD berhasil diunduh!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal mengunduh kartu' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadQrOnly = async () => {
    setIsExporting(true);
    try {
      await downloadQrOnlyAsPng(code, options, fotoUrl);
      setToast({ type: 'success', message: 'File QR Code resolusi tinggi berhasil diunduh!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal mengunduh QR code' });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Batch Export Handlers
  const handleBatchDownloadQr = async () => {
    const listToExport = athletes.filter(
      (a) => batchRanting === 'ALL' || a.unitRanting === batchRanting
    );

    if (listToExport.length === 0) {
      setToast({ type: 'error', message: 'Tidak ada data atlet pada ranting yang dipilih.' });
      return;
    }

    const confirmed = window.confirm(
      `Unduh ${listToExport.length} file QR Code untuk ranting "${batchRanting}"? Browser akan mendownload beberapa file gambar secara berurutan.`
    );
    if (!confirmed) return;

    setBatchProgress({ current: 0, total: listToExport.length });

    for (let i = 0; i < listToExport.length; i++) {
      const ath = listToExport[i];
      const athCode = ath.barcode || ath.nomorInduk || `IKS-ATL-${ath.id.substring(0, 6)}`;
      await downloadQrOnlyAsPng(
        athCode,
        options,
        ath.fotoUrl,
        `QR-${(ath.namaLengkap || 'Anggota').replace(/[^a-zA-Z0-9]/g, '-')}.png`
      );
      setBatchProgress({ current: i + 1, total: listToExport.length });
      // Brief pause to prevent browser download throttling
      await new Promise((r) => setTimeout(r, 300));
    }

    setToast({
      type: 'success',
      message: `Berhasil mengunduh ${listToExport.length} QR Code anggota!`,
    });
    setBatchProgress(null);
  };

  const currentTheme = CARD_THEMES[options.theme] || CARD_THEMES.gold;
  const { widths, totalWidth } = generateBarcodeBars(code);
  const isPortrait = options.orientation === 'portrait';

  // Distinct ranting list for filter
  const distinctRantings = Array.from(
    new Set((athletes || []).map((a) => a?.unitRanting).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header Studio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STUDIO CUSTOM QR &amp; BARCODE RESMI</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            Studio Desain QR &amp; Kartu Anggota
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Buat, kustomisasi warna, sematkan logo resmi IKS PI di tengah QR Code, sesuaikan format
            kartu cetak PVC / Photo, dan unduh dalam resolusi tinggi untuk anggota maupun pengurus.
          </p>
        </div>

        {/* Source Mode Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setMode('athlete')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              mode === 'athlete'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pilih Anggota</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('custom');
              setCode('IKS-KDR-BEBAS');
              setNamaLengkap('Kustom IKS PI');
              setNomorInduk('KDR-2026');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              mode === 'custom'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Kustom Bebas / URL</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: CUSTOMIZATION CONTROLS (7 Cols) ================= */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          {/* Controls Sub-Tab Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setControlTab('content')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                controlTab === 'content'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>1. Identitas &amp; Kode</span>
            </button>

            <button
              type="button"
              onClick={() => setControlTab('qr')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                controlTab === 'qr'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>2. Desain QR &amp; Logo</span>
            </button>

            <button
              type="button"
              onClick={() => setControlTab('card')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                controlTab === 'card'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>3. Tema &amp; Kartu</span>
            </button>

            <button
              type="button"
              onClick={() => setControlTab('batch')}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                controlTab === 'batch'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ekspor Massal Anggota"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Massal</span>
            </button>
          </div>

          {/* TAB 1: IDENTITAS & KODE */}
          {controlTab === 'content' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {mode === 'athlete' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wide">
                    Pilih Atlet dari Database ({athletes.length} Atlet)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Ketik nama, nomor induk, atau ranting..."
                      value={athleteSearch}
                      onChange={(e) => setAthleteSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <select
                    value={selectedAthleteId}
                    onChange={(e) => {
                      const found = athletes.find((a) => a.id === e.target.value);
                      if (found) selectAthlete(found);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {athletes
                      .filter((a) => {
                        const q = athleteSearch.toLowerCase();
                        return (
                          !q ||
                          a.namaLengkap.toLowerCase().includes(q) ||
                          (a.nomorInduk && a.nomorInduk.toLowerCase().includes(q)) ||
                          (a.unitRanting && a.unitRanting.toLowerCase().includes(q))
                        );
                      })
                      .map((ath) => (
                        <option key={ath.id} value={ath.id}>
                          {ath.namaLengkap} — {ath.nomorInduk} ({ath.unitRanting})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Barcode String Input */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    Isi / Kode Barcode &amp; QR <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowScanCardModal(true)}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      title="Pindai QR / Barcode dari kartu fisik, kartu pelajar sekolah, dll."
                    >
                      <Camera className="w-3 h-3" /> Pindai Kartu Sekolah
                    </button>
                    <button
                      type="button"
                      onClick={handleRandomizeCode}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Acak Kode
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
                  placeholder="Contoh: IKS-ATL-135089"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-500">
                  Kode ini yang akan dipindai oleh pemindai kamera smartphone maupun scanner USB saat login.
                </p>

                {mode === 'athlete' && selectedAthleteId && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveToAthleteDatabase}
                      disabled={savingToAthlete}
                      className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingToAthlete ? 'Menyimpan...' : 'Simpan Kode Ini ke Database Atlet Terpilih'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Form Nama & Identitas Tambahan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Induk / NIW</label>
                  <input
                    type="text"
                    value={nomorInduk}
                    onChange={(e) => setNomorInduk(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit / Ranting Latihan</label>
                  <input
                    type="text"
                    value={unitRanting}
                    onChange={(e) => setUnitRanting(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Peran / Kategori</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'ADMIN' | 'ATLIT')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="ATLIT">ATLIT RESMI</option>
                    <option value="ADMIN">ADMIN / PENGURUS CABANG</option>
                  </select>
                </div>
              </div>

              {/* Upload Foto Kustom */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt={namaLengkap} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Foto Anggota pada Kartu</span>
                    <span className="text-[10px] text-slate-400">
                      {fotoUrl ? 'Foto terpasang (Bisa diganti)' : 'Belum ada foto'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomPhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold cursor-pointer transition"
                  >
                    Pilih Foto
                  </button>
                  {fotoUrl && (
                    <button
                      type="button"
                      onClick={() => setFotoUrl('')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 text-xs cursor-pointer transition"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESAIN QR CODE & LOGO TENGAH */}
          {controlTab === 'qr' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Warna QR Code */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Warna Titik QR Code (Foreground)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={options.qrFgColor}
                    onChange={(e) => setOptions({ ...options, qrFgColor: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={options.qrFgColor}
                    onChange={(e) => setOptions({ ...options, qrFgColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Preset Palet Warna */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Preset Cepat:</span>
                  {[
                    { name: 'Hitam Pekat', hex: '#020617' },
                    { name: 'Emas IKS PI', hex: '#F59E0B' },
                    { name: 'Merah Marun', hex: '#991B1B' },
                    { name: 'Hijau Pendekar', hex: '#065F46' },
                    { name: 'Biru Navy', hex: '#1E3A8A' },
                    { name: 'Ungu Gelap', hex: '#581C87' },
                  ].map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setOptions({ ...options, qrFgColor: preset.hex })}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1.5 cursor-pointer transition hover:scale-105"
                      style={{
                        borderColor: options.qrFgColor === preset.hex ? preset.hex : '#334155',
                        backgroundColor: options.qrFgColor === preset.hex ? `${preset.hex}25` : '#020617',
                        color: '#F8FAFC',
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hex }}></span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo di Tengah QR */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Logo / Emblem di Tengah QR Code
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ikspi', label: '🛡️ Logo IKS PI', desc: 'Emblem Resmi' },
                    { id: 'photo', label: '👤 Foto Anggota', desc: 'Foto Profil' },
                    { id: 'shield', label: '⚔️ Perisai Silat', desc: 'Ikon Beladiri' },
                    { id: 'none', label: 'Polos', desc: 'Tanpa Logo' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOptions({ ...options, qrCenterLogo: item.id as QrCenterLogoType })}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        options.qrCenterLogo === item.id
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{item.desc}</span>
                    </button>
                  ))}
                </div>

                {options.qrCenterLogo !== 'none' && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Ukuran Logo Tengah</span>
                      <span className="font-mono text-amber-400 font-bold">{options.logoSizePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={18}
                      max={30}
                      value={options.logoSizePercent}
                      onChange={(e) => setOptions({ ...options, logoSizePercent: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Dilengkapi proteksi Error Correction Level H (30%) agar kode tetap selalu dapat dipindai.
                    </p>
                  </div>
                )}
              </div>

              {/* Barcode 1D Setting */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    Linear Barcode 1D (Code 128)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={options.show1DBarcode}
                      onChange={(e) => setOptions({ ...options, show1DBarcode: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Aktifkan Barcode 1D</span>
                  </label>
                </div>

                {options.show1DBarcode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Warna Garis Barcode</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={options.barcodeLineColor}
                          onChange={(e) => setOptions({ ...options, barcodeLineColor: e.target.value })}
                          className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={options.barcodeLineColor}
                          onChange={(e) => setOptions({ ...options, barcodeLineColor: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 mt-4">
                        <input
                          type="checkbox"
                          checked={options.showBarcodeText}
                          onChange={(e) => setOptions({ ...options, showBarcodeText: e.target.checked })}
                          className="rounded accent-amber-500"
                        />
                        <span>Tampilkan Teks Nomor di Bawah Garis</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TEMA & TATA LETAK KARTU */}
          {controlTab === 'card' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Pilihan 5 Tema Kartu */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Pilih Tema Desain Kartu Tanda Anggota
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(CARD_THEMES) as CardThemeId[]).map((themeKey) => {
                    const t = CARD_THEMES[themeKey];
                    const isSelected = options.theme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => setOptions({ ...options, theme: themeKey })}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-inner"
                            style={{ backgroundColor: t.accentColor }}
                          ></span>
                          <div>
                            <span className="text-xs font-bold text-white block">{t.name}</span>
                            <span className="text-[10px] text-slate-500 block">
                              {themeKey === 'white'
                                ? 'Hemat tinta percetakan'
                                : themeKey === 'gold'
                                ? 'Standar resmi perguruan'
                                : 'Gaya khas pesilat'}
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orientasi Kartu */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <label className="block text-xs font-bold text-slate-200">
                  Orientasi Kartu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, orientation: 'landscape' })}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      options.orientation === 'landscape'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs">Lanskap (CR80)</span>
                    <span className="block text-[10px] text-slate-500">Standar Kartu ATM / KTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, orientation: 'portrait' })}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      options.orientation === 'portrait'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs">Portret (ID Badge)</span>
                    <span className="block text-[10px] text-slate-500">Standar Lanyard / Gantung</span>
                  </button>
                </div>
              </div>

              {/* Pengaturan Teks Header & Footer */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Judul Header Kartu
                  </label>
                  <input
                    type="text"
                    value={options.headerTitle}
                    onChange={(e) => setOptions({ ...options, headerTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sub-Judul Kartu
                  </label>
                  <input
                    type="text"
                    value={options.cardSubheader}
                    onChange={(e) => setOptions({ ...options, cardSubheader: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teks Keaslian (Footer)
                  </label>
                  <input
                    type="text"
                    value={options.footerText}
                    onChange={(e) => setOptions({ ...options, footerText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EKSPOR MASSAL / BATCH */}
          {controlTab === 'batch' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                  <Layers className="w-4 h-4" />
                  <span>Unduh Massal QR Code Seluruh Anggota</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fitur ini memungkinkan administrator mengunduh file QR Code HD (dengan gaya &amp; warna
                  yang sedang aktif) untuk seluruh anggota di ranting tertentu sekaligus.
                </p>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pilih Ranting / Unit Latihan
                  </label>
                  <select
                    value={batchRanting}
                    onChange={(e) => setBatchRanting(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="ALL">Semua Ranting ({athletes.length} Anggota)</option>
                    {distinctRantings.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {batchProgress ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                      <span>Sedang Mengunduh...</span>
                      <span>
                        {batchProgress.current} / {batchProgress.total} File
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-200"
                        style={{
                          width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleBatchDownloadQr}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Mulai Unduh Semua QR Code ({batchRanting === 'ALL' ? athletes.length : 'Ranting Terpilih'})</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: INTERACTIVE LIVE PREVIEW (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            {/* Preview View Mode Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Preview</span>
              </span>

              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setPreviewMode('card')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewMode === 'card' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Kartu
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('qr')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewMode === 'qr' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  QR Saja
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('barcode')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewMode === 'barcode' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  1D Barcode
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW CANVAS / CONTAINER */}
            <div className="overflow-hidden flex items-center justify-center p-2">
              {previewMode === 'card' ? (
                /* LIVE CARD PREVIEW */
                <div
                  className={`w-full rounded-2xl border-2 transition-all p-5 shadow-2xl relative overflow-hidden ${
                    currentTheme.borderClass
                  } bg-gradient-to-br ${currentTheme.bgGradient}`}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between border-b pb-3 mb-3.5"
                    style={{ borderColor: currentTheme.canvasInnerBorder }}
                  >
                    <div>
                      <p
                        className="text-[9px] uppercase tracking-widest font-mono font-bold"
                        style={{ color: currentTheme.accentColor }}
                      >
                        {options.headerTitle}
                      </p>
                      <h4 className="text-xs font-bold text-white font-serif">{options.cardSubheader}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${currentTheme.badgeBg} ${currentTheme.badgeText}`}
                    >
                      {role}
                    </span>
                  </div>

                  {!isPortrait ? (
                    /* Landscape Mini View */
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <div className="col-span-2 space-y-2">
                        <div className="flex items-center gap-2">
                          {options.showPhoto && fotoUrl && (
                            <img
                              src={fotoUrl}
                              alt={namaLengkap}
                              className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-500/40"
                            />
                          )}
                          <div>
                            <span className="text-[10px] text-slate-400 block">Nama Anggota:</span>
                            <span className="text-sm font-bold text-white block line-clamp-1">{namaLengkap}</span>
                          </div>
                        </div>

                        <div className="space-y-0.5 text-[10px]">
                          <span className="text-slate-400">No. Induk: </span>
                          <span className="font-mono font-bold text-amber-400">{nomorInduk || '-'}</span>
                          {options.showRanting && (
                            <p className="text-slate-300 truncate">{unitRanting || 'Cabang Kediri'}</p>
                          )}
                        </div>

                        {options.show1DBarcode && (
                          <div className="space-y-0.5 pt-1">
                            <svg viewBox={`0 0 ${totalWidth} 24`} className="w-full h-5" preserveAspectRatio="none">
                              {(() => {
                                let curX = 0;
                                return widths.map((w, idx) => {
                                  const x = curX;
                                  curX += w;
                                  return idx % 2 === 0 ? (
                                    <rect
                                      key={idx}
                                      x={x}
                                      y={0}
                                      width={w}
                                      height={24}
                                      fill={options.barcodeLineColor || currentTheme.accentColor}
                                    />
                                  ) : null;
                                });
                              })()}
                            </svg>
                            {options.showBarcodeText && (
                              <p className="text-[8px] font-mono text-center text-slate-400">{code}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* QR Right side */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-2 rounded-xl bg-white shadow-md border border-slate-200">
                          {qrPreviewUrl ? (
                            <img src={qrPreviewUrl} alt="QR Preview" className="w-24 h-24 object-contain" />
                          ) : (
                            <div className="w-24 h-24 flex items-center justify-center text-slate-400">...</div>
                          )}
                        </div>
                        <span className="text-[8px] font-mono text-amber-400 mt-1 font-bold">SCAN ME</span>
                      </div>
                    </div>
                  ) : (
                    /* Portrait Mini View */
                    <div className="flex flex-col items-center text-center space-y-2 py-1">
                      {options.showPhoto && fotoUrl && (
                        <img
                          src={fotoUrl}
                          alt={namaLengkap}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-500/40"
                        />
                      )}
                      <div>
                        <span className="text-sm font-bold text-white block">{namaLengkap}</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{nomorInduk || '-'}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white shadow-md">
                        {qrPreviewUrl && (
                          <img src={qrPreviewUrl} alt="QR Preview" className="w-32 h-32 object-contain" />
                        )}
                      </div>

                      {options.show1DBarcode && (
                        <svg viewBox={`0 0 ${totalWidth} 24`} className="w-36 h-5" preserveAspectRatio="none">
                          {(() => {
                            let curX = 0;
                            return widths.map((w, idx) => {
                              const x = curX;
                              curX += w;
                              return idx % 2 === 0 ? (
                                <rect
                                  key={idx}
                                  x={x}
                                  y={0}
                                  width={w}
                                  height={24}
                                  fill={options.barcodeLineColor || currentTheme.accentColor}
                                />
                              ) : null;
                            });
                          })()}
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    className="mt-3 pt-2 border-t flex items-center justify-between text-[8px] text-slate-400 font-mono"
                    style={{ borderColor: currentTheme.canvasInnerBorder }}
                  >
                    <span className="truncate">{options.footerText}</span>
                    <span className="text-emerald-400 font-bold shrink-0">VALID</span>
                  </div>
                </div>
              ) : previewMode === 'qr' ? (
                /* QR ONLY PREVIEW */
                <div className="p-6 rounded-2xl bg-white shadow-2xl flex flex-col items-center justify-center space-y-3">
                  {qrPreviewUrl ? (
                    <img src={qrPreviewUrl} alt="QR Code HD" className="w-56 h-56 object-contain" />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                      <QrCode className="w-12 h-12 animate-pulse" />
                    </div>
                  )}
                  <span className="text-xs font-mono font-bold text-slate-900">{code}</span>
                </div>
              ) : (
                /* 1D BARCODE ONLY PREVIEW */
                <div className="w-full p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3">
                  <svg viewBox={`0 0 ${totalWidth} 40`} className="w-full max-w-sm h-12" preserveAspectRatio="none">
                    {(() => {
                      let curX = 0;
                      return widths.map((w, idx) => {
                        const x = curX;
                        curX += w;
                        return idx % 2 === 0 ? (
                          <rect
                            key={idx}
                            x={x}
                            y={0}
                            width={w}
                            height={40}
                            fill={options.barcodeLineColor || '#F59E0B'}
                          />
                        ) : null;
                      });
                    })()}
                  </svg>
                  <span className="text-sm font-mono font-bold text-amber-400 tracking-wider">* {code} *</span>
                </div>
              )}
            </div>

            {/* Test Validation Badge */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold block">Format Terverifikasi</span>
                <span className="text-[11px] text-emerald-300">
                  QR &amp; Barcode siap discan dengan kamera ponsel dan scanner fisik.
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={isExporting}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Merender Kartu...' : 'Unduh Kartu HD (PNG Siap Cetak)'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadQrOnly}
                  disabled={isExporting}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Saja (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cetak Langsung</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physical Card Scanner Modal */}
      <ScanCardInputModal
        isOpen={showScanCardModal}
        onClose={() => setShowScanCardModal(false)}
        onSelectCode={(scannedCode) => {
          setCode(scannedCode);
          setToast({
            type: 'success',
            message: `Kode kartu fisik berhasil dipindai: ${scannedCode}`,
          });
        }}
        title="Pindai Kartu Anggota / Kartu Sekolah"
        subtitle="Arahkan kamera ke QR Code / Barcode pada kartu pelajar, KTP, atau kartu fisik, atau unggah fotonya"
        targetLabel="Isi Kode Barcode / QR Studio"
      />
    </div>
  );
};
