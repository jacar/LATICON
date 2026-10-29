import React, { useState, useEffect } from 'react';
import { Vehicle, MDVRChannel } from '../types/telematics';
import { 
  Camera, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Sliders, 
  ShieldAlert, 
  Download, 
  RefreshCw, 
  Video, 
  Eye, 
  UserCheck, 
  AlertTriangle,
  Play,
  Square,
  Radio
} from 'lucide-react';
import { startRealPhysicalCameraFeed } from '../services/realHardwareService';

interface MDVRCameraPanelProps {
  vehicle: Vehicle;
  onOpenConfig: () => void;
  userRole?: 'admin' | 'operator';
  isDark?: boolean;
}

export const MDVRCameraPanel: React.FC<MDVRCameraPanelProps> = ({ 
  vehicle, 
  onOpenConfig, 
  userRole = 'admin',
  isDark = true 
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'CH1' | 'CH2' | 'CH3' | 'CH4'>('ALL');
  const [isMuted, setIsMuted] = useState(true);
  const [isRecordingManual, setIsRecordingManual] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('es-VE'));
  const [adasDetectedVehicles, setAdasDetectedVehicles] = useState(2);
  const [dsmAttentionScore, setDsmAttentionScore] = useState(96);
  const [realStream, setRealStream] = useState<MediaStream | null>(null);
  const physicalVideoRef = React.useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (physicalVideoRef.current && realStream) {
      physicalVideoRef.current.srcObject = realStream;
      physicalVideoRef.current.play().catch(e => console.warn(e));
    }
  }, [realStream]);

  useEffect(() => {
    return () => {
      if (realStream) {
        realStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [realStream]);

  // Auto-connect real hardware lens when vehicle is real hardware
  useEffect(() => {
    if (vehicle.isRealHardware && !realStream) {
      startRealPhysicalCameraFeed()
        .then(stream => {
          setRealStream(stream);
        })
        .catch(err => {
          console.info('Physical camera standby/permission notice:', err.message);
        });
    }
  }, [vehicle.id, vehicle.isRealHardware]);

  const handleTogglePhysicalCamera = async () => {
    if (realStream) {
      realStream.getTracks().forEach(t => t.stop());
      setRealStream(null);
    } else {
      try {
        const stream = await startRealPhysicalCameraFeed();
        setRealStream(stream);
      } catch (err: any) {
        alert('No se pudo acceder al lente físico: ' + (err.message || 'Error de hardware'));
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-VE'));
      // simulate realistic fluctuation
      setDsmAttentionScore(prev => Math.min(100, Math.max(88, prev + (Math.random() * 4 - 2))));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTakeSnapshot = (chName: string) => {
    setSnapshotSuccess(`Instantánea capturada con éxito de ${chName} (${new Date().toLocaleTimeString()})`);
    setTimeout(() => setSnapshotSuccess(null), 3500);
  };

  const handleToggleManualRecord = () => {
    setIsRecordingManual(!isRecordingManual);
  };

  const renderCameraView = (ch: MDVRChannel, isFull = false) => {
    const isCH1 = ch.channel === 'CH1';
    const isCH2 = ch.channel === 'CH2';
    const isCH3 = ch.channel === 'CH3';
    const isCH4 = ch.channel === 'CH4';

    return (
      <div 
        key={ch.id}
        className={`relative bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-md flex flex-col group ${
          isFull ? 'h-[520px]' : 'h-64'
        }`}
      >
        {/* Top OSD Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-2 flex items-center justify-between text-xs text-white/90 font-mono">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/90 text-black px-1.5 py-0.5 rounded font-bold text-[10px]">
              {ch.channel}
            </span>
            <span className="font-semibold truncate max-w-[140px] sm:max-w-none">{ch.name}</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {ch.resolution} • {ch.fps}fps
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-amber-300">
              {currentTime}
            </span>
            {isRecordingManual ? (
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold animate-pulse flex items-center gap-1">
                <Square className="w-2.5 h-2.5 fill-white" /> REC-EVENT
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> REC
              </span>
            )}
          </div>
        </div>

        {/* Live Video Feed (Real physical camera or simulated fallback) */}
        <div className="relative flex-1 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
          {isCH1 && (
            // CH1: Forward Road View with ADAS or Real Physical Camera
            <div className="relative w-full h-full bg-gradient-to-b from-sky-900/40 via-slate-800 to-slate-950 flex items-center justify-center overflow-hidden">
              {realStream ? (
                <video
                  ref={physicalVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  {/* Road perspective lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                    <line x1="20%" y1="100%" x2="45%" y2="45%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="80%" y1="100%" x2="55%" y2="45%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="50%" y1="100%" x2="50%" y2="45%" stroke="#facc15" strokeWidth="2" strokeDasharray="8 8" />
                  </svg>

                  {/* Simulated Lead Vehicle with ADAS Bounding Box */}
                  <div className="absolute top-[35%] left-[44%] w-24 h-16 border-2 border-emerald-400 rounded-sm flex flex-col justify-between p-0.5 shadow-lg bg-emerald-500/10">
                    <span className="text-[9px] bg-emerald-600 text-white font-mono px-1 rounded-sm w-fit font-bold">
                      VEH [19.2m]
                    </span>
                    <span className="text-[8px] text-emerald-300 font-mono text-right font-bold">
                      ADAS FCW OK
                    </span>
                  </div>
                </>
              )}

              {/* Real / OSD HUD telemetry */}
              <div className="absolute bottom-2 left-3 z-10 font-mono text-[11px] text-white/90 space-y-0.5 bg-black/70 p-2 rounded backdrop-blur-xs border border-slate-700/80">
                <div className="flex items-center gap-2">
                  <span>PLACA: <b className="text-amber-400">{vehicle.plate}</b></span>
                  {realStream && (
                    <span className="text-[9px] bg-emerald-500 text-black px-1 rounded font-bold">
                      LENTE FÍSICO REAL
                    </span>
                  )}
                </div>
                <div>VELOCIDAD: <span className="text-emerald-400 font-bold">{vehicle.speed} km/h</span></div>
                <div>GPS: {vehicle.lat.toFixed(5)} N, {Math.abs(vehicle.lng).toFixed(5)} W</div>
              </div>

              {/* Lane Departure / Real Status Indicator */}
              <div className="absolute bottom-3 right-3 z-10 bg-slate-900/90 border border-slate-700 px-2 py-1 rounded text-[10px] text-emerald-400 flex items-center gap-1 font-mono shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {realStream ? 'HARDWARE MD-300 ENLACE DIRECTO' : 'LDW: CARRIL CENTRADO'}
              </div>
            </div>
          )}

          {isCH2 && (
            // CH2: Driver Cabin with DSM (Driver State Monitor)
            <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 flex items-center justify-center">
              {/* Simulated Driver Silhouette & Face Mesh */}
              <div className="relative w-36 h-40 flex flex-col items-center justify-center">
                <div className="w-20 h-24 rounded-full border-2 border-dashed border-sky-400/70 flex items-center justify-center relative bg-sky-900/20">
                  {/* Eye boxes */}
                  <div className="absolute top-7 left-3 w-4 h-2 border border-emerald-400"></div>
                  <div className="absolute top-7 right-3 w-4 h-2 border border-emerald-400"></div>
                  {/* Mouth box */}
                  <div className="absolute bottom-5 w-6 h-2 border border-emerald-400"></div>
                  <UserCheck className="w-10 h-10 text-sky-300 opacity-60" />
                </div>
                <div className="w-28 h-12 bg-slate-800/80 rounded-t-xl mt-1 border border-slate-700"></div>
              </div>

              {/* DSM Status HUD */}
              <div className="absolute top-10 right-3 z-10 bg-black/70 border border-slate-700 p-2 rounded text-[10px] font-mono space-y-1 text-slate-300">
                <div className="text-amber-400 font-bold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> DSM IA ACTIVO
                </div>
                <div>Atención: <span className="text-emerald-400 font-bold">{Math.round(dsmAttentionScore)}%</span></div>
                <div>Somnolencia: <span className="text-emerald-400">NORMAL</span></div>
                <div>Distracción: <span className="text-emerald-400">NO DETECTADA</span></div>
                <div>Celular: <span className="text-emerald-400">NO EN USO</span></div>
                <div>Cinturón: <span className="text-emerald-400">CONECTADO</span></div>
              </div>

              <div className="absolute bottom-2 left-3 z-10 font-mono text-[10px] text-white/80 bg-black/60 p-1.5 rounded">
                <div>CABINA: CONDUCTOR EN TURNO</div>
                <div className="text-amber-300">{vehicle.driverName}</div>
              </div>
            </div>
          )}

          {isCH3 && (
            // CH3: Cargo Hold
            <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
              <div className="text-center font-mono text-slate-500">
                <div className="w-16 h-12 border-2 border-slate-700 rounded mx-auto mb-2 flex items-center justify-center bg-slate-900">
                  <Video className="w-6 h-6 text-slate-600" />
                </div>
                <div className="text-xs text-slate-400 font-semibold">COMPARTIMIENTO DE CARGA</div>
                <div className="text-[10px] text-emerald-500">Sello de Seguridad: INTACTO</div>
                <div className="text-[10px] text-slate-500 mt-1">Luz Infrarroja Automática: ACTIVADA</div>
              </div>
              <div className="absolute bottom-2 left-3 font-mono text-[10px] text-white/70 bg-black/50 p-1 rounded">
                IR-CUT ● 720P HD
              </div>
            </div>
          )}

          {isCH4 && (
            // CH4: Lateral Blind Spot
            <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
              <div className="text-center font-mono text-slate-500">
                <div className="w-16 h-12 border-2 border-slate-700 rounded mx-auto mb-2 flex items-center justify-center bg-slate-900">
                  <ShieldAlert className="w-6 h-6 text-slate-600" />
                </div>
                <div className="text-xs text-slate-400 font-semibold">ÁNGULO CIEGO DERECHO</div>
                <div className="text-[10px] text-emerald-500">Detector de Ciclistas / Peatones: LISTO</div>
              </div>
              <div className="absolute bottom-2 left-3 font-mono text-[10px] text-white/70 bg-black/50 p-1 rounded">
                BSD ALGORITMO ● 120° FOV
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar on Hover */}
        <div className="p-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleTakeSnapshot(ch.name)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 transition"
              title="Capturar foto instantánea de alta resolución"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Foto</span>
            </button>
            <button
              onClick={handleToggleManualRecord}
              className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition ${
                isRecordingManual ? 'bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title="Grabar clip de emergencia en servidor"
            >
              <Video className="w-3.5 h-3.5 text-red-400" />
              <span>{isRecordingManual ? 'Parar' : 'Clip 20s'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedChannel(selectedChannel === ch.channel ? 'ALL' : ch.channel)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              title={selectedChannel === ch.channel ? "Ver 4 canales" : "Maximizar este canal"}
            >
              {selectedChannel === ch.channel ? (
                <Minimize2 className="w-4 h-4 text-amber-400" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} shadow-xl`}>
      {/* Header with Title & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/60 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">
                Cámaras Telemétricas MDVR - {vehicle.unitNumber} ({vehicle.plate})
              </h2>
              <span className="bg-emerald-500/15 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                Streaming JT1078 Activo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Protocolo JT808/1078 · Servidor: {vehicle.mdvrConfig.ipAddress}:{vehicle.mdvrConfig.port} · Conductor: {vehicle.driverName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Channel selector buttons */}
          <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setSelectedChannel('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedChannel === 'ALL'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              4 Canales
            </button>
            {(['CH1', 'CH2', 'CH3', 'CH4'] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                className={`px-2 py-1 rounded font-medium transition ${
                  selectedChannel === ch
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Real Physical Camera Feed Toggle Button */}
          <button
            onClick={handleTogglePhysicalCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              realStream
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Activa o desactiva la señal óptica real de la cámara física conectada"
          >
            <Radio className={`w-3.5 h-3.5 ${realStream ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span>{realStream ? 'Lente Físico Conectado' : 'Activar Cámara Física'}</span>
          </button>

          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg border transition ${
              isMuted 
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}
            title={isMuted ? "Activar audio de cabina" : "Silenciar audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Configure button (Admin Only) */}
          {userRole === 'admin' && (
            <button
              onClick={onOpenConfig}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-xs transition shadow-sm"
              title="Ajustar parámetros técnicos MDVR, IP, APN y sensibilidad ADAS/DSM"
            >
              <Sliders className="w-4 h-4" />
              <span>Configurar Parámetros</span>
            </button>
          )}
        </div>
      </div>

      {/* Snapshot success notification banner */}
      {snapshotSuccess && (
        <div className="mb-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>{snapshotSuccess}</span>
          </div>
          <button 
            onClick={() => setSnapshotSuccess(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cameras Grid */}
      {selectedChannel === 'ALL' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vehicle.mdvrChannels.map(ch => renderCameraView(ch, false))}
        </div>
      ) : (
        <div>
          {vehicle.mdvrChannels
            .filter(ch => ch.channel === selectedChannel)
            .map(ch => renderCameraView(ch, true))}
        </div>
      )}

      {/* Quick Telemetry & Status bar under cameras */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs">
        <div className="bg-slate-800/40 border border-slate-800 p-2 rounded-lg">
          <div className="text-slate-400 text-[11px]">Almacenamiento Local MDVR</div>
          <div className="font-bold text-slate-200 mt-0.5">
            {vehicle.mdvrConfig.storageType} ({vehicle.mdvrConfig.storageUsedPercent}% ocupado)
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 p-2 rounded-lg">
          <div className="text-slate-400 text-[11px]">Sensor G Triaxial Calibrado</div>
          <div className="font-bold text-slate-200 mt-0.5">
            X:{vehicle.gSensor.x} Y:{vehicle.gSensor.y} Z:{vehicle.gSensor.z} (Estable)
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 p-2 rounded-lg">
          <div className="text-slate-400 text-[11px]">Sistema ADAS Vial</div>
          <div className="font-bold text-emerald-400 mt-0.5">
            {vehicle.mdvrConfig.adasEnabled ? 'Activo (Sensibilidad Alta)' : 'Desactivado'}
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 p-2 rounded-lg">
          <div className="text-slate-400 text-[11px]">Sistema DSM Chofer</div>
          <div className="font-bold text-emerald-400 mt-0.5">
            {vehicle.mdvrConfig.dsmEnabled ? 'Monitoreo Facial Activo' : 'Desactivado'}
          </div>
        </div>
      </div>
    </div>
  );
};
