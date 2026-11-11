import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  FlipHorizontal,
  X,
  Keyboard,
  Barcode as BarcodeIcon,
} from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (errorMessage: string) => void;
  isScanningActive?: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onError,
  isScanningActive = true,
}) => {
  const [scannerStarted, setScannerStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = 'ikspi-barcode-scanner-viewport';

  // Supported barcode & QR formats
  const formatsToSupport = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODABAR,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
  ];

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        scannerRef.current = null;
        setScannerStarted(false);
      }
    }
  };

  const startCamera = async (cameraId?: string) => {
    try {
      setErrorMessage(null);
      await stopScanner();

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport,
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setErrorMessage('Kamera tidak ditemukan pada perangkat Anda. Silakan unggah foto barcode atau ketik manual.');
        return;
      }

      setAvailableCameras(cameras);

      // Select camera: rear/environment camera preferred
      let selectedCamId = cameraId;
      if (!selectedCamId) {
        const backCam = cameras.find((c) =>
          c.label.toLowerCase().includes('back') ||
          c.label.toLowerCase().includes('rear') ||
          c.label.toLowerCase().includes('belakang') ||
          c.label.toLowerCase().includes('environment')
        );
        selectedCamId = backCam ? backCam.id : cameras[0].id;
      }

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        selectedCamId,
        config,
        (decodedText) => {
          // Success callback
          const cleanText = decodedText.trim();
          if (cleanText) {
            // Trigger gentle audio beep / vibration if available
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(80);
            }
            onScan(cleanText);
          }
        },
        (error) => {
          // Ignore frame decode misses (happens every frame when no barcode in view)
        }
      );

      setScannerStarted(true);

      // Check flashlight capability
      try {
        // Torch capability in html5-qrcode
        // @ts-ignore
        const capabilities = html5QrCode.getRunningTrackCameraCapabilities();
        if (capabilities && capabilities.torchFeature && capabilities.torchFeature().isSupported()) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.warn('Error starting camera scanner:', err);
      const msg = err?.message || String(err);
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setErrorMessage('Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda, atau unggah foto barcode.');
      } else {
        setErrorMessage('Gagal membuka kamera: ' + msg);
      }
      setScannerStarted(false);
    }
  };

  useEffect(() => {
    if (isScanningActive) {
      startCamera();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanningActive]);

  const handleFlipCamera = async () => {
    if (availableCameras.length <= 1) return;
    const nextIdx = (currentCameraIndex + 1) % availableCameras.length;
    setCurrentCameraIndex(nextIdx);
    await startCamera(availableCameras[nextIdx].id);
  };

  const handleToggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch toggle error:', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setErrorMessage(null);
    try {
      const html5QrCode = new Html5Qrcode('ikspi-file-scanner-temp', {
        formatsToSupport,
        verbose: false,
      });

      const decodedText = await html5QrCode.scanFile(file, true);
      if (decodedText) {
        onScan(decodedText.trim());
      } else {
        setErrorMessage('Tidak ada barcode atau QR code yang terdeteksi pada gambar tersebut.');
      }
    } catch (err: any) {
      console.error('File scan error:', err);
      setErrorMessage('Tidak dapat membaca barcode dari gambar ini. Pastikan gambar jelas dan tidak buram.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualInput.trim();
    if (!clean) return;
    onScan(clean);
  };

  return (
    <div className="space-y-4">
      {/* Hidden file scanner container */}
      <div id="ikspi-file-scanner-temp" className="hidden"></div>

      {/* Main Scanner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 border-2 border-amber-500/40 shadow-2xl">
        {/* Scanner Video Viewport */}
        <div className="relative w-full aspect-square max-h-[320px] sm:max-h-[360px] mx-auto bg-black flex items-center justify-center overflow-hidden">
          {/* HTML5 QR Code Mount point */}
          <div id={scannerContainerId} className="w-full h-full flex items-center justify-center"></div>

          {/* Animated Scanning Laser Line */}
          {scannerStarted && (
            <div className="absolute inset-x-8 top-12 bottom-12 pointer-events-none flex flex-col justify-between border-2 border-amber-400/60 rounded-2xl">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400"></div>
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400"></div>
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400"></div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400"></div>

              {/* Laser beam */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#F59E0B] animate-pulse my-auto"></div>
            </div>
          )}

          {/* Fallback or Loading overlay */}
          {!scannerStarted && !errorMessage && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-white">
                Mempersiapkan Kamera Scanner...
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Izinkan akses kamera saat diminta oleh browser untuk mulai memindai.
              </p>
            </div>
          )}

          {/* Error Banner inside Viewport */}
          {errorMessage && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-rose-300">
                Kamera Tidak Aktif
              </p>
              <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => startCamera()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Nyalakan Lagi</span>
              </button>
            </div>
          )}

          {/* Camera controls overlay in top-right */}
          {scannerStarted && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
              {hasTorch && (
                <button
                  type="button"
                  onClick={handleToggleTorch}
                  title="Flashlight"
                  className={`p-2 rounded-xl backdrop-blur-md transition ${
                    torchOn
                      ? 'bg-amber-500 text-slate-950 shadow-lg'
                      : 'bg-slate-900/80 text-white hover:bg-slate-800'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </button>
              )}

              {availableCameras.length > 1 && (
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  title="Ganti Kamera"
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md transition"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Viewport Instructions */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 text-center">
          <p className="text-xs font-semibold text-white flex items-center justify-center gap-1.5">
            <BarcodeIcon className="w-4 h-4 text-amber-400" />
            <span>Arahkan Barcode atau QR Code ke dalam kotak sorot</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Mendukung barcode kartu anggota fisik maupun QR code digital di HP lain
          </p>
        </div>
      </div>

      {/* Alternative Options Toolbar */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Upload file from gallery button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessingFile}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          {isProcessingFile ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Membaca Foto...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Unggah Gambar Barcode</span>
            </>
          )}
        </button>

        {/* Manual type toggle */}
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Keyboard className="w-4 h-4 text-amber-400" />
          <span>{showManualInput ? 'Tutup Input Manual' : 'Ketik Kode Manual'}</span>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Manual Input Drawer */}
      {showManualInput && (
        <form
          onSubmit={handleManualSubmit}
          className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-amber-400">
              Ketik Kode Barcode / Nomor Induk:
            </label>
            <button
              type="button"
              onClick={() => setShowManualInput(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Contoh: 128/0089 atau IKS-ATL-123456"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
            >
              Proses
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Sistem akan mencocokkan kode barcode dengan akun anggota aktif di basis data.
          </p>
        </form>
      )}
    </div>
  );
};
