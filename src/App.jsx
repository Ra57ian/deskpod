import { useState, useRef, useEffect, useCallback, Fragment } from "react";

/* ═══════════════════════════════════════════════════════════════
   DESKPOD — mini reproductor flotante estilo iPod
   Reproducción real vía YouTube IFrame API.
   Agregá canciones pegando la URL del video (sin API key),
   o configurá una API key de YouTube para buscar en el catálogo.
   ═══════════════════════════════════════════════════════════════ */

// ── Modelos de carcasa ──
const CASES = {
  plata: {
    name: "Plata clásica",
    body: "linear-gradient(160deg, #fdfdfd 0%, #e8eaed 45%, #cfd3d8 100%)",
    bodyShadow: "inset 0 1px 0 rgba(255,255,255,.9), inset 0 -2px 6px rgba(0,0,0,.15)",
    wheel: "radial-gradient(circle at 35% 30%, #f2f3f5, #cfd3d8 70%)",
    center: "radial-gradient(circle at 35% 30%, #ffffff, #dfe3e8 75%)",
    label: "#8a8f96", brand: "#9aa0a8",
  },
  grafito: {
    name: "Grafito",
    body: "linear-gradient(160deg, #3a3d43 0%, #24262b 55%, #17181c 100%)",
    bodyShadow: "inset 0 1px 0 rgba(255,255,255,.12), inset 0 -2px 6px rgba(0,0,0,.5)",
    wheel: "radial-gradient(circle at 35% 30%, #4a4d54, #2a2c31 70%)",
    center: "radial-gradient(circle at 35% 30%, #55585f, #33353b 75%)",
    label: "#9aa0a8", brand: "#6b6f76",
  },
  azul: {
    name: "Azul medianoche",
    body: "linear-gradient(160deg, #3d5a8f 0%, #253b63 55%, #16233d 100%)",
    bodyShadow: "inset 0 1px 0 rgba(255,255,255,.22), inset 0 -2px 6px rgba(0,0,0,.4)",
    wheel: "radial-gradient(circle at 35% 30%, #4c6ba3, #2b4272 70%)",
    center: "radial-gradient(circle at 35% 30%, #5f7fb8, #38517f 75%)",
    label: "#aec4e8", brand: "#7c96c4",
  },
  rojo: {
    name: "Rojo",
    body: "linear-gradient(160deg, #e0554f 0%, #b2322e 55%, #7e1f1d 100%)",
    bodyShadow: "inset 0 1px 0 rgba(255,255,255,.3), inset 0 -2px 6px rgba(0,0,0,.35)",
    wheel: "radial-gradient(circle at 35% 30%, #ef7a74, #c04440 70%)",
    center: "radial-gradient(circle at 35% 30%, #f79b96, #d05a55 75%)",
    label: "#ffd9d6", brand: "#f2a7a3",
  },
};
const CASE_KEYS = Object.keys(CASES);
const ACCENT = "#4da3ff";

