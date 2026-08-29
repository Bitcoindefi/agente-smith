#!/usr/bin/env node
// Tests del registro de desvios
// ------------------------------------------------
// Lo que importa comprobar: que no proponga cambiar una ficha antes de tiempo,
// que la ventana movil descarte lo viejo, y que avise cuando ningun registro
// tiene fuente citada.
//
// Todo en /tmp. Uso:
//   node test/desvios-test.mjs

import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const ejecutar = promisify(execFile);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(AQUI, "..", "componentes", "desvios", "desvios.mjs");

let pasaron = 0, fallaron = 0;
const ok = (n) => { pasaron += 1; process.stderr.write(`[desvios] ok   ${n}\n`); };
const mal = (n, d) => { fallaron += 1; process.stderr.write(`[desvios] MAL  ${n}\n         ${d}\n`); };
const comprobar = (n, c, d) => (c ? ok(n) : mal(n, d));

async function correr(reg, ...argv) {
  try {
    const r = await ejecutar("node", [SCRIPT, ...argv, "--registro", reg]);
    return { code: 0, out: r.stdout, err: r.stderr };
  } catch (e) {
    return { code: e.code ?? 1, out: e.stdout ?? "", err: e.stderr ?? String(e) };
  }
}

const hace = (meses) => {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return d.toISOString().slice(0, 10);
};

const linea = (o) => JSON.stringify({
  fecha: hace(1), jurisdiccion: "Salta", tema: "plazo-traslado",
  ficha: "10 dias habiles", aplicado: "5 dias habiles",
  juzgado: null, fuente: null, caso: null, ...o,
}) + "\n";

async function main() {
  const base = await mkdtemp(path.join(tmpdir(), "desvios-"));
  const reg = path.join(base, "desvios.jsonl");

  // --- anotar ---
  let r = await correr(reg, "anotar", "--jurisdiccion", "Salta", "--tema", "plazo-traslado");
  comprobar("no anota sin las dos versiones", r.code === 64 && /--ficha|--aplicado/.test(r.err),
    `code=${r.code} err=${r.err.slice(0, 90)}`);

  r = await correr(reg, "anotar", "--jurisdiccion", "Salta", "--tema", "plazo-traslado",
    "--ficha", "10 dias habiles", "--aplicado", "5 dias habiles");
  comprobar("anota cuando estan las dos", r.code === 0, `code=${r.code} err=${r.err.slice(0,90)}`);
  comprobar("avisa que falta la fuente", /sin fuente/i.test(r.out), r.out.slice(0, 90));

  r = await correr(reg, "anotar", "--jurisdiccion", "Salta", "--tema", "otro",
    "--ficha", "a", "--aplicado", "b", "--fuente", "Acordada 12/2026");
  comprobar("con fuente no avisa", r.code === 0 && !/sin fuente/i.test(r.out), r.out.slice(0, 90));

  // --- el umbral ---
  await writeFile(reg, linea({}).repeat(4), "utf8");
  r = await correr(reg, "revisar");
  comprobar("con 4 repeticiones no propone nada",
    r.code === 0 && /Nada que proponer/i.test(r.out), r.out.slice(0, 110));

  await writeFile(reg, linea({}).repeat(5), "utf8");
  r = await correr(reg, "revisar");
  comprobar("con 5 sí propone", r.code === 1 && /umbral/i.test(r.out), r.out.slice(0, 110));
  comprobar("apunta a la ficha de la jurisdicción",
    /jurisdicciones\/salta\.md/.test(r.out), r.out.slice(0, 200));
  comprobar("avisa que ninguno tiene fuente",
    /ninguno de estos registros tiene fuente/i.test(r.out), r.out.slice(0, 240));

  // --- la ventana movil ---
  await writeFile(reg, linea({ fecha: hace(20) }).repeat(9), "utf8");
  r = await correr(reg, "revisar");
  comprobar("descarta lo de hace 20 meses",
    r.code === 0 && /Nada que proponer/i.test(r.out), r.out.slice(0, 110));

  await writeFile(reg, linea({ fecha: hace(20) }).repeat(9) + linea({}).repeat(5), "utf8");
  r = await correr(reg, "revisar");
  comprobar("pero cuenta lo reciente aunque haya viejo",
    r.code === 1 && /5 veces/.test(r.out), r.out.slice(0, 200));

  // --- no mezclar temas ni jurisdicciones ---
  await writeFile(reg,
    linea({ tema: "a" }).repeat(3) + linea({ tema: "b" }).repeat(3), "utf8");
  r = await correr(reg, "revisar");
  comprobar("no suma dos temas distintos para llegar al umbral",
    r.code === 0 && /Nada que proponer/i.test(r.out), r.out.slice(0, 110));

  await writeFile(reg,
    linea({ jurisdiccion: "Salta" }).repeat(3) + linea({ jurisdiccion: "Jujuy" }).repeat(3), "utf8");
  r = await correr(reg, "revisar");
  comprobar("ni dos jurisdicciones distintas",
    r.code === 0 && /Nada que proponer/i.test(r.out), r.out.slice(0, 110));

  // --- listar ---
  await writeFile(reg, linea({ fuente: "Acordada 3/2026" }) + linea({}), "utf8");
  r = await correr(reg, "listar");
  comprobar("listar cuenta los que no tienen fuente",
    /1 sin fuente/.test(r.out), r.out.slice(0, 200));

  // --- registro inexistente ---
  r = await correr(path.join(base, "no-existe.jsonl"), "revisar");
  comprobar("un registro que no existe no rompe", r.code === 0, `code=${r.code} err=${r.err.slice(0,90)}`);

  await rm(base, { recursive: true, force: true });
  process.stderr.write(`\n[desvios] ${pasaron} ok, ${fallaron} mal\n`);
  process.exitCode = fallaron > 0 ? 1 : 0;
}

await main();
