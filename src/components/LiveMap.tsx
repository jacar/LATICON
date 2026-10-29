import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Vehicle, GeofenceZone } from '../types/telematics';
import { 
  Maximize, 
  Map as MapIcon, 
  Ruler, 
  Crosshair,
  Video, 
  Zap,
  RotateCcw,
  Check
} from 'lucide-react';

export type OpenSourceTileLayer = 
  | 'google_streets'
  | 'google_hybrid'
  | 'google_traffic'
  | 'osm_standard'
  | 'osm_hot'
  | 'osm_voyager'
  | 'osm_dark'
  | 'opentopo'
  | 'satellite_open';

const OPEN_SOURCE_MAP_PROVIDERS: Record<OpenSourceTileLayer, {
  name: string;
  badge: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}> = {
  google_streets: {
    name: 'Google Maps Calles (Principal)',
    badge: 'Google Calles',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 21,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  },
  google_hybrid: {
    name: 'Google Maps Satélite Híbrido',
    badge: 'Google Satélite',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 21,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  },
  google_traffic: {
    name: 'Google Maps con Tráfico en Vivo',
    badge: 'Google Tráfico',
    url: 'https://{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 21,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  },
  osm_standard: {
    name: 'OpenStreetMap Estándar (Código Abierto)',
    badge: 'OSM Oficial',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c']
  },
  osm_hot: {
    name: 'OpenStreetMap Humanitario (HOT)',
    badge: 'OSM HOT',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c']
  },
  osm_voyager: {
    name: 'OpenStreetMap Carto Claro (Voyager)',
    badge: 'Carto OSM',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OSM',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd']
  },
  osm_dark: {
    name: 'Cartografía Oscura Monitoreo (Esri Dark Canvas)',
    badge: 'Modo Noche',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 16
  },
  opentopo: {
    name: 'OpenTopoMap (Topográfico)',
    badge: 'OpenTopo',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
    maxZoom: 17,
    subdomains: ['a', 'b', 'c']
  },
  satellite_open: {
    name: 'Satélite HD (Imágenes Globales)',
    badge: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  }
};

// Puntos de Interés Operativos LATICON geolocalizados en el teatro de operaciones (Maracaibo)
const LATICON_POIS = [
  { 
    id: 'poi-1', 
    name: 'Base Central LATICON', 
    type: 'base', 
    lat: 10.6048, 
    lng: -71.6412, 
    desc: 'Centro de Operaciones y Control de Flota 24/7',
    manager: 'Ing. Roberto Silva · Despacho',
    phone: '+58 261-700-1200'
  },
  { 
    id: 'poi-2', 
    name: 'Almacén Central & Logística', 
    type: 'warehouse', 
    lat: 10.5982, 
    lng: -71.6485, 
    desc: 'Centro de Distribución y Carga Pesada',
    manager: 'Lcdo. Marcos Peña · Logística',
    phone: '+58 261-700-1205'
  },
  { 
    id: 'poi-3', 
    name: 'Taller Mecánico Especializado', 
    type: 'workshop', 
    lat: 10.6092, 
    lng: -71.6455, 
    desc: 'Mantenimiento Preventivo, Correctivo y Patio',
    manager: 'Téc. Andrés Colmenares · Taller',
    phone: '+58 261-700-1210'
  },
  { 
    id: 'poi-4', 
    name: 'Estación de Combustible Flota', 
    type: 'fuel', 
    lat: 10.6015, 
    lng: -71.6388, 
    desc: 'Surtidor Exclusivo Diésel y Control de Tanque',
    manager: 'Operador de Patio · Combustible',
    phone: '+58 261-700-1215'
  },
  { 
    id: 'poi-5', 
    name: 'Punto Control Puerto Maracaibo', 
    type: 'port', 
    lat: 10.6285, 
    lng: -71.6082, 
    desc: 'Inspección de Embarque y Cargas Críticas',
    manager: 'Seguridad Operativa · Aduana',
    phone: '+58 261-700-1220'
  }
];

// Radares viales y puntos de control de velocidad en Maracaibo
const RADAR_CAMERAS = [
  { id: 'cam-1', name: 'Radar Av. Los Haticos (Km 4)', speedLimit: 60, lat: 10.6072, lng: -71.6335, direction: 'Ambos Sentidos' },
  { id: 'cam-2', name: 'Cámara Circunvalación 1 Sur', speedLimit: 80, lat: 10.5955, lng: -71.6425, direction: 'Norte-Sur' },
  { id: 'cam-3', name: 'Sensor Velocidad Sabaneta C.100', speedLimit: 50, lat: 10.6155, lng: -71.6505, direction: 'Este-Oeste' }
];

