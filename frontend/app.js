// Alpha Research — buscador de publicaciones.
// Habla con la API a través de Nginx (/api/...). Sin librerías externas.
"use strict";

const API = "/api";
const POR_PAGINA = 10;
const FILTROS = ["q", "autor", "desde", "hasta"];
const $ = (id) => document.getElementById(id);
const { t, locale } = window.I18N; // textos traducidos (i18n.js)

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

// Crea un elemento. El texto siempre se pone como textContent (nunca como
// HTML): un título que contenga "<script>" se muestra tal cual y no se ejecuta.
function el(etiqueta, props = {}, ...hijos) {
  const nodo = document.createElement(etiqueta);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "texto") nodo.textContent = v;
    else if (k.startsWith("on")) nodo.addEventListener(k.slice(2), v);
    else nodo.setAttribute(k, v === true ? "" : v);
  }
  for (const h of hijos.flat(Infinity)) if (h != null && h !== false) nodo.append(h);
  return nodo;
}

// Sustituye el contenido de un nodo. Acepta listas anidadas e ignora los
// valores vacíos (null, false), igual que el().
function poner(nodo, ...hijos) {
  nodo.replaceChildren(...hijos.flat(Infinity).filter((h) => h != null && h !== false));
}

async function pedir(ruta) {
  const r = await fetch(API + ruta, { headers: { Accept: "application/json" } });
  if (!r.ok) {
    const error = new Error(`HTTP ${r.status}`);
    error.status = r.status;
    throw error;
  }
  return r.json();
}

function partesFecha(iso) {
  if (!iso) return null;
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  const fecha = new Date(a, m - 1, d);
  const mes = fecha.toLocaleDateString(locale(), { month: "short" }).replace(".", "");
  return { dia: d, mes, anio: a, fecha };
}

function fechaLarga(iso) {
  const p = partesFecha(iso);
  return p ? p.fecha.toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" }) : t("fecha.sin");
}

// La base de datos guarda las horas en UTC y sin zona horaria: se la añadimos.
function aFecha(iso) {
  if (!/(Z|[+-]\d\d:\d\d)$/.test(iso)) iso += "Z";
  return new Date(iso);
}

function fechaHora(iso) {
  if (!iso) return "";
  return aFecha(iso).toLocaleString(locale(), { dateStyle: "medium", timeStyle: "short" });
}

function cuando(iso) {
  // "hoy a las 06:00", "mañana a las 06:00" o la fecha
  const f = aFecha(iso);
  const hora = f.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" });
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const dia = new Date(f); dia.setHours(0, 0, 0, 0);
  const dif = Math.round((dia - hoy) / 86400000);
  if (dif === 0) return t("fecha.hoy", { hora });
  if (dif === 1) return t("fecha.manana", { hora });
  if (dif === -1) return t("fecha.ayer", { hora });
  return t("fecha.dia", { dia: f.toLocaleDateString(locale(), { day: "numeric", month: "short" }), hora });
}

function autoresCortos(autores, max = 6) {
  if (!autores) return t("autores.no");
  const lista = autores.split(", ");
  return lista.length > max ? t("autores.mas", { lista: lista.slice(0, max).join(", "), n: lista.length - max }) : autores;
}

function numero(n) {
  return n.toLocaleString(locale());
}

let temporizadorAviso;
function avisar(texto) {
  const aviso = $("aviso");
  aviso.textContent = texto;
  aviso.classList.remove("oculto");
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.add("oculto"), 2600);
}

// ---------------------------------------------------------------------------
// Estado en la URL: la búsqueda se puede recargar, compartir o volver atrás
// ---------------------------------------------------------------------------

function leerURL() {
  const p = new URLSearchParams(location.search);
  const estado = { pagina: Math.max(1, parseInt(p.get("pagina"), 10) || 1), id: p.get("id") || "" };
  for (const k of FILTROS) estado[k] = p.get(k) || "";
  return estado;
}

function escribirURL(estado, reemplazar = false) {
  const p = new URLSearchParams();
  for (const k of FILTROS) if (estado[k]) p.set(k, estado[k]);
  if (estado.pagina > 1) p.set("pagina", estado.pagina);
  if (estado.id) p.set("id", estado.id);
  if (window.I18N.actual() !== "es") p.set("lang", window.I18N.actual());
  const url = location.pathname + (p.toString() ? `?${p}` : "") + location.hash;
  if (url !== location.pathname + location.search + location.hash) {
    history[reemplazar ? "replaceState" : "pushState"](null, "", url);
  }
}

// ---------------------------------------------------------------------------
// Búsqueda y lista de resultados
// ---------------------------------------------------------------------------

let peticionActual = 0;

