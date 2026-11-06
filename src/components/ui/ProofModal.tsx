import React from 'react';
import { Modal } from './Modal';
import { ExternalLink, Download, FileText } from 'lucide-react';

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title?: string;
  nomorTransaksi?: string;
}

export const ProofModal: React.FC<ProofModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Bukti Pembayaran / Transfer',
  nomorTransaksi,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={nomorTransaksi ? `No. Transaksi: ${nomorTransaksi}` : undefined}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {imageUrl ? (
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center max-h-[460px]">
            <img
              src={imageUrl}
              alt="Bukti Transfer"
              className="w-full h-auto max-h-[440px] object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-700 rounded-xl bg-slate-950/50">
            <FileText className="w-12 h-12 text-slate-500 mb-2" />
            <p className="text-slate-400 font-medium text-sm">Tidak ada lampiran gambar bukti transfer.</p>
            <p className="text-xs text-slate-500">Mungkin setoran dilakukan secara Tunai ke Kas Bendahara Cabang.</p>
          </div>
        )}

        {imageUrl && (
          <div className="flex items-center justify-between pt-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Buka Ukuran Penuh di Tab Baru
            </a>

            <a
              href={imageUrl}
              download={`bukti-${nomorTransaksi || 'iks-pi'}.jpg`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium border border-slate-600 transition"
            >
              <Download className="w-3.5 h-3.5" /> Unduh File
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
};
