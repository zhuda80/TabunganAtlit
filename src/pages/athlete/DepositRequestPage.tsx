import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { SystemSettings } from '../../types';
import { formatRupiah, parseRupiahInput } from '../../utils/formatters';
import {
  ArrowDownLeft,
  Building,
  CreditCard,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';

export const DepositRequestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nominalDisplay, setNominalDisplay] = useState('50.000');
  const [metode, setMetode] = useState<'TUNAI' | 'TRANSFER'>('TRANSFER');
  const [namaBankPengirim, setNamaBankPengirim] = useState('BCA');
  const [nomorRekeningPengirim, setNomorRekeningPengirim] = useState('');
  const [buktiTransferUrl, setBuktiTransferUrl] = useState('');
  const [buktiTransferName, setBuktiTransferName] = useState('');
  const [keterangan, setKeterangan] = useState('Setoran Tabungan Atlit');

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successTrx, setSuccessTrx] = useState<string | null>(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10);
    if (isNaN(num)) {
      setNominalDisplay('0');
    } else {
      setNominalDisplay(num.toLocaleString('id-ID'));
    }
  };

  const handleQuickAmount = (amount: number) => {
    setNominalDisplay(amount.toLocaleString('id-ID'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 3MB.');
      return;
    }

    setBuktiTransferName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBuktiTransferUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!user) return;

    const nominalInt = parseRupiahInput(nominalDisplay);
    if (nominalInt < 10000) {
      setErrorMsg('Nominal setoran minimal adalah Rp 10.000');
      return;
    }

    if (metode === 'TRANSFER' && !buktiTransferUrl) {
      setErrorMsg('Untuk metode transfer, Anda wajib mengunggah foto / struk bukti transfer.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitDeposit(user, {
        nominal: nominalInt,
        metodePembayaran: metode,
        namaBankPengirim: metode === 'TRANSFER' ? namaBankPengirim : undefined,
        nomorRekeningPengirim: metode === 'TRANSFER' ? nomorRekeningPengirim : undefined,
        buktiTransferUrl: buktiTransferUrl || undefined,
        buktiTransferName: buktiTransferName || undefined,
        keterangan: keterangan || 'Setoran Tabungan Atlit',
      });

      if (res.success) {
        setSuccessTrx(res.nomorTransaksi || 'TRX-DEP');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim pengajuan setoran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>FORMULIR TABUNGAN</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-serif">Pengajuan Setoran Tabungan</h1>
        <p className="text-xs text-slate-400 mt-1">
          Masukkan nominal uang tabungan yang ingin Anda setorkan. Pengajuan akan diperiksa dan disetujui oleh pengurus kas cabang.
        </p>
      </div>

      {successTrx ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Pengajuan Setoran Berhasil Dikirim!</h2>
          <p className="text-xs text-slate-300">
            Nomor Transaksi Unik Anda: <span className="font-mono text-amber-400 font-bold">{successTrx}</span>
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-left space-y-1">
            <p className="font-semibold text-amber-400">Status Saat Ini: MENUNGGU PERSETUJUAN</p>
            <p>• Transaksi setoran pending tidak langsung mengubah saldo.</p>
            <p>• Setelah bendahara memeriksa dan menyetujui, saldo tabungan Anda akan otomatis bertambah tepat satu kali.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setSuccessTrx(null);
                setNominalDisplay('50.000');
                setBuktiTransferUrl('');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
            >
              Setor Lagi
            </button>
            <button
              onClick={() => navigate('/athlete/transactions')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              Lihat Riwayat Transaksi
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nominal Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
              Nominal Setoran (Rupiah) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-lg">
                Rp
              </span>
              <input
                type="text"
                required
                value={nominalDisplay}
                onChange={handleNominalChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xl sm:text-2xl font-black text-amber-400 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[20000, 50000, 100000, 250000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-[11px] text-slate-300 font-medium transition"
                >
                  {formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Metode Pembayaran *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetode('TRANSFER')}
                className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                  metode === 'TRANSFER'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${metode === 'TRANSFER' ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <h4 className="text-xs font-bold">Transfer Bank</h4>
                  <p className="text-[10px] text-slate-400">Transfer ke rekening kas cabang</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMetode('TUNAI')}
                className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                  metode === 'TUNAI'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building className={`w-5 h-5 ${metode === 'TUNAI' ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <h4 className="text-xs font-bold">Tunai di Sekretariat</h4>
                  <p className="text-[10px] text-slate-400">Bayar ke bendahara ranting/cabang</p>
                </div>
              </button>
            </div>
          </div>

          {/* If Transfer: Bank Details & Upload Proof */}
          {metode === 'TRANSFER' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                <Info className="w-4 h-4" />
                <span>Rekening Tujuan Kas IKS PI Kota Kediri:</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                <p className="text-slate-400">Bank: <strong className="text-white">{settings?.namaBankOrganisasi || 'BCA'}</strong></p>
                <p className="text-slate-400">No. Rekening: <strong className="text-amber-400 text-sm">{settings?.nomorRekeningOrganisasi || '140-00-1980808-1'}</strong></p>
                <p className="text-slate-400">A.n.: <strong className="text-white">{settings?.atasNamaRekening || 'IKS PI KERA SAKTI CABANG KOTA KEDIRI'}</strong></p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Bank Pengirim Anda</label>
                  <input
                    type="text"
                    value={namaBankPengirim}
                    onChange={(e) => setNamaBankPengirim(e.target.value)}
                    placeholder="Contoh: BCA, Mandiri, BRI, SeaBank, DANA"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">No. Rekening / Akun Anda</label>
                  <input
                    type="text"
                    value={nomorRekeningPengirim}
                    onChange={(e) => setNomorRekeningPengirim(e.target.value)}
                    placeholder="Nomor rekening pengirim"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Upload File Bukti */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Upload Foto / Screenshot Struk Transfer * (Maks. 3MB)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    required={metode === 'TRANSFER'}
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>

                {buktiTransferUrl && (
                  <div className="mt-3 p-2 rounded-xl bg-slate-900 border border-slate-800 inline-flex items-center gap-3">
                    <img
                      src={buktiTransferUrl}
                      alt="Preview Bukti"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Gambar Bukti Siap Diunggah
                      </p>
                      <p className="text-[10px] text-slate-400">{buktiTransferName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan / Keperluan Tabungan (Opsional)
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Tabungan persiapan Kejurcab Kediri / Uang saku latihan"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Kirim Formulir Setoran Tabungan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
