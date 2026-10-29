import React, { useState } from 'react';
import { BookOpen, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface ApiDocsViewProps {
  isDark?: boolean;
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({ isDark = true }) => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      id: 'ep-1',
      method: 'GET',
      path: '/api/v1/vehicles',
      summary: 'Listar todos los vehículos y estado telemétrico en tiempo real',
      description: 'Devuelve la lista completa de placas, estado de ignición, velocidad, coordenadas GPS, combustible y canal de cámaras.',
      headers: {
        'Authorization': 'Bearer <tu_jwt_token>',
        'Content-Type': 'application/json'
      },
      curl: 'curl -X GET "https://app.rfimportca.com/api/v1/vehicles" \\\n  -H "Authorization: Bearer eyJhbGciOi..."',
      responseExample: `[
  {
    "plate": "A588AB",
    "unitNumber": "338",
    "speed": 0,
    "status": "idle",
    "lat": 10.6038,
    "lng": -71.6432,
    "ignition": true,
    "fuelPercent": 68,
    "gSensor": { "harshBraking": false, "harshAccel": false },
    "mdvrStreams": 4
  }
]`
    },
    {
      id: 'ep-2',
      method: 'POST',
      path: '/api/v1/mdvr/{plate}/channel/{ch}/stream',
      summary: 'Solicitar sesión SDP WebRTC para video en vivo de cámara MDVR',
      description: 'Inicia el túnel de baja latencia con el grabador JT1078 para los canales CH1 (ADAS), CH2 (DSM), CH3 o CH4.',
      headers: {
        'Authorization': 'Bearer <tu_jwt_token>',
        'Content-Type': 'application/json'
      },
      curl: 'curl -X POST "https://app.rfimportca.com/api/v1/mdvr/A588AB/channel/CH1/stream" \\\n  -H "Authorization: Bearer eyJhbGciOi..." \\\n  -d \'{"streamType": "main", "codec": "H.265"}\'',
      responseExample: `{
  "status": "success",
  "sessionId": "stream-jt1078-98421",
  "webrtcOffer": "v=0\\r\\no=- 42918 2 IN IP4 69.6.235.52...",
  "fps": 25,
  "bitrate": "2048kbps"
}`
    },
    {
      id: 'ep-3',
      method: 'POST',
      path: '/api/v1/commands/engine-cut',
      summary: 'Ejecutar inmovilización remota de motor / combustible',
      description: 'Transmite tramas JT808 de corte de relé de inyección. Requiere rol Super Admin y PIN de emergencia.',
      headers: {
        'Authorization': 'Bearer <tu_jwt_token>',
        'X-Security-PIN': '1234'
      },
      curl: 'curl -X POST "https://app.rfimportca.com/api/v1/commands/engine-cut" \\\n  -H "Authorization: Bearer eyJhbGciOi..." \\\n  -H "X-Security-PIN: 1234" \\\n  -d \'{"plate": "A588AB", "reason": "Robo confirmado"}\'',
      responseExample: `{
  "status": "executed",
  "commandId": "cmd-88129",
  "plate": "A588AB",
  "deviceAck": "Relay 1 OPEN (Fuel pump disabled)",
  "timestamp": "2026-10-28T12:15:32Z"
}`
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Documentación Oficial REST API & Protocolos MDVR
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono">
                OpenAPI 3.1
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Integración de telemetría vehicular, streaming JT1078 y webhooks de eventos para desarrolladores externos
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints Accordion List */}
      <div className="space-y-4">
        {endpoints.map(ep => {
          const methodColor = 
            ep.method === 'GET' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
            ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            'bg-amber-500/20 text-amber-400 border-amber-500/30';

          return (
            <div key={ep.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 font-mono text-xs">
                  <span className={`px-2.5 py-1 rounded-lg border font-bold ${methodColor}`}>
                    {ep.method}
                  </span>
                  <span className="text-slate-100 font-bold text-sm">{ep.path}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(ep.curl, ep.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition"
                >
                  {copiedEndpoint === ep.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEndpoint === ep.id ? '¡Copiado cURL!' : 'Copiar cURL'}</span>
                </button>
              </div>

              <div className="text-xs text-slate-300 font-medium">{ep.summary}</div>
              <div className="text-[11px] text-slate-400">{ep.description}</div>

              {/* cURL Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-amber-300 overflow-x-auto">
                <pre>{ep.curl}</pre>
              </div>

              {/* Response Example */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Respuesta JSON esperada (200 OK):
                </div>
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <pre>{ep.responseExample}</pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
