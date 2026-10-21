(function () {
  const { h, flarik } = Core;

  Games.calendar = function (body) {
    const days = Array(31).fill(0);
    [1, 2, 4, 5, 8, 9, 11, 12].forEach((d) => { days[d - 1] = 1; });
    const EV = { 1: 'Старт продукта месяца', 15: 'Неделя парных игр', 28: 'Итоги месяца и подарки' };
    let msg = 'Нажимай на день: смена, выходной, пусто.';
    function render() {
      body.innerHTML = '';
      body.style.justifyContent = 'flex-start';
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Мои смены'), h('span', {}, 'Сеть: Зелёное яблоко')));
      const cal = h('div', { class: 'cal' });
      ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach((d) => cal.append(h('b', {}, d)));
      for (let i = 0; i < 2; i++) cal.append(h('span'));
      days.forEach((v, i) => {
        const d = i + 1;
        cal.append(h('button', {
          class: v === 1 ? 'sh' : v === 2 ? 'off' : '',
          onclick: () => {
            days[i] = (days[i] + 1) % 3;
            msg = EV[d] ? '🌸 ' + d + '-е: ' + EV[d] : 'День ' + d + ': ' + ['пусто', 'моя смена', 'выходной'][days[i]];
            render();
          },
        }, d, EV[d] ? h('span', { class: 'ev' }, '🌸') : null));
      });
      body.append(cal);
      body.append(h('div', { class: 'g-note', style: { marginTop: '10px', fontSize: '13px', color: 'var(--text)' } }, msg));
      body.append(h('div', { class: 'g-note' }, 'Смены ставишь сама. Розовым цветком отмечены важные события Фларио. Заданий дня в календаре нет, они живут на главной.'));
      body.append(h('div', { class: 'g-top', style: { marginTop: 'auto' } }, h('span', {}, 'Смен в месяце: ', h('b', {}, days.filter((x) => x === 1).length))));
    }
    render();
    return () => {};
  };

  Games.notes = function (body) {
    let notes = ['Вспомнить про новый уход у стойки', 'Спросить про акцию на следующей неделе'];
    function render() {
      body.innerHTML = '';
      body.style.justifyContent = 'flex-start';
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Мои заметки'), h('span', { class: 'pill g' }, 'видишь только ты')));
      const inp = h('textarea', { class: 'in', rows: 2, placeholder: 'Что записать?' });
      body.append(inp, h('button', { class: 'btn pri sm', style: { margin: '8px 0', alignSelf: 'flex-end' }, onclick: () => { if (inp.value.trim()) { notes.unshift(inp.value.trim()); render(); } } }, 'Добавить'));
      const list = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', overflow: 'auto' } });
      notes.forEach((n, i) => list.append(h('div', { class: 'note' }, h('span', {}, n), h('button', { onclick: () => { notes.splice(i, 1); render(); }, title: 'Удалить' }, '✕'))));
      if (!notes.length) list.append(h('div', { class: 'g-note' }, 'Заметок пока нет.'));
      body.append(list);
    }
    render();
    return () => {};
  };

  Games.network = function (body) {
    let p = 55;
    const STAGES = [
      [0, 'sleepy', 'Фларик спит', .8],
      [20, 'wink', 'Фларик приоткрыл глаз', .9],
      [40, 'happy', 'Фларик проснулся', 1],
      [60, 'wow', 'Фларик машет всей сети', 1.08],
      [80, 'love', 'Фларик танцует', 1.15],
    ];
    function render() {
      const st = [...STAGES].reverse().find((s) => p >= s[0]);
      body.innerHTML = '';
      body.style.justifyContent = 'flex-start';
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Главная'), h('span', {}, 'Сеть: Зелёное яблоко')));
      body.append(h('div', { style: { margin: '22px 0 8px', transform: 'scale(' + st[3] + ')', transition: '.3s' }, class: p >= 80 ? 'bob' : '', html: flarik(st[1], 150) }));
      body.append(h('b', { style: { color: 'var(--crimson-dark)' } }, st[2]));
      body.append(h('div', { class: 'prog', style: { width: '85%', height: '14px', margin: '10px 0 4px' } }, h('i', { style: { width: p + '%' } })));
      body.append(h('div', { class: 'g-note' }, 'Заданий выполнила вся сеть: {N} из {цель месяца}'));
      body.append(h('input', { type: 'range', class: 'slider', min: 0, max: 100, value: p, style: { width: '85%' }, oninput: (e) => { p = +e.target.value; render(); } }));
      body.append(h('div', { class: 'g-note' }, 'Двигай ползунок и смотри, как Фларик оживает. В жизни его двигает общий счёт заданий всех консультантов сети.'));
    }
    render();
    return () => {};
  };

  Games.secret = function (body) {
    const EM = [['wow', 'удивление'], ['love', 'радость'], ['wink', 'подмигивание'], ['happy', 'счастье']];
    let got = 0, played = false, avail = false;
    function render() {
      body.innerHTML = '';
      body.style.justifyContent = 'flex-start';
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Секрет Фларика'), h('span', {}, 'Неделя ' + Math.min(4, got + 1) + ' из 4')));
      const cards = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', width: '100%' } });
      EM.forEach((e, i) => cards.append(h('div', { style: { border: '2px dashed var(--border2)', borderRadius: '14px', padding: '8px 2px', textAlign: 'center', background: i < got ? '#fff' : 'var(--surface-soft)' } },
        i < got ? h('div', { html: flarik(e[0], 52) }) : h('div', { style: { fontSize: '28px', lineHeight: '52px', color: 'var(--text3)' } }, '?'),
        h('small', { style: { fontSize: '10px', color: 'var(--muted)' } }, i < got ? e[1] : 'неделя ' + (i + 1)))));
      body.append(cards);
      if (played) {
        body.append(h('div', { class: 'bob', style: { marginTop: '16px' }, html: flarik('happy', 120) }), h('b', { style: { color: 'var(--crimson-dark)' } }, 'Фларик принёс подарок!'));
      } else {
        body.append(h('div', { class: 'g-note', style: { marginTop: '12px' } }, 'Раз в неделю Фларик прячется в одной из игр недели. Если ты его заметила и нажала, открывается карточка с эмоцией. Четыре эмоции за месяц, и Фларик оживает с подарком.'));
      }
      if (avail) body.append(h('div', { class: 'card now', style: { width: '100%', margin: '10px 0 0' } }, h('h4', {}, 'Профиль → Мои заказы'), h('div', {}, 'Доступно: подарок от Фларика')));
      body.append(h('div', { class: 'row-btns', style: { marginTop: 'auto' } },
        got < 4 ? h('button', { class: 'btn pri sm', onclick: () => { got++; if (got === 4) { played = true; setTimeout(() => { avail = true; render(); }, 1600); } render(); } }, 'Неделя ' + (got + 1) + ': нашла Фларика') : null,
        h('button', { class: 'btn sm', onclick: () => { got = 0; played = false; avail = false; render(); } }, 'Заново')));
    }
    render();
    return () => {};
  };
})();
