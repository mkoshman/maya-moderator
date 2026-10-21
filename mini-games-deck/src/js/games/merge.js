(function () {
  const { h, U, productSVG } = Core;

  const TIERS = [
    { r: 15, vol: '20 мл', kind: 'dropper', col: '#ffd9ea' },
    { r: 18, vol: '50 мл', kind: 'tube', col: '#ffc2dd' },
    { r: 22, vol: '120 мл', kind: 'spray', col: '#ffa9cf' },
    { r: 26, vol: '150 мл', kind: 'bottle', col: '#ff8dbf' },
    { r: 31, vol: '200 мл', kind: 'pump', col: '#f26aa8' },
    { r: 36, vol: '245 г', kind: 'jar', col: '#e24891' },
    { r: 42, vol: '300 мл', kind: 'bottle', col: '#d4005f' },
    { r: 48, vol: '500 г', kind: 'jar', col: '#af004e' },
    { r: 55, vol: '750 мл', kind: 'pump', col: '#930043' },
    { r: 63, vol: '1000 мл', kind: 'bottle', col: '#7e0038' },
  ];

  Games.merge = function (body) {
    const W = 340, H = 460, LINE = 74, G = 900;
    let balls, dropX, cd, next, over, raf, last, high, dead = false, overT, score;
    const sprites = TIERS.map((t) => {
      const c = document.createElement('canvas');
      c.width = c.height = t.r * 2 + 2;
      const ctx = c.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.beginPath(); ctx.arc(t.r + 1, t.r + 1, t.r, 0, 7);
        const g = ctx.createRadialGradient(t.r * .7, t.r * .6, 2, t.r, t.r, t.r);
        g.addColorStop(0, '#fff'); g.addColorStop(1, t.col);
        ctx.fillStyle = g; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(126,0,56,.35)'; ctx.stroke();
        const sz = t.r * 1.45;
        ctx.drawImage(img, t.r + 1 - sz / 2, t.r + 1 - sz / 2 - 2, sz, sz);
        ctx.fillStyle = '#1a1118'; ctx.font = `700 ${Math.max(8, t.r * .3)}px Geologica, sans-serif`; ctx.textAlign = 'center';
        ctx.fillText(t.vol, t.r + 1, t.r * 1.9 - 2);
        c.ready = true;
      };
      img.src = U.svgURL(productSVG(t.kind, TIERS.indexOf(t) < 6 ? '#af004e' : '#ffd9ea', 64));
      return c;
    });

    const canvas = h('canvas', { width: W, height: H, style: { width: W + 'px', height: H + 'px', borderRadius: '16px', border: '1px solid var(--border)', background: '#fff', touchAction: 'none', flex: 'none' } });
    const ctx = canvas.getContext('2d');
    const top = h('div', { class: 'g-top' });
    body.append(top, canvas, h('div', { class: 'g-note' }, 'Выбери, где отпустить банку: веди пальцем и отпусти. Две одинаковые склеиваются в следующий размер. Собери самую большую, и игра закончится.'));

    function reset() {
      balls = []; dropX = W / 2; cd = 0; over = false; high = 0; overT = 0; score = 0; last = performance.now();
      next = U.ri(0, 2);
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      showTop();
    }
    function showTop() {
      top.innerHTML = '';
      top.append(h('span', {}, 'Собрано: ', h('b', {}, (high ? TIERS[high].vol : '—') + ' (цель 1000 мл)')), h('span', {}, 'Дальше: ', h('b', {}, TIERS[next].vol)));
    }
    function drop() {
      if (over || cd > 0) return;
      const t = TIERS[next];
      const x = U.clamp(dropX, t.r + 4, W - t.r - 4);
      balls.push({ x, y: 36, vx: 0, vy: 40, t: next, r: t.r, age: 0, dead: false });
      next = U.ri(0, 3); cd = .55; showTop();
    }
    function pos(e) {
      const rc = canvas.getBoundingClientRect();
      dropX = (e.clientX - rc.left) * (W / rc.width);
    }
    canvas.addEventListener('pointerdown', (e) => { pos(e); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => pos(e));
    canvas.addEventListener('pointerup', (e) => { pos(e); drop(); });

    function step(dt) {
      for (const b of balls) {
        b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.age += dt;
        b.vx *= .998;
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * .2; }
        if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * .2; }
        if (b.y > H - b.r) { b.y = H - b.r; b.vy = -Math.abs(b.vy) * .1; b.vx *= .96; }
      }
      const add = [];
      for (let it = 0; it < 3; it++) {
        for (let i = 0; i < balls.length; i++) {
          const a = balls[i]; if (a.dead) continue;
          for (let j = i + 1; j < balls.length; j++) {
            const b = balls[j]; if (b.dead) continue;
            const dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r;
            const d2 = dx * dx + dy * dy;
            if (d2 >= min * min || d2 === 0) continue;
            const d = Math.sqrt(d2);
            if (a.t === b.t && a.t < 9 && it === 0) {
              a.dead = b.dead = true;
              const nt = a.t + 1;
              add.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, vx: (a.vx + b.vx) / 2, vy: (a.vy + b.vy) / 2 - 40, t: nt, r: TIERS[nt].r, age: 2, dead: false });
              score += nt;
              continue;
            }
            const nx = dx / d, ny = dy / d, ov = min - d;
            const ma = a.r * a.r, mb = b.r * b.r, tm = ma + mb;
            a.x -= nx * ov * (mb / tm); a.y -= ny * ov * (mb / tm);
            b.x += nx * ov * (ma / tm); b.y += ny * ov * (ma / tm);
            const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (rv < 0) {
              const imp = -rv * 1.1;
              a.vx -= nx * imp * (mb / tm); a.vy -= ny * imp * (mb / tm);
              b.vx += nx * imp * (ma / tm); b.vy += ny * imp * (ma / tm);
            }
          }
        }
      }
      if (add.length) {
        balls = balls.filter((b) => !b.dead).concat(add);
        add.forEach((n) => { if (n.t > high) { high = n.t; showTop(); } });
        if (high >= 9 && !over) win();
      }
    }
    function win() {
      over = true;
      setTimeout(() => !dead && Core.result(body, { win: true, text: 'Собрана банка на 1000 мл. Игра закончена.', onRetry: reset }), 700);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.setLineDash([6, 6]); ctx.strokeStyle = '#e29a9a'; ctx.beginPath(); ctx.moveTo(0, LINE); ctx.lineTo(W, LINE); ctx.stroke(); ctx.setLineDash([]);
      for (const b of balls) {
        const sp = sprites[b.t];
        if (sp.ready) ctx.drawImage(sp, b.x - b.r - 1, b.y - b.r - 1);
        else { ctx.fillStyle = TIERS[b.t].col; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); }
      }
      if (!over) {
        const t = TIERS[next];
        const x = U.clamp(dropX, t.r + 4, W - t.r - 4);
        ctx.globalAlpha = cd > 0 ? .25 : .7;
        const sp = sprites[next];
        if (sp.ready) ctx.drawImage(sp, x - t.r - 1, 36 - t.r - 1);
        ctx.globalAlpha = .25; ctx.strokeStyle = '#af004e'; ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(x, 36 + t.r); ctx.lineTo(x, H); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
    }

    function loop(now) {
      if (dead) return;
      const dt = Math.min(.033, (now - last) / 1000); last = now;
      if (!over) {
        cd = Math.max(0, cd - dt);
        for (let k = 0; k < 2; k++) step(dt / 2);
        const risky = balls.some((b) => b.age > 1.4 && b.y - b.r < LINE);
        overT = risky ? overT + dt : Math.max(0, overT - dt);
        if (overT > 2) {
          over = true;
          Core.result(body, { win: false, title: 'Банка переполнилась', text: 'Склеивай одинаковые чаще, тогда места хватит.', onRetry: reset });
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    }
    reset();
    raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); };
  };
})();
