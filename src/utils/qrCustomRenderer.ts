import QRCode from 'qrcode';
import { QrCustomOptions, CARD_THEMES, CardThemeDef } from '../types/barcodeCustom';

/**
 * Generate 1D barcode stripes data for Code 128-like realistic pattern
 */
export function generateBarcodeBars(text: string): { widths: number[]; totalWidth: number } {
  const clean = (text || 'IKS-KDR').trim();
  const widths: number[] = [];

  // Start guard
  widths.push(2, 1, 1, 2, 1, 3);

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const b1 = (code % 3) + 1;
    const s1 = ((code >> 2) % 3) + 1;
    const b2 = ((code >> 4) % 3) + 1;
    const s2 = ((code * 3) % 3) + 1;
    const b3 = (code % 2) + 1;
    const s3 = ((code >> 1) % 2) + 1;
    widths.push(b1, s1, b2, s2, b3, s3);
  }

  // Stop guard
  widths.push(2, 1, 2, 2, 1, 1, 2);

  const totalWidth = widths.reduce((acc, w) => acc + w, 0);
  return { widths, totalWidth };
}

/**
 * Draw an IKS PI crest emblem onto a 2D canvas context
 */
export function drawIksPiBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  customPhotoUrl?: string
): Promise<void> {
  return new Promise((resolve) => {
    // If custom photo is provided and valid, try to load it
    if (customPhotoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();

        // Border around photo
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = Math.max(2, size * 0.05);
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        resolve();
      };
      img.onerror = () => {
        drawDefaultBadge(ctx, x, y, size);
        resolve();
      };
      img.src = customPhotoUrl;
      return;
    }

    drawDefaultBadge(ctx, x, y, size);
    resolve();
  });
}

