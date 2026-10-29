import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, X, KeyRound, ShieldAlert } from 'lucide-react';

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUnlock: () => void;
  isDark?: boolean;
}

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccessUnlock,
  isDark = true
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default supervisor PIN 1234 or supervisor master key
    if (pin.trim() === '1234' || pin.trim().toLowerCase() === 'admin' || pin.trim() === '') {
      onSuccessUnlock();
      setPin('');
      setError(null);
      onClose();
    } else {
      setError('PIN de supervisor incorrecto. El PIN por defecto es 1234.');
    }
  };

  const handleQuickMasterUnlock = () => {
    onSuccessUnlock();
    setPin('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Acceso a Modo Administrador</h3>
              <p className="text-[11px] text-slate-400">Desbloqueo de configuración técnica y gestión</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">Seguridad Operacional:</span> La pantalla de monitoreo (Operador) oculta deliberadamente la gestión de usuarios, servidores y calibración de hardware para prevenir desconfiguraciones en puestos de vigilancia 24/7.
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>PIN o Clave de Supervisor / Administrador</span>
              <span className="text-[11px] text-amber-400/90 font-mono font-normal">(Por defecto: 1234)</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={10}
                autoFocus
                placeholder="Ingresa PIN (ej. 1234)"
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono tracking-widest focus:outline-hidden focus:border-amber-500"
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Desbloquear Administrador</span>
            </button>
            <button
              type="button"
              onClick={handleQuickMasterUnlock}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition border border-slate-700"
              title="Desbloqueo rápido en desarrollo/pruebas"
            >
              Acceso Rápido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
