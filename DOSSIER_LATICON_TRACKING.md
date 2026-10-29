# LATICON TRACKING
## Plataforma Corporativa de Telemetría Avanzada, Rastreo Satelital y Video Vigilancia con Inteligencia Artificial
**Documento Técnico-Ejecutivo | Versión 2.0 | Octubre 2026**  
**Propietario:** Latino Americana de la Construcción, S.A. (LATICON) — RIF: J-07048478-0  
**Uso:** Exclusivo Corporativo / Operaciones de Flota e Infraestructura

---

## 1. RESUMEN EJECUTIVO

**LATICON TRACKING** es el ecosistema tecnológico integral desarrollado para la supervisión, control, seguridad vial y optimización operativa de la flota de vehículos, transporte de personal y maquinaria pesada de **Latino Americana de la Construcción, S.A. (LATICON)** en sus operaciones a nivel nacional (sectores petrolero, construcción, infraestructura y minería).

La plataforma consolida en una sola consola de comando unificada:
1. **Posicionamiento Satelital (GNSS/GPS)** de alta frecuencia en tiempo real.
2. **Video Telemática de Inteligencia Artificial (AI Dashcams MDVR)** con analítica de borde (ADAS + DSM).
3. **Telemetría de Motor y Sensores de Abordo** (odómetro, combustible, ignición, voltaje, temperaturas, acelerómetro triaxial).
4. **Telecontrol Remoto de Activos** (inmovilización de motor, cierre de accesos, sirenas de pánico).
5. **Calificación de Hábitos de Conducción (Eco-Drive)** para reducción de siniestralidad y optimización de combustible.
6. **Gestión de Mantenimiento Predictivo/Preventivo** de unidades mecánicas y equipamiento de seguridad.
7. **Arquitectura Soberana de Datos**, operando sobre servidores dedicados con protocolo industrial **JT808/JT1078** e integración con sistemas ERP de la compañía.

---

## 2. ARQUITECTURA TECNOLÓGICA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLOTA LATICON EN CAMPO                            │
│  [Camionetas 4x4]   [Buses Personal]   [Camiones Chutos / Carga Pesada]     │
│  Equipos: MDVR MD-300 + Dual Lens (ADAS/DSM) + Sensores Telemáticos         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Red Móvil 4G LTE / APN Privado
                                       │ Protocolos: JT808 (Datos) + JT1078 (Video)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NÚCLEO DE SERVIDORES Y PROCESAMIENTO                     │
│  • Traccar Server Core (Puertos 5023 JT808 / 8082 API / 5055 OsmAnd)        │
│  • Gateway de Video Streaming WebRTC / H.264 / H.265                         │
│  • Servidor de Base de Datos Telemetría & Geocercas                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API + WebSockets en tiempo real
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INTERFAZ DE USUARIO Y CONTROL                         │
│  • Centro de Monitoreo 24/7 (Soporte Video Wall / Modo Kiosk)               │
│  • Panel Super Administrador (Auditoría, Usuarios, Despacho)                 │
│  • Enlaces Temporales para Clientes Externos (Share Location)               │
│  • API Gateway para ERP Corporativo (SAP / Odoo / Profit Plus)              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CATÁLOGO DETALLADO DE FUNCIONES POR MÓDULO

### MÓDULO 1: SALA DE MONITOREO Y CARTOGRAFÍA VIAL EN VIVO

* **Rastreo Satelital Continuo:**
  - Actualización periódica en tiempo real con latencia inferior a 2 segundos mediante WebSockets.
  - Indicadores inmediatos de estado: **En Movimiento** (verde), **Ralentí / Motor Encendido Detenido** (ámbar), **Apagado / Estacionado** (azul), **Alerta Crítica** (rojo) y **Fuera de Línea** (gris).
* **Marcadores Fotorrealistas de Alta Definición:**
  - Representación gráfica de cada tipo de activo (Pickups, Camiones de Carga, Maquinaria) con rotación dinámica alineada al rumbo geográfico exacto (0-360°).
* **Múltiples Capas de Cartografía Integrada:**
  - *Google Maps Calles*: Cartografía detallada con nomenclatura vial oficial.
  - *Google Maps Satélite Híbrido*: Imágenes satelitales de alta resolución con sobrecapa de vías.
  - *Google Maps Tráfico*: Lectura de congestión vial para optimización de rutas.
  - *OpenStreetMap Clásico / Hot / Voyager*: Cartografía abierta de respaldo sin dependencia de proveedores.
  - *Mapa Topográfico (OpenTopoMap)*: Elevaciones y curvas de nivel para operaciones en campo petrolero y minero.
  - *Modo Táctico Nocturno (Dark Mode)*: Diseñado para reducir fatiga visual en salas de control 24/7.
