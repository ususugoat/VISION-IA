import React from 'react';
import type { TrackedObject, Zone, LiveAlert } from '../../../core/domain/liveTypes';
import { cn } from '../../../shared/utils/cn';

interface SceneRendererProps {
  environment: 'office' | 'datacenter' | 'lab' | 'meeting_room' | 'industrial' | 'warehouse' | 'quality' | 'retail';
  assetImage?: string;
  objects: TrackedObject[];
  zones: Zone[];
  alerts: LiveAlert[];
  showBoxes: boolean;
  showMasks: boolean;
  showLabels: boolean;
  showZones: boolean;
  showLowConfidence: boolean;
  confidenceThreshold?: number;
  selectedEntityId?: string | null;
  onSelectEntity?: (id: string | null) => void;
  frameNumber: number;
}

// ----- Background renderers per environment -----

const OfficeBackground: React.FC = () => (
  <>
    {/* Floor */}
    <rect x="0" y="520" width="1000" height="130" fill="#e2e8f0" />
    {/* Ceiling */}
    <rect x="0" y="0" width="1000" height="60" fill="#94a3b8" />
    {/* Back wall */}
    <rect x="0" y="60" width="1000" height="460" fill="#f1f5f9" />
    {/* Ceiling lights */}
    {[150, 350, 550, 750, 950].map((x, i) => (
      <g key={i}>
        <rect x={x - 50} y="10" width="100" height="20" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        <rect x={x - 40} y="12" width="80" height="16" rx="2" fill="#fffde7" opacity="0.9" />
        <line x1={x} y1="30" x2={x - 60} y2="60" stroke="#fffde7" strokeWidth="0.5" opacity="0.4" />
        <line x1={x} y1="30" x2={x + 60} y2="60" stroke="#fffde7" strokeWidth="0.5" opacity="0.4" />
      </g>
    ))}
    {/* Desks row - back */}
    {[80, 270, 460, 650, 840].map((x, i) => (
      <g key={i}>
        {/* Desk surface */}
        <rect x={x} y="310" width="140" height="8" rx="2" fill="#c8d3e0" stroke="#94a3b8" strokeWidth="1" />
        {/* Monitor */}
        <rect x={x + 45} y="245" width="52" height="38" rx="3" fill="#1e293b" />
        <rect x={x + 47} y="247" width="48" height="34" rx="2" fill="#0f172a" />
        {/* Monitor screen glow */}
        <rect x={x + 48} y="248" width="46" height="32" rx="2" fill="#1d4ed8" opacity="0.6" />
        <text x={x + 71} y="268" textAnchor="middle" fill="#93c5fd" fontSize="6" fontFamily="monospace">&lt;/code&gt;</text>
        {/* Monitor stand */}
        <rect x={x + 66} y="318" width="10" height="6" fill="#475569" />
        {/* Keyboard */}
        <rect x={x + 30} y="316" width="52" height="8" rx="2" fill="#475569" />
        {/* Mouse */}
        <ellipse cx={x + 92} cy="320" rx="8" ry="6" fill="#475569" />
        {/* Desk legs */}
        <rect x={x + 5} y="318" width="6" height="40" fill="#94a3b8" />
        <rect x={x + 129} y="318" width="6" height="40" fill="#94a3b8" />
      </g>
    ))}
    {/* Floor grid lines */}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <line key={i} x1={i * 160} y1="520" x2={i * 160} y2="650" stroke="#cbd5e1" strokeWidth="0.5" />
    ))}
    {[520, 560, 600, 640].map((y, i) => (
      <line key={i} x1="0" y1={y} x2="1000" y2={y} stroke="#cbd5e1" strokeWidth="0.5" />
    ))}
    {/* Cabinet/Server closet back right */}
    <rect x="850" y="80" width="130" height="200" rx="4" fill="#334155" />
    <rect x="855" y="85" width="120" height="190" rx="3" fill="#1e293b" />
    {[100, 125, 150, 175, 200, 225, 250].map((y, i) => (
      <g key={i}>
        <rect x="860" y={y} width="110" height="18" rx="2" fill="#0f172a" />
        <circle cx="875" cy={y + 9} r="4" fill={i % 2 === 0 ? '#22c55e' : '#3b82f6'} />
        <rect x="885" y={y + 5} width="70" height="8" rx="1" fill="#1e3a5f" />
      </g>
    ))}
    <text x="915" y="295" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">ARMARIO RED</text>
  </>
);

const DatacenterBackground: React.FC = () => (
  <>
    {/* Floor - raised tiles */}
    <rect x="0" y="530" width="1000" height="120" fill="#1e293b" />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((xi) =>
      [0, 1, 2].map((yi) => (
        <rect
          key={`${xi}-${yi}`}
          x={xi * 100 + 2}
          y={530 + yi * 40 + 2}
          width="96"
          height="36"
          rx="2"
          fill="#243447"
          stroke="#334155"
          strokeWidth="1"
        />
      ))
    )}
    {/* Ceiling */}
    <rect x="0" y="0" width="1000" height="50" fill="#0f172a" />
    {/* Cable trays on ceiling */}
    <rect x="0" y="45" width="1000" height="12" fill="#1e3a5f" />
    {/* Blue LED strips on ceiling */}
    <rect x="0" y="52" width="1000" height="4" fill="#1d4ed8" opacity="0.7" />
    {/* Back wall */}
    <rect x="0" y="62" width="1000" height="470" fill="#0f172a" />
    {/* Rack rows */}
    {[30, 220, 410, 600, 790].map((x, col) => (
      <g key={col}>
        {/* Rack cabinet */}
        <rect x={x} y="80" width="160" height="440" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        {/* Rack interior glow */}
        <rect x={x + 5} y="85" width="150" height="430" rx="3" fill="#0f172a" />
        {/* Rack units */}
        {Array.from({ length: 18 }).map((_, u) => (
          <g key={u}>
            <rect x={x + 8} y={90 + u * 23} width="144" height="20" rx="2" fill="#1e3a5f" />
            <circle cx={x + 18} cy={90 + u * 23 + 10} r="3" fill={Math.random() > 0.2 ? '#22c55e' : '#ef4444'} />
            <circle cx={x + 26} cy={90 + u * 23 + 10} r="2" fill="#3b82f6" />
            <rect x={x + 32} y={90 + u * 23 + 7} width="80" height="6" rx="1" fill="#152a46" />
            <rect x={x + 32} y={90 + u * 23 + 7} width={`${20 + Math.round(Math.random() * 60)}`} height="6" rx="1" fill="#1d4ed8" opacity="0.7" />
          </g>
        ))}
        {/* Rack label */}
        <text x={x + 80} y="535" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">
          RACK-{String.fromCharCode(65 + col)}
        </text>
        {/* Blue LED bottom */}
        <rect x={x} y="516" width="160" height="4" fill="#1d4ed8" opacity="0.5" />
      </g>
    ))}
    {/* Hot aisle indicator - warm glow */}
    <rect x="330" y="80" width="60" height="440" fill="#f97316" opacity="0.06" />
    {/* Cold aisle indicator - blue glow */}
    <rect x="600" y="80" width="80" height="440" fill="#06b6d4" opacity="0.07" />
  </>
);

