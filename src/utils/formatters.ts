export const formatRupiah = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return 'Rp 0';
  }
  const numeric = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, ''), 10) || 0 : Math.round(value);
  return 'Rp ' + numeric.toLocaleString('id-ID');
};

export const parseRupiahInput = (value: string): number => {
  const clean = value.replace(/[^0-9]/g, '');
  return parseInt(clean, 10) || 0;
};

export const formatTanggal = (dateStr?: string | Date): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
};

export const formatTanggalWaktu = (dateStr?: string | Date): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateStr);
  }
};

export const formatStatusBadge = (status: string) => {
  switch (status) {
    case 'DISETUJUI':
    case 'AKTIF':
      return {
        label: status === 'DISETUJUI' ? 'Disetujui' : 'Aktif',
        bg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'MENUNGGU_PERSETUJUAN':
    case 'MENUNGGU_VERIFIKASI':
      return {
        label: 'Menunggu Approval',
        bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
        dot: 'bg-amber-400 animate-pulse',
      };
    case 'DITOLAK':
    case 'NONAKTIF':
      return {
        label: status === 'DITOLAK' ? 'Ditolak' : 'Nonaktif',
        bg: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
        dot: 'bg-rose-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-500/10 text-slate-300 border border-slate-500/30',
        dot: 'bg-slate-400',
      };
  }
};

export const generateUniqueCode = (prefix: string): string => {
  const d = new Date();
  const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
};
