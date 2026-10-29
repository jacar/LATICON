import React, { useState } from 'react';
import { Vehicle } from '../types/telematics';
import { 
  Terminal, 
  Power, 
  PowerOff, 
  Volume2, 
  Camera, 
  RotateCcw, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface CommandsViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle;
  onSelectVehicle: (v: Vehicle) => void;
  isDark?: boolean;
}

interface CommandLog {
  id: string;
  timestamp: string;
  plate: string;
  commandName: string;
  status: 'sent' | 'delivered' | 'acknowledged' | 'failed';
  responsePayload: string;
}

export const CommandsView: React.FC<CommandsViewProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  isDark = true
}) => {
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'cmd-1',
      timestamp: '28-10-2026 12:05:11',
      plate: 'A588AB',
      commandName: 'SOLICITUD FOTO CH1',
      status: 'acknowledged',
      responsePayload: 'Foto capturada 1920x1080 JPEG recibida en 1.8s'
    },
    {
      id: 'cmd-2',
      timestamp: '28-10-2026 09:20:44',
      plate: 'AC895EP',
      commandName: 'CALIBRAR SENSOR G',
      status: 'acknowledged',
      responsePayload: 'Offset X:0.01 Y:0.01 Z:0.99 calibrado OK'
    }
  ]);

  const [confirmCutModal, setConfirmCutModal] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleSendCommand = (commandName: string, payload: string) => {
    const newLog: CommandLog = {
      id: `cmd-${Date.now()}`,
      timestamp: new Date().toLocaleString('es-VE'),
      plate: selectedVehicle.plate,
      commandName,
      status: 'acknowledged',
      responsePayload: payload
    };

    setLogs([newLog, ...logs]);
    setFeedbackMsg(`Comando "${commandName}" enviado y confirmado por unidad ${selectedVehicle.plate}`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleExecuteEngineCut = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityPin !== '1234') {
      alert('PIN de seguridad de emergencia incorrecto (Demostración: use 1234)');
      return;
    }

    handleSendCommand('CORTE DE MOTOR / INMOVILIZADOR', 'Relé de combustible desactivado vía JT808. Inyección cortada.');
    setConfirmCutModal(false);
    setSecurityPin('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Envío de Comandos Telemétricos en Tiempo Real
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono">
                JT808 / MQTT Directo
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Inmovilización de motor, activación de sirena pánico, toma de instantáneas y reinicio remoto de MDVR
            </p>
          </div>
        </div>

        {/* Selected Vehicle Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Unidad de destino:</label>
          <select
            value={selectedVehicle.id}
            onChange={e => {
              const target = vehicles.find(v => v.id === e.target.value);
              if (target) onSelectVehicle(target);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:outline-hidden focus:border-amber-500"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                Unidad #{v.unitNumber} - {v.plate} ({v.model})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Engine Cut-off (Critical) */}
        <div className="bg-slate-900 border border-red-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Seguridad Crítica
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono font-bold">
                RELÉ 1
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-100">Corte de Corriente / Combustible</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Inmoviliza inmediatamente el motor del vehículo interrumpiendo el flujo de inyección. Requiere confirmación con PIN.
            </p>
          </div>

          <button
            onClick={() => setConfirmCutModal(true)}
            className="mt-5 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition"
          >
            <PowerOff className="w-4 h-4" />
            <span>ACTIVAR INMOVILIZADOR</span>
          </button>
        </div>

        {/* Restore Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Power className="w-4 h-4 text-emerald-500" />
                Reactivación
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                RELÉ 1 NORMAL
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-100">Restaurar Paso de Corriente</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Restaura la alimentación eléctrica de la bomba de combustible para permitir el arranque regular.
            </p>
          </div>

          <button
            onClick={() => handleSendCommand('RESTAURAR CORRIENTE MOTOR', 'Relé normalizado. Unidad autorizada para ignición.')}
            className="mt-5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <Power className="w-4 h-4" />
            <span>Restablecer Motor</span>
          </button>
        </div>

        {/* Instant Photo Request */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                MDVR Telemetría
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
                CANAL 1 & 2
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-100">Solicitar Foto Instantánea HD</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Ordena a la cámara frontal y de cabina tomar una foto en alta definición y subirla de inmediato por 4G.
            </p>
          </div>

          <button
            onClick={() => handleSendCommand('SOLICITAR FOTO HD (CH1+CH2)', 'Instantánea 1080P capturada y enviada al repositorio')}
            className="mt-5 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20"
          >
            <Camera className="w-4 h-4" />
            <span>Capturar Foto Remota</span>
          </button>
        </div>

        {/* Siren / Horn */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Alarma Sonora
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                SIRENA 12V
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-100">Disparar Sirena de Advertencia</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Activa la bocina / sirena instalada en el vehículo durante 15 segundos para disuadir intentos de robo.
            </p>
          </div>

          <button
            onClick={() => handleSendCommand('ACTIVAR SIRENA 15s', 'Sirena disuasoria activada en cabina y exterior por 15 segundos.')}
            className="mt-5 w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Sonorizar Sirena</span>
          </button>
        </div>

        {/* Door Locks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-sky-400" />
                Cierre Centralizado
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                CAN BUS
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-100">Bloqueo de Seguros de Puertas</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Cierre o apertura de emergencia de todas las cerraduras de cabina y compartimiento de carga.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              onClick={() => handleSendCommand('BLOQUEO SEGUROS', 'Cerraduras bloqueadas correctamente.')}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Bloquear</span>
            </button>
            <button
              onClick={() => handleSendCommand('DESBLOQUEO SEGUROS', 'Cerraduras desbloqueadas.')}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Abrir</span>
            </button>
          </div>
        </div>

        {/* Reboot MDVR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-purple-400" />
                Mantenimiento Remoto
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                JT1078 SYS
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-100">Reinicio Suave de MDVR</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Reinicia el sistema operativo del grabador MDVR sin interrumpir el funcionamiento eléctrico del motor.
            </p>
          </div>

          <button
            onClick={() => handleSendCommand('REINICIO SUAVE MDVR', 'Comando 0x8105 enviado. MDVR reiniciando módulos 4G y cámaras.')}
            className="mt-5 w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span>Reiniciar MDVR</span>
          </button>
        </div>
      </div>

      {/* Command Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Historial de Comandos Enviados Recientemente
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Hora</th>
                <th className="py-3 px-4">Placa</th>
                <th className="py-3 px-4">Comando</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Respuesta del Dispositivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-amber-400 font-mono">{log.plate}</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{log.commandName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      EJECUTADO OK
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-300">{log.responsePayload}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Cut-off Modal */}
      {confirmCutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">CONFIRMACIÓN CRÍTICA</h3>
                <p className="text-xs text-red-400">Inmovilización de Motor</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Está a punto de enviar una orden de <b>corte de corriente inmediato</b> al vehículo <b>{selectedVehicle.plate} (Unidad #{selectedVehicle.unitNumber})</b>.
              Si el vehículo se encuentra en movimiento, esto provocará pérdida de tracción asistida.
            </p>

            <form onSubmit={handleExecuteEngineCut} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ingrese PIN de autorización de seguridad:
                </label>
                <input
                  type="password"
                  required
                  placeholder="PIN (Demo: 1234)"
                  value={securityPin}
                  onChange={e => setSecurityPin(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-center font-mono tracking-widest text-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmCutModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <PowerOff className="w-4 h-4" />
                  <span>EJECUTAR CORTE AHORA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
