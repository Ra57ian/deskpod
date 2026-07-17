# 🎧 Deskpod

Mini reproductor flotante estilo iPod para tu escritorio de Windows. Una ventanita siempre visible con clickwheel, listas propias, carcasas intercambiables y música real de YouTube.

## Requisitos

- Windows 10/11
- [Node.js](https://nodejs.org) 18 o superior (instalá la versión LTS)

## Cómo correrlo

Abrí una terminal (PowerShell) dentro de la carpeta del proyecto y ejecutá:

```
npm install
npm run dev
```

La primera vez `npm install` tarda unos minutos (descarga Electron). Después, `npm run dev` abre Deskpod como ventana flotante.

## Cómo usarlo

- **Agregar canciones**: entrá a "Buscar / Agregar" y pegá la URL de cualquier video de YouTube (por ejemplo de YouTube Music). El título, artista y portada se cargan solos. No necesitás ninguna API key para esto.
- **Buscador por nombre (opcional)**: si querés buscar canciones escribiendo el nombre en vez de pegar URLs, creá una API key gratuita de **YouTube Data API v3** en [console.cloud.google.com](https://console.cloud.google.com) (crear proyecto → habilitar "YouTube Data API v3" → credenciales → API key) y pegala en Configuración → API key de YouTube.
- **Listas**: en "Mis listas" creá categorías y agregá canciones con el botón ＋ que aparece junto a cada tema.
- **Clickwheel**: arrastrá en círculos para navegar (como el iPod real), botón central selecciona, MENU vuelve, los laterales cambian de canción y el de abajo pausa/reproduce. También podés tocar directamente en pantalla (doble clic reproduce).
- **Carcasas**: Configuración → Carcasa alterna entre Plata, Grafito, Azul medianoche y Rojo.
- **Mover la ventana**: arrastrala desde la franja superior (donde están los botones amarillo y rojo).

Tus canciones, listas, carcasa y API key se guardan automáticamente y persisten al cerrar la app.

## Crear el instalador (.exe)

```
npm run build
```

El instalador queda en la carpeta `dist/` (electron-builder genera un NSIS para Windows).

## Roadmap

- [ ] **Spotify**: registrar app en developer.spotify.com, login OAuth (PKCE) + Web Playback SDK. Requiere cuenta Premium del usuario. La pantalla en Configuración ya está reservada.
- [ ] Metadatos más finos de YouTube Music (librería no oficial `ytmusicapi`).
- [ ] Control de volumen en la rueda.
- [ ] Atajos de teclado globales (play/pausa con teclas multimedia).

## Nota

La reproducción usa el reproductor embebido oficial de YouTube (IFrame API), así que los videos suenan igual que en youtube.com, con tu sesión y las reglas normales de la plataforma.
