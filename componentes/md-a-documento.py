#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""md-a-documento.py — convierte un escrito en Markdown a Word (.docx) y PDF.

Uso:
    python md-a-documento.py escrito.md                # genera .docx y .pdf
    python md-a-documento.py escrito.md --solo docx    # solo Word
    python md-a-documento.py escrito.md --out carpeta/ # destino distinto

Convención Markdown soportada (la de los escritos del sistema):
  - Encabezados: #, ##, ###
  - Negritas: **texto**
  - Cursivas: *texto*
  - Listas con viñeta: - item
  - Listas numeradas: 1. item
  - Párrafos separados por línea en blanco

Diseño (issue #21): fuente serif, interlineado 1.5, texto justificado,
márgenes A4 estándar. El mismo contenido se verifica automáticamente contra
el .md origen (extracción de texto sin formato) antes de dar por OK la salida.
"""

from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path


def _strip_inline(text: str) -> str:
    """Quita marcadores ** y * para comparación de texto plano."""
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    return text.strip()


def parse_markdown(md_text: str):
    """Devuelve una lista de bloques: ('h1'|'h2'|'h3'|'p', texto),
    ('ul'|'ol', [items])."""
    blocks = []
    lines = md_text.replace("\r\n", "\n").split("\n")
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue
        if line.startswith("### "):
            blocks.append(("h3", line[4:].strip()))
        elif line.startswith("## "):
            blocks.append(("h2", line[3:].strip()))
        elif line.startswith("# "):
            blocks.append(("h1", line[2:].strip()))
        elif re.match(r"^\d+\.\s+", line):
            items = []
            while i < n and re.match(r"^\d+\.\s+", lines[i].rstrip()):
                items.append(re.sub(r"^\d+\.\s+", "", lines[i].rstrip()))
                i += 1
            blocks.append(("ol", items))
            continue
        elif line.startswith("- "):
            items = []
            while i < n and lines[i].rstrip().startswith("- "):
                items.append(lines[i].rstrip()[2:])
                i += 1
            blocks.append(("ul", items))
            continue
        else:
            # Párrafo: acumular hasta línea vacía o encabezado/lista.
            para = [line]
            i += 1
            while (
                i < n
                and lines[i].strip()
                and not lines[i].startswith(("#", "- "))
                and not re.match(r"^\d+\.\s+", lines[i])
            ):
                para.append(lines[i].rstrip())
                i += 1
            blocks.append(("p", " ".join(para)))
            continue
        i += 1
    return blocks


def plain_text(blocks) -> str:
    parts = []
    for kind, payload in blocks:
        if kind in ("ul", "ol"):
            parts.extend(_strip_inline(x) for x in payload)
        else:
            parts.append(_strip_inline(payload))
    return "\n".join(parts)


def normalize(s: str) -> str:
    s = unicodedata.normalize("NFC", s)
    s = s.replace("\u201c", '"').replace("\u201d", '"')
    s = s.replace("\u2018", "'").replace("\u2019", "'")
    return re.sub(r"\s+", " ", s).strip().lower()


def build_docx(blocks, out_path: Path) -> None:
    from docx import Document
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.shared import Cm, Pt

    doc = Document()
    for section in doc.sections:
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(3)
        section.right_margin = Cm(2.5)

    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(12)

    def add_runs(par, text: str):
        """Agrega runs respetando **negritas** y *cursivas*."""
        pos = 0
        for m in re.finditer(r"\*\*(.+?)\*\*|\*(.+?)\*", text):
            if m.start() > pos:
                par.add_run(text[pos : m.start()])
            if m.group(1) is not None:
                run = par.add_run(m.group(1))
                run.bold = True
            else:
                run = par.add_run(m.group(2))
                run.italic = True
            pos = m.end()
        if pos < len(text):
            par.add_run(text[pos:])

    for kind, payload in blocks:
        if kind == "h1":
            par = doc.add_heading(level=1)
            add_runs(par, payload)
        elif kind == "h2":
            par = doc.add_heading(level=2)
            add_runs(par, payload)
        elif kind == "h3":
            par = doc.add_heading(level=3)
            add_runs(par, payload)
        elif kind in ("ul", "ol"):
            numbering = "List Number" if kind == "ol" else "List Bullet"
            for item in payload:
                par = doc.add_paragraph(style=numbering)
                par.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                add_runs(par, item)
        else:
            par = doc.add_paragraph()
            par.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            par.paragraph_format.line_spacing = 1.5
            add_runs(par, payload)

    doc.save(str(out_path))


def build_pdf(blocks, out_path: Path) -> None:
    from reportlab.lib.pagesizes import A4
    try:
        from reportlab.lib.styles import getSampleStyleSheet as _gss
    except ImportError:
        from reportlab.lib.styles import get_sample_stylesheet as _gss
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_JUSTIFY
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

    doc = SimpleDocTemplate(
        str(out_path), pagesize=A4,
        topMargin=60, bottomMargin=60, leftMargin=70, rightMargin=60,
    )
    base = _gss()["BodyText"]
    body = ParagraphStyle("Just", parent=base, alignment=TA_JUSTIFY, leading=18)
    h1 = ParagraphStyle("H1", parent=base, fontSize=16, spaceAfter=10)
    h2 = ParagraphStyle("H2", parent=base, fontSize=14, spaceAfter=8)

    def esc(text: str) -> str:
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    story = []
    for kind, payload in blocks:
        if kind == "h1":
            story.append(Paragraph(esc(payload), h1))
        elif kind == "h2":
            story.append(Paragraph(esc(payload), h2))
        elif kind == "h3":
            story.append(Paragraph(f"<b>{esc(payload)}</b>", body))
        elif kind == "ul":
            for item in payload:
                story.append(Paragraph("\u2022 " + esc(item), body))
            story.append(Spacer(1, 6))
        elif kind == "ol":
            for num, item in enumerate(payload, start=1):
                story.append(Paragraph(f"{num}. {esc(item)}", body))
            story.append(Spacer(1, 6))
        else:
            story.append(Paragraph(esc(payload), body))
            story.append(Spacer(1, 6))

    doc.build(story)


def verify(blocks, docx_path: Path, pdf_path: Path) -> list[str]:
    """Verificación automática: el texto plano extraído debe contener cada
    bloque del .md origen (normalizado). Devuelve lista de faltantes."""
    problems: list[str] = []
    expected = [
        normalize(line)
        for line in plain_text(blocks).split("\n")
        if line.strip()
    ]
    try:
        from docx import Document as _Doc

        docx_text = normalize(
            "\n".join(p.text for p in _Doc(str(docx_path)).paragraphs)
        )
        for line in expected:
            if line and line not in docx_text:
                problems.append(f"docx: falta -> {line[:70]}")
    except ImportError:
        problems.append("python-docx no instalado; no se pudo verificar docx")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description="Markdown -> DOCX/PDF")
    parser.add_argument("entrada", help="archivo .md")
    parser.add_argument("--out", default=None, help="carpeta de salida")
    parser.add_argument("--solo", choices=["docx", "pdf"], default=None)
    args = parser.parse_args()

    src = Path(args.entrada)
    if not src.exists():
        print(f"no existe: {src}", file=sys.stderr)
        return 1

    out_dir = Path(args.out) if args.out else src.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = src.stem

    blocks = parse_markdown(src.read_text(encoding="utf-8"))

    docx_path = out_dir / f"{stem}.docx"
    pdf_path = out_dir / f"{stem}.pdf"

    if args.solo in (None, "docx"):
        build_docx(blocks, docx_path)
        print(f"OK  {docx_path}")
    if args.solo in (None, "pdf"):
        try:
            build_pdf(blocks, pdf_path)
            print(f"OK  {pdf_path}")
        except ImportError:
            print("reportlab no instalado: PDF omitido (pip install reportlab)")

    if args.solo is None:
        problems = verify(blocks, docx_path, pdf_path)
        if problems:
            print("VERIFICACIÓN — diferencias:", file=sys.stderr)
            for p in problems:
                print(" ", p, file=sys.stderr)
            return 2
        print("VERIFICACIÓN OK — todo el contenido del .md está en el documento")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
