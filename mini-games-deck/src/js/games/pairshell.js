(function () {
  const { h, flarik3d } = Core;
  Games.pairshell = function (body) {
    let side = 'me', st = 'pick', stop = null;
    function render() {
      if (stop) { stop(); stop = null; }
      body.innerHTML = '';
      if (st === 'ok') {
        stop = Games.flasks(body, { pair: true });
        return;
      }
      const box = h('div', { class: 'invite' });
      body.append(box);
      box.append(h('div', { class: 'tabs' },
        h('button', { class: side === 'me' ? 'on' : '', onclick: () => { side = 'me'; render(); } }, 'Твой iPhone'),
        h('button', { class: side === 'fr' ? 'on' : '', onclick: () => { side = 'fr'; render(); } }, 'iPhone подруги')));
      if (side === 'me') mine(box); else hers(box);
    }
    function mine(box) {
      if (st === 'pick') {
        box.append(h('div', { html: flarik3d('wink', 120), style: { textAlign: 'center' } }));
        box.append(h('b', {}, 'Залей банку вдвоём'));
        box.append(h('p', { class: 'g-note', style: { textAlign: 'left' } }, 'Позови коллегу из своей сети. Так же можно открыть уход вдвоём.'));
        box.append(h('div', { class: 'person on' }, h('div', { class: 'ava' }, 'О'), h('div', {}, h('b', {}, 'Ольга'), h('br'), h('small', {}, 'Зелёное яблоко'))));
        box.append(h('button', { class: 'btn pri', onclick: () => { st = 'sent'; render(); } }, 'Позвать в игру'));
      } else if (st === 'sent') {
        box.append(h('div', { style: { textAlign: 'center', marginTop: '24px' }, html: flarik3d('happy', 120) }));
        box.append(h('b', {}, 'Ждём ответ'));
        box.append(h('p', { class: 'g-note' }, 'Открой iPhone подруги и нажми «Принять».'));
      } else {
        box.append(h('div', { html: flarik3d('sleepy', 110) }), h('b', {}, 'Подруга занята'));
        box.append(h('p', { class: 'g-note' }, 'Обычная миссия дня всё равно закрывается.'));
        box.append(h('button', { class: 'btn pri', onclick: () => { st = 'pick'; render(); } }, 'Позвать другую'));
      }
    }
    function hers(box) {
      if (st === 'sent') {
        box.append(h('div', { style: { textAlign: 'center', marginTop: '12px' }, html: flarik3d('wow', 120) }));
        box.append(h('b', {}, 'Тебя зовут в «Залей банку»'));
        box.append(h('p', { class: 'g-note' }, 'Ходите по очереди на одной доске. Награда {value} каждой.'));
        box.append(h('div', { class: 'row-btns', style: { justifyContent: 'center' } },
          h('button', { class: 'btn pri', onclick: () => { st = 'ok'; side = 'me'; render(); } }, 'Принять'),
          h('button', { class: 'btn', onclick: () => { st = 'no'; side = 'me'; render(); } }, 'Не сейчас')));
      } else box.append(h('p', { class: 'g-note' }, 'Сначала отправь приглашение со своего телефона.'));
    }
    render();
    return () => { if (stop) stop(); };
  };
})();
