(function () {
  const { h, U, PRODUCTS, img } = Core;
  const CATS = ['Очищение', 'Увлажнение', 'Несмываемый'];
  Games.baskets = function (body) {
    const W = 340, HH = 480, LW = W / 3, BASE = HH - 90;
    let jars, labels, spawnT, rotT, caught, wrong, over, last, raf, dead = false, speed;
    const top = h('div', { class: 'g-top' });
    const field = h('div', { class: 'bk', style: { height: HH + 'px' } });
    body.append(top, field, h('div', { class: 'g-note' }, 'Нажми на дорожку — нижняя банка летит в этот бокс. Подписи меняются.'));
    const bsk = [0, 1, 2].map((i) => h('div', { class: 'bsk', style: { left: i * LW + 6 + 'px', width: LW - 12 + 'px', height: '78px', borderRadius: '8px 8px 20px 20px' } }));
    [0, 1, 2].forEach((i) => field.append(h('div', { class: 'lane', style: { left: i * LW + 'px', width: LW + 'px' } })));
    bsk.forEach((b) => field.append(b));
    const rot = h('div', { class: 'rot' }); field.append(rot);
    field.addEventListener('pointerdown', (e) => {
      if (over) return;
      const rc = field.getBoundingClientRect();
      const lane = U.clamp(Math.floor(((e.clientX - rc.left) / rc.width) * 3), 0, 2);
      const cand = jars.filter((j) => j.y < BASE - 20).sort((a, b) => b.y - a.y)[0];
      if (cand) { cand.lane = lane; cand.el.style.left = lane * LW + LW / 2 + 'px'; }
    });
    function setLabels(flip) {
      bsk.forEach((b, i) => {
        b.innerHTML = '<div style="font-size:10px">📦</div>' + CATS[labels[i]];
        if (flip) { b.classList.remove('flip'); void b.offsetWidth; b.classList.add('flip'); }
      });
    }
    function showTop() {
      top.innerHTML = '';
      top.append(h('span', {}, 'В боксах: ', h('b', {}, caught + ' / 15')), h('span', {}, 'Ошибки: ', h('b', {}, wrong + ' / 3')));
    }
    function reset() {
      field.querySelectorAll('.jar').forEach((e) => e.remove());
      jars = []; labels = U.shuffle([0, 1, 2]); spawnT = 0; rotT = 0; caught = 0; wrong = 0; over = false; speed = 68; last = performance.now();
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      setLabels(false); showTop();
    }
    function spawn() {
      const g = U.pick(PRODUCTS);
      const lane = U.ri(0, 2);
      const el = h('div', { class: 'jar', style: { left: lane * LW + LW / 2 + 'px', top: '0px' }, html: img(g.img, 40) + '<div>' + g.name.split(' ')[0] + '</div>' });
      field.append(el);
      jars.push({ g, lane, y: -50, el });
    }
    function loop(now) {
      if (dead) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!over) {
        spawnT -= dt; rotT += dt;
        if (spawnT <= 0) { spawn(); spawnT = 1.85; }
        if (rotT >= 10) { rotT = 0; labels = U.shuffle([0, 1, 2]); setLabels(true); }
        rot.style.width = (1 - rotT / 10) * 100 + '%';
        for (const j of jars) {
          j.y += speed * dt; j.el.style.top = j.y + 'px';
          if (j.y >= BASE) {
            j.done = true; j.el.remove();
            if (labels[j.lane] === CATS.indexOf(j.g.cat)) caught++; else wrong++;
            showTop();
            if (caught >= 15) { over = true; Core.result(body, { win: true, text: 'Пятнадцать наших банок разложены по боксам.', onRetry: reset }); }
            else if (wrong >= 3) { over = true; Core.result(body, { win: false, title: 'Три ошибки', text: 'Банка попала не в тот бокс.', onRetry: reset }); }
          }
        }
        jars = jars.filter((j) => !j.done);
        speed = Math.min(120, speed + dt);
      }
      raf = requestAnimationFrame(loop);
    }
    reset(); raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); };
  };
})();