/* ── Idiomas ── */
const LANGS = { es: "Español", en: "English", pt: "Português", fr: "Français", de: "Deutsch" };
const LANG_KEYS = Object.keys(LANGS);
const T = {
  es: {
    m_songs: "Canciones", m_artists: "Artistas", m_search: "Buscar / Agregar", m_lists: "Mis listas", m_now: "Reproduciendo", m_settings: "Configuración",
    songs: "Canciones", results: "Resultados", inLibrary: "En tu biblioteca", myLists: "Mis listas", settings: "Configuración", newList: "Nueva lista",
    emptyLib: 'Tu biblioteca está vacía. Andá a "Buscar / Agregar" y sumá tu primera canción 🎵',
    emptyList: "Lista vacía. Desde Canciones o Buscar, tocá ＋ para agregar temas acá.",
    noResults: "Sin resultados.",
    hintQuery: 'Nada local para "{q}". Buscá en YouTube con el botón, o pegá una URL.',
    hintEmpty: "Escribí para buscar en YouTube, filtrar tu biblioteca, o pegá una URL.",
    notPlaying1: "Nada sonando todavía.", notPlaying2: "Elegí una canción en tu biblioteca 🎧",
    addThis: "＋ Agregar esta canción", searchYt: "Buscar en YouTube", searching: "Buscando…",
    create: "Crear lista", cancel: "Cancelar", addNewList: "＋ Nueva lista", addTo: 'Agregar "{t}" a…',
    phSearch: "Buscar, o pegar URL de YouTube…", phList: "Nombre (ej: Para programar 💻)",
    queue: "en cola", shuffleBtn: "Aleatorio", repeatBtn: "Repetir", repeatAll: "Todo", repeatOne: "Una",
    s_case: "Carcasa", s_lang: "Idioma",
    t_case: "Carcasa: {n}", t_lang: "Idioma: Español",
    t_created: 'Lista "{n}" creada', t_added: 'Agregada a "{n}"', t_deleted: '"{n}" eliminada', t_addedSong: '"{t}…" agregada',
    t_inLib: "Ya está en tu biblioteca", t_badUrl: "URL de YouTube no válida", t_noNet: "No se pudo buscar (¿sin internet?)",
    t_pickSong: "Elegí una canción primero",
    addSongs: "＋ Agregar canciones", addingTo: 'Agregar a "{n}"',
    ctx_add: "Agregar a una lista", ctx_delete: "Eliminar de mi biblioteca",
    t_rep_off: "Repetir: apagado", t_rep_all: "Repetir: todo", t_rep_one: "Repetir: una canción",
    t_shuf_on: "Aleatorio: activado", t_shuf_off: "Aleatorio: apagado",
    e_embed: "Este video no permite reproducirse fuera de YouTube 😕", e_video: "No se pudo reproducir este video",
    cases: { plata: "Plata clásica", grafito: "Grafito", azul: "Azul medianoche", rojo: "Rojo" },
  },
  en: {
    m_songs: "Songs", m_artists: "Artists", m_search: "Search / Add", m_lists: "My playlists", m_now: "Now playing", m_settings: "Settings",
    songs: "Songs", results: "Results", inLibrary: "In your library", myLists: "My playlists", settings: "Settings", newList: "New playlist",
    emptyLib: 'Your library is empty. Go to "Search / Add" and add your first song 🎵',
    emptyList: "Empty playlist. From Songs or Search, tap ＋ to add tracks here.",
    noResults: "No results.",
    hintQuery: 'Nothing local for "{q}". Search YouTube with the button, or paste a URL.',
    hintEmpty: "Type to search YouTube, filter your library, or paste a URL.",
    notPlaying1: "Nothing playing yet.", notPlaying2: "Pick a song from your library 🎧",
    addThis: "＋ Add this song", searchYt: "Search YouTube", searching: "Searching…",
    create: "Create playlist", cancel: "Cancel", addNewList: "＋ New playlist", addTo: 'Add "{t}" to…',
    phSearch: "Search, or paste a YouTube URL…", phList: "Name (e.g. Coding vibes 💻)",
    queue: "in queue", shuffleBtn: "Shuffle", repeatBtn: "Repeat", repeatAll: "All", repeatOne: "One",
    s_case: "Case", s_lang: "Language",
    t_case: "Case: {n}", t_lang: "Language: English",
    t_created: 'Playlist "{n}" created', t_added: 'Added to "{n}"', t_deleted: '"{n}" removed', t_addedSong: '"{t}…" added',
    t_inLib: "Already in your library", t_badUrl: "Invalid YouTube URL", t_noNet: "Search failed (no internet?)",
    t_pickSong: "Pick a song first",
    addSongs: "＋ Add songs", addingTo: 'Add to "{n}"',
    ctx_add: "Add to a playlist", ctx_delete: "Remove from my library",
    t_rep_off: "Repeat: off", t_rep_all: "Repeat: all", t_rep_one: "Repeat: one song",
    t_shuf_on: "Shuffle: on", t_shuf_off: "Shuffle: off",
    e_embed: "This video can't be played outside YouTube 😕", e_video: "Couldn't play this video",
    cases: { plata: "Classic silver", grafito: "Graphite", azul: "Midnight blue", rojo: "Red" },
  },
  pt: {
    m_songs: "Músicas", m_artists: "Artistas", m_search: "Buscar / Adicionar", m_lists: "Minhas listas", m_now: "Tocando agora", m_settings: "Configurações",
    songs: "Músicas", results: "Resultados", inLibrary: "Na sua biblioteca", myLists: "Minhas listas", settings: "Configurações", newList: "Nova lista",
    emptyLib: 'Sua biblioteca está vazia. Vá em "Buscar / Adicionar" e adicione sua primeira música 🎵',
    emptyList: "Lista vazia. Em Músicas ou Buscar, toque ＋ para adicionar faixas aqui.",
    noResults: "Sem resultados.",
    hintQuery: 'Nada local para "{q}". Busque no YouTube com o botão, ou cole uma URL.',
    hintEmpty: "Digite para buscar no YouTube, filtrar sua biblioteca, ou cole uma URL.",
    notPlaying1: "Nada tocando ainda.", notPlaying2: "Escolha uma música da sua biblioteca 🎧",
    addThis: "＋ Adicionar esta música", searchYt: "Buscar no YouTube", searching: "Buscando…",
    create: "Criar lista", cancel: "Cancelar", addNewList: "＋ Nova lista", addTo: 'Adicionar "{t}" a…',
    phSearch: "Buscar, ou colar URL do YouTube…", phList: "Nome (ex: Para focar 💻)",
    queue: "na fila", shuffleBtn: "Aleatório", repeatBtn: "Repetir", repeatAll: "Tudo", repeatOne: "Uma",
    s_case: "Carcaça", s_lang: "Idioma",
    t_case: "Carcaça: {n}", t_lang: "Idioma: Português",
    t_created: 'Lista "{n}" criada', t_added: 'Adicionada a "{n}"', t_deleted: '"{n}" removida', t_addedSong: '"{t}…" adicionada',
    t_inLib: "Já está na sua biblioteca", t_badUrl: "URL do YouTube inválida", t_noNet: "Não foi possível buscar (sem internet?)",
    t_pickSong: "Escolha uma música primeiro",
    addSongs: "＋ Adicionar músicas", addingTo: 'Adicionar a "{n}"',
    ctx_add: "Adicionar a uma lista", ctx_delete: "Remover da minha biblioteca",
    t_rep_off: "Repetir: desligado", t_rep_all: "Repetir: tudo", t_rep_one: "Repetir: uma música",
    t_shuf_on: "Aleatório: ligado", t_shuf_off: "Aleatório: desligado",
    e_embed: "Este vídeo não pode ser tocado fora do YouTube 😕", e_video: "Não foi possível tocar este vídeo",
    cases: { plata: "Prata clássica", grafito: "Grafite", azul: "Azul meia-noite", rojo: "Vermelho" },
  },
  fr: {
    m_songs: "Titres", m_artists: "Artistes", m_search: "Rechercher / Ajouter", m_lists: "Mes playlists", m_now: "En lecture", m_settings: "Réglages",
    songs: "Titres", results: "Résultats", inLibrary: "Dans votre bibliothèque", myLists: "Mes playlists", settings: "Réglages", newList: "Nouvelle playlist",
    emptyLib: 'Votre bibliothèque est vide. Allez dans "Rechercher / Ajouter" pour votre premier titre 🎵',
    emptyList: "Playlist vide. Depuis Titres ou Rechercher, touchez ＋ pour ajouter des morceaux.",
    noResults: "Aucun résultat.",
    hintQuery: 'Rien en local pour "{q}". Cherchez sur YouTube avec le bouton, ou collez une URL.',
    hintEmpty: "Tapez pour chercher sur YouTube, filtrer votre bibliothèque, ou collez une URL.",
    notPlaying1: "Rien en lecture.", notPlaying2: "Choisissez un titre de votre bibliothèque 🎧",
    addThis: "＋ Ajouter ce titre", searchYt: "Chercher sur YouTube", searching: "Recherche…",
    create: "Créer la playlist", cancel: "Annuler", addNewList: "＋ Nouvelle playlist", addTo: 'Ajouter "{t}" à…',
    phSearch: "Chercher, ou coller une URL YouTube…", phList: "Nom (ex: Pour bosser 💻)",
    queue: "en file", shuffleBtn: "Aléatoire", repeatBtn: "Répéter", repeatAll: "Tout", repeatOne: "Un",
    s_case: "Coque", s_lang: "Langue",
    t_case: "Coque : {n}", t_lang: "Langue : Français",
    t_created: 'Playlist "{n}" créée', t_added: 'Ajouté à "{n}"', t_deleted: '"{n}" supprimé', t_addedSong: '"{t}…" ajouté',
    t_inLib: "Déjà dans votre bibliothèque", t_badUrl: "URL YouTube invalide", t_noNet: "Recherche impossible (pas d'internet ?)",
    t_pickSong: "Choisissez d'abord un titre",
    addSongs: "＋ Ajouter des titres", addingTo: 'Ajouter à "{n}"',
    ctx_add: "Ajouter à une playlist", ctx_delete: "Supprimer de ma bibliothèque",
    t_rep_off: "Répéter : désactivé", t_rep_all: "Répéter : tout", t_rep_one: "Répéter : un titre",
    t_shuf_on: "Aléatoire : activé", t_shuf_off: "Aléatoire : désactivé",
    e_embed: "Cette vidéo ne peut pas être lue hors de YouTube 😕", e_video: "Impossible de lire cette vidéo",
    cases: { plata: "Argent classique", grafito: "Graphite", azul: "Bleu nuit", rojo: "Rouge" },
  },
  de: {
    m_songs: "Songs", m_artists: "Künstler", m_search: "Suchen / Hinzufügen", m_lists: "Meine Playlists", m_now: "Läuft gerade", m_settings: "Einstellungen",
    songs: "Songs", results: "Ergebnisse", inLibrary: "In deiner Bibliothek", myLists: "Meine Playlists", settings: "Einstellungen", newList: "Neue Playlist",
    emptyLib: 'Deine Bibliothek ist leer. Geh zu "Suchen / Hinzufügen" für deinen ersten Song 🎵',
    emptyList: "Leere Playlist. Über Songs oder Suchen mit ＋ Titel hinzufügen.",
    noResults: "Keine Ergebnisse.",
    hintQuery: 'Nichts Lokales für "{q}". Such mit dem Button auf YouTube oder füge eine URL ein.',
    hintEmpty: "Tippe, um YouTube zu durchsuchen, deine Bibliothek zu filtern, oder füge eine URL ein.",
    notPlaying1: "Noch nichts läuft.", notPlaying2: "Wähl einen Song aus deiner Bibliothek 🎧",
    addThis: "＋ Diesen Song hinzufügen", searchYt: "Auf YouTube suchen", searching: "Suche…",
    create: "Playlist erstellen", cancel: "Abbrechen", addNewList: "＋ Neue Playlist", addTo: '"{t}" hinzufügen zu…',
    phSearch: "Suchen oder YouTube-URL einfügen…", phList: "Name (z. B. Zum Arbeiten 💻)",
    queue: "in Warteschlange", shuffleBtn: "Zufall", repeatBtn: "Wiederholen", repeatAll: "Alle", repeatOne: "Ein",
    s_case: "Gehäuse", s_lang: "Sprache",
    t_case: "Gehäuse: {n}", t_lang: "Sprache: Deutsch",
    t_created: 'Playlist "{n}" erstellt', t_added: 'Zu "{n}" hinzugefügt', t_deleted: '"{n}" entfernt', t_addedSong: '"{t}…" hinzugefügt',
    t_inLib: "Schon in deiner Bibliothek", t_badUrl: "Ungültige YouTube-URL", t_noNet: "Suche fehlgeschlagen (kein Internet?)",
    t_pickSong: "Wähl zuerst einen Song",
    addSongs: "＋ Songs hinzufügen", addingTo: 'Zu "{n}" hinzufügen',
    ctx_add: "Zu einer Playlist hinzufügen", ctx_delete: "Aus meiner Bibliothek entfernen",
    t_rep_off: "Wiederholen: aus", t_rep_all: "Wiederholen: alle", t_rep_one: "Wiederholen: ein Song",
    t_shuf_on: "Zufall: an", t_shuf_off: "Zufall: aus",
    e_embed: "Dieses Video kann außerhalb von YouTube nicht abgespielt werden 😕", e_video: "Video konnte nicht abgespielt werden",
    cases: { plata: "Klassisches Silber", grafito: "Graphit", azul: "Mitternachtsblau", rojo: "Rot" },
  },
};

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const norm = (t) => (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const sortAlpha = (arr) => [...arr].sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base", numeric: true }));
// Letra de sección al estilo iPod: A-Z, o "#" para números y símbolos
const letterOf = (txt) => {
  const c = norm(txt).replace(/[^a-z0-9]/g, "").charAt(0);
  if (!c) return "#";
  return /[0-9]/.test(c) ? "#" : c.toUpperCase();
};
const decodeHtml = (t) => { const d = document.createElement("textarea"); d.innerHTML = t; return d.value; };
const extractVideoId = (url) => {
  const m = (url || "").match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
};

/* Íconos SVG monocromos (heredan el color con currentColor) */
const Ic = ({ d, size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: "block", ...style }}>
    <path d={d} />
  </svg>
);
const P = {
  play: "M8 5v14l11-7z",
  pause: "M6 5h4v14H6zM14 5h4v14h-4z",
  prev: "M6 6h2v12H6zm3.5 6l8.5 6V6z",
  next: "M16 6h2v12h-2zM6 18l8.5-6L6 6z",
  playPause: "M3 5v14l8-7zM13 5h3v14h-3zM18 5h3v14h-3z",
  shuffle: "M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z",
  repeat: "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z",
  repeatOne: "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z",
  volHigh: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z",
  volLow: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z",
  volMute: "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z",
};

