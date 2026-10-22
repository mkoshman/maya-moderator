(function () {
  const { h, flarik3d } = Core;
  Games.pairshell = function (body) {
    let side = 'me', st = 'pick';
    function render() {
      body.innerHTML = '';
      const box = h('div', { class: 'mini' });
      body.append(box);
      box.append(h('div', { class: 'tabs' },
        h('button', { class: side === 'me' ? 'on' : '', onclick: () => { side = 'me'; render(); } }, 'Твой iPhone'),
        h('button', { class: side === 'fr' ? 'on' : '', onclick: () => { side = 'fr'; render(); } }, 'iPhone подруги')));
      if (side === 'me') mine(box); else hers(box);
    }
    function mine(box) {
      if (st === 'pick') {
        box.append(h('b', {}, 'Залей банку вдвоём'));
        box.append(h('p', { class: 'g-note', style: { textAlign: 'left' } }, 'Из мини-игры можно позвать коллегу. Точно так же можно сделать «Уход вдвоём» — это не отдельная оболочка, а режим той же игры.'));
        box.append(h('div', { class: 'person on' }, h('div', { class: 'ava' }, 'О'), h('div', {}, h('b', {}, 'Ольга'), h('br'), h('small', {}, 'Зелёное яблоко'))));
        box.append(h('button', { class: 'btn pri', onclick: () => { st = 'sent'; render(); } }, 'Позвать в игру'));
      } else if (st === 'sent') {
        box.append(h('div', { style: { textAlign: 'center', marginTop: '24px' }, html: flarik3d('wink', 100) }));
        box.append(h('b', {}, 'Ждём ответ'));
        box.append(h('p', { class: 'g-note' }, 'Переключись на iPhone подруги и прими приглашение.'));
      } else if (st === 'ok') {
        box.append(h('p', { class: 'g-note' }, 'Ольга в игре. Ходите по очереди.'));
        const host = h('div', { style: { flex: 1, width: '100%', minHeight: '360px' } });
        box.append(host);
        setTimeout(() => Games.flasks(host, { pair: true }), 0);
      } else {
        box.append(h('div', { html: flarik3d('sleepy', 90) }), h('b', {}, 'Подруга занята'), h('button', { class: 'btn pri', onclick: () => { st = 'pick'; render(); } }, 'Позвать другую'));
      }
    }
    function hers(box) {
      if (st === 'sent') {
        box.append(h('div', { style: { textAlign: 'center', marginTop: '20px' }, html: flarik3d('wow', 90) }));
        box.append(h('b', {}, 'Тебя зовут в «Залей банку»'));
        box.append(h('p', { class: 'g-note' }, 'Игра на двоих. Ходы общие, награда {value} 🌸 каждой.'));
        box.append(h('div', { class: 'row-btns', style: { justifyContent: 'center' } },
          h('button', { class: 'btn pri', onclick: () => { st = 'ok'; side = 'me'; render(); } }, 'Принять'),
          h('button', { class: 'btn', onclick: () => { st = 'no'; side = 'me'; render(); } }, 'Не сейчас')));
      } else box.append(h('p', { class: 'g-note' }, 'Сначала отправь приглашение со своего телефона.'));
    }
    render();
    return () => {};
  };
})();
