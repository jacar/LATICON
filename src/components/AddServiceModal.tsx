import React, { useState } from 'react';
import { MaintenanceService } from '../types/telematics';
import { Wrench, X, Save } from 'lucide-react';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlate: string;
  onAddService: (s: MaintenanceService) => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  targetPlate,
  onAddService
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaintenanceService['category']>('Cambio de Aceite');
  const [dueKm, setDueKm] = useState(150000);
  const [scheduledDate, setScheduledDate] = useState('15-11-2026');
  const [cost, setCost] = useState(120);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newService: MaintenanceService = {
      id: `srv-${Date.now()}`,
      vehiclePlate: targetPlate,
      title,
      category,
      dueKm,
      currentKm: 142850,
      status: 'warning',
      scheduledDate,
      estimatedCostUsd: cost
    };

    onAddService(newService);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-white">Programar Servicio Preventivo</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Vehículo Asignado</label>
            <input
              type="text"
              disabled
              value={`Placa: ${targetPlate}`}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Título del Mantenimiento</label>
            <input
              type="text"
              required
              placeholder="Ej: Cambio de Aceite 15W40 y Filtros"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="Cambio de Aceite">Cambio de Aceite</option>
                <option value="Frenos y Pastillas">Frenos y Pastillas</option>
                <option value="Rotación de Neumáticos">Rotación Neumáticos</option>
                <option value="Calibración MDVR / Sensores">Calibración MDVR</option>
                <option value="Filtros y Bujías">Filtros y Bujías</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kilometraje Meta (km)</label>
              <input
                type="number"
                value={dueKm}
                onChange={e => setDueKm(parseInt(e.target.value) || 150000)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Servicio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
