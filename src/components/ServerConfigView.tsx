import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  Radio, 
  HardDrive, 
  ShieldCheck, 
  Zap,
  RefreshCw,
  Sliders
} from 'lucide-react';

interface ServerConfigViewProps {
  isDark?: boolean;
}

export const ServerConfigView: React.FC<ServerConfigViewProps> = ({ isDark = true }) => {
  const [jt808Port, setJt808Port] = useState(5005);
  const [jt1078Port, setJt1078Port] = useState(1078);
  const [rtmpPort, setRtmpPort] = useState(1935);
  const [httpApiPort, setHttpApiPort] = useState(3000);
  const [redisStatus, setRedisStatus] = useState('Conectado (Redis 7.2 Cluster)');
  const [dbStatus, setDbStatus] = useState('PostgreSQL 16 con PostGIS Activo');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Configuración del Servidor y Puertos Telemétricos
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                69.6.235.52 Online
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Gestión de sockets de enlace para GPS (JT808), streaming de video MDVR (JT1078) y base de datos geoespacial
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reiniciar Gateway JT1078</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configuración de red y balanceo de carga guardada exitosamente.</span>
        </div>
      )}

      {/* Architecture & Cluster Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Base de Datos Geoespacial</span>
            <Database className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-sm font-bold text-slate-100">{dbStatus}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Latencia promedio: 4.2 ms (PostGIS Indexado)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Broker de Eventos & WebSockets</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-slate-100">{redisStatus}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            1,240 mensajes telemetría/segundo procesados
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Servidor de Streaming MDVR</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-slate-100">Media Server WebRTC & JT1078</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Transcodificación H.264/H.265 por Hardware Activa
          </div>
        </div>
      </div>

      {/* Port Configuration Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-xs">
        <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          Puertos de Escucha y Conexión de Dispositivos GPS & MDVR
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Puerto GPS Telemetría JT808 (TCP/UDP)</label>
            <input
              type="number"
              value={jt808Port}
              onChange={e => setJt808Port(parseInt(e.target.value) || 5005)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400">Recibe tramas de coordenadas, sensor G, odómetro e ignición.</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Puerto Video MDVR JT1078 (TCP)</label>
            <input
              type="number"
              value={jt1078Port}
              onChange={e => setJt1078Port(parseInt(e.target.value) || 1078)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400">Canal directo para streams en vivo de cámaras telemétricas CH1 a CH4.</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Puerto RTMP Stream Ingest</label>
            <input
              type="number"
              value={rtmpPort}
              onChange={e => setRtmpPort(parseInt(e.target.value) || 1935)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400">Ingesta de video para cámaras Dashcam y CCTV complementarias.</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Puerto REST API Gateway & WebSockets</label>
            <input
              type="number"
              value={httpApiPort}
              onChange={e => setHttpApiPort(parseInt(e.target.value) || 3000)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400">Interfaz de conexión segura para frontend React y aplicaciones móviles.</p>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 transition"
          >
            Guardar Configuración del Servidor
          </button>
        </div>
      </form>
    </div>
  );
};
