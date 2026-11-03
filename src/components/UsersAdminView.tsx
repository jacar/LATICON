import React, { useState } from 'react';
import { UserAccount } from '../types/telematics';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield
} from 'lucide-react';

interface UsersAdminViewProps {
  users: UserAccount[];
  onAddUser: (u: UserAccount) => void;
  onDeleteUser: (id: string) => void;
  onToggleUserStatus: (id: string) => void;
  isDark?: boolean;
}

export const UsersAdminView: React.FC<UsersAdminViewProps> = ({
  users,
  onAddUser,
  onDeleteUser,
  onToggleUserStatus,
  isDark = true
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Super Admin' | 'Operador' | 'Monitorista' | 'Auditor'>('Operador');
  const [permissions, setPermissions] = useState({
    liveTracking: true,
    mdvrLiveView: true,
    engineCutCommand: false,
    exportReports: true,
    manageUsers: false,
    configMDVR: false
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      status: 'active',
      assignedPlatesCount: 26,
      lastLogin: 'Nunca (Pendiente primer acceso)',
      permissions
    };

    onAddUser(newUser);
    setIsModalOpen(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Gestión de Usuarios y Roles RBAC
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono">
                {users.length} Usuarios Activos
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Control de accesos granulares para operadores, despachadores, monitoristas y corte de motor remoto
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Añadir Nuevo Usuario</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Usuario & Email</th>
                <th className="py-3 px-4">Rol en Plataforma</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Permisos Clave</th>
                <th className="py-3 px-4">Último Ingreso</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{u.email}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Shield className="w-3 h-3" />
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => onToggleUserStatus(u.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                        u.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {u.status === 'active' ? '● Activo' : '● Suspendido'}
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {u.permissions.mdvrLiveView && (
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">MDVR</span>
                      )}
                      {u.permissions.engineCutCommand && (
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-semibold">Corte Motor</span>
                      )}
                      {u.permissions.exportReports && (
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">Reportes</span>
                      )}
                      {u.permissions.configMDVR && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px]">Config MDVR</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {u.lastLogin}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.role !== 'Super Admin' && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                Registrar Nuevo Usuario en RF Import
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nombre Completo del Operador</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Miguel Ángel Pérez"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Correo Electrónico (Login)</label>
                <input
                  type="email"
                  required
                  placeholder="operador@rfimportca.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Rol Asignado</label>
                <select
                  value={role}
                  onChange={e => {
                    const newRole = e.target.value as any;
                    setRole(newRole);
                    if (newRole === 'Super Admin') {
                      setPermissions({
                        liveTracking: true,
                        mdvrLiveView: true,
                        engineCutCommand: true,
                        exportReports: true,
                        manageUsers: true,
                        configMDVR: true
                      });
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Operador">Operador (Monitoreo básico y reportes)</option>
                  <option value="Monitorista">Monitorista (Visualización de cámaras MDVR en vivo)</option>
                  <option value="Auditor">Auditor (Solo lectura de históricos y Ecodrive)</option>
                  <option value="Super Admin">Super Admin (Control total y comandos de corte)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-semibold text-slate-800">Matriz de Permisos Específicos:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.liveTracking}
                      onChange={e => setPermissions({ ...permissions, liveTracking: e.target.checked })}
                      className="accent-emerald-600"
                    />
                    <span>Rastreo GPS en Vivo</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.mdvrLiveView}
                      onChange={e => setPermissions({ ...permissions, mdvrLiveView: e.target.checked })}
                      className="accent-emerald-600"
                    />
                    <span>Streaming Cámaras MDVR</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-red-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={permissions.engineCutCommand}
                      onChange={e => setPermissions({ ...permissions, engineCutCommand: e.target.checked })}
                      className="accent-red-500"
                    />
                    <span>Comando Corte de Motor</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.exportReports}
                      onChange={e => setPermissions({ ...permissions, exportReports: e.target.checked })}
                      className="accent-emerald-600"
                    />
                    <span>Exportar PDF / CSV</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.configMDVR}
                      onChange={e => setPermissions({ ...permissions, configMDVR: e.target.checked })}
                      className="accent-emerald-600"
                    />
                    <span>Parámetros de Cámaras</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.manageUsers}
                      onChange={e => setPermissions({ ...permissions, manageUsers: e.target.checked })}
                      className="accent-emerald-600"
                    />
                    <span>Crear / Gestionar Usuarios</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
