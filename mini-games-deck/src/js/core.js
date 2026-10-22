(function () {
  const NS = 'http://www.w3.org/2000/svg';
  function mk(ns, tag, attrs, kids) {
    const e = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.setAttribute('class', v);
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    const add = (c) => {
      if (c == null || c === false) return;
      if (Array.isArray(c)) c.forEach(add);
      else e.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
    };
    kids.forEach(add);
    return e;
  }
  const h = (t, a, ...k) => mk(null, t, a, k);
  const s = (t, a, ...k) => mk(NS, t, a, k);

  const U = {
    h, s,
    rand: (a, b) => a + Math.random() * (b - a),
    ri: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    svgURL: (str) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str),
  };

  const PALETTE = [
    { c: '#5aa02c', name: 'Multiuse Shampoo', id: 'lmb05' },
    { c: '#8b5fbf', name: 'Refreshing Exfoliation', id: 'lmb57' },
    { c: '#d4005f', name: 'Instant Transformation', id: 'lmb56' },
    { c: '#c9a227', name: 'Recharging Elixir', id: 'lmb43' },
  ];
  const PRODUCTS = [
    { id: 'lmb101', name: 'Dry Shampoo', vol: '12–40 г', cat: 'Очищение', color: '#8aa3b5', img: 'lmb101' },
    { id: 'lmb43', name: 'Recharging Elixir', vol: 'масло', cat: 'Несмываемый', color: '#c9a227', img: 'lmb43' },
    { id: 'lmb87', name: 'Glance spray', vol: '120 мл', cat: 'Несмываемый', color: '#d4005f', img: 'lmb87' },
    { id: 'lmb42', name: 'Protein Thermal Spray', vol: '200 мл', cat: 'Несмываемый', color: '#3b82c4', img: 'lmb42' },
    { id: 'lmb44', name: 'Total Revitalizer', vol: '300 мл', cat: 'Несмываемый', color: '#af004e', img: 'lmb44' },
    { id: 'lmb56', name: 'Hyaluronic mask', vol: '245 г', cat: 'Увлажнение', color: '#d4005f', img: 'lmb56' },
    { id: 'lmb05', name: 'Multiuse Shampoo', vol: '300 мл', cat: 'Очищение', color: '#5aa02c', img: 'lmb05' },
    { id: 'tsh97', name: 'Tashe Rosemary Mask', vol: 'маска', cat: 'Увлажнение', color: '#6b8f3a', img: 'tsh97' },
    { id: 'tsh95', name: 'Tashe 500 мл', vol: '500 мл', cat: 'Очищение', color: '#3d6b2e', img: 'tsh95' },
    { id: 'tsh14', name: 'Tashe 1000 мл', vol: 'до 1000 мл', cat: 'Очищение', color: '#2f5a28', img: 'tsh14' },
  ];
  const img = (k, w) => `<img src="${(window.ASSETS || {})[k] || ''}" alt="" style="width:${w || 48}px;height:auto;display:block;margin:0 auto;pointer-events:none">`;
  function volFlarik(size = 36) {
    const src = (window.ASSETS || {}).flarik || '';
    return `<img src="${src}" alt="" width="${size}" height="${size}" style="object-fit:contain">`;
  }
  function flarik3d(emo, size = 90) {
    const faces = {
      happy: '<path d="M30 62q20 16 40 0" stroke="#7e0038" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="36" cy="44" r="5"/><circle cx="64" cy="44" r="5"/>',
      wow: '<ellipse cx="50" cy="64" rx="7" ry="9" fill="#7e0038"/><circle cx="36" cy="42" r="6"/><circle cx="64" cy="42" r="6"/>',
      love: '<path d="M36 50l-6-6a4 4 0 016-6l2 2 2-2a4 4 0 016 6zM64 50l-6-6a4 4 0 016-6l2 2 2-2a4 4 0 016 6z" fill="#af004e"/>',
      wink: '<circle cx="36" cy="44" r="5"/><path d="M54 44q8-8 16 0" stroke="#7e0038" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M32 62q18 12 36 0" stroke="#7e0038" stroke-width="5" fill="none"/>',
      sleepy: '<path d="M32 46h12M56 46h12" stroke="#7e0038" stroke-width="4" stroke-linecap="round"/><path d="M40 64h20" stroke="#7e0038" stroke-width="4" stroke-linecap="round"/>',
    };
    const face = emo ? `<svg class="emo" viewBox="0 0 100 100" width="${Math.round(size * .32)}" height="${Math.round(size * .32)}">${faces[emo] || faces.happy}</svg>` : '';
    return `<span class="flarik-face" style="width:${size}px;height:${size}px">${volFlarik(size)}${face}</span>`;
  }

  function flarik(emotion = 'happy', size = 64) {
    return flarik3d(emotion, size);
  }

  function productSVG(kind, color, size = 64) {
    const lid = '#7e0038';
    const body = {
      jar: `<rect x="14" y="30" width="36" height="30" rx="7" fill="${color}"/><rect x="12" y="20" width="40" height="12" rx="4" fill="${lid}"/><rect x="20" y="40" width="24" height="12" rx="3" fill="#fff" opacity=".85"/>`,
      tube: `<path d="M20 8h24l-3 46H23z" fill="${color}"/><rect x="22" y="54" width="20" height="8" rx="2" fill="${lid}"/><rect x="25" y="22" width="14" height="16" rx="2" fill="#fff" opacity=".85"/>`,
      bottle: `<rect x="18" y="22" width="28" height="40" rx="8" fill="${color}"/><rect x="26" y="10" width="12" height="13" rx="2" fill="${lid}"/><rect x="22" y="34" width="20" height="16" rx="3" fill="#fff" opacity=".85"/>`,
      spray: `<rect x="20" y="26" width="24" height="36" rx="7" fill="${color}"/><rect x="28" y="16" width="8" height="11" fill="${lid}"/><rect x="24" y="8" width="18" height="8" rx="3" fill="${lid}"/><rect x="24" y="36" width="16" height="14" rx="3" fill="#fff" opacity=".85"/>`,
      pump: `<rect x="16" y="26" width="32" height="36" rx="8" fill="${color}"/><rect x="29" y="12" width="6" height="15" fill="${lid}"/><rect x="22" y="6" width="22" height="7" rx="3" fill="${lid}"/><rect x="22" y="36" width="20" height="16" rx="3" fill="#fff" opacity=".85"/>`,
      dropper: `<circle cx="32" cy="12" r="8" fill="${lid}"/><rect x="28" y="19" width="8" height="38" rx="3" fill="${color}" opacity=".9"/><path d="M29 57h6l-3 6z" fill="${color}"/>`,
    }[kind];
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  }

  const ICONS = {
    bank: '<rect x="5" y="9" width="14" height="11" rx="3"/><rect x="4" y="4" width="16" height="5" rx="2"/>',
    drop: '<path d="M12 3c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z"/>',
    smear: '<path d="M3 15c3-6 6 4 9-2s6 4 9-2" /><path d="M3 20c3-6 6 4 9-2s6 4 9-2"/>',
    foam: '<circle cx="8" cy="14" r="4"/><circle cx="16" cy="12" r="5"/><circle cx="12" cy="6" r="3"/>',
    spray: '<rect x="7" y="9" width="9" height="12" rx="2"/><path d="M10 9V5h4v4M17 4l3-1M17 6h3M17 8l3 1"/>',
    pipette: '<circle cx="12" cy="5" r="3"/><path d="M10 8h4v10l-2 3-2-3z"/>',
    cap: '<path d="M3 17a9 9 0 0118 0z"/><path d="M3 20h18"/>',
    components: '<path d="M12 3l7 4v8l-7 4-7-4V7z"/><circle cx="12" cy="11" r="2"/>',
    aromas: '<path d="M7 20c-3-4 3-6 0-10s3-6 0-8M14 20c-3-4 3-6 0-10s3-6 0-8"/>',
  };
  function icon(name, size = 26, color = '#af004e', fill = 'none') {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${fill}" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  }

  const ITEMS = {
    mask: ['Баночка маски', '<rect x="8" y="16" width="24" height="18" rx="4" fill="#d4005f"/><rect x="7" y="10" width="26" height="7" rx="3" fill="#7e0038"/><rect x="13" y="22" width="14" height="7" rx="2" fill="#fff"/>'],
    spray: ['Спрей', '<rect x="13" y="18" width="14" height="18" rx="3" fill="#3b82c4"/><rect x="17" y="10" width="6" height="8" fill="#7e0038"/><rect x="14" y="5" width="13" height="5" rx="2" fill="#7e0038"/>'],
    tube: ['Шампунь', '<path d="M12 5h16l-2 29H14z" fill="#5aa02c"/><rect x="14" y="34" width="12" height="5" rx="1" fill="#7e0038"/><rect x="16" y="14" width="8" height="10" fill="#fff"/>'],
    pipette: ['Пипетка', '<circle cx="20" cy="8" r="6" fill="#af004e"/><rect x="17" y="13" width="6" height="20" rx="2" fill="#bfe3ee"/><path d="M18 33h4l-2 5z" fill="#bfe3ee"/>'],
    cap: ['Термошапка', '<path d="M5 27A15 15 0 0135 27z" fill="#d4005f"/><rect x="4" y="27" width="32" height="5" rx="2" fill="#7e0038"/>'],
    elixir: ['Эликсир', '<rect x="12" y="15" width="16" height="22" rx="5" fill="#e8a33d"/><rect x="16" y="9" width="8" height="7" fill="#7e0038"/><rect x="15" y="22" width="10" height="9" rx="2" fill="#fff"/>'],
    comb: ['Расчёска', '<rect x="4" y="14" width="32" height="7" rx="3" fill="#8b5fbf"/><path d="M8 21v8M13 21v8M18 21v8M23 21v8M28 21v8M33 21v8" stroke="#8b5fbf" stroke-width="2.5" stroke-linecap="round"/>'],
    towel: ['Полотенце', '<rect x="7" y="9" width="26" height="24" rx="3" fill="#fff" stroke="#af004e" stroke-width="2"/><path d="M7 16h26M7 26h26" stroke="#ffb3d3" stroke-width="4"/>'],
    dryer: ['Фен', '<rect x="5" y="9" width="23" height="13" rx="6" fill="#444"/><rect x="26" y="12" width="8" height="7" rx="2" fill="#888"/><rect x="13" y="20" width="8" height="15" rx="3" fill="#444"/>'],
    scissors: ['Ножницы', '<path d="M12 4l14 22M28 4L14 26" stroke="#666" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="31" r="5" fill="none" stroke="#af004e" stroke-width="3"/><circle cx="28" cy="31" r="5" fill="none" stroke="#af004e" stroke-width="3"/>'],
  };
  function itemSVG(id, size = 36) {
    return `<svg viewBox="0 0 40 40" width="${size}" height="${size}">${ITEMS[id][1]}</svg>`;
  }

  function phoneApp(mount, opts) {
    mount.innerHTML = '';
    const body = h('div', { class: 'app-body' });
    mount.append(
      h('div', { class: 'app-bar' },
        h('span', { class: 'app-back' }, '‹'),
        h('div', { class: 'app-title' }, h('b', {}, opts.title), opts.sub ? h('small', {}, opts.sub) : null),
        opts.reward === false ? null : h('span', { class: 'chip', html: '+{value} ' + volFlarik(16) })),
      body);
    return body;
  }

  function result(body, o) {
    const old = body.querySelector('.overlay');
    if (old) old.remove();
    const ov = h('div', { class: 'overlay ' + (o.win ? 'win' : 'lose') });
    ov.append(h('div', { class: 'bob', html: flarik3d(o.win ? 'happy' : 'sleepy', 120) }));
    ov.append(h('h3', {}, o.win ? (o.title || 'Молодец! +{value} 🌸') : (o.title || 'Не получилось')));
    if (o.text) ov.append(h('p', {}, o.text));
    if (o.onRetry) ov.append(h('button', { class: 'btn pri', onclick: () => { ov.remove(); o.onRetry(); } }, o.retryLabel || 'Сыграть ещё раз'));
    body.append(ov);
    return ov;
  }

  window.Core = { U, h, s, PALETTE, PRODUCTS, img, volFlarik, flarik3d, flarik, productSVG, icon, ICONS, ITEMS, itemSVG, phoneApp, result, NS };
  window.Games = {};
})();
