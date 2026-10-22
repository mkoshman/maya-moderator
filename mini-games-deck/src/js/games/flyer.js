(function () {
  const { h, U, PRODUCTS } = Core;
  Games.flyer = function (body) {
    const W = 340, H = 520, JX = 78, JR = 22, SPEED = 155, TOTAL = 50;
    let y, vy, started, over, ents, spawnX, camX, last, raf, dead = false, jarI, passed;
    const jars = [PRODUCTS[0], PRODUCTS[2], PRODUCTS[6], PRODUCTS[8], PRODUCTS[9]];
    const imgs = jars.map((p) => { const i = new Image(); i.src = (ASSETS[p.img] || ''); return i; });

    const canvas = h('canvas', { width: W, height: H, style: { width: '100%', height: H + 'px', borderRadius: '16px', background: '#fff7fb', touchAction: 'none', flex: 'none' } });
    const ctx = canvas.getContext('2d');
    const top = h('div', { class: 'g-top' });
    body.append(top, canvas);

    function reset() {
      y = H / 2; vy = 0; started = false; over = false; ents = []; spawnX = 20; camX = 0; jarI = 0; passed = 0; last = performance.now();
      for (let i = 0; i < TOTAL; i++) {
        spawnX += 155;
        ents.push({ k: 'pipe', x: spawnX, gy: U.rand(150, H - 150), gap: 168 });
      }
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      showTop();
    }
    function showTop() {
      top.innerHTML = '';
      top.append(h('span', {}, 'Преграды: ', h('b', {}, passed + ' / ' + TOTAL)), h('span', {}, jars[jarI].vol));
    }
    canvas.addEventListener('pointerdown', () => { if (over) return; started = true; vy = -340; });
    function lose(t) { over = true; Core.result(body, { win: false, title: 'Не долетела', text: t, onRetry: reset }); }

    function update(dt) {
      if (!started) { y = H / 2 + Math.sin(performance.now() / 300) * 6; return; }
      vy += 980 * dt; y += vy * dt; camX += SPEED * dt;
      if (y < JR || y > H - JR) return lose('Банка вышла за поле.');
      for (const e of ents) {
        const sx = e.x - camX;
        if (JX + JR > sx && JX - JR < sx + 36) {
          if (y - JR < e.gy - e.gap / 2 || y + JR > e.gy + e.gap / 2) return lose('Задела преграду.');
        }
        if (!e.ok && sx + 36 < JX) {
          e.ok = true;
          passed++;
          const stage = Math.min(jars.length - 1, Math.floor(passed / 10));
          jarI = stage;
          showTop();
          if (passed >= TOTAL) {
            over = true;
            setTimeout(() => !dead && Core.result(body, { win: true, text: '50 преград пройдены. Банка дошла до ' + jars[jarI].vol + '.', onRetry: reset }), 400);
          }
        }
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#fff0f6'); sky.addColorStop(1, '#f7e4ee');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      for (const e of ents) {
        const sx = e.x - camX;
        if (sx < -50 || sx > W + 50) continue;
        ctx.fillStyle = '#af004e';
        roundRect(sx, 0, 36, e.gy - e.gap / 2, 10, true);
        roundRect(sx, e.gy + e.gap / 2, 36, H, 10, false);
      }
      ctx.save(); ctx.translate(JX, y); ctx.rotate(U.clamp(vy / 800, -.45, .6));
      const im = imgs[Math.min(jarI, imgs.length - 1)];
      if (im.complete && im.naturalWidth) ctx.drawImage(im, -26, -40, 52, 80);
      else { ctx.fillStyle = jars[jarI].color; ctx.fillRect(-16, -28, 32, 56); }
      ctx.restore();
      if (!started && !over) {
        ctx.fillStyle = '#7a5f70'; ctx.font = '600 15px Manrope,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Тапни, чтобы банка полетела', W / 2, H - 28);
      }
    }
    function roundRect(x, y, w, h, r, top) {
      ctx.beginPath();
      if (top) {
        ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      } else {
        ctx.moveTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
      }
      ctx.fill();
    }
    function loop(now) {
      if (dead) return;
      const dt = Math.min(.033, (now - last) / 1000); last = now;
      if (!over) update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }
    reset(); raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); };
  };
})();
