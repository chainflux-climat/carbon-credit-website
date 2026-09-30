#!/usr/bin/env python3
"""Generate the brand assets in src/assets.

The logo is the product's own (src/brand/climat-logo.svg, the mark used on the app's
sign-in page). This script derives from it: a header version whose lettering follows
the text colour, the icon on its own, the PNG icons, and the social image. Headline
text is converted to outlines, so it renders the same everywhere.

Requires: fonttools, brotli, pillow (pip) and rsvg-convert on PATH (brew install librsvg).
    python3 tools/make_assets.py
"""
import pathlib
import re
import subprocess

from fontTools import subset
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = ROOT / "legacy" / "fonts"
OUT = ROOT / "src" / "assets"
(OUT / "fonts").mkdir(parents=True, exist_ok=True)
(OUT / "og").mkdir(parents=True, exist_ok=True)

TEAL, TEAL_DEEP, MINT, AMBER, WHITE, ON_DARK_MUTED, LOGO_INK = "#0D5058", "#083B41", "#B7EDE0", "#F3BA4D", "#ffffff", "#b9d3d0", "#01434B"
_cache = {}


def font(name):
    if name not in _cache:
        _cache[name] = TTFont(FONTS / name)
    return _cache[name]


def text_path(font_file, text, size, x=0.0, y=0.0, tracking=0.0):
    """Outline `text` with its baseline at (x, y). Returns (path data, advance width)."""
    f = font(font_file)
    glyphs, cmap = f.getGlyphSet(), f.getBestCmap()
    scale = size / f["head"].unitsPerEm
    cursor, parts = 0.0, []
    for ch in text:
        name = cmap.get(ord(ch), ".notdef")
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x + cursor, y)))
        if pen.getCommands():
            parts.append(pen.getCommands())
        cursor += glyphs[name].width * scale + tracking
    return " ".join(parts), cursor


def render(svg_path, png_path, width):
    subprocess.run(["rsvg-convert", "-w", str(width), str(svg_path), "-o", str(png_path)], check=True)


# 1. web fonts: Latin subset, woff2
UNICODES = "U+0020-007E,U+00A0-00FF,U+2011,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+2192,U+2212"
for src, dst in (("Poppins-Medium.ttf", "poppins-500.woff2"), ("Poppins-Bold.ttf", "poppins-700.woff2")):
    subset.main([str(FONTS / src), f"--output-file={OUT / 'fonts' / dst}", "--flavor=woff2", f"--unicodes={UNICODES}",
                 "--layout-features=kern,liga", "--no-hinting", "--desubroutinize"])

