#!/usr/bin/env node
/**
 * Abre, lista, valida y cierra expedientes en `casos/`.
 *
 * Existe por una razón concreta: el vigía de vencimientos reporta como
 * "bloqueado" todo caso al que le falta la jurisdicción o el fuero en la ficha,
 * y esos casos no nacen bloqueados por descuido. Nacen así porque abrir un caso
 * hoy es copiar una carpeta a mano y completar un formulario después, y el
 * "después" a veces no llega.
 *
 * Este script no reemplaza ese formulario: lo pide antes de dejar el caso
 * abierto, que es distinto.
 *
 * Uso:
 *   node componentes/casos/casos.mjs nuevo <nombre> --jurisdiccion <j> --fuero <f> [--caratula "..."]
 *   node componentes/casos/casos.mjs listar [--json]
 *   node componentes/casos/casos.mjs validar [<nombre>]
 *   node componentes/casos/casos.mjs cerrar <nombre>
 *
 *   --casos <dir>   dónde viven los expedientes (default: ./casos)
 */

import { readdir, readFile, writeFile, mkdir, cp, access } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const comando = args[0];
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};
const DIR = opt('casos', 'casos');
const PLANTILLA = opt('plantilla', '_PLANTILLA-CASO');
const JSON_OUT = args.includes('--json');

/** Las tres jurisdicciones que el proyecto tiene fichadas. */
const JURISDICCIONES = ['CABA-Nacional', 'Jujuy', 'Salta'];

/** Los fueros que la ficha nombra. Se acepta "otro" a texto libre. */
const FUEROS = [
  'civil y comercial', 'penal', 'familia', 'laboral',
  'contencioso administrativo', 'previsional',
];

const existe = async (p) => { try { await access(p); return true; } catch { return false; } };

/** Lee un campo `- **Etiqueta:** valor` de una ficha, ignorando el paréntesis de ayuda. */
function campo(md, etiqueta) {
  const m = md.match(new RegExp(`\\*\\*${etiqueta}:?\\*\\*\\s*(.*)`, 'i'));
  if (!m) return null;
  const v = m[1].replace(/\(.*?\)/g, '').trim();
  return v === '' ? null : v;
}

/** Reemplaza un campo de la ficha dejando el resto intacto. */
function completar(md, etiqueta, valor) {
  // Acotado a una linea a proposito: con `\s*.*` el espacio en blanco incluye
  // el salto de linea, asi que completar un campo se comia el siguiente.
  // Completar "Fecha de inicio" borraba "Estado actual".
  const re = new RegExp(`(\\*\\*${etiqueta}:?\\*\\*)[^\\n]*`, 'i');
  return re.test(md) ? md.replace(re, `$1 ${valor}`) : md;
}

// ---------------------------------------------------------------- nuevo

