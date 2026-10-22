(function () {
  const { flarik, itemSVG, icon } = Core;
  const frame = (title, inner, extra = '') => `<svg viewBox="0 0 220 340" xmlns="http://www.w3.org/2000/svg" font-family="Geologica, system-ui, sans-serif">
    <rect width="220" height="340" rx="22" fill="#faf7f9" stroke="#ddc9d5" stroke-width="2"/>
    <rect x="1" y="1" width="218" height="34" rx="21" fill="#fff"/><rect x="1" y="20" width="218" height="15" fill="#fff"/><path d="M1 35H219" stroke="#ecdde6"/>
    <text x="14" y="25" font-size="16" fill="#af004e">‹</text><text x="32" y="25" font-size="12" font-weight="700" fill="#1a1118">${title}</text>
    ${inner}${extra}</svg>`;
  const t = (x, y, s, o = '') => `<text x="${x}" y="${y}" font-size="${o.size || 10}" fill="${o.fill || '#7a5f70'}" text-anchor="${o.a || 'middle'}" font-weight="${o.w || 500}">${s}</text>`;

  const A = {};

  A.candles = () => {
    const xs = [60, 85, 110, 135, 160];
    const lab = ['Открой задание дня', 'Выполни его', 'Забери фларики', 'Загляни в профиль', 'Открой «Мои заказы»'];
    let g = `<rect x="30" y="150" width="160" height="70" rx="10" fill="#ffd9ea" stroke="#d4005f" stroke-width="2"/><path d="M30 170q20 14 40 0t40 0t40 0t40 0" fill="#fff" stroke="#d4005f" stroke-width="2"/><rect x="20" y="220" width="180" height="12" rx="6" fill="#af004e"/>`;
    xs.forEach((x, i) => {
      g += `<rect x="${x - 4}" y="112" width="8" height="38" rx="2" fill="${['#ffb3d3', '#fff', '#ffd9ea', '#fff', '#ffb3d3'][i]}" stroke="#af004e" stroke-width="1.5"/>
      <path d="M${x} 90q8 12 0 22q-8-10 0-22z" fill="${i < 2 ? '#bbb' : '#ffb300'}" opacity="${i < 2 ? .4 : 1}"/>
      <circle cx="${x}" cy="130" r="0"/>${t(x, 146, i + 1, { fill: '#7e0038', w: 700 })}`;
    });
    lab.forEach((l, i) => { g += t(24, 252 + i * 15, i + 1 + '. ' + l, { a: 'start', size: 10, fill: i < 2 ? '#27500a' : '#7a5f70' }); });
    g += t(110, 70, 'Задуй свечи по порядку', { size: 12, fill: '#7e0038', w: 700 });
    g += t(110, 56, 'как мы пользуемся приложением', { size: 9 });
    return frame('Задуй свечи', g);
  };

  A.gifts = () => {
    let g = '<rect x="1" y="35" width="218" height="304" fill="#f8eaf1"/><rect x="1" y="250" width="218" height="89" rx="0" fill="#e9d3de"/>';
    g += '<rect x="14" y="52" width="60" height="50" rx="4" fill="#cfe6f5" stroke="#b89aaa" stroke-width="3"/><rect x="100" y="60" width="106" height="8" fill="#b8896b"/><rect x="130" y="170" width="76" height="60" rx="6" fill="#d9b8c9"/><ellipse cx="90" cy="290" rx="70" ry="22" fill="#f1c6dc"/><rect x="20" y="170" width="50" height="80" rx="6" fill="#c7b8e8"/>';
    const boxes = [[40, 275, '#d4005f'], [180, 55, '#3b82c4'], [152, 160, '#5aa02c'], [48, 160, '#e8a33d'], [118, 292, '#8b5fbf'], [190, 220, '#d4005f'], [95, 72, '#5aa02c'], [30, 125, '#3b82c4'], [165, 270, '#e8a33d'], [78, 205, '#8b5fbf']];
    boxes.forEach(([x, y, c], i) => { g += `<g transform="translate(${x} ${y}) rotate(${i * 13 - 30})"><rect x="-9" y="-8" width="18" height="16" rx="2" fill="${c}"/><path d="M0 -8V8M-9 0H9" stroke="#fff" stroke-width="2.5"/><path d="M0 -8q-7-8-8-2q0 4 8 2q8 2 8-2q-1-6-8 2" fill="none" stroke="#fff" stroke-width="1.5"/></g>`; });
    g += '<g opacity=".9"><rect x="30" y="255" width="40" height="22" rx="4" fill="#cfd8e8"/><rect x="100" y="190" width="34" height="18" rx="4" fill="#f2c9a0"/></g>';
    g += `<rect x="12" y="44" width="70" height="0"/>`;
    g += `<rect x="70" y="40" width="80" height="0"/>`;
    g += `<rect x="62" y="40" width="96" height="16" rx="8" fill="#fff" stroke="#ecdde6"/>${t(110, 52, 'Найдено 3 из 10 · 0:32', { size: 9, fill: '#7e0038', w: 700 })}`;
    return frame('Подарки в комнате', g);
  };

  A.tree = () => {
    let g = '<rect x="1" y="35" width="218" height="304" fill="#14283d"/>';
    for (let i = 0; i < 24; i++) g += `<circle cx="${(i * 53) % 210 + 6}" cy="${(i * 37) % 280 + 42}" r="1.4" fill="#fff" opacity=".7"/>`;
    g += '<path d="M110 62l-60 90h30l-45 70h50l-35 55h120l-35-55h50l-45-70h30z" fill="#1f6b3a" stroke="#14502b" stroke-width="2"/><rect x="100" y="277" width="20" height="26" fill="#6b4226"/><path d="M110 50l5 10h11l-9 7 3 11-10-6-10 6 3-11-9-7h11z" fill="#ffd34d"/>';
    const pts = [[110, 110, '#d4005f'], [90, 150, '#3b82c4'], [135, 160, '#e8a33d'], [70, 200, '#8b5fbf'], [112, 205, '#d4005f'], [152, 212, '#3b82c4'], [95, 245, '#e8a33d'], [140, 250, '#8b5fbf'], [60, 255, '#d4005f'], [165, 255, '#e8a33d']];
    pts.forEach(([x, y, c], i) => { g += `<circle cx="${x}" cy="${y}" r="7" fill="${c}"/><circle cx="${x - 2}" cy="${y - 2}" r="2" fill="#fff" opacity=".7"/>`; });
    g += '<path d="M60 130q30 14 80 -4M45 190q60 24 120 -6M38 245q70 22 144 -2" stroke="#ffd34d" stroke-width="2" fill="none" stroke-dasharray="3 5"/>';
    g += `<rect x="30" y="311" width="160" height="20" rx="10" fill="#fff" opacity=".92"/>${t(110, 325, 'Найди 10 наших баночек на ёлке · 4/10', { size: 9, fill: '#7e0038', w: 700 })}`;
    g += '<g transform="translate(20 80)">' + itemSVG('mask', 28) + '</g><g transform="translate(168 120)">' + itemSVG('spray', 26) + '</g>';
    return frame('Найди 10 на ёлке', g);
  };

  A.clock = () => {
    let g = '<circle cx="110" cy="120" r="70" fill="#fff" stroke="#af004e" stroke-width="4"/>';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const on = i < 5;
      g += `<circle cx="${110 + Math.cos(a) * 55}" cy="${120 + Math.sin(a) * 55}" r="${i === 4 ? 9 : 7}" fill="${on ? '#af004e' : '#ffd9ea'}" stroke="#af004e" stroke-width="1.5"/>${t(110 + Math.cos(a) * 55, 124 + Math.sin(a) * 55, i + 1, { size: 9, fill: on ? '#fff' : '#7e0038', w: 700 })}`;
    }
    g += `<path d="M110 120L110 80" stroke="#7e0038" stroke-width="3" stroke-linecap="round"/><path d="M110 120L136 130" stroke="#7e0038" stroke-width="3" stroke-linecap="round"/><circle cx="110" cy="120" r="5" fill="#7e0038"/>`;
    g += t(110, 214, 'Удар 5 из 12', { size: 12, fill: '#7e0038', w: 700 });
    g += t(110, 232, 'Развилка: чем смываем год?', { size: 10 });
    g += `<rect x="14" y="244" width="94" height="52" rx="12" fill="#fff" stroke="#af004e" stroke-width="2"/>${t(61, 266, 'Пилинг', { size: 12, fill: '#7e0038', w: 700 })}${t(61, 282, 'на кожу головы', { size: 9 })}`;
    g += `<rect x="112" y="244" width="94" height="52" rx="12" fill="#fff" stroke="#ddc9d5" stroke-width="2"/>${t(159, 266, 'Маска', { size: 12, fill: '#7e0038', w: 700 })}${t(159, 282, 'для длины', { size: 9 })}`;
    g += t(110, 322, 'Выбор меняет следующий шаг', { size: 9 });
    return frame('Двенадцать ударов', g);
  };

  A.garland = () => {
    let g = '<rect x="1" y="35" width="218" height="304" fill="#fdf0f6"/>';
    const rows = 4, per = 8;
    for (let r = 0; r < rows; r++) {
      const y = 70 + r * 52;
      g += `<path d="M10 ${y}Q110 ${y + 26} 210 ${y}" stroke="#2b2b2b" stroke-width="2" fill="none"/>`;
      for (let i = 0; i < per; i++) {
        const k = r * per + i;
        if (k >= 31) break;
        const x = 18 + (i / (per - 1)) * 184;
        const yy = y + 26 * Math.sin((i / (per - 1)) * Math.PI) * 0.9 + 4;
        const lit = k < 17;
        const c = ['#d4005f', '#e8a33d', '#3b82c4', '#5aa02c'][k % 4];
        g += `<rect x="${x - 2}" y="${yy - 2}" width="4" height="7" fill="#444"/><circle cx="${x}" cy="${yy + 12}" r="8" fill="${lit ? c : '#d9ccd3'}" ${lit ? 'stroke="#fff" stroke-width="1.5"' : ''}/>${lit ? `<circle cx="${x}" cy="${yy + 12}" r="13" fill="${c}" opacity=".18"/>` : ''}`;
      }
    }
    g += t(110, 290, 'Лампочка за каждый день декабря,', { size: 10 });
    g += t(110, 304, 'в который закрыто задание дня', { size: 10 });
    g += `<rect x="62" y="312" width="96" height="20" rx="10" fill="#ffd9ea"/>${t(110, 326, 'Горит 17 из 31', { size: 10, fill: '#7e0038', w: 700 })}`;
    return frame('Гирлянда декабря', g);
  };

  A.result = () => frame('Готово', `${t(110, 150, 'Молодец! +{value}', { size: 16, fill: '#7e0038', w: 700 })}${t(110, 176, 'Награда придёт в тот же день', { size: 10 })}<rect x="30" y="220" width="160" height="34" rx="12" fill="#af004e"/>${t(110, 242, 'Вернуться на главную', { size: 11, fill: '#fff', w: 600 })}`);

  window.Art = A;
})();
