import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Modal } from '../ui/Modal';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  FlipHorizontal,
  CreditCard,
  QrCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ScanCardInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCode: (code: string) => void;
  title?: string;
  subtitle?: string;
  targetLabel?: string;
}

export const ScanCardInputModal: React.FC<ScanCardInputModalProps> = ({
  isOpen,
  onClose,
  onSelectCode,
  title = 'Pindai dari Kartu Fisik / Kartu Sekolah',
  subtitle = 'Arahkan kamera ke QR Code / Barcode kartu pelajar, KTP, atau kartu anggota fisik',
  targetLabel = 'Kode Barcode Login',
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'file'>('camera');
  const [scannerStarted, setScannerStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Scanned result state
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [editedResult, setEditedResult] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = 'card-input-scanner-viewport';

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
        console.warn('Error stopping card scanner:', err);
      } finally {
        scannerRef.current = null;
        setScannerStarted(false);
      }
    }
  };

  const handleScanSuccess = (rawText: string) => {
    const clean = rawText.trim();
    if (!clean) return;

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 50, 60]);
    }

    setScannedResult(clean);
    setEditedResult(clean);
    stopScanner();
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
        setErrorMessage('Kamera tidak terdeteksi. Silakan gunakan opsi unggah foto kartu.');
        return;
      }
      setAvailableCameras(cameras);

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
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        selectedCamId,
        config,
        (decodedText) => handleScanSuccess(decodedText),
        () => {}
      );

      setScannerStarted(true);

      // Check flashlight/torch capability
      try {
        // @ts-ignore
        const capabilities = html5QrCode.getRunningTrackCapabilities();
        if (capabilities && 'torch' in capabilities) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setErrorMessage(
        'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser/ponsel Anda, atau gunakan opsi unggah foto.'
      );
      setScannerStarted(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !scannedResult) {
      const timer = setTimeout(() => {
        startCamera();
      }, 250);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab, scannedResult]);

  const handleSwitchCamera = async () => {
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
      const html5QrCode = new Html5Qrcode('file-scanner-temp-viewport', {
        formatsToSupport,
        verbose: false,
      });

      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      if (decodedText) {
        handleScanSuccess(decodedText);
      } else {
        setErrorMessage('QR Code / Barcode tidak terdeteksi pada gambar kartu. Pastikan gambar jelas dan tidak buram.');
      }
    } catch (err: any) {
      console.warn('File scan error:', err);
      setErrorMessage(
        'Gagal membaca QR Code dari foto ini. Pastikan sudut foto tegak lurus, pencahayaan cukup, dan kode terlihat jelas.'
      );
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApply = () => {
    const finalCode = (editedResult || scannedResult || '').trim();
    if (!finalCode) return;
    onSelectCode(finalCode);
    handleClose();
  };

  const handleResetScan = () => {
    setScannedResult(null);
    setEditedResult('');
    setErrorMessage(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  const handleClose = () => {
    stopScanner();
    setScannedResult(null);
    setEditedResult('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      subtitle={subtitle}
      maxWidth="lg"
    >
      <div className="space-y-4 py-1">
        {/* If scanned result is detected */}
        {scannedResult ? (
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Kode Kartu Berhasil Terdeteksi!</h4>
                <p className="text-xs text-slate-400">
                  Data QR / Barcode dari kartu fisik siap digunakan untuk login anggota.
                </p>
              </div>
            </div>

            {/* Detected Code Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold block">
                Hasil Pembacaan Kartu (Dapat diedit jika perlu):
              </span>
              <input
                type="text"
                value={editedResult}
                onChange={(e) => setEditedResult(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/60 rounded-xl font-mono text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-500">
                Target kolom: <strong className="text-slate-300">{targetLabel}</strong>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetScan}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Pindai Ulang</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                <span>Gunakan Kode Ini</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Scanner View (Camera vs File) */
          <div className="space-y-4">
            {/* Tab Switcher: Kamera Langsung vs Unggah Foto Kartu */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('camera');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Kamera Langsung</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('file');
                  stopScanner();
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'file'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Foto dari Galeri</span>
              </button>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === 'camera' ? (
              <div className="space-y-3">
                {/* Camera Viewport */}
                <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-800 aspect-square max-w-[340px] mx-auto shadow-2xl flex items-center justify-center">
                  <div id={scannerContainerId} className="w-full h-full"></div>

                  {/* Target Guide Reticle */}
                  {scannerStarted && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-56 h-56 border-2 border-amber-400/80 rounded-2xl relative">
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400"></div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400"></div>
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400"></div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400"></div>
                        {/* Laser scanline animation */}
                        <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-[bounce_2.5s_infinite]"></div>
                      </div>
                    </div>
                  )}

                  {!scannerStarted && !errorMessage && (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                      <p className="text-xs">Menyiapkan kamera pemindai...</p>
                    </div>
                  )}
                </div>

                {/* Camera Controls Bar */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {availableCameras.length > 1 && (
                    <button
                      type="button"
                      onClick={handleSwitchCamera}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Ganti Kamera Belakang / Depan"
                    >
                      <FlipHorizontal className="w-4 h-4 text-amber-400" />
                      <span>Ganti Kamera</span>
                    </button>
                  )}

                  {hasTorch && (
                    <button
                      type="button"
                      onClick={handleToggleTorch}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        torchOn
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>{torchOn ? 'Matikan Senter' : 'Nyalakan Senter'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* FILE UPLOAD MODE */
              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 hover:border-amber-400 transition text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center mx-auto">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Unggah Foto Kartu Anggota / Kartu Sekolah</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Pilih foto kartu yang memuat QR Code atau Barcode dari galeri HP atau komputer.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingFile}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isProcessingFile ? 'Menganalisis Foto...' : 'Pilih Foto Kartu'}</span>
                </button>

                {/* Hidden container for image scan worker */}
                <div id="file-scanner-temp-viewport" className="hidden"></div>
              </div>
            )}

            {/* Instruction Tip */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Contoh Penggunaan:</strong> Pindai QR Code pada Kartu Pelajar, Kartu OSIS, KTP, Kartu Siswa, atau Kartu Perpustakaan atlet agar kode kartu tersebut langsung menjadi kunci login resmi di aplikasi.
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
