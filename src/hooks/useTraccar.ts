/**
 * useTraccar.ts
 * ─────────────────────────────────────────────────────────────────────
 * React hook para integrar Traccar con los vehículos de LATICON.
 * Maneja login, carga de dispositivos, y streaming de posiciones en
 * tiempo real vía WebSocket.
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  TraccarService,
  TraccarConfig,
  TraccarPosition,
  TraccarDevice,
  TRACCAR_DEFAULT_CONFIG,
} from '../services/traccarService';
import type { Vehicle } from '../types/telematics';

export interface TraccarState {
  /** ¿Está conectado al servidor Traccar? */
  connected: boolean;
  /** ¿Se está cargando / conectando? */
  loading: boolean;
  /** Error de conexión o auth */
  error: string | null;
  /** Dispositivos Traccar como vehículos LATICON */
  vehicles: Partial<Vehicle>[];
  /** Cantidad de dispositivos online */
  onlineCount: number;
  /** Cantidad total de dispositivos */
  totalCount: number;
  /** Última actualización recibida */
  lastUpdate: Date | null;
}

interface UseTraccarOptions {
  /** Configuración del servidor (default: localhost:8082) */
  config?: TraccarConfig;
  /** Auto-conectar al montar el componente */
  autoConnect?: boolean;
  /** Callback cuando se recibe una nueva posición */
  onPositionUpdate?: (vehicleId: string, lat: number, lng: number, speed: number) => void;
  /** Callback cuando un evento (alarma) llega */
  onAlert?: (type: string, deviceName: string, message: string) => void;
}

export function useTraccar(options: UseTraccarOptions = {}) {
  const {
    config = TRACCAR_DEFAULT_CONFIG,
    autoConnect = false,
    onPositionUpdate,
    onAlert,
  } = options;

  const serviceRef = useRef<TraccarService | null>(null);
  const [state, setState] = useState<TraccarState>({
    connected: false,
    loading: false,
    error: null,
    vehicles: [],
    onlineCount: 0,
    totalCount: 0,
    lastUpdate: null,
  });

  // Crear la instancia del servicio
  useEffect(() => {
    serviceRef.current = new TraccarService(config);

    return () => {
      serviceRef.current?.disconnect();
      serviceRef.current = null;
    };
  }, [config.serverUrl, config.email]);

  // Función para conectar
  const connect = useCallback(async () => {
    const service = serviceRef.current;
    if (!service) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Login
      const ok = await service.login();
      if (!ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Login fallido — verifica email/contraseña de Traccar',
        }));
        return;
      }

      // 2. Cargar snapshot inicial
      const snapshot = await service.getFullSnapshot();
      const vehicles = snapshot.map((s) => s.vehicle);
      const onlineCount = snapshot.filter((s) => s.device.status === 'online').length;

      setState((prev) => ({
        ...prev,
        loading: false,
        connected: true,
        vehicles,
        onlineCount,
        totalCount: snapshot.length,
        lastUpdate: new Date(),
      }));

      // 3. Registrar listeners
      service.onPosition((deviceId, position) => {
        const device = service.getDevice(deviceId);
        if (!device) return;

        const updated = service.traccarToVehicle(device, position);
        const speedKph = Math.round(position.speed * 1.852);

        // Notificar al componente padre
        onPositionUpdate?.(
          device.uniqueId,
          position.latitude,
          position.longitude,
          speedKph
        );

        // Actualizar state
        setState((prev) => {
          const idx = prev.vehicles.findIndex(
            (v) => v.alias?.includes(device.uniqueId)
          );
          if (idx === -1) {
            return {
              ...prev,
              vehicles: [...prev.vehicles, updated],
              totalCount: prev.totalCount + 1,
              lastUpdate: new Date(),
            };
          }
          const copy = [...prev.vehicles];
          copy[idx] = { ...copy[idx], ...updated };
          return {
            ...prev,
            vehicles: copy,
            onlineCount: copy.filter((v) => v.realGpsActive).length,
            lastUpdate: new Date(),
          };
        });
      });

      service.onEvent((event) => {
        const device = service.getDevice(event.deviceId);
        onAlert?.(
          event.type,
          device?.name || `Device ${event.deviceId}`,
          `${event.type} @ ${new Date(event.eventTime).toLocaleTimeString()}`
        );
      });

      service.onConnection((connected) => {
        setState((prev) => ({ ...prev, connected }));
      });

      // 4. Iniciar WebSocket
      service.connect();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: `Error de conexión: ${err instanceof Error ? err.message : String(err)}`,
      }));
    }
  }, [onPositionUpdate, onAlert]);

  // Función para desconectar
  const disconnect = useCallback(() => {
    serviceRef.current?.disconnect();
    setState((prev) => ({
      ...prev,
      connected: false,
    }));
  }, []);

  // Auto-conectar si está habilitado
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect, connect]);

  // Función para obtener historial de un dispositivo
  const getHistory = useCallback(
    async (imei: string, from: Date, to: Date) => {
      const service = serviceRef.current;
      if (!service) return [];

      const device = await service.getDeviceByImei(imei);
      if (!device) return [];

      return service.getPositionHistory(
        device.id,
        from.toISOString(),
        to.toISOString()
      );
    },
    []
  );

  // Función para enviar comando (ej: corte de motor)
  const sendCommand = useCallback(
    async (imei: string, type: string, attrs?: Record<string, unknown>) => {
      const service = serviceRef.current;
      if (!service) return;

      const device = await service.getDeviceByImei(imei);
      if (!device) throw new Error(`Device IMEI ${imei} not found`);

      await service.sendCommand(device.id, type, attrs);
    },
    []
  );

  // Función para registrar un nuevo dispositivo
  const registerDevice = useCallback(
    async (name: string, imei: string) => {
      const service = serviceRef.current;
      if (!service) throw new Error('Traccar no conectado');

      return service.createDevice(name, imei);
    },
    []
  );

  return {
    ...state,
    connect,
    disconnect,
    getHistory,
    sendCommand,
    registerDevice,
    service: serviceRef.current,
  };
}