const LabBackground: React.FC = () => (
  <>
    {/* Floor white vinyl */}
    <rect x="0" y="510" width="1000" height="140" fill="#f8fafc" />
    {/* Ceiling */}
    <rect x="0" y="0" width="1000" height="55" fill="#e2e8f0" />
    {/* Back wall */}
    <rect x="0" y="55" width="1000" height="455" fill="#f8fafc" />
    {/* Floor grid */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
      <line key={`vl-${i}`} x1={i * 112} y1="510" x2={i * 112} y2="650" stroke="#e2e8f0" strokeWidth="1" />
    ))}
    {[510, 560, 610].map((y, i) => (
      <line key={`hl-${i}`} x1="0" y1={y} x2="1000" y2={y} stroke="#e2e8f0" strokeWidth="1" />
    ))}
    {/* Lab benches */}
    {[60, 360, 660].map((x, i) => (
      <g key={i}>
        {/* Bench surface - ESD mat green tint */}
        <rect x={x} y="310" width="250" height="12" rx="3" fill="#bbf7d0" stroke="#86efac" strokeWidth="1.5" />
        {/* ESD mat texture lines */}
        {[0, 1, 2, 3, 4].map((j) => (
          <line key={j} x1={x + j * 50} y1="310" x2={x + j * 50} y2="322" stroke="#86efac" strokeWidth="0.5" opacity="0.7" />
        ))}
        {/* Device under test (DUT) */}
        <rect x={x + 60} y="265" width="80" height="45" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <rect x={x + 65} y="270" width="70" height="35" rx="3" fill="#0f172a" />
        {/* PCB-like pattern */}
        <line x1={x + 75} y1="278" x2={x + 125} y2="278" stroke="#22c55e" strokeWidth="0.8" opacity="0.7" />
        <line x1={x + 75} y1="285" x2={x + 110} y2="285" stroke="#3b82f6" strokeWidth="0.8" opacity="0.7" />
        <line x1={x + 75} y1="292" x2={x + 120} y2="292" stroke="#f59e0b" strokeWidth="0.8" opacity="0.7" />
        {/* OK label */}
        <rect x={x + 155} y="272" width="50" height="22" rx="3" fill="#dcfce7" stroke="#86efac" strokeWidth="1" />
        <text x={x + 180} y="287" textAnchor="middle" fill="#16a34a" fontSize="8" fontFamily="monospace" fontWeight="bold">OK 98.4%</text>
        {/* Measurement instrument */}
        <rect x={x + 170} y="265" width="60" height="45" rx="3" fill="#374151" />
        <rect x={x + 174} y="269" width="52" height="22" rx="2" fill="#0f172a" />
        <text x={x + 200} y="283" textAnchor="middle" fill="#22c55e" fontSize="7" fontFamily="monospace">5.000V</text>
        <text x={x + 200} y="292" textAnchor="middle" fill="#6b7280" fontSize="6" fontFamily="monospace">MULTIM.</text>
        {/* Bench label */}
        <text x={x + 125} y="345" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">MESA QA-{i + 1}</text>
        {/* Bench legs */}
        <rect x={x + 10} y="322" width="8" height="50" fill="#9ca3af" />
        <rect x={x + 232} y="322" width="8" height="50" fill="#9ca3af" />
      </g>
    ))}
    {/* ESD warning sign */}
    <rect x="440" y="70" width="120" height="35" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
    <text x="500" y="90" textAnchor="middle" fill="#92400e" fontSize="8" fontFamily="monospace" fontWeight="bold">⚡ ZONA ESD — GUANTES OBLIGATORIOS</text>
    {/* Storage cabinet */}
    <rect x="850" y="80" width="130" height="180" rx="4" fill="#374151" />
    <rect x="855" y="85" width="120" height="170" rx="3" fill="#1f2937" />
    <text x="915" y="178" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">COMPONENTES</text>
    <text x="915" y="190" textAnchor="middle" fill="#ef4444" fontSize="7" fontFamily="monospace">ACCESO RESTRINGIDO</text>
  </>
);

