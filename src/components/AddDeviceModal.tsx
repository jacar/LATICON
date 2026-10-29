import React, { useState } from 'react';
import { Vehicle } from '../types/telematics';
import { Plus, X, Truck, Video, Radio, Save } from 'lucide-react';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (newVeh: Vehicle) => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose, onAddVehicle }) => {
  const [plate, setPlate] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [model, setModel] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('+58 ');
  const [group, setGroup] = useState('Sin grupo');
  const [mdvrModel, setMdvrModel] = useState('MDVR-JT1078-4CH');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !unitNumber.trim()) return;

    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      plate: plate.toUpperCase(),
      unitNumber,
      alias: `${model || 'Unidad'} #${unitNumber}`,
      model: model || 'Vehículo de Carga',
      year: 2024,
      driverName: driverName || 'Sin Asignar',
      driverPhone: driverPhone || '+58 414-000-0000',
      group,
      status: 'idle',
      speed: 0,
      heading: 0,
      lat: 10.6045 + (Math.random() - 0.5) * 0.01,
      lng: -71.6425 + (Math.random() - 0.5) * 0.01,
      altitude: 18,
      odometer: 12500,
      tripDistance: 0,
      fuelPercent: 100,
      batteryVoltage: 13.8,
      ignition: false,
      engineTemp: 40,
      lastUpdate: 'Recién registrado',
      parkingDuration: '0 min',
      address: 'Zona Operacional Maracaibo, Zulia',
      gSensor: {
        x: 0,
        y: 0,
        z: 1,
        harshBraking: false,
        harshAccel: false,
        harshCornering: false,
        collisionDetected: false
      },
      trafficLightAlerts: 0,
      harshEventsCount: 0,
      mdvrChannels: [
        {
          id: `ch1-${Date.now()}`,
          channel: 'CH1',
          name: 'CH1 - Frontal Vial / ADAS',
          type: 'road_adas',
          status: 'streaming',
          resolution: '1080P',
          fps: 25,
          bitrateKbps: 2048,
          nightVision: false,
          audioActive: false
        },
        {
          id: `ch2-${Date.now()}`,
          channel: 'CH2',
          name: 'CH2 - Cabina DSM Chofer',
          type: 'driver_dsm',
          status: 'streaming',
          resolution: '1080P',
          fps: 25,
          bitrateKbps: 1536,
          nightVision: true,
          audioActive: true
        },
        {
          id: `ch3-${Date.now()}`,
          channel: 'CH3',
          name: 'CH3 - Compartimiento Carga',
          type: 'cargo',
          status: 'streaming',
          resolution: '720P',
          fps: 20,
          bitrateKbps: 1024,
          nightVision: true,
          audioActive: false
        },
        {
          id: `ch4-${Date.now()}`,
          channel: 'CH4',
          name: 'CH4 - Ángulo Ciego Lateral',
          type: 'blind_spot',
          status: 'streaming',
          resolution: '720P',
          fps: 20,
          bitrateKbps: 1024,
          nightVision: false,
          audioActive: false
        }
      ],
      mdvrConfig: {
        deviceId: `MDVR-808-V${unitNumber}`,
        ipAddress: '69.6.235.52',
        port: 1078,
        protocol: 'JT1078',
        apn: 'internet.movistar.ve',
        subStreamBitrate: 512,
        mainStreamBitrate: 2048,
        encoding: 'H.265',
        adasEnabled: true,
        adasSensitivity: 'media',
        dsmEnabled: true,
        dsmFatigueSensitivity: 'alta',
        dsmPhoneDetection: true,
        dsmSmokingDetection: true,
        gSensorThresholdBraking: 3.2,
        gSensorThresholdAccel: 3.0,
        storageType: 'Dual SD',
        storageUsedPercent: 12,
        preRecordSec: 15,
        postRecordSec: 30
      }
    };

    onAddVehicle(newVeh);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-white">Registrar Dispositivo & Cámara MDVR</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Placa Vehicular</label>
              <input
                type="text"
                required
                placeholder="Ej: A588AB"
                value={plate}
                onChange={e => setPlate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Número de Unidad (#)</label>
              <input
                type="text"
                required
                placeholder="Ej: 338"
                value={unitNumber}
                onChange={e => setUnitNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Modelo / Marca</label>
              <input
                type="text"
                placeholder="Ej: Isuzu NPR 75L"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Grupo de Flota</label>
              <select
                value={group}
                onChange={e => setGroup(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="Sin grupo">Sin grupo</option>
                <option value="Flota Maracaibo Norte">Flota Maracaibo Norte</option>
                <option value="Carga Pesada Zulia">Carga Pesada Zulia</option>
                <option value="Transporte Ejecutivo">Transporte Ejecutivo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Conductor Asignado</label>
              <input
                type="text"
                placeholder="Nombre del Chofer"
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Teléfono Conductor</label>
              <input
                type="text"
                placeholder="+58 414-000-0000"
                value={driverPhone}
                onChange={e => setDriverPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-[11px] text-slate-300 flex items-center gap-2">
            <Video className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Se auto-aprovisionará con 4 canales de cámara MDVR JT1078 (CH1 ADAS + CH2 DSM).</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Registrar Unidad</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
