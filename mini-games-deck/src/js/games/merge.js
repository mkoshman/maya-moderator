(function () {
  const { h, U, PRODUCTS } = Core;
  Games.merge = function (body) {
    const W = 340, H = 500, LINE = 80, G = 900;
    const TIERS = PRODUCTS.map((p, i) => ({ ...p, r: 14 + i * 4.6, i }));
    let balls, dropX, cd, next, over, raf, last, high, dead = false, overT;
    const sprites = TIERS.map((t) => {
      const c = document.createElement('canvas');
      c.width = c.height = t.r * 2 + 8;
      const ctx = c.getContext('2d');
      const im = new Image();
      im.onload = () => {
        ctx.beginPath(); ctx.arc(c.width / 2, c.height / 2, t.r, 0, 7);
        ctx.fillStyle = t.color; ctx.globalAlpha = .25; ctx.fill(); ctx.globalAlpha = 1;
        const sz = t.r * 1.7;
        ctx.drawImage(im, c.width / 2 - sz / 2, c.height / 2 - sz / 2, sz, sz);
        c.ready = true;
      };
      im.src = ASSETS[t.img] || '';
      return c;
    });
    const canvas = h('canvas', { width: W, height: H, style: { width: W + 'px', height: H + 'px', borderRadius: '16px', border: '1px solid var(--border)', background: '#fff', touchAction: 'none', flex: 'none' } });
    const ctx = canvas.getContext('2d');
    const top = h('div', { class: 'g-top' });
    body.append(top, canvas, h('div', { class: 'g-note' }, 'Банки Limba и Tashe от маленькой к большой. Веди и отпусти. Две одинаковые склеиваются в следующий размер.'));
    function reset() {
      balls = []; dropX = W / 2; cd = 0; over = false; high = 0; overT = 0; next = U.ri(0, 2); last = performance.now();
      const ov = body.querySelector('.overlay'); if (ov) ov.remove(); showTop();
    }
    function showTop() {
      top.innerHTML = '';
      top.append(h('span', {}, 'Собрано: ', h('b', {}, high ? TIERS[high].vol : '—')), h('span', {}, 'Дальше: ', h('b', {}, TIERS[next].vol)));
    }
    function drop() {
      if (over || cd > 0) return;
      const t = TIERS[next];
      balls.push({ x: U.clamp(dropX, t.r + 4, W - t.r - 4), y: 40, vx: 0, vy: 40, t: next, r: t.r, age: 0, dead: false });
      next = U.ri(0, 3); cd = .5; showTop();
    }
    const pos = (e) => { const rc = canvas.getBoundingClientRect(); dropX = (e.clientX - rc.left) * (W / rc.width); };
    canvas.addEventListener('pointerdown', (e) => { pos(e); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', pos);
    canvas.addEventListener('pointerup', (e) => { pos(e); drop(); });
    function step(dt) {
      for (const b of balls) {
        b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.age += dt; b.vx *= .998;
        if (b.x < b.r) { b.x = b.r; b.vx *= -.2; }
        if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -.2; }
        if (b.y > H - b.r) { b.y = H - b.r; b.vy *= -.12; b.vx *= .95; }
      }
      const add = [];
      for (let i = 0; i < balls.length; i++) {
        const a = balls[i]; if (a.dead) continue;
        for (let j = i + 1; j < balls.length; j++) {
          const b = balls[j]; if (b.dead) continue;
          const dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r, d2 = dx * dx + dy * dy;
          if (d2 >= min * min || !d2) continue;
          const d = Math.sqrt(d2);
          if (a.t === b.t && a.t < 9) {
            a.dead = b.dead = true;
            const nt = a.t + 1;
            add.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, vx: 0, vy: -30, t: nt, r: TIERS[nt].r, age: 2, dead: false });
            continue;
          }
          const nx = dx / d, ny = dy / d, ov = min - d;
          a.x -= nx * ov / 2; a.y -= ny * ov / 2; b.x += nx * ov / 2; b.y += ny * ov / 2;
        }
      }
      if (add.length) {
        balls = balls.filter((b) => !b.dead).concat(add);
        add.forEach((n) => { if (n.t > high) high = n.t; });
        showTop();
        if (high >= 9 && !over) { over = true; setTimeout(() => !dead && Core.result(body, { win: true, text: 'Собрана самая большая банка из ряда Limba/Tashe.', onRetry: reset }), 500); }
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.setLineDash([6, 6]); ctx.strokeStyle = '#e29a9a'; ctx.beginPath(); ctx.moveTo(0, LINE); ctx.lineTo(W, LINE); ctx.stroke(); ctx.setLineDash([]);
      for (const b of balls) {
        const sp = sprites[b.t];
        if (sp.ready) ctx.drawImage(sp, b.x - sp.width / 2, b.y - sp.height / 2);
        else { ctx.fillStyle = TIERS[b.t].color; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); }
      }
      if (!over) {
        const t = TIERS[next], x = U.clamp(dropX, t.r + 4, W - t.r - 4), sp = sprites[next];
        ctx.globalAlpha = cd > 0 ? .25 : .75;
        if (sp.ready) ctx.drawImage(sp, x - sp.width / 2, 40 - sp.height / 2);
        ctx.globalAlpha = 1;
      }
    }
    function loop(now) {
      if (dead) return;
      const dt = Math.min(.033, (now - last) / 1000); last = now;
      if (!over) {
        cd = Math.max(0, cd - dt);
        step(dt);
        const risky = balls.some((b) => b.age > 1.4 && b.y - b.r < LINE);
        overT = risky ? overT + dt : 0;
        if (overT > 2) { over = true; Core.result(body, { win: false, title: 'Переполнилась', text: 'Склеивай одинаковые чаще.', onRetry: reset }); }
      }
      draw(); raf = requestAnimationFrame(loop);
    }
    reset(); raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); };
  };
})();
