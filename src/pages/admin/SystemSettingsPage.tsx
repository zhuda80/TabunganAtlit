import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AthleteCredentialItem, AppNotice, NoticeCategory, NoticeTarget, NoticePlacement, SystemSettings } from '../../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../services/gasCode';
import { formatTanggalWaktu } from '../../utils/formatters';
import {
  Settings,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Key,
  KeyRound,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  Send,
  Edit3,
  MessageCircle,
  User,
  Server,
  Database,
  Building,
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileCode,
  FolderGit2,
  Image,
  Upload,
  RotateCcw,
  Wallet,
  AlertTriangle,
  Trash2,
  Megaphone,
  Plus,
  Pin,
  Calendar,
  X,
  Trophy,
  Info,
  Layers,
  GitBranch,
  Terminal,
  Globe,
  Rocket,
  Download,
  ArrowRight,
} from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Active guide tab
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'NOTICES' | 'ATHLETE_CREDENTIALS' | 'GAS_CODE' | 'DEPLOYMENT_GUIDE'>('SETTINGS');

  // Notice Management state
  const [notices, setNotices] = useState<AppNotice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState<string>('SEMUA');
  const [noticeStatusFilter, setNoticeStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Partial<AppNotice> | null>(null);
  const [savingNotice, setSavingNotice] = useState(false);
  const [previewNoticeModal, setPreviewNoticeModal] = useState<AppNotice | null>(null);

  // Athlete Credentials state
  const [athleteCredentials, setAthleteCredentials] = useState<AthleteCredentialItem[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [credSearch, setCredSearch] = useState('');
  const [credRantingFilter, setCredRantingFilter] = useState('SEMUA');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedCredId, setCopiedCredId] = useState<string | null>(null);
  const [resetModalItem, setResetModalItem] = useState<AthleteCredentialItem | null>(null);
  const [resetNewPass, setResetNewPass] = useState('');
  const [resettingPass, setResettingPass] = useState(false);

  // Clean / Factory Reset state
  const [cleaningData, setCleaningData] = useState(false);
  const [showCleanConfirmModal, setShowCleanConfirmModal] = useState(false);

  // GAS Connection & Sync state
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  const [syncingSpreadsheet, setSyncingSpreadsheet] = useState(false);

  useEffect(() => {
    fetchSettings();
    if (user?.role === 'ADMIN') {
      fetchCredentials();
      fetchNotices();
    }
  }, [user]);

  const handleExecuteCleanDatabase = async () => {
    setCleaningData(true);
    try {
      const res = await api.resetToCleanState();
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setShowCleanConfirmModal(false);
        await fetchCredentials();
        await fetchNotices();
        await fetchSettings();
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Gagal mengosongkan data.' });
    } finally {
      setCleaningData(false);
    }
  };

  const fetchNotices = async () => {
    setLoadingNotices(true);
    try {
      const list = await api.getNotices(false);
      setNotices(list || []);
    } catch (err: any) {
      console.error('Failed to load notices:', err);
      setToast({ type: 'error', message: 'Gagal memuat data notice.' });
    } finally {
      setLoadingNotices(false);
    }
  };

  const handleToggleNotice = async (noticeId: string) => {
    try {
      const res = await api.toggleNoticeStatus(noticeId);
      if (res.success) {
        setNotices((prev) =>
          prev.map((n) => (n.id === noticeId ? (res.notice || { ...n, aktif: !n.aktif }) : n))
        );
        setToast({ type: 'success', message: res.message });
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Gagal mengubah status notice.' });
    }
  };

  const handleDeleteNotice = async (noticeId: string, judul: string) => {
    if (!window.confirm(`Yakin ingin menghapus notice "${judul}"?`)) return;
    try {
      const res = await api.deleteNotice(noticeId);
      if (res.success) {
        setNotices((prev) => prev.filter((n) => n.id !== noticeId));
        setToast({ type: 'success', message: 'Notice berhasil dihapus.' });
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Gagal menghapus notice.' });
    }
  };

  const handleOpenCreateNotice = () => {
    setEditingNotice({
      judul: '',
      isi: '',
      kategori: 'PENTING',
      target: 'SEMUA',
      penempatan: 'DASHBOARD',
      aktif: true,
      pinTop: false,
      tautanUrl: '',
      tautanLabel: '',
    });
    setIsNoticeModalOpen(true);
  };

  const handleEditNotice = (notice: AppNotice) => {
    setEditingNotice({ ...notice });
    setIsNoticeModalOpen(true);
  };

  const handleSaveNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice?.judul?.trim() || !editingNotice?.isi?.trim()) {
      setToast({ type: 'error', message: 'Judul dan isi notice wajib diisi.' });
      return;
    }

    setSavingNotice(true);
    try {
      const res = await api.saveNotice(editingNotice);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setIsNoticeModalOpen(false);
        setEditingNotice(null);
        await fetchNotices();
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Gagal menyimpan notice.' });
    } finally {
      setSavingNotice(false);
    }
  };

  const fetchCredentials = async () => {
    setLoadingCredentials(true);
    try {
      const data = await api.getAthletesCredentials();
      setAthleteCredentials(data || []);
    } catch (err: any) {
      console.error('Failed to fetch athlete credentials', err);
      setToast({ type: 'error', message: 'Gagal memuat kredensial atlit.' });
    } finally {
      setLoadingCredentials(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings?.gasApiUrl?.trim()) {
      setToast({ type: 'error', message: 'Silakan isi URL Web App Google Apps Script terlebih dahulu.' });
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await api.testGasConnection(settings.gasApiUrl);
      setTestResult(res);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Gagal menguji koneksi.' });
      setToast({ type: 'error', message: 'Gagal menguji koneksi.' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncSpreadsheet = async () => {
    setSyncingSpreadsheet(true);
    try {
      const res = await api.syncAllDataToSpreadsheet();
      if (res.success) {
        setToast({ type: 'success', message: res.message });
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Sinkronisasi gagal.' });
    } finally {
      setSyncingSpreadsheet(false);
    }
  };

  const togglePasswordVisibility = (athleteId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [athleteId]: !prev[athleteId],
    }));
  };

  const handleCopyCredential = (item: AthleteCredentialItem) => {
    const text = `Kredensial Akun Tabungan Atlit IKS PI Cabang Kota Kediri:\nNama: ${item.namaLengkap}\nUsername: ${item.username}\nPassword: ${item.passwordText}\nUnit/Ranting: ${item.unitRanting}\nNomor Induk: ${item.nomorInduk || '-'}`;
    navigator.clipboard.writeText(text);
    setCopiedCredId(item.athleteId);
    setToast({ type: 'success', message: `Kredensial ${item.namaLengkap} disalin!` });
    setTimeout(() => setCopiedCredId(null), 2500);
  };

  const handleSendWhatsApp = (item: AthleteCredentialItem) => {
    let phone = (item.nomorWhatsApp || '').replace(/\D/g, '');
    if (!phone) {
      setToast({ type: 'error', message: `Nomor WhatsApp ${item.namaLengkap} belum tercatat.` });
      return;
    }
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    } else if (!phone.startsWith('62')) {
      phone = '62' + phone;
    }

    const message = encodeURIComponent(
      `Salam Jiwa Manis! 🥋\n\n` +
      `Halo Saudara/i *${item.namaLengkap}*,\n` +
      `Berikut adalah informasi akun login Sistem Tabungan Atlit IKS PI Kera Sakti Cabang Kota Kediri:\n\n` +
      `👤 *Username:* ${item.username}\n` +
      `🔑 *Password:* ${item.passwordText}\n` +
      `🏢 *Unit/Ranting:* ${item.unitRanting}\n` +
      `🆔 *Nomor Induk:* ${item.nomorInduk || '-'}\n\n` +
      `Silakan login di aplikasi dan simpan data ini dengan baik. Terima kasih! JIENSHO!`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalItem) return;
    if (!resetNewPass || resetNewPass.trim().length < 4) {
      setToast({ type: 'error', message: 'Password baru minimal 4 karakter.' });
      return;
    }

    setResettingPass(true);
    try {
      const res = await api.resetAthletePassword(resetModalItem.athleteId, resetNewPass.trim());
      if (res.success) {
        setToast({ type: 'success', message: `Password ${resetModalItem.namaLengkap} berhasil diubah ke: ${resetNewPass.trim()}` });
        setAthleteCredentials((prev) =>
          prev.map((c) =>
            c.athleteId === resetModalItem.athleteId
              ? { ...c, passwordText: resetNewPass.trim() }
              : c
          )
        );
        setResetModalItem(null);
        setResetNewPass('');
      } else {
        setToast({ type: 'error', message: res.message || 'Gagal mengubah password atlit.' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Gagal mengubah password atlit.' });
    } finally {
      setResettingPass(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Ukuran file logo maksimal 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (settings) {
        setSettings({ ...settings, logoUrl: base64 });
      }
      setToast({ type: 'success', message: 'Logo baru dipilih! Jangan lupa klik "Simpan Pengaturan".' });
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    if (settings) {
      setSettings({ ...settings, logoUrl: '' });
      setToast({ type: 'success', message: 'Logo direset ke lambang resmi default IKS PI.' });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setToast({ type: 'success', message: 'Teks berhasil disalin ke clipboard!' });
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({ type: 'error', message: 'Password baru minimal 6 karakter.' });
      return;
    }

    setChangingPass(true);
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
      setToast({ type: 'error', message: err.message });
    } finally {
      setChangingPass(false);
    }
  };

  const handleResetAdminPassword = async () => {
    setChangingPass(true);
    try {
      const res = await api.resetDefaultAdmin();
      if (res.success) {
        setToast({ type: 'success', message: 'Password default admin berhasil diatur ulang menjadi: admin123' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Gagal mengatur ulang password admin' });
    } finally {
      setChangingPass(false);
    }
  };

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
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>KONFIGURASI & INTEGRASI SISTEM</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-serif">
          Pengaturan Sistem & Backend Google Apps Script
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola parameter operasional, rekening penerima kas, kode Google Apps Script (Code.gs), dan panduan deployment.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'SETTINGS'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Pengaturan Organisasi & Kas</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('NOTICES');
            fetchNotices();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'NOTICES'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Kelola Notice & Pengumuman</span>
          {notices.filter((n) => n.aktif).length > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'NOTICES'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {notices.filter((n) => n.aktif).length} Aktif
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('ATHLETE_CREDENTIALS');
            fetchCredentials();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'ATHLETE_CREDENTIALS'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Kredensial & Password Atlit</span>
          {athleteCredentials.length > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'ATHLETE_CREDENTIALS'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {athleteCredentials.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('GAS_CODE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'GAS_CODE'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Kode Backend (Code.gs)</span>
        </button>

        <button
          onClick={() => setActiveTab('DEPLOYMENT_GUIDE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'DEPLOYMENT_GUIDE'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Panduan Setup (AI Studio ➔ GitHub ➔ Vercel)</span>
        </button>
      </div>

      {/* TAB 1: SETTINGS */}
      {activeTab === 'SETTINGS' && settings && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveSettings} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                <span>Identitas & Rekening Kas Perguruan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Resmi Aplikasi</label>
                  <input
                    type="text"
                    value={settings.namaAplikasi}
                    onChange={(e) => setSettings({ ...settings, namaAplikasi: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Organisasi</label>
                  <input
                    type="text"
                    value={settings.organisasi}
                    onChange={(e) => setSettings({ ...settings, organisasi: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cabang Perguruan</label>
                  <input
                    type="text"
                    value={settings.cabang}
                    onChange={(e) => setSettings({ ...settings, cabang: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kontak Sekretariat</label>
                  <input
                    type="text"
                    value={settings.kontakSekretariat}
                    onChange={(e) => setSettings({ ...settings, kontakSekretariat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Logo Aplikasi Tabungan Section */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Image className="w-4 h-4" />
                      <span>Logo Aplikasi Tabungan</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ganti logo resmi yang tampil di Navbar, Sidebar, Halaman Login, dan Buku Tabungan Digital.
                    </p>
                  </div>

                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-medium border border-slate-700 flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset ke Default</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  {/* Live Preview Badge */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden border border-amber-400/40">
                        {settings.logoUrl ? (
                          <img
                            src={settings.logoUrl}
                            alt="Preview Logo"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="font-serif font-black text-amber-400 text-base">
                            IKS
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">Preview</span>
                  </div>

                  {/* Upload and URL Controls */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Unggah File Gambar Logo (PNG, JPG, SVG, WebP - Maks. 2MB)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Atau Masukkan URL Gambar Logo
                      </label>
                      <input
                        type="url"
                        value={settings.logoUrl || ''}
                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo-ikspi.png"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  Rekening Kas Organisasi (Tujuan Transfer Atlet)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nama Bank Kas</label>
                    <input
                      type="text"
                      value={settings.namaBankOrganisasi}
                      onChange={(e) => setSettings({ ...settings, namaBankOrganisasi: e.target.value })}
                      placeholder="BCA / BRI"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      value={settings.nomorRekeningOrganisasi}
                      onChange={(e) => setSettings({ ...settings, nomorRekeningOrganisasi: e.target.value })}
                      placeholder="140-00-XXXXX"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Atas Nama Rekening</label>
                    <input
                      type="text"
                      value={settings.atasNamaRekening}
                      onChange={(e) => setSettings({ ...settings, atasNamaRekening: e.target.value })}
                      placeholder="IKS PI CABANG KOTA KEDIRI"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ketentuan Nominal & Saldo Endapan Tabungan */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" />
                    <span>Ketentuan Nominal & Saldo Endapan Tabungan</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Atur saldo minimal yang wajib tertahan di buku tabungan atlet serta batas nominal transaksi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-amber-400">
                        Saldo Endapan Tabungan *
                      </label>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                        Wajib Mengendap
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Saldo minimal yang tidak dapat ditarik atlet dan harus selalu tersisa di rekening.
                    </p>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        required
                        value={settings.saldoEndapan ?? 20000}
                        onChange={(e) => setSettings({ ...settings, saldoEndapan: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-amber-500/40 rounded-xl text-xs text-amber-400 font-mono font-black focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-400">
                      Minimal Nominal Setoran *
                    </label>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Batas nominal paling sedikit per satu kali pengajuan setoran tabungan.
                    </p>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="5000"
                        step="5000"
                        required
                        value={settings.minimalSetoran ?? 10000}
                        onChange={(e) => setSettings({ ...settings, minimalSetoran: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="block text-xs font-bold text-rose-400">
                      Minimal Nominal Penarikan *
                    </label>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Batas nominal paling sedikit per satu kali pengajuan pencairan tabungan.
                    </p>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="5000"
                        step="5000"
                        required
                        value={settings.minimalPenarikan ?? 20000}
                        onChange={(e) => setSettings({ ...settings, minimalPenarikan: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Endpoint connection */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    <span>Integrasi Google Spreadsheet (Google Apps Script Web App)</span>
                  </h4>
                  {settings.gasApiUrl && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>URL Terkonfigurasi</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Masukkan URL Web App hasil deploy Google Apps Script Anda (misal: <code>https://script.google.com/macros/s/.../exec</code>). Pastikan saat deploy memilih <strong>Execute as: Me</strong> dan <strong>Who has access: Anyone</strong> agar data spreadsheet dapat diubah secara langsung.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={settings.gasApiUrl || ''}
                    onChange={(e) => {
                      setSettings({ ...settings, gasApiUrl: e.target.value });
                      setTestResult(null);
                    }}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection || !settings.gasApiUrl}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    {testingConnection ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                        <span>Menguji...</span>
                      </>
                    ) : (
                      <>
                        <Server className="w-3.5 h-3.5 text-amber-400" />
                        <span>Uji Koneksi</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Real-time URL format warning / validation card */}
                {(() => {
                  if (!settings.gasApiUrl || !settings.gasApiUrl.trim()) return null;
                  const validation = api.validateGasUrl(settings.gasApiUrl);
                  if (validation.isValid) {
                    return (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          Format URL Web App Sesuai (/exec)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSettings({ ...settings, gasApiUrl: '' });
                            setTestResult(null);
                            setToast({ type: 'success', message: 'URL dinonaktifkan. Mode lokal aktif.' });
                          }}
                          className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          Hapus URL
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                        <div className="space-y-1">
                          <p className="font-bold text-amber-400">Peringatan Format URL:</p>
                          <p className="leading-relaxed">{validation.warning}</p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSettings({ ...settings, gasApiUrl: '' });
                            setTestResult(null);
                            setToast({ type: 'success', message: 'URL telah dihapus. Aplikasi kembali ke database lokal yang aman.' });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus URL Ini & Pakai Mode Database Lokal</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Test Result Card */}
                {testResult && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{testResult.message}</p>
                      {testResult.success && (
                        <p className="text-[11px] text-emerald-300/80 mt-1">
                          Database Google Spreadsheet aktif dan terhubung. Seluruh perubahan profil atlet, setoran, dan penarikan akan langsung tersimpan di spreadsheet Anda.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Sync to Spreadsheet Action Box */}
                {settings.gasApiUrl && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sinkronkan Data ke Google Spreadsheet</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tekan tombol ini jika spreadsheet Anda masih kosong agar seluruh data atlet lokal dan akun demo langsung masuk ke sheet <code>DATA_ATLIT</code> dan <code>USERS</code>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSyncSpreadsheet}
                      disabled={syncingSpreadsheet}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-400 font-bold text-xs border border-amber-500/40 flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      {syncingSpreadsheet ? (
                        <>
                          <span className="inline-block w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                          <span>Menyinkronkan...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Sinkronkan Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Admin & Reset Data */}
          <div className="space-y-6">
            <form onSubmit={handleChangePassword} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Ganti Password Admin</span>
              </h3>
              <p className="text-xs text-slate-400">
                Ubah password akun admin pengurus secara berkala untuk menjaga keamanan sistem.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password Lama</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ulangi Password Baru</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="submit"
                  disabled={changingPass}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 transition cursor-pointer"
                >
                  {changingPass ? 'Memproses...' : 'Ubah Password'}
                </button>
                <button
                  type="button"
                  onClick={handleResetAdminPassword}
                  disabled={changingPass}
                  className="px-3 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs border border-slate-800 transition cursor-pointer"
                  title="Kembalikan password ke default: admin123"
                >
                  Reset Default (admin123)
                </button>
              </div>
            </form>

            {/* Reset Database to Clean / Ready-for-Publish State */}
            <div className="bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border border-rose-900/40 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Kondisi Bersih (Reset Basis Data)</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kosongkan seluruh data atlit uji coba, pendaftaran pending, setoran, penarikan, dan mutasi kas. Hanya menyisakan akun admin default (<span className="font-mono text-amber-400">admin</span> / <span className="font-mono text-amber-400">admin123</span>) agar aplikasi bersih dan siap digunakan live.
              </p>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-rose-900/30 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kondisi Setelah Dikosongkan:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  <li>Total Atlit Terdaftar: 0</li>
                  <li>Total Saldo Kas Atlit: Rp 0</li>
                  <li>Riwayat Transaksi: Kosong (0 transaksi)</li>
                  <li>Login Admin: <strong className="text-white">admin</strong> / <strong className="text-white">admin123</strong></li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setShowCleanConfirmModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Kosongkan Seluruh Data (Mulai Baru)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: NOTICE & PENGUMUMAN MANAGEMENT */}
      {activeTab === 'NOTICES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <Megaphone className="w-3.5 h-3.5" />
                <span>PENGELOLAAN NOTICE & PENGUMUMAN SISTEM</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white font-serif">
                Kelola Notice & Pengumuman Atlit
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Publikasikan pengumuman penting, batas waktu setoran kas, jadwal latihan gabungan, maupun informasi kejuaraan silat yang akan tampil langsung di banner atas dan dashboard atlit.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <button
                type="button"
                onClick={fetchNotices}
                disabled={loadingNotices}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                title="Segarkan daftar notice"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingNotices ? 'animate-spin text-amber-400' : ''}`} />
                <span>Segarkan</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateNotice}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Notice Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Total Notice</span>
              <span className="text-xl font-bold text-white">{notices.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20">
              <span className="text-[11px] text-emerald-400/90 block mb-1">Notice Aktif Tayang</span>
              <span className="text-xl font-bold text-emerald-400">
                {notices.filter((n) => n.aktif).length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20">
              <span className="text-[11px] text-amber-400/90 block mb-1">Banner Atas (Top)</span>
              <span className="text-xl font-bold text-amber-400">
                {notices.filter((n) => n.aktif && n.penempatan === 'BANNER_TOP').length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/20">
              <span className="text-[11px] text-blue-400/90 block mb-1">Target Atlit</span>
              <span className="text-xl font-bold text-blue-400">
                {notices.filter((n) => n.target === 'ATLIT' || n.target === 'SEMUA').length}
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                placeholder="Cari notice berdasarkan judul atau isi..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={noticeCategoryFilter}
                onChange={(e) => setNoticeCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="SEMUA">Semua Kategori</option>
                <option value="PENTING">PENTING (Merah)</option>
                <option value="KEJUARAAN">KEJUARAAN (Emas)</option>
                <option value="INFO">INFO UMUM (Biru)</option>
                <option value="PERINGATAN">PERINGATAN (Oranye)</option>
                <option value="AGENDA">AGENDA (Ungu)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={noticeStatusFilter}
                onChange={(e: any) => setNoticeStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Hanya Aktif</option>
                <option value="INACTIVE">Hanya Non-Aktif</option>
              </select>
            </div>
          </div>

          {/* Notice List */}
          {loadingNotices ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <div className="inline-block w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">Memuat daftar notice...</p>
            </div>
          ) : (() => {
            const filtered = notices.filter((n) => {
              const q = noticeSearch.toLowerCase();
              const matchQ = !q || n.judul.toLowerCase().includes(q) || n.isi.toLowerCase().includes(q);
              const matchCat = noticeCategoryFilter === 'SEMUA' || n.kategori === noticeCategoryFilter;
              const matchStat =
                noticeStatusFilter === 'ALL' ||
                (noticeStatusFilter === 'ACTIVE' && n.aktif) ||
                (noticeStatusFilter === 'INACTIVE' && !n.aktif);
              return matchQ && matchCat && matchStat;
            });

            if (filtered.length === 0) {
              return (
                <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <Megaphone className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-white">Belum ada notice yang sesuai kriteria</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Klik tombol "Buat Notice Baru" untuk menambahkan pengumuman resmi ke atlit atau sesuaikan kata kunci pencarian.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreateNotice}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Notice Sekarang</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filtered.map((item) => {
                  const getBadgeColor = (cat: string) => {
                    switch (cat) {
                      case 'PENTING':
                        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                      case 'KEJUARAAN':
                        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                      case 'PERINGATAN':
                        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
                      case 'AGENDA':
                        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                      default:
                        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                    }
                  };

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl bg-slate-950 border transition shadow-lg ${
                        item.pinTop
                          ? 'border-amber-500/40 ring-1 ring-amber-500/20'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Badges & Switch */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getBadgeColor(
                              item.kategori
                            )}`}
                          >
                            {item.kategori}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                            Target: {item.target}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                            Lokasi: {item.penempatan === 'BANNER_TOP' ? 'Banner Atas' : item.penempatan === 'MODAL_POPUP' ? 'Modal Popup' : 'Dashboard'}
                          </span>

                          {item.pinTop && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                              <Pin className="w-2.5 h-2.5" />
                              <span>PIN TERATAS</span>
                            </span>
                          )}
                        </div>

                        {/* Status Toggle Switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            {item.aktif ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                AKTIF
                              </span>
                            ) : (
                              <span className="text-slate-500">NON-AKTIF</span>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleNotice(item.id)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                              item.aktif ? 'bg-emerald-500' : 'bg-slate-800'
                            }`}
                            title={item.aktif ? 'Klik untuk non-aktifkan' : 'Klik untuk aktifkan'}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 transition-transform ${
                                item.aktif ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-white font-serif">{item.judul}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{item.isi}</p>

                        {item.tautanUrl && (
                          <div className="pt-1">
                            <a
                              href={item.tautanUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
                            >
                              <span>{item.tautanLabel || 'Buka Tautan Terkait'}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-900 text-[11px] text-slate-500">
                        <div className="flex items-center gap-3">
                          <span>
                            Dibuat: <strong className="text-slate-400">{formatTanggalWaktu(item.createdAt)}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Oleh: <strong className="text-slate-400">{item.createdBy || 'Admin'}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewNoticeModal(item)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1"
                            title="Pratinjau tampilan atlit"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Pratinjau</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditNotice(item)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition cursor-pointer flex items-center gap-1"
                            title="Edit notice"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteNotice(item.id, item.judul)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer flex items-center gap-1"
                            title="Hapus notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB: ATHLETE CREDENTIALS & PASSWORDS */}
      {activeTab === 'ATHLETE_CREDENTIALS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>PENGELOLAAN PASSWORD & KREDENSIAL ATLIT</span>
              </div>
              <h3 className="text-xl font-bold text-white font-serif">
                Daftar Kredensial & Password Akun Atlit
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Admin dapat melihat password atlit yang lupa, menyalin data akun untuk dikirim via WhatsApp, atau mereset password akun atlit secara instan.
              </p>
            </div>

            <button
              onClick={fetchCredentials}
              disabled={loadingCredentials}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition cursor-pointer self-start lg:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCredentials ? 'animate-spin text-amber-400' : ''}`} />
              <span>{loadingCredentials ? 'Memuat Data...' : 'Segarkan Data'}</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={credSearch}
                onChange={(e) => setCredSearch(e.target.value)}
                placeholder="Cari berdasarkan nama atlit, username, nomor induk, atau nomor WA..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <select
                value={credRantingFilter}
                onChange={(e) => setCredRantingFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="SEMUA">Semua Unit / Ranting</option>
                {Array.from(new Set(athleteCredentials.map((c) => c.unitRanting).filter(Boolean))).map((ranting) => (
                  <option key={ranting} value={ranting}>
                    {ranting}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table / List */}
          {loadingCredentials ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <div className="inline-block w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">Memuat kredensial atlit...</p>
            </div>
          ) : (() => {
            const filtered = athleteCredentials.filter((c) => {
              const q = credSearch.toLowerCase();
              const matchQuery =
                !q ||
                c.namaLengkap.toLowerCase().includes(q) ||
                c.username.toLowerCase().includes(q) ||
                (c.nomorInduk || '').toLowerCase().includes(q) ||
                (c.nomorWhatsApp || '').includes(q) ||
                c.unitRanting.toLowerCase().includes(q);

              const matchRanting = credRantingFilter === 'SEMUA' || c.unitRanting === credRantingFilter;
              return matchQuery && matchRanting;
            });

            if (filtered.length === 0) {
              return (
                <div className="p-10 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <User className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-white">Tidak ada data kredensial atlit ditemukan</p>
                  <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau filter ranting Anda.</p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Nama Atlit & Nomor Induk</th>
                      <th className="py-3 px-4">Username Login</th>
                      <th className="py-3 px-4">Password</th>
                      <th className="py-3 px-4">Unit / Ranting</th>
                      <th className="py-3 px-4">Kontak WhatsApp</th>
                      <th className="py-3 px-4 text-right">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 text-slate-300">
                    {filtered.map((item) => {
                      const isRevealed = !!visiblePasswords[item.athleteId];
                      return (
                        <tr key={item.athleteId} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{item.namaLengkap}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  item.status === 'AKTIF'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              No. Induk: <span className="font-mono text-amber-300">{item.nomorInduk || '-'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-400 font-semibold">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.username}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="inline-flex items-center gap-1.5">
                              {isRevealed ? (
                                <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-xs">
                                  {item.passwordText}
                                </span>
                              ) : (
                                <span className="font-mono text-slate-500 tracking-widest bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                                  ••••••••
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(item.athleteId)}
                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                                title={isRevealed ? 'Sembunyikan password' : 'Lihat password'}
                              >
                                {isRevealed ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-300">
                            <span>{item.unitRanting}</span>
                          </td>

                          <td className="py-3 px-4 text-slate-300">
                            <span className="font-mono">{item.nomorWhatsApp || '-'}</span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyCredential(item)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                                title="Salin kredensial akun"
                              >
                                {copiedCredId === item.athleteId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden sm:inline">
                                  {copiedCredId === item.athleteId ? 'Tersalin' : 'Salin'}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSendWhatsApp(item)}
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                                title="Kirim data login ke WhatsApp atlit"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Kirim WA</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setResetModalItem(item);
                                  setResetNewPass('');
                                }}
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                                title="Reset / Ganti Password Atlit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Ubah</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* Quick Help Guide for Admin */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-300 space-y-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Petunjuk Bantuan Lupa Password Atlit</span>
            </span>
            <p className="leading-relaxed">
              Jika ada atlet yang menghubungi pengurus/admin karena <strong>lupa password</strong>:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-300">
              <li>Cari nama atlet pada kolom pencarian di atas.</li>
              <li>Klik ikon <strong>Mata</strong> pada kolom Password untuk melihat password yang sedang aktif.</li>
              <li>Klik tombol <strong>Salin</strong> atau <strong>Kirim WA</strong> untuk meneruskan info akun ke WhatsApp atlet yang bersangkutan secara otomatis.</li>
              <li>Jika atlet ingin mengganti password baru, klik tombol <strong>Ubah</strong> dan ketikkan password baru. Password akan otomatis tersinkronisasi ke sistem dan Google Sheets!</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 2: GAS CODE VIEWER */}
      {activeTab === 'GAS_CODE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <span>Source Code Lengkap Google Apps Script (Code.gs)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Salin seluruh kode di bawah ini dan tempelkan ke editor Apps Script Google Spreadsheet Anda.
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                copiedCode
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Semua Kode.gs'}</span>
            </button>
          </div>

          {/* Important instructions for updating deployment */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Penting: Cara Memperbarui Kode jika Mengalami "Sinkronisasi Gagal"</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Klik tombol <strong>"Salin Semua Kode.gs"</strong> di atas.</li>
              <li>Buka proyek Google Apps Script Anda (di Google Spreadsheet: menu <em>Extensions &gt; Apps Script</em>).</li>
              <li>Hapus semua kode lama di file <code>Code.gs</code> lalu <strong>Paste (Tempel)</strong> kode baru ini.</li>
              <li>Klik ikon <strong>Simpan (Save / Ctrl+S)</strong>.</li>
              <li>
                <strong>Wajib Deploy Versi Baru:</strong> Klik <strong>Deploy</strong> (Terapkan) &gt; <strong>Manage deployments</strong> (Kelola penerapan) &gt; Klik ikon <strong>Edit</strong> (pensil) &gt; Di bagian Version pilih <strong>New version</strong> (Versi baru) &gt; Klik <strong>Deploy</strong>.
              </li>
              <li>Kembali ke aplikasi ini dan klik <strong>"Sinkronkan Semua Data ke Spreadsheet"</strong> di tab Pengaturan Umum. Semua lembar kerja (9 sheets) termasuk tab Pendaftaran atlet akan otomatis dibuat dan disinkronkan!</li>
            </ol>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-[500px] overflow-y-auto overflow-x-auto leading-relaxed">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETE DEPLOYMENT GUIDE (AI STUDIO -> GITHUB -> VERCEL) */}
      {activeTab === 'DEPLOYMENT_GUIDE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
              <Rocket className="w-3.5 h-3.5" />
              <span>PANDUAN LENGKAP DISTRIBUSI & DEPLOYMENT</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white font-serif">
              Panduan Step-by-Step: Google AI Studio ➔ GitHub ➔ Vercel
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ikuti seluruh panduan terstruktur ini untuk mempublikasikan aplikasi Tabungan Atlit IKS PI Kera Sakti Cabang Kota Kediri secara live di internet dengan domain gratis SSL 24 jam nonstop.
            </p>

            {/* Architecture flow pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">Google AI Studio</div>
                  <div className="text-[10px] text-slate-400">Unduh / Ekspor Kode</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">GitHub Repository</div>
                  <div className="text-[10px] text-slate-400">Pusat Source Code & CI/CD</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">Vercel Hosting</div>
                  <div className="text-[10px] text-slate-400">Live Website 24/7 SSL Gratis</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                  4
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">Google Sheets & Drive</div>
                  <div className="text-[10px] text-slate-400">Database & Bukti Transfer</div>
                </div>
              </div>
            </div>
          </div>

          {/* FASE 1: GOOGLE SPREADSHEET & APPS SCRIPT SETUP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 border-b border-amber-500/20 pb-2 font-mono">
              <Database className="w-4 h-4 text-amber-400" />
              <span>FASE 1: MENYIAPKAN DATABASE GOOGLE SPREADSHEET & APPS SCRIPT</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold text-[11px]">LANGKAH 1: BUAT SPREADSHEET BARU</span>
                <p>
                  Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-amber-400 underline inline-flex items-center gap-1 font-semibold">sheets.new <ExternalLink className="w-3 h-3" /></a> di browser Google Anda.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Beri nama spreadsheet: <strong className="text-white">DATABASE TABUNGAN ATLIT IKS PI KOTA KEDIRI</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold text-[11px]">LANGKAH 2: BUKA APPS SCRIPT</span>
                <p>
                  Di lembar spreadsheet, klik menu atas: <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Beri nama proyek di pojok kiri atas: <strong className="text-white">Backend_Tabungan_IKSPI</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold text-[11px]">LANGKAH 3: TEMPEL KODE (Code.gs)</span>
                <p>
                  Buka tab <strong>"Kode Backend (Code.gs)"</strong> pada halaman ini, klik tombol <strong>"Salin Semua Kode.gs"</strong>.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Hapus semua kode lama di Apps Script, paste kode baru ini, lalu tekan <strong>Simpan (Ctrl + S)</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold text-[11px]">LANGKAH 4: INISIALISASI DATABASE & DRIVE</span>
                <p>
                  Di toolbar atas Apps Script, pilih fungsi <code>initDatabase</code> lalu klik tombol <strong>Jalankan (Run)</strong>.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Beri izin akses (<em>Review Permissions &gt; Advanced &gt; Go to Backend_Tabungan_IKSPI</em>). Otomatis membuat 9 sheet lengkap dan folder Google Drive bukti transfer!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2 text-xs">
              <span className="font-mono text-amber-400 font-bold text-[11px] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>LANGKAH 5: DEPLOY SEBAGAI WEB APP (MENDAPATKAN URL BACKEND)</span>
              </span>
              <p className="text-slate-300 text-[11px]">
                Di Google Apps Script, klik tombol biru <strong>Deploy (Terapkan)</strong> di pojok kanan atas &gt; pilih <strong>New deployment (Penerapan baru)</strong>:
              </p>
              <ul className="list-disc pl-5 text-slate-300 space-y-1 text-[11px]">
                <li>Klik ikon roda gigi (Select type) &gt; pilih <strong>Web app</strong>.</li>
                <li>Description: <code>API Tabungan Atlit v1</code></li>
                <li>Execute as: <strong>Me (email Google Anda)</strong></li>
                <li>
                  <strong className="text-amber-300">Who has access: Wajib pilih "Anyone" (Siapa saja)</strong> agar aplikasi web frontend dapat menyimpan data tanpa terhalang form login Google!
                </li>
                <li>Klik <strong>Deploy</strong>, lalu salin <strong>Web App URL</strong> yang berakhiran <code>/exec</code>.</li>
              </ul>
            </div>
          </div>

          {/* FASE 2: EXPORT FROM AI STUDIO TO GITHUB */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 border-b border-amber-500/20 pb-2 font-mono">
              <FolderGit2 className="w-4 h-4 text-purple-400" />
              <span>FASE 2: EKSPOR KODE DARI GOOGLE AI STUDIO KE REPOSITORY GITHUB</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold text-[11px]">LANGKAH 6: UNDUH / EKSPOR SOURCE CODE DARI GOOGLE AI STUDIO</span>
                <p>
                  Di antarmuka Google AI Studio Build tempat Anda sedang membuka proyek ini:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="font-bold text-white text-[11px] mb-1 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Metode A: Download Zip (Paling Direkomendasikan)</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Klik tombol <strong>Export / Download Code</strong> di pojok kanan atas layar AI Studio. Simpan file zip dan ekstrak ke folder komputer Anda (misal: <code>C:\Projects\tabungan-atlit-ikspi</code>).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="font-bold text-white text-[11px] mb-1 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                      <span>Metode B: Connect / Push Langsung via AI Studio Git</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Jika di toolbar AI Studio tersedia opsi <strong>"Push to GitHub"</strong> atau <strong>"Export to GitHub"</strong>, Anda dapat langsung mengaitkan akun GitHub dan AI Studio akan membuatkan repository otomatis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold text-[11px]">LANGKAH 7: BUAT REPOSITORY BARU DI GITHUB</span>
                <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-[11px]">
                  <li>
                    Buka situs <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold inline-flex items-center gap-1">github.com/new <ExternalLink className="w-3 h-3" /></a> dan pastikan Anda sudah login ke akun GitHub.
                  </li>
                  <li>
                    Di kolom <strong>Repository name</strong>, ketikkan: <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">tabungan-atlit-ikspi</code>.
                  </li>
                  <li>
                    Pilih <strong>Public</strong> (dapat dilihat publik) atau <strong>Private</strong> (rahasia hanya akun Anda) sesuai preferensi.
                  </li>
                  <li>
                    <strong className="text-amber-400">PENTING:</strong> Jangan centang <em>"Add a README file"</em>, jangan centang <em>"Add .gitignore"</em>, dan jangan centang <em>"Choose a license"</em> karena file-file tersebut sudah lengkap disediakan di dalam proyek ini.
                  </li>
                  <li>
                    Klik tombol hijau <strong>Create repository</strong>.
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-mono text-amber-400 font-bold text-[11px] flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>LANGKAH 8: PUSH KODE KE GITHUB DARI KOMPUTER ANDA</span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopySnippet(
                        'git-commands',
                        `git init\ngit add .\ngit commit -m "feat: initial commit tabungan atlit iks pi kota kediri"\ngit branch -M main\ngit remote add origin https://github.com/USERNAME_ANDA/tabungan-atlit-ikspi.git\ngit push -u origin main`
                      )
                    }
                    className="self-start sm:self-auto px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    {copiedSnippet === 'git-commands' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'git-commands' ? 'Tersalin!' : 'Salin Perintah Git'}</span>
                  </button>
                </div>

                <p className="text-slate-400 text-[11px]">
                  Buka Command Prompt (CMD), PowerShell, atau Git Bash di dalam folder proyek hasil unduhan tadi, lalu jalankan perintah berikut (ganti <code>USERNAME_ANDA</code> dengan username GitHub Anda):
                </p>

                <div className="relative">
                  <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300 leading-relaxed overflow-x-auto">
{`# 1. Masuk ke folder proyek
cd path/ke/folder/tabungan-atlit-ikspi

# 2. Inisialisasi git lokal
git init

# 3. Tambahkan semua file proyek
git add .

# 4. Buat commit pertama
git commit -m "feat: initial commit tabungan atlit iks pi kota kediri"

# 5. Ubah branch utama menjadi main
git branch -M main

# 6. Hubungkan ke repository GitHub Anda (ganti USERNAME_ANDA)
git remote add origin https://github.com/USERNAME_ANDA/tabungan-atlit-ikspi.git

# 7. Upload / push kode ke GitHub
git push -u origin main`}
                  </pre>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                  <span>
                    <strong>Otomatis Aman:</strong> File <code>.gitignore</code> sudah kami sertakan dalam proyek ini sehingga folder berat <code>node_modules</code> dan file cache tidak akan ter-upload ke GitHub.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FASE 3: DEPLOYMENT KE VERCEL */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 border-b border-amber-500/20 pb-2 font-mono">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>FASE 3: HUBUNGKAN GITHUB KE VERCEL (WEBSITE ONLINE 24 JAM)</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold text-[11px]">LANGKAH 9: LOGIN & IMPOR PROYEK DI VERCEL</span>
                <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-[11px]">
                  <li>
                    Buka situs <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold inline-flex items-center gap-1">vercel.com <ExternalLink className="w-3 h-3" /></a>.
                  </li>
                  <li>
                    Klik <strong>Sign Up</strong> atau <strong>Log In</strong>, lalu pilih <strong>Continue with GitHub</strong> untuk menyinkronkan akun.
                  </li>
                  <li>
                    Pada dashboard Vercel, klik tombol <strong>"Add New..."</strong> di kanan atas, lalu pilih <strong>"Project"</strong>.
                  </li>
                  <li>
                    Di bagian <em>"Import Git Repository"</em>, cari repository <strong>tabungan-atlit-ikspi</strong> yang baru saja dibuat, lalu klik tombol biru <strong>"Import"</strong> di sebelahnya.
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-mono text-amber-400 font-bold text-[11px]">LANGKAH 10: KONFIGURASI BUILD SETTINGS DI VERCEL</span>
                <p className="text-slate-400 text-[11px]">
                  Pada layar <em>"Configure Project"</em>, pastikan pengaturan berikut sesuai:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Framework Preset:</span>
                    <div className="font-mono font-bold text-white flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Vite</span>
                      <span>(Otomatis terdeteksi)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Root Directory:</span>
                    <div className="font-mono font-bold text-white">./ (Biarkan default)</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Build Command:</span>
                    <div className="font-mono font-bold text-amber-300">npm run build</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Output Directory:</span>
                    <div className="font-mono font-bold text-white">dist</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Versi Node.js: 20.x atau 22.x</span>
                  </div>
                  <p className="text-slate-400">
                    File <code>package.json</code> telah disesuaikan untuk kompatibilitas penuh Node.js 22.x di server Vercel.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-mono text-amber-400 font-bold text-[11px]">LANGKAH 11: ATUR ENVIRONMENT VARIABLES (VITE_API_URL)</span>
                  <button
                    onClick={() =>
                      handleCopySnippet('env-key', 'VITE_API_URL')
                    }
                    className="self-start sm:self-auto px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    {copiedSnippet === 'env-key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'env-key' ? 'Tersalin!' : 'Salin Key: VITE_API_URL'}</span>
                  </button>
                </div>

                <p className="text-slate-400 text-[11px]">
                  Buka dropdown <strong>"Environment Variables"</strong> di halaman konfigurasi Vercel sebelum mengklik Deploy:
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-bold text-slate-400 w-20">Key:</span>
                    <code className="px-2 py-1 rounded bg-slate-950 border border-slate-700 font-mono text-amber-400 font-bold">
                      VITE_API_URL
                    </code>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-bold text-slate-400 w-20">Value:</span>
                    <span className="text-slate-300 font-mono text-[10px] break-all">
                      https://script.google.com/macros/s/AKfycb.../exec (URL Web App dari Langkah 5)
                    </span>
                  </div>
                  <p className="text-slate-500 text-[10px] pt-1">
                    * Catatan: Jika saat deploy awal Anda belum memasang Apps Script, variabel ini bisa dikosongkan terlebih dahulu; aplikasi otomatis memakai persistent database lokal dan dapat ditautkan ke Spreadsheet kapan saja!
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <span className="font-mono text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                  <Rocket className="w-4 h-4 text-emerald-400" />
                  <span>LANGKAH 12: KLIK "DEPLOY" & WEBSITE SELESAI DITERBITKAN!</span>
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Klik tombol biru <strong>"Deploy"</strong>. Tunggu sekitar 1 hingga 2 menit hingga proses build selesai. Setelah muncul animasi kembang api sukses, Vercel akan langsung memberikan link domain website Anda yang aktif 24 jam nonstop, misalnya:
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <code className="text-emerald-400 font-mono text-xs font-bold">
                    https://tabungan-atlit-ikspi.vercel.app
                  </code>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    LIVE ONLINE SSL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FASE 4: VERIFIKASI & TIPS PEMELIHARAAN */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 border-b border-amber-500/20 pb-2 font-mono">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>FASE 4: VERIFIKASI AKHIR & PEMELIHARAAN SISTEM OTOMATIS (CI/CD)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold text-[11px]">LOGIN PERTAMA SEBAGAI ADMIN</span>
                <p className="text-[11px] leading-relaxed">
                  Buka website Vercel yang baru Anda dapatkan, lalu login menggunakan akun admin default:
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-200">
                  <div>Username: <strong className="text-amber-400">admin</strong></div>
                  <div>Password: <strong className="text-emerald-400">admin123</strong></div>
                </div>
                <p className="text-slate-400 text-[10px]">
                  Buka menu <strong>Pengaturan Sistem</strong> &gt; klik <strong>"Sinkronkan Semua Data ke Spreadsheet"</strong> untuk memvalidasi koneksi awal.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold text-[11px]">UPDATE OTOMATIS DI MASA DEPAN (CI/CD)</span>
                <p className="text-[11px] leading-relaxed">
                  Setiap kali Anda mengedit kode di masa depan, cukup push commit baru ke GitHub:
                </p>
                <code className="block p-2 rounded bg-slate-900 border border-slate-800 text-amber-300 font-mono text-[10px]">
                  git add . && git commit -m "Update fitur" && git push
                </code>
                <p className="text-emerald-400 text-[10px]">
                  Vercel akan otomatis mendeteksi perubahan dan memperbarui website live Anda dalam hitungan detik tanpa mematikan sistem (zero-downtime)!
                </p>
              </div>
            </div>

            {/* Troubleshooting Box */}
            <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Troubleshooting: Pertanyaan & Solusi Kendala Umum</span>
              </div>

              <div className="space-y-2.5 text-[11px] text-slate-300 pl-2 border-l-2 border-amber-500/40">
                <div>
                  <strong className="text-white">1. Halaman Error 404 saat Refresh di Vercel?</strong>
                  <p className="text-slate-400 mt-0.5">
                    <strong>Sudah Teratasi Otomatis:</strong> Kami telah menyertakan file <code>vercel.json</code> dengan aturan routing rewrite ke <code>/index.html</code>. Halaman dashboard admin, login, dan formulir atlet akan tetap berjalan normal saat di-refresh (F5).
                  </p>
                </div>

                <div>
                  <strong className="text-white">2. Error "SyntaxError: Unexpected end of JSON input"?</strong>
                  <p className="text-slate-400 mt-0.5">
                    Penyebab utama: Pilihan <em>"Who has access"</em> di Google Apps Script belum diset ke <strong>"Anyone"</strong>, atau URL yang dimasukkan bukan URL Web App berakhiran <code>/exec</code>. Pastikan memilih <strong>New version</strong> setiap kali melakukan Deploy ulang di Apps Script.
                  </p>
                </div>

                <div>
                  <strong className="text-white">3. Menggunakan Domain Sendiri (Custom Domain)?</strong>
                  <p className="text-slate-400 mt-0.5">
                    Di dashboard Vercel, buka <strong>Settings &gt; Domains</strong>, masukkan domain Anda (misal: <code>tabungan.ikspikediri.org</code>), lalu ikuti petunjuk DNS (CNAME / A record) yang diberikan oleh Vercel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password Atlit */}
      {resetModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-800 pb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>RESET / GANTI PASSWORD ATLIT</span>
              </div>
              <h3 className="text-lg font-bold text-white font-serif">
                Ubah Password Akun
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Atur password baru untuk atlet <strong className="text-white">{resetModalItem.namaLengkap}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Username:</span>
                <span className="font-mono font-bold text-amber-400">{resetModalItem.username}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Unit / Ranting:</span>
                <span className="text-white">{resetModalItem.unitRanting}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Password Saat Ini:</span>
                <span className="font-mono text-emerald-400 font-bold">{resetModalItem.passwordText}</span>
              </div>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ketik Password Baru
                </label>
                <input
                  type="text"
                  required
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  placeholder="Contoh: atlit123 atau pass baru"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Quick presets */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Pilihan Cepat Template Password:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['atlit123', 'ikspi2025', 'kediri123', 'juara2025'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setResetNewPass(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] font-mono text-amber-400 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setResetModalItem(null);
                    setResetNewPass('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resettingPass || !resetNewPass || resetNewPass.trim().length < 4}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {resettingPass ? (
                    <>
                      <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Notice */}
      {isNoticeModalOpen && editingNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-1">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>{editingNotice.id ? 'EDIT PENGUMUMAN' : 'BUAT NOTICE BARU'}</span>
                </div>
                <h3 className="text-xl font-bold text-white font-serif">
                  {editingNotice.id ? 'Perbarui Pengumuman Sistem' : 'Tambah Notice / Pengumuman Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNoticeModalOpen(false);
                  setEditingNotice(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Template Fill Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Template Cepat Pengumuman:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditingNotice({
                      ...editingNotice,
                      judul: 'Batas Penyetoran Kas Tabungan Bulanan',
                      isi: 'Diberitahukan kepada seluruh atlit aktif IKS PI Cabang Kota Kediri untuk melakukan penyetoran tabungan wajib bulanan paling lambat tanggal 25. Mohon lampirkan struk transfer yang jelas.',
                      kategori: 'PENTING',
                      target: 'ATLIT',
                      penempatan: 'DASHBOARD',
                      pinTop: true,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 text-[11px] font-medium transition cursor-pointer"
                >
                  ⚡ Jadwal Setoran
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingNotice({
                      ...editingNotice,
                      judul: 'Pendaftaran Atlet Kejuaraan Cabang (Kejurcab)',
                      isi: 'Pendaftaran kontingen atlet Kejurcab Kota Kediri telah dibuka. Saldo tabungan atlet dapat digunakan untuk pembayaran biaya pendaftaran & seragam tanding.',
                      kategori: 'KEJUARAAN',
                      target: 'SEMUA',
                      penempatan: 'DASHBOARD',
                      pinTop: false,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 text-[11px] font-medium transition cursor-pointer"
                >
                  🥋 Kejuaraan Cabang
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingNotice({
                      ...editingNotice,
                      judul: 'Bantuan Login & Pemulihan Password',
                      isi: 'Bagi atlit yang mengalami lupa password atau kendala login, silakan gunakan tombol "Lupa Password?" pada halaman login atau hubungi admin ranting masing-masing.',
                      kategori: 'INFO',
                      target: 'SEMUA',
                      penempatan: 'BANNER_TOP',
                      pinTop: false,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 text-[11px] font-medium transition cursor-pointer"
                >
                  🔑 Lupa Password
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveNoticeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Pengumuman / Notice <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingNotice.judul || ''}
                  onChange={(e) => setEditingNotice({ ...editingNotice, judul: e.target.value })}
                  placeholder="Contoh: Jadwal Setoran Rutin Kas Tabungan Atlit"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Isi Teks Pengumuman <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingNotice.isi || ''}
                  onChange={(e) => setEditingNotice({ ...editingNotice, isi: e.target.value })}
                  placeholder="Ketikkan isi pemberitahuan secara lengkap dan jelas..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={editingNotice.kategori || 'PENTING'}
                    onChange={(e: any) => setEditingNotice({ ...editingNotice, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="PENTING">PENTING (Merah)</option>
                    <option value="KEJUARAAN">KEJUARAAN (Emas)</option>
                    <option value="INFO">INFO UMUM (Biru)</option>
                    <option value="PERINGATAN">PERINGATAN (Oranye)</option>
                    <option value="AGENDA">AGENDA (Ungu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Penempatan</label>
                  <select
                    value={editingNotice.penempatan || 'DASHBOARD'}
                    onChange={(e: any) => setEditingNotice({ ...editingNotice, penempatan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="DASHBOARD">Dashboard Atlit & Admin</option>
                    <option value="BANNER_TOP">Banner Berjalan Atas (Header)</option>
                    <option value="MODAL_POPUP">Modal Pop-up Saat Buka</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audiens</label>
                  <select
                    value={editingNotice.target || 'SEMUA'}
                    onChange={(e: any) => setEditingNotice({ ...editingNotice, target: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="SEMUA">Semua Pengguna</option>
                    <option value="ATLIT">Khusus Atlit</option>
                    <option value="ADMIN">Khusus Pengurus / Admin</option>
                  </select>
                </div>
              </div>

              {/* Tautan URL Opsional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tautan Eksternal / WhatsApp (Opsional)
                  </label>
                  <input
                    type="url"
                    value={editingNotice.tautanUrl || ''}
                    onChange={(e) => setEditingNotice({ ...editingNotice, tautanUrl: e.target.value })}
                    placeholder="https://wa.me/62812... atau link formulir"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Label Tombol Tautan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={editingNotice.tautanLabel || ''}
                    onChange={(e) => setEditingNotice({ ...editingNotice, tautanLabel: e.target.value })}
                    placeholder="Contoh: Hubungi Humas / Buka Brosur"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Checkboxes: Pin & Status */}
              <div className="flex flex-wrap items-center gap-6 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingNotice.pinTop}
                    onChange={(e) => setEditingNotice({ ...editingNotice, pinTop: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                  />
                  <span>Pin di bagian paling atas (Prioritas Utama)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNotice.aktif !== false}
                    onChange={(e) => setEditingNotice({ ...editingNotice, aktif: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span>Aktifkan notice ini sekarang</span>
                </label>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pratinjau Tampilan Notice</span>
                </span>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {editingNotice.kategori || 'PENTING'}
                    </span>
                    {editingNotice.pinTop && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1">
                        <Pin className="w-3 h-3" /> PIN TERATAS
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white font-serif">{editingNotice.judul || 'Judul Pengumuman'}</h4>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {editingNotice.isi || 'Isi pengumuman akan tampil di sini...'}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsNoticeModalOpen(false);
                    setEditingNotice(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={savingNotice}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
                >
                  {savingNotice ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingNotice.id ? 'Simpan Perubahan' : 'Terbitkan Notice'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Tampilan */}
      {previewNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Eye className="w-3.5 h-3.5" />
                <span>PRATINJAU NOTICE ATLIT</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewNoticeModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {previewNoticeModal.kategori}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatTanggalWaktu(previewNoticeModal.updatedAt || previewNoticeModal.createdAt)}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white font-serif">{previewNoticeModal.judul}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{previewNoticeModal.isi}</p>

              {previewNoticeModal.tautanUrl && (
                <div className="pt-2">
                  <a
                    href={previewNoticeModal.tautanUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                  >
                    <span>{previewNoticeModal.tautanLabel || 'Buka Tautan Terkait'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setPreviewNoticeModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Kosongkan Basis Data */}
      {showCleanConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Kosongkan Data?</h3>
                <p className="text-xs text-rose-300/80">Tindakan ini akan mengosongkan seluruh data atlit & transaksi</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p>Apakah Anda yakin ingin mengosongkan seluruh basis data aplikasi?</p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                <li>Semua akun atlit demo/uji coba akan dihapus.</li>
                <li>Semua pengajuan setoran & penarikan akan dihapus.</li>
                <li>Riwayat transaksi & mutasi kas akan bersih (0 transaksi).</li>
                <li>Hanya akun admin default (<span className="text-amber-400 font-mono font-bold">admin / admin123</span>) yang tetap tersimpan.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCleanConfirmModal(false)}
                disabled={cleaningData}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteCleanDatabase}
                disabled={cleaningData}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-600/30"
              >
                {cleaningData ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Mengosongkan Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Kosongkan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
