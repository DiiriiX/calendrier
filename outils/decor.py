"""Génère le décor réaliste : img/decor.svg (fond), img/avant.svg (premier plan), js/decor-data.js (positions des lumières)."""
import math, random, json, pathlib

random.seed(11)
OUT = pathlib.Path("/home/claude/calendrier-avent")
(OUT / "img").mkdir(exist_ok=True)

def n(x):
    s = f"{x:.1f}"
    return s[:-2] if s.endswith(".0") else s

def mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(a[i] + (b[i] - a[i]) * t):02x}" for i in range(3))

def jitter(c, amt):
    v = [int(c[i:i + 2], 16) for i in (1, 3, 5)]
    d = random.uniform(-amt, amt)
    return "#" + "".join(f"{max(0, min(255, round(x * (1 + d)))):02x}" for x in v)

OUVERTURE = "M132 546V392Q132 316 208 316H392Q468 316 468 392V546Z"

# ------------------------------------------------------------------ defs
DEFS = f"""
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4"/>
  <feColorMatrix values="0 0 0 0 .32  0 0 0 0 .26  0 0 0 0 .18  0 0 0 1.4 -.55"/>
</filter>
<filter id="taches" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="9"/>
  <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 1.6 -.75"/>
</filter>
<filter id="veinesBois" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency=".004 .22" numOctaves="4" seed="2"/>
  <feColorMatrix values="0 0 0 0 .16  0 0 0 0 .07  0 0 0 0 .02  0 0 0 2.2 -1"/>
</filter>
<filter id="cendre" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="5"/>
  <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .47  0 0 0 0 .44  0 0 0 1.2 -.5"/>
</filter>
<filter id="flou8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="flou3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="flou14" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
<clipPath id="cpOuv"><path d="{OUVERTURE}"/></clipPath>
<clipPath id="cpEntourage"><path d="M44 244H556V546H44Z"/></clipPath>
<linearGradient id="gBougie" x1="0" x2="1"><stop offset="0" stop-color="#fbf3e2"/><stop offset=".45" stop-color="#f1e4c9"/><stop offset="1" stop-color="#bfa980"/></linearGradient>
<linearGradient id="gManteauFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e3f22"/><stop offset="1" stop-color="#40210f"/></linearGradient>
<linearGradient id="gManteauDessus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4a2a"/><stop offset="1" stop-color="#965f38"/></linearGradient>
<linearGradient id="gOmbreBas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1008" stop-opacity=".55"/><stop offset="1" stop-color="#1e1008" stop-opacity="0"/></linearGradient>
<linearGradient id="gVolume" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1608" stop-opacity=".22"/></linearGradient>
<linearGradient id="gSuie" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".92"/><stop offset=".45" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<linearGradient id="gSol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1210"/><stop offset="1" stop-color="#2c211c"/></linearGradient>
<linearGradient id="gMurG" x1="0" x2="1"><stop offset="0" stop-color="#2a0f08"/><stop offset="1" stop-color="#140604"/></linearGradient>
<linearGradient id="gMurD" x1="0" x2="1"><stop offset="0" stop-color="#140604"/><stop offset="1" stop-color="#2a0f08"/></linearGradient>
<linearGradient id="gAtre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8c8aa"/><stop offset="1" stop-color="#c2ae8c"/></linearGradient>
<linearGradient id="gTronc" x1="0" x2="1"><stop offset="0" stop-color="#5a3a22"/><stop offset="1" stop-color="#2e1a0c"/></linearGradient>
<radialGradient id="gJupe" cx=".4" cy=".2" r=".9"><stop offset="0" stop-color="#7c1620"/><stop offset="1" stop-color="#3e070d"/></radialGradient>
"""

BOULES = {
    "rouge": ("#e05a62", "#9c1a25", "#4a060c"),
    "or": ("#fff0b8", "#c79a3c", "#5e4012"),
    "champagne": ("#ffffff", "#dcc8a2", "#7a6646"),
    "bordeaux": ("#c0485a", "#6e1020", "#300308"),
    "argent": ("#ffffff", "#b8bcc4", "#4a4e58"),
}
for k, (a, b, c) in BOULES.items():
    DEFS += (f'<radialGradient id="b_{k}" cx=".34" cy=".3" r=".8" fx=".3" fy=".26">'
             f'<stop offset="0" stop-color="{a}"/><stop offset=".38" stop-color="{b}"/><stop offset="1" stop-color="{c}"/></radialGradient>')
