# Guía de configuración

Pasos para dejar el proyecto corriendo localmente con Supabase conectado.

## 1. Instalar dependencias

```bash
cd barber-shop-app
npm install
```

## 2. Crear un proyecto en Supabase

1. Entrá a [https://app.supabase.com](https://app.supabase.com) y creá una cuenta si no tenés una.
2. Hacé clic en **New Project**.
3. Elegí un nombre, una contraseña para la base de datos y una región cercana.
4. Esperá a que el proyecto termine de aprovisionarse (1-2 minutos).

## 3. Obtener las credenciales de la API

1. Dentro del proyecto, andá a **Project Settings** (ícono de engranaje) → **API**.
2. Copiá el valor de **Project URL**.
3. Copiá el valor de **anon public** en la sección de API Keys.

## 4. Configurar las variables de entorno

1. Copiá el archivo de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Abrí `.env` y completá los valores obtenidos en el paso anterior:

   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

   > `.env` está incluido en `.gitignore`, así que nunca se sube al repositorio.

## 5. Levantar el servidor de desarrollo

```bash
npm run dev
```

La app va a estar disponible en `http://localhost:5173`.

## 6. (Opcional) Crear el esquema de base de datos

A medida que agregues funcionalidades (turnos, clientes, servicios, barberos, etc.), creá las tablas correspondientes desde el **SQL Editor** de Supabase o mediante migraciones, y usá el cliente exportado en `src/lib/supabase.js` para consultarlas desde la app.

## 7. Build de producción

```bash
npm run build
npm run preview   # para probar el build localmente
```
