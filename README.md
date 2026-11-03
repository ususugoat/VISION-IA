# VISION AI — Plataforma Inteligente de Análisis Visual

> **Detección de Objetos · Segmentación · Reconocimiento de Patrones**  
> *Propuesta de Sistema Simulado Funcional para Empresas — Versión 1.0 (Noviembre 2026)*

Sistema web empresarial demostrable diseñado para simular, explicar y auditar flujos de visión computacional con arquitectura desacoplada por capas (Hexagonal / Puertos y Adaptadores), preparada para la integración posterior de un backend real de inferencia (`Python FastAPI + YOLO / SAM`).

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js**: v18+ (recomendado v20+)
- **NPM**: v9+

### Instalación y Ejecución Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en http://localhost:5173
npm run dev

# Compilar para producción (TypeScript + Vite)
npm run build
```

---

## 🏛️ Arquitectura del Sistema (Puertos y Adaptadores)

La arquitectura desacopla estrictamente la interfaz de usuario de la inferencia matemática mediante el contrato `VisionEngine`:

```
USUARIO → REACT / PRESENTACIÓN → CASOS DE USO (Application) → DOMINIO
                                      ↓
                               PUERTOS / INTERFACES
                                      ↓
                    ADAPTADOR DEMO  |  API REAL DE VISIÓN
                 (DemoVisionAdapter) |  (ApiVisionAdapter)
                                      ↓
                         REPOSITORIO / PERSISTENCIA
                         (LocalAnalysisRepository)
                                      ↓
                            DASHBOARD / HISTORIAL
```

### Estructura de Directorios
```
src/
├── app/
│   ├── layout/       # AppShell, Header (Banner DEMO), Sidebar, DemoTourBanner
│   └── providers/    # AppContext (Sesión, Roles, Casos de Uso, Notificaciones)
├── core/
│   ├── application/  # Casos de uso: AnalyzeImage, GetDashboard, SearchHistory, ManageRules, UpdateAlertStatus
│   ├── domain/       # Tipos, entidades, seedData (4 escenarios vectoriales de alta calidad)
│   └── ports/        # Interfaces abstractas: VisionEngine, AnalysisRepository
├── infrastructure/
│   ├── export/       # CsvExportService (Exportación de análisis y alertas a CSV)
│   ├── persistence/  # LocalAnalysisRepository (Persistencia LocalStorage e IndexedDB tipada)
│   └── vision/       # DemoVisionAdapter (Simulador determinista) y ApiVisionAdapter (REST client)
├── modules/
│   ├── alerts/       # Gestión y auditoría de alertas con trazabilidad y estados
│   ├── analysis/     # Centro de análisis visual (Visor SVG normalizado 0..1, Panel lateral de resultados)
│   ├── classes/      # Catálogo y taxonomía de clases con codificación de color
│   ├── dashboard/    # KPI ejecutivos, gráficos de actividad temporal y distribución por clases
│   ├── detections/   # Explorador didáctico de detección y simulador interactivo de NMS / IoU
│   ├── history/      # Historial inmutable con filtros avanzados y exportación CSV
│   ├── patterns/     # Reconocimiento de anomalías y configuración de reglas de negocio
│   ├── procedures/   # Manual de procedimientos interactivo y glosario técnico oficial
│   ├── scenarios/    # Galería de los 4 escenarios pre-calibrados
│   └── settings/     # Conmutador de motor de IA (DEMO vs API REAL), pruebas de conexión y matriz de roles
└── shared/
    ├── ui/           # Componentes accesibles (Button, Card, Badge, Modal, Slider)
    └── utils/        # Utilidades (cn para Tailwind Merge)
