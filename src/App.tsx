import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Shield, 
  ShieldCheck, 
  Maximize2, 
  Minimize2, 
  Layout, 
  Map as MapIcon, 
  Tv, 
  Lock, 
  Unlock, 
  Radio, 
  Zap, 
  Sliders, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  Plus,
  LogOut
} from 'lucide-react';
import { 
  Vehicle, 
  TelemetryEvent, 
  UserAccount, 
  ApiGatewayTemplate, 
  MaintenanceService, 
  GeofenceZone,
  MDVRConfig
} from './types/telematics';
import { 
  INITIAL_VEHICLES, 
  INITIAL_EVENTS, 
  INITIAL_USERS, 
  INITIAL_SERVICES, 
  INITIAL_API_TEMPLATES, 
  INITIAL_GEOFENCES 
} from './data/mockVehicles';

import { Sidebar, NavigationTab } from './components/Sidebar';
import { LiveMap } from './components/LiveMap';
import { DeviceListOverlay } from './components/DeviceListOverlay';
import { BottomTelemetryDock } from './components/BottomTelemetryDock';
import { MDVRCameraPanel } from './components/MDVRCameraPanel';
import { MDVRConfigModal } from './components/MDVRConfigModal';
import { DeviceEquipmentConfigView } from './components/DeviceEquipmentConfigView';
import { MD300TestBenchView } from './components/MD300TestBenchView';
import { EventsView } from './components/EventsView';
import { ReportsView } from './components/ReportsView';
import { UsersAdminView } from './components/UsersAdminView';
import { CommandsView } from './components/CommandsView';
import { EcoDriveView } from './components/EcoDriveView';
import { RouteHistoryView } from './components/RouteHistoryView';
import { ServerConfigView } from './components/ServerConfigView';
import { ApiGatewayView } from './components/ApiGatewayView';
import { ApiDocsView } from './components/ApiDocsView';
import { AddDeviceModal } from './components/AddDeviceModal';
import { AddServiceModal } from './components/AddServiceModal';
import { ShareLocationModal } from './components/ShareLocationModal';
import { RealCameraQuickInstallModal } from './components/RealCameraQuickInstallModal';
import { AdminUnlockModal } from './components/AdminUnlockModal';
import { LoginView } from './components/LoginView';

import { 
  watchRealDeviceGps, 
  traccarService, 
  wakeUpRenderBackend, 
  fetchWithRenderRetries, 
  RENDER_CONFIG 
} from './services/realHardwareService';

export default function App() {
  // Authentication & Session Profile State (Testing Monitor vs Super Admin)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('operaciones@laticon.com');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(INITIAL_VEHICLES[0]);
  const [events, setEvents] = useState<TelemetryEvent[]>(INITIAL_EVENTS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [services, setServices] = useState<MaintenanceService[]>(INITIAL_SERVICES);
  const [templates, setTemplates] = useState<ApiGatewayTemplate[]>(INITIAL_API_TEMPLATES);
  const [geofences] = useState<GeofenceZone[]>(INITIAL_GEOFENCES);

  const [currentTab, setCurrentTab] = useState<NavigationTab>('map');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Modo Live Monitoreo 24/7 — Diseño Blanco Puro (Light Mode) Oficial LATICON
  const [isDark] = useState(false);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [onlyRealHardwareMode, setOnlyRealHardwareMode] = useState(false);

  // User Operational Profile: 'operator' (24/7 Live Monitoring as default) vs. 'admin' (Technical management)
  const [userRole, setUserRole] = useState<'admin' | 'operator'>('operator');
  const [isAdminUnlockModalOpen, setIsAdminUnlockModalOpen] = useState(false);
  const [operatorViewMode, setOperatorViewMode] = useState<'map' | 'split' | 'mdvr'>('map');
  const [isVideoWallKiosk, setIsVideoWallKiosk] = useState(false);

  // Auto-protect admin tabs when in Operator Mode
  useEffect(() => {
    if (userRole === 'operator') {
      const adminTabs: NavigationTab[] = [
        'users', 
        'server_config', 
        'api_gateway', 
        'api_docs', 
        'bench_test', 
        'equipment_config'
      ];
      if (adminTabs.includes(currentTab)) {
        setCurrentTab('map');
      }
    }
  }, [userRole, currentTab]);

  // Filtered vehicles depending on mode
  const realVehiclesCount = vehicles.filter(v => v.isRealHardware).length;
  const displayedVehicles = (onlyRealHardwareMode && realVehiclesCount > 0)
    ? vehicles.filter(v => v.isRealHardware)
    : vehicles;

  // Modals state
  const [isMDVRConfigModalOpen, setIsMDVRConfigModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [targetPlateForService, setTargetPlateForService] = useState(INITIAL_VEHICLES[0].plate);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isQuickInstallOpen, setIsQuickInstallOpen] = useState(false);

  // Modo Live: clase 'dark' siempre activa — el diseño oscuro es la identidad de LATICON TRACKING
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Continuous real GPS telemetry watcher for physical hardware
  useEffect(() => {
    const hasRealDevice = vehicles.some(v => v.isRealHardware && v.realGpsActive);
    if (!hasRealDevice) return;

    const watchId = watchRealDeviceGps((coords) => {
      setVehicles(prev => prev.map(v => {
        if (v.isRealHardware && v.realGpsActive) {
          return {
            ...v,
            lat: coords.lat,
            lng: coords.lng,
            speed: coords.speed,
            heading: coords.heading || v.heading,
            lastUpdate: new Date().toLocaleTimeString('es-VE') + ' (GNSS Real)'
          };
        }
        return v;
      }));
    });

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [vehicles]);

  // Real-time telemetry simulation loop (WebSockets emulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(veh => {
          if (veh.status === 'moving') {
            // slightly move moving vehicles
            const latDelta = (Math.random() - 0.48) * 0.0003;
            const lngDelta = (Math.random() - 0.48) * 0.0003;
            const newSpeed = Math.max(10, Math.min(85, Math.round(veh.speed + (Math.random() * 6 - 3))));
            const newTrip = parseFloat((veh.tripDistance + 0.04).toFixed(2));
            const newOdo = veh.odometer + 1;

            return {
              ...veh,
              lat: veh.isRealHardware ? veh.lat : veh.lat + latDelta,
              lng: veh.isRealHardware ? veh.lng : veh.lng + lngDelta,
              speed: veh.isRealHardware ? veh.speed : newSpeed,
              tripDistance: newTrip,
              odometer: newOdo,
              lastUpdate: veh.isRealHardware ? veh.lastUpdate : 'Hace instantes'
            };
          }
          return veh;
        });
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Traccar GPS Server Integration (auto-connects to localhost:8082 or configured host)
  useEffect(() => {
    let isMounted = true;

    traccarService.connect(
      {
        host: window.location.hostname || 'localhost',
        port: 8082,
        email: 'admin',
        password: 'admin',
      },
      {
        onPositions: (positions) => {
          if (!isMounted) return;
          // Actualiza vehículos que coincidan por ID o que sean unidades de hardware real
          setVehicles(prev => prev.map(veh => {
            const devId = veh.mdvrConfig?.deviceId;
            const matchingPos = positions.find(p => String(p.deviceId) === String(veh.id) || (devId && String(p.deviceId) === devId));
            if (matchingPos) {
              const update = TraccarService_helper(matchingPos);
              return {
                ...veh,
                ...update,
                lastUpdate: new Date().toLocaleTimeString('es-VE') + ' (Traccar Real)'
              };
            }
            return veh;
          }));
        },
        onConnected: () => {
          console.log('[LATICON] ✅ Conectado en vivo al servidor Traccar');
        },
        onError: (err) => {
          // Servidor Traccar local aún no iniciado o en espera
          console.info('[LATICON] Traccar servidor local en espera (puerto 8082)');
        }
      }
    );

    return () => {
      isMounted = false;
      traccarService.disconnect();
    };
  }, []);

  function TraccarService_helper(pos: any) {
    return {
      lat: pos.latitude,
      lng: pos.longitude,
      altitude: pos.altitude,
      speed: Math.round((pos.speed || 0) * 1.852),
      heading: pos.course || 0,
      address: pos.address || 'Ubicación GPS Traccar',
      status: ((pos.speed || 0) > 0.5 ? 'moving' : 'stopped') as 'moving' | 'stopped',
    };
  }

  // Render Cloud Backend Auto-Wakeup (Cold Start 50-60s handler)
  const [renderStatus, setRenderStatus] = useState<'waking' | 'online' | 'standby' | 'error'>('standby');

  useEffect(() => {
    wakeUpRenderBackend((status) => {
      setRenderStatus(status);
    });

    // Reintento periódico para mantener la instancia caliente o actualizar telemetría
    const pingInterval = setInterval(async () => {
      try {
        const res = await fetchWithRenderRetries('/api/devices', { timeoutMs: 60000, retries: 2 });
        if (res.ok) {
          const cloudDevices = await res.json();
          if (Array.isArray(cloudDevices) && cloudDevices.length > 0) {
            console.log('[Render Cloud] Datos de dispositivos recibidos:', cloudDevices.length);
          }
        }
      } catch (err) {
        // En reposo o iniciando
      }
    }, 45000);

    return () => clearInterval(pingInterval);
  }, []);

  // Sync selected vehicle when vehicles list updates
  useEffect(() => {
    const current = vehicles.find(v => v.id === selectedVehicle.id);
    if (current) {
      setSelectedVehicle(current);
    }
  }, [vehicles]);

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
  };

  const handleOpenMDVR = (v: Vehicle) => {
    setSelectedVehicle(v);
    setCurrentTab('map');
    setOperatorViewMode('split');
  };

  const handleOpenCommands = (v: Vehicle) => {
    setSelectedVehicle(v);
    setCurrentTab('commands');
  };

  const handleOpenEquipmentConfig = (v: Vehicle) => {
    setSelectedVehicle(v);
    setCurrentTab('equipment_config');
  };

  const handleUpdateVehicle = (updatedVeh: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVeh.id ? updatedVeh : v));
    setSelectedVehicle(updatedVeh);
  };

  const handleSaveMDVRConfig = (newConfig: MDVRConfig) => {
    setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, mdvrConfig: newConfig } : v));
    setSelectedVehicle(prev => ({ ...prev, mdvrConfig: newConfig }));
  };

  const handleAddVehicle = (newVeh: Vehicle, clearDemo?: boolean) => {
    if (clearDemo) {
      setVehicles([newVeh]);
    } else {
      setVehicles(prev => [newVeh, ...prev]);
    }
    setSelectedVehicle(newVeh);
    if (newVeh.isRealHardware) {
      setOnlyRealHardwareMode(true);
    }
  };

  const handleClearDemoData = () => {
    const realOnes = vehicles.filter(v => v.isRealHardware);
    if (realOnes.length > 0) {
      setVehicles(realOnes);
      setSelectedVehicle(realOnes[0]);
      setOnlyRealHardwareMode(true);
    } else {
      // Guide user to instantly install real camera
      setIsQuickInstallOpen(true);
    }
  };

  const handleAddService = (newSrv: MaintenanceService) => {
    setServices(prev => [newSrv, ...prev]);
  };

  const handleOpenAddServiceForPlate = (plate: string) => {
    setTargetPlateForService(plate);
    setIsAddServiceModalOpen(true);
  };

  const handleAddTemplate = (tpl: ApiGatewayTemplate) => {
    setTemplates(prev => [tpl, ...prev]);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleAddUser = (u: UserAccount) => {
    setUsers(prev => [...prev, u]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  const movingCount = vehicles.filter(v => v.status === 'moving').length;

  // Pantalla de Inicio de Sesión de Pruebas (Monitor vs Super Admin)
  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={(role, email) => {
          setUserRole(role);
          setCurrentUserEmail(email);
          setIsAuthenticated(true);
          setCurrentTab('map');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FA] text-[#111111]">
      
      {/* Left Sidebar Navigation */}
      {!isVideoWallKiosk && (
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            if (tab === 'share') {
              setIsShareModalOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isDark={isDark}
          onToggleTheme={() => {}}
          language={language}
          onToggleLanguage={() => setLanguage(language === 'es' ? 'en' : 'es')}
          activeVehiclesCount={movingCount}
          totalVehiclesCount={vehicles.length}
          unreadAlertsCount={events.length}
          onOpenAddDevice={() => setIsAddDeviceModalOpen(true)}
          userRole={userRole}
          onRequestRoleSwitch={() => {
            if (userRole === 'operator') {
              setIsAdminUnlockModalOpen(true);
            } else {
              setUserRole('operator');
              setCurrentTab('map');
            }
          }}
          onLogout={() => setIsAuthenticated(false)}
          currentUserEmail={currentUserEmail}
        />
      )}

      {/* Main View Area */}
      <main className="relative flex-1 h-full overflow-hidden flex flex-col bg-[#F8F9FA]">
        
        {/* TOP CONSOLE BAR: ADMIN vs. OPERATOR (CENTRAL DE MONITOREO 24/7 EN BLANCO PURO) */}
        <header className="z-30 bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-sm backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {/* LATICON TRACKING Brand Capsule */}
            <div className="flex items-center gap-2.5 pr-3 border-r border-slate-200">
              <div className="h-7 w-7 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-xs border border-[#F58220]/40">
                <img 
                  src="https://laticon.com/assets/img/logo.png" 
                  alt="LATICON Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-[#111111] tracking-wider">LATICON TRACKING</span>
                  <span className="text-[8.5px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#F58220] text-white tracking-wider shadow-xs">
                    USO OFICIAL
                  </span>
                </div>
                <span className="text-[9px] text-[#6C757D]">
                  Latino Americana de la Construcción, S.A.
                </span>
              </div>
            </div>

            {userRole === 'operator' ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SALA DE MONITOREO 24/7</span>
                </div>
                <span className="hidden xl:inline-block text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg font-mono">
                  CONSOLA DE VIGILANCIA EN VIVO
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#F58220]/15 text-[#e07316] border border-[#F58220]/30 px-3 py-1 rounded-xl text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>PANEL SUPER ADMINISTRADOR</span>
                </div>
                <span className="hidden xl:inline-block text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-mono font-semibold">
                  GESTIÓN TOTAL · HARDWARE & USUARIOS
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Live Monitoring Mode Switcher */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5 shadow-inner">
              <button
                onClick={() => {
                  setCurrentTab('map');
                  setOperatorViewMode('map');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  currentTab === 'map' && operatorViewMode === 'map'
                    ? 'bg-[#106735] text-white font-bold shadow-sm shadow-[#106735]/25'
                    : 'text-slate-600 hover:text-[#111111] hover:bg-white'
                }`}
                title="Modo Live Principal (Mapa completo con telemetría)"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Mapa Live</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('map');
                  setOperatorViewMode('split');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  currentTab === 'map' && operatorViewMode === 'split'
                    ? 'bg-[#106735] text-white font-bold shadow-sm shadow-[#106735]/25'
                    : 'text-slate-600 hover:text-[#111111] hover:bg-white'
                }`}
                title="Pantalla Dual: Mapa Live + Cámaras MDVR en simultáneo"
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Pantalla Dual (Mapa + MDVR)</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('mdvr');
                  setOperatorViewMode('mdvr');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  currentTab === 'mdvr'
                    ? 'bg-[#106735] text-white font-bold shadow-sm shadow-[#106735]/25'
                    : 'text-slate-600 hover:text-[#111111] hover:bg-white'
                }`}
                title="Malla completa de cámaras MDVR / Video Wall"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Video Wall</span>
              </button>
            </div>

            {/* Video Wall Kiosk Mode Toggle */}
            <button
              onClick={() => {
                const nextState = !isVideoWallKiosk;
                setIsVideoWallKiosk(nextState);
                setIsSidebarCollapsed(nextState);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                isVideoWallKiosk
                  ? 'bg-[#106735] text-white font-bold border-[#106735]'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-[#111111] hover:bg-slate-50'
              }`}
              title="Modo pantalla completa para proyección en sala de vigilancia / Video Wall"
            >
              {isVideoWallKiosk ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isVideoWallKiosk ? 'Salir Video Wall' : 'Video Wall Kiosk'}</span>
            </button>

            {/* Super Admin Only Tools (Hidden completely from Operator) */}
            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => setIsAddDeviceModalOpen(true)}
                  className="px-2.5 py-1.5 bg-[#106735] hover:bg-[#0d552b] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-[#106735]/25"
                  title="Registrar nuevo equipo GPS o MDVR"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Nuevo Equipo</span>
                </button>

                <button
                  onClick={() => {
                    setUserRole('operator');
                    setCurrentTab('map');
                  }}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  title="Previsualizar como Operador de Monitoreo"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden lg:inline">Vista Operador</span>
                </button>
              </>
            )}

            {/* Render Cloud Backend Status Indicator */}
            <div 
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition ${
                renderStatus === 'online'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : renderStatus === 'waking'
                  ? 'border-amber-200 bg-amber-50 text-amber-800 animate-pulse'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
              title={`Servidor Render: ${RENDER_CONFIG.baseUrl} (ID: ${RENDER_CONFIG.serviceId})`}
            >
              <span className={`w-2 h-2 rounded-full ${
                renderStatus === 'online' ? 'bg-emerald-500' : renderStatus === 'waking' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              <span className="hidden xl:inline">
                {renderStatus === 'online' ? 'Render Cloud OK' : renderStatus === 'waking' ? 'Despertando Render (60s)' : 'Render Standby'}
              </span>
            </div>

            {/* Header Logout Button */}
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              title="Cerrar Sesión / Salir al Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </header>
        
        {/* TAB 1: MAP VIEW (The Live Tracking Experience from Screenshot 010) */}
        {currentTab === 'map' && (
          <div className="relative w-full h-full overflow-hidden flex flex-col">
            <div className={`w-full flex-1 relative overflow-hidden ${operatorViewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-12 gap-0' : ''}`}>
              
              {/* Left Column: Live OpenStreetMap + Overlays */}
              <div className={`relative w-full h-full overflow-hidden ${operatorViewMode === 'split' ? 'lg:col-span-7' : ''}`}>
                {/* Top Real Data / Production Mode Switcher Pill */}
                {realVehiclesCount > 0 && (
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-200 shadow-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#106735] animate-pulse"></span>
                      <span className="font-bold text-slate-800">
                        {onlyRealHardwareMode 
                          ? `📡 Modo Hardware Real: #${selectedVehicle.plate}` 
                          : `Flota Mixta (1 Real #${vehicles.find(v => v.isRealHardware)?.plate || 'A99AW0N'} / ${vehicles.length - 1} Demo)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                      <button
                        onClick={() => setOnlyRealHardwareMode(!onlyRealHardwareMode)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                          onlyRealHardwareMode
                            ? 'bg-[#106735] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {onlyRealHardwareMode ? 'Ver Flota Completa' : 'Ver Sólo Datos Reales'}
                      </button>
                      {vehicles.some(v => !v.isRealHardware) && (
                        <button
                          onClick={handleClearDemoData}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px] font-bold transition border border-red-200"
                          title="Eliminar todos los simulados y dejar exclusivamente la cámara real A99AW0N"
                        >
                          Quitar Simulados
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Full Screen Leaflet Map */}
                <LiveMap
                  vehicles={displayedVehicles}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={handleSelectVehicle}
                  onOpenMDVR={handleOpenMDVR}
                  onOpenCommands={handleOpenCommands}
                  geofences={geofences}
                  isDark={isDark}
                />

                {/* Floating Device List Overlay on Left (Matching Screenshot 010) */}
                <DeviceListOverlay
                  vehicles={displayedVehicles}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={handleSelectVehicle}
                  onOpenMDVR={handleOpenMDVR}
                  onOpenCommands={handleOpenCommands}
                  onOpenEquipmentConfig={handleOpenEquipmentConfig}
                  onAddVehicle={() => setIsAddDeviceModalOpen(true)}
                  userRole={userRole}
                  isDark={isDark}
                />

                {/* Bottom Telemetry Dock (Matching Screenshot 010) */}
                <BottomTelemetryDock
                  vehicle={selectedVehicle}
                  services={services}
                  onOpenMDVR={handleOpenMDVR}
                  onOpenAddService={handleOpenAddServiceForPlate}
                  onCenterMap={() => {
                    // Centered automatically
                  }}
                  userRole={userRole}
                  isDark={isDark}
                />
              </div>

              {/* Right Column: MDVR Live Stream when in Dual Split Mode */}
              {operatorViewMode === 'split' && (
                <div className="lg:col-span-5 h-full overflow-y-auto bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs text-slate-100">
                        Cámaras en Vivo #{selectedVehicle.unitNumber} ({selectedVehicle.plate})
                      </span>
                    </div>
                    <button
                      onClick={() => setOperatorViewMode('map')}
                      className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                    >
                      Cerrar Vista Dual
                    </button>
                  </div>

                  <MDVRCameraPanel
                    vehicle={selectedVehicle}
                    onOpenConfig={() => setIsMDVRConfigModalOpen(true)}
                    userRole={userRole}
                    isDark={isDark}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: BANCO DE PRUEBAS MD-300 (Auto-Detección, Drivers y Auto-Registro) */}
        {currentTab === 'bench_test' && (
          <div className="h-full overflow-y-auto">
            <MD300TestBenchView
              onRegisterDiscoveredVehicle={handleAddVehicle}
              onGoToLiveMap={v => {
                setSelectedVehicle(v);
                setCurrentTab('map');
              }}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB: CONFIGURACIÓN DE EQUIPOS & HARDWARE (Connected to Monitoring Front-end) */}
        {currentTab === 'equipment_config' && (
          <div className="h-full overflow-y-auto">
            <DeviceEquipmentConfigView
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={handleSelectVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onGoToLiveMap={v => {
                setSelectedVehicle(v);
                setCurrentTab('map');
              }}
              onGoToBenchTest={() => setCurrentTab('bench_test')}
              onOpenAddDevice={() => setIsAddDeviceModalOpen(true)}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB 2: DISPOSITIVOS (Inventory & Device Status) */}
        {currentTab === 'devices' && (
          <div className="relative w-full h-full overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                  Gestión Integral de Dispositivos y Cámaras MDVR
                  <span className="text-xs bg-[#F58220]/15 text-[#F58220] border border-[#F58220]/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    {vehicles.length} Unidades Registradas
                  </span>
                </h1>
                <p className="text-xs text-[#6C757D]">
                  Inventario de hardware, seriales MDVR JT1078, chips 4G APN y choferes asignados
                </p>
              </div>

              {userRole === 'admin' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('equipment_config')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition"
                  >
                    ⚙ Calibrar Equipos
                  </button>
                  <button
                    onClick={() => setIsAddDeviceModalOpen(true)}
                    className="px-4 py-2 bg-[#F58220] hover:bg-[#e07316] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm shadow-[#F58220]/25"
                  >
                    <span>+ Registrar Nueva Unidad</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                  Modo Vigilancia · Solo Consulta y Despacho
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map(v => (
                <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#F58220] bg-[#F58220]/10 px-2 py-0.5 rounded border border-[#F58220]/20">
                        #{v.unitNumber} • {v.plate}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'moving' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        v.status === 'idle' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        ● {v.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#111111] mt-2">{v.model} ({v.year})</h3>
                    <p className="text-xs text-[#6C757D]">Conductor: <b className="text-[#111111]">{v.driverName}</b></p>
                    <p className="text-[11px] text-[#6C757D] font-mono">{v.driverPhone}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500">Odómetro:</span>
                        <div className="font-mono text-[#111111] font-semibold">{v.odometer.toLocaleString()} km</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500">Combustible:</span>
                        <div className="font-mono text-[#F58220] font-semibold">{v.fuelPercent}%</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500">MDVR Serial:</span>
                        <div className="font-mono text-slate-700 text-[10px] truncate">{v.mdvrConfig.deviceId}</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500">Canales Video:</span>
                        <div className="font-mono text-emerald-600 text-[10px] font-semibold">4 Canales OK</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenMDVR(v)}
                      className="flex-1 py-1.5 bg-[#F58220] hover:bg-[#e07316] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Ver Cámaras</span>
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleOpenEquipmentConfig(v)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200"
                        title="Configurar hardware de este equipo"
                      >
                        Configurar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedVehicle(v);
                        setCurrentTab('map');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200"
                    >
                      Mapa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MDVR CAMERAS VIEW */}
        {currentTab === 'mdvr' && (
          <div className="h-full overflow-y-auto p-6 max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Seleccionar Vehículo MDVR:</label>
                <select
                  value={selectedVehicle.id}
                  onChange={e => {
                    const target = vehicles.find(v => v.id === e.target.value);
                    if (target) setSelectedVehicle(target);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#F58220] focus:outline-hidden focus:border-[#F58220]"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      Unidad #{v.unitNumber} - {v.plate} ({v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {userRole === 'admin' && (
                  <button
                    onClick={() => setCurrentTab('equipment_config')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
                  >
                    ⚙ Parámetros Hardware
                  </button>
                )}
                <button
                  onClick={() => setCurrentTab('map')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200"
                >
                  ← Volver al Mapa
                </button>
              </div>
            </div>

            <MDVRCameraPanel
              vehicle={selectedVehicle}
              onOpenConfig={() => setIsMDVRConfigModalOpen(true)}
              userRole={userRole}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB 4: EVENTOS & MOVIMIENTOS BRUSCOS */}
        {currentTab === 'events' && (
          <div className="h-full overflow-y-auto">
            <EventsView
              events={events}
              vehicles={vehicles}
              onSelectVehicleByPlate={plate => {
                const target = vehicles.find(v => v.plate === plate);
                if (target) {
                  setSelectedVehicle(target);
                  setCurrentTab('map');
                }
              }}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB 5: HISTORIAL */}
        {currentTab === 'history' && (
          <div className="h-full overflow-y-auto">
            <RouteHistoryView vehicle={selectedVehicle} isDark={isDark} />
          </div>
        )}

        {/* TAB 6: ECODRIVE */}
        {currentTab === 'ecodrive' && (
          <div className="h-full overflow-y-auto">
            <EcoDriveView vehicles={vehicles} isDark={isDark} />
          </div>
        )}

        {/* TAB 7: ALERTAS */}
        {currentTab === 'alerts' && (
          <div className="h-full overflow-y-auto">
            <EventsView
              events={events}
              vehicles={vehicles}
              onSelectVehicleByPlate={plate => {
                const target = vehicles.find(v => v.plate === plate);
                if (target) {
                  setSelectedVehicle(target);
                  setCurrentTab('map');
                }
              }}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB 8: COMANDOS */}
        {currentTab === 'commands' && (
          <div className="h-full overflow-y-auto">
            <CommandsView
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={setSelectedVehicle}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB 9: REPORTES */}
        {currentTab === 'reports' && (
          <div className="h-full overflow-y-auto">
            <ReportsView
              vehicles={vehicles}
              events={events}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB 10: USUARIOS */}
        {currentTab === 'users' && (
          <div className="h-full overflow-y-auto">
            <UsersAdminView
              users={users}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onToggleUserStatus={handleToggleUserStatus}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB 11: CONFIGURACIÓN SERVIDOR */}
        {currentTab === 'server_config' && (
          <div className="h-full overflow-y-auto">
            <ServerConfigView isDark={isDark} />
          </div>
        )}

        {/* TAB 12: PLANTILLAS DE API GATEWAY (Matching Screenshot 009) */}
        {currentTab === 'api_gateway' && (
          <div className="h-full overflow-y-auto">
            <ApiGatewayView
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB 13: DOCUMENTACIÓN API */}
        {currentTab === 'api_docs' && (
          <div className="h-full overflow-y-auto">
            <ApiDocsView isDark={isDark} />
          </div>
        )}
      </main>

      {/* MODALS */}
      <MDVRConfigModal
        vehicle={selectedVehicle}
        isOpen={isMDVRConfigModalOpen}
        onClose={() => setIsMDVRConfigModalOpen(false)}
        onSaveConfig={handleSaveMDVRConfig}
      />

      <AddDeviceModal
        isOpen={isAddDeviceModalOpen}
        onClose={() => setIsAddDeviceModalOpen(false)}
        onAddVehicle={handleAddVehicle}
      />

      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        targetPlate={targetPlateForService}
        onAddService={handleAddService}
      />

      <ShareLocationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        vehicle={selectedVehicle}
        isDark={isDark}
      />

      <RealCameraQuickInstallModal
        isOpen={isQuickInstallOpen}
        onClose={() => setIsQuickInstallOpen(false)}
        onConfirmRealCamera={handleAddVehicle}
        isDark={isDark}
      />

      <AdminUnlockModal
        isOpen={isAdminUnlockModalOpen}
        onClose={() => setIsAdminUnlockModalOpen(false)}
        onSuccessUnlock={() => {
          setUserRole('admin');
        }}
        isDark={isDark}
      />
    </div>
  );
}