const MeetingRoomBackground: React.FC = () => (
  <>
    {/* Floor - carpet */}
    <rect x="0" y="510" width="1000" height="140" fill="#e2e8f0" />
    {/* Floor pattern */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) =>
      [0, 1, 2].map((j) => (
        <rect key={`${i}-${j}`} x={i * 125 + 2} y={510 + j * 46 + 2} width="121" height="42" rx="2" fill="#dde6f0" opacity="0.6" />
      ))
    )}
    {/* Ceiling */}
    <rect x="0" y="0" width="1000" height="55" fill="#94a3b8" />
    {/* Back wall */}
    <rect x="0" y="55" width="1000" height="455" fill="#f1f5f9" />
    {/* LED panel lights on ceiling */}
    {[200, 500, 800].map((x, i) => (
      <g key={i}>
        <rect x={x - 80} y="10" width="160" height="30" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        <rect x={x - 75} y="13" width="150" height="24" rx="3" fill="#fffde7" opacity="0.95" />
      </g>
    ))}
    {/* Main screen */}
    <rect x="800" y="80" width="185" height="380" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <rect x="806" y="86" width="173" height="368" rx="4" fill="#0f172a" />
    {/* Screen content - video call grid */}
    {[0, 1].map((xi) =>
      [0, 1, 2].map((yi) => (
        <g key={`${xi}-${yi}`}>
          <rect x={810 + xi * 85} y={90 + yi * 120} width="82" height="116" rx="3" fill="#1e3a5f" />
          <circle cx={851 + xi * 85} cy={130 + yi * 120} r="18" fill="#2d4a6e" />
          <ellipse cx={851 + xi * 85} cy={170 + yi * 120} rx="28" ry="18" fill="#2d4a6e" />
          <rect x={812 + xi * 85} y={92 + yi * 120} width="78" height="10" rx="2" fill="#152a46" />
          <text x={851 + xi * 85} y={100 + yi * 120} textAnchor="middle" fill="#6b7280" fontSize="6" fontFamily="monospace">
            Participante {xi * 3 + yi + 1}
          </text>
        </g>
      ))
    )}
    {/* Screen label */}
    <text x="893" y="470" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">VIDEOCONFERENCIA HD</text>
    {/* Oval meeting table */}
    <ellipse cx="430" cy="420" rx="300" ry="90" fill="#d8b4a0" stroke="#a16a50" strokeWidth="3" />
    <ellipse cx="430" cy="420" rx="288" ry="78" fill="#c9a28a" stroke="#a16a50" strokeWidth="1" />
    {/* Table surface highlight */}
    <ellipse cx="400" cy="395" rx="120" ry="30" fill="#d8b4a0" opacity="0.4" />
    {/* Chairs around table */}
    {[
      { x: 180, y: 420 }, { x: 265, y: 350 }, { x: 380, y: 330 }, { x: 495, y: 340 },
      { x: 605, y: 365 }, { x: 680, y: 420 }, { x: 605, y: 490 }, { x: 495, y: 510 },
      { x: 380, y: 515 }, { x: 265, y: 495 },
    ].map((pos, i) => (
      <g key={i}>
        <ellipse cx={pos.x} cy={pos.y} rx="22" ry="18" fill="#64748b" stroke="#475569" strokeWidth="1" />
        <ellipse cx={pos.x} cy={pos.y - 2} rx="18" ry="13" fill="#94a3b8" />
      </g>
    ))}
    {/* Webcam on top of screen */}
    <rect x="876" y="78" width="34" height="10" rx="5" fill="#374151" />
    <circle cx="893" cy="83" r="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
    <circle cx="893" cy="83" r="3" fill="#0f172a" />
    <circle cx="893" cy="83" r="1.5" fill="#ef4444" />
    <text x="893" y="73" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">CÁMARA</text>
    {/* Whiteboard left */}
    <rect x="20" y="80" width="150" height="250" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
    <text x="95" y="100" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">PIZARRA</text>
    <line x1="35" y1="120" x2="155" y2="120" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
    <line x1="35" y1="135" x2="130" y2="135" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
    <line x1="35" y1="150" x2="145" y2="150" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
    <text x="95" y="175" textAnchor="middle" fill="#475569" fontSize="7" fontFamily="sans-serif">Sprint 42 Planning</text>
  </>
);

// ----- Classic Environment 3D-styled Renderers -----

