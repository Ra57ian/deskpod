const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { autoUpdater } = require("electron-updater");

// Chromium bloquea el autoplay con sonido por defecto; sin esto,
// el reproductor de YouTube carga el video pero queda en pausa.
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

// Mismo dominio que usás para las actualizaciones (package.json > build.publish.url),
// tu servidor casero responde ahí tanto los archivos de update como la licencia.
const LICENSE_SERVER_URL = "https://REEMPLAZAR-CON-TU-URL.com";

// Configurá esto con los datos de tu producto en Gumroad:
// el "permalink" es la parte corta de la URL de tu producto
// (gumroad.com/l/deskpod → el permalink es "deskpod").
const GUMROAD_PRODUCT_PERMALINK = "REEMPLAZAR-CON-TU-PERMALINK";
const MAX_DEVICES = 2; // cuántas PCs puede activar cada compra

let win;

/* ── Actualizaciones automáticas ──
   Descarga la nueva versión en segundo plano (sin interrumpir a la
   persona) y la instala sola la próxima vez que cierre Deskpod.
   Solo corre en la versión empaquetada (con instalador NSIS); en
   desarrollo, o en el portable, no hay nada que revisar/instalar. */
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdates() {
  if (!app.isPackaged) return; // en npm run dev no hay servidor de updates que consultar

  const notify = (status) => win?.webContents.send("update-status", status);
  autoUpdater.on("update-available", () => notify("downloading"));
  autoUpdater.on("update-downloaded", () => notify("ready"));
  autoUpdater.on("error", (err) => console.error("Auto-update error:", err));

  autoUpdater.checkForUpdates().catch((err) => console.error("checkForUpdates falló:", err));
  // Revisar de nuevo cada 4 horas por si la app queda abierta mucho tiempo
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 4 * 60 * 60 * 1000);
}

/* ── Licencia (vía la API pública de Gumroad, sin servidor propio) ──
   Gumroad genera la clave y la manda por mail solo en el momento de
   la compra (con "Generate a unique license key per sale" activado
   en el producto). Acá solo la validamos contra su API.
   El contador "uses" de Gumroad hace de límite de dispositivos: lo
   consultamos primero sin incrementar, y solo lo subimos de verdad
   al activar en una PC nueva.                                      */
