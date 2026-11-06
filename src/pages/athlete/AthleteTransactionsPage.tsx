import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DepositTransaction, WithdrawalTransaction } from '../../types';
import { formatRupiah, formatTanggalWaktu, formatStatusBadge } from '../../utils/formatters';
import { ProofModal } from '../../components/ui/ProofModal';
import { ReceiptText, ArrowDownLeft, ArrowUpRight, Search, Eye, Filter } from 'lucide-react';

export const AthleteTransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SETORAN' | 'PENARIKAN'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProof, setSelectedProof] = useState<{ url: string; trx: string } | null>(null);

  useEffect(() => {
    fetchMyTransactions();
  }, [user]);

  const fetchMyTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dep, wd] = await Promise.all([
        api.getDeposits(user.athleteId),
        api.getWithdrawals(user.athleteId),
      ]);
      setDeposits(dep);
      setWithdrawals(wd);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const combined = [
    ...(deposits || []).map((d) => ({ ...d, jenis: 'SETORAN' as const })),
    ...(withdrawals || []).map((w) => ({ ...w, jenis: 'PENARIKAN' as const })),
  ].sort((a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime());

  const filtered = combined.filter((trx: any) => {
    if (typeFilter !== 'ALL' && trx.jenis !== typeFilter) return false;
    if (statusFilter !== 'ALL' && trx.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
          <ReceiptText className="w-3.5 h-3.5" />
          <span>RIWAYAT PENGAJUAN</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-serif">Riwayat Transaksi Saya</h1>
        <p className="text-xs text-slate-400 mt-1">
          Pantau status persetujuan setoran dan penarikan yang pernah Anda ajukan.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['ALL', 'SETORAN', 'PENARIKAN'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                typeFilter === t
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              {t === 'ALL' && 'Semua Transaksi'}
              {t === 'SETORAN' && 'Setoran Saja'}
              {t === 'PENARIKAN' && 'Penarikan Saja'}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
        >
          <option value="ALL">Semua Status</option>
          <option value="MENUNGGU_PERSETUJUAN">Menunggu Persetujuan</option>
          <option value="DISETUJUI">Disetujui</option>
          <option value="DITOLAK">Ditolak</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400">
            <ReceiptText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-sm">Belum ada transaksi pada filter ini.</p>
          </div>
        ) : (
          filtered.map((trx: any) => {
            const isDeposit = trx.jenis === 'SETORAN';
            const badge = formatStatusBadge(trx.status);

            return (
              <div
                key={trx.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl shrink-0 ${
                      isDeposit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {isDeposit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{trx.nomorTransaksi}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        {badge.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-mono">
                        {trx.metodePembayaran || trx.metodePenyaluran || 'TRANSFER'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {trx.keterangan || trx.keperluan || (isDeposit ? 'Setoran Tabungan Atlit' : 'Penarikan Tabungan')}
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Diajukan: {formatTanggalWaktu(trx.tanggalPengajuan)}
                      {trx.disetujuiOleh && ` • Oleh: ${trx.disetujuiOleh}`}
                    </p>

                    {trx.catatanAdmin && (
                      <div className="mt-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-400/90">
                        <span className="font-semibold text-slate-400">Catatan Pengurus: </span>
                        {trx.catatanAdmin}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className={`text-xl font-black ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isDeposit ? '+' : '-'} {formatRupiah(trx.nominal)}
                  </span>

                  {trx.buktiTransferUrl && (
                    <button
                      onClick={() => setSelectedProof({ url: trx.buktiTransferUrl, trx: trx.nomorTransaksi })}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Bukti</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
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
