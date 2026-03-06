# GymTracker Web

App web de entrenamiento con persistencia automática de sesión activa y historial.

## Requisitos
- Node.js 20+

## Ejecutar en local
1. `npm install`
2. `npm run dev`
3. Abrir `http://localhost:5173`

Notas:
- En local usa SQLite (`data/gymtracker.db`) automáticamente.
- Si defines `DATABASE_URL`, usa Postgres.

## Producción (Render)
- Este repo incluye `render.yaml` para crear:
  - Web Service (Node)
  - Postgres
- En Render: `New +` -> `Blueprint` -> conecta el repo.
- Render leerá `render.yaml` y levantará todo.
