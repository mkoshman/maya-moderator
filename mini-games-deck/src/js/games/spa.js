(function () {
  const { h, U } = Core;

  const ST = {
    door: { x: 175, y: 22, cls: 'door', t: 'Вход' },
    shampoo: { x: 298, y: 170, cls: 'shelf', t: 'Шампунь' },
    thermal: { x: 298, y: 220, cls: 'shelf', t: 'Термозащита' },
    glance: { x: 298, y: 270, cls: 'shelf', t: 'Блеск-спрей' },
    sink: { x: 55, y: 345, cls: 'sink', t: 'Мойка' },
    seat1: { x: 150, y: 345, cls: 'seat', t: 'Кресло 1' },
    seat2: { x: 245, y: 345, cls: 'seat', t: 'Кресло 2' },
    desk: { x: 175, y: 432, cls: 'desk', t: 'Консультация' },
  };
  const QUEUE = [{ x: 55, y: 120 }, { x: 165, y: 120 }, { x: 275, y: 120 }];
  const BOTTLE = { shampoo: 'Шампунь', thermal: 'Термозащита', glance: 'Блеск-спрей' };
  const ORDERS = [
    [{ k: 'wash' }],
    [{ k: 'style', item: 'thermal' }],
    [{ k: 'style', item: 'glance' }],
    [{ k: 'consult' }],
    [{ k: 'wash' }, { k: 'style', item: 'thermal' }],
    [{ k: 'consult' }, { k: 'wash' }],
    [{ k: 'wash' }, { k: 'style', item: 'glance' }, { k: 'consult' }],
  ];
  const label = (s) => s.k === 'wash' ? 'Помыть голову' : s.k === 'consult' ? 'Консультация' : 'Укладка: ' + BOTTLE[s.item].toLowerCase();
  const fits = (step, st) => (step.k === 'wash' && st === 'sink') || (step.k === 'style' && (st === 'seat1' || st === 'seat2')) || (step.k === 'consult' && st === 'desk');
  const needName = (step) => step.k === 'wash' ? 'мойку' : step.k === 'consult' ? 'стол консультации' : 'кресло';
  const faceSVG = (c, hat) => `<svg viewBox="0 0 30 30" width="30" height="30"><circle cx="15" cy="16" r="12" fill="${c}"/><circle cx="11" cy="15" r="1.6" fill="#1a1118"/><circle cx="19" cy="15" r="1.6" fill="#1a1118"/><path d="M10 20q5 4 10 0" stroke="#1a1118" stroke-width="1.5" fill="none"/>${hat ? '<rect x="7" y="1" width="16" height="7" rx="3" fill="#fff" stroke="#999"/>' : ''}</svg>`;

  Games.spa = function (body) {
    const GOAL = 6;
    let chefs, clients, occ, served, lost, spawnT, last, raf, over, dead = false, sel, uid, toastT;

    const top = h('div', { class: 'g-top' });
    const field = h('div', { class: 'spa' });
    field.style.background = 'linear-gradient(#f7e6ee,#fff5f9)';
    const toast = h('div', { class: 'g-note', style: { minHeight: '30px' } });
    body.append(top, field, toast);
    Object.entries(ST).forEach(([id, s]) => {
      const e = h('div', { class: 'st ' + s.cls, style: { left: s.x + 'px', top: s.y + 'px' }, onclick: () => command({ kind: id === 'door' ? null : (s.cls === 'shelf' ? 'shelf' : 'station'), id }) }, s.t);
      s.el = e; field.append(e);
    });

    function say(m) { toast.textContent = m; clearTimeout(toastT); toastT = setTimeout(() => { toast.textContent = 'Нажми на повара, потом на то, куда ему идти.'; }, 3500); }
    function showTop() {
      top.innerHTML = '';
      top.append(h('span', {}, 'Салон Каролина · ', h('b', {}, served + ' / ' + GOAL)), h('span', {}, 'Ушли: ', h('b', {}, lost + ' / 3')));
    }

    function mkChef(id, col, x, y) {
      const el = h('div', { class: 'ppl chef', html: faceSVG(col, true) });
      el.onclick = (e) => { e.stopPropagation(); sel = c; refreshSel(); };
      const c = { id, x, y, tx: x, ty: y, task: null, hold: null, work: null, el, col };
      field.append(el);
      return c;
    }
    function refreshSel() { chefs.forEach((c) => c.el.classList.toggle('sel', c === sel)); }

    function reset() {
      field.querySelectorAll('.ppl').forEach((e) => e.remove());
      chefs = [mkChef('A', '#f7b9d4', 90, 250), mkChef('B', '#b9d6f7', 220, 250)];
      sel = chefs[0]; refreshSel();
      clients = []; occ = {}; served = 0; lost = 0; spawnT = 6; over = false; last = performance.now(); uid = 0;
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      spawn(); spawn();
      showTop(); say('Нажми на повара, потом на то, куда ему идти.');
    }

    function spawn() {
      const free = QUEUE.findIndex((_, i) => !clients.some((c) => c.where === 'queue' && c.spot === i));
      if (free < 0) return;
      const steps = U.pick(ORDERS).map((x) => ({ ...x }));
      const el = h('div', { class: 'ppl', html: faceSVG(U.pick(['#f6d5c0', '#e8bfa5', '#d9a98a']), false) });
      const bub = h('div', { class: 'bub' }); const pat = h('div', { class: 'pat' }, h('i'));
      el.append(bub, pat);
      const c = { id: uid++, steps, si: 0, where: 'queue', spot: free, x: QUEUE[free].x, y: QUEUE[free].y, patience: 75, el, bub, pat };
      el.onclick = (e) => { e.stopPropagation(); command({ kind: 'client', c }); };
      clients.push(c); field.append(el); bubble(c);
    }
    function bubble(c) {
      const s = c.steps[c.si];
      c.bub.innerHTML = c.steps.map((x, i) => (i < c.si ? '<s>' + label(x) + '</s>' : i === c.si ? '<b>' + label(x) + '</b>' : label(x))).join('<br>');
      c.bub.style.bottom = 30 + (c.steps.length - 1) * 4 + 'px';
    }

    function command(t) {
      if (over || !t.kind) return;
      const c = sel;
      if (c.work) { say('Повар занят, подожди секунду.'); return; }
      c.task = t;
      if (t.kind === 'client') { c.tx = t.c.x; c.ty = t.c.y; }
      else { c.tx = ST[t.id].x; c.ty = ST[t.id].y; }
    }

    function dropClient(c, st) {
      const cl = c.hold.c;
      cl.where = st; occ[st] = cl; cl.x = ST[st].x; cl.y = ST[st].y; c.hold = null;
    }
    function leave(cl, happy) {
      if (cl.where in occ || occ[cl.where] === cl) delete occ[cl.where];
      chefs.forEach((c) => { if (c.hold && c.hold.c === cl) c.hold = null; if (c.work && c.work.c === cl) c.work = null; });
      clients = clients.filter((x) => x !== cl);
      cl.el.remove();
      if (happy) served++; else lost++;
      showTop();
      if (served >= GOAL) { over = true; Core.result(body, { win: true, text: 'Смена закончена, все ' + GOAL + ' клиентов довольны.', onRetry: reset }); }
      else if (lost >= 3) { over = true; Core.result(body, { win: false, title: 'Клиенты ушли', text: 'Трое ушли, не дождавшись. Разделите работу: один носит клиентов, второй средства.', onRetry: reset }); }
    }

    function act(c) {
      const t = c.task; c.task = null;
      if (t.kind === 'shelf') {
        if (!c.hold) { c.hold = { type: 'b', item: t.id }; }
        else if (c.hold.type === 'b') { c.hold = c.hold.item === t.id ? null : { type: 'b', item: t.id }; }
        else say('Руки заняты клиентом.');
        return;
      }
      if (t.kind === 'station') {
        if (c.hold && c.hold.type === 'client') {
          const cl = c.hold.c, step = cl.steps[cl.si];
          if (occ[t.id]) return say('Это место занято.');
          if (!fits(step, t.id)) return say('Клиенту нужно: ' + label(step).toLowerCase() + '. Веди его на ' + needName(step) + '.');
          dropClient(c, t.id);
        }
        return;
      }
      if (t.kind === 'client') {
        const cl = t.c;
        if (!clients.includes(cl)) return;
        if (cl.where === 'queue') {
          if (c.hold) return say('Сначала освободи руки.');
          c.hold = { type: 'client', c: cl }; cl.where = 'carried'; return;
        }
        if (cl.where === 'carried') return;
        const step = cl.steps[cl.si];
        const atRight = fits(step, cl.where);
        if (atRight) {
          if (step.k === 'consult' && !c.hold) c.work = { c: cl, t: 0, dur: 2.2 };
          else if (step.k === 'wash' && c.hold && c.hold.type === 'b' && c.hold.item === 'shampoo') c.work = { c: cl, t: 0, dur: 1.8 };
          else if (step.k === 'style' && c.hold && c.hold.type === 'b' && c.hold.item === step.item) c.work = { c: cl, t: 0, dur: 1.8 };
          else say('Тут нужно: ' + label(step).toLowerCase() + (step.k === 'consult' ? ' (руки свободны).' : '. Возьми ' + (step.k === 'wash' ? 'шампунь' : BOTTLE[step.item].toLowerCase()) + ' с полки.'));
        } else if (!c.hold) {
          delete occ[cl.where]; c.hold = { type: 'client', c: cl }; cl.where = 'carried';
        } else say('Клиента нужно перевести: освободи руки и возьми его.');
      }
    }

    function loop(now) {
      if (dead) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!over) {
        spawnT -= dt;
        if (spawnT <= 0) { spawn(); spawnT = 11; }
        for (const c of chefs) {
          if (c.work) {
            c.work.t += dt;
            if (c.work.t >= c.work.dur) {
              const cl = c.work.c, step = cl.steps[cl.si];
              c.work = null;
              if (step.k !== 'consult') c.hold = null;
              cl.si++;
              if (cl.si >= cl.steps.length) leave(cl, true); else { bubble(cl); say('Дальше клиенту: ' + label(cl.steps[cl.si]).toLowerCase() + '.'); }
            }
          } else if (c.task) {
            const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
            if (c.task.kind === 'client') { c.tx = c.task.c.x; c.ty = c.task.c.y; }
            if (d < 30) act(c);
            else { const v = 150 * dt; c.x += (dx / d) * Math.min(v, d); c.y += (dy / d) * Math.min(v, d); }
          }
        }
        for (const cl of clients.slice()) {
          cl.patience -= dt * (cl.where === 'queue' ? 1 : .7);
          if (cl.patience <= 0) { leave(cl, false); continue; }
          cl.pat.firstChild.style.width = Math.max(0, cl.patience / 75) * 100 + '%';
          cl.pat.firstChild.style.background = cl.patience < 20 ? '#a32d2d' : cl.patience < 40 ? '#e8a33d' : '#27500a';
        }
      }
      for (const c of chefs) {
        c.el.style.left = c.x + 'px'; c.el.style.top = c.y + 'px';
        let hl = c.el.querySelector('.hold'); let wk = c.el.querySelector('.work');
        const txt = c.hold ? (c.hold.type === 'b' ? BOTTLE[c.hold.item] : 'клиент') : '';
        if (txt) { if (!hl) { hl = h('div', { class: 'hold' }); c.el.append(hl); } hl.textContent = txt; } else if (hl) hl.remove();
        if (c.work) { if (!wk) { wk = h('div', { class: 'work' }, h('i')); c.el.append(wk); } wk.firstChild.style.width = (c.work.t / c.work.dur) * 100 + '%'; } else if (wk) wk.remove();
      }
      for (const cl of clients) {
        const holder = chefs.find((c) => c.hold && c.hold.c === cl);
        if (holder) { cl.x = holder.x; cl.y = holder.y - 24; }
        else if (cl.where === 'queue') { cl.x = QUEUE[cl.spot].x; cl.y = QUEUE[cl.spot].y; }
        cl.el.style.left = cl.x + 'px'; cl.el.style.top = cl.y + 'px';
        cl.el.style.zIndex = holder ? 9 : 5;
      }
      raf = requestAnimationFrame(loop);
    }
    reset();
    raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); clearTimeout(toastT); };
  };
})();