DEFS += ('<linearGradient id="gCapuchon" x1="0" x2="1"><stop offset="0" stop-color="#f6dc8e"/><stop offset=".5" stop-color="#b08a35"/>'
         '<stop offset="1" stop-color="#5e4512"/></linearGradient>')

parts = []
add = parts.append

# ------------------------------------------------------------------ sapin
cx, ytop, ybase, maxhw = 668, 104, 532, 132
lumieres_sapin, boules = [], []
silh_droite, silh_gauche = [], []
aiguilles = {}  # (passe, couleur, largeur) -> liste de segments

PAL = {
    "fond": ["#07130c", "#0a1910", "#0d1f14"],
    "milieu": ["#0f2619", "#122d1e", "#163524", "#193b28"],
    "devant": ["#1a3f2a", "#1e482f", "#235235", "#285a3b"],
    "pointe": ["#386a49", "#417552", "#4b805b", "#58896a"],
    "chaud": ["#3e5b37", "#48653c"],
}
DEFS += '<filter id="ombreEtage" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>'

def cache_par_cheminee(x, y):
    return (y > 200 and x < 592) or (y > 236 and x < 562)

N = 19
rangs = []
for r in range(N):
    u = (r + 0.6) / N
    y = ytop + 10 + (ybase - ytop - 10) * u
    hw = 7 + maxhw * ((y - ytop) / (ybase - ytop)) ** 0.92
    rangs.append((r, u, y, hw))
    silh_droite.append((cx + hw * 1.0, y + hw * 0.22))
    silh_gauche.append((cx - hw * 1.0, y + hw * 0.22))

# silhouette sombre (remplit les trous entre les branches)
pts = [(cx, ytop + 4)] + silh_droite + [(cx, ybase + 22)] + silh_gauche[::-1]
d = "M" + " L".join(f"{n(x)} {n(y + random.uniform(-4, 4))}" for x, y in pts) + "Z"
sapin = [f'<path d="{d}" fill="#06120b"/>']
sapin.append(f'<rect x="{cx - 8}" y="{ybase}" width="16" height="30" fill="url(#gTronc)"/>')

def boule(x, y, rad, col):
    return (f'<g><path d="M{n(x)} {n(y - rad - 9)}V{n(y - rad - 2)}" stroke="#c9a24a" stroke-width=".9"/>'
            f'<rect x="{n(x - rad * .28)}" y="{n(y - rad - 3.5)}" width="{n(rad * .56)}" height="{n(rad * .38 + 1)}" rx="1" fill="url(#gCapuchon)"/>'
            f'<ellipse cx="{n(x + 1.5)}" cy="{n(y + rad * .9)}" rx="{n(rad * .8)}" ry="{n(rad * .25)}" fill="#000" opacity=".35"/>'
            f'<circle cx="{n(x)}" cy="{n(y)}" r="{n(rad)}" fill="url(#b_{col})"/>'
            f'<ellipse cx="{n(x - rad * .38)}" cy="{n(y - rad * .42)}" rx="{n(rad * .22)}" ry="{n(rad * .14)}" transform="rotate(-35 {n(x - rad * .38)} {n(y - rad * .42)})" fill="#fff" opacity=".85"/>'
            f'<path d="M{n(x - rad * .75)} {n(y + rad * .25)}A{n(rad * .8)} {n(rad * .8)} 0 0 0 {n(x - rad * .1)} {n(y + rad * .78)}" stroke="#ffb067" stroke-width="{n(max(1, rad * .14))}" fill="none" opacity=".55" stroke-linecap="round"/></g>')

