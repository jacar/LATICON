import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Vehicle } from '../types/telematics';
import { 
  History, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Clock, 
  MapPin, 
  Gauge, 
  FastForward,
  Navigation,
  Layers
} from 'lucide-react';

interface RouteHistoryViewProps {
  vehicle: Vehicle;
  isDark?: boolean;
}

export const RouteHistoryView: React.FC<RouteHistoryViewProps> = ({ vehicle, isDark = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5 | 10>(1);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Simulated route track points
  const routePoints = [
    { time: '08:00:15', speed: 0, lat: 10.6010, lng: -71.6460, event: 'Inicio de Ignición en Patio' },
    { time: '08:14:22', speed: 38, lat: 10.6025, lng: -71.6445, event: 'Tránsito Calle 102' },
    { time: '08:32:00', speed: 54, lat: 10.6038, lng: -71.6432, event: 'Av. 49B Velocidad Estable' },
    { time: '08:55:10', speed: 0, lat: 10.6065, lng: -71.6415, event: 'Parada en Cliente (22 min)' },
    { time: '09:25:40', speed: 45, lat: 10.6092, lng: -71.6385, event: 'Retorno por Circunvalación' },
    { time: '10:00:00', speed: 0, lat: 10.6038, lng: -71.6432, event: 'Estacionamiento Actual' }
  ];

  const currentPointIndex = Math.min(
    routePoints.length - 1,
    Math.floor((progress / 100) * routePoints.length)
  );
  const currentPoint = routePoints[currentPointIndex] || routePoints[0];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return Math.min(100, prev + 1 * playbackSpeed);
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Initialize OpenStreetMap Leaflet Map for Route Playback
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [routePoints[0].lat, routePoints[0].lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: true
    });

    // OpenStreetMap Standard Tile Layer (Código Abierto)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Draw route polyline
    const latlngs: L.LatLngExpression[] = routePoints.map(p => [p.lat, p.lng]);
    const polyline = L.polyline(latlngs, {
      color: '#f59e0b',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    polylineRef.current = polyline;

    // Start Marker (Green)
    const startIcon = L.divIcon({
      html: '<div class="w-6 h-6 rounded-full bg-emerald-500 text-black border-2 border-white flex items-center justify-center text-[10px] font-black shadow-lg">A</div>',
      className: 'start-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([routePoints[0].lat, routePoints[0].lng], { icon: startIcon })
      .bindPopup(`<b>Inicio de Ruta:</b> ${routePoints[0].time}`)
      .addTo(map);

    // End Marker (Red)
    const lastPt = routePoints[routePoints.length - 1];
    const endIcon = L.divIcon({
      html: '<div class="w-6 h-6 rounded-full bg-red-500 text-white border-2 border-white flex items-center justify-center text-[10px] font-black shadow-lg">B</div>',
      className: 'end-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([lastPt.lat, lastPt.lng], { icon: endIcon })
      .bindPopup(`<b>Fin de Ruta:</b> ${lastPt.time}`)
      .addTo(map);

    // Moving Vehicle Marker
    const vehicleIcon = L.divIcon({
      html: `
        <div class="relative flex flex-col items-center" style="transform: translate(-50%, -100%);">
          <div class="px-2 py-0.5 rounded shadow-lg text-[10px] font-mono font-bold whitespace-nowrap bg-black text-amber-400 border border-amber-400">
            ${vehicle.unitNumber} (${routePoints[0].speed} kph)
          </div>
          <div class="w-7 h-7 flex items-center justify-center">
            <svg viewBox="0 0 24 24" class="w-6 h-6 fill-amber-500 stroke-black stroke-2 drop-shadow-md">
              <polygon points="12,2 22,21 12,17 2,21" />
            </svg>
          </div>
        </div>
      `,
      className: 'playback-vehicle-marker',
      iconSize: [32, 42],
      iconAnchor: [16, 40]
    });

    const marker = L.marker([routePoints[0].lat, routePoints[0].lng], { icon: vehicleIcon }).addTo(map);
    currentMarkerRef.current = marker;

    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker position on progress change
  useEffect(() => {
    if (!currentMarkerRef.current || !mapRef.current) return;
    currentMarkerRef.current.setLatLng([currentPoint.lat, currentPoint.lng]);

    const updatedIcon = L.divIcon({
      html: `
        <div class="relative flex flex-col items-center" style="transform: translate(-50%, -100%);">
          <div class="px-2 py-0.5 rounded shadow-lg text-[10px] font-mono font-bold whitespace-nowrap bg-black text-amber-400 border border-amber-400">
            ${vehicle.unitNumber} (${currentPoint.speed} kph)
          </div>
          <div class="w-7 h-7 flex items-center justify-center">
            <svg viewBox="0 0 24 24" class="w-6 h-6 fill-amber-500 stroke-black stroke-2 drop-shadow-md">
              <polygon points="12,2 22,21 12,17 2,21" />
            </svg>
          </div>
        </div>
      `,
      className: 'playback-vehicle-marker',
      iconSize: [32, 42],
      iconAnchor: [16, 40]
    });
    currentMarkerRef.current.setIcon(updatedIcon);

    if (isPlaying) {
      mapRef.current.panTo([currentPoint.lat, currentPoint.lng], { animate: true, duration: 0.3 });
    }
  }, [currentPointIndex, isPlaying]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Historial y Reproducción de Rutas
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono">
                {vehicle.plate} • #{vehicle.unitNumber}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Auditoría segundo a segundo de velocidad, paradas y eventos del sensor G
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>28 Octubre 2026 (08:00 - 12:30)</span>
          </div>
        </div>
      </div>

      {/* Scrubber & Player Controls Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-black flex items-center justify-center font-bold transition shadow-lg shadow-amber-500/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-black" />}
            </button>

            <button
              onClick={() => {
                setProgress(0);
                setIsPlaying(false);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Reiniciar reproducción"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
              {([1, 2, 5, 10] as const).map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    playbackSpeed === speed ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Current Frame Status */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-slate-300">
              Hora: <span className="text-amber-400 font-bold">{currentPoint.time}</span>
            </div>
            <div className="text-slate-300">
              Velocidad: <span className="text-emerald-400 font-bold">{currentPoint.speed} km/h</span>
            </div>
            <div className="text-slate-400 hidden sm:inline-block">
              {currentPoint.lat.toFixed(4)}, {currentPoint.lng.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={e => setProgress(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>08:00:00 (Inicio de jornada)</span>
            <span>{currentPoint.event}</span>
            <span>12:30:00 (Fin de trayecto)</span>
          </div>
        </div>
      </div>

      {/* OpenStreetMap Historical Trajectory Map View (Código Abierto) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="font-bold text-slate-200">
              Traza del Recorrido en OpenStreetMap (Código Abierto)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Trayecto Completo: {routePoints.length} Puntos GPS JT808
          </span>
        </div>
        <div ref={mapContainerRef} className="w-full h-80 rounded-xl overflow-hidden border border-slate-700/80 shadow-inner z-10" />
      </div>

      {/* Route Waypoints & Stops Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200">
            Puntos Clave y Registro de Paradas
          </h2>
          <span className="text-xs text-slate-400">
            Total Recorrido: {vehicle.tripDistance} km · 1 Parada registrada
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Hora</th>
                <th className="py-3 px-4">Evento / Punto</th>
                <th className="py-3 px-4">Velocidad</th>
                <th className="py-3 px-4">Coordenadas</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {routePoints.map((pt, index) => (
                <tr 
                  key={index} 
                  className={`transition ${index === currentPointIndex ? 'bg-amber-500/10 border-l-4 border-amber-500' : 'hover:bg-slate-800/40'}`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    {pt.time}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-100">
                    {pt.event}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                    {pt.speed} km/h
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {pt.lat}, {pt.lng}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      GPS OK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
