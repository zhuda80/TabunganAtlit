import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AthleteProfile } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { Modal } from '../ui/Modal';
import {
  Wallet,
  ArrowDownLeft,
  Banknote,
  CreditCard,
  Building,
  Upload,
  AlertCircle,
  CheckCircle,
  Search,
  Sparkles,
} from 'lucide-react';

interface AdminDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAthleteId?: string;
  onSuccess: () => void;
}

const PRESET_NOMINALS = [20000, 50000, 100000, 200000, 500000, 1000000];

export const AdminDepositModal: React.FC<AdminDepositModalProps> = ({
  isOpen,
  onClose,
  preselectedAthleteId,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState(preselectedAthleteId || '');
  const [athleteSearch, setAthleteSearch] = useState('');

  const [nominal, setNominal] = useState<number>(50000);
  const [metode, setMetode] = useState<'TUNAI' | 'TRANSFER'>('TUNAI');
  const [namaBank, setNamaBank] = useState('');
  const [nomorRekening, setNomorRekening] = useState('');
  const [keterangan, setKeterangan] = useState('Setoran Tabungan Atlit via Admin');
  const [autoApprove, setAutoApprove] = useState(true);

  // File upload state for transfer
  const [buktiUrl, setBuktiUrl] = useState<string>('');
  const [buktiName, setBuktiName] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch athletes list
  useEffect(() => {
    if (isOpen) {
      loadAthletes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedAthleteId) {
      setSelectedAthleteId(preselectedAthleteId);
    }
  }, [preselectedAthleteId]);

  const loadAthletes = async () => {
    setLoadingAthletes(true);
    try {
      const data = await api.getAthletes();
      // filter only active athletes
      setAthletes(data);
      if (!selectedAthleteId && data.length > 0 && !preselectedAthleteId) {
        setSelectedAthleteId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAthletes(false);
    }
  };

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File bukti transfer harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 3MB.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setBuktiName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBuktiUrl(reader.result as string);
      setUploading(false);
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca file gambar.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedAthleteId) {
      setErrorMsg('Pilih atlet penerima setoran terlebih dahulu.');
      return;
    }
    if (nominal < 10000) {
      setErrorMsg('Nominal setoran minimal adalah Rp 10.000.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.addDepositByAdmin(user, {
        athleteId: selectedAthleteId,
        nominal,
        metodePembayaran: metode,
        namaBankPengirim: metode === 'TRANSFER' ? namaBank : undefined,
        nomorRekeningPengirim: metode === 'TRANSFER' ? nomorRekening : undefined,
        buktiTransferUrl: metode === 'TRANSFER' ? buktiUrl : undefined,
        buktiTransferName: metode === 'TRANSFER' ? buktiName : undefined,
        keterangan: keterangan.trim(),
        autoApprove,
      });

      if (res.success) {
        onSuccess();
        onClose();
        // Reset modal fields
        setNominal(50000);
        setMetode('TUNAI');
        setBuktiUrl('');
        setBuktiName('');
        setKeterangan('Setoran Tabungan Atlit via Admin');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan setoran.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAthletes = athletes.filter((a) => {
    const q = athleteSearch.toLowerCase();
    return (
      a.namaLengkap.toLowerCase().includes(q) ||
      a.nomorInduk.toLowerCase().includes(q) ||
      (a.nik && a.nik.includes(q)) ||
      a.unitRanting.toLowerCase().includes(q)
    );
  });

  const saldoSebelum = selectedAthlete?.saldoSaatIni || 0;
  const saldoSesudah = saldoSebelum + (Number(nominal) || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Setoran Atlit (Admin)"
      subtitle="Input setoran langsung oleh Pengurus / Bendahara Cabang"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Athlete Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Pilih Atlet Penerima Setoran *</span>
            {selectedAthlete && (
              <span className="text-[11px] text-amber-400 font-mono">
                Saldo: {formatRupiah(selectedAthlete.saldoSaatIni)}
              </span>
            )}
          </label>

          {/* Quick search input if lots of athletes */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, nomor induk, atau ranting atlit..."
              value={athleteSearch}
              onChange={(e) => setAthleteSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedAthleteId}
            onChange={(e) => setSelectedAthleteId(e.target.value)}
            required
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="" disabled>
              -- Pilih Atlet --
            </option>
            {filteredAthletes.map((ath) => (
              <option key={ath.id} value={ath.id}>
                {ath.namaLengkap} ({ath.nomorInduk}) - {ath.unitRanting} [Saldo: {formatRupiah(ath.saldoSaatIni)}]
              </option>
            ))}
          </select>
        </div>

        {/* Selected Athlete Banner */}
        {selectedAthlete && (
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow">
                {selectedAthlete.namaLengkap.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-white leading-tight">{selectedAthlete.namaLengkap}</p>
                <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                  NI: {selectedAthlete.nomorInduk} {selectedAthlete.nik ? `• NIK: ${selectedAthlete.nik}` : ''}
                </p>
                <p className="text-[10px] text-slate-400">{selectedAthlete.unitRanting}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 block">Saldo Saat Ini</span>
              <strong className="text-xs font-mono text-emerald-400">{formatRupiah(selectedAthlete.saldoSaatIni)}</strong>
            </div>
          </div>
        )}

        {/* Nominal Input & Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nominal Setoran (Rupiah) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">Rp</span>
            <input
              type="number"
              min={10000}
              step={1000}
              required
              value={nominal || ''}
              onChange={(e) => setNominal(Math.max(0, parseInt(e.target.value, 10) || 0))}
              placeholder="Contoh: 100000"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PRESET_NOMINALS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setNominal(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer ${
                  nominal === p
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {formatRupiah(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Metode Pembayaran *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMetode('TUNAI')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                metode === 'TUNAI'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Tunai / Cash Langsung</span>
            </button>

            <button
              type="button"
              onClick={() => setMetode('TRANSFER')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                metode === 'TRANSFER'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Transfer Bank</span>
            </button>
          </div>
        </div>

        {/* Transfer details if TRANSFER */}
        {metode === 'TRANSFER' && (
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nama Bank Pengirim</label>
                <input
                  type="text"
                  placeholder="BCA / BRI / Mandiri"
                  value={namaBank}
                  onChange={(e) => setNamaBank(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  placeholder="Nomor rekening"
                  value={nomorRekening}
                  onChange={(e) => setNomorRekening(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Bukti Transfer (Opsional jika diinput admin)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
              />
              {uploading && <p className="text-[10px] text-amber-400 mt-1">Mengunggah bukti...</p>}
              {buktiUrl && (
                <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Bukti terlampir ({buktiName || 'foto_bukti.jpg'})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Keterangan */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Keterangan / Keperluan Setoran
          </label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Tabungan persiapan Kejurcab / Iuran latihan"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Auto Approve Option */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Langsung Setujui & Tambah ke Saldo</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Saldo atlet akan langsung bertambah dan tercatat di buku tabungan digital.
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => setAutoApprove(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>

        {/* Live Balance Impact Preview */}
        {selectedAthlete && autoApprove && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Saldo Saat Ini:</span>
              <span className="font-mono text-slate-200">{formatRupiah(saldoSebelum)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400 font-semibold">
              <span>Tambahan Setoran:</span>
              <span className="font-mono">+{formatRupiah(Number(nominal) || 0)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-bold">
              <span className="text-white">Estimasi Saldo Baru:</span>
              <span className="font-mono text-amber-400 text-sm">{formatRupiah(saldoSesudah)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{submitting ? 'Memproses Setoran...' : 'Simpan & Tambah Setoran'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
