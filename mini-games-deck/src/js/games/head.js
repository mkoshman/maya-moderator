(function () {
  const { h, s, U, productSVG, itemSVG } = Core;

  const SEQ = [
    { tool: 'shampoo', taps: 10, who: 'A', title: 'Вспенить шампунь', text: 'Multiuse Shampoo: на мокрые волосы и кожу головы, вспенить массажными движениями' },
    { tool: 'shower', taps: 8, who: 'B', title: 'Смыть шампунь', text: 'Тщательно смыть' },
    { tool: 'peel', taps: 10, who: 'B', title: 'Нанести пилинг', text: 'Refreshing Exfoliation: на влажную кожу головы по проборам, после шампуня' },
    { tool: 'shower', taps: 8, who: 'A', title: 'Смыть пилинг', text: 'Тщательно смыть' },
    { tool: 'towel', taps: 6, who: 'B', title: 'Убрать влагу полотенцем', text: 'Перед маской убираем излишки влаги' },
    { tool: 'mask', taps: 3, who: 'A', title: 'Нанести маску', text: 'Instant Transformation: 2–4 нажатия по длине, держать 3 минуты, не смывая', wait: 3 },
    { tool: 'spray', taps: 6, who: 'B', title: 'Термозащита', text: 'Protein Thermal Protection Spray: на подсушенные волосы перед феном, отступив от корней' },
    { tool: 'dryer', taps: 10, who: 'A', title: 'Уложить феном', text: 'Сушим и укладываем' },
  ];
  const TOOLS = [
    ['shampoo', 'Шампунь', () => Core.img('lmb05', 32)],
    ['peel', 'Пилинг', () => Core.img('lmb57', 32)],
    ['mask', 'Маска', () => Core.img('lmb56', 32)],
    ['spray', 'Термозащита', () => Core.img('lmb42', 32)],
    ['shower', 'Душ', () => '<svg viewBox="0 0 40 40" width="32" height="32"><path d="M8 12a12 8 0 0124 0z" fill="#6aa2d2"/><path d="M11 18v6M17 18v10M23 18v6M29 18v10" stroke="#6aa2d2" stroke-width="2.5" stroke-linecap="round"/></svg>'],
    ['towel', 'Полотенце', () => itemSVG('towel', 32)],
    ['dryer', 'Фен', () => itemSVG('dryer', 32)],
    ['elixir', 'Эликсир-масло', () => productSVG('dropper', '#e8a33d', 32)],
  ];
  const TOOL_NAME = Object.fromEntries(TOOLS.map((t) => [t[0], t[1]]));

  Games.head = function (body, opt = {}) {
    const pair = !!opt.pair;
    let me = 'A', idx, taps, tool, hint, errors, t0, timers = [], dead = false, over, waiting, fx, hairWet;
    const later = (fn, ms) => { const t = setTimeout(() => !dead && fn(), ms); timers.push(t); return t; };

    const top = h('div', { class: 'g-top' });
    const line = h('div', { class: 'stepline' });
    const info = h('div', { class: 'g-note', style: { minHeight: '34px' } });
    const box = h('div', { class: 'headbox', style: { display: 'flex', justifyContent: 'center' } });
    const toolIcon = h('div', { style: { position: 'absolute', right: '14px', top: '10px', pointerEvents: 'none' } });
    const svg = s('svg', { viewBox: '0 0 340 300', width: 300, height: 250 });
    svg.innerHTML = `<path d="M30 230 Q170 168 310 230 L330 300 L10 300 Z" fill="#f7d5e4"/>
      <path d="M118 214 Q170 188 222 214 L210 250 L130 250 Z" fill="#e7b89a"/>
      <path id="hb" d="M78 150 Q62 40 170 24 Q278 40 262 150 Q300 250 170 268 Q40 250 78 150 Z" fill="#4a2d20"/>
      <path id="hf" d="M108 132 Q170 78 232 132 Q250 210 170 236 Q90 210 108 132 Z" fill="#6a4030" opacity=".45"/>
      <path d="M170 30 v48" stroke="#e6c2ae" stroke-width="2" opacity=".7"/>
      <g id="fx"></g>`;
    box.append(svg, toolIcon);
    const prog = h('div', { class: 'prog' }, h('i'));
    const menu = h('div', { class: 'menu' });
    const btns = h('div', { class: 'row-btns' });
    body.append(top, line, box, prog, info, menu, btns);

    const fxG = svg.querySelector('#fx');
    function spot() {
      return [170 + U.rand(-78, 78), 70 + U.rand(0, 150)];
    }
    function addFx(kind) {
      const [x, y] = spot();
      let e;
      if (kind === 'foam') e = s('circle', { cx: x, cy: y, r: U.rand(6, 13), fill: '#fff', stroke: '#cfe0ec', 'stroke-width': 1.5, 'data-k': 'foam' });
      else if (kind === 'peel') e = s('circle', { cx: 170 + U.rand(-34, 34), cy: U.rand(76, 100), r: U.rand(1.5, 3), fill: '#c99a6b', 'data-k': 'peel' });
      else if (kind === 'mask') e = s('ellipse', { cx: x, cy: y, rx: U.rand(8, 14), ry: U.rand(5, 9), fill: '#ff8dbf', opacity: .6, 'data-k': 'mask' });
      else if (kind === 'spray') e = s('text', { x, y, 'font-size': U.rand(12, 20), fill: '#3b82c4', 'data-k': 'spray' }, '✦');
      else if (kind === 'water') e = s('path', { d: `M${x} ${y}q4 7 0 11q-4-4 0-11`, fill: '#6aa2d2', opacity: .8, 'data-k': 'water' });
      else if (kind === 'wind') e = s('path', { d: `M${x - 20} ${y}q12-8 24 0t24 0`, stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: .8, 'data-k': 'wind' });
      if (e) { fxG.append(e); if (kind === 'wind' || kind === 'water') later(() => e.remove(), 500); }
    }
    function clearFx(k, part = 1) {
      const els = [...fxG.querySelectorAll(`[data-k="${k}"]`)];
      els.slice(0, Math.ceil(els.length * part)).forEach((e) => e.remove());
    }
    function hair(c) {
      svg.querySelector('#hb').setAttribute('fill', c);
      svg.querySelector('#hf').setAttribute('fill', c);
    }

    function reset() {
      idx = 0; taps = 0; tool = null; errors = 0; over = false; waiting = false; hint = true; t0 = null;
      fxG.innerHTML = ''; hair('#4a2d20'); prog.firstChild.style.width = '0';
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      renderAll(); startStep();
    }
    const mine = () => !pair || SEQ[idx].who === me;

    function renderAll() {
      top.innerHTML = '';
      top.append(h('span', {}, 'Шаг ', h('b', {}, Math.min(idx + 1, SEQ.length) + ' / ' + SEQ.length)),
        pair ? h('span', { class: 'role me' }, 'Ты: консультантка ' + (me === 'A' ? '1' : '2')) : h('span', {}, 'Ошибок: ', h('b', {}, errors)));
      line.innerHTML = '';
      SEQ.forEach((st, i) => line.append(h('i', { class: (i < idx ? 'f' : i === idx ? 'c' : '') + (pair && st.who !== me ? ' p' : ''), title: st.title })));
      menu.innerHTML = '';
      TOOLS.forEach(([id, name, ic]) => menu.append(h('button', {
        class: tool === id ? 'on' : (!mine() ? 'dis' : ''),
        html: ic() + '<span>' + name + '</span>',
        onclick: () => pickTool(id),
      })));
      btns.innerHTML = '';
      btns.append(h('button', { class: 'btn sm', onclick: () => { hint = !hint; renderAll(); showInfo(); } }, 'Подсказка: ' + (hint ? 'вкл' : 'выкл')));
      if (pair) btns.append(h('button', { class: 'btn sm', onclick: () => { me = me === 'A' ? 'B' : 'A'; reset(); } }, 'Поменяться ролями'));
      btns.append(h('button', { class: 'btn sm', onclick: reset }, 'Заново'));
      toolIcon.innerHTML = tool ? TOOLS.find((t) => t[0] === tool)[2]().replace(/32/g, '46') : '';
    }
    function showInfo(msg) {
      if (over) return;
      const st = SEQ[idx];
      if (msg) { info.textContent = msg; return; }
      if (!mine()) info.textContent = 'Сейчас работает подруга: ' + st.title.toLowerCase() + '. Подожди своего шага.';
      else if (waiting) info.textContent = 'Маска работает. Держим 3 минуты (в презентации ускорено).';
      else if (!tool) info.textContent = hint ? 'Возьми средство: ' + st.title.toLowerCase() + '. ' + st.text : 'Какое средство берём сейчас?';
      else info.textContent = 'Тапай по волосам. ' + (hint ? st.text : '');
    }

    function startStep() {
      if (idx >= SEQ.length) return finish();
      taps = 0; tool = null; waiting = false; prog.firstChild.style.width = '0';
      renderAll(); showInfo();
      if (pair && SEQ[idx].who !== me) {
        const st = SEQ[idx];
        tool = st.tool; renderAll();
        let n = 0;
        const iv = setInterval(() => {
          if (dead) return clearInterval(iv);
          n++; applyTap(st, n); prog.firstChild.style.width = (n / st.taps) * 100 + '%';
          if (n >= st.taps) { clearInterval(iv); later(() => completeStep(), 300); }
        }, 170);
        timers.push(iv);
      }
    }
    function pickTool(id) {
      if (over || !mine() || waiting) return;
      const st = SEQ[idx];
      if (id === st.tool) { tool = id; renderAll(); showInfo(); }
      else {
        errors++; renderAll();
        showInfo('Это не то. Нужно: ' + (hint ? TOOL_NAME[st.tool].toLowerCase() : 'другое средство') + '.');
        box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
      }
    }
    function applyTap(st, n) {
      const k = st.tool;
      if (k === 'shampoo') addFx('foam');
      else if (k === 'shower') { clearFx(idx === 1 ? 'foam' : 'peel', 1 / Math.max(1, st.taps - n + 1)); addFx('water'); }
      else if (k === 'peel') { addFx('peel'); addFx('peel'); }
      else if (k === 'towel') { clearFx('water'); hair(n > st.taps / 2 ? '#6a4130' : '#4a2d20'); }
      else if (k === 'mask') { for (let i = 0; i < 4; i++) addFx('mask'); }
      else if (k === 'spray') addFx('spray');
      else if (k === 'dryer') { addFx('wind'); hair(n > st.taps / 2 ? '#8a5a42' : '#6a4130'); }
    }
    function tapHead() {
      if (over || waiting || !mine()) return;
      const st = SEQ[idx];
      if (!tool) { showInfo('Сначала возьми средство из меню внизу.'); return; }
      taps++; applyTap(st, taps);
      prog.firstChild.style.width = (taps / st.taps) * 100 + '%';
      box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
      if (taps >= st.taps) completeStep();
    }
    function completeStep() {
      const st = SEQ[idx];
      if (st.wait) {
        waiting = true; showInfo();
        const t = Date.now();
        const iv = setInterval(() => {
          const p = (Date.now() - t) / (st.wait * 1000);
          prog.firstChild.style.width = Math.min(100, (1 - p) * 100) + '%';
          if (p >= 1) { clearInterval(iv); idx++; startStep(); }
        }, 80);
        timers.push(iv);
        return;
      }
      if (st.tool === 'shower') clearFx(idx === 1 ? 'foam' : 'peel');
      idx++;
      startStep();
    }
    function finish() {
      over = true; hair('#9a6648'); renderAll();
      const sec = Math.round((Date.now() - t0) / 1000);
      later(() => Core.result(body, {
        win: true,
        text: (pair ? 'Клиентка довольна, ритуал сделали вдвоём. ' : 'Клиентка довольна. ') + 'Время: ' + sec + ' с, ошибок с выбором средства: ' + errors + '.',
        onRetry: reset,
      }), 400);
    }
    box.addEventListener('pointerdown', () => { if (t0 == null) t0 = Date.now(); tapHead(); });
    menu.addEventListener('pointerdown', () => { if (t0 == null) t0 = Date.now(); });
    reset();
    return () => { dead = true; timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); };
  };
  Games.head.SEQ = SEQ;
})();