# 2. the logo, split into its icon and its lettering
source = (ROOT / "src" / "brand" / "climat-logo.svg").read_text()
view = re.search(r'viewBox="([^"]+)"', source).group(1)
inner = re.search(r"<svg[^>]*>([\s\S]*)</svg>", source).group(1).strip()
elements = re.findall(r"<(?:path|rect|ellipse|circle)\b[^>]*/>", inner)
lettering = [e for e in elements if LOGO_INK.lower() in e.lower()]
icon = [e for e in elements if e not in lettering]
assert icon and lettering, "logo structure changed: expected an icon and lettering"
defs = (re.search(r"<defs>[\s\S]*?</defs>", source) or [""])[0]  # the icon's strokes are gradients defined here
icon.append(defs)
letters = "".join(lettering).replace(LOGO_INK, "currentColor").replace(LOGO_INK.lower(), "currentColor")
# Two fixed files rather than one inlined SVG: they are cached once and keep every page small.
for name, colour in (("logo.svg", LOGO_INK), ("logo-on-dark.svg", WHITE)):
    (OUT / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" fill="none" color="{colour}">{"".join(icon)}{letters}</svg>\n')
(OUT / "favicon.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">{"".join(icon)}</svg>\n')

# 3. PNG icons: the icon on the brand teal, so it survives any background a device puts behind it
tile = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" fill="{TEAL}"/>'
        f'<g transform="translate(11 11) scale(0.875)">{"".join(icon)}</g></svg>\n')
tile_svg = OUT / "_tile.svg"
tile_svg.write_text(tile)
for name, size in (("logo-512.png", 512), ("icon-192.png", 192), ("apple-touch-icon.png", 180)):
    render(tile_svg, OUT / name, size)
tmp = OUT / "_ico.png"
render(OUT / "favicon.svg", tmp, 256)
Image.open(tmp).save(OUT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
tmp.unlink()
tile_svg.unlink()

# 4. social image, 1200 x 630
W, H, X = 1200, 630, 84
lines = [("From project idea", WHITE), ("to a validation‑ready", AMBER), ("project document.", WHITE)]
size, lead, top = 62, 80, 276
headline = ""
for i, (txt, colour) in enumerate(lines):
    ld, _ = text_path("Poppins-Bold.ttf", txt.replace("‑", "-"), size, X, top + i * lead, tracking=-1.2)
    headline += f'<path fill="{colour}" d="{ld}"/>'
foot_d, _ = text_path("Poppins-Medium.ttf", "For carbon project developers  ·  climat.today", 27, X, 548)
grid = "".join(f'<path d="M{x} 0V{H}"/>' for x in range(0, W + 1, 60)) + "".join(f'<path d="M0 {y}H{W}"/>' for y in range(0, H + 1, 60))
doc = (
    '<g transform="translate(872 318) rotate(-7)">'
    '<rect width="400" height="420" rx="18" fill="#ffffff"/>'
    '<rect width="400" height="46" rx="18" fill="#f2f7f5"/><rect y="28" width="400" height="18" fill="#f2f7f5"/>'
    '<rect x="26" y="17" width="120" height="10" rx="5" fill="#b9cdc8"/>'
    '<rect x="26" y="74" width="200" height="14" rx="7" fill="#141d1b"/>'
    f'<rect x="26" y="108" width="4" height="58" fill="{AMBER}"/>'
    '<rect x="44" y="112" width="300" height="11" rx="5.5" fill="#cfdcd8"/>'
    f'<rect x="44" y="132" width="178" height="18" rx="4" fill="{AMBER}" opacity=".5"/>'
    '<rect x="44" y="136" width="170" height="11" rx="5.5" fill="#7f8f8a"/>'
    '<rect x="230" y="136" width="96" height="11" rx="5.5" fill="#cfdcd8"/>'
    '<rect x="26" y="192" width="340" height="150" rx="12" fill="none" stroke="#dae5e1" stroke-width="2"/>'
    '<rect x="44" y="212" width="92" height="24" rx="12" fill="none" stroke="#8a5a00" stroke-width="2"/>'
    '<rect x="58" y="220" width="64" height="8" rx="4" fill="#8a5a00"/>'
    '<rect x="146" y="212" width="130" height="24" rx="12" fill="none" stroke="#7f8f8a" stroke-width="2"/>'
    '<rect x="44" y="256" width="290" height="10" rx="5" fill="#cfdcd8"/>'
    '<rect x="44" y="278" width="250" height="10" rx="5" fill="#cfdcd8"/>'
    '<rect x="44" y="300" width="200" height="10" rx="5" fill="#cfdcd8"/>'
    '</g>')
logo_on_dark = f'<g transform="translate({X} 78) scale(1.25)" color="{WHITE}">{"".join(icon)}{letters}</g>'
og = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" fill="none">'
      f'<defs><radialGradient id="fade" cx="78%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
      f'<mask id="m"><rect width="{W}" height="{H}" fill="url(#fade)"/></mask></defs>'
      f'<rect width="{W}" height="{H}" fill="{TEAL}"/>'
      f'<g stroke="#fff" stroke-width="1" mask="url(#m)">{grid}</g>'
      f'{doc}{logo_on_dark}{headline}<path fill="{ON_DARK_MUTED}" d="{foot_d}"/></svg>\n')
svg = OUT / "og" / "climat-og.svg"
svg.write_text(og)
render(svg, OUT / "og" / "climat-og.png", W)
svg.unlink()
png = OUT / "og" / "climat-og.png"
Image.open(png).convert("RGB").save(png, optimize=True)

for f in sorted(OUT.rglob("*")):
    if f.is_file():
        print(f"{f.stat().st_size / 1024:8.1f} KB  {f.relative_to(ROOT)}")
