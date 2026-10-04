/*
 * 尋光之旅 — 華容道核心邏輯
 * 純函數，不涉及畫面；瀏覽器（window.HRDCore）及 Node 測試共用。
 * 棋盤 4 欄 × 5 行；座標 (x, y) 以左上角為 (0, 0)。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HRDCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const COLS = 4;
  const ROWS = 5;
  // B = 小羊 2×2、H = 橫向 2×1、V = 直向 1×2、S = 1×1
  const SIZE = { B: [2, 2], H: [2, 1], V: [1, 2], S: [1, 1] };
  // 小羊到達底部中間（出口）即過關
  const GOAL = { x: 1, y: 3 };
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  // 佈局：5 個字串，每個 4 個字元，例如 ['SBBS', 'SBBS', '....', 'V..V', 'VHHV']
  function parseLayout(rows) {
    if (!Array.isArray(rows) || rows.length !== ROWS ||
        rows.some(r => typeof r !== 'string' || r.length !== COLS)) {
      throw new Error('佈局必須是 5 行、每行 4 個字元');
    }
    const cells = rows.join('');
    const taken = new Array(COLS * ROWS).fill(false);
    const pieces = [];
    for (let i = 0; i < cells.length; i++) {
      const type = cells[i];
      if (type === '.' || taken[i]) continue;
      if (!SIZE[type]) throw new Error(`佈局有未知字元「${type}」`);
      const x = i % COLS;
      const y = Math.floor(i / COLS);
      const [w, h] = SIZE[type];
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const j = (y + dy) * COLS + x + dx;
          if (x + dx >= COLS || y + dy >= ROWS || cells[j] !== type || taken[j]) {
            throw new Error(`佈局第 ${y + 1} 行第 ${x + 1} 格的「${type}」形狀不完整`);
          }
          taken[j] = true;
        }
      }
      pieces.push({ id: pieces.length, type, x, y, w, h });
    }
    if (pieces.filter(p => p.type === 'B').length !== 1) {
      throw new Error('佈局必須有而且只有一個 B（小羊）');
    }
    return pieces;
  }

  function occupancy(pieces, skip) {
    const grid = new Array(COLS * ROWS).fill(-1);
    for (const p of pieces) {
      if (p === skip) continue;
      for (let dy = 0; dy < p.h; dy++) {
        for (let dx = 0; dx < p.w; dx++) grid[(p.y + dy) * COLS + p.x + dx] = p.id;
      }
    }
    return grid;
  }

  function fits(grid, p, x, y) {
    if (x < 0 || y < 0 || x + p.w > COLS || y + p.h > ROWS) return false;
    for (let dy = 0; dy < p.h; dy++) {
      for (let dx = 0; dx < p.w; dx++) {
        if (grid[(y + dy) * COLS + x + dx] !== -1) return false;
      }
    }
    return true;
  }

  // 棋子沿 (dx, dy) 方向直線最多可移動幾格
  function reach(pieces, p, dx, dy) {
    const grid = occupancy(pieces, p);
    let n = 0;
    while (fits(grid, p, p.x + dx * (n + 1), p.y + dy * (n + 1))) n++;
    return n;
  }

  function legalDirections(pieces, p) {
    return Object.keys(DIRS).filter(d => reach(pieces, p, DIRS[d][0], DIRS[d][1]) > 0);
  }

  function isSolved(pieces) {
    const lamb = pieces.find(p => p.type === 'B');
    return lamb.x === GOAL.x && lamb.y === GOAL.y;
  }

  // 同一件棋子連續移動（包括轉彎）只計 1 步
  function countSteps(history) {
    let steps = 0;
    let last = null;
    for (const move of history) {
      if (move.id !== last) steps++;
      last = move.id;
    }
    return steps;
  }

  function encode(pieces) {
    const cells = new Array(COLS * ROWS).fill('.');
    for (const p of pieces) {
      for (let dy = 0; dy < p.h; dy++) {
        for (let dx = 0; dx < p.w; dx++) cells[(p.y + dy) * COLS + p.x + dx] = p.type;
      }
    }
    return cells.join('');
  }

  function toRows(code) {
    const rows = [];
    for (let r = 0; r < ROWS; r++) rows.push(code.slice(r * COLS, r * COLS + COLS));
    return rows;
  }

  // 一件棋子單獨滑動可到達的所有位置（不含原位）
  function slidePositions(pieces, p) {
    const grid = occupancy(pieces, p);
    const seen = new Set([p.x + ',' + p.y]);
    const queue = [[p.x, p.y]];
    const out = [];
    while (queue.length) {
      const [cx, cy] = queue.shift();
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = cx + dx;
        const ny = cy + dy;
        const key = nx + ',' + ny;
        if (seen.has(key) || !fits(grid, p, nx, ny)) continue;
        seen.add(key);
        queue.push([nx, ny]);
        out.push([nx, ny]);
      }
    }
    return out;
  }

  // 最少步數（廣度優先搜尋，同一件棋子任意滑動計 1 步）。無解時回傳 -1。
  // 回傳 { steps, path }，path 為每一步之後的佈局字串。
  function solve(layout) {
    const start = encode(parseLayout(layout));
    const parent = new Map([[start, null]]);
    const queue = [start];
    for (let qi = 0; qi < queue.length; qi++) {
      const code = queue[qi];
      const pieces = parseLayout(toRows(code));
      if (isSolved(pieces)) {
        const path = [];
        for (let c = code; c !== start; c = parent.get(c)) path.unshift(c);
        return { steps: path.length, path };
      }
      for (const p of pieces) {
        for (const [nx, ny] of slidePositions(pieces, p)) {
          const next = encode(pieces.map(o => (o === p ? { ...o, x: nx, y: ny } : o)));
          if (!parent.has(next)) {
            parent.set(next, code);
            queue.push(next);
          }
        }
      }
    }
    return { steps: -1, path: [] };
  }

  return { COLS, ROWS, SIZE, GOAL, DIRS, parseLayout, reach, legalDirections, isSolved, countSteps, encode, toRows, solve };
});
