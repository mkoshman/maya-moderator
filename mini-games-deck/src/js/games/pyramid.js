(function () {
  const { h, U, icon } = Core;
  const TYPES = ['bank', 'drop', 'smear', 'foam', 'spray', 'pipette', 'cap', 'components'];
  const SIZES = [8, 6, 5, 3, 2];
  const TW = 40, TH = 50, STEP = 34;

  Games.pyramid = function (body) {
    let tiles, hand, undos, over, timers = [], dead = false;
    const later = (fn, ms) => timers.push(setTimeout(() => !dead && fn(), ms));

    function layout() {
      const out = [];
      SIZES.forEach((n, layer) => {
        for (let i = 0; i < n; i++) {
          out.push({ layer, x: 170 + (i - (n - 1) / 2) * (TW + 2) - TW / 2, y: 215 - layer * STEP, gone: false, type: null });
        }
      });
      return out;
    }
    const overlap = (a, b) => {
      const w = Math.min(a.x + TW, b.x + TW) - Math.max(a.x, b.x);
      const hh = Math.min(a.y + TH, b.y + TH) - Math.max(a.y, b.y);
      return w > 0 && hh > 0 ? w * hh : 0;
    };
    const covered = (t, list) => list.some((u) => !u.gone && u.layer > t.layer && overlap(t, u) > TW * TH * 0.12);

    function build() {
      for (let attempt = 0; attempt < 300; attempt++) {
        const ts = layout();
        const rest = new Set(ts);
        const types = U.shuffle(TYPES);
        let ok = true, k = 0;
        while (rest.size) {
          const arr = [...rest];
          const free = arr.filter((t) => !arr.some((u) => u.layer > t.layer && overlap(t, u) > TW * TH * 0.12));
          if (free.length < 3) { ok = false; break; }
          const three = U.shuffle(free).slice(0, 3);
          const ty = types[k++ % types.length];
          three.forEach((t) => { t.type = ty; rest.delete(t); });
        }
        if (ok) return ts;
      }
      return layout().map((t, i) => ({ ...t, type: TYPES[i % 8] }));
    }

    function reset() {
      tiles = build(); hand = []; undos = 3; over = false;
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      render();
    }

    function tap(t) {
      if (over || t.gone || covered(t, tiles) || hand.length >= 5) return;
      t.gone = true; hand.push(t);
      render();
      const same = hand.filter((x) => x.type === t.type);
      if (same.length >= 3) {
        over = true;
        later(() => {
          hand = hand.filter((x) => x.type !== t.type);
          over = false;
          render();
          if (!tiles.some((x) => !x.gone) && !hand.length) {
            over = true;
            later(() => Core.result(body, { win: true, text: 'Пирамидка разобрана полностью.', onRetry: reset }), 300);
          }
        }, 350);
      } else if (hand.length >= 5) {
        over = true;
        later(() => Core.result(body, { win: false, title: 'Рука заполнена', text: 'Пять карт на руках, а тройки нет. Попробуй ещё раз.', onRetry: reset }), 400);
      }
    }
    function undo() {
      if (over || !undos || !hand.length) return;
      const t = hand.pop(); t.gone = false; undos--; render();
    }

    function render() {
      body.innerHTML = '';
      const left = tiles.filter((t) => !t.gone).length;
      body.append(h('div', { class: 'g-top' }, h('span', {}, 'Осталось карт: ', h('b', {}, left)), h('span', {}, 'Возвратов: ', h('b', {}, undos))));
      const pyr = h('div', { class: 'pyr' });
      tiles.forEach((t) => {
        if (t.gone) return;
        const cov = covered(t, tiles);
        const el = h('button', { class: 'tl ' + (cov ? 'cov' : 'free'), style: { left: t.x + 'px', top: t.y + 'px', zIndex: t.layer + 1 }, onclick: () => tap(t), html: icon(t.type, 28) });
        pyr.append(el);
      });
      body.append(pyr);
      const hd = h('div', { class: 'hand' });
      for (let i = 0; i < 5; i++) hd.append(h('div', { class: 'sl' + (hand[i] ? ' f' : ''), html: hand[i] ? icon(hand[i].type, 30) : '' }));
      body.append(hd, h('div', { class: 'row-btns' }, h('button', { class: 'btn sm', onclick: undo }, '↶ Вернуть карту'), h('button', { class: 'btn sm', onclick: reset }, 'Заново')));
      body.append(h('div', { class: 'g-note' }, 'Бери только открытые карты (с розовой рамкой). Три одинаковые в руке исчезают. Рука на 5 мест, не переполни её.'));
    }

    reset();
    return () => { dead = true; timers.forEach(clearTimeout); };
  };
})();