# du bas vers le haut : les étages du haut retombent sur ceux du bas
for r, u, y, hw in reversed(rangs):
    nb = int(9 + hw / 5)
    off = random.random() * math.tau
    branches = []
    for b in range(nb):
        th = off + b * math.tau / nb + random.uniform(-.2, .2)
        branches.append((math.cos(th), math.sin(th)))
    branches.sort(key=lambda zs: zs[0])
    paquets = {}
    boules_rang = []
    # ombre portée par cet étage sur celui du dessous
    sapin.append(f'<path d="M{n(cx - hw * .95)} {n(y + hw * .2)}Q{n(cx)} {n(y + hw * .2 + 16)} {n(cx + hw * .95)} {n(y + hw * .2)}" '
                 f'stroke="#000" stroke-width="{n(6 + hw * .08)}" fill="none" opacity=".55" filter="url(#ombreEtage)"/>')
    for z, s in branches:
        passe = "fond" if z < -0.3 else ("milieu" if z < 0.45 else "devant")
        L = hw * random.uniform(.88, 1.05)
        tx = cx + L * s
        ty = y + L * 0.2 + z * hw * 0.1 + random.uniform(-3, 3)
        bx, by = cx + s * 3, y - 3 - z * 2
        mx, my = (bx + tx) / 2, (by + ty) / 2 - L * 0.12
        plen = math.hypot(tx - bx, ty - by)
        steps = max(8, int(plen / 2.9)) + (6 if passe == "devant" and abs(s) < .5 else 0)
        for i in range(steps):
            t = 0.12 + 0.88 * i / max(1, steps - 1)
            px = (1 - t) ** 2 * bx + 2 * (1 - t) * t * mx + t * t * tx
            py = (1 - t) ** 2 * by + 2 * (1 - t) * t * my + t * t * ty
            dx = 2 * (1 - t) * (mx - bx) + 2 * t * (tx - mx)
            dy = 2 * (1 - t) * (my - by) + 2 * t * (ty - my)
            ang = math.atan2(dy, dx) if plen > 6 else random.uniform(0, math.tau)
            for cote in (-1, 1):
                if passe == "devant" and abs(s) < .45:
                    a2 = random.uniform(0, math.tau)
                else:
                    a2 = ang + cote * math.radians(random.uniform(40, 68))
                ln = (9 - 3.5 * t) * random.uniform(.8, 1.15) * (0.75 + 0.4 * min(1, hw / 60))
                ddx, ddy = math.cos(a2) * ln, math.sin(a2) * ln + 1.5
                if t > .74 and passe != "fond" and random.random() < .55:
                    col = random.choice(PAL["pointe"])
                elif s < -.4 and passe != "fond" and t > .5 and random.random() < .15:
                    col = random.choice(PAL["chaud"])
                elif t < .35 and passe != "fond":
                    col = random.choice(PAL["fond"] if random.random() < .5 else PAL["milieu"])
                else:
                    col = random.choice(PAL[passe])
                w = {"fond": 1.6, "milieu": 1.45, "devant": 1.35}[passe]
                paquets.setdefault((passe, col, w), []).append(f"M{round(px)} {round(py)}l{round(ddx)} {round(ddy)}")
        if passe != "fond":
            for _ in range(2 if passe == "devant" else 1):
                if random.random() < .5:
                    t = random.uniform(.35, .95)
                    lx = (1 - t) ** 2 * bx + 2 * (1 - t) * t * mx + t * t * tx + random.uniform(-4, 4)
                    ly = (1 - t) ** 2 * by + 2 * (1 - t) * t * my + t * t * ty + random.uniform(-3, 5)
                    if not cache_par_cheminee(lx, ly):
                        lumieres_sapin.append([round(lx, 1), round(ly, 1), round(.55 + .45 * (z + 1) / 2, 2)])
            if z > 0.05 and .18 < abs(s) < .95 and r > 1 and random.random() < .5:
                t = random.uniform(.7, .9)
                ox = (1 - t) ** 2 * bx + 2 * (1 - t) * t * mx + t * t * tx
                oy = (1 - t) ** 2 * by + 2 * (1 - t) * t * my + t * t * ty + 4
                rad = 5.5 + 6 * u
                if not cache_par_cheminee(ox - rad, oy + rad) and all(math.hypot(ox - a, oy - b2) > 34 for a, b2, *_ in boules):
                    boules.append((ox, oy, rad, random.choice(list(BOULES)), passe))
                    boules_rang.append((ox, oy, rad, boules[-1][3], passe))
    for passe in ("fond", "milieu", "devant"):
        for (p_, col, w), segs in sorted(paquets.items(), key=lambda kv: kv[0][1]):
            if p_ == passe:
                sapin.append(f'<path d="{"".join(segs)}" stroke="{col}" stroke-width="{w}" stroke-linecap="round" fill="none"/>')
        if passe == "milieu":
            sapin += [boule(x, y_, r_, c) for x, y_, r_, c, p in boules_rang if p == "milieu"]
    sapin += [boule(x, y_, r_, c) for x, y_, r_, c, p in boules_rang if p == "devant"]

# étoile en facettes
ex, ey, R1, R2 = cx, ytop - 8, 22, 9
pts = []
for i in range(10):
    a = -math.pi / 2 + i * math.pi / 5
    rr = R1 if i % 2 == 0 else R2
    pts.append((ex + math.cos(a) * rr, ey + math.sin(a) * rr))
