/* BoxUp 核心：關卡解析 / 序列化、移動規則、求解器、SVG 繪製
 *
 * 關卡字串格式（與 mansoft.nl 版相容）：
 *   前 6 碼：寬、高、目標紅箱 x、y、目標藍箱 x、y（每碼一位 0-9，10 以上用 a-f）
 *   之後為各列內容，以 ';' 分隔：
 *     -  空地        X  牆
 *     M  玩家（小黑點）
 *     n e s w  紅箱（小寫，字母代表「開口」朝北/東/南/西）
 *     N E S W  藍箱（大寫）
 */
(function (global) {
  'use strict';

  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // 0上 1右 2下 3左
  const ARROWS = ['↑', '→', '↓', '←'];
  const LETTERS = 'URDL';
  const RED = 1, BLUE = 2;
  const BOX_CHARS = {
    n: [RED, 0], e: [RED, 1], s: [RED, 2], w: [RED, 3],
    N: [BLUE, 0], E: [BLUE, 1], S: [BLUE, 2], W: [BLUE, 3],
  };

  function digit(c) {
    const v = parseInt(c, 36);
    return isNaN(v) ? -1 : v;
  }

  function parse(code) {
    code = String(code || '').trim();
    if (code.length < 6) throw new Error('關卡字串太短');
    const head = [...code.slice(0, 6)].map(digit);
    if (head.some(v => v < 0 || v > 15)) throw new Error('前 6 碼必須是數字（寬、高、紅箱座標、藍箱座標）');
    const [w, h, rx, ry, bx, by] = head;
    if (w < 2 || h < 2) throw new Error('寬與高至少為 2');
    const body = code.slice(6);
    let rows;
    if (/[;,]/.test(body)) rows = body.split(/[;,]/);
    else { rows = []; for (let i = 0; i < h; i++) rows.push(body.slice(i * w, i * w + w)); }

    const walls = Array.from({ length: h }, () => Array(w).fill(false));
    const boxes = [];
    let player = null;
    for (let y = 0; y < h; y++) {
      const row = rows[y] || '';
      for (let x = 0; x < w; x++) {
        const c = row[x] || '-';
        if (c === 'X') walls[y][x] = true;
        else if (c === 'M') { if (player) throw new Error('只能有一個玩家 M'); player = { x, y }; }
        else if (BOX_CHARS[c]) boxes.push({ kind: BOX_CHARS[c][0], dir: BOX_CHARS[c][1], x, y });
      }
    }
    if (!player) throw new Error('缺少玩家 M');
    const redTarget = boxes.findIndex(b => b.kind === RED && b.x === rx && b.y === ry);
    const blueTarget = boxes.findIndex(b => b.kind === BLUE && b.x === bx && b.y === by);
    if (redTarget < 0) throw new Error(`座標 (${rx},${ry}) 沒有紅箱可作為目標紅箱`);
    if (blueTarget < 0) throw new Error(`座標 (${bx},${by}) 沒有藍箱可作為目標藍箱`);
    return { w, h, walls, boxes, player, redTarget, blueTarget };
  }

  function boxChar(b) {
    const c = 'nesw'[b.dir];
    return b.kind === BLUE ? c.toUpperCase() : c;
  }

  // 將「編輯中的格子」轉成關卡字串。grid[y][x] = '-', 'X', 'M', 'n'.. 'W'
  function serializeGrid(grid, red, blue) {
    const h = grid.length, w = grid[0].length;
    const d = v => v.toString(16);
    return d(w) + d(h) + d(red.x) + d(red.y) + d(blue.x) + d(blue.y) +
      grid.map(r => r.join('')).join(';');
  }

  function levelToGrid(L) {
    const grid = Array.from({ length: L.h }, (_, y) => Array.from({ length: L.w }, (_, x) => L.walls[y][x] ? 'X' : '-'));
    grid[L.player.y][L.player.x] = 'M';
    L.boxes.forEach(b => { grid[b.y][b.x] = boxChar(b); });
    return grid;
  }

  function initialState(L) {
    return { px: L.player.x, py: L.player.y, b: L.boxes.map(b => [b.x, b.y]) };
  }

  // 嘗試移動，成功回傳新狀態，被擋住回傳 null
  function move(L, S, dir) {
    const [dx, dy] = DIRS[dir];
    const opp = (dir + 2) % 4;
    const px = S.px, py = S.py, nx = px + dx, ny = py + dy;
    if (nx < 0 || ny < 0 || nx >= L.w || ny >= L.h || L.walls[ny][nx]) return null;

    let curR = -1, curB = -1, tgtR = -1, tgtB = -1;
    for (let i = 0; i < S.b.length; i++) {
      const [bx, by] = S.b[i], k = L.boxes[i].kind;
      if (bx === px && by === py) { if (k === RED) curR = i; else curB = i; }
      if (bx === nx && by === ny) { if (k === RED) tgtR = i; else tgtB = i; }
    }
    // 在箱內往「非開口」方向走 → 推著箱子一起移動；往開口方向走 → 走出箱子
    let carryR = -1, carryB = -1;
    if (curB >= 0 && dir !== L.boxes[curB].dir) { carryB = curB; carryR = curR; }
    if (curR >= 0 && dir !== L.boxes[curR].dir) carryR = curR;
    // 進入另一個箱子：必須從開口進入，且尺寸要放得下
    if (tgtR >= 0 && (L.boxes[tgtR].dir !== opp || carryR >= 0 || carryB >= 0)) return null;
    if (tgtB >= 0 && (L.boxes[tgtB].dir !== opp || carryB >= 0)) return null;

    const b = S.b.slice();
    if (carryR >= 0) b[carryR] = [nx, ny];
    if (carryB >= 0) b[carryB] = [nx, ny];
    return { px: nx, py: ny, b };
  }

  function isSolved(L, S) {
    const r = S.b[L.redTarget], u = S.b[L.blueTarget];
    return r[0] === S.px && r[1] === S.py && u[0] === S.px && u[1] === S.py;
  }

  function stateKey(S) {
    let k = S.px + ',' + S.py;
    for (const p of S.b) k += '|' + p[0] + ',' + p[1];
    return k;
  }

  // 廣度優先搜尋最短解，回傳方向陣列；無解回傳 null
  function solve(L, start, maxNodes) {
    maxNodes = maxNodes || 2000000;
    start = start || initialState(L);
    if (isSolved(L, start)) return { path: [], nodes: 1 };
    const seen = new Map([[stateKey(start), null]]);
    let frontier = [start];
    while (frontier.length) {
      const next = [];
      for (const S of frontier) {
        const key = stateKey(S);
        for (let d = 0; d < 4; d++) {
          const T = move(L, S, d);
          if (!T) continue;
          const tk = stateKey(T);
          if (seen.has(tk)) continue;
          seen.set(tk, [key, d]);
          if (isSolved(L, T)) {
            const path = [];
            let k = tk;
            while (seen.get(k)) { const [pk, pd] = seen.get(k); path.push(pd); k = pk; }
            return { path: path.reverse(), nodes: seen.size };
          }
          next.push(T);
        }
        if (seen.size > maxNodes) return { path: null, nodes: seen.size, aborted: true };
      }
      frontier = next;
    }
    return { path: null, nodes: seen.size };
  }

  function movesToArrows(moves) { return [...moves].map(c => ARROWS[LETTERS.indexOf(c)] || '').join(''); }

  // ---------- SVG 繪製 ----------
  const NS = 'http://www.w3.org/2000/svg';
  const CELL = 100;

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // 箱子：缺一邊的正方形（缺的那邊就是開口）
  function boxPath(dir, inset) {
    const a = inset * CELL, z = CELL - a;
    const c = [[a, a], [z, a], [z, z], [a, z]]; // 左上 右上 右下 左下；第 i 邊 = c[i]→c[i+1]
    const p = [1, 2, 3, 4].map(i => c[(dir + i) % 4]);
    return 'M' + p.map(q => q.join(' ')).join(' L');
  }

  function boxShape(kind, dir, isTarget, parent) {
    const inset = kind === BLUE ? 0.10 : 0.225;
    const color = isTarget ? (kind === BLUE ? 'var(--box-blue, #1f4fe0)' : 'var(--box-red, #e0262b)') : 'var(--box-other, #222)';
    return el('path', {
      d: boxPath(dir, inset), fill: 'none', stroke: color, 'stroke-width': 7.5,
      'stroke-linecap': 'square', 'stroke-linejoin': 'miter',
    }, parent);
  }

  // 建立棋盤，回傳 { update(state), svg }
  function createBoard(svg, L, opts) {
    opts = opts || {};
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const pad = 6;
    svg.setAttribute('viewBox', `${-pad} ${-pad} ${L.w * CELL + pad * 2} ${L.h * CELL + pad * 2}`);
    const cells = el('g', { class: 'cells' }, svg);
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
      const r = el('rect', {
        x: x * CELL, y: y * CELL, width: CELL, height: CELL,
        class: 'cell' + (L.walls[y][x] ? ' wall' : ''), 'data-x': x, 'data-y': y,
      }, cells);
      if (opts.onCell) r.addEventListener('click', () => opts.onCell(x, y));
    }
    const pieces = el('g', { class: 'pieces' }, svg);
    const order = L.boxes.map((b, i) => i).sort((i, j) => L.boxes[j].kind - L.boxes[i].kind); // 藍在下、紅在上
    const boxEls = [];
    order.forEach(i => {
      const b = L.boxes[i];
      const g = el('g', { class: 'piece' }, pieces);
      boxShape(b.kind, b.dir, i === L.redTarget || i === L.blueTarget, g);
      boxEls[i] = g;
    });
    const pg = el('g', { class: 'piece player' }, pieces);
    el('rect', { x: 37.5, y: 37.5, width: 25, height: 25, fill: 'var(--player, #111)' }, pg);

    function place(g, x, y) { g.style.transform = `translate(${x * CELL}px, ${y * CELL}px)`; }
    function update(S) {
      S.b.forEach((p, i) => place(boxEls[i], p[0], p[1]));
      place(pg, S.px, S.py);
    }
    return { svg, update, cellSize: CELL };
  }

  global.BoxUp = {
    DIRS, ARROWS, LETTERS, RED, BLUE, BOX_CHARS,
    parse, serializeGrid, levelToGrid, boxChar, initialState, move, isSolved, solve,
    movesToArrows, createBoard, boxPath, boxShape, svgEl: el, CELL,
  };
})(window);
