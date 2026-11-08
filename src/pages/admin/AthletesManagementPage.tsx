import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AthleteProfile } from '../../types';
import { formatRupiah, formatTanggal, formatStatusBadge } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';
import {
  Users,
  Plus,
  Search,
  BookOpen,
  Edit2,
  Power,
  CheckCircle,
  AlertCircle,
  X,
  Phone,
  CreditCard,
  ArrowDownLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminDepositModal } from '../../components/admin/AdminDepositModal';

export const AthletesManagementPage: React.FC = () => {
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRanting, setSelectedRanting] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'AKTIF' | 'NONAKTIF'>('ALL');

  // Add athlete modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedAthleteForDeposit, setSelectedAthleteForDeposit] = useState<string>('');
  const [addForm, setAddForm] = useState({
    namaLengkap: '',
    nik: '',
    angkatan: '',
    niw: '',
    tempatLahir: 'Kediri',
    tanggalLahir: '2004-01-01',
    alamat: '',
    nomorWhatsApp: '',
    unitRanting: '',
    status: 'AKTIF' as const,
    password: '',
  });

  // Edit athlete modal
  const [editingAthlete, setEditingAthlete] = useState<AthleteProfile | null>(null);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAthletes = async () => {
    setLoading(true);
    try {
      const data = await api.getAthletes();
      setAthletes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
    const handleUpdate = () => fetchAthletes();
    window.addEventListener('ikspi_athletes_updated', handleUpdate);
    return () => {
      window.removeEventListener('ikspi_athletes_updated', handleUpdate);
    };
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.unitRanting.trim()) {
      setToast({ type: 'error', message: 'Unit / Ranting latihan wajib diisi.' });
      return;
    }
    if (addForm.nik && !/^\d{16}$/.test(addForm.nik.trim())) {
      setToast({ type: 'error', message: 'NIK harus terdiri dari 16 digit angka.' });
      return;
    }

    setSaving(true);
    try {
      const formattedNomorInduk =
        addForm.angkatan.trim() && addForm.niw.trim()
          ? `${addForm.angkatan.trim()} / ${addForm.niw.trim()}`
          : addForm.angkatan.trim() || addForm.niw.trim() || '135 / 0000';

      const res = await api.addAthleteManual(
        {
          userId: '',
          namaLengkap: addForm.namaLengkap.trim(),
          nik: addForm.nik.trim(),
          angkatan: addForm.angkatan.trim(),
          niw: addForm.niw.trim(),
          nomorInduk: formattedNomorInduk,
          tempatLahir: addForm.tempatLahir.trim(),
          tanggalLahir: addForm.tanggalLahir,
          alamat: addForm.alamat.trim(),
          nomorWhatsApp: addForm.nomorWhatsApp.trim(),
          unitRanting: addForm.unitRanting.trim(),
          status: 'AKTIF',
        },
        addForm.password || 'atlit123'
      );
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setIsAddOpen(false);
        setAddForm({
          namaLengkap: '',
          nik: '',
          angkatan: '',
          niw: '',
          tempatLahir: 'Kediri',
          tanggalLahir: '2004-01-01',
          alamat: '',
          nomorWhatsApp: '',
          unitRanting: '',
          status: 'AKTIF',
          password: '',
        });
        await fetchAthletes();
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;
    if (editingAthlete.nik && !/^\d{16}$/.test(editingAthlete.nik.trim())) {
      setToast({ type: 'error', message: 'NIK harus 16 digit angka.' });
      return;
    }
    setSaving(true);
    try {
      const formattedNomorInduk =
        editingAthlete.angkatan?.trim() && editingAthlete.niw?.trim()
          ? `${editingAthlete.angkatan.trim()} / ${editingAthlete.niw.trim()}`
          : editingAthlete.nomorInduk;

      const res = await api.updateAthlete(editingAthlete.id, {
        ...editingAthlete,
        nomorInduk: formattedNomorInduk,
      });
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setEditingAthlete(null);
        await fetchAthletes();
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (athlete: AthleteProfile) => {
    const nextStatus = athlete.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin mengubah status ${athlete.namaLengkap} menjadi ${nextStatus}?`
    );
    if (!confirmed) return;

    setToast({ type: 'success', message: `Memperbarui status ${athlete.namaLengkap}...` });
    try {
      const res = await api.updateAthlete(athlete.id, { status: nextStatus });
      if (res.success) {
        setToast({ type: 'success', message: `Status ${athlete.namaLengkap} berhasil diubah menjadi ${nextStatus}` });
        await fetchAthletes();
      } else {
        setToast({ type: 'error', message: res.message || 'Gagal mengubah status atlet' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Terjadi kesalahan saat mengubah status' });
    }
  };

  // Distinct ranting list for filter
  const distinctRantings = Array.from(
    new Set([
      'Ranting Mojoroto',
      'Ranting Pesantren',
      'Ranting Kota Kediri',
      ...(athletes || []).map((a) => a?.unitRanting).filter(Boolean),
    ])
  );

  const filtered = (athletes || []).filter((a) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (a.namaLengkap && a.namaLengkap.toLowerCase().includes(q)) ||
      (a.nomorInduk && a.nomorInduk.toLowerCase().includes(q)) ||
      (a.nik && a.nik.toLowerCase().includes(q)) ||
      (a.angkatan && a.angkatan.toLowerCase().includes(q)) ||
      (a.niw && a.niw.toLowerCase().includes(q)) ||
      (a.unitRanting && a.unitRanting.toLowerCase().includes(q));
    const matchRanting = selectedRanting === 'ALL' || a.unitRanting === selectedRanting;
    const matchStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    return matchSearch && matchRanting && matchStatus;
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>DATABASE ANGGOTA</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">Manajemen Data Atlet</h1>
          <p className="text-xs text-slate-400 mt-1">
            Daftar seluruh atlet pemilik rekening tabungan IKS PI Kera Sakti Cabang Kota Kediri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          <button
            onClick={() => {
              setSelectedAthleteForDeposit('');
              setIsDepositOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Tambah Setoran</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Atlet Manual</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama, NIK, angkatan, NIW, nomor induk, atau ranting..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={selectedRanting}
          onChange={(e) => setSelectedRanting(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="ALL">Semua Unit / Ranting</option>
          {distinctRantings.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | 'AKTIF' | 'NONAKTIF')}
          className="w-full sm:w-44 px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="ALL">Semua Status</option>
          <option value="AKTIF">🟢 Hanya Aktif</option>
          <option value="NONAKTIF">🔴 Hanya Nonaktif</option>
        </select>
      </div>

      {/* Athletes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((ath) => {
          const badge = formatStatusBadge(ath.status);

          return (
            <div
              key={ath.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow">
                      {ath.namaLengkap.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{ath.namaLengkap}</h3>
                      <p className="text-xs text-amber-400 font-mono font-medium">{ath.nomorInduk}</p>
                      <p className="text-[11px] text-slate-400">{ath.unitRanting}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStatus(ath)}
                    title={`Klik untuk ubah status ${ath.namaLengkap} (Saat ini: ${ath.status})`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition hover:opacity-80 cursor-pointer ${badge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                    <span>{badge.label}</span>
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">NIK:</span>
                    <span className="font-mono text-slate-200">{ath.nik || '-'}</span>
                  </div>
                  {(ath.angkatan || ath.niw) && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Angkatan / NIW:</span>
                      <span className="font-mono text-amber-300">
                        {ath.angkatan ? `Angkatan ${ath.angkatan}` : '-'} • {ath.niw ? `NIW ${ath.niw}` : '-'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 font-medium">Saldo Tabungan:</span>
                    <span className="font-extrabold text-amber-400 font-mono">{formatRupiah(ath.saldoSaatIni)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Masuk: {formatRupiah(ath.totalSetoran)}</span>
                    <span>Keluar: {formatRupiah(ath.totalPenarikan)}</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                  <p>Alamat: <span className="text-slate-300">{ath.alamat || '-'}</span></p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-mono">{ath.nomorWhatsApp}</span>
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedAthleteForDeposit(ath.id);
                      setIsDepositOpen(true);
                    }}
                    title={`Tambah setoran untuk ${ath.namaLengkap}`}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>+ Setor</span>
                  </button>
                  <Link
                    to={`/athlete/passbook?athleteId=${ath.id}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Buku</span>
                  </Link>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingAthlete(ath)}
                    title="Edit Profil Atlit"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStatus(ath)}
                    title={ath.status === 'AKTIF' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      ath.status === 'AKTIF'
                        ? 'text-rose-400 hover:bg-rose-500/10'
                        : 'text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Datalist for Unit/Ranting manual input */}
      <datalist id="unit-ranting-options">
        <option value="Ranting Mojoroto" />
        <option value="Ranting Pesantren" />
        <option value="Ranting Kota Kediri" />
        <option value="Komisariat IAIN Kediri" />
        <option value="Komisariat UNP Kediri" />
        <option value="Komisariat Universitas Kadiri" />
        <option value="Unit Semampir" />
        <option value="Unit Bandar Lor" />
        <option value="Unit Campurejo" />
      </datalist>

      {/* Add Manual Athlete Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Atlet Baru Secara Manual"
        subtitle="Daftarkan langsung oleh pengurus cabang"
        maxWidth="xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={addForm.namaLengkap}
                onChange={(e) => setAddForm({ ...addForm, namaLengkap: e.target.value })}
                placeholder="Arya Bimasena"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NIK (Nomor Induk Kependudukan) *
              </label>
              <input
                type="text"
                required
                maxLength={16}
                inputMode="numeric"
                value={addForm.nik}
                onChange={(e) => setAddForm({ ...addForm, nik: e.target.value.replace(/\D/g, '') })}
                placeholder="16 digit angka KTP / KK"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">16 digit angka sesuai KTP/KK</p>
            </div>

            {/* Nomor Induk Atlet: Angkatan + NIW */}
            <div className="sm:col-span-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <label className="block text-xs font-semibold text-amber-400 mb-2">
                Nomor Induk Atlet (Angkatan + NIW) *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Angkatan Lulusan / Diklat</span>
                  <input
                    type="text"
                    required
                    value={addForm.angkatan}
                    onChange={(e) => setAddForm({ ...addForm, angkatan: e.target.value })}
                    placeholder="Contoh: 135"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">NIW (Nomor Induk Warga)</span>
                  <input
                    type="text"
                    required
                    value={addForm.niw}
                    onChange={(e) => setAddForm({ ...addForm, niw: e.target.value })}
                    placeholder="Contoh: 0482"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Nomor Induk yang tersimpan di sistem:{' '}
                <strong className="text-amber-400 font-mono">
                  {addForm.angkatan && addForm.niw ? `${addForm.angkatan} / ${addForm.niw}` : 'Contoh: 135 / 0482'}
                </strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unit / Ranting Latihan (Bisa Diketik Bebas) *
              </label>
              <input
                type="text"
                required
                list="unit-ranting-options"
                value={addForm.unitRanting}
                onChange={(e) => setAddForm({ ...addForm, unitRanting: e.target.value })}
                placeholder="Ketik ranting / unit / komisariat..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">Pilih dari rekomendasi atau ketik bebas nama ranting</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor WhatsApp *</label>
              <input
                type="tel"
                required
                value={addForm.nomorWhatsApp}
                onChange={(e) => setAddForm({ ...addForm, nomorWhatsApp: e.target.value })}
                placeholder="08123456789"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tempat Lahir</label>
              <input
                type="text"
                value={addForm.tempatLahir}
                onChange={(e) => setAddForm({ ...addForm, tempatLahir: e.target.value })}
                placeholder="Kediri"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={addForm.tanggalLahir}
                onChange={(e) => setAddForm({ ...addForm, tanggalLahir: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Lengkap</label>
            <input
              type="text"
              value={addForm.alamat}
              onChange={(e) => setAddForm({ ...addForm, alamat: e.target.value })}
              placeholder="Alamat domisili atlit"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password Akun (Default: atlit123)</label>
            <input
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              placeholder="Kosongkan jika ingin atlit123"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
            >
              {saving ? 'Menyimpan...' : 'Simpan Atlet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Athlete Modal */}
      <Modal
        isOpen={!!editingAthlete}
        onClose={() => setEditingAthlete(null)}
        title="Edit Data Atlet"
        subtitle={editingAthlete?.namaLengkap}
        maxWidth="lg"
      >
        {editingAthlete && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={editingAthlete.namaLengkap}
                onChange={(e) => setEditingAthlete({ ...editingAthlete, namaLengkap: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">NIK (16 Digit)</label>
              <input
                type="text"
                maxLength={16}
                inputMode="numeric"
                value={editingAthlete.nik || ''}
                onChange={(e) => setEditingAthlete({ ...editingAthlete, nik: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Angkatan</label>
                <input
                  type="text"
                  value={editingAthlete.angkatan || ''}
                  onChange={(e) => setEditingAthlete({ ...editingAthlete, angkatan: e.target.value })}
                  placeholder="Contoh: 135"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">NIW</label>
                <input
                  type="text"
                  value={editingAthlete.niw || ''}
                  onChange={(e) => setEditingAthlete({ ...editingAthlete, niw: e.target.value })}
                  placeholder="Contoh: 0482"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Induk Atlet (Full)</label>
              <input
                type="text"
                value={editingAthlete.nomorInduk}
                onChange={(e) => setEditingAthlete({ ...editingAthlete, nomorInduk: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unit / Ranting Latihan (Bisa Ketik Manual)
              </label>
              <input
                type="text"
                list="unit-ranting-options"
                value={editingAthlete.unitRanting}
                onChange={(e) => setEditingAthlete({ ...editingAthlete, unitRanting: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor WhatsApp</label>
              <input
                type="tel"
                value={editingAthlete.nomorWhatsApp}
                onChange={(e) => setEditingAthlete({ ...editingAthlete, nomorWhatsApp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status Keanggotaan</label>
              <select
                value={editingAthlete.status || 'AKTIF'}
                onChange={(e) => setEditingAthlete({ ...editingAthlete, status: e.target.value as 'AKTIF' | 'NONAKTIF' })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="AKTIF">🟢 AKTIF (Akun normal & bisa login)</option>
                <option value="NONAKTIF">🔴 NONAKTIF (Akun dibekukan / dinonaktifkan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat</label>
              <textarea
                rows={2}
                value={editingAthlete.alamat}
                onChange={(e) => setEditingAthlete({ ...editingAthlete, alamat: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingAthlete(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
              >
                {saving ? 'Menyimpan...' : 'Perbarui'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Admin Deposit Modal */}
      <AdminDepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        preselectedAthleteId={selectedAthleteForDeposit}
        onSuccess={fetchAthletes}
      />
    </div>
  );
};
