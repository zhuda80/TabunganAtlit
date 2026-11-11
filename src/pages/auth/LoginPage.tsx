import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IksPiLogo } from '../../components/common/IksPiLogo';
import { PWAInstallButton } from '../../components/common/PWAInstallButton';
import { BarcodeScanner } from '../../components/common/BarcodeScanner';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Phone,
  MessageSquare,
  QrCode,
  KeyRound,
  Barcode as BarcodeIcon,
  Sparkles,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export const LoginPage: React.FC = () => {
  const { login, loginWithBarcode, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState<'CREDENTIALS' | 'BARCODE'>('CREDENTIALS');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [barcodeVerifying, setBarcodeVerifying] = useState(false);
  const [scannedSuccessName, setScannedSuccessName] = useState<string | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);

  // Check if session expired notice was saved
  React.useEffect(() => {
    try {
      const notice = sessionStorage.getItem('ikspi_session_expired_notice');
      if (notice) {
        setSessionExpiredNotice(notice);
        sessionStorage.removeItem('ikspi_session_expired_notice');
      }
    } catch {
      // ignore
    }
  }, []);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/athlete/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password) {
      setErrorMsg('Silakan masukkan username dan password.');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  const handleBarcodeScanned = async (scannedCode: string) => {
    if (barcodeVerifying || loading) return;
    setErrorMsg('');
    setBarcodeVerifying(true);

    try {
      const res = await loginWithBarcode(scannedCode);
      if (res.success) {
        setScannedSuccessName(res.message.replace('Login Berhasil! Selamat datang, ', '') || 'Anggota');
        setTimeout(() => {
          // Redirect handled by useEffect
        }, 1200);
      } else {
        setErrorMsg(res.message || `Barcode "${scannedCode}" tidak dikenali.`);
        setBarcodeVerifying(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal memproses login barcode.');
      setBarcodeVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Header with Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <IksPiLogo size="lg" showSubtitle={true} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Portal Tabungan Digital Resmi Atlet & Anggota IKS PI Cabang Kota Kediri
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Method Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('CREDENTIALS');
                setErrorMsg('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMethod === 'CREDENTIALS'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Username &amp; Sandi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMethod('BARCODE');
                setErrorMsg('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 relative cursor-pointer ${
                loginMethod === 'BARCODE'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-slate-950 sm:text-inherit" />
              <span>Scan Barcode / QR</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-400 text-[9px] font-mono font-bold">
                Cepat
              </span>
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">
              {loginMethod === 'CREDENTIALS' ? 'Masuk ke Akun' : 'Scan Barcode / QR Login'}
            </h2>
            <p className="text-xs text-slate-400">
              {loginMethod === 'CREDENTIALS'
                ? 'Gunakan username dan password yang telah diverifikasi oleh pengurus cabang.'
                : 'Pindai barcode atau QR code kartu anggota Anda untuk masuk seketika.'}
            </p>
          </div>

          {/* Success message banner during barcode login */}
          {scannedSuccessName && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center gap-3 text-emerald-300 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-white">Login Berhasil Terverifikasi!</p>
                <p className="text-xs text-emerald-300">Selamat datang, <strong>{scannedSuccessName}</strong>. Mengalihkan...</p>
              </div>
            </div>
          )}

          {/* Verifying Spinner */}
          {barcodeVerifying && !scannedSuccessName && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300 animate-pulse">
              <RefreshCw className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
              <div>
                <p className="text-xs font-bold text-white">Memverifikasi Barcode...</p>
                <p className="text-[11px] text-slate-300">Mencocokkan identitas anggota ke sistem.</p>
              </div>
            </div>
          )}

          {/* Session Expiry Banner */}
          {sessionExpiredNotice && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex items-start gap-3 text-amber-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-300 mb-0.5">Sesi Berakhir Otomatis</p>
                <p className="text-amber-200/90 leading-relaxed">{sessionExpiredNotice}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: USERNAME & PASSWORD FORM */}
          {loginMethod === 'CREDENTIALS' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Username / Angkatan &amp; NIW
                  </label>
                  <span className="text-[10px] text-amber-400 font-medium">Bisa pakai Nomor Induk</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: admin, username, atau 128/0089"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Atlit dapat login menggunakan <strong>Username</strong> atau <strong>Angkatan / NIW</strong> (contoh: <code>128/0089</code> atau <code>1280089</code>).
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold hover:underline cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Masuk Aplikasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: SCAN BARCODE / QR CODE */}
          {loginMethod === 'BARCODE' && (
            <div className="space-y-4">
              <BarcodeScanner
                onScan={handleBarcodeScanned}
                isScanningActive={!barcodeVerifying && !scannedSuccessName}
              />

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Belum punya kode Barcode?</span>
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Setiap atlit dapat melihat atau <strong>menambahkan / mengubah kode barcode secara manual</strong> di halaman <em>Pengaturan Profil</em> akun masing-masing.
                </p>
              </div>
            </div>
          )}

          {/* Registration link */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-400">
              Belum memiliki akun tabungan?{' '}
              <Link to="/register" className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4">
                Daftar Atlit Baru
              </Link>
            </p>
          </div>

          {/* Android Mobile Install Link */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center">
            <PWAInstallButton variant="minimal" />
          </div>
        </div>

        {/* Security / Perguruan Notice */}
        <div className="mt-6 text-center text-[11px] text-slate-500 font-mono">
          <p>KEJURCAB & KEJURDA IKS PI KERA SAKTI KOTA KEDIRI</p>
          <p className="mt-0.5">Keamanan Berbasis Token & LockService Transaksi Google Sheets</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Bantuan Lupa Password Akun"
        subtitle="Informasi pemulihan kredensial akun atlit"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300 leading-relaxed">
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-400 mb-1">Password Dikelola oleh Pengurus Cabang</p>
              <p>
                Untuk menjaga keamanan dana tabungan, seluruh password akun atlet dapat <strong>dilihat dan diatur ulang langsung oleh Admin/Bendahara Pengurus Cabang</strong> melalui menu <em>Pengaturan Sistem &gt; Kredensial &amp; Password Atlit</em>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Kontak Sekretariat Cabang Kota Kediri:</span>
            </p>
            <p className="text-slate-300">
              Silakan hubungi WhatsApp resmi pengurus untuk meminta password Anda atau meminta reset password akun:
            </p>
            <p className="font-mono text-emerald-400 font-bold text-sm">
              WhatsApp: 0812-3344-5566 (Humas / Bendahara Cabang)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">💡 Info untuk Pengurus / Admin:</p>
            <p>
              Login menggunakan akun pengurus (default: <code>admin</code> / <code>admin123</code>), lalu buka menu <strong>Pengaturan Sistem &gt; Tab "Kredensial &amp; Password Atlit"</strong> untuk melihat password atlet atau menggantinya.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <a
              href="https://wa.me/6281233445566?text=Halo%20Admin%20IKS%20PI%20Kota%20Kediri,%20saya%20atlit%20lupa%20password%20akun%20tabungan.%20Mohon%20bantuan%20cek/reset%20password%20akun%20saya."
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Hubungi Admin via WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
