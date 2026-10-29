import { Vehicle, TelemetryEvent } from '../types/telematics';

export function exportEventsToCSV(events: TelemetryEvent[], filename = 'reporte-eventos-telemetria.csv') {
  const headers = ['ID', 'Placa', 'Fecha y Hora', 'Tipo de Evento', 'Severidad', 'Velocidad (kph)', 'Ubicación / Dirección', 'Video Clip MDVR'];
  const rows = events.map(e => [
    `"${e.id}"`,
    `"${e.plate}"`,
    `"${e.timestamp}"`,
    `"${e.title}"`,
    `"${e.severity.toUpperCase()}"`,
    e.speed,
    `"${e.address.replace(/"/g, '""')}"`,
    e.hasVideoClip ? 'Sí (Guardado)' : 'No'
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportVehiclesToCSV(vehicles: Vehicle[], filename = 'reporte-flota-vehiculos.csv') {
  const headers = ['Unidad', 'Placa', 'Modelo', 'Conductor', 'Estado', 'Velocidad (kph)', 'Odómetro (km)', 'Combustible (%)', 'Batería (V)', 'Frenados Bruscos', 'Alertas Semáforo', 'Dirección Actual'];
  const rows = vehicles.map(v => [
    `"${v.unitNumber}"`,
    `"${v.plate}"`,
    `"${v.model}"`,
    `"${v.driverName}"`,
    `"${v.status.toUpperCase()}"`,
    v.speed,
    v.odometer,
    `${v.fuelPercent}%`,
    `${v.batteryVoltage}V`,
    v.harshEventsCount,
    v.trafficLightAlerts,
    `"${v.address.replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printTelemetryPDFReport(vehicle: Vehicle, events: TelemetryEvent[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const vehicleEvents = events.filter(e => e.vehicleId === vehicle.id || e.plate === vehicle.plate);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reporte Telemétrico Oficial - RF Import C.A</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 800; color: #d97706; display: flex; align-items: center; gap: 8px; }
    .meta { font-size: 12px; color: #64748b; text-align: right; }
    .title-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 10px; }
    .stat-card { background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; }
    .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .stat-value { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 600; color: #334155; }
    td { padding: 8px 12px; border: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .badge-critical { background: #fee2e2; color: #991b1b; }
    .badge-high { background: #ffedd5; color: #9a3412; }
    .badge-medium { background: #fef3c7; color: #92400e; }
    .badge-low { background: #e0f2fe; color: #075985; }
    .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    @media print {
      body { padding: 0; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <span>RF IMPORT C.A</span>
      <span style="font-size: 14px; color: #475569; font-weight: 500;">| Sistema de Telemetría y Rastreo MDVR</span>
    </div>
    <div class="meta">
      <div>Servidor: 69.6.235.52 (v3.7.13)</div>
      <div>Fecha de Emisión: ${new Date().toLocaleString('es-VE')}</div>
    </div>
  </div>

  <div class="title-box">
    <div style="font-size: 16px; font-weight: 700;">INFORME INTEGRAL DE DISPOSITIVO: Unidad #${vehicle.unitNumber} (${vehicle.plate})</div>
    <div style="font-size: 13px; color: #475569; margin-top: 4px;">Modelo: <b>${vehicle.model}</b> | Conductor Asignado: <b>${vehicle.driverName}</b> | Teléfono: <b>${vehicle.driverPhone}</b></div>
    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Última Ubicación: ${vehicle.address}</div>

    <div class="grid">
      <div class="stat-card">
        <div class="stat-label">Odómetro Total</div>
        <div class="stat-value">${vehicle.odometer.toLocaleString()} km</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Distancia Recorrida</div>
        <div class="stat-value">${vehicle.tripDistance} km</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Frenados Bruscos G-Sensor</div>
        <div class="stat-value" style="color: ${vehicle.harshEventsCount > 0 ? '#dc2626' : '#16a34a'}">${vehicle.harshEventsCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Infracciones de Semáforo</div>
        <div class="stat-value" style="color: ${vehicle.trafficLightAlerts > 0 ? '#ea580c' : '#16a34a'}">${vehicle.trafficLightAlerts}</div>
      </div>
    </div>
  </div>

  <h3 style="margin-bottom: 8px;">Estado de Cámaras MDVR Conectadas</h3>
  <table>
    <thead>
      <tr>
        <th>Canal</th>
        <th>Nombre del Lente</th>
        <th>Tipo</th>
        <th>Resolución</th>
        <th>FPS / Bitrate</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      ${vehicle.mdvrChannels.map(ch => `
        <tr>
          <td><b>${ch.channel}</b></td>
          <td>${ch.name}</td>
          <td>${ch.type.replace('_', ' ').toUpperCase()}</td>
          <td>${ch.resolution}</td>
          <td>${ch.fps} fps · ${(ch.bitrateKbps / 1024).toFixed(1)} Mbps</td>
          <td><span style="color: ${ch.status === 'streaming' ? '#16a34a' : '#64748b'}; font-weight: 600;">● ${ch.status.toUpperCase()}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h3 style="margin-top: 24px; margin-bottom: 8px;">Historial de Eventos Telemétricos Registrados</h3>
  <table>
    <thead>
      <tr>
        <th>Hora</th>
        <th>Evento</th>
        <th>Detalle</th>
        <th>Severidad</th>
        <th>Velocidad</th>
        <th>Video MDVR</th>
      </tr>
    </thead>
    <tbody>
      ${vehicleEvents.length > 0 ? vehicleEvents.map(evt => `
        <tr>
          <td>${evt.timestamp}</td>
          <td><b>${evt.title}</b></td>
          <td>${evt.description}</td>
          <td><span class="badge badge-${evt.severity}">${evt.severity.toUpperCase()}</span></td>
          <td>${evt.speed} km/h</td>
          <td>${evt.hasVideoClip ? 'Guardado 20s' : 'N/A'}</td>
        </tr>
      `).join('') : '<tr><td colspan="6" style="text-align:center; padding: 16px; color:#94a3b8;">Sin incidentes registrados en el periodo.</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    2026 © RF Import C.A | Centro de Control y Monitoreo Satelital | Reporte Generado por Sistema Automatizado
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
