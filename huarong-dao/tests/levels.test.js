// 確認 config.js 內每一關都有解，而且難度逐關上升
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Core = require('../js/core.js');

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8'), sandbox);
const CONFIG = sandbox.window.GAME_CONFIG;

test('設定有三關', () => {
  assert.strictEqual(CONFIG.levels.length, 3);
});

const minimums = [];
CONFIG.levels.forEach((level, i) => {
  test(`${level.name}「${level.title}」有解而且未過關`, () => {
    const pieces = Core.parseLayout(level.layout);
    assert.strictEqual(Core.isSolved(pieces), false);
    const { steps } = Core.solve(level.layout);
    assert.ok(steps > 0, '必須有解');
    minimums[i] = steps;
    assert.ok(level.timeLimit >= 60, '時限最少 60 秒');
    assert.ok(level.background && level.verse && level.verse.text && level.verse.ref);
  });
});

test('最少步數逐關增加（目前 7 → 12 → 22）', () => {
  assert.deepStrictEqual(minimums, [7, 12, 22]);
});

test('設定內所有圖片檔案都存在', () => {
  const files = [CONFIG.images.home, CONFIG.images.board, CONFIG.images.exit, ...Object.values(CONFIG.images.pieces), ...CONFIG.levels.map(l => l.background)];
  for (const f of files) assert.ok(fs.existsSync(path.join(__dirname, '..', f)), `找不到 ${f}`);
});

test('離線快取清單包含所有圖片及程式檔', () => {
  const sw = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
  const files = [CONFIG.images.home, CONFIG.images.board, CONFIG.images.exit, ...Object.values(CONFIG.images.pieces), ...CONFIG.levels.map(l => l.background), 'js/app.js', 'js/core.js', 'js/config.js', 'css/style.css', 'fonts/serif-600.woff2', 'fonts/serif-900.woff2'];
  for (const f of files) assert.ok(sw.includes(`'${f}'`), `sw.js 未列出 ${f}`);
});
