export type UserRole = 'ADMIN' | 'ATLIT';

export type UserStatus = 'AKTIF' | 'NONAKTIF' | 'MENUNGGU_VERIFIKASI' | 'DITOLAK';

export type TransactionType = 'SETORAN' | 'PENARIKAN';

export type PaymentMethod = 'TUNAI' | 'TRANSFER';

export type TransactionStatus = 'MENUNGGU_PERSETUJUAN' | 'DISETUJUI' | 'DITOLAK';

export type MutationType = 'KREDIT' | 'DEBIT'; // KREDIT = Saldo Masuk, DEBIT = Saldo Keluar

export interface UserSession {
  token: string;
  userId: string;
  username: string;
  namaLengkap: string;
  role: UserRole;
  status: UserStatus;
  jabatan?: string;
  athleteId?: string;
  nomorInduk?: string;
  nik?: string;
  angkatan?: string;
  niw?: string;
  unitRanting?: string;
  fotoUrl?: string;
  telepon?: string;
  email?: string;
  alamat?: string;
  barcode?: string;
  expiresAt: number;
}

export interface AdminProfile {
  userId: string;
  username: string;
  namaLengkap: string;
  jabatan: string;
  nomorWhatsApp: string;
  email: string;
  alamat: string;
  unitRanting: string;
  catatan?: string;
  fotoUrl?: string;
  barcode?: string;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
}

export interface AthleteProfile {
  id: string;
  userId: string;
  nomorInduk: string; // Angkatan + NIW
  nik?: string;
  angkatan?: string;
  niw?: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  nomorWhatsApp: string;
  unitRanting: string;
  fotoUrl?: string;
  barcode?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  saldoSaatIni: number;
  totalSetoran: number;
  totalPenarikan: number;
  catatan?: string;
}

export interface PendingRegistration {
  id: string;
  username: string;
  password?: string;
  namaLengkap: string;
  nomorInduk: string; // Angkatan + NIW
  nik?: string;
  angkatan?: string;
  niw?: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  nomorWhatsApp: string;
  unitRanting: string;
  fotoUrl?: string;
  barcode?: string;
  tanggalDaftar: string;
  status: TransactionStatus;
  catatanAdmin?: string;
  diperiksaOleh?: string;
  tanggalPemeriksaan?: string;
}

export interface AthleteCredentialItem {
  athleteId: string;
  userId: string;
  username: string;
  passwordText: string;
  namaLengkap: string;
  nomorInduk: string;
  angkatan?: string;
  niw?: string;
  unitRanting: string;
  nomorWhatsApp: string;
  barcode?: string;
  status: UserStatus;
  lastLogin?: string;
}

export interface DepositTransaction {
  id: string;
  nomorTransaksi: string;
  athleteId: string;
  namaLengkap: string;
  nomorInduk: string;
  unitRanting: string;
  nominal: number;
  metodePembayaran: PaymentMethod;
  namaBankPengirim?: string;
  nomorRekeningPengirim?: string;
  buktiTransferUrl?: string;
  buktiTransferName?: string;
  keterangan: string;
  status: TransactionStatus;
  catatanAdmin?: string;
  disetujuiOleh?: string;
  tanggalPengajuan: string;
  tanggalPersetujuan?: string;
}

export interface WithdrawalTransaction {
  id: string;
  nomorTransaksi: string;
  athleteId: string;
  namaLengkap: string;
  nomorInduk: string;
  unitRanting: string;
  nominal: number;
  keperluan: string;
  metodePenyaluran: PaymentMethod;
  namaBankPenerima?: string;
  nomorRekeningPenerima?: string;
  namaPenerimaRekening?: string;
  status: TransactionStatus;
  catatanAdmin?: string;
  disetujuiOleh?: string;
  tanggalPengajuan: string;
  tanggalPersetujuan?: string;
  saldoSebelum?: number;
  saldoSetelah?: number;
}

export interface BalanceRecord {
  athleteId: string;
  nomorInduk: string;
  namaLengkap: string;
  saldoSaatIni: number;
  totalSetoran: number;
  totalPenarikan: number;
  terakhirDiperbarui: string;
}

export interface MutationRecord {
  id: string;
  nomorReferensi: string;
  athleteId: string;
  namaLengkap: string;
  jenisMutasi: MutationType;
  keterangan: string;
  nominal: number;
  saldoSebelum: number;
  saldoSesudah: number;
  waktu: string;
  petugas: string;
}

