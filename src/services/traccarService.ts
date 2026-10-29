/**
 * traccarService.ts
 * ─────────────────────────────────────────────────────────────────────
 * Integración completa con Traccar Server (Open Source GPS Tracking)
 * REST API + WebSocket para telemetría en tiempo real.
 *
 * Traccar API Docs: https://www.traccar.org/api-reference/
 * ─────────────────────────────────────────────────────────────────────
 */

import type { Vehicle, VehicleStatus } from '../types/telematics';

// ─── Config ────────────────────────────────────────────────────────
export interface TraccarConfig {
  /** URL base del servidor Traccar (ej: http://localhost:8082 o http://69.6.235.52:8082) */
  serverUrl: string;
  /** Email de admin de Traccar */
  email: string;
  /** Contraseña de admin de Traccar */
  password: string;
  /** Intervalo de reconexión WebSocket en ms (default: 5000) */
  reconnectInterval?: number;
  /** Timeout de requests en ms (default: 10000) */
  requestTimeout?: number;
}

// ─── Traccar API Types ─────────────────────────────────────────────
export interface TraccarDevice {
  id: number;
  name: string;
  uniqueId: string; // IMEI
  status: 'online' | 'offline' | 'unknown';
  disabled: boolean;
  lastUpdate: string | null;
  positionId: number;
  groupId: number;
  phone: string;
  model: string;
  contact: string;
  category: string;
  attributes: Record<string, unknown>;
}

export interface TraccarPosition {
  id: number;
  deviceId: number;
  protocol: string;
  deviceTime: string;
  fixTime: string;
  serverTime: string;
  outdated: boolean;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number; // knots
  course: number;
  address: string | null;
  accuracy: number;
  network: unknown;
  attributes: {
    batteryLevel?: number;
    distance?: number;
    totalDistance?: number;
    motion?: boolean;
    ignition?: boolean;
    fuel?: number;
    alarm?: string;
    [key: string]: unknown;
  };
}

export interface TraccarGeofence {
  id: number;
  name: string;
  description: string;
  area: string;
  calendarId: number;
  attributes: Record<string, unknown>;
}

export interface TraccarEvent {
  id: number;
  type: string;
  eventTime: string;
  deviceId: number;
  positionId: number;
  geofenceId: number;
  maintenanceId: number;
  attributes: Record<string, unknown>;
}

// ─── WebSocket Message Types ───────────────────────────────────────
interface TraccarWsMessage {
  devices?: TraccarDevice[];
  positions?: TraccarPosition[];
  events?: TraccarEvent[];
}

type PositionListener = (deviceId: number, position: TraccarPosition) => void;
type DeviceListener = (device: TraccarDevice) => void;
type EventListener = (event: TraccarEvent) => void;
type ConnectionListener = (connected: boolean) => void;

// ─── Main Service Class ────────────────────────────────────────────
export class TraccarService {
  private config: TraccarConfig;
  private sessionCookie: string | null = null;
  private ws: WebSocket | null = null;
  private wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnected = false;
  private shouldReconnect = true;

  // Caches
  private devices: Map<number, TraccarDevice> = new Map();
  private positions: Map<number, TraccarPosition> = new Map();

  // Listeners
  private positionListeners: Set<PositionListener> = new Set();
  private deviceListeners: Set<DeviceListener> = new Set();
  private eventListeners: Set<EventListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();

  constructor(config: TraccarConfig) {
    this.config = {
      reconnectInterval: 5000,
      requestTimeout: 10000,
      ...config,
    };
  }

  // ─── Auth ──────────────────────────────────────────────────────
  /**
   * Iniciar sesión en Traccar. Retorna true si la auth fue exitosa.
   */
  async login(): Promise<boolean> {
    try {
      const res = await this.fetchApi('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `email=${encodeURIComponent(this.config.email)}&password=${encodeURIComponent(this.config.password)}`,
      });

      if (res.ok) {
        // Extraer cookie de sesión
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
          this.sessionCookie = setCookie.split(';')[0];
        }
        console.log('✅ Traccar: Sesión iniciada correctamente');
        return true;
      }