for i in range(0, 10, 2):
    o, gch, drt = pts[i], pts[i - 1], pts[(i + 1) % 10]
    sapin.append(f'<path d="M{n(ex)} {n(ey)}L{n(gch[0])} {n(gch[1])}L{n(o[0])} {n(o[1])}Z" fill="#fbe39a"/>')
    sapin.append(f'<path d="M{n(ex)} {n(ey)}L{n(o[0])} {n(o[1])}L{n(drt[0])} {n(drt[1])}Z" fill="#c4932f"/>')
sapin.append(f'<path d="M{" L".join(f"{n(x)} {n(y)}" for x, y in pts)}Z" fill="none" stroke="#7a5a14" stroke-width=".8"/>')
sapin.append(f'<path d="M{n(ex)} {n(ey + R1)}V{n(ytop + 6)}" stroke="#7a5a14" stroke-width="2"/>')

# jupe de sapin (velours)
jupe = [f'<ellipse cx="{cx}" cy="560" rx="116" ry="14" fill="url(#gJupe)"/>',
        f'<path d="M{cx - 100} 556Q{cx - 70} 566 {cx - 40} 557M{cx - 10} 563Q{cx + 20} 569 {cx + 50} 560M{cx + 70} 555Q{cx + 92} 561 {cx + 108} 556" stroke="#2a0408" stroke-width="2" fill="none" opacity=".7"/>']

add('<g id="sapin">' + "".join(sapin) + "".join(jupe) + "</g>")

# ------------------------------------------------------------------ cadeaux sous le sapin
def cadeau(x, y, w, h, papier, motif, ruban, ruban2, profondeur=10):
    g = [f'<ellipse cx="{n(x + w / 2 + 4)}" cy="{n(y + h)}" rx="{n(w * .62)}" ry="5" fill="#000" opacity=".45" filter="url(#flou3)"/>']
    g.append(f'<path d="M{x} {y}L{x + profondeur} {y - profondeur * .6}H{x + w + profondeur}L{x + w} {y}Z" fill="{mix(papier, "#ffffff", .18)}"/>')
    g.append(f'<path d="M{x + w} {y}L{x + w + profondeur} {y - profondeur * .6}V{y + h - profondeur * .6}L{x + w} {y + h}Z" fill="{mix(papier, "#000000", .35)}"/>')
    g.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{papier}"/>')
    g.append(motif(x, y, w, h))
    g.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#gVolume)"/>')
    mxr = x + w * .45
    g.append(f'<rect x="{n(mxr - 4)}" y="{y}" width="8" height="{h}" fill="{ruban}"/><rect x="{n(mxr - 4)}" y="{y}" width="3" height="{h}" fill="{ruban2}" opacity=".7"/>')
    g.append(f'<path d="M{n(mxr - 4)} {y}L{n(mxr - 4 + profondeur)} {n(y - profondeur * .6)}H{n(mxr + 4 + profondeur)}L{n(mxr + 4)} {y}Z" fill="{ruban2}"/>')
    g.append(f'<rect x="{x}" y="{n(y + h * .5 - 3.5)}" width="{w}" height="7" fill="{ruban}"/>')
    bx, by = mxr + profondeur * .5, y - profondeur * .3
    g.append(f'<path d="M{n(bx)} {n(by)}C{n(bx - 18)} {n(by - 16)} {n(bx - 22)} {n(by + 2)} {n(bx)} {n(by)}Z" fill="{ruban}" stroke="{mix(ruban, "#000000", .3)}" stroke-width="1"/>')
    g.append(f'<path d="M{n(bx)} {n(by)}C{n(bx + 18)} {n(by - 16)} {n(bx + 22)} {n(by + 2)} {n(bx)} {n(by)}Z" fill="{ruban}" stroke="{mix(ruban, "#000000", .3)}" stroke-width="1"/>')
    g.append(f'<path d="M{n(bx - 2)} {n(by + 1)}L{n(bx - 9)} {n(by + 12)}M{n(bx + 2)} {n(by + 1)}L{n(bx + 10)} {n(by + 11)}" stroke="{ruban}" stroke-width="3.5" stroke-linecap="round"/>')
    g.append(f'<circle cx="{n(bx)}" cy="{n(by)}" r="3.6" fill="{ruban2}"/>')
    return "".join(g)

def rayures(x, y, w, h):
    return "".join(f'<rect x="{x + i}" y="{y}" width="2.5" height="{h}" fill="#d9b25a" opacity=".55"/>' for i in range(5, w, 12))

