export type VehicleStatus = 'moving' | 'idle' | 'stopped' | 'offline' | 'alert';

export interface GSensorData {
  x: number;
  y: number;
  z: number;
  harshBraking: boolean;
  harshAccel: boolean;
  harshCornering: boolean;
  collisionDetected: boolean;
}

export interface MDVRChannel {
  id: string;
  channel: 'CH1' | 'CH2' | 'CH3' | 'CH4';
  name: string;
  type: 'road_adas' | 'driver_dsm' | 'cargo' | 'blind_spot';
  status: 'streaming' | 'standby' | 'recording' | 'error';
  resolution: '1080P' | '720P' | 'D1';
  fps: number;
  bitrateKbps: number;
  nightVision: boolean;
  audioActive: boolean;
  adasWarnings?: string[];
  dsmWarnings?: string[];
}

export interface MDVRConfig {
  deviceId: string;
  ipAddress: string;
  port: number;
  protocol: 'JT808' | 'JT1078' | 'RTSP' | 'RTMP' | 'WebRTC';
  apn: string;
  subStreamBitrate: number;
  mainStreamBitrate: number;
  encoding: 'H.264' | 'H.265';
  adasEnabled: boolean;
  adasSensitivity: 'baja' | 'media' | 'alta';
  dsmEnabled: boolean;
  dsmFatigueSensitivity: 'baja' | 'media' | 'alta';
  dsmPhoneDetection: boolean;
  dsmSmokingDetection: boolean;
  gSensorThresholdBraking: number; // m/s2
  gSensorThresholdAccel: number; // m/s2
  storageType: 'Dual SD' | 'SSD 512GB' | 'SSD 1TB';
  storageUsedPercent: number;
  preRecordSec: number;
  postRecordSec: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  unitNumber: string;
  alias: string;
  model: string;
  year: number;
  driverName: string;
  driverPhone: string;
  group: string;
  status: VehicleStatus;
  speed: number; // kph
  heading: number; // 0-360 deg
  lat: number;
  lng: number;
  altitude: number;
  odometer: number; // km
  tripDistance: number; // km
  fuelPercent: number;
  batteryVoltage: number; // V
  ignition: boolean;
  engineTemp: number; // °C
  lastUpdate: string;
  parkingDuration: string;
  address: string;
  gSensor: GSensorData;
  mdvrChannels: MDVRChannel[];
  mdvrConfig: MDVRConfig;
  trafficLightAlerts: number;
  harshEventsCount: number;
  selected?: boolean;
  isRealHardware?: boolean;
  realGpsActive?: boolean;
  realVideoActive?: boolean;
  realTelemetrySource?: 'gps_hardware' | 'browser_gnss' | 'jt808_socket';
  realStreamUrl?: string;
  iconIndex?: number; // 1-8, maps to /icons/{n}.png custom marker images
}

export interface TelemetryEvent {
  id: string;
  vehicleId: string;
  plate: string;
  timestamp: string;
  type: 'harsh_braking' | 'harsh_accel' | 'speeding' | 'traffic_light' | 'dsm_fatigue' | 'dsm_phone' | 'panic_button' | 'geofence_exit' | 'fuel_drop' | 'camera_tamper';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  speed: number;
  lat: number;
  lng: number;
  address: string;
  hasVideoClip: boolean;
  clipDurationSec?: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Operador' | 'Monitorista' | 'Auditor';
  status: 'active' | 'suspended';
  assignedPlatesCount: number;
  lastLogin: string;
  permissions: {
    liveTracking: boolean;
    mdvrLiveView: boolean;
    engineCutCommand: boolean;
    exportReports: boolean;
    manageUsers: boolean;
    configMDVR: boolean;
  };
}

export interface MaintenanceService {
  id: string;
  vehiclePlate: string;
  title: string;
  category: 'Cambio de Aceite' | 'Frenos y Pastillas' | 'Rotación de Neumáticos' | 'Calibración MDVR / Sensores' | 'Filtros y Bujías';
  dueKm: number;
  currentKm: number;
  status: 'ok' | 'warning' | 'urgent';
  scheduledDate: string;
  estimatedCostUsd: number;
}

export interface ApiGatewayTemplate {
  id: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  authType: 'Bearer JWT' | 'API Key';
  responseFormat: 'JSON' | 'GeoJSON' | 'Protobuf';
  rateLimit: string;
  active: boolean;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  color: string;
  center?: [number, number];
  radiusMeters?: number;
  coordinates?: [number, number][];
  speedLimit: number;
  alertOnEntry: boolean;
  alertOnExit: boolean;
  active: boolean;
}