* **Geocercas de Seguridad y Operacionales:**
  - Creación de zonas de control perimetral circulares y poligonales.
  - Geocercado preconfigurado: Base Central LATICON Maracaibo, Almacenes de Logística, Talleres de Mantenimiento, Patios de Carga en Muelle y Frentes de Obra activos.
  - Detección instantánea de entradas y salidas no autorizadas con registro de hora y velocidad.
* **Puntos de Interés (POIs):**
  - Mapeo de estaciones de combustible propias y aliadas, clínicas ocupacionales, talleres mecánicos autorizados y centros de acopio.
* **Herramientas de Análisis Espacial:**
  - Regla de medición métrica en pantalla para calcular distancias exactas de traslado.
  - Trazado de estelas de recorrido (*breadcrumbs*) y vectores de velocidad/dirección proyectada.
  - Ubicación de radares viales y cruces semaforizados para auditar el cumplimiento de límites de velocidad.

---

### MÓDULO 2: VIDEO TELEMÁTICA CON INTELIGENCIA ARTIFICIAL (MDVR)

* **Capacidad Multicanal en Tiempo Real:**
  - Conexión a unidades **MDVR MD-300 AI** con capacidad de hasta 4 canales simultáneos en resolución Full HD 1080P / 720P con codificación H.264/H.265 y transmisión fluida a 25 cuadros por segundo.
  - **Canal 1 — Frontal Vial (ADAS):** Visión hacia la carretera para análisis dinámico del tráfico.
  - **Canal 2 — Cabina / Conductor (DSM):** Cámara con iluminación infrarroja invisible para monitoreo 24/7 del operador.
  - **Canal 3 — Área de Carga / Tolva:** Supervisión de la integridad del material transportado y detección de sustracciones.
  - **Canal 4 — Punto Ciego / Retroceso:** Cámara exterior de reversa y asistencia de maniobra en espacios confinados.
* **Módulo ADAS (Asistencia Avanzada al Conductor):**
  - *Forward Collision Warning (FCW):* Advertencia acústica y visual ante peligro de colisión frontal.
  - *Lane Departure Warning (LDW):* Detección de salida de carril sin encender luz de cruce.
  - *Headway Monitoring (HMW):* Advertencia de proximidad peligrosa con vehículos precedentes.
* **Módulo DSM (Monitoreo de Estado del Conductor):**
  - *Detector de Fatiga y Somnolencia:* Identificación de pestañeos prolongados, cabeceos y bostezos repetitivos.
  - *Uso de Dispositivos Móviles:* Alarma instantánea cuando el conductor sostiene o manipula un teléfono celular mientras conduce.
  - *Detección de Tabaco / Cigarrillo:* Prevención de riesgos de incendio y violación de normas de seguridad industrial.
  - *Control de Cinturón de Seguridad:* Verificación óptica del uso obligatorio del arnés o cinturón.
  - *Distracción y Pérdida de Mirada:* Advertencia ante pérdida de atención visual en la vía por más de 3 segundos.
* **Sensor G-Force y Telemetría de Inercia:**
  - Acelerómetro triaxial integrado en el hardware con registro de fuerzas G en ejes X, Y, Z.
  - Registro de maniobras agresivas: frenadas de pánico, aceleraciones bruscas, giros cerrados a alta velocidad y detección de impactos o volcamientos.
* **Modos de Presentación de Sala:**
  - *Pantalla Dual:* Mapa interactivo en el panel izquierdo y mosaico de cámaras en vivo en el panel derecho.
  - *Video Wall Mode:* Matriz dedicada para pantallas gigantes en centros de control.
  - *Kiosk Mode:* Operación sin barras de navegador para estaciones de vigilancia dedicadas.

---

### MÓDULO 3: CONTROL REMOTO Y COMANDOS DE TELEMÁTICA

* **Inmovilización Remota de Motor (Engine Cut-Off):**
  - Activación electrónica del relé de corte de combustible / bomba de inyección a distancia.
  - Confirmación de dos pasos con validación de credenciales para evitar paradas en situaciones de riesgo vial.
  - Reactivación remota inmediata una vez resuelta la incidencia.
* **Comandos Complementarios por Red GPRS / SMS / JT808:**
  - Bloqueo y desbloqueo centralizado de seguros de puertas.
  - Activación de señal auditiva/bocina de alerta disuasoria.
  - Petición de captura fotográfica instantánea (snapshot) de cabina o vía pública.
  - Petición de descarga de clip de video de eventos pasados almacenados en la tarjeta SD/SSD local del equipo.
  - Reinicio y calibración remota del equipo telemático.

