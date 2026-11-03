import { Scenario, VisionClass, BusinessRule, UserProfile, AnalysisRecord } from './types';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: "usr_admin",
    name: "Dra. Elena Ramos",
    email: "elena.ramos@visionai-enterprise.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    department: "Dirección de Inteligencia Artificial & Operaciones",
  },
  {
    id: "usr_operator",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@visionai-enterprise.com",
    role: "operator",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    department: "Línea de Análisis & Inspección Visual",
  },
  {
    id: "usr_supervisor",
    name: "Ing. Roberto Salazar",
    email: "roberto.salazar@visionai-enterprise.com",
    role: "supervisor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    department: "Supervisión de Seguridad & Calidad Industrial",
  },
  {
    id: "usr_auditor",
    name: "Lic. Marcela Fuentes",
    email: "marcela.fuentes@visionai-enterprise.com",
    role: "auditor",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    department: "Auditoría de Normas & Cumplimiento ISO",
  },
];

export const DEFAULT_CLASSES: VisionClass[] = [
  {
    id: "cls_persona",
    name: "Persona",
    color: "#3b82f6", // Blue
    description: "Operarios, personal en planta o clientes en instalaciones",
    enabled: true,
    category: "person",
  },
  {
    id: "cls_casco",
    name: "Casco de Seguridad",
    color: "#eab308", // Yellow
    description: "Elemento de Protección Personal (EPP) tipo casco normado",
    enabled: true,
    category: "equipment",
  },
  {
    id: "cls_chaleco",
    name: "Chaleco Reflectivo",
    color: "#10b981", // Emerald
    description: "Chaleco de alta visibilidad para áreas industriales",
    enabled: true,
    category: "equipment",
  },
  {
    id: "cls_montacargas",
    name: "Montacargas",
    color: "#f97316", // Orange
    description: "Vehículo industrial de elevación y transporte de carga",
    enabled: true,
    category: "vehicle",
  },
  {
    id: "cls_pallet",
    name: "Pallet",
    color: "#a855f7", // Purple
    description: "Plataforma de soporte de mercadería en bodega",
    enabled: true,
    category: "object",
  },
  {
    id: "cls_caja",
    name: "Caja de Carga",
    color: "#06b6d4", // Cyan
    description: "Contenedor corrugado o paquete para distribución",
    enabled: true,
    category: "object",
  },
  {
    id: "cls_producto",
    name: "Producto Ensamblado",
    color: "#6366f1", // Indigo
    description: "Pieza o unidad manufacturada bajo inspección",
    enabled: true,
    category: "object",
  },
  {
    id: "cls_etiqueta",
    name: "Etiqueta / Código",
    color: "#14b8a6", // Teal
    description: "Identificador óptico o lote serial en producto",
    enabled: true,
    category: "object",
  },
  {
    id: "cls_defecto",
    name: "Defecto Superficial",
    color: "#ef4444", // Red
    description: "Fisura, rayón, desalineación o poro no conforme",
    enabled: true,
    category: "defect",
  },
  {
    id: "cls_estante",
    name: "Estantería / Góndola",
    color: "#8b5cf6", // Violet
    description: "Estructura de exhibición comercial en sala de venta",
    enabled: true,
    category: "object",
  },
];

export const DEFAULT_RULES: BusinessRule[] = [
  {
    id: "rul_epp_obligatorio",
    name: "EPP Completo Obligatorio",
    condition: "Toda persona detectada en área operacional debe portar casco y chaleco",
    threshold: 0.75,
    severity: "critical",
    enabled: true,
    scenarioTarget: "scen_seguridad",
    description: "Genera alerta crítica cuando una persona es detectada sin casco o sin chaleco reflectivo.",
  },
  {
    id: "rul_zona_restringida",
    name: "Invasión de Pasillo Peatonal",
    condition: "Montacargas o carga en zona delimitada para tránsito humano",
    threshold: 0.8,
    severity: "high",
    enabled: true,
    scenarioTarget: "scen_almacen",
    description: "Detecta vehículos de carga sobrepasando la franja amarilla de seguridad peatonal.",
  },
  {
    id: "rul_control_calidad",
    name: "Tolerancia de Defectos en Manufactura",
    condition: "Área de defecto superior al 1.5% o confianza de anomalía > 80%",
    threshold: 0.85,
    severity: "medium",
    enabled: true,
    scenarioTarget: "scen_calidad",
    description: "Marca lote como NO CONFORME si se detectan imperfecciones o rayones superficiales.",
  },
  {
    id: "rul_afluencia_retail",
    name: "Alerta de Sobreafluencia en Pasillo",
    condition: "Conteo simultáneo de clientes > 4 personas por sector de pasillo",
    threshold: 0.7,
    severity: "medium",
    enabled: true,
    scenarioTarget: "scen_retail",
    description: "Alerta al supervisor de sala para agilizar atención o habilitar caja adicional.",
  },
];

