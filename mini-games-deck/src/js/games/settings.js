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
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Календарь'), h('span', {}, 'Октябрь')));
      const cal = h('div', { class: 'cal' });
      ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach((d) => cal.append(h('b', {}, d)));
      for (let i = 0; i < 2; i++) cal.append(h('span'));
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
    let p = 42;
    function render() {
      body.innerHTML = '';
      body.style.padding = '0'; body.style.justifyContent = 'flex-start';
      const wrap = h('div', { style: { position: 'relative', width: '100%', flex: 1, overflow: 'hidden' } });
      wrap.append(h('img', { src: ASSETS.home_ui || ASSETS.home, style: { width: '100%', display: 'block' } }));
      const overlay = h('div', { style: { position: 'absolute', left: '10px', right: '10px', top: '58px', background: 'rgba(255,255,255,.94)', borderRadius: '16px', border: '1px solid var(--border)', padding: '8px 10px', display: 'flex', gap: '10px', alignItems: 'center' } });
      overlay.append(h('div', { html: flarik3d(p > 70 ? 'happy' : p > 40 ? 'wink' : 'sleepy', 54) }));
      overlay.append(h('div', { style: { flex: 1 } },
        h('b', { style: { fontSize: '13px' } }, 'Фларик сети'),
        h('div', { class: 'g-note', style: { textAlign: 'left', padding: 0 } }, 'Счётчик заданий всей сети, не твой личный.'),
        h('div', { class: 'prog', style: { marginTop: '4px' } }, h('i', { style: { width: p + '%' } }))));
      wrap.append(overlay);
      body.append(wrap);
      body.append(h('input', { type: 'range', class: 'slider', min: 0, max: 100, value: p, oninput: (e) => { p = +e.target.value; render(); } }));
      body.append(h('div', { class: 'g-note' }, 'На главной, над миссией. Движется от суммы выполненных заданий всех консультантов сети.'));
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
        body.append(h('div', { style: { margin: '20px auto', textAlign: 'center' }, html: flarik3d(EM[card][0], 140) }));
        body.append(h('b', {}, 'Карточка: ' + EM[card][1]));
        body.append(h('p', { class: 'g-note' }, 'Она уйдёт в профиль, в ряд из четырёх карточек.'));
        body.append(h('button', { class: 'btn pri', onclick: () => { got = card + 1; card = null; render(); } }, 'Положить в профиль'));
        return;
      }
      if (gift && !asked) {
        body.append(h('div', { html: flarik3d('happy', 130), style: { margin: '16px auto' } }));
        body.append(h('b', {}, 'Фларик принёс тебе подарок'));
        body.append(h('p', { class: 'g-note' }, 'Кнопка отправляет запрос в админку. Модератор создаёт подарок, он появляется в «Мои заказы» и ждёт оформления.'));
        body.append(h('button', { class: 'btn pri', onclick: () => { asked = true; render(); } }, 'Получить подарок'));
        return;
      }
      if (asked) {
        body.append(h('div', { class: 'card now', style: { width: '100%' } }, h('h4', {}, 'Запрос в админке'), h('div', {}, 'Подарок создан и начислен. Ждёт оформления в «Мои заказы».')));
      }
      body.append(h('div', { class: 'g-top' }, h('b', {}, 'Профиль'), h('span', {}, 'Майя')));
      body.append(h('div', { class: 'g-note' }, 'Четыре карточки под данными. Фларика в игре нажимаешь на нём самом, отдельной кнопки «нашла» нет.'));
      const row = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', width: '100%' } });
      EM.forEach((e, i) => row.append(h('div', { style: { border: '1.5px dashed var(--border2)', borderRadius: '12px', padding: '6px 2px', textAlign: 'center', background: i < got ? '#fff' : '#f5f0f3' } },
        i < got ? h('div', { html: flarik3d(e[0], 48) }) : h('div', { style: { height: '48px', color: 'var(--text3)' } }, '?'),
        h('small', { style: { fontSize: '10px' } }, e[1]))));
      body.append(row);
      if (got < 4 && !gift) body.append(h('div', { style: { marginTop: '12px', textAlign: 'center', cursor: 'pointer' }, onclick: () => { card = got; render(); }, html: flarik3d(EM[got][0], 80) + '<div class="g-note">Фларик выглянул из игры — нажми на него</div>' }));
      if (got === 4 && !gift) { gift = true; setTimeout(render, 400); }
      const nav = h('div', { class: 'btm' },
        h('span', {}, 'Главная'), h('span', {}, 'Гайды'), h('span', {}, 'Призы'), h('span', { class: 'on' }, 'Профиль'));
      body.append(nav);
    }
    render();
    return () => {};
  };
})();
