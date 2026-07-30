#!/usr/bin/env node
// Smoke tests para el MCP SAIJ
// ------------------------------------------------
// Testea las 4 herramientas del conector SAIJ contra
// la API publica. Tolerante a indisponibilidad: si la
// API no responde, los tests se saltan con un warning
// (no fallan el CI por causas externas).
//
// Tambien funciona como detector de cambios rompientes
// en el contrato de salida de la API de SAIJ.
//
// Uso:
//   node test/saij-smoke-test.mjs
//
// Exit codes:
//   0 = todo ok (o saltado por API caida)
//   1 = algun test fallo

const BASE = "https://www.saij.gob.ar";
const UA = "Mozilla/5.0 (compatible; saij-mcp/1.0; +local; smoke-test)";

// ---------- Helpers ----------

let passed = 0;
let failed = 0;
let skipped = 0;
let apiAvailable = true;
let skipReason = "";

function log(...a) {
  process.stderr.write("[smoke] " + a.join(" ") + "\n");
}

function ok(name) {
  console.log("  [OK]", name);
  passed++;
}

function fail(name, detalle) {
  console.log("  [FAIL]", name, "-", detalle);
  failed++;
}

function skip(name, razon) {
  console.log("  [SKIP]", name, "-", razon);
  skipped++;
}

// ---------- HTTP con timeout ----------

async function httpGetJson(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": UA,
        "Accept-Language": "es-AR",
      },
      signal: ctrl.signal,
      redirect: "follow",
    });
    const text = await res.text();
    if (res.status !== 200) {
      // 5xx = API caida; 403 = WAF/proxy bloqueando (tampoco podemos testear)
      if ((res.status >= 500 && res.status < 600) || res.status === 403) {
        apiAvailable = false;
        skipReason = "API SAIJ respondio HTTP " + res.status + " (indisponible o bloqueado)";
        return null;
      }
      throw new Error("HTTP " + res.status + " de SAIJ");
    }
    return JSON.parse(text);
  } catch (e) {
    if (e.name === "AbortError") {
      apiAvailable = false;
      skipReason = "Timeout (30s) consultando SAIJ - API posiblemente caida";
      return null;
    }
    if (e.cause?.code === "ENOTFOUND" || e.cause?.code === "ECONNREFUSED" || e.cause?.code === "ECONNRESET") {
      apiAvailable = false;
      skipReason = "Error de red: " + e.cause.code + " - SAIJ no responde";
      return null;
    }
    throw e;
  }
}

// ---------- Contrato de salida esperado ----------

function validarResultado(r, index) {
  const errores = [];

  if (r.titulo === undefined || r.titulo === null) {
    errores.push("falta 'titulo'");
  } else if (typeof r.titulo !== "string") {
    errores.push("'titulo' no es string");
  } else if (r.titulo.trim() === "") {
    errores.push("'titulo' esta vacio");
  }

  if (r.uuid === undefined || r.uuid === null) {
    errores.push("falta 'uuid'");
  } else if (typeof r.uuid !== "string") {
    errores.push("'uuid' no es string");
  } else if (!r.uuid.match(/^[a-zA-Z0-9_-]+$/)) {
    errores.push("'uuid' con formato inesperado: \"" + r.uuid + "\"");
  }

  if (r.url === undefined || r.url === null) {
    errores.push("falta 'url'");
  } else if (typeof r.url !== "string") {
    errores.push("'url' no es string");
  } else if (!r.url.startsWith(BASE + "/")) {
    errores.push("'url' no pertenece a SAIJ: \"" + r.url + "\"");
  }

  if (r.texto === undefined || r.texto === null) {
    errores.push("falta 'texto' (extracto)");
  }

  if (errores.length > 0) {
    return { ok: false, errores: errores.join("; ") };
  }
  return { ok: true };
}

// ---------- Prueba de busqueda ----------

