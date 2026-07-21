# LuxeSalon — Barber Shop App

Aplicación web para gestión de turnos de una barbería, construida con React, Vite, Tailwind CSS y Supabase.

## Stack

- **React 18** — UI
- **Vite** — build tool y dev server
- **React Router** — enrutamiento
- **Tailwind CSS** — estilos
- **Supabase** — base de datos, autenticación y backend
- **lucide-react** — íconos

## Estructura del proyecto

```
barber-shop-app/
├── src/
│   ├── App.jsx          # Componente raíz y rutas
│   ├── main.jsx          # Punto de entrada
│   ├── index.css         # Estilos globales (Tailwind)
│   └── lib/
│       └── supabase.js   # Cliente de Supabase
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Inicio rápido

```bash
npm install
cp .env.example .env   # completar con tus credenciales de Supabase
npm run dev
```

Para instrucciones detalladas de configuración, ver [SETUP.md](./SETUP.md).

## Scripts disponibles

| Comando           | Descripción                              |
|--------------------|-------------------------------------------|
| `npm run dev`      | Inicia el servidor de desarrollo          |
| `npm run build`    | Genera el build de producción             |
| `npm run preview`  | Sirve el build de producción localmente   |
