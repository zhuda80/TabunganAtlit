import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardStatsAdmin, DepositTransaction, WithdrawalTransaction } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { formatRupiah, formatTanggal, formatStatusBadge } from '../../utils/formatters';
import { ProofModal } from '../../components/ui/ProofModal';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Clock,
  CheckCircle,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  Lock,
  ShieldCheck,
  Megaphone,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminDepositModal } from '../../components/admin/AdminDepositModal';
import { SavingsGrowthChart } from '../../components/common/SavingsGrowthChart';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProof, setSelectedProof] = useState<{ url: string; trx: string } | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getDashboard(user);
      if (res && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const filteredTransactions = (stats?.transaksiTerbaru || []).filter((t: any) => {
    const q = searchTerm.toLowerCase();
    return (
      t.namaLengkap?.toLowerCase().includes(q) ||
      t.nomorTransaksi?.toLowerCase().includes(q) ||
      t.unitRanting?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
              <span>ADMINISTRATOR CABANG</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif">
              Dashboard Keuangan Atlit IKS PI
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Pengawasan kas tabungan atlet, kas masuk, kas keluar, dan persetujuan transaksi cabang.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Tambah Setoran Atlet</span>
            </button>
            <Link
              to="/admin/deposit-approvals"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Verifikasi Setoran ({stats?.pendingSetoran || 0})</span>
            </Link>
            <Link
              to="/admin/withdrawal-approvals"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <span>Verifikasi Penarikan ({stats?.pendingPenarikan || 0})</span>
            </Link>
            <Link
              to="/admin/settings"
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30 transition flex items-center gap-1.5"
              title="Kelola Notice & Pengumuman Sistem"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Kelola Notice</span>
            </Link>
            <Link
              to="/admin/profile"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
              title="Buka Profil Administrator Cabang"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Profil Pengurus</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Saldo Seluruh Atlit"
          value={formatRupiah(stats?.totalSaldoSeluruhAtlit || 0)}
          subtitle="Saldo riil di pembukuan"
          icon={Wallet}
          variant="gold"
        />
        <StatCard
          title="Total Uang Masuk"
          value={formatRupiah(stats?.totalUangMasuk || 0)}
          subtitle="Akumulasi setoran sukses"
          icon={ArrowDownLeft}
          variant="emerald"
        />
        <StatCard
          title="Total Uang Keluar"
          value={formatRupiah(stats?.totalUangKeluar || 0)}
          subtitle="Akumulasi penarikan disetujui"
          icon={ArrowUpRight}
          variant="rose"
        />
        <StatCard
          title="Atlit Aktif Terdaftar"
          value={stats?.totalAtlitAktif || 0}
          subtitle={`${stats?.pendingPendaftaran || 0} menunggu persetujuan`}
          icon={Users}
          variant="blue"
        />
      </div>

      {/* Dana Endapan Cabang Highlight Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-1 sm:mt-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Endapan Wajib Kas Atlet Cabang</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Kepatuhan: {stats?.persentaseKepatuhanEndapan || 0}%
              </span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-white mt-1">
              Dana Endapan Terkunci: <span className="text-amber-400 font-mono">{formatRupiah(stats?.totalEndapanTerkunci || 0)}</span>
              <span className="text-xs text-slate-400 font-normal ml-2">
                (Target Total: {formatRupiah(stats?.totalTargetEndapan || 0)})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Saldo bebas likuid yang dapat ditarik atlet: <span className="text-emerald-400 font-semibold font-mono">{formatRupiah(stats?.totalSaldoBebasLikuid || 0)}</span>
            </p>
          </div>
        </div>

        <Link
          to="/admin/reports?tab=endapan"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 shrink-0 self-stretch sm:self-auto cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Lihat Rekap Dana Endapan</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Chart & Highlights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Visualizer powered by Recharts */}
        <div className="lg:col-span-2">
          <SavingsGrowthChart
            title="Tren Pertumbuhan Kas Tabungan Seluruh Atlit"
            subtitle="Visualisasi akumulasi saldo kas cabang dan komparasi arus kas masuk vs keluar"
            data={stats?.chartDataBulanan || []}
            role="ADMIN"
            badgeLabel="IKS PI CABANG KOTA KEDIRI"
          />
        </div>

        {/* Pending Approval Quick Queue */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Antrean Approval</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/20 text-amber-400 font-bold">
                {stats?.totalPendingApproval || 0} Tertunda
              </span>
            </div>

            <div className="space-y-3">
              <Link
                to="/admin/deposit-approvals"
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                      Setoran Tabungan
                    </h4>
                    <p className="text-[10px] text-slate-400">Perlu cek bukti transfer / kas</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400">
                    {stats?.pendingSetoran || 0}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                </div>
              </Link>

              <Link
                to="/admin/withdrawal-approvals"
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                      Penarikan Saldo
                    </h4>
                    <p className="text-[10px] text-slate-400">Validasi saldo & transfer bank</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400">
                    {stats?.pendingPenarikan || 0}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                </div>
              </Link>

              <Link
                to="/admin/registration-approvals"
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                      Registrasi Atlit Baru
                    </h4>
                    <p className="text-[10px] text-slate-400">Verifikasi anggota ranting</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400">
                    {stats?.pendingPendaftaran || 0}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <Link
              to="/admin/reports"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" /> Buka Laporan Keuangan Lengkap
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Transaksi Terbaru</h3>
            <p className="text-xs text-slate-400">Pantau setoran dan penarikan yang baru diajukan atlet</p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari atlet / No. Trx..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Nama Atlet</th>
                <th className="py-3 px-4">Ranting</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4 text-center">Aksi / Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx: any) => {
                  const isDeposit = !!trx.buktiTransferUrl || trx.nomorTransaksi?.includes('DEP');
                  const badge = formatStatusBadge(trx.status);

                  return (
                    <tr key={trx.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-medium text-amber-400">
                        {trx.nomorTransaksi}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {trx.namaLengkap}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {trx.unitRanting}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isDeposit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isDeposit ? '+ Setoran' : '- Tarik'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {formatRupiah(trx.nominal)}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {trx.metodePembayaran || trx.metodePenyaluran || 'TRANSFER'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {formatTanggal(trx.tanggalPengajuan)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {trx.buktiTransferUrl ? (
                          <button
                            onClick={() => setSelectedProof({ url: trx.buktiTransferUrl, trx: trx.nomorTransaksi })}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-medium transition cursor-pointer"
                          >
                            Lihat Bukti
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Modal */}
      <ProofModal
        isOpen={!!selectedProof}
        onClose={() => setSelectedProof(null)}
        imageUrl={selectedProof?.url}
        nomorTransaksi={selectedProof?.trx}
      />

      {/* Admin Deposit Modal */}
      <AdminDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={fetchStats}
      />
    </div>
  );
};
