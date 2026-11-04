import React from 'react';
import type { TrackedObject, Zone, LiveAlert } from '../../../core/domain/liveTypes';
import { cn } from '../../../shared/utils/cn';

interface SceneRendererProps {
  environment: 'office' | 'datacenter' | 'lab' | 'meeting_room';
  objects: TrackedObject[];
  zones: Zone[];
  alerts: LiveAlert[];
  showBoxes: boolean;
  showMasks: boolean;
  showLabels: boolean;
  showZones: boolean;
  showLowConfidence: boolean;
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

// ----- Entity renderer -----

const EntityRenderer: React.FC<{
  entity: TrackedObject;
  viewW: number;
  viewH: number;
  isSelected: boolean;
  showLabel: boolean;
  showBox: boolean;
  onClick: (id: string) => void;
}> = ({ entity, viewW, viewH, isSelected, showLabel, showBox, onClick }) => {
  const cx = entity.x * viewW;
  const cy = entity.y * viewH;
  const w = entity.width * viewW;
  const h = entity.height * viewH;
  const x = cx - w / 2;
  const y = cy - h / 2;

  const color = entity.color;
  const isAlertState = entity.state === 'alert_trigger' || entity.state === 'restricted_zone';

  // Determine head/body proportions
  const headR = w * 0.42;
  const bodyW = w * 0.65;
  const bodyH = h * 0.42;
  const legH = h * 0.28;

  const headCx = cx;
  const headCy = y + headR * 1.1;
  const bodyTop = headCy + headR * 0.9;
  const bodyBot = bodyTop + bodyH;
  const legTop = bodyBot;

  return (
    <g
      onClick={() => onClick(entity.id)}
      className="cursor-pointer"
      style={{ filter: isSelected ? `drop-shadow(0 0 6px ${color})` : undefined }}
    >
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

      {/* Body - torso */}
      <rect
        x={cx - bodyW / 2}
        y={bodyTop}
        width={bodyW}
        height={bodyH}
        rx="4"
        fill={color}
        opacity={entity.state === 'seated_working' ? 0.7 : 0.85}
      />

      {/* Legs */}
      {entity.state !== 'seated_working' ? (
        <>
          <rect x={cx - bodyW * 0.3} y={legTop} width={bodyW * 0.28} height={legH} rx="3" fill={color} opacity={0.75} />
          <rect x={cx + bodyW * 0.02} y={legTop} width={bodyW * 0.28} height={legH} rx="3" fill={color} opacity={0.75} />
        </>
      ) : (
        // Seated: horizontal legs
        <>
          <rect x={cx - bodyW * 0.5} y={bodyBot - 4} width={bodyW * 0.5} height={bodyW * 0.2} rx="3" fill={color} opacity={0.65} />
          <rect x={cx} y={bodyBot - 4} width={bodyW * 0.5} height={bodyW * 0.2} rx="3" fill={color} opacity={0.65} />
        </>
      )}

      {/* Head */}
      <circle cx={headCx} cy={headCy} r={headR} fill={color} opacity={0.9} />

      {/* Eyes */}
      <circle cx={headCx - headR * 0.3} cy={headCy - headR * 0.1} r={headR * 0.18} fill="white" opacity={0.9} />
      <circle cx={headCx + headR * 0.3} cy={headCy - headR * 0.1} r={headR * 0.18} fill="white" opacity={0.9} />

      {/* State indicators */}
      {entity.hasDrink && (
        <g>
          <rect x={cx + bodyW * 0.3} y={bodyTop - 8} width={8} height={12} rx="2" fill="#93c5fd" stroke="#3b82f6" strokeWidth="0.8" />
          <rect x={cx + bodyW * 0.3} y={bodyTop - 10} width={8} height={4} rx="1" fill="#bfdbfe" />
        </g>
      )}

      {entity.hasESDGloves === false && (
        <g>
          {/* Warning symbol on hands */}
          <text x={cx - bodyW * 0.5 - 6} y={bodyTop + bodyH * 0.5} fontSize="8" fill="#f59e0b">⚠</text>
        </g>
      )}

      {entity.hasCredential === false && (
        <g>
          {/* Red X badge area */}
          <rect x={cx - bodyW * 0.5} y={bodyTop + 4} width="10" height="12" rx="2" fill="#ef4444" opacity="0.9" />
          <text x={cx - bodyW * 0.5 + 5} y={bodyTop + 13} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">✕</text>
        </g>
      )}

      {/* Walking animation indicator */}
      {entity.state === 'walking' && (
        <circle cx={cx} cy={y - 10} r="4" fill="#f59e0b" opacity={0.8}>
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.8s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Alert state pulse */}
      {isAlertState && (
        <circle cx={cx} cy={y - 12} r="6" fill="#ef4444" opacity="0.9">
          <animate attributeName="r" values="4;8;4" dur="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.6s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Confidence bar */}
      {showBox && (
        <g>
          <rect x={x} y={y - 16} width={w} height={5} rx="2" fill="#1e293b" opacity={0.7} />
          <rect
            x={x}
            y={y - 16}
            width={w * entity.confidence}
            height={5}
            rx="2"
            fill={entity.confidence > 0.85 ? '#22c55e' : entity.confidence > 0.70 ? '#f59e0b' : '#ef4444'}
            opacity={0.9}
          />
        </g>
      )}

      {/* Label */}
      {showLabel && (
        <g>
          <rect x={x} y={y - 32} width={Math.max(w, entity.label.length * 5.2 + 8)} height={16} rx="3" fill="#0f172a" opacity={0.85} />
          <text
            x={x + 4}
            y={y - 20}
            fill="white"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="500"
          >
            {entity.label.length > 18 ? entity.label.slice(0, 16) + '…' : entity.label}
          </text>
          <text x={x + Math.max(w, entity.label.length * 5.2 + 8) - 4} y={y - 20} textAnchor="end" fontSize="7" fontFamily="monospace" fill="#94a3b8">
            {Math.round(entity.confidence * 100)}%
          </text>
        </g>
      )}

      {/* Track ID */}
      <text x={cx} y={y + h + 10} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#64748b">
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
  objects,
  zones,
  alerts,
  showBoxes,
  showMasks,
  showLabels,
  showZones,
  showLowConfidence,
  selectedEntityId,
  onSelectEntity,
  frameNumber,
}) => {
  const VIEW_W = 1000;
  const VIEW_H = 650;

  const visibleObjects = showLowConfidence ? objects : objects.filter((o) => o.confidence >= 0.6);

  const BackgroundComponent = {
    office: OfficeBackground,
    datacenter: DatacenterBackground,
    lab: LabBackground,
    meeting_room: MeetingRoomBackground,
  }[environment];

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ display: 'block' }}
    >
      {/* Background scene */}
      <BackgroundComponent />

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