      console.error('❌ Traccar: Login fallido —', res.status, await res.text());
      return false;
    } catch (err) {
      console.error('❌ Traccar: Error de conexión —', err);
      return false;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await this.fetchApi('/api/session', { method: 'DELETE' });
    } catch {
      // ignore
    }
    this.sessionCookie = null;
    this.disconnect();
  }

  // ─── REST API ──────────────────────────────────────────────────

  /**
   * Obtener todos los dispositivos registrados
   */
  async getDevices(): Promise<TraccarDevice[]> {
    const res = await this.fetchApi('/api/devices');
    if (!res.ok) throw new Error(`Traccar getDevices: ${res.status}`);
    const devices: TraccarDevice[] = await res.json();
    devices.forEach((d) => this.devices.set(d.id, d));
    return devices;
  }

  /**
   * Obtener un dispositivo por su IMEI (uniqueId)
   */
  async getDeviceByImei(imei: string): Promise<TraccarDevice | null> {
    const res = await this.fetchApi(`/api/devices?uniqueId=${imei}`);
    if (!res.ok) return null;
    const devices: TraccarDevice[] = await res.json();
    return devices[0] || null;
  }

  /**
   * Registrar un nuevo dispositivo en Traccar
   */
  async createDevice(name: string, uniqueId: string, extras?: Partial<TraccarDevice>): Promise<TraccarDevice> {
    const res = await this.fetchApi('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, uniqueId, ...extras }),
    });
    if (!res.ok) throw new Error(`Traccar createDevice: ${res.status} — ${await res.text()}`);
    return res.json();
  }

  /**
   * Actualizar un dispositivo existente
   */
  async updateDevice(id: number, updates: Partial<TraccarDevice>): Promise<TraccarDevice> {
    const current = this.devices.get(id);
    const res = await this.fetchApi(`/api/devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...current, ...updates }),
    });
    if (!res.ok) throw new Error(`Traccar updateDevice: ${res.status}`);
    return res.json();
  }

  /**
   * Obtener posiciones actuales de todos los dispositivos
   */
  async getPositions(): Promise<TraccarPosition[]> {
    const res = await this.fetchApi('/api/positions');
    if (!res.ok) throw new Error(`Traccar getPositions: ${res.status}`);
    const positions: TraccarPosition[] = await res.json();
    positions.forEach((p) => this.positions.set(p.deviceId, p));
    return positions;
  }

  /**
   * Obtener historial de posiciones de un dispositivo en un rango de fechas.
   * from/to en formato ISO 8601 (ej: "2026-10-29T00:00:00Z")
   */
  async getPositionHistory(
    deviceId: number,
    from: string,
    to: string
  ): Promise<TraccarPosition[]> {
    const res = await this.fetchApi(
      `/api/positions?deviceId=${deviceId}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    if (!res.ok) throw new Error(`Traccar getPositionHistory: ${res.status}`);
    return res.json();
  }

  /**
   * Obtener todas las geocercas
   */
  async getGeofences(): Promise<TraccarGeofence[]> {
    const res = await this.fetchApi('/api/geofences');
    if (!res.ok) throw new Error(`Traccar getGeofences: ${res.status}`);
    return res.json();
  }

  /**
   * Enviar comando a un dispositivo (ej: engine cut, door lock)
   */
  async sendCommand(deviceId: number, type: string, attributes?: Record<string, unknown>): Promise<void> {
    const res = await this.fetchApi('/api/commands/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        type,
        attributes: attributes || {},
      }),
    });
    if (!res.ok) throw new Error(`Traccar sendCommand: ${res.status} — ${await res.text()}`);
  }

  // ─── WebSocket Real-Time ───────────────────────────────────────

  /**
   * Conectar al WebSocket de Traccar para posiciones en tiempo real
   */
  connect(): void {
    if (this.ws) this.disconnect();
    this.shouldReconnect = true;

    const wsUrl = this.config.serverUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');

    const url = `${wsUrl}/api/socket`;

    console.log('🔌 Traccar WS: Conectando a', url);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('✅ Traccar WS: Conectado');
      this.isConnected = true;
      this.connectionListeners.forEach((fn) => fn(true));
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: TraccarWsMessage = JSON.parse(event.data);

        // Actualizar dispositivos
        if (msg.devices) {
          msg.devices.forEach((device) => {
            this.devices.set(device.id, device);
            this.deviceListeners.forEach((fn) => fn(device));
          });
        }

        // Actualizar posiciones (esto es lo principal — GPS en tiempo real)
        if (msg.positions) {
          msg.positions.forEach((pos) => {
            this.positions.set(pos.deviceId, pos);
            this.positionListeners.forEach((fn) => fn(pos.deviceId, pos));
          });
        }

        // Eventos (alarmas, geocercas, etc.)
        if (msg.events) {
          msg.events.forEach((evt) => {
            this.eventListeners.forEach((fn) => fn(evt));
          });
        }
      } catch (err) {
        console.error('Traccar WS: Error parsing message', err);
      }
    };

    this.ws.onclose = () => {
      console.warn('⚠️ Traccar WS: Desconectado');
      this.isConnected = false;
      this.connectionListeners.forEach((fn) => fn(false));
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('❌ Traccar WS: Error', error);
      this.ws?.close();
    };
  }

  /**
   * Desconectar el WebSocket
   */
  disconnect(): void {
    this.shouldReconnect = false;
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer);
      this.wsReconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return;
    this.wsReconnectTimer = setTimeout(() => {
      console.log('🔄 Traccar WS: Reconectando...');
      this.connect();
    }, this.config.reconnectInterval);
  }

  // ─── Event Listeners ──────────────────────────────────────────

  onPosition(listener: PositionListener): () => void {
    this.positionListeners.add(listener);
    return () => this.positionListeners.delete(listener);
  }

  onDevice(listener: DeviceListener): () => void {
    this.deviceListeners.add(listener);
    return () => this.deviceListeners.delete(listener);
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  onConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  // ─── Converters ────────────────────────────────────────────────

  /**
   * Convierte un dispositivo Traccar + posición a nuestro formato Vehicle
   */
  traccarToVehicle(device: TraccarDevice, position?: TraccarPosition): Partial<Vehicle> {
    const speedKnots = position?.speed || 0;
    const speedKph = Math.round(speedKnots * 1.852);

    let status: VehicleStatus = 'offline';
    if (device.status === 'online') {
      if (speedKph > 2) status = 'moving';
      else if (position?.attributes?.ignition) status = 'idle';
      else status = 'stopped';
    }

    return {
      plate: device.name,
      unitNumber: device.name,
      alias: `${device.name} · Traccar (IMEI ${device.uniqueId})`,
      status,
      speed: speedKph,
      heading: position?.course || 0,
      lat: position?.latitude || 0,
      lng: position?.longitude || 0,
      altitude: position?.altitude || 0,
      batteryVoltage: (position?.attributes?.batteryLevel as number) || 12.6,
      ignition: (position?.attributes?.ignition as boolean) || false,
      fuelPercent: (position?.attributes?.fuel as number) || 100,
      odometer: Math.round(((position?.attributes?.totalDistance as number) || 0) / 1000),
      address: position?.address || 'Obteniendo dirección...',
      lastUpdate: position?.deviceTime || device.lastUpdate || 'Sin datos',
      isRealHardware: true,
      realGpsActive: device.status === 'online',
      realTelemetrySource: 'jt808_socket',
    };
  }

  /**
   * Obtener snapshot completo: todos los dispositivos con su última posición
   */
  async getFullSnapshot(): Promise<Array<{ device: TraccarDevice; position: TraccarPosition | null; vehicle: Partial<Vehicle> }>> {
    const [devices, positions] = await Promise.all([
      this.getDevices(),
      this.getPositions(),
    ]);

    const posMap = new Map<number, TraccarPosition>();
    positions.forEach((p) => posMap.set(p.deviceId, p));

    return devices.map((device) => {
      const position = posMap.get(device.id) || null;
      return {
        device,
        position,
        vehicle: this.traccarToVehicle(device, position || undefined),
      };
    });
  }

  // ─── Getters ───────────────────────────────────────────────────

  get connected(): boolean {
    return this.isConnected;
  }

  getDevice(id: number): TraccarDevice | undefined {
    return this.devices.get(id);
  }

  getLatestPosition(deviceId: number): TraccarPosition | undefined {
    return this.positions.get(deviceId);
  }

  getAllDevices(): TraccarDevice[] {
    return Array.from(this.devices.values());
  }

  getAllPositions(): TraccarPosition[] {
    return Array.from(this.positions.values());
  }

  // ─── Internal Fetch Wrapper ────────────────────────────────────

  private async fetchApi(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.config.serverUrl}${path}`;
    const headers: Record<string, string> = {
      ...(init?.headers as Record<string, string> || {}),
    };

    // Auth via Basic (Traccar acepta Basic Auth en todas las requests)
    const credentials = btoa(`${this.config.email}:${this.config.password}`);
    headers['Authorization'] = `Basic ${credentials}`;

    if (this.sessionCookie) {
      headers['Cookie'] = this.sessionCookie;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.requestTimeout);

    try {
      return await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
        credentials: 'include',
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

// ─── Singleton / Default Instance ────────────────────────────────

let defaultInstance: TraccarService | null = null;

/**
 * Inicializa la instancia global del servicio Traccar.
 * Llamar una vez al arrancar la app.
 */
export function initTraccar(config: TraccarConfig): TraccarService {
  if (defaultInstance) {
    defaultInstance.disconnect();
  }
  defaultInstance = new TraccarService(config);
  return defaultInstance;
}

/**
 * Obtener la instancia global de Traccar.
 */
export function getTraccar(): TraccarService | null {
  return defaultInstance;
}

// ─── Configuración desde variables de entorno (.env.local) ───────
export const TRACCAR_DEFAULT_CONFIG: TraccarConfig = {
  serverUrl: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TRACCAR_URL) || 'http://localhost:8082',
  email: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TRACCAR_EMAIL) || 'admin',
  password: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TRACCAR_PASSWORD) || 'admin',
  reconnectInterval: 5000,
  requestTimeout: 10000,
};

// ─── Configuración para servidor de producción ───────────────────
export const TRACCAR_PRODUCTION_CONFIG: TraccarConfig = {
  serverUrl: 'http://69.6.235.52:8082',
  email: 'admin@laticon.com',
  password: '', // ← Configurar en .env.local cuando migres
  reconnectInterval: 5000,
  requestTimeout: 15000,
};