def pois(x, y, w, h):
    return "".join(f'<circle cx="{x + i}" cy="{y + j + (6 if (i // 14) % 2 else 0)}" r="2.2" fill="#b3202a" opacity=".8"/>'
                   for i in range(6, w, 14) for j in range(6, h - 4, 12))

def carreaux(x, y, w, h):
    return "".join(f'<rect x="{x + i}" y="{y}" width="5" height="{h}" fill="#0c2a1b" opacity=".35"/>' for i in range(4, w, 14)) + \
           "".join(f'<rect x="{x}" y="{y + j}" width="{w}" height="5" fill="#0c2a1b" opacity=".35"/>' for j in range(4, h, 14))

add("<g>" + cadeau(590, 514, 78, 52, "#8e1820", rayures, "#d8b45a", "#f3dc94")
    + cadeau(740, 494, 52, 72, "#1d4a33", carreaux, "#c9a24a", "#f0d68c")
    + cadeau(672, 532, 64, 34, "#efe5d0", pois, "#a51d28", "#d24450", profondeur=8) + "</g>")

# ------------------------------------------------------------------ cheminée
add('<rect x="30" y="226" width="540" height="330" fill="#000" opacity=".55" filter="url(#flou14)"/>')

# pierres de l'entourage
pierres = [
    (44, 244, 172, 316), (172, 244, 282, 316), (318, 244, 428, 316), (428, 244, 556, 316),
    (44, 316, 132, 392), (44, 392, 132, 470), (44, 470, 132, 520),
    (468, 316, 556, 392), (468, 392, 556, 470), (468, 470, 556, 520),
    (132, 316, 210, 392), (390, 316, 468, 392),
]
add('<rect x="44" y="244" width="512" height="302" fill="#bfae90"/>')
for x1, y1, x2, y2 in pierres:
    c = jitter("#e6d9bf", .035)
    add(f'<rect x="{x1 + 1.2}" y="{y1 + 1.2}" width="{x2 - x1 - 2.4}" height="{y2 - y1 - 2.4}" fill="{c}"/>')
    add(f'<path d="M{x1 + 1.5} {y2 - 1.5}V{y1 + 1.5}H{x2 - 1.5}" stroke="#fbf5e8" stroke-width="1.4" fill="none" opacity=".8"/>')
    add(f'<path d="M{x2 - 1.5} {y1 + 2}V{y2 - 1.5}H{x1 + 2}" stroke="#9e8c6e" stroke-width="1.4" fill="none" opacity=".8"/>')
# socles
for x1, x2 in ((38, 138), (462, 562)):
    add(f'<rect x="{x1}" y="518" width="{x2 - x1}" height="28" fill="{jitter("#ddcfb3", .02)}"/>')
    add(f'<rect x="{x1}" y="518" width="{x2 - x1}" height="2" fill="#fbf5e8" opacity=".8"/><rect x="{x1}" y="544" width="{x2 - x1}" height="2" fill="#8e7c60"/>')
# clé de voûte
add('<path d="M282 242H318L313 328H287Z" fill="#efe5d0"/><path d="M282 242H318L313 328H287Z" fill="none" stroke="#a8977a" stroke-width="1.2"/>'
    '<path d="M284 244H316" stroke="#fffaf0" stroke-width="1.5"/>')
# textures
add('<g clip-path="url(#cpEntourage)"><rect x="44" y="244" width="512" height="302" filter="url(#taches)" opacity=".5"/>'
    '<rect x="44" y="244" width="512" height="302" filter="url(#grain)" opacity=".55"/>'
    '<rect x="44" y="244" width="512" height="302" fill="url(#gVolume)"/></g>')
# ouverture : foyer en profondeur
foyer = ['<rect x="120" y="290" width="360" height="260" fill="#160805"/>']
# mur du fond en briques
y, row = 338, 0
foyer.append('<rect x="180" y="338" width="240" height="180" fill="#140703"/>')
while y < 518:
    x = 180 - (row % 2) * 15
    while x < 420:
        c = random.choice(["#4a1c10", "#55200f", "#3e170c", "#5e2814", "#47190d", "#38140a"])
        x1, x2 = max(180, x + 1), min(420, x + 29)
        if x2 > x1:
            foyer.append(f'<rect x="{x1}" y="{y + 1}" width="{x2 - x1}" height="9" fill="{jitter(c, .08)}"/>')
        x += 30
    y += 11
    row += 1