const QualityClassicBackground: React.FC<{ frameNumber: number; activeBottleInBooth?: TrackedObject }> = ({
  frameNumber,
  activeBottleInBooth,
}) => {
  const isDefect = !!activeBottleInBooth?.isDefective;
  const hasBottle = !!activeBottleInBooth;

  return (
    <g>
      {/* Wall & Ceiling */}
      <rect x="0" y="0" width="1000" height="440" fill="#f1f5f9" />
      {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="440" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {[0, 80, 160, 240, 320, 400].map((y) => (
        <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#e2e8f0" strokeWidth="1" />
      ))}

      {/* Floor */}
      <rect x="0" y="440" width="1000" height="210" fill="#cbd5e1" />
      <line x1="0" y1="440" x2="1000" y2="440" stroke="#94a3b8" strokeWidth="3" />
      {[0, 150, 300, 450, 600, 750, 900, 1000].map((x, i) => (
        <line key={i} x1={x} y1="440" x2={x + (x - 500) * 0.4} y2="650" stroke="#94a3b8" strokeWidth="1" opacity="0.6" />
      ))}

      {/* Conveyor Belt System */}
      {[120, 320, 680, 880].map((x) => (
        <g key={x}>
          <rect x={x - 8} y="520" width="16" height="110" fill="#475569" rx="2" />
          <rect x={x - 16} y="620" width="32" height="12" fill="#334155" rx="2" />
        </g>
      ))}
      <rect x="0" y="520" width="1000" height="16" fill="#1e293b" />
      <rect x="0" y="460" width="1000" height="60" fill="#334155" />
      <rect x="0" y="450" width="1000" height="10" fill="#64748b" />
      <line x1="0" y1="452" x2="1000" y2="452" stroke="#94a3b8" strokeWidth="2" />
      {Array.from({ length: 40 }).map((_, i) => {
        const offsetX = (i * 30 + ((frameNumber * 3) % 30)) % 1000;
        return <line key={i} x1={offsetX} y1="462" x2={offsetX} y2="518" stroke="#1e293b" strokeWidth="2" opacity="0.4" />;
      })}

      {/* Center Inspection Booth: CAM-QC1 - VISION AI */}
      <g>
        <rect x="250" y="160" width="270" height="300" rx="10" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
        <rect x="290" y="240" width="190" height="220" rx="4" fill="#0f172a" />
        <rect
          x="320"
          y="175"
          width="130"
          height="26"
          rx="4"
          fill="#0f172a"
          stroke={hasBottle ? (isDefect ? '#ef4444' : '#10b981') : '#06b6d4'}
          strokeWidth="1.5"
        />
        <text
          x="385"
          y="192"
          fill={hasBottle ? (isDefect ? '#fca5a5' : '#86efac') : '#06b6d4'}
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {hasBottle ? (isDefect ? 'CAM-QC1 · DEFECTO' : 'CAM-QC1 · CONFORME') : 'CAM-QC1 · VISION AI'}
        </text>

        {/* Hanging inspection spotlight */}
        <rect x="375" y="240" width="20" height="18" fill="#475569" rx="3" />
        <polygon points="365,270 405,270 395,258 375,258" fill="#334155" />
        <defs>
          <linearGradient id="spotlightCone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop
              offset="60%"
              stopColor={hasBottle && isDefect ? '#ef4444' : hasBottle ? '#10b981' : '#38bdf8'}
              stopOpacity={hasBottle ? 0.38 : 0.28}
            />
            <stop
              offset="100%"
              stopColor={hasBottle && isDefect ? '#ef4444' : hasBottle ? '#10b981' : '#38bdf8'}
              stopOpacity="0.05"
            />
          </linearGradient>
        </defs>
        <polygon points="370,270 400,270 460,460 310,460" fill="url(#spotlightCone)" />
        <ellipse
          cx="385"
          cy="460"
          rx="75"
          ry="12"
          fill={hasBottle && isDefect ? '#fca5a5' : hasBottle ? '#a7f3d0' : '#bae6fd'}
          opacity={hasBottle ? 0.65 : 0.45}
        />
      </g>

      {/* Angled Digital Monitor Screen to the Right */}
      <g>
        <line x1="520" y1="360" x2="575" y2="330" stroke="#475569" strokeWidth="10" strokeLinecap="round" />
        <rect
          x="560"
          y="250"
          width="135"
          height="100"
          rx="6"
          fill="#1e293b"
          stroke={hasBottle ? (isDefect ? '#ef4444' : '#10b981') : '#334155'}
          strokeWidth="3"
        />
        <rect x="568" y="258" width="119" height="84" rx="4" fill="#020617" />

        {hasBottle && isDefect ? (
          <>
            <text x="627.5" y="280" fill="#ef4444" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              RECHAZO
            </text>
            <text x="627.5" y="296" fill="#fca5a5" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              MAL ESTADO
            </text>
            <text x="627.5" y="310" fill="#ef4444" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              DEFECTO DETECTADO
            </text>
            {/* Indicator LEDs */}
            <circle cx="600" cy="328" r="5" fill="#334155" />
            <circle cx="627.5" cy="328" r="5" fill="#f59e0b" opacity="0.3" />
            <circle cx="655" cy="328" r="7" fill="#ef4444" />
            <circle cx="655" cy="328" r="11" fill="#ef4444" opacity="0.35" />
          </>
        ) : hasBottle && !isDefect ? (
          <>
            <text x="627.5" y="280" fill="#22c55e" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              CONFORME
            </text>
            <text x="627.5" y="296" fill="#86efac" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              BUEN ESTADO
            </text>
            <text x="627.5" y="310" fill="#4ade80" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              SELLADO Y NIVEL OK
            </text>
            {/* Indicator LEDs */}
            <circle cx="600" cy="328" r="7" fill="#22c55e" />
            <circle cx="600" cy="328" r="11" fill="#22c55e" opacity="0.35" />
            <circle cx="627.5" cy="328" r="5" fill="#f59e0b" opacity="0.3" />
            <circle cx="655" cy="328" r="5" fill="#334155" />
          </>
        ) : (
          <>
            <text x="627.5" y="285" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              CAM-QC1
            </text>
            <text x="627.5" y="303" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" textAnchor="middle">
              ESCANEANDO...
            </text>
            {/* Indicator LEDs */}
            <circle cx="600" cy="328" r="5" fill="#22c55e" opacity="0.6" />
            <circle cx="627.5" cy="328" r="5" fill="#f59e0b" opacity="0.3" />
            <circle cx="655" cy="328" r="5" fill="#334155" />
          </>
        )}
      </g>
    </g>
  );
};

const RetailClassicBackground: React.FC = () => (
  <g>
    <polygon points="0,0 1000,0 660,240 340,240" fill="#1e293b" />
    {[
      { y: 35, w: 260, h: 10 },
      { y: 90, w: 220, h: 9 },
      { y: 145, w: 180, h: 8 },
      { y: 195, w: 140, h: 7 },
    ].map((light, i) => (
      <rect
        key={i}
        x={500 - light.w / 2}
        y={light.y}
        width={light.w}
        height={light.h}
        rx="2"
        fill="#ffffff"
        opacity="0.95"
      />
    ))}

    {/* Hanging signs from ceiling */}
    <g>
      <line x1="385" y1="180" x2="385" y2="215" stroke="#64748b" strokeWidth="1.5" />
      <line x1="405" y1="180" x2="405" y2="215" stroke="#64748b" strokeWidth="1.5" />
      <rect x="365" y="215" width="45" height="15" rx="2" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
      <text x="387.5" y="226" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
        OFERTAS
      </text>
    </g>
    <g>
      <line x1="435" y1="180" x2="435" y2="220" stroke="#64748b" strokeWidth="1.5" />
      <line x1="455" y1="180" x2="455" y2="220" stroke="#64748b" strokeWidth="1.5" />
      <rect x="428" y="220" width="35" height="13" rx="2" fill="#2563eb" stroke="#ffffff" strokeWidth="0.8" />
      <text x="445.5" y="230" fill="#ffffff" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
        BEBIDAS
      </text>
    </g>

    <polygon points="340,240 660,240 660,340 340,340" fill="#e2e8f0" />
    <rect x="360" y="260" width="280" height="70" fill="#cbd5e1" opacity="0.6" />

    <polygon points="0,650 1000,650 660,340 340,340" fill="#f8fafc" />
    {[350, 390, 430, 470, 500, 530, 570, 610, 650].map((vx, i) => (
      <line
        key={i}
        x1={vx}
        y1="340"
        x2={500 + (vx - 500) * 3.5}
        y2="650"
        stroke="#e2e8f0"
        strokeWidth="1.5"
      />
    ))}
    {[360, 400, 460, 540, 630].map((y, i) => (
      <line key={i} x1="0" y1={y} x2="1000" y2={y} stroke="#e2e8f0" strokeWidth="1" opacity="0.7" />
    ))}

    {/* Left Supermarket Shelves */}
    <polygon points="0,200 340,240 340,430 0,650" fill="#475569" />
    {[
      { y1: 270, y2: 275 },
      { y1: 350, y2: 320 },
      { y1: 440, y2: 360 },
      { y1: 530, y2: 400 },
    ].map((s, idx) => (
      <g key={idx}>
        <polygon points={`0,${s.y1} 340,${s.y2} 340,${s.y2 + 10} 0,${s.y1 + 18}`} fill="#b45309" />
        {Array.from({ length: 14 }).map((_, bIdx) => {
          const t = bIdx / 14;
          const bx = 15 + t * 300;
          const by = s.y1 + t * (s.y2 - s.y1) - (1 - t * 0.5) * 45;
          const bw = 12 * (1 - t * 0.55);
          const bh = 42 * (1 - t * 0.55);
          const colors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];
          const color = colors[(idx * 3 + bIdx) % colors.length];
          return (
            <rect
              key={bIdx}
              x={bx}
              y={by}
              width={bw}
              height={bh}
              rx="1.5"
              fill={color}
              stroke="#0f172a"
              strokeWidth="0.8"
            />
          );
        })}
      </g>
    ))}

    {/* Right Supermarket Shelves */}
    <polygon points="1000,200 660,240 660,430 1000,650" fill="#475569" />
    {[
      { y1: 270, y2: 275 },
      { y1: 350, y2: 320 },
      { y1: 440, y2: 360 },
      { y1: 530, y2: 400 },
    ].map((s, idx) => (
      <g key={idx}>
        <polygon points={`1000,${s.y1} 660,${s.y2} 660,${s.y2 + 10} 1000,${s.y1 + 18}`} fill="#b45309" />
        {Array.from({ length: 14 }).map((_, bIdx) => {
          const t = bIdx / 14;
          const bx = 980 - t * 300 - 15;
          const by = s.y1 + t * (s.y2 - s.y1) - (1 - t * 0.5) * 45;
          const bw = 12 * (1 - t * 0.55);
          const bh = 42 * (1 - t * 0.55);
          const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#14b8a6'];
          const color = colors[(idx * 4 + bIdx) % colors.length];
          return (
            <rect
              key={bIdx}
              x={bx}
              y={by}
              width={bw}
              height={bh}
              rx="1.5"
              fill={color}
              stroke="#0f172a"
              strokeWidth="0.8"
            />
          );
        })}
      </g>
    ))}
  </g>
);