// High quality crisp SVG vector assets with data URIs
export const SCENARIO_IMAGES = {
  seguridad: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" width="1000" height="650">
    <defs>
      <linearGradient id="bg_seg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%231e293b"/>
        <stop offset="60%" stop-color="%23334155"/>
        <stop offset="100%" stop-color="%23475569"/>
      </linearGradient>
      <linearGradient id="pavement" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%2364748b"/>
        <stop offset="100%" stop-color="%23475569"/>
      </linearGradient>
      <pattern id="hazard" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="20" height="40" fill="%23facc15"/>
        <rect x="20" width="20" height="40" fill="%230f172a"/>
      </pattern>
    </defs>
    <!-- Background factory hall -->
    <rect width="1000" height="650" fill="url(%23bg_seg)"/>
    <!-- Floor and yellow safety markings -->
    <polygon points="0,420 1000,420 1000,650 0,650" fill="url(%23pavement)"/>
    <rect y="415" width="1000" height="12" fill="url(%23hazard)"/>
    
    <!-- Background industrial structures -->
    <rect x="80" y="80" width="180" height="340" fill="%231e293b" stroke="%23475569" stroke-width="4"/>
    <rect x="110" y="110" width="120" height="180" fill="%230f172a" rx="6"/>
    <circle cx="170" cy="180" r="40" fill="%2338bdf8" opacity="0.2"/>
    <path d="M 170 140 L 170 220 M 130 180 L 210 180" stroke="%2338bdf8" stroke-width="2"/>
    
    <rect x="760" y="120" width="160" height="300" fill="%231e293b" stroke="%23475569" stroke-width="4"/>
    <rect x="780" y="150" width="120" height="200" fill="%230284c7" opacity="0.15"/>
    <!-- Overhead crane beam -->
    <rect x="0" y="40" width="1000" height="24" fill="%23eab308"/>
    <line x1="0" y1="64" x2="1000" y2="64" stroke="%23ca8a04" stroke-width="4"/>

    <!-- WORKER 1 (Left: Fully equipped with helmet and hi-vis vest) -->
    <!-- Shadow -->
    <ellipse cx="320" cy="580" rx="45" ry="12" fill="%230f172a" opacity="0.5"/>
    <!-- Body/legs -->
    <rect x="300" y="420" width="16" height="150" fill="%231e3a8a" rx="4"/>
    <rect x="324" y="420" width="16" height="150" fill="%231e3a8a" rx="4"/>
    <!-- Torso with neon safety vest -->
    <rect x="290" y="270" width="60" height="160" fill="%2322c55e" rx="10"/>
    <rect x="300" y="290" width="40" height="30" fill="%23facc15"/>
    <line x1="290" y1="340" x2="350" y2="340" stroke="%23ffffff" stroke-width="10"/>
    <line x1="290" y1="380" x2="350" y2="380" stroke="%23ffffff" stroke-width="10"/>
    <!-- Head -->
    <circle cx="320" cy="225" r="24" fill="%23fcd34d"/>
    <!-- Helmet Yellow -->
    <path d="M 292 220 Q 320 180 348 220 Z" fill="%23eab308"/>
    <rect x="288" y="218" width="64" height="6" fill="%23ca8a04" rx="2"/>

    <!-- WORKER 2 (Right: INFRACTION - NO HELMET, NO VEST) -->
    <!-- Shadow -->
    <ellipse cx="620" cy="580" rx="45" ry="12" fill="%230f172a" opacity="0.5"/>
    <!-- Legs -->
    <rect x="602" y="420" width="16" height="150" fill="%23334155" rx="4"/>
    <rect x="622" y="420" width="16" height="150" fill="%23334155" rx="4"/>
    <!-- Torso in plain casual dark jacket (NON-COMPLIANT) -->
    <rect x="590" y="270" width="60" height="160" fill="%23475569" rx="10"/>
    <!-- Head (Bare hair, NO HELMET) -->
    <circle cx="620" cy="230" r="23" fill="%23fed7aa"/>
    <path d="M 598 226 Q 620 200 642 226 Z" fill="%23451a03"/>

    <!-- Signage -->
    <rect x="440" y="100" width="120" height="60" fill="%230284c7" rx="8" stroke="%23ffffff" stroke-width="2"/>
    <text x="500" y="135" fill="%23ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">USO DE CASCO</text>
  </svg>`,

  almacen: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" width="1000" height="650">
    <defs>
      <linearGradient id="floor_alm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%2394a3b8"/>
        <stop offset="100%" stop-color="%2364748b"/>
      </linearGradient>
    </defs>
    <!-- Background Warehouse -->
    <rect width="1000" height="650" fill="%231e293b"/>
    <polygon points="0,320 1000,320 1000,650 0,650" fill="url(%23floor_alm)"/>
    
    <!-- Heavy Industrial Racks -->
    <!-- Left Rack -->
    <rect x="40" y="80" width="22" height="480" fill="%23f97316"/>
    <rect x="260" y="80" width="22" height="480" fill="%23f97316"/>
    <rect x="40" y="180" width="242" height="16" fill="%23ea580c"/>
    <rect x="40" y="320" width="242" height="16" fill="%23ea580c"/>
    <!-- Stored boxes on racks -->
    <rect x="65" y="210" width="80" height="100" fill="%23d97706" stroke="%23b45309" stroke-width="3"/>
    <rect x="155" y="230" width="85" height="80" fill="%23b45309"/>
    <rect x="65" y="100" width="90" height="70" fill="%23f59e0b"/>

    <!-- Forklift (Montacargas) crossing safety boundary -->
    <!-- Warning Floor Line -->
    <line x1="380" y1="320" x2="380" y2="650" stroke="%23eab308" stroke-width="12" stroke-dasharray="24,16"/>
    <text x="320" y="450" fill="%23facc15" font-size="16" font-weight="bold" font-family="sans-serif" transform="rotate(-90 320 450)">ZONA PEATONAL EXCLUSIVA</text>

    <!-- Forklift Vehicle Body -->
    <rect x="460" y="360" width="260" height="160" fill="%23f59e0b" rx="16" stroke="%23d97706" stroke-width="4"/>
    <!-- Cabin cage -->
    <rect x="520" y="240" width="130" height="130" fill="none" stroke="%230f172a" stroke-width="10"/>
    <circle cx="585" cy="300" r="22" fill="%23fed7aa"/> <!-- Driver head -->
    <!-- Wheels -->
    <circle cx="510" cy="540" r="38" fill="%230f172a" stroke="%23475569" stroke-width="6"/>
    <circle cx="680" cy="540" r="38" fill="%230f172a" stroke="%23475569" stroke-width="6"/>
    <!-- Mast and Forks extending into restricted zone -->
    <rect x="430" y="220" width="16" height="310" fill="%230f172a"/>
    <rect x="340" y="500" width="100" height="14" fill="%230f172a"/>
    
    <!-- Pallet on forks -->
    <rect x="310" y="480" width="120" height="18" fill="%23854d0e"/>
    <rect x="320" y="380" width="100" height="95" fill="%23ca8a04" stroke="%2378350f" stroke-width="3"/>
  </svg>`,

  calidad: `data:image/svg+xml;utf8;<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" width="1000" height="650">
    <defs>
      <radialGradient id="grad_metal" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="%23f1f5f9"/>
        <stop offset="70%" stop-color="%23cbd5e1"/>
        <stop offset="100%" stop-color="%2394a3b8"/>
      </radialGradient>
      <linearGradient id="belt" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="%23334155"/>
        <stop offset="50%" stop-color="%23475569"/>
        <stop offset="100%" stop-color="%23334155"/>
      </linearGradient>
    </defs>
    <!-- Inspection Bench Background -->
    <rect width="1000" height="650" fill="%230f172a"/>
    <!-- Conveyor belt / lighting ring -->
    <rect y="180" width="1000" height="340" fill="url(%23belt)"/>
    <circle cx="500" cy="350" r="230" fill="%230284c7" opacity="0.1"/>
    
    <!-- High Precision Machined Part / Electronics Module (Producto) -->
    <rect x="280" y="200" width="440" height="300" fill="url(%23grad_metal)" rx="24" stroke="%2364748b" stroke-width="8"/>
    
    <!-- Inner circuitry / features -->
    <rect x="330" y="240" width="140" height="100" fill="%230284c7" rx="8" opacity="0.8"/>
    <circle cx="400" cy="290" r="24" fill="%23ffffff" opacity="0.9"/>
    
    <!-- Barcode / QR Label (Etiqueta) -->
    <rect x="520" y="240" width="150" height="80" fill="%23ffffff" rx="6" stroke="%2394a3b8" stroke-width="2"/>
    <line x1="535" y1="255" x2="535" y2="305" stroke="%23000000" stroke-width="4"/>
    <line x1="545" y1="255" x2="545" y2="305" stroke="%23000000" stroke-width="2"/>
    <line x1="555" y1="255" x2="555" y2="305" stroke="%23000000" stroke-width="6"/>
    <line x1="570" y1="255" x2="570" y2="305" stroke="%23000000" stroke-width="3"/>
    <line x1="585" y1="255" x2="585" y2="305" stroke="%23000000" stroke-width="5"/>
    <line x1="600" y1="255" x2="600" y2="305" stroke="%23000000" stroke-width="2"/>
    <text x="595" y="315" font-family="monospace" font-size="10" text-anchor="middle" fill="%23334155">LOT-2026-X89</text>

    <!-- CRITICAL DEFECT (Scratch / Fissure on bottom right quadrant) -->
    <path d="M 460 410 Q 510 430 550 395 T 610 440" fill="none" stroke="%23ef4444" stroke-width="5" stroke-linecap="round"/>
    <circle cx="530" cy="415" r="35" fill="%23ef4444" opacity="0.25"/>
    <text x="530" y="475" fill="%23ef4444" font-weight="bold" font-family="sans-serif" font-size="13" text-anchor="middle">DEFECTO RAYÓN 18.4mm</text>
  </svg>`,

  retail: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" width="1000" height="650">
    <defs>
      <linearGradient id="ret_floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%23f8fafc"/>
        <stop offset="100%" stop-color="%23e2e8f0"/>
      </linearGradient>
    </defs>
    <!-- Modern Retail Store Interior -->
    <rect width="1000" height="650" fill="%23f1f5f9"/>
    <!-- Floor tiles -->
    <rect y="280" width="1000" height="370" fill="url(%23ret_floor)"/>
    <line x1="0" y1="400" x2="1000" y2="400" stroke="%23cbd5e1" stroke-width="2"/>
    <line x1="0" y1="520" x2="1000" y2="520" stroke="%23cbd5e1" stroke-width="2"/>

    <!-- Left Retail Shelf (Góndola) -->
    <rect x="40" y="100" width="220" height="420" fill="%23334155" rx="8"/>
    <rect x="50" y="120" width="200" height="16" fill="%2394a3b8"/>
    <rect x="50" y="220" width="200" height="16" fill="%2394a3b8"/>
    <rect x="50" y="320" width="200" height="16" fill="%2394a3b8"/>
    <!-- Products on shelf -->
    <rect x="60" y="150" width="35" height="65" fill="%23ef4444" rx="4"/>
    <rect x="105" y="150" width="35" height="65" fill="%233b82f6" rx="4"/>
    <rect x="150" y="150" width="35" height="65" fill="%2310b981" rx="4"/>
    <rect x="195" y="150" width="35" height="65" fill="%23f59e0b" rx="4"/>
    
    <!-- Right Retail Shelf -->
    <rect x="740" y="100" width="220" height="420" fill="%23334155" rx="8"/>
    <rect x="750" y="120" width="200" height="16" fill="%2394a3b8"/>
    <rect x="750" y="240" width="200" height="16" fill="%2394a3b8"/>

    <!-- Shopper 1 (Center Left) -->
    <ellipse cx="380" cy="580" rx="30" ry="10" fill="%2394a3b8" opacity="0.6"/>
    <circle cx="380" cy="330" r="22" fill="%23fbcfe8"/>
    <rect x="360" y="360" width="40" height="130" fill="%23ec4899" rx="8"/>
    <rect x="365" y="490" width="12" height="85" fill="%231e293b"/>
    <rect x="383" y="490" width="12" height="85" fill="%231e293b"/>

    <!-- Shopper 2 (Center) -->
    <ellipse cx="490" cy="590" rx="30" ry="10" fill="%2394a3b8" opacity="0.6"/>
    <circle cx="490" cy="310" r="22" fill="%23fed7aa"/>
    <rect x="470" y="340" width="40" height="145" fill="%230284c7" rx="8"/>
    <rect x="475" y="485" width="13" height="95" fill="%230f172a"/>
    <rect x="495" y="485" width="13" height="95" fill="%230f172a"/>

    <!-- Shopper 3 (Center Right - crowded zone) -->
    <ellipse cx="590" cy="570" rx="28" ry="9" fill="%2394a3b8" opacity="0.6"/>
    <circle cx="590" cy="340" r="20" fill="%23fcd34d"/>
    <rect x="572" y="370" width="36" height="120" fill="%2310b981" rx="8"/>
    <rect x="577" y="490" width="11" height="75" fill="%23334155"/>
    <rect x="593" y="490" width="11" height="75" fill="%23334155"/>

    <!-- Shopper 4 (Near aisle head) -->
    <ellipse cx="670" cy="550" rx="26" ry="8" fill="%2394a3b8" opacity="0.6"/>
    <circle cx="670" cy="355" r="19" fill="%23fed7aa"/>
    <rect x="654" y="380" width="32" height="110" fill="%238b5cf6" rx="8"/>
    <rect x="658" y="490" width="10" height="55" fill="%231e293b"/>
    <rect x="672" y="490" width="10" height="55" fill="%231e293b"/>

    <!-- Heatmap indicator (Density / Congestion overlay zone) -->
    <ellipse cx="530" cy="520" rx="200" ry="80" fill="%23ef4444" opacity="0.2"/>
  </svg>`,
};

export const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: "scen_seguridad",
    name: "Seguridad Industrial & Prevención EPP",
    description: "Inspección de elementos de protección personal (casco y chaleco reflectivo) en área operacional de planta.",
    sector: "Seguridad y prevención",
    asset: SCENARIO_IMAGES.seguridad,
    tags: ["EPP", "Seguridad Laboral", "Casco", "Chaleco", "Alerta Crítica"],
    expectedResults: {
      objects: ["Persona (2)", "Casco de Seguridad (1)", "Chaleco Reflectivo (1)"],
      patterns: ["EPP Incompleto detectado en Operario 2 (sin casco y sin chaleco reflectivo)"],
      alerts: ["Alerta Crítica: Infracción de EPP en zona de riesgo operacional"],
    },
    detectionsSeed: [
      {
        id: "det_seg_1",
        classId: "cls_persona",
        label: "Persona (Operario Conforme)",
        confidence: 0.96,
        box: { x: 0.28, y: 0.28, width: 0.09, height: 0.62 },
        color: "#3b82f6",
      },
      {
        id: "det_seg_2",
        classId: "cls_casco",
        label: "Casco de Seguridad",
        confidence: 0.94,
        box: { x: 0.285, y: 0.26, width: 0.07, height: 0.08 },
        color: "#eab308",
      },
      {
        id: "det_seg_3",
        classId: "cls_chaleco",
        label: "Chaleco Reflectivo",
        confidence: 0.95,
        box: { x: 0.288, y: 0.40, width: 0.065, height: 0.25 },
        color: "#10b981",
      },
      {
        id: "det_seg_4",
        classId: "cls_persona",
        label: "Persona (Infracción EPP)",
        confidence: 0.93,
        box: { x: 0.58, y: 0.31, width: 0.09, height: 0.59 },
        color: "#3b82f6",
      },
    ],
    masksSeed: [
      {
        id: "mask_seg_1",
        classId: "cls_persona",
        label: "Silueta Operario 1",
        confidence: 0.95,
        areaRatio: 0.058,
        type: "instance",
        color: "#3b82f6",
        polygon: [
          [0.32, 0.27], [0.35, 0.31], [0.36, 0.45], [0.35, 0.65],
          [0.34, 0.89], [0.30, 0.89], [0.29, 0.65], [0.28, 0.45], [0.29, 0.31]
        ],
      },
      {
        id: "mask_seg_2",
        classId: "cls_persona",
        label: "Silueta Operario 2 (No Conforme)",
        confidence: 0.92,
        areaRatio: 0.055,
        type: "instance",
        color: "#ef4444",
        polygon: [
          [0.62, 0.31], [0.65, 0.35], [0.66, 0.48], [0.65, 0.68],
          [0.64, 0.90], [0.60, 0.90], [0.59, 0.68], [0.58, 0.48], [0.59, 0.35]
        ],
      },
      {
        id: "mask_seg_floor",
        classId: "cls_object",
        label: "Piso Operacional",
        confidence: 0.98,
        areaRatio: 0.35,
        type: "semantic",
        color: "#64748b",
        polygon: [
          [0.0, 0.65], [1.0, 0.65], [1.0, 1.0], [0.0, 1.0]
        ],
      },
    ],
    patternsSeed: [
      {
        id: "pat_seg_1",
        type: "epp_violation",
        label: "Patrón: EPP Incompleto (Sin Casco / Sin Chaleco)",
        confidence: 0.91,
        evidence: "Operario detectado en coordenadas (0.58, 0.31) carece de casco de protección obligatorio y chaleco de alta visibilidad.",
        status: "critical",
        severity: "critical",
        boundingBox: { x: 0.58, y: 0.31, width: 0.09, height: 0.59 },
      },
    ],
  },
  {
    id: "scen_almacen",
    name: "Almacén Inteligente & Zonas Restringidas",
    description: "Monitoreo de tráfico logístico, estanterías, pallets y detección de invasión de montacargas en pasillos peatonales.",
    sector: "Retail y almacenes",
    asset: SCENARIO_IMAGES.almacen,
    tags: ["Logística", "Montacargas", "Pallets", "Invasión de Zona", "Seguridad Vial"],
    expectedResults: {
      objects: ["Montacargas (1)", "Pallet (1)", "Caja de Carga (3)"],
      patterns: ["Montacargas y carga invadiendo zona de tránsito peatonal exclusivo"],
      alerts: ["Alerta Alta: Vehículo invadiendo pasillo de personas"],
    },
    detectionsSeed: [
      {
        id: "det_alm_1",
        classId: "cls_montacargas",
        label: "Montacargas Activo",
        confidence: 0.97,
        box: { x: 0.44, y: 0.35, width: 0.31, height: 0.52 },
        color: "#f97316",
      },
      {
        id: "det_alm_2",
        classId: "cls_pallet",
        label: "Pallet de Carga",
        confidence: 0.93,
        box: { x: 0.30, y: 0.72, width: 0.14, height: 0.12 },
        color: "#a855f7",
      },
      {
        id: "det_alm_3",
        classId: "cls_caja",
        label: "Caja en Horquillas",
        confidence: 0.91,
        box: { x: 0.31, y: 0.56, width: 0.12, height: 0.18 },
        color: "#06b6d4",
      },
      {
        id: "det_alm_4",
        classId: "cls_caja",
        label: "Caja en Rack A1",
        confidence: 0.89,
        box: { x: 0.06, y: 0.31, width: 0.09, height: 0.17 },
        color: "#06b6d4",
      },
    ],
    masksSeed: [
      {
        id: "mask_alm_zone",
        classId: "cls_object",
        label: "Zona Peatonal Delimitada",
        confidence: 0.96,
        areaRatio: 0.28,
        type: "semantic",
        color: "#eab308",
        polygon: [
          [0.0, 0.49], [0.38, 0.49], [0.38, 1.0], [0.0, 1.0]
        ],
      },
      {
        id: "mask_alm_forklift",
        classId: "cls_montacargas",
        label: "Silueta Montacargas",
        confidence: 0.97,
        areaRatio: 0.16,
        type: "instance",
        color: "#f97316",
        polygon: [
          [0.52, 0.37], [0.65, 0.37], [0.73, 0.56], [0.74, 0.86],
          [0.45, 0.86], [0.43, 0.55], [0.52, 0.37]
        ],
      },
    ],
    patternsSeed: [
      {
        id: "pat_alm_1",
        type: "zone_intrusion",
        label: "Patrón: Invasión de Zona Peatonal",
        confidence: 0.94,
        evidence: "Las horquillas y carga del montacargas cruzan el umbral de seguridad peatonal (x < 0.38) en pasillo central.",
        status: "critical",
        severity: "high",
        boundingBox: { x: 0.30, y: 0.55, width: 0.15, height: 0.28 },
      },
    ],
  },
  {
    id: "scen_calidad",
    name: "Control de Calidad & Defectos Superficiales",
    description: "Inspección automatizada de componentes ensamblados, verificación de etiquetas legibles y detección de microfisuras o rayones.",
    sector: "Manufactura",
    asset: SCENARIO_IMAGES.calidad,
    tags: ["Manufactura", "Control de Calidad", "Inspección Óptica", "Fisura", "Conforme / No Conforme"],
    expectedResults: {
      objects: ["Producto Ensamblado (1)", "Etiqueta / Código (1)", "Defecto Superficial (1)"],
      patterns: ["Discontinuidad geométrica / rayón superior al límite de tolerancia"],
      alerts: ["Alerta Media: Pieza No Conforme por rayón superficial de 18.4mm"],
    },
    detectionsSeed: [
      {
        id: "det_cal_1",
        classId: "cls_producto",
        label: "Producto Inspeccionado",
        confidence: 0.99,
        box: { x: 0.27, y: 0.30, width: 0.46, height: 0.48 },
        color: "#6366f1",
      },
      {
        id: "det_cal_2",
        classId: "cls_etiqueta",
        label: "Etiqueta Código Lote",
        confidence: 0.98,
        box: { x: 0.51, y: 0.36, width: 0.16, height: 0.14 },
        color: "#14b8a6",
      },
      {
        id: "det_cal_3",
        classId: "cls_defecto",
        label: "Defecto Rayón Superficial",
        confidence: 0.92,
        box: { x: 0.45, y: 0.59, width: 0.18, height: 0.12 },
        color: "#ef4444",
      },
    ],
    masksSeed: [
      {
        id: "mask_cal_prod",
        classId: "cls_producto",
        label: "Región Producto Base",
        confidence: 0.99,
        areaRatio: 0.22,
        type: "instance",
        color: "#6366f1",
        polygon: [
          [0.28, 0.32], [0.71, 0.32], [0.71, 0.76], [0.28, 0.76]
        ],
      },
      {
        id: "mask_cal_defect",
        classId: "cls_defecto",
        label: "Máscara Defecto / Fisura",
        confidence: 0.94,
        areaRatio: 0.021,
        type: "semantic",
        color: "#ef4444",
        polygon: [
          [0.46, 0.62], [0.51, 0.65], [0.55, 0.60], [0.61, 0.67], [0.58, 0.70], [0.50, 0.66], [0.45, 0.64]
        ],
      },
    ],
    patternsSeed: [
      {
        id: "pat_cal_1",
        type: "surface_anomaly",
        label: "Patrón: Rayón Fuera de Tolerancia ISO 9001",
        confidence: 0.92,
        evidence: "La máscara de segmentación calcula un área afectada de 2.1% con longitud de 18.4mm en zona funcional crítica.",
        status: "warning",
        severity: "medium",
        boundingBox: { x: 0.45, y: 0.59, width: 0.18, height: 0.12 },
      },
    ],
  },
  {
    id: "scen_retail",
    name: "Retail & Análisis de Afluencia / Congestión",
    description: "Análisis de tráfico de clientes frente a estanterías comerciales, ocupación de pasillos y conteo simultáneo.",
    sector: "Retail y almacenes",
    asset: SCENARIO_IMAGES.retail,
    tags: ["Retail", "Afluencia", "Conteo de Personas", "Mapa de Calor", "Congestión"],
    expectedResults: {
      objects: ["Persona (4)", "Estantería (2)", "Productos (4)"],
      patterns: ["Densidad elevada de clientes en pasillo central (> 3 personas simultáneas)"],
      alerts: ["Alerta Media: Umbral de afluencia superado en pasillo A2"],
    },
    detectionsSeed: [
      {
        id: "det_ret_1",
        classId: "cls_persona",
        label: "Cliente 1 (Zona Pasillo)",
        confidence: 0.95,
        box: { x: 0.35, y: 0.47, width: 0.07, height: 0.44 },
        color: "#3b82f6",
      },
      {
        id: "det_ret_2",
        classId: "cls_persona",
        label: "Cliente 2 (Zona Central)",
        confidence: 0.96,
        box: { x: 0.46, y: 0.44, width: 0.07, height: 0.47 },
        color: "#3b82f6",
      },
      {
        id: "det_ret_3",
        classId: "cls_persona",
        label: "Cliente 3 (Zona Interacción)",
        confidence: 0.93,
        box: { x: 0.56, y: 0.49, width: 0.065, height: 0.40 },
        color: "#3b82f6",
      },
      {
        id: "det_ret_4",
        classId: "cls_persona",
        label: "Cliente 4 (Cabecera)",
        confidence: 0.91,
        box: { x: 0.64, y: 0.51, width: 0.06, height: 0.36 },
        color: "#3b82f6",
      },
      {
        id: "det_ret_5",
        classId: "cls_estante",
        label: "Góndola Izquierda",
        confidence: 0.98,
        box: { x: 0.04, y: 0.15, width: 0.22, height: 0.65 },
        color: "#8b5cf6",
      },
      {
        id: "det_ret_6",
        classId: "cls_estante",
        label: "Góndola Derecha",
        confidence: 0.97,
        box: { x: 0.74, y: 0.15, width: 0.22, height: 0.65 },
        color: "#8b5cf6",
      },
    ],
    masksSeed: [
      {
        id: "mask_ret_density",
        classId: "cls_persona",
        label: "Área de Congestión Peatonal",
        confidence: 0.93,
        areaRatio: 0.24,
        type: "panoptic",
        color: "#ef4444",
        polygon: [
          [0.33, 0.70], [0.72, 0.70], [0.70, 0.95], [0.35, 0.95]
        ],
      },
    ],
    patternsSeed: [
      {
        id: "pat_ret_1",
        type: "high_occupancy",
        label: "Patrón: Ocupación Alta en Pasillo Central",
        confidence: 0.92,
        evidence: "Se detectan 4 clientes en proximidad estrecha (< 1.8m entre ejes) superando el umbral de afluencia cómoda.",
        status: "warning",
        severity: "medium",
        boundingBox: { x: 0.35, y: 0.44, width: 0.35, height: 0.51 },
      },
    ],
  },
];

export const INITIAL_ANALYSES_SEED: AnalysisRecord[] = [
  {
    id: "ana_demo_001",
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    createdBy: "Carlos Mendoza",
    userRole: "operator",
    sourceName: "Cámara Planta Sur - N1",
    scenarioId: "scen_seguridad",
    scenarioName: "Seguridad Industrial & Prevención EPP",
    imageUrl: SCENARIO_IMAGES.seguridad,
    mode: "combined",
    status: "completed",
    durationMs: 420,
    averageConfidence: 0.94,
    detectionsCount: 4,
    alertsCount: 1,
    confidenceThreshold: 0.65,
    engineType: "demo",
    result: {
      analysisId: "ana_demo_001",
      detections: DEFAULT_SCENARIOS[0].detectionsSeed as any,
      masks: DEFAULT_SCENARIOS[0].masksSeed as any,
      patterns: DEFAULT_SCENARIOS[0].patternsSeed as any,
      durationMs: 420,
      averageConfidence: 0.94,
      alerts: [
        {
          id: "alt_001",
          analysisId: "ana_demo_001",
          ruleId: "rul_epp_obligatorio",
          ruleName: "EPP Completo Obligatorio",
          severity: "critical",
          message: "Operario detectado en área operacional sin casco ni chaleco de alta visibilidad.",
          status: "nueva",
          createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
          scenarioName: "Seguridad Industrial & Prevención EPP",
        },
      ],
    },
  },
  {
    id: "ana_demo_002",
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    createdBy: "Ing. Roberto Salazar",
    userRole: "supervisor",
    sourceName: "Cámara Bodega Central - Pasillo 3",
    scenarioId: "scen_almacen",
    scenarioName: "Almacén Inteligente & Zonas Restringidas",
    imageUrl: SCENARIO_IMAGES.almacen,
    mode: "combined",
    status: "completed",
    durationMs: 380,
    averageConfidence: 0.93,
    detectionsCount: 4,
    alertsCount: 1,
    confidenceThreshold: 0.70,
    engineType: "demo",
    result: {
      analysisId: "ana_demo_002",
      detections: DEFAULT_SCENARIOS[1].detectionsSeed as any,
      masks: DEFAULT_SCENARIOS[1].masksSeed as any,
      patterns: DEFAULT_SCENARIOS[1].patternsSeed as any,
      durationMs: 380,
      averageConfidence: 0.93,
      alerts: [
        {
          id: "alt_002",
          analysisId: "ana_demo_002",
          ruleId: "rul_zona_restringida",
          ruleName: "Invasión de Pasillo Peatonal",
          severity: "high",
          message: "Horquillas de montacargas rebasan línea perimetral amarilla invadiendo carril peatonal.",
          status: "revisada",
          createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
          reviewedBy: "Ing. Roberto Salazar",
          reviewNotes: "Operador de montacargas notificado por radiocanal. Se reubicó la carga sin incidentes.",
          reviewedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
          scenarioName: "Almacén Inteligente & Zonas Restringidas",
        },
      ],
    },
  },
  {
    id: "ana_demo_003",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    createdBy: "Carlos Mendoza",
    userRole: "operator",
    sourceName: "Estación de Inspección Óptica #4",
    scenarioId: "scen_calidad",
    scenarioName: "Control de Calidad & Defectos Superficiales",
    imageUrl: SCENARIO_IMAGES.calidad,
    mode: "combined",
    status: "completed",
    durationMs: 310,
    averageConfidence: 0.96,
    detectionsCount: 3,
    alertsCount: 1,
    confidenceThreshold: 0.80,
    engineType: "demo",
    result: {
      analysisId: "ana_demo_003",
      detections: DEFAULT_SCENARIOS[2].detectionsSeed as any,
      masks: DEFAULT_SCENARIOS[2].masksSeed as any,
      patterns: DEFAULT_SCENARIOS[2].patternsSeed as any,
      durationMs: 310,
      averageConfidence: 0.96,
      alerts: [
        {
          id: "alt_003",
          analysisId: "ana_demo_003",
          ruleId: "rul_control_calidad",
          ruleName: "Tolerancia de Defectos en Manufactura",
          severity: "medium",
          message: "Microfisura longitudinal de 18.4mm detectada sobre cubierta exterior.",
          status: "cerrada",
          createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
          reviewedBy: "Dra. Elena Ramos",
          reviewNotes: "Pieza segregada a línea de retrabajo. Lote aprobado parcialmente.",
          reviewedAt: new Date(Date.now() - 3600 * 1000 * 22).toISOString(),
          scenarioName: "Control de Calidad & Defectos Superficiales",
        },
      ],
    },
  },
  {
    id: "ana_demo_004",
    createdAt: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
    createdBy: "Lic. Marcela Fuentes",
    userRole: "auditor",
    sourceName: "Cámara Tienda Mall Plaza - Sector A",
    scenarioId: "scen_retail",
    scenarioName: "Retail & Análisis de Afluencia / Congestión",
    imageUrl: SCENARIO_IMAGES.retail,
    mode: "detection",
    status: "completed",
    durationMs: 290,
    averageConfidence: 0.95,
    detectionsCount: 6,
    alertsCount: 0,
    confidenceThreshold: 0.60,
    engineType: "demo",
    result: {
      analysisId: "ana_demo_004",
      detections: DEFAULT_SCENARIOS[3].detectionsSeed as any,
      masks: [],
      patterns: [],
      durationMs: 290,
      averageConfidence: 0.95,
      alerts: [],
    },
  },
];

