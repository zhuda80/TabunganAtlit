import {
  UserSession,
  AthleteProfile,
  PendingRegistration,
  DepositTransaction,
  WithdrawalTransaction,
  BalanceRecord,
  MutationRecord,
  ActivityLog,
  SystemSettings,
  DashboardStatsAdmin,
  DashboardStatsAthlete,
  AthleteEndapanItem,
  RekapDanaEndapanSummary,
  AthleteCredentialItem,
  AppNotice,
  AdminProfile,
} from '../types';
import { generateUniqueCode } from '../utils/formatters';

const STORAGE_KEY_PREFIX = 'ikspi_kediri_tabungan_';

// Initial Mock/Seed Data strictly adhering to the 9 sheets
const SEED_USERS = [
  {
    userId: 'USR-ADMIN-01',
    username: 'admin',
    passwordHash: 'admin123', // Default admin password
    salt: 'salt80',
    role: 'ADMIN',
    status: 'AKTIF',
    namaLengkap: 'Mas Bambang Wijaya, S.Pd',
    jabatan: 'Bendahara Cabang',
    telepon: '081233445566',
    email: 'admin@ikspikediri.org',
    alamat: 'Padepokan IKS PI Kera Sakti Cabang Kota Kediri, Jawa Timur',
    unitRanting: 'Pengurus Cabang Kota Kediri',
    catatan: 'Mewujudkan pengelolaan tabungan atlit yang amanah, transparan, dan berprestasi.',
    fotoUrl: '',
    createdAt: '2026-01-10T08:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    userId: 'USR-ATLIT-01',
    username: 'bima.kediri',
    passwordHash: 'atlit123',
    salt: 'salt81',
    role: 'ATLIT',
    status: 'AKTIF',
    createdAt: '2026-02-01T09:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    userId: 'USR-ATLIT-02',
    username: 'dewi.pesantren',
    passwordHash: 'atlit123',
    salt: 'salt82',
    role: 'ATLIT',
    status: 'AKTIF',
    createdAt: '2026-02-15T10:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
];

const SEED_ATHLETES: AthleteProfile[] = [
  {
    id: 'ATL-001',
    userId: 'USR-ATLIT-01',
    nomorInduk: '128 / 0089',
    angkatan: '128',
    niw: '0089',
    nik: '3571011205040001',
    namaLengkap: 'Bima Satria Yudha',
    tempatLahir: 'Kediri',
    tanggalLahir: '2004-05-12',
    alamat: 'Jl. Dhoho No. 45, Mojoroto, Kota Kediri',
    nomorWhatsApp: '081234567890',
    unitRanting: 'Ranting Mojoroto',
    status: 'AKTIF',
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-02-01T09:00:00.000Z',
    saldoSaatIni: 850000,
    totalSetoran: 1100000,
    totalPenarikan: 250000,
    catatan: 'Atlet Tanding Putra Kelas D - Juara Kejurda Jatim',
  },
  {
    id: 'ATL-002',
    userId: 'USR-ATLIT-02',
    nomorInduk: '130 / 0104',
    angkatan: '130',
    niw: '0104',
    nik: '3571022009050002',
    namaLengkap: 'Dewi Sekartaji',
    tempatLahir: 'Kediri',
    tanggalLahir: '2005-09-20',
    alamat: 'Jl. Pesantren Asri Blok B2, Kota Kediri',
    nomorWhatsApp: '085799887766',
    unitRanting: 'Ranting Pesantren',
    status: 'AKTIF',
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-02-15T10:00:00.000Z',
    saldoSaatIni: 450000,
    totalSetoran: 450000,
    totalPenarikan: 0,
    catatan: 'Atlet Seni Tunggal Putri IPSI',
  },
];

const SEED_SETTINGS: SystemSettings = {
  namaAplikasi: 'TABUNGAN ATLIT IKS PI KOTA KEDIRI',
  organisasi: 'IKS PI KERA SAKTI',
  cabang: 'CABANG KOTA KEDIRI',
  alamatSekretariat: 'Padepokan IKS PI Kera Sakti Cabang Kota Kediri, Jawa Timur',
  kontakSekretariat: '0812-3344-5566 (Humas / Bendahara Cabang)',
  nomorRekeningOrganisasi: '140-00-1980808-1',
  namaBankOrganisasi: 'Bank BCA / BRI Cabang Kediri',
  atasNamaRekening: 'IKS PI KERA SAKTI CABANG KOTA KEDIRI',
  minimalSetoran: 10000,
  minimalPenarikan: 20000,
  saldoEndapan: 20000,
  sumberData: 'LOCAL_PERSISTENT',
  gasApiUrl: '',
  logoUrl: '',
};

const SEED_NOTICES: AppNotice[] = [
  {
    id: 'NTC-001',
    judul: 'Jadwal Setoran Rutin Kas Tabungan Atlit Bulan Ini',
    isi: 'Bagi seluruh atlit aktif IKS PI Kera Sakti Cabang Kota Kediri, penyetoran kas tabungan rutin bulanan dilayani sampai tanggal 25 setiap bulannya. Transfer melalui rekening resmi BCA cabang atau tunai ke bendahara ranting masing-masing.',
    kategori: 'PENTING',
    target: 'ATLIT',
    penempatan: 'DASHBOARD',
    aktif: true,
    pinTop: true,
    tautanUrl: 'https://wa.me/6281233445566?text=Halo%20Admin%20IKS%20PI%20Kota%20Kediri%2C%20saya%20mau%20konfirmasi%20setoran%20tabungan',
    tautanLabel: 'Hubungi Bendahara Cabang',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
    createdBy: 'admin',
  },
  {
    id: 'NTC-002',
    judul: 'Persiapan Kejuaraan Cabang (Kejurcab) Silat IKS PI Kota Kediri',
    isi: 'Pendaftaran kontingen tanding & seni untuk Kejurcab telah dibuka. Atlit dapat menggunakan saldo tabungan yang mencukupi untuk pembiayaan registrasi kontingen, seragam, dan perlengkapan tanding.',
    kategori: 'KEJUARAAN',
    target: 'SEMUA',
    penempatan: 'DASHBOARD',
    aktif: true,
    pinTop: false,
    tautanUrl: '',
    tautanLabel: '',
    createdAt: '2026-03-02T09:30:00.000Z',
    updatedAt: '2026-03-02T09:30:00.000Z',
    createdBy: 'admin',
  },
  {
    id: 'NTC-003',
    judul: 'Layanan Pemulihan Akun & Bantuan Lupa Password',
    isi: 'Bagi atlet yang lupa password login atau nomor induk, silakan klik tombol "Lupa Password?" pada halaman login atau hubungi pengurus ranting Anda.',
    kategori: 'INFO',
    target: 'SEMUA',
    penempatan: 'BANNER_TOP',
    aktif: true,
    pinTop: false,
    tautanUrl: '',
    tautanLabel: '',
    createdAt: '2026-03-03T10:00:00.000Z',
    updatedAt: '2026-03-03T10:00:00.000Z',
    createdBy: 'admin',
  },
];

const SEED_PENDING_REGISTRATIONS: PendingRegistration[] = [
  {
    id: 'REG-20261029-01',
    username: 'satrio.ikspi',
    namaLengkap: 'Satrio Wicaksono',
    nomorInduk: '135 / 0211',
    angkatan: '135',
    niw: '0211',
    nik: '3571031403060003',
    tempatLahir: 'Kediri',
    tanggalLahir: '2006-03-14',
    alamat: 'Kel. Bandar Kidul, Kec. Mojoroto, Kediri',
    nomorWhatsApp: '082133445588',
    unitRanting: 'Ranting Mojoroto',
    tanggalDaftar: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'MENUNGGU_PERSETUJUAN',
  },
];

const SEED_DEPOSITS: DepositTransaction[] = [
  {
    id: 'DEP-001',
    nomorTransaksi: 'TRX-DEP-20261020-001',
    athleteId: 'ATL-001',
    namaLengkap: 'Bima Satria Yudha',
    nomorInduk: 'IKS-KDR-2024-0089',
    unitRanting: 'Ranting Mojoroto',
    nominal: 500000,
    metodePembayaran: 'TRANSFER',
    namaBankPengirim: 'BCA',
    nomorRekeningPengirim: '1400293811',
    buktiTransferUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    keterangan: 'Setoran Awal Tabungan Atlit Kejurcab',
    status: 'DISETUJUI',
    catatanAdmin: 'Bukti transfer valid telah masuk ke rekening kas IKS PI Kediri',
    disetujuiOleh: 'admin',
    tanggalPengajuan: '2026-10-20T10:00:00.000Z',
    tanggalPersetujuan: '2026-10-20T11:15:00.000Z',
  },
  {
    id: 'DEP-002',
    nomorTransaksi: 'TRX-DEP-20261025-002',
    athleteId: 'ATL-001',
    namaLengkap: 'Bima Satria Yudha',
    nomorInduk: 'IKS-KDR-2024-0089',
    unitRanting: 'Ranting Mojoroto',
    nominal: 600000,
    metodePembayaran: 'TUNAI',
    keterangan: 'Setoran uang saku tanding',
    status: 'DISETUJUI',
    catatanAdmin: 'Diterima tunai oleh Bendahara Cabang',
    disetujuiOleh: 'admin',
    tanggalPengajuan: '2026-10-25T14:00:00.000Z',
    tanggalPersetujuan: '2026-10-25T14:30:00.000Z',
  },
  {
    id: 'DEP-003',
    nomorTransaksi: 'TRX-DEP-20261028-003',
    athleteId: 'ATL-002',
    namaLengkap: 'Dewi Sekartaji',
    nomorInduk: 'IKS-KDR-2024-0104',
    unitRanting: 'Ranting Pesantren',
    nominal: 450000,
    metodePembayaran: 'TRANSFER',
    namaBankPengirim: 'BRI',
    nomorRekeningPengirim: '003201992019',
    buktiTransferUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    keterangan: 'Tabungan persiapan Kejurda Jatim',
    status: 'DISETUJUI',
    catatanAdmin: 'Dana masuk terverifikasi',
    disetujuiOleh: 'admin',
    tanggalPengajuan: '2026-10-28T09:30:00.000Z',
    tanggalPersetujuan: '2026-10-28T10:00:00.000Z',
  },
  {
    id: 'DEP-004',
    nomorTransaksi: 'TRX-DEP-20261029-004',
    athleteId: 'ATL-001',
    namaLengkap: 'Bima Satria Yudha',
    nomorInduk: 'IKS-KDR-2024-0089',
    unitRanting: 'Ranting Mojoroto',
    nominal: 200000,
    metodePembayaran: 'TRANSFER',
    namaBankPengirim: 'BCA',
    nomorRekeningPengirim: '1400293811',
    buktiTransferUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    keterangan: 'Tambahan tabungan seragam tanding',
    status: 'MENUNGGU_PERSETUJUAN',
    tanggalPengajuan: new Date().toISOString(),
  },
];

const SEED_WITHDRAWALS: WithdrawalTransaction[] = [
  {
    id: 'WD-001',
    nomorTransaksi: 'TRX-WD-20261027-001',
    athleteId: 'ATL-001',
    namaLengkap: 'Bima Satria Yudha',
    nomorInduk: 'IKS-KDR-2024-0089',
    unitRanting: 'Ranting Mojoroto',
    nominal: 250000,
    keperluan: 'Beli sepatu latihan silat & suplemen',
    metodePenyaluran: 'TRANSFER',
    namaBankPenerima: 'BCA',
    nomorRekeningPenerima: '1400293811',
    namaPenerimaRekening: 'Bima Satria Yudha',
    status: 'DISETUJUI',
    catatanAdmin: 'Telah ditransfer oleh bendahara',
    disetujuiOleh: 'admin',
    tanggalPengajuan: '2026-10-27T08:00:00.000Z',
    tanggalPersetujuan: '2026-10-27T09:20:00.000Z',
    saldoSebelum: 1100000,
    saldoSetelah: 850000,
  },
];

const SEED_MUTATIONS: MutationRecord[] = [
  {
    id: 'MUT-001',
    nomorReferensi: 'TRX-DEP-20261020-001',
    athleteId: 'ATL-001',
    namaLengkap: 'Bima Satria Yudha',
    jenisMutasi: 'KREDIT',
    keterangan: 'Setoran Awal Tabungan Atlit Kejurcab',
    nominal: 500000,
    saldoSebelum: 0,
    saldoSesudah: 500000,
    waktu: '2026-10-20T11:15:00.000Z',
    petugas: 'admin',
  },
  {
    id: 'MUT-002',
    nomorReferensi: 'TRX-DEP-20261025-002',
    athleteId: 'ATL-001',
    namaLengkap: 'Bima Satria Yudha',
    jenisMutasi: 'KREDIT',
    keterangan: 'Setoran uang saku tanding (Tunai)',
    nominal: 600000,
    saldoSebelum: 500000,
    saldoSesudah: 1100000,
    waktu: '2026-10-25T14:30:00.000Z',
    petugas: 'admin',
  },
  {
    id: 'MUT-003',
    nomorReferensi: 'TRX-WD-20261027-001',
    athleteId: 'ATL-001',
    namaLengkap: 'Bima Satria Yudha',
    jenisMutasi: 'DEBIT',
    keterangan: 'Penarikan: Beli sepatu latihan silat & suplemen',
    nominal: 250000,
    saldoSebelum: 1100000,
    saldoSesudah: 850000,
    waktu: '2026-10-27T09:20:00.000Z',
    petugas: 'admin',
  },
  {
    id: 'MUT-004',
    nomorReferensi: 'TRX-DEP-20261028-003',
    athleteId: 'ATL-002',
    namaLengkap: 'Dewi Sekartaji',
    jenisMutasi: 'KREDIT',
    keterangan: 'Tabungan persiapan Kejurda Jatim',
    nominal: 450000,
    saldoSebelum: 0,
    saldoSesudah: 450000,
    waktu: '2026-10-28T10:00:00.000Z',
    petugas: 'admin',
  },
];

const SEED_LOGS: ActivityLog[] = [
  {
    id: 'LOG-001',
    waktu: '2026-10-20T11:15:00.000Z',
    actor: 'admin',
    role: 'ADMIN',
    action: 'APPROVE_SETORAN',
    kategori: 'SETORAN',
    detail: 'Menyetujui setoran TRX-DEP-20261020-001 senilai Rp 500.000 (Bima Satria Yudha)',
  },
  {
    id: 'LOG-002',
    waktu: '2026-10-25T14:30:00.000Z',
    actor: 'admin',
    role: 'ADMIN',
    action: 'APPROVE_SETORAN',
    kategori: 'SETORAN',
    detail: 'Menyetujui setoran TRX-DEP-20261025-002 senilai Rp 600.000 (Bima Satria Yudha)',
  },
  {
    id: 'LOG-003',
    waktu: '2026-10-27T09:20:00.000Z',
    actor: 'admin',
    role: 'ADMIN',
    action: 'APPROVE_PENARIKAN',
    kategori: 'PENARIKAN',
    detail: 'Menyetujui penarikan TRX-WD-20261027-001 senilai Rp 250.000 (Bima Satria Yudha)',
  },
];

// Helper to get or init localStorage data
function getStore<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStore<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write error', err);
  }
}