/* Texto que se desliza en loop continuo cuando no entra en pantalla */
function Marquee({ text, style }) {
  const outerRef = useRef(null);
  const [over, setOver] = useState(false);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const span = el.querySelector("span");
    if (!span) return;
    setOver(span.scrollWidth > el.clientWidth + 2);
    setW(span.scrollWidth);
  }, [text]);
  if (!over) {
    return (
      <div ref={outerRef} style={{ ...style, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        <span>{text}</span>
      </div>
    );
  }
  const dur = Math.max((w + 30) / 25, 6); // velocidad constante según el largo
  return (
    <div ref={outerRef} style={{ ...style, overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ display: "inline-flex", width: "max-content", animation: `dp-marquee ${dur}s linear infinite` }}>
        <span style={{ paddingRight: 30 }}>{text}</span>
        <span style={{ paddingRight: 30 }}>{text}</span>
      </div>
    </div>
  );
}

export default function App() {
  // ── Estado de navegación / UI ──
  const [screen, setScreen] = useState("menu"); // menu, songs, search, lists, listDetail, settings, now, newList
  const [idx, setIdx] = useState(0);
  const [caseKey, setCaseKey] = useState("plata");
  const [lang, setLang] = useState("es");
  const [toast, setToast] = useState("");

  // ── Biblioteca y listas (persistidas) ──
  const [library, setLibrary] = useState([]); // {id, videoId, title, artist, cover}
  const [playlists, setPlaylists] = useState([{ name: "Favoritas ⭐", songIds: [] }]);
  const [loaded, setLoaded] = useState(false);

  const [openList, setOpenList] = useState(0);
  const [newName, setNewName] = useState("");
  const [query, setQuery] = useState("");
  const [webResults, setWebResults] = useState(null); // resultados de la búsqueda en YouTube
  const [searching, setSearching] = useState(false);
  const [addTarget, setAddTarget] = useState(null);
  const [pickMode, setPickMode] = useState(null); // índice de playlist a la que estamos sumando canciones, o null
  const [ctxMenu, setCtxMenu] = useState(null); // id de canción con el menú contextual (mantener apretado) abierto

  // ── Reproducción ──
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dur, setDur] = useState(0);
  const [volume, setVolume] = useState(80);
  const [volFlash, setVolFlash] = useState(false);
  const volFlashT = useRef(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // off | all | one

  const playerRef = useRef(null);
  const [ytReady, setYtReady] = useState(false);
  const wheelRef = useRef(null);
  const lastAngle = useRef(null);
  const accum = useRef(0);

  const cs = CASES[caseKey];
  const songOf = (id) => library.find((s) => s.id === id);
  const song = songOf(queue[current]);

  const showToast = (t) => { setToast(t); setTimeout(() => setToast(""), 1800); };

  /* ── Persistencia ── */
  useEffect(() => {
    (async () => {
      const data = await window.deskpod?.load();
      if (data) {
        if (data.library) setLibrary(data.library);
        if (data.playlists) setPlaylists(data.playlists);
        if (data.caseKey && CASES[data.caseKey]) setCaseKey(data.caseKey);
        if (data.lang && T[data.lang]) setLang(data.lang);
        if (typeof data.volume === "number") setVolume(data.volume);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.deskpod?.save({ library, playlists, caseKey, lang, volume });
  }, [library, playlists, caseKey, lang, volume, loaded]);

  // Traducción: t("clave") o t("clave", {q: "valor"}) para interpolar
  const t = (k, vars) => {
    let s = T[lang]?.[k] ?? T.es[k] ?? k;
    if (vars) for (const key in vars) s = s.replace(`{${key}}`, vars[key]);
    return s;
  };
  const caseName = (key) => T[lang]?.cases?.[key] ?? CASES[key].name;

  // Aplicar el volumen al reproductor
  useEffect(() => {
    if (ytReady) playerRef.current?.setVolume?.(volume);
  }, [volume, ytReady]);


  /* ── YouTube IFrame API ── */
  const advanceRef = useRef(() => {});
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        height: "1", width: "1",
        playerVars: { controls: 0, disablekb: 1 },
        events: {
          onReady: () => setYtReady(true),
          onError: (e) => {
            const code = e.data;
            const msg = (code === 101 || code === 150) ? t("e_embed") : t("e_video");
            showToast(msg);
            setPlaying(false);
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) advanceRef.current(true);
            if (e.data === window.YT.PlayerState.PLAYING) {
              const d = playerRef.current?.getDuration?.();
              if (d) setDur(d);
            }
          },
        },
      });
    };
  }, []);

  // Cargar el video cuando cambia la canción actual
  useEffect(() => {
    const s = songOf(queue[current]);
    if (ytReady && s?.videoId) {
      playerRef.current.loadVideoById(s.videoId);
      if (!playing) playerRef.current.pauseVideo();
      setProgress(0);
    }
  }, [current, queue, ytReady]); // eslint-disable-line

  // Progreso real de YouTube cada medio segundo
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (p?.getCurrentTime) {
        setProgress(p.getCurrentTime() || 0);
        const d = p.getDuration?.();
        if (d) setDur(d);
      }
    }, 500);
    return () => clearInterval(id);
  }, [playing]);

  /* ── Avanzar (respeta shuffle/repeat) ── */
  const advance = useCallback((auto = false, dir = 1) => {
    setProgress(0);
    if (auto && repeat === "one") { playerRef.current?.seekTo(0, true); playerRef.current?.playVideo(); return; }
    if (queue.length === 0) return;
    if (shuffle && queue.length > 1) {
      setCurrent((c) => { let r; do { r = Math.floor(Math.random() * queue.length); } while (r === c); return r; });
      return;
    }
    setCurrent((c) => {
      const n = c + dir;
      if (n >= queue.length) {
        if (auto && repeat === "off") { setPlaying(false); playerRef.current?.pauseVideo?.(); return c; }
        return 0;
      }
      if (n < 0) return queue.length - 1;
      return n;
    });
  }, [repeat, shuffle, queue.length]);
  useEffect(() => { advanceRef.current = advance; }, [advance]);

  const playFrom = (ids, at) => {
    if (!ids.length) return;
    setQueue(ids); setCurrent(at); setPlaying(true); setScreen("now");
    setTimeout(() => playerRef.current?.playVideo?.(), 300);
  };

  const togglePlay = () => {
    if (!song) { showToast(t("t_pickSong")); return; }
    setPlaying((p) => {
      p ? playerRef.current?.pauseVideo?.() : playerRef.current?.playVideo?.();
      return !p;
    });
  };

  const prev = () => {
    if (progress > 3) { playerRef.current?.seekTo(0, true); setProgress(0); }
    else advance(false, -1);
  };

  /* ── Agregar canciones ── */
  const addByUrl = async (url) => {
    const videoId = extractVideoId(url);
    if (!videoId) { showToast(t("t_badUrl")); return; }
    if (library.some((s) => s.videoId === videoId)) { showToast(t("t_inLib")); return; }
    let title = "Canción de YouTube", artist = "";
    try {
      const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (r.ok) { const j = await r.json(); title = j.title; artist = j.author_name; }
    } catch { /* sin conexión: se guarda igual con datos mínimos */ }
    const s = { id: Date.now(), source: "youtube", videoId, title, artist, cover: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` };
    setLibrary((l) => [...l, s]);
    showToast(t("t_addedSong", { t: title.slice(0, 24) }));
    setQuery("");
  };

  const searchYouTube = async () => {
    if (!query.trim()) return;
    setSearching(true); setWebResults(null);
    const j = await window.deskpod?.ytSearch(query);
    setSearching(false);
    if (!j || j.error) { showToast(t("t_noNet")); return; }
    setWebResults(j.results || []);
    setIdx(0);
  };

  const addWebResult = (r) => {
    let existing = library.find((s) => s.videoId === r.videoId);
    if (!existing) {
      existing = { id: Date.now(), videoId: r.videoId, title: r.title, artist: r.artist, cover: r.cover };
      setLibrary((l) => [...l, existing]);
    }
    return existing;
  };

  // Eliminar una canción de la biblioteca (y de listas y cola)
  const deleteSong = (id) => {
    const name = songOf(id)?.title || "";
    if (queue[current] === id) {
      setPlaying(false);
      playerRef.current?.stopVideo?.();
      setProgress(0);
    }
    setPlaylists((p) => p.map((pl) => ({ ...pl, songIds: pl.songIds.filter((x) => x !== id) })));
    setQueue((q) => {
      const nq = q.filter((x) => x !== id);
      setCurrent((c) => Math.min(c, Math.max(nq.length - 1, 0)));
      return nq;
    });
    setLibrary((l) => l.filter((s) => s.id !== id));
    showToast(t("t_deleted", { n: name.slice(0, 22) }));
  };

  /* ── Listas ── */
  const sortedLibrary = sortAlpha(library);
  // Biblioteca ordenada por artista y, dentro de cada artista, por título
  const artistsFlat = [...library].sort((a, b) =>
    (a.artist || "").localeCompare(b.artist || "", undefined, { sensitivity: "base" }) ||
    (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base", numeric: true })
  );
  const listSongs = sortAlpha((playlists[openList]?.songIds || []).map(songOf).filter(Boolean));
  const createList = () => {
    const name = newName.trim();
    if (!name) return;
    const newIndex = playlists.length;
    setPlaylists((p) => [...p, { name, songIds: [] }]);
    showToast(t("t_created", { n: name }));
    setOpenList(newIndex);
    setPickMode(newIndex);
    go("songs");
  };
  const toggleInList = (li, songId) => {
    setPlaylists((p) => p.map((pl, i) => {
      if (i !== li) return pl;
      const has = pl.songIds.includes(songId);
      return { ...pl, songIds: has ? pl.songIds.filter((x) => x !== songId) : [...pl.songIds, songId] };
    }));
  };
  const addSongTo = (li) => {
    setPlaylists((p) => p.map((pl, i) =>
      i === li && !pl.songIds.includes(addTarget) ? { ...pl, songIds: [...pl.songIds, addTarget] } : pl
    ));
    showToast(t("t_added", { n: playlists[li].name }));
    setAddTarget(null);
  };
  const removeFromList = (songId) => {
    setPlaylists((p) => p.map((pl, i) =>
      i === openList ? { ...pl, songIds: pl.songIds.filter((id) => id !== songId) } : pl
    ));
  };

  /* ── Navegación ── */
  const localResults = sortAlpha(query.trim() ? library.filter((s) => norm(s.title + " " + s.artist).includes(norm(query))) : library);

  const MENU = [t("m_songs"), t("m_artists"), t("m_search"), t("m_lists"), t("m_now"), t("m_settings")];
  const SETTINGS = [
    { label: t("s_case"), value: caseName(caseKey) },
    { label: t("s_lang"), value: LANGS[lang] },
  ];

  const itemCount = () =>
    screen === "menu" ? MENU.length
    : screen === "songs" ? library.length
    : screen === "artists" ? artistsFlat.length
    : screen === "search" ? (webResults ? webResults.length : localResults.length)
    : screen === "lists" ? playlists.length + 1
    : screen === "listDetail" ? Math.max(listSongs.length, 1)
    : screen === "settings" ? SETTINGS.length
    : 0;

  const go = (s) => { setScreen(s); setIdx(0); };

  const select = () => {
    if (addTarget !== null) return;
    if (screen === "menu") {
      go(["songs", "artists", "search", "lists", "now", "settings"][idx]);
      if (idx === 2) { setQuery(""); setWebResults(null); }
    } else if (screen === "songs") {
      if (pickMode !== null) {
        const s = sortedLibrary[idx];
        if (s) toggleInList(pickMode, s.id);
      } else if (sortedLibrary.length) playFrom(sortedLibrary.map((s) => s.id), idx);
    } else if (screen === "artists") {
      if (artistsFlat.length) playFrom(artistsFlat.map((s) => s.id), idx);
    } else if (screen === "search") {
      if (webResults) {
        if (!webResults.length) return;
        const s = addWebResult(webResults[idx]);
        playFrom([s.id], 0);
      } else if (localResults.length) {
        playFrom(localResults.map((s) => s.id), idx);
      }
    } else if (screen === "lists") {
      if (idx === playlists.length) { setNewName(""); go("newList"); }
      else { setOpenList(idx); go("listDetail"); }
    } else if (screen === "listDetail") {
      if (listSongs.length) playFrom(listSongs.map((s) => s.id), idx);
    } else if (screen === "settings") {
      if (idx === 0) {
        const next = CASE_KEYS[(CASE_KEYS.indexOf(caseKey) + 1) % CASE_KEYS.length];
        setCaseKey(next); showToast(t("t_case", { n: T[lang]?.cases?.[next] ?? CASES[next].name }));
      } else if (idx === 1) {
        const next = LANG_KEYS[(LANG_KEYS.indexOf(lang) + 1) % LANG_KEYS.length];
        setLang(next); showToast(T[next].t_lang);
      }
    }
  };

  const back = () => {
    if (ctxMenu !== null) { setCtxMenu(null); return; }
    if (addTarget !== null) { setAddTarget(null); return; }
    if (screen === "songs" && pickMode !== null) { setPickMode(null); go("listDetail"); return; }
    const map = { songs: "menu", artists: "menu", search: "menu", lists: "menu", settings: "menu", listDetail: "lists", newList: "lists", now: "menu" };
    go(map[screen] || "menu");
  };

  /* ── Clickwheel ── */
  const step = useCallback((dir) => {
    if (screen === "now") {
      // Gesto clásico del iPod: girar la rueda en "Reproduciendo" ajusta el volumen
      setVolume((v) => Math.min(Math.max(v + dir * 4, 0), 100));
      setVolFlash(true);
      clearTimeout(volFlashT.current);
      volFlashT.current = setTimeout(() => setVolFlash(false), 900);
      return;
    }
    const n = itemCount();
    if (n > 0) setIdx((i) => Math.min(Math.max(i + dir, 0), n - 1));
  }, [screen, progress, dur, library.length, playlists.length, listSongs.length, localResults.length, webResults]);

  const angleOf = (e) => {
    const r = wheelRef.current.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
  };
  const onPointerDown = (e) => {
    if (e.target.closest("button")) return; // los botones de la rueda manejan su propio clic
    lastAngle.current = angleOf(e); accum.current = 0; wheelRef.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (lastAngle.current === null) return;
    const a = angleOf(e);
    let d = a - lastAngle.current;
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    lastAngle.current = a; accum.current += d;
    const t = 0.45;
    while (accum.current > t) { step(1); accum.current -= t; }
    while (accum.current < -t) { step(-1); accum.current += t; }
  };
  const onPointerUp = () => { lastAngle.current = null; };

  /* ── Barras arrastrables (progreso y volumen) ── */
  const progBarRef = useRef(null);
  const volBarRef = useRef(null);
  const dragBar = useRef(null); // "seek" | "vol"
  const barFraction = (ref, e) => {
    const r = ref.current.getBoundingClientRect();
    return Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
  };
  const seekFromEvent = (e) => {
    if (!dur) return;
    const t = barFraction(progBarRef, e) * dur;
    playerRef.current?.seekTo?.(t, true);
    setProgress(t);
  };
  const volFromEvent = (e) => setVolume(Math.round(barFraction(volBarRef, e) * 100));
  const barDown = (kind, e) => {
    dragBar.current = kind;
    e.currentTarget.setPointerCapture(e.pointerId);
    kind === "seek" ? seekFromEvent(e) : volFromEvent(e);
  };
  const barMove = (e) => {
    if (!dragBar.current) return;
    dragBar.current === "seek" ? seekFromEvent(e) : volFromEvent(e);
  };
  const barUp = () => { dragBar.current = null; };

  const cycleRepeat = () => {
    const next = { off: "all", all: "one", one: "off" }[repeat];
    setRepeat(next);
    showToast(next === "off" ? t("t_rep_off") : next === "all" ? t("t_rep_all") : t("t_rep_one"));
  };
  const toggleShuffle = () => setShuffle((s) => { showToast(!s ? t("t_shuf_on") : t("t_shuf_off")); return !s; });

  /* ── Mantener apretado una canción de "Canciones" para editarla ── */
  const holdTimer = useRef(null);
  const holdFiredRef = useRef(false);
  const makeHold = (getId) => ({
    start: (i) => {
      holdFiredRef.current = false;
      clearTimeout(holdTimer.current);
      holdTimer.current = setTimeout(() => {
        holdFiredRef.current = true;
        const id = getId(i);
        if (id != null) setCtxMenu(id);
      }, 480);
    },
    cancel: () => clearTimeout(holdTimer.current),
    consumeHold: () => {
      if (holdFiredRef.current) { holdFiredRef.current = false; return true; }
      return false;
    },
  });
  const libHold = makeHold((i) => sortedLibrary[i]?.id);
  const artistHold = makeHold((i) => artistsFlat[i]?.id);

  /* ── Componentes UI ── */
  const Row = ({ i, children, right, onPlus, onRemove, onTap, holdHandlers }) => (
    <div
      ref={i === idx ? (el) => el?.scrollIntoView({ block: "nearest" }) : undefined}
      onClick={() => {
        if (holdHandlers?.consumeHold?.()) return;
        onTap ? onTap(i) : setIdx(i);
      }}
      onDoubleClick={select}
      onPointerDown={holdHandlers ? () => holdHandlers.start(i) : undefined}
      onPointerUp={holdHandlers ? holdHandlers.cancel : undefined}
      onPointerLeave={holdHandlers ? holdHandlers.cancel : undefined}
      onPointerMove={holdHandlers ? holdHandlers.cancel : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
        margin: "2px 8px", borderRadius: 9, cursor: "pointer",
        background: i === idx ? "rgba(77,163,255,.18)" : "transparent",
        border: i === idx ? `1px solid ${ACCENT}55` : "1px solid transparent",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      {right && <span style={{ fontSize: 10, color: "#8b93a1", flexShrink: 0 }}>{right}</span>}
      {onPlus && (
        <button onClick={(e) => { e.stopPropagation(); onPlus(); }} title="Agregar a lista"
          style={{ width: 22, height: 22, borderRadius: 11, border: `1px solid ${ACCENT}77`, background: "transparent", color: ACCENT, cursor: "pointer", fontSize: 13, lineHeight: 1, flexShrink: 0 }}>+</button>
      )}
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Quitar de la lista"
          style={{ width: 22, height: 22, borderRadius: 11, border: "1px solid #55404a", background: "transparent", color: "#c76a7a", cursor: "pointer", fontSize: 12, lineHeight: 1, flexShrink: 0 }}>−</button>
      )}
      {i === idx && !onPlus && !onRemove && <span style={{ color: ACCENT, flexShrink: 0 }}>›</span>}
    </div>
  );

  const SongInfo = ({ s }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      {s.cover
        ? <img src={s.cover} alt="" style={{ width: 30, height: 30, borderRadius: 5, objectFit: "cover", flexShrink: 0 }} />
        : <div style={{ width: 30, height: 30, borderRadius: 5, background: "#262a33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>♪</div>}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
        <div style={{ fontSize: 10, color: "#8b93a1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.artist}</div>
      </div>
    </div>
  );

  const Title = ({ children }) => (
    <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#7c8494", textTransform: "uppercase" }}>{children}</div>
  );

  // Separador de sección al estilo iPod (letra o artista), pegado arriba al scrollear
  const Section = ({ children }) => (
    <div style={{
      position: "sticky", top: 0, zIndex: 2, padding: "3px 14px",
      fontSize: 10.5, fontWeight: 800, letterSpacing: 1, color: "#9aa3b2",
      background: "#171a21", borderBottom: "1px solid #1e222b",
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    }}>{children}</div>
  );

  const ModeBtn = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 12,
      border: `1px solid ${active ? ACCENT : "#333945"}`, cursor: "pointer",
      background: active ? "rgba(77,163,255,.15)" : "transparent",
      color: active ? ACCENT : "#8b93a1", fontSize: 11, fontWeight: 700,
    }}>{children}</button>
  );

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 9,
    border: `1px solid ${ACCENT}55`, background: "#1b1e26", color: "#e8ecf2", fontSize: 12, outline: "none",
  };
  const btnLabel = { position: "absolute", color: cs.label, fontSize: 11, fontWeight: 700, letterSpacing: 1, userSelect: "none", pointerEvents: "none" };
  const noDrag = { WebkitAppRegion: "no-drag" };

  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center",
      fontFamily: "'Segoe UI','Helvetica Neue',sans-serif", background: "transparent",
    }}>
      {/* Animación del texto deslizante */}
      <style>{`@keyframes dp-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>

      {/* Reproductor de YouTube oculto (el audio sale de acá) */}
      <div style={{ position: "fixed", left: -9999, top: -9999 }}><div id="yt-player" /></div>

      {/* ── Carcasa (= la ventana) ── */}
      <div style={{
        width: 300, borderRadius: 26, padding: "8px 18px 22px", marginTop: 4,
        background: cs.body, boxShadow: cs.bodyShadow, transition: "background .4s",
        boxSizing: "border-box",
      }}>
        {/* Barra de arrastre + controles de ventana */}
        <div style={{ WebkitAppRegion: "drag", display: "flex", justifyContent: "flex-end", gap: 8, padding: "4px 2px 8px" }}>
          <button onClick={() => window.deskpod?.minimize()} title="Minimizar" style={{ ...noDrag, width: 13, height: 13, borderRadius: "50%", border: "none", cursor: "pointer", background: "#f0b429" }} />
          <button onClick={() => window.deskpod?.close()} title="Cerrar" style={{ ...noDrag, width: 13, height: 13, borderRadius: "50%", border: "none", cursor: "pointer", background: "#e2544a" }} />
        </div>

        {/* ── Pantalla ── */}
        <div style={{
          borderRadius: 14, height: 268, overflow: "hidden", position: "relative",
          background: "linear-gradient(180deg, #14161c 0%, #0e1015 100%)",
          border: "3px solid #000", boxShadow: "inset 0 3px 12px rgba(0,0,0,.8)",
          display: "flex", flexDirection: "column", color: "#e8ecf2",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px 4px", fontSize: 10, color: "#7c8494" }}>
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Ic d={playing ? P.play : P.pause} size={10} />
              {shuffle && <span style={{ color: ACCENT }}><Ic d={P.shuffle} size={10} /></span>}
              {repeat !== "off" && <span style={{ color: ACCENT }}><Ic d={repeat === "one" ? P.repeatOne : P.repeat} size={10} /></span>}
            </span>
            <span>Deskpod</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {screen === "menu" && (<>
              <Title>Deskpod</Title>
              {MENU.map((m, i) => <Row key={m} i={i}><span style={{ fontSize: 13, fontWeight: 600 }}>{m}</span></Row>)}
            </>)}

            {screen === "songs" && (<>
              <Title>{pickMode !== null ? t("addingTo", { n: playlists[pickMode]?.name }) : `${t("songs")} · ${sortedLibrary.length}`}</Title>
              {sortedLibrary.length === 0 && (
                <div style={{ padding: "16px", fontSize: 11.5, color: "#8b93a1", lineHeight: 1.5 }}>
                  {t("emptyLib")}
                </div>
              )}
              {sortedLibrary.map((s, i) => {
                const inList = pickMode !== null && playlists[pickMode]?.songIds.includes(s.id);
                const letter = letterOf(s.title);
                const newSection = i === 0 || letter !== letterOf(sortedLibrary[i - 1].title);
                return (
                  <Fragment key={s.id}>
                    {newSection && <Section>{letter}</Section>}
                    <Row i={i}
                      holdHandlers={pickMode === null ? libHold : undefined}
                      onTap={pickMode !== null ? (ii) => { setIdx(ii); toggleInList(pickMode, sortedLibrary[ii].id); } : undefined}
                      right={pickMode !== null ? (inList ? "✓" : "") : undefined}>
                      <SongInfo s={s} />
                    </Row>
                  </Fragment>
                );
              })}
            </>)}

            {screen === "artists" && (<>
              <Title>{t("m_artists")} · {new Set(artistsFlat.map((s) => norm(s.artist))).size}</Title>
              {artistsFlat.length === 0 && (
                <div style={{ padding: "16px", fontSize: 11.5, color: "#8b93a1", lineHeight: 1.5 }}>
                  {t("emptyLib")}
                </div>
              )}
              {artistsFlat.map((s, i) => {
                const newSection = i === 0 || norm(s.artist) !== norm(artistsFlat[i - 1].artist);
                return (
                  <Fragment key={s.id}>
                    {newSection && <Section>{s.artist || "?"}</Section>}
                    <Row i={i} holdHandlers={artistHold}>
                      <SongInfo s={s} />
                    </Row>
                  </Fragment>
                );
              })}
            </>)}

            {screen === "search" && (<>
              <div style={{ padding: "8px 12px 4px", display: "flex", gap: 6 }}>
                <input
                  autoFocus value={query}
                  onChange={(e) => { setQuery(e.target.value); setIdx(0); setWebResults(null); }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    extractVideoId(query) ? addByUrl(query) : searchYouTube();
                  }}
                  placeholder={t("phSearch")}
                  style={inputStyle}
                />
              </div>
              <div style={{ padding: "0 12px 6px", display: "flex", gap: 6 }}>
                {extractVideoId(query) ? (
                  <button onClick={() => addByUrl(query)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11, color: "#0e1015", background: ACCENT }}>
                    {t("addThis")}
                  </button>
                ) : (
                  <button onClick={searchYouTube} disabled={searching} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${ACCENT}66`, cursor: "pointer", fontWeight: 700, fontSize: 11, color: ACCENT, background: "transparent" }}>
                    {searching ? t("searching") : t("searchYt")}
                  </button>
                )}
              </div>

              {webResults && (<>
                <Title>{t("results")}</Title>
                {webResults.length === 0 && <div style={{ padding: "8px 16px", fontSize: 11, color: "#8b93a1" }}>{t("noResults")}</div>}
                {webResults.map((r, i) => (
                  <Row key={r.videoId} i={i} right={r.durText} onPlus={() => { const s = addWebResult(r); setAddTarget(s.id); }}>
                    <SongInfo s={r} />
                  </Row>
                ))}
              </>)}

              {!webResults && (<>
                <Title>{t("inLibrary")}</Title>
                {localResults.length === 0 && (
                  <div style={{ padding: "8px 16px", fontSize: 11, color: "#8b93a1", lineHeight: 1.5 }}>
                    {query ? t("hintQuery", { q: query }) : t("hintEmpty")}
                  </div>
                )}
                {localResults.map((s, i) => <Row key={s.id} i={i} onPlus={() => setAddTarget(s.id)}><SongInfo s={s} /></Row>)}
              </>)}
            </>)}

            {screen === "lists" && (<>
              <Title>{t("myLists")}</Title>
              {playlists.map((p, i) => (
                <Row key={p.name + i} i={i} right={`${p.songIds.length}`}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name}</span>
                </Row>
              ))}
              <Row i={playlists.length}><span style={{ fontSize: 12.5, color: ACCENT, fontWeight: 600 }}>{t("addNewList")}</span></Row>
            </>)}

            {screen === "listDetail" && (<>
              <Title>{playlists[openList]?.name}</Title>
              <div style={{ padding: "0 12px 6px" }}>
                <button onClick={() => { setPickMode(openList); go("songs"); }}
                  style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: `1px solid ${ACCENT}66`, cursor: "pointer", fontWeight: 700, fontSize: 11, color: ACCENT, background: "transparent" }}>
                  {t("addSongs")}
                </button>
              </div>
              {listSongs.length === 0 && (
                <div style={{ padding: "0 16px 16px", fontSize: 11.5, color: "#8b93a1", lineHeight: 1.5 }}>
                  {t("emptyList")}
                </div>
              )}
              {listSongs.map((s, i) => <Row key={s.id} i={i} onRemove={() => removeFromList(s.id)}><SongInfo s={s} /></Row>)}
            </>)}

            {screen === "settings" && (<>
              <Title>{t("settings")}</Title>
              {SETTINGS.map((s, i) => (
                <Row key={s.label} i={i} right={s.value}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{s.label}</span>
                </Row>
              ))}
            </>)}

            {screen === "newList" && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, padding: "0 18px" }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{t("newList")}</div>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createList()}
                  placeholder={t("phList")} style={inputStyle} />
                <button onClick={createList}
                  style={{ padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, color: "#0e1015", background: ACCENT }}>
                  {t("create")}
                </button>
              </div>
            )}

            {screen === "now" && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "4px 16px 10px", boxSizing: "border-box" }}>
                {!song ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, color: "#8b93a1", textAlign: "center", lineHeight: 1.5 }}>
                    {t("notPlaying1")}<br />{t("notPlaying2")}
                  </div>
                ) : (<>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minHeight: 0 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 12, flexShrink: 0, overflow: "hidden", background: "#1a1d25", boxShadow: "0 4px 18px rgba(77,163,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                      {song.cover
                        ? <img src={song.cover} alt={`Portada de ${song.title}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : "♪"}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Marquee text={song.title} style={{ fontWeight: 700, fontSize: 13.5 }} />
                      <Marquee text={song.artist} style={{ fontSize: 11, color: "#8b93a1" }} />
                      <div style={{ fontSize: 10, color: "#5f6674", marginTop: 4 }}>{current + 1} / {queue.length} {t("queue")}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
                    <ModeBtn active={shuffle} onClick={toggleShuffle}>
                      <Ic d={P.shuffle} size={12} /> {t("shuffleBtn")}
                    </ModeBtn>
                    <ModeBtn active={repeat !== "off"} onClick={cycleRepeat}>
                      <Ic d={repeat === "one" ? P.repeatOne : P.repeat} size={12} />
                      {repeat === "one" ? t("repeatOne") : repeat === "all" ? t("repeatAll") : t("repeatBtn")}
                    </ModeBtn>
                  </div>

                  <div>
                    {/* Progreso: clic o arrastre para adelantar/retroceder */}
                    <div ref={progBarRef}
                      onPointerDown={(e) => barDown("seek", e)} onPointerMove={barMove} onPointerUp={barUp}
                      style={{ height: 8, borderRadius: 4, background: "#262a33", overflow: "hidden", cursor: "pointer", touchAction: "none" }}>
                      <div style={{ height: "100%", width: `${dur ? (progress / dur) * 100 : 0}%`, background: `linear-gradient(90deg, ${ACCENT}, #7c5cff)` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8b93a1", margin: "3px 0 6px" }}>
                      <span>{fmt(progress)}</span><span>{dur ? `-${fmt(Math.max(dur - progress, 0))}` : "—"}</span>
                    </div>
                    {/* Volumen: girá la rueda (gesto iPod) o arrastrá la barra */}
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ color: volFlash ? ACCENT : "#8b93a1" }}>
                        <Ic d={volume === 0 ? P.volMute : volume < 50 ? P.volLow : P.volHigh} size={13} />
                      </span>
                      <div ref={volBarRef}
                        onPointerDown={(e) => barDown("vol", e)} onPointerMove={barMove} onPointerUp={barUp}
                        style={{ flex: 1, height: 6, borderRadius: 3, background: "#262a33", overflow: "hidden", cursor: "pointer", touchAction: "none", boxShadow: volFlash ? `0 0 0 1px ${ACCENT}` : "none" }}>
                        <div style={{ height: "100%", width: `${volume}%`, background: volFlash ? ACCENT : "#5a6270", transition: "background .2s" }} />
                      </div>
                      <span style={{ fontSize: 9.5, color: volFlash ? ACCENT : "#5f6674", width: 26, textAlign: "right" }}>{volume}%</span>
                    </div>
                  </div>
                </>)}
              </div>
            )}
          </div>

          {/* Overlay: agregar a lista */}
          {addTarget !== null && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,14,.88)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ background: "#171a21", borderRadius: "14px 14px 0 0", padding: "10px 0 12px", maxHeight: "80%", overflowY: "auto" }}>
                <div style={{ padding: "2px 16px 8px", fontSize: 11, fontWeight: 700, color: "#8b93a1" }}>
                  {t("addTo", { t: songOf(addTarget)?.title?.slice(0, 26) })}
                </div>
                {playlists.map((p, i) => (
                  <div key={p.name + i} onClick={() => addSongTo(i)}
                    style={{ padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                    <span>{p.name}</span><span style={{ fontSize: 10, color: "#5f6674" }}>{p.songIds.length}</span>
                  </div>
                ))}
                <div onClick={() => { setAddTarget(null); setNewName(""); go("newList"); }}
                  style={{ padding: "9px 16px", fontSize: 12.5, fontWeight: 600, color: ACCENT, cursor: "pointer" }}>{t("addNewList")}</div>
                <div onClick={() => setAddTarget(null)}
                  style={{ padding: "9px 16px", fontSize: 12, color: "#8b93a1", cursor: "pointer", textAlign: "center" }}>{t("cancel")}</div>
              </div>
            </div>
          )}

          {/* Overlay: menú contextual al mantener apretada una canción */}
          {ctxMenu !== null && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,14,.88)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ background: "#171a21", borderRadius: "14px 14px 0 0", padding: "10px 0 12px" }}>
                <div style={{ padding: "2px 16px 8px", fontSize: 11, fontWeight: 700, color: "#8b93a1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {songOf(ctxMenu)?.title}
                </div>
                <div onClick={() => { const id = ctxMenu; setCtxMenu(null); setAddTarget(id); }}
                  style={{ padding: "10px 16px", fontSize: 12.5, fontWeight: 600, color: ACCENT, cursor: "pointer" }}>
                  {t("ctx_add")}
                </div>
                <div onClick={() => { const id = ctxMenu; setCtxMenu(null); deleteSong(id); }}
                  style={{ padding: "10px 16px", fontSize: 12.5, fontWeight: 600, color: "#c76a7a", cursor: "pointer" }}>
                  {t("ctx_delete")}
                </div>
                <div onClick={() => setCtxMenu(null)}
                  style={{ padding: "9px 16px", fontSize: 12, color: "#8b93a1", cursor: "pointer", textAlign: "center" }}>
                  {t("cancel")}
                </div>
              </div>
            </div>
          )}

          {toast && (
            <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", background: "#e8ecf2", color: "#14161c", fontSize: 10.5, fontWeight: 700, padding: "5px 12px", borderRadius: 12, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,.5)" }}>{toast}</div>
          )}
        </div>

        {/* ── Clickwheel ── */}
        <div
          ref={wheelRef}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          style={{
            width: 190, height: 190, borderRadius: "50%", margin: "18px auto 0",
            position: "relative", touchAction: "none", cursor: "grab",
            background: cs.wheel, transition: "background .4s",
            boxShadow: "inset 0 2px 6px rgba(255,255,255,.35), inset 0 -3px 8px rgba(0,0,0,.25), 0 2px 4px rgba(0,0,0,.2)",
          }}
        >
          <button onClick={back} style={zone("12%", "50%", "translateX(-50%)")} />
          <span style={{ ...btnLabel, top: "9%", left: "50%", transform: "translateX(-50%)" }}>MENU</span>

          <button onClick={prev} style={zone("50%", "10%", "translateY(-50%)", true)} />
          <span style={{ ...btnLabel, top: "46%", left: "8%" }}><Ic d={P.prev} size={16} /></span>

          <button onClick={() => advance(false, 1)} style={zone("50%", "auto", "translateY(-50%)", true, "10%")} />
          <span style={{ ...btnLabel, top: "46%", right: "8%" }}><Ic d={P.next} size={16} /></span>

          <button onClick={togglePlay} style={zone("auto", "50%", "translateX(-50%)", false, undefined, "12%")} />
          <span style={{ ...btnLabel, bottom: "8%", left: "50%", transform: "translateX(-50%)" }}><Ic d={P.playPause} size={16} /></span>

          <button onClick={select} style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 74, height: 74, borderRadius: "50%", border: "none", cursor: "pointer",
            background: cs.center, transition: "background .4s",
            boxShadow: "inset 0 -2px 5px rgba(0,0,0,.2), 0 2px 5px rgba(0,0,0,.25)",
          }} />
        </div>

        <div style={{ textAlign: "center", marginTop: 13, fontSize: 10, color: cs.brand, letterSpacing: 2, fontWeight: 600 }}>
          DESKPOD
        </div>
      </div>
    </div>
  );
}

function zone(top, left, transform, vertical = false, right, bottom) {
  return {
    position: "absolute",
    top: top === "auto" ? undefined : top,
    bottom, left: left === "auto" ? undefined : left, right, transform,
    width: vertical ? 44 : 64, height: vertical ? 64 : 44,
    background: "transparent", border: "none", cursor: "pointer",
  };
}
