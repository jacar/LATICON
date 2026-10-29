import React, { useState } from 'react';
import { Vehicle, TelemetryEvent } from '../types/telematics';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Gauge, 
  Fuel, 
  Clock, 
  ShieldAlert, 
  Printer, 
  BarChart2 
} from 'lucide-react';
import { exportVehiclesToCSV, printTelemetryPDFReport } from '../services/exportService';

interface ReportsViewProps {
  vehicles: Vehicle[];
  events: TelemetryEvent[];
  isDark?: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  vehicles,
  events,
  isDark = true
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [reportType, setReportType] = useState<'mileage' | 'harsh' | 'fuel' | 'traffic_lights'>('mileage');
  const [dateRange, setDateRange] = useState('today');

  const activeVehicles = selectedVehicleId === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.id === selectedVehicleId);

  const totalKm = activeVehicles.reduce((acc, v) => acc + v.tripDistance, 0);
  const totalHarsh = activeVehicles.reduce((acc, v) => acc + v.harshEventsCount, 0);
  const totalTrafficLights = activeVehicles.reduce((acc, v) => acc + v.trafficLightAlerts, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Centro de Informes & Reportes Telemétricos</h1>
            <p className="text-xs text-slate-400">
              Generación de informes de kilometraje, semáforos, telemetría de cámaras MDVR, exportables en PDF y CSV
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportVehiclesToCSV(activeVehicles)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Descargar CSV</span>
          </button>

          <button
            onClick={() => {
              const target = activeVehicles[0] || vehicles[0];
              printTelemetryPDFReport(target, events);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Exportar Informe PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-semibold">Unidad / Vehículo:</label>
          <select
            value={selectedVehicleId}
            onChange={e => setSelectedVehicleId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Todas las Unidades (Flota Completa)</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                #{v.unitNumber} - {v.plate} ({v.model})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-semibold">Periodo:</label>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="today">Hoy (28 de Octubre 2026)</option>
            <option value="yesterday">Ayer</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Este Mes</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {(['mileage', 'harsh', 'traffic_lights', 'fuel'] as const).map(type => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                reportType === type ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type === 'mileage' && 'Kilometraje'}
              {type === 'harsh' && 'Frenados Bruscos'}
              {type === 'traffic_lights' && 'Semáforos'}
              {type === 'fuel' && 'Combustible'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Kilómetros Recorridos</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {totalKm.toFixed(1)} <span className="text-sm font-normal text-slate-400">km</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Registrado por GPS y odómetro CAN-bus</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Frenados Bruscos (Sensor G)</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {totalHarsh} <span className="text-sm font-normal text-slate-400">eventos</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Deceleración &gt; 3.2 m/s²</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Infracciones de Semáforo</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-2">
            {totalTrafficLights} <span className="text-sm font-normal text-slate-400">cruces</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Detectados con IA ADAS en CH1</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Horas de Ralentí / Espera</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            18.5 <span className="text-sm font-normal text-slate-400">horas</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Motor encendido sin movimiento</div>
        </div>
      </div>

      {/* Main Table for the Selected Report */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200">
            Detalle por Dispositivo y Sensor Telemétrico
          </h2>
          <span className="text-xs text-amber-400 font-mono font-semibold">
            {activeVehicles.length} Unidades en Reporte
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Unidad</th>
                <th className="py-3 px-4">Placa & Modelo</th>
                <th className="py-3 px-4">Conductor</th>
                <th className="py-3 px-4">Distancia Hoy</th>
                <th className="py-3 px-4">Odómetro Total</th>
                <th className="py-3 px-4">Frenados Bruscos</th>
                <th className="py-3 px-4">Semáforos</th>
                <th className="py-3 px-4">Combustible</th>
                <th className="py-3 px-4 text-right">Cámaras MDVR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {activeVehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-amber-400 font-mono">
                    #{v.unitNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{v.plate}</div>
                    <div className="text-[11px] text-slate-400">{v.model}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div>{v.driverName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{v.driverPhone}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-100">
                    {v.tripDistance} km
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {v.odometer.toLocaleString()} km
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      v.harshEventsCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400'
                    }`}>
                      {v.harshEventsCount}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      v.trafficLightAlerts > 0 ? 'bg-red-500/20 text-red-400' : 'text-slate-400'
                    }`}>
                      {v.trafficLightAlerts}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span>{v.fuelPercent}%</span>
                      <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${v.fuelPercent}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">
                      {v.mdvrChannels.filter(c => c.status === 'streaming').length}/4 Online
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
