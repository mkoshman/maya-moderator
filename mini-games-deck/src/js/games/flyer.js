(function () {
  const { h, U, productSVG, flarik } = Core;

  Games.flyer = function (body) {
    const W = 340, H = 460, JX = 90, JR = 12, SPEED = 125;
    let y, vy, started, over, stage, ents, spawnX, camX, last, raf, dead = false, flash = 0, toSpawn;
    const jarImg = new Image(); jarImg.src = U.svgURL(productSVG('jar', '#d4005f', 64));
    const flImg = new Image(); flImg.src = U.svgURL(flarik('happy', 64));

    const canvas = h('canvas', { width: W, height: H, style: { width: W + 'px', height: H + 'px', borderRadius: '16px', border: '1px solid var(--border)', background: '#fff7fb', touchAction: 'none', flex: 'none' } });
    const ctx = canvas.getContext('2d');
    canvas.__dbg = () => ({ y, vy, ents, camX, stage, over });
    const top = h('div', { class: 'g-top' });
    body.append(top, canvas, h('div', { class: 'g-note' }, 'Тап — банка летит вверх. Между этапами пролетай через кольцо в виде Фларика. Десятое кольцо — финал.'));

    function queueStage(n) {
      const cnt = 1 + Math.floor((n - 1) / 3);
      const gap = 168 - n * 4;
      for (let i = 0; i < cnt; i++) {
        spawnX += 190;
        ents.push({ k: 'pipe', x: spawnX, gy: U.rand(130, H - 130), gap, passed: false });
      }
      spawnX += 200;
      ents.push({ k: 'ring', x: spawnX, cy: U.rand(150, H - 150), hr: 46, passed: false, n });
    }

    function reset() {
      y = H / 2; vy = 0; started = false; over = false; stage = 1; ents = []; spawnX = 260; camX = 0; flash = 0; last = performance.now();
      queueStage(1);
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      showTop();
    }
    function showTop() {
      top.innerHTML = '';
      const dots = Array.from({ length: 10 }, (_, i) => (i < stage - 1 ? '●' : '○')).join('');
      top.append(h('span', {}, 'Этап ', h('b', {}, stage + ' / 10')), h('span', { style: { color: 'var(--crimson)', letterSpacing: '1px', fontSize: '12px' } }, dots));
    }
    function tap() {
      if (over) return;
      started = true; vy = -300;
    }
    canvas.addEventListener('pointerdown', tap);
    const key = (e) => { if (e.code === 'Space' && body.isConnected) { e.preventDefault(); tap(); } };
    window.addEventListener('keydown', key);

    function lose(txt) {
      over = true;
      Core.result(body, { win: false, title: 'Не долетела', text: txt, onRetry: reset });
    }

    function update(dt) {
      if (!started) { y = H / 2 + Math.sin(performance.now() / 300) * 6; return; }
      vy += 900 * dt; y += vy * dt; camX += SPEED * dt;
      if (y < JR || y > H - JR) return lose('Банка упала. Тапай чаще и ровнее.');
      for (const e of ents) {
        const sx = e.x - camX;
        if (e.k === 'pipe') {
          if (JX + JR > sx && JX - JR < sx + 46) {
            if (y - JR < e.gy - e.gap / 2 || y + JR > e.gy + e.gap / 2) return lose('Задела блок. Пробуй ещё.');
          }
        } else {
          const dx = Math.abs(JX - sx);
          if (!e.passed) {
            if (dx < 18 && Math.abs(y - e.cy) + JR > e.hr) return lose('Задела кольцо Фларика.');
            if (sx < JX - 20) {
              e.passed = true; flash = .5;
              if (e.n >= 10) { over = true; setTimeout(() => !dead && Core.result(body, { win: true, text: 'Десятое кольцо Фларика пройдено.', onRetry: reset }), 500); }
              else { stage = e.n + 1; showTop(); queueStage(stage); }
            }
          }
        }
      }
      ents = ents.filter((e) => e.x - camX > -120);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const e of ents) {
        const sx = e.x - camX;
        if (e.k === 'pipe') {
          ctx.fillStyle = '#af004e';
          ctx.fillRect(sx, 0, 46, e.gy - e.gap / 2);
          ctx.fillRect(sx, e.gy + e.gap / 2, 46, H);
          ctx.fillStyle = '#7e0038';
          ctx.fillRect(sx - 4, e.gy - e.gap / 2 - 14, 54, 14);
          ctx.fillRect(sx - 4, e.gy + e.gap / 2, 54, 14);
        } else {
          ctx.lineWidth = 14; ctx.strokeStyle = e.passed ? '#9ec47c' : '#ffb3d3';
          ctx.beginPath(); ctx.ellipse(sx, e.cy, 16, e.hr + 7, 0, 0, 7); ctx.stroke();
          ctx.lineWidth = 2.5; ctx.strokeStyle = '#d4005f';
          ctx.beginPath(); ctx.ellipse(sx, e.cy, 23, e.hr + 14, 0, 0, 7); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(sx, e.cy, 9, e.hr, 0, 0, 7); ctx.stroke();
          ctx.fillStyle = '#1a1118';
          ctx.beginPath(); ctx.arc(sx - 4, e.cy - e.hr - 4, 2.4, 0, 7); ctx.arc(sx + 4, e.cy - e.hr - 4, 2.4, 0, 7); ctx.fill();
          ctx.strokeStyle = '#af004e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, e.cy + e.hr + 3, 5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
          ctx.font = '700 11px Geologica, sans-serif'; ctx.fillStyle = '#7e0038'; ctx.textAlign = 'center';
          ctx.fillText(e.n === 10 ? 'ФИНАЛ' : '#' + e.n, sx, e.cy + e.hr + 32);
        }
      }
      ctx.save(); ctx.translate(JX, y); ctx.rotate(U.clamp(vy / 700, -.6, .8));
      if (jarImg.complete) ctx.drawImage(jarImg, -17, -17, 34, 34);
      ctx.restore();
      if (flash > 0) { ctx.globalAlpha = flash; if (flImg.complete) ctx.drawImage(flImg, W / 2 - 40, 40, 80, 80); ctx.globalAlpha = 1; }
      if (!started && !over) {
        ctx.fillStyle = 'rgba(122,95,112,.9)'; ctx.font = '600 14px Geologica, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Тапни, чтобы начать', W / 2, H - 40);
      }
    }
    function loop(now) {
      if (dead) return;
      const dt = Math.min(.033, (now - last) / 1000); last = now;
      if (!over) update(dt);
      flash = Math.max(0, flash - dt);
      draw();
      raf = requestAnimationFrame(loop);
    }
    reset();
    raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); window.removeEventListener('keydown', key); };
  };
})();
