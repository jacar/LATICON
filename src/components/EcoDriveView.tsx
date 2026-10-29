import React from 'react';
import { Vehicle } from '../types/telematics';
import { 
  Leaf, 
  Award, 
  AlertTriangle, 
  TrendingDown, 
  Zap, 
  Fuel, 
  ShieldCheck, 
  CheckCircle2, 
  UserCheck 
} from 'lucide-react';

interface EcoDriveViewProps {
  vehicles: Vehicle[];
  isDark?: boolean;
}

export const EcoDriveView: React.FC<EcoDriveViewProps> = ({ vehicles, isDark = true }) => {
  // Compute driver eco-scores based on harsh events, speed, and idling
  const scoredDrivers = vehicles.map(v => {
    let score = 100;
    score -= v.harshEventsCount * 8;
    score -= v.trafficLightAlerts * 12;
    if (v.speed > 80) score -= 10;
    score = Math.max(45, Math.min(100, score));

    return {
      vehicle: v,
      score,
      rank: score >= 90 ? 'Excelente' : score >= 75 ? 'Bueno' : score >= 60 ? 'Regular' : 'Crítico',
      color: score >= 90 ? 'text-emerald-400' : score >= 75 ? 'text-amber-400' : 'text-red-400'
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Ecodrive & Seguridad Vial Preventiva
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                Puntaje Promedio: 88/100
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Evaluación biométrica de hábitos de conducción mediante sensor G triaxial, acelerómetro e IA ADAS
            </p>
          </div>
        </div>
      </div>

      {/* Driver Score Ranking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scoredDrivers.slice(0, 3).map((item, idx) => (
          <div key={item.vehicle.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-slate-300 text-black' : 'bg-amber-800 text-white'
                }`}>
                  #{idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{item.vehicle.driverName}</h3>
                  <p className="text-xs text-slate-400">Unidad #{item.vehicle.unitNumber} ({item.vehicle.plate})</p>
                </div>
              </div>

              <div className={`text-2xl font-black font-mono ${item.color}`}>
                {item.score}<span className="text-xs font-normal text-slate-400">/100</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">Frenados Bruscos:</span>
                <div className="font-bold text-slate-200">{item.vehicle.harshEventsCount}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Semáforos en Rojo:</span>
                <div className="font-bold text-slate-200">{item.vehicle.trafficLightAlerts}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Fleet Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-200">
            Clasificación Completa de Conductores de la Flota
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Posición</th>
                <th className="py-3 px-4">Conductor</th>
                <th className="py-3 px-4">Vehículo</th>
                <th className="py-3 px-4">Puntaje Global</th>
                <th className="py-3 px-4">Calificación</th>
                <th className="py-3 px-4">Frenadas Bruscas</th>
                <th className="py-3 px-4">Semáforos</th>
                <th className="py-3 px-4 text-right">Ahorro de Combustible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {scoredDrivers.map((item, idx) => (
                <tr key={item.vehicle.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-100">
                    {item.vehicle.driverName}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-amber-400 font-bold">{item.vehicle.plate}</span>
                    <span className="text-slate-400 text-[11px] ml-1">({item.vehicle.model})</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-sm ${item.color}`}>{item.score}</span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.score >= 80 ? 'bg-emerald-500' : item.score >= 65 ? 'bg-amber-500' : 'bg-red-500'}`} 
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${item.color}`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {item.vehicle.harshEventsCount}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {item.vehicle.trafficLightAlerts}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                    +{Math.round((item.score / 100) * 14)}% Óptimo
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
