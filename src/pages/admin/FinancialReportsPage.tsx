import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { MutationRecord, AthleteProfile, RekapDanaEndapanSummary, AthleteEndapanItem } from '../../types';
import { formatRupiah, formatTanggal, formatTanggalWaktu } from '../../utils/formatters';
import { StatCard } from '../../components/ui/StatCard';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Calendar,
  Lock,
  ShieldCheck,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Building2,
  RefreshCw,
} from 'lucide-react';

export const FinancialReportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab')?.toUpperCase() === 'ENDAPAN' ? 'DANA_ENDAPAN' : 'ARUS_KAS';
  const [activeReportTab, setActiveReportTab] = useState<'ARUS_KAS' | 'DANA_ENDAPAN'>(initialTab);

  // Tab 1: Mutation Reports State
  const [reportData, setReportData] = useState<{
    mutations: MutationRecord[];
    totalKredit: number;
    totalDebit: number;
    saldoNetto: number;
    totalTransaksi: number;
    athletesList: AthleteProfile[];
  } | null>(null);

  const [loadingMutations, setLoadingMutations] = useState(true);
  const [period, setPeriod] = useState<'HARIAN' | 'BULANAN' | 'TAHUNAN' | 'CUSTOM'>('BULANAN');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [athleteFilter, setAthleteFilter] = useState('ALL');
  const [jenisFilter, setJenisFilter] = useState<'SEMUA' | 'SETORAN' | 'PENARIKAN'>('SEMUA');

  // Tab 2: Rekap Dana Endapan State
  const [rekapEndapan, setRekapEndapan] = useState<RekapDanaEndapanSummary | null>(null);
  const [loadingEndapan, setLoadingEndapan] = useState(false);
  const [endapanSearch, setEndapanSearch] = useState('');
  const [endapanRantingFilter, setEndapanRantingFilter] = useState('ALL');
  const [endapanStatusFilter, setEndapanStatusFilter] = useState<'ALL' | 'TERPENUHI' | 'KURANG' | 'BELUM_ADA'>('ALL');

  // Fetch Mutations Report
  const fetchReport = async () => {
    setLoadingMutations(true);
    try {
      const data = await api.getReports({
        startDate,
        endDate,
        athleteId: athleteFilter,
        jenis: jenisFilter,
      });
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMutations(false);
    }
  };

  // Fetch Rekap Dana Endapan
  const fetchRekapEndapan = async () => {
    setLoadingEndapan(true);
    try {
      const res = await api.getRekapDanaEndapan();
      if (res && res.success && res.rekap) {
        setRekapEndapan(res.rekap);
      }
    } catch (err) {
      console.error('Failed to load Rekap Dana Endapan:', err);
    } finally {
      setLoadingEndapan(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, athleteFilter, jenisFilter]);

  useEffect(() => {
    if (activeReportTab === 'DANA_ENDAPAN') {
      fetchRekapEndapan();
      if (searchParams.get('tab') !== 'endapan') {
        setSearchParams({ tab: 'endapan' }, { replace: true });
      }
    } else {
      if (searchParams.has('tab')) {
        setSearchParams({}, { replace: true });
      }
    }
  }, [activeReportTab]);

  const handlePeriodChange = (newPeriod: 'HARIAN' | 'BULANAN' | 'TAHUNAN' | 'CUSTOM') => {
    setPeriod(newPeriod);
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');

    if (newPeriod === 'HARIAN') {
      const todayStr = `${y}-${m}-${d}`;
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (newPeriod === 'BULANAN') {
      setStartDate(`${y}-${m}-01`);
      setEndDate(`${y}-${m}-31`);
    } else if (newPeriod === 'TAHUNAN') {
      setStartDate(`${y}-01-01`);
      setEndDate(`${y}-12-31`);
    }
  };

  // Export Mutations to Excel
  const exportMutationsToExcel = () => {
    if (!reportData || reportData.mutations.length === 0) return;

    const rows = reportData.mutations.map((m, idx) => ({
      No: idx + 1,
      'No Referensi': m.nomorReferensi,
      'Nama Atlet': m.namaLengkap,
      'Jenis Mutasi': m.jenisMutasi === 'KREDIT' ? 'Setoran (Masuk)' : 'Penarikan (Keluar)',
      'Nominal (IDR)': m.nominal,
      'Saldo Sebelum': m.saldoSebelum,
      'Saldo Sesudah': m.saldoSesudah,
      Keterangan: m.keterangan,
      'Waktu Transaksi': formatTanggalWaktu(m.waktu),
      'Petugas Admin': m.petugas,
    }));

    rows.push({
      No: '' as any,
      'No Referensi': 'TOTAL KREDIT (MASUK)',
      'Nama Atlet': '',
      'Jenis Mutasi': '',
      'Nominal (IDR)': reportData.totalKredit,
      'Saldo Sebelum': '' as any,
      'Saldo Sesudah': '' as any,
      Keterangan: '',
      'Waktu Transaksi': '',
      'Petugas Admin': '',
    });

    rows.push({
      No: '' as any,
      'No Referensi': 'TOTAL DEBIT (KELUAR)',
      'Nama Atlet': '',
      'Jenis Mutasi': '',
      'Nominal (IDR)': reportData.totalDebit,
      'Saldo Sebelum': '' as any,
      'Saldo Sesudah': '' as any,
      Keterangan: '',
      'Waktu Transaksi': '',
      'Petugas Admin': '',
    });

    rows.push({
      No: '' as any,
      'No Referensi': 'SALDO NETTO PERIODE',
      'Nama Atlet': '',
      'Jenis Mutasi': '',
      'Nominal (IDR)': reportData.saldoNetto,
      'Saldo Sebelum': '' as any,
      'Saldo Sesudah': '' as any,
      Keterangan: '',
      'Waktu Transaksi': '',
      'Petugas Admin': '',
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan_Keuangan');

    XLSX.writeFile(
      workbook,
      `Laporan_Tabungan_IKSPI_Kediri_${startDate}_sd_${endDate}.xlsx`
    );
  };

  // Export Rekap Dana Endapan to Excel
  const exportEndapanToExcel = () => {
    if (!rekapEndapan || rekapEndapan.rincianAtlit.length === 0) return;

    const rows: any[] = filteredEndapanList.map((item, idx) => ({
      No: idx + 1,
      'Nama Atlet': item.namaLengkap,
      'Angkatan': item.angkatan || '-',
      'NIW': item.niw || '-',
      'Nomor Induk': item.nomorInduk,
      'Unit Ranting': item.unitRanting,
      'Saldo Tabungan Saat Ini (IDR)': item.saldoSaatIni,
      'Endapan Wajib (IDR)': item.saldoEndapanWajib,
      'Endapan Terkunci (IDR)': item.saldoEndapanTerkunci,
      'Saldo Bebas / Bisa Ditarik (IDR)': item.saldoBebasDitarik,
      'Status Pemenuhan': item.statusPemenuhan,
      'Kekurangan Endapan (IDR)': item.kekuranganEndapan,
      'Persentase Terpenuhi (%)': `${item.persentaseTerpenuhi}%`,
    }));

    // Summary Rows
    rows.push({
      No: '' as any,
      'Nama Atlet': 'TOTAL KESELURUHAN',
      'Angkatan': '',
      'NIW': '',
      'Nomor Induk': '',
      'Unit Ranting': '',
      'Saldo Tabungan Saat Ini (IDR)': rekapEndapan.totalSaldoKasAtlit,
      'Endapan Wajib (IDR)': rekapEndapan.totalTargetEndapan,
      'Endapan Terkunci (IDR)': rekapEndapan.totalEndapanTerkunci,
      'Saldo Bebas / Bisa Ditarik (IDR)': rekapEndapan.totalSaldoBebasDitarik,
      'Status Pemenuhan': `${rekapEndapan.persentaseKepatuhan}% Terpenuhi`,
      'Kekurangan Endapan (IDR)': Math.max(0, rekapEndapan.totalTargetEndapan - rekapEndapan.totalEndapanTerkunci),
      'Persentase Terpenuhi (%)': `${rekapEndapan.persentaseKepatuhan}%`,
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap_Dana_Endapan');

    const todayStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(
      workbook,
      `Rekap_Dana_Endapan_IKSPI_Kediri_${todayStr}.xlsx`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered Endapan Athletes List
  const filteredEndapanList = rekapEndapan?.rincianAtlit.filter((item) => {
    const q = endapanSearch.toLowerCase();
    const matchSearch =
      item.namaLengkap.toLowerCase().includes(q) ||
      item.nomorInduk.toLowerCase().includes(q) ||
      (item.angkatan && item.angkatan.toLowerCase().includes(q)) ||
      (item.niw && item.niw.toLowerCase().includes(q));

    const matchRanting = endapanRantingFilter === 'ALL' || item.unitRanting === endapanRantingFilter;
    const matchStatus = endapanStatusFilter === 'ALL' || item.statusPemenuhan === endapanStatusFilter;

    return matchSearch && matchRanting && matchStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>REKAPITULASI & LAPORAN RESMI CABANG</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            Laporan Keuangan & Rekap Dana Tabungan
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Laporan arus kas mutasi tabungan dan rekapitulasi dana endapan wajib atlet IKS PI Cabang Kota Kediri.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeReportTab === 'ARUS_KAS' ? (
            <button
              onClick={exportMutationsToExcel}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </button>
          ) : (
            <button
              onClick={exportEndapanToExcel}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel Rekap Endapan</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-slate-800 print:hidden">
        <button
          onClick={() => setActiveReportTab('ARUS_KAS')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'ARUS_KAS'
              ? 'border-amber-400 text-amber-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Laporan Arus Kas & Mutasi</span>
        </button>

        <button
          onClick={() => setActiveReportTab('DANA_ENDAPAN')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'DANA_ENDAPAN'
              ? 'border-amber-400 text-amber-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Rekap Dana Endapan Atlet</span>
          {rekapEndapan && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
              {rekapEndapan.totalAtlitAktif} Atlet
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LAPORAN ARUS KAS & MUTASI                         */}
      {/* ======================================================== */}
      {activeReportTab === 'ARUS_KAS' && (
        <div className="space-y-6">
          {/* Filter Options */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 print:hidden">
            {/* Period Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
              {(['HARIAN', 'BULANAN', 'TAHUNAN', 'CUSTOM'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    period === p
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  {p === 'HARIAN' && 'Laporan Harian'}
                  {p === 'BULANAN' && 'Laporan Bulanan'}
                  {p === 'TAHUNAN' && 'Laporan Tahunan'}
                  {p === 'CUSTOM' && 'Kustom Tanggal'}
                </button>
              ))}
            </div>

            {/* Dates & Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Dari Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Filter Atlet</label>
                <select
                  value={athleteFilter}
                  onChange={(e) => setAthleteFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="ALL">Semua Atlet</option>
                  {reportData?.athletesList?.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.namaLengkap} ({a.unitRanting})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jenis Transaksi</label>
                <select
                  value={jenisFilter}
                  onChange={(e) => setJenisFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="SEMUA">Semua (Masuk & Keluar)</option>
                  <option value="SETORAN">Hanya Setoran Masuk</option>
                  <option value="PENARIKAN">Hanya Penarikan Keluar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Setoran Masuk"
              value={formatRupiah(reportData?.totalKredit || 0)}
              subtitle="Arus kas masuk di periode ini"
              icon={ArrowDownLeft}
              variant="emerald"
            />
            <StatCard
              title="Total Penarikan Keluar"
              value={formatRupiah(reportData?.totalDebit || 0)}
              subtitle="Arus kas keluar di periode ini"
              icon={ArrowUpRight}
              variant="rose"
            />
            <StatCard
              title="Saldo Netto Periode"
              value={formatRupiah(reportData?.saldoNetto || 0)}
              subtitle={`${reportData?.totalTransaksi || 0} mutasi transaksi`}
              icon={Wallet}
              variant="gold"
            />
          </div>

          {/* Report Table / Print Layout */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl p-6 print:bg-white print:text-black print:border-black print:p-0">
            {/* Printable Letterhead Header */}
            <div className="hidden print:block mb-6 border-b-2 border-black pb-4 text-center">
              <h2 className="text-xl font-bold uppercase tracking-wider font-serif">
                PERGURUAN IKS PI KERA SAKTI CABANG KOTA KEDIRI
              </h2>
              <p className="text-sm font-semibold">BADAN PENGELOLA TABUNGAN DAN KAS ATLIT</p>
              <p className="text-xs text-gray-600 mt-1">
                Padepokan IKS PI Kota Kediri, Jawa Timur • Rekapitulasi Periode: {formatTanggal(startDate)} s/d {formatTanggal(endDate)}
              </p>
            </div>

            <div className="flex items-center justify-between mb-4 print:hidden">
              <div>
                <h3 className="text-base font-bold text-white">Rincian Buku Kas Mutasi</h3>
                <p className="text-xs text-slate-400">
                  Periode {formatTanggal(startDate)} sampai {formatTanggal(endDate)}
                </p>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                {reportData?.totalTransaksi || 0} Transaksi Terverifikasi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs print:text-black print:border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 print:bg-gray-100 print:text-black print:border-black">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">No. Referensi</th>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Nama Atlet</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                    <th className="py-2.5 px-3">Setoran (Kredit)</th>
                    <th className="py-2.5 px-3">Penarikan (Debit)</th>
                    <th className="py-2.5 px-3">Saldo Akhir</th>
                    <th className="py-2.5 px-3">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 print:text-black print:divide-gray-300">
                  {loadingMutations ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Memuat data mutasi pembukuan...
                      </td>
                    </tr>
                  ) : reportData?.mutations?.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Tidak ada mutasi transaksi pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    reportData?.mutations?.map((m, idx) => {
                      const isKredit = m.jenisMutasi === 'KREDIT';
                      return (
                        <tr key={m.id} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                          <td className="py-2.5 px-3 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono text-amber-400 print:text-black font-medium">
                            {m.nomorReferensi}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 print:text-black whitespace-nowrap">
                            {formatTanggalWaktu(m.waktu)}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white print:text-black">
                            {m.namaLengkap}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 print:text-black max-w-xs truncate">
                            {m.keterangan}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400 print:text-black">
                            {isKredit ? formatRupiah(m.nominal) : '-'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-rose-400 print:text-black">
                            {!isKredit ? formatRupiah(m.nominal) : '-'}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-white print:text-black">
                            {formatRupiah(m.saldoSesudah)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 print:text-black font-mono text-[11px]">
                            {m.petugas}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {reportData && reportData.mutations.length > 0 && (
                  <tfoot className="border-t-2 border-slate-700 bg-slate-950 font-bold text-xs text-white print:bg-gray-100 print:text-black print:border-black">
                    <tr>
                      <td colSpan={5} className="py-3 px-3 text-right uppercase">
                        Total Mutasi Kas:
                      </td>
                      <td className="py-3 px-3 text-emerald-400 print:text-black">
                        {formatRupiah(reportData.totalKredit)}
                      </td>
                      <td className="py-3 px-3 text-rose-400 print:text-black">
                        {formatRupiah(reportData.totalDebit)}
                      </td>
                      <td colSpan={2} className="py-3 px-3 text-amber-400 print:text-black font-mono">
                        Netto: {formatRupiah(reportData.saldoNetto)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Printable Signatures */}
            <div className="hidden print:grid grid-cols-2 gap-8 mt-12 pt-6 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Ketua Cabang IKS PI Kota Kediri</p>
                <div className="h-20"></div>
                <p className="font-bold underline">( ............................................ )</p>
                <p className="text-[10px]">Tingkat II / Pengurus Harian</p>
              </div>
              <div>
                <p>Kota Kediri, {new Date().toLocaleDateString('id-ID')}</p>
                <p className="font-bold">Bendahara Pengelola Tabungan Atlit</p>
                <div className="h-20"></div>
                <p className="font-bold underline">( ............................................ )</p>
                <p className="text-[10px]">Cabang Kota Kediri</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: REKAP DANA ENDAPAN ATLET                          */}
      {/* ======================================================== */}
      {activeReportTab === 'DANA_ENDAPAN' && (
        <div className="space-y-6">
          {/* Executive Overview Cards for Dana Endapan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Target Total Dana Endapan"
              value={formatRupiah(rekapEndapan?.totalTargetEndapan || 0)}
              subtitle={`${rekapEndapan?.totalAtlitAktif || 0} Atlet Aktif × ${formatRupiah(rekapEndapan?.saldoEndapanWajibPerAtlit || 50000)}`}
              icon={ShieldCheck}
              variant="blue"
            />
            <StatCard
              title="Dana Endapan Terkunci (Riil)"
              value={formatRupiah(rekapEndapan?.totalEndapanTerkunci || 0)}
              subtitle="Saldo mengendap di kas cabang"
              icon={Lock}
              variant="gold"
            />
            <StatCard
              title="Total Saldo Bebas (Bisa Ditarik)"
              value={formatRupiah(rekapEndapan?.totalSaldoBebasDitarik || 0)}
              subtitle="Dana likuid atlet di luar endapan"
              icon={Wallet}
              variant="emerald"
            />
            <StatCard
              title="Tingkat Kepatuhan Endapan"
              value={`${rekapEndapan?.persentaseKepatuhan || 0}%`}
              subtitle={`${rekapEndapan?.jumlahAtlitTerpenuhi || 0} Atlet Terpenuhi (${rekapEndapan?.jumlahAtlitBelumTerpenuhi || 0} Kurang)`}
              icon={CheckCircle}
              variant={
                (rekapEndapan?.persentaseKepatuhan || 0) >= 80
                  ? 'emerald'
                  : (rekapEndapan?.persentaseKepatuhan || 0) >= 50
                  ? 'gold'
                  : 'rose'
              }
            />
          </div>

          {/* Ranting Aggregate Breakdown */}
          {rekapEndapan?.rekapPerRanting && rekapEndapan.rekapPerRanting.length > 0 && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl print:hidden">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Ringkasan Dana Endapan per Unit / Ranting</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rekapEndapan.rekapPerRanting.map((r) => (
                  <div
                    key={r.unitRanting}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{r.unitRanting}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 font-mono text-slate-300">
                        {r.totalAtlit} Atlet
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Terkumpul / Target:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {formatRupiah(r.endapanTerkumpul)} / {formatRupiah(r.targetEndapan)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            r.persentase >= 80 ? 'bg-emerald-500' : r.persentase >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, r.persentase)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Capaian Endapan:</span>
                        <span className="font-bold text-slate-300">{r.persentase}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters & Search for Athlete List */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 print:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={endapanSearch}
                  onChange={(e) => setEndapanSearch(e.target.value)}
                  placeholder="Cari atlet, angkatan, atau NIW..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Ranting Filter */}
              <div>
                <select
                  value={endapanRantingFilter}
                  onChange={(e) => setEndapanRantingFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="ALL">Semua Ranting</option>
                  {rekapEndapan?.rekapPerRanting?.map((r) => (
                    <option key={r.unitRanting} value={r.unitRanting}>
                      {r.unitRanting}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={endapanStatusFilter}
                  onChange={(e) => setEndapanStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="ALL">Semua Status Pemenuhan</option>
                  <option value="TERPENUHI">Terpenuhi (Lengkap 100%)</option>
                  <option value="KURANG">Kurang / Belum Lengkap</option>
                  <option value="BELUM_ADA">Belum Ada Setoran (Rp 0)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Rekap Dana Endapan */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl p-6 print:bg-white print:text-black print:border-black print:p-0">
            {/* Letterhead Print Header */}
            <div className="hidden print:block mb-6 border-b-2 border-black pb-4 text-center">
              <h2 className="text-xl font-bold uppercase tracking-wider font-serif">
                PERGURUAN IKS PI KERA SAKTI CABANG KOTA KEDIRI
              </h2>
              <p className="text-sm font-semibold">REKAPITULASI DANA ENDAPAN WAJIB TABUNGAN ATLIT</p>
              <p className="text-xs text-gray-600 mt-1">
                Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} • Ketentuan Endapan: {formatRupiah(rekapEndapan?.saldoEndapanWajibPerAtlit || 50000)} / atlet
              </p>
            </div>

            <div className="flex items-center justify-between mb-4 print:hidden">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Daftar Rincian Dana Endapan per Atlet</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Status pemenuhan saldo endapan wajib minimal {formatRupiah(rekapEndapan?.saldoEndapanWajibPerAtlit || 50000)}
                </p>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                {filteredEndapanList.length} dari {rekapEndapan?.totalAtlitAktif || 0} Atlet
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs print:text-black print:border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 print:bg-gray-100 print:text-black print:border-black">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nama Atlet</th>
                    <th className="py-2.5 px-3">Angkatan & NIW</th>
                    <th className="py-2.5 px-3">Unit Ranting</th>
                    <th className="py-2.5 px-3">Saldo Saat Ini</th>
                    <th className="py-2.5 px-3">Endapan Wajib</th>
                    <th className="py-2.5 px-3">Endapan Terkunci</th>
                    <th className="py-2.5 px-3">Saldo Bebas (Bisa Ditarik)</th>
                    <th className="py-2.5 px-3">Status Pemenuhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 print:text-black print:divide-gray-300">
                  {loadingEndapan ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Memuat data rekap dana endapan...
                      </td>
                    </tr>
                  ) : filteredEndapanList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Tidak ada data atlet yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredEndapanList.map((item, idx) => (
                      <tr key={item.athleteId} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-white print:text-black">
                          {item.namaLengkap}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-400 print:text-black font-medium whitespace-nowrap">
                          {item.nomorInduk || (item.angkatan && item.niw ? `${item.angkatan}/${item.niw}` : '-')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 print:text-black">
                          {item.unitRanting}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-white print:text-black">
                          {formatRupiah(item.saldoSaatIni)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 print:text-black">
                          {formatRupiah(item.saldoEndapanWajib)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400 print:text-black">
                          {formatRupiah(item.saldoEndapanTerkunci)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 print:text-black">
                          {formatRupiah(item.saldoBebasDitarik)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {item.statusPemenuhan === 'TERPENUHI' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 print:border-black print:text-black">
                              <CheckCircle className="w-3 h-3" />
                              <span>TERPENUHI</span>
                            </span>
                          ) : item.statusPemenuhan === 'KURANG' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 print:border-black print:text-black">
                              <AlertTriangle className="w-3 h-3" />
                              <span>KURANG {formatRupiah(item.kekuranganEndapan)}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 print:border-black print:text-black">
                              <XCircle className="w-3 h-3" />
                              <span>BELUM ADA ENDAPAN</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredEndapanList.length > 0 && rekapEndapan && (
                  <tfoot className="border-t-2 border-slate-700 bg-slate-950 font-bold text-xs text-white print:bg-gray-100 print:text-black print:border-black">
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-right uppercase">
                        Total Kas Seluruh Atlet:
                      </td>
                      <td className="py-3 px-3 text-white font-mono print:text-black">
                        {formatRupiah(rekapEndapan.totalSaldoKasAtlit)}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono print:text-black">
                        {formatRupiah(rekapEndapan.totalTargetEndapan)}
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-mono print:text-black">
                        {formatRupiah(rekapEndapan.totalEndapanTerkunci)}
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-mono print:text-black">
                        {formatRupiah(rekapEndapan.totalSaldoBebasDitarik)}
                      </td>
                      <td className="py-3 px-3 text-amber-300 font-mono print:text-black">
                        {rekapEndapan.persentaseKepatuhan}% Kepatuhan
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Printable Signatures */}
            <div className="hidden print:grid grid-cols-2 gap-8 mt-12 pt-6 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Ketua Cabang IKS PI Kota Kediri</p>
                <div className="h-20"></div>
                <p className="font-bold underline">( ............................................ )</p>
                <p className="text-[10px]">Tingkat II / Pengurus Harian</p>
              </div>
              <div>
                <p>Kota Kediri, {new Date().toLocaleDateString('id-ID')}</p>
                <p className="font-bold">Bendahara Tabungan Atlet Cabang</p>
                <div className="h-20"></div>
                <p className="font-bold underline">( ............................................ )</p>
                <p className="text-[10px]">Cabang Kota Kediri</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
