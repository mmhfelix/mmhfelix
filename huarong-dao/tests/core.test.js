// 執行：node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert');
const Core = require('../js/core.js');

test('parseLayout 讀出每件方塊的位置及大小', () => {
  const pieces = Core.parseLayout(['SBBS', 'SBBS', '....', 'V..V', 'VHHV']);
  assert.strictEqual(pieces.length, 8);
  const lamb = pieces.find(p => p.type === 'B');
  assert.deepStrictEqual([lamb.x, lamb.y, lamb.w, lamb.h], [1, 0, 2, 2]);
  const log = pieces.find(p => p.type === 'H');
  assert.deepStrictEqual([log.x, log.y, log.w, log.h], [1, 4, 2, 1]);
  assert.strictEqual(pieces.filter(p => p.type === 'V').length, 2);
  assert.strictEqual(pieces.filter(p => p.type === 'S').length, 4);
});

test('相連的同類方塊會正確拆開', () => {
  const pieces = Core.parseLayout(['VBBV', 'VBBV', 'VBBV', 'VBBV', 'HHHH'].map((r, i) => (i < 2 ? r : r.replace(/B/g, '.'))));
  assert.strictEqual(pieces.filter(p => p.type === 'V').length, 4);
  assert.strictEqual(pieces.filter(p => p.type === 'H').length, 2);
});

test('parseLayout 拒絕錯誤佈局', () => {
  assert.throws(() => Core.parseLayout(['SBBS', 'SBBS', '....', 'V..V']), /5 行/);
  assert.throws(() => Core.parseLayout(['SBBS', 'SBBS', '....', 'V..V', 'VHH.']), /形狀不完整/);
  assert.throws(() => Core.parseLayout(['S..S', 'S..S', '....', 'V..V', 'VHHV']), /B/);
  assert.throws(() => Core.parseLayout(['SBBS', 'SBBS', '..X.', 'V..V', 'VHHV']), /未知字元/);
});

test('reach 及 legalDirections 只容許移到空位', () => {
  const pieces = Core.parseLayout(['SBBS', 'SBBS', '....', 'V..V', 'VHHV']);
  const lamb = pieces.find(p => p.type === 'B');
  assert.strictEqual(Core.reach(pieces, lamb, 0, 1), 2);
  assert.strictEqual(Core.reach(pieces, lamb, 0, -1), 0);
  assert.strictEqual(Core.reach(pieces, lamb, 1, 0), 0);
  assert.deepStrictEqual(Core.legalDirections(pieces, lamb), ['down']);
  const log = pieces.find(p => p.type === 'H');
  assert.deepStrictEqual(Core.legalDirections(pieces, log), ['up']);
  assert.strictEqual(Core.reach(pieces, log, 0, -1), 2);
});

test('同一件方塊連續移動只計 1 步', () => {
  assert.strictEqual(Core.countSteps([]), 0);
  assert.strictEqual(Core.countSteps([{ id: 1 }, { id: 1 }, { id: 2 }, { id: 1 }, { id: 1 }]), 3);
});

test('小羊到達底部中間才算過關', () => {
  assert.strictEqual(Core.isSolved(Core.parseLayout(['....', '....', '....', '.BB.', '.BB.'])), true);
  assert.strictEqual(Core.isSolved(Core.parseLayout(['....', '....', '.BB.', '.BB.', '....'])), false);
  assert.strictEqual(Core.isSolved(Core.parseLayout(['....', '....', '....', 'BB..', 'BB..'])), false);
});

test('solve 找出經典「橫刀立馬」最少 81 步', () => {
  assert.strictEqual(Core.solve(['VBBV', 'VBBV', 'VHHV', 'VSSV', 'S..S']).steps, 81);
});
