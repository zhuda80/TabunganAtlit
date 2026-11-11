export type CardThemeId = 'gold' | 'maroon' | 'dark' | 'white' | 'emerald';
export type CardOrientation = 'landscape' | 'portrait';
export type QrCenterLogoType = 'ikspi' | 'photo' | 'shield' | 'none';
export type BarcodeFormatType = 'code128' | 'code39';

export interface CardThemeDef {
  id: CardThemeId;
  name: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  bgGradient: string;
  accentColor: string;
  canvasBgStart: string;
  canvasBgEnd: string;
  canvasBorder: string;
  canvasInnerBorder: string;
  canvasHeaderColor: string;
  canvasTextColor: string;
  canvasQrBg: string;
}

export const CARD_THEMES: Record<CardThemeId, CardThemeDef> = {
  gold: {
    id: 'gold',
    name: 'Emas IKS PI (Resmi)',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400 border-amber-500/30',
    borderClass: 'border-amber-500/50',
    bgGradient: 'from-slate-950 via-amber-950/20 to-slate-950',
    accentColor: '#F59E0B',
    canvasBgStart: '#0F172A',
    canvasBgEnd: '#020617',
    canvasBorder: '#F59E0B',
    canvasInnerBorder: 'rgba(245, 158, 11, 0.35)',
    canvasHeaderColor: '#F59E0B',
    canvasTextColor: '#FFFFFF',
    canvasQrBg: '#FFFFFF',
  },
  maroon: {
    id: 'maroon',
    name: 'Merah Marun Pendekar',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-400 border-red-500/30',
    borderClass: 'border-red-600/60',
    bgGradient: 'from-slate-950 via-red-950/30 to-slate-950',
    accentColor: '#DC2626',
    canvasBgStart: '#450A0A',
    canvasBgEnd: '#1A0505',
    canvasBorder: '#DC2626',
    canvasInnerBorder: 'rgba(239, 68, 68, 0.4)',
    canvasHeaderColor: '#F87171',
    canvasTextColor: '#FFFFFF',
    canvasQrBg: '#FFFFFF',
  },
  dark: {
    id: 'dark',
    name: 'Hitam Obsidian Modern',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400 border-cyan-500/30',
    borderClass: 'border-slate-700 hover:border-cyan-500/50',
    bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
    accentColor: '#38BDF8',
    canvasBgStart: '#020617',
    canvasBgEnd: '#090D16',
    canvasBorder: '#38BDF8',
    canvasInnerBorder: 'rgba(56, 189, 248, 0.3)',
    canvasHeaderColor: '#38BDF8',
    canvasTextColor: '#FFFFFF',
    canvasQrBg: '#FFFFFF',
  },
  white: {
    id: 'white',
    name: 'Putih Percetakan (Siap Print)',
    badgeBg: 'bg-slate-800 text-slate-200',
    badgeText: 'text-slate-800 border-slate-300',
    borderClass: 'border-slate-400',
    bgGradient: 'from-white via-slate-50 to-slate-100 text-slate-900',
    accentColor: '#0F172A',
    canvasBgStart: '#FFFFFF',
    canvasBgEnd: '#F8FAFC',
    canvasBorder: '#0F172A',
    canvasInnerBorder: '#CBD5E1',
    canvasHeaderColor: '#0F172A',
    canvasTextColor: '#0F172A',
    canvasQrBg: '#FFFFFF',
  },
  emerald: {
    id: 'emerald',
    name: 'Hijau Cabang & Ranting',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400 border-emerald-500/30',
    borderClass: 'border-emerald-500/50',
    bgGradient: 'from-slate-950 via-emerald-950/25 to-slate-950',
    accentColor: '#10B981',
    canvasBgStart: '#064E3B',
    canvasBgEnd: '#022C22',
    canvasBorder: '#10B981',
    canvasInnerBorder: 'rgba(16, 185, 129, 0.35)',
    canvasHeaderColor: '#34D399',
    canvasTextColor: '#FFFFFF',
    canvasQrBg: '#FFFFFF',
  },
};

export interface QrCustomOptions {
  theme: CardThemeId;
  orientation: CardOrientation;
  qrFgColor: string;
  qrBgColor: string;
  qrCenterLogo: QrCenterLogoType;
  logoSizePercent: number; // 18 - 30
  qrMargin: number; // 0, 1, 2, 4
  show1DBarcode: boolean;
  barcodeFormat: BarcodeFormatType;
  barcodeLineColor: string;
  showBarcodeText: boolean;
  headerTitle: string;
  cardSubheader: string;
  footerText: string;
  showPhoto: boolean;
  showNik: boolean;
  showRanting: boolean;
}

export const DEFAULT_QR_CUSTOM_OPTIONS: QrCustomOptions = {
  theme: 'gold',
  orientation: 'landscape',
  qrFgColor: '#020617',
  qrBgColor: '#FFFFFF',
  qrCenterLogo: 'ikspi',
  logoSizePercent: 24,
  qrMargin: 1,
  show1DBarcode: true,
  barcodeFormat: 'code128',
  barcodeLineColor: '#F59E0B',
  showBarcodeText: true,
  headerTitle: 'IKS.PI KERA SAKTI • CABANG KOTA KEDIRI',
  cardSubheader: 'KARTU DIGITAL ANGGOTA & TABUNGAN ATLIT',
  footerText: 'PENGURUS CABANG IKS PI KERA SAKTI KOTA KEDIRI • RESMI & AMAN',
  showPhoto: true,
  showNik: true,
  showRanting: true,
};
