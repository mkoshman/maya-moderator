(function () {
  const { h, s, U } = Core;

  Games.words = function (body) {
    let mode = 'wheel';
    let dead = false;

    const ROUNDS = [
      { w: 'СЕРИН', hint: 'Аминокислота из состава Multiuse Shampoo' },
      { w: 'ПРОЛИН', hint: 'Ещё одна аминокислота из состава шампуня' },
      { w: 'ЛИЗИН', hint: 'И ещё одна, из того же списка' },
    ];
    const FW = ['ШАМПУНЬ', 'СЕРИН', 'ЛИЗИН', 'ПРОЛИН', 'АЛАНИН', 'ГЛИЦИН'];

    function wheel() {
      let round = 0, picked = [], dragging = false, nodes = [];
      body.innerHTML = '';
      body.append(tabs());
      const info = h('div', { class: 'g-top' });
      const slots = h('div', { class: 'slots' });
      const wh = h('div', { class: 'wheel' });
      const line = s('svg', { width: 250, height: 250 });
      const poly = s('polyline', { points: '', fill: 'none', stroke: '#d4005f', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .5 });
      line.append(poly);
      body.append(info, slots, wh);
      body.append(h('div', { class: 'g-note' }, 'Проведи пальцем по буквам по кругу, чтобы собрать слово. Не отпускай, пока не соберёшь до конца.'));

      function setup() {
        const r = ROUNDS[round];
        info.innerHTML = '';
        info.append(h('span', {}, r.hint), h('b', {}, (round + 1) + ' / ' + ROUNDS.length));
        slots.innerHTML = '';
        r.w.split('').forEach(() => slots.append(h('i')));
        wh.innerHTML = ''; wh.append(line);
        picked = []; poly.setAttribute('points', '');
        let letters = r.w.split('');
        let sh;
        do { sh = U.shuffle(letters); } while (sh.join('') === r.w);
        nodes = sh.map((ch, i) => {
          const a = (i / sh.length) * Math.PI * 2 - Math.PI / 2;
          const n = h('div', { class: 'lt', style: { left: 125 + Math.cos(a) * 88 + 'px', top: 125 + Math.sin(a) * 88 + 'px' } }, ch);
          n.dataset.i = i; n.dataset.ch = ch;
          wh.append(n);
          return n;
        });
      }
      function center(n) { return [parseFloat(n.style.left), parseFloat(n.style.top)]; }
      function draw() {
        poly.setAttribute('points', picked.map((n) => center(n).join(',')).join(' '));
        [...slots.children].forEach((c, i) => { c.textContent = picked[i] ? picked[i].dataset.ch : ''; });
        nodes.forEach((n) => n.classList.toggle('on', picked.includes(n)));
      }
      function hit(e) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        return el && el.classList.contains('lt') && wh.contains(el) ? el : null;
      }
      wh.addEventListener('pointerdown', (e) => {
        const n = hit(e);
        if (!n) return;
        dragging = true; picked = [n]; draw();
        wh.setPointerCapture(e.pointerId);
      });
      wh.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const n = hit(e);
        if (n && !picked.includes(n)) { picked.push(n); draw(); }
      });
      const end = () => {
        if (!dragging) return;
        dragging = false;
        const word = picked.map((n) => n.dataset.ch).join('');
        if (word === ROUNDS[round].w) {
          [...slots.children].forEach((c) => c.classList.add('f'));
          setTimeout(() => {
            if (dead) return;
            round++;
            if (round >= ROUNDS.length) Core.result(body, { win: true, text: 'Все три слова из состава собраны.', retryLabel: 'Теперь филворд', onRetry: () => { mode = 'fw'; filword(); } });
            else setup();
          }, 600);
        } else {
          wh.classList.add('shake');
          setTimeout(() => { wh.classList.remove('shake'); picked = []; draw(); }, 260);
        }
      };
      wh.addEventListener('pointerup', end);
      wh.addEventListener('pointercancel', end);
      setup();
    }

    function filword() {
      const N = 8;
      let grid = null;
      const dirs = [[1, 0], [0, 1], [1, 1]];
      function build() {
        for (let attempt = 0; attempt < 200; attempt++) {
          const g = Array.from({ length: N }, () => Array(N).fill(''));
          let ok = true;
          for (const w of U.shuffle(FW).sort((a, b) => b.length - a.length)) {
            let placed = false;
            for (let t = 0; t < 120 && !placed; t++) {
              const d = U.pick(dirs);
              const rev = Math.random() < .3;
              const word = rev ? w.split('').reverse().join('') : w;
              const x = U.ri(0, N - 1), y = U.ri(0, N - 1);
              const ex = x + d[0] * (word.length - 1), ey = y + d[1] * (word.length - 1);
              if (ex >= N || ey >= N) continue;
              let fit = true;
              for (let i = 0; i < word.length; i++) {
                const c = g[y + d[1] * i][x + d[0] * i];
                if (c && c !== word[i]) { fit = false; break; }
              }
              if (!fit) continue;
              for (let i = 0; i < word.length; i++) g[y + d[1] * i][x + d[0] * i] = word[i];
              placed = true;
            }
            if (!placed) { ok = false; break; }
          }
          if (ok) {
            const abc = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ';
            for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!g[y][x]) g[y][x] = U.pick(abc.split(''));
            return g;
          }
        }
        return null;
      }
      grid = build();
      const found = new Set();
      const foundCells = new Set();
      body.innerHTML = '';
      body.append(tabs());
      body.append(h('div', { class: 'g-top' }, h('span', {}, 'Слова из состава шампуня Multiuse'), h('b', {}, '0 / ' + FW.length)));
      const fw = h('div', { class: 'fw' });
      const cells = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const c = h('div', {}, grid[y][x]);
        c.dataset.x = x; c.dataset.y = y;
        cells.push(c); fw.append(c);
      }
      const wl = h('div', { class: 'wl' });
      FW.forEach((w) => { const e = h('span', {}, w); e.dataset.w = w; wl.append(e); });
      body.append(fw, wl, h('div', { class: 'g-note' }, 'Веди пальцем по прямой линии: вправо, вниз или по диагонали. Слова могут идти и задом наперёд.'));

      let start = null, cur = [];
      const at = (x, y) => cells[y * N + x];
      function cellFrom(e) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        return el && fw.contains(el) && el !== fw ? el : null;
      }
      function line(a, b) {
        const dx = b.x - a.x, dy = b.y - a.y;
        if (dx && dy && Math.abs(dx) !== Math.abs(dy)) return [a];
        const n = Math.max(Math.abs(dx), Math.abs(dy));
        const sx = Math.sign(dx), sy = Math.sign(dy);
        return Array.from({ length: n + 1 }, (_, i) => ({ x: a.x + sx * i, y: a.y + sy * i }));
      }
      function paint() {
        cells.forEach((c) => c.classList.remove('sel'));
        cur.forEach((p) => at(p.x, p.y).classList.add('sel'));
      }
      fw.addEventListener('pointerdown', (e) => {
        const c = cellFrom(e); if (!c) return;
        start = { x: +c.dataset.x, y: +c.dataset.y }; cur = [start]; paint();
        fw.setPointerCapture(e.pointerId);
      });
      fw.addEventListener('pointermove', (e) => {
        if (!start) return;
        const c = cellFrom(e); if (!c) return;
        cur = line(start, { x: +c.dataset.x, y: +c.dataset.y }); paint();
      });
      const up = () => {
        if (!start) return;
        const str = cur.map((p) => grid[p.y][p.x]).join('');
        const rev = str.split('').reverse().join('');
        const w = FW.find((x) => !found.has(x) && (x === str || x === rev));
        if (w) {
          found.add(w);
          cur.forEach((p) => foundCells.add(p.y * N + p.x));
          cells.forEach((c, i) => c.classList.toggle('fd', foundCells.has(i)));
          wl.querySelector(`[data-w="${w}"]`).classList.add('fd');
          body.querySelector('.g-top b').textContent = found.size + ' / ' + FW.length;
          if (found.size === FW.length) setTimeout(() => !dead && Core.result(body, { win: true, text: 'Все слова найдены.', retryLabel: 'Сыграть в круг букв', onRetry: () => { mode = 'wheel'; wheel(); } }), 500);
        }
        start = null; cur = []; paint();
      };
      fw.addEventListener('pointerup', up);
      fw.addEventListener('pointercancel', up);
    }

    function tabs() {
      return h('div', { class: 'tabs' },
        h('button', { class: mode === 'wheel' ? 'on' : '', onclick: () => { mode = 'wheel'; wheel(); } }, 'Круг букв'),
        h('button', { class: mode === 'fw' ? 'on' : '', onclick: () => { mode = 'fw'; filword(); } }, 'Филворд'));
    }

    wheel();
    return () => { dead = true; };
  };
})();
