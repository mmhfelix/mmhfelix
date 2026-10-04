// 執行：node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert');
const Core = require('../js/core.js');

const BOARD = { cols: 6, rows: 6, exitCol: 3 };
const L1 = ['.B....', '.B....', '.B.XCC', '...X.D', '.EEFFD', '......'];
const swap = (row, text) => L1.map((r, i) => (i === row ? text : r));

test('parseLayout 讀出每件方塊的方向、長度及位置', () => {
  const pieces = Core.parseLayout(L1, BOARD);
  const by = l => pieces.find(p => p.letter === l);
  assert.strictEqual(pieces.length, 6);
  assert.deepStrictEqual([by('B').dir, by('B').len, by('B').x, by('B').y], ['v', 3, 1, 0]);
  assert.deepStrictEqual([by('X').dir, by('X').len, by('X').x, by('X').y, by('X').target], ['v', 2, 3, 2, true]);
  assert.deepStrictEqual([by('C').dir, by('C').len, by('C').x, by('C').y, by('C').w, by('C').h], ['h', 2, 4, 2, 2, 1]);
});

test('parseLayout 拒絕錯誤佈局', () => {
  assert.throws(() => Core.parseLayout(L1.slice(0, 5), BOARD), /6 行/);
  assert.throws(() => Core.parseLayout(swap(5, '....Z.'), BOARD), /長度/);
  assert.throws(() => Core.parseLayout(swap(5, 'GGGG..'), BOARD), /長度/);
  assert.throws(() => Core.parseLayout(swap(5, 'G.G...'), BOARD), /直線/);
  assert.throws(() => Core.parseLayout(swap(1, '.BB...'), BOARD), /直線/);
  assert.throws(() => Core.parseLayout(swap(2, '.B..CC').map((r, i) => (i === 3 ? '.....D' : r)), BOARD), /小羊/);
  assert.throws(() => Core.parseLayout(swap(2, '.B..CC').map((r, i) => (i === 3 ? '...XXD' : r)), BOARD), /直放/);
  assert.throws(() => Core.parseLayout(swap(2, '.BX.CC').map((r, i) => (i === 3 ? '..X..D' : r)), BOARD), /第 4 欄/);
});

test('方塊只可沿長邊方向移動', () => {
  const pieces = Core.parseLayout(L1, BOARD);
  const by = l => pieces.find(p => p.letter === l);
  const X = by('X');
  assert.strictEqual(Core.reach(pieces, X, 0, -1, BOARD), 2);
  assert.strictEqual(Core.reach(pieces, X, 0, 1, BOARD), 0);
  assert.strictEqual(Core.reach(pieces, X, -1, 0, BOARD), 0);
  assert.strictEqual(Core.reach(pieces, X, 1, 0, BOARD), 0);
  assert.deepStrictEqual(Core.legalDirections(pieces, X, BOARD), ['up']);
  // 橫放的方塊上面有空位也不可向上
  const E = by('E');
  assert.strictEqual(Core.reach(pieces, E, 0, -1, BOARD), 0);
  assert.deepStrictEqual(Core.legalDirections(pieces, E, BOARD), ['left']);
  // 直放的方塊旁邊有空位也不可橫移
  const B = by('B');
  assert.strictEqual(Core.reach(pieces, B, 1, 0, BOARD), 0);
  assert.strictEqual(Core.reach(pieces, B, 0, 1, BOARD), 1);
});

test('小羊到達底部出口才算過關', () => {
  const pieces = Core.parseLayout(L1, BOARD);
  assert.strictEqual(Core.isSolved(pieces, BOARD), false);
  pieces.find(p => p.target).y = 4;
  assert.strictEqual(Core.isSolved(pieces, BOARD), true);
});

test('同一件方塊連續移動只計 1 步', () => {
  assert.strictEqual(Core.countSteps([]), 0);
  assert.strictEqual(Core.countSteps([{ id: 1 }, { id: 1 }, { id: 2 }, { id: 1 }, { id: 1 }]), 3);
});

test('encode 畫回原本的字母格', () => {
  assert.strictEqual(Core.encode(Core.parseLayout(L1, BOARD), BOARD), L1.join(''));
});

test('solve 找出最少步數，解法逐步可行', () => {
  const { steps, moves } = Core.solve(L1, BOARD);
  assert.strictEqual(steps, 6);
  const pieces = Core.parseLayout(L1, BOARD);
  for (const m of moves) {
    const p = pieces.find(q => q.letter === m.letter);
    assert.ok(Core.reach(pieces, p, Math.sign(m.dx), Math.sign(m.dy), BOARD) >= Math.abs(m.dx + m.dy));
    p.x += m.dx;
    p.y += m.dy;
  }
  assert.strictEqual(Core.isSolved(pieces, BOARD), true);
});
