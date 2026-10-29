/**
 * Real Hardware & Live Telemetry Service
 * Handles actual device GPS coordinates, real video feed (USB/IP), and open Nominatim reverse geocoding.
 */

export interface RealGpsResult {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number; // kph
  heading: number;
  altitude: number;
  address: string;
}

/**
 * Obtains real GPS coordinates from the device / browser GNSS receiver
 */
export async function fetchRealDeviceGps(): Promise<RealGpsResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada en este entorno.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const speedKph = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0;
        const heading = position.coords.heading || 0;
        const altitude = position.coords.altitude || 15;
        const accuracy = Math.round(position.coords.accuracy || 5);

        // Fetch real street address from OpenStreetMap Nominatim (Free & Open)
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              address = data.display_name;
            }
          }
        } catch (err) {
          console.warn('Nominatim reverse geocode fallback:', err);
        }

        resolve({
          lat,
          lng,
          accuracy,
          speed: speedKph,
          heading,
          altitude,
          address
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Starts continuous live real GPS watch
 */
export function watchRealDeviceGps(
  onUpdate: (coords: { lat: number; lng: number; speed: number; heading: number }) => void,
  onError?: (err: GeolocationPositionError) => void
): number | null {
  if (!navigator.geolocation) return null;

  return navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        speed: position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0,
        heading: position.coords.heading || 0
      });
    },
    (err) => {
      if (onError) onError(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000
    }
  );
}

/**
 * Connects to physical camera video feed via WebRTC / USB camera / local IP
 */
export async function startRealPhysicalCameraFeed(): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('La interfaz de medios no está disponible.');
  }

  return await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'environment'
    },
    audio: false
  });
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TRACCAR GPS SERVER SERVICE (REST API + WebSocket Live Telemetry)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface TraccarConfig {
  host: string;
  port: number;
  email: string;
  password: string;
  useHttps?: boolean;
}

export const DEFAULT_TRACCAR_CONFIG: TraccarConfig = {
  host: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TRACCAR_HOST) || 'localhost',
  port: Number((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TRACCAR_PORT)) || 8082,
  email: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TRACCAR_EMAIL) || 'ovalle_938@hotmail.com',
  password: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TRACCAR_PASSWORD) || '123456789',
  useHttps: false,
};

export interface TraccarDevice {
  id: number;
  name: string;
  uniqueId: string; // IMEI
  status: 'online' | 'offline' | 'unknown';
  lastUpdate: string;
  positionId: number;
  groupId: number;
  phone?: string;
  model?: string;
  category?: string;
  disabled?: boolean;
}

export interface TraccarPosition {
  id: number;
  deviceId: number;
  protocol: string;
  deviceTime: string;
  fixTime: string;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number; // knots -> x 1.852 = km/h
  course: number;
  address?: string;
  attributes: {
    ignition?: boolean;
    motion?: boolean;
    fuel?: number;
    batteryLevel?: number;
    voltage?: number;
    odometer?: number;
    [key: string]: unknown;
  };
}

export interface TraccarCallbacks {
  onDevices?: (devices: TraccarDevice[]) => void;
  onPositions?: (positions: TraccarPosition[]) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

export type TraccarConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

class TraccarService {
  private config: TraccarConfig = DEFAULT_TRACCAR_CONFIG;
  private ws: WebSocket | null = null;
  private callbacks: TraccarCallbacks = {};
  private connectionState: TraccarConnectionState = 'disconnected';
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;

  private get baseUrl(): string {
    const proto = this.config.useHttps ? 'https' : 'http';
    return `${proto}://${this.config.host}:${this.config.port}/api`;
  }

  private get wsUrl(): string {
    const proto = this.config.useHttps ? 'wss' : 'ws';
    return `${proto}://${this.config.host}:${this.config.port}/api/socket`;
  }

  getConnectionState(): TraccarConnectionState {
    return this.connectionState;
  }

  async connect(config: TraccarConfig, callbacks: TraccarCallbacks): Promise<boolean> {
    this.config = config;
    this.callbacks = callbacks;
    this.connectionState = 'connecting';
    this.reconnectAttempts = 0;

    try {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        this.connectionState = 'error';
        callbacks.onError?.('Credenciales incorrectas o servidor Traccar no disponible');
        return false;
      }
      this.connectWebSocket();
      return true;
    } catch (err: any) {
      this.connectionState = 'error';
      callbacks.onError?.(`Error de conexión Traccar: ${err?.message || err}`);
      return false;
    }
  }

