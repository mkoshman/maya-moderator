(function () {
  const { h, U, icon } = Core;
  const TYPES = ['bank', 'drop', 'smear', 'foam', 'spray', 'pipette', 'cap', 'components'];
  Games.pyramid = function (body) {
    let tiles, hand, undos, over, timers = [], dead = false;
    const later = (fn, ms) => timers.push(setTimeout(() => !dead && fn(), ms));
    const TW = 42, TH = 52;
    function layout() {
      const spots = [];
      // irregular pile, not rows of 3
      const coords = [
        [40, 210], [95, 225], [160, 218], [230, 230], [280, 200],
        [70, 165], [130, 150], [200, 168], [265, 145],
        [55, 110], [115, 95], [185, 108], [250, 90],
        [90, 55], [170, 48], [240, 58],
        [130, 18], [200, 12],
        [165, -8],
      ];
      coords.forEach(([x, y], i) => spots.push({ x, y, layer: Math.floor(i / 5), gone: false, type: null }));
      return spots;
    }
    const overlap = (a, b) => {
      const w = Math.min(a.x + TW, b.x + TW) - Math.max(a.x, b.x);
      const hh = Math.min(a.y + TH, b.y + TH) - Math.max(a.y, b.y);
      return w > 0 && hh > 0 ? w * hh : 0;
    };
    const covered = (t, list) => list.some((u) => !u.gone && ((u.y + 8 < t.y && overlap(t, u) > 80) || (u.layer > t.layer && overlap(t, u) > TW * TH * 0.1)));
    function build() {
      const ts = layout();
      ts.forEach((t, i) => { t.type = TYPES[i % 8]; t.layer = 10 - Math.floor(t.y / 24); });
      // make triples exist
      const types = U.shuffle(TYPES);
      ts.forEach((t, i) => { t.type = types[Math.floor(i / 3) % 8]; });
      return ts;
    }
    function reset() {
      tiles = build(); hand = []; undos = 3; over = false;
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
            over = true; later(() => Core.result(body, { win: true, text: 'Все карты разобраны.', onRetry: reset }), 300);
          }
        }, 320);
      } else if (hand.length >= 5) {
        over = true; later(() => Core.result(body, { win: false, title: 'Рука заполнена', text: 'Пять карт и нет тройки.', onRetry: reset }), 400);
      }
    }
    function render() {
      body.innerHTML = '';
      body.append(h('div', { class: 'g-top' }, h('span', {}, 'Карт: ', h('b', {}, tiles.filter((t) => !t.gone).length)), h('span', {}, 'Возвратов: ', h('b', {}, undos))));
      const pyr = h('div', { class: 'pyr', style: { height: '280px', width: '340px' } });
      tiles.forEach((t) => {
        if (t.gone) return;
        const cov = covered(t, tiles);
        pyr.append(h('button', { class: 'tl ' + (cov ? 'cov' : 'free'), style: { left: t.x + 'px', top: t.y + 12 + 'px', zIndex: t.layer }, onclick: () => tap(t), html: icon(t.type, 26) }));
      });
      const hd = h('div', { class: 'hand' });
      for (let i = 0; i < 5; i++) hd.append(h('div', { class: 'sl' + (hand[i] ? ' f' : ''), html: hand[i] ? icon(hand[i].type, 28) : '' }));
      body.append(pyr, hd, h('div', { class: 'row-btns' }, h('button', { class: 'btn sm', onclick: () => { if (!over && undos && hand.length) { const t = hand.pop(); t.gone = false; undos--; render(); } } }, '↶ Вернуть'), h('button', { class: 'btn sm', onclick: reset }, 'Заново')));
      body.append(h('div', { class: 'g-note' }, 'Карты лежат вразнобой, не рядами. Бери только открытые. Три одинаковые в руке исчезают.'));
    }
    reset();
    return () => { dead = true; timers.forEach(clearTimeout); };
  };
})();
