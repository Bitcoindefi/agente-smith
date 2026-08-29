#!/usr/bin/env node
// Tests del manejo de expedientes
// ------------------------------------------------
// Comprueba lo que el script tiene que impedir, que es mas importante que lo
// que tiene que permitir: abrir un caso sin jurisdiccion, usar una
// jurisdiccion que no tiene ficha, y archivar un caso con plazos pendientes.
//
// Todo ocurre en /tmp. Nunca se escribe dentro de casos/.
//
// Uso:
//   node test/casos-test.mjs

import { mkdtemp, mkdir, writeFile, readFile, rm, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const ejecutar = promisify(execFile);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const SCRIPT = path.join(RAIZ, "componentes", "casos", "casos.mjs");
const PLANTILLA = path.join(RAIZ, "_PLANTILLA-CASO");

let pasaron = 0;
let fallaron = 0;
const ok = (n) => { pasaron += 1; process.stderr.write(`[casos] ok   ${n}\n`); };
const mal = (n, d) => { fallaron += 1; process.stderr.write(`[casos] MAL  ${n}\n       ${d}\n`); };
const comprobar = (n, c, d) => (c ? ok(n) : mal(n, d));

/** Corre el script y devuelve {code, out, err} sin tirar. */
async function correr(...argv) {
  try {
    const r = await ejecutar("node", [SCRIPT, ...argv]);
    return { code: 0, out: r.stdout, err: r.stderr };
  } catch (e) {
    return { code: e.code ?? 1, out: e.stdout ?? "", err: e.stderr ?? String(e) };
  }
}

async function main() {
  const base = await mkdtemp(path.join(tmpdir(), "casos-"));
  const dirCasos = path.join(base, "casos");
  await mkdir(dirCasos, { recursive: true });
  const comun = ["--casos", dirCasos, "--plantilla", PLANTILLA];

  // --- lo que tiene que impedir ---

  let r = await correr("nuevo", "0001-prueba", ...comun);
  comprobar("no abre un caso sin jurisdicción ni fuero",
    r.code === 64 && /jurisdicci/i.test(r.err),
    `code=${r.code} err=${r.err.slice(0, 90)}`);

  r = await correr("nuevo", "0001-prueba", "--jurisdiccion", "Salta", ...comun);
  comprobar("tampoco con jurisdicción pero sin fuero",
    r.code === 64 && /fuero/i.test(r.err),
    `code=${r.code}`);

  r = await correr("nuevo", "0001-prueba", "--jurisdiccion", "Córdoba",
                   "--fuero", "penal", ...comun);
  comprobar("rechaza una jurisdicción que no tiene ficha",
    r.code === 64 && /ficha/i.test(r.err),
    `code=${r.code} err=${r.err.slice(0, 90)}`);

  // --- lo que tiene que hacer ---

  r = await correr("nuevo", "0001-prueba", "--jurisdiccion", "Salta",
                   "--fuero", "familia", "--caratula", "Caso sintético de prueba", ...comun);
  comprobar("abre el caso cuando están los dos datos", r.code === 0,
    `code=${r.code} err=${r.err.slice(0, 120)}`);

  const ficha = await readFile(path.join(dirCasos, "0001-prueba", "FICHA.md"), "utf8");
  comprobar("escribe la jurisdicción en la ficha", /\*\*Jurisdicción:\*\*\s*Salta/.test(ficha),
    ficha.split("\n").find((l) => /Jurisdicci/.test(l)) ?? "no encontre la linea");
  comprobar("escribe el fuero", /\*\*Fuero:\*\*\s*familia/.test(ficha), "");
  comprobar("escribe la carátula", /Caso sintético de prueba/.test(ficha), "");
  comprobar("pone la fecha de inicio", /\*\*Fecha de inicio:\*\*\s*\d{4}-\d{2}-\d{2}/.test(ficha), "");

  const notas = await readFile(path.join(dirCasos, "0001-prueba", "notas.md"), "utf8");
  comprobar("apunta a la ficha de jurisdicción en las notas",
    /jurisdicciones\/salta\.md/.test(notas), notas.slice(-120));

  r = await correr("nuevo", "0001-prueba", "--jurisdiccion", "Salta", "--fuero", "familia", ...comun);
  comprobar("no pisa un caso que ya existe", r.code === 1, `code=${r.code}`);

  // --- validar ---

  r = await correr("validar", ...comun);
  comprobar("valida en verde un caso completo", r.code === 0 && /ok\s+0001/.test(r.out),
    `code=${r.code} out=${r.out.slice(0, 90)}`);

  // Un caso creado a mano, como se hacía antes: sin jurisdicción.
  await cp(PLANTILLA, path.join(dirCasos, "0002-a-mano"), { recursive: true });
  r = await correr("validar", ...comun);
  comprobar("detecta el caso creado a mano sin jurisdicción",
    r.code === 1 && /0002/.test(r.out), `code=${r.code} out=${r.out.slice(0, 120)}`);

  r = await correr("listar", ...comun);
  comprobar("listar marca los incompletos y sale distinto de cero",
    r.code === 1 && /SIN JURISDICCIÓN/.test(r.out), r.out.slice(0, 120));

  // --- cerrar ---

  const plazos = path.join(dirCasos, "0001-prueba", "plazos.md");
  await writeFile(plazos,
    "| Acto | Tipo | Inicio | Vencimiento | Estado |\n|---|---|---|---|---|\n" +
    "| contestar demanda | hábiles judiciales | 2026-08-01 |  | 🔲 a computar |\n", "utf8");
  r = await correr("cerrar", "0001-prueba", ...comun);
  comprobar("no archiva un caso con plazos sin resolver",
    r.code === 1 && /🔲|invisibles/u.test(r.err), `code=${r.code} err=${r.err.slice(0, 120)}`);

  await writeFile(plazos,
    "| Acto | Tipo | Inicio | Vencimiento | Estado |\n|---|---|---|---|---|\n" +
    "| contestar demanda | hábiles judiciales | 2026-08-01 | 2026-08-20 | computado |\n", "utf8");
  r = await correr("cerrar", "0001-prueba", ...comun);
  comprobar("archiva cuando no queda nada pendiente", r.code === 0,
    `code=${r.code} err=${r.err.slice(0, 120)}`);

  const cerrada = await readFile(path.join(dirCasos, "0001-prueba", "FICHA.md"), "utf8");
  comprobar("marca el estado como archivado", /\*\*Estado actual:\*\*\s*archivado/.test(cerrada), "");

  await rm(base, { recursive: true, force: true });
  process.stderr.write(`\n[casos] ${pasaron} ok, ${fallaron} mal\n`);
  process.exitCode = fallaron > 0 ? 1 : 0;
}

await main();
