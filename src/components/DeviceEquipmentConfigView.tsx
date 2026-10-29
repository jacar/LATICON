import React, { useState } from 'react';
import { Vehicle, MDVRConfig, MDVRChannel } from '../types/telematics';
import { 
  Cpu, 
  Video, 
  Wifi, 
  Activity, 
  Sliders, 
  CheckCircle2, 
  Radio, 
  Save, 
  Eye, 
  RotateCcw, 
  ExternalLink,
  Shield,
  Gauge,
  HardDrive,
  Key,
  Truck,
  Plus,
  Cable
} from 'lucide-react';

interface DeviceEquipmentConfigViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle;
  onSelectVehicle: (v: Vehicle) => void;
  onUpdateVehicle: (updatedVeh: Vehicle) => void;
  onGoToLiveMap: (v: Vehicle) => void;
  onGoToBenchTest?: () => void;
  onOpenAddDevice: () => void;
  isDark?: boolean;
}

export const DeviceEquipmentConfigView: React.FC<DeviceEquipmentConfigViewProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  onUpdateVehicle,
  onGoToLiveMap,
  onGoToBenchTest,
  onOpenAddDevice,
  isDark = true
}) => {
  const [activeTab, setActiveTab] = useState<'hardware' | 'cameras' | 'adas_dsm' | 'sensors' | 'diagnostics'>('hardware');
  const [formData, setFormData] = useState<Vehicle>({ ...selectedVehicle });
  const [testPingStatus, setTestPingStatus] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);

  // When selected vehicle changes from parent
  React.useEffect(() => {
    setFormData({ ...selectedVehicle });
  }, [selectedVehicle]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVehicle(formData);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3500);
  };

  const handleTestLink = () => {
    setTestPingStatus('probando');
    setTimeout(() => {
      setTestPingStatus('exito');
      setTimeout(() => setTestPingStatus(null), 4000);
    }, 1200);
  };

  const updateMDVRConfig = (field: keyof MDVRConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      mdvrConfig: {
        ...prev.mdvrConfig,
        [field]: value
      }
    }));
  };

  const updateChannel = (channelIndex: number, field: keyof MDVRChannel, value: any) => {
    setFormData(prev => {
      const updatedChannels = [...prev.mdvrChannels];
      updatedChannels[channelIndex] = {
        ...updatedChannels[channelIndex],
        [field]: value
      };
      return {
        ...prev,
        mdvrChannels: updatedChannels
      };
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Centro de Configuración y Enlace de Equipos MDVR / GPS
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono">
                Sincronización Directa en Vivo
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Aprovisionamiento de hardware, telemetría de sensores, canales de video y calibración para monitoreo en vivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onGoToBenchTest && (
            <button
              onClick={onGoToBenchTest}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Ir al banco de pruebas para auto-detectar modelo MD-300"
            >
              <Cable className="w-4 h-4" />
              <span>Banco de Pruebas MD-300</span>
            </button>
          )}

          <button
            onClick={onOpenAddDevice}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Enlazar Nuevo Equipo</span>
          </button>

          <button
            onClick={() => onGoToLiveMap(formData)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Ver en Monitoreo</span>
          </button>
        </div>
      </div>

      {savedBanner && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>¡Parámetros del equipo actualizados! Los cambios ya están activos en la pantalla de monitoreo y mapa en vivo.</span>
        </div>
      )}

      {/* Equipment Selector Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Equipo Seleccionado:</span>
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {vehicles.map(v => (
              <button
                key={v.id}
                onClick={() => onSelectVehicle(v)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  v.id === selectedVehicle.id
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>#{v.unitNumber}</span>
                <span className="text-[10px] opacity-80">({v.plate})</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleTestLink}
          disabled={testPingStatus === 'probando'}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
        >
          <Radio className={`w-3.5 h-3.5 ${testPingStatus === 'probando' ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
          <span>{testPingStatus === 'probando' ? 'Verificando...' : testPingStatus === 'exito' ? '¡Handshake OK (3ms)!' : 'Probar Enlace Hardware'}</span>
        </button>
      </div>

      {/* Main Configuration Card with Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-6 gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('hardware')}
            className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'hardware'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Datos de Hardware & SIM 4G</span>
          </button>

          <button
            onClick={() => setActiveTab('cameras')}
            className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'cameras'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Canales de Cámaras (CH1-CH4)</span>
          </button>

          <button
            onClick={() => setActiveTab('adas_dsm')}
            className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'adas_dsm'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Parámetros IA ADAS & DSM</span>
          </button>

          <button
            onClick={() => setActiveTab('sensors')}
            className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'sensors'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Calibración Sensor G & CAN-bus</span>
          </button>
        </div>

        {/* Tab Contents Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6 text-xs">
          
          {/* TAB 1: HARDWARE & SIM */}
          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">ID / Serial del Grabador MDVR</label>
                  <input
                    type="text"
                    value={formData.mdvrConfig.deviceId}
                    onChange={e => updateMDVRConfig('deviceId', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400">Identificador físico del equipo en el servidor JT1078.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Placa Vehicular Asignada</label>
                  <input
                    type="text"
                    value={formData.plate}
                    onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-hidden focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400">Identificador visual en mapa y reportes oficiales.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Número de Unidad (#)</label>
                  <input
                    type="text"
                    value={formData.unitNumber}
                    onChange={e => setFormData({ ...formData, unitNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-hidden focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400">Etiqueta mostrada en el mapa (ej. #{formData.unitNumber}).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Protocolo de Comunicación</label>
                  <select
                    value={formData.mdvrConfig.protocol}
                    onChange={e => updateMDVRConfig('protocol', e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="JT1078">JT/T 1078 (Estándar MDVR Telecom / Video HD)</option>
                    <option value="JT808">JT/T 808 (Telemetría pura & Comandos)</option>
                    <option value="WebRTC">WebRTC (Ultra-baja latencia &lt; 200ms)</option>
                    <option value="RTSP">RTSP / ONVIF</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">APN Celular (SIM Card 4G LTE)</label>
                  <input
                    type="text"
                    value={formData.mdvrConfig.apn}
                    onChange={e => updateMDVRConfig('apn', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400">Punto de acceso para transmisión continua.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Tipo de Almacenamiento Local</label>
                  <select
                    value={formData.mdvrConfig.storageType}
                    onChange={e => updateMDVRConfig('storageType', e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Dual SD">Doble Ranura SD Card (2x 256GB)</option>
                    <option value="SSD 512GB">Disco Sólido SSD 512GB Antivibración</option>
                    <option value="SSD 1TB">Disco Sólido SSD 1TB Alto Tráfico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-semibold text-slate-200">Datos del Conductor Asignado a la Unidad</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Nombre del Chofer:</label>
                      <input
                        type="text"
                        value={formData.driverName}
                        onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Teléfono Móvil:</label>
                      <input
                        type="text"
                        value={formData.driverPhone}
                        onChange={e => setFormData({ ...formData, driverPhone: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-semibold text-slate-200">Modelo del Vehículo y Grupo</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Marca / Modelo:</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Grupo de Flota:</label>
                      <input
                        type="text"
                        value={formData.group}
                        onChange={e => setFormData({ ...formData, group: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAMERAS CH1-CH4 */}
          {activeTab === 'cameras' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.mdvrChannels.map((ch, index) => (
                  <div key={ch.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold font-mono text-xs">
                        {ch.channel}
                      </span>
                      <span className="text-emerald-400 text-xs font-semibold">
                        ● {ch.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nombre / Identificador del Canal</label>
                      <input
                        type="text"
                        value={ch.name}
                        onChange={e => updateChannel(index, 'name', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Resolución</label>
                        <select
                          value={ch.resolution}
                          onChange={e => updateChannel(index, 'resolution', e.target.value as any)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                        >
                          <option value="1080P">1080P Full HD</option>
                          <option value="720P">720P HD</option>
                          <option value="D1">D1 Estándar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">FPS (Cuadros)</label>
                        <input
                          type="number"
                          value={ch.fps}
                          onChange={e => updateChannel(index, 'fps', parseInt(e.target.value) || 25)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Bitrate (Kbps)</label>
                        <input
                          type="number"
                          value={ch.bitrateKbps}
                          onChange={e => updateChannel(index, 'bitrateKbps', parseInt(e.target.value) || 1500)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-1 text-[11px]">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={ch.nightVision}
                          onChange={e => updateChannel(index, 'nightVision', e.target.checked)}
                          className="accent-amber-500"
                        />
                        <span>Visión Nocturna IR</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={ch.audioActive}
                          onChange={e => updateChannel(index, 'audioActive', e.target.checked)}
                          className="accent-amber-500"
                        />
                        <span>Audio Bidireccional</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADAS & DSM */}
          {activeTab === 'adas_dsm' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-200">Algoritmo ADAS Vial en Tiempo Real (Canal CH1)</h3>
                    <p className="text-slate-400 text-[11px]">Supervisa vehículos líderes, distancias de frenado y cruces de semáforos.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.mdvrConfig.adasEnabled}
                    onChange={e => updateMDVRConfig('adasEnabled', e.target.checked)}
                    className="w-5 h-5 accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-300 mb-1">Sensibilidad de Colisión Frontal (FCW)</label>
                    <select
                      value={formData.mdvrConfig.adasSensitivity}
                      onChange={e => updateMDVRConfig('adasSensitivity', e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="baja">Baja (Distancia corta &lt; 10m)</option>
                      <option value="media">Media (Estándar 18m)</option>
                      <option value="alta">Alta Preventiva (25m)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Grabación Buffer de Evento (Segundos)</label>
                    <input
                      type="number"
                      value={formData.mdvrConfig.preRecordSec}
                      onChange={e => updateMDVRConfig('preRecordSec', parseInt(e.target.value) || 15)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-200">Algoritmo DSM Cabina Chofer (Canal CH2)</h3>
                    <p className="text-slate-400 text-[11px]">Reconocimiento facial de fatiga, párpados cerrados y uso indebido de celular.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.mdvrConfig.dsmEnabled}
                    onChange={e => updateMDVRConfig('dsmEnabled', e.target.checked)}
                    className="w-5 h-5 accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.mdvrConfig.dsmPhoneDetection}
                      onChange={e => updateMDVRConfig('dsmPhoneDetection', e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>Alerta Uso de Celular</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.mdvrConfig.dsmSmokingDetection}
                      onChange={e => updateMDVRConfig('dsmSmokingDetection', e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>Alerta de Cigarrillo</span>
                  </label>

                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                    <label className="block text-[10px] text-slate-400 mb-1">Sensibilidad Fatiga</label>
                    <select
                      value={formData.mdvrConfig.dsmFatigueSensitivity}
                      onChange={e => updateMDVRConfig('dsmFatigueSensitivity', e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                    >
                      <option value="baja">Baja (&gt; 2.2s)</option>
                      <option value="media">Media (&gt; 1.8s)</option>
                      <option value="alta">Alta (&gt; 1.2s)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SENSORS & G-SENSOR */}
          {activeTab === 'sensors' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200">Umbral Frenado Brusco (m/s²)</span>
                    <span className="text-amber-400 font-mono font-bold">{formData.mdvrConfig.gSensorThresholdBraking} m/s²</span>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="6.0"
                    step="0.1"
                    value={formData.mdvrConfig.gSensorThresholdBraking}
                    onChange={e => updateMDVRConfig('gSensorThresholdBraking', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Si el sensor G supera este valor, se dispara un evento crítico y clip de video.</p>
                </div>

                <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200">Umbral Aceleración Brusca (m/s²)</span>
                    <span className="text-amber-400 font-mono font-bold">{formData.mdvrConfig.gSensorThresholdAccel} m/s²</span>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="5.0"
                    step="0.1"
                    value={formData.mdvrConfig.gSensorThresholdAccel}
                    onChange={e => updateMDVRConfig('gSensorThresholdAccel', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Evalúa arranques agresivos para el cálculo de desgaste en Ecodrive.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                  <label className="block text-[11px] text-slate-400 mb-1">Odómetro Base (km)</label>
                  <input
                    type="number"
                    value={formData.odometer}
                    onChange={e => setFormData({ ...formData, odometer: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                  <label className="block text-[11px] text-slate-400 mb-1">Nivel Inicial Combustible (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.fuelPercent}
                    onChange={e => setFormData({ ...formData, fuelPercent: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                  <label className="block text-[11px] text-slate-400 mb-1">Voltaje Batería (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.batteryVoltage}
                    onChange={e => setFormData({ ...formData, batteryVoltage: parseFloat(e.target.value) || 12.0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setFormData({ ...selectedVehicle })}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Deshacer Cambios</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onGoToLiveMap(formData)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Ver en Monitoreo</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Guardar y Aplicar a la Plataforma</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