const WarehouseClassicBackground: React.FC = () => (
  <g>
    <rect x="0" y="0" width="1000" height="390" fill="#d6d3d1" />
    {Array.from({ length: 100 }).map((_, i) => (
      <line key={i} x1={i * 10} y1="0" x2={i * 10} y2="390" stroke={i % 2 === 0 ? '#e7e5e4' : '#a8a29e'} strokeWidth="2" opacity="0.7" />
    ))}

    {/* Center Industrial Roll-up Door */}
    <g>
      <rect x="390" y="210" width="90" height="180" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="2" />
      <rect x="396" y="222" width="78" height="166" fill="#94a3b8" />
      {Array.from({ length: 18 }).map((_, i) => (
        <line key={i} x1="396" y1={224 + i * 9} x2="474" y2={224 + i * 9} stroke="#475569" strokeWidth="1.5" />
      ))}
      <rect x="425" y="200" width="20" height="10" rx="2" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
      <rect x="428" y="202" width="14" height="6" fill="#ffffff" opacity="0.9" />
    </g>

    <rect x="0" y="390" width="1000" height="260" fill="#cbd5e1" />
    <line x1="0" y1="390" x2="1000" y2="390" stroke="#64748b" strokeWidth="3" />
    <line x1="0" y1="480" x2="1000" y2="520" stroke="#eab308" strokeWidth="4" strokeDasharray="16,8" opacity="0.9" />

    {/* Left Heavy-Duty Warehouse Rack */}
    <g>
      <rect x="200" y="210" width="12" height="250" fill="#1d4ed8" rx="2" />
      <rect x="265" y="215" width="10" height="245" fill="#1d4ed8" rx="2" />
      <rect x="335" y="220" width="10" height="240" fill="#1d4ed8" rx="2" />
      <rect x="200" y="280" width="145" height="10" fill="#ea580c" rx="1" />
      <rect x="200" y="360" width="145" height="10" fill="#ea580c" rx="1" />
      <rect x="200" y="440" width="145" height="12" fill="#ea580c" rx="1" />

      <rect x="245" y="240" width="22" height="24" fill="#d97706" stroke="#b45309" strokeWidth="1" rx="1" />
      <rect x="285" y="238" width="28" height="26" fill="#d97706" stroke="#b45309" strokeWidth="1" rx="1" />
      <rect x="230" y="316" width="30" height="28" fill="#d97706" stroke="#b45309" strokeWidth="1" rx="1" />
      <rect x="275" y="314" width="28" height="30" fill="#b45309" stroke="#92400e" strokeWidth="1" rx="1" />
      <rect x="306" y="324" width="20" height="20" fill="#d97706" stroke="#b45309" strokeWidth="1" rx="1" />
      <rect x="232" y="394" width="32" height="30" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" rx="1" />
      <rect x="262" y="404" width="20" height="20" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" rx="1" />
      <rect x="302" y="388" width="32" height="36" fill="#b45309" stroke="#78350f" strokeWidth="1" rx="1" />
    </g>

    {/* Pallets on floor left foreground */}
    <g>
      <rect x="215" y="500" width="35" height="8" fill="#92400e" rx="1" />
      <rect x="217" y="480" width="31" height="20" fill="#d97706" stroke="#b45309" strokeWidth="1" rx="2" />
      <rect x="245" y="506" width="35" height="8" fill="#92400e" rx="1" />
      <rect x="247" y="486" width="31" height="20" fill="#d97706" stroke="#b45309" strokeWidth="1" rx="2" />
      <rect x="295" y="528" width="55" height="10" fill="#92400e" rx="2" />
      <rect x="298" y="492" width="48" height="36" fill="#d97706" stroke="#b45309" strokeWidth="1" rx="2" />
    </g>

    {/* Right Restricted Hazard Zone on floor */}
    <g>
      <defs>
        <pattern id="hazardPattern" width="24" height="24" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="24" stroke="#eab308" strokeWidth="12" />
          <line x1="12" y1="0" x2="12" y2="24" stroke="#1e293b" strokeWidth="12" />
        </pattern>
      </defs>
      <polygon
        points="460,510 570,510 630,580 475,580"
        fill="url(#hazardPattern)"
        stroke="#ef4444"
        strokeWidth="6"
      />
      <g>
        <line x1="472" y1="430" x2="472" y2="510" stroke="#334155" strokeWidth="3" />
        <line x1="550" y1="430" x2="550" y2="510" stroke="#334155" strokeWidth="3" />
        <rect x="468" y="415" width="86" height="20" rx="3" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
        <text x="511" y="429" fill="#ffffff" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
          ZONA RESTRINGIDA
        </text>
      </g>
      <g>
        <rect x="520" y="534" width="38" height="8" fill="#92400e" rx="1" />
        <rect x="522" y="512" width="34" height="22" fill="#ca8a04" stroke="#ef4444" strokeWidth="1.5" rx="1" />
      </g>
    </g>
  </g>
);