interface LiveMapProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle;
  onSelectVehicle: (v: Vehicle) => void;
  onOpenMDVR: (v: Vehicle) => void;
  onOpenCommands: (v: Vehicle) => void;
  geofences: GeofenceZone[];
  isDark?: boolean;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  onOpenMDVR,
  onOpenCommands,
  geofences,
  isDark = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const geofenceLayersRef = useRef<L.LayerGroup | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);
  const trafficLightLayerRef = useRef<L.LayerGroup | null>(null);
  const trailsLayerRef = useRef<L.LayerGroup | null>(null);
  const vectorsLayerRef = useRef<L.LayerGroup | null>(null);
  const rulerLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Map Tile & Mode States
  const [userLightStyle, setUserLightStyle] = useState<OpenSourceTileLayer>('google_streets');
  const [mapStyle, setMapStyle] = useState<OpenSourceTileLayer>('google_streets');
  const [showMapMenu, setShowMapMenu] = useState(false);

  // 9 Operational Function Pill States (Matches reference layout & green theme)
  const [showCircularGeofences, setShowCircularGeofences] = useState(true);
  const [autoCenter, setAutoCenter] = useState(true);
  const [showPolygonGeofences, setShowPolygonGeofences] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showPOIs, setShowPOIs] = useState(true);
  const [showTrails, setShowTrails] = useState(false);
  const [showHeadingVectors, setShowHeadingVectors] = useState(false);
  const [showTrafficLights, setShowTrafficLights] = useState(true);

  // Floating notification on toggle
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Ruler Measuring State
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [rulerPoints, setRulerPoints] = useState<L.LatLng[]>([]);
  const [rulerDistance, setRulerDistance] = useState<number>(0);

  // Auto-switch between dark native tiles and user's light-mode style
  useEffect(() => {
    if (isDark) {
      setMapStyle('osm_dark');
    } else {
      setMapStyle(showTraffic ? 'google_traffic' : userLightStyle);
    }
  }, [isDark, userLightStyle, showTraffic]);

  const handleSetMapStyle = (style: OpenSourceTileLayer) => {
    setMapStyle(style);
    if (style !== 'osm_dark') {
      setUserLightStyle(style);
    }
    setShowMapMenu(false);
    showToast(`Cartografía: ${OPEN_SOURCE_MAP_PROVIDERS[style]?.name}`);
  };

  const handleToggleTraffic = () => {
    const next = !showTraffic;
    setShowTraffic(next);
    if (next) {
      setMapStyle('google_traffic');
      showToast('🛣️ Tráfico en Vivo: Activado');
    } else {
      setMapStyle(userLightStyle || 'google_streets');
      showToast('🛣️ Tráfico en Vivo: Desactivado');
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedVehicle.lat, selectedVehicle.lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: true
    });

    const provider = OPEN_SOURCE_MAP_PROVIDERS.google_streets;
    const initialTile = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      attribution: provider.attribution,
      subdomains: provider.subdomains || 'abc'
    });
    initialTile.addTo(map);
    tileLayerRef.current = initialTile;

    geofenceLayersRef.current = L.layerGroup().addTo(map);
    poiLayerRef.current = L.layerGroup().addTo(map);
    trafficLightLayerRef.current = L.layerGroup().addTo(map);
    trailsLayerRef.current = L.layerGroup().addTo(map);
    vectorsLayerRef.current = L.layerGroup().addTo(map);
    rulerLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch Tile Layer when provider changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    mapRef.current.removeLayer(tileLayerRef.current);

    const provider = OPEN_SOURCE_MAP_PROVIDERS[mapStyle] || OPEN_SOURCE_MAP_PROVIDERS.osm_standard;
    const newLayer = L.tileLayer(provider.url, { 
      maxZoom: provider.maxZoom,
      attribution: provider.attribution,
      subdomains: provider.subdomains || 'abc'
    });
    newLayer.addTo(mapRef.current);
    tileLayerRef.current = newLayer;
  }, [mapStyle]);

  // Update Vehicle Markers (Pickup Truck with dynamic heading flip)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    Object.keys(markersRef.current).forEach(id => {
      if (!vehicles.some(v => v.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    vehicles.forEach(vehicle => {
      const isSelected = vehicle.id === selectedVehicle.id;
      const statusColor = 
        vehicle.status === 'moving' ? '#22c55e' : 
        vehicle.status === 'idle' ? '#eab308' : 
        vehicle.status === 'alert' ? '#ef4444' : '#64748b';

      const isFacingWest = vehicle.heading > 180 && vehicle.heading < 360;

      const customIconHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;position:relative;">
          <div style="
            padding: 2px 7px;
            border-radius: 6px;
            font-size: 10px;
            font-family: 'Inter',system-ui,sans-serif;
            font-weight: 700;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 1px 6px rgba(0,0,0,0.18);
            margin-bottom: 2px;
            ${isSelected
              ? 'background:#106735;color:#fff;border:1.5px solid #072b1a;'
              : 'background:rgba(255,255,255,0.97);color:#1e293b;border:1px solid #cbd5e1;'}
          ">
            <span style="width:7px;height:7px;border-radius:50%;display:inline-block;background:${statusColor};flex-shrink:0;${vehicle.status === 'moving' ? 'animation:pulse 1.5s infinite;' : ''}"></span>
            <span>${vehicle.unitNumber}</span>
            <span style="color:${isSelected ? 'rgba(255,255,255,0.88)' : '#64748b'};font-size:9px;font-weight:600;">${vehicle.speed}km/h</span>
            <span style="
              display:inline-block;
              transform:rotate(${vehicle.heading}deg);
              font-size:8px;
              color:${isSelected ? '#fff' : statusColor};
              line-height:1;
              transition:transform 0.4s ease;
            " title="Rumbo: ${vehicle.heading}°">▲</span>
            ${vehicle.mdvrChannels.some(ch => ch.status === 'streaming') ? '<span style="font-size:8px;">📹</span>' : ''}
          </div>

          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: transform 0.3s ease;
          ">
            <div style="
              width: ${isSelected ? '56px' : '46px'};
              height: ${isSelected ? '28px' : '23px'};
              display: flex;
              align-items: center;
              justify-content: center;
              transform: scaleX(${isFacingWest ? -1 : 1});
              transition: transform 0.3s ease, width 0.2s, height 0.2s;
              ${isSelected 
                ? 'filter: drop-shadow(0 0 8px rgba(16,103,53,0.95)) drop-shadow(0 2px 4px rgba(0,0,0,0.5));' 
                : 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));'}
            ">
              <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
                <!-- Pickup truck shadow base -->
                <ellipse cx="32" cy="28" rx="28" ry="3" fill="rgba(0,0,0,0.35)"/>
                <!-- Wheels -->
                <circle cx="16" cy="24" r="6" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
                <circle cx="16" cy="24" r="2.5" fill="#94a3b8"/>
                <circle cx="48" cy="24" r="6" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
                <circle cx="48" cy="24" r="2.5" fill="#94a3b8"/>
                <!-- Truck Chassis / Body -->
                <path d="M4 18C4 16 5 15 7 15H14L20 8C21.5 6 23.5 5 26 5H42C43.5 5 44.5 5.8 45.2 7L49 14H57C59.5 14 61 15.5 61 18V22C61 23 60 24 59 24H54C54 20.7 51.3 18 48 18C44.7 18 42 20.7 42 24H22C22 20.7 19.3 18 16 18C12.7 18 10 20.7 10 24H6C4.9 24 4 23.1 4 22V18Z" fill="${isSelected ? '#106735' : (vehicle.isRealHardware ? '#0f766e' : '#334155')}"/>
                <!-- Metallic trim / Door highlight -->
                <path d="M26 6.5H41.5L44.8 14H24.5L20.8 8C22 6.8 23.8 6.5 26 6.5Z" fill="#38bdf8" fill-opacity="0.75" stroke="#0284c7" stroke-width="0.8"/>
                <!-- Window divider -->
                <line x1="33" y1="6.5" x2="33" y2="14" stroke="#0f172a" stroke-width="1.2"/>
                <!-- Bed / Cargo line -->
                <path d="M46 14H59V17H46V14Z" fill="${isSelected ? '#0b4d26' : '#1e293b'}"/>
                <!-- Headlight (Yellow/Cyan active) -->
                <path d="M60 16.5H62V19.5H60V16.5Z" fill="${vehicle.status === 'moving' ? '#fde047' : '#94a3b8'}"/>
                <!-- Taillight (Red) -->
                <path d="M4 16H6V19H4V16Z" fill="#ef4444"/>
                <!-- Door handle -->
                <rect x="27" y="16.5" width="3.5" height="1" rx="0.5" fill="#f8fafc"/>
              </svg>
            </div>
          </div>

          ${isSelected ? `
            <div style="
              position:absolute;
              top:50%;left:50%;
              width:46px;height:46px;
              margin-top:6px;margin-left:-23px;
              border-radius:50%;
              border:2px solid #106735;
              opacity:0.4;
              animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
              pointer-events:none;
            "></div>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: customIconHtml,
        className: 'custom-tracker-marker',
        iconSize: [64, 50],
        iconAnchor: [32, 45]
      });

      if (markersRef.current[vehicle.id]) {
        markersRef.current[vehicle.id].setLatLng([vehicle.lat, vehicle.lng]);
        markersRef.current[vehicle.id].setIcon(customIcon);
      } else {
        const marker = L.marker([vehicle.lat, vehicle.lng], { icon: customIcon });
        marker.on('click', () => {
          onSelectVehicle(vehicle);
        });
        marker.addTo(map);
        markersRef.current[vehicle.id] = marker;
      }
    });

    if (autoCenter && selectedVehicle) {
      map.panTo([selectedVehicle.lat, selectedVehicle.lng], { animate: true, duration: 0.8 });
    }
  }, [vehicles, selectedVehicle, autoCenter]);

  // Update Geofences (Circular vs Polygon separated)
  useEffect(() => {
    if (!geofenceLayersRef.current) return;
    geofenceLayersRef.current.clearLayers();

    geofences.forEach(zone => {
      if (zone.type === 'circle' && zone.center && zone.radiusMeters) {
        if (!showCircularGeofences) return;
        L.circle(zone.center, {
          radius: zone.radiusMeters,
          color: '#106735',
          fillColor: '#106735',
          fillOpacity: 0.16,
          weight: 2.5,
          dashArray: '5, 5'
        })
          .bindTooltip(`⭕ Geocerca Circular: ${zone.name}`, { permanent: false, direction: 'center' })
          .addTo(geofenceLayersRef.current!);
      } else if (zone.type === 'polygon' && zone.coordinates) {
        if (!showPolygonGeofences) return;
        L.polygon(zone.coordinates, {
          color: '#072b1a',
          fillColor: '#106735',
          fillOpacity: 0.16,
          weight: 2.5
        })
          .bindTooltip(`☡ Zona Poligonal: ${zone.name}`, { permanent: false, direction: 'center' })
          .addTo(geofenceLayersRef.current!);
      }
    });
  }, [geofences, showCircularGeofences, showPolygonGeofences]);

  // Update Operational POIs (Bases, Almacenes, Talleres, Combustible LATICON)
  useEffect(() => {
    if (!poiLayerRef.current) return;
    poiLayerRef.current.clearLayers();
    if (!showPOIs) return;

    LATICON_POIS.forEach(poi => {
      // Icon selection per operational type
      let iconSymbol = '🏢';
      let typeLabel = 'BASE OPERATIVA';
      let tagBg = '#106735';

      if (poi.type === 'warehouse') {
        iconSymbol = '📦';
        typeLabel = 'ALMACÉN & CARGA';
        tagBg = '#0d552b';
      } else if (poi.type === 'workshop') {
        iconSymbol = '🔧';
        typeLabel = 'TALLER MECÁNICO';
        tagBg = '#072b1a';
      } else if (poi.type === 'fuel') {
        iconSymbol = '⛽';
        typeLabel = 'COMBUSTIBLE';
        tagBg = '#106735';
      } else if (poi.type === 'port') {
        iconSymbol = '⚓';
        typeLabel = 'PUERTO / ADUANA';
        tagBg = '#072b1a';
      }

      const iconHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;">
          <div style="
            background: #ffffff;
            color: #1e293b;
            padding: 3px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-family: 'Inter',system-ui,sans-serif;
            font-weight: 700;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            border: 2px solid ${tagBg};
            display: flex;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
          ">
            <span style="
              width: 20px;
              height: 20px;
              background: ${tagBg};
              color: #ffffff;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
            ">${iconSymbol}</span>
            <div style="display:flex;flex-direction:column;line-height:1.1;">
              <span style="font-size:8px;color:${tagBg};font-weight:800;letter-spacing:0.4px;">${typeLabel}</span>
              <span style="font-size:11px;font-weight:700;color:#0f172a;">${poi.name}</span>
            </div>
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${tagBg};margin-top:-1px;"></div>
        </div>
      `;

      const poiIcon = L.divIcon({
        html: iconHtml,
        className: 'poi-custom-operational-marker',
        iconSize: [160, 34],
        iconAnchor: [80, 34]
      });

      const marker = L.marker([poi.lat, poi.lng], { icon: poiIcon });
      marker.bindPopup(`
        <div style="font-family:'Inter',system-ui,sans-serif;padding:6px;min-width:210px;">
          <div style="display:flex;align-items:center;gap:6px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;">
            <span style="font-size:16px;">${iconSymbol}</span>
            <div>
              <div style="font-size:9px;font-weight:800;color:#106735;text-transform:uppercase;">${typeLabel}</div>
              <div style="font-weight:bold;color:#0f172a;font-size:13px;">${poi.name}</div>
            </div>
          </div>
          <div style="font-size:11px;color:#334155;margin-top:6px;line-height:1.4;">${poi.desc}</div>
          <div style="margin-top:6px;padding:4px 6px;background:#f8fafc;border-radius:6px;font-size:10px;color:#64748b;">
            <div>👤 <strong>Responsable:</strong> ${poi.manager}</div>
            <div>📞 <strong>Teléfono:</strong> ${poi.phone}</div>
            <div style="font-family:monospace;margin-top:2px;color:#94a3b8;">Coord: ${poi.lat.toFixed(4)}, ${poi.lng.toFixed(4)}</div>
          </div>
        </div>
      `);
      marker.addTo(poiLayerRef.current!);
    });
  }, [showPOIs]);

  // Update Radars & Traffic Speed Cameras
  useEffect(() => {
    if (!trafficLightLayerRef.current) return;
    trafficLightLayerRef.current.clearLayers();
    if (!showTrafficLights) return;

    RADAR_CAMERAS.forEach(radar => {
      const iconHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;">
          <div style="
            background: #072b1a;
            color: #ffffff;
            padding: 2px 7px;
            border-radius: 6px;
            font-size: 10px;
            font-family: 'Inter',system-ui,sans-serif;
            font-weight: 800;
            border: 1.5px solid #22c55e;
            box-shadow: 0 3px 8px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          ">
            <span style="
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: #ef4444;
              box-shadow: 0 0 5px #ef4444;
              animation: pulse 1s infinite;
            "></span>
            <span style="color:#facc15;font-size:9px;">RADAR</span>
            <span style="background:#ef4444;color:#ffffff;padding:0.5px 4px;border-radius:4px;font-size:9px;font-weight:900;">${radar.speedLimit}km/h</span>
          </div>
          <div style="width:2px;height:5px;background:#22c55e;"></div>
          <div style="width:5px;height:5px;border-radius:50%;background:#072b1a;border:1px solid #22c55e;margin-top:-2px;"></div>
        </div>
      `;

      const radarIcon = L.divIcon({
        html: iconHtml,
        className: 'radar-marker',
        iconSize: [90, 24],
        iconAnchor: [45, 24]
      });

      const marker = L.marker([radar.lat, radar.lng], { icon: radarIcon });
      marker.bindPopup(`
        <div style="font-family:'Inter',system-ui,sans-serif;padding:6px;min-width:180px;">
          <div style="font-weight:bold;color:#072b1a;font-size:12px;display:flex;align-items:center;gap:4px;">
            <span>🚦</span> ${radar.name}
          </div>
          <div style="font-size:11px;color:#ef4444;font-weight:700;margin-top:3px;">
            Límite Máximo: ${radar.speedLimit} km/h
          </div>
          <div style="font-size:10px;color:#64748b;margin-top:2px;">Sentido: ${radar.direction}</div>
          <div style="font-size:9px;color:#94a3b8;margin-top:3px;">Monitoreo telemático y fotomultas activo</div>
        </div>
      `);
      marker.addTo(trafficLightLayerRef.current!);
    });
  }, [showTrafficLights]);

  // Real-time Vehicle Breadcrumb Trails (Clean, road-aligned, no unnatural protruding lines or sticks)
  useEffect(() => {
    if (!vectorsLayerRef.current || !trailsLayerRef.current) return;
    vectorsLayerRef.current.clearLayers();
    trailsLayerRef.current.clearLayers();

    // If trails are disabled, layers remain completely clean
    if (!showTrails && !showHeadingVectors) return;

    // Only if operator explicitly turns on trails, render subtle fading breadcrumbs for moving units
    if (showTrails) {
      vehicles.forEach(v => {
        if (v.status === 'moving' && v.speed > 5) {
          // Draw subtle discrete breadcrumb point behind the vehicle
          const rad = (v.heading - 180) * (Math.PI / 180);
          const p1: [number, number] = [v.lat + 0.0006 * Math.cos(rad), v.lng + 0.0006 * Math.sin(rad)];
          
          L.circleMarker(p1, {
            radius: 3,
            color: '#106735',
            fillColor: '#22c55e',
            fillOpacity: 0.6,
            weight: 1.5
          }).addTo(trailsLayerRef.current!);
        }
      });
    }
  }, [vehicles, showTrails, showHeadingVectors]);

  // Interactive Ruler Measuring Logic
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (!isRulerActive) {
      if (rulerLayerRef.current) {
        rulerLayerRef.current.clearLayers();
      }
      setRulerPoints([]);
      setRulerDistance(0);
      map.getContainer().style.cursor = '';
      return;
    }

    map.getContainer().style.cursor = 'crosshair';

    const handleClick = (e: L.LeafletMouseEvent) => {
      const latlng = e.latlng;
      setRulerPoints(prev => {
        const next = [...prev, latlng];
        if (rulerLayerRef.current) {
          rulerLayerRef.current.clearLayers();
          
          next.forEach((pt, idx) => {
            const marker = L.circleMarker(pt, {
              radius: 6,
              color: '#106735',
              fillColor: '#ffffff',
              fillOpacity: 1,
              weight: 3
            });
            marker.bindTooltip(idx === 0 ? 'Pto Inicio' : `Pto ${idx + 1}`, { 
              permanent: true, 
              direction: 'top', 
              offset: [0, -6] 
            });
            marker.addTo(rulerLayerRef.current!);
          });

          if (next.length > 1) {
            const polyline = L.polyline(next, {
              color: '#106735',
              weight: 3.5,
              dashArray: '6, 6'
            });
            polyline.addTo(rulerLayerRef.current!);

            let totalDist = 0;
            for (let i = 0; i < next.length - 1; i++) {
              totalDist += next[i].distanceTo(next[i + 1]);
            }
            setRulerDistance(totalDist);

            const lastPt = next[next.length - 1];
            const distLabel = totalDist >= 1000 
              ? `${(totalDist / 1000).toFixed(2)} km` 
              : `${Math.round(totalDist)} m`;

            L.popup({ closeButton: false, offset: [0, -10] })
              .setLatLng(lastPt)
              .setContent(`<div style="font-weight:700;color:#106735;font-size:12px;font-family:sans-serif;">📏 ${distLabel}</div>`)
              .openOn(map);
          }
        }
        return next;
      });
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isRulerActive]);

  const handleRecenter = () => {
    if (mapRef.current && selectedVehicle) {
      mapRef.current.setView([selectedVehicle.lat, selectedVehicle.lng], 17, { animate: true });
      showToast(`🎯 Centrado en Unidad #${selectedVehicle.unitNumber}`);
    }
  };

  const handleFitAll = () => {
    if (!mapRef.current || vehicles.length === 0) return;
    const bounds = L.latLngBounds(vehicles.map(v => [v.lat, v.lng]));
    mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    showToast('Flota Completa Encuadrada');
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      showToast('Pantalla Completa Activada');
    } else {
      document.exitFullscreen();
      showToast('Pantalla Completa Desactivada');
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none font-sans">
      {/* Map Target Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 transition-all duration-300" 
      />

      {/* Floating Speedometer & Quick Telemetry HUD (Corporate Green) */}
      <div className="absolute top-4 left-4 z-20 hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 text-xs text-[#111111] shadow-lg">
        <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
          <div className="w-3 h-3 rounded-full bg-[#106735] animate-pulse"></div>
          <div>
            <div className="text-[10px] text-[#6C757D] uppercase font-mono">Unidad Activa</div>
            <div className="font-bold text-[#106735] text-sm">#{selectedVehicle.unitNumber} • {selectedVehicle.plate}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] text-[#6C757D]">Velocidad</div>
            <div className="font-bold text-sm font-mono text-[#106735]">{selectedVehicle.speed} km/h</div>
          </div>
          <div>
            <div className="text-[10px] text-[#6C757D]">Ignición</div>
            <div className={`font-bold text-sm ${selectedVehicle.ignition ? 'text-[#106735]' : 'text-slate-500'}`}>
              {selectedVehicle.ignition ? 'ENCENDIDA' : 'APAGADA'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#6C757D]">MDVR Streams</div>
            <div className="font-bold text-sm text-[#106735] font-mono">
              {selectedVehicle.mdvrChannels.filter(c => c.status === 'streaming').length}/4 Canales
            </div>
          </div>
        </div>

        <div className="pl-2 border-l border-slate-200 flex items-center gap-1.5">
          <button
            onClick={() => onOpenMDVR(selectedVehicle)}
            className="px-2.5 py-1 bg-[#106735] hover:bg-[#0d552b] text-white font-bold rounded-lg text-xs flex items-center gap-1 transition shadow-xs"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Ver MDVR</span>
          </button>
          <button
            onClick={() => onOpenCommands(selectedVehicle)}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs flex items-center gap-1 transition"
            title="Enviar comando remoto"
          >
            <Zap className="w-3.5 h-3.5 text-[#106735]" />
          </button>
        </div>
      </div>

      {/* QUICK FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#072b1a]/95 text-white backdrop-blur-md px-4 py-1.5 rounded-full shadow-2xl border border-[#106735] text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* RULER MEASUREMENT ACTIVE NOTIFICATION BADGE */}
      {isRulerActive && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-xl text-xs font-semibold text-slate-800">
          <div className="flex items-center gap-1.5 text-[#106735]">
            <Ruler className="w-4 h-4" />
            <span>Modo Medición:</span>
          </div>
          <span className="text-slate-600">Haz clic en el mapa para trazar puntos.</span>
          <span className="bg-[#106735] text-white px-2 py-0.5 rounded font-mono font-bold">
            {rulerDistance >= 1000 ? `${(rulerDistance / 1000).toFixed(2)} km` : `${Math.round(rulerDistance)} m`}
          </span>
          <button
            onClick={() => {
              if (rulerLayerRef.current) rulerLayerRef.current.clearLayers();
              setRulerPoints([]);
              setRulerDistance(0);
            }}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition"
            title="Reiniciar trazado"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reiniciar</span>
          </button>
        </div>
      )}

      {/* TOP MAP FLOATING TOOLBAR (MATCHING USER REFERENCE LAYOUT & COLOR VERDE) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 flex-wrap">
        {/* GROUP 1: LEFT 4 SEPARATE WHITE BUTTONS */}
        <div className="flex items-center gap-2">
          {/* Button 1: Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl shadow-md border border-slate-200 flex items-center justify-center transition active:scale-95"
            title="Pantalla Completa"
          >
            <Maximize className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Button 2: Map Styles Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMapMenu(!showMapMenu)}
              className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl shadow-md border border-slate-200 flex items-center justify-center transition active:scale-95"
              title="Capas y Estilos de Cartografía"
            >
              <MapIcon className="w-5 h-5 stroke-[2.2]" />
            </button>

            {showMapMenu && (
              <div className="absolute right-0 top-full mt-2 flex flex-col bg-white border border-slate-200 rounded-xl shadow-2xl py-2 w-64 text-xs text-slate-800 z-50">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#6C757D] tracking-wider border-b border-slate-100">
                  Estilos de Mapa (Google & OSM)
                </div>
                {(Object.keys(OPEN_SOURCE_MAP_PROVIDERS) as OpenSourceTileLayer[]).map(key => {
                  const prov = OPEN_SOURCE_MAP_PROVIDERS[key];
                  const isCurrent = mapStyle === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSetMapStyle(key)}
                      className={`px-3 py-2 text-left hover:bg-slate-100 flex items-center justify-between transition ${
                        isCurrent ? 'text-[#106735] font-bold bg-[#106735]/10' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{prov.name}</span>
                      {isCurrent && <span className="text-[#106735] font-bold ml-1">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Button 3: Ruler / Distance Measure */}
          <button
            onClick={() => {
              const next = !isRulerActive;
              setIsRulerActive(next);
              showToast(next ? '📏 Modo Medición Activado' : '📏 Modo Medición Desactivado');
            }}
            className={`w-10 h-10 rounded-xl shadow-md border flex items-center justify-center transition active:scale-95 ${
              isRulerActive 
                ? 'bg-[#106735] text-white border-[#106735]' 
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title="Herramienta de Medición / Regla"
          >
            <Ruler className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Button 4: Recenter Selected Unit */}
          <button
            onClick={handleRecenter}
            className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl shadow-md border border-slate-200 flex items-center justify-center transition active:scale-95"
            title="Centrar en Vehículo Seleccionado"
          >
            <Crosshair className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* GROUP 2: CENTER PILL WITH 9 CORPORATE GREEN OPERATIONAL BUTTONS */}
        {/* EXACT CONTRAST LIKE REFERENCE: Active = Corporate Green #106735, Inactive = White like button 4 */}
        <div className="flex items-center bg-[#106735] border-2 border-white rounded-2xl shadow-xl overflow-hidden p-0.5">
          {/* 1. Circular Geofences Toggle */}
          <button
            onClick={() => {
              const next = !showCircularGeofences;
              setShowCircularGeofences(next);
              showToast(next ? '⭕ Geocercas Circulares: ACTIVADAS' : '⭕ Geocercas Circulares: OCULTAS');
            }}
            className={`w-10 h-10 flex items-center justify-center transition border-r border-[#15793e]/50 ${
              showCircularGeofences
                ? 'bg-[#106735] text-white hover:bg-[#0d552b]'
                : 'bg-white text-slate-600 hover:text-[#106735] hover:bg-slate-50'
            }`}
            title={showCircularGeofences ? 'Geocercas Circulares: ACTIVADAS' : 'Geocercas Circulares: DESACTIVADAS'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity={showCircularGeofences ? "0.35" : "0"} />
            </svg>
          </button>

          {/* 2. Fit Bounds (All Fleet) */}
          <button
            onClick={handleFitAll}
            className="w-10 h-10 flex items-center justify-center bg-[#106735] hover:bg-[#0d552b] text-white transition border-r border-[#15793e]/50 active:scale-95"
            title="Encuadrar Toda la Flota (Fit Bounds)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8V4h4" />
              <path d="M20 8V4h-4" />
              <path d="M4 16v4h4" />
              <path d="M20 16v4h-4" />
              <path d="m9 15 6-6" />
              <path d="M15 9h-4" />
              <path d="M15 9v4" />
            </svg>
          </button>

          {/* 3. Auto-Center / Live Follow Toggle */}
          <button
            onClick={() => {
              const next = !autoCenter;
              setAutoCenter(next);
              showToast(next ? '↗ Auto-Seguimiento: ACTIVADO' : '↗ Auto-Seguimiento: DESACTIVADO');
            }}
            className={`w-10 h-10 flex items-center justify-center transition border-r border-[#15793e]/50 ${
              autoCenter
                ? 'bg-[#106735] text-white hover:bg-[#0d552b]'
                : 'bg-white text-slate-600 hover:text-[#106735] hover:bg-slate-50'
            }`}
            title={autoCenter ? 'Seguimiento Automático: ACTIVADO' : 'Seguimiento Automático: DESACTIVADO'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
          </button>

          {/* 4. Polygon Geofences & Nodes Toggle (White when OFF like reference!) */}
          <button
            onClick={() => {
              const next = !showPolygonGeofences;
              setShowPolygonGeofences(next);
              showToast(next ? '☡ Geocercas Poligonales: ACTIVADAS' : '☡ Geocercas Poligonales: OCULTAS');
            }}
            className={`w-10 h-10 flex items-center justify-center transition border-r border-[#15793e]/50 ${
              showPolygonGeofences
                ? 'bg-[#106735] text-white hover:bg-[#0d552b]'
                : 'bg-white text-slate-600 hover:text-[#106735] hover:bg-slate-50'
            }`}
            title={showPolygonGeofences ? 'Geocercas Poligonales: ACTIVADAS' : 'Geocercas Poligonales: DESACTIVADAS'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="7" r="2.5" fill="currentColor" />
              <circle cx="18" cy="7" r="2.5" fill="currentColor" />
              <circle cx="12" cy="18" r="2.5" fill="currentColor" />
              <line x1="8.5" y1="7" x2="15.5" y2="7" />
              <line x1="7.5" y1="9" x2="11" y2="16" />
              <line x1="16.5" y1="9" x2="13" y2="16" />
            </svg>
          </button>

          {/* 5. Live Traffic & Road Highways Layer */}
          <button
            onClick={handleToggleTraffic}
            className={`w-10 h-10 flex items-center justify-center transition border-r border-[#15793e]/50 ${
              showTraffic
                ? 'bg-[#106735] text-white hover:bg-[#0d552b]'
                : 'bg-white text-slate-600 hover:text-[#106735] hover:bg-slate-50'
            }`}
            title={showTraffic ? 'Tráfico en Vivo: ACTIVADO' : 'Tráfico en Vivo: DESACTIVADO'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20L8 4" />
              <path d="M20 20L16 4" />
              <line x1="12" y1="5" x2="12" y2="8" strokeDasharray="1 1" />
              <line x1="12" y1="11" x2="12" y2="14" strokeDasharray="1 1" />
              <line x1="12" y1="17" x2="12" y2="20" strokeDasharray="1 1" />
            </svg>
          </button>

          {/* 6. POIs (Bases & Almacenes Operativos LATICON) */}
          <button
            onClick={() => {
              const next = !showPOIs;
              setShowPOIs(next);
              showToast(next ? '📍 Puntos de Interés LATICON: VISIBLES' : '📍 Puntos de Interés LATICON: OCULTOS');
            }}
            className={`w-10 h-10 flex items-center justify-center transition border-r border-[#15793e]/50 ${
              showPOIs
                ? 'bg-[#106735] text-white hover:bg-[#0d552b]'
                : 'bg-white text-slate-600 hover:text-[#106735] hover:bg-slate-50'
            }`}
            title={showPOIs ? 'Puntos de Interés LATICON: VISIBLES' : 'Puntos de Interés LATICON: OCULTOS'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
          </button>

          {/* 7. Fleet Movement Trails / Breadcrumbs */}
          <button
            onClick={() => {
              const next = !showTrails;
              setShowTrails(next);
              showToast(next ? '↗≡ Rastros de Flota: ACTIVADOS' : '↗≡ Rastros de Flota: OCULTOS');
            }}
            className={`w-10 h-10 flex items-center justify-center transition border-r border-[#15793e]/50 ${
              showTrails
                ? 'bg-[#106735] text-white hover:bg-[#0d552b]'
                : 'bg-white text-slate-600 hover:text-[#106735] hover:bg-slate-50'
            }`}
            title={showTrails ? 'Rastros de Flota: ACTIVADOS' : 'Rastros de Flota: DESACTIVADOS'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4l9 9-4 1-1 4-4-14z" fill="currentColor" />
              <line x1="3" y1="12" x2="8" y2="12" />
              <line x1="4" y1="16" x2="9" y2="16" />
              <line x1="5" y1="20" x2="10" y2="20" />
            </svg>
          </button>

          {/* 8. Direction & Speed Vectors */}
          <button
            onClick={() => {
              const next = !showHeadingVectors;
              setShowHeadingVectors(next);
              showToast(next ? '🏹 Vectores de Velocidad/Rumbo: VISIBLES' : '🏹 Vectores de Velocidad: OCULTOS');
            }}
            className={`w-10 h-10 flex items-center justify-center transition border-r border-[#15793e]/50 ${
              showHeadingVectors
                ? 'bg-[#106735] text-white hover:bg-[#0d552b]'
                : 'bg-white text-slate-600 hover:text-[#106735] hover:bg-slate-50'
            }`}
            title={showHeadingVectors ? 'Vectores de Velocidad/Rumbo: VISIBLES' : 'Vectores de Velocidad/Rumbo: OCULTOS'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="19" x2="19" y2="5" />
              <polyline points="10 5 19 5 19 14" />
              <line x1="6" y1="15" x2="9" y2="18" />
            </svg>
          </button>

          {/* 9. Traffic Lights & Speed Radars */}
          <button
            onClick={() => {
              const next = !showTrafficLights;
              setShowTrafficLights(next);
              showToast(next ? '🚦 Semáforos y Radares: VISIBLES' : '🚦 Semáforos y Radares: OCULTOS');
            }}
            className={`w-10 h-10 flex items-center justify-center transition ${
              showTrafficLights
                ? 'bg-[#106735] text-white hover:bg-[#0d552b]'
                : 'bg-white text-slate-600 hover:text-[#106735] hover:bg-slate-50'
            }`}
            title={showTrafficLights ? 'Semáforos y Radares: VISIBLES' : 'Semáforos y Radares: OCULTOS'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="7" y="3" width="10" height="18" rx="5" />
              <circle cx="12" cy="7.5" r="1.8" fill="currentColor" />
              <circle cx="12" cy="12" r="1.8" fill="currentColor" />
              <circle cx="12" cy="16.5" r="1.8" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* GROUP 3: RIGHT PILL WITH ZOOM IN / ZOOM OUT */}
        <div className="flex items-center bg-white rounded-2xl shadow-md border border-slate-200 h-11 px-1">
          <button
            onClick={() => {
              mapRef.current?.zoomIn();
              showToast('🔍 Acercar (+)');
            }}
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-xl transition active:scale-95"
            title="Acercar mapa (+)"
          >
            +
          </button>
          <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />
          <button
            onClick={() => {
              mapRef.current?.zoomOut();
              showToast('🔍 Alejar (−)');
            }}
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-xl transition active:scale-95"
            title="Alejar mapa (−)"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
};
