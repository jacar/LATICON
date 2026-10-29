import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Radio, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldAlert
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (role: 'operator' | 'admin', email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<'operator' | 'admin'>('operator');
  const [email, setEmail] = useState('operaciones@laticon.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRole = (role: 'operator' | 'admin') => {
    setSelectedRole(role);
    if (role === 'operator') {
      setEmail('operaciones@laticon.com');
      setPassword('operador2026');
    } else {
      setEmail('superadmin@laticon.com');
      setPassword('admin2026');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(selectedRole, email);
    }, 350);
  };

  const handleQuickLogin = (role: 'operator' | 'admin') => {
    const userEmail = role === 'operator' ? 'operaciones@laticon.com' : 'superadmin@laticon.com';
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(role, userEmail);
    }, 200);
  };

  return (
    <div className="min-h-screen w-screen bg-[#F8F9FA] flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F58220]/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* Top Corporate Nav */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-[#F58220]/40">
            <img 
              src="https://laticon.com/assets/img/logo.png" 
              alt="LATICON Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#111111] tracking-wide">LATICON TRACKING</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#F58220] text-white tracking-wider shadow-2xs">
                USO OFICIAL
              </span>
            </div>
            <div className="text-[11px] text-[#6C757D]">
              Latino Americana de la Construcción, S.A. · RIF: J-07048478-0
            </div>
          </div>
        </div>

        {/* Server Status Indicators */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>JT808 GNSS: ACTIVO</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>MDVR JT1078: ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Card Header */}
          <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/60 text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-white p-2 mx-auto mb-3 shadow-sm border border-[#F58220]/30 flex items-center justify-center">
              <img 
                src="https://laticon.com/assets/img/logo.png" 
                alt="LATICON" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-[#111111] tracking-tight">
              Central de Telemetría y Flota
            </h1>
            <p className="text-xs text-[#6C757D] mt-1">
              Seleccione su perfil de acceso para ingresar a la plataforma
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Quick Test Profiles Selector */}
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Perfiles de Prueba Rápidos:</span>
                <span className="text-[10px] text-[#F58220] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 1-Click
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Profile 1: Monitor / Operador */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('operator')}
                  className={`p-3 rounded-2xl text-left border transition relative flex flex-col justify-between cursor-pointer ${
                    selectedRole === 'operator'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Radio className="w-4 h-4 animate-pulse" />
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Nivel 1
                      </span>
                    </div>
                    <div className="font-bold text-xs text-[#111111]">
                      Operador Monitor
                    </div>
                    <div className="text-[10px] text-[#6C757D] leading-tight mt-0.5">
                      Vigilancia 24/7, Mapa y MDVR
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-emerald-700 font-semibold truncate">
                    operaciones@laticon.com
                  </div>
                </button>

                {/* Profile 2: Super Admin */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className={`p-3 rounded-2xl text-left border transition relative flex flex-col justify-between cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-[#F58220]/10 border-[#F58220] ring-2 ring-[#F58220]/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-7 h-7 rounded-xl bg-[#F58220]/20 text-[#F58220] flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F58220]/20 text-[#e07316]">
                        Master
                      </span>
                    </div>
                    <div className="font-bold text-xs text-[#111111]">
                      Super Administrador
                    </div>
                    <div className="text-[10px] text-[#6C757D] leading-tight mt-0.5">
                      Gestión Total, Banco MD-300
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-[#F58220] font-semibold truncate">
                    superadmin@laticon.com
                  </div>
                </button>
              </div>
            </div>

            {/* Credential Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usuario o Correo Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#111111] font-mono placeholder-slate-400 focus:outline-hidden focus:border-[#F58220] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-xs text-[#111111] font-mono placeholder-slate-400 focus:outline-hidden focus:border-[#F58220] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#F58220] hover:bg-[#e07316] text-white font-bold rounded-xl text-sm transition shadow-md shadow-[#F58220]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Ingresar como {selectedRole === 'operator' ? 'Operador Monitor' : 'Super Administrador'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Instant Access Pills */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-[#6C757D]">Acceso directo de prueba:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('operator')}
                  className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-semibold transition cursor-pointer"
                >
                  Entrar Monitor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="px-2 py-1 rounded-lg bg-[#F58220]/10 text-[#F58220] hover:bg-[#F58220]/20 border border-[#F58220]/30 font-semibold transition cursor-pointer"
                >
                  Entrar Super Admin
                </button>
              </div>
            </div>
          </div>

          {/* Card Footer with Confidentiality Note */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[10px] text-[#6C757D]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#F58220] shrink-0" />
            <span>Sistema confidencial para Latino Americana de la Construcción, S.A.</span>
          </div>
        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-slate-200 bg-white/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs text-[#6C757D]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">2026 © LATICON, S.A.</span>
          <span>·</span>
          <span>RIF: J-07048478-0</span>
          <span>·</span>
          <span>División Telemática & Flota</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Servidor Local: 3000 OK
          </span>
          <span>Soporte: operaciones@laticon.com</span>
        </div>
      </footer>
    </div>
  );
};
