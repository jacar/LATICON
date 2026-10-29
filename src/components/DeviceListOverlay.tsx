import React, { useState } from 'react';
import { Vehicle } from '../types/telematics';
import { 
  Search, 
  Plus, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Key, 
  MoreVertical, 
  Navigation, 
  Check, 
  Video,
  Minus
} from 'lucide-react';

interface DeviceListOverlayProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle;
  onSelectVehicle: (v: Vehicle) => void;
  onOpenMDVR: (v: Vehicle) => void;
  onOpenCommands: (v: Vehicle) => void;
  onOpenEquipmentConfig?: (v: Vehicle) => void;
  onAddVehicle: () => void;
  userRole?: 'admin' | 'operator';
  isDark?: boolean;
}

export const DeviceListOverlay: React.FC<DeviceListOverlayProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  onOpenMDVR,
  onOpenCommands,
  onOpenEquipmentConfig,
  onAddVehicle,
  userRole = 'admin',
  isDark = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGroupExpanded, setIsGroupExpanded] = useState(true);
  const [activeMenuVehicleId, setActiveMenuVehicleId] = useState<string | null>(null);

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.unitNumber.includes(searchTerm) ||
    v.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-20 left-4 z-20 bg-white border border-slate-200 text-[#F58220] px-3.5 py-2 rounded-xl shadow-xl hover:bg-slate-50 transition flex items-center gap-2 text-xs font-bold"
        title="Mostrar Lista de Dispositivos"
      >
        <ChevronRight className="w-4 h-4 text-[#F58220]" />
        <span>Dispositivos ({vehicles.length})</span>
      </button>
    );
  }

  return (
    <div className="absolute top-16 left-4 z-20 w-80 max-w-[90vw] max-h-[calc(100vh-17rem)] flex flex-col bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 text-slate-800">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#F58220] fill-[#F58220] transform rotate-45" />
          <h2 className="font-bold text-sm text-[#111111] tracking-wide">Dispositivos</h2>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-slate-200/60 rounded-lg text-[#6C757D] hover:text-[#111111] transition"
          title="Minimizar panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar & Action Buttons */}
      <div className="p-2.5 border-b border-slate-200 flex items-center gap-2 bg-white">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Búsqueda"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder-slate-400 focus:outline-hidden focus:border-[#F58220]"
          />
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={onAddVehicle}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
            title="Añadir nuevo dispositivo o vehículo"
          >
            <Plus className="w-4 h-4 text-[#F58220]" />
          </button>
        )}
      </div>

      {/* Group Title Row */}
      <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsGroupExpanded(!isGroupExpanded)}>
          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          </span>
          <span className="font-semibold text-slate-800">Sin grupo</span>
          <span className="bg-[#F58220] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {filteredVehicles.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsGroupExpanded(!isGroupExpanded)}
            className="p-1 hover:bg-slate-200/60 rounded text-slate-500"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-slate-200/60 rounded text-slate-500">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Vehicle List Items */}
      {isGroupExpanded && (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
          {filteredVehicles.map(v => {
            const isSelected = v.id === selectedVehicle.id;
            const statusDotColor = 
              v.status === 'moving' ? 'bg-emerald-500' :
              v.status === 'idle' ? 'bg-amber-400' :
              v.status === 'alert' ? 'bg-red-500' : 'bg-slate-400';

            return (
              <div
                key={v.id}
                onClick={() => onSelectVehicle(v)}
                className={`p-3 cursor-pointer transition flex items-center justify-between group relative ${
                  isSelected 
                    ? 'bg-[#F58220]/10 border-l-4 border-[#F58220]' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Arrow Direction Icon or Checked State */}
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-[#F58220] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div 
                      className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform" 
                      style={{ transform: `rotate(${v.heading}deg)` }}
                    >
                      <Navigation className="w-4 h-4 text-[#F58220] fill-[#F58220]/80" />
                    </div>
                  )}

                  {/* Plate & Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#111111] tracking-wide">
                        {v.plate}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{v.unitNumber}
                      </span>
                      {v.isRealHardware && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                          REAL
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#6C757D] truncate max-w-[145px]">
                      {v.lastUpdate}
                    </div>
                  </div>
                </div>

                {/* Right side: Speed badge, Key icon, Status dot, Options menu */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Speed */}
                  <span className="font-mono text-xs font-semibold text-slate-700">
                    {v.speed} kph
                  </span>

                  {/* Ignition Key Icon */}
                  {v.ignition && (
                    <span title="Ignición activada">
                      <Key className="w-3 h-3 text-[#F58220]" />
                    </span>
                  )}

                  {/* Status dot */}
                  <span className={`w-2.5 h-2.5 rounded-full ${statusDotColor} shadow-xs`}></span>

                  {/* More options button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuVehicleId(activeMenuVehicleId === v.id ? null : v.id);
                    }}
                    className="p-1 text-slate-400 hover:text-[#111111] rounded"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Dropdown Menu on Context Click */}
                {activeMenuVehicleId === v.id && (
                  <div 
                    onClick={e => e.stopPropagation()}
                    className="absolute right-2 top-10 z-40 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 w-44 text-xs text-slate-800 animate-fadeIn"
                  >
                    <button
                      onClick={() => {
                        onOpenMDVR(v);
                        setActiveMenuVehicleId(null);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center gap-2 text-[#F58220] font-semibold"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Ver Cámaras MDVR</span>
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => {
                          if (onOpenEquipmentConfig) onOpenEquipmentConfig(v);
                          setActiveMenuVehicleId(null);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center gap-2 text-slate-700"
                      >
                        <Key className="w-3.5 h-3.5 text-[#F58220]" />
                        <span>Configurar Equipo</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onOpenCommands(v);
                        setActiveMenuVehicleId(null);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center gap-2 text-slate-700"
                    >
                      <Navigation className="w-3.5 h-3.5 text-slate-400" />
                      <span>Comandos Remotos</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