async function probarBusqueda(tipo, consulta, label) {
  const facetMap = {
    jurisprudencia: "Total|Tipo de Documento/Jurisprudencia",
    legislacion: "Total|Tipo de Documento/Legislacion",
    doctrina: "Total|Tipo de Documento/Doctrina",
  };
  const facet = facetMap[tipo];
  if (!facet) throw new Error("Tipo desconocido: " + tipo);

  const url = BASE + "/busqueda?o=0&p=3&v=colapsada&f=" + encodeURIComponent(facet) + "&q=" + encodeURIComponent(consulta);

  log("  GET", url);

  const j = await httpGetJson(url);
  if (!apiAvailable) return;

  if (!j) {
    fail(label, "respuesta vacia de SAIJ");
    return;
  }

  if (!j.searchResults) {
    fail(label, "falta 'searchResults' en la respuesta");
    return;
  }

  const list = j.searchResults.documentResultList;
  if (!Array.isArray(list)) {
    fail(label, "'documentResultList' no es un array");
    return;
  }

  if (list.length === 0) {
    skip(label, "sin resultados para la consulta (no es un error)");
    return;
  }

  let allOk = true;
  for (let i = 0; i < list.length; i++) {
    const it = list[i];

    if (!it.uuid || typeof it.uuid !== "string") {
      fail(label, "resultado[" + i + "] sin uuid o uuid invalido");
      allOk = false;
      continue;
    }

    if (!it.documentAbstract) {
      fail(label, "resultado[" + i + "] sin documentAbstract");
      allOk = false;
      continue;
    }

    let abs;
    try {
      abs = typeof it.documentAbstract === "string" ? JSON.parse(it.documentAbstract) : it.documentAbstract;
    } catch (e) {
      fail(label, "resultado[" + i + "] documentAbstract no es JSON valido: " + e.message);
      allOk = false;
      continue;
    }

    const resultado = {
      uuid: it.uuid,
      url: BASE + "/" + it.uuid,
      titulo: abs?.content?.titulo || abs?.content?.caratula || abs?.document || "(sin titulo)",
      texto: abs?.content?.texto || abs?.content?.sintesis || abs?.content?.sumario || "",
    };

    const v = validarResultado(resultado, i);
    if (!v.ok) {
      fail(label, "resultado[" + i + "]: " + v.errores);
      allOk = false;
    }
  }

  if (allOk) {
    ok(label + " (" + list.length + " resultado(s))");
  }

  // Deteccion de cambios rompientes
  if (typeof j.searchResults !== "object") {
    fail("API contract", "searchResults dejo de ser un objeto - cambio rompiente");
  }
  if (!Array.isArray(j.searchResults.documentResultList)) {
    fail("API contract", "documentResultList dejo de ser un array - cambio rompiente");
  }
}

// ---------- Prueba de documento por uuid ----------

async function probarDocumento() {
  const urlBusqueda = BASE + "/busqueda?o=0&p=1&v=colapsada&f=" + encodeURIComponent("Total|Tipo de Documento/Jurisprudencia") + "&q=" + encodeURIComponent("prision preventiva");

  log("  GET", urlBusqueda);
  const j = await httpGetJson(urlBusqueda);
  if (!apiAvailable) return;

  if (!j?.searchResults?.documentResultList?.length) {
    skip("saij_documento", "no se pudo obtener un uuid para probar");
    return;
  }

  const uuid = j.searchResults.documentResultList[0].uuid;
  log("  UUID obtenido:", uuid);

  const urlDoc = BASE + "/view-document?guid=" + encodeURIComponent(uuid);
  log("  GET", urlDoc);

  const docData = await httpGetJson(urlDoc);
  if (!apiAvailable) return;

  if (!docData) {
    fail("saij_documento", "respuesta vacia al pedir documento");
    return;
  }

  const data = docData.data ?? docData;
  let doc;
  try {
    doc = typeof data === "string" ? JSON.parse(data) : data;
  } catch (e) {
    fail("saij_documento", "data no es JSON valido: " + e.message);
    return;
  }

  const metadata = doc.metadata || {};
  const content = doc.content || {};

  if (!metadata["document-content-type"] && !content.titulo) {
    skip("saij_documento", "documento devuelto sin metadatos reconocibles");
    return;
  }

  const errores = [];
  if (!content.titulo && !content.caratula && !content["titulo-norma"]) {
    errores.push("sin titulo reconocible en el documento");
  }
  if (!content.texto && !content["texto-completo"] && !content.sintesis) {
    errores.push("sin texto en el documento");
  }

  if (errores.length > 0) {
    fail("saij_documento", errores.join("; "));
  } else {
    ok("saij_documento (" + uuid + ")");
  }
}

// ---------- MAIN ----------

async function main() {
  console.log("\nSmoke tests * MCP SAIJ\n");
  console.log("Target:", BASE, "\n");

  console.log("-- saij_buscar_jurisprudencia --");
  await probarBusqueda("jurisprudencia", "despido discriminatorio", "saij_buscar_jurisprudencia");
  if (!apiAvailable) skip("saij_buscar_jurisprudencia", skipReason);

  console.log("\n-- saij_buscar_legislacion --");
  await probarBusqueda("legislacion", "Ley de Contrato de Trabajo", "saij_buscar_legislacion");
  if (!apiAvailable) skip("saij_buscar_legislacion", skipReason);

  console.log("\n-- saij_buscar_doctrina --");
  await probarBusqueda("doctrina", "derecho procesal constitucional", "saij_buscar_doctrina");
  if (!apiAvailable) skip("saij_buscar_doctrina", skipReason);

  console.log("\n-- saij_documento --");
  await probarDocumento();
  if (!apiAvailable) skip("saij_documento", skipReason);

  const total = passed + failed + skipped;
  console.log("\n=======================================");
  console.log("  Total: " + total + "  Correctos: " + passed + "  Fallos: " + failed + "  Saltados: " + skipped);
  console.log("=======================================\n");

  if (failed > 0) {
    console.log("ALGUNOS TESTS FALLARON - revisar arriba.\n");
    process.exit(1);
  }

  if (passed === 0 && skipped > 0) {
    console.log("Todos los tests fueron saltados (API de SAIJ no disponible).\n");
    process.exit(0);
  }

  console.log("Todos los tests pasaron.\n");
  process.exit(0);
}

main().catch((e) => {
  console.error("\nError fatal en smoke tests:", e.message, "\n");
  process.exit(1);
});