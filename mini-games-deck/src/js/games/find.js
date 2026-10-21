(function () {
  const { h, s, U, ITEMS, itemSVG } = Core;

  const PLACES = {
    mask: [58, 214, -10, 1.0], spray: [286, 120, 20, 1.0], tube: [152, 292, 70, 1.0], pipette: [40, 88, -35, .95],
    cap: [214, 232, 5, 1.05], elixir: [268, 276, -15, .95], comb: [108, 150, 15, .95], towel: [176, 60, 0, 1.0],
    dryer: [92, 288, -20, 1.0], scissors: [242, 170, 40, .9],
  };

  function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  Games.find = function (body) {
    const TIME = 45;
    let found, t, over, last, raf, dead = false, started;
    const ids = Object.keys(PLACES);

    const bar = h('div', { class: 'tbar' }, h('i'));
    const top = h('div', { class: 'g-top' });
    const scene = s('svg', { class: 'scene', viewBox: '0 0 340 330' });
    const list = h('div', { class: 'finds' });
    body.append(top, bar, scene, list, h('div', { class: 'g-note' }, 'Найди все 10 предметов в комнате, пока не кончилось время. Таймер начнётся после первого нажатия.'));

    function clutter(r, n, over) {
      const cols = ['#cfd8e8', '#f2c9a0', '#b9d6c1', '#e3b6cf', '#f4e2a3', '#c7b8e8', '#a6c4d9'];
      let g = '';
      for (let i = 0; i < n; i++) {
        const x = r() * 330 + 5, y = 140 + r() * 180, a = r() * 360, c = cols[Math.floor(r() * cols.length)];
        const kind = Math.floor(r() * 4);
        const sz = 12 + r() * 18;
        if (kind === 0) g += `<rect x="${x}" y="${y}" width="${sz * 1.6}" height="${sz}" rx="3" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`;
        else if (kind === 1) g += `<circle cx="${x}" cy="${y}" r="${sz / 2}" fill="${c}"/>`;
        else if (kind === 2) g += `<path d="M${x} ${y}q${sz} ${-sz} ${sz * 1.5} 0t${sz * 1.5} 0" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" transform="rotate(${a} ${x} ${y})"/>`;
        else g += `<polygon points="${x},${y} ${x + sz},${y + 4} ${x + sz / 2},${y + sz}" fill="${c}"/>`;
      }
      return g;
    }

    function drawScene() {
      const r = rng(7);
      let g = '<rect width="340" height="330" fill="#f8eaf1"/>';
      g += '<rect y="230" width="340" height="100" fill="#e9d3de"/>';
      g += '<rect x="22" y="22" width="86" height="76" rx="6" fill="#cfe6f5" stroke="#b89aaa" stroke-width="4"/><path d="M65 22v76M22 60h86" stroke="#b89aaa" stroke-width="3"/>';
      g += '<rect x="130" y="40" width="190" height="10" fill="#b8896b"/><rect x="150" y="50" width="6" height="10" fill="#8f6a52"/><rect x="290" y="50" width="6" height="10" fill="#8f6a52"/>';
      g += '<rect x="220" y="150" width="110" height="60" rx="8" fill="#d9b8c9"/><rect x="226" y="140" width="60" height="22" rx="8" fill="#fff"/>';
      g += '<ellipse cx="170" cy="280" rx="110" ry="30" fill="#f1c6dc"/>';
      g += '<g pointer-events="none">' + clutter(r, 26, false) + '</g>';
      ids.forEach((id) => {
        const p = PLACES[id];
        g += `<g class="it" data-id="${id}" transform="translate(${p[0]} ${p[1]}) rotate(${p[2]}) scale(${p[3] * .8}) translate(-20 -20)">${ITEMS[id][1]}<rect width="40" height="40" fill="transparent"/></g>`;
      });
      g += '<g pointer-events="none" opacity=".92">' + clutter(rng(21), 7, true) + '</g>';
      scene.innerHTML = g;
    }

    function showTop() {
      top.innerHTML = '';
      top.append(h('span', {}, 'Найдено: ', h('b', {}, found.size + ' / 10')), h('span', {}, 'Время: ', h('b', {}, Math.ceil(t) + ' с')));
      bar.firstChild.style.width = (t / TIME) * 100 + '%';
    }
    function reset() {
      found = new Set(); t = TIME; over = false; started = false; last = performance.now();
      drawScene();
      list.innerHTML = '';
      ids.forEach((id) => { const e = h('div', { html: itemSVG(id, 26) + '<br>' + ITEMS[id][0] }); e.dataset.id = id; list.append(e); });
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      showTop();
    }
    scene.addEventListener('pointerdown', (e) => {
      if (over) return;
      started = true; last = performance.now();
      const g = e.target.closest('.it');
      if (g) {
        const id = g.dataset.id;
        if (found.has(id)) return;
        found.add(id);
        g.insertAdjacentHTML('beforeend', '<circle cx="20" cy="20" r="26" fill="none" stroke="#27500a" stroke-width="3.5"/>');
        scene.appendChild(g);
        list.querySelector(`[data-id="${id}"]`).classList.add('fd');
        showTop();
        if (found.size === 10) { over = true; setTimeout(() => !dead && Core.result(body, { win: true, text: 'Все 10 предметов найдены.', onRetry: reset }), 600); }
      } else {
        scene.classList.remove('shake'); void scene.getBoundingClientRect(); scene.classList.add('shake');
      }
    });
    function loop(now) {
      if (dead) return;
      const dt = (now - last) / 1000; last = now;
      if (started && !over) {
        t -= dt;
        if (t <= 0) { t = 0; over = true; showTop(); Core.result(body, { win: false, title: 'Время вышло', text: 'Найдено предметов: ' + found.size + ' из 10.', onRetry: reset }); }
        else showTop();
      }
      raf = requestAnimationFrame(loop);
    }
    reset();
    raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); };
  };
})();
