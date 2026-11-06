import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DepositTransaction, WithdrawalTransaction, AthleteProfile } from '../../types';
import { formatRupiah, formatTanggalWaktu, formatStatusBadge } from '../../utils/formatters';
import { ProofModal } from '../../components/ui/ProofModal';
import { ReceiptText, Search, Filter, Eye, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalTransaction[]>([]);
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SETORAN' | 'PENARIKAN'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [athleteFilter, setAthleteFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProof, setSelectedProof] = useState<{ url: string; trx: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [depData, wdData, athData] = await Promise.all([
        api.getDeposits(),
        api.getWithdrawals(),
        api.getAthletes(),
      ]);
      setDeposits(depData);
      setWithdrawals(wdData);
      setAthletes(athData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Combine and sort
  const allTransactions = [
    ...(deposits || []).map((d) => ({ ...d, jenis: 'SETORAN' as const })),
    ...(withdrawals || []).map((w) => ({ ...w, jenis: 'PENARIKAN' as const })),
  ].sort((a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime());

  const filtered = allTransactions.filter((trx: any) => {
    if (typeFilter !== 'ALL' && trx.jenis !== typeFilter) return false;
    if (statusFilter !== 'ALL' && trx.status !== statusFilter) return false;
    if (athleteFilter !== 'ALL' && trx.athleteId !== athleteFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = trx.namaLengkap?.toLowerCase().includes(q);
      const matchTrx = trx.nomorTransaksi?.toLowerCase().includes(q);
      const matchRanting = trx.unitRanting?.toLowerCase().includes(q);
      if (!matchName && !matchTrx && !matchRanting) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
          <ReceiptText className="w-3.5 h-3.5" />
          <span>MUTASI & ARUS TRANSAKSI</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-serif">Monitoring Seluruh Transaksi</h1>
        <p className="text-xs text-slate-400 mt-1">
          Pantau seluruh aktivitas setoran dan penarikan kas tabungan atlet di seluruh ranting IKS PI Kota Kediri.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari atlet, ranting, no. trx..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Jenis */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="ALL">Semua Jenis Transaksi</option>
          <option value="SETORAN">Setoran Kas Masuk</option>
          <option value="PENARIKAN">Penarikan Kas Keluar</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="ALL">Semua Status</option>
          <option value="MENUNGGU_PERSETUJUAN">Menunggu Persetujuan</option>
          <option value="DISETUJUI">Disetujui</option>
          <option value="DITOLAK">Ditolak</option>
        </select>

        {/* Athlete */}
        <select
          value={athleteFilter}
          onChange={(e) => setAthleteFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="ALL">Semua Atlet</option>
          {athletes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.namaLengkap} ({a.unitRanting})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Nama Atlet</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4 text-center">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((trx: any) => {
                  const isDeposit = trx.jenis === 'SETORAN';
                  const badge = formatStatusBadge(trx.status);

                  return (
                    <tr key={trx.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-medium text-amber-400">
                        {trx.nomorTransaksi}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{trx.namaLengkap}</div>
                        <div className="text-[10px] text-slate-400">{trx.unitRanting}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isDeposit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isDeposit ? (
                            <>
                              <ArrowDownLeft className="w-3.5 h-3.5" /> Setoran
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5" /> Penarikan
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-white">
                        {formatRupiah(trx.nominal)}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {trx.metodePembayaran || trx.metodePenyaluran || 'TRANSFER'}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {trx.keterangan || trx.keperluan || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {formatTanggalWaktu(trx.tanggalPengajuan)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {trx.buktiTransferUrl ? (
                          <button
                            onClick={() => setSelectedProof({ url: trx.buktiTransferUrl, trx: trx.nomorTransaksi })}
                            className="p-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition"
                            title="Lihat Bukti Transfer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-600">-</span>
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

      <ProofModal
        isOpen={!!selectedProof}
        onClose={() => setSelectedProof(null)}
        imageUrl={selectedProof?.url}
        nomorTransaksi={selectedProof?.trx}
      />
    </div>
  );
};
