// 端對端測試：用真正的拖動／輕按玩完三關，再測試龍虎榜、時限、閒置及管理頁。
// 執行（需要 Playwright）：NODE_PATH=$(npm root -g) node tests/e2e.js [截圖資料夾]
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert');
const { chromium } = require('playwright');
const Core = require('../js/core.js');

const ROOT = path.join(__dirname, '..');
const SHOTS = process.argv[2];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/config.js'), 'utf8'), sandbox);
const LEVELS = sandbox.window.GAME_CONFIG.levels;

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// 把最少步數解法拆成一下一下的直線拖動
function solutionGestures(layout) {
  const { path: states } = Core.solve(layout);
  let before = Core.parseLayout(layout);
  const steps = [];
  for (const code of states) {
    const after = Core.parseLayout(Core.toRows(code));
    const key = p => `${p.type}${p.x},${p.y}`;
    const afterKeys = new Set(after.map(key));
    const beforeKeys = new Set(before.map(key));
    const from = before.find(p => !afterKeys.has(key(p)));
    const to = after.find(p => !beforeKeys.has(key(p)));
    // 找出方塊由 from 滑到 to 的路線
    const others = before.filter(p => p !== from);
    const occupied = new Set();
    for (const o of others) for (let dy = 0; dy < o.h; dy++) for (let dx = 0; dx < o.w; dx++) occupied.add(`${o.x + dx},${o.y + dy}`);
    const fits = (x, y) => {
      if (x < 0 || y < 0 || x + from.w > Core.COLS || y + from.h > Core.ROWS) return false;
      for (let dy = 0; dy < from.h; dy++) for (let dx = 0; dx < from.w; dx++) if (occupied.has(`${x + dx},${y + dy}`)) return false;
      return true;
    };
    const prev = new Map([[`${from.x},${from.y}`, null]]);
    const queue = [[from.x, from.y]];
    while (queue.length) {
      const [x, y] = queue.shift();
      if (x === to.x && y === to.y) break;
      for (const [dx, dy] of Object.values(Core.DIRS)) {
        const k = `${x + dx},${y + dy}`;
        if (!prev.has(k) && fits(x + dx, y + dy)) { prev.set(k, `${x},${y}`); queue.push([x + dx, y + dy]); }
      }
    }
    const route = [];
    for (let k = `${to.x},${to.y}`; k; k = prev.get(k)) route.unshift(k.split(',').map(Number));
    const segments = [];
    for (let i = 1; i < route.length; i++) {
      const d = [route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]];
      const last = segments[segments.length - 1];
      if (last && last.d[0] === d[0] && last.d[1] === d[1]) last.n++;
      else segments.push({ start: route[i - 1], d, n: 1 });
    }
    steps.push({ type: from.type, segments });
    before = after;
  }
  return steps;
}

async function cellSize(page) {
  return page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('game')).getPropertyValue('--cell')));
}

async function pieceAt(page, type, x, y) {
  const el = page.locator(`#board .piece[data-type="${type}"][data-x="${x}"][data-y="${y}"]`);
  assert.strictEqual(await el.count(), 1, `找不到 ${type} 在 (${x},${y})`);
  return el;
}

async function dragPiece(page, type, [x, y], [dx, dy], n) {
  const cell = await cellSize(page);
  const box = await (await pieceAt(page, type, x, y)).boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + dx * cell * n * 0.5, cy + dy * cell * n * 0.5, { steps: 4 });
  await page.mouse.move(cx + dx * cell * n, cy + dy * cell * n, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  await pieceAt(page, type, x + dx * n, y + dy * n);
}

// toward：輕按偏向哪一邊（方塊可向多於一個方向移動時用）
async function tapPiece(page, type, x, y, toward = [0, 0]) {
  const box = await (await pieceAt(page, type, x, y)).boundingBox();
  await page.mouse.click(box.x + box.width / 2 + toward[0] * box.width * 0.3, box.y + box.height / 2 + toward[1] * box.height * 0.3);
  await page.waitForTimeout(200);
}

const text = (page, sel) => page.locator(sel).innerText();
async function shot(page, name) {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, name + '.png') });
}