# parois latérales et sol du foyer
foyer.append('<path d="M120 300L180 338V518L120 556Z" fill="url(#gMurG)"/><path d="M480 300L420 338V518L480 556Z" fill="url(#gMurD)"/>')
lignes = []
for yb in range(338, 519, 11):
    yf = 316 + (yb - 338) * 232 / 180
    lignes.append(f"M180 {yb}L132 {n(yf)}M420 {yb}L468 {n(yf)}")
foyer.append(f'<path d="{"".join(lignes)}" stroke="#0c0402" stroke-width="1.2" opacity=".8"/>')
foyer.append('<path d="M120 300H480L420 338H180Z" fill="#0a0302"/>')
foyer.append('<path d="M132 546H468L420 518H180Z" fill="url(#gSol)"/><path d="M132 546H468L420 518H180Z" filter="url(#cendre)" opacity=".35"/>')
foyer.append('<rect x="120" y="300" width="360" height="250" fill="#000" opacity=".18"/><rect x="120" y="300" width="360" height="250" fill="url(#gSuie)"/>')
add('<g clip-path="url(#cpOuv)">' + "".join(foyer) + "</g>")
# bord de l'ouverture
add(f'<path d="{OUVERTURE}" fill="none" stroke="#6e5b44" stroke-width="5"/>'
    f'<path d="M132 546V392Q132 316 208 316H392Q468 316 468 392V546" fill="none" stroke="#f3ead8" stroke-width="1.5" transform="translate(-3 -2)" opacity=".7"/>')
# suie au-dessus de l'ouverture
add('<g clip-path="url(#cpEntourage)"><ellipse cx="300" cy="318" rx="170" ry="42" fill="#2a1a0c" opacity=".22" filter="url(#flou14)"/></g>')

# âtre
add('<rect x="20" y="544" width="560" height="12" fill="url(#gAtre)"/><rect x="20" y="556" width="560" height="10" fill="#a8946f"/>'
    '<rect x="20" y="544" width="560" height="1.5" fill="#f6eedd"/><rect x="20" y="544" width="560" height="22" filter="url(#grain)" opacity=".4"/>')

# manteau en chêne
add('<g clip-path="url(#cpEntourage)"><rect x="44" y="244" width="512" height="26" fill="url(#gOmbreBas)"/></g>')
for x1 in (52, 522):
    add(f'<path d="M{x1} 244H{x1 + 26}V250C{x1 + 26} 262 {x1 + 18} 266 {x1 + 13} 274C{x1 + 8} 266 {x1} 262 {x1} 250Z" fill="#4a2814"/>'
        f'<path d="M{x1 + 2} 246H{x1 + 24}" stroke="#7a4a2a" stroke-width="1.2"/>')
add('<rect x="28" y="232" width="544" height="13" fill="#3a1d0d"/><rect x="28" y="232" width="544" height="1.5" fill="#8a5a36"/>'
    '<rect x="28" y="232" width="544" height="13" filter="url(#veinesBois)" opacity=".6"/>')
add('<rect x="12" y="206" width="576" height="27" rx="2" fill="url(#gManteauFace)"/>'
    '<rect x="12" y="206" width="576" height="27" filter="url(#veinesBois)" opacity=".9"/>'
    '<path d="M18 198H582L588 206H12Z" fill="url(#gManteauDessus)"/>'
    '<path d="M18 198H582L588 206H12Z" filter="url(#veinesBois)" opacity=".5"/>'
    '<path d="M12 206.6H588" stroke="#c08a5c" stroke-width="1.2" opacity=".8"/>'
    '<path d="M12 232.5H588" stroke="#24100a" stroke-width="1.5"/>')

# bougies
bougies = []
for x, w, h in ((66, 30, 74), (102, 24, 46), (494, 28, 58)):
    yb = 202
    yt = yb - h
    add(f'<ellipse cx="{x + w / 2 + 3}" cy="{yb}" rx="{w * .7}" ry="3" fill="#000" opacity=".4" filter="url(#flou3)"/>')
    add(f'<rect x="{x}" y="{yt}" width="{w}" height="{h}" rx="2" fill="url(#gBougie)"/>')
    add(f'<ellipse cx="{x + w / 2}" cy="{yt}" rx="{w / 2}" ry="3.2" fill="#f8efdc"/><ellipse cx="{x + w / 2}" cy="{yt + .6}" rx="{w / 2 - 3}" ry="2" fill="#e8d8b8"/>')
    add(f'<path d="M{x + 3} {yt + 1}q1 9 2 0M{x + w - 6} {yt + 1}q1.5 13 3 0" fill="#f8efdc"/>')
    add(f'<path d="M{x + w / 2} {yt}v-6" stroke="#1a1008" stroke-width="1.4" stroke-linecap="round"/>')
    bougies.append([x + w / 2, yt - 6, 1 if h > 50 else .85])

