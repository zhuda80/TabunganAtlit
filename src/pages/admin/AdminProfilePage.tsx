import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AdminProfile } from '../../types';
import { formatTanggal } from '../../utils/formatters';
import {
  User,
  Shield,
  ShieldCheck,
  KeyRound,
  Mail,
  Phone,
  MapPin,
  Building,
  Award,
  Save,
  RotateCcw,
  Camera,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  Bell,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const JABATAN_PRESETS = [
  'Bendahara Cabang',
  'Wakil Bendahara Cabang',
  'Ketua Cabang',
  'Wakil Ketua Cabang',
  'Sekretaris Cabang',
  'Wakil Sekretaris Cabang',
  'Humas & Kominfo Cabang',
  'Koordinator Atlit & Prestasi',
  'Bidang Kepelatihan & Litbang',
  'Bidang Sarana & Prasarana',
  'Dewan Penasihat Cabang',
  'Pengurus Harian Cabang',
  'Lainnya (Isi Manual)',
];

export const AdminProfilePage: React.FC = () => {
  const { user, updateUserSession } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active Tab: 'identity' | 'security' | 'privileges'
  const [activeTab, setActiveTab] = useState<'identity' | 'security' | 'privileges'>('identity');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Identity Form Fields
  const [namaLengkap, setNamaLengkap] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState('');
  const [customJabatan, setCustomJabatan] = useState('');
  const [nomorWhatsApp, setNomorWhatsApp] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');
  const [unitRanting, setUnitRanting] = useState('');
  const [catatan, setCatatan] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  // Password Change Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const populateForm = (data: AdminProfile) => {
    setProfile(data);
    setNamaLengkap(data.namaLengkap || '');
    setNomorWhatsApp(data.nomorWhatsApp || '');
    setEmail(data.email || '');
    setAlamat(data.alamat || '');
    setUnitRanting(data.unitRanting || '');
    setCatatan(data.catatan || '');
    setFotoUrl(data.fotoUrl || '');

    const currentJabatan = data.jabatan || '';
    if (JABATAN_PRESETS.includes(currentJabatan) && currentJabatan !== 'Lainnya (Isi Manual)') {
      setSelectedJabatan(currentJabatan);
      setCustomJabatan('');
    } else if (currentJabatan) {
      setSelectedJabatan('Lainnya (Isi Manual)');
      setCustomJabatan(currentJabatan);
    } else {
      setSelectedJabatan('Bendahara Cabang');
      setCustomJabatan('');
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminProfile(user?.userId || 'admin');
      populateForm(data);
    } catch (err) {
      console.error('Failed to fetch admin profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle local image upload with file reader and canvas resizing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'File harus berupa gambar (JPG, PNG, atau WEBP).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Ukuran foto maksimal 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFotoUrl(dataUrl);
          setToast({
            type: 'success',
            message: 'Foto berhasil dimuat. Klik "Simpan Profil Pengurus" untuk menyimpan perubahan.',
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFotoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setToast({
      type: 'success',
      message: 'Foto profil dikosongkan. Klik "Simpan Profil Pengurus" untuk menerapkan.',
    });
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!namaLengkap.trim()) {
      setToast({ type: 'error', message: 'Nama lengkap pengurus wajib diisi.' });
      return;
    }

    const finalJabatan =
      selectedJabatan === 'Lainnya (Isi Manual)'
        ? customJabatan.trim() || 'Pengurus Cabang'
        : selectedJabatan || 'Pengurus Cabang';

    setSaving(true);
    try {
      const updates: Partial<AdminProfile> = {
        namaLengkap: namaLengkap.trim(),
        jabatan: finalJabatan,
        nomorWhatsApp: nomorWhatsApp.trim(),
        email: email.trim(),
        alamat: alamat.trim(),
        unitRanting: unitRanting.trim() || 'Pengurus Cabang Kota Kediri',
        catatan: catatan.trim(),
        fotoUrl: fotoUrl.trim(),
      };

      const res = await api.updateAdminProfile(profile.userId, updates);
      if (res.success && res.profile) {
        setProfile(res.profile);
        updateUserSession({
          namaLengkap: res.profile.namaLengkap,
          jabatan: res.profile.jabatan,
          telepon: res.profile.nomorWhatsApp,
          email: res.profile.email,
          alamat: res.profile.alamat,
          fotoUrl: res.profile.fotoUrl,
        });
        setToast({ type: 'success', message: 'Profil Administrator berhasil diperbarui!' });
      } else {
        setToast({ type: 'error', message: res.message || 'Gagal menyimpan profil admin.' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      setToast({ type: 'error', message: 'Password saat ini wajib diisi.' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({ type: 'error', message: 'Password baru minimal 6 karakter demi keamanan akun admin.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.changePassword(user?.username || 'admin', oldPassword, newPassword);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Gagal mengubah password.' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    setPassLoading(true);
    try {
      const res = await api.resetDefaultAdmin();
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setShowResetConfirm(false);
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Gagal mereset password default.' });
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-9 h-9 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-mono">Memuat Profil Administrator...</p>
      </div>
    );
  }

  const effectiveJabatan =
    selectedJabatan === 'Lainnya (Isi Manual)'
      ? customJabatan || 'Pengurus Cabang'
      : selectedJabatan || 'Pengurus Cabang';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>PENGURUS CABANG KOTA KEDIRI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Profil Administrator Cabang
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola data pengurus, jabatan organisasi, kredensial login, dan ringkasan hak otoritas sistem tabungan.
          </p>
        </div>

        {/* Quick shortcut to Settings */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Pengaturan Sistem</span>
          </Link>
          <Link
            to="/admin/settings?tab=notices"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Kelola Notice</span>
          </Link>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-800/80 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <p>{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs font-semibold underline hover:opacity-80 shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Hero Admin Profile Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 p-6 sm:p-8 shadow-xl shadow-black/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar with photo controls */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden text-amber-400">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt={namaLengkap || 'Admin'}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Shield className="w-10 h-10 text-amber-400 mb-1" />
                    <span className="text-xs font-bold font-mono tracking-wider text-amber-300">ADMIN</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Upload Button Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Ganti Foto Profil Admin"
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition-transform hover:scale-105"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Admin Details Overview */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                ADMINISTRATOR / PENGURUS CABANG
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                STATUS: {profile?.status || 'AKTIF'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                ID: {profile?.userId || 'USR-ADMIN-01'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {namaLengkap || 'Administrator IKS PI'}
            </h2>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-400">
                <Award className="w-4 h-4 text-amber-400" />
                {effectiveJabatan}
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <Building className="w-4 h-4 text-slate-400" />
                {unitRanting || 'Pengurus Cabang Kota Kediri'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <Phone className="w-4 h-4 text-slate-400" />
                {nomorWhatsApp || '0812-3344-5566'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <Mail className="w-4 h-4 text-slate-400" />
                {email || 'admin@ikspikediri.org'}
              </span>
            </div>

            {catatan && (
              <p className="text-xs text-slate-400 italic pt-1 max-w-2xl border-t border-slate-800/80">
                "{catatan}"
              </p>
            )}
          </div>

          {/* Quick Photo Actions */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Unggah Foto</span>
            </button>
            {fotoUrl && (
              <button
                onClick={handleRemovePhoto}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Foto</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('identity')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'identity'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Identitas Pengurus</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Keamanan & Sandi</span>
        </button>

        <button
          onClick={() => setActiveTab('privileges')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'privileges'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Hak Akses & Otoritas</span>
        </button>
      </div>

      {/* TAB CONTENT 1: IDENTITAS PENGURUS */}
      {activeTab === 'identity' && (
        <form onSubmit={handleSaveIdentity} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                Informasi & Profil Personal Pengurus
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Data ini ditampilkan pada identitas pengurus sistem dan pengesahan nota / transaksi tabungan atlet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Lengkap & Gelar Pengurus <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: Mas Bambang Wijaya, S.Pd"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Jabatan Organisasi Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Jabatan / Posisi di Cabang <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedJabatan}
                  onChange={(e) => setSelectedJabatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  {JABATAN_PRESETS.map((jbt) => (
                    <option key={jbt} value={jbt}>
                      {jbt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Jabatan Input (when 'Lainnya' selected) */}
              {selectedJabatan === 'Lainnya (Isi Manual)' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-amber-400 mb-1.5">
                    Ketik Nama Jabatan Khusus Anda
                  </label>
                  <input
                    type="text"
                    value={customJabatan}
                    onChange={(e) => setCustomJabatan(e.target.value)}
                    placeholder="Contoh: Koordinator Pembinaan Usia Dini Cabang Kota Kediri"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Nomor WhatsApp / HP */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nomor Kontak / WhatsApp Aktif <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={nomorWhatsApp}
                    onChange={(e) => setNomorWhatsApp(e.target.value)}
                    placeholder="Contoh: 081233445566"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
                {nomorWhatsApp && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tautan WhatsApp publik:{' '}
                    <a
                      href={`https://wa.me/62${nomorWhatsApp.replace(/^0+/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline"
                    >
                      Uji Buka Chat WA
                    </a>
                  </p>
                )}
              </div>

              {/* Email Resmi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Resmi Pengurus
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: admin@ikspikediri.org"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Unit / Kantor Tugas */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Unit Organisasi / Wilayah Tugas
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={unitRanting}
                    onChange={(e) => setUnitRanting(e.target.value)}
                    placeholder="Contoh: Pengurus Cabang Kota Kediri"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Link Foto Profil Langsung */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL Tautan Foto (Opsional)
                </label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    placeholder="https://... (atau klik 'Unggah Foto' di atas)"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Alamat Sekretariat / Domisili */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alamat Sekretariat / Domisili Pengurus
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Padepokan IKS PI Kera Sakti Cabang Kota Kediri, Jawa Timur"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Catatan / Visi Pengurus */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pesan / Catatan Integritas Pengurus untuk Atlit
                </label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Mengemban amanah kas tabungan para pesilat dengan jujur, disiplin, dan transparan."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={fetchProfile}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Batal / Muat Ulang</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Profil Pengurus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB CONTENT 2: KEAMANAN & SANDI */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Change Password Form */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                Ganti Kata Sandi Administrator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Jaga kerahasiaan kata sandi admin. Akun administrator memegang otoritas penuh terhadap persetujuan setoran, penarikan, dan saldo rekening atlet.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Old Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password Saat Ini <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password admin saat ini"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password Baru <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Konfirmasi Password Baru <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
                >
                  {passLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Perbarui Kata Sandi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Emergency Reset & Security Overview Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>INFORMASI KREDENSIAL</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Username Utama:</span>
                  <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    @{user?.username || 'admin'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Peran Sistem:</span>
                  <span className="font-bold text-amber-400">SUPER ADMINISTRATOR</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Masa Berlaku Sesi:</span>
                  <span className="text-slate-300">24 Jam (Auto Refresh)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Default Password Cadangan:</span>
                  <span className="font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    admin123
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Reset Box */}
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <AlertCircle className="w-4 h-4" />
                <span>PEMULIHAN KATA SANDI DARURAT</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bila Anda lupa kata sandi baru yang baru dibuat, Anda dapat mengembalikan password akun admin ke default pabrik: <code className="text-amber-400 font-bold">admin123</code>.
              </p>

              {showResetConfirm ? (
                <div className="space-y-2 pt-2">
                  <p className="text-[11px] text-amber-300 font-semibold">
                    Yakin kembalikan kata sandi admin ke "admin123"?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetToDefault}
                      disabled={passLoading}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
                    >
                      Ya, Reset Sekarang
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Password: admin123</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: HAK AKSES & OTORITAS SISTEM */}
      {activeTab === 'privileges' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Ruang Lingkup Otoritas Administrator Cabang
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Sebagai Administrator Cabang IKS PI Kera Sakti Kota Kediri, akun ini memegang hak akses penuh terhadap seluruh alur operasional tabungan atlet:
              </p>
            </div>

            {/* Privilege Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  <span>Persetujuan Setoran</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Memeriksa bukti transfer kas atlet, mencocokkan mutasi bank, dan menambah saldo buku tabungan atlet.
                </p>
                <Link
                  to="/admin/deposit-approvals"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline pt-1"
                >
                  <span>Buka Halaman Setoran</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <ArrowUpRight className="w-4 h-4 text-amber-400" />
                  <span>Persetujuan Penarikan</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Memvalidasi keperluan penarikan atlet dan memastikan kepatuhan saldo endapan wajib minimal.
                </p>
                <Link
                  to="/admin/withdrawal-approvals"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline pt-1"
                >
                  <span>Buka Halaman Penarikan</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Data & Password Atlit</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Melihat seluruh daftar atlit, rekap saldo endapan, dan membantu atlit yang lupa password via menu pengaturan.
                </p>
                <Link
                  to="/admin/athletes"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline pt-1"
                >
                  <span>Buka Data Atlit</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>Kelola Notice & Broadcast</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Membuat, mengubah, dan memasang pengumuman penting di dashboard atlet maupun running notice aplikasi.
                </p>
                <Link
                  to="/admin/settings?tab=notices"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline pt-1"
                >
                  <span>Buka Kelola Notice</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Settings className="w-4 h-4 text-slate-300" />
                  <span>Integrasi Google Apps Script</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Menghubungkan Web App ke Google Spreadsheet resmi Cabang Kediri dan mengunduh kode script backend.
                </p>
                <Link
                  to="/admin/settings"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline pt-1"
                >
                  <span>Buka Pengaturan Sistem</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Laporan Kas & Audit</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Mencetak rekapan keuangan cabang, log aktivitas audit pengurus, serta rekapitulasi saldo kas atlet per ranting.
                </p>
                <Link
                  to="/admin/reports"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline pt-1"
                >
                  <span>Buka Laporan Keuangan</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
