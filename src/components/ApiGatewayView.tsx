import React, { useState } from 'react';
import { ApiGatewayTemplate } from '../types/telematics';
import { 
  Search, 
  Plus, 
  Layers, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Code2, 
  ShieldCheck,
  Zap,
  Key
} from 'lucide-react';

interface ApiGatewayViewProps {
  templates: ApiGatewayTemplate[];
  onAddTemplate: (t: ApiGatewayTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  isDark?: boolean;
}

export const ApiGatewayView: React.FC<ApiGatewayViewProps> = ({
  templates,
  onAddTemplate,
  onDeleteTemplate,
  isDark = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New template form state
  const [newTitle, setNewTitle] = useState('');
  const [newMethod, setNewMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [newEndpoint, setNewEndpoint] = useState('/api/v1/');
  const [newDesc, setNewDesc] = useState('');
  const [newAuthType, setNewAuthType] = useState<'Bearer JWT' | 'API Key'>('Bearer JWT');

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyEndpoint = (t: ApiGatewayTemplate) => {
    navigator.clipboard.writeText(`https://app.rfimportca.com${t.endpoint}`);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTpl: ApiGatewayTemplate = {
      id: `tpl-${Date.now()}`,
      title: newTitle,
      method: newMethod,
      endpoint: newEndpoint,
      description: newDesc || 'Plantilla de integración REST personalizada para telemetría vehicular.',
      authType: newAuthType,
      responseFormat: 'JSON',
      rateLimit: '60 req/min',
      active: true
    };

    onAddTemplate(newTpl);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewEndpoint('/api/v1/');
    setNewDesc('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header matching Screenshot 009 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Plantillas de API Gateway</h1>
            <p className="text-xs text-slate-400">
              Administración de microservicios, endpoints REST, streams JT1078 y webhooks de telemetría para RF Import C.A
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition flex items-center justify-center shadow-lg shadow-amber-500/20"
            title="Crear nueva plantilla"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Table Card matching Screenshot 009 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Título</th>
                <th className="py-3 px-4">Método & Endpoint</th>
                <th className="py-3 px-4">Autenticación</th>
                <th className="py-3 px-4">Tasa Límite</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <span>Sin datos. No se encontraron plantillas de API Gateway.</span>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map(tpl => {
                  const methodColor = 
                    tpl.method === 'GET' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                    tpl.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    tpl.method === 'PUT' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30';

                  return (
                    <tr key={tpl.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-100">
                        <div>{tpl.title}</div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">{tpl.description}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${methodColor}`}>
                            {tpl.method}
                          </span>
                          <span className="text-slate-300 font-semibold">{tpl.endpoint}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>{tpl.authType}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {tpl.rateLimit}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyEndpoint(tpl)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                            title="Copiar URL completa"
                          >
                            {copiedId === tpl.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => onDeleteTemplate(tpl.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition"
                            title="Eliminar plantilla"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Template Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-white">
                <Plus className="w-4 h-4 text-amber-500" />
                Nueva Plantilla de API Gateway
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Título de la plantilla</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Posición de Flota por Geocerca"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Método HTTP</label>
                  <select
                    value={newMethod}
                    onChange={e => setNewMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">Endpoint URI</label>
                  <input
                    type="text"
                    required
                    value={newEndpoint}
                    onChange={e => setNewEndpoint(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Tipo de Autenticación</label>
                <select
                  value={newAuthType}
                  onChange={e => setNewAuthType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Bearer JWT">Bearer JWT (Tokens seguros con expiración)</option>
                  <option value="API Key">API Key fija (X-API-KEY)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Descripción funcional</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre lo que este endpoint devuelve o procesa..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl"
                >
                  Guardar Plantilla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
