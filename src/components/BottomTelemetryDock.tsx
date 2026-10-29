import React, { useState } from 'react';
import { Vehicle, MaintenanceService } from '../types/telematics';
import { 
  Navigation, 
  Eye, 
  Clock, 
  MapPin, 
  Activity, 
  Wrench, 
  Plus, 
  MoreVertical, 
  Video, 
  Fuel, 
  BatteryCharging, 
  Gauge, 
  ChevronUp, 
  ChevronDown,
  ShieldAlert
} from 'lucide-react';

interface BottomTelemetryDockProps {
  vehicle: Vehicle;
  services: MaintenanceService[];
  onOpenMDVR: (v: Vehicle) => void;
  onOpenAddService: (vehiclePlate: string) => void;
  onCenterMap: () => void;
  userRole?: 'admin' | 'operator';
  isDark?: boolean;
}

export const BottomTelemetryDock: React.FC<BottomTelemetryDockProps> = ({
  vehicle,
  services,
  onOpenMDVR,
  onOpenAddService,
  onCenterMap,
  userRole = 'admin',
  isDark = true
}) => {
  // Colapsado por defecto para dar máximo protagonismo y visibilidad al mapa
  const [isCollapsed, setIsCollapsed] = useState(true);

  const vehicleServices = services.filter(s => s.vehiclePlate === vehicle.plate);

  const statusLabel = 
    vehicle.status === 'moving' ? 'En movimiento' :
    vehicle.status === 'idle' ? 'En espera' :
    vehicle.status === 'alert' ? 'En Alarma' : 'Detenido';

  const statusColorClass = 
    vehicle.status === 'moving' ? 'text-emerald-400' :
    vehicle.status === 'idle' ? 'text-amber-400' :
    vehicle.status === 'alert' ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none flex flex-col items-end">
      <div className="pointer-events-auto w-full flex flex-col items-end">
        {/* Toggle Collapse bar - Barra minimalista en blanco */}
        <div className="flex items-center gap-2 mb-1">
          {isCollapsed && (
            <div 
              onClick={() => setIsCollapsed(false)}
              className="cursor-pointer bg-white/95 backdrop-blur-md text-[#111111] px-4 py-2 rounded-xl border border-slate-200 shadow-xl text-xs flex items-center gap-3 transition hover:border-[#F58220]/50 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F58220] animate-pulse"></span>
                <span className="font-bold text-[#F58220]">#{vehicle.unitNumber}</span>
                <span className="text-[#6C757D] font-mono">({vehicle.plate})</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-slate-600">
                <span>Velocidad: <strong className="text-[#111111]">{vehicle.speed ?? 0} km/h</strong></span>
                <span>• Batería: <strong className="text-[#111111]">{vehicle.batteryVoltage ?? 12.8}V</strong></span>
                <span>• Combustible: <strong className="text-[#111111]">{vehicle.fuelPercent ?? 0}%</strong></span>
              </div>
              <span className="text-[#F58220] text-[11px] font-bold flex items-center gap-1 pl-2 border-l border-slate-200">
                Abrir Telemetría <ChevronUp className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="bg-white text-slate-700 hover:text-[#111111] px-3.5 py-1.5 rounded-t-xl border border-b-0 border-slate-200 text-xs flex items-center gap-1.5 shadow-xl transition hover:bg-slate-50 font-semibold"
            >
              <span>Minimizar Telemetría #{vehicle.unitNumber}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#F58220]" />
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/98 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-2xl text-[#111111]">
            {/* Card 1: Device Summary */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#F58220] transform rotate-45" />
                    <span className="font-bold text-sm text-[#111111]">{vehicle.unitNumber}</span>
                    <span className={`text-xs font-semibold flex items-center gap-1 ${statusColorClass}`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {statusLabel}
                    </span>
                    {vehicle.isRealHardware && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        GNSS REAL
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={onCenterMap}
                    className="p-1 hover:bg-slate-200/60 rounded text-slate-500 hover:text-[#111111] transition"
                    title="Centrar en el mapa"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Ubicación Actual: </span>
                    <span className="text-slate-800 font-normal leading-tight">{vehicle.address}</span>
                  </div>
                  {vehicle.isRealHardware && (
                    <div className="text-[11px] font-mono text-emerald-700 flex items-center justify-between bg-emerald-50/60 px-2 py-0.5 rounded border border-emerald-200">
                      <span>Coordenadas Físicas:</span>
                      <span>{vehicle.lat.toFixed(6)}°, {vehicle.lng.toFixed(6)}°</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Hora:</span>
                    <span className="text-slate-800 font-mono">{vehicle.lastUpdate}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Tiempo estacionado:</span>
                    <span className="text-[#F58220] font-mono font-medium">{vehicle.parkingDuration}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Placa: <b className="text-[#111111]">{vehicle.plate}</b></span>
                <button
                  onClick={() => onOpenMDVR(vehicle)}
                  className="px-2.5 py-1 bg-[#F58220] hover:bg-[#e07316] text-white font-bold rounded-lg flex items-center gap-1 transition shadow-xs"
                >
                  <Video className="w-3 h-3" />
                  <span>Ver MDVR Live</span>
                </button>
              </div>
            </div>

            {/* Card 2: Sensores */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#F58220]" />
                  <span className="font-bold text-sm text-[#111111]">Sensores</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 font-mono font-semibold">
                  JT808 ONLINE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500">Distancia Recorrida</div>
                  <div className="font-bold text-sm text-[#111111] font-mono">{vehicle.tripDistance} Km</div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500">Velocidad Actual</div>
                  <div className="font-bold text-sm text-emerald-600 font-mono">{vehicle.speed} kph</div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500">Combustible</div>
                    <div className="font-bold text-xs text-[#F58220] font-mono">{vehicle.fuelPercent}%</div>
                  </div>
                  <Fuel className="w-4 h-4 text-[#F58220]" />
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500">Batería Principal</div>
                    <div className="font-bold text-xs text-slate-800 font-mono">{vehicle.batteryVoltage}V</div>
                  </div>
                  <BatteryCharging className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Odómetro: <b className="text-slate-800 font-mono">{vehicle.odometer.toLocaleString()} km</b></span>
                <span>Temp. Motor: <b className="text-[#F58220] font-mono">{vehicle.engineTemp}°C</b></span>
              </div>
            </div>

            {/* Card 3: Servicios */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#F58220]" />
                    <span className="font-bold text-sm text-[#111111]">Servicios</span>
                  </div>
                  <button className="p-1 hover:bg-slate-200/60 rounded text-slate-500">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {vehicleServices.length > 0 ? (
                  <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                    {vehicleServices.map(srv => (
                      <div key={srv.id} className="p-1.5 rounded-lg bg-white border border-slate-200 text-[11px] flex items-center justify-between shadow-2xs">
                        <div>
                          <div className="font-semibold text-[#111111] truncate max-w-[140px]">{srv.title}</div>
                          <div className="text-[10px] text-slate-500">Próx: {srv.dueKm.toLocaleString()} km</div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          srv.status === 'urgent' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {srv.status === 'urgent' ? 'Vencido' : 'Próximo'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    Sin servicios pendientes para esta unidad
                  </div>
                )}
              </div>

              {userRole === 'admin' ? (
                <button
                  onClick={() => onOpenAddService(vehicle.plate)}
                  className="mt-3 w-full py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Añadir servicio</span>
                </button>
              ) : (
                <div className="mt-2 text-center text-[10px] text-slate-500 py-1 bg-white rounded-lg border border-slate-200">
                  Historial de mantenimientos (Lectura Operador)
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
