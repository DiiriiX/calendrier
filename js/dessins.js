/* Petits dessins à l'encre pour le parchemin (quand il n'y a pas de photo) */
window.DESSINS = (() => {
  const g = (inner) => `<svg viewBox="0 0 200 140" aria-hidden="true"><g fill="none" stroke="#6b3b1f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
  const R = "rgba(198,47,58,.32)", O = "rgba(232,184,90,.55)", V = "rgba(31,106,71,.32)";
  const C = "rgba(110,58,22,.5)", CF = "rgba(70,34,12,.75)", B = "rgba(255,252,240,.75)", A = "rgba(170,175,190,.45)", P = "rgba(232,120,150,.35)";
  const f = (x) => Math.round(x * 10) / 10;
  const eclat = (x, y, s) => `<path d="M${x} ${y - s}L${x + s * .3} ${y - s * .3}L${x + s} ${y}L${x + s * .3} ${y + s * .3}L${x} ${y + s}L${x - s * .3} ${y + s * .3}L${x - s} ${y}L${x - s * .3} ${y - s * .3}Z" fill="${O}" stroke-width="2"/>`;
  const petitCoeur = (x, y, s, fill = R) => `<path d="M${x} ${y + s}C${x - s * 1.6} ${y - s * .1} ${x - s * 1.1} ${y - s * 1.3} ${x} ${y - s * .4}C${x + s * 1.1} ${y - s * 1.3} ${x + s * 1.6} ${y - s * .1} ${x} ${y + s}Z" fill="${fill}" stroke-width="2"/>`;

  // empreintes de pas le long d'une ligne
  const pas = (x1, y1, x2, y2, n, s) => {
    const a = Math.atan2(y2 - y1, x2 - x1), deg = a * 180 / Math.PI + 90;
    let out = '';
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), cote = i % 2 ? 1 : -1;
      const x = x1 + (x2 - x1) * t - Math.sin(a) * cote * s * .7, y = y1 + (y2 - y1) * t + Math.cos(a) * cote * s * .7;
      out += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(deg)})"><ellipse rx="${f(s * .55)}" ry="${f(s * .85)}" fill="${C}" stroke-width="2"/><ellipse cy="${f(s * 1.35)}" rx="${f(s * .42)}" ry="${f(s * .45)}" fill="${C}" stroke-width="2"/></g>`;
    }
    return out;
  };

  // dé en perspective
  const de = (x, y, s, haut, gauche, droite) => {
    const k = s * .87;
    const faces = [
      [[x, y - s / 2], [k, s / 2], [-k, s / 2], haut, B],
      [[x - k, y], [k, s / 2], [0, s], gauche, "rgba(235,225,205,.75)"],
      [[x, y + s / 2], [k, -s / 2], [0, s], droite, "rgba(215,200,175,.75)"],
    ];
    const PTS = { 1: [[.5, .5]], 2: [[.27, .27], [.73, .73]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.27, .27], [.73, .27], [.27, .73], [.73, .73]],
      5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.27, .22], [.27, .5], [.27, .78], [.73, .22], [.73, .5], [.73, .78]] };
    let out = '';
    for (const [[ox, oy], [ux, uy], [vx, vy], nb, fill] of faces) {
      out += `<path d="M${f(ox)} ${f(oy)}l${f(ux)} ${f(uy)}l${f(vx)} ${f(vy)}l${f(-ux)} ${f(-uy)}Z" fill="${fill}"/>`;
      for (const [a, b] of PTS[nb]) out += `<circle cx="${f(ox + ux * a + vx * b)}" cy="${f(oy + uy * a + vy * b)}" r="${f(s * .07)}" fill="#6b3b1f" stroke="none"/>`;
    }
    return out;
  };

  // cookie croqué
  const cookie = (cx, cy, r, bx, by, br) => {
    const pts = [];
    for (let i = 0; i < 72; i++) {
      const a = i / 72 * Math.PI * 2;
      let x = cx + Math.cos(a) * r * (1 + Math.sin(a * 7) * .02), y = cy + Math.sin(a) * r * (1 + Math.cos(a * 5) * .02);
      const d = Math.hypot(x - bx, y - by);
      if (d < br) { x = bx + (x - bx) / d * br; y = by + (y - by) / d * br; }
      pts.push(`${f(x)} ${f(y)}`);
    }
    return `M${pts.join('L')}Z`;
  };

  // spirale de sucette
  const spirale = (cx, cy, r) => {
    let d = `M${cx} ${cy}`;
    for (let i = 1; i <= 60; i++) { const a = i * .42, rr = r * i / 60; d += `L${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`; }
    return d;
  };

  const bonbon = (x, y, rot, fill) => `<g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M-20 0L-38 -13L-33 0L-38 13Z M20 0L38 -13L33 0L38 13Z" fill="${fill}"/>
      <ellipse rx="22" ry="15" fill="${fill}"/>
      <path d="M-10 -13Q-4 0 -10 13M2 -15Q8 0 2 15M13 -11Q18 0 13 11" stroke-width="2" opacity=".7"/>
      <path d="M-12 -7Q-6 -11 2 -10" stroke="#fff" stroke-width="2.5" opacity=".8"/></g>`;

  return {
    cadeau: g(`
      <path d="M54 64H146V126H54Z" fill="${R}"/>
      <path d="M46 48H154V66H46Z" fill="${R}"/>
      <path d="M92 48H108V126H92Z" fill="${O}"/>
      <path d="M100 48C82 22 58 26 68 42C74 50 90 49 100 48C110 49 126 50 132 42C142 26 118 22 100 48Z" fill="${O}"/>
      ${eclat(30, 34, 10)}${eclat(172, 40, 8)}${eclat(170, 104, 6)}`),
    coeur: g(`
      <path d="M100 128C56 100 36 79 36 55C36 37 50 25 66 25C81 25 93 35 100 48C107 35 119 25 134 25C150 25 164 37 164 55C164 79 144 100 100 128Z" fill="${R}"/>
      <path d="M58 52C58 44 64 39 72 39" stroke-width="2.5"/>
      ${petitCoeur(26, 96, 7)}${petitCoeur(176, 22, 7)}
      ${eclat(178, 98, 7)}`),
    tasse: g(`
      <path d="M40 128H150" />
      <path d="M58 58H132V96C132 112 120 124 104 124H86C70 124 58 112 58 96Z" fill="${R}"/>
      <path d="M132 68C152 66 154 98 132 100" />
      <path d="M58 58C70 66 120 66 132 58" fill="rgba(120,70,30,.35)"/>
      <rect x="74" y="50" width="12" height="10" rx="3" fill="#fff"/><rect x="92" y="47" width="12" height="10" rx="3" fill="#fff"/><rect x="108" y="51" width="11" height="10" rx="3" fill="#fff"/>
      <path d="M78 40C70 30 86 24 78 12M98 38C90 28 106 22 98 10M118 40C110 30 126 24 118 12" stroke-width="2.5"/>
      <path d="M80 84C86 80 92 80 95 86C98 80 104 80 108 84C108 92 95 100 95 100C95 100 80 92 80 84Z" fill="rgba(255,255,255,.6)" stroke-width="2"/>`),
    etoile: g(`
      <path d="M100 14L117 52L158 56L127 83L136 124L100 103L64 124L73 83L42 56L83 52Z" fill="${O}"/>
      <path d="M100 34L108 54" stroke-width="2.5"/>
      ${eclat(32, 30, 9)}${eclat(170, 26, 7)}${eclat(166, 112, 9)}${eclat(30, 110, 6)}`),
    sapin: g(`
      <path d="M100 14L66 64H82L56 98H74L44 128H156L126 98H144L118 64H134Z" fill="${V}"/>
      <path d="M92 128V136H108V128" />
      <path d="M100 6L103 12L110 13L105 17L106 24L100 20L94 24L95 17L90 13L97 12Z" fill="${O}" stroke-width="2"/>
      <circle cx="88" cy="56" r="5" fill="${R}"/><circle cx="112" cy="80" r="5" fill="${O}"/><circle cx="80" cy="90" r="5" fill="${O}"/>
      <circle cx="120" cy="112" r="5" fill="${R}"/><circle cx="76" cy="116" r="5" fill="${R}"/><circle cx="100" cy="100" r="5" fill="${R}"/>
      <path d="M78 70Q100 80 124 66M66 104Q100 116 134 100" stroke="rgba(198,47,58,.7)" stroke-width="2.5"/>`),
    ticket: g(`
      <path d="M24 40H176V60A10 10 0 0 0 176 80V100H24V80A10 10 0 0 0 24 60Z" fill="${O}" transform="rotate(-6 100 70)"/>
      <path d="M138 38V102" stroke-dasharray="5 6" stroke-width="2.5" transform="rotate(-6 100 70)"/>
      <path d="M157 61L160 67L166 68L161.5 72L163 78L157 75L151 78L152.5 72L148 68L154 67Z" fill="${R}" stroke-width="2" transform="rotate(-6 100 70)"/>
      <text x="80" y="80" text-anchor="middle" transform="rotate(-6 100 70)" fill="#6b3b1f" stroke="none" style="font:700 30px 'Dancing Script',cursive">1 place</text>`),
    lettre: g(`
      <path d="M36 40H164V116H36Z" fill="rgba(255,250,235,.7)"/>
      <path d="M36 40L100 88L164 40"/>
      <path d="M36 116L84 76M164 116L116 76" stroke-width="2.5"/>
      <circle cx="100" cy="88" r="15" fill="${R}"/>
      <path d="M100 96C95 92.5 93 90 93 87.5C93 85.5 94.5 84 96.5 84C98 84 99.2 85 100 86.4C100.8 85 102 84 103.5 84C105.5 84 107 85.5 107 87.5C107 90 105 92.5 100 96Z" fill="#fff" stroke="none"/>
      ${eclat(176, 30, 8)}${eclat(24, 124, 6)}`),

    /* tablette de chocolat entamée */
    chocolat: g(`<g transform="rotate(-8 100 72)">
      <path d="M40 32H104V112H40Z" fill="${C}"/>
      <path d="M40 58.7H104M40 85.3H104M61.3 32V112M82.7 32V112" stroke-width="2.5"/>
      <path d="M44 36H58M44 62H58M65 36H79M65 62H79M44 89H58M86 36H100" stroke="rgba(255,230,200,.5)" stroke-width="2"/>
      <path d="M100 28L110 28L105 36L111 44L105 52L111 60L105 68L111 76L105 84L111 92L105 100L111 108L106 116L100 116Z" fill="${A}" stroke-width="2"/>
      <path d="M110 28H164V116H110Z" fill="rgba(198,47,58,.5)"/>
      <path d="M110 60H164V84H110Z" fill="${O}"/>
      ${petitCoeur(137, 72, 6, "rgba(198,47,58,.6)")}
      </g>${eclat(28, 30, 8)}${eclat(176, 116, 7)}${eclat(172, 26, 6)}`),

    /* boîte de pralines en cœur */
    pralines: g(`
      <path d="M100 132C52 102 28 80 28 52C28 32 44 18 63 18C80 18 92 28 100 42C108 28 120 18 137 18C156 18 172 32 172 52C172 80 148 102 100 132Z" fill="rgba(198,47,58,.45)"/>
      <path d="M100 118C62 94 44 76 44 55C44 41 55 32 67 32C81 32 92 41 100 54C108 41 119 32 133 32C145 32 156 41 156 55C156 76 138 94 100 118Z" fill="rgba(90,30,12,.35)" stroke-width="2.5"/>
      ${[[70, 54], [100, 66], [130, 54], [84, 84], [116, 84], [100, 102]].map(([x, y], i) =>
        `<circle cx="${x}" cy="${y}" r="11" fill="${i % 2 ? CF : C}" stroke-width="2.5"/><path d="M${x - 6} ${y - 2}Q${x} ${y - 8} ${x + 6} ${y - 2}" stroke="${i % 2 ? 'rgba(255,220,180,.7)' : 'rgba(255,240,220,.8)'}" stroke-width="2"/>`).join('')}
      ${eclat(178, 112, 7)}${eclat(22, 112, 6)}`),

    /* deux traces de pas qui marchent ensemble */
    pas: g(`
      ${pas(48, 130, 112, 40, 6, 10)}${pas(84, 134, 146, 46, 6, 8)}
      ${petitCoeur(150, 22, 9)}
      <path d="M22 60L30 44L38 60H33L40 72H20L27 60Z" fill="${V}" stroke-width="2"/><path d="M172 98L180 82L188 98H183L190 110H170L177 98Z" fill="${V}" stroke-width="2"/>`),

    /* cupcake et macarons */
    gateau: g(`
      <path d="M70 80L130 80L121 128L79 128Z" fill="${R}"/>
      <path d="M82 81L87 127M96 81L98 127M110 81L109 127M122 81L117 127" stroke-width="2"/>
      <path d="M64 82C56 70 68 60 78 64C76 48 96 44 100 54C106 42 126 48 122 62C132 60 142 72 136 82Z" fill="${B}"/>
      <path d="M76 72Q92 64 106 70M88 60Q100 54 112 60" stroke-width="2"/>
      <circle cx="100" cy="42" r="8" fill="rgba(198,47,58,.7)"/><path d="M101 34C102 26 108 22 114 20" stroke-width="2.5"/>
      <circle cx="97" cy="39" r="2" fill="#fff" stroke="none"/>
      <g transform="translate(34 110)"><ellipse cy="-7" rx="18" ry="7" fill="${P}"/><path d="M-17 -3H17" stroke-width="2"/><ellipse cy="4" rx="18" ry="7" fill="${P}"/></g>
      <g transform="translate(166 112)"><ellipse cy="-7" rx="17" ry="7" fill="${V}"/><path d="M-16 -3H16" stroke-width="2"/><ellipse cy="4" rx="17" ry="7" fill="${V}"/></g>
      ${eclat(40, 34, 8)}${eclat(164, 40, 7)}`),

    /* cookie croqué */
    cookie: g(`
      <path d="${cookie(150, 92, 30, 999, 999, 1)}" fill="#e2b866" stroke-width="2.5"/>
      <path d="${cookie(88, 70, 50, 126, 34, 22)}" fill="#ecc77c"/>
      ${[[70, 52], [100, 64], [76, 84], [104, 92], [60, 72], [86, 104], [118, 70], [92, 44]].map(([x, y], i) =>
        `<path d="M${x - 4} ${y}L${x - 1} ${y - 5}L${x + 4} ${y - 3}L${x + 4} ${y + 3}L${x - 1} ${y + 4}Z" fill="${CF}" stroke-width="1.5"/>`).join('')}
      ${[[140, 82], [158, 98], [148, 108], [164, 84]].map(([x, y]) => `<path d="M${x - 3} ${y}L${x} ${y - 4}L${x + 3} ${y}L${x} ${y + 3}Z" fill="${CF}" stroke-width="1.5"/>`).join('')}
      <circle cx="140" cy="28" r="2.5" fill="${O}" stroke-width="1.5"/><circle cx="150" cy="40" r="2" fill="${O}" stroke-width="1.5"/><circle cx="136" cy="46" r="1.6" fill="${O}" stroke-width="1.2"/>`),

    /* bonbons et sucette */
    bonbon: g(`
      ${bonbon(64, 52, -18, R)}${bonbon(104, 108, 14, V)}
      <path d="M150 66V128" stroke-width="4"/>
      <circle cx="150" cy="44" r="23" fill="${P}"/>
      <path d="${spirale(150, 44, 21)}" stroke-width="2.2"/>
      ${eclat(30, 110, 7)}${eclat(110, 22, 6)}${eclat(184, 100, 6)}`),

    /* chalet de marché de Noël */
    chalet: g(`
      <path d="M52 64H148V126H52Z" fill="${C}"/>
      <path d="M64 66V124M76 66V124M124 66V124M136 66V124" stroke-width="1.5" opacity=".6"/>
      <path d="M66 78H134V108H66Z" fill="rgba(255,196,110,.45)"/>
      <path d="M62 108H138V116H62Z" fill="${O}"/>
      <path d="M76 100h9v8h-9zM115 100h9v8h-9z" fill="${R}" stroke-width="2"/><path d="M85 102q4 0 3 4M124 102q4 0 3 4" stroke-width="2"/>
      <path d="M36 66L100 22L164 66Z" fill="${R}"/>
      <path d="M44 62Q52 54 60 60Q70 52 80 58Q92 50 104 56Q116 48 126 56Q138 50 146 58Q154 54 158 62" fill="${B}" stroke-width="2.5"/>
      ${[48, 64, 80, 96, 112, 128, 144].map((x, i) => `<circle cx="${x}" cy="${f(66 + Math.sin(i * 1.3) * 2 + 6)}" r="3" fill="${i % 2 ? O : R}" stroke-width="1.5"/>`).join('')}
      <text x="100" y="95" text-anchor="middle" fill="#6b3b1f" stroke="none" style="font:700 15px 'Dancing Script',cursive">vin chaud</text>
      <path d="M100 8L102.5 14L109 14.5L104 18.5L105.5 25L100 21.5L94.5 25L96 18.5L91 14.5L97.5 14Z" fill="${O}" stroke-width="2"/>
      ${eclat(26, 34, 7)}${eclat(176, 30, 7)}`),

    /* visage avec masque et concombres */
    masque: g(`
      <path d="M64 70C64 44 136 44 136 70V88C136 114 118 130 100 130C82 130 64 114 64 88Z" fill="rgba(150,200,150,.45)"/>
      <path d="M58 70C52 34 148 34 142 70C132 56 68 56 58 70Z" fill="${B}"/>
      <path d="M70 50Q100 36 130 50M84 40Q100 34 116 40" stroke-width="2"/>
      <path d="M118 32C126 22 140 24 138 36C134 40 124 38 118 32Z" fill="${B}"/>
      <circle cx="84" cy="84" r="12" fill="rgba(170,215,140,.8)"/><circle cx="84" cy="84" r="7" stroke-width="1.5"/>
      <circle cx="116" cy="84" r="12" fill="rgba(170,215,140,.8)"/><circle cx="116" cy="84" r="7" stroke-width="1.5"/>
      <path d="M88 108Q100 118 112 108"/>
      <ellipse cx="74" cy="104" rx="6" ry="3.5" fill="rgba(232,120,150,.4)" stroke="none"/><ellipse cx="126" cy="104" rx="6" ry="3.5" fill="rgba(232,120,150,.4)" stroke="none"/>
      ${petitCoeur(166, 60, 8)}${eclat(34, 92, 8)}${eclat(168, 112, 6)}`),

    /* dés et pion */
    des: g(`
      ${de(68, 50, 32, 5, 3, 2)}${de(128, 70, 28, 1, 6, 4)}
      <circle cx="170" cy="56" r="7" fill="${R}"/><path d="M164 62Q170 66 176 62L180 88H160Z" fill="${R}"/>
      <path d="M156 92H184" stroke-width="3"/>
      ${eclat(30, 120, 7)}${eclat(186, 120, 6)}`),

    /* cloche de service : repas mystère */
    cloche: g(`
      <ellipse cx="100" cy="114" rx="76" ry="11" fill="${B}"/>
      <path d="M38 110C38 56 162 56 162 110Z" fill="${A}"/>
      <path d="M52 100C54 82 68 70 84 66" stroke="#fff" stroke-width="4" opacity=".8"/>
      <path d="M96 64V58M104 64V58" stroke-width="2.5"/><ellipse cx="100" cy="54" rx="9" ry="5" fill="${A}"/>
      <text x="112" y="102" text-anchor="middle" fill="#6b3b1f" stroke="none" style="font:700 40px 'Dancing Script',cursive">?</text>
      <path d="M70 40C64 32 74 26 68 16M100 36C94 28 104 22 98 12M130 40C124 32 134 26 128 16" stroke-width="2.2" opacity=".7"/>
      ${eclat(26, 40, 8)}${eclat(178, 44, 7)}`),

    /* pot de popcorn */
    popcorn: g(`
      <path d="M64 62L136 62L126 130L74 130Z" fill="${B}"/>
      ${[0, 1, 2, 3, 4, 5].filter((i) => i % 2 === 0).map((i) => {
        const t0 = i / 6, t1 = (i + 1) / 6;
        return `<path d="M${f(64 + 72 * t0)} 62L${f(64 + 72 * t1)} 62L${f(74 + 52 * t1)} 130L${f(74 + 52 * t0)} 130Z" fill="rgba(198,47,58,.55)" stroke-width="2"/>`;
      }).join('')}
      <path d="M64 62L136 62L126 130L74 130Z"/>
      ${[[70, 56], [84, 48], [98, 52], [112, 46], [126, 54], [134, 60], [78, 38], [94, 36], [108, 32], [122, 40], [100, 24]].map(([x, y]) =>
        `<path d="M${x - 8} ${y + 2}C${x - 12} ${y - 6} ${x - 2} ${y - 11} ${x + 1} ${y - 6}C${x + 6} ${y - 11} ${x + 13} ${y - 3} ${x + 8} ${y + 3}C${x + 9} ${y + 9} ${x - 6} ${y + 10} ${x - 8} ${y + 2}Z" fill="rgba(255,246,215,.95)" stroke-width="2"/>`).join('')}
      <path d="M44 32c-6-6 2-12 6-6c4-6 12 2 6 6c2 6-10 6-12 0Z" fill="rgba(255,246,215,.95)" stroke-width="2" transform="rotate(-15 50 30)"/>
      <path d="M150 28c-6-6 2-12 6-6c4-6 12 2 6 6c2 6-10 6-12 0Z" fill="rgba(255,246,215,.95)" stroke-width="2"/>
      ${eclat(28, 110, 7)}${eclat(176, 108, 8)}`),

    /* crêpe qui saute dans la poêle */
    crepe: g(`
      <ellipse cx="80" cy="112" rx="46" ry="13" fill="rgba(60,40,30,.45)"/>
      <path d="M36 108Q80 132 124 108" stroke-width="3"/>
      <path d="M122 106L182 92" stroke-width="9"/><path d="M122 106L182 92" stroke="rgba(110,58,22,.6)" stroke-width="5"/>
      <g transform="rotate(-14 96 44)">
        <ellipse cx="96" cy="44" rx="40" ry="11" fill="${O}"/>
        <circle cx="80" cy="42" r="3" fill="${C}" stroke="none"/><circle cx="100" cy="47" r="2.5" fill="${C}" stroke="none"/><circle cx="114" cy="41" r="3" fill="${C}" stroke="none"/><circle cx="90" cy="38" r="2" fill="${C}" stroke="none"/>
      </g>
      <path d="M52 86Q48 66 56 52M140 80Q148 64 140 50" stroke-width="2" stroke-dasharray="4 6"/>
      ${petitCoeur(160, 30, 8)}${eclat(30, 40, 7)}`),

    /* bonhomme en pain d'épices */
    bonhomme: g(`
      <path d="M100 14C112 14 120 24 118 36C117 42 114 46 110 48L140 52C150 54 152 66 142 68L120 66L122 92L136 120C140 128 130 134 124 128L100 102L76 128C70 134 60 128 64 120L78 92L80 66L58 68C48 66 50 54 60 52L90 48C86 46 83 42 82 36C80 24 88 14 100 14Z" fill="rgba(176,110,55,.55)"/>
      <path d="M134 56l3 5 3-5 3 5M57 56l3 5 3-5 3 5M66 118l4 3 3-4 4 3M124 121l4-3 3 4 4-3" stroke="#fff" stroke-width="2.4"/>
      <circle cx="94" cy="32" r="2.6" fill="#6b3b1f" stroke="none"/><circle cx="106" cy="32" r="2.6" fill="#6b3b1f" stroke="none"/>
      <path d="M93 40Q100 46 107 40" stroke="#fff" stroke-width="2.4"/>
      <circle cx="100" cy="62" r="4" fill="rgba(198,47,58,.8)"/><circle cx="100" cy="76" r="4" fill="rgba(31,106,71,.7)"/><circle cx="100" cy="90" r="4" fill="rgba(198,47,58,.8)"/>
      <path d="M88 52Q100 58 112 52" stroke="#fff" stroke-width="2.2"/>
      ${eclat(30, 34, 8)}${eclat(170, 30, 7)}${eclat(172, 110, 6)}`),

    /* moment bien-être : galets, bougie, feuille */
    bougie: g(`
      <ellipse cx="112" cy="122" rx="42" ry="11" fill="rgba(140,130,120,.4)"/>
      <ellipse cx="112" cy="104" rx="32" ry="9" fill="rgba(160,150,140,.4)"/>
      <ellipse cx="112" cy="89" rx="22" ry="7" fill="rgba(140,130,120,.45)"/>
      <path d="M40 76H70V128H40Z" fill="${B}"/><ellipse cx="55" cy="76" rx="15" ry="4" fill="${B}"/>
      <path d="M55 72V66" stroke-width="2"/>
      <path d="M55 64C49 56 53 48 55 40C58 48 61 56 55 64Z" fill="${O}" stroke-width="2"/>
      <path d="M112 82C108 68 116 56 132 50C134 66 126 78 112 82Z" fill="${V}"/><path d="M114 80Q122 66 130 54" stroke-width="2"/>
      ${petitCoeur(166, 34, 8)}${eclat(28, 40, 7)}`),

    /* valise de voyage */
    valise: g(`
      <path d="M86 48V38Q86 32 92 32H108Q114 32 114 38V48" stroke-width="4"/>
      <rect x="48" y="48" width="104" height="72" rx="10" fill="rgba(198,47,58,.42)"/>
      <path d="M68 48V120M132 48V120" stroke="rgba(110,58,22,.8)" stroke-width="6"/>
      <circle cx="62" cy="126" r="5" fill="${C}"/><circle cx="138" cy="126" r="5" fill="${C}"/>
      <circle cx="100" cy="74" r="14" fill="${B}" stroke-width="2.5"/>${petitCoeur(100, 74, 6)}
      <rect x="80" y="94" width="40" height="16" rx="3" fill="${O}" stroke-width="2" transform="rotate(-6 100 102)"/>
      <text x="100" y="107" text-anchor="middle" fill="#6b3b1f" stroke="none" transform="rotate(-6 100 102)" style="font:700 13px 'Dancing Script',cursive">France</text>
      <path d="M152 66L166 60" stroke-width="2"/><rect x="162" y="52" width="20" height="14" rx="2" fill="${O}" stroke-width="2" transform="rotate(12 172 59)"/>
      <text x="172" y="64" text-anchor="middle" fill="#6b3b1f" stroke="none" transform="rotate(12 172 59)" style="font:700 13px 'Dancing Script',cursive">?</text>
      <path d="M26 36Q60 6 100 16" stroke-width="2" stroke-dasharray="4 6"/>
      <path d="M104 12L118 16L104 22L106 17Z" fill="${A}" stroke-width="2"/>
      ${eclat(30, 108, 7)}${eclat(178, 112, 6)}`)
  };
})();
