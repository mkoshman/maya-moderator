(function () {
  const { h, s, PRODUCTS, U } = Core;

  function hunt(body, spec) {
    const TIME = spec.time || 0;
    let found, t, over, last, raf, dead = false, started;
    function draw() {
      body.innerHTML = '';
      body.style.padding = '6px';
      const top = h('div', { class: 'g-top' }, h('b', {}, spec.title), h('span', {}, '0 / ' + spec.items.length));
      const scene = h('div', { class: 'play-scene' });
      scene.append(h('div', { class: 'play-bg', html: spec.bg }));
      const spots = spec.items.map((it) => {
        const el = h('button', {
          class: 'spot' + (spec.disc ? ' disc' : ''),
          style: { left: it.x + '%', top: it.y + '%', width: (it.w || 18) + '%' },
          html: it.html || Core.img(it.id, it.size || 54),
          onclick: (e) => {
            e.stopPropagation();
            started = true;
            if (found.has(it.id) || over) return;
            found.add(it.id);
            el.classList.add('got');
            top.lastChild.textContent = found.size + ' / ' + spec.items.length;
            if (found.size === spec.items.length) {
              over = true;
              setTimeout(() => !dead && Core.result(body, { win: true, text: spec.win, onRetry: () => { found = new Set(); draw(); } }), 300);
            }
          },
        });
        scene.append(el);
        return el;
      });
      body.append(top, scene);
      if (spec.note) body.append(h('div', { class: 'g-note' }, spec.note));
      found = new Set();
      t = TIME; over = false; started = false; last = performance.now();
      if (TIME) {
        const bar = h('div', { class: 'tbar' }, h('i'));
        body.insertBefore(bar, scene);
        body._bar = bar; body._top = top;
      }
    }
    function loop(now) {
      if (dead) return;
      if (TIME && body._bar && started && !over) {
        const dt = (now - last) / 1000;
        t -= dt;
        body._bar.firstChild.style.width = Math.max(0, t / TIME) * 100 + '%';
        if (t <= 0) {
          t = 0; over = true;
          Core.result(body, { win: false, title: 'Время вышло', text: 'Найдено ' + found.size + ' из ' + spec.items.length + '.', onRetry: draw });
        }
      }
      last = now;
      raf = requestAnimationFrame(loop);
    }
    draw();
    if (TIME) { raf = requestAnimationFrame(loop); return () => { dead = true; cancelAnimationFrame(raf); }; }
    return () => { dead = true; };
  }

  const ISLAND = `<svg viewBox="0 0 340 520" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <rect width="340" height="520" fill="#f4efe8"/>
    <rect y="300" width="340" height="220" fill="#e7d3c4"/>
    <rect x="18" y="36" width="86" height="250" rx="8" fill="#2b2b2b"/>
    <rect x="28" y="52" width="66" height="8" fill="#3a3a3a"/>
    <rect x="28" y="110" width="66" height="8" fill="#3a3a3a"/>
    <rect x="28" y="168" width="66" height="8" fill="#3a3a3a"/>
    <rect x="28" y="226" width="66" height="8" fill="#3a3a3a"/>
    <rect x="236" y="40" width="86" height="210" rx="8" fill="#1c1c1c"/>
    <rect x="248" y="58" width="62" height="150" rx="4" fill="#d9dde2"/>
    <ellipse cx="170" cy="360" rx="120" ry="36" fill="#fff"/>
    <rect x="70" y="300" width="200" height="70" rx="16" fill="#fff" stroke="#eadfe6"/>
    <rect x="150" y="250" width="40" height="60" fill="#af004e"/>
    <circle cx="170" cy="246" r="16" fill="#ffd9ea"/>
    <rect x="40" y="430" width="70" height="46" rx="8" fill="#c9849a"/>
    <rect x="230" y="440" width="78" height="40" rx="10" fill="#d7c2ae"/>
    <circle cx="58" cy="400" r="22" fill="#7d9a62"/>
    <rect x="54" y="400" width="8" height="36" fill="#6b4226"/>
  </svg>`;

  Games.find = function (body) {
    const items = [
      { id: 'lmb05', x: 8, y: 8, w: 22 },
      { id: 'lmb56', x: 8, y: 18, w: 22 },
      { id: 'lmb42', x: 70, y: 10, w: 20 },
      { id: 'lmb43', x: 74, y: 24, w: 18 },
      { id: 'tsh97', x: 38, y: 46, w: 18 },
      { id: 'lmb87', x: 55, y: 48, w: 16 },
      { id: 'tsh14', x: 6, y: 62, w: 18 },
      { id: 'lmb71', x: 72, y: 70, w: 18 },
      { id: 'lmb57', x: 40, y: 78, w: 18 },
      { id: 'tsh95', x: 18, y: 34, w: 16 },
    ];
    return hunt(body, {
      title: 'Остров Flario',
      time: 45,
      bg: ISLAND,
      items,
      note: 'Остров в торговом зале: полки, стойка, зеркало. Нажимай на банки.',
      win: 'Все десять банок на острове найдены.',
    });
  };

  const SCHOOL = `<svg viewBox="0 0 340 520" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <rect width="340" height="520" fill="#ece7e2"/>
    <rect width="340" height="250" fill="#d9d3cc"/>
    <rect x="120" y="70" width="100" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="132" y="86" width="76" height="110" fill="#8ea0ad"/>
    <rect x="16" y="40" width="78" height="200" fill="#111"/>
    <rect x="248" y="48" width="74" height="180" fill="#111"/>
    <rect x="0" y="250" width="340" height="40" fill="#b9b3ac"/>
    <rect x="40" y="290" width="260" height="18" fill="#8d8882"/>
    <rect x="70" y="308" width="200" height="18" fill="#8d8882"/>
    <rect x="100" y="326" width="140" height="18" fill="#8d8882"/>
    <rect x="20" y="390" width="120" height="50" rx="8" fill="#2a2a2a"/>
    <rect x="200" y="400" width="110" height="70" rx="14" fill="#6d625c"/>
    <rect x="214" y="414" width="82" height="28" rx="6" fill="#8a7d76"/>
  </svg>`;

  Games.school = function (body) {
    const gifts = [
      { id: 'g1', x: 4, y: 8, w: 16, html: gift('#d4005f') },
      { id: 'g2', x: 22, y: 16, w: 14, html: gift('#e8a33d') },
      { id: 'g3', x: 74, y: 10, w: 16, html: gift('#3b82c4') },
      { id: 'g4', x: 78, y: 28, w: 14, html: gift('#5aa02c') },
      { id: 'g5', x: 36, y: 42, w: 14, html: gift('#af004e') },
      { id: 'g6', x: 8, y: 58, w: 16, html: gift('#d4005f') },
      { id: 'g7', x: 48, y: 62, w: 14, html: gift('#e8a33d') },
      { id: 'g8', x: 70, y: 66, w: 16, html: gift('#3b82c4') },
      { id: 'lmb05', x: 18, y: 74, w: 16 },
      { id: 'lmb56', x: 55, y: 78, w: 16 },
    ];
    return hunt(body, {
      title: 'Школа Flario',
      bg: SCHOOL,
      items: gifts,
      note: 'Зал школы: чёрные полки, дверь, ступени, диван. Подарки лежат в пространстве.',
      win: 'Все подарки в школе найдены.',
    });
  };

  function gift(c) {
    return `<svg viewBox="0 0 64 64" width="54" height="54"><rect x="8" y="24" width="48" height="32" rx="4" fill="${c}"/><rect x="28" y="24" width="8" height="32" fill="#fff"/><rect x="8" y="34" width="48" height="6" fill="#fff"/><path d="M32 24c-8-14-20-6-12 2 6 4 12-2 12-2s6 6 12 2c8-8-4-16-12-2z" fill="#fff"/></svg>`;
  }

  const TREE = `<svg viewBox="0 0 340 520" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <rect width="340" height="520" fill="#102033"/>
    <circle cx="40" cy="40" r="2" fill="#fff"/><circle cx="120" cy="24" r="1.5" fill="#fff"/><circle cx="250" cy="36" r="2" fill="#fff"/><circle cx="300" cy="70" r="1.4" fill="#fff"/>
    <path d="M170 36 L70 180 H110 L40 300 H100 L20 430 H320 L240 300 H300 L230 180 H270 Z" fill="#1c6b3a"/>
    <path d="M170 90 L110 190 H150 L90 290 H140 L70 400 H270 L200 290 H250 L190 190 H230 Z" fill="#22824a"/>
    <rect x="152" y="430" width="36" height="48" rx="4" fill="#6b3a1f"/>
    <rect y="478" width="340" height="42" fill="#0c1826"/>
  </svg>`;

  Games.tree = function (body) {
    const spots = [
      [18, 22], [42, 16], [62, 24], [30, 34], [52, 32],
      [16, 46], [38, 48], [60, 44], [28, 60], [50, 58],
    ];
    const items = PRODUCTS.slice(0, 10).map((p, i) => ({ id: p.img + i, n: p.name, x: spots[i][0], y: spots[i][1], w: 16, html: Core.img(p.img, 48) }));
    return hunt(body, {
      title: 'Ёлка',
      bg: TREE,
      disc: true,
      items,
      note: 'Банки сидят в ветках. Нажимай на ту, которую узнала.',
      win: 'Все банки на ёлке найдены.',
    });
  };

  const RITUAL = [
    { id: 'lmb05', name: 'Multiuse Shampoo' },
    { id: 'lmb57', name: 'Refreshing Exfoliation' },
    { id: 'towel', name: 'Полотенце', svg: true },
    { id: 'lmb56', name: 'Instant Transformation' },
    { id: 'lmb42', name: 'Protein Thermal Spray' },
    { id: 'dryer', name: 'Фен', svg: true },
    { id: 'lmb43', name: 'Recharging Elixir' },
    { id: 'lmb87', name: 'Glance spray' },
    { id: 'tsh97', name: 'Tashe Rosemary Mask' },
    { id: 'lmb44', name: 'Total Revitalizer' },
    { id: 'lmb101', name: 'Dry Shampoo' },
    { id: 'tsh14', name: 'Tashe 1000 мл' },
  ];
  function toolArt(id) {
    if (id === 'towel') return `<svg viewBox="0 0 64 80" width="64" height="80"><rect x="10" y="8" width="44" height="64" rx="6" fill="#fff" stroke="#af004e" stroke-width="3"/><path d="M10 22h44M10 40h44M10 56h44" stroke="#ffd9ea" stroke-width="6"/></svg>`;
    if (id === 'dryer') return `<svg viewBox="0 0 64 80" width="64" height="80"><rect x="6" y="18" width="36" height="22" rx="10" fill="#444"/><rect x="40" y="24" width="14" height="10" rx="3" fill="#888"/><rect x="18" y="38" width="12" height="28" rx="4" fill="#444"/></svg>`;
    return Core.img(id, 72);
  }

  Games.clock = function (body) {
    let i = 0;
    function draw() {
      body.innerHTML = '';
      const hour = i + 1;
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Удар ' + hour + ' из 12'), h('span', {}, RITUAL[i].name)));
      const face = h('div', { class: 'clock' });
      const ang = ((hour % 12) / 12) * 360 - 90;
      face.innerHTML = `<svg viewBox="0 0 120 120" width="148" height="148">
        <circle cx="60" cy="60" r="56" fill="#fff" stroke="#af004e" stroke-width="4"/>
        ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => {
          const r = (a - 90) * Math.PI / 180;
          return `<circle cx="${60 + Math.cos(r) * 44}" cy="${60 + Math.sin(r) * 44}" r="3" fill="#af004e"/>`;
        }).join('')}
        <line x1="60" y1="60" x2="${60 + Math.cos(ang * Math.PI / 180) * 36}" y2="${60 + Math.sin(ang * Math.PI / 180) * 36}" stroke="#1a1118" stroke-width="4" stroke-linecap="round"/>
        <circle cx="60" cy="60" r="4" fill="#af004e"/>
      </svg>`;
      const right = RITUAL[i];
      const pool = U.shuffle(RITUAL.filter((x) => x.id !== right.id)).slice(0, 2);
      const opts = U.shuffle([right, ...pool]);
      const row = h('div', { class: 'choice3' });
      opts.forEach((o) => row.append(h('button', { onclick: () => {
        if (o.id === right.id) {
          i++;
          if (i >= 12) Core.result(body, { win: true, text: 'Двенадцать шагов ухода нашими продуктами закрыты.', onRetry: () => { i = 0; draw(); } });
          else draw();
        } else Core.result(body, { win: false, title: 'Не тот шаг', text: 'На этом ударе нужен ' + right.name + '.', onRetry: () => { i = 0; draw(); } });
      } }, h('div', { html: toolArt(o.id) }), h('b', {}, o.name))));
      body.append(face, h('div', { class: 'g-note' }, 'Часы бьют. Из трёх карточек выбери продукт этого шага.'), row);
    }
    draw();
    return () => {};
  };

  Games.garland = function (body) {
    let n = 11;
    const colors = ['#d4005f', '#e8a33d', '#3b82c4', '#5aa02c'];
    function draw() {
      body.innerHTML = '';
      body.style.padding = '0';
      body.style.justifyContent = 'flex-start';
      const wrap = h('div', { class: 'home-layer' });
      wrap.append(h('img', { src: ASSETS.home_ui || ASSETS.home, alt: '' }));
      const wire = h('div', { class: 'garland' });
      for (let i = 0; i < 31; i++) {
        wire.append(h('i', { class: i < n ? 'on' : '', style: { background: i < n ? colors[i % 4] : '#d9ccd3', animationDelay: (i * .05) + 's' } }));
      }
      wrap.append(wire);
      body.append(wrap);
      const bar = h('div', { class: 'garland-bar' });
      bar.append(h('b', {}, n + ' / 31'));
      bar.append(h('button', { class: 'btn pri sm', onclick: () => { n = Math.min(31, n + 1); draw(); } }, 'Сегодня зашла'));
      body.append(bar);
    }
    draw();
    return () => {};
  };
})();