function esqueleto() {
  return Array.from({ length: 3 }, () =>
    el("li", { class: "articulo esqueleto", "aria-hidden": "true" },
      el("div", { class: "fecha-bloque" }),
      el("div", {},
        el("div", { class: "barra", style: "width:30%" }),
        el("div", { class: "barra", style: "width:90%;height:16px" }),
        el("div", { class: "barra", style: "width:65%" }),
      ),
    ));
}

async function buscar() {
  const estado = leerURL();
  for (const k of FILTROS) $(k).value = estado[k];

  const params = new URLSearchParams({ pagina: estado.pagina, por_pagina: POR_PAGINA, lang: window.I18N.actual() });
  for (const k of FILTROS) if (estado[k]) params.set(k, estado[k]);

  const id = ++peticionActual;
  $("resultados").setAttribute("aria-busy", "true");
  poner($("resultados"), ...esqueleto());
  $("resumen").textContent = t("buscando");

  try {
    const datos = await pedir(`/papers?${params}`);
    if (id !== peticionActual) return; // llegó tarde: ya hay otra búsqueda
    pintarResultados(datos, estado);
  } catch {
    if (id !== peticionActual) return;
    $("resumen").textContent = "";
    $("paginacion").classList.add("oculto");
    poner($("resultados"), el("li", { class: "mensaje error" },
      el("strong", { texto: t("error.cargar") }),
      t("error.cargar.p"),
    ));
  } finally {
    $("resultados").removeAttribute("aria-busy");
  }
}

function tarjeta(a) {
  const f = partesFecha(a.publication_date);
  return el("li", { class: "articulo", onclick: (e) => { if (!e.target.closest("a")) abrirFicha(a.id); } },
    el("div", { class: "fecha-bloque", "aria-hidden": "true" },
      f ? [el("span", { class: "dia", texto: f.dia }), el("span", { class: "mes", texto: f.mes }), el("span", { class: "anio", texto: f.anio })]
        : el("span", { class: "mes", texto: t("fecha.sf") }),
    ),
    el("div", { class: "articulo-cuerpo" },
      a.journal && el("p", { class: "revista", texto: a.journal }),
      el("h3", { lang: a.traducido ? window.I18N.actual() : "en" }, el("button", { type: "button", texto: a.title })),
      el("p", { class: "autores", texto: autoresCortos(a.authors) }),
      el("div", { class: "articulo-pie" },
        el("span", { class: "solo-lectores", texto: t("tarjeta.publicado", { fecha: fechaLarga(a.publication_date) }) }),
        a.pmid && el("span", { class: "etiqueta", texto: `PMID ${a.pmid}` }),
        a.doi && el("span", { class: "etiqueta", texto: "DOI" }),
        el("span", { class: "ver-ficha", "aria-hidden": "true", texto: t("tarjeta.ver") }),
      ),
    ),
  );
}

function pintarResultados({ total, resultados }, estado) {
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const hayFiltros = FILTROS.some((k) => estado[k]);

  if (total === 0) {
    $("resumen").textContent = "";
    $("paginacion").classList.add("oculto");
    poner($("resultados"), el("li", { class: "mensaje" },
      el("strong", { texto: hayFiltros ? t("res.ninguno") : t("res.vacio") }),
      hayFiltros ? t("res.ninguno.p") : t("res.vacio.p"),
    ));
    return;
  }

  const desde = (estado.pagina - 1) * POR_PAGINA + 1;
  const hasta = desde + resultados.length - 1;
  const busqueda = estado.q ? t("res.para", { q: estado.q }) : "";
  $("resumen").textContent = total > POR_PAGINA
    ? t("res.rango", { desde, hasta, total: numero(total), busqueda })
    : t(total === 1 ? "res.uno" : "res.varios", { total: numero(total), busqueda });

  poner($("resultados"), ...resultados.map(tarjeta));
  pintarPaginacion(estado.pagina, paginas);
}

function pintarPaginacion(actual, paginas) {
  const nav = $("paginacion");
  nav.classList.toggle("oculto", paginas <= 1);
  if (paginas <= 1) return;

  // 1 … 4 5 [6] 7 8 … 20
  const numeros = new Set([1, paginas, actual - 1, actual, actual + 1].filter((n) => n >= 1 && n <= paginas));
  const lista = [...numeros].sort((a, b) => a - b);
  const botones = [el("button", { type: "button", "aria-label": t("pag.anterior"), disabled: actual <= 1, onclick: () => irAPagina(actual - 1), texto: "←" })];
  lista.forEach((n, i) => {
    if (i > 0 && n - lista[i - 1] > 1) botones.push(el("span", { class: "puntos", texto: "…" }));
    botones.push(el("button", {
      type: "button", texto: n, "aria-label": t("pag.n", { n }),
      "aria-current": n === actual ? "page" : null,
      onclick: () => irAPagina(n),
    }));
  });
  botones.push(el("button", { type: "button", "aria-label": t("pag.siguiente"), disabled: actual >= paginas, onclick: () => irAPagina(actual + 1), texto: "→" }));
  poner(nav, ...botones);
}