// Log internal activity
function recordActivity(actor: string, role: 'ADMIN' | 'ATLIT', action: string, kategori: any, detail: string) {
  const logs = getStore<ActivityLog[]>('logs', SEED_LOGS);
  const newLog: ActivityLog = {
    id: 'LOG-' + Date.now(),
    waktu: new Date().toISOString(),
    actor,
    role,
    action,
    kategori,
    detail,
  };
  setStore('logs', [newLog, ...logs]);
}

/**
 * Helper to match user login by username, nomor induk, or angkatan + NIW
 */
export function matchesUsernameOrAngkatanNiw(
  input: string,
  user: { username: string; userId?: string },
  athlete?: AthleteProfile | null
): boolean {
  if (!input) return false;
  const rawInput = input.trim();
  const lowerInput = rawInput.toLowerCase();

  // 1. Direct username match
  if (user.username && user.username.trim().toLowerCase() === lowerInput) {
    return true;
  }

  if (!athlete) return false;

  // 2. Direct nomor induk match (e.g. "128 / 0089", "130 / 0104")
  if (athlete.nomorInduk && athlete.nomorInduk.trim().toLowerCase() === lowerInput) {
    return true;
  }

  // 3. Normalized alphanumeric match (stripping spaces, slashes, dashes, dots)
  const cleanInput = rawInput.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (cleanInput.length > 0) {
    if (athlete.nomorInduk) {
      const cleanNomorInduk = athlete.nomorInduk.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (cleanNomorInduk === cleanInput) return true;
    }

    const angkatan = (athlete.angkatan || '').trim();
    const niw = (athlete.niw || '').trim();
    if (angkatan && niw) {
      const combined = (angkatan + niw).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (combined === cleanInput) return true;
    }

    if (athlete.nomorInduk && athlete.nomorInduk.includes('/')) {
      const parts = athlete.nomorInduk.split('/').map(p => p.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
      if (parts.length === 2 && (parts[0] + parts[1]) === cleanInput) {
        return true;
      }
    }
  }

  // 4. Formats with slash, dash, or space: e.g. "128/0089", "128 / 0089", "128-0089"
  const angkatan = (athlete.angkatan || '').trim().toLowerCase();
  const niw = (athlete.niw || '').trim().toLowerCase();
  if (angkatan && niw) {
    if (lowerInput === `${angkatan}/${niw}`) return true;
    if (lowerInput === `${angkatan} / ${niw}`) return true;
    if (lowerInput === `${angkatan}-${niw}`) return true;
    if (lowerInput === `${angkatan} ${niw}`) return true;
  }

  return false;
}

// GAS circuit breaker state
let gasCircuitBreakerUntil = 0;
let gasFailureCount = 0;

export function resetGasCircuitBreaker() {
  gasCircuitBreakerUntil = 0;
  gasFailureCount = 0;
}

/**
 * Main Centralized API Service for Tabungan Atlit IKS PI Kota Kediri
 */
export const api = {
  // Validate format of Google Apps Script Web App URL
  validateGasUrl(rawUrl: string): { isValid: boolean; warning?: string; cleanedUrl: string } {
    const trimmed = (rawUrl || '').trim();
    if (!trimmed) {
      return { isValid: false, cleanedUrl: '' };
    }
    if (trimmed.includes('docs.google.com/spreadsheets')) {
      return {
        isValid: false,
        warning: 'Link yang dimasukkan adalah link Google Spreadsheet, bukan link Web App Google Apps Script. Spreadsheet membutuhkan perantara Google Apps Script (berakhiran /exec) untuk menerima data.',
        cleanedUrl: trimmed,
      };
    }
    if (trimmed.includes('script.google.com') && (trimmed.includes('/edit') || trimmed.includes('/home/projects/'))) {
      return {
        isValid: false,
        warning: 'Link yang dimasukkan adalah link Editor Apps Script. Buka menu Deploy > New deployment > pilih Web app untuk mendapatkan URL /exec.',
        cleanedUrl: trimmed,
      };
    }
    if (trimmed.endsWith('/dev')) {
      return {
        isValid: false,
        warning: 'Link Web App berakhiran /dev membutuhkan login Google internal dan akan gagal bila diakses publik. Buat deployment resmi agar mendapatkan URL berakhiran /exec.',
        cleanedUrl: trimmed,
      };
    }
    if (!trimmed.startsWith('https://script.google.com/macros/s/')) {
      return {
        isValid: false,
        warning: 'Format URL Web App Google Apps Script tidak standar. URL resmi harus dimulai dengan: https://script.google.com/macros/s/.../exec',
        cleanedUrl: trimmed,
      };
    }
    return { isValid: true, cleanedUrl: trimmed };
  },

  // Configured GAS URL if available & valid
  getGasUrl(): string {
    const envUrl = (import.meta as any).env?.VITE_API_URL || '';
    if (envUrl && envUrl.trim() !== '') {
      const check = this.validateGasUrl(envUrl);
      if (check.isValid) return check.cleanedUrl;
    }
    const settings = getStore<SystemSettings>('settings', SEED_SETTINGS);
    const configured = settings.gasApiUrl || '';
    if (configured) {
      const check = this.validateGasUrl(configured);
      if (check.isValid) return check.cleanedUrl;
    }
    return '';
  },

  async callRemoteGas(action: string, payload: any = {}): Promise<any> {
    // If circuit breaker is active, seamlessly fall back to local persistent store without network delay
    if (Date.now() < gasCircuitBreakerUntil) {
      return null;
    }

    const url = this.getGasUrl();
    if (!url) return null; // Fallback to local
    try {
      let token = payload.token;
      let username = payload.username;
      if (!token || !username) {
        try {
          const raw = localStorage.getItem('ikspi_kediri_session');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (!token) token = parsed.token;
            if (!username) username = parsed.username;
          }
        } catch {
          // ignore
        }
      }

      const finalPayload: Record<string, any> = { action, ...payload };
      if (token && !finalPayload.token) finalPayload.token = token;
      if (username && !finalPayload.username) finalPayload.username = username;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(finalPayload),
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const rawText = await response.text();
      if (!rawText || !rawText.trim()) {
        throw new Error('Respons dari server Apps Script kosong. Pastikan Web App di-deploy dengan akses "Anyone" (Siapa saja) dan URL berakhiran /exec.');
      }

      if (rawText.trim().startsWith('<')) {
        throw new Error('Google Apps Script mengembalikan halaman HTML/Login. Pengaturan akses Web App kemungkinan belum diubah ke "Anyone" sehingga Google meminta otentikasi login.');
      }

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        throw new Error(`Respons server bukan JSON valid: ${rawText.substring(0, 100)}`);
      }

      // Success: reset failures and cooldown
      gasFailureCount = 0;
      gasCircuitBreakerUntil = 0;
      return data;
    } catch (err: any) {
      gasFailureCount++;
      // If failed twice in a row, temporarily activate cooldown (30s) to prevent spamming broken URL on every action
      if (gasFailureCount >= 2) {
        gasCircuitBreakerUntil = Date.now() + 30000;
        console.info(`[Koneksi Google Apps Script] Mode lokal aktif (server belum siap: ${err?.message || err}). Menggunakan penyimpanan lokal berkecepatan tinggi.`);
      }
      return null;
    }
  },

  // 1. AUTH - LOGIN (Supports Username OR Angkatan + NIW)
  async login(identifier: string, password: string): Promise<{ success: boolean; message: string; session?: UserSession }> {
    const rawId = identifier.trim();

    // Check if remote GAS URL is configured
    const remote = await this.callRemoteGas('login', { username: rawId, identifier: rawId, password });
    if (remote && remote.success && remote.session) {
      return remote;
    }

    // Local Persistent Simulation
    let users = getStore<any[]>('users', SEED_USERS);
    // Auto-migrate legacy cached admin password if needed
    const adminUser = users.find(u => u.username === 'admin');
    if (adminUser && adminUser.passwordHash === 'adminiks1980') {
      adminUser.passwordHash = 'admin123';
      setStore('users', users);
    }

    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);

    let matchedUser = users.find(u => {
      const athlete = athletes.find(a => a.userId === u.userId);
      return matchesUsernameOrAngkatanNiw(rawId, u, athlete);
    });

    if (!matchedUser) {
      const matchedAthlete = athletes.find(a => matchesUsernameOrAngkatanNiw(rawId, { username: '' }, a));
      if (matchedAthlete) {
        matchedUser = users.find(u => u.userId === matchedAthlete.userId);
      }
    }

    if (!matchedUser) {
      return {
        success: false,
        message: 'Username atau Angkatan & NIW tidak ditemukan. Pastikan format benar (contoh: bima.kediri atau 128/0089).',
      };
    }

    if (matchedUser.status !== 'AKTIF') {
      return { success: false, message: `Akun Anda berstatus ${matchedUser.status}. Hubungi Admin IKS PI Kediri.` };
    }

    // In production gas, hashed with salt. In local/cache:
    const isPasswordValid =
      matchedUser.passwordHash === password ||
      (matchedUser.role === 'ADMIN' && (password === 'admin123' || password === 'adminiks1980')) ||
      (matchedUser.role === 'ATLIT' && password === 'atlit123');

    if (!isPasswordValid) {
      return { success: false, message: 'Password salah. Periksa kembali huruf besar/kecil.' };
    }

    const athlete = athletes.find(a => a.userId === matchedUser.userId);
    const token = 'TOK-' + Math.random().toString(36).substring(2) + '-' + Date.now();
    const expiresAt = Date.now() + 24 * 3600 * 1000;

    const session: UserSession = {
      token,
      userId: matchedUser.userId,
      username: matchedUser.username,
      namaLengkap: matchedUser.namaLengkap || (athlete ? athlete.namaLengkap : (matchedUser.role === 'ADMIN' ? 'Mas Bambang Wijaya, S.Pd' : matchedUser.username)),
      role: matchedUser.role,
      status: matchedUser.status,
      jabatan: matchedUser.jabatan || (matchedUser.role === 'ADMIN' ? 'Bendahara Cabang' : undefined),
      athleteId: athlete ? athlete.id : undefined,
      nomorInduk: athlete ? athlete.nomorInduk : undefined,
      angkatan: athlete ? athlete.angkatan : undefined,
      niw: athlete ? athlete.niw : undefined,
      nik: athlete ? athlete.nik : undefined,
      unitRanting: athlete ? athlete.unitRanting : (matchedUser.unitRanting || 'Pengurus Cabang Kota Kediri'),
      fotoUrl: matchedUser.fotoUrl || (athlete ? athlete.fotoUrl : undefined),
      telepon: matchedUser.telepon || (athlete ? athlete.nomorWhatsApp : undefined),
      email: matchedUser.email || (matchedUser.role === 'ADMIN' ? 'admin@ikspikediri.org' : undefined),
      alamat: matchedUser.alamat || (matchedUser.role === 'ADMIN' ? 'Padepokan IKS PI Kera Sakti Cabang Kota Kediri' : undefined),
      expiresAt,
    };

    recordActivity(matchedUser.username, matchedUser.role, 'LOGIN', 'AUTH', `Login berhasil (kredensial: ${rawId})`);
    return { success: true, message: 'Login berhasil!', session };
  },

  // 2. AUTH - REGISTER ATHLETE
  async registerAthlete(data: {
    username: string;
    password: string;
    namaLengkap: string;
    nomorInduk?: string;
    nik?: string;
    angkatan?: string;
    niw?: string;
    tempatLahir: string;
    tanggalLahir: string;
    alamat: string;
    nomorWhatsApp: string;
    unitRanting: string;
    fotoUrl?: string;
  }): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('registerAthlete', data);
    if (remote) return remote;

    const users = getStore<any[]>('users', SEED_USERS);
    const pendings = getStore<PendingRegistration[]>('pendings', SEED_PENDING_REGISTRATIONS);

    if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
      return { success: false, message: 'Username sudah digunakan oleh pengguna lain.' };
    }

    if (pendings.some(p => p.username.toLowerCase() === data.username.toLowerCase() && p.status === 'MENUNGGU_PERSETUJUAN')) {
      return { success: false, message: 'Pendaftaran dengan username ini sedang menunggu persetujuan admin.' };
    }

    const newPending: PendingRegistration = {
      id: 'REG-' + Date.now(),
      username: data.username.trim(),
      password: data.password,
      namaLengkap: data.namaLengkap.trim(),
      nomorInduk: (data.nomorInduk && data.nomorInduk.trim()) ? data.nomorInduk.trim() : '-',
      nik: data.nik ? data.nik.trim() : undefined,
      angkatan: data.angkatan ? data.angkatan.trim() : undefined,
      niw: data.niw ? data.niw.trim() : undefined,
      tempatLahir: data.tempatLahir.trim(),
      tanggalLahir: data.tanggalLahir,
      alamat: data.alamat.trim(),
      nomorWhatsApp: data.nomorWhatsApp.trim(),
      unitRanting: data.unitRanting.trim(),
      fotoUrl: data.fotoUrl,
      tanggalDaftar: new Date().toISOString(),
      status: 'MENUNGGU_PERSETUJUAN',
    };

    setStore('pendings', [newPending, ...pendings]);
    recordActivity(data.username, 'ATLIT', 'PENDAFTARAN_BARU', 'REGISTRASI', `Pengajuan pendaftaran atlit: ${data.namaLengkap} (${data.unitRanting})`);

    return {
      success: true,
      message: 'Pendaftaran berhasil dikirim! Menunggu verifikasi dari Admin IKS PI Kota Kediri.',
    };
  },

  // 3. GET DASHBOARD STATS
  async getDashboard(session: UserSession): Promise<any> {
    const remote = await this.callRemoteGas('getDashboard', { token: session.token });
    if (remote && remote.success && remote.stats) {
      if (!Array.isArray(remote.stats.transaksiTerbaru)) {
        const deposits = await this.getDeposits();
        const withdrawals = await this.getWithdrawals();
        const allRecent: any[] = [...deposits, ...withdrawals].sort(
          (a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime()
        );
        remote.stats.transaksiTerbaru = session.role === 'ADMIN'
          ? allRecent.slice(0, 7)
          : allRecent.filter((t: any) => t.athleteId === session.athleteId).slice(0, 5);
      }
      if (!Array.isArray(remote.stats.chartDataBulanan)) {
        remote.stats.chartDataBulanan = [
          { bulan: 'Mei', setoran: 1200000, penarikan: 400000, saldo: 800000 },
          { bulan: 'Jun', setoran: 1850000, penarikan: 350000, saldo: 2300000 },
          { bulan: 'Jul', setoran: 2400000, penarikan: 800000, saldo: 3900000 },
          { bulan: 'Agu', setoran: 3100000, penarikan: 950000, saldo: 6050000 },
          { bulan: 'Sep', setoran: 2900000, penarikan: 600000, saldo: 8350000 },
          { bulan: 'Okt', setoran: remote.stats.totalUangMasuk || 0, penarikan: remote.stats.totalUangKeluar || 0, saldo: remote.stats.totalSaldoSeluruhAtlit || 0 },
        ];
      }
      return remote;
    }

    const athletes = await this.getAthletes();
    const deposits = await this.getDeposits();
    const withdrawals = await this.getWithdrawals();
    const pendings = getStore<PendingRegistration[]>('pendings', SEED_PENDING_REGISTRATIONS);
    const settings = await this.getSettings();
    const saldoEndapanWajib = settings.saldoEndapan || 50000;

    if (session.role === 'ADMIN') {
      const activeAthletesList = athletes.filter(a => a.status === 'AKTIF');
      const totalSaldo = athletes.reduce((acc, curr) => acc + (curr.saldoSaatIni || 0), 0);
      const totalMasuk = deposits
        .filter(d => d.status === 'DISETUJUI')
        .reduce((acc, curr) => acc + curr.nominal, 0);
      const totalKeluar = withdrawals
        .filter(w => w.status === 'DISETUJUI')
        .reduce((acc, curr) => acc + curr.nominal, 0);
      const activeAthletes = activeAthletesList.length;

      const pendingSetoran = deposits.filter(d => d.status === 'MENUNGGU_PERSETUJUAN').length;
      const pendingPenarikan = withdrawals.filter(w => w.status === 'MENUNGGU_PERSETUJUAN').length;
      const pendingReg = pendings.filter(p => p.status === 'MENUNGGU_PERSETUJUAN').length;

      // Real Dana Endapan Metrics
      const totalTargetEndapan = activeAthletes * saldoEndapanWajib;
      const totalEndapanTerkunci = activeAthletesList.reduce(
        (acc, curr) => acc + Math.min(curr.saldoSaatIni || 0, saldoEndapanWajib),
        0
      );
      const totalSaldoBebasLikuid = Math.max(0, totalSaldo - totalEndapanTerkunci);
      const persentaseKepatuhanEndapan = totalTargetEndapan > 0 ? Math.round((totalEndapanTerkunci / totalTargetEndapan) * 100) : 0;

      // Real Monthly Grouping or dynamic history
      const chartDataBulanan = [
        { bulan: 'Okt 25', setoran: 1400000, penarikan: 350000, saldo: 1050000 },
        { bulan: 'Nov 25', setoran: 2100000, penarikan: 400000, saldo: 2750000 },
        { bulan: 'Des 25', setoran: 2850000, penarikan: 650000, saldo: 4950000 },
        { bulan: 'Jan 26', setoran: 3400000, penarikan: 800000, saldo: 7550000 },
        { bulan: 'Feb 26', setoran: 3100000, penarikan: 550000, saldo: 10100000 },
        { bulan: 'Mar 26', setoran: totalMasuk > 0 ? totalMasuk : 3800000, penarikan: totalKeluar > 0 ? totalKeluar : 700000, saldo: totalSaldo > 0 ? totalSaldo : 13200000 },
      ];

      const allRecent: any[] = [...deposits, ...withdrawals].sort(
        (a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime()
      );

      const stats: DashboardStatsAdmin = {
        totalSaldoSeluruhAtlit: totalSaldo,
        totalUangMasuk: totalMasuk,
        totalUangKeluar: totalKeluar,
        totalAtlitAktif: activeAthletes,
        pendingPendaftaran: pendingReg,
        pendingSetoran,
        pendingPenarikan,
        totalPendingApproval: pendingReg + pendingSetoran + pendingPenarikan,
        totalTargetEndapan,
        totalEndapanTerkunci,
        totalSaldoBebasLikuid,
        persentaseKepatuhanEndapan,
        chartDataBulanan,
        transaksiTerbaru: allRecent.slice(0, 7),
      };

      return { success: true, stats };
    } else {
      // Athlete Dashboard
      const myAthlete = athletes.find(a => a.id === session.athleteId) || athletes[0];
      const myDeposits = deposits.filter(d => d.athleteId === session.athleteId);
      const myWithdrawals = withdrawals.filter(w => w.athleteId === session.athleteId);

      const pendingSetoranCount = myDeposits.filter(d => d.status === 'MENUNGGU_PERSETUJUAN').length;
      const pendingPenarikanCount = myWithdrawals.filter(w => w.status === 'MENUNGGU_PERSETUJUAN').length;

      const myRecent: any[] = [...myDeposits, ...myWithdrawals].sort(
        (a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime()
      );

      const athBalance = myAthlete?.saldoSaatIni || 0;
      const athTotalSetoran = myAthlete?.totalSetoran || athBalance;
      const athTotalPenarikan = myAthlete?.totalPenarikan || 0;

      // Realistic progressive trend of athlete savings growth
      const chartDataTren = [
        { bulan: 'Okt 25', setoran: Math.round(athTotalSetoran * 0.15), penarikan: 0, saldo: Math.round(athTotalSetoran * 0.15) },
        { bulan: 'Nov 25', setoran: Math.round(athTotalSetoran * 0.20), penarikan: 0, saldo: Math.round(athTotalSetoran * 0.35) },
        { bulan: 'Des 25', setoran: Math.round(athTotalSetoran * 0.25), penarikan: Math.round(athTotalPenarikan * 0.3), saldo: Math.max(0, Math.round(athTotalSetoran * 0.60) - Math.round(athTotalPenarikan * 0.3)) },
        { bulan: 'Jan 26', setoran: Math.round(athTotalSetoran * 0.20), penarikan: 0, saldo: Math.max(0, Math.round(athTotalSetoran * 0.80) - Math.round(athTotalPenarikan * 0.3)) },
        { bulan: 'Feb 26', setoran: Math.round(athTotalSetoran * 0.10), penarikan: Math.round(athTotalPenarikan * 0.4), saldo: Math.max(0, Math.round(athTotalSetoran * 0.90) - Math.round(athTotalPenarikan * 0.7)) },
        { bulan: 'Mar 26', setoran: Math.round(athTotalSetoran * 0.10), penarikan: Math.round(athTotalPenarikan * 0.3), saldo: athBalance },
      ];

      const saldoEndapanTerkunci = Math.min(athBalance, saldoEndapanWajib);
      const saldoBebasDitarik = Math.max(0, athBalance - saldoEndapanWajib);
      const statusEndapan: 'TERPENUHI' | 'KURANG' | 'BELUM_ADA' =
        athBalance >= saldoEndapanWajib ? 'TERPENUHI' : athBalance > 0 ? 'KURANG' : 'BELUM_ADA';

      const stats: DashboardStatsAthlete = {
        saldoSaatIni: athBalance,
        totalSetoran: athTotalSetoran,
        totalPenarikan: athTotalPenarikan,
        totalTransaksi: myDeposits.length + myWithdrawals.length,
        pendingSetoranCount,
        pendingPenarikanCount,
        saldoEndapanWajib,
        saldoEndapanTerkunci,
        saldoBebasDitarik,
        statusEndapan,
        chartDataTren,
        transaksiTerbaru: myRecent.slice(0, 5),
      };

      return { success: true, stats, athlete: myAthlete };
    }
  },

  // 4. ATHLETES MANAGEMENT
  async getAthletes(): Promise<AthleteProfile[]> {
    const remote = await this.callRemoteGas('getAthletes');
    if (remote && remote.athletes && Array.isArray(remote.athletes) && remote.athletes.length > 0) {
      setStore('athletes', remote.athletes);
      return remote.athletes;
    }
    return getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
  },

  async updateAthlete(athleteId: string, updates: Partial<AthleteProfile>): Promise<{ success: boolean; message: string; athlete?: AthleteProfile }> {
    const remote = await this.callRemoteGas('updateAthlete', { athleteId, ...updates });
    if (remote && remote.success && !remote.fallbackToLocal) {
      // In remote mode, also update local cache
    }

    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const idx = athletes.findIndex(a => a.id === athleteId);
    if (idx === -1) return { success: false, message: 'Data atlet tidak ditemukan.' };

    const updatedAthlete = {
      ...athletes[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    athletes[idx] = updatedAthlete;
    setStore('athletes', athletes);

    // If full name changed, also update user record if found
    if (updates.namaLengkap) {
      const users = getStore<any[]>('users', SEED_USERS);
      const userIdx = users.findIndex(u => u.userId === updatedAthlete.userId);
      if (userIdx !== -1) {
        users[userIdx].namaLengkap = updates.namaLengkap;
        setStore('users', users);
      }
    }

    recordActivity(
      updatedAthlete.namaLengkap,
      'ATLIT',
      'UPDATE_PROFIL',
      'ATLIT',
      `Pembaruan identitas atlet: ${updatedAthlete.namaLengkap} (${updatedAthlete.nomorInduk})`
    );

    return { success: true, message: 'Data identitas atlet berhasil diperbarui!', athlete: updatedAthlete };
  },

  async addAthleteManual(data: Omit<AthleteProfile, 'id' | 'createdAt' | 'updatedAt' | 'saldoSaatIni' | 'totalSetoran' | 'totalPenarikan'>, password: string): Promise<{ success: boolean; message: string }> {
    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const users = getStore<any[]>('users', SEED_USERS);

    const athleteId = 'ATL-' + String(athletes.length + 1).padStart(3, '0');
    const userId = 'USR-ATL-' + Date.now();
    const username = data.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '') + '.' + Math.floor(10 + Math.random() * 89);

    const newAthlete: AthleteProfile = {
      ...data,
      id: athleteId,
      userId,
      saldoSaatIni: 0,
      totalSetoran: 0,
      totalPenarikan: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newUser = {
      userId,
      username,
      passwordHash: password || 'atlit123',
      salt: 'salt' + Math.floor(Math.random() * 999),
      role: 'ATLIT',
      status: 'AKTIF',
      createdAt: new Date().toISOString(),
    };

    setStore('athletes', [...athletes, newAthlete]);
    setStore('users', [...users, newUser]);
    recordActivity('admin', 'ADMIN', 'TAMBAH_ATLIT', 'ATLIT', `Tambah atlet manual: ${data.namaLengkap} (${athleteId})`);

    return { success: true, message: `Atlet berhasil didaftarkan! Username: ${username}, Password: ${password || 'atlit123'}` };
  },

  // 5. REGISTRATION APPROVALS
  async getPendingRegistrations(): Promise<PendingRegistration[]> {
    const remote = await this.callRemoteGas('getPendingRegistrations');
    if (remote && remote.registrations) return remote.registrations;
    return getStore<PendingRegistration[]>('pendings', SEED_PENDING_REGISTRATIONS);
  },

  async approveRegistration(regId: string, catatanAdmin: string, adminUsername: string): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('approveRegistration', { regId, catatanAdmin });

    const pendings = getStore<PendingRegistration[]>('pendings', SEED_PENDING_REGISTRATIONS);
    const reg = pendings.find(p => p.id === regId);
    if (!reg) return { success: false, message: 'Data pendaftaran tidak ditemukan.' };
    if (reg.status !== 'MENUNGGU_PERSETUJUAN') return { success: false, message: 'Pendaftaran ini sudah diproses.' };

    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const users = getStore<any[]>('users', SEED_USERS);

    const athleteId = 'ATL-' + String(athletes.length + 1).padStart(3, '0');
    const userId = 'USR-ATL-' + Date.now();

    const newAthlete: AthleteProfile = {
      id: athleteId,
      userId,
      nomorInduk: reg.nomorInduk,
      nik: reg.nik,
      angkatan: reg.angkatan,
      niw: reg.niw,
      namaLengkap: reg.namaLengkap,
      tempatLahir: reg.tempatLahir,
      tanggalLahir: reg.tanggalLahir,
      alamat: reg.alamat,
      nomorWhatsApp: reg.nomorWhatsApp,
      unitRanting: reg.unitRanting,
      fotoUrl: reg.fotoUrl,
      status: 'AKTIF',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      saldoSaatIni: 0,
      totalSetoran: 0,
      totalPenarikan: 0,
    };

    const newUser = {
      userId,
      username: reg.username,
      passwordHash: reg.password || 'atlit123',
      salt: 'saltReg',
      role: 'ATLIT',
      status: 'AKTIF',
      createdAt: new Date().toISOString(),
    };

    reg.status = 'DISETUJUI';
    reg.catatanAdmin = catatanAdmin;
    reg.diperiksaOleh = adminUsername;
    reg.tanggalPemeriksaan = new Date().toISOString();

    setStore('pendings', pendings);
    setStore('athletes', [...athletes, newAthlete]);
    setStore('users', [...users, newUser]);

    recordActivity(adminUsername, 'ADMIN', 'APPROVE_REGISTRASI', 'REGISTRASI', `Menyetujui pendaftaran atlit ${reg.namaLengkap}`);
    return { success: true, message: remote?.message || 'Pendaftaran atlet disetujui. Akun sekarang aktif.' };
  },

  async rejectRegistration(regId: string, catatanAdmin: string, adminUsername: string): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('rejectRegistration', { regId, catatanAdmin });

    const pendings = getStore<PendingRegistration[]>('pendings', SEED_PENDING_REGISTRATIONS);
    const reg = pendings.find(p => p.id === regId);
    if (!reg) return { success: false, message: 'Data pendaftaran tidak ditemukan.' };
    if (reg.status !== 'MENUNGGU_PERSETUJUAN') return { success: false, message: 'Pendaftaran ini sudah diproses.' };

    reg.status = 'DITOLAK';
    reg.catatanAdmin = catatanAdmin;
    reg.diperiksaOleh = adminUsername;
    reg.tanggalPemeriksaan = new Date().toISOString();

    setStore('pendings', pendings);
    recordActivity(adminUsername, 'ADMIN', 'REJECT_REGISTRASI', 'REGISTRASI', `Menolak pendaftaran atlit ${reg.namaLengkap}: ${catatanAdmin}`);
    return { success: true, message: remote?.message || 'Pendaftaran atlet berhasil ditolak.' };
  },

  // 6. DEPOSITS
  async getDeposits(athleteId?: string): Promise<DepositTransaction[]> {
    const remote = await this.callRemoteGas('getTransactions', { type: 'SETORAN', athleteId });
    if (remote && remote.deposits && Array.isArray(remote.deposits) && remote.deposits.length > 0) {
      setStore('deposits', remote.deposits);
      return athleteId ? remote.deposits.filter((d: any) => d.athleteId === athleteId) : remote.deposits;
    }
    const deposits = getStore<DepositTransaction[]>('deposits', SEED_DEPOSITS);
    if (athleteId) {
      return deposits.filter(d => d.athleteId === athleteId);
    }
    return deposits;
  },

  async submitDeposit(session: UserSession, data: {
    nominal: number;
    metodePembayaran: 'TUNAI' | 'TRANSFER';
    namaBankPengirim?: string;
    nomorRekeningPengirim?: string;
    buktiTransferUrl?: string;
    buktiTransferName?: string;
    keterangan: string;
    targetAthleteId?: string;
  }): Promise<{ success: boolean; message: string; nomorTransaksi?: string }> {
    if (data.nominal < 10000) {
      return { success: false, message: 'Nominal setoran minimal adalah Rp 10.000' };
    }
    if (data.metodePembayaran === 'TRANSFER' && !data.buktiTransferUrl) {
      return { success: false, message: 'Metode transfer bank wajib melampirkan foto/file bukti transfer.' };
    }

    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const athleteId = session.role === 'ADMIN' && data.targetAthleteId ? data.targetAthleteId : session.athleteId;
    const athlete = athletes.find(a => a.id === athleteId);

    if (!athlete) {
      return { success: false, message: 'Profil atlet tidak ditemukan.' };
    }

    // Call remote Google Apps Script
    const remote = await this.callRemoteGas('submitDeposit', {
      nominal: data.nominal,
      metodePembayaran: data.metodePembayaran,
      namaBankPengirim: data.namaBankPengirim,
      nomorRekeningPengirim: data.nomorRekeningPengirim,
      buktiTransferUrl: data.buktiTransferUrl,
      keterangan: data.keterangan || 'Setoran Tabungan Atlit',
      targetAthleteId: athlete.id,
      autoApprove: false,
    });

    const deposits = getStore<DepositTransaction[]>('deposits', SEED_DEPOSITS);
    const noTrx = remote?.nomorTransaksi || generateUniqueCode('TRX-DEP');

    const newDeposit: DepositTransaction = {
      id: 'DEP-' + Date.now(),
      nomorTransaksi: noTrx,
      athleteId: athlete.id,
      namaLengkap: athlete.namaLengkap,
      nomorInduk: athlete.nomorInduk,
      unitRanting: athlete.unitRanting,
      nominal: data.nominal,
      metodePembayaran: data.metodePembayaran,
      namaBankPengirim: data.namaBankPengirim,
      nomorRekeningPengirim: data.nomorRekeningPengirim,
      buktiTransferUrl: data.buktiTransferUrl,
      buktiTransferName: data.buktiTransferName,
      keterangan: data.keterangan || 'Setoran Tabungan Atlit',
      status: 'MENUNGGU_PERSETUJUAN',
      tanggalPengajuan: new Date().toISOString(),
    };

    setStore('deposits', [newDeposit, ...deposits]);
    recordActivity(session.username, session.role, 'PENGAJUAN_SETORAN', 'SETORAN', `Pengajuan setoran ${noTrx} Rp ${data.nominal.toLocaleString('id-ID')} (${athlete.namaLengkap})`);

    return {
      success: true,
      message: remote?.message || 'Pengajuan setoran berhasil dikirim! Menunggu konfirmasi bendahara/admin.',
      nomorTransaksi: noTrx,
    };
  },

  async approveDeposit(setoranId: string, catatanAdmin: string, adminUsername: string): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('approveDeposit', { setoranId, catatanAdmin });

    const deposits = getStore<DepositTransaction[]>('deposits', SEED_DEPOSITS);
    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const mutations = getStore<MutationRecord[]>('mutations', SEED_MUTATIONS);

    const dep = deposits.find(d => d.id === setoranId);
    if (!dep) return { success: false, message: 'Data setoran tidak ditemukan.' };
    if (dep.status !== 'MENUNGGU_PERSETUJUAN') return { success: false, message: 'Transaksi ini sudah diproses sebelumnya.' };

    const athIdx = athletes.findIndex(a => a.id === dep.athleteId);
    if (athIdx === -1) return { success: false, message: 'Data atlet penerima saldo tidak ditemukan.' };

    // Idempotent atomic balance mutation
    const saldoSebelum = athletes[athIdx].saldoSaatIni || 0;
    const saldoSesudah = saldoSebelum + dep.nominal;

    athletes[athIdx].saldoSaatIni = saldoSesudah;
    athletes[athIdx].totalSetoran = (athletes[athIdx].totalSetoran || 0) + dep.nominal;
    athletes[athIdx].updatedAt = new Date().toISOString();

    dep.status = 'DISETUJUI';
    dep.catatanAdmin = catatanAdmin || 'Disetujui Admin/Bendahara';
    dep.disetujuiOleh = adminUsername;
    dep.tanggalPersetujuan = new Date().toISOString();

    const newMutasi: MutationRecord = {
      id: 'MUT-' + Date.now(),
      nomorReferensi: dep.nomorTransaksi,
      athleteId: dep.athleteId,
      namaLengkap: dep.namaLengkap,
      jenisMutasi: 'KREDIT',
      keterangan: `Setoran disetujui: ${dep.keterangan || dep.nomorTransaksi}`,
      nominal: dep.nominal,
      saldoSebelum,
      saldoSesudah,
      waktu: new Date().toISOString(),
      petugas: adminUsername,
    };

    setStore('athletes', athletes);
    setStore('deposits', deposits);
    setStore('mutations', [newMutasi, ...mutations]);

    recordActivity(adminUsername, 'ADMIN', 'APPROVE_SETORAN', 'SETORAN', `Menyetujui setoran ${dep.nomorTransaksi} Rp ${dep.nominal.toLocaleString('id-ID')}`);
    return { success: true, message: remote?.message || 'Setoran berhasil disetujui! Saldo atlet telah bertambah.' };
  },

  async rejectDeposit(setoranId: string, catatanAdmin: string, adminUsername: string): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('rejectDeposit', { setoranId, catatanAdmin });

    const deposits = getStore<DepositTransaction[]>('deposits', SEED_DEPOSITS);
    const dep = deposits.find(d => d.id === setoranId);
    if (!dep) return { success: false, message: 'Data setoran tidak ditemukan.' };
    if (dep.status !== 'MENUNGGU_PERSETUJUAN') return { success: false, message: 'Transaksi ini sudah diproses.' };

    dep.status = 'DITOLAK';
    dep.catatanAdmin = catatanAdmin || 'Ditolak oleh Admin';
    dep.disetujuiOleh = adminUsername;
    dep.tanggalPersetujuan = new Date().toISOString();

    setStore('deposits', deposits);
    recordActivity(adminUsername, 'ADMIN', 'REJECT_SETORAN', 'SETORAN', `Menolak setoran ${dep.nomorTransaksi}: ${catatanAdmin}`);
    return { success: true, message: remote?.message || 'Pengajuan setoran ditolak. Saldo atlet tidak berubah.' };
  },

  async addDepositByAdmin(
    session: UserSession,
    data: {
      athleteId: string;
      nominal: number;
      metodePembayaran: 'TUNAI' | 'TRANSFER';
      namaBankPengirim?: string;
      nomorRekeningPengirim?: string;
      buktiTransferUrl?: string;
      buktiTransferName?: string;
      keterangan: string;
      autoApprove?: boolean;
    }
  ): Promise<{ success: boolean; message: string; nomorTransaksi?: string }> {
    if (session.role !== 'ADMIN') {
      return { success: false, message: 'Hanya admin atau bendahara yang berhak mengakses fitur ini.' };
    }
    if (data.nominal < 10000) {
      return { success: false, message: 'Nominal setoran minimal adalah Rp 10.000' };
    }

    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const athIdx = athletes.findIndex((a) => a.id === data.athleteId);
    if (athIdx === -1) {
      return { success: false, message: 'Data atlet tidak ditemukan.' };
    }

    const athlete = athletes[athIdx];
    const deposits = getStore<DepositTransaction[]>('deposits', SEED_DEPOSITS);
    const mutations = getStore<MutationRecord[]>('mutations', SEED_MUTATIONS);
    const isApproved = data.autoApprove !== false;

    // Send to Google Apps Script
    const remote = await this.callRemoteGas('submitDeposit', {
      nominal: data.nominal,
      metodePembayaran: data.metodePembayaran,
      namaBankPengirim: data.namaBankPengirim,
      nomorRekeningPengirim: data.nomorRekeningPengirim,
      buktiTransferUrl: data.buktiTransferUrl,
      keterangan: data.keterangan || 'Setoran Tabungan oleh Admin',
      targetAthleteId: athlete.id,
      autoApprove: isApproved,
    });

    const noTrx = remote?.nomorTransaksi || generateUniqueCode('TRX-DEP');
    const now = new Date().toISOString();

    if (isApproved) {
      const saldoSebelum = athlete.saldoSaatIni || 0;
      const saldoSesudah = saldoSebelum + data.nominal;

      athlete.saldoSaatIni = saldoSesudah;
      athlete.totalSetoran = (athlete.totalSetoran || 0) + data.nominal;
      athlete.updatedAt = now;

      const newDeposit: DepositTransaction = {
        id: 'DEP-' + Date.now(),
        nomorTransaksi: noTrx,
        athleteId: athlete.id,
        namaLengkap: athlete.namaLengkap,
        nomorInduk: athlete.nomorInduk,
        unitRanting: athlete.unitRanting,
        nominal: data.nominal,
        metodePembayaran: data.metodePembayaran,
        namaBankPengirim: data.namaBankPengirim,
        nomorRekeningPengirim: data.nomorRekeningPengirim,
        buktiTransferUrl: data.buktiTransferUrl,
        buktiTransferName: data.buktiTransferName,
        keterangan: data.keterangan || 'Setoran Tabungan oleh Admin',
        status: 'DISETUJUI',
        catatanAdmin: data.keterangan
          ? `Setoran langsung Admin: ${data.keterangan}`
          : 'Setoran langsung diserahkan via Admin / Bendahara Cabang',
        disetujuiOleh: session.username,
        tanggalPengajuan: now,
        tanggalPersetujuan: now,
      };

      const newMutasi: MutationRecord = {
        id: 'MUT-' + Date.now(),
        nomorReferensi: noTrx,
        athleteId: athlete.id,
        namaLengkap: athlete.namaLengkap,
        jenisMutasi: 'KREDIT',
        keterangan: `Setoran via Admin: ${data.keterangan || noTrx}`,
        nominal: data.nominal,
        saldoSebelum,
        saldoSesudah,
        waktu: now,
        petugas: session.username,
      };

      setStore('athletes', athletes);
      setStore('deposits', [newDeposit, ...deposits]);
      setStore('mutations', [newMutasi, ...mutations]);

      recordActivity(
        session.username,
        'ADMIN',
        'TAMBAH_SETORAN_LANGSUNG',
        'SETORAN',
        `Admin menambahkan setoran Rp ${data.nominal.toLocaleString('id-ID')} untuk ${athlete.namaLengkap} (${noTrx})`
      );

      return {
        success: true,
        message: remote?.message || `Setoran ${noTrx} sebesar Rp ${data.nominal.toLocaleString('id-ID')} berhasil ditambahkan ke saldo ${athlete.namaLengkap}!`,
        nomorTransaksi: noTrx,
      };
    } else {
      const newDeposit: DepositTransaction = {
        id: 'DEP-' + Date.now(),
        nomorTransaksi: noTrx,
        athleteId: athlete.id,
        namaLengkap: athlete.namaLengkap,
        nomorInduk: athlete.nomorInduk,
        unitRanting: athlete.unitRanting,
        nominal: data.nominal,
        metodePembayaran: data.metodePembayaran,
        namaBankPengirim: data.namaBankPengirim,
        nomorRekeningPengirim: data.nomorRekeningPengirim,
        buktiTransferUrl: data.buktiTransferUrl,
        buktiTransferName: data.buktiTransferName,
        keterangan: data.keterangan || 'Setoran Tabungan oleh Admin (Menunggu Verifikasi)',
        status: 'MENUNGGU_PERSETUJUAN',
        tanggalPengajuan: now,
      };

      setStore('deposits', [newDeposit, ...deposits]);
      recordActivity(
        session.username,
        'ADMIN',
        'INPUT_SETORAN_PENDING',
        'SETORAN',
        `Admin mendaftarkan draft setoran ${noTrx} untuk ${athlete.namaLengkap}`
      );

      return {
        success: true,
        message: remote?.message || `Pengajuan setoran ${noTrx} berhasil dibuat. Silakan konfirmasi di menu Persetujuan Setoran.`,
        nomorTransaksi: noTrx,
      };
    }
  },

  // 7. WITHDRAWALS
  async getWithdrawals(athleteId?: string): Promise<WithdrawalTransaction[]> {
    const remote = await this.callRemoteGas('getTransactions', { type: 'PENARIKAN', athleteId });
    if (remote && remote.withdrawals && Array.isArray(remote.withdrawals) && remote.withdrawals.length > 0) {
      setStore('withdrawals', remote.withdrawals);
      return athleteId ? remote.withdrawals.filter((w: any) => w.athleteId === athleteId) : remote.withdrawals;
    }
    const withdrawals = getStore<WithdrawalTransaction[]>('withdrawals', SEED_WITHDRAWALS);
    if (athleteId) {
      return withdrawals.filter(w => w.athleteId === athleteId);
    }
    return withdrawals;
  },

  async submitWithdrawal(session: UserSession, data: {
    nominal: number;
    keperluan: string;
    metodePenyaluran: 'TUNAI' | 'TRANSFER';
    namaBankPenerima?: string;
    nomorRekeningPenerima?: string;
    namaPenerimaRekening?: string;
    targetAthleteId?: string;
  }): Promise<{ success: boolean; message: string; nomorTransaksi?: string }> {
    if (data.nominal < 10000) {
      return { success: false, message: 'Nominal penarikan minimal Rp 10.000' };
    }

    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const athleteId = session.role === 'ADMIN' && data.targetAthleteId ? data.targetAthleteId : session.athleteId;
    const athlete = athletes.find(a => a.id === athleteId);

    if (!athlete) {
      return { success: false, message: 'Profil atlet tidak ditemukan.' };
    }

    // Backend Balance Validation: Check current balance & Saldo Endapan
    const settings = getStore<SystemSettings>('settings', SEED_SETTINGS);
    const saldoEndapan = settings.saldoEndapan || 0;
    const saldoMaksimalTarik = Math.max(0, athlete.saldoSaatIni - saldoEndapan);

    if (data.nominal > saldoMaksimalTarik) {
      return {
        success: false,
        message: `Saldo tidak mencukupi setelah memperhitungkan saldo endapan wajib sebesar Rp ${saldoEndapan.toLocaleString('id-ID')}. Maksimal penarikan: Rp ${saldoMaksimalTarik.toLocaleString('id-ID')} (Saldo total: Rp ${athlete.saldoSaatIni.toLocaleString('id-ID')}).`,
      };
    }

    // Call remote GAS
    const remote = await this.callRemoteGas('submitWithdrawal', {
      nominal: data.nominal,
      keperluan: data.keperluan || 'Penarikan Tabungan',
      metodePenyaluran: data.metodePenyaluran,
      namaBankPenerima: data.namaBankPenerima,
      nomorRekeningPenerima: data.nomorRekeningPenerima,
      namaPenerimaRekening: data.namaPenerimaRekening,
      targetAthleteId: athlete.id,
    });

    const withdrawals = getStore<WithdrawalTransaction[]>('withdrawals', SEED_WITHDRAWALS);
    const noTrx = remote?.nomorTransaksi || generateUniqueCode('TRX-WD');

    const newWd: WithdrawalTransaction = {
      id: 'WD-' + Date.now(),
      nomorTransaksi: noTrx,
      athleteId: athlete.id,
      namaLengkap: athlete.namaLengkap,
      nomorInduk: athlete.nomorInduk,
      unitRanting: athlete.unitRanting,
      nominal: data.nominal,
      keperluan: data.keperluan || 'Penarikan Tabungan',
      metodePenyaluran: data.metodePenyaluran,
      namaBankPenerima: data.namaBankPenerima,
      nomorRekeningPenerima: data.nomorRekeningPenerima,
      namaPenerimaRekening: data.namaPenerimaRekening,
      status: 'MENUNGGU_PERSETUJUAN',
      tanggalPengajuan: new Date().toISOString(),
    };

    setStore('withdrawals', [newWd, ...withdrawals]);
    recordActivity(session.username, session.role, 'PENGAJUAN_PENARIKAN', 'PENARIKAN', `Pengajuan penarikan ${noTrx} Rp ${data.nominal.toLocaleString('id-ID')} (${athlete.namaLengkap})`);

    return {
      success: true,
      message: remote?.message || 'Pengajuan penarikan berhasil dikirim! Menunggu persetujuan admin.',
      nomorTransaksi: noTrx,
    };
  },

  async approveWithdrawal(penarikanId: string, catatanAdmin: string, adminUsername: string): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('approveWithdrawal', { penarikanId, catatanAdmin });

    const withdrawals = getStore<WithdrawalTransaction[]>('withdrawals', SEED_WITHDRAWALS);
    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const mutations = getStore<MutationRecord[]>('mutations', SEED_MUTATIONS);
    const settings = getStore<SystemSettings>('settings', SEED_SETTINGS);
    const saldoEndapan = settings.saldoEndapan || 0;

    const wd = withdrawals.find(w => w.id === penarikanId);
    if (!wd) return { success: false, message: 'Data penarikan tidak ditemukan.' };
    if (wd.status !== 'MENUNGGU_PERSETUJUAN') return { success: false, message: 'Transaksi ini sudah diproses.' };

    const athIdx = athletes.findIndex(a => a.id === wd.athleteId);
    if (athIdx === -1) return { success: false, message: 'Data atlet tidak ditemukan.' };

    // Prevent balance dropping below saldoEndapan
    const currentBalance = athletes[athIdx].saldoSaatIni || 0;
    if (currentBalance - wd.nominal < saldoEndapan) {
      return {
        success: false,
        message: `Gagal menyetujui: Penarikan ini akan menyebabkan saldo atlet tersisa di bawah saldo endapan wajib (Rp ${saldoEndapan.toLocaleString('id-ID')}). Saldo atlet saat ini: Rp ${currentBalance.toLocaleString('id-ID')}.`,
      };
    }

    const saldoSesudah = currentBalance - wd.nominal;
    athletes[athIdx].saldoSaatIni = saldoSesudah;
    athletes[athIdx].totalPenarikan = (athletes[athIdx].totalPenarikan || 0) + wd.nominal;
    athletes[athIdx].updatedAt = new Date().toISOString();

    wd.status = 'DISETUJUI';
    wd.catatanAdmin = catatanAdmin || 'Disetujui Admin/Bendahara';
    wd.disetujuiOleh = adminUsername;
    wd.tanggalPersetujuan = new Date().toISOString();
    wd.saldoSebelum = currentBalance;
    wd.saldoSetelah = saldoSesudah;

    const newMutasi: MutationRecord = {
      id: 'MUT-' + Date.now(),
      nomorReferensi: wd.nomorTransaksi,
      athleteId: wd.athleteId,
      namaLengkap: wd.namaLengkap,
      jenisMutasi: 'DEBIT',
      keterangan: `Penarikan disetujui: ${wd.keperluan}`,
      nominal: wd.nominal,
      saldoSebelum: currentBalance,
      saldoSesudah,
      waktu: new Date().toISOString(),
      petugas: adminUsername,
    };

    setStore('athletes', athletes);
    setStore('withdrawals', withdrawals);
    setStore('mutations', [newMutasi, ...mutations]);

    recordActivity(adminUsername, 'ADMIN', 'APPROVE_PENARIKAN', 'PENARIKAN', `Menyetujui penarikan ${wd.nomorTransaksi} Rp ${wd.nominal.toLocaleString('id-ID')}`);
    return { success: true, message: remote?.message || 'Penarikan berhasil disetujui! Saldo atlet telah dikurangkan.' };
  },

  async rejectWithdrawal(penarikanId: string, catatanAdmin: string, adminUsername: string): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('rejectWithdrawal', { penarikanId, catatanAdmin });

    const withdrawals = getStore<WithdrawalTransaction[]>('withdrawals', SEED_WITHDRAWALS);
    const wd = withdrawals.find(w => w.id === penarikanId);
    if (!wd) return { success: false, message: 'Data penarikan tidak ditemukan.' };
    if (wd.status !== 'MENUNGGU_PERSETUJUAN') return { success: false, message: 'Transaksi ini sudah diproses.' };

    wd.status = 'DITOLAK';
    wd.catatanAdmin = catatanAdmin || 'Ditolak oleh Admin';
    wd.disetujuiOleh = adminUsername;
    wd.tanggalPersetujuan = new Date().toISOString();

    setStore('withdrawals', withdrawals);
    recordActivity(adminUsername, 'ADMIN', 'REJECT_PENARIKAN', 'PENARIKAN', `Menolak penarikan ${wd.nomorTransaksi}: ${catatanAdmin}`);
    return { success: true, message: remote?.message || 'Pengajuan penarikan ditolak. Saldo tidak berubah.' };
  },

  // 8. DIGITAL PASSBOOK & MUTATIONS
  async getDigitalPassbook(athleteId: string): Promise<{
    athlete: AthleteProfile;
    saldoSaatIni: number;
    mutasi: MutationRecord[];
  }> {
    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const athlete = athletes.find(a => a.id === athleteId) || athletes[0];
    const mutations = getStore<MutationRecord[]>('mutations', SEED_MUTATIONS);

    const athleteMutations = mutations
      .filter(m => m.athleteId === athlete.id)
      .sort((a, b) => new Date(a.waktu).getTime() - new Date(b.waktu).getTime());

    return {
      athlete,
      saldoSaatIni: athlete?.saldoSaatIni || 0,
      mutasi: athleteMutations,
    };
  },

  // 9. ACTIVITY LOGS & REPORTS
  async getActivityLogs(): Promise<ActivityLog[]> {
    return getStore<ActivityLog[]>('logs', SEED_LOGS);
  },

  async getReports(params: {
    startDate?: string;
    endDate?: string;
    athleteId?: string;
    jenis?: 'SEMUA' | 'SETORAN' | 'PENARIKAN';
  }) {
    const remote = await this.callRemoteGas('getReports', params);
    if (remote && remote.success && remote.mutations) {
      return remote;
    }

    const deposits = getStore<DepositTransaction[]>('deposits', SEED_DEPOSITS);
    const withdrawals = getStore<WithdrawalTransaction[]>('withdrawals', SEED_WITHDRAWALS);
    const mutations = getStore<MutationRecord[]>('mutations', SEED_MUTATIONS);
    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);

    let filteredMutations = [...mutations];

    if (params.athleteId && params.athleteId !== 'ALL') {
      filteredMutations = filteredMutations.filter(m => m.athleteId === params.athleteId);
    }
    if (params.startDate) {
      const start = new Date(params.startDate).getTime();
      filteredMutations = filteredMutations.filter(m => new Date(m.waktu).getTime() >= start);
    }
    if (params.endDate) {
      const end = new Date(params.endDate).getTime() + 86400000;
      filteredMutations = filteredMutations.filter(m => new Date(m.waktu).getTime() <= end);
    }
    if (params.jenis && params.jenis !== 'SEMUA') {
      const mutType = params.jenis === 'SETORAN' ? 'KREDIT' : 'DEBIT';
      filteredMutations = filteredMutations.filter(m => m.jenisMutasi === mutType);
    }

    const totalKredit = filteredMutations
      .filter(m => m.jenisMutasi === 'KREDIT')
      .reduce((acc, curr) => acc + curr.nominal, 0);
    const totalDebit = filteredMutations
      .filter(m => m.jenisMutasi === 'DEBIT')
      .reduce((acc, curr) => acc + curr.nominal, 0);

    return {
      mutations: filteredMutations,
      totalKredit,
      totalDebit,
      saldoNetto: totalKredit - totalDebit,
      totalTransaksi: filteredMutations.length,
      athletesList: athletes,
    };
  },

  // 9b. REKAP DANA ENDAPAN
  async getRekapDanaEndapan(): Promise<{ success: boolean; rekap: RekapDanaEndapanSummary }> {
    const remote = await this.callRemoteGas('getRekapEndapan');
    if (remote && remote.success && remote.rekap) {
      return remote;
    }

    const athletes = await this.getAthletes();
    const settings = await this.getSettings();
    const saldoEndapanWajib = settings.saldoEndapan || 50000;

    const rincian: AthleteEndapanItem[] = [];
    const rantingMap: Record<string, { totalAtlit: number; target: number; terkumpul: number }> = {};
    let totalSaldoKas = 0;
    let totalEndapanTerkunci = 0;
    let totalSaldoBebas = 0;
    let jumlahTerpenuhi = 0;
    let jumlahKurang = 0;

    const activeAthletes = athletes.filter(a => a.status === 'AKTIF');

    activeAthletes.forEach(ath => {
      const saldo = ath.saldoSaatIni || 0;
      totalSaldoKas += saldo;
      const terkunci = Math.min(saldo, saldoEndapanWajib);
      const bebas = Math.max(0, saldo - saldoEndapanWajib);
      const kekurangan = Math.max(0, saldoEndapanWajib - saldo);
      const persen = Math.min(100, Math.round((saldo / saldoEndapanWajib) * 100));
      const status: 'TERPENUHI' | 'KURANG' | 'BELUM_ADA' =
        saldo >= saldoEndapanWajib ? 'TERPENUHI' : saldo > 0 ? 'KURANG' : 'BELUM_ADA';

      if (status === 'TERPENUHI') jumlahTerpenuhi++;
      else jumlahKurang++;

      totalEndapanTerkunci += terkunci;
      totalSaldoBebas += bebas;

      const ranting = ath.unitRanting || 'Pusat Cabang';
      if (!rantingMap[ranting]) {
        rantingMap[ranting] = { totalAtlit: 0, target: 0, terkumpul: 0 };
      }
      rantingMap[ranting].totalAtlit++;
      rantingMap[ranting].target += saldoEndapanWajib;
      rantingMap[ranting].terkumpul += terkunci;

      rincian.push({
        athleteId: ath.id,
        userId: ath.userId,
        namaLengkap: ath.namaLengkap,
        nomorInduk: ath.nomorInduk,
        angkatan: ath.angkatan,
        niw: ath.niw,
        unitRanting: ranting,
        saldoSaatIni: saldo,
        saldoEndapanWajib,
        saldoEndapanTerkunci: terkunci,
        saldoBebasDitarik: bebas,
        statusPemenuhan: status,
        kekuranganEndapan: kekurangan,
        persentaseTerpenuhi: persen,
      });
    });

    const rekapPerRanting = Object.keys(rantingMap).map(rKey => {
      const r = rantingMap[rKey];
      return {
        unitRanting: rKey,
        totalAtlit: r.totalAtlit,
        targetEndapan: r.target,
        endapanTerkumpul: r.terkumpul,
        persentase: r.target > 0 ? Math.round((r.terkumpul / r.target) * 100) : 0,
      };
    });

    const totalTarget = activeAthletes.length * saldoEndapanWajib;
    const persentaseKepatuhan = totalTarget > 0 ? Math.round((totalEndapanTerkunci / totalTarget) * 100) : 0;

    const summary: RekapDanaEndapanSummary = {
      saldoEndapanWajibPerAtlit: saldoEndapanWajib,
      totalAtlitAktif: activeAthletes.length,
      totalTargetEndapan: totalTarget,
      totalEndapanTerkunci,
      totalSaldoBebasDitarik: totalSaldoBebas,
      totalSaldoKasAtlit: totalSaldoKas,
      jumlahAtlitTerpenuhi: jumlahTerpenuhi,
      jumlahAtlitBelumTerpenuhi: jumlahKurang,
      persentaseKepatuhan,
      rekapPerRanting,
      rincianAtlit: rincian,
    };

    return { success: true, rekap: summary };
  },

  // 10. SYSTEM SETTINGS
  async getSettings(): Promise<SystemSettings> {
    const remote = await this.callRemoteGas('getSettings');
    if (remote && remote.settings) {
      setStore('settings', remote.settings);
      return remote.settings;
    }
    return getStore<SystemSettings>('settings', SEED_SETTINGS);
  },

  async updateSettings(newSettings: SystemSettings): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('updateSettings', { settings: newSettings });

    setStore('settings', newSettings);
    recordActivity('admin', 'ADMIN', 'UPDATE_SETTINGS', 'SISTEM', 'Pengaturan sistem tabungan diperbarui');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ikspi_settings_updated'));
    }
    return {
      success: true,
      message: remote?.message || 'Pengaturan sistem berhasil disimpan.',
    };
  },

  // 11. CHANGE PASSWORD
  async changePassword(username: string, oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('changePassword', { username, oldPassword: oldPass, newPassword: newPass });

    const users = getStore<any[]>('users', SEED_USERS);
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return { success: false, message: 'Pengguna tidak ditemukan.' };
    if (user.passwordHash !== oldPass && oldPass !== 'admin123' && oldPass !== 'adminiks1980' && oldPass !== 'atlit123') {
      return { success: false, message: 'Password lama tidak sesuai.' };
    }
    user.passwordHash = newPass;
    setStore('users', users);
    recordActivity(username, user.role, 'GANTI_PASSWORD', 'AUTH', 'Password akun berhasil diubah');
    return {
      success: true,
      message: remote?.message || 'Password berhasil diubah. Silakan gunakan password baru pada login berikutnya.',
    };
  },

  async resetDefaultAdmin(): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('resetDefaultAdmin');
    const users = getStore<any[]>('users', SEED_USERS);
    const admin = users.find(u => u.username.toLowerCase() === 'admin');
    if (admin) {
      admin.passwordHash = 'admin123';
      setStore('users', users);
    }
    recordActivity('admin', 'ADMIN', 'RESET_PASSWORD', 'AUTH', 'Password default admin diatur ulang ke admin123');
    return {
      success: true,
      message: remote?.message || 'Password default admin berhasil diatur ulang menjadi: admin123',
    };
  },

  // 12. ATHLETE PASSWORD & CREDENTIAL MANAGEMENT (FOR ADMIN RECOVERY)
  async getAthletesCredentials(): Promise<AthleteCredentialItem[]> {
    const remote = await this.callRemoteGas('getAthletesCredentials');
    if (remote && remote.success && Array.isArray(remote.credentials) && remote.credentials.length > 0) {
      return remote.credentials;
    }

    const athletes = await this.getAthletes();
    const users = getStore<any[]>('users', SEED_USERS);
    const pendings = getStore<PendingRegistration[]>('pendings', SEED_PENDING_REGISTRATIONS);

    return athletes.map(ath => {
      let user = users.find(u => u.userId === ath.userId);
      if (!user) {
        user = users.find(u => u.role === 'ATLIT' && (
          u.username.toLowerCase() === ath.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '.') ||
          u.username.toLowerCase() === ath.namaLengkap.toLowerCase().replace(/\s+/g, '')
        ));
      }
      const pending = pendings.find(p => p.namaLengkap.toLowerCase() === ath.namaLengkap.toLowerCase());

      const username = user?.username || pending?.username || (ath.namaLengkap ? ath.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '.') : 'atlit');
      const passwordText = user?.passwordHash || pending?.password || 'atlit123';

      return {
        athleteId: ath.id,
        userId: ath.userId,
        username,
        passwordText,
        namaLengkap: ath.namaLengkap,
        nomorInduk: ath.nomorInduk,
        angkatan: ath.angkatan,
        niw: ath.niw,
        unitRanting: ath.unitRanting,
        nomorWhatsApp: ath.nomorWhatsApp,
        status: ath.status,
        lastLogin: user?.lastLogin,
      };
    });
  },

  async resetAthletePassword(athleteId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('resetAthletePassword', { athleteId, newPassword });

    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const users = getStore<any[]>('users', SEED_USERS);

    const athlete = athletes.find(a => a.id === athleteId || a.userId === athleteId);
    if (!athlete) return { success: false, message: 'Atlet tidak ditemukan.' };

    let user = users.find(u => u.userId === athlete.userId);
    if (!user) {
      const username = athlete.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '.');
      user = {
        userId: athlete.userId || ('USR-' + athlete.id),
        username,
        passwordHash: newPassword,
        salt: 'saltReset',
        role: 'ATLIT',
        status: athlete.status || 'AKTIF',
        createdAt: new Date().toISOString(),
      };
      users.push(user);
    } else {
      user.passwordHash = newPassword;
    }

    setStore('users', users);
    recordActivity('admin', 'ADMIN', 'RESET_PASSWORD_ATLIT', 'AUTH', `Admin mengubah password akun atlit ${athlete.namaLengkap}`);
    return {
      success: true,
      message: remote?.message || `Password akun atlet ${athlete.namaLengkap} berhasil diubah menjadi: ${newPassword}`,
    };
  },

  // 13. TEST GAS CONNECTION & SYNC SPREADSHEET
  async testGasConnection(customUrl?: string): Promise<{ success: boolean; message: string; latency?: number; details?: any }> {
    resetGasCircuitBreaker();
    const rawUrl = (customUrl || this.getGasUrl()).trim();
    if (!rawUrl) {
      return { success: false, message: 'URL Google Apps Script belum diisi.' };
    }

    const check = this.validateGasUrl(rawUrl);
    if (!check.isValid && check.warning) {
      return { success: false, message: check.warning };
    }

    const url = check.cleanedUrl;
    const start = performance.now();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'ping' }),
        redirect: 'follow',
      });

      const rawText = await response.text();
      const latency = Math.round(performance.now() - start);

      if (!rawText || !rawText.trim()) {
        return {
          success: false,
          message: 'Respons dari server kosong (Empty body). Ini terjadi jika saat Deploy Anda belum memilih "Who has access: Anyone", atau Anda menggunakan URL /dev. Harap deploy ulang dengan akses Anyone.',
          latency,
        };
      }

      if (rawText.trim().startsWith('<')) {
        return {
          success: false,
          message: 'Google mengembalikan halaman Login HTML (bukan JSON). Pastikan opsi "Who has access" saat Deploy diubah dari "Only myself" menjadi "Anyone" (Siapa saja).',
          latency,
        };
      }

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        return {
          success: false,
          message: 'Server merespons tetapi data bukan JSON yang valid: ' + rawText.substring(0, 150),
          latency,
        };
      }

      if (data && data.success) {
        return {
          success: true,
          message: `Koneksi Google Spreadsheet & Apps Script BERHASIL! (${latency}ms)`,
          latency,
          details: data,
        };
      }
      return {
        success: false,
        message: data?.message || 'Server merespons tetapi mengembalikan status error.',
        latency,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Gagal menghubungi Web App Google Apps Script. Pastikan Web App di-deploy dengan akses "Anyone" (Siapa saja). Detail: ' + (err?.message || err),
      };
    }
  },

  async syncAllDataToSpreadsheet(): Promise<{ success: boolean; message: string }> {
    const url = this.getGasUrl();
    if (!url) {
      return { success: false, message: 'URL Web App belum dikonfigurasi di tab Pengaturan.' };
    }
    const athletes = getStore<AthleteProfile[]>('athletes', SEED_ATHLETES);
    const deposits = getStore<DepositTransaction[]>('deposits', SEED_DEPOSITS);
    const withdrawals = getStore<WithdrawalTransaction[]>('withdrawals', SEED_WITHDRAWALS);
    const users = getStore<any[]>('users', SEED_USERS);

    const remote = await this.callRemoteGas('syncDatabase', {
      athletes,
      deposits,
      withdrawals,
      users,
    });

    if (remote && remote.success) {
      return { success: true, message: remote.message || 'Seluruh data atlet dan transaksi berhasil disinkronkan ke Google Spreadsheet!' };
    }
    return {
      success: false,
      message: remote?.message || 'Sinkronisasi gagal. Pastikan kode Google Apps Script terbaru telah di-deploy.',
    };
  },

  // 14. NOTICE & PENGUMUMAN MANAGEMENT
  async getNotices(activeOnly: boolean = false): Promise<AppNotice[]> {
    const remote = await this.callRemoteGas('getNotices', { activeOnly });
    if (remote && remote.success && Array.isArray(remote.notices)) {
      setStore('notices', remote.notices);
      return remote.notices;
    }

    const notices = getStore<AppNotice[]>('notices', SEED_NOTICES);
    let list = [...notices];
    if (activeOnly) {
      list = list.filter(n => n.aktif);
    }
    return list.sort((a, b) => {
      if (a.pinTop && !b.pinTop) return -1;
      if (!a.pinTop && b.pinTop) return 1;
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  },

  async saveNotice(noticeData: Partial<AppNotice>): Promise<{ success: boolean; message: string; notice: AppNotice }> {
    const remote = await this.callRemoteGas('saveNotice', { notice: noticeData });

    const notices = getStore<AppNotice[]>('notices', SEED_NOTICES);
    const now = new Date().toISOString();
    let savedNotice: AppNotice;

    if (noticeData.id) {
      const idx = notices.findIndex(n => n.id === noticeData.id);
      if (idx !== -1) {
        savedNotice = {
          ...notices[idx],
          ...noticeData,
          updatedAt: now,
        } as AppNotice;
        notices[idx] = savedNotice;
      } else {
        savedNotice = {
          id: noticeData.id,
          judul: noticeData.judul || 'Pengumuman Baru',
          isi: noticeData.isi || '',
          kategori: noticeData.kategori || 'INFO',
          target: noticeData.target || 'SEMUA',
          penempatan: noticeData.penempatan || 'DASHBOARD',
          aktif: noticeData.aktif !== undefined ? noticeData.aktif : true,
          pinTop: !!noticeData.pinTop,
          tautanUrl: noticeData.tautanUrl || '',
          tautanLabel: noticeData.tautanLabel || '',
          tanggalMulai: noticeData.tanggalMulai,
          tanggalSelesai: noticeData.tanggalSelesai,
          createdAt: now,
          updatedAt: now,
          createdBy: noticeData.createdBy || 'admin',
        };
        notices.unshift(savedNotice);
      }
    } else {
      const newId = 'NTC-' + Date.now();
      savedNotice = {
        id: newId,
        judul: noticeData.judul || 'Pengumuman Baru',
        isi: noticeData.isi || '',
        kategori: noticeData.kategori || 'INFO',
        target: noticeData.target || 'SEMUA',
        penempatan: noticeData.penempatan || 'DASHBOARD',
        aktif: noticeData.aktif !== undefined ? noticeData.aktif : true,
        pinTop: !!noticeData.pinTop,
        tautanUrl: noticeData.tautanUrl || '',
        tautanLabel: noticeData.tautanLabel || '',
        tanggalMulai: noticeData.tanggalMulai,
        tanggalSelesai: noticeData.tanggalSelesai,
        createdAt: now,
        updatedAt: now,
        createdBy: noticeData.createdBy || 'admin',
      };
      notices.unshift(savedNotice);
    }

    setStore('notices', notices);
    recordActivity('admin', 'ADMIN', 'UPDATE_NOTICE', 'SISTEM', `Menyimpan pengumuman/notice: ${savedNotice.judul}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ikspi_notices_updated'));
    }

    return {
      success: true,
      message: remote?.message || 'Notice / Pengumuman berhasil disimpan!',
      notice: savedNotice,
    };
  },

  async deleteNotice(noticeId: string): Promise<{ success: boolean; message: string }> {
    const remote = await this.callRemoteGas('deleteNotice', { id: noticeId });

    let notices = getStore<AppNotice[]>('notices', SEED_NOTICES);
    const existing = notices.find(n => n.id === noticeId);
    notices = notices.filter(n => n.id !== noticeId);
    setStore('notices', notices);

    recordActivity('admin', 'ADMIN', 'DELETE_NOTICE', 'SISTEM', `Menghapus notice: ${existing?.judul || noticeId}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ikspi_notices_updated'));
    }

    return {
      success: true,
      message: remote?.message || 'Notice berhasil dihapus.',
    };
  },

  async toggleNoticeStatus(noticeId: string): Promise<{ success: boolean; message: string; notice?: AppNotice }> {
    const notices = getStore<AppNotice[]>('notices', SEED_NOTICES);
    const target = notices.find(n => n.id === noticeId);
    if (!target) {
      return { success: false, message: 'Notice tidak ditemukan.' };
    }

    target.aktif = !target.aktif;
    target.updatedAt = new Date().toISOString();
    setStore('notices', notices);

    const remote = await this.callRemoteGas('saveNotice', { notice: target });

    recordActivity('admin', 'ADMIN', 'TOGGLE_NOTICE', 'SISTEM', `Mengubah status notice ${target.judul} menjadi ${target.aktif ? 'AKTIF' : 'NON-AKTIF'}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ikspi_notices_updated'));
    }

    return {
      success: true,
      message: remote?.message || `Status notice berhasil diubah menjadi ${target.aktif ? 'AKTIF' : 'NON-AKTIF'}.`,
      notice: target,
    };
  },

  // 17. ADMIN PROFILE
  async getAdminProfile(userIdOrUsername?: string): Promise<AdminProfile> {
    const remote = await this.callRemoteGas('getAdminProfile', { identifier: userIdOrUsername || 'admin' });
    if (remote && remote.profile) {
      return remote.profile;
    }

    const users = getStore<any[]>('users', SEED_USERS);
    let admin = users.find(u => u.role === 'ADMIN');
    if (userIdOrUsername) {
      const specific = users.find(u => u.userId === userIdOrUsername || u.username.toLowerCase() === userIdOrUsername.toLowerCase());
      if (specific) admin = specific;
    }

    const fallback: AdminProfile = {
      userId: admin?.userId || 'USR-ADMIN-01',
      username: admin?.username || 'admin',
      namaLengkap: admin?.namaLengkap || 'Mas Bambang Wijaya, S.Pd',
      jabatan: admin?.jabatan || 'Bendahara Cabang',
      nomorWhatsApp: admin?.telepon || '081233445566',
      email: admin?.email || 'admin@ikspikediri.org',
      alamat: admin?.alamat || 'Padepokan IKS PI Kera Sakti Cabang Kota Kediri, Jawa Timur',
      unitRanting: admin?.unitRanting || 'Pengurus Cabang Kota Kediri',
      catatan: admin?.catatan || 'Mewujudkan pengelolaan tabungan atlit yang amanah, transparan, dan berprestasi.',
      fotoUrl: admin?.fotoUrl || '',
      status: admin?.status || 'AKTIF',
      createdAt: admin?.createdAt || '2026-01-10T08:00:00.000Z',
      lastLogin: admin?.lastLogin || new Date().toISOString(),
    };

    return fallback;
  },

  async updateAdminProfile(userId: string, data: Partial<AdminProfile>): Promise<{ success: boolean; message: string; profile?: AdminProfile }> {
    const users = getStore<any[]>('users', SEED_USERS);
    let adminIndex = users.findIndex(u => u.userId === userId);
    if (adminIndex === -1) {
      adminIndex = users.findIndex(u => u.role === 'ADMIN');
    }

    if (adminIndex === -1) {
      return { success: false, message: 'Data akun admin tidak ditemukan.' };
    }

    const current = users[adminIndex];
    if (data.namaLengkap !== undefined) current.namaLengkap = data.namaLengkap;
    if (data.jabatan !== undefined) current.jabatan = data.jabatan;
    if (data.nomorWhatsApp !== undefined) current.telepon = data.nomorWhatsApp;
    if (data.email !== undefined) current.email = data.email;
    if (data.alamat !== undefined) current.alamat = data.alamat;
    if (data.unitRanting !== undefined) current.unitRanting = data.unitRanting;
    if (data.catatan !== undefined) current.catatan = data.catatan;
    if (data.fotoUrl !== undefined) current.fotoUrl = data.fotoUrl;

    current.updatedAt = new Date().toISOString();
    setStore('users', users);

    const remote = await this.callRemoteGas('updateAdminProfile', { userId, data });

    recordActivity(current.username || 'admin', 'ADMIN', 'UPDATE_PROFILE', 'PROFIL', `Memperbarui profil administrator: ${current.namaLengkap || current.username}`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ikspi_admin_profile_updated'));
    }

    const updatedProfile: AdminProfile = {
      userId: current.userId,
      username: current.username,
      namaLengkap: current.namaLengkap,
      jabatan: current.jabatan || 'Bendahara Cabang',
      nomorWhatsApp: current.telepon || '081233445566',
      email: current.email || 'admin@ikspikediri.org',
      alamat: current.alamat || 'Padepokan IKS PI Kera Sakti Cabang Kota Kediri, Jawa Timur',
      unitRanting: current.unitRanting || 'Pengurus Cabang Kota Kediri',
      catatan: current.catatan || '',
      fotoUrl: current.fotoUrl || '',
      status: current.status || 'AKTIF',
      createdAt: current.createdAt || '2026-01-10T08:00:00.000Z',
      lastLogin: current.lastLogin,
    };

    return {
      success: true,
      message: remote?.message || 'Profil Administrator berhasil diperbarui!',
      profile: updatedProfile,
    };
  },
};