async function nuevo() {
  const nombre = args[1];
  if (!nombre || nombre.startsWith('--')) {
    console.error('  falta el nombre del caso.');
    console.error('  sugerencia: AAAA-NNN-caratula-corta, por ejemplo 2026-014-perez-c-anses');
    process.exitCode = 64;
    return;
  }

  const jurisdiccion = opt('jurisdiccion');
  const fuero = opt('fuero');

  // La regla dura del proyecto, aplicada al momento de crear en vez de al de
  // computar: un caso sin jurisdiccion es un caso con todos sus plazos ciegos.
  const faltan = [];
  if (!jurisdiccion) faltan.push('--jurisdiccion');
  if (!fuero) faltan.push('--fuero');
  if (faltan.length) {
    console.error(`  falta ${faltan.join(' y ')}.`);
    console.error('');
    console.error('  No es un dato administrativo: sin jurisdicción y fuero no se puede');
    console.error('  computar ningún plazo, y el caso queda abierto con los vencimientos');
    console.error('  invisibles. Si todavía no los sabés, no abras el caso: averiguálos.');
    console.error('');
    console.error(`  jurisdicciones fichadas: ${JURISDICCIONES.join(' · ')}`);
    console.error(`  fueros: ${FUEROS.join(' · ')} · otro`);
    process.exitCode = 64;
    return;
  }

  if (!JURISDICCIONES.some((j) => j.toLowerCase() === jurisdiccion.toLowerCase())) {
    console.error(`  "${jurisdiccion}" no es una jurisdicción fichada.`);
    console.error(`  Hay ficha para: ${JURISDICCIONES.join(', ')}.`);
    console.error('  Si trabajás en otra, agregá su ficha en jurisdicciones/ primero:');
    console.error('  sin ella el cómputo de plazos no tiene contra qué verificarse.');
    process.exitCode = 64;
    return;
  }

  const destino = path.join(DIR, nombre);
  if (await existe(destino)) {
    console.error(`  ya existe ${destino}`);
    process.exitCode = 1;
    return;
  }
  if (!(await existe(PLANTILLA))) {
    console.error(`  no encuentro la plantilla en ${PLANTILLA}`);
    process.exitCode = 2;
    return;
  }

  await mkdir(DIR, { recursive: true });
  await cp(PLANTILLA, destino, { recursive: true });

  const fichaPath = path.join(destino, 'FICHA.md');
  let ficha = await readFile(fichaPath, 'utf8');
  ficha = completar(ficha, 'Jurisdicción', jurisdiccion);
  ficha = completar(ficha, 'Fuero', fuero);
  const caratula = opt('caratula');
  if (caratula) ficha = completar(ficha, 'Carátula', caratula);
  ficha = completar(ficha, 'Fecha de inicio', new Date().toISOString().slice(0, 10));
  await writeFile(fichaPath, ficha, 'utf8');

  // La ficha de la jurisdicción es lo primero que hay que leer para este caso.
  const notas = path.join(destino, 'notas.md');
  if (await existe(notas)) {
    const j = jurisdiccion.toLowerCase().replace(/[^a-z-]/g, '');
    await writeFile(notas,
      (await readFile(notas, 'utf8')) +
      `\n\n## Referencia de jurisdicción\n\n` +
      `Este caso tramita en **${jurisdiccion}**, fuero **${fuero}**.\n` +
      `Antes de computar cualquier plazo, leé \`jurisdicciones/${j}.md\`.\n`,
      'utf8');
  }

  console.log(`  Caso abierto en ${destino}`);
  console.log(`    jurisdicción: ${jurisdiccion}    fuero: ${fuero}`);
  console.log('');
  console.log('  Falta completar en FICHA.md: partes, objeto y estrategia.');
  console.log('  Los plazos van en plazos.md, computados con `argentina-plazos`.');
}

// --------------------------------------------------------------- listar

async function leerCasos() {
  let entradas = [];
  try {
    entradas = await readdir(DIR, { withFileTypes: true });
  } catch { return []; }

  const out = [];
  for (const e of entradas) {
    if (!e.isDirectory() || e.name.startsWith('_') || e.name.startsWith('.')) continue;
    const f = path.join(DIR, e.name, 'FICHA.md');
    let md = '';
    try { md = await readFile(f, 'utf8'); } catch { /* sin ficha */ }
    out.push({
      caso: e.name,
      caratula: campo(md, 'Carátula'),
      expediente: campo(md, 'N° de expediente'),
      jurisdiccion: campo(md, 'Jurisdicción'),
      fuero: campo(md, 'Fuero'),
      estado: campo(md, 'Estado actual'),
      completo: Boolean(campo(md, 'Jurisdicción') && campo(md, 'Fuero')),
    });
  }
  return out;
}

async function listar() {
  const casos = await leerCasos();
  if (JSON_OUT) { console.log(JSON.stringify(casos, null, 2)); return; }
  if (!casos.length) { console.log(`  No hay expedientes en ${DIR}`); return; }

  console.log(`\n  ${casos.length} expediente(s)\n`);
  for (const c of casos) {
    const marca = c.completo ? '  ' : '⚠️';
    console.log(`  ${marca} ${c.caso}`);
    console.log(`      ${c.caratula || '(sin carátula)'}`);
    console.log(`      ${c.jurisdiccion || 'SIN JURISDICCIÓN'} · ${c.fuero || 'SIN FUERO'} · ${c.estado || 'sin estado'}`);
  }
  const incompletos = casos.filter((c) => !c.completo).length;
  if (incompletos) {
    console.log(`\n  ${incompletos} con la ficha incompleta: sus plazos no se pueden computar.`);
    process.exitCode = 1;
  }
}