const IndustrialClassicBackground: React.FC = () => (
  <g>
    <rect x="0" y="0" width="1000" height="390" fill="#9ca3af" />
    <line x1="0" y1="120" x2="1000" y2="120" stroke="#6b7280" strokeWidth="1" />
    <line x1="0" y1="240" x2="1000" y2="240" stroke="#6b7280" strokeWidth="1" />

    <rect x="0" y="115" width="1000" height="14" fill="#64748b" />
    <line x1="0" y1="117" x2="1000" y2="117" stroke="#94a3b8" strokeWidth="3" />
    {[100, 250, 400, 550, 700, 850].map((x) => (
      <rect key={x} x={x} y="112" width="10" height="20" rx="1" fill="#475569" />
    ))}

    {/* Wall Safety Sign: USO OBLIGATORIO CASCO - CHALECO - BOTAS */}
    <g>
      <rect x="365" y="145" width="105" height="38" rx="4" fill="#1e40af" stroke="#ffffff" strokeWidth="2" />
      <text x="417.5" y="160" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
        USO OBLIGATORIO
      </text>
      <text x="417.5" y="174" fill="#ffffff" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
        CASCO - CHALECO - BOTAS
      </text>
    </g>

    {/* Fire extinguisher */}
    <g>
      <rect x="483" y="210" width="10" height="28" rx="4" fill="#dc2626" />
      <rect x="485" y="206" width="6" height="4" fill="#1e293b" />
      <line x1="492" y1="214" x2="496" y2="226" stroke="#1e293b" strokeWidth="1.5" />
    </g>

    {/* Left industrial machinery */}
    <g>
      <rect x="165" y="180" width="100" height="185" rx="6" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      <rect x="226" y="160" width="8" height="20" rx="2" fill="#f59e0b" />
      <circle cx="230" cy="166" r="4" fill="#ef4444" />
      <circle cx="230" cy="174" r="4" fill="#22c55e" />
      <rect x="172" y="215" width="22" height="16" rx="2" fill="#022c22" stroke="#059669" strokeWidth="1" />
      <polyline points="174,223 178,220 182,226 186,221 190,223" fill="none" stroke="#22c55e" strokeWidth="1.5" />
      {[245, 255, 265, 275].map((y) => (
        <line key={y} x1="175" y1={y} x2="255" y2={y} stroke="#1e293b" strokeWidth="2" />
      ))}
    </g>

    {/* Chemical drums / barrels */}
    <g>
      <rect x="315" y="225" width="26" height="42" rx="3" fill="#0f766e" stroke="#115e59" strokeWidth="1.5" />
      <ellipse cx="328" cy="225" rx="13" ry="4" fill="#134e4a" />
      <line x1="315" y1="239" x2="341" y2="239" stroke="#134e4a" strokeWidth="2" />
      <line x1="315" y1="253" x2="341" y2="253" stroke="#134e4a" strokeWidth="2" />
      <rect x="330" y="235" width="26" height="42" rx="3" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
      <ellipse cx="343" cy="235" rx="13" ry="4" fill="#075985" />
      <line x1="330" y1="249" x2="356" y2="249" stroke="#075985" strokeWidth="2" />
      <line x1="330" y1="263" x2="356" y2="263" stroke="#075985" strokeWidth="2" />
    </g>

    {/* Right industrial storage shelves */}
    <g>
      <rect x="580" y="195" width="6" height="150" fill="#475569" />
      <rect x="645" y="195" width="6" height="150" fill="#475569" />
      <line x1="580" y1="210" x2="651" y2="210" stroke="#475569" strokeWidth="4" />
      <line x1="580" y1="250" x2="651" y2="250" stroke="#475569" strokeWidth="4" />
      <rect x="612" y="185" width="30" height="25" fill="#d97706" rx="2" stroke="#b45309" strokeWidth="1" />
      <polygon points="602,230 618,230 615,248 605,248" fill="#ea580c" />
    </g>

    {/* Floor */}
    <rect x="0" y="365" width="1000" height="285" fill="#cbd5e1" />
    {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((x) => (
      <line key={x} x1={x} y1="365" x2={x} y2="650" stroke="#94a3b8" strokeWidth="1" opacity="0.4" />
    ))}
    {[420, 480, 540, 600].map((y) => (
      <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#94a3b8" strokeWidth="1" opacity="0.4" />
    ))}

    {/* Green Pedestrian Safety Lane */}
    <rect x="0" y="445" width="1000" height="42" fill="#10b981" opacity="0.9" />
    <line x1="0" y1="445" x2="1000" y2="445" stroke="#ffffff" strokeWidth="3" />
    <line x1="0" y1="487" x2="1000" y2="487" stroke="#ffffff" strokeWidth="3" />

    {/* Bottom Foreground Diagonal Hazard Stripes */}
    <defs>
      <pattern id="plantHazard" width="30" height="30" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="30" stroke="#eab308" strokeWidth="15" />
        <line x1="15" y1="0" x2="15" y2="30" stroke="#1e293b" strokeWidth="15" />
      </pattern>
    </defs>
    <rect x="0" y="525" width="1000" height="38" fill="url(#plantHazard)" stroke="#ca8a04" strokeWidth="2" />
  </g>
);

// ----- Entity renderer -----

