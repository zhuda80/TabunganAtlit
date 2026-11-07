import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PendingRegistration } from '../../types';
import { formatTanggal, formatStatusBadge } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';
import {
  UserCheck,
  CheckCircle,
  AlertCircle,
  Check,
  X,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const RegistrationApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionItem, setActionItem] = useState<{ item: PendingRegistration; action: 'APPROVE' | 'REJECT' } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    const handleUpdate = () => fetchRegistrations();
    window.addEventListener('ikspi_registrations_updated', handleUpdate);
    return () => {
      window.removeEventListener('ikspi_registrations_updated', handleUpdate);
    };
  }, []);

  const handleProcess = async () => {
    if (!actionItem || !user) return;
    setProcessing(true);
    try {
      if (actionItem.action === 'APPROVE') {
        const res = await api.approveRegistration(actionItem.item.id, adminNote || 'Disetujui sebagai atlit aktif IKS PI', user.username);
        if (res.success) {
          setToast({ type: 'success', message: res.message });
          setActionItem(null);
          setAdminNote('');
          await fetchRegistrations();
        } else {
          setToast({ type: 'error', message: res.message });
        }
      } else {
        const res = await api.rejectRegistration(actionItem.item.id, adminNote || 'Ditolak', user.username);
        if (res.success) {
          setToast({ type: 'success', message: res.message });
          setActionItem(null);
          setAdminNote('');
          await fetchRegistrations();
        } else {
          setToast({ type: 'error', message: res.message });
        }
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Gagal memproses pendaftaran.' });
    } finally {
      setProcessing(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>VERIFIKASI KEANGGOTAAN</span>
            {registrations.filter((r) => r.status === 'MENUNGGU_PERSETUJUAN').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {registrations.filter((r) => r.status === 'MENUNGGU_PERSETUJUAN').length} Menunggu
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">Persetujuan Pendaftaran Atlit Baru</h1>
          <p className="text-xs text-slate-400 mt-1">
            Calon atlet tidak dapat masuk ke sistem sebelum diverifikasi dan disetujui oleh pengurus cabang.
          </p>
        </div>
        <button
          onClick={fetchRegistrations}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
          <span>{loading ? 'Memuat...' : 'Segarkan Data'}</span>
        </button>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        {registrations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400">
            <CheckCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-sm">Tidak ada permohonan pendaftaran atlit baru saat ini.</p>
          </div>
        ) : (
          registrations.map((item) => {
            const badge = formatStatusBadge(item.status);
            const isPending = item.status === 'MENUNGGU_PERSETUJUAN';

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-4">
                  {item.fotoUrl ? (
                    <img
                      src={item.fotoUrl}
                      alt={item.namaLengkap}
                      onClick={() => setSelectedPhoto(item.fotoUrl!)}
                      className="w-16 h-16 rounded-2xl object-cover border border-amber-400/40 cursor-pointer hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-lg">
                      {item.namaLengkap.charAt(0)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">{item.namaLengkap}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>NIK: <strong className="text-slate-200 font-mono">{item.nik || '-'}</strong></span>
                      <span className="font-mono text-amber-400 font-semibold">NI: {item.nomorInduk}</span>
                      {(item.angkatan || item.niw) && (
                        <span className="text-amber-300 font-mono text-[11px]">
                          ({item.angkatan ? `Angkatan ${item.angkatan}` : '-'} • {item.niw ? `NIW ${item.niw}` : '-'})
                        </span>
                      )}
                      <span>Unit/Ranting: <strong className="text-white">{item.unitRanting}</strong></span>
                      <span>Username: <code className="text-slate-300">@{item.username}</code></span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {item.tempatLahir}, {formatTanggal(item.tanggalLahir)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {item.alamat}
                      </span>
                      <a
                        href={`https://wa.me/${item.nomorWhatsApp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-emerald-400 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {item.nomorWhatsApp}
                      </a>
                    </div>

                    <p className="text-[10px] text-slate-500 pt-1">
                      Mendaftar: {formatTanggal(item.tanggalDaftar)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {isPending && (
                  <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <button
                      onClick={() => {
                        setActionItem({ item, action: 'REJECT' });
                        setAdminNote('Data atau ranting tidak terverifikasi');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                    <button
                      onClick={() => {
                        setActionItem({ item, action: 'APPROVE' });
                        setAdminNote('Disetujui sebagai atlit aktif IKS PI Kota Kediri');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verifikasi & Aktifkan</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!actionItem}
        onClose={() => setActionItem(null)}
        title={actionItem?.action === 'APPROVE' ? 'Verifikasi & Aktifkan Akun Atlit' : 'Tolak Pendaftaran Atlit'}
        subtitle={`Atlit: ${actionItem?.item.namaLengkap} (${actionItem?.item.unitRanting})`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            {actionItem?.action === 'APPROVE'
              ? 'Setelah disetujui, akun atlit ini akan aktif di database perguruan, mendapatkan buku tabungan digital, dan dapat login.'
              : 'Pendaftaran ini akan ditolak. Atlet tidak akan dapat login.'}
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Pengurus *
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Contoh: Disetujui oleh Humas/Admin Cabang"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setActionItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Batal
            </button>
            <button
              onClick={handleProcess}
              disabled={processing}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                actionItem?.action === 'APPROVE'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              {processing ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>Konfirmasi {actionItem?.action === 'APPROVE' ? 'Aktivasi' : 'Tolak'}</span>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Photo Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title="Foto Calon Atlit"
        maxWidth="sm"
      >
        {selectedPhoto && (
          <img
            src={selectedPhoto}
            alt="Foto Atlit"
            className="w-full h-auto rounded-xl object-contain max-h-[400px]"
          />
        )}
      </Modal>
    </div>
  );
};
