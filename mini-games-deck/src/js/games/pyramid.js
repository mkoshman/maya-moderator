(function () {
  const { h, U, PRODUCTS, img } = Core;
  const PRODS = [PRODUCTS[0], PRODUCTS[2], PRODUCTS[4], PRODUCTS[5], PRODUCTS[6], PRODUCTS[7]];

  Games.pyramid = function (body) {
    let tiles, hand, over, timers = [], dead = false;
    const later = (fn, ms) => timers.push(setTimeout(() => !dead && fn(), ms));
    const TW = 88, TH = 112;
    function layout() {
      const coords = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 3; c++) {
          coords.push([4 + c * 108 + (r % 2 ? 6 : 0), r * 56]);
        }
      }
      return coords.map(([x, y], i) => ({ x, y, gone: false, type: null, i }));
    }
    const overlap = (a, b) => {
      const w = Math.min(a.x + TW, b.x + TW) - Math.max(a.x, b.x);
      const hh = Math.min(a.y + TH, b.y + TH) - Math.max(a.y, b.y);
      return w > 12 && hh > 20;
    };
    const covered = (t, list) => list.some((u) => !u.gone && u.y + 20 < t.y && overlap(t, u));
    function build() {
      const ts = layout();
      const types = [];
      PRODS.forEach((_, i) => { types.push(i, i, i); });
      const order = U.shuffle(types);
      ts.forEach((t, i) => { t.type = order[i]; });
      return ts;
    }
    function reset() {
      tiles = build(); hand = []; over = false;
      const ov = body.querySelector('.overlay'); if (ov) ov.remove();
      render();
    }
    function tap(t) {
      if (over || t.gone || covered(t, tiles) || hand.length >= 5) return;
      t.gone = true; hand.push(t); render();
      const same = hand.filter((x) => x.type === t.type);
      if (same.length >= 3) {
        over = true;
        later(() => {
          hand = hand.filter((x) => x.type !== t.type); over = false; render();
          if (!tiles.some((x) => !x.gone) && !hand.length) {
            over = true; later(() => Core.result(body, { win: true, text: 'Все карточки продуктов разобраны.', onRetry: reset }), 300);
          }
        }, 280);
      } else if (hand.length >= 5) {
        over = true; later(() => Core.result(body, { win: false, title: 'Рука заполнена', text: 'Пять карт и нет тройки одного продукта.', onRetry: reset }), 400);
      }
    }
    function cardFace(type) {
      const p = PRODS[type];
      return h('div', { class: 'face' }, h('div', { html: img(p.img, 62) }), h('b', {}, p.name));
    }
    function render() {
      body.innerHTML = '';
      body.append(h('div', { class: 'g-top' }, h('span', {}, 'Карт: ', h('b', {}, tiles.filter((t) => !t.gone).length)), h('span', {}, 'В руке: ', h('b', {}, hand.length + ' / 5'))));
      const field = h('div', { class: 'field' });
      tiles.filter((t) => !t.gone).forEach((t) => {
        const free = !covered(t, tiles);
        const el = h('button', {
          class: 'pcard' + (free ? ' free' : ' cov'),
          style: { left: t.x + 'px', top: t.y + 'px' },
          onclick: () => tap(t),
        });
        el.append(cardFace(t.type));
        field.append(el);
      });
      body.append(field);
      const slots = h('div', { class: 'hand' });
      for (let i = 0; i < 5; i++) {
        const sl = h('div', { class: 'sl' + (hand[i] ? ' f' : '') });
        if (hand[i]) sl.append(cardFace(hand[i].type));
        slots.append(sl);
      }
      body.append(slots);
    }
    reset();
    return () => { dead = true; timers.forEach(clearTimeout); };
  };
})();
