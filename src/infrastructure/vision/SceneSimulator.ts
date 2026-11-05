import type { TrackedObject, Zone, LiveAlert, LiveScenario, LiveRule } from '../../core/domain/liveTypes';

/** Wraps simulation state per active session */
export interface SimulationState {
  scenarioId: string;
  entities: TrackedObject[];
  zones: Zone[];
  rules: LiveRule[];
  frameNumber: number;
  alerts: LiveAlert[];
  sessionId: string;
  maxSimultaneous: number;
  uniqueTrackedIds: Set<string>;
  alertCooldowns: Map<string, number>; // ruleId -> frames until next alert allowed
}

/** Entity behavior probability table per state */
const STATE_TRANSITION_PROB = {
  seated_working: { stay: 0.985, stand: 0.010, interacting: 0.005 },
  standing: { sit: 0.05, walk: 0.60, interacting: 0.30, stay: 0.05 },
  walking: { stop_stand: 0.04, stay: 0.94, reverse: 0.02 },
  interacting: { stay: 0.90, stand: 0.08, walk: 0.02 },
  alert_trigger: { stay: 0.70, resolve: 0.30 },
  restricted_zone: { leave: 0.10, stay: 0.90 },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getEntityCenter(e: TrackedObject): { cx: number; cy: number } {
  return { cx: e.x, cy: e.y };
}

function rectOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function entityInZone(e: TrackedObject, z: Zone): boolean {
  return rectOverlap(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height, z.x, z.y, z.width, z.height);
}

function distanceBetween(a: TrackedObject, b: TrackedObject): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function generateAlertId(): string {
  return `la_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

export class SceneSimulator {
  private states: Map<string, SimulationState> = new Map();
  private rng: () => number;
  private seed: number;

  constructor(seed = 42) {
    this.seed = seed;
    this.rng = this.makeRng(seed);
  }

  private makeRng(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  initSession(sessionId: string, scenario: LiveScenario): void {
    const entities: TrackedObject[] = scenario.initialEntities.map((e) => ({
      ...e,
      stateFrameCount: 0,
      framesSinceAlert: 999,
    }));

    this.states.set(sessionId, {
      scenarioId: scenario.id,
      entities,
      zones: scenario.zones,
      rules: scenario.rules.filter((r) => r.enabled),
      frameNumber: 0,
      alerts: [],
      sessionId,
      maxSimultaneous: entities.length,
      uniqueTrackedIds: new Set(entities.map((e) => e.trackId)),
      alertCooldowns: new Map(),
    });
  }

  removeSession(sessionId: string): void {
    this.states.delete(sessionId);
  }

  getState(sessionId: string): SimulationState | undefined {
    return this.states.get(sessionId);
  }

  nextFrame(sessionId: string): { entities: TrackedObject[]; newAlerts: LiveAlert[] } {
    const state = this.states.get(sessionId);
    if (!state) return { entities: [], newAlerts: [] };

    state.frameNumber++;

    // Tick cooldowns
    for (const [ruleId, remaining] of state.alertCooldowns) {
      if (remaining <= 1) {
        state.alertCooldowns.delete(ruleId);
      } else {
        state.alertCooldowns.set(ruleId, remaining - 1);
      }
    }

    // Update entities
    this.updateEntities(state);

    // Evaluate rules
    const newAlerts = this.evaluateRules(state);

    // Track max simultaneous
    if (state.entities.length > state.maxSimultaneous) {
      state.maxSimultaneous = state.entities.length;
    }
    state.entities.forEach((e) => state.uniqueTrackedIds.add(e.trackId));

    return { entities: [...state.entities], newAlerts };
  }

  private updateEntities(state: SimulationState): void {
    for (const entity of state.entities) {
      entity.stateFrameCount++;
      entity.framesSinceAlert++;

      // Possibly transition state
      this.maybeTransitionState(entity, state);

      // Apply movement
      this.applyMovement(entity, state);

      // Determine occupied zone
      entity.occupiedZoneId = state.zones.find((z) => entityInZone(entity, z))?.id;
    }
  }

  private maybeTransitionState(entity: TrackedObject, state: SimulationState): void {
    const r = this.rng();
    const scenario = state.scenarioId;

    switch (entity.state) {
      case 'seated_working': {
        const prob = STATE_TRANSITION_PROB.seated_working;
        if (r < 1 - prob.stay) {
          if (r < prob.stand) {
            entity.state = 'standing';
            entity.stateFrameCount = 0;
          } else {
            entity.state = 'interacting';
            entity.stateFrameCount = 0;
          }
        }
        break;
      }
      case 'standing': {
        const prob = STATE_TRANSITION_PROB.standing;
        if (r < prob.walk) {
          entity.state = 'walking';
          // Set random direction
          const angle = this.rng() * Math.PI * 2;
          entity.velocity = { vx: Math.cos(angle) * 0.004, vy: Math.sin(angle) * 0.002 };
          entity.stateFrameCount = 0;
        } else if (r < prob.walk + prob.sit) {
          entity.state = 'seated_working';
          entity.velocity = { vx: 0, vy: 0 };
          entity.stateFrameCount = 0;
        } else if (r < prob.walk + prob.sit + prob.interacting) {
          entity.state = 'interacting';
          entity.velocity = { vx: 0, vy: 0 };
          entity.stateFrameCount = 0;
        }
        break;
      }
      case 'walking': {
        if (r < 0.04 || entity.stateFrameCount > 60) {
          entity.state = 'standing';
          entity.velocity = { vx: 0, vy: 0 };
          entity.stateFrameCount = 0;
        } else if (r < 0.06) {
          // Slight direction change
          entity.velocity.vx += (this.rng() - 0.5) * 0.002;
          entity.velocity.vy += (this.rng() - 0.5) * 0.001;
          // Clamp speed
          const speed = Math.sqrt(entity.velocity.vx ** 2 + entity.velocity.vy ** 2);
          if (speed > 0.006) {
            entity.velocity.vx = (entity.velocity.vx / speed) * 0.006;
            entity.velocity.vy = (entity.velocity.vy / speed) * 0.006;
          }
        }
        break;
      }
      case 'interacting': {
        if (r < 0.05 || entity.stateFrameCount > 80) {
          entity.state = this.rng() < 0.6 ? 'seated_working' : 'standing';
          entity.stateFrameCount = 0;
        }
        break;
      }
    }

    // Scenario-specific: randomly trigger drink/food near equipment
    if (scenario === 'live_office_tech' && entity.hasDrink && entity.state === 'seated_working') {
      if (this.rng() < 0.002) {
        entity.hasDrink = false; // drink removed (resolved scenario)
      }
    }
  }

  private applyMovement(entity: TrackedObject, state: SimulationState): void {
    // Scenario: Quality Control - Bottles move on endless conveyor belt
    if (state.scenarioId === 'live_calidad') {
      entity.x += 0.0025;
      if (entity.x > 0.88) {
        entity.x = 0.08;
        entity.inspectedThisPass = false;
      }
      if (entity.x < 0.25) {
        entity.inspectedThisPass = false;
      }
      return;
    }

    // Scenario: Warehouse - Forklift patrols back and forth into restricted zone
    if (state.scenarioId === 'live_almacen') {
      if (entity.classId === 'cls_montacargas' || entity.vehicleType === 'forklift') {
        entity.x += entity.velocity.vx;
        if (entity.x >= 0.54) {
          entity.velocity.vx = -0.0016;
        } else if (entity.x <= 0.28) {
          entity.velocity.vx = 0.0016;
        }
        return;
      }
    }

    // Scenario: Retail - Shoppers browse within aisle boundaries
    if (state.scenarioId === 'live_retail') {
      entity.x = clamp(entity.x + entity.velocity.vx, 0.32, 0.58);
      entity.y = clamp(entity.y + entity.velocity.vy, 0.55, 0.82);
      if (entity.x <= 0.33 || entity.x >= 0.57) entity.velocity.vx *= -1;
      if (entity.y <= 0.56 || entity.y >= 0.81) entity.velocity.vy *= -1;
      return;
    }

    // Scenario: Industrial - Workers patrol floor
    if (state.scenarioId === 'live_seguridad') {
      entity.x = clamp(entity.x + entity.velocity.vx, 0.15, 0.82);
      entity.y = clamp(entity.y + entity.velocity.vy, 0.46, 0.76);
      if (entity.x <= 0.16 || entity.x >= 0.81) entity.velocity.vx *= -1;
      if (entity.y <= 0.47 || entity.y >= 0.75) entity.velocity.vy *= -1;
      return;
    }

    if (entity.state !== 'walking') {
      entity.velocity = { vx: entity.velocity.vx * 0.85, vy: entity.velocity.vy * 0.85 };
    }

    entity.x = clamp(entity.x + entity.velocity.vx, entity.width / 2, 1 - entity.width / 2);
    entity.y = clamp(entity.y + entity.velocity.vy, entity.height / 2, 1 - entity.height / 2);

    // Bounce off edges
    if (entity.x <= entity.width / 2 || entity.x >= 1 - entity.width / 2) {
      entity.velocity.vx *= -0.8;
    }
    if (entity.y <= entity.height / 2 || entity.y >= 1 - entity.height / 2) {
      entity.velocity.vy *= -0.8;
    }
  }

  private evaluateRules(state: SimulationState): LiveAlert[] {
    const newAlerts: LiveAlert[] = [];
    const ts = new Date().toISOString();

    for (const rule of state.rules) {
      if (state.alertCooldowns.has(rule.id)) continue; // on cooldown

      let triggered = false;
      let triggerEntity: TrackedObject | undefined;
      let triggerZone: Zone | undefined;
      let message = '';
      let evidence = '';

      switch (rule.evaluator) {
        case 'missingPPE': {
          for (const entity of state.entities) {
            if (entity.hasEPP === false || entity.hasHelmet === false) {
              triggered = true;
              triggerEntity = entity;
              triggerZone = state.zones.find((z) => z.id === entity.occupiedZoneId) || state.zones[0];
              message = `${entity.label} sin EPP reglamentario (Casco / Chaleco) detectado en planta`;
              evidence = `Infracción normativa ISO 45001 / OSHA. Silueta humana sin casco tipo ANSI Z89.1 ni reflectivo de alta visibilidad. Confianza: ${(entity.confidence * 100).toFixed(0)}%`;
              break;
            }
          }
          break;
        }

        case 'dangerZoneIntrusion': {
          for (const entity of state.entities) {
            const dangerZone = state.zones.find((z) => z.id === 'z_danger_line' || z.type === 'restricted');
            if (dangerZone && (entity.occupiedZoneId === dangerZone.id || entityInZone(entity, dangerZone))) {
              triggered = true;
              triggerEntity = entity;
              triggerZone = dangerZone;
              message = `${entity.label} sobrepasó la franja amarilla perimetral hacia área de maquinaria activa`;
              evidence = `Invasión espacial de zona de riesgo crítico. Coordenadas x=${(entity.x * 100).toFixed(1)}%, y=${(entity.y * 100).toFixed(1)}%. Fotograma #${state.frameNumber}`;
              break;
            }
          }
          break;
        }

        case 'overheadDanger': {
          const craneZone = state.zones.find((z) => z.id === 'z_overhead_crane');
          if (craneZone) {
            for (const entity of state.entities) {
              if (entityInZone(entity, craneZone)) {
                triggered = true;
                triggerEntity = entity;
                triggerZone = craneZone;
                message = `${entity.label} transitando en radio de operación de grúa aérea`;
                evidence = `Riesgo crítico de caída de carga suspendida. Protocolo de detención automática emitido.`;
                break;
              }
            }
          }
          break;
        }

        case 'forkliftIntrusion': {
          const restrictedZone = state.zones.find((z) => z.id === 'z_restricted_a' || z.type === 'restricted');
          if (restrictedZone) {
            for (const entity of state.entities) {
              if (entity.classId === 'cls_montacargas' || entity.vehicleType === 'forklift') {
                if (entityInZone(entity, restrictedZone) || entity.occupiedZoneId === restrictedZone.id || entity.x >= 0.44) {
                  triggered = true;
                  triggerEntity = entity;
                  triggerZone = restrictedZone;
                  message = `Objeto en zona restringida: Montacargas en ${restrictedZone.label}`;
                  evidence = `"Montacargas" (${Math.round(entity.confidence * 100)} %) con su punto de apoyo dentro de la zona "${restrictedZone.label}". Condición sostenida 1.5 s - fotograma #${state.frameNumber} (t = ${(state.frameNumber / 12).toFixed(1)} s).`;
                  break;
                }
              }
            }
          }
          break;
        }

        case 'cargoUnstable': {
          for (const entity of state.entities) {
            if (entity.vehicleType === 'forklift' || entity.classId === 'cls_montacargas') {
              triggered = true;
              triggerEntity = entity;
              triggerZone = state.zones.find((z) => z.id === entity.occupiedZoneId);
              message = `Alerta de estabilidad: Pallet en horquilla fuera del centro de gravedad seguro`;
              evidence = `Inclinación lateral anómala detectada en horquilla del montacargas. Riesgo de vuelco de carga.`;
              break;
            }
          }
          break;
        }

        case 'scratchDefect': {
          for (const entity of state.entities) {
            // Se evalúa cuando una botella con defecto pasa por la estación de inspección CAM-QC1 (x entre 0.35 y 0.44)
            if (entity.isDefective && entity.x >= 0.35 && entity.x <= 0.44 && !entity.inspectedThisPass) {
              triggered = true;
              triggerEntity = entity;
              triggerZone = state.zones.find((z) => z.id === 'z_inspection_fov') || state.zones[0];
              entity.inspectedThisPass = true;
              message = `ALERTA: ${entity.label} en MAL ESTADO detectada (${entity.defectDetail || 'Fisura crítica superior al 1.5%'})`;
              evidence = `Estación CAM-QC1 · Visión AI: Fallo estructural confirmado (${entity.defectDetail || 'Fisura de 18.4mm'}). Clasificación: NO CONFORME (Derivada a rechazo). Confianza: ${(entity.confidence * 100).toFixed(0)}%`;
              break;
            }
          }
          break;
        }

        case 'bottleQuality': {
          for (const entity of state.entities) {
            // Se notifica cuando una botella en buen estado pasa por la estación de inspección CAM-QC1 (x entre 0.35 y 0.44)
            if (!entity.isDefective && entity.x >= 0.35 && entity.x <= 0.44 && !entity.inspectedThisPass) {
              triggered = true;
              triggerEntity = entity;
              triggerZone = state.zones.find((z) => z.id === 'z_inspection_fov') || state.zones[0];
              entity.inspectedThisPass = true;
              message = `NOTIFICACIÓN: ${entity.label} en BUEN ESTADO verificada (Llenado, sellado y lote conformes)`;
              evidence = `Estación CAM-QC1 · Visión AI: Inspección óptica 100% aprobada. Tapa hermética, volumen 500 ml ±1% y superficie libre de rayones. Clasificación: CONFORME. Confianza: ${(entity.confidence * 100).toFixed(0)}%`;
              break;
            }
          }
          break;
        }

        case 'barcodeFault': {
          triggered = true;
          message = `Código óptico de lote degradado en estación de inspección`;
          evidence = `Nivel de contraste del código de barras inferior a 0.40. Registro enviado a verificación manual.`;
          break;
        }

        case 'retailOvercapacity': {
          const mainAisle = state.zones.find((z) => z.id === 'z_main_aisle' || z.type === 'safe_passage');
          const shoppersInAisle = state.entities.filter((e) =>
            e.classId === 'cls_persona' && (e.occupiedZoneId === 'z_main_aisle' || (mainAisle && entityInZone(e, mainAisle)))
          ).length;
          if (shoppersInAisle >= (rule.threshold ?? 3)) {
            triggered = true;
            message = `Alerta de sobreafluencia en pasillo comercial: ${shoppersInAisle} clientes simultáneos`;
            evidence = `Aforo en pasillo superado (umbral ${rule.threshold ?? 3}). Notificación a supervisor de sala para agilizar flujo.`;
          }
          break;
        }

        case 'spaceInvasion': {
          // Check if any walking/standing entity is overlapping another entity's workspace zone
          for (const entity of state.entities) {
            if (entity.state === 'walking' || entity.state === 'standing') {
              for (const other of state.entities) {
                if (other.id === entity.id) continue;
                if (other.occupiedZoneId) {
                  const otherZone = state.zones.find((z) => z.id === other.occupiedZoneId);
                  if (otherZone && entityInZone(entity, otherZone)) {
                    triggered = true;
                    triggerEntity = entity;
                    triggerZone = otherZone;
                    message = `${entity.label} invadió el espacio de trabajo de ${other.label} en ${otherZone.label}`;
                    evidence = `Colisión de zona detectada: distancia ${(distanceBetween(entity, other) * 100).toFixed(1)}cm simulados. Confianza: ${(entity.confidence * 100).toFixed(0)}%`;
                    break;
                  }
                }
              }
            }
            if (triggered) break;
          }
          break;
        }

        case 'drinkNearEquipment': {
          for (const entity of state.entities) {
            if (entity.hasDrink && entity.occupiedZoneId) {
              const zone = state.zones.find((z) => z.id === entity.occupiedZoneId && z.type === 'workspace');
              if (zone) {
                triggered = true;
                triggerEntity = entity;
                triggerZone = zone;
                message = `Bebida detectada junto a equipo informático en ${zone.label} (${entity.label})`;
                evidence = `Objeto tipo 'bebida/vaso' con confianza ${(entity.confidence * 100).toFixed(0)}% a 15cm del equipo activo. Riesgo de derrame crítico.`;
                break;
              }
            }
          }
          break;
        }

        case 'noCredential': {
          for (const entity of state.entities) {
            if (entity.hasCredential === false && entity.occupiedZoneId) {
              const zone = state.zones.find((z) => z.id === entity.occupiedZoneId && z.type === 'restricted');
              if (zone) {
                triggered = true;
                triggerEntity = entity;
                triggerZone = zone;
                message = `${entity.label} en zona restringida sin credencial visible — ${zone.label}`;
                evidence = `Badge/credencial no detectado en la silueta del operador. Zona requiere autorización Nivel 2. Fotograma #${state.frameNumber}`;
                break;
              }
            }
          }
          break;
        }

        case 'hotAisleExposure': {
          const hotZone = state.zones.find((z) => z.id === 'z_hot_aisle');
          if (hotZone) {
            for (const entity of state.entities) {
              if (entityInZone(entity, hotZone) && entity.stateFrameCount > (rule.threshold ?? 30)) {
                triggered = true;
                triggerEntity = entity;
                triggerZone = hotZone;
                message = `${entity.label} en Pasillo Caliente por ${((entity.stateFrameCount / 12)).toFixed(1)}s (máx. 2.5s)`;
                evidence = `Temperatura simulada: 42°C. Tiempo de exposición superado. Riesgo de golpe de calor.`;
                break;
              }
            }
          }
          break;
        }

        case 'unauthorizedZone': {
          for (const entity of state.entities) {
            const zone = state.zones.find((z) => z.id === entity.occupiedZoneId && z.type === 'restricted');
            if (zone && entity.hasCredential === false) {
              triggered = true;
              triggerEntity = entity;
              triggerZone = zone;
              message = `Acceso no autorizado detectado en ${zone.label} — ${entity.label}`;
              evidence = `Entidad sin credencial ingresó a zona de acceso controlado. Confianza: ${(entity.confidence * 100).toFixed(0)}%`;
              break;
            }
          }
          break;
        }

        case 'noESDGloves': {
          for (const entity of state.entities) {
            if (entity.hasESDGloves === false && entity.state === 'interacting' && entity.occupiedZoneId) {
              const zone = state.zones.find((z) => z.id === entity.occupiedZoneId && z.type === 'inspection_point');
              if (zone) {
                triggered = true;
                triggerEntity = entity;
                triggerZone = zone;
                message = `${entity.label} manipulando equipo electrónico sin guantes ESD en ${zone.label}`;
                evidence = `Guantes antiestáticos no detectados. Riesgo de descarga electrostática (ESD) a componentes sensibles. Daño irreversible posible.`;
                break;
              }
            }
          }
          break;
        }

        case 'foodInLab': {
          for (const entity of state.entities) {
            if ((entity.hasDrink || entity.hasFood) && entity.occupiedZoneId) {
              const zone = state.zones.find((z) => z.id === entity.occupiedZoneId && (z.type === 'inspection_point' || z.type === 'restricted'));
              if (zone) {
                triggered = true;
                triggerEntity = entity;
                triggerZone = zone;
                message = `${entity.hasDrink ? 'Bebida' : 'Alimento'} detectado en zona de equipos sensibles — ${zone.label}`;
                evidence = `Contaminante detectado a < 20cm de equipo bajo prueba. Riesgo de cortocircuito y contaminación por humedad.`;
                break;
              }
            }
          }
          break;
        }

        case 'overcapacity': {
          const meetingZone = state.zones.find(z => z.id === 'z_meeting_table');
          const inMeeting = state.entities.filter((e) =>
            e.occupiedZoneId === 'z_meeting_table' ||
            e.occupiedZoneId === 'z_camera_view' ||
            (e.state !== 'walking' && meetingZone && entityInZone(e, meetingZone))
          ).length;
          if (inMeeting > (rule.threshold ?? 6)) {
            triggered = true;
            message = `Aforo excedido: ${inMeeting} personas detectadas (máximo ${rule.threshold ?? 6})`;
            evidence = `${inMeeting} identificadores únicos detectados en la sala. Protocolo de evacuación preventiva según norma SENATI-HS-07.`;
          }
          break;
        }

        case 'cameraBlocked': {
          const camZone = state.zones.find((z) => z.id === 'z_camera_view');
          if (camZone) {
            const blocker = state.entities.find((e) => entityInZone(e, camZone) && e.state !== 'seated_working');
            if (blocker) {
              triggered = true;
              triggerEntity = blocker;
              triggerZone = camZone;
              message = `Obstrucción de cámara de videoconferencia detectada — ${blocker.label}`;
              evidence = `${blocker.label} en campo de visión de la cámara. Participantes remotos afectados. Fotograma #${state.frameNumber}`;
            }
          }
          break;
        }

        default:
          break;
      }

      if (triggered) {
        const alert: LiveAlert = {
          id: generateAlertId(),
          sessionId: state.sessionId,
          frameNumber: state.frameNumber,
          timestamp: ts,
          severity: rule.severity,
          status: 'active',
          triggerEntityId: triggerEntity?.id,
          triggerEntityLabel: triggerEntity?.label,
          ruleId: rule.id,
          ruleName: rule.name,
          message,
          evidence,
          zoneId: triggerZone?.id,
          zoneName: triggerZone?.label,
          confidence: triggerEntity ? triggerEntity.confidence : 0.9,
          screenshotFrame: state.frameNumber,
        };
        newAlerts.push(alert);
        state.alerts.push(alert);
        state.alertCooldowns.set(rule.id, rule.cooldownFrames);
      }
    }

    return newAlerts;
  }
}
