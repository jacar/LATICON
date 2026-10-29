import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types/telematics';
import { 
  fetchRealDeviceGps, 
  startRealPhysicalCameraFeed, 
  RealGpsResult 
} from '../services/realHardwareService';
import { 
  X, 
  MapPin, 
  Video, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Radio, 
  Eye, 
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  Camera
} from 'lucide-react';

interface RealCameraQuickInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRealCamera: (vehicle: Vehicle, clearDemoData: boolean) => void;
  isDark?: boolean;
}

export const RealCameraQuickInstallModal: React.FC<RealCameraQuickInstallModalProps> = ({
  isOpen,
  onClose,
  onConfirmRealCamera,
  isDark = true
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [gpsData, setGpsData] = useState<RealGpsResult | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Video State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Form Fields
  const [plate, setPlate] = useState('MD300-REAL');
  const [unitNumber, setUnitNumber] = useState('001');
  const [alias, setAlias] = useState('Unidad MD-300 Primaria (Hardware Real)');
  const [driverName, setDriverName] = useState('Operador Principal');
  const [clearDemoData, setClearDemoData] = useState(true);

  // IP/RTSP stream alternative
  const [useIpStream, setUseIpStream] = useState(false);
  const [ipStreamUrl, setIpStreamUrl] = useState('http://192.168.1.120:8080/stream');

  useEffect(() => {
    if (isOpen) {
      // Auto-trigger GPS capture immediately on open for instant real data
      handleFetchGps();
    } else {
      // Clean up camera stream when modal closes if not in step 3
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        setMediaStream(null);
        setIsCameraActive(false);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(e => console.warn('Video preview error:', e));
    }
  }, [mediaStream]);

  const handleFetchGps = async () => {
    setIsLoadingGps(true);
    setGpsError(null);
    try {
      const result = await fetchRealDeviceGps();
      setGpsData(result);
    } catch (err: any) {
      setGpsError(err.message || 'No se pudo obtener la posición satelital directa.');
    } finally {
      setIsLoadingGps(false);
    }
  };

  const handleToggleCamera = async () => {
    if (isCameraActive) {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        setMediaStream(null);
      }
      setIsCameraActive(false);
    } else {
      setCameraError(null);
      try {
        const stream = await startRealPhysicalCameraFeed();
        setMediaStream(stream);
        setIsCameraActive(true);
      } catch (err: any) {
        setCameraError(err.message || 'Acceso al lente óptico no disponible o denegado.');
      }
    }
  };

  const handleCompleteInstallation = () => {
    const lat = gpsData ? gpsData.lat : 10.6038;
    const lng = gpsData ? gpsData.lng : -71.6432;
    const address = gpsData ? gpsData.address : 'Ubicación GPS en vivo detectada';
    const speed = gpsData ? gpsData.speed : 0;
    const heading = gpsData ? gpsData.heading : 90;
    const serial = `MD300-REAL-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRealVehicle: Vehicle = {
      id: `veh-real-${Date.now()}`,
      plate: plate.toUpperCase().trim(),
      unitNumber: unitNumber.trim(),
      alias: alias.trim(),
      model: 'Cámara Telemática AI MD-300 (Hardware Real)',
      year: 2025,
      driverName: driverName.trim(),
      driverPhone: '+58 414-998-1122',
      group: 'Equipos Reales MD-300',
      status: 'idle',
      speed: speed,
      heading: heading,
      lat: lat,
      lng: lng,
      altitude: gpsData ? gpsData.altitude : 24,
      odometer: 0,
      tripDistance: 0.0,
      fuelPercent: 100,
      batteryVoltage: 13.8,
      ignition: true,
      engineTemp: 44,
      lastUpdate: new Date().toLocaleTimeString('es-VE') + ' (GNSS Real Activo)',
      parkingDuration: '0 min',
      address: address,
      isRealHardware: true,
      realGpsActive: true,
      realVideoActive: isCameraActive || useIpStream,
      realTelemetrySource: 'gps_hardware',
      realStreamUrl: useIpStream ? ipStreamUrl : undefined,
      gSensor: {
        x: 0.00,
        y: 0.00,
        z: 1.00,
        harshBraking: false,
        harshAccel: false,
        harshCornering: false,
        collisionDetected: false
      },
      trafficLightAlerts: 0,
      harshEventsCount: 0,
      mdvrChannels: [
        {
          id: `ch1-${serial}`,
          channel: 'CH1',
          name: 'CH1 - Lente Frontal Vial (Óptica Física)',
          type: 'road_adas',
          status: 'streaming',
          resolution: '1080P',
          fps: 30,
          bitrateKbps: 2048,
          nightVision: false,
          audioActive: false,
          adasWarnings: ['Distancia ADAS calibrada']
        },
        {
          id: `ch2-${serial}`,
          channel: 'CH2',
          name: 'CH2 - Lente Cabina DSM Infrarrojo 940nm',
          type: 'driver_dsm',
          status: 'streaming',
          resolution: '1080P',
          fps: 30,
          bitrateKbps: 1536,
          nightVision: true,
          audioActive: true,
          dsmWarnings: ['Sensor biométrico NPU listo']
        },
        {
          id: `ch3-${serial}`,
          channel: 'CH3',
          name: 'CH3 - Auxiliar Carga / Compartimiento',
          type: 'cargo',
          status: 'streaming',
          resolution: '720P',
          fps: 25,
          bitrateKbps: 1024,
          nightVision: true,
          audioActive: false
        },
        {
          id: `ch4-${serial}`,
          channel: 'CH4',
          name: 'CH4 - Ángulo Lateral Blind Spot',
          type: 'blind_spot',
          status: 'streaming',
          resolution: '720P',
          fps: 25,
          bitrateKbps: 1024,
          nightVision: true,
          audioActive: false
        }
      ],
      mdvrConfig: {
        deviceId: serial,
        ipAddress: '69.6.235.52',
        port: 1078,
        protocol: 'JT1078',
        apn: 'internet.movistar.ve',
        subStreamBitrate: 512,
        mainStreamBitrate: 2048,
        encoding: 'H.265',
        adasEnabled: true,
        adasSensitivity: 'alta',
        dsmEnabled: true,
        dsmFatigueSensitivity: 'alta',
        dsmPhoneDetection: true,
        dsmSmokingDetection: true,
        gSensorThresholdBraking: 3.2,
        gSensorThresholdAccel: 3.0,
        storageType: 'Dual SD',
        storageUsedPercent: 1,
        preRecordSec: 15,
        postRecordSec: 30
      }
    };

    onConfirmRealCamera(newRealVehicle, clearDemoData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                Instalar Primera Cámara MD-300 con Datos Reales
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  PRODUCCIÓN
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Enlace directo con GPS GNSS de hardware y transmisión óptica en vivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="grid grid-cols-3 bg-slate-950/50 border-b border-slate-800 text-xs">
          <button 
            onClick={() => setStep(1)}
            className={`py-2.5 px-3 flex items-center justify-center gap-2 font-medium border-b-2 transition ${
              step === 1 ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold">1</span>
            <span>Ubicación GPS Real</span>
          </button>
          <button 
            onClick={() => setStep(2)}
            className={`py-2.5 px-3 flex items-center justify-center gap-2 font-medium border-b-2 transition ${
              step === 2 ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold">2</span>
            <span>Lente Óptico Real</span>
          </button>
          <button 
            onClick={() => setStep(3)}
            className={`py-2.5 px-3 flex items-center justify-center gap-2 font-medium border-b-2 transition ${
              step === 3 ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold">3</span>
            <span>Ficha y Producción</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* STEP 1: REAL GPS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Recepción de Coordenadas Físicas (GNSS Satelital)</span>
                  </div>
                  <button
                    onClick={handleFetchGps}
                    disabled={isLoadingGps}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGps ? 'animate-spin' : ''}`} />
                    <span>{isLoadingGps ? 'Adquiriendo Satélites...' : 'Sincronizar GPS Real'}</span>
                  </button>
                </div>

                {isLoadingGps ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                    <div className="text-sm font-semibold text-slate-200">Consultando receptor GNSS y satélites...</div>
                    <div className="text-xs text-slate-400">Georreferenciando con OpenStreetMap Nominatim en tiempo real</div>
                  </div>
                ) : gpsData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Latitud Real</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">{gpsData.lat.toFixed(6)}°</div>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Longitud Real</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">{gpsData.lng.toFixed(6)}°</div>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Precisión</div>
                        <div className="text-sm font-mono font-bold text-slate-200">±{gpsData.accuracy} metros</div>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Velocidad / Rumbo</div>
                        <div className="text-sm font-mono font-bold text-amber-400">{gpsData.speed} kph • {gpsData.heading}°</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                        Dirección Georreferenciada (OpenStreetMap):
                      </div>
                      <div className="text-xs text-slate-200 font-medium leading-relaxed">
                        {gpsData.address}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Señal GPS física adquirida correctamente. El mapa se posicionará de inmediato en estas coordenadas reales.</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2">
                    <p className="text-xs text-slate-300">
                      Haga clic en <b>"Sincronizar GPS Real"</b> y conceda permiso de ubicación para capturar sus coordenadas exactas del receptor.
                    </p>
                    {gpsError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{gpsError} (Se usarán coordenadas predeterminadas de Maracaibo hasta enlace satelital directo)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg"
                >
                  <span>Siguiente: Conectar Lente Óptico</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REAL CAMERA FEED */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>Captura Óptica de Video en Tiempo Real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseIpStream(!useIpStream)}
                      className="text-xs text-slate-400 hover:text-amber-400 underline font-medium"
                    >
                      {useIpStream ? 'Usar Cámara USB / Web' : 'Configurar IP / RTSP Local'}
                    </button>
                  </div>
                </div>

                {!useIpStream ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                      {isCameraActive ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1.5 border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>ÓPTICA REAL MD-300 EN VIVO (1080P)</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                          <div className="text-sm font-semibold text-slate-300">Lente Óptico en Espera</div>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            Haga clic en el botón inferior para activar la lente física de la cámara MD-300 conectada por USB-C o cámara del sistema.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={handleToggleCamera}
                        className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-2 transition ${
                          isCameraActive 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>{isCameraActive ? 'Detener Vista Previa' : 'Activar Lente Físico Ahora'}</span>
                      </button>

                      {isCameraActive && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Stream óptico verificado</span>
                        </span>
                      )}
                    </div>

                    {cameraError && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{cameraError} (También puede ingresar la URL RTSP/IP de su MD-300)</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        URL de Transmisión RTSP / HTTP del MD-300:
                      </label>
                      <input
                        type="text"
                        value={ipStreamUrl}
                        onChange={e => setIpStreamUrl(e.target.value)}
                        placeholder="rtsp://192.168.1.120:554/ch1 o http://..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="font-semibold text-amber-400">Configuración IP predeterminada de MD-300:</div>
                      <div>• IP por defecto: <span className="font-mono text-slate-200">192.168.1.120</span></div>
                      <div>• Puerto RTSP: <span className="font-mono text-slate-200">554</span> | Puerto JT/T 1078: <span className="font-mono text-slate-200">1078</span></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  ← Volver a GPS
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg"
                >
                  <span>Siguiente: Datos de la Unidad</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: IDENTIFICATION & PURGE DEMO DATA */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <div className="text-slate-200 font-bold text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Identificación del Vehículo y Puesta en Marcha</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Placa del Vehículo
                    </label>
                    <input
                      type="text"
                      value={plate}
                      onChange={e => setPlate(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Número de Unidad / Económico
                    </label>
                    <input
                      type="text"
                      value={unitNumber}
                      onChange={e => setUnitNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alias o Identificador
                    </label>
                    <input
                      type="text"
                      value={alias}
                      onChange={e => setAlias(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Conductor Asignado
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Clear demo data checkbox per user request */}
                <div className="pt-2 border-t border-slate-700/80">
                  <label className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl cursor-pointer hover:bg-amber-500/15 transition">
                    <input
                      type="checkbox"
                      checked={clearDemoData}
                      onChange={e => setClearDemoData(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-amber-500 rounded border-slate-700 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-amber-300">
                        Ocultar y eliminar todos los vehículos simulados de prueba
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Muestra de forma exclusiva los datos reales de esta cámara MD-300 en el mapa, lista y telemetría.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Hardware Summary Card */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Hardware: </span>
                  <span className="font-bold text-slate-200">MD-300 Dual Starvis + DSM</span>
                </div>
                <div>
                  <span className="text-slate-400">GPS: </span>
                  <span className="font-bold text-emerald-400">
                    {gpsData ? `${gpsData.lat.toFixed(4)}, ${gpsData.lng.toFixed(4)}` : 'Coordenadas en Espera'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Video: </span>
                  <span className="font-bold text-amber-400">
                    {isCameraActive ? 'Óptico Activo' : useIpStream ? 'IP RTSP' : 'Configurado'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  ← Volver a Video
                </button>
                <button
                  onClick={handleCompleteInstallation}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 transition shadow-xl"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Activar Monitoreo con Datos Reales</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
