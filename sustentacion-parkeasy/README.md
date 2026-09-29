# ParkEasy UNAB — Sitio de sustentación

Página estática (HTML/CSS/JS puro, sin build) para acompañar la sustentación virtual del Parcial 1.

## Ver en local

```
cd sustentacion-parkeasy
python -m http.server 8080
```

Abrir http://localhost:8080

## Desplegar en Vercel (2 minutos)

**Opción A — drag & drop (más rápido):**
1. Entra a https://vercel.com/new
2. Arrastra la carpeta `sustentacion-parkeasy` completa a la zona de "Deploy".
3. Vercel detecta que es un sitio estático automáticamente (no necesita build command).
4. En ~30 segundos te da una URL pública tipo `parkeasy-unab.vercel.app`.

**Opción B — con GitHub:**
1. Sube esta carpeta a un repo de GitHub.
2. En Vercel → "Add New Project" → importa el repo.
3. Framework Preset: "Other" / "Static". Build command: vacío. Output directory: `.` (raíz).
4. Deploy.

## Estructura

```
sustentacion-parkeasy/
  index.html      Toda la página (HTML + CSS + JS inline)
  assets/         Capturas reales del dashboard, reglas, catálogo y logo
  vercel.json     Config mínima (cleanUrls)
```

No requiere backend, base de datos ni variables de entorno — es 100% estático y seguro de compartir.
