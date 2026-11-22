"""Génère le logo (cœur avec bonnet de Noël) en SVG, puis les icônes PNG."""
import subprocess, pathlib

OUT = pathlib.Path("/home/claude/calendrier-avent/icons")

DEFS = """
  <linearGradient id="lgCoeur" x1="0.15" y1="0.1" x2="0.85" y2="0.95">
    <stop offset="0" stop-color="#ff86a0"/><stop offset="0.55" stop-color="#f04a72"/><stop offset="1" stop-color="#c41f52"/>
  </linearGradient>
  <radialGradient id="lgOmbre" cx="0.5" cy="1" r="0.75">
    <stop offset="0.45" stop-color="#7a0a33" stop-opacity="0"/><stop offset="1" stop-color="#7a0a33" stop-opacity="0.4"/>
  </radialGradient>
  <linearGradient id="lgBonnet" x1="0" y1="0" x2="1" y2="0.4">
    <stop offset="0" stop-color="#e8303a"/><stop offset="0.6" stop-color="#c4141f"/><stop offset="1" stop-color="#8e0a14"/>
  </linearGradient>
  <linearGradient id="lgFourrure" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ece2d4"/>
  </linearGradient>
"""

COEUR = """
<g id="coeur-bonnet">
  <!-- coeur -->
  <path d="M256 436C150 372 84 306 84 224C84 170 124 130 176 130C212 130 240 150 256 178C272 150 300 130 336 130C388 130 428 170 428 224C428 306 362 372 256 436Z"
        fill="url(#lgCoeur)" stroke="#9e1442" stroke-width="7" stroke-linejoin="round"/>
  <path d="M256 436C150 372 84 306 84 224C84 170 124 130 176 130C212 130 240 150 256 178C272 150 300 130 336 130C388 130 428 170 428 224C428 306 362 372 256 436Z"
        fill="url(#lgOmbre)"/>
  <ellipse cx="140" cy="262" rx="20" ry="34" transform="rotate(-25 140 262)" fill="#fff" opacity="0.32"/>
  <circle cx="150" cy="315" r="8" fill="#fff" opacity="0.35"/>
  <!-- joues -->
  <ellipse cx="178" cy="318" rx="25" ry="14" fill="#ffb3c4" opacity="0.85"/>
  <ellipse cx="334" cy="318" rx="25" ry="14" fill="#ffb3c4" opacity="0.85"/>
  <!-- yeux -->
  <g fill="#3a0a12">
    <ellipse cx="210" cy="280" rx="16" ry="21"/>
    <ellipse cx="302" cy="280" rx="16" ry="21"/>
  </g>
  <g fill="#fff">
    <circle cx="204" cy="272" r="6.5"/><circle cx="296" cy="272" r="6.5"/>
    <circle cx="215" cy="288" r="2.8" opacity="0.85"/><circle cx="307" cy="288" r="2.8" opacity="0.85"/>
  </g>
  <!-- sourire -->
  <path d="M238 312Q256 332 274 312" fill="none" stroke="#3a0a12" stroke-width="9" stroke-linecap="round"/>
  <!-- bonnet -->
  <g transform="rotate(-13 256 160)">
    <path d="M142 160C138 80 200 14 286 10C352 8 404 50 430 110L406 128C390 96 366 82 342 82C360 108 372 134 374 160Z"
          fill="url(#lgBonnet)" stroke="#6e0710" stroke-width="7" stroke-linejoin="round"/>
    <path d="M174 138C176 86 214 44 270 34" fill="none" stroke="#ff8a92" stroke-width="10" stroke-linecap="round" opacity="0.6"/>
    <rect x="114" y="144" width="284" height="58" rx="29" fill="url(#lgFourrure)" stroke="#d9cbb7" stroke-width="5"/>
    <g fill="#fff" opacity="0.9">
      <circle cx="150" cy="160" r="7"/><circle cx="196" cy="156" r="6"/><circle cx="246" cy="158" r="7"/>
      <circle cx="296" cy="155" r="6"/><circle cx="344" cy="158" r="7"/>
    </g>
    <circle cx="426" cy="122" r="36" fill="url(#lgFourrure)" stroke="#d9cbb7" stroke-width="5"/>
    <circle cx="414" cy="110" r="10" fill="#fff"/>
  </g>
</g>
"""

def svg(viewbox, body, defs_extra=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}"><defs>{DEFS}{defs_extra}</defs>{body}</svg>\n'

FOND_DEFS = """
  <radialGradient id="lgFond" cx="0.5" cy="0.38" r="0.75">
    <stop offset="0" stop-color="#2f8a5e"/><stop offset="0.6" stop-color="#17573a"/><stop offset="1" stop-color="#0c3524"/>
  </radialGradient>
  <radialGradient id="lgHalo" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffe7a8" stop-opacity="0.45"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/>
  </radialGradient>
"""
NEIGE = "".join(
    f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" opacity="{o}"/>'
    for x, y, r, o in [(64, 70, 7, .55), (448, 60, 6, .5), (40, 300, 5, .4), (470, 330, 7, .45), (100, 460, 6, .45),
                       (420, 470, 5, .4), (250, 470, 4, .35), (160, 40, 4, .4), (360, 30, 5, .4), (480, 200, 4, .35), (30, 180, 4, .35)]
)

def icone(scale, rounded):
    rx = 112 if rounded else 0
    return svg("0 0 512 512",
        f'<rect width="512" height="512" rx="{rx}" fill="url(#lgFond)"/>{NEIGE}'
        f'<circle cx="256" cy="270" r="210" fill="url(#lgHalo)"/>'
        f'<g transform="translate(256 262) scale({scale}) translate(-256 -236)">{COEUR}</g>',
        FOND_DEFS)

# logo sans fond (en-tête de l'app)
(OUT / "logo.svg").write_text(svg("70 -6 400 452", COEUR))
(OUT / "icon.svg").write_text(icone(0.86, True))
(OUT / "icon-carre.svg").write_text(icone(0.86, False))
(OUT / "icon-maskable.svg").write_text(icone(0.68, False))

# badge Android (silhouette blanche)
(OUT / "badge.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path fill="#fff" d="M48 84C24 70 10 56 10 38C10 26 19 17 30 17C38 17 44 21 48 28C52 21 58 17 66 17C77 17 86 26 86 38C86 56 72 70 48 84Z"/></svg>\n')

def png(src, dst, size):
    subprocess.run(["rsvg-convert", "-w", str(size), "-h", str(size), str(OUT / src), "-o", str(OUT / dst)], check=True)

png("icon.svg", "icon-192.png", 192)
png("icon.svg", "icon-512.png", 512)
png("icon-carre.svg", "apple-touch-icon.png", 180)
png("icon-maskable.svg", "icon-maskable-512.png", 512)
png("icon.svg", "favicon-32.png", 32)
png("badge.svg", "badge-96.png", 96)
png("logo.svg", "logo-apercu.png", 400)
print("ok")
