{
  const C = window.CONFIG, G = window.CADEAUX, DESSINS = window.DESSINS;
  const $ = (s, r = document) => r.querySelector(s);
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mémoire (cases ouvertes / lues) ---------- */
  const lire = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const ouvertes = new Set(lire('avent-ouvertes', []));
  const lues = new Set(lire('avent-lues', []));
  const sauver = () => { ecrire('avent-ouvertes', [...ouvertes]); ecrire('avent-lues', [...lues]); };

  /* ---------- temps (réel ou simulé en mode test) ---------- */
  const lireSim = () => { try { return JSON.parse(sessionStorage.getItem('avent-sim')); } catch { return null; } };
  const ecrireSim = (v) => { try { sessionStorage.setItem('avent-sim', JSON.stringify(v)); } catch {} };
  // mode test : réglage modeTest, ou adresse terminée par #test (accès discret pour vérifier)
  const testActif = C.modeTest || location.hash === '#test';
  let sim = testActif ? (lireSim() || (C.modeTest ? { tout: true, id: 'tout' } : { decalage: 0, id: 'reel' })) : null;
  addEventListener('hashchange', () => location.reload());

  const maintenant = () => new Date(Date.now() + (sim && sim.decalage ? sim.decalage : 0));
  const debut = () => new Date(C.annee, 11, 1, 0, 0, 0);
  const heure = (j) => (C.heuresSpeciales && C.heuresSpeciales[j]) || C.heureOuverture;
  const ouverture = (j) => new Date(C.annee, 11, j, heure(j), 0, 0);
  const toutOuvert = () => !!(sim && sim.tout);
  const dispo = (j) => toutOuvert() || maintenant() >= ouverture(j);
  const dateTxt = (j) => (j === 1 ? '1er décembre' : `${j} décembre`);
  const deux = (n) => String(n).padStart(2, '0');
  const duree = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return { j: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
  };
  const jourDecembre = (t) => {
    if (t.getFullYear() > C.annee) return 99;
    if (t.getFullYear() < C.annee || t.getMonth() < 11) return 0;
    return t.getDate();
  };

  $('#pour').textContent = C.pourQui || '';
  if ($('#prenom')) $('#prenom').textContent = C.prenom || '';

  /* ---------- la grille ---------- */
  const COUL = ['rouge', 'vert', 'creme'];
  const grille = $('#grille');
  grille.innerHTML = G.slice(0, 25).map((_, i) => {
    const j = i + 1, c = j === 25 ? 'or' : COUL[i % 3];
    return `<div class="cell" data-j="${j}">
      <div class="inside">
        <button class="gift" type="button" tabindex="-1" aria-label="Lire le cadeau du ${dateTxt(j)}"><svg viewBox="0 0 48 48"><use href="#i-paquet"/></svg></button>
      </div>
      <button class="door ${c}" type="button" aria-label="Case du ${dateTxt(j)}">
        <span class="face front"><span class="num">${j}</span></span>
        <span class="face back"></span>
      </button>
    </div>`;
  }).join('');
  const cases = [...grille.querySelectorAll('.cell')];
  const etat = new Map();

  function majCases(silencieux) {
    for (const cell of cases) {
      const j = +cell.dataset.j, ok = dispo(j), ouv = ouvertes.has(j) && ok;
      const avant = etat.get(j);
      cell.classList.toggle('locked', !ok && !ouv);
      cell.classList.toggle('open', ouv);
      cell.classList.toggle('read', lues.has(j));
      cell.classList.toggle('glow', ok && !ouv && !toutOuvert());
      $('.gift', cell).tabIndex = ouv ? 0 : -1;
      $('.door', cell).tabIndex = ouv ? -1 : 0;
      if (!silencieux && avant === false && ok && !ouv && !toutOuvert()) {
        // la case vient de se débloquer (10h pile)
        cell.classList.remove('pop'); void cell.offsetWidth; cell.classList.add('pop');
        const r = cell.getBoundingClientRect();
        fx.eclat(r.left + r.width / 2, r.top + r.height / 2, 26);
        notifier();
      }
      etat.set(j, ok);
    }
  }

  grille.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const j = +cell.dataset.j;
    if (e.target.closest('.gift')) { ouvrirParchemin(j); return; }
    if (!e.target.closest('.door') || (ouvertes.has(j) && dispo(j))) return;
    if (!dispo(j)) { refuser(cell, j); return; }
    ouvrirPorte(cell, j);
  });

  function ouvrirPorte(cell, j) {
    ouvertes.add(j); sauver();
    cell.classList.add('anim');
    majCases(true); maj();
    setTimeout(() => {
      const r = cell.getBoundingClientRect();
      fx.eclat(r.left + r.width / 2, r.top + r.height / 2, 22);
    }, 380);
    setTimeout(() => cell.classList.remove('anim'), 1100);
  }

  function refuser(cell, j) {
    cell.classList.remove('shake'); void cell.offsetWidth; cell.classList.add('shake');
    const t = maintenant();
    if (t < debut()) toast('Patience… le calendrier commence le 1er décembre');
    else if (jourDecembre(t) === j) toast(`Encore un peu de patience : elle s'ouvre à ${heure(j)}h`);
    else toast(`Pas si vite ! Cette case s'ouvre le ${dateTxt(j)} à ${heure(j)}h`);
  }

  /* ---------- bandeau : chrono puis statut du jour ---------- */
  const bandeau = $('#bandeau');
  let phase = null;

  function maj(silencieux) {
    const t = maintenant();
    majCases(silencieux);
    if (toutOuvert()) { bandeau.hidden = true; phase = 'tout'; return; }
    bandeau.hidden = false;

    if (t < debut()) {
      if (phase !== 'attente') {
        bandeau.innerHTML = `<div class="carte"><p class="ch-label">Ouverture du calendrier dans</p>
          <div class="ch-row">${['jours', 'heures', 'min', 'sec'].map((l, i) => `<span class="u"><b class="volet" data-k="${'jhms'[i]}">00</b><i>${l}</i></span>`).join('')}</div></div>`;
        phase = 'attente';
      }
      const d = duree(debut() - t);
      for (const k of 'jhms') {
        const el = bandeau.querySelector(`[data-k="${k}"]`), v = deux(d[k]);
        if (el.textContent !== v) {
          el.textContent = v;
          if (!silencieux && !reduit) { el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip'); }
        }
      }
      return;
    }

    const jour = jourDecembre(t);
    const passageMinuit = phase === 'attente' && !silencieux;
    let titre, statut;
    if (jour > 25) { titre = 'Joyeux Noël !'; statut = 'Toutes les cases sont ouvertes. Je t\'aime ❤'; }
    else {
      titre = jour === 1 ? 'C\'est décembre !' : jour === 25 ? 'Joyeux Noël !' : `Jour ${jour} de l'Avent`;
      if (t < ouverture(jour)) {
        const d = duree(ouverture(jour) - t);
        statut = `Ta case du jour s'ouvre à ${heure(jour)}h, dans <b>${d.h ? d.h + ' h ' : ''}${deux(d.m)} min ${deux(d.s)} s</b>`;
      } else if (!ouvertes.has(jour)) statut = 'Ta case du jour t\'attend !';
      else if (jour < 25) statut = `Prochaine case demain à ${heure(jour + 1)}h`;
      else statut = 'Toutes les cases sont ouvertes. Je t\'aime ❤';
    }
    const cle = jour === 1 ? 'dec1' : 'jour';
    if (phase !== cle) {
      bandeau.innerHTML = jour === 1
        ? `<div class="carte"><p class="ch-label"></p><div class="ch-row stop">${['jours', 'heures', 'min', 'sec'].map((l) => `<span class="u"><b class="volet">00</b><i>${l}</i></span>`).join('')}</div><p class="statut"></p></div>`
        : `<div class="carte court"><p class="ch-label"></p><p class="statut"></p></div>`;
      phase = cle;
    }
    $('.ch-label', bandeau).textContent = titre;
    $('.statut', bandeau).innerHTML = statut;
    if (passageMinuit) feterMinuit();
  }

  function feterMinuit() {
    toast('C\'est décembre !! 🎄');
    const r = bandeau.getBoundingClientRect();
    [0, 350, 700].forEach((d, i) => setTimeout(() => fx.eclat(r.left + r.width * (0.25 + i * 0.25), r.top + r.height / 2, 34), d));
  }

  /* ---------- parchemin ---------- */
  const modal = $('#parchemin'), rouleau = $('.rouleau', modal), papier = $('.papier', modal), pin = $('.papier-in', modal);
  const fond = $('.backdrop', modal), sceau = $('.sceau', modal), btnFermer = $('.fermer', modal);
  let occupe = false, focusAvant = null;
  const T = reduit ? 0 : 1;

  function bordsDechires() {
    const g = [], d = [];
    for (let i = 0; i <= 40; i++) {
      const y = (i / 40 * 100).toFixed(1);
      g.push(`${(Math.random() * 4.5).toFixed(1)}px ${y}%`);
      d.unshift(`calc(100% - ${(Math.random() * 4.5).toFixed(1)}px) ${y}%`);
    }
    return `polygon(${g.join(',')},${d.join(',')})`;
  }

  async function ouvrirParchemin(j) {
    if (occupe) return;
    occupe = true; focusAvant = document.activeElement;
    const g = G[j - 1] || {};
    $('#p-jour').textContent = `Jour ${j} · ${dateTxt(j)}`;
    $('#p-titre').textContent = g.titre || '';
    $('#p-texte').textContent = g.texte || '';
    $('#p-sign').textContent = C.signature ? `— ${C.signature}` : '';
    const fig = $('#p-fig');
    if (g.image) {
      fig.className = 'p-fig photo';
      fig.innerHTML = `<img alt="">`;
      const img = fig.firstChild; img.src = g.image;
      try { await img.decode(); } catch {}
    } else {
      fig.className = 'p-fig dessin';
      fig.innerHTML = DESSINS[g.dessin] || DESSINS.cadeau;
    }
    for (const el of pin.children) { el.getAnimations().forEach((a) => a.cancel()); el.style.opacity = ''; }
    [rouleau, papier, fond, sceau, btnFermer].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    papier.style.height = '0px'; papier.style.overflowY = 'hidden'; papier.scrollTop = 0;
    papier.style.clipPath = bordsDechires();
    sceau.style.display = ''; btnFermer.hidden = true;
    modal.hidden = false; document.body.classList.add('modal-on');

    const hauteur = Math.min(pin.offsetHeight, Math.round(innerHeight * 0.68));
    fond.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 * T + 1, fill: 'both' });
    await rouleau.animate([
      { transform: 'translateY(40px) scale(.25) rotate(-16deg)', opacity: 0 },
      { transform: 'translateY(0) scale(1.06) rotate(3deg)', opacity: 1, offset: 0.65 },
      { transform: 'none', opacity: 1 }
    ], { duration: 750 * T + 1, easing: 'ease-out', fill: 'both' }).finished;
    await new Promise((r) => setTimeout(r, 250 * T));
    sceau.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.5) rotate(25deg)', opacity: 0 }], { duration: 380 * T + 1, easing: 'ease-in', fill: 'forwards' });
    await papier.animate([{ height: '0px' }, { height: hauteur + 'px' }], { duration: 1350 * T + 1, easing: 'cubic-bezier(.3,.75,.25,1)', fill: 'forwards' }).finished;
    papier.style.height = hauteur + 'px';
    papier.getAnimations().forEach((a) => a.cancel());
    if (pin.offsetHeight > hauteur + 2) papier.style.overflowY = 'auto';
    sceau.style.display = 'none';
    [...pin.children].forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
      { duration: 550 * T + 1, delay: i * 160 * T, easing: 'ease-out', fill: 'forwards' }));
    const r = rouleau.getBoundingClientRect();
    fx.eclat(r.left + r.width / 2, r.top + 30, 30, true);
    lues.add(j); sauver(); majCases(true);
    btnFermer.hidden = false;
    btnFermer.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 400 * T + 1, delay: 700 * T, fill: 'both' });
    btnFermer.focus({ preventScroll: true });
    occupe = false;
  }

  async function fermer() {
    if (occupe || modal.hidden) return;
    occupe = true;
    btnFermer.hidden = true;
    const hh = papier.offsetHeight;
    papier.style.overflowY = 'hidden';
    for (const el of pin.children) el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 * T + 1, fill: 'forwards' });
    await papier.animate([{ height: hh + 'px' }, { height: '0px' }], { duration: 650 * T + 1, easing: 'cubic-bezier(.6,0,.8,.45)', fill: 'forwards' }).finished;
    rouleau.getAnimations().forEach((a) => a.cancel());
    await Promise.all([
      rouleau.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(30px) scale(.5) rotate(10deg)' }], { duration: 380 * T + 1, easing: 'ease-in', fill: 'forwards' }).finished,
      fond.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420 * T + 1, fill: 'forwards' }).finished
    ]);
    modal.hidden = true; document.body.classList.remove('modal-on');
    occupe = false;
    if (focusAvant && focusAvant.focus) focusAvant.focus({ preventScroll: true });
  }
  btnFermer.addEventListener('click', fermer);
  fond.addEventListener('click', fermer);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });

  /* ---------- petits messages ---------- */
  let toastT;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2800);
  }

  /* ---------- notifications ---------- */
  const notifEl = $('#notif');
  let notifT;
  $('#n-app').textContent = C.notification.titre;
  $('#n-txt').textContent = C.notification.texte;
  function fausseNotif() {
    notifEl.classList.add('show');
    clearTimeout(notifT); notifT = setTimeout(() => notifEl.classList.remove('show'), 5000);
  }
  notifEl.addEventListener('click', () => notifEl.classList.remove('show'));

  async function notifier(demander) {
    let reel = false;
    try {
      if ('Notification' in window) {
        let p = Notification.permission;
        if (p === 'default' && demander) p = await Notification.requestPermission();
        if (p === 'granted') {
          const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
          const opts = { body: C.notification.texte, icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', tag: 'avent' };
          if (reg) await reg.showNotification(C.notification.titre, opts);
          else new Notification(C.notification.titre, opts);
          reel = true;
        }
      }
    } catch {}
    if (!reel || document.visibilityState === 'visible') fausseNotif();
  }

  /* ---------- effets : éclats d'étoiles et de cœurs ---------- */
  const fx = (() => {
    const cv = $('#fx'), ctx = cv.getContext('2d');
    let parts = [], raf = 0, dpr = 1;
    const taille = () => { dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    taille(); addEventListener('resize', taille);
    const COUL = ['#ffd36b', '#ff6b7d', '#fff3d6', '#e8b85a', '#ff9db0'];
    const coeur = (x, y, r) => {
      ctx.beginPath(); ctx.moveTo(x, y + r * 0.9);
      ctx.bezierCurveTo(x - r * 1.7, y - r * 0.2, x - r * 0.6, y - r * 1.5, x, y - r * 0.4);
      ctx.bezierCurveTo(x + r * 0.6, y - r * 1.5, x + r * 1.7, y - r * 0.2, x, y + r * 0.9); ctx.fill();
    };
    const etoile = (x, y, r, a) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, b = a + i * Math.PI / 5; ctx.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); }
      ctx.closePath(); ctx.fill();
    };
    function pas() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.vie > 0);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.11; p.vx *= 0.985; p.vie -= p.dec; p.a += 0.06;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.vie * 1.4)); ctx.fillStyle = p.c;
        p.coeur ? coeur(p.x, p.y, p.r) : etoile(p.x, p.y, p.r, p.a);
      }
      ctx.globalAlpha = 1;
      raf = parts.length ? requestAnimationFrame(pas) : 0;
    }
    return {
      eclat(x, y, n = 24, coeurs = false) {
        if (reduit) return;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 4.5;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2.5, vie: 1, dec: 0.011 + Math.random() * 0.012,
            r: 3 + Math.random() * 4, c: COUL[i % COUL.length], coeur: coeurs ? i % 3 !== 0 : i % 4 === 0, a: Math.random() * 6 });
        }
        if (!raf) raf = requestAnimationFrame(pas);
      }
    };
  })();

  /* ---------- guirlande lumineuse ---------- */
  function guirlande() {
    const svg = $('#guirlande'), W = innerWidth, seg = Math.max(90, W / 4.5), n = Math.ceil(W / seg) + 1;
    let d = 'M-10 3';
    const ampoules = [];
    for (let i = 0; i < n; i++) {
      const x0 = -10 + i * seg, x1 = x0 + seg, xm = (x0 + x1) / 2;
      d += ` Q${xm} 30 ${x1} 3`;
      for (let t = 0.1; t < 1; t += 0.2) {
        const u = 1 - t;
        ampoules.push([u * u * x0 + 2 * u * t * xm + t * t * x1, u * u * 3 + 2 * u * t * 30 + t * t * 3]);
      }
    }
    svg.setAttribute('viewBox', `0 0 ${W} 44`);
    svg.innerHTML = `<defs><radialGradient id="hl"><stop offset="0" stop-color="#fff6dc"/><stop offset=".18" stop-color="#ffd890" stop-opacity=".75"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient></defs>`
      + `<path d="${d}" fill="none" stroke="#2a1c12" stroke-width="1.2"/>`
      + ampoules.map(([x, y], i) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle class="halo" r="11" fill="url(#hl)" style="animation-delay:${-((i * 0.53) % 2.4).toFixed(2)}s"/><rect x="-1.6" y="-1" width="3.2" height="4.5" rx="1" fill="#3a2a1c"/><ellipse cy="5" rx="2" ry="2.8" fill="#fff8e6"/></g>`).join('');
  }
  guirlande(); addEventListener('resize', guirlande);

  /* ---------- mode test ---------- */
  if (testActif) {
    const A = C.annee;
    const PRESETS = [
      ['tout', 'Tout débloqué'],
      ['reel', 'Heure réelle'],
      [`${A}-11-30T23:59:50`, '30 nov · 23:59:50'],
      [`${A}-12-01T09:59:50`, '1er déc · 9:59:50'],
      [`${A}-12-01T10:00:05`, '1er déc · 10:00'],
      [`${A}-12-12T10:00:05`, '12 déc · 10:00'],
      [`${A}-12-24T21:00:00`, '24 déc · 21:00'],
      [`${A}-12-25T19:59:50`, '25 déc · 19:59:50']
    ];
    const test = $('#test'), panel = $('#test-panel'), pill = $('#test-pill'), heure = $('#test-heure');
    test.hidden = false;
    $('#test-grid').innerHTML = PRESETS.map(([id, l]) => `<button type="button" data-sim="${id}">${l}</button>`).join('');
    const marquer = () => panel.querySelectorAll('[data-sim]').forEach((b) => b.classList.toggle('on', b.dataset.sim === (sim && sim.id)));
    marquer();
    pill.addEventListener('click', () => {
      panel.hidden = !panel.hidden; pill.setAttribute('aria-expanded', String(!panel.hidden));
    });
    panel.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.sim) {
        const id = b.dataset.sim;
        sim = id === 'tout' ? { tout: true, id } : id === 'reel' ? { decalage: 0, id } : { decalage: new Date(id).getTime() - Date.now(), id };
        ecrireSim(sim); marquer(); phase = null; etat.clear(); maj(true); afficherHeure();
        panel.hidden = true; pill.setAttribute('aria-expanded', 'false');
      } else if (b.dataset.act === 'reset') {
        ouvertes.clear(); lues.clear(); sauver(); phase = null; maj(true); toast('Toutes les cases sont refermées');
      } else if (b.dataset.act === 'notif') {
        notifier(true);
      } else if (b.dataset.act === 'carte') {
        ecrire('avent-notif', {}); carteNotif(); panel.hidden = true;
      }
    });
    const fmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const afficherHeure = () => { heure.textContent = toutOuvert() ? 'Toutes les cases sont ouvrables' : 'Heure simulée : ' + fmt.format(maintenant()); };
    afficherHeure(); setInterval(afficherHeure, 1000);
  }

  /* ---------- installation et notifications ---------- */
  const carte = $('#carte-notif');
  const enApp = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const pushOK = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && window.isSecureContext && window.top === window.self;
  const swPret = () => Promise.race([navigator.serviceWorker.ready, new Promise((_, r) => setTimeout(() => r(new Error('sw')), 6000))]);
  const cleVapid = (b64) => {
    const s = (b64 + '='.repeat((4 - b64.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  };
  const echap = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  function afficherCarte(etat, code) {
    if (!etat) { carte.hidden = true; carte.innerHTML = ''; return; }
    const T = {
      installer: ['i-partager', 'Installe le calendrier sur ton iPhone',
        'Touche <svg viewBox="0 0 24 24"><use href="#i-partager"/></svg> Partager en bas de Safari, puis « Sur l\'écran d\'accueil ». Ensuite, ouvre-le depuis son icône.',
        '<button type="button" data-cn="plus-tard" class="cn-ok">D\'accord</button>'],
      activer: ['i-cloche', 'Un petit rappel chaque jour ?',
        `Reçois « ${echap(C.notification.texte)} » dès que ta case s'ouvre.`,
        '<button type="button" data-cn="activer" class="cn-ok">Activer les notifications</button><button type="button" data-cn="plus-tard">Plus tard</button>'],
      code: ['i-cloche', 'Notifications activées',
        'Dernière étape : copie ce code et envoie-le à ton chéri pour qu\'il active le rappel.',
        '<button type="button" data-cn="copier" class="cn-ok">Copier le code</button><button type="button" data-cn="fini">C\'est fait</button>'],
      refuse: ['i-cloche', 'Les notifications sont bloquées',
        'Pour les autoriser : Réglages de l\'iPhone → Notifications → Avent.',
        '<button type="button" data-cn="plus-tard" class="cn-ok">D\'accord</button>']
    }[etat];
    carte.innerHTML = `<div class="cn"><svg viewBox="0 0 24 24"><use href="#${T[0]}"/></svg><p class="cn-t">${T[1]}</p><p class="cn-s">${T[2]}</p>`
      + (code ? `<textarea readonly aria-label="Code des notifications">${echap(code)}</textarea>` : '')
      + `<div class="cn-btns">${T[3]}</div></div>`;
    carte.hidden = false;
  }

  async function carteNotif() {
    try {
      if (window.top !== window.self) return afficherCarte(null);
      const pref = lire('avent-notif', {});
      if (pref.fini || (pref.plusTard && Date.now() - pref.plusTard < 2 * 864e5)) return afficherCarte(null);
      if (ios && !enApp) return afficherCarte('installer');
      if (!pushOK || !C.vapidPublic) return afficherCarte(null);
      if (Notification.permission === 'denied') return afficherCarte('refuse');
      const reg = await swPret();
      const sub = await reg.pushManager.getSubscription();
      if (sub) return afficherCarte('code', JSON.stringify(sub));
      afficherCarte('activer');
    } catch { afficherCarte(null); }
  }

  carte.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-cn]'); if (!b) return;
    const act = b.dataset.cn;
    if (act === 'plus-tard') { ecrire('avent-notif', { plusTard: Date.now() }); afficherCarte(null); }
    else if (act === 'fini') { ecrire('avent-notif', { fini: true }); afficherCarte(null); toast('Parfait, à demain pour ta case !'); }
    else if (act === 'copier') {
      const zone = $('textarea', carte);
      try { await navigator.clipboard.writeText(zone.value); toast('Code copié !'); }
      catch { zone.focus(); zone.select(); toast('Sélectionne le code et copie-le'); }
    } else if (act === 'activer') {
      try {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') { afficherCarte(perm === 'denied' ? 'refuse' : 'activer'); return; }
        const reg = await swPret();
        const sub = (await reg.pushManager.getSubscription())
          || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: cleVapid(C.vapidPublic) });
        afficherCarte('code', JSON.stringify(sub));
        reg.showNotification(C.notification.titre, { body: 'Les notifications sont activées ❤', icon: 'icons/icon-192.png', tag: 'avent-ok' }).catch(() => {});
      } catch { toast('Impossible d\'activer les notifications pour le moment'); }
    }
  });

  /* ---------- démarrage ---------- */
  maj(true);
  setInterval(() => maj(false), 1000);
  carteNotif();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) maj(true); });

  try {
    if ('serviceWorker' in navigator && window.isSecureContext && window.top === window.self) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  } catch {}
}
