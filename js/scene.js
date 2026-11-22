/* Animation du décor : feu de cheminée, bûches, braises, bougies, lumières du sapin.
   Tout est dessiné dans un canvas posé sur l'image du décor (repère 800 × 600). */
{
  const D = window.DECOR;
  const boite = document.querySelector('.scene-inner');
  const cv = document.getElementById('vivant');
  const lueur = document.getElementById('lueur');
  if (!boite || !cv || !D) throw new Error('décor absent');
  const ctx = cv.getContext('2d');
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath();
    };
  }
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ouverture = new Path2D(D.ouverture);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  let k = 1, dpr = 1, W = 0, H = 0;
  let bucheFond = null, bucheAvant = null, fissures = [];

  /* ---------- sprites de lumière ---------- */
  const sprite = (r, g, b, size = 64, dur = 0.5) => {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'), gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
    gr.addColorStop(dur, `rgba(${r},${g},${b},.45)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr; x.fillRect(0, 0, size, size);
    return c;
  };
  const RAMPE = [[255, 248, 225], [255, 236, 180], [255, 214, 130], [255, 186, 80], [255, 158, 50], [250, 128, 32], [235, 100, 22], [210, 75, 16], [170, 52, 12], [120, 34, 10], [70, 20, 8]];
  const feuSprites = [];
  for (let i = 0; i < 24; i++) {
    const t = i / 23 * (RAMPE.length - 1), a = Math.floor(t), b = Math.min(RAMPE.length - 1, a + 1), f = t - a;
    const c = RAMPE[a].map((v, j) => Math.round(v + (RAMPE[b][j] - v) * f));
    feuSprites.push(sprite(c[0], c[1], c[2], 64, 0.35));
  }
  const halo = sprite(255, 214, 150, 64, 0.22);
  const haloBlanc = sprite(255, 244, 220, 32, 0.4);

  /* ---------- bûches (pré-dessinées) ---------- */
  function dessinerBuche(c, x1, y1, x2, y2, r, devant) {
    const ang = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1);
    c.save(); c.translate(x1, y1); c.rotate(ang);
    const g = c.createLinearGradient(0, -r, 0, r);
    g.addColorStop(0, '#5a3d26'); g.addColorStop(.3, '#3e2818'); g.addColorStop(.75, '#1e130b'); g.addColorStop(1, '#0c0805');
    c.fillStyle = g;
    c.beginPath(); c.roundRect(0, -r, L, 2 * r, r); c.fill();
    c.lineCap = 'round';
    for (let i = 0; i < 70; i++) {
      const yy = rnd(-r * .9, r * .9), x0 = rnd(4, L - 30), l = rnd(12, 46);
      c.strokeStyle = Math.random() < .7 ? `rgba(12,7,4,${rnd(.35, .75)})` : `rgba(150,110,70,${rnd(.12, .3)})`;
      c.lineWidth = rnd(.6, 1.6);
      c.beginPath(); c.moveTo(x0, yy);
      c.quadraticCurveTo(x0 + l / 2, yy + rnd(-1.5, 1.5), x0 + l, yy + rnd(-1, 1)); c.stroke();
    }
    const ch = c.createLinearGradient(0, -r, 0, r);
    ch.addColorStop(0, 'rgba(0,0,0,.55)'); ch.addColorStop(.35, 'rgba(0,0,0,0)'); ch.addColorStop(1, 'rgba(0,0,0,.35)');
    c.fillStyle = ch; c.beginPath(); c.roundRect(0, -r, L, 2 * r, r); c.fill();
    // bout coupé
    const ex = devant ? L - r * .35 : r * .35;
    const eg = c.createRadialGradient(ex, 0, 0, ex, 0, r);
    eg.addColorStop(0, '#c89a64'); eg.addColorStop(.6, '#9a6c3c'); eg.addColorStop(.85, '#5a3a1e'); eg.addColorStop(1, '#24160c');
    c.fillStyle = eg; c.beginPath(); c.ellipse(ex, 0, r * .42, r * .96, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(90,55,25,.55)'; c.lineWidth = .7;
    for (let i = 1; i < 5; i++) { c.beginPath(); c.ellipse(ex, 0, r * .42 * i / 5, r * .96 * i / 5, 0, 0, Math.PI * 2); c.stroke(); }
    c.restore();
    // fissures incandescentes (repère du décor)
    const pts = [];
    if (devant) {
      for (let f = 0; f < 7; f++) {
        let u = rnd(.15, .8) * L, v = rnd(-r * .7, -r * .1);
        const p = new Path2D();
        const tr = (uu, vv) => [x1 + Math.cos(ang) * uu - Math.sin(ang) * vv, y1 + Math.sin(ang) * uu + Math.cos(ang) * vv];
        p.moveTo(...tr(u, v));
        for (let s = 0; s < 4; s++) { u += rnd(4, 10); v += rnd(-2.5, 2.5); p.lineTo(...tr(u, Math.max(-r * .9, Math.min(r * .2, v)))); }
        pts.push({ p, ph: rnd(0, 6), v: rnd(1.5, 4) });
      }
    }
    return pts;
  }

  function preparer() {
    const w = boite.clientWidth, h = boite.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = w; H = h; k = (w / 800) * dpr;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const off = () => { const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0); return [c, x]; };
    let x;
    [bucheFond, x] = off();
    dessinerBuche(x, 224, 497, 380, 487, 15, false);
    dessinerBuche(x, 300, 506, 352, 470, 10, false);
    [bucheAvant, x] = off();
    fissures = dessinerBuche(x, 220, 517, 382, 523, 14, true);
    if (reduit) { for (let i = 0; i < 90; i++) etape(1 / 40, i / 40); dessiner(3); }
  }

  /* ---------- particules ---------- */
  const flammes = [], etincelles = [];
  const FX = D.feu.x, FY = D.feu.y;
  let intensite = 1, tps = 0;
  const lumieres = D.sapin.filter((_, i) => i % 2 === 0).map((l) => ({ x: l[0], y: l[1], d: l[2], ph: rnd(0, 6.3), v: rnd(.6, 1.6) }));
  const guirlande = D.guirlande.map((l) => ({ x: l[0], y: l[1], d: l[2], ph: rnd(0, 6.3), v: rnd(.6, 1.4) }));

  function etape(dt, t) {
    tps = t;
    intensite = 0.84 + 0.07 * Math.sin(t * 7.1) * Math.sin(t * 2.3 + 1) + 0.05 * Math.sin(t * 13.7 + 2) + 0.04 * Math.sin(t * 1.3);
    const naissances = Math.min(50, Math.round(dt * 300 + Math.random()));
    for (let i = 0; i < naissances; i++) {
      const x = FX + gauss() * D.feu.w;
      const bord = Math.min(1, Math.abs(x - FX) / (D.feu.w * 1.6));
      flammes.push({ x, y: FY + rnd(-6, 10), vx: (FX - x) * .5 + rnd(-12, 12), vy: -rnd(95, 165) * (1 - bord * .45), age: 0,
        vie: rnd(.55, 1.15) * (1 - bord * .5), r: rnd(16, 28) * (1 - bord * .3), ph: rnd(0, 6.3) });
    }
    if (Math.random() < dt * 3.2) etincelles.push({ x: FX + gauss() * 30, y: FY - 6, vx: rnd(-25, 25), vy: -rnd(110, 210), age: 0, vie: rnd(.9, 1.8), ph: rnd(0, 6) });
    for (let i = flammes.length - 1; i >= 0; i--) {
      const p = flammes[i];
      p.age += dt;
      if (p.age >= p.vie) { flammes.splice(i, 1); continue; }
      p.vy -= 70 * dt;
      p.x += (p.vx + Math.sin(t * 6.5 + p.ph + p.y * .045) * 26) * dt;
      p.y += p.vy * dt;
    }
    for (let i = etincelles.length - 1; i >= 0; i--) {
      const s = etincelles[i];
      s.age += dt;
      if (s.age >= s.vie || s.y < 300) { etincelles.splice(i, 1); continue; }
      s.x += (s.vx + Math.sin(t * 9 + s.ph) * 40) * dt; s.y += s.vy * dt; s.vy *= 0.995;
    }
  }

  function dessiner(t) {
    const I = intensite;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(k, 0, 0, k, 0, 0);

    // lumière du feu sur la pierre et l'âtre
    ctx.globalCompositeOperation = 'lighter';
    let g = ctx.createRadialGradient(FX, 470, 30, FX, 470, 330);
    g.addColorStop(0, `rgba(255,140,50,${.2 * I})`); g.addColorStop(.5, `rgba(255,120,40,${.07 * I})`); g.addColorStop(1, 'rgba(255,110,30,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 200, 800, 400);

    // intérieur du foyer
    ctx.save(); ctx.clip(ouverture);
    g = ctx.createRadialGradient(FX, 505, 10, FX, 505, 215);
    g.addColorStop(0, `rgba(255,150,60,${.5 * I})`); g.addColorStop(.4, `rgba(220,80,25,${.2 * I})`); g.addColorStop(1, 'rgba(120,30,10,0)');
    ctx.fillStyle = g; ctx.fillRect(100, 290, 400, 270);
    // lit de braises
    ctx.globalCompositeOperation = 'source-over';
    g = ctx.createRadialGradient(FX, 522, 4, FX, 522, 95);
    g.addColorStop(0, `rgba(255,130,40,${.95 * I})`); g.addColorStop(.35, `rgba(200,50,12,${.8 * I})`); g.addColorStop(1, 'rgba(60,10,4,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(FX, 524, 100, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (bucheFond) ctx.drawImage(bucheFond, 0, 0);
    ctx.setTransform(k, 0, 0, k, 0, 0);

    // flammes
    ctx.globalCompositeOperation = 'lighter';
    for (const p of flammes) {
      const u = p.age / p.vie;
      const r = p.r * (1 - u * .78) * (u < .12 ? .55 + u * 3.75 : 1);
      const a = Math.pow(1 - u, .9) * .62 * I;
      ctx.globalAlpha = a;
      ctx.drawImage(feuSprites[Math.min(23, Math.floor(u * 24))], p.x - r, p.y - r * 1.35, r * 2, r * 2.7);
    }
    ctx.globalAlpha = 1;

    // bûche de devant + fissures rougeoyantes
    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (bucheAvant) ctx.drawImage(bucheAvant, 0, 0);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const f of fissures) {
      const a = (.45 + .45 * Math.sin(t * f.v + f.ph)) * I;
      ctx.strokeStyle = `rgba(255,110,30,${a * .35})`; ctx.lineWidth = 4; ctx.stroke(f.p);
      ctx.strokeStyle = `rgba(255,170,70,${a})`; ctx.lineWidth = 1.2; ctx.stroke(f.p);
    }
    // braises vives
    for (let i = 0; i < 14; i++) {
      const x = FX - 70 + i * 10.5, a = (.4 + .4 * Math.sin(t * (2 + i % 5) + i * 1.7)) * I;
      ctx.globalAlpha = a; ctx.drawImage(feuSprites[4], x - 6, 530 - (i % 3) * 2, 12, 7);
    }
    ctx.globalAlpha = 1;
    // étincelles
    for (const s of etincelles) {
      const a = 1 - s.age / s.vie;
      ctx.globalAlpha = a; ctx.drawImage(feuSprites[2], s.x - 2.6, s.y - 2.6, 5.2, 5.2);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    ctx.setTransform(k, 0, 0, k, 0, 0);

    // reflet du feu sur le sol
    ctx.globalCompositeOperation = 'lighter';
    g = ctx.createRadialGradient(FX, 560, 10, FX, 560, 280);
    g.addColorStop(0, `rgba(255,140,50,${.32 * I})`); g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 540, 800, 60);

    // bougies
    D.bougies.forEach(([x, y, s], i) => {
      const sw = Math.sin(t * 2.7 + i * 2) * .9 + Math.sin(t * 7.3 + i) * .35;
      const fl = 1 + .06 * Math.sin(t * 11 + i * 3);
      const h = 20 * s * fl, w = 5.2 * s;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .5; ctx.drawImage(halo, x - 30 * s, y - h * .5 - 30 * s, 60 * s, 60 * s);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      const fg = ctx.createLinearGradient(0, y + 1, 0, y - h);
      fg.addColorStop(0, 'rgba(110,140,255,.55)'); fg.addColorStop(.18, 'rgba(255,246,220,1)');
      fg.addColorStop(.6, 'rgba(255,205,100,.95)'); fg.addColorStop(1, 'rgba(255,140,40,.15)');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.moveTo(x, y + 1.5);
      ctx.bezierCurveTo(x - w, y - h * .25, x - w * .35 + sw, y - h * .78, x + sw, y - h);
      ctx.bezierCurveTo(x + w * .35 + sw, y - h * .78, x + w, y - h * .25, x, y + 1.5);
      ctx.fill();
    });

    // lumières du sapin et de la guirlande
    ctx.globalCompositeOperation = 'lighter';
    for (const l of lumieres) {
      const b = l.d * (.72 + .28 * Math.sin(t * l.v + l.ph));
      const R = 6 + 4 * b;
      ctx.globalAlpha = b * .75; ctx.drawImage(halo, l.x - R, l.y - R, R * 2, R * 2);
      ctx.globalAlpha = Math.min(1, b + .2); ctx.drawImage(haloBlanc, l.x - 2.2, l.y - 2.2, 4.4, 4.4);
    }
    for (const l of guirlande) {
      const b = .85 * (.72 + .28 * Math.sin(t * l.v + l.ph));
      ctx.globalAlpha = b * .7; ctx.drawImage(halo, l.x - 8, l.y - 8, 16, 16);
      ctx.globalAlpha = b; ctx.drawImage(haloBlanc, l.x - 2, l.y - 2, 4, 4);
    }
    // halo de l'étoile
    const [sx, sy] = D.etoile;
    ctx.globalAlpha = .55 + .15 * Math.sin(t * 1.7);
    ctx.drawImage(halo, sx - 44, sy - 44, 88, 88);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    if (lueur) lueur.style.opacity = (0.55 + (I - 0.75) * 1.8).toFixed(3);
  }

  /* ---------- boucle ---------- */
  let dernier = 0, raf = 0, depart = performance.now();
  function boucle(now) {
    raf = requestAnimationFrame(boucle);
    if (now - dernier < 1000 / 45) return;
    const dt = Math.min(.05, (now - dernier) / 1000 || 1 / 45);
    dernier = now;
    if (document.body.classList.contains('modal-on')) return;
    const t = (now - depart) / 1000;
    etape(dt, t); dessiner(t);
  }
  const demarrer = () => { if (!raf && !reduit) { dernier = performance.now(); raf = requestAnimationFrame(boucle); } };
  const arreter = () => { cancelAnimationFrame(raf); raf = 0; };

  new ResizeObserver(() => preparer()).observe(boite);
  preparer();
  demarrer();
  document.addEventListener('visibilitychange', () => (document.hidden ? arreter() : demarrer()));
}