function irAPagina(n) {
  escribirURL({ ...leerURL(), pagina: n, id: "" });
  buscar();
  $("publicaciones").scrollIntoView();
}

// ---------------------------------------------------------------------------
// Ficha de un artículo
// ---------------------------------------------------------------------------

function cita(a) {
  const anio = a.publication_date ? a.publication_date.slice(0, 4) : t("cita.sf");
  return [autoresCortos(a.authors, 6) + ".", a.title_original || a.title, a.journal ? `${a.journal}.` : "", `${anio}.`,
    a.doi ? `doi:${a.doi}.` : "", a.pmid ? `PMID: ${a.pmid}.` : ""].filter(Boolean).join(" ");
}

async function copiarCita(a) {
  const texto = cita(a);
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    // Sin permiso de portapapeles: método clásico
    const area = el("textarea", { style: "position:fixed;opacity:0" });
    area.value = texto;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  avisar(t("ficha.citaOk"));
}

async function abrirFicha(id, desdeURL = false) {
  if (!desdeURL) escribirURL({ ...leerURL(), id });
  const contenido = $("ficha-contenido");
  poner(contenido, el("p", { texto: t("ficha.cargando") }));
  if (!$("ficha").open) $("ficha").showModal();

  try {
    const a = await pedir(`/papers/${encodeURIComponent(id)}?lang=${window.I18N.actual()}`);
    const datos = [
      [t("ficha.autores"), a.authors || t("ficha.autores.no")],
      [t("ficha.revista"), a.journal],
      [t("ficha.publicado"), fechaLarga(a.publication_date)],
      ["PMID", a.pmid],
      ["DOI", a.doi],
      [t("ficha.fuente"), a.source],
      [t("ficha.anadido"), a.created_at && fechaHora(a.created_at)],
    ].filter(([, v]) => v);

    const tieneTexto = a.summary || a.abstract;
    // Enlace a PubMed: se construye con el PMID (siempre válido); la url guardada es la alternativa
    const urlPubmed = a.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(a.pmid)}/` : a.url;
    poner(contenido, 
      a.journal && el("p", { class: "revista", texto: a.journal }),
      a.traducido && avisoTraduccion(a),
      el("h2", { id: "ficha-titulo", texto: a.title, lang: a.traducido ? window.I18N.actual() : "en" }),
      el("dl", {}, datos.map(([k, v]) => [el("dt", { texto: k }), el("dd", { texto: v })])),
      a.summary && [el("h3", { texto: t("ficha.resumen") }), el("p", { class: "texto", texto: a.summary })],
      a.abstract && [el("h3", { texto: t("ficha.abstract") }), el("p", { class: "texto", id: "ficha-abstract", texto: a.abstract, lang: a.traducido ? window.I18N.actual() : "en" })],
      !tieneTexto && el("p", { class: "nota", texto: t("ficha.sinResumen") }),
      a.keywords?.length > 0 && [el("h3", { texto: t("ficha.claves") }), el("ul", { class: "palabras" }, a.keywords.map((k) => el("li", { texto: k })))],
      el("div", { class: "ficha-acciones" },
        urlPubmed && el("a", { class: "boton", href: urlPubmed, target: "_blank", rel: "noopener noreferrer", texto: t("ficha.pubmed"), onclick: abrirEnlaceExterno }),
        a.doi && el("a", { class: "boton boton-borde", href: `https://doi.org/${a.doi}`, target: "_blank", rel: "noopener noreferrer", texto: t("ficha.doi"), onclick: abrirEnlaceExterno }),
        el("button", { class: "boton boton-borde", type: "button", texto: t("ficha.cita"), onclick: () => copiarCita(a) }),
      ),
    );
  } catch (e) {
    poner(contenido, el("div", { class: "mensaje error" },
      el("strong", { texto: e.status === 404 ? t("ficha.noEncontrada") : t("ficha.error") }),
      e.status === 404 ? t("ficha.noEncontrada.p") : t("ficha.error.p"),
    ));
  }
}

