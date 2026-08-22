import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "componentes" / "md-a-documento.py"
SPEC = importlib.util.spec_from_file_location("md_a_documento", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


class MarkdownParsingTests(unittest.TestCase):
    def test_parses_supported_markdown_and_unicode(self):
        blocks = MODULE.parse_markdown(
            "# Título\n\nTexto con **negrita** y comillas “tipográficas”.\n\n"
            "1. Primero\n2. Segundo\n- Viñeta"
        )
        self.assertEqual(
            [(block.kind, block.text, block.level) for block in blocks],
            [
                ("heading", "Título", 1),
                ("paragraph", "Texto con **negrita** y comillas “tipográficas”.", 0),
                ("ordered", "Primero", 0),
                ("ordered", "Segundo", 0),
                ("bullet", "Viñeta", 0),
            ],
        )

    def test_inline_parts_preserve_bold_boundaries(self):
        self.assertEqual(
            list(MODULE.inline_parts("Antes **fuerte** después")),
            [("Antes ", False), ("fuerte", True), (" después", False)],
        )

    def test_output_paths_remove_known_extension(self):
        source = Path("escrito.md")
        self.assertEqual(
            MODULE.output_paths(source, Path("salida/final.pdf")),
            (Path("salida/final.docx"), Path("salida/final.pdf")),
        )

    def test_generates_docx_and_pdf_when_dependencies_are_available(self):
        try:
            import docx  # noqa: F401
            import reportlab  # noqa: F401
        except ImportError:
            self.skipTest("Dependencias opcionales no instaladas")

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "escrito.md"
            source.write_text("# Título\n\nPárrafo con **acentos**.\n", encoding="utf-8")
            exit_code = MODULE.main([str(source)])
            self.assertEqual(exit_code, 0)
            self.assertGreater(source.with_suffix(".docx").stat().st_size, 0)
            self.assertGreater(source.with_suffix(".pdf").stat().st_size, 0)


if __name__ == "__main__":
    unittest.main()
