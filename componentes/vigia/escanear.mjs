#!/usr/bin/env node
/**
 * Escanea `casos/` y reporta el estado de los plazos de cada expediente.
 *
 * Este script NO computa ningún plazo, y eso es deliberado. El cómputo depende
 * de la jurisdicción, del tipo de plazo, de la feria y de las acordadas del
 * tribunal, y la regla del proyecto es que eso lo resuelve `argentina-plazos`
 * después de confirmar el fuero. Un script que se pusiera a restar días
 * hábiles estaría adivinando exactamente lo que la regla prohíbe adivinar.
 *
 * Lo que sí hace es lo mecánico, que es donde se pierden los plazos de verdad:
 * recorrer veinte carpetas, leer veinte tablas, y decir cuáles tienen filas sin
 * computar, cuáles vencen pronto y cuáles no se pueden computar todavía porque
 * a la ficha le falta la jurisdicción.
 *
 * Uso:
 *   node componentes/vigia/escanear.mjs [--casos <dir>] [--json] [--dias <n>]
 *
 *   --casos   dónde están los expedientes (default: ./casos)
 *   --json    salida en JSON, para encadenar
 *   --dias    ventana de "vence pronto" en días corridos (default: 15)
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : porDefecto;
};
const DIR_CASOS = opt('casos', 'casos');
const VENTANA = Number(opt('dias', '15'));
const JSON_OUT = args.includes('--json');

/** Marcas del proyecto: 🔲 es pendiente, 🔴 es fatal. */
const PENDIENTE = /🔲/u;
const FATAL = /🔴/u;

/** Una fila de la tabla de plazos, tal como está escrita. */
function parsearFilas(md) {
  const filas = [];
  for (const linea of md.split('\n')) {
    const l = linea.trim();
    if (!l.startsWith('|') || !l.endsWith('|')) continue;
    const celdas = l.slice(1, -1).split('|').map((c) => c.trim());
    if (celdas.length < 5) continue;
    // Cabecera y separador de la tabla markdown.
    if (/^-+$/.test(celdas[0].replace(/[\s:]/g, ''))) continue;
    if (/^acto\b/i.test(celdas[0])) continue;
    // Fila vacía de la plantilla.
    if (celdas.every((c) => c === '')) continue;
    // La fila de ejemplo que trae la plantilla, entre guiones bajos.
    if (/^_.*_$/.test(celdas[0])) continue;

    filas.push({
      acto: celdas[0],
      tipo: celdas[1],
      inicio: celdas[2],
      vencimiento: celdas[3],
      estado: celdas[4],
    });
  }
  return filas;
}

/** Una fecha suelta escrita como la escribe una persona. */
function leerFecha(texto) {
  if (!texto) return null;
  const t = texto.trim();
  let m = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = t.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  return null;
}

/** La jurisdicción y el fuero declarados en la ficha, o null si faltan. */
function leerFicha(md) {
  const campo = (etiqueta) => {
    const re = new RegExp(`\\*\\*${etiqueta}:?\\*\\*\\s*(.*)`, 'i');
    const m = md.match(re);
    if (!m) return null;
    // Se descarta el paréntesis de ayuda que trae la plantilla sin completar.
    const v = m[1].replace(/\(.*?\)/g, '').trim();
    return v === '' ? null : v;
  };
  return {
    caratula: campo('Carátula'),
    expediente: campo('N° de expediente'),
    jurisdiccion: campo('Jurisdicción'),
    fuero: campo('Fuero'),
    estado: campo('Estado actual'),
  };
}

const hoy = new Date();
hoy.setUTCHours(0, 0, 0, 0);
const diasHasta = (f) => Math.round((f - hoy) / 86400000);

