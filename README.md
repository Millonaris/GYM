# GymTracker Web

App web de entrenamiento con persistencia automática de sesión activa y historial.

## Modo gratis (recomendado para uso personal en móvil)
- Por defecto la app guarda todo en el propio navegador del teléfono (`localStorage`).
- No necesita backend ni base de datos en la nube.
- Coste mensual: 0 €.
- Al terminar un entrenamiento descarga automáticamente un backup `.json` con todo el historial.
- Puedes restaurar el backup desde el botón `Cargar backup` en la pantalla principal.

## Requisitos
- Node.js 20+

## Ejecutar en local
1. `npm install`
2. `npm run dev`
3. Abrir `http://localhost:5173`

Notas:
- En local usa SQLite (`data/gymtracker.db`) automáticamente.
- Si defines `DATABASE_URL`, usa Postgres.

## Publicar gratis (sin backend)
Opción simple:
1. `npm run build`
2. Sube la carpeta `dist/` a un hosting estático gratuito (Cloudflare Pages, Netlify o GitHub Pages).
3. Abre la URL desde tu móvil y úsala siempre desde ese mismo navegador.

Importante:
- Si borras datos del navegador o cambias de navegador/dispositivo, se pierde esa base local.
- Si quieres sincronización en nube, activa `VITE_REMOTE_SYNC=1` y usa backend.

## Producción (Render)
- Este repo incluye `render.yaml` para crear:
  - Web Service (Node)
  - Postgres
- En Render: `New +` -> `Blueprint` -> conecta el repo.
- Render leerá `render.yaml` y levantará todo.
