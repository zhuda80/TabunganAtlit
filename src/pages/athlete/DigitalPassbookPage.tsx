import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AthleteProfile, MutationRecord } from '../../types';
import { formatRupiah, formatTanggal, formatTanggalWaktu } from '../../utils/formatters';
import { IksPiLogo } from '../../components/common/IksPiLogo';
import {
  BookOpen,
  Printer,
  Download,
  Shield,
  CreditCard,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const DigitalPassbookPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const targetAthleteId = queryParams.get('athleteId');

  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [mutasiList, setMutasiList] = useState<MutationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPassbook();
  }, [user, targetAthleteId]);

  const fetchPassbook = async () => {
    setLoading(true);
    try {
      const athleteId = targetAthleteId || user?.athleteId || 'ATL-001';
      const res = await api.getDigitalPassbook(athleteId);
      if (res) {
        setAthlete(res.athlete);
        setSaldo(res.saldoSaatIni);
        setMutasiList(res.mutasi);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>BUKU TABUNGAN ELEKTRONIK</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">Buku Tabungan Digital Atlit</h1>
          <p className="text-xs text-slate-400 mt-1">
            Buku rekening digital resmi anggota dan atlet Perguruan IKS PI Kera Sakti Cabang Kota Kediri.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 self-start cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Unduh PDF</span>
        </button>
      </div>

      {/* Authentic Digital Passbook Container */}
      <div className="rounded-3xl border-2 border-amber-500/40 bg-slate-950 shadow-2xl overflow-hidden print:border-black print:bg-white print:text-black print:rounded-none print:shadow-none">
        {/* Passbook Front Header / Cover Identity */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 border-b-2 border-amber-500/40 p-6 md:p-8 print:bg-white print:border-b-2 print:border-black">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <IksPiLogo size="lg" showSubtitle={true} />
            </div>

            <div className="text-left md:text-right font-mono text-xs text-slate-300 print:text-black space-y-1">
              <p className="font-bold text-amber-400 print:text-black uppercase">BUKU TABUNGAN PRESTASI ATLIT</p>
              <p>NO. REKENING: <strong className="text-white print:text-black text-sm">{athlete?.nomorInduk || 'IKS-KDR-000'}</strong></p>
              <p className="text-[11px] text-slate-400 print:text-gray-600">Dicetak: {formatTanggal(new Date())}</p>
            </div>
          </div>

          {/* Athlete Profile Card Inside Passbook Header */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 print:border-gray-400 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-gray-50 print:border-gray-300 flex items-center gap-2.5">
              {(athlete?.fotoUrl || user?.fotoUrl) && (
                <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-400/40 shrink-0">
                  <img
                    src={athlete?.fotoUrl || user?.fotoUrl}
                    alt={athlete?.namaLengkap || user?.namaLengkap}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Nama Pemilik</span>
                <strong className="text-sm font-bold text-white print:text-black line-clamp-1">
                  {athlete?.namaLengkap || user?.namaLengkap}
                </strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">NIK</span>
              <strong className="text-xs font-bold text-slate-200 print:text-black font-mono">
                {athlete?.nik || user?.nik || '-'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Nomor Induk Atlet</span>
              <strong className="text-sm font-bold text-amber-400 print:text-black font-mono block">
                {athlete?.nomorInduk || user?.nomorInduk}
              </strong>
              {(athlete?.angkatan || athlete?.niw) && (
                <span className="text-[10px] text-amber-300/80 print:text-gray-600 font-mono">
                  Akt. {athlete?.angkatan || '-'} • NIW {athlete?.niw || '-'}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Unit / Ranting</span>
              <strong className="text-xs font-bold text-slate-200 print:text-black line-clamp-1">
                {athlete?.unitRanting || user?.unitRanting || 'Mojoroto, Kota Kediri'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 print:bg-gray-50 print:border-gray-300">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-semibold">Saldo Tabungan</span>
              <strong className="text-base font-black text-amber-400 print:text-black font-mono">
                {formatRupiah(saldo)}
              </strong>
            </div>
          </div>
        </div>

        {/* Passbook Lines Table */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono print:text-black">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b-2 border-slate-800 print:bg-gray-100 print:text-black print:border-black">
                <tr>
                  <th className="py-3 px-3">Tgl</th>
                  <th className="py-3 px-3">No. Referensi</th>
                  <th className="py-3 px-3">Uraian Transaksi</th>
                  <th className="py-3 px-3 text-right">Debet (Keluar)</th>
                  <th className="py-3 px-3 text-right">Kredit (Masuk)</th>
                  <th className="py-3 px-3 text-right">Saldo</th>
                  <th className="py-3 px-3 text-center">Paraf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 print:text-black print:divide-gray-300">
                {mutasiList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                      Belum ada mutasi transaksi pada buku tabungan ini.
                    </td>
                  </tr>
                ) : (
                  mutasiList.map((m) => {
                    const isKredit = m.jenisMutasi === 'KREDIT';
                    return (
                      <tr key={m.id} className="hover:bg-slate-900/50 print:hover:bg-transparent">
                        <td className="py-3 px-3 whitespace-nowrap text-slate-400 print:text-black">
                          {formatTanggal(m.waktu)}
                        </td>
                        <td className="py-3 px-3 font-semibold text-amber-400 print:text-black">
                          {m.nomorReferensi}
                        </td>
                        <td className="py-3 px-3 text-slate-200 print:text-black max-w-xs truncate">
                          {m.keterangan}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-rose-400 print:text-black">
                          {!isKredit ? formatRupiah(m.nominal) : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400 print:text-black">
                          {isKredit ? formatRupiah(m.nominal) : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-white print:text-black">
                          {formatRupiah(m.saldoSesudah)}
                        </td>
                        <td className="py-3 px-3 text-center text-[10px] text-slate-500 print:text-black">
                          {m.petugas || 'SYS'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Passbook Footer Seal & Signatures */}
          <div className="mt-8 pt-6 border-t border-slate-800 print:border-black flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 print:text-black">
            <div className="space-y-1">
              <p className="font-semibold text-slate-300 print:text-black">KETENTUAN BUKU TABUNGAN ATLIT:</p>
              <p className="text-[11px] leading-relaxed">
                1. Buku tabungan ini adalah bukti kepemilikan simpanan prestasi di IKS PI Cabang Kota Kediri.<br />
                2. Penarikan dana hanya dapat disetujui untuk atlet yang bersangkutan.<br />
                3. Saldo tabungan dikelola secara amanah dan transparan melalui Google Sheets & Drive perguruan.
              </p>
            </div>

            <div className="text-center font-sans shrink-0 border border-amber-500/30 p-3 rounded-xl bg-slate-900 print:bg-white print:border-black">
              <p className="text-[10px] uppercase font-bold text-amber-400 print:text-black">Sah Terverifikasi</p>
              <p className="font-serif font-black text-xs text-white print:text-black mt-1">
                BENDAHARA IKS PI CABANG KEDIRI
              </p>
              <div className="w-16 h-1 bg-amber-400 mx-auto my-1"></div>
              <p className="text-[9px] font-mono text-slate-400 print:text-gray-600">ID: SEC-IKS-KEDIRI-PASSBOOK</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
