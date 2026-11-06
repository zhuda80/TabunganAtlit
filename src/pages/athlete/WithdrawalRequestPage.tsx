import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatRupiah, parseRupiahInput } from '../../utils/formatters';
import {
  ArrowUpRight,
  Wallet,
  Building,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export const WithdrawalRequestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentBalance, setCurrentBalance] = useState(0);
  const [saldoEndapan, setSaldoEndapan] = useState(20000);
  const [nominalDisplay, setNominalDisplay] = useState('50.000');
  const [keperluan, setKeperluan] = useState('');
  const [metode, setMetode] = useState<'TRANSFER' | 'TUNAI'>('TRANSFER');
  const [namaBankPenerima, setNamaBankPenerima] = useState('BCA');
  const [nomorRekeningPenerima, setNomorRekeningPenerima] = useState('');
  const [namaPenerimaRekening, setNamaPenerimaRekening] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successTrx, setSuccessTrx] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getDashboard(user),
      api.getSettings(),
    ]).then(([dashRes, setRes]) => {
      if (dashRes && dashRes.stats) {
        setCurrentBalance(dashRes.stats.saldoSaatIni || 0);
      }
      if (setRes) {
        setSaldoEndapan(setRes.saldoEndapan ?? 20000);
      }
    }).catch(console.error);

    if (user?.namaLengkap) {
      setNamaPenerimaRekening(user.namaLengkap);
    }
  }, [user]);

  const saldoDapatDitarik = Math.max(0, currentBalance - saldoEndapan);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10);
    if (isNaN(num)) {
      setNominalDisplay('0');
    } else {
      setNominalDisplay(num.toLocaleString('id-ID'));
    }
  };

  const handleTarikSemua = () => {
    setNominalDisplay(saldoDapatDitarik.toLocaleString('id-ID'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!user) return;

    const nominalInt = parseRupiahInput(nominalDisplay);
    if (nominalInt < 10000) {
      setErrorMsg('Nominal penarikan minimal adalah Rp 10.000');
      return;
    }

    if (nominalInt > saldoDapatDitarik) {
      setErrorMsg(`Saldo tidak mencukupi setelah memperhitungkan saldo endapan wajib sebesar ${formatRupiah(saldoEndapan)}. Maksimal yang dapat Anda tarik saat ini adalah ${formatRupiah(saldoDapatDitarik)}.`);
      return;
    }

    if (!keperluan.trim()) {
      setErrorMsg('Silakan tulis keperluan/alasan penarikan tabungan.');
      return;
    }

    if (metode === 'TRANSFER' && (!nomorRekeningPenerima.trim() || !namaPenerimaRekening.trim())) {
      setErrorMsg('Untuk metode transfer, Anda wajib mengisi nama bank, nomor rekening, dan nama pemilik rekening.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitWithdrawal(user, {
        nominal: nominalInt,
        keperluan,
        metodePenyaluran: metode,
        namaBankPenerima: metode === 'TRANSFER' ? namaBankPenerima : undefined,
        nomorRekeningPenerima: metode === 'TRANSFER' ? nomorRekeningPenerima : undefined,
        namaPenerimaRekening: metode === 'TRANSFER' ? namaPenerimaRekening : undefined,
      });

      if (res.success) {
        setSuccessTrx(res.nomorTransaksi || 'TRX-WD');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim pengajuan penarikan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>PENCAIRAN TABUNGAN</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-serif">Formulir Penarikan Tabungan</h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajukan penarikan saldo tabungan Anda untuk keperluan perlengkapan silat, uang saku, atau biaya kejuaraan.
        </p>
      </div>

      {/* Balance Breakdown Card with Saldo Endapan */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950/30 border border-amber-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Maksimal Saldo Dapat Ditarik</p>
              <p className="text-2xl font-black text-amber-400 font-mono">{formatRupiah(saldoDapatDitarik)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTarikSemua}
            disabled={saldoDapatDitarik <= 0}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 transition self-start sm:self-auto disabled:opacity-50"
          >
            Tarik Maksimal ({formatRupiah(saldoDapatDitarik)})
          </button>
        </div>

        {/* Detailed breakdown badges */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Total Saldo Tabungan</span>
            <span className="font-bold text-white font-mono">{formatRupiah(currentBalance)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/20">
            <span className="text-[10px] text-amber-400 block font-semibold">Saldo Endapan Wajib</span>
            <span className="font-bold text-amber-400 font-mono">{formatRupiah(saldoEndapan)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-emerald-400 block font-semibold">Bisa Dicairkan</span>
            <span className="font-bold text-emerald-400 font-mono">{formatRupiah(saldoDapatDitarik)}</span>
          </div>
        </div>
      </div>

      {successTrx ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Pengajuan Penarikan Telah Dikirim!</h2>
          <p className="text-xs text-slate-300">
            Nomor Pengajuan: <span className="font-mono text-amber-400 font-bold">{successTrx}</span>
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-left space-y-1">
            <p className="font-semibold text-amber-400">Status: MENUNGGU PERSETUJUAN ADMIN</p>
            <p>• Admin bendahara cabang akan memverifikasi saldo dan mengirimkan dana ke rekening Anda.</p>
            <p>• Setelah disetujui, saldo tabungan Anda akan otomatis berkurang tepat satu kali.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => navigate('/athlete/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              Kembali ke Dashboard
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
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-400">
              Nominal Penarikan (Rupiah) *
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
                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xl sm:text-2xl font-black text-rose-400 focus:outline-none focus:border-rose-400 transition"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Minimal penarikan Rp 10.000 dan tidak boleh melebihi saldo tersedia.
            </p>
          </div>

          {/* Keperluan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Keperluan / Alasan Penarikan *
            </label>
            <input
              type="text"
              required
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              placeholder="Contoh: Pembelian seragam tanding / Biaya pendaftaran Kejurda"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Metode Penyaluran */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Metode Penyaluran Dana *
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
                  <h4 className="text-xs font-bold">Transfer Bank Pribadi</h4>
                  <p className="text-[10px] text-slate-400">Kirim ke rekening atlet</p>
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
                  <h4 className="text-xs font-bold">Ambil Tunai di Kas</h4>
                  <p className="text-[10px] text-slate-400">Ambil langsung ke bendahara cabang</p>
                </div>
              </button>
            </div>
          </div>

          {/* Athlete Bank Details if Transfer */}
          {metode === 'TRANSFER' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Rekening Bank Penerima (Rekening Anda)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Bank</label>
                  <input
                    type="text"
                    required
                    value={namaBankPenerima}
                    onChange={(e) => setNamaBankPenerima(e.target.value)}
                    placeholder="BCA / BRI / Mandiri"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    value={nomorRekeningPenerima}
                    onChange={(e) => setNomorRekeningPenerima(e.target.value)}
                    placeholder="Nomor rekening Anda"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Atas Nama Rekening</label>
                  <input
                    type="text"
                    required
                    value={namaPenerimaRekening}
                    onChange={(e) => setNamaPenerimaRekening(e.target.value)}
                    placeholder="Nama di buku tabungan"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || currentBalance < 10000}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Ajukan Penarikan Saldo</span>
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
