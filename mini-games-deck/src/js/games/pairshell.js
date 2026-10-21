(function () {
  const { h, flarik } = Core;
  const FRIENDS = [['А', 'Алина', 'Лэтуаль, ТЦ рядом'], ['О', 'Ольга', 'Мила'], ['К', 'Карина', 'Зелёное яблоко']];
  const GAMES = ['Колбы вдвоём', 'Уход вдвоём', 'Смена вдвоём'];

  Games.pairshell = function (body) {
    let side = 'me', st = 'pick', friend = 0, game = 0;

    function render() {
      body.innerHTML = '';
      body.style.padding = '0';
      const box = h('div', { class: 'mini' });
      body.append(box);
      box.append(h('div', { class: 'tabs' },
        h('button', { class: side === 'me' ? 'on' : '', onclick: () => { side = 'me'; render(); } }, 'Мой телефон'),
        h('button', { class: side === 'fr' ? 'on' : '', onclick: () => { side = 'fr'; render(); } }, 'Телефон подруги')));
      if (side === 'me') mine(box); else hers(box);
    }
    function mine(box) {
      if (st === 'pick') {
        box.append(h('b', {}, 'Позови подругу в парную игру'), h('div', { class: 'g-note', style: { textAlign: 'left', padding: 0 } }, 'Выбери коллегу из своей сети и игру. Ей придёт приглашение.'));
        FRIENDS.forEach((f, i) => box.append(h('div', { class: 'person' + (i === friend ? ' on' : ''), onclick: () => { friend = i; render(); } }, h('div', { class: 'ava' }, f[0]), h('div', {}, h('b', {}, f[1]), h('br'), h('small', { style: { color: 'var(--muted)' } }, f[2])))));
        box.append(h('div', { class: 'tabs', style: { flexWrap: 'wrap' } }, GAMES.map((g, i) => h('button', { class: i === game ? 'on' : '', onclick: () => { game = i; render(); } }, g))));
        box.append(h('button', { class: 'btn pri', onclick: () => { st = 'sent'; render(); } }, 'Позвать ' + FRIENDS[friend][1]));
      } else if (st === 'sent') {
        box.append(h('div', { style: { textAlign: 'center', marginTop: '40px' } }, h('div', { class: 'bob', html: flarik('wink', 90) }), h('b', {}, 'Ждём ответ от ' + FRIENDS[friend][1]), h('p', { class: 'g-note' }, 'Приглашение отправлено. Переключись на «Телефон подруги», чтобы ответить за неё.')));
      } else if (st === 'ok') {
        box.append(h('div', { style: { textAlign: 'center', marginTop: '30px' } }, h('div', { class: 'bob', html: flarik('happy', 90) }), h('b', {}, FRIENDS[friend][1] + ' согласилась'), h('p', { class: 'g-note' }, 'Играете: ' + GAMES[game] + '. Награду {value} 🌸 получает каждая из вас, когда вы вместе проходите игру.'), h('button', { class: 'btn pri', onclick: () => { st = 'pick'; render(); } }, 'Заново')));
      } else if (st === 'no') {
        box.append(h('div', { style: { textAlign: 'center', marginTop: '30px' } }, h('div', { html: flarik('sleepy', 90) }), h('b', {}, FRIENDS[friend][1] + ' пока занята'), h('p', { class: 'g-note' }, 'Ничего страшного: можно позвать другую коллегу или сыграть позже. Обычное задание дня ты выполняешь в любом случае.'), h('button', { class: 'btn pri', onclick: () => { st = 'pick'; render(); } }, 'Позвать другую')));
      }
    }
    function hers(box) {
      if (st === 'sent') {
        box.append(h('div', { style: { textAlign: 'center', marginTop: '30px' } }, h('div', { class: 'bob', html: flarik('wow', 90) }), h('b', {}, 'Коллега из сети зовёт тебя играть'), h('p', { class: 'g-note' }, GAMES[game] + '. Игра на двоих, вам нужно работать вместе.'),
          h('div', { class: 'row-btns', style: { justifyContent: 'center' } }, h('button', { class: 'btn pri', onclick: () => { st = 'ok'; side = 'me'; render(); } }, 'Принять'), h('button', { class: 'btn', onclick: () => { st = 'no'; side = 'me'; render(); } }, 'Не сейчас'))));
      } else box.append(h('div', { class: 'g-note', style: { marginTop: '40px' } }, 'Приглашений пока нет. Сначала позови подругу на вкладке «Мой телефон».'));
    }
    render();
    return () => {};
  };
})();
