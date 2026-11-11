// Alpha Research — traducciones (español, inglés y catalán) y selector de idioma.
// Los textos fijos de index.html llevan data-i18n="clave"; los de app.js usan t("clave").
// El idioma elegido se guarda en el navegador (localStorage).
"use strict";

(() => { // todo dentro de una función: solo se publica window.I18N

const IDIOMAS = {
  es: { nombre: "Español", locale: "es-ES", bandera: "img/banderas/es.svg" },
  en: { nombre: "English", locale: "en-GB", bandera: "img/banderas/en.svg" },
  ca: { nombre: "Català", locale: "ca-ES", bandera: "img/banderas/ca.svg" },
};

const TEXTOS = {
  es: {
    "doc.titulo": "Alpha Research · Publicaciones sobre sarcoglicanopatías",
    "doc.descripcion": "Buscador de publicaciones científicas sobre distrofia muscular de cinturas por déficit de sarcoglicanos, actualizado cada día desde PubMed.",
    "saltar": "Saltar a las publicaciones",
    "marca.inicio": "Alpha Research, inicio",
    "marca.lema": "Investigación en sarcoglicanopatías",
    "menu.etiqueta": "Principal",
    "menu.publicaciones": "Publicaciones",
    "menu.como": "Cómo funciona",
    "menu.api": "API",
    "menu.colabora": "Colabora ↗",
    "idioma.boton": "Cambiar idioma",
    "portada.antetitulo": "Distrofia muscular de cinturas · LGMD R3–R6",
    "portada.titular": "Toda la investigación sobre sarcoglicanopatías, <em>en un solo lugar.</em>",
    "portada.entradilla": "Cada día recopilamos las nuevas publicaciones científicas de PubMed para que pacientes, familias e investigadores las encuentren de forma sencilla.",
    "buscador.etiqueta": "Buscar publicaciones",
    "buscador.q": "Buscar en títulos y resúmenes",
    "buscador.q.ph": "Busca por tema: sarcoglycan, gene therapy, variant…",
    "buscador.buscar": "Buscar",
    "buscador.autor": "Autor",
    "buscador.autor.ph": "Apellido del autor",
    "buscador.desde": "Publicado desde",
    "buscador.hasta": "Hasta",
    "buscador.limpiar": "Limpiar",
    "buscador.frecuentes": "Búsquedas frecuentes:",
    "cifras.total": "publicaciones recopiladas",
    "cifras.cadaDia": "Cada día",
    "cifras.auto": "actualización automática",
    "cifras.fuente": "fuente: NCBI · National Library of Medicine",
    "cifras.ultima": "última actualización desde PubMed",
    "cifras.autoPubmed": "actualización automática desde PubMed",
    "cifras.cadaDiaHora": "Cada día, {hora} h",
    "pub.titulo": "Publicaciones",
    "pub.paginas": "Páginas de resultados",
    "como.titulo": "Cómo funciona",
    "como.1.t": "Búsqueda diaria",
    "como.1.p": "Cada mañana el sistema consulta PubMed y recoge los artículos más recientes sobre distrofias de cinturas por déficit de sarcoglicanos.",
    "como.2.t": "Base de datos propia",
    "como.2.p": "Los artículos se guardan en nuestro servidor PostgreSQL, sin duplicados y con copia de seguridad diaria.",
    "como.3.t": "Consulta abierta",
    "como.3.p": "Cualquiera puede buscar por tema, autor o fecha y acceder al artículo original en PubMed o a través de su DOI.",
    "colabora.titulo": "Caminamos con la esperanza de encontrar una cura.",
    "colabora.texto": "La asociación Proyecto Alpha apoya a las personas afectadas y a sus familias e impulsa la investigación de estas enfermedades.",
    "colabora.boton": "Colabora con Proyecto Alpha ↗",
    "pie.texto": "Buscador de publicaciones científicas sobre sarcoglicanopatías. Proyecto del ciclo de Administración de Sistemas Informáticos en Red (ASIX).",
    "pie.aviso": "La información de esta web no sustituye la opinión de un profesional sanitario.",
    "pie.explorar": "Explorar",
    "pie.docs": "Documentación de la API",
    "pie.enlaces": "Enlaces",
    "pie.asociacion": "Asociación Proyecto Alpha ↗",
    "estado.comprobando": "Comprobando el servicio…",
    "estado.ok": "Servicio en funcionamiento",
    "estado.sinBD": "Base de datos no disponible",
    "estado.caido": "Servicio no disponible",
    "ingesta.ultima": "Última búsqueda: {fecha} ({nuevos} nuevas)",
    "ingesta.fallo": "La última búsqueda falló ({fecha})",
    "ingesta.proxima": "Próxima: {cuando}",
    "fecha.sin": "Sin fecha",
    "fecha.sf": "s/f",
    "fecha.hoy": "hoy a las {hora}",
    "fecha.manana": "mañana a las {hora}",
    "fecha.ayer": "ayer a las {hora}",
    "fecha.dia": "{dia} a las {hora}",
    "autores.no": "Autores no disponibles",
    "autores.mas": "{lista} y {n} más",
    "buscando": "Buscando…",
    "error.cargar": "No se han podido cargar las publicaciones",
    "error.cargar.p": "Comprueba tu conexión o vuelve a intentarlo en unos minutos.",
    "tarjeta.publicado": "Publicado el {fecha}.",
    "tarjeta.ver": "Ver ficha →",
    "res.ninguno": "No hay resultados",
    "res.ninguno.p": "Prueba con otras palabras, en inglés, o quita algún filtro.",
    "res.vacio": "Todavía no hay publicaciones",
    "res.vacio.p": "La búsqueda diaria en PubMed las irá añadiendo automáticamente.",
    "res.para": " para «{q}»",
    "res.rango": "{desde}–{hasta} de {total} resultados{busqueda} · más recientes primero",
    "res.uno": "{total} resultado{busqueda} · más recientes primero",
    "res.varios": "{total} resultados{busqueda} · más recientes primero",
    "pag.anterior": "Página anterior",
    "pag.siguiente": "Página siguiente",
    "pag.n": "Página {n}",
    "ficha.cargando": "Cargando…",
    "ficha.cerrar": "Cerrar",
    "ficha.autores": "Autores",
    "ficha.autores.no": "No disponibles",
    "ficha.revista": "Revista",
    "ficha.publicado": "Publicado",
    "ficha.fuente": "Fuente",
    "ficha.anadido": "Añadido",
    "ficha.resumen": "Resumen",
    "ficha.sinResumen": "El resumen completo del artículo está disponible en PubMed.",
    "ficha.claves": "Palabras clave",
    "ficha.pubmed": "Ver en PubMed ↗",
    "ficha.doi": "Texto completo ↗",
    "ficha.cita": "Copiar cita",
    "ficha.citaOk": "Cita copiada al portapapeles",
    "ficha.noEncontrada": "Publicación no encontrada",
    "ficha.noEncontrada.p": "Puede que el enlace sea incorrecto.",
    "ficha.error": "No se ha podido cargar",
    "ficha.error.p": "Vuelve a intentarlo en unos minutos.",
    "cita.sf": "s. f.",
  },

  en: {
    "doc.titulo": "Alpha Research · Publications on sarcoglycanopathies",
    "doc.descripcion": "Search engine for scientific publications on sarcoglycan-deficient limb-girdle muscular dystrophy, updated daily from PubMed.",
    "saltar": "Skip to publications",
    "marca.inicio": "Alpha Research, home",
    "marca.lema": "Research on sarcoglycanopathies",
    "menu.etiqueta": "Main",
    "menu.publicaciones": "Publications",
    "menu.como": "How it works",
    "menu.api": "API",
    "menu.colabora": "Support us ↗",
    "idioma.boton": "Change language",
    "portada.antetitulo": "Limb-girdle muscular dystrophy · LGMD R3–R6",
    "portada.titular": "All the research on sarcoglycanopathies, <em>in one place.</em>",
    "portada.entradilla": "Every day we collect new scientific publications from PubMed so that patients, families and researchers can find them easily.",
    "buscador.etiqueta": "Search publications",
    "buscador.q": "Search titles and abstracts",
    "buscador.q.ph": "Search by topic: sarcoglycan, gene therapy, variant…",
    "buscador.buscar": "Search",
    "buscador.autor": "Author",
    "buscador.autor.ph": "Author's surname",
    "buscador.desde": "Published from",
    "buscador.hasta": "To",
    "buscador.limpiar": "Clear",
    "buscador.frecuentes": "Popular searches:",
    "cifras.total": "publications collected",
    "cifras.cadaDia": "Every day",
    "cifras.auto": "automatic update",
    "cifras.fuente": "source: NCBI · National Library of Medicine",
    "cifras.ultima": "last update from PubMed",
    "cifras.autoPubmed": "automatic update from PubMed",
    "cifras.cadaDiaHora": "Every day, {hora}:00",
    "pub.titulo": "Publications",
    "pub.paginas": "Result pages",
    "como.titulo": "How it works",
    "como.1.t": "Daily search",
    "como.1.p": "Every morning the system queries PubMed and collects the latest articles on sarcoglycan-deficient limb-girdle dystrophies.",
    "como.2.t": "Our own database",
    "como.2.p": "Articles are stored on our PostgreSQL server, without duplicates and with a daily backup.",
    "como.3.t": "Open access",
    "como.3.p": "Anyone can search by topic, author or date and open the original article on PubMed or through its DOI.",
    "colabora.titulo": "We walk with the hope of finding a cure.",
    "colabora.texto": "The Proyecto Alpha association supports affected people and their families and promotes research into these diseases.",
    "colabora.boton": "Support Proyecto Alpha ↗",
    "pie.texto": "Search engine for scientific publications on sarcoglycanopathies. A project of the Network Computer Systems Administration (ASIX) course.",
    "pie.aviso": "The information on this website does not replace the advice of a healthcare professional.",
    "pie.explorar": "Explore",
    "pie.docs": "API documentation",
    "pie.enlaces": "Links",
    "pie.asociacion": "Proyecto Alpha association ↗",
    "estado.comprobando": "Checking the service…",
    "estado.ok": "Service running",
    "estado.sinBD": "Database unavailable",
    "estado.caido": "Service unavailable",
    "ingesta.ultima": "Last search: {fecha} ({nuevos} new)",
    "ingesta.fallo": "The last search failed ({fecha})",
    "ingesta.proxima": "Next: {cuando}",
    "fecha.sin": "No date",
    "fecha.sf": "n.d.",
    "fecha.hoy": "today at {hora}",
    "fecha.manana": "tomorrow at {hora}",
    "fecha.ayer": "yesterday at {hora}",
    "fecha.dia": "{dia} at {hora}",
    "autores.no": "Authors not available",
    "autores.mas": "{lista} and {n} more",
    "buscando": "Searching…",
    "error.cargar": "Publications could not be loaded",
    "error.cargar.p": "Check your connection or try again in a few minutes.",
    "tarjeta.publicado": "Published on {fecha}.",
    "tarjeta.ver": "View details →",
    "res.ninguno": "No results",
    "res.ninguno.p": "Try other words or remove a filter.",
    "res.vacio": "No publications yet",
    "res.vacio.p": "The daily PubMed search will add them automatically.",
    "res.para": " for “{q}”",
    "res.rango": "{desde}–{hasta} of {total} results{busqueda} · newest first",
    "res.uno": "{total} result{busqueda} · newest first",
    "res.varios": "{total} results{busqueda} · newest first",
    "pag.anterior": "Previous page",
    "pag.siguiente": "Next page",
    "pag.n": "Page {n}",
    "ficha.cargando": "Loading…",
    "ficha.cerrar": "Close",
    "ficha.autores": "Authors",
    "ficha.autores.no": "Not available",
    "ficha.revista": "Journal",
    "ficha.publicado": "Published",
    "ficha.fuente": "Source",
    "ficha.anadido": "Added",
    "ficha.resumen": "Summary",
    "ficha.sinResumen": "The full abstract of the article is available on PubMed.",
    "ficha.claves": "Keywords",
    "ficha.pubmed": "View on PubMed ↗",
    "ficha.doi": "Full text ↗",
    "ficha.cita": "Copy citation",
    "ficha.citaOk": "Citation copied to clipboard",
    "ficha.noEncontrada": "Publication not found",
    "ficha.noEncontrada.p": "The link may be wrong.",
    "ficha.error": "Could not be loaded",
    "ficha.error.p": "Try again in a few minutes.",
    "cita.sf": "n.d.",
  },

  ca: {
    "doc.titulo": "Alpha Research · Publicacions sobre sarcoglicanopaties",
    "doc.descripcion": "Cercador de publicacions científiques sobre distròfia muscular de cintures per dèficit de sarcoglicans, actualitzat cada dia des de PubMed.",
    "saltar": "Salta a les publicacions",
    "marca.inicio": "Alpha Research, inici",
    "marca.lema": "Recerca en sarcoglicanopaties",
    "menu.etiqueta": "Principal",
    "menu.publicaciones": "Publicacions",
    "menu.como": "Com funciona",
    "menu.api": "API",
    "menu.colabora": "Col·labora ↗",
    "idioma.boton": "Canvia l'idioma",
    "portada.antetitulo": "Distròfia muscular de cintures · LGMD R3–R6",
    "portada.titular": "Tota la recerca sobre sarcoglicanopaties, <em>en un sol lloc.</em>",
    "portada.entradilla": "Cada dia recopilem les noves publicacions científiques de PubMed perquè pacients, famílies i investigadors les trobin de manera senzilla.",
    "buscador.etiqueta": "Cerca publicacions",
    "buscador.q": "Cerca en títols i resums",
    "buscador.q.ph": "Cerca per tema: sarcoglycan, gene therapy, variant…",
    "buscador.buscar": "Cerca",
    "buscador.autor": "Autor",
    "buscador.autor.ph": "Cognom de l'autor",
    "buscador.desde": "Publicat des de",
    "buscador.hasta": "Fins a",
    "buscador.limpiar": "Esborra",
    "buscador.frecuentes": "Cerques freqüents:",
    "cifras.total": "publicacions recopilades",
    "cifras.cadaDia": "Cada dia",
    "cifras.auto": "actualització automàtica",
    "cifras.fuente": "font: NCBI · National Library of Medicine",
    "cifras.ultima": "darrera actualització des de PubMed",
    "cifras.autoPubmed": "actualització automàtica des de PubMed",
    "cifras.cadaDiaHora": "Cada dia, {hora} h",
    "pub.titulo": "Publicacions",
    "pub.paginas": "Pàgines de resultats",
    "como.titulo": "Com funciona",
    "como.1.t": "Cerca diària",
    "como.1.p": "Cada matí el sistema consulta PubMed i recull els articles més recents sobre distròfies de cintures per dèficit de sarcoglicans.",
    "como.2.t": "Base de dades pròpia",
    "como.2.p": "Els articles es desen al nostre servidor PostgreSQL, sense duplicats i amb còpia de seguretat diària.",
    "como.3.t": "Consulta oberta",
    "como.3.p": "Qualsevol persona pot cercar per tema, autor o data i accedir a l'article original a PubMed o a través del seu DOI.",
    "colabora.titulo": "Caminem amb l'esperança de trobar una cura.",
    "colabora.texto": "L'associació Proyecto Alpha dona suport a les persones afectades i a les seves famílies i impulsa la recerca d'aquestes malalties.",
    "colabora.boton": "Col·labora amb Proyecto Alpha ↗",
    "pie.texto": "Cercador de publicacions científiques sobre sarcoglicanopaties. Projecte del cicle d'Administració de Sistemes Informàtics en Xarxa (ASIX).",
    "pie.aviso": "La informació d'aquest web no substitueix l'opinió d'un professional sanitari.",
    "pie.explorar": "Explora",
    "pie.docs": "Documentació de l'API",
    "pie.enlaces": "Enllaços",
    "pie.asociacion": "Associació Proyecto Alpha ↗",
    "estado.comprobando": "Comprovant el servei…",
    "estado.ok": "Servei en funcionament",
    "estado.sinBD": "Base de dades no disponible",
    "estado.caido": "Servei no disponible",
    "ingesta.ultima": "Darrera cerca: {fecha} ({nuevos} noves)",
    "ingesta.fallo": "La darrera cerca ha fallat ({fecha})",
    "ingesta.proxima": "Propera: {cuando}",
    "fecha.sin": "Sense data",
    "fecha.sf": "s/d",
    "fecha.hoy": "avui a les {hora}",
    "fecha.manana": "demà a les {hora}",
    "fecha.ayer": "ahir a les {hora}",
    "fecha.dia": "{dia} a les {hora}",
    "autores.no": "Autors no disponibles",
    "autores.mas": "{lista} i {n} més",
    "buscando": "Cercant…",
    "error.cargar": "No s'han pogut carregar les publicacions",
    "error.cargar.p": "Comprova la connexió o torna-ho a provar d'aquí a uns minuts.",
    "tarjeta.publicado": "Publicat el {fecha}.",
    "tarjeta.ver": "Veure fitxa →",
    "res.ninguno": "No hi ha resultats",
    "res.ninguno.p": "Prova amb altres paraules, en anglès, o treu algun filtre.",
    "res.vacio": "Encara no hi ha publicacions",
    "res.vacio.p": "La cerca diària a PubMed les anirà afegint automàticament.",
    "res.para": " per a «{q}»",
    "res.rango": "{desde}–{hasta} de {total} resultats{busqueda} · més recents primer",
    "res.uno": "{total} resultat{busqueda} · més recents primer",
    "res.varios": "{total} resultats{busqueda} · més recents primer",
    "pag.anterior": "Pàgina anterior",
    "pag.siguiente": "Pàgina següent",
    "pag.n": "Pàgina {n}",
    "ficha.cargando": "Carregant…",
    "ficha.cerrar": "Tanca",
    "ficha.autores": "Autors",
    "ficha.autores.no": "No disponibles",
    "ficha.revista": "Revista",
    "ficha.publicado": "Publicat",
    "ficha.fuente": "Font",
    "ficha.anadido": "Afegit",
    "ficha.resumen": "Resum",
    "ficha.sinResumen": "El resum complet de l'article està disponible a PubMed.",
    "ficha.claves": "Paraules clau",
    "ficha.pubmed": "Veure a PubMed ↗",
    "ficha.doi": "Text complet ↗",
    "ficha.cita": "Copia la cita",
    "ficha.citaOk": "Cita copiada al porta-retalls",
    "ficha.noEncontrada": "Publicació no trobada",
    "ficha.noEncontrada.p": "Pot ser que l'enllaç sigui incorrecte.",
    "ficha.error": "No s'ha pogut carregar",
    "ficha.error.p": "Torna-ho a provar d'aquí a uns minuts.",
    "cita.sf": "s. d.",
  },
};

// ---------------------------------------------------------------------------

function idiomaInicial() {
  // 1) ?lang=ca en la dirección (enlaces compartidos), 2) el elegido antes, 3) el del navegador
  const deURL = new URLSearchParams(location.search).get("lang");
  if (deURL && IDIOMAS[deURL]) return deURL;
  try {
    const guardado = localStorage.getItem("idioma");
    if (guardado && IDIOMAS[guardado]) return guardado;
  } catch { /* sin localStorage */ }
  const nav = (navigator.language || "es").slice(0, 2).toLowerCase();
  return IDIOMAS[nav] ? nav : "es";
}

let idiomaActual = idiomaInicial();
const alCambiarIdioma = [];

// t("res.rango", { desde: 1, hasta: 10 }) -> texto traducido con los valores
function t(clave, valores = {}) {
  const texto = TEXTOS[idiomaActual][clave] ?? TEXTOS.es[clave] ?? clave;
  return texto.replace(/\{(\w+)\}/g, (_, k) => (k in valores ? valores[k] : `{${k}}`));
}

function locale() {
  return IDIOMAS[idiomaActual].locale;
}

// Traduce todo lo que tenga data-i18n* en la página
function traducirPagina() {
  document.documentElement.lang = idiomaActual;
  document.title = t("doc.titulo");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("doc.descripcion"));
  document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
  // Solo para textos nuestros con etiquetas sencillas (<em>), nunca datos de la API
  document.querySelectorAll("[data-i18n-html]").forEach((n) => { n.innerHTML = t(n.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-ph]").forEach((n) => { n.placeholder = t(n.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-aria]").forEach((n) => { n.setAttribute("aria-label", t(n.dataset.i18nAria)); });
}

// La dirección lleva ?lang=en|ca para que un enlace compartido abra en ese idioma
function ponerIdiomaEnURL() {
  const p = new URLSearchParams(location.search);
  if (idiomaActual === "es") p.delete("lang"); else p.set("lang", idiomaActual);
  const url = location.pathname + (p.toString() ? `?${p}` : "") + location.hash;
  history.replaceState(history.state, "", url);
}

function cambiarIdioma(codigo) {
  if (!IDIOMAS[codigo]) return;
  idiomaActual = codigo;
  try { localStorage.setItem("idioma", codigo); } catch { /* sin localStorage */ }
  ponerIdiomaEnURL();
  traducirPagina();
  pintarSelector();
  alCambiarIdioma.forEach((fn) => fn(codigo));
}

// ---------------------------------------------------------------------------
// Selector: círculo con la bandera + menú desplegable
// ---------------------------------------------------------------------------

function pintarSelector() {
  const boton = document.getElementById("idioma-boton");
  const lista = document.getElementById("idioma-lista");
  if (!boton || !lista) return;

  boton.querySelector("img").src = IDIOMAS[idiomaActual].bandera;
  boton.title = IDIOMAS[idiomaActual].nombre;
  boton.setAttribute("aria-label", `${t("idioma.boton")} (${IDIOMAS[idiomaActual].nombre})`);

  lista.replaceChildren(...Object.entries(IDIOMAS).map(([codigo, idioma]) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "menuitemradio");
    b.setAttribute("aria-checked", codigo === idiomaActual ? "true" : "false");
    b.lang = codigo;
    const img = document.createElement("img");
    b.title = idioma.nombre;              // como en la web de Proyecto Alpha: solo banderas
    b.setAttribute("aria-label", idioma.nombre);
    img.src = idioma.bandera; img.alt = ""; img.width = 18; img.height = 12;
    b.append(img);
    b.addEventListener("click", () => { cerrarSelector(); cambiarIdioma(codigo); boton.focus(); });
    li.append(b);
    return li;
  }));
}

function abrirSelector() {
  document.getElementById("idioma-lista").classList.remove("oculto");
  document.getElementById("idioma-boton").setAttribute("aria-expanded", "true");
  document.querySelector('#idioma-lista [aria-checked="true"]')?.focus();
}

function cerrarSelector() {
  document.getElementById("idioma-lista").classList.add("oculto");
  document.getElementById("idioma-boton").setAttribute("aria-expanded", "false");
}

function iniciarSelector() {
  const boton = document.getElementById("idioma-boton");
  const lista = document.getElementById("idioma-lista");
  if (!boton || !lista) return;
  boton.addEventListener("click", (e) => {
    e.stopPropagation();
    lista.classList.contains("oculto") ? abrirSelector() : cerrarSelector();
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".idioma")) cerrarSelector(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lista.classList.contains("oculto")) { cerrarSelector(); boton.focus(); }
  });
  pintarSelector();
}

if (new URLSearchParams(location.search).has("lang") || idiomaActual !== "es") ponerIdiomaEnURL();
traducirPagina();
iniciarSelector();

window.I18N = { t, locale, cambiarIdioma, alCambiar: (fn) => alCambiarIdioma.push(fn), actual: () => idiomaActual };
})();