# guirlande de sapin sur le manteau
guir, lum_guir = [], []
def gy(x):
    return 204 + 15 * abs(math.sin(math.pi * (x - 14) / 143))
guir.append('<path d="M14 ' + n(gy(14)) + "".join(f"L{x} {n(gy(x))}" for x in range(16, 588, 4)) + '" stroke="#0a1d12" stroke-width="15" fill="none" stroke-linecap="round"/>')
segs = {}
for x10 in range(14 * 10, 586 * 10, 18):
    x = x10 / 10
    y = gy(x)
    for k in range(6):
        a = random.uniform(0, math.tau)
        ln = random.uniform(6, 11)
        sx, sy = x + random.uniform(-4, 4), y + random.uniform(-5, 5)
        col = random.choice(["#0f2a1a", "#163a25", "#1d4a30", "#25573a", "#2e6646", "#3f7a55"])
        segs.setdefault(col, []).append(f"M{n(sx)} {n(sy)}L{n(sx + math.cos(a) * ln)} {n(sy + math.sin(a) * ln)}")
for col, s in segs.items():
    guir.append(f'<path d="{"".join(s)}" stroke="{col}" stroke-width="1.5" stroke-linecap="round" fill="none"/>')
for i in range(5):
    x = 14 + 143 * i
    if 20 < x < 580:
        guir.append(f'<g transform="translate({n(x)} {n(gy(x) + 4)})"><ellipse rx="7" ry="11" fill="#5a3416"/>'
                    + "".join(f'<path d="M-6 {j}Q0 {j + 4} 6 {j}" stroke="#2e1808" stroke-width="1.2" fill="none"/>' for j in range(-8, 10, 4)) + "</g>")
for i in range(4):
    x = 14 + 143 * i + 71.5
    y = gy(x) + 5
    for dx, dy in ((-4, 0), (3, -2), (0, 4), (5, 3), (-3, 5)):
        guir.append(f'<circle cx="{n(x + dx)}" cy="{n(y + dy)}" r="3.2" fill="#a8121e"/><circle cx="{n(x + dx - 1)}" cy="{n(y + dy - 1)}" r="1" fill="#ff8a8a" opacity=".8"/>')
for x in range(26, 580, 23):
    lum_guir.append([round(x + random.uniform(-4, 4), 1), round(gy(x) + random.uniform(-4, 5), 1), .7])
add("<g>" + "".join(guir) + "</g>")

decor = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs>{DEFS}</defs>{"".join(parts)}</svg>\n'
(OUT / "img" / "decor.svg").write_text(decor)

# ------------------------------------------------------------------ premier plan : chaussette + grille
AV_DEFS = """
<pattern id="maille" width="7" height="7" patternUnits="userSpaceOnUse">
  <rect width="7" height="7" fill="#a01b24"/>
  <path d="M.5 .5L3.5 6.5L6.5 .5" stroke="#7a1119" stroke-width="1.3" fill="none"/>
  <path d="M1.3 .9L3.5 5.4" stroke="#c9434b" stroke-width=".8"/>
</pattern>
<pattern id="mailleCreme" width="6" height="6" patternUnits="userSpaceOnUse">
  <rect width="6" height="6" fill="#efe6d4"/>
  <path d="M.5 .5L3 5.5L5.5 .5" stroke="#cfc2a8" stroke-width="1.1" fill="none"/>
</pattern>
<filter id="fourrure" x="-20%" y="-40%" width="140%" height="180%">
  <feTurbulence type="fractalNoise" baseFrequency=".18" numOctaves="2" seed="3" result="t"/>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="8" result="g"/>
  <feColorMatrix in="g" values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .44  0 0 0 1.3 -.6" result="g2"/>
  <feComposite in="g2" in2="d" operator="in" result="g3"/>
  <feMerge><feMergeNode in="d"/><feMergeNode in="g3"/></feMerge>
</filter>
<linearGradient id="gJambe" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
<linearGradient id="gPied" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
<linearGradient id="gRevers" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset=".7" stop-color="#ece4d6"/><stop offset="1" stop-color="#c9bda8"/></linearGradient>
<linearGradient id="gFer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a3a1c"/><stop offset=".25" stop-color="#1c1513"/><stop offset="1" stop-color="#0b0807"/></linearGradient>
<radialGradient id="gBoule" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#b8743a"/><stop offset=".35" stop-color="#2a1f1a"/><stop offset="1" stop-color="#0a0706"/></radialGradient>
<linearGradient id="gCrochet" x1="0" x2="1"><stop offset="0" stop-color="#f6dc8e"/><stop offset="1" stop-color="#8a6a20"/></linearGradient>
<clipPath id="cpChaussette"><path d="M414 260L414 360C414 384 404 394 388 396L366 398C346 400 334 412 338 425C342 438 360 442 382 440L432 436C464 432 482 410 482 380L480 260Z"/></clipPath>
"""
CH = "M414 260L414 360C414 384 404 394 388 396L366 398C346 400 334 412 338 425C342 438 360 442 382 440L432 436C464 432 482 410 482 380L480 260Z"
av = []
# grille du foyer (devant les bûches)
av.append('<rect x="212" y="524" width="176" height="7" rx="2" fill="url(#gFer)"/>')
for x in (220, 380):
    av.append(f'<rect x="{x - 3}" y="528" width="6" height="18" fill="#0d0a09"/>')
