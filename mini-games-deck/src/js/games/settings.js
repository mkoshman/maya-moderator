(function () {
  const { h, flarik3d, volFlarik } = Core;
  const EVENTS = {
    5: [{ t: '10:00', n: 'Рассылка ссылки на приложение' }, { t: '18:00', n: 'Презентация Flario Game' }, { t: '19:00', n: 'Анонс в ТГ' }],
    7: [{ t: '12:00', n: 'Бонусное задание' }, { t: '19:00', n: 'Рассказываем про механику' }],
    10: [{ t: '18:00', n: 'Бьюти-посиделки' }],
    12: [{ t: '10:00', n: 'Миссия недели' }],
    15: [{ t: '12:00', n: 'Бонус за рефералов' }, { t: '19:00', n: 'Рефералка в ТГ' }],
    16: [{ t: '12:00', n: 'Задание по сериалу' }, { t: '19:00', n: 'ИИ-сериал' }],
    19: [{ t: '10:00', n: 'Миссия недели' }],
    21: [{ t: '12:00', n: 'Идея для ивента' }],
    23: [{ t: '12:00', n: 'Опрос' }, { t: '19:00', n: 'Истории ЧБД' }],
    24: [{ t: '12:00', n: 'Субботний чат' }],
    26: [{ t: '10:00', n: 'Миссия недели' }],
    28: [{ t: '12:00', n: 'День лёгких Флариков' }],
    30: [{ t: '12:00', n: 'Чёрная пятница' }],
  };

  Games.calendar = function (body) {
    let extra = {};
    let open = 5, form = false;
    function all(d) { return (EVENTS[d] || []).concat(extra[d] || []); }
    function render() {
      body.innerHTML = '';
      body.style.justifyContent = 'flex-start';
      body.append(h('div', { class: 'month-head' }, h('b', {}, 'Октябрь 2026'), h('span', {}, '1-е — четверг')));
      const cal = h('div', { class: 'cal' });
      ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach((d) => cal.append(h('b', {}, d)));
      for (let i = 0; i < 3; i++) cal.append(h('span'));
      for (let d = 1; d <= 31; d++) {
        const has = all(d).length;
        cal.append(h('button', { class: d === open ? 'sh' : '', onclick: () => { open = d; form = false; render(); } },
          d, has ? h('span', { class: 'ev', html: volFlarik(12) }) : null));
      }
      body.append(cal);
      const list = all(open);
      body.append(h('b', { style: { marginTop: '8px', alignSelf: 'flex-start' } }, open + ' октября'));
      if (!list.length) body.append(h('div', { class: 'g-note' }, 'Событий нет. Добавь своё — название и время.'));
      list.forEach((e) => body.append(h('div', { class: 'note' }, h('span', {}, e.t + ' · ' + e.n))));
      if (form) {
        const name = h('input', { class: 'in', placeholder: 'Название: смена, учёба, встреча' });
        const time = h('input', { class: 'in', placeholder: 'Время, например 18:00' });
        body.append(h('div', { class: 'form' }, name, time, h('button', { class: 'btn pri sm', onclick: () => {
          if (!name.value.trim()) return;
          extra[open] = extra[open] || [];
          extra[open].push({ t: time.value.trim() || '—', n: name.value.trim() });
          form = false; render();
        } }, 'Сохранить')));
      } else body.append(h('button', { class: 'btn pri sm', style: { marginTop: '8px' }, onclick: () => { form = true; render(); } }, 'Добавить событие'));
      body.append(h('div', { class: 'g-note' }, 'Объёмный Фларик на дне — активность из календаря проекта. Свои события вводишь названием и временем. Это отдельный таб.'));
    }
    render();
    return () => {};
  };

  Games.notes = function (body) {
    let notes = [
      { t: 'Спросить про акцию на стойке', d: false },
      { t: 'Повторить шаги маски Instant Transformation', d: true },
    ];
    function render() {
      body.innerHTML = '';
      body.style.justifyContent = 'flex-start';
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Заметки в профиле'), h('span', { class: 'pill g' }, 'только ты')));
      const inp = h('textarea', { class: 'in', rows: 2, placeholder: 'Новая заметка' });
      body.append(inp, h('button', { class: 'btn pri sm', style: { alignSelf: 'flex-end', margin: '6px 0' }, onclick: () => { if (inp.value.trim()) { notes.unshift({ t: inp.value.trim(), d: false }); render(); } } }, 'Добавить'));
      notes.forEach((n, i) => {
        const inner = h('div', { class: 'inner' });
        const row = h('div', { class: 'note', style: { width: '100%' } },
          h('button', { class: 'btn sm', style: { minWidth: '28px', padding: '2px 6px' }, onclick: () => { n.d = !n.d; render(); } }, n.d ? '●' : '○'),
          h('span', { style: { textDecoration: n.d ? 'line-through' : 'none', flex: 1 } }, n.t));
        const del = h('div', { class: 'del', onclick: () => { notes.splice(i, 1); render(); } }, '🗑');
        inner.append(row, del);
        const wrap = h('div', { class: 'swipe' });
        wrap.append(inner);
        let x0 = 0;
        wrap.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
        wrap.addEventListener('pointerup', (e) => {
          if (x0 - e.clientX > 40) inner.style.transform = 'translateX(-72px)';
          else inner.style.transform = 'translateX(0)';
        });
        body.append(wrap);
      });
      body.append(h('div', { class: 'g-note' }, 'Точка — сделала. Смахни влево и нажми корзину, чтобы удалить. Окно открывается из профиля.'));
    }
    render();
    return () => {};
  };

  Games.network = function (body) {
    let p = 18;
    function stage(v) {
      if (v < 25) return 'бутон';
      if (v < 55) return 'раскрывается';
      if (v < 80) return 'почти расцвёл';
      return 'расцвёл';
    }
    function render() {
      body.innerHTML = '';
      body.style.padding = '0';
      body.style.justifyContent = 'flex-start';
      const wrap = h('div', { class: 'home-layer bloom-home' });
      wrap.append(h('img', { src: ASSETS.home_ui || ASSETS.home, alt: '' }));
      const scale = 0.34 + (p / 100) * 0.9;
      const hero = h('div', { class: 'bloom' });
      hero.append(h('div', { class: 'bloom-fl', style: { transform: `scale(${scale})` }, html: Core.flarik3d(p > 80 ? 'happy' : p > 45 ? 'wink' : 'sleepy', 180) }));
      if (p > 60) {
        hero.append(h('i', { class: 'spark', style: { left: '18%', top: '22%' } }));
        hero.append(h('i', { class: 'spark', style: { right: '16%', top: '30%' } }));
        hero.append(h('i', { class: 'spark', style: { left: '28%', bottom: '18%' } }));
      }
      const cap = h('div', { class: 'bloom-cap' },
        h('b', {}, 'Фларик сети'),
        h('span', {}, stage(p) + ' · ' + Math.round(p * 128) + ' заданий сети'));
      hero.append(cap);
      wrap.append(hero);
      body.append(wrap);
      body.append(h('input', { type: 'range', class: 'slider', min: 0, max: 100, value: p, oninput: (e) => { p = +e.target.value; render(); } }));
    }
    render();
    return () => {};
  };

  Games.secret = function (body) {
    const EM = [['wow', 'удивление'], ['love', 'радость'], ['wink', 'подмигивание'], ['happy', 'счастье']];
    let got = 0, card = null, gift = false, asked = false;
    function render() {
      body.innerHTML = '';
      body.style.justifyContent = 'flex-start';
      if (card != null && !gift) {
        body.append(h('div', { class: 'emo-card' }, h('div', { html: flarik3d(EM[card][0], 210) }), h('b', {}, EM[card][1])));
        body.append(h('p', { class: 'g-note' }, 'Карточка садится в профиль, в ряд из четырёх.'));
        body.append(h('button', { class: 'btn pri', onclick: () => { got = card + 1; card = null; render(); } }, 'Положить в профиль'));
        return;
      }
      if (gift && !asked) {
        body.append(h('div', { class: 'emo-card' }, h('div', { html: flarik3d('happy', 210) }), h('b', {}, 'Фларик принёс подарок')));
        body.append(h('p', { class: 'g-note' }, 'Кнопка отправляет запрос в админку. Подарок появится в «Мои заказы».'));
        body.append(h('button', { class: 'btn pri', onclick: () => { asked = true; render(); } }, 'Получить подарок'));
        return;
      }
      if (asked) {
        body.append(h('div', { class: 'card now', style: { width: '100%' } }, h('h4', {}, 'Запрос в админке'), h('div', {}, 'Подарок создан и начислен. Ждёт оформления в «Мои заказы».')));
      }
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Профиль'), h('span', {}, 'Майя')));
      body.append(h('div', { class: 'g-note' }, 'Четыре карточки под данными. Фларика в игре нажимаешь на нём самом, отдельной кнопки «нашла» нет.'));
      const row = h('div', { class: 'emo-row' });
      EM.forEach((e, i) => row.append(h('div', { class: 'emo-slot' + (i < got ? ' got' : '') },
        i < got ? h('div', { html: flarik3d(e[0], 72) }) : h('div', { class: 'empty' }, ''),
        h('small', {}, e[1]))));
      body.append(row);
      if (got < 4 && !gift) body.append(h('button', { class: 'peek', onclick: () => { card = got; render(); } }, h('div', { html: flarik3d(EM[got][0], 96) }), h('span', {}, 'Фларик выглянул. Нажми на него')));
      if (got === 4 && !gift) { gift = true; setTimeout(render, 400); }
      const nav = h('div', { class: 'btm' },
        h('span', {}, 'Главная'), h('span', {}, 'Гайды'), h('span', {}, 'Призы'), h('span', { class: 'on' }, 'Профиль'));
      body.append(nav);
    }
    render();
    return () => {};
  };
})();
