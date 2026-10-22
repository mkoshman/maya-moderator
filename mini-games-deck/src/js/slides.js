(function () {
  const { h, U } = Core;
  Games.flasks2 = (b) => Games.flasks(b, { pair: true });
  Games.head2 = (b) => Games.head(b, { pair: true });

  const ALL_GAMES = [...CATALOG.filter((g) => !g.layer), ...PAIR.filter((g) => !g.shell)];
  const ul = (items, tag = 'ul') => h(tag, {}, items.map((x) => h('li', {}, x)));
  const card = (cls, title, content) => h('div', { class: 'card ' + cls }, h('h4', {}, title), content);
  const p = (...a) => h('p', {}, ...a);

  function phone(opts) {
    const screen = h('div', { class: 'phone-screen' });
    const wrap = h('div', { class: 'phone-wrap' }, h('div', { class: 'phone' }, screen));
    const body = Core.phoneApp(screen, opts);
    return { wrap, body };
  }
  function mountGame(e, extra = {}) {
    const ph = phone({ title: e.name, sub: e.family, reward: !(e.layer || e.shell) });
    let cleanup = null, dead = false;
    setTimeout(() => { if (!dead) cleanup = Games[e.game](ph.body); }, 0);
    return { el: ph.wrap, cleanup: () => { dead = true; if (cleanup) cleanup(); } };
  }

  function gameSlide(e, kind) {
    return {
      id: e.id, sec: kind, title: e.name, play: true,
      render(root) {
        const m = mountGame(e);
        root.append(h('div', { class: 'slide' }, h('div', { class: 'split' },
          h('div', {},
            h('div', {}, h('span', { class: 'pill' }, e.family), e.tag ? h('span', { class: 'pill a' }, e.tag) : null, h('span', { class: 'pill g' }, 'можно играть справа')),
            h('h2', { style: { marginTop: '8px' } }, (e.icon || '') + ' ' + e.name),
            card('', 'Цель', p(e.goal)),
            card('', 'Механика', ul(e.how, 'ol'))),
          m.el)));
        return m.cleanup;
      },
    };
  }

  function divider(n, title, text, sec) {
    return { id: 'd' + n, sec, title, render(root) { root.append(h('div', { class: 'slide divider' }, h('div', { class: 'num' }, n), h('h1', {}, title), h('p', { class: 'lead' }, text))); } };
  }

  /* ---------- начало ---------- */
  const S = [];
  S.push({
    id: 'title', sec: 'Старт', title: 'Flario Game', side: true, render(root) {
      root.append(h('div', { class: 'slide hero' },
        h('img', { src: ASSETS.logo, style: { height: '72px' } }),
        h('h1', {}, 'Новые форматы геймификации для Flario Game'),
        h('p', { class: 'lead' }, 'Все наши наработки в одном месте. В каждую мини-игру можно сыграть прямо на слайде. Сначала игры для одной, потом игры на двоих, потом идеи к дню рождения и Новому году, потом настройки приложения и в конце как всё это живёт в приложении.'),
        h('p', {}, h('span', { class: 'pill' }, 'Готовила: Майя Кошман'), h('span', { class: 'pill' }, 'Для: Анна Гучетль, Марина Алейникова')),
        h('p', { class: 'kbd' }, 'Листай стрелками на клавиатуре или кнопками внизу. Слева содержание.')));
    },
  });
  S.push({
    id: 'catalog', sec: 'Старт', title: 'Все форматы', side: true, render(root) {
      const t = (e) => h('div', { class: 'tile', onclick: () => go(e.id) }, h('b', {}, (e.icon || '') + ' ' + e.name), h('span', {}, e.family || e.tag || ''));
      root.append(h('div', { class: 'slide' }, h('h2', {}, 'Все форматы на одной странице'), p('Нажми карточку — откроется игра в рамке iPhone. Миссия дня, ситуативка, видео, инвайт и обучение не меняем.'),
        h('h3', {}, 'Одиночные'), h('div', { class: 'grid c3' }, CATALOG.map(t)),
        h('h3', {}, 'На двоих'), h('div', { class: 'grid c3' }, PAIR.filter((x) => x.id === 'pairshell' || x.id === 'spa').map(t)),
        h('h3', {}, 'Праздники'), h('div', { class: 'grid c3' }, [
          { id: 'school', name: 'Подарки в школе Flario', family: 'Новый год / ДР' },
          { id: 'tree', name: 'Найди на ёлке', family: 'Новый год' },
          { id: 'clock', name: 'Двенадцать ударов', family: 'Новый год' },
          { id: 'garland', name: 'Гирлянда декабря', family: 'Ежедневный вход' },
        ].map(t)),
        h('h3', {}, 'Календарь, заметки, Фларик сети'), h('div', { class: 'grid c3' }, [
          { id: 'cal', name: 'Календарь', family: 'Таб в кабинете' },
          { id: 'notes', name: 'Заметки', family: 'Окно в профиле' },
          { id: 'net', name: 'Фларик сети', family: 'Главная' },
        ].map(t))));
    },
  });

  /* ---------- одиночные ---------- */
  CATALOG.forEach((e) => S.push(gameSlide(e, 'Игры')));

  /* ---------- вдвоём ---------- */
  PAIR.filter((e) => e.id === 'pairshell' || e.id === 'spa').forEach((e) => S.push(gameSlide(e, 'Игры')));

  const holiday = [
    { id:'school', game:'school', name:'Подарки в школе Flario', family:'Праздник',
      goal:'Найти подарки в зале школы Flario.',
      how:['Зал нарисован: чёрные полки, дверь, ступени, диван.','Десять подарков лежат в этом пространстве.','Нашла все — победа.'],
      now:['Картинка школы с метками в ситуативке.'],
      future:'Тот же экран поиска, что «Найди на картинке», только фон — школа Flario.',
      miss:['Фото школы в админке.','Экран поиска.'], risk:'Нужно несколько ракурсов, чтобы не повторяться.' },
    { id:'tree', game:'tree', name:'Найди на ёлке', family:'Праздник',
      goal:'Узнать банки Limba и Tashe среди игрушек.',
      how:['Ёлка на весь экран, банки сидят в ветках.','Нажимаешь, когда узнала продукт.','Десять банок — ёлка собрана.'],
      now:['Картинка ёлки и вопрос «какой продукт не найден».'],
      future:'Поиск по картинке с мокапами из базы.',
      miss:['Иллюстрация ёлки.','Привязка SKU.'], risk:'Мелкие банки на тёмном фоне плохо читаются, нужны контрастные блики.' },
    { id:'clock', game:'clock', name:'Двенадцать ударов', family:'Праздник',
      goal:'Закрыть 12 обязательных шагов ухода нашими продуктами до конца года.',
      how:['Часы бьют двенадцать раз.','На каждом ударе три карточки продуктов. Нажимаешь нужную.','Ошибка сбрасывает. Смыва в списке нет.'],
      now:['Ситуативка на 12 шагов без картинок банок.'],
      future:'Игровой экран часов + выбор из трёх мокапов.',
      miss:['Экран.','12 шагов в карточке задания.'], risk:'Длиннее обычной мини-игры — ставить в отдельный день, не в сдвоенный слот.' },
    { id:'garland', game:'garland', name:'Гирлянда декабря', family:'Вход',
      goal:'Поддержать ежедневный вход. Лампочка за каждый день, когда консультант зашла.',
      how:['Гирлянда висит на главной.','31 лампочка. Зашла сегодня — зажглась.','Пропуск не штрафуем.'],
      now:['Если есть факт «последний вход», счётчик можно показать картинкой. Нужно уточнить у разработки.'],
      future:'Гирлянда на главной или в профиле в декабре.',
      miss:['Событие входа.','Виджет гирлянды.'], risk:'Не обещать награду за «31 из 31», иначе те, кто пропустил день, бросят.' },
  ];
  holiday.forEach((e) => S.push(gameSlide(e, 'Игры')));

  const SET = [
    { id: 'cal', game: 'calendar', name: 'Календарь', title: 'Календарь', sub: 'Отдельный таб', pill: 'Таб',
      text: ['Не выбор «смена/выходной».','На день — свои события: название и время.','Объёмным Флариком отмечены активности из календаря проекта (как октябрь: презентация, миссия недели, чёрная пятница).','Нажал на день — видишь список.'],
      now: 'Даты проекта уже живут в контент-плане. Свои события нужно хранить на пользователя.',
      miss: ['Таб «Календарь».','Форма «название + время».','Подгрузка активностей месяца.'] },
    { id: 'notes', game: 'notes', name: 'Заметки', title: 'Заметки', sub: 'Профиль', pill: 'Профиль',
      text: ['Окно в профиле, не отдельный таб навигации.','Точка — сделала.','Смахнуть влево — удалить в корзину.'],
      now: 'Нужно только хранить текст и галочку на пользователя.',
      miss: ['Окно в профиле.','Свайп-удаление.'] },
    { id: 'net', game: 'network', name: 'Фларик сети', title: 'Фларик сети', sub: 'Главная', pill: 'Главная',
      text: ['Это не личный прогресс и не прогресс магазина. Это счётчик, сколько заданий закрыла вся сеть.','Живёт на главной, рядом с балансом и миссией.','Чем выше общий счёт, тем живее объёмный Фларик.'],
      now: 'Если задания пишутся по сотруднику, сумму по сети можно посчитать без новой игры.',
      miss: ['Сумма по сети.','Блок на главной.'] },
  ];
  SET.forEach((e) => S.push({
    id: e.id, sec: 'Игры', title: e.title, play: true,
    render(root) {
      const ph = phone({ title: e.name, sub: e.sub, reward: false });
      let cl = null, dead = false; setTimeout(() => { if (!dead) cl = Games[e.game](ph.body); }, 0);
      root.append(h('div', { class: 'slide' }, h('div', { class: 'split' },
        h('div', {}, h('span', { class: 'pill' }, e.pill), h('h2', { style: { marginTop: '8px' } }, e.name),
          card('', 'Как это работает', ul(e.text))),
        ph.wrap)));
      return () => { dead = true; if (cl) cl(); };
    },
  }));

  /* совместимость */
  const famOf = (g) => g.family.replace('Вдвоём: тяжёлая', 'Спа').replace('Вдвоём: приглашение', 'Приглашение');
  function rule(a, b) {
    if (a === b) return ['self', '·', ''];
    const pairA = !!PAIR.includes(a), pairB = !!PAIR.includes(b);
    if (pairA && pairB) return ['no', '✕', 'Парная игра одна в неделю: в выходной слот.'];
    if (a.family === b.family && ['Разложить', 'Уход'].includes(a.family)) return ['no', '✕', 'Из семьи «' + a.family + '» только одна игра в неделю.'];
    if (a.family === b.family && ['Аркада', 'Найти'].includes(a.family)) return ['mid', '~', 'Можно, но лучше развести по разным неделям: похожий ритм.'];
    return ['ok', '✓', 'Хорошо сочетаются.'];
  }
  S.push({
    id: 'compat', sec: 'План', title: 'Какие игры в одну неделю', side: true,
    render(root) {
      root.append(h('div', { class: 'slide compat' }, h('h2', {}, 'Какие игры можно ставить в одну неделю'),
        p('Миссия дня каждый день. Мини-игра — максимум одна в день. «Вместе» значит в одну календарную неделю, не в один экран.'),
        h('p', { class: 'row ok' }, 'Всегда можно рядом с любой игрой: миссия дня, ситуативка, видео, инвайт, обучение, секрет Фларика, календарь, заметки, Фларик сети. Они не занимают слот мини-игры.'),
        h('p', { class: 'row no' }, 'Не ставить в одну неделю две игры «разложить»: Залей банку, Три в руке, Попади в корзину. Мозг устаёт от одной и той же логики «разложи по местам».'),
        h('p', { class: 'row no' }, 'Парную игру («Залей банку вдвоём» или «Салон») — одну в неделю и только в субботу или воскресенье. Если подруга не ответила, обычная миссия дня всё равно закрывается.'),
        h('p', { class: 'row mid' }, '«Большая банка» и «Пролети кольцо» обе быстрые и на реакцию. Можно, но лучше не в соседние дни.'),
        h('p', { class: 'row mid' }, '«Собери слова» и «Нажми по порядку» не ставим в первый день гайда: консультант ещё не читала продукт.'),
        h('p', { class: 'row ok' }, 'Хорошая неделя: вторник — кнопки или поиск, четверг — другая семья, выходной — парная или ничего.')));
    },
  });
  S.push({
    id: 'planner', sec: 'План', title: 'Собрать неделю', side: true,
    render(root) {
      const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const opts = [{ id: '', name: 'только миссия' }, ...CATALOG.filter((g) => !g.layer).map((g) => ({ id: g.id, name: g.name })), { id: 'pairshell', name: 'Залей банку вдвоём' }, { id: 'spa', name: 'Салон' }];
      const plan = Array(7).fill('');
      const checks = h('div');
      function run() {
        const used = plan.map((id) => opts.find((o) => o.id === id && id));
        const list = used.filter(Boolean);
        const out = [];
        const add = (ok, t) => out.push(h('div', { class: 'chk ' + (ok ? 'ok' : 'bad') }, (ok ? 'Можно. ' : 'Так нельзя. ') + t));
        const n = new Set(list.map((g) => g.id)).size;
        add(n === 0 || (n >= 2 && n <= 3), n ? ('В неделе ' + n + ' разных игр. Норма — две или три.') : 'Пока стоят только миссии.');
        add(list.filter((g) => ['flasks', 'pyramid', 'baskets'].includes(g.id)).length <= 1, 'Игр «разложи» не больше одной.');
        add(list.filter((g) => g.id === 'spa').length <= 1, 'Салон — максимум раз.');
        const pi = used.map((g, i) => (g && (g.id === 'pairshell' || g.id === 'spa') ? i : -1)).filter((i) => i >= 0);
        add(pi.length <= 1 && pi.every((i) => i >= 5), 'Парная — одна и только в сб/вс.');
        add(!(plan[0] === 'words' || plan[0] === 'steps'), 'В понедельник (первый день гайда) нет слов и кнопок.');
        add(plan.every((x, i) => !x || x !== plan[i - 1]), 'Одна игра не идёт два дня подряд.');
        checks.innerHTML = ''; checks.append(...out);
      }
      function cardDay(d, i) {
        const chips = h('div', { class: 'chips' });
        opts.forEach((o) => chips.append(h('button', { class: plan[i] === o.id ? 'on' : '', onclick: () => { plan[i] = o.id; render(); } }, o.name)));
        return h('div', { class: 'daycard' }, h('b', {}, d), chips);
      }
      function render() {
        root.innerHTML = '';
        const week = h('div', { class: 'week' }, days.map((d, i) => cardDay(d, i)));
        root.append(h('div', { class: 'slide' }, h('h2', {}, 'Собрать неделю'),
          p('Нажми чип в дне. Миссия дня и так будет каждый день — её выбирать не надо. Справа проверка сразу говорит, можно так или нет.'),
          week, h('div', { class: 'row-btns' }, h('button', { class: 'btn sm', onclick: () => { ['','steps','','find','','pairshell',''].forEach((v,i)=>plan[i]=v); render(); } }, 'Пример рабочей недели'), h('button', { class: 'btn sm', onclick: () => { plan.fill(''); render(); } }, 'Очистить')),
          checks));
        run();
      }
      render();
    },
  });
  S.push({
    id: 'order', sec: 'План', title: 'Порядок внедрения', side: true,
    render(root) {
      root.append(h('div', { class: 'slide' }, h('h2', {}, 'Порядок внедрения'),
        p('Это не «от простого к сложному для консультанта». Это то, что реально дешевле строить первым, потому что опирается на уже существующие экраны.'),
        card('now', 'Можно брать в разработку, не дожидаясь игрового движка', ul(['Нажми по порядку — это подсветка кнопок, без физики.', 'Найди на картинке / школа / ёлка — одна и та же механика «тап по точке».', 'Гирлянда и Фларик сети — счётчики, если вход и задания уже пишутся в базу.', 'Календарь и заметки — формы в профиле, не игры.'])),
        card('', 'Имеет смысл вторым слоем: нужен экран игры и картинки банок из базы', ul(['Залей банку — переливание и мокапы.', 'Собери слова — круг и филворд.', 'Попади в корзину, Три в руке.'])),
        card('future', 'Откладывать, пока нет времени на физику и два телефона', ul(['Большая банка и Пролети кольцо — падение и коллизии. 50 преград, банка меняется каждые 10.', 'Уход как симулятор — волосы и тапы.', 'Салон — двое онлайн.', 'Секрет Фларика — слой во всех играх + админка подарка.']))));
    },
  });
  S.push({
    id: 'final', sec: 'План', title: 'Что брать в разработку', side: true,
    render(root) {
      root.append(h('div', { class: 'slide' }, h('img', { src: ASSETS.logo, style: { height: '56px' } }), h('h1', {}, 'Что брать в разработку'),
        card('now', 'Брать сейчас', ul(['Календарь (событие: название + время + активности месяца с объёмным Флариком)', 'Заметки в профиле (точка и свайп-удаление)', 'Фларик сети на главной как счётчик сети', 'Нажми по порядку (подсказка играет, консультант повторяет)', 'Найди на картинке на фото острова Flario Laboratory'])),
        card('', 'Брать следом, когда будет тип задания «игра» и мокапы из базы', ul(['Залей банку', 'Собери слова', 'Попади в корзину', 'Гирлянда декабря на ежедневный вход'])),
        card('future', 'Не обещать сроки без оценки разработки', ul(['Большая банка, Пролети кольцо, Три в руке, Уход-симулятор, Салон, Секрет Фларика с запросом в админку'])),
        p('Миссия дня, ситуативка, видео, инвайт и обучение остаются. Награды — «Молодец! +{value} 🌸», суммы не выдумываем.')));
    },
  });

  window.SLIDES = S;
  window.ALL_GAMES = ALL_GAMES;

  /* ---------- движок ---------- */
  const stage = document.getElementById('stage');
  const side = document.getElementById('side');
  let cur = -1, cleanup = null;
  function go(target) {
    const i = typeof target === 'number' ? target : S.findIndex((s) => s.id === target);
    if (i < 0 || i >= S.length) return;
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    stage.innerHTML = '';
    cur = i;
    const r = S[i].render(stage);
    cleanup = typeof r === 'function' ? r : null;
    stage.scrollTop = 0;
    location.hash = S[i].id;
    document.querySelectorAll('#side a').forEach((a) => a.classList.toggle('on', a.dataset.id === S[i].id));
    const on = document.querySelector('#side a.on'); if (on) on.scrollIntoView({ block: 'nearest' });
    document.querySelector('#bar .grow i').style.width = ((i + 1) / S.length) * 100 + '%';
    document.querySelector('#bar .cnt').textContent = (i + 1) + ' / ' + S.length;
    document.querySelector('#bar .prev').disabled = i === 0;
    document.querySelector('#bar .next').disabled = i === S.length - 1;
  }
  window.go = go;

  function buildSide() {
    side.innerHTML = '';
    side.append(h('div', { class: 'brand' }, h('img', { src: ASSETS.logo, style: { height: '36px' } })));
    S.filter((s) => s.side).forEach((s) => {
      side.append(h('a', { 'data-id': s.id, onclick: () => go(s.id) }, s.title));
    });
  }
  function fit() {
    const hh = window.innerHeight - 56 - 28;
    document.documentElement.style.setProperty('--s', Math.min(1, hh / 820).toFixed(3));
  }
  window.addEventListener('resize', fit); fit();
  buildSide();
  document.querySelector('#bar .prev').onclick = () => go(cur - 1);
  document.querySelector('#bar .next').onclick = () => go(cur + 1);
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') go(cur + 1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(cur - 1);
  });
  window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id && S[cur] && S[cur].id !== id) go(id); });
  go(location.hash.slice(1) || 0);
})();