function drawDefaultBadge(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  // Gold badge background
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, '#F59E0B');
  grad.addColorStop(0.5, '#D97706');
  grad.addColorStop(1, '#B45309');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Dark inner circle
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size * 0.44, 0, Math.PI * 2);
  ctx.fill();

  // Gold IKS Text
  ctx.fillStyle = '#FBBF24';
  ctx.font = `bold ${Math.round(size * 0.38)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('IKS', x + size / 2, y + size / 2);
  ctx.restore();
}

/**
 * Generate a standalone QR Code image with optional center logo as data URL
 */
export async function generateCustomQrDataUrl(
  text: string,
  options: Partial<QrCustomOptions>,
  customPhotoUrl?: string
): Promise<string> {
  const fg = options.qrFgColor || '#020617';
  const bg = options.qrBgColor || '#FFFFFF';
  const margin = typeof options.qrMargin === 'number' ? options.qrMargin : 1;
  const centerLogo = options.qrCenterLogo || 'ikspi';
  const logoPercent = options.logoSizePercent || 24;

  // Use errorCorrectionLevel 'H' (30% redundancy) if center logo is active
  const baseQrDataUrl = await QRCode.toDataURL(text || 'IKS-KDR', {
    width: 600,
    margin,
    color: {
      dark: fg,
      light: bg === 'transparent' ? '#00000000' : bg,
    },
    errorCorrectionLevel: centerLogo !== 'none' ? 'H' : 'M',
  });

  if (centerLogo === 'none') {
    return baseQrDataUrl;
  }

  // Draw base QR onto canvas to composite the center emblem
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return baseQrDataUrl;

  return new Promise((resolve) => {
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = async () => {
      ctx.drawImage(qrImg, 0, 0, 600, 600);

      // Logo container dimensions
      const logoWidth = Math.round((600 * logoPercent) / 100);
      const logoX = Math.round((600 - logoWidth) / 2);
      const logoY = Math.round((600 - logoWidth) / 2);

      // White/contrast circular backing for logo so it doesn't clash with QR patterns
      ctx.fillStyle = bg === '#020617' ? '#020617' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(300, 300, logoWidth / 2 + 6, 0, Math.PI * 2);
      ctx.fill();

      // Outer thin gold ring
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(300, 300, logoWidth / 2 + 6, 0, Math.PI * 2);
      ctx.stroke();

      if (centerLogo === 'photo' && customPhotoUrl) {
        await drawIksPiBadge(ctx, logoX, logoY, logoWidth, customPhotoUrl);
      } else if (centerLogo === 'shield') {
        // Draw martial shield
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(300, 300, logoWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(logoWidth * 0.42)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚔', 300, 300);
      } else {
        // Default IKS PI Crest
        await drawIksPiBadge(ctx, logoX, logoY, logoWidth);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    qrImg.onerror = () => resolve(baseQrDataUrl);
    qrImg.src = baseQrDataUrl;
  });
}

export interface CardRenderData {
  code: string;
  namaLengkap: string;
  nomorInduk?: string;
  unitRanting?: string;
  nik?: string;
  fotoUrl?: string;
  role?: 'ADMIN' | 'ATLIT';
}

/**
 * Render complete HD Member Card onto Canvas (700x420 or 420x650)
 */
export async function renderCardToCanvas(
  data: CardRenderData,
  options: QrCustomOptions
): Promise<HTMLCanvasElement> {
  const theme: CardThemeDef = CARD_THEMES[options.theme] || CARD_THEMES.gold;
  const isPortrait = options.orientation === 'portrait';

  const width = isPortrait ? 520 : 760;
  const height = isPortrait ? 780 : 460;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, theme.canvasBgStart);
  bgGrad.addColorStop(1, theme.canvasBgEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Martial Watermark or Radial Glow
  const radGlow = ctx.createRadialGradient(width * 0.8, height * 0.2, 20, width * 0.8, height * 0.2, 350);
  radGlow.addColorStop(0, `${theme.accentColor}25`);
  radGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Dual Border Frame
  ctx.strokeStyle = theme.canvasBorder;
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, width - 28, height - 28);

  ctx.strokeStyle = theme.canvasInnerBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(22, 22, width - 44, height - 44);

  // 4. Corner Ornaments
  const cornerSize = 14;
  ctx.fillStyle = theme.accentColor;
  // Top-left
  ctx.fillRect(22, 22, cornerSize, 3);
  ctx.fillRect(22, 22, 3, cornerSize);
  // Top-right
  ctx.fillRect(width - 22 - cornerSize, 22, cornerSize, 3);
  ctx.fillRect(width - 25, 22, 3, cornerSize);
  // Bottom-left
  ctx.fillRect(22, height - 25, cornerSize, 3);
  ctx.fillRect(22, height - 22 - cornerSize, 3, cornerSize);
  // Bottom-right
  ctx.fillRect(width - 22 - cornerSize, height - 25, cornerSize, 3);
  ctx.fillRect(width - 25, height - 22 - cornerSize, 3, cornerSize);

  // 5. Header Section
  const headerX = 40;
  const headerY = 52;

  // Draw Mini Emblem in Header
  await drawIksPiBadge(ctx, headerX, headerY - 14, 38);

  ctx.fillStyle = theme.canvasHeaderColor;
  ctx.font = 'bold 15px "Cinzel", serif, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(options.headerTitle || 'IKS.PI KERA SAKTI • CABANG KOTA KEDIRI', headerX + 50, headerY - 2);

  ctx.fillStyle = theme.id === 'white' ? '#475569' : '#CBD5E1';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(options.cardSubheader || 'KARTU DIGITAL ANGGOTA & TABUNGAN ATLIT', headerX + 50, headerY + 16);

  // Role Badge in Header Top-Right
  const badgeText = data.role === 'ADMIN' ? 'ADMIN CABANG' : 'ATLIT RESMI';
  ctx.fillStyle = theme.accentColor;
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(badgeText, width - 42, headerY + 2);

  // Divider Line
  ctx.strokeStyle = theme.canvasInnerBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, headerY + 34);
  ctx.lineTo(width - 40, headerY + 34);
  ctx.stroke();

  // 6. Generate QR Code with custom settings
  const qrDataUrl = await generateCustomQrDataUrl(
    data.code || data.nomorInduk || 'IKS-KDR',
    options,
    data.fotoUrl
  );

  const qrImage = await new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = qrDataUrl;
  });

  if (!isPortrait) {
    // ======== LANDSCAPE LAYOUT ========
    // Left column: User Identity
    const leftX = 40;
    let currY = 130;

    // Optional Member Photo
    if (options.showPhoto && data.fotoUrl) {
      await drawIksPiBadge(ctx, leftX, currY, 64, data.fotoUrl);
      currY += 76;
    }

    ctx.fillStyle = theme.id === 'white' ? '#64748B' : '#94A3B8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Nama Anggota:', leftX, currY);

    ctx.fillStyle = theme.canvasTextColor;
    ctx.font = 'bold 18px serif, sans-serif';
    ctx.fillText(data.namaLengkap || 'Anggota IKS PI', leftX, currY + 22);
    currY += 46;

    // Nomor Induk & Ranting side-by-side
    ctx.fillStyle = theme.id === 'white' ? '#64748B' : '#94A3B8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Nomor Induk / NIW:', leftX, currY);
    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 15px monospace';
    ctx.fillText(data.nomorInduk || '-', leftX, currY + 20);
    currY += 42;

    if (options.showRanting) {
      ctx.fillStyle = theme.id === 'white' ? '#64748B' : '#94A3B8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Unit / Ranting Latihan:', leftX, currY);
      ctx.fillStyle = theme.id === 'white' ? '#1E293B' : '#E2E8F0';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(data.unitRanting || 'Cabang Kediri', leftX, currY + 18);
      currY += 38;
    }

    // Barcode 1D preview on bottom-left
    if (options.show1DBarcode) {
      const bars = generateBarcodeBars(data.code || data.nomorInduk || 'IKS-KDR');
      const barHeight = 28;
      const barStartX = leftX;
      const barStartY = height - 78;

      let drawX = barStartX;
      ctx.fillStyle = options.barcodeLineColor || theme.accentColor;
      for (let i = 0; i < bars.widths.length; i++) {
        const w = bars.widths[i];
        if (i % 2 === 0) {
          ctx.fillRect(drawX, barStartY, w, barHeight);
        }
        drawX += w;
      }

      if (options.showBarcodeText) {
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = theme.id === 'white' ? '#334155' : '#FBBF24';
        ctx.fillText(data.code || data.nomorInduk || 'IKS-KDR', leftX, barStartY + barHeight + 14);
      }
    }

    // Right column: QR Code box
    const qrSize = 190;
    const qrX = width - qrSize - 44;
    const qrY = 120;

    // White rounded card background for QR
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 14);
    ctx.fill();
    ctx.strokeStyle = theme.canvasInnerBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // Label under QR
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.id === 'white' ? '#0F172A' : '#F59E0B';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('SCAN DI SCANNER / HP', qrX + qrSize / 2, qrY + qrSize + 24);

    // Footer authenticity line
    ctx.textAlign = 'left';
    ctx.fillStyle = theme.id === 'white' ? '#94A3B8' : '#64748B';
    ctx.font = '9px monospace';
    ctx.fillText(options.footerText || 'PENGURUS CABANG IKS PI KERA SAKTI KOTA KEDIRI', 40, height - 20);

  } else {
    // ======== PORTRAIT LAYOUT ========
    let currY = 120;

    // Center photo if enabled
    if (options.showPhoto && data.fotoUrl) {
      const photoSize = 80;
      await drawIksPiBadge(ctx, width / 2 - photoSize / 2, currY, photoSize, data.fotoUrl);
      currY += 92;
    }

    // Center Member Name
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.canvasTextColor;
    ctx.font = 'bold 20px serif, sans-serif';
    ctx.fillText(data.namaLengkap || 'Anggota IKS PI', width / 2, currY);
    currY += 24;

    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 14px monospace';
    ctx.fillText(data.nomorInduk || '-', width / 2, currY);
    currY += 22;

    if (options.showRanting) {
      ctx.fillStyle = theme.id === 'white' ? '#475569' : '#CBD5E1';
      ctx.font = '12px sans-serif';
      ctx.fillText(data.unitRanting || 'Cabang Kota Kediri', width / 2, currY);
      currY += 26;
    }

    // Center QR Code
    const qrSize = 220;
    const qrX = Math.round((width - qrSize) / 2);
    const qrY = currY + 10;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 16);
    ctx.fill();
    ctx.strokeStyle = theme.canvasInnerBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    currY = qrY + qrSize + 26;

    // 1D Barcode under QR
    if (options.show1DBarcode) {
      const bars = generateBarcodeBars(data.code || data.nomorInduk || 'IKS-KDR');
      const barStartX = Math.round((width - bars.totalWidth) / 2);
      let drawX = barStartX;
      ctx.fillStyle = options.barcodeLineColor || theme.accentColor;
      for (let i = 0; i < bars.widths.length; i++) {
        const w = bars.widths[i];
        if (i % 2 === 0) {
          ctx.fillRect(drawX, currY, w, 28);
        }
        drawX += w;
      }
      currY += 38;

      if (options.showBarcodeText) {
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = theme.id === 'white' ? '#334155' : '#FBBF24';
        ctx.fillText(data.code || data.nomorInduk || 'IKS-KDR', width / 2, currY);
      }
    }

    // Footer text
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.id === 'white' ? '#94A3B8' : '#64748B';
    ctx.font = '9px monospace';
    ctx.fillText(options.footerText || 'PENGURUS CABANG IKS PI KERA SAKTI KOTA KEDIRI', width / 2, height - 22);
  }

  return canvas;
}

/**
 * Download functions
 */
export async function downloadCardAsPng(
  data: CardRenderData,
  options: QrCustomOptions,
  filename?: string
): Promise<void> {
  const canvas = await renderCardToCanvas(data, options);
  const link = document.createElement('a');
  const safeName = (data.namaLengkap || data.code || 'IKS-PI').replace(/[^a-zA-Z0-9]/g, '-');
  link.download = filename || `Kartu-${safeName}-${options.theme}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function downloadQrOnlyAsPng(
  text: string,
  options: Partial<QrCustomOptions>,
  customPhotoUrl?: string,
  filename?: string
): Promise<void> {
  const dataUrl = await generateCustomQrDataUrl(text, options, customPhotoUrl);
  const link = document.createElement('a');
  const safeName = (text || 'QR-Code').replace(/[^a-zA-Z0-9]/g, '-');
  link.download = filename || `QR-${safeName}.png`;
  link.href = dataUrl;
  link.click();
}