const EntityRenderer: React.FC<{
  entity: TrackedObject;
  viewW: number;
  viewH: number;
  isSelected: boolean;
  showLabel: boolean;
  showBox: boolean;
  showMask: boolean;
  onClick: (id: string) => void;
}> = ({ entity, viewW, viewH, isSelected, showLabel, showBox, showMask, onClick }) => {
  const cx = entity.x * viewW;
  const cy = entity.y * viewH;
  const w = entity.width * viewW;
  const h = entity.height * viewH;
  const x = cx - w / 2;
  const y = cy - h / 2;

  const color = entity.color;
  const isAlertState = entity.state === 'alert_trigger' || entity.state === 'restricted_zone';

  // 1. FORKLIFT / MONTACARGAS ENTITY
  if (entity.vehicleType === 'forklift' || entity.classId === 'cls_montacargas') {
    return (
      <g
        onClick={() => onClick(entity.id)}
        className="cursor-pointer"
        style={{ filter: isSelected ? `drop-shadow(0 0 8px ${color})` : undefined }}
      >
        {/* Ground shadow */}
        <ellipse cx={cx} cy={y + h} rx={w * 0.48} ry={h * 0.12} fill="#0f172a" opacity="0.45" />

        {/* Silhouette Mask */}
        {showMask && (
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            rx="6"
            fill={isAlertState ? '#ef4444' : color}
            fillOpacity={0.25}
          />
        )}

        {/* Bounding box */}
        {showBox && (
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill="none"
            stroke={isAlertState ? '#ef4444' : color}
            strokeWidth={isSelected ? 2.5 : 1.5}
            strokeDasharray={isAlertState ? '5,3' : undefined}
            rx="5"
            opacity={0.9}
          />
        )}

        {/* Forklift chassis (Orange body) */}
        <rect x={x + 10} y={y + 35} width={w - 30} height={h - 45} rx="6" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
        {/* ML-02 Label on side */}
        <text x={x + 35} y={y + 60} fill="#1e293b" fontSize="8" fontWeight="bold" fontFamily="monospace">
          ML-02
        </text>

        {/* Roll cage / Cabin */}
        <rect x={x + 25} y={y + 5} width={42} height={35} fill="none" stroke="#1e293b" strokeWidth="3" />
        {/* Driver inside cabin */}
        <circle cx={x + 46} cy={y + 22} r="8" fill="#fed7aa" />
        <path d={`M ${x + 38} ${y + 20} Q ${x + 46} ${y + 12} ${x + 54} ${y + 20} Z`} fill="#ea580c" />

        {/* Mast in front */}
        <rect x={x + w - 24} y={y - 5} width="8" height={h + 5} fill="#1e293b" rx="1" />
        <line x1={x + w - 24} y1={y + 15} x2={x + w - 16} y2={y + 15} stroke="#64748b" strokeWidth="2" />
        {/* Forks extending forward */}
        <rect x={x + w - 20} y={y + h - 14} width="28" height="6" fill="#1e293b" rx="1" />

        {/* Wheels */}
        <circle cx={x + 28} cy={y + h - 4} r="12" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        <circle cx={x + 28} cy={y + h - 4} r="4" fill="#94a3b8" />
        <circle cx={x + w - 32} cy={y + h - 4} r="12" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        <circle cx={x + w - 32} cy={y + h - 4} r="4" fill="#94a3b8" />

        {/* Floating Label */}
        {showLabel && (
          <g>
            <rect x={x} y={y - 20} width={Math.max(w, 120)} height={16} rx="3" fill="#0f172a" opacity={0.88} />
            <text x={x + 4} y={y - 8} fill="white" fontSize="8" fontFamily="monospace" fontWeight="bold">
              {entity.label}
            </text>
            <text x={x + Math.max(w, 120) - 4} y={y - 8} textAnchor="end" fill="#94a3b8" fontSize="7" fontFamily="monospace">
              {Math.round(entity.confidence * 100)}%
            </text>
          </g>
        )}
      </g>
    );
  }

  // 2. BOTTLE ENTITY (AQUA PURA ON CONVEYOR)
  if (entity.classId === 'cls_producto') {
    return (
      <g
        onClick={() => onClick(entity.id)}
        className="cursor-pointer"
        style={{ filter: isSelected ? `drop-shadow(0 0 6px ${color})` : undefined }}
      >
        {/* Drop shadow on belt */}
        <ellipse cx={cx} cy={y + h} rx={w * 0.45} ry={5} fill="#0f172a" opacity="0.35" />

        {/* Silhouette Mask */}
        {showMask && (
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            rx="4"
            fill={entity.isDefective ? '#ef4444' : '#06b6d4'}
            fillOpacity={0.25}
          />
        )}

        {/* Bounding box */}
        {showBox && (
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill="none"
            stroke={entity.isDefective ? '#ef4444' : color}
            strokeWidth={isSelected ? 2.5 : 1.5}
            strokeDasharray={entity.isDefective ? '5,3' : undefined}
            rx="4"
            opacity={0.88}
          />
        )}

        {/* Bottle Body (Aqua translucent blue) */}
        <rect x={cx - w * 0.35} y={y + h * 0.22} width={w * 0.70} height={h * 0.76} rx="6" fill="#38bdf8" opacity="0.85" stroke="#0284c7" strokeWidth="1" />
        {/* Bottle ribs / contour lines */}
        <line x1={cx - w * 0.32} y1={y + h * 0.38} x2={cx + w * 0.32} y2={y + h * 0.38} stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        <line x1={cx - w * 0.32} y1={y + h * 0.78} x2={cx + w * 0.32} y2={y + h * 0.78} stroke="#ffffff" strokeWidth="1" opacity="0.6" />

        {/* White Label Banner: AQUA PURA */}
        <rect x={cx - w * 0.35} y={y + h * 0.44} width={w * 0.70} height={h * 0.26} fill="#ffffff" opacity="0.95" />
        <path d={`M ${cx - w * 0.35} ${y + h * 0.52} Q ${cx} ${y + h * 0.48} ${cx + w * 0.35} ${y + h * 0.52}`} fill="none" stroke="#0284c7" strokeWidth="1.5" />
        <text x={cx} y={y + h * 0.62} fill="#0369a1" fontSize="7" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
          AQUA
        </text>

        {/* Bottle Neck */}
        <rect x={cx - w * 0.16} y={y + h * 0.08} width={w * 0.32} height={h * 0.15} fill="#7dd3fc" stroke="#0284c7" strokeWidth="0.8" />
        {/* Red Screw Cap */}
        <rect x={cx - w * 0.20} y={y} width={w * 0.40} height={h * 0.10} rx="2" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />

        {/* Floating Label */}
        {showLabel && (
          <g>
            <rect x={x} y={y - 18} width={Math.max(w, 88)} height={15} rx="3" fill="#0f172a" opacity={0.88} />
            <text x={x + 3} y={y - 7} fill="white" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
              {entity.label}
            </text>
            <text x={x + Math.max(w, 88) - 3} y={y - 7} textAnchor="end" fill="#94a3b8" fontSize="7" fontFamily="monospace">
              {Math.round(entity.confidence * 100)}%
            </text>
          </g>
        )}
      </g>
    );
  }

  // 3. HUMANOID FIGURE / WORKER / RETAIL SHOPPER
  const headR = w * 0.38;
  const bodyW = w * 0.62;
  const bodyH = h * 0.40;
  const legH = h * 0.32;

  const headCx = cx;
  const headCy = y + headR * 1.1;
  const bodyTop = headCy + headR * 0.9;
  const bodyBot = bodyTop + bodyH;
  const legTop = bodyBot;

  const isViolator = entity.hasEPP === false && entity.hasHelmet === false && entity.hasVest === false;

  return (
    <g
      onClick={() => onClick(entity.id)}
      className="cursor-pointer"
      style={{ filter: isSelected ? `drop-shadow(0 0 6px ${color})` : undefined }}
    >
      {/* Drop shadow on floor */}
      <ellipse cx={cx} cy={y + h} rx={w * 0.45} ry={6} fill="#0f172a" opacity="0.32" />

      {/* Silhouette Mask */}
      {showMask && (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx="4"
          fill={isAlertState ? '#ef4444' : color}
          fillOpacity={0.22}
        />
      )}

      {/* Bounding box */}
      {showBox && (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="none"
          stroke={isAlertState ? '#ef4444' : color}
          strokeWidth={isSelected ? 2.5 : 1.5}
          strokeDasharray={isAlertState ? '5,3' : undefined}
          rx="3"
          opacity={0.85}
        />
      )}

      {/* Torso / Clothes */}
      {isViolator ? (
        // Non-compliant worker in casual blue jacket
        <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} rx="3" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
      ) : entity.hasVest ? (
        // Compliant worker in orange hi-vis vest
        <g>
          <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} rx="3" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
          {/* Reflective stripes */}
          <line x1={cx - bodyW / 2} y1={bodyTop + 8} x2={cx + bodyW / 2} y2={bodyTop + 8} stroke="#ffffff" strokeWidth="2.5" />
          <line x1={cx - bodyW / 2} y1={bodyTop + 18} x2={cx + bodyW / 2} y2={bodyTop + 18} stroke="#ffffff" strokeWidth="2.5" />
        </g>
      ) : (
        // Normal shirt with entity color
        <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} rx="3" fill={color} />
      )}

      {/* Legs */}
      <rect x={cx - bodyW * 0.34} y={legTop} width={bodyW * 0.30} height={legH} rx="2" fill="#1e293b" />
      <rect x={cx + bodyW * 0.04} y={legTop} width={bodyW * 0.30} height={legH} rx="2" fill="#1e293b" />

      {/* Head */}
      <circle cx={headCx} cy={headCy} r={headR} fill="#fed7aa" />

      {/* Hair or Safety Helmet */}
      {isViolator ? (
        // Bare brown hair (No helmet!)
        <path d={`M ${headCx - headR} ${headCy} Q ${headCx} ${headCy - headR * 1.3} ${headCx + headR} ${headCy} Z`} fill="#451a03" />
      ) : entity.hasHelmet ? (
        // Certified Safety Helmet (Yellow / Orange / White)
        <g>
          <path
            d={`M ${headCx - headR * 1.15} ${headCy + 1} Q ${headCx} ${headCy - headR * 1.35} ${headCx + headR * 1.15} ${headCy + 1} Z`}
            fill={entity.color === '#3b82f6' ? '#f8fafc' : '#eab308'}
            stroke="#ca8a04"
            strokeWidth="0.8"
          />
          <rect x={headCx - headR * 1.25} y={headCy} width={headR * 2.5} height="3" rx="1" fill="#ca8a04" />
        </g>
      ) : (
        <path d={`M ${headCx - headR} ${headCy} Q ${headCx} ${headCy - headR * 1.2} ${headCx + headR} ${headCy} Z`} fill="#1e293b" />
      )}

      {/* Floating Label */}
      {showLabel && (
        <g>
          <rect x={x} y={y - 20} width={Math.max(w, entity.label.length * 5.8 + 10)} height={16} rx="3" fill="#0f172a" opacity={0.88} />
          <text x={x + 4} y={y - 8} fill="white" fontSize="7.8" fontFamily="monospace" fontWeight="500">
            {entity.label.length > 20 ? entity.label.slice(0, 18) + '…' : entity.label}
          </text>
          <text x={x + Math.max(w, entity.label.length * 5.8 + 10) - 4} y={y - 8} textAnchor="end" fontSize="7" fontFamily="monospace" fill="#94a3b8">
            {Math.round(entity.confidence * 100)}%
          </text>
        </g>
      )}

      {/* Track ID */}
      <text x={cx} y={y + h + 11} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#64748b">
        {entity.trackId}
      </text>
    </g>
  );
};

