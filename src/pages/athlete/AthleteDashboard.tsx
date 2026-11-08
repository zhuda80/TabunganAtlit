import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardStatsAthlete, AthleteProfile, SystemSettings, AppNotice } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { formatRupiah, formatTanggal, formatStatusBadge } from '../../utils/formatters';
import { ProofModal } from '../../components/ui/ProofModal';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  PlusCircle,
  MinusCircle,
  CreditCard,
  Building,
  Clock,
  ShieldCheck,
  ChevronRight,
  User,
  Lock,
  Megaphone,
  Pin,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SavingsGrowthChart } from '../../components/common/SavingsGrowthChart';
import { PWAInstallButton } from '../../components/common/PWAInstallButton';

export const AthleteDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsAthlete | null>(null);
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [athleteNotices, setAthleteNotices] = useState<AppNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<{ url: string; trx: string } | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dashRes, setRes, noticesRes] = await Promise.all([
        api.getDashboard(user),
        api.getSettings(),
        api.getNotices(true),
      ]);
      if (dashRes && dashRes.stats) {
        setStats(dashRes.stats);
        if (dashRes.athlete) setAthlete(dashRes.athlete);
      }
      setSettings(setRes);
      if (noticesRes) {
        setAthleteNotices(
          noticesRes.filter((n) => n.target === 'ATLIT' || n.target === 'SEMUA')
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Android Mobile PWA Quick Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Top Banner Card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/50 to-slate-900 border border-slate-800 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-amber-500/10 via-amber-600/5 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg ring-2 ring-amber-400/30 shrink-0 overflow-hidden">
              {athlete?.fotoUrl || user?.fotoUrl ? (
                <img
                  src={athlete?.fotoUrl || user?.fotoUrl}
                  alt={athlete?.namaLengkap || user?.namaLengkap}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.namaLengkap ? user.namaLengkap.charAt(0) : 'A'
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ATLIT IKS PI KERA SAKTI</span>
              </div>
              <h1 className="text-xl md:text-3xl font-extrabold text-white font-serif">
                {user?.namaLengkap || 'Atlit IKS PI'}
              </h1>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                No. Induk: <strong className="text-amber-400">{user?.nomorInduk || 'IKS-KDR-2024'}</strong> • {user?.unitRanting || 'Cabang Kota Kediri'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/athlete/deposit"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Setor Tabungan</span>
            </Link>

            <Link
              to="/athlete/withdraw"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>Tarik Saldo</span>
            </Link>

            <Link
              to="/athlete/passbook"
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-amber-500/30 transition flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Buku Tabungan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Notice & Pengumuman Khusus Atlit */}
      {athleteNotices.length > 0 && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-serif">Pemberitahuan & Pengumuman Resmi</h3>
                <p className="text-[11px] text-slate-400">Informasi dari Pengurus IKS PI Kera Sakti Cabang Kota Kediri</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {athleteNotices.length} Pengumuman
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {athleteNotices.map((ntc) => {
              const getCatBadge = (cat: string) => {
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
                  key={ntc.id}
                  className={`p-4 rounded-2xl bg-slate-950 border flex flex-col justify-between transition ${
                    ntc.pinTop ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getCatBadge(ntc.kategori)}`}>
                        {ntc.kategori}
                      </span>
                      {ntc.pinTop && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                          <Pin className="w-2.5 h-2.5" /> PENTING
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white font-serif">{ntc.judul}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                      {ntc.isi}
                    </p>
                  </div>

                  {ntc.tautanUrl && (
                    <div className="pt-3 mt-2 border-t border-slate-900">
                      <a
                        href={ntc.tautanUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition"
                      >
                        <span>{ntc.tautanLabel || 'Buka Informasi Lengkap'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Tabungan Anda"
          value={formatRupiah(stats?.saldoSaatIni || 0)}
          subtitle={
            settings?.saldoEndapan
              ? `Endapan wajib: ${formatRupiah(settings.saldoEndapan)}`
              : 'Saldo tabungan resmi atlet'
          }
          icon={Wallet}
          variant="gold"
        />

        <StatCard
          title="Total Uang Ditabung"
          value={formatRupiah(stats?.totalSetoran || 0)}
          subtitle="Akumulasi seluruh setoran sukses"
          icon={ArrowDownLeft}
          variant="emerald"
        />

        <StatCard
          title="Total Penarikan"
          value={formatRupiah(stats?.totalPenarikan || 0)}
          subtitle="Total dana tabungan yang ditarik"
          icon={ArrowUpRight}
          variant="rose"
        />

        <StatCard
          title="Pengajuan Menunggu"
          value={(stats?.pendingSetoranCount || 0) + (stats?.pendingPenarikanCount || 0)}
          subtitle={`${stats?.pendingSetoranCount || 0} setoran, ${stats?.pendingPenarikanCount || 0} penarikan`}
          icon={Clock}
          variant="blue"
        />
      </div>

      {/* Dana Endapan Breakdown Card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
              stats?.statusEndapan === 'TERPENUHI'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : stats?.statusEndapan === 'KURANG'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-white">Status Dana Endapan Wajib Atlet</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  stats?.statusEndapan === 'TERPENUHI'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : stats?.statusEndapan === 'KURANG'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {stats?.statusEndapan === 'TERPENUHI'
                    ? 'TERPENUHI (LENGKAP)'
                    : stats?.statusEndapan === 'KURANG'
                    ? 'BELUM LENGKAP'
                    : 'BELUM ADA ENDAPAN'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1 max-w-2xl">
                Sesuai ketentuan kas cabang Kota Kediri, setiap atlet wajib menyisihkan saldo endapan minimal{' '}
                <strong className="text-amber-400 font-mono">{formatRupiah(stats?.saldoEndapanWajib || settings?.saldoEndapan || 50000)}</strong>.
                Dana ini berstatus terkunci di sistem sebagai saldo jaminan keaktifan atlet dan tidak dapat ditarik sewaktu-waktu.
              </p>
            </div>
          </div>

          {/* Locked vs Free balance pills */}
          <div className="flex items-center gap-4 bg-slate-950/90 p-4 rounded-2xl border border-slate-800 shrink-0 self-stretch md:self-auto justify-around md:justify-start">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Endapan Terkunci</div>
              <div className="text-sm md:text-base font-extrabold text-amber-400 font-mono mt-0.5">
                {formatRupiah(stats?.saldoEndapanTerkunci || 0)}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Saldo Bebas Ditarik</div>
              <div className="text-sm md:text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                {formatRupiah(stats?.saldoBebasDitarik || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Tren Pertumbuhan Tabungan Atlit */}
      <SavingsGrowthChart
        title="Tren Pertumbuhan Saldo Tabungan Anda"
        subtitle="Visualisasi grafik akumulasi saldo tabungan, histori setoran kas, dan batas saldo endapan wajib"
        data={stats?.chartDataTren || []}
        targetEndapan={stats?.saldoEndapanWajib || settings?.saldoEndapan || 50000}
        role="ATLIT"
        badgeLabel="BUKU TABUNGAN DIGITAL"
      />

      {/* Bank Info & Pending Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Official Org Bank Info */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
              <Building className="w-4 h-4" />
              <span>Rekening Resmi IKS PI Kota Kediri</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Setiap setoran metode transfer wajib dikirimkan ke rekening kas resmi perguruan berikut:
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Nama Bank</span>
                <span className="text-xs font-bold text-white font-mono">
                  {settings?.namaBankOrganisasi || 'BCA / BRI Cabang Kediri'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Nomor Rekening</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono">
                  {settings?.nomorRekeningOrganisasi || '140-00-1980808-1'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Atas Nama</span>
                <span className="text-xs font-semibold text-slate-200">
                  {settings?.atasNamaRekening || 'IKS PI KERA SAKTI KOTA KEDIRI'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Pastikan menyimpan bukti struk/screenshot transfer untuk diunggah pada formulir setoran.
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Transaksi Terakhir Anda</h3>
              <p className="text-xs text-slate-400">Status setoran dan penarikan yang pernah Anda ajukan</p>
            </div>
            <Link
              to="/athlete/transactions"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!stats?.transaksiTerbaru || stats.transaksiTerbaru.length === 0) ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Belum ada transaksi yang diajukan. Mulai tabungan pertama Anda dengan menekan tombol Setor Tabungan.
              </div>
            ) : (
              (stats?.transaksiTerbaru || []).map((trx: any) => {
                const isDeposit = !!trx.buktiTransferUrl || trx.nomorTransaksi?.includes('DEP');
                const badge = formatStatusBadge(trx.status);

                return (
                  <div
                    key={trx.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isDeposit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{trx.nomorTransaksi}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg}`}>
                            <span className={`w-1 h-1 rounded-full ${badge.dot}`}></span>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {trx.keterangan || trx.keperluan || (isDeposit ? 'Setoran Tabungan' : 'Penarikan')}
                        </p>
                        <p className="text-[10px] text-slate-500">{formatTanggal(trx.tanggalPengajuan)}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`text-sm font-black ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isDeposit ? '+' : '-'} {formatRupiah(trx.nominal)}
                      </p>
                      {trx.buktiTransferUrl && (
                        <button
                          onClick={() => setSelectedProof({ url: trx.buktiTransferUrl, trx: trx.nomorTransaksi })}
                          className="text-[10px] text-amber-400 hover:underline mt-0.5"
                        >
                          Lihat Bukti
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <ProofModal
        isOpen={!!selectedProof}
        onClose={() => setSelectedProof(null)}
        imageUrl={selectedProof?.url}
        nomorTransaksi={selectedProof?.trx}
      />
    </div>
  );
};
