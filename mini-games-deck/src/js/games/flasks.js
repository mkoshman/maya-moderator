(function () {
  const { h, PALETTE, productSVG, U } = Core;
  const KINDS = ['jar', 'bottle', 'tube', 'pump', 'spray'];

  Games.flasks = function (body, opt = {}) {
    const pair = !!opt.pair;
    const colors = PALETTE.slice(0, 4);
    let state, sel, moves, turn, busy, hist, timers = [], dead = false;

    const later = (fn, ms) => { const t = setTimeout(() => { if (!dead) fn(); }, ms); timers.push(t); };

    function fresh() {
      let flasks;
      do {
        const units = U.shuffle([].concat(...colors.map((_, i) => [i, i, i, i])));
        flasks = [0, 1, 2, 3].map((i) => units.slice(i * 4, i * 4 + 4));
        flasks.push([], []);
      } while (flasks.some((f) => f.length && f.every((x) => x === f[0])));
      return flasks;
    }
    const done = (f) => f.length === 4 && f.every((x) => x === f[0]);

    function reset() {
      state = fresh(); sel = null; moves = 0; turn = 'me'; busy = false; hist = [];
      render();
    }

    function canPour(a, b) {
      const A = state[a], B = state[b];
      if (a === b || !A.length || done(A) || B.length >= 4) return 0;
      if (B.length && B[B.length - 1] !== A[A.length - 1]) return 0;
      let run = 0;
      for (let i = A.length - 1; i >= 0 && A[i] === A[A.length - 1]; i--) run++;
      return Math.min(run, 4 - B.length);
    }
    function pour(a, b) {
      const n = canPour(a, b);
      if (!n) return false;
      hist.push(JSON.stringify(state));
      for (let i = 0; i < n; i++) state[b].push(state[a].pop());
      moves++;
      return true;
    }
    const doneCount = () => state.filter(done).length;

    function bot() {
      let best = null, score = -1;
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) {
        const n = canPour(a, b);
        if (!n) continue;
        let sc = 0;
        if (state[b].length) sc = 10 + n; else if (new Set(state[a]).size > 1) sc = 3; else continue;
        if (sc > score) { score = sc; best = [a, b]; }
      }
      if (best) pour(best[0], best[1]);
      turn = 'me'; busy = false;
      render();
      check();
    }

    function check() {
      if (doneCount() === 4) {
        later(() => Core.result(body, {
          win: true,
          text: pair ? 'Вы собрали все банки вместе. Ходов на двоих: ' + moves : 'Все банки собраны за ' + moves + ' ходов.',
          onRetry: reset,
        }), 500);
      }
    }

    function tap(i) {
      if (busy || turn !== 'me') return;
      if (sel == null) {
        if (state[i].length && !done(state[i])) { sel = i; render(); }
        return;
      }
      if (sel === i) { sel = null; render(); return; }
      const ok = pour(sel, i);
      sel = null;
      if (!ok) { render(); return; }
      render();
      check();
      if (pair && doneCount() < 4) {
        turn = 'friend'; busy = true; render();
        later(bot, 1100);
      }
    }

    function undo() {
      if (!hist.length || busy) return;
      state = JSON.parse(hist.pop()); moves = Math.max(0, moves - 1); sel = null; render();
    }

    function flaskEl(f, i) {
      const el = h('div', { class: 'fl' + (sel === i ? ' sel' : ''), onclick: () => tap(i) });
      el.append(h('div', { class: 'lip' }));
      const glass = h('div', { class: 'glass' });
      if (done(f)) {
        const c = colors[f[0]];
        glass.append(h('div', { class: 'seg', style: { background: c.c, height: '100%', opacity: .25 } }));
        const d = h('div', { class: 'done' });
        d.append(h('div', { html: productSVG(KINDS[f[0] % KINDS.length], c.c, 54) }), h('small', {}, c.name));
        glass.append(d);
      } else {
        f.forEach((c) => glass.append(h('div', { class: 'seg', style: { background: colors[c].c } })));
      }
      el.append(glass);
      return el;
    }

    function render() {
      body.innerHTML = '';
      body.append(h('div', { class: 'g-top' },
        h('span', {}, 'Собрано банок: ', h('b', {}, doneCount() + ' / 4')),
        pair
          ? h('span', { class: 'role ' + (turn === 'me' ? 'me' : '') }, turn === 'me' ? 'Твой ход' : 'Ходит подруга…')
          : h('span', {}, 'Ходов: ', h('b', {}, moves))));
      body.append(h('div', { class: 'g-note' }, 'Нажми на колбу, потом на колбу, куда перелить. Переливать можно на такой же цвет или в пустую. Когда колба полная одного цвета, она превращается в банку продукта.'));
      const grid = h('div', { class: 'flasks' });
      state.forEach((f, i) => grid.append(flaskEl(f, i)));
      body.append(grid);
      body.append(h('div', { class: 'row-btns' },
        h('button', { class: 'btn sm', onclick: undo }, '↶ Шаг назад'),
        h('button', { class: 'btn sm', onclick: reset }, 'Заново')));
    }

    reset();
    return () => { dead = true; timers.forEach(clearTimeout); };
  };
})();