// ----- Zone renderer -----

const ZoneRenderer: React.FC<{
  zone: Zone;
  viewW: number;
  viewH: number;
}> = ({ zone, viewW, viewH }) => {
  return (
    <g>
      <rect
        x={zone.x * viewW}
        y={zone.y * viewH}
        width={zone.width * viewW}
        height={zone.height * viewH}
        fill={zone.color}
        fillOpacity={zone.opacity}
        stroke={zone.strokeColor}
        strokeWidth={1.5}
        strokeDasharray="6,3"
        rx="4"
      />
      <text
        x={zone.x * viewW + 6}
        y={zone.y * viewH + 13}
        fill={zone.strokeColor}
        fontSize="8"
        fontFamily="monospace"
        fontWeight="600"
        opacity={0.9}
      >
        {zone.label.toUpperCase()}
      </text>
    </g>
  );
};

// ----- Main SceneRenderer -----

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  environment,
  assetImage,
  objects,
  zones,
  alerts,
  showBoxes,
  showMasks,
  showLabels,
  showZones,
  showLowConfidence,
  confidenceThreshold = 0.6,
  selectedEntityId,
  onSelectEntity,
  frameNumber,
}) => {
  const VIEW_W = 1000;
  const VIEW_H = 650;

  const visibleObjects = showLowConfidence ? objects : objects.filter((o) => o.confidence >= confidenceThreshold);

  const backgroundMap: Record<string, React.FC<any>> = {
    office: OfficeBackground,
    datacenter: DatacenterBackground,
    lab: LabBackground,
    meeting_room: MeetingRoomBackground,
    industrial: IndustrialClassicBackground,
    warehouse: WarehouseClassicBackground,
    quality: () => <QualityClassicBackground frameNumber={frameNumber} activeBottleInBooth={visibleObjects.find((o) => o.classId === 'cls_producto' && o.x >= 0.35 && o.x <= 0.44)} />,
    retail: RetailClassicBackground,
  };
  const BackgroundComponent = backgroundMap[environment];
  const isClassic3D = ['industrial', 'warehouse', 'quality', 'retail'].includes(environment);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ display: 'block' }}
    >
      {/* Background scene */}
      {isClassic3D && BackgroundComponent ? (
        <BackgroundComponent />
      ) : assetImage ? (
        <image
          href={assetImage}
          x="0"
          y="0"
          width={VIEW_W}
          height={VIEW_H}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : BackgroundComponent ? (
        <BackgroundComponent />
      ) : (
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="#0f172a" />
      )}

      {/* Scan line effect overlay */}
      <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#scanlines)" opacity="0.03" />
      <defs>
        <pattern id="scanlines" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="2" height="1" fill="black" />
        </pattern>
      </defs>

      {/* Zones */}
      {showZones &&
        zones.map((zone) => (
          <ZoneRenderer key={zone.id} zone={zone} viewW={VIEW_W} viewH={VIEW_H} />
        ))}

      {/* Entities */}
      {visibleObjects.map((entity) => (
        <EntityRenderer
          key={entity.id}
          entity={entity}
          viewW={VIEW_W}
          viewH={VIEW_H}
          isSelected={selectedEntityId === entity.id}
          showLabel={showLabels}
          showBox={showBoxes}
          showMask={showMasks}
          onClick={(id) => onSelectEntity?.(id === selectedEntityId ? null : id)}
        />
      ))}

      {/* Frame counter overlay */}
      <text x={VIEW_W - 8} y={VIEW_H - 8} textAnchor="end" fill="#475569" fontSize="8" fontFamily="monospace">
        FRAME #{frameNumber.toString().padStart(5, '0')}
      </text>

      {/* Active alert banner */}
      {alerts.length > 0 && (
        <g>
          <rect x="0" y={VIEW_H - 28} width={VIEW_W} height="28" fill="#7f1d1d" opacity="0.75" />
          <text x="12" y={VIEW_H - 11} fill="#fca5a5" fontSize="9" fontFamily="monospace" fontWeight="bold">
            ⚠ ALERTA: {alerts[alerts.length - 1]?.message?.slice(0, 90)}
          </text>
        </g>
      )}
    </svg>
  );
};