```

---

## 🎯 4 Escenarios Demostrativos Calibrados

1. **Seguridad Industrial & Prevención EPP**
   - *Sector*: Seguridad y prevención laboral.
   - *Detecciones*: Personas, casco de seguridad normado, chaleco de alta visibilidad.
   - *Patrón/Alerta*: Operario en zona activa sin casco ni chaleco reflectivo (Alerta Crítica).
2. **Almacén Inteligente & Zonas Restringidas**
   - *Sector*: Retail y almacenes logísticos.
   - *Detecciones*: Montacargas en operación, pallets de carga, cajas apiladas.
   - *Patrón/Alerta*: Horquillas y vehículo sobrepasando la franja amarilla peatonal (Alerta Alta).
3. **Control de Calidad & Defectos Superficiales**
   - *Sector*: Manufactura de precisión.
   - *Detecciones*: Producto manufacturado, etiqueta de lote / código, defecto superficial.
   - *Patrón/Alerta*: Fisura/rayón longitudinal de 18.4mm superior a la tolerancia ISO (No Conforme).
4. **Retail & Análisis de Afluencia / Congestión**
   - *Sector*: Retail y grandes superficies comerciales.
   - *Detecciones*: Clientes en pasillo comercial, estanterías, góndolas de productos.
   - *Patrón/Alerta*: Sobreafluencia y densidad estrecha de más de 4 personas por sector (Alerta Media).

---

## 👥 Matriz de Roles y Permisos (Sección 7.5)

El sistema incluye un **conmutador rápido de rol** en la barra superior para evaluar las perspectivas y permisos del sistema:
- **Administrador** (`admin`): Acceso total a configuración de IA, gestión de reglas, escenarios, edición de colores de clases y eliminación de registros.
- **Operador de Análisis** (`operator`): Carga de imágenes JPG/PNG, ejecución de análisis visual y exploración de hallazgos.
- **Supervisor** (`supervisor`): Auditoría, revisión y cierre formal de alertas con notas técnicas y trazabilidad.
- **Auditor ISO** (`auditor`): Consulta de registros inmutables, trazabilidad de incidentes y exportación masiva a CSV (Modo lectura).

---

## 🎬 Guion de Demostración para Empresas (Paso a Paso)

La aplicación integra un banner interactivo que guía la presentación ejecutiva en 8 pasos:
1. **Presentar Dashboard**: Volumen de análisis, objetos detectados, alertas activas y confianza promedio calculada del repositorio.
2. **Entrar a Seguridad Industrial**: Cargar el escenario y explicar la escena de entrada.
3. **Ejecutar Análisis Combinado**: Observar la barra de progreso por etapas discretas (Validación → Detección → Segmentación → Patrones).
4. **Explicar Cajas vs Máscaras**: Comparar la caja delimitadora (coordenadas relativas 0..1) frente a la máscara de píxeles con control de opacidad.
5. **Reconocimiento de Patrón**: Visualizar la evidencia explicable del operario en infracción con nivel de confianza estadístico.
6. **Auditoría de Alerta**: Modificar el estado de la alerta a *Revisada*, registrar la nota técnica y confirmar el cambio en el dashboard.
7. **Consultar Historial y Exportar**: Aplicar filtros y descargar el reporte completo en archivo `.csv`.
8. **Arquitectura y Conexión de IA Real**: Mostrar el contrato `VisionEngine` y explicar cómo se conmuta a una API REST FastAPI en producción sin rehacer la interfaz.

---

## ⚙️ Criterios de Aceptación Cumplidos (Sección 11 y 14)

- [x] Ejecución sin errores de todos los escenarios demostrativos.
- [x] Carga y validación estricta de imágenes personalizadas JPG/PNG (MIME y límite 10MB).
- [x] Overlays perfectamente alineados al redimensionar la ventana (coordenadas relativas `0..1`).
- [x] Filtros reactivos por clase, confianza mínima, estado y fecha.
- [x] Persistencia local tipada (`localStorage`) que preserva análisis y notas tras recargar la página.
- [x] Los KPI del dashboard se derivan dinámicamente del repositorio (no son números estáticos desconectados).
- [x] Exportación a CSV con cabeceras completas (ID, fecha, usuario, escenario, modo, confianza, estado).
- [x] Distinción inequívoca entre `MODO DEMO` y `MODO API REAL`.
- [x] Principio ético human-in-the-loop: transparencia en los niveles de confianza y validación humana obligatoria.
- [x] Soporte para `prefers-reduced-motion` y accesibilidad visual.
