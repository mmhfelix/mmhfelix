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
const CONFIG = sandbox.window.GAME_CONFIG;
const LEVELS = CONFIG.levels;
const BOARD = CONFIG.board;

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

const cellSize = page => page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('game')).getPropertyValue('--cell')));
const piece = (page, letter) => page.locator(`#board .piece[data-letter="${letter}"]`);
const posOf = async (page, letter) => {
  const el = piece(page, letter);
  return [Number(await el.getAttribute('data-x')), Number(await el.getAttribute('data-y'))];
};
const text = (page, sel) => page.locator(sel).innerText();

async function drag(page, letter, dx, dy) {
  const cell = await cellSize(page);
  const box = await piece(page, letter).boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + dx * cell * 0.5, cy + dy * cell * 0.5, { steps: 4 });
  await page.mouse.move(cx + dx * cell, cy + dy * cell, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(200);
}

// toward：輕按方塊偏向哪一端（[0, 0] 為正中）
async function tap(page, letter, toward = [0, 0]) {
  const box = await piece(page, letter).boundingBox();
  await page.mouse.click(box.x + box.width / 2 + toward[0] * box.width * 0.35, box.y + box.height / 2 + toward[1] * box.height * 0.35);
  await page.waitForTimeout(200);
}

async function shot(page, name) {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, name + '.png') });
}

// 第一關開局：測試輕按、只可沿長邊移動、同一件連續移動計 1 步、撤銷
async function checkControls(page) {
  assert.deepStrictEqual(await posOf(page, 'X'), [3, 2]);
  await drag(page, 'X', 1, 0);
  assert.deepStrictEqual(await posOf(page, 'X'), [3, 2], '直放的小羊不可橫移');
  await drag(page, 'E', 0, -1);
  assert.deepStrictEqual(await posOf(page, 'E'), [1, 4], '橫放的方塊不可上移');
  assert.strictEqual(await text(page, '#steps'), '0');
  await tap(page, 'X');
  assert.deepStrictEqual(await posOf(page, 'X'), [3, 1], '只可向上時，輕按任何位置都向上');
  await tap(page, 'X');
  assert.deepStrictEqual(await posOf(page, 'X'), [3, 1], '可上可下時，輕按正中不移動');
  await tap(page, 'X', [0, 1]);
  assert.deepStrictEqual(await posOf(page, 'X'), [3, 2], '輕按下端向下');
  assert.strictEqual(await text(page, '#steps'), '1', '同一件方塊連續移動只計 1 步');
  await tap(page, 'E');
  assert.deepStrictEqual(await posOf(page, 'E'), [0, 4]);
  assert.strictEqual(await text(page, '#steps'), '2');
  for (let i = 0; i < 3; i++) {
    await page.click('#btn-undo');
    await page.waitForTimeout(150);
  }
  assert.deepStrictEqual(await posOf(page, 'X'), [3, 2]);
  assert.deepStrictEqual(await posOf(page, 'E'), [1, 4]);
  assert.strictEqual(await text(page, '#steps'), '0');
  assert.ok(await page.isDisabled('#btn-undo'));
}

async function playLevel(page, i) {
  const { moves } = Core.solve(LEVELS[i].layout, BOARD);
  for (const [k, m] of moves.entries()) {
    const [x, y] = await posOf(page, m.letter);
    await drag(page, m.letter, m.dx, m.dy);
    if (k < moves.length - 1) assert.deepStrictEqual(await posOf(page, m.letter), [x + m.dx, y + m.dy], `${m.letter} 應移到新位置`);
    if (i === 2 && k === 14) await shot(page, 'game-level3-midway');
  }
  return moves.length;
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
  const ipad = { viewport: { width: 1194, height: 834 }, hasTouch: true, deviceScaleFactor: 1 };

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
  await page.waitForTimeout(500);
  await shot(page, 'intro');
  await page.waitForTimeout(700);
  assert.strictEqual(await text(page, '#timer'), '00:00', '按「開始」前不應計時');
  await page.click('#card [data-act="begin"]');
  await page.waitForTimeout(600);
  assert.strictEqual(await page.locator('#board .piece').count(), 6);
  await shot(page, 'game-level1-start');
  await checkControls(page);

  const optimal = [];
  for (let i = 0; i < LEVELS.length; i++) {
    optimal[i] = await playLevel(page, i);
    await page.waitForSelector(i < LEVELS.length - 1 ? '#card [data-act="next"]' : '#name-form', { timeout: 5000 });
    const cardText = await text(page, '#card');
    assert.ok(cardText.includes(LEVELS[i].verse.ref), '過關卡應顯示經文出處');
    if (i < LEVELS.length - 1) {
      assert.match(cardText, /過關/);
      assert.ok(cardText.includes(String(optimal[i])), `第 ${i + 1} 關步數應為 ${optimal[i]}`);
      if (i === 0) {
        await page.waitForTimeout(400);
        await shot(page, 'level1-done');
      }
      await page.click('#card [data-act="next"]');
      await page.waitForTimeout(500);
      assert.strictEqual(await text(page, '#level-name'), LEVELS[i + 1].name);
      if (i === 0) await shot(page, 'game-level2-start');
    }
  }
  assert.deepStrictEqual(optimal, [6, 17, 29]);
  await page.waitForTimeout(400);
  await shot(page, 'finale');
  assert.ok((await text(page, '#card')).includes('52'), '總步數應為 52');

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
  await page.waitForTimeout(400);
  await shot(page, 'result');
  await page.click('#card [data-act="home"]');
  await page.waitForSelector('#home:not([hidden])');
  assert.match(await text(page, '#home-ranks'), /測試小羊/);
  assert.match(await text(page, '#home-ranks'), /52 步/);

  // 重新載入後紀錄仍在
  await page.reload();
  await page.waitForSelector('#home:not([hidden])');
  assert.match(await text(page, '#home-ranks'), /測試小羊/);
  await page.waitForTimeout(600);
  await shot(page, 'home-with-record');

  /* 2. 管理頁：長按標題 → 密碼 → 匯出 → 時限 → 刪除 */
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
  assert.match(csv, /\r\n1,測試小羊,\d+\.\d,52,/);
  await page.click('#admin-limits [data-limit="0"][data-delta="30"]');
  assert.match(await text(page, '#admin-limits'), /4 分 30 秒/);
  await page.click('#admin-limits [data-limit="0"][data-delta="-30"]');
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
  await page.waitForTimeout(400);
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

  /* 6. 其他畫面尺寸 */
  for (const vp of [{ name: 'ipad13', width: 1366, height: 1024 }, { name: 'phone', width: 390, height: 844 }]) {
    ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: true });
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

  await browser.close();
  server.close();
  assert.deepStrictEqual(errors, [], '瀏覽器不應有錯誤');
  console.log('E2E 全部通過');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
