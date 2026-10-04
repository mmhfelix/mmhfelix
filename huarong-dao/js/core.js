/*
 * 尋光之旅 — 遊戲核心邏輯
 * 純函數，不涉及畫面；瀏覽器（window.HRDCore）及 Node 測試共用。
 *
 * 規則：每件方塊長 2 或 3 格，只可沿長邊方向滑動（直放上下、橫放左右），
 * 滑動任何距離計 1 步。小羊（X，直放）滑到底部出口即過關。
 * 座標 (x, y) 以左上角為 (0, 0)；board = { cols, rows, exitCol }。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HRDCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const TARGET = 'X';

  // 佈局：每行一個字串；同一字母代表同一件方塊，「.」為空位，X 為小羊
  function parseLayout(rows, board) {
    const { cols, rows: height, exitCol } = board;
    if (!Array.isArray(rows) || rows.length !== height ||
        rows.some(r => typeof r !== 'string' || r.length !== cols)) {
      throw new Error(`佈局必須是 ${height} 行、每行 ${cols} 個字元`);
    }
    const cells = {};
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch !== '.') (cells[ch] = cells[ch] || []).push([x, y]);
      });
    });
    const pieces = Object.keys(cells).map((letter, id) => {
      const list = cells[letter];
      const xs = list.map(c => c[0]);
      const ys = list.map(c => c[1]);
      const len = list.length;
      const x = Math.min(...xs);
      const y = Math.min(...ys);
      let dir;
      if (new Set(ys).size === 1 && Math.max(...xs) - x === len - 1) dir = 'h';
      else if (new Set(xs).size === 1 && Math.max(...ys) - y === len - 1) dir = 'v';
      else throw new Error(`方塊「${letter}」必須是一條相連的直線`);
      if (len < 2 || len > 3) throw new Error(`方塊「${letter}」長度必須是 2 或 3 格`);
      return { id, letter, target: letter === TARGET, dir, len, x, y, w: dir === 'h' ? len : 1, h: dir === 'v' ? len : 1 };
    });
    const targets = pieces.filter(p => p.target);
    if (targets.length !== 1) throw new Error('佈局必須有而且只有一隻小羊（X）');
    if (targets[0].dir !== 'v' || targets[0].x !== exitCol) {
      throw new Error(`小羊（X）必須直放在出口所在的第 ${exitCol + 1} 欄`);
    }
    return pieces;
  }

  function occupancy(pieces, board, skip) {
    const grid = new Array(board.cols * board.rows).fill(-1);
    for (const p of pieces) {
      if (p === skip) continue;
      for (let dy = 0; dy < p.h; dy++) {
        for (let dx = 0; dx < p.w; dx++) grid[(p.y + dy) * board.cols + p.x + dx] = p.id;
      }
    }
    return grid;
  }

  function fits(grid, board, p, x, y) {
    if (x < 0 || y < 0 || x + p.w > board.cols || y + p.h > board.rows) return false;
    for (let dy = 0; dy < p.h; dy++) {
      for (let dx = 0; dx < p.w; dx++) {
        if (grid[(y + dy) * board.cols + x + dx] !== -1) return false;
      }
    }
    return true;
  }

  const alongAxis = (p, dx, dy) => (p.dir === 'h' ? dy === 0 && dx !== 0 : dx === 0 && dy !== 0);

  // 方塊沿 (dx, dy) 方向最多可滑動幾格；不是沿長邊方向一律為 0
  function reach(pieces, p, dx, dy, board) {
    if (!alongAxis(p, dx, dy)) return 0;
    const grid = occupancy(pieces, board, p);
    let n = 0;
    while (fits(grid, board, p, p.x + dx * (n + 1), p.y + dy * (n + 1))) n++;
    return n;
  }

  function legalDirections(pieces, p, board) {
    return Object.keys(DIRS).filter(d => reach(pieces, p, DIRS[d][0], DIRS[d][1], board) > 0);
  }

  function isSolved(pieces, board) {
    const lamb = pieces.find(p => p.target);
    return lamb.y + lamb.h === board.rows;
  }

  // 同一件方塊連續移動只計 1 步
  function countSteps(history) {
    let steps = 0;
    let last = null;
    for (const move of history) {
      if (move.id !== last) steps++;
      last = move.id;
    }
    return steps;
  }

  // 把方塊畫回字母格（重疊的格會被覆蓋，可用來檢查佈局是否有效）
  function encode(pieces, board) {
    const cells = new Array(board.cols * board.rows).fill('.');
    for (const p of pieces) {
      for (let dy = 0; dy < p.h; dy++) {
        for (let dx = 0; dx < p.w; dx++) cells[(p.y + dy) * board.cols + p.x + dx] = p.letter;
      }
    }
    return cells.join('');
  }

  // 最少步數（廣度優先搜尋）。回傳 { steps, moves }；moves 為每步 { letter, dx, dy }。無解時 steps 為 -1。
  function solve(layout, board) {
    const start = parseLayout(layout, board);
    const key = pieces => pieces.map(p => (p.dir === 'h' ? p.x : p.y)).join(',');
    const prev = new Map([[key(start), null]]);
    const queue = [start];
    for (let qi = 0; qi < queue.length; qi++) {
      const pieces = queue[qi];
      if (isSolved(pieces, board)) {
        const moves = [];
        for (let k = key(pieces); prev.get(k); k = prev.get(k).from) moves.unshift(prev.get(k).move);
        return { steps: moves.length, moves };
      }
      for (const p of pieces) {
        for (const d of p.dir === 'h' ? ['left', 'right'] : ['up', 'down']) {
          const [dx, dy] = DIRS[d];
          const n = reach(pieces, p, dx, dy, board);
          for (let k = 1; k <= n; k++) {
            const next = pieces.map(o => (o === p ? { ...o, x: o.x + dx * k, y: o.y + dy * k } : o));
            const nk = key(next);
            if (!prev.has(nk)) {
              prev.set(nk, { from: key(pieces), move: { letter: p.letter, dx: dx * k, dy: dy * k } });
              queue.push(next);
            }
          }
        }
      }
    }
    return { steps: -1, moves: [] };
  }

  return { DIRS, TARGET, parseLayout, reach, legalDirections, isSolved, countSteps, encode, solve };
});