export interface ActivityLog {
  id: string;
  waktu: string;
  actor: string;
  role: UserRole;
  action: string;
  kategori: 'AUTH' | 'SETORAN' | 'PENARIKAN' | 'REGISTRASI' | 'ATLIT' | 'SISTEM';
  detail: string;
  ipAddress?: string;
}

export interface SystemSettings {
  namaAplikasi: string;
  organisasi: string;
  cabang: string;
  alamatSekretariat: string;
  kontakSekretariat: string;
  nomorRekeningOrganisasi: string;
  namaBankOrganisasi: string;
  atasNamaRekening: string;
  minimalSetoran: number;
  minimalPenarikan: number;
  saldoEndapan: number;
  sumberData: 'LOCAL_PERSISTENT' | 'GOOGLE_APPS_SCRIPT';
  gasApiUrl?: string;
  logoUrl?: string;
}

export interface DashboardStatsAdmin {
  totalSaldoSeluruhAtlit: number;
  totalUangMasuk: number;
  totalUangKeluar: number;
  totalAtlitAktif: number;
  pendingPendaftaran: number;
  pendingSetoran: number;
  pendingPenarikan: number;
  totalPendingApproval: number;
  totalTargetEndapan?: number;
  totalEndapanTerkunci?: number;
  totalSaldoBebasLikuid?: number;
  persentaseKepatuhanEndapan?: number;
  chartDataBulanan: {
    bulan: string;
    setoran: number;
    penarikan: number;
    saldo: number;
  }[];
  transaksiTerbaru: (DepositTransaction | WithdrawalTransaction)[];
}

export interface DashboardStatsAthlete {
  saldoSaatIni: number;
  totalSetoran: number;
  totalPenarikan: number;
  totalTransaksi: number;
  pendingSetoranCount: number;
  pendingPenarikanCount: number;
  saldoEndapanWajib?: number;
  saldoEndapanTerkunci?: number;
  saldoBebasDitarik?: number;
  statusEndapan?: 'TERPENUHI' | 'KURANG' | 'BELUM_ADA';
  chartDataTren?: {
    bulan: string;
    setoran: number;
    penarikan: number;
    saldo: number;
  }[];
  transaksiTerbaru: (DepositTransaction | WithdrawalTransaction)[];
}

export interface AthleteEndapanItem {
  athleteId: string;
  userId: string;
  namaLengkap: string;
  nomorInduk: string;
  angkatan?: string;
  niw?: string;
  unitRanting: string;
  saldoSaatIni: number;
  saldoEndapanWajib: number;
  saldoEndapanTerkunci: number;
  saldoBebasDitarik: number;
  statusPemenuhan: 'TERPENUHI' | 'KURANG' | 'BELUM_ADA';
  kekuranganEndapan: number;
  persentaseTerpenuhi: number;
}

export interface RekapDanaEndapanSummary {
  saldoEndapanWajibPerAtlit: number;
  totalAtlitAktif: number;
  totalTargetEndapan: number;
  totalEndapanTerkunci: number;
  totalSaldoBebasDitarik: number;
  totalSaldoKasAtlit: number;
  jumlahAtlitTerpenuhi: number;
  jumlahAtlitBelumTerpenuhi: number;
  persentaseKepatuhan: number;
  rekapPerRanting: {
    unitRanting: string;
    totalAtlit: number;
    targetEndapan: number;
    endapanTerkumpul: number;
    persentase: number;
  }[];
  rincianAtlit: AthleteEndapanItem[];
}

export type NoticeCategory = 'INFO' | 'PERINGATAN' | 'PENTING' | 'KEJUARAAN' | 'AGENDA';
export type NoticeTarget = 'SEMUA' | 'ATLIT' | 'ADMIN';
export type NoticePlacement = 'BANNER_TOP' | 'DASHBOARD' | 'MODAL_POPUP';

export interface AppNotice {
  id: string;
  judul: string;
  isi: string;
  kategori: NoticeCategory;
  target: NoticeTarget;
  penempatan: NoticePlacement;
  aktif: boolean;
  pinTop?: boolean;
  tautanUrl?: string;
  tautanLabel?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

