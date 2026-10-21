(function () {
  const { h, U, productSVG } = Core;
  const CATS = ['Очищение', 'Увлажнение', 'Несмываемый'];
  const GOODS = [
    { n: 'Multiuse Shampoo', c: 0, k: 'bottle', col: '#5aa02c' },
    { n: 'WASH IT', c: 0, k: 'bottle', col: '#3b82c4' },
    { n: 'Hyaluronic mask', c: 1, k: 'jar', col: '#8b5fbf' },
    { n: 'Hydro Treatment', c: 1, k: 'jar', col: '#3b82c4' },
    { n: 'Instant Transformation', c: 1, k: 'jar', col: '#d4005f' },
    { n: 'Recharging Elixir', c: 2, k: 'dropper', col: '#e8a33d' },
    { n: 'Glance spray', c: 2, k: 'spray', col: '#d4005f' },
    { n: 'Mango Cream', c: 2, k: 'tube', col: '#e8a33d' },
  ];

  Games.baskets = function (body) {
    const W = 340, HH = 440, LW = W / 3, BASE = HH - 78;
    let jars, labels, spawnT, rotT, caught, wrong, over, last, raf, dead = false, speed;

    const top = h('div', { class: 'g-top' });
    const field = h('div', { class: 'bk' });
    body.append(top, field, h('div', { class: 'g-note' }, 'Баночки падают сверху. Нажми на дорожку, и самая нижняя баночка перелетит туда. Подписи на корзинах меняются местами, смотри внимательно.'));
    const bsk = [0, 1, 2].map((i) => h('div', { class: 'bsk', style: { left: i * LW + 8 + 'px', width: LW - 16 + 'px' } }));
    [0, 1, 2].forEach((i) => field.append(h('div', { class: 'lane', style: { left: i * LW + 'px', width: LW + 'px' } })));
    bsk.forEach((b) => field.append(b));
    const rot = h('div', { class: 'rot' });
    field.append(rot);
    field.addEventListener('pointerdown', (e) => {
      if (over) return;
      const rc = field.getBoundingClientRect();
      const lane = U.clamp(Math.floor(((e.clientX - rc.left) / rc.width) * 3), 0, 2);
      const cand = jars.filter((j) => j.y < BASE - 30).sort((a, b) => b.y - a.y)[0];
      if (cand) { cand.lane = lane; cand.el.style.left = lane * LW + LW / 2 + 'px'; }
    });

    function setLabels(flip) {
      bsk.forEach((b, i) => { b.textContent = CATS[labels[i]]; if (flip) { b.classList.remove('flip'); void b.offsetWidth; b.classList.add('flip'); } });
    }
    function showTop() {
      top.innerHTML = '';
      top.append(h('span', {}, 'В корзинах: ', h('b', {}, caught + ' / 15')), h('span', {}, 'Ошибки: ', h('b', {}, wrong + ' / 3')));
    }
    function reset() {
      field.querySelectorAll('.jar').forEach((e) => e.remove());
      jars = []; labels = U.shuffle([0, 1, 2]); spawnT = 0; rotT = 0; caught = 0; wrong = 0; over = false; speed = 70; last = performance.now();
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      setLabels(false); showTop();
    }
    function spawn() {
      const g = U.pick(GOODS);
      const lane = U.ri(0, 2);
      const el = h('div', { class: 'jar', style: { left: lane * LW + LW / 2 + 'px', top: '0px' }, html: productSVG(g.k, g.col, 38) + '<div>' + g.n + '</div>' });
      field.append(el);
      jars.push({ g, lane, y: -50, el });
    }
    function loop(now) {
      if (dead) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!over) {
        spawnT -= dt; rotT += dt;
        if (spawnT <= 0) { spawn(); spawnT = 1.9; }
        if (rotT >= 10) { rotT = 0; labels = U.shuffle([0, 1, 2]); setLabels(true); }
        rot.style.width = (1 - rotT / 10) * 100 + '%';
        for (const j of jars) {
          j.y += speed * dt; j.el.style.top = j.y + 'px';
          if (j.y >= BASE) {
            j.done = true; j.el.remove();
            if (labels[j.lane] === j.g.c) caught++; else wrong++;
            showTop();
            if (caught >= 15) { over = true; Core.result(body, { win: true, text: 'Пятнадцать баночек разложены по своим корзинам.', onRetry: reset }); }
            else if (wrong >= 3) { over = true; Core.result(body, { win: false, title: 'Три ошибки', text: 'Три баночки попали не в ту корзину.', onRetry: reset }); }
          }
        }
        jars = jars.filter((j) => !j.done);
        speed = Math.min(130, speed + dt * 1.2);
      }
      raf = requestAnimationFrame(loop);
    }
    reset();
    raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); };
  };
})();
