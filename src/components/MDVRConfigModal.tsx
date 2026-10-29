import React, { useState } from 'react';
import { Vehicle, MDVRConfig } from '../types/telematics';
import { 
  X, 
  Save, 
  Sliders, 
  Wifi, 
  Video, 
  Eye, 
  Activity, 
  HardDrive, 
  CheckCircle2, 
  RotateCcw,
  Shield,
  Gauge
} from 'lucide-react';

interface MDVRConfigModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (updatedConfig: MDVRConfig) => void;
}

export const MDVRConfigModal: React.FC<MDVRConfigModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSaveConfig
}) => {
  const [activeTab, setActiveTab] = useState<'network' | 'video' | 'adas' | 'dsm' | 'sensors' | 'storage'>('adas');
  const [config, setConfig] = useState<MDVRConfig>({ ...vehicle.mdvrConfig });
  const [saveAlert, setSaveAlert] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(config);
    setSaveAlert(true);
    setTimeout(() => {
      setSaveAlert(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Configuración y Parámetros de Cámara MDVR
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                  {config.deviceId}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ajuste fino de telemetría, IA ADAS/DSM, compresión de video y umbrales para unidad {vehicle.unitNumber} ({vehicle.plate})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('adas')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'adas'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>IA ADAS (Vial)</span>
          </button>

          <button
            onClick={() => setActiveTab('dsm')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'dsm'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>IA DSM (Fatiga / Chofer)</span>
          </button>

          <button
            onClick={() => setActiveTab('sensors')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'sensors'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Sensor G & Movimientos</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'video'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video & Canales CH1-CH4</span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'network'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Red & Servidor JT1078</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'storage'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Almacenamiento & Eventos</span>
          </button>
        </div>

        {/* Content Area */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {saveAlert && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>¡Parámetros telemétricos guardados y sincronizados exitosamente con el MDVR vía JT808!</span>
            </div>
          )}

          {/* TAB: ADAS */}
          {activeTab === 'adas' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-200">Activar Asistencia Avanzada Vial (ADAS CH1)</div>
                  <div className="text-xs text-slate-400">Analiza en tiempo real proximidad, cambio involuntario de carril y peatones.</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.adasEnabled}
                  onChange={e => setConfig({ ...config, adasEnabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Sensibilidad Alerta Colisión Frontal (FCW)</label>
                  <select
                    value={config.adasSensitivity}
                    onChange={e => setConfig({ ...config, adasSensitivity: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="baja">Baja (Distancia corta &lt; 8 metros)</option>
                    <option value="media">Media (Estándar recomendado 15 metros)</option>
                    <option value="alta">Alta (Seguridad preventiva 25 metros)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Alerta de Invasión de Carril (LDW)</label>
                  <select
                    defaultValue="always"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="always">Activo con velocidad &gt; 40 km/h</option>
                    <option value="strict">Estricto continuo</option>
                    <option value="disabled">Deshabilitado</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-300/90 leading-relaxed">
                <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-400">
                  <Gauge className="w-4 h-4" /> Integración con Semáforos y Cruces
                </div>
                La cámara frontal detecta cambios abruptos en la iluminación de semáforos y cruces peatonales. En caso de no frenar antes del límite, se emite un pitido en cabina y se envía un clip de 15 segundos al servidor central.
              </div>
            </div>
          )}

          {/* TAB: DSM */}
          {activeTab === 'dsm' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-200">Monitor de Estado del Conductor (DSM CH2)</div>
                  <div className="text-xs text-slate-400">Detección facial de somnolencia, fatiga, celular y distracciones visuales.</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.dsmEnabled}
                  onChange={e => setConfig({ ...config, dsmEnabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Sensibilidad Detección de Fatiga (Ojos Cerrados / Bostezo)</label>
                  <select
                    value={config.dsmFatigueSensitivity}
                    onChange={e => setConfig({ ...config, dsmFatigueSensitivity: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="baja">Baja (Ojos cerrados &gt; 2.5 seg)</option>
                    <option value="media">Media (Ojos cerrados &gt; 1.8 seg)</option>
                    <option value="alta">Alta (Ojos cerrados &gt; 1.2 seg)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.dsmPhoneDetection}
                      onChange={e => setConfig({ ...config, dsmPhoneDetection: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span>Detectar Uso de Teléfono Móvil en Conducción</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.dsmSmokingDetection}
                      onChange={e => setConfig({ ...config, dsmSmokingDetection: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span>Detectar Humo de Cigarrillo en Cabina</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SENSORS & G-SENSOR */}
          {activeTab === 'sensors' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 bg-slate-800/40 border border-slate-800 rounded-xl">
                  <label className="text-xs font-bold text-slate-200 flex justify-between">
                    <span>Umbral Frenado Brusco (m/s²)</span>
                    <span className="text-amber-400 font-mono">{config.gSensorThresholdBraking} m/s²</span>
                  </label>
                  <input
                    type="range"
                    min="2.0"
                    max="6.0"
                    step="0.1"
                    value={config.gSensorThresholdBraking}
                    onChange={e => setConfig({ ...config, gSensorThresholdBraking: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-400">
                    Valores inferiores a 3.5 m/s² registran frenadas más sutiles; &gt; 4.5 m/s² solo frenados de emergencia.
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-slate-800/40 border border-slate-800 rounded-xl">
                  <label className="text-xs font-bold text-slate-200 flex justify-between">
                    <span>Umbral Aceleración Brusca (m/s²)</span>
                    <span className="text-amber-400 font-mono">{config.gSensorThresholdAccel} m/s²</span>
                  </label>
                  <input
                    type="range"
                    min="2.0"
                    max="5.0"
                    step="0.1"
                    value={config.gSensorThresholdAccel}
                    onChange={e => setConfig({ ...config, gSensorThresholdAccel: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-400">
                    Evalúa el arranque agresivo y el desgaste prematuro de neumáticos y combustible (Ecodrive).
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg text-center">
                  <div className="text-[11px] text-slate-400">Eje X (Lateral / Curvas)</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">± 0.35 G Max</div>
                </div>
                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg text-center">
                  <div className="text-[11px] text-slate-400">Eje Y (Longitudinal)</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">± 0.45 G Max</div>
                </div>
                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg text-center">
                  <div className="text-[11px] text-slate-400">Eje Z (Vuelco / Bache)</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">1.00 G Gravedad</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VIDEO & CHANNELS */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Algoritmo de Compresión</label>
                  <select
                    value={config.encoding}
                    onChange={e => setConfig({ ...config, encoding: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="H.265">H.265 / HEVC (Ahorro de 50% de datos 4G)</option>
                    <option value="H.264">H.264 / AVC (Máxima compatibilidad)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Bitrate Stream Principal (Kbps)</label>
                  <input
                    type="number"
                    value={config.mainStreamBitrate}
                    onChange={e => setConfig({ ...config, mainStreamBitrate: parseInt(e.target.value) || 2048 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Bitrate Sub-Stream Móvil (Kbps)</label>
                  <input
                    type="number"
                    value={config.subStreamBitrate}
                    onChange={e => setConfig({ ...config, subStreamBitrate: parseInt(e.target.value) || 512 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-950 p-3 text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Asignación de Canales Físicos MDVR</span>
                  <span className="text-[11px] text-amber-400">4 Canales AHD / IPC Conectados</span>
                </div>
                <div className="divide-y divide-slate-800 text-xs">
                  {vehicle.mdvrChannels.map(ch => (
                    <div key={ch.id} className="p-3 flex items-center justify-between bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 font-bold text-amber-400 text-[11px]">
                          {ch.channel}
                        </span>
                        <span className="font-medium text-slate-200">{ch.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400">
                        <span>{ch.resolution}</span>
                        <span>{ch.fps} FPS</span>
                        <span className="text-emerald-400 font-semibold">{ch.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: NETWORK */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Dirección IP Servidor Telemetría / Video</label>
                  <input
                    type="text"
                    value={config.ipAddress}
                    onChange={e => setConfig({ ...config, ipAddress: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Puerto de Streaming JT1078</label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={e => setConfig({ ...config, port: parseInt(e.target.value) || 1078 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Protocolo de Transmisión</label>
                  <select
                    value={config.protocol}
                    onChange={e => setConfig({ ...config, protocol: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="JT1078">JT/T 1078 (Estándar MDVR Telecom / Audio Bidireccional)</option>
                    <option value="JT808">JT/T 808 (Telemetría pura & Comandos)</option>
                    <option value="WebRTC">WebRTC (Ultra-baja latencia &lt; 200ms)</option>
                    <option value="RTMP">RTMP Directo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">APN Celular (SIM Card 4G)</label>
                  <input
                    type="text"
                    value={config.apn}
                    onChange={e => setConfig({ ...config, apn: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: STORAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Pre-Grabación de Alarma (Segundos)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={config.preRecordSec}
                    onChange={e => setConfig({ ...config, preRecordSec: parseInt(e.target.value) || 15 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                  <div className="text-[11px] text-slate-400">Guarda en memoria buffer los segundos previos al impacto o evento.</div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Post-Grabación de Alarma (Segundos)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={config.postRecordSec}
                    onChange={e => setConfig({ ...config, postRecordSec: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                  <div className="text-[11px] text-slate-400">Tiempo de grabación de video tras dispararse la alarma.</div>
                </div>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Tipo de Almacenamiento Primario</div>
                  <div className="text-xs text-slate-400 mt-0.5">{config.storageType} - {config.storageUsedPercent}% utilizado</div>
                </div>
                <div className="w-32 bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${config.storageUsedPercent > 85 ? 'bg-red-500' : 'bg-amber-500'}`} 
                    style={{ width: `${config.storageUsedPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setConfig({ ...vehicle.mdvrConfig })}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Parámetros MDVR</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
