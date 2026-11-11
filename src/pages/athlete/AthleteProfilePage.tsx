import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AthleteProfile } from '../../types';
import { formatTanggal, formatRupiah } from '../../utils/formatters';
import { BarcodeCard } from '../../components/common/BarcodeCard';
import { ScanCardInputModal } from '../../components/common/ScanCardInputModal';
import {
  User,
  Shield,
  Key,
  MapPin,
  Calendar,
  Phone,
  Building,
  CheckCircle,
  AlertCircle,
  Wallet,
  Camera,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  BookOpen,
  Hash,
  FileText,
  QrCode,
  Barcode as BarcodeIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RANTING_OPTIONS = [
  'Ranting Mojoroto',
  'Ranting Pesantren',
  'Ranting Kota Kediri',
  'Komisariat IAIN / UIN Kediri',
  'Komisariat UNP Kediri',
  'Komisariat IIK Strada Kediri',
  'Unit Latihan SMKN 1 Kediri',
  'Unit Latihan SMAN 2 Kediri',
  'Padepokan Cabang Kota Kediri',
  'Lainnya (Isi Manual)',
];

export const AthleteProfilePage: React.FC = () => {
  const { user, updateUserSession, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingIdentity, setSavingIdentity] = useState(false);

  // Identity Form State
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [namaLengkap, setNamaLengkap] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [angkatan, setAngkatan] = useState<string>('');
  const [niw, setNiw] = useState<string>('');
  const [selectedRanting, setSelectedRanting] = useState<string>('');
  const [customRanting, setCustomRanting] = useState<string>('');
  const [nomorWhatsApp, setNomorWhatsApp] = useState<string>('');
  const [tempatLahir, setTempatLahir] = useState<string>('');
  const [tanggalLahir, setTanggalLahir] = useState<string>('');
  const [alamat, setAlamat] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [showScanCardModal, setShowScanCardModal] = useState(false);

  // Password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Active view tab ('identity' | 'barcode' | 'security')
  const [activeTab, setActiveTab] = useState<'identity' | 'barcode' | 'security'>('identity');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const populateFormWithData = (data: AthleteProfile) => {
    setProfile(data);
    setFotoUrl(data.fotoUrl || '');
    setNamaLengkap(data.namaLengkap || '');
    setNik(data.nik || '');
    setAngkatan(data.angkatan || '');
    setNiw(data.niw || '');
    setNomorWhatsApp(data.nomorWhatsApp || '');
    setTempatLahir(data.tempatLahir || '');
    setTanggalLahir(data.tanggalLahir ? data.tanggalLahir.substring(0, 10) : '');
    setAlamat(data.alamat || '');
    setBarcode(data.barcode || data.nomorInduk || '');

    // Handle unit / ranting dropdown & custom value
    const currentUnit = data.unitRanting || '';
    if (RANTING_OPTIONS.includes(currentUnit) && currentUnit !== 'Lainnya (Isi Manual)') {
      setSelectedRanting(currentUnit);
      setCustomRanting('');
    } else if (currentUnit) {
      setSelectedRanting('Lainnya (Isi Manual)');
      setCustomRanting(currentUnit);
    } else {
      setSelectedRanting(RANTING_OPTIONS[0]);
      setCustomRanting('');
    }
  };

  const fetchProfileData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const athletes = await api.getAthletes();
      const myData = athletes.find((a) => a.id === user.athleteId || a.userId === user.userId);
      if (myData) {
        populateFormWithData(myData);
      } else {
        // Fallback construct from session
        const fallback: AthleteProfile = {
          id: user.athleteId || 'ATL-TEMP',
          userId: user.userId,
          nomorInduk: user.nomorInduk || 'IKS-KDR',
          nik: user.nik || '',
          angkatan: user.angkatan || '',
          niw: user.niw || '',
          namaLengkap: user.namaLengkap,
          tempatLahir: 'Kediri',
          tanggalLahir: '2004-01-01',
          alamat: 'Kota Kediri, Jawa Timur',
          nomorWhatsApp: user.telepon || '08123456789',
          unitRanting: user.unitRanting || 'Ranting Mojoroto',
          fotoUrl: user.fotoUrl,
          status: user.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          saldoSaatIni: 0,
          totalSetoran: 0,
          totalPenarikan: 0,
        };
        populateFormWithData(fallback);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'File harus berupa foto/gambar (JPG, PNG, WEBP).' });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Ukuran foto maksimal adalah 3 MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFotoUrl(base64);
      setToast({
        type: 'success',
        message: 'Foto profil berhasil dimuat! Klik "Simpan Perubahan Identitas" untuk menerapkan.',
      });
    };
    reader.onerror = () => {
      setToast({ type: 'error', message: 'Gagal memproses file foto.' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFotoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setToast({
      type: 'success',
      message: 'Foto profil dikosongkan. Klik "Simpan Perubahan Identitas" untuk menerapkan.',
    });
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!namaLengkap.trim()) {
      setToast({ type: 'error', message: 'Nama lengkap wajib diisi.' });
      return;
    }

    if (nik.trim() && !/^\d{16}$/.test(nik.trim())) {
      setToast({ type: 'error', message: 'NIK harus terdiri dari 16 digit angka kependudukan.' });
      return;
    }

    const finalUnit =
      selectedRanting === 'Lainnya (Isi Manual)'
        ? customRanting.trim() || 'Unit Latihan Cabang'
        : selectedRanting;

    if (!finalUnit) {
      setToast({ type: 'error', message: 'Unit / Ranting latihan wajib dipilih atau diisi.' });
      return;
    }

    if (!nomorWhatsApp.trim() || nomorWhatsApp.trim().length < 9) {
      setToast({ type: 'error', message: 'Nomor WhatsApp aktif minimal 9 digit angka.' });
      return;
    }

    // Auto format Nomor Induk
    const formattedNomorInduk =
      angkatan.trim() && niw.trim()
        ? `${angkatan.trim()} / ${niw.trim()}`
        : angkatan.trim() || niw.trim() || profile.nomorInduk || 'IKS-KDR';

    setSavingIdentity(true);
    try {
      const updates: Partial<AthleteProfile> = {
        fotoUrl: fotoUrl || undefined,
        namaLengkap: namaLengkap.trim(),
        nik: nik.trim() || undefined,
        angkatan: angkatan.trim() || undefined,
        niw: niw.trim() || undefined,
        nomorInduk: formattedNomorInduk,
        unitRanting: finalUnit,
        nomorWhatsApp: nomorWhatsApp.trim(),
        tempatLahir: tempatLahir.trim(),
        tanggalLahir: tanggalLahir || profile.tanggalLahir,
        alamat: alamat.trim(),
        barcode: barcode.trim() || undefined,
      };

      const res = await api.updateAthlete(profile.id, updates);

      if (res.success) {
        // Update local session
        updateUserSession({
          fotoUrl: updates.fotoUrl,
          namaLengkap: updates.namaLengkap,
          unitRanting: updates.unitRanting,
          nomorInduk: updates.nomorInduk,
          angkatan: updates.angkatan,
          niw: updates.niw,
          nik: updates.nik,
          telepon: updates.nomorWhatsApp,
          barcode: updates.barcode,
        });

        // Update local state profile
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));

        setToast({
          type: 'success',
          message: 'Identitas atlet berhasil diperbarui! Foto profil dan data langsung tersinkronkan.',
        });
      } else {
        setToast({ type: 'error', message: res.message || 'Gagal menyimpan perubahan identitas.' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSavingIdentity(false);
    }
  };

  const handleSaveBarcode = async (newBarcode: string) => {
    if (!profile) return;
    const clean = newBarcode.trim();
    if (!clean) return;
    try {
      const res = await api.updateAthlete(profile.id, { barcode: clean });
      if (res.success) {
        setBarcode(clean);
        setProfile((prev) => (prev ? { ...prev, barcode: clean } : null));
        updateUserSession({ barcode: clean });
        setToast({
          type: 'success',
          message: `Kode Barcode login berhasil disimpan: ${clean}`,
        });
      } else {
        setToast({ type: 'error', message: res.message || 'Gagal menyimpan kode barcode.' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Terjadi kesalahan sistem.' });
    }
  };

  const handleResetForm = () => {
    if (profile) {
      populateFormWithData(profile);
      setToast({ type: 'success', message: 'Form identitas dikembalikan ke data tersimpan.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({ type: 'error', message: 'Password baru minimal 6 karakter.' });
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.changePassword(user.username, oldPassword, newPassword);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xl transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>PENGATURAN & IDENTITAS ANGGOTA</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-tight">
            Profil & Pengaturan Akun Atlit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola data identitas resmi pesilat IKS PI Kera Sakti Cabang Kota Kediri dan keamanan akses tabungan.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'identity'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Ubah Identitas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('barcode')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'barcode'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Kartu &amp; Barcode Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Ganti Password</span>
          </button>
        </div>
      </div>

      {/* Main Athlete ID Summary Card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left">
            {/* Avatar with Camera badge */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-3xl shadow-xl ring-4 ring-amber-400/30 overflow-hidden">
                {fotoUrl || profile?.fotoUrl ? (
                  <img
                    src={fotoUrl || profile?.fotoUrl}
                    alt={namaLengkap || profile?.namaLengkap}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{namaLengkap ? namaLengkap.charAt(0).toUpperCase() : 'A'}</span>
                )}
              </div>

              {/* Quick file trigger badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Ganti Foto Profil"
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-slate-900 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-950 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {profile?.status || 'AKTIF'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                  @{user?.username}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {profile?.id || user?.athleteId}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {namaLengkap || profile?.namaLengkap || user?.namaLengkap}
              </h2>

              <p className="text-xs text-amber-300 font-mono font-bold flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>
                  NI: {angkatan && niw ? `${angkatan} / ${niw}` : profile?.nomorInduk || user?.nomorInduk}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-sans font-semibold">
                  {selectedRanting === 'Lainnya (Isi Manual)'
                    ? customRanting || 'Ranting Khusus'
                    : selectedRanting || profile?.unitRanting || 'Ranting Mojoroto'}
                </span>
              </p>

              <p className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span className="font-mono">{nomorWhatsApp || profile?.nomorWhatsApp || '08xxxxxxxxxx'}</span>
                {nik && (
                  <>
                    <span className="text-slate-600 mx-1">•</span>
                    <span className="font-mono text-slate-400">NIK: {nik}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Balance & Passbook CTA */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-3 text-right shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Saldo Tabungan
              </span>
              <p className="text-lg md:text-xl font-black text-amber-400 font-mono">
                {formatRupiah(profile?.saldoSaatIni || 0)}
              </p>
            </div>

            <Link
              to="/athlete/passbook"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buka Buku Tabungan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Invisible file input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Main Tab Views */}
      {activeTab === 'identity' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Ubah Identitas (2 Columns) */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Pengaturan Identitas Lengkap</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ubah foto profil, angkatan & NIW, ranting latihan, WhatsApp aktif, dan alamat domisili.
                </p>
              </div>

              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Tersinkronisasi
              </span>
            </div>

            <form onSubmit={handleSaveIdentity} className="space-y-5">
              {/* 1. Foto Profil Setting */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wide">
                  1. Foto Profil Atlet
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center overflow-hidden shrink-0 shadow">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt="Preview Foto" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-600" />
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <p className="text-xs text-slate-300 font-medium">
                      Unggah foto resmi berseragam sakral IKS PI atau pakaian rapi.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Foto Baru</span>
                      </button>

                      {fotoUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 hover:border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Foto</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">Maks. 3 MB (JPG, PNG, atau WEBP).</p>
                  </div>
                </div>
              </div>

              {/* 2. Nama Lengkap & NIK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Lengkap Atlet <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Nama lengkap atlet"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    NIK (Nomor Induk Kependudukan)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    placeholder="16 digit angka KTP / KK"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {nik.length}/16 digit
                  </span>
                </div>
              </div>

              {/* 3. Angkatan & NIW (Nomor Induk) */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wide">
                    2. Angkatan & NIW (Nomor Induk Atlet)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Format: [Angkatan] / [NIW]
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Angkatan Pengesahan Warga
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={angkatan}
                        onChange={(e) => setAngkatan(e.target.value)}
                        placeholder="Contoh: 128 / 130 / 135"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      NIW (Nomor Induk Warga / Siswa)
                    </label>
                    <div className="relative">
                      <Shield className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={niw}
                        onChange={(e) => setNiw(e.target.value)}
                        placeholder="Contoh: 0089 / 0104"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between">
                  <span className="text-slate-400">Nomor Induk Tabungan Terbentuk:</span>
                  <strong className="text-amber-400 font-mono font-bold text-xs">
                    {angkatan && niw ? `${angkatan} / ${niw}` : profile?.nomorInduk || 'IKS-KDR'}
                  </strong>
                </div>
              </div>

              {/* 3. Kode Barcode / QR Login Manual */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <BarcodeIcon className="w-3.5 h-3.5" />
                    <span>3. Kode Barcode / QR Login (Bisa Diisi Manual)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('barcode')}
                    className="text-[10px] text-amber-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Buka Kartu &amp; QR</span>
                  </button>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value.toUpperCase())}
                    placeholder={`Default: ${angkatan && niw ? `${angkatan}/${niw}` : profile?.nomorInduk || 'IKS-KDR'}`}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanCardModal(true)}
                    title="Pindai QR Code atau Barcode dari kartu fisik, kartu pelajar sekolah, dll."
                    className="px-3.5 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Pindai Kartu Sekolah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = 'IKS-ATL-' + Math.floor(100000 + Math.random() * 900000);
                      setBarcode(rand);
                    }}
                    title="Buat kode acak"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Acak</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Anda bisa mengisi kode barcode kartu fisik Anda sendiri, atau biarkan menggunakan Nomor Induk. Kode ini digunakan untuk login dengan scan barcode di halaman depan.
                </p>
              </div>

              {/* 4. Unit / Ranting Latihan (Pilihan / Input Manual) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>
                    4. Unit / Ranting Latihan <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[10px] text-amber-400">Dapat dipilih atau diisi manual</span>
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Building className="w-4 h-4 text-amber-400 absolute left-3.5 top-3 pointer-events-none" />
                    <select
                      value={selectedRanting}
                      onChange={(e) => setSelectedRanting(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    >
                      {RANTING_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-950 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRanting === 'Lainnya (Isi Manual)' && (
                    <div className="pt-1">
                      <input
                        type="text"
                        required
                        value={customRanting}
                        onChange={(e) => setCustomRanting(e.target.value)}
                        placeholder="Ketik nama unit / ranting / tempat latihan Anda..."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 5. WhatsApp Aktif */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nomor WhatsApp Aktif <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={nomorWhatsApp}
                    onChange={(e) => setNomorWhatsApp(e.target.value.replace(/[^0-9+]/g, ''))}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Nomor aktif untuk konfirmasi setoran & penarikan oleh bendahara cabang.
                </span>
              </div>

              {/* 6. Tempat & Tanggal Lahir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tempat Lahir <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={tempatLahir}
                      onChange={(e) => setTempatLahir(e.target.value)}
                      placeholder="Contoh: Kediri"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tanggal Lahir <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Alamat Domisili */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alamat Domisili Lengkap <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Nama jalan, RT/RW, Dusun/Kelurahan, Kecamatan, Kota Kediri..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form</span>
                </button>

                <button
                  type="submit"
                  disabled={savingIdentity}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingIdentity ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Identitas'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Info Card */}
          <div className="space-y-6">
            {/* Passbook preview mini card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Kartu Identitas Tabungan</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Data identitas ini dicantumkan pada sampul Buku Tabungan Digital resmi pesilat IKS PI Kera Sakti Cabang Kota Kediri.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[10px] text-slate-500">NO. REKENING</span>
                  <span className="text-amber-400 font-bold">
                    {angkatan && niw ? `${angkatan} / ${niw}` : profile?.nomorInduk || 'IKS-KDR'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">PEMILIK REKENING</span>
                  <span className="text-white font-sans font-bold block truncate">
                    {namaLengkap || profile?.namaLengkap}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">UNIT LATIHAN</span>
                  <span className="text-slate-300 font-sans text-[11px] block truncate">
                    {selectedRanting === 'Lainnya (Isi Manual)'
                      ? customRanting || 'Ranting Khusus'
                      : selectedRanting || profile?.unitRanting}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-sans">Status Anggota</span>
                  <span className="text-emerald-400 font-bold font-sans">TERVERIFIKASI</span>
                </div>
              </div>

              <Link
                to="/athlete/passbook"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lihat Buku Tabungan Digital</span>
              </Link>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Petunjuk Data Atlet</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-[11px] leading-relaxed text-slate-400">
                <li>Pastikan nomor WhatsApp aktif untuk verifikasi bukti transfer.</li>
                <li>Angkatan dan NIW disesuaikan dengan sertifikat warga/siswa.</li>
                <li>Perubahan nama & ranting akan langsung tersinkron ke buku tabungan.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : activeTab === 'barcode' ? (
        /* Tab Barcode: Kartu Digital & Kode Barcode Login */
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <QrCode className="w-3.5 h-3.5" />
                <span>KARTU DIGITAL &amp; SCANNER LOGIN</span>
              </div>
              <h3 className="text-xl font-bold text-white font-serif">
                Kartu &amp; Kode Barcode Anggota
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Sesuaikan desain kartu (Emas, Merah Marun, Hitam, Putih Siap Cetak), ganti warna QR Code, ubah kode barcode login manual, atau unduh kartu tanda anggota berkualitas tinggi untuk disimpan atau dicetak.
              </p>
            </div>

            {profile && (
              <BarcodeCard
                code={barcode || profile.barcode || profile.nomorInduk || ''}
                namaLengkap={profile.namaLengkap}
                nomorInduk={profile.nomorInduk}
                unitRanting={profile.unitRanting}
                fotoUrl={profile.fotoUrl}
                role="ATLIT"
                editable={true}
                onSaveBarcode={handleSaveBarcode}
              />
            )}
          </div>
        </div>
      ) : (
        /* Tab Keamanan: Ganti Password */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Ganti Password Akun</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Jaga kerahasiaan kata sandi akun tabungan digital Anda demi keamanan transaksi.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password Saat Ini <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password lama"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password Baru <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ulangi Password Baru <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {passLoading ? 'Menyimpan Password...' : 'Simpan Password Baru'}
              </button>
            </form>
          </div>

          {/* Security guidance card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Standar Keamanan Tabungan</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem Tabungan Atlit IKS PI Cabang Kota Kediri mengimplementasikan keamanan enkripsi tingkat tinggi:
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">Password Terenkripsi</strong>
                <p className="text-[11px] text-slate-400">
                  Password disimpan dalam bentuk salted hash SHA-256 yang aman dari peretasan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">Sesi Kedaluwarsa Otomatis (1 Jam)</strong>
                <p className="text-[11px] text-slate-400">
                  Sesi login anggota otomatis log out setelah 1 jam demi perlindungan keamanan akun dan tabungan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-blue-400 block mb-0.5">Pemeriksaan Bendahara</strong>
                <p className="text-[11px] text-slate-400">
                  Semua transaksi saldo keluar tetap memerlukan persetujuan ganda dari pengurus resmi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Physical Card Scanner Modal */}
      <ScanCardInputModal
        isOpen={showScanCardModal}
        onClose={() => setShowScanCardModal(false)}
        onSelectCode={(scannedCode) => {
          setBarcode(scannedCode);
          setToast({
            type: 'success',
            message: `Kode kartu berhasil dipindai: ${scannedCode}. Klik Simpan Perubahan untuk menyimpan ke profil.`,
          });
        }}
        title="Pindai Kartu Anggota / Kartu Sekolah"
        subtitle="Arahkan kamera ke QR Code / Barcode kartu pelajar atau unggah foto kartu fisik"
        targetLabel="Kode Barcode Login Atlet"
      />
    </div>
  );
};