async function playLevel(page, i, { useTapFirst = false } = {}) {
  const gestures = solutionGestures(LEVELS[i].layout);
  let start = 0;
  if (useTapFirst) {
    // 第一關第一步：小羊向下兩格，用兩下輕按完成，應只計 1 步
    const first = gestures[0];
    assert.strictEqual(first.type, 'B');
    assert.deepStrictEqual(first.segments, [{ start: [1, 0], d: [0, 1], n: 2 }]);
    await tapPiece(page, 'B', 1, 0);
    assert.strictEqual(await text(page, '#steps'), '1');
    // 小羊此時可上可下：輕按正中不會移動，輕按下半部才向下
    await tapPiece(page, 'B', 1, 1);
    await pieceAt(page, 'B', 1, 1);
    await tapPiece(page, 'B', 1, 1, [0, 1]);
    await pieceAt(page, 'B', 1, 2);
    assert.strictEqual(await text(page, '#steps'), '1', '同一件方塊連續移動應只計 1 步');
    // 撤銷再重做
    await page.click('#btn-undo');
    await page.waitForTimeout(200);
    await pieceAt(page, 'B', 1, 1);
    await tapPiece(page, 'B', 1, 1, [0, 1]);
    await pieceAt(page, 'B', 1, 2);
    start = 1;
  }
  for (let s = start; s < gestures.length; s++) {
    for (const seg of gestures[s].segments) await dragPiece(page, gestures[s].type, seg.start, seg.d, seg.n);
    if (s === Math.floor(gestures.length / 2) && i === 2) await shot(page, 'game-level3-midway');
  }
  return gestures.length;
}

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const errors = [];
  const watch = page => {
    page.on('pageerror', err => errors.push('pageerror: ' + err.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push('console: ' + msg.text() + ' @ ' + msg.location().url); });
    page.on('requestfailed', req => errors.push('requestfailed: ' + req.url() + ' ' + (req.failure() || {}).errorText));
  };
  const ipad = { viewport: { width: 1194, height: 834 }, hasTouch: true, deviceScaleFactor: 1, ignoreHTTPSErrors: true };

  /* 1. 完整玩三關並上榜 */
  let ctx = await browser.newContext({ ...ipad, acceptDownloads: true });
  let page = await ctx.newPage();
  watch(page);
  await page.goto(base);
  await page.waitForSelector('#home:not([hidden])');
  assert.strictEqual(await text(page, '#home-title'), '尋光之旅');
  assert.match(await text(page, '#home-ranks'), /暫時未有紀錄/);
  await page.waitForTimeout(600);
  await shot(page, 'home-empty');

  await page.click('#btn-start');
  await page.waitForSelector('#card [data-act="begin"]');
  assert.strictEqual(await page.locator('#board .piece').count(), 0, '按「開始」前不應顯示方塊');
  await shot(page, 'intro');
  await page.waitForTimeout(1200);
  assert.strictEqual(await text(page, '#timer'), '00:00', '按「開始」前不應計時');
  await page.click('#card [data-act="begin"]');
  await page.waitForTimeout(600);
  assert.strictEqual(await page.locator('#board .piece').count(), 8);
  await shot(page, 'game-level1-start');

  const optimal = [];
  for (let i = 0; i < LEVELS.length; i++) {
    optimal[i] = await playLevel(page, i, { useTapFirst: i === 0 });
    await page.waitForSelector(i < LEVELS.length - 1 ? '#card [data-act="next"]' : '#name-form', { timeout: 5000 });
    const cardText = await text(page, '#card');
    assert.ok(cardText.includes(LEVELS[i].verse.ref), '過關卡應顯示經文出處');
    if (i < LEVELS.length - 1) {
      assert.match(cardText, /過關/);
      assert.ok(cardText.includes(String(optimal[i])), `第 ${i + 1} 關步數應為 ${optimal[i]}`);
      if (i === 0) await shot(page, 'level1-done');
      await page.click('#card [data-act="next"]');
      await page.waitForTimeout(500);
      assert.strictEqual(await text(page, '#level-name'), LEVELS[i + 1].name);
    }
  }
  await shot(page, 'finale');
  assert.deepStrictEqual(optimal, [7, 12, 22]);
  const finale = await text(page, '#card');
  assert.ok(finale.includes(String(7 + 12 + 22)), '總步數應為 41');

  // 暱稱驗證
  await page.click('#name-form button[type="submit"]');
  assert.strictEqual(await text(page, '#name-error'), '請輸入暱稱');
  await page.fill('#name-input', '一二三四五六七八九');
  await page.click('#name-form button[type="submit"]');
  assert.match(await text(page, '#name-error'), /最多 8 個字/);
  await page.fill('#name-input', '  測試小羊  ');
  assert.strictEqual(await text(page, '#name-count'), '4 / 8');
  await page.click('#name-form button[type="submit"]');
  await page.waitForSelector('#card .ranks');
  assert.match(await text(page, '#card h2'), /測試小羊，你排第 1 名/);
  await shot(page, 'result');
  await page.click('#card [data-act="home"]');
  await page.waitForSelector('#home:not([hidden])');
  assert.match(await text(page, '#home-ranks'), /測試小羊/);
  assert.match(await text(page, '#home-ranks'), /41 步/);

  // 重新載入後紀錄仍在
  await page.reload();
  await page.waitForSelector('#home:not([hidden])');
  assert.match(await text(page, '#home-ranks'), /測試小羊/);
  await page.waitForTimeout(600);
  await shot(page, 'home-with-record');

  /* 2. 管理頁：長按標題 → 密碼 → 匯出 → 刪除 */
  const titleBox = await page.locator('#home-title').boundingBox();
  await page.mouse.move(titleBox.x + 40, titleBox.y + 30);
  await page.mouse.down();
  await page.waitForTimeout(2200);
  await page.mouse.up();
  await page.waitForSelector('#pin:not([hidden])');
  for (const k of '1111') await page.click(`#pin-pad [data-key="${k}"]`);
  await page.waitForTimeout(450);
  assert.ok(await page.locator('#pin:not([hidden])').count(), '錯誤密碼不應進入');
  for (const k of '2468') await page.click(`#pin-pad [data-key="${k}"]`);
  await page.waitForSelector('#admin:not([hidden])');
  assert.match(await text(page, '#admin-count'), /1 條/);
  await shot(page, 'admin');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btn-export')]);
  const csv = fs.readFileSync(await download.path(), 'utf8');
  assert.ok(csv.startsWith('﻿名次,暱稱,總用時(秒),總步數'), 'CSV 標題列');
  assert.match(csv, /\r\n1,測試小羊,\d+\.\d,41,/);
  // 調整時限
  await page.click('#admin-limits [data-limit="0"][data-delta="30"]');
  assert.match(await text(page, '#admin-limits'), /4 分 30 秒/);
  await page.click('#admin-limits [data-limit="0"][data-delta="-30"]');
  // 刪除紀錄
  await page.click('#admin-rows [data-del]');
  await page.waitForSelector('#dialog:not([hidden])');
  await page.click('#dialog-ok');
  await page.waitForTimeout(200);
  assert.match(await text(page, '#admin-count'), /0 條/);
  await page.click('#btn-admin-close');
  await page.waitForSelector('#home:not([hidden])');
  assert.match(await text(page, '#home-ranks'), /暫時未有紀錄/);

  /* 3. 結束挑戰 */
  await page.click('#btn-start');
  await page.click('#card [data-act="begin"]');
  await page.click('#btn-quit');
  await page.waitForSelector('#dialog:not([hidden])');
  await page.click('#dialog-ok');
  await page.waitForSelector('#card .levels-done');
  assert.match(await text(page, '#card'), /挑戰結束/);
  assert.match(await text(page, '#card .levels-done'), /^0/);
  await page.click('#card [data-act="home"]');
  await ctx.close();

  /* 4. 時限：把時限改為 3 秒 */
  ctx = await browser.newContext(ipad);
  page = await ctx.newPage();
  watch(page);
  await page.addInitScript(() => localStorage.setItem('xgzl.settings.v1', JSON.stringify({ muted: true, timeLimits: [3, 3, 3] })));
  await page.goto(base);
  await page.click('#btn-start');
  await page.click('#card [data-act="begin"]');
  await page.waitForSelector('#card .levels-done', { timeout: 6000 });
  assert.match(await text(page, '#card h2'), /時間到/);
  await shot(page, 'timeup');
  await ctx.close();

  /* 5. 閒置自動返回主頁 */
  ctx = await browser.newContext(ipad);
  page = await ctx.newPage();
  watch(page);
  await page.route('**/js/config.js', async route => {
    const body = fs.readFileSync(path.join(ROOT, 'js/config.js'), 'utf8') + '\nwindow.GAME_CONFIG.idleSeconds = 2; window.GAME_CONFIG.idleCountdownSeconds = 2;';
    await route.fulfill({ body, contentType: 'text/javascript' });
  });
  await page.goto(base);
  await page.click('#btn-start');
  await page.waitForSelector('#idle:not([hidden])', { timeout: 5000 });
  await page.waitForSelector('#home:not([hidden])', { timeout: 5000 });
  await ctx.close();

  /* 6. 其他畫面尺寸截圖 */
  if (SHOTS) {
    for (const vp of [{ name: 'ipad13', width: 1366, height: 1024 }, { name: 'phone', width: 390, height: 844 }]) {
      ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: true, ignoreHTTPSErrors: true });
      page = await ctx.newPage();
      watch(page);
      await page.goto(base);
      await page.waitForTimeout(600);
      await shot(page, vp.name + '-home');
      await page.click('#btn-start');
      await page.click('#card [data-act="begin"]');
      await page.waitForTimeout(600);
      await shot(page, vp.name + '-game');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.strictEqual(overflow, false, vp.name + ' 不應左右捲動');
      await ctx.close();
    }
  }

  await browser.close();
  server.close();
  assert.deepStrictEqual(errors, [], '瀏覽器不應有錯誤');
  console.log('E2E 全部通過');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