// --------------------------------------------------------------- validar

async function validar() {
  const soloUno = args[1] && !args[1].startsWith('--') ? args[1] : null;
  const casos = (await leerCasos()).filter((c) => !soloUno || c.caso === soloUno);
  if (!casos.length) {
    console.error(soloUno ? `  no encuentro el caso ${soloUno}` : `  no hay expedientes en ${DIR}`);
    process.exitCode = 1;
    return;
  }

  let problemas = 0;
  for (const c of casos) {
    const faltan = [];
    if (!c.jurisdiccion) faltan.push('jurisdicción');
    if (!c.fuero) faltan.push('fuero');
    if (!c.caratula) faltan.push('carátula');
    if (!(await existe(path.join(DIR, c.caso, 'plazos.md')))) faltan.push('plazos.md');

    if (faltan.length) {
      problemas += 1;
      console.log(`  ⚠️  ${c.caso}: falta ${faltan.join(', ')}`);
    } else {
      console.log(`  ok  ${c.caso}`);
    }
  }
  if (problemas) {
    console.log(`\n  ${problemas} caso(s) con la ficha incompleta.`);
    console.log('  Los que no declaran jurisdicción y fuero tienen todos sus plazos ciegos.');
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------- cerrar

async function cerrar() {
  const nombre = args[1];
  if (!nombre || nombre.startsWith('--')) {
    console.error('  falta el nombre del caso.');
    process.exitCode = 64;
    return;
  }
  const fichaPath = path.join(DIR, nombre, 'FICHA.md');
  if (!(await existe(fichaPath))) {
    console.error(`  no encuentro ${fichaPath}`);
    process.exitCode = 1;
    return;
  }

  // Antes de archivar, avisar si queda algun plazo sin resolver: un caso
  // cerrado deja de mirarse, y un plazo pendiente adentro deja de existir.
  const plazosPath = path.join(DIR, nombre, 'plazos.md');
  if (await existe(plazosPath)) {
    const pendientes = (await readFile(plazosPath, 'utf8'))
      .split('\n')
      .filter((l) => l.trim().startsWith('|') && /🔲/u.test(l) && !/^_.*_$/.test(l.split('|')[1]?.trim() ?? ''));
    if (pendientes.length) {
      console.error(`  ${nombre} tiene ${pendientes.length} plazo(s) todavía marcados 🔲.`);
      console.error('');
      console.error('  Un caso archivado deja de aparecer en el vigía. Si esos plazos');
      console.error('  siguen corriendo, cerrarlo ahora los vuelve invisibles.');
      console.error('  Resolvelos o quitá la marca antes de cerrar.');
      process.exitCode = 1;
      return;
    }
  }

  const ficha = completar(await readFile(fichaPath, 'utf8'), 'Estado actual', 'archivado');
  await writeFile(fichaPath, ficha, 'utf8');
  console.log(`  ${nombre} marcado como archivado.`);
  console.log('  La carpeta queda donde está: no se borra nada.');
}

// ---------------------------------------------------------------- despacho

const comandos = { nuevo, listar, validar, cerrar };
if (!comando || !comandos[comando]) {
  console.error('  uso: casos.mjs <nuevo|listar|validar|cerrar> [...]');
  console.error('');
  console.error('    nuevo <nombre> --jurisdiccion <j> --fuero <f> [--caratula "..."]');
  console.error('    listar [--json]');
  console.error('    validar [<nombre>]');
  console.error('    cerrar <nombre>');
  process.exitCode = 64;
} else {
  await comandos[comando]();
}