async function escanear() {
  let entradas;
  try {
    entradas = await readdir(DIR_CASOS, { withFileTypes: true });
  } catch {
    return { error: `no pude leer ${DIR_CASOS}`, casos: [] };
  }

  const casos = [];
  for (const e of entradas) {
    if (!e.isDirectory() || e.name.startsWith('_') || e.name.startsWith('.')) continue;
    const base = path.join(DIR_CASOS, e.name);

    let ficha = {};
    try {
      ficha = leerFicha(await readFile(path.join(base, 'FICHA.md'), 'utf8'));
    } catch {
      ficha = { falta_ficha: true };
    }

    let filas = [];
    let sinArchivo = false;
    try {
      filas = parsearFilas(await readFile(path.join(base, 'plazos.md'), 'utf8'));
    } catch {
      sinArchivo = true;
    }

    const plazos = filas.map((f) => {
      const venc = leerFecha(f.vencimiento);
      return {
        ...f,
        fatal: FATAL.test(f.estado) || FATAL.test(f.acto),
        sinComputar: venc === null || PENDIENTE.test(f.estado),
        dias: venc ? diasHasta(venc) : null,
      };
    });

    casos.push({
      caso: e.name,
      ...ficha,
      sinArchivoDePlazos: sinArchivo,
      // La regla dura del proyecto: sin jurisdicción no se computa nada.
      puedeComputarse: Boolean(ficha.jurisdiccion && ficha.fuero),
      plazos,
    });
  }
  return { casos };
}

function informar({ casos, error }) {
  if (error) {
    console.error(`  ${error}`);
    process.exitCode = 2;
    return;
  }
  if (casos.length === 0) {
    console.log('  No hay expedientes en ' + DIR_CASOS);
    return;
  }

  const bloqueados = casos.filter((c) => !c.puedeComputarse);
  const sinComputar = casos.flatMap((c) =>
    c.plazos.filter((p) => p.sinComputar).map((p) => ({ ...p, caso: c.caso })),
  );
  const proximos = casos
    .flatMap((c) => c.plazos.filter((p) => p.dias !== null).map((p) => ({ ...p, caso: c.caso })))
    .filter((p) => p.dias <= VENTANA)
    .sort((a, b) => a.dias - b.dias);

  console.log(`\n  ${casos.length} expedientes revisados el ${hoy.toISOString().slice(0, 10)}\n`);

  // Lo vencido y lo inminente primero: es lo único que puede costar un derecho hoy.
  if (proximos.length) {
    console.log('  ── Vencen dentro de ' + VENTANA + ' días ──');
    for (const p of proximos) {
      const marca = p.dias < 0 ? '⛔ VENCIDO' : p.fatal ? '🔴 fatal ' : '   ';
      const cuando = p.dias < 0 ? `hace ${-p.dias}d` : `en ${p.dias}d`;
      console.log(`  ${marca} ${cuando.padEnd(9)} ${p.caso} · ${p.acto}`);
    }
    console.log('');
  }

  // El modo de falla real: nadie lo computó todavía.
  if (sinComputar.length) {
    console.log('  ── Sin computar ──');
    console.log('  (una fila sin vencimiento no es un plazo holgado: es un plazo que nadie miró)');
    for (const p of sinComputar) {
      console.log(`  🔲 ${p.caso} · ${p.acto || '(sin acto)'} · ${p.tipo || 'tipo sin declarar'}`);
    }
    console.log('');
  }

  // Y lo que ni siquiera se puede computar todavía.
  if (bloqueados.length) {
    console.log('  ── No se pueden computar: falta jurisdicción o fuero en la FICHA ──');
    for (const c of bloqueados) {
      const falta = [
        c.jurisdiccion ? null : 'jurisdicción',
        c.fuero ? null : 'fuero',
      ].filter(Boolean).join(' y ');
      console.log(`  ⚠️  ${c.caso} · falta ${falta || 'la ficha entera'}`);
    }
    console.log('');
  }

  const limpios = casos.length - new Set([
    ...proximos.map((p) => p.caso),
    ...sinComputar.map((p) => p.caso),
    ...bloqueados.map((c) => c.caso),
  ]).size;
  console.log(`  ${limpios} expediente(s) sin nada pendiente en esta ventana.`);

  if (proximos.some((p) => p.dias < 0) || sinComputar.length || bloqueados.length) {
    process.exitCode = 1;
  }
}

const resultado = await escanear();
if (JSON_OUT) console.log(JSON.stringify(resultado, null, 2));
else informar(resultado);