---

### MÓDULO 4: EVALUACIÓN DE CONDUCCIÓN (ECO-DRIVE & SCORECARD)

* **Puntuación Objetiva de Conductores:**
  - Algoritmo de ponderación automática que evalúa cada viaje y asigna una calificación de 0 a 100 puntos.
* **Factores Penalizados:**
  - Excesos de velocidad por encima del límite de la vía o de la política corporativa LATICON.
  - Frenadas y aceleraciones intempestivas que desgastan componentes mecánicos y neumáticos.
  - Ralentí prolongado (motor encendido con vehículo detenido), causante de consumo innecesario de combustible y huella de carbono.
  - Eventos de distracción o fatiga detectados por el sistema DSM.
* **Beneficios de Negocio:**
  - Reducción estimada de entre 12% y 18% en consumo de combustible diésel/gasolina.
  - Extensión de la vida útil de frenos, cauchos y transmisiones de la flota.
  - Base para programas de incentivos y premiación de choferes destacados.

---

### MÓDULO 5: AUDITORÍA DE RUTAS E HISTORIAL

* **Reconstrucción Histórica de Viajes:**
  - Consulta de recorridos históricos por rango de fechas, horas y unidad específica.
  - Animación de la trayectoria sobre el mapa con control de velocidad de reproducción (1x, 2x, 5x, 10x).
  - Trazado de ruta con identificación de paradas, duración de cada detención y direcciones exactas procesadas mediante geocodificación inversa.
  - Gráficas asociadas de perfil de velocidad vs. tiempo a lo largo de todo el trayecto.

---

### MÓDULO 6: GESTIÓN DE MANTENIMIENTO PREVENTIVO

* **Programación de Servicios:**
  - Mantenimiento basado en odómetro real acumulado (km) o por tiempo calendario.
  - Módulos de servicio estándar: Cambio de aceite y filtros de motor, inspección de sistema de frenos, rotación y alineación de neumáticos, mantenimiento de suspensión, calibración de cámaras y sensores de telemetría.
* **Alertas Predictivas Semafóricas:**
  - **Verde (OK):** Mantenimiento dentro de los rangos planificados.
  - **Amarillo (Alerta Preventiva):** Próximo a vencer dentro de los siguientes 500 km o 15 días.
  - **Rojo (Urgente / Vencido):** Límite sobrepasado, notificación prioritaria a jefatura de taller.
* **Control de Costos:**
  - Registro de costo presupuestado vs. costo real de cada intervención para control de OPEX de flota.

---

### MÓDULO 7: ADMINISTRACIÓN, SEGURIDAD Y PERFILES DE USUARIO (RBAC)

* **Separación de Roles Operativos:**
  - **Operador de Sala (24/7):** Visualización de mapa, cámaras en vivo, telemetría y eventos. Paneles de configuración crítica bloqueados contra manipulaciones accidentales.
  - **Super Administrador:** Acceso irrestricto a registro de unidades, configuración de servidores, gestión de usuarios, asignación de permisos y despacho de comandos de corte de motor.
* **Seguridad de la Información:**
  - Credenciales almacenadas de manera cifrada (variables de entorno `.env.local`, nunca en repositorios públicos).
  - Control de sesiones y autenticación robusta para el acceso al sistema.
* **Ubicación Compartida Segura (Share Link):**
  - Generación de enlaces temporales con expiración configurable (1h, 4h, 24h) para visualización en tiempo real por parte de clientes de proyectos, gerentes de operaciones o contratistas, sin necesidad de crearles usuario en el sistema.

---

### MÓDULO 8: BANCO DE PRUEBAS DE TALLER (TEST BENCH)

* **Enrolamiento y Certificación de Equipos:**
  - Área especializada de la plataforma diseñada para el laboratorio de electrónica / taller mecánico de LATICON.
  - Reconocimiento de equipos nuevos por IMEI y puerto COM/USB o red local.
  - Verificación de calidad de señal GNSS (número de satélites enlazados, HDOP).
  - Comprobación de señal celular 4G y parámetros de conexión APN (Digitel, Movistar).
  - Prueba en vivo de la matriz de cámaras (CH1-CH4) previo a la instalación en el vehículo.

---

### MÓDULO 9: API GATEWAY & INTEGRACIÓN EMPRESARIAL

