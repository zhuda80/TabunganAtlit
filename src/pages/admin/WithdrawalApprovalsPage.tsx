import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WithdrawalTransaction } from '../../types';
import { formatRupiah, formatTanggalWaktu, formatStatusBadge } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';
import {
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Check,
  X,
  CreditCard,
  Building,
  User,
  Clock,
} from 'lucide-react';

export const WithdrawalApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('MENUNGGU_PERSETUJUAN');

  const [actionItem, setActionItem] = useState<{ item: WithdrawalTransaction; action: 'APPROVE' | 'REJECT' } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await api.getWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleProcess = async () => {
    if (!actionItem || !user) return;
    setProcessing(true);
    try {
      if (actionItem.action === 'APPROVE') {
        const res = await api.approveWithdrawal(actionItem.item.id, adminNote || 'Disetujui dan ditransfer oleh pengurus', user.username);
        if (res.success) {
          setToast({ type: 'success', message: res.message });
          setActionItem(null);
          setAdminNote('');
          await fetchWithdrawals();
        } else {
          setToast({ type: 'error', message: res.message });
        }
      } else {
        const res = await api.rejectWithdrawal(actionItem.item.id, adminNote || 'Ditolak oleh admin', user.username);
        if (res.success) {
          setToast({ type: 'success', message: res.message });
          setActionItem(null);
          setAdminNote('');
          await fetchWithdrawals();
        } else {
          setToast({ type: 'error', message: res.message });
        }
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Gagal memproses penarikan.' });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = (withdrawals || []).filter((w) => {
    if (filterStatus === 'ALL') return true;
    return w.status === filterStatus;
  });

  return (
    <div className="space-y-6">
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
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>KAS KELUAR ATLIT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">Persetujuan Penarikan Tabungan</h1>
          <p className="text-xs text-slate-400 mt-1">
            Validasi saldo atlet dan transfer dana penarikan. Saldo tidak boleh negatif dan berkurang tepat satu kali.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start">
          <button
            onClick={() => setFilterStatus('MENUNGGU_PERSETUJUAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filterStatus === 'MENUNGGU_PERSETUJUAN'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Menunggu ({withdrawals.filter((w) => w.status === 'MENUNGGU_PERSETUJUAN').length})
          </button>
          <button
            onClick={() => setFilterStatus('DISETUJUI')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filterStatus === 'DISETUJUI'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Disetujui
          </button>
          <button
            onClick={() => setFilterStatus('DITOLAK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filterStatus === 'DITOLAK'
                ? 'bg-rose-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ditolak
          </button>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filterStatus === 'ALL'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400">
            <CheckCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-sm">Tidak ada transaksi penarikan pada status ini.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const badge = formatStatusBadge(item.status);
            const isPending = item.status === 'MENUNGGU_PERSETUJUAN';

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 shrink-0 border border-rose-500/20">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 font-bold">{item.nomorTransaksi}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        {badge.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-mono">
                        {item.metodePenyaluran}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white">
                      {item.namaLengkap}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        ({item.unitRanting} • {item.nomorInduk})
                      </span>
                    </h3>

                    <p className="text-xs text-slate-400">
                      Tujuan Penarikan: <span className="text-slate-200 font-medium">{item.keperluan}</span>
                    </p>

                    {item.metodePenyaluran === 'TRANSFER' && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono space-y-0.5 mt-1.5 max-w-md">
                        <div className="flex items-center gap-2 text-amber-400 font-semibold">
                          <Building className="w-3.5 h-3.5" />
                          <span>{item.namaBankPenerima || 'Bank Tujuan'}</span>
                        </div>
                        <p>No. Rekening: <span className="font-bold text-white">{item.nomorRekeningPenerima || '-'}</span></p>
                        <p>Atas Nama: <span className="text-slate-200">{item.namaPenerimaRekening || item.namaLengkap}</span></p>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-500 mt-1">
                      Diajukan: {formatTanggalWaktu(item.tanggalPengajuan)}
                      {item.disetujuiOleh && ` • Diproses oleh: ${item.disetujuiOleh}`}
                    </p>

                    {item.catatanAdmin && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-400/90">
                        <span className="font-semibold text-slate-400">Catatan Admin: </span>
                        {item.catatanAdmin}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Amount and Actions */}
                <div className="flex flex-col md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nominal Ditarik</p>
                    <p className="text-2xl font-black text-rose-400">{formatRupiah(item.nominal)}</p>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActionItem({ item, action: 'REJECT' });
                          setAdminNote('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                      <button
                        onClick={() => {
                          setActionItem({ item, action: 'APPROVE' });
                          setAdminNote('Dana penarikan telah ditransfer ke rekening atlet');
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui Penarikan</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!actionItem}
        onClose={() => setActionItem(null)}
        title={actionItem?.action === 'APPROVE' ? 'Setujui Penarikan Tabungan' : 'Tolak Penarikan Tabungan'}
        subtitle={`Nomor: ${actionItem?.item.nomorTransaksi} • ${actionItem?.item.namaLengkap}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-xs text-slate-400">Nominal penarikan:</p>
            <p className="text-xl font-bold text-rose-400 mt-0.5">{formatRupiah(actionItem?.item.nominal)}</p>
            <p className="text-xs text-slate-400 mt-2">
              {actionItem?.action === 'APPROVE'
                ? 'Sistem backend akan memvalidasi sisa saldo atlet, mendebet saldo, dan mencatat transaksi mutasi.'
                : 'Pengajuan akan ditolak dan saldo atlet tidak akan dikurangi.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Admin *
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Contoh: Telah ditransfer via BCA Cabang Kediri Ref #7899"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setActionItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              onClick={handleProcess}
              disabled={processing}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                actionItem?.action === 'APPROVE'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              {processing ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>Konfirmasi {actionItem?.action === 'APPROVE' ? 'Setujui' : 'Tolak'}</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
