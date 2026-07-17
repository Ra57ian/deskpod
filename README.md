# 🎧 Deskpod

Mini reproductor flotante estilo iPod para tu escritorio de Windows. Una ventanita siempre visible con clickwheel funcional, biblioteca con buscador integrado, listas propias, carcasas intercambiables y música real de YouTube. Nunca más alt-tabear para cambiar de canción.

## Requisitos

- Windows 10/11
- [Node.js](https://nodejs.org) 20 o superior (instalá la versión LTS más reciente)

## Cómo correrlo

Abrí una terminal (PowerShell) dentro de la carpeta del proyecto y ejecutá:

```
npm install
npm run dev
```

La primera vez `npm install` tarda unos minutos (descarga Electron). Después, `npm run dev` abre Deskpod como ventana flotante.

## Cómo usarlo

- **Buscar y agregar canciones**: entrá a "Buscar / Agregar" y escribí el nombre de cualquier canción o artista — Deskpod busca directo en YouTube, sin necesidad de cuentas ni API keys. También podés pegar la URL de un video puntual. Título, artista y portada se cargan solos.
- **Canciones y Artistas**: tu biblioteca se organiza en dos vistas, ambas ordenadas alfabéticamente con separadores de letra/artista al estilo iPod clásico.
- **Listas**: creá categorías en "Mis listas". Al crear una nueva, Deskpod te lleva directo a elegir canciones de tu biblioteca para sumarle. Desde el detalle de cualquier lista también podés agregar más con el botón "＋ Agregar canciones".
- **Mantener apretada una canción**: en "Canciones", sostener el clic sobre un tema abre un menú para agregarlo a una lista o eliminarlo de tu biblioteca.
- **Clickwheel**: arrastrá en círculos para navegar (como el iPod real), botón central selecciona, MENU vuelve, los laterales cambian de canción, el de abajo pausa/reproduce. **Dentro de "Reproduciendo", girar la rueda controla el volumen** (el gesto clásico del iPod), con su propia barra visible. También podés tocar directamente en pantalla o usar el mouse en las barras de progreso y volumen.
- **Aleatorio y repetir**: dos botones en la pantalla de reproducción, con los tres estados de repetir (apagado / todo / una canción).
- **Carcasas**: Configuración → Carcasa alterna entre Plata, Grafito, Azul medianoche y Rojo.
- **Idioma**: Configuración → Idioma alterna entre Español, English, Português, Français y Deutsch. Se traduce toda la interfaz al instante.
- **Mover la ventana**: arrastrala desde la franja superior (donde están los botones amarillo y rojo).

Tu biblioteca, listas, carcasa, idioma y volumen se guardan automáticamente y persisten al cerrar la app.

## Actualizaciones

Deskpod revisa sola si hay una versión más nueva publicada, la descarga en segundo plano, y se actualiza al cerrarse — sin que la persona tenga que hacer nada. Solo aplica a la versión instalada con el Setup (el portable no se auto-actualiza) y nunca corre en `npm run dev`.

## Cómo funciona la música

Deskpod usa el reproductor embebido oficial de YouTube para el audio, y para el buscador lee la página pública de resultados de youtube.com (como una pestaña invisible). Por eso no necesita API keys ni logins. Si YouTube cambia el formato de su página de resultados, el buscador podría requerir un ajuste; mientras tanto, pegar URLs siempre funciona como respaldo.

## Ideas para el futuro (no implementadas todavía)

- Ícono en la bandeja del sistema con controles básicos (play/pausa/siguiente) sin abrir la ventana.
- Atajos de teclado globales (teclas multimedia del teclado).
- Que la ventana recuerde su posición entre sesiones.
- Importar una playlist completa de YouTube pegando su URL.
- Exportar/importar la biblioteca completa (respaldo o migración entre PCs).
