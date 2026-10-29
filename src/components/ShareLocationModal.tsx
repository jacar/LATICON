import React, { useState } from 'react';
import { Vehicle } from '../types/telematics';
import { Share2, Copy, Check, Clock, Shield, X } from 'lucide-react';

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  isDark?: boolean;
}

export const ShareLocationModal: React.FC<ShareLocationModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  isDark = true
}) => {
  const [expiryHours, setExpiryHours] = useState('24');
  const [includeCamera, setIncludeCamera] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `https://app.rfimportca.com/track/live?token=share_${vehicle.plate}_${Date.now()}&exp=${expiryHours}h`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-white">Compartir Ubicación en Tiempo Real</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Genera un enlace público seguro y temporal para que clientes o receptores de carga sigan en vivo a la unidad <b>{vehicle.unitNumber} ({vehicle.plate})</b>.
          </p>

          <div>
            <label className="block text-slate-400 mb-1">Vigencia del Enlace:</label>
            <select
              value={expiryHours}
              onChange={e => setExpiryHours(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
            >
              <option value="1">1 Hora</option>
              <option value="6">6 Horas</option>
              <option value="24">24 Horas (Recomendado)</option>
              <option value="72">3 Días</option>
              <option value="168">7 Días</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={includeCamera}
              onChange={e => setIncludeCamera(e.target.checked)}
              className="accent-amber-500"
            />
            <span>Permitir ver streaming de cámara frontal CH1 al cliente</span>
          </label>

          <div className="space-y-1.5">
            <label className="block text-slate-400">Enlace de Rastreo Generado:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-amber-400 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl flex items-center gap-1 transition shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Listo!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