* **Interoperabilidad con Sistemas Centrales:**
  - Catálogo de endpoints REST documentados (Swagger/OpenAPI compatible).
  - Métodos disponibles para consulta de flota (`GET /api/vehicles`), reporte de posiciones (`GET /api/positions`), registro de eventos (`GET /api/events`), despacho de comandos (`POST /api/commands`) y mantenimiento (`GET /api/maintenance`).
  - Autenticación mediante tokens de seguridad (Bearer JWT / API Keys).
  - Facilidad de conexión directa con SAP, Odoo, Profit Plus u otros sistemas ERP que use LATICON para despacho, control de inventario y facturación de servicios de transporte.

---

## 4. ESPECIFICACIONES TÉCNICAS DEL HARDWARE HOMOLOGADO

### Equipo Primario: MDVR AI Dashcam Serie MD-300
* **Procesador & NPU:** Unidad de procesamiento neuronal embebida para inferencia de visión artificial en el dispositivo.
* **Canales de Video:** 2 a 4 canales (1x Frontal gran angular 140° + 1x Cabina con sensor infrarrojo 120° + 2x externos auxiliares).
* **Resolución de Grabación:** 1080P Full HD (1920x1080) @ 25fps por canal.
* **Compresión:** H.264 / H.265 de alta eficiencia de ancho de banda.
* **Módulo de Comunicaciones:** 4G LTE Multibanda (compatible con bandas B2, B3, B4, B7, B8, B28 para cobertura nacional en Venezuela con Digitel y Movistar).
* **Posicionamiento:** Módulo dual GPS + GLONASS / Beidou con antena externa de alta ganancia.
* **Almacenamiento:** Doble ranura MicroSD de hasta 256GB/512GB (hasta 512 horas de grabación continua) o soporte para disco de estado sólido SSD.
* **Alimentación:** Rango extendido 9V - 36V DC con protección contra picos de voltaje y apagado retardado programable por software.
* **Protocolos de Salida:** JT/T 808-2019 (Datos de Posición y Alarmas), JT/T 1078 (Streaming de Video y Audio).

---

## 5. IMPACTO EN EL NEGOCIO (ANÁLISIS CAPEX / OPEX)

| Dimensión | Situación Anterior (Tercerizada) | Con LATICON TRACKING (Propia) | Impacto / Retorno |
|---|---|---|---|
| **Costo Mensual por Unidad** | Cuota mensual fija por vehículo a plataforma externa ($15 - $35/mes/unidad). | Cero costo de licencia. Costo marginal limitado a la línea de datos 4G de cada chip. | **Ahorro de hasta un 70%** en gastos operativos recurrentes (OPEX). |
| **Privacidad y Control de Datos** | Datos de rutas, clientes y movimientos almacenados en servidores de terceros en el exterior. | Servidor propio, base de datos local y almacenamiento soberano de telemetría y video. | **Seguridad total de la información** operacional e industrial. |
| **Tiempo de Respuesta a Incidentes** | Notificaciones diferidas o limitadas por la plataforma del proveedor. | Alertas en tiempo real por fatiga, colisión y uso de celular con evidencia en video al instante. | **Reducción drástica de siniestralidad** y blindaje ante reclamos de terceros. |
| **Consumo de Combustible** | Sin control de ralentí ni de hábitos de aceleración y frenada. | Módulo Eco-Drive con calificación de conductores y detección de ralentí no justificado. | **Ahorro directo de 12% a 18%** en combustible mensual de la flota. |
| **Mantenimiento Mecánico** | Mantenimientos reactivos tras fallas o averías en campo. | Mantenimiento preventivo automatizado por kilometraje exacto del odómetro de cada unidad. | **Menor tiempo de vehículos paralizados** y disminución de costos de repuestos mayores. |

---

## 6. PRÓXIMOS PASOS DE IMPLEMENTACIÓN

1. **Configuración de Servidor de Producción (VPS):**
   - Despliegue de Traccar Enterprise y servidor de streaming en el VPS definitivo con IP estática y certificado SSL.
2. **Reapuntamiento Gradual de Flota:**
   - Envío de comandos de configuración a los equipos MD-300 para apuntar IP y puerto al nuevo servidor (`IP:5023`).
3. **Puesta en Marcha del Centro de Control:**
   - Habilitación del modo Video Wall en las pantallas de la sala de monitoreo de Base Central.
4. **Capacitación a Operadores:**
   - Entrenamiento del personal en lectura de alertas DSM/ADAS, gestión de eventos y protocolos de corte de motor de emergencia.

---
*Documento preparado para la Gerencia de Operaciones y Tecnología — Latino Americana de la Construcción, S.A.*
