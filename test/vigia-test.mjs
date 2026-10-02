#!/usr/bin/env node
// Tests del vigia de vencimientos
// ------------------------------------------------
// Arma expedientes sinteticos en una carpeta temporal y comprueba que el
// escaneo separe bien los tres estados que importan: lo que vence pronto, lo
// que nadie computo, y lo que no se puede computar porque falta la
// jurisdiccion en la ficha.
//
// Los expedientes de prueba se crean y se borran en /tmp. Nunca se escribe
// nada dentro de casos/, ni con datos inventados: la regla de la casa es que
// ahi no entra nada que se parezca a un caso.
//
// Uso:
//   node test/vigia-test.mjs
//
// Exit codes:
//   0 = todo ok
//   1 = algun test fallo

import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const ejecutar = promisify(execFile);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ESCANER = path.join(AQUI, "..", "componentes", "vigia", "escanear.mjs");

let pasaron = 0;
let fallaron = 0;

function ok(nombre) {
  pasaron += 1;
  process.stderr.write(`[vigia] ok   ${nombre}\n`);
}
function mal(nombre, detalle) {
  fallaron += 1;
  process.stderr.write(`[vigia] MAL  ${nombre}\n       ${detalle}\n`);
}
function comprobar(nombre, condicion, detalle) {
  condicion ? ok(nombre) : mal(nombre, detalle);
}

/** Una fecha a N dias de hoy, en el formato que usa la plantilla. */
function enDias(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

async function caso(base, nombre, ficha, plazos) {
  const dir = path.join(base, nombre);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "FICHA.md"), ficha, "utf8");
  if (plazos !== null) {
    await writeFile(path.join(dir, "plazos.md"), plazos, "utf8");
  }
}

const CABECERA =
  "| Acto / plazo | Tipo | Inicio | Vencimiento | Estado |\n" +
  "|---|---|---|---|---|\n";

async function main() {
  const base = await mkdtemp(path.join(tmpdir(), "vigia-"));

  // Al dia, con un vencimiento fatal cerca.
  await caso(
    base,
    "0001-expediente-de-prueba",
    "## Jurisdicción y fuero\n- **Jurisdicción:** CABA-Nacional\n- **Fuero:** previsional\n",
    CABECERA + `| expresar agravios | hábiles judiciales | ${enDias(-9)} | ${enDias(6)} | 🔴 computado |\n`,
  );

  // Una fila que nadie computo: el modo de falla que persigue esta skill.
  await caso(
    base,
    "0002-expediente-de-prueba",
    "## Jurisdicción y fuero\n- **Jurisdicción:** Salta\n- **Fuero:** civil y comercial\n",
    CABECERA + "| contestar demanda | hábiles judiciales | 2026-08-25 |  | 🔲 a computar |\n",
  );

  // Ficha con los parentesis de la plantilla sin completar.
  await caso(
    base,
    "0003-expediente-de-prueba",
    "## Jurisdicción y fuero\n- **Jurisdicción:** (CABA-Nacional / Jujuy / Salta)\n- **Fuero:** (civil / penal)\n",
    CABECERA + "| algo | hábiles judiciales |  |  | 🔲 a computar |\n",
  );

  // Ya vencido.
  await caso(
    base,
    "0004-expediente-de-prueba",
    "## Jurisdicción y fuero\n- **Jurisdicción:** Jujuy\n- **Fuero:** penal\n",
    CABECERA + `| interponer recurso | hábiles judiciales | ${enDias(-12)} | ${enDias(-3)} | 🔴 computado |\n`,
  );

  // Sin nada pendiente: vence lejos.
  await caso(
    base,
    "0005-expediente-de-prueba",
    "## Jurisdicción y fuero\n- **Jurisdicción:** Salta\n- **Fuero:** familia\n",
    CABECERA + `| audiencia | corridos | ${enDias(1)} | ${enDias(120)} | computado |\n`,
  );

  let salida;
  try {
    const r = await ejecutar("node", [ESCANER, "--casos", base, "--json"]);
    salida = JSON.parse(r.stdout);
  } catch (e) {
    // exit 1 es esperado cuando hay pendientes: la salida sigue siendo valida.
    if (e.stdout) salida = JSON.parse(e.stdout);
    else {
      mal("el escaner corre", String(e).slice(0, 160));
      return;
    }
  }

  const por = (n) => salida.casos.find((c) => c.caso.startsWith(n));

  comprobar("encuentra los cinco expedientes", salida.casos.length === 5,
    `encontro ${salida.casos.length}`);

  comprobar("lee jurisdicción y fuero de la ficha",
    por("0001").jurisdiccion === "CABA-Nacional" && por("0001").fuero === "previsional",
    JSON.stringify(por("0001")).slice(0, 120));

  comprobar("una ficha con los paréntesis sin completar no cuenta como completa",
    por("0003").puedeComputarse === false,
    "0003 quedo como computable y no deberia");

  comprobar("una ficha completa sí habilita el cómputo",
    por("0002").puedeComputarse === true,
    "0002 quedo como no computable");

  comprobar("marca sin computar la fila sin vencimiento",
    por("0002").plazos.some((p) => p.sinComputar),
    "no detecto la fila 🔲 de 0002");

  comprobar("no marca sin computar una fila con fecha",
    por("0001").plazos.every((p) => !p.sinComputar),
    "marco como pendiente una fila ya computada");

  comprobar("cuenta los días hasta el vencimiento",
    por("0001").plazos[0].dias === 6,
    `dias = ${por("0001").plazos[0].dias}, esperaba 6`);

  comprobar("un vencimiento pasado da días negativos",
    por("0004").plazos[0].dias === -3,
    `dias = ${por("0004").plazos[0].dias}, esperaba -3`);

  comprobar("reconoce el marcador de plazo fatal",
    por("0004").plazos[0].fatal === true,
    "no vio el 🔴");

  comprobar("ignora la fila de ejemplo de la plantilla",
    por("0005").plazos.length === 1,
    `0005 tiene ${por("0005").plazos.length} filas, esperaba 1`);

  // La ventana no debe arrastrar lo que vence dentro de cuatro meses.
  const lejano = por("0005").plazos[0];
  comprobar("un vencimiento lejano no entra en la ventana",
    lejano.dias > 15,
    `dias = ${lejano.dias}`);

  // El escaner nunca computa: una fila sin fecha se queda sin fecha.
  comprobar("el escáner NO inventa un vencimiento",
    por("0002").plazos[0].dias === null,
    "le puso fecha a un plazo que nadie computo");

  await rm(base, { recursive: true, force: true });

  process.stderr.write(`\n[vigia] ${pasaron} ok, ${fallaron} mal\n`);
  process.exitCode = fallaron > 0 ? 1 : 0;
}

await main();
