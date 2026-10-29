import React from 'react';
import { 
  Map, 
  Navigation, 
  Calendar, 
  History, 
  Leaf, 
  Bell, 
  Share2, 
  Terminal, 
  FileText, 
  Users, 
  Server, 
  Layers, 
  BookOpen, 
  User, 
  Moon, 
  Sun, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  Video,
  Cpu,
  Sliders,
  Plus,
  Radio,
  CheckCircle2,
  Cable,
  Zap,
  ShieldCheck,
  ShieldAlert,
  LogOut
} from 'lucide-react';

export type NavigationTab = 
  | 'map' 
  | 'devices' 
  | 'bench_test'
  | 'equipment_config'
  | 'mdvr' 
  | 'events' 
  | 'history' 
  | 'ecodrive' 
  | 'alerts' 
  | 'share' 
  | 'commands' 
  | 'reports' 
  | 'users' 
  | 'server_config' 
  | 'api_gateway' 
  | 'api_docs';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  language: 'es' | 'en';
  onToggleLanguage: () => void;
  activeVehiclesCount: number;
  totalVehiclesCount: number;
  unreadAlertsCount: number;
  onOpenAddDevice: () => void;
  userRole?: 'admin' | 'operator';
  onRequestRoleSwitch?: () => void;
  onLogout?: () => void;
  currentUserEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isDark,
  onToggleTheme,
  language,
  onToggleLanguage,
  activeVehiclesCount,
  totalVehiclesCount,
  unreadAlertsCount,
  onOpenAddDevice,
  userRole = 'admin',
  onRequestRoleSwitch,
  onLogout,
  currentUserEmail
}) => {
  const isEs = language === 'es';

  return (
    <aside
      className={`relative z-30 flex flex-col h-full bg-white border-r border-slate-200 text-slate-800 transition-all duration-300 select-none ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('map')}>
            <div className="h-9 w-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-[#106735]/30 shrink-0">
              <img 
                src="https://laticon.com/assets/img/logo.png" 
                alt="LATICON Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[13px] text-[#111111] tracking-wider flex items-center gap-1 leading-none">
                <span>LATICON TRACKING</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#106735] text-white shadow-xs">
                  USO OFICIAL
                </span>
                <span className="text-[10px] text-[#6C757D] font-medium truncate">
                  Flota & Operaciones
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto cursor-pointer p-1 rounded-xl bg-white border border-[#106735]/40 shadow-xs" onClick={() => onSelectTab('map')} title="LATICON TRACKING — USO OFICIAL">
            <img 
              src="https://laticon.com/assets/img/logo.png" 
              alt="LATICON" 
              className="w-6 h-6 object-contain" 
            />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-slate-100 text-[#6C757D] hover:text-[#111111] rounded-lg transition ml-auto"
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Aviso de Confidencialidad y Uso Exclusivo LATICON */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-[#106735]/30 shadow-xs">
            <div className="flex items-center gap-1.5 text-[#106735] font-bold text-[10px] tracking-wide uppercase mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#106735] shrink-0" />
              <span>SISTEMA PRIVADO Y CONFIDENCIAL</span>
            </div>
            <p className="text-[10px] text-[#495057] leading-snug">
              Software a medida de uso exclusivo para <strong className="text-[#111111] font-semibold">Latino Americana de la Construcción, S.A.</strong> (RIF: J-07048478-0).
            </p>
            <div className="mt-2 pt-1.5 border-t border-emerald-200/60 flex items-center justify-between text-[9px] text-[#6C757D]">
              <span className="text-[#106735] font-semibold">🔒 ACCESO RESTRINGIDO</span>
              <span>OPERACIONES</span>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Provisioning & Hardware Link Hub */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          {userRole === 'operator' ? (
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-emerald-900">
                      {isEs ? 'Sala de Monitoreo' : 'Operations Center'}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-mono">
                      {isEs ? 'Operador 24/7' : 'Operator 24/7'}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  EN VIVO
                </span>
              </div>

              <div className="text-[11px] text-slate-600 leading-tight">
                {isEs 
                  ? 'Supervisión en tiempo real de unidades en ruta, telemetría y cámaras MDVR.'
                  : 'Real-time monitoring of active fleet units, telematics and MDVR cameras.'}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#106735]/15 text-[#106735] border border-[#106735]/30 flex items-center justify-center shrink-0">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#111111]">
                      {isEs ? 'Enlace de Equipos' : 'Hardware Link Hub'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {totalVehiclesCount} {isEs ? 'equipos conectados' : 'devices linked'}
                    </div>
                  </div>
                </div>

                <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold border border-slate-200">
                  JT1078 OK
                </span>
              </div>

              <div className="text-[11px] text-[#495057] leading-tight">
                {isEs ? 'Sincronización directa con mapa y monitoreo en vivo.' : 'Direct sync with live monitoring and map.'}
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  onClick={() => onSelectTab('bench_test')}
                  className="py-1.5 px-2 bg-[#106735] hover:bg-[#0d552b] text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 shadow-sm shadow-[#106735]/25 col-span-2"
                >
                  <Cable className="w-3.5 h-3.5" />
                  <span>{isEs ? 'Banco de Pruebas MD-300' : 'MD-300 Test Bench'}</span>
                </button>

                <button
                  onClick={() => onSelectTab('equipment_config')}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-[#106735] text-slate-800 font-semibold text-[11px] rounded-lg border border-slate-200 transition flex items-center justify-center gap-1"
                >
                  <Sliders className="w-3 h-3 text-[#106735]" />
                  <span>{isEs ? 'Configurar' : 'Configure'}</span>
                </button>

                <button
                  onClick={onOpenAddDevice}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-[#106735] text-slate-800 font-semibold text-[11px] rounded-lg border border-slate-200 transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#106735]" />
                  <span>{isEs ? 'Nuevo' : 'New Device'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 text-xs">
        {/* Navigation Items */}
        <button
          onClick={() => onSelectTab('map')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            currentTab === 'map'
              ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
              : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
          }`}
          title={isEs ? 'Mapa en Vivo' : 'Live Map'}
        >
          <Map className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{isEs ? 'Mapa de Monitoreo' : 'Live Map'}</span>}
        </button>

        <button
          onClick={() => onSelectTab('devices')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
            currentTab === 'devices'
              ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
              : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
          }`}
          title={isEs ? 'Dispositivos' : 'Devices'}
        >
          <div className="flex items-center gap-2.5">
            <Navigation className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>{isEs ? 'Dispositivos' : 'Devices'}</span>}
          </div>
          {!isCollapsed && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              currentTab === 'devices' ? 'bg-[#072b1a] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {activeVehiclesCount}/{totalVehiclesCount}
            </span>
          )}
        </button>

        {/* Dedicated Banco de Pruebas MD-300 Tab (Admin Only) */}
        {userRole === 'admin' && (
          <button
            onClick={() => onSelectTab('bench_test')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
              currentTab === 'bench_test'
                ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
                : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
            }`}
            title={isEs ? 'Banco de Pruebas MD-300' : 'MD-300 Test Bench'}
          >
            <Cable className={`w-4 h-4 shrink-0 ${currentTab === 'bench_test' ? 'text-white' : 'text-[#106735]'}`} />
            {!isCollapsed && <span>{isEs ? 'Banco de Pruebas MD-300' : 'MD-300 Test Bench'}</span>}
          </button>
        )}

        {/* Dedicated Equipment Configuration Tab (Admin Only) */}
        {userRole === 'admin' && (
          <button
            onClick={() => onSelectTab('equipment_config')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
              currentTab === 'equipment_config'
                ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
                : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
            }`}
            title={isEs ? 'Configuración de Equipos' : 'Hardware Configuration'}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>{isEs ? 'Configurar Equipos' : 'Hardware Setup'}</span>}
          </button>
        )}

        <button
          onClick={() => onSelectTab('mdvr')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            currentTab === 'mdvr'
              ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
              : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
          }`}
          title={isEs ? 'Cámaras Telemétricas MDVR' : 'MDVR Cameras'}
        >
          <Video className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{isEs ? 'Cámaras MDVR' : 'MDVR Cameras'}</span>}
        </button>

        <button
          onClick={() => onSelectTab('events')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            currentTab === 'events'
              ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
              : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
          }`}
          title={isEs ? 'Eventos & Semáforos' : 'Events'}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{isEs ? 'Eventos & Semáforos' : 'Events'}</span>}
        </button>

        <button
          onClick={() => onSelectTab('history')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            currentTab === 'history'
              ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
              : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
          }`}
          title={isEs ? 'Historial de Rutas' : 'Route History'}
        >
          <History className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{isEs ? 'Historial' : 'History'}</span>}
        </button>

        <button
          onClick={() => onSelectTab('ecodrive')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            currentTab === 'ecodrive'
              ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
              : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
          }`}
          title="Ecodrive"
        >
          <Leaf className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Ecodrive</span>}
        </button>

        <button
          onClick={() => onSelectTab('alerts')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
            currentTab === 'alerts'
              ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
              : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
          }`}
          title={isEs ? 'Alertas en Tiempo Real' : 'Alerts'}
        >
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>{isEs ? 'Alertas' : 'Alerts'}</span>}
          </div>
          {!isCollapsed && unreadAlertsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('share')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            currentTab === 'share'
              ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
              : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
          }`}
          title={isEs ? 'Compartir Ubicación' : 'Share Location'}
        >
          <Share2 className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{isEs ? 'Compartir Ubicación' : 'Share Location'}</span>}
        </button>

        <button
          onClick={() => onSelectTab('commands')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            currentTab === 'commands'
              ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
              : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
          }`}
          title={isEs ? 'Enviar Comando' : 'Send Command'}
        >
          <Terminal className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{isEs ? 'Enviar Comando' : 'Send Command'}</span>}
        </button>

        <button
          onClick={() => onSelectTab('reports')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            currentTab === 'reports'
              ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
              : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
          }`}
          title={isEs ? 'Reportes PDF / CSV' : 'Reports'}
        >
          <FileText className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{isEs ? 'Reportes' : 'Reports'}</span>}
        </button>

        {/* Administration Section (Admin Role Only) */}
        {userRole === 'admin' && (
          <>
            {!isCollapsed && (
              <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                {isEs ? 'Administración' : 'Administration'}
              </div>
            )}

            <button
              onClick={() => onSelectTab('users')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                currentTab === 'users'
                  ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
              }`}
              title={isEs ? 'Usuarios' : 'Users'}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{isEs ? 'Usuarios' : 'Users'}</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#072b1a] text-white border border-[#1a6d3d]">
                  3
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('server_config')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                currentTab === 'server_config'
                  ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
              }`}
              title={isEs ? 'Configuración del Servidor' : 'Server Config'}
            >
              <Server className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{isEs ? 'Configuración del servidor' : 'Server Settings'}</span>}
            </button>

            <button
              onClick={() => onSelectTab('api_gateway')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                currentTab === 'api_gateway'
                  ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
              }`}
              title={isEs ? 'Plantillas de API Gateway' : 'API Gateway Templates'}
            >
              <Layers className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{isEs ? 'Contenido' : 'Content'}</span>}
            </button>

            <button
              onClick={() => onSelectTab('api_docs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                currentTab === 'api_docs'
                  ? 'bg-[#106735] text-white font-bold shadow-md shadow-[#106735]/25'
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-[#106735]'
              }`}
              title={isEs ? 'Documentación API' : 'API Docs'}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{isEs ? 'Documentación API' : 'API Docs'}</span>}
            </button>
          </>
        )}
      </div>

      {/* Footer Profile & Preferences matching Screenshot 009 */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
        {/* Admin Quick Switch to Operator View */}
        {!isCollapsed && userRole === 'admin' && onRequestRoleSwitch && (
          <button
            onClick={onRequestRoleSwitch}
            className="w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border shadow-xs bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            title={isEs ? 'Ver como Operador de Monitoreo' : 'Switch to Operator View'}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>{isEs ? '🛡️ Vista Pantalla Operador' : '🛡️ Switch to Operator'}</span>
          </button>
        )}

        {!isCollapsed && (
          <div className="flex items-center justify-between text-slate-700 truncate pt-1">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="truncate">
                <div className="truncate font-mono text-[11px] text-[#111111] font-semibold">
                  {currentUserEmail || (userRole === 'operator' ? 'operaciones@laticon.com' : 'superadmin@laticon.com')}
                </div>
                <div className="text-[9px] text-[#106735] font-semibold">
                  {userRole === 'operator' ? 'Operador de Flota LATICON' : 'Super Administrador LATICON'}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                title="Cerrar Sesión / Cambiar de Perfil"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {/* Indicador Modo Live 24/7 Permanente */}
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-[#106735]/40 text-xs shadow-xs"
            title="Modo Live Monitoreo 24/7 Activo por defecto"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#106735] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#106735]"></span>
            </span>
            {!isCollapsed && (
              <span className="font-bold text-[#111111] text-[11px] tracking-wide">
                {isEs ? 'Modo Live 24/7' : 'Live Mode 24/7'}
              </span>
            )}
          </div>

          {/* Language Switch */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-200/60 text-[#495057] hover:text-[#111111] transition text-xs font-medium"
            title="Cambiar idioma"
          >
            <Globe className="w-3.5 h-3.5 text-[#106735]" />
            {!isCollapsed && <span>{isEs ? 'ES' : 'EN'}</span>}
          </button>
        </div>

        {/* Footer Info line */}
        {!isCollapsed && (
          <div className="pt-2 border-t border-slate-200 text-[9.5px] text-[#6C757D] text-center font-mono leading-tight">
            2026 © LATICON, S.A. | RIF: J-07048478-0
            <div className="text-[8.5px] text-[#106735] font-medium mt-0.5">Software de Monitoreo Confidencial</div>
          </div>
        )}
      </div>
    </aside>
  );
};