async function gumroadVerify(key, incrementUses) {
  const body = new URLSearchParams({
    product_permalink: GUMROAD_PRODUCT_PERMALINK,
    license_key: key,
    increment_uses_count: incrementUses ? "true" : "false",
  });
  const r = await fetch("https://api.gumroad.com/v2/licenses/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return r.json();
}
const isRevoked = (p) => !!(p?.refunded || p?.chargebacked || p?.disputed);

ipcMain.handle("license:activate", async (_e, key) => {
  try {
    const peek = await gumroadVerify(key, false);
    if (!peek.success) return { ok: false, reason: "invalid_key" };
    if (isRevoked(peek.purchase)) return { ok: false, reason: "revoked" };
    if ((peek.uses || 0) >= MAX_DEVICES) return { ok: false, reason: "max_devices" };

    const reg = await gumroadVerify(key, true); // recién acá se cuenta como una activación más
    return reg.success ? { ok: true } : { ok: false, reason: "invalid_key" };
  } catch {
    return { ok: false, reason: "network" };
  }
});
ipcMain.handle("license:check", async (_e, key) => {
  try {
    const res = await gumroadVerify(key, false); // solo consulta, no suma otra activación
    if (!res.success) return { ok: false, reason: "invalid_key" };
    return isRevoked(res.purchase) ? { ok: false, reason: "revoked" } : { ok: true };
  } catch {
    return { ok: null, reason: "network" }; // sin internet: no castigar, seguir con lo ya validado
  }
});

/* ── Persistencia simple en JSON ── */
const dataFile = () => path.join(app.getPath("userData"), "deskpod-data.json");

ipcMain.handle("store:load", () => {
  try { return JSON.parse(fs.readFileSync(dataFile(), "utf8")); }
  catch { return null; }
});
ipcMain.handle("store:save", (_e, data) => {
  if (!data || typeof data !== "object") return false;
  try {
    const json = JSON.stringify(data, null, 2);
    if (json.length > 500_000) return false; // tope generoso, evita guardar algo corrupto/gigante
    fs.writeFileSync(dataFile(), json);
    return true;
  } catch {
    return false;
  }
});

/* ── Búsqueda en YouTube sin API key ──
   Pide la página pública de resultados de youtube.com (como una
   pestaña invisible) y extrae los videos del JSON que la propia
   página trae embebido (ytInitialData). El idioma/región de la
   búsqueda sigue el idioma elegido en Deskpod, no uno fijo, para
   que funcione parejo en cualquier país.                          */
const YT_LOCALE = {
  es: { hl: "es", al: "es-419,es;q=0.9,en;q=0.5" },
  en: { hl: "en", al: "en-US,en;q=0.9" },
  pt: { hl: "pt", al: "pt-BR,pt;q=0.9,en;q=0.5" },
  fr: { hl: "fr", al: "fr-FR,fr;q=0.9,en;q=0.5" },
  de: { hl: "de", al: "de-DE,de;q=0.9,en;q=0.5" },
};
ipcMain.handle("yt:search", async (_e, query, lang) => {
  try {
    const loc = YT_LOCALE[lang] || YT_LOCALE.en;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D&hl=${loc.hl}`; // sp = filtrar solo videos
    const r = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "accept-language": loc.al,
      },
    });
    const html = await r.text();
    const m = html.match(/var ytInitialData = (\{.+?\});<\/script>/s);
    if (!m) return { error: "formato" };
    const data = JSON.parse(m[1]);

    // Recorrer el árbol juntando todos los videoRenderer
    const found = [];
    const walk = (o) => {
      if (!o || typeof o !== "object" || found.length >= 30) return;
      if (o.videoRenderer) found.push(o.videoRenderer);
      for (const k in o) walk(o[k]);
    };
    walk(data);

    // Puntuar para priorizar canciones sobre covers, vivos y entrevistas
    const score = (title, channel) => {
      let s = 0;
      if (/\s-\s?Topic$/i.test(channel)) s += 4;                                  // canal automático de música (canción oficial)
      if (/vevo/i.test(channel)) s += 3;
      if (/official (audio|video)|video oficial|audio oficial|lyric/i.test(title)) s += 2;
      if (/\b(live|en vivo|ao vivo|cover|remix|reaccion|reaction|interview|entrevista|tutorial)\b/i.test(title)) s -= 2;
      return s;
    };

    const results = found.map((v, i) => {
      const title = v.title?.runs?.[0]?.text || "Sin título";
      const artist = (v.ownerText?.runs?.[0]?.text || v.longBylineText?.runs?.[0]?.text || "").replace(/\s-\s?Topic$/i, "");
      return {
        videoId: v.videoId,
        title, artist,
        cover: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
        durText: v.lengthText?.simpleText || "",
        _s: score(title, v.ownerText?.runs?.[0]?.text || ""),
        _i: i,
      };
    }).filter((v) => v.videoId)
      .sort((a, b) => b._s - a._s || a._i - b._i)
      .slice(0, 20)
      .map(({ _s, _i, ...v }) => v);

    return { results };
  } catch (e) {
    return { error: String(e) };
  }
});

/* ── Servidor local para la versión empaquetada ──
   YouTube no permite que su reproductor embebido se comunique con
   páginas cargadas desde file:// (el origen que usa loadFile). La
   solución es servir la app por http://127.0.0.1, igual que hace
   Vite en desarrollo con http://localhost:5173.                   */
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".json": "application/json", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2",
};
function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqPath = decodeURIComponent((req.url || "/").split("?")[0]);
      const filePath = path.normalize(path.join(rootDir, reqPath === "/" ? "/index.html" : reqPath));
      if (!filePath.startsWith(rootDir)) { res.writeHead(403); res.end(); return; } // sin traversal
      fs.readFile(filePath, (err, data) => {
        if (err) {
          // Rutas desconocidas: servir index.html (comportamiento de SPA)
          fs.readFile(path.join(rootDir, "index.html"), (err2, data2) => {
            if (err2) { res.writeHead(404); res.end(); return; }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data2);
          });
          return;
        }
        res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port)); // solo loopback, no expuesto a la red local
  });
}

/* ── Controles de ventana ── */
ipcMain.on("win:close", () => win?.close());
ipcMain.on("win:minimize", () => win?.minimize());
ipcMain.on("win:toggle-top", (_e, value) => win?.setAlwaysOnTop(value));

async function createWindow() {
  win = new BrowserWindow({
    width: 330,
    height: 660,
    frame: false,           // sin bordes de Windows: la carcasa ES la ventana
    transparent: true,      // esquinas redondeadas reales
    resizable: false,
    alwaysOnTop: true,      // flota sobre las demás ventanas
    skipTaskbar: false,
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
  } else {
    const port = await startStaticServer(path.join(__dirname, "../dist"));
    win.loadURL(`http://localhost:${port}/index.html`);
  }
}

app.whenReady().then(async () => {
  await createWindow();
  setupAutoUpdates();
});
app.on("window-all-closed", () => app.quit());
