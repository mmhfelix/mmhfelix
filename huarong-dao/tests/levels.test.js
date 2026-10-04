// 確認 config.js 內每一關都有解、最少步數與參考書相符，以及圖片和離線清單齊全
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Core = require('../js/core.js');

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8'), sandbox);
const CONFIG = sandbox.window.GAME_CONFIG;
const BOARD = CONFIG.board;
const ROOT = path.join(__dirname, '..');

test('設定有三關', () => {
  assert.strictEqual(CONFIG.levels.length, 3);
});

const minimums = [];
CONFIG.levels.forEach((level, i) => {
  test(`${level.name}「${level.title}」有解而且未過關`, () => {
    const pieces = Core.parseLayout(level.layout, BOARD);
    assert.strictEqual(Core.isSolved(pieces, BOARD), false);
    const { steps } = Core.solve(level.layout, BOARD);
    assert.ok(steps > 0, '必須有解');
    minimums[i] = steps;
    assert.ok(level.timeLimit >= 60, '時限最少 60 秒');
    assert.ok(level.background && level.verse && level.verse.text && level.verse.ref);
  });
});

test('最少步數與參考書相符（011：6、099：17、166：21）', () => {
  assert.deepStrictEqual(minimums, [6, 17, 21]);
});

test('每種用到的方塊形狀都有圖片', () => {
  for (const level of CONFIG.levels) {
    for (const p of Core.parseLayout(level.layout, BOARD)) {
      const shape = p.target ? 'X' : p.dir.toUpperCase() + p.len;
      assert.ok(CONFIG.images.pieces[shape], `${level.name} 的 ${p.letter}（${shape}）沒有圖片`);
    }
  }
});

const imageFiles = () => [CONFIG.images.home, CONFIG.images.board, CONFIG.images.exit, ...Object.values(CONFIG.images.pieces), ...CONFIG.levels.map(l => l.background)];

test('設定內所有圖片檔案都存在', () => {
  for (const f of imageFiles()) assert.ok(fs.existsSync(path.join(ROOT, f)), `找不到 ${f}`);
});

const swList = () => {
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  return sw.slice(sw.indexOf('const FILES = ['), sw.indexOf('];')).match(/'([^']+)'/g).map(s => s.slice(1, -1));
};

test('離線快取清單包含所有圖片、字型及程式檔', () => {
  const list = swList();
  const needed = [...imageFiles(), 'js/app.js', 'js/core.js', 'js/config.js', 'css/style.css', 'fonts/serif-600.woff2', 'fonts/serif-900.woff2'];
  for (const f of needed) assert.ok(list.includes(f), `sw.js 未列出 ${f}`);
});

test('離線快取清單上的每個檔案都存在', () => {
  for (const f of swList()) {
    if (f === './') continue;
    assert.ok(fs.existsSync(path.join(ROOT, f)), `sw.js 列出的 ${f} 不存在`);
  }
});
