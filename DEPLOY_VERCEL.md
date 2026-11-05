# Guía de Despliegue en Vercel · VISION AI

Este proyecto está 100% optimizado y listo para ser desplegado en **Vercel** como una SPA (Single Page Application) moderna con Vite, React 19 y Tailwind CSS v4.

---

## Opción 1: Despliegue Automático con GitHub (Recomendado)

1. **Subir los cambios a tu repositorio de GitHub:**
   ```bash
   git add .
   git commit -m "Preparar proyecto para despliegue en Vercel"
   git push origin main
   ```

2. **Entrar a Vercel:**
   - Inicia sesión en [vercel.com](https://vercel.com) con tu cuenta de GitHub.
   - Haz clic en el botón **"Add New..."** → **"Project"**.

3. **Importar Repositorio:**
   - Selecciona tu repositorio `VISION-IA` de la lista.

4. **Configuración del Proyecto:**
   - **Framework Preset:** Vite *(Vercel lo detectará automáticamente gracias a `vercel.json`)*.
   - **Root Directory:** `./` *(o déjalo por defecto)*.
   - **Build Command:** `npm run build` *(automático)*.
   - **Output Directory:** `dist` *(automático)*.
   - **Install Command:** `npm install` *(automático)*.

5. **Desplegar:**
   - Haz clic en **"Deploy"**.
   - En aproximadamente 1 minuto tu aplicación estará disponible en una URL como:
     `https://vision-ia-xxxx.vercel.app`

---

## Opción 2: Despliegue Instantáneo desde la Terminal con Vercel CLI

Si tienes o deseas instalar la CLI de Vercel:

1. **Instalar Vercel CLI globalmente (si no la tienes):**
   ```bash
   npm i -g vercel
   ```

2. **Iniciar sesión y desplegar:**
   ```bash
   cd VISION-IA
   vercel
   ```
   *(Responde a las preguntas interactivas confirmando los valores por defecto).*

3. **Para desplegar directamente a Producción:**
   ```bash
   vercel --prod
   ```

---

## Archivos de Configuración Incluidos

- **[`vercel.json`](./vercel.json)**:
  - Enrutamiento SPA (`rewrites` a `/index.html` para evitar errores 404 al recargar rutas).
  - Encabezados de caché inmutable para activos en `/assets/`.
  - Encabezados de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`).
- **[`vite.config.ts`](./vite.config.ts)**:
  - Configurado con umbral de chunks optimizado para producción.
- **[`index.html`](./index.html)**:
  - Título descriptivo, OpenGraph y metadatos SEO.
- **[`.gitignore`](./.gitignore)**:
  - Ignora carpetas locales de build y caché `.vercel`.