for x in (232, 282, 318, 368):
    av.append(f'<rect x="{x - 2.2}" y="494" width="4.4" height="32" fill="url(#gFer)"/>'
              f'<circle cx="{x}" cy="491" r="5.2" fill="url(#gBoule)"/>')
# chaussette
av.append('<g transform="translate(446 226) scale(.88) translate(-446 -226)">')
av.append('<path d="M446 216V226" stroke="url(#gCrochet)" stroke-width="3.5" stroke-linecap="round"/><circle cx="446" cy="216" r="3.5" fill="url(#gCrochet)"/>')
av.append('<path d="M440 236C440 222 452 222 452 236" stroke="#8a1620" stroke-width="3" fill="none"/>')
av.append('<path d="M468 246V214Q468 202 458 202Q448 202 448 211" stroke="#fbf6ee" stroke-width="7.5" fill="none" stroke-linecap="round"/>'
          '<path d="M468 246V214Q468 202 458 202Q448 202 448 211" stroke="#c41e2e" stroke-width="7.5" stroke-dasharray="4 5" fill="none"/>'
          '<path d="M466 246V214" stroke="#fff" stroke-width="1.5" opacity=".6"/>')
av.append(f'<path d="{CH}" fill="url(#maille)"/>')
bande = ['<rect x="400" y="290" width="90" height="26" fill="url(#mailleCreme)"/>',
         '<path d="M400 291.5H490M400 314.5H490" stroke="#a01b24" stroke-width="2.4"/>']
for x in range(408, 486, 12):
    bande.append(f'<path d="M{x} 303l4-5 4 5-4 5z" fill="#b3202a"/>')
bande.append('<path d="M366 398C346 400 334 412 338 425C342 438 360 442 382 440C370 430 362 414 366 398Z" fill="url(#mailleCreme)"/>')
bande.append('<path d="M482 372C482 406 464 430 434 436C440 420 456 402 470 372Z" fill="url(#mailleCreme)"/>')
bande.append('<rect x="380" y="250" width="110" height="200" fill="url(#gJambe)"/>')
bande.append('<rect x="330" y="380" width="160" height="70" fill="url(#gPied)"/>')
av.append('<g clip-path="url(#cpChaussette)">' + "".join(bande) + "</g>")
av.append(f'<path d="{CH}" fill="none" stroke="#5e0c12" stroke-width="1.2" opacity=".7"/>')
av.append('<rect x="404" y="232" width="84" height="36" rx="12" fill="url(#gRevers)" filter="url(#fourrure)"/>')
av.append('<rect x="408" y="262" width="76" height="6" rx="3" fill="#8c7f6a" opacity=".25"/>')
av.append('</g>')

avant = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs>{AV_DEFS}</defs>{"".join(av)}</svg>\n'
(OUT / "img" / "avant.svg").write_text(avant)

# ------------------------------------------------------------------ données pour l'animation
data = {
    "sapin": lumieres_sapin,
    "guirlande": lum_guir,
    "bougies": bougies,
    "etoile": [ex, ey],
    "ouverture": OUVERTURE,
    "feu": {"x": 300, "y": 504, "w": 95},
}
(OUT / "js" / "decor-data.js").write_text("window.DECOR = " + json.dumps(data, separators=(",", ":")) + ";\n")
print("decor.svg", len(decor) // 1024, "Ko | avant.svg", len(avant) // 1024, "Ko | lumières", len(lumieres_sapin), "| boules", len(boules))