// Aviso "traducción automática" con un botón para alternar entre la
// traducción y el original en inglés (título y resumen)
function avisoTraduccion(a) {
  let original = false;
  const boton = el("button", { class: "enlace-boton", type: "button", texto: t("trad.verOriginal") });
  boton.addEventListener("click", () => {
    original = !original;
    const titulo = $("ficha-titulo");
    const resumen = $("ficha-abstract");
    titulo.textContent = original ? a.title_original : a.title;
    titulo.lang = original ? "en" : window.I18N.actual();
    if (resumen) {
      resumen.textContent = original ? a.abstract_original : a.abstract;
      resumen.lang = titulo.lang;
    }
    boton.textContent = original ? t("trad.verTraduccion") : t("trad.verOriginal");
  });
  return el("p", { class: "aviso-traduccion" },
    el("span", { texto: t("trad.aviso") }), boton);
}

// Los enlaces externos de la ficha se abren a mano en una pestaña nueva: así
// el clic no depende del <dialog> modal ni de otros manejadores de la página.
function abrirEnlaceExterno(e) {
  e.preventDefault();
  e.stopPropagation();
  const url = e.currentTarget.href;
  const ventana = window.open(url, "_blank");
  if (ventana) ventana.opener = null; // la página externa no puede tocar la nuestra
  else location.href = url;           // si el navegador bloquea la pestaña, se abre aquí
}

function cerrarFicha() {
  if ($("ficha").open) $("ficha").close();
}

// ---------------------------------------------------------------------------
// Cifras de la portada y estado del servicio (pie)
// ---------------------------------------------------------------------------

async function cargarEstado() {
  try {
    const salud = await pedir("/health");
    const ok = salud.database === "ok";
    $("estado").textContent = ok ? t("estado.ok") : t("estado.sinBD");
    $("estado-punto").className = `punto ${ok ? "ok" : "error"}`;
  } catch {
    $("estado").textContent = t("estado.caido");
    $("estado-punto").className = "punto error";
  }

  try {
    const { total } = await pedir("/papers?por_pagina=1");
    $("cifra-total").textContent = numero(total);
  } catch { /* se queda el guion */ }

  try {
    const ing = await pedir("/ingesta/estado");
    const u = ing.ultima_ejecucion;
    if (u && u.estado === "ok") {
      $("cifra-actualizacion").textContent = cuando(u.fin).replace(/^./, (c) => c.toUpperCase());
      $("cifra-actualizacion-texto").textContent = t("cifras.ultima");
    } else if (ing.activa) {
      $("cifra-actualizacion").textContent = t("cifras.cadaDiaHora", { hora: ing.hora });
      $("cifra-actualizacion-texto").textContent = t("cifras.autoPubmed");
    }
    const partes = [];
    if (u) partes.push(u.estado === "ok" ? t("ingesta.ultima", { fecha: fechaHora(u.fin), nuevos: u.resultado.nuevos }) : t("ingesta.fallo", { fecha: fechaHora(u.fin) }));
    if (ing.proxima_ejecucion) partes.push(t("ingesta.proxima", { cuando: cuando(ing.proxima_ejecucion) }));
    $("ingesta").textContent = partes.join(" · ");
  } catch { /* sin datos de la búsqueda diaria */ }
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------

function nuevaBusqueda(cambios = {}) {
  const valores = {};
  for (const k of FILTROS) valores[k] = $(k).value.trim();
  escribirURL({ ...valores, ...cambios, pagina: 1 });
  buscar();
  $("publicaciones").scrollIntoView();
}

$("formulario").addEventListener("submit", (e) => { e.preventDefault(); nuevaBusqueda(); });
$("limpiar").addEventListener("click", () => {
  for (const k of FILTROS) $(k).value = "";
  nuevaBusqueda();
  $("q").focus({ preventScroll: true });
});
$("sugerencias").addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-q]");
  if (!boton) return;
  $("q").value = boton.dataset.q;
  nuevaBusqueda();
});

$("cerrar-ficha").addEventListener("click", cerrarFicha);
$("ficha").addEventListener("click", (e) => { if (e.target === $("ficha")) cerrarFicha(); });
$("ficha").addEventListener("close", () => {
  const estado = leerURL();
  if (estado.id) escribirURL({ ...estado, id: "" });
});

// Botones atrás/adelante del navegador
window.addEventListener("popstate", () => {
  buscar();
  const { id } = leerURL();
  if (id) abrirFicha(id, true); else cerrarFicha();
});

// Sombra en la cabecera al bajar
const cabecera = $("cabecera");
const marcarCabecera = () => cabecera.classList.toggle("con-sombra", window.scrollY > 8);
window.addEventListener("scroll", marcarCabecera, { passive: true });

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------
// Al cambiar de idioma se vuelven a pintar los textos que genera este archivo
window.I18N.alCambiar(() => {
  buscar();
  cargarEstado();
  const { id } = leerURL();
  if (id && $("ficha").open) abrirFicha(id, true);
});

escribirURL(leerURL(), true);
marcarCabecera();
buscar();
cargarEstado();
if (leerURL().id) abrirFicha(leerURL().id, true);