  private async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email: this.config.email,
          password: this.config.password,
        }),
        credentials: 'include',
      });
      return response.ok;
    } catch (err) {
      console.warn('[Traccar] No se pudo autenticar:', err);
      return false;
    }
  }

  private connectWebSocket(): void {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.callbacks.onConnected?.();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.devices) this.callbacks.onDevices?.(data.devices);
          if (data.positions) this.callbacks.onPositions?.(data.positions);
        } catch (e) {
          console.error('[Traccar] Error procesando WS:', e);
        }
      };

      this.ws.onerror = () => {
        this.connectionState = 'error';
        this.callbacks.onError?.('Error en WebSocket Traccar');
      };

      this.ws.onclose = () => {
        this.connectionState = 'disconnected';
        this.callbacks.onDisconnected?.();
        this.scheduleReconnect();
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= 8) return;
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(async () => {
      const ok = await this.authenticate();
      if (ok) this.connectWebSocket();
    }, 5000);
  }

  async getDevices(): Promise<TraccarDevice[]> {
    try {
      const res = await fetch(`${this.baseUrl}/devices`, { credentials: 'include' });
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    }
  }

  async getPositions(): Promise<TraccarPosition[]> {
    try {
      const res = await fetch(`${this.baseUrl}/positions`, { credentials: 'include' });
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
    this.connectionState = 'disconnected';
  }

  static positionToVehicleUpdate(pos: TraccarPosition) {
    return {
      lat: pos.latitude,
      lng: pos.longitude,
      altitude: pos.altitude,
      speed: Math.round((pos.speed || 0) * 1.852), // knots -> km/h
      heading: pos.course || 0,
      address: pos.address || 'GPS en vivo Traccar',
      lastUpdate: new Date(pos.fixTime || pos.deviceTime).toLocaleTimeString('es-VE'),
      ignition: pos.attributes?.ignition ?? true,
      fuelPercent: pos.attributes?.fuel ?? 100,
      batteryVoltage: pos.attributes?.voltage ? Number(pos.attributes.voltage) / 1000 : 13.8,
      status: ((pos.speed || 0) > 0.5 ? 'moving' : 'stopped') as 'moving' | 'stopped',
    };
  }
}

export const traccarService = new TraccarService();

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RENDER PRODUCTION BACKEND CLIENT (webcin-tracker-prod.onrender.com)
 * Servicio ID: srv-dbhltp142hec73cqhqd0
 * Incluye política de reintentos y timeout de 60s para Cold Starts de Render
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const RENDER_CONFIG = {
  baseUrl: (import.meta as any).env?.VITE_API_BASE_URL || 'https://webcin-tracker-prod.onrender.com',
  serviceId: (import.meta as any).env?.VITE_RENDER_SERVICE_ID || 'srv-dbhltp142hec73cqhqd0',
  timeoutMs: 60000, // 60 segundos para permitir que la instancia de Render despierte
  maxRetries: 3,
  retryDelayMs: 3000
};

export interface RenderRequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

/**
 * Fetch con timeout configurable (60s por defecto) y reintentos automáticos
 */
export async function fetchWithRenderRetries(
  endpoint: string,
  options: RenderRequestOptions = {}
): Promise<Response> {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${RENDER_CONFIG.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const timeoutMs = options.timeoutMs ?? RENDER_CONFIG.timeoutMs;
  const maxRetries = options.retries ?? RENDER_CONFIG.maxRetries;

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (attempt > 1) {
        console.warn(`[Render API] Reintento ${attempt}/${maxRetries} hacia ${url}... (despertando servidor)`);
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timer);
      return response;
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;

      const isTimeout = err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('aborted');
      console.warn(`[Render API] Intento ${attempt} fallido (${isTimeout ? 'Timeout 60s' : err.message})`);

      if (attempt < maxRetries) {
        // Espera con backoff exponencial antes de reintentar
        const delay = RENDER_CONFIG.retryDelayMs * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`[Render API] Falló la petición a ${url} tras ${maxRetries} intentos (Timeout 60s). Causa: ${lastError?.message || lastError}`);
}

/**
 * Ping para despertar la instancia de Render si está dormida
 */
export async function wakeUpRenderBackend(onStatusChange?: (status: 'waking' | 'online' | 'error') => void): Promise<boolean> {
  onStatusChange?.('waking');
  console.log('[Render API] Despertando instancia de Render (srv-dbhltp142hec73cqhqd0)...');
  
  try {
    const res = await fetchWithRenderRetries('/health', { timeoutMs: 65000, retries: 2 });
    if (res.ok) {
      onStatusChange?.('online');
      console.log('[Render API] ✅ Servidor Render despierto y operativo');
      return true;
    }
    // Si no tiene /health pero responde HTTP
    onStatusChange?.('online');
    return true;
  } catch (err) {
    try {
      // Intento alternativo en root '/'
      const resRoot = await fetchWithRenderRetries('/', { timeoutMs: 65000, retries: 2 });
      if (resRoot.status < 500) {
        onStatusChange?.('online');
        return true;
      }
    } catch (e) {
      // Ignorar fallback
    }
    onStatusChange?.('error');
    console.warn('[Render API] Servidor en Render aún no respondió al ping:', err);
    return false;
  }
}
