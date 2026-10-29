import React, { useState } from 'react';
import { TelemetryEvent, Vehicle } from '../types/telematics';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Video, 
  Download, 
  FileText, 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  Calendar,
  X,
  Gauge
} from 'lucide-react';
import { exportEventsToCSV, printTelemetryPDFReport } from '../services/exportService';

interface EventsViewProps {
  events: TelemetryEvent[];
  vehicles: Vehicle[];
  onSelectVehicleByPlate: (plate: string) => void;
  isDark?: boolean;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  vehicles,
  onSelectVehicleByPlate,
  isDark = true
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideoClipEvent, setSelectedVideoClipEvent] = useState<TelemetryEvent | null>(null);

  const filteredEvents = events.filter(e => {
    const matchesSearch = 
      e.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = 
      filterType === 'all' ? true :
      filterType === 'traffic_light' ? e.type === 'traffic_light' :
      filterType === 'harsh' ? (e.type === 'harsh_braking' || e.type === 'harsh_accel') :
      filterType === 'dsm' ? (e.type === 'dsm_fatigue' || e.type === 'dsm_phone') :
      e.type === filterType;

    const matchesSeverity = filterSeverity === 'all' ? true : e.severity === filterSeverity;

    return matchesSearch && matchesType && matchesSeverity;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Registro de Eventos Telemétricos & Movimientos Bruscos
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-mono">
                {events.length} Alertas
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Prioridad en infracciones de semáforos, frenados bruscos, aceleraciones, fatiga DSM y clips MDVR asociados
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportEventsToCSV(filteredEvents)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              const activeVeh = vehicles[0];
              printTelemetryPDFReport(activeVeh, events);
            }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
          >
            <FileText className="w-4 h-4" />
            <span>Generar Reporte PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, dirección, conductor o evento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === 'all' ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => setFilterType('traffic_light')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition ${
              filterType === 'traffic_light' ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Semáforos / Cruces</span>
          </button>

          <button
            onClick={() => setFilterType('harsh')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition ${
              filterType === 'harsh' ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>Movimientos Bruscos (Sensor G)</span>
          </button>

          <button
            onClick={() => setFilterType('dsm')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition ${
              filterType === 'dsm' ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
            <span>DSM (Fatiga / Distracción)</span>
          </button>
        </div>

        {/* Severity Filter */}
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:border-amber-500"
        >
          <option value="all">Todas las Severidades</option>
          <option value="critical">Crítica</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4">Vehículo</th>
                <th className="py-3 px-4">Tipo de Evento</th>
                <th className="py-3 px-4">Detalle / Ubicación</th>
                <th className="py-3 px-4">Severidad</th>
                <th className="py-3 px-4">Velocidad</th>
                <th className="py-3 px-4 text-right">Grabación MDVR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    <span>Sin eventos registrados bajo los filtros seleccionados.</span>
                  </td>
                </tr>
              ) : (
                filteredEvents.map(evt => {
                  const severityBadge = 
                    evt.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    evt.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    evt.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-sky-500/20 text-sky-400 border-sky-500/30';

                  return (
                    <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {evt.timestamp}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectVehicleByPlate(evt.plate)}
                          className="font-bold text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <span>{evt.plate}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-100">
                        {evt.title}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-300 leading-tight">{evt.description}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">{evt.address}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${severityBadge}`}>
                          {evt.severity}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                        {evt.speed} km/h
                      </td>

                      <td className="py-3 px-4 text-right">
                        {evt.hasVideoClip ? (
                          <button
                            onClick={() => setSelectedVideoClipEvent(evt)}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
                          >
                            <Play className="w-3 h-3 fill-amber-400" />
                            <span>Clip {evt.clipDurationSec || 20}s</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No disponible</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Video Clip Player Modal */}
      {selectedVideoClipEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Clip Grabado por MDVR: {selectedVideoClipEvent.title}</h3>
                  <p className="text-xs text-slate-400">Unidad {selectedVideoClipEvent.plate} · {selectedVideoClipEvent.timestamp}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVideoClipEvent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              {/* Simulated playback canvas */}
              <div className="text-center font-mono space-y-2">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin mx-auto"></div>
                <div className="text-xs text-amber-300 font-bold">REPRODUCIENDO BUFFER JT1078 (20s)</div>
                <div className="text-[11px] text-slate-400">Telemetría Sensor G: Desaceleración registrada -4.8 m/s²</div>
              </div>

              {/* OSD Watermark */}
              <div className="absolute top-3 left-3 font-mono text-[11px] text-white/90 bg-black/60 px-2 py-1 rounded">
                <div>RF IMPORT C.A · CH1 ADAS</div>
                <div>{selectedVideoClipEvent.timestamp} · {selectedVideoClipEvent.speed} KM/H</div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">{selectedVideoClipEvent.address}</span>
              <button
                onClick={() => {
                  alert('Video clip descargado en formato MP4 compatible con telemetría H.265.');
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Descargar MP4</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
