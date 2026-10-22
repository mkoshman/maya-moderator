(function () {
  const { h, PRODUCTS } = Core;
  const ITEMS = [
    { id: 'lmb05', n: 'Шампунь', x: 18, y: 42, w: 10, h: 22 },
    { id: 'lmb56', n: 'Маска', x: 42, y: 48, w: 9, h: 14 },
    { id: 'lmb42', n: 'Спрей', x: 62, y: 38, w: 8, h: 20 },
    { id: 'lmb43', n: 'Эликсир', x: 78, y: 55, w: 7, h: 16 },
    { id: 'tsh97', n: 'Tashe маска', x: 28, y: 62, w: 10, h: 14 },
    { id: 'lmb87', n: 'Glance', x: 70, y: 22, w: 8, h: 16 },
    { id: 'tsh14', n: 'Литровая', x: 8, y: 58, w: 8, h: 24 },
    { id: 'lmb71', n: 'Крем', x: 50, y: 70, w: 9, h: 14 },
    { id: 'lmb57', n: 'Пилинг', x: 86, y: 40, w: 8, h: 16 },
    { id: 'tsh95', n: '500 мл', x: 36, y: 28, w: 8, h: 18 },
  ];
  Games.find = function (body) {
    const TIME = 45;
    let found, t, over, last, raf, dead = false, started;
    const bar = h('div', { class: 'tbar' }, h('i'));
    const top = h('div', { class: 'g-top' });
    const scene = h('div', { style: { position: 'relative', width: '340px', height: '300px', borderRadius: '14px', overflow: 'hidden', flex: 'none', background: '#222' } });
    const list = h('div', { class: 'finds' });
    body.append(top, bar, scene, list, h('div', { class: 'g-note' }, 'Остров Flario Laboratory в ТЦ. Найди 10 банок на полках и на острове.'));
    function showTop() {
      top.innerHTML = '';
      top.append(h('span', {}, 'Найдено: ', h('b', {}, found.size + ' / 10')), h('span', {}, Math.ceil(t) + ' с'));
      bar.firstChild.style.width = (t / TIME) * 100 + '%';
    }
    function reset() {
      found = new Set(); t = TIME; over = false; started = false; last = performance.now();
      scene.innerHTML = '';
      scene.append(h('img', { src: ASSETS.island, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } }));
      ITEMS.forEach((it) => {
        const hot = h('div', { class: 'hot', style: { left: it.x + '%', top: it.y + '%', width: it.w + '%', height: it.h + '%' }, onclick: (e) => {
          e.stopPropagation();
          started = true;
          if (found.has(it.id) || over) return;
          found.add(it.id); hot.classList.add('fd');
          list.querySelector('[data-id="' + it.id + '"]').classList.add('fd');
          showTop();
          if (found.size === 10) { over = true; setTimeout(() => !dead && Core.result(body, { win: true, text: 'Все банки на острове найдены.', onRetry: reset }), 400); }
        } });
        scene.append(hot);
      });
      list.innerHTML = '';
      ITEMS.forEach((it) => list.append(h('div', { 'data-id': it.id, html: Core.img(it.id, 22) + '<br>' + it.n })));
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      showTop();
    }
    scene.addEventListener('pointerdown', () => { started = true; last = performance.now(); });
    function loop(now) {
      if (dead) return;
      const dt = (now - last) / 1000; last = now;
      if (started && !over) {
        t -= dt;
        if (t <= 0) { t = 0; over = true; showTop(); Core.result(body, { win: false, title: 'Время вышло', text: 'Найдено ' + found.size + ' из 10.', onRetry: reset }); }
        else showTop();
      }
      raf = requestAnimationFrame(loop);
    }
    reset(); raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); };
  };

  Games.school = function (body) {
    const spots = [
      [12, 20, 'Коробка у полки'], [30, 55, 'На стойке'], [48, 40, 'У двери'], [70, 30, 'На вешалке'],
      [82, 60, 'На диване'], [18, 70, 'Нижний ряд'], [55, 72, 'На ступеньке'], [40, 18, 'Верх полки'],
      [88, 22, 'У зеркала'], [8, 42, 'За флаконами'],
    ];
    let found = new Set();
    function draw() {
      body.innerHTML = '';
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Подарки в школе Flario'), h('span', {}, found.size + ' / 10')));
      const sc = h('div', { style: { position: 'relative', width: '340px', height: '320px', borderRadius: '14px', overflow: 'hidden', flex: 'none' } });
      sc.append(h('img', { src: ASSETS.school, style: { width: '100%', height: '100%', objectFit: 'cover' } }));
      spots.forEach((s, i) => {
        const el = h('div', { class: 'hot' + (found.has(i) ? ' fd' : ''), style: { left: s[0] + '%', top: s[1] + '%', width: '12%', height: '12%' }, onclick: () => { found.add(i); if (found.size === 10) Core.result(body, { win: true, text: 'Все подарки в школе найдены.', onRetry: () => { found = new Set(); draw(); } }); else draw(); } });
        sc.append(el);
      });
      body.append(sc, h('div', { class: 'g-note' }, 'Школа Flario: чёрные полки, вход, диван. Десять подарков спрятаны в интерьере.'));
    }
    draw();
    return () => {};
  };

  Games.tree = function (body) {
    const hide = PRODUCTS.slice(0, 10);
    let found = new Set();
    function draw() {
      body.innerHTML = '';
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Найди на ёлке'), h('span', {}, found.size + ' / 10')));
      const sc = s('svg', { class: 'scene', viewBox: '0 0 340 300' });
      let g = '<rect width="340" height="300" fill="#14283d"/>';
      g += '<path d="M170 20l-80 90h40l-55 70h50l-45 80h180l-45-80h50l-55-70h40z" fill="#1f6b3a"/>';
      g += '<rect x="160" y="260" width="20" height="30" fill="#6b4226"/>';
      hide.forEach((p, i) => {
        const x = 70 + (i % 5) * 48 + (i > 4 ? 10 : 0);
        const y = 70 + Math.floor(i / 5) * 80 + (i % 3) * 8;
        g += `<g class="it" data-i="${i}" transform="translate(${x} ${y})"><rect width="40" height="52" fill="transparent"/></g>`;
      });
      sc.innerHTML = g;
      hide.forEach((p, i) => {
        const im = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        im.setAttribute('href', ASSETS[p.img]);
        im.setAttribute('x', 70 + (i % 5) * 48);
        im.setAttribute('y', 70 + Math.floor(i / 5) * 80);
        im.setAttribute('width', found.has(i) ? 36 : 22);
        im.setAttribute('height', found.has(i) ? 48 : 32);
        im.style.opacity = found.has(i) ? 1 : .55;
        im.style.cursor = 'pointer';
        im.onclick = () => { found.add(i); if (found.size === 10) Core.result(body, { win: true, text: 'Все банки на ёлке найдены.', onRetry: () => { found = new Set(); draw(); } }); else draw(); };
        sc.appendChild(im);
      });
      body.append(sc, h('div', { class: 'g-note' }, 'Банки Limba и Tashe спрятаны в ветках. Нажимай, когда узнала.'));
    }
    const { s } = Core;
    draw();
    return () => {};
  };

  Games.clock = function (body) {
    const STEPS = [
      'Multiuse Shampoo', 'Смыть', 'Refreshing Exfoliation', 'Смыть', 'Полотенце',
      'Hyaluronic / Hydro mask', 'Время маски', 'Смыть маску', 'Полотенце',
      'Thermal Spray или Mango Cream', 'Фен', 'Recharging Elixir',
    ];
    let i = 0;
    function draw() {
      body.innerHTML = '';
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Удар ' + (i + 1) + ' из 12'), h('span', {}, STEPS[i])));
      const opts = Core.U.shuffle([STEPS[i], Core.U.pick(STEPS.filter((x) => x !== STEPS[i])), Core.U.pick(PRODUCTS).name]);
      const list = h('div', { class: 'stp' });
      opts.forEach((o) => list.append(h('button', { onclick: () => {
        if (o === STEPS[i]) { i++; if (i >= 12) Core.result(body, { win: true, text: '12 обязательных шагов ухода до конца года закрыты нашими продуктами.', onRetry: () => { i = 0; draw(); } }); else draw(); }
        else { list.classList.add('shake'); Core.result(body, { win: false, title: 'Не тот шаг года', text: 'Нужен: ' + STEPS[i], onRetry: () => { i = 0; draw(); } }); }
      } }, o)));
      body.append(h('div', { class: 'g-note' }, 'Механика: каждый удар часов — один шаг ритуала. Из трёх вариантов нажимаешь нужный продукт или действие. Ошибка сбрасывает год.'), list);
    }
    draw();
    return () => {};
  };

  Games.garland = function (body) {
    let n = 11;
    function draw() {
      body.innerHTML = '';
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Гирлянда декабря'), h('span', {}, n + ' / 31 вход')));
      const row = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', width: '100%', padding: '10px' } });
      for (let i = 0; i < 31; i++) row.append(h('div', { style: { width: '18px', height: '18px', borderRadius: '50%', background: i < n ? ['#d4005f', '#e8a33d', '#3b82c4', '#5aa02c'][i % 4] : '#d9ccd3' } }));
      body.append(row);
      body.append(h('button', { class: 'btn pri', onclick: () => { n = Math.min(31, n + 1); draw(); } }, 'Сегодня зашла в приложение'));
      body.append(h('div', { class: 'g-note' }, 'Лампочка за каждый день, когда был вход. Пропуск не штрафуем — просто не горит.'));
    }
    draw();
    return () => {};
  };
})();
