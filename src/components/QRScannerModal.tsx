import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScan, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear().then(() => {
          onScan(decodedText);
        }).catch(error => {
          console.error("Failed to clear scanner", error);
          onScan(decodedText);
        });
      },
      (errorMessage) => {
        // Just a scan error, usually safe to ignore
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner on unmount", error);
      });
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0A192F]/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-md shadow-2xl p-8 rounded-none border-t-4 border-[#FF6B00]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Camera className="text-[#0A192F]" size={24} />
            <h3 className="text-xl font-black text-[#0A192F] uppercase tracking-tight">Escanear QR Code</h3>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#0A192F]">
            <X size={24} />
          </button>
        </div>

        <div className="relative bg-slate-100 border-2 border-[#E5E7EB] overflow-hidden">
          <div id="reader" className="w-full"></div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest leading-relaxed">
            Aponte a câmera para a etiqueta do equipamento para acessar o histórico instantaneamente.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 border-2 border-[#E5E7EB] text-[#4B5563] font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default QRScannerModal;
