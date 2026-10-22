(function () {
  const { h, U, PRODUCTS } = Core;
  Games.flyer = function (body) {
    const W = 340, H = 500, JX = 90, JR = 14, SPEED = 130;
    let y, vy, started, over, ents, spawnX, camX, last, raf, dead = false, flash = 0, jarI, passed;
    const jars = [PRODUCTS[2], PRODUCTS[3], PRODUCTS[6]];
    const imgs = jars.map((p) => { const i = new Image(); i.src = (ASSETS[p.img] || ''); return i; });
    const fl = new Image(); fl.src = ASSETS.flarik || '';

    const canvas = h('canvas', { width: W, height: H, style: { width: W + 'px', height: H + 'px', borderRadius: '16px', border: '1px solid var(--border)', background: '#fff7fb', touchAction: 'none', flex: 'none' } });
    const ctx = canvas.getContext('2d');
    const top = h('div', { class: 'g-top' });
    body.append(top, canvas, h('div', { class: 'g-note' }, 'Тап — вверх. Сначала 10 преград. Когда все пройдены, появляется кольцо-Фларик. Пролети в дырку — банка станет следующей.'));

    function reset() {
      y = H / 2; vy = 0; started = false; over = false; ents = []; spawnX = 280; camX = 0; flash = 0; jarI = 0; passed = 0; last = performance.now();
      for (let i = 0; i < 10; i++) {
        spawnX += 175;
        ents.push({ k: 'pipe', x: spawnX, gy: U.rand(140, H - 140), gap: 148, n: i + 1 });
      }
      spawnX += 220;
      ents.push({ k: 'ring', x: spawnX, cy: H / 2, hr: 52, passed: false });
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      showTop();
    }
    function showTop() {
      top.innerHTML = '';
      top.append(h('span', {}, 'Преграды: ', h('b', {}, Math.min(passed, 10) + ' / 10')), h('span', {}, jars[jarI].name));
    }
    canvas.addEventListener('pointerdown', () => { if (over) return; started = true; vy = -310; });
    function lose(t) { over = true; Core.result(body, { win: false, title: 'Не долетела', text: t, onRetry: reset }); }

    function update(dt) {
      if (!started) { y = H / 2 + Math.sin(performance.now() / 300) * 6; return; }
      vy += 920 * dt; y += vy * dt; camX += SPEED * dt;
      if (y < JR || y > H - JR) return lose('Банка упала.');
      for (const e of ents) {
        const sx = e.x - camX;
        if (e.k === 'pipe') {
          if (JX + JR > sx && JX - JR < sx + 42) {
            if (y - JR < e.gy - e.gap / 2 || y + JR > e.gy + e.gap / 2) return lose('Задела преграду.');
          }
          if (!e.ok && sx + 42 < JX) { e.ok = true; passed++; showTop(); }
        } else if (!e.passed) {
          const dx = Math.abs(JX - sx);
          if (dx < 16 && Math.abs(y - e.cy) + JR > e.hr) return lose('Задела кольцо Фларика.');
          if (sx < JX - 18) {
            e.passed = true; flash = .6; jarI = Math.min(jars.length - 1, jarI + 1); showTop();
            over = true;
            setTimeout(() => !dead && Core.result(body, { win: true, text: 'Десять преград и кольцо пройдены. Банка сменилась на ' + jars[jarI].name + '.', onRetry: reset }), 600);
          }
        }
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const e of ents) {
        const sx = e.x - camX;
        if (e.k === 'pipe') {
          ctx.fillStyle = '#af004e';
          ctx.fillRect(sx, 0, 42, e.gy - e.gap / 2);
          ctx.fillRect(sx, e.gy + e.gap / 2, 42, H);
          ctx.fillStyle = '#fff'; ctx.font = '700 12px Manrope,sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(e.n, sx + 21, e.gy - e.gap / 2 - 8);
        } else {
          ctx.lineWidth = 14; ctx.strokeStyle = '#ffb3d3';
          ctx.beginPath(); ctx.ellipse(sx, e.cy, 18, e.hr + 6, 0, 0, 7); ctx.stroke();
          ctx.lineWidth = 3; ctx.strokeStyle = '#af004e';
          ctx.beginPath(); ctx.ellipse(sx, e.cy, 26, e.hr + 14, 0, 0, 7); ctx.stroke();
          if (fl.complete && fl.naturalWidth) ctx.drawImage(fl, sx - 22, e.cy - e.hr - 48, 44, 44);
        }
      }
      ctx.save(); ctx.translate(JX, y); ctx.rotate(U.clamp(vy / 700, -.5, .7));
      const im = imgs[Math.min(jarI, imgs.length - 1)];
      if (im.complete && im.naturalWidth) ctx.drawImage(im, -18, -28, 36, 56);
      ctx.restore();
      if (flash > 0 && fl.complete) { ctx.globalAlpha = flash; ctx.drawImage(fl, W / 2 - 40, 36, 80, 80); ctx.globalAlpha = 1; }
      if (!started && !over) {
        ctx.fillStyle = '#7a5f70'; ctx.font = '600 14px Manrope,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Тапни, чтобы начать', W / 2, H - 36);
      }
    }
    function loop(now) {
      if (dead) return;
      const dt = Math.min(.033, (now - last) / 1000); last = now;
      if (!over) update(dt);
      flash = Math.max(0, flash - dt);
      draw(); raf = requestAnimationFrame(loop);
    }
    reset(); raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); };
  };
})();
