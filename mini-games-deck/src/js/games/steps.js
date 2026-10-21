(function () {
  const { h, U } = Core;

  const GUIDES = {
    mask: {
      tab: 'Маска',
      title: 'Instant Transformation Mask',
      steps: ['Вымой голову шампунем', 'Убери излишки влаги полотенцем', 'Нанеси 2–4 нажатия по длине', 'Оставь на 3 минуты, не смывая', 'Приступай к укладке'],
    },
    peel: {
      tab: 'Пилинг',
      title: 'Refreshing Exfoliation',
      steps: ['Вымой голову шампунем', 'Нанеси пилинг на влажную кожу головы по проборам', 'Оставь на 5–15 минут', 'Тщательно смой'],
    },
    shampoo: {
      tab: 'Шампунь',
      title: 'Multiuse Shampoo',
      steps: ['Нанеси небольшое количество на мокрые волосы и кожу головы', 'Вспень массажными движениями', 'Тщательно смой', 'При необходимости повтори'],
    },
  };

  Games.steps = function (body) {
    let key = 'mask';
    let timers = [], dead = false;

    function play() {
      const g = GUIDES[key];
      let idx = 0, over = false;
      body.innerHTML = '';
      body.append(h('div', { class: 'tabs' }, Object.entries(GUIDES).map(([k, v]) =>
        h('button', { class: k === key ? 'on' : '', onclick: () => { key = k; play(); } }, v.tab))));
      body.append(h('div', { class: 'g-top' }, h('span', {}, 'Как наносить ' + g.title), h('b', {}, 'одна попытка')));
      const seq = h('div', { class: 'seq' }, g.steps.map((_, i) => h('i', {}, i + 1)));
      body.append(seq);
      const list = h('div', { class: 'stp' });
      U.shuffle(g.steps.map((t, i) => ({ t, i }))).forEach((o) => {
        const b = h('button', {}, o.t);
        b.onclick = () => {
          if (over || b.classList.contains('ok')) return;
          if (o.i === idx) {
            b.classList.add('ok'); seq.children[idx].classList.add('f'); idx++;
            if (idx === g.steps.length) {
              over = true;
              timers.push(setTimeout(() => !dead && Core.result(body, { win: true, text: 'Порядок верный, всё как в гайде.', onRetry: play }), 600));
            }
          } else {
            over = true; b.classList.add('bad', 'shake');
            [...list.children].forEach((x) => { x.disabled = true; });
            timers.push(setTimeout(() => !dead && Core.result(body, { win: false, title: 'Не тот шаг', text: 'Это не следующий шаг по гайду. В приложении попытка одна, в презентации можно сыграть снова.', onRetry: play }), 700));
          }
        };
        list.append(b);
      });
      body.append(list, h('div', { class: 'g-note' }, 'Нажимай шаги по порядку. Подсказок нет, ошибся и игра закончилась.'));
    }
    play();
    return () => { dead = true; timers.forEach(clearTimeout); };
  };
  Games.steps.GUIDES = GUIDES;
})();
