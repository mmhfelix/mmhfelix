/*
 * 尋光之旅 — 畫面與互動
 * 流程：主頁 → 第一關說明 → 開始（計時）→ 過關 → 開始下一關 → … → 第三關完成 → 輸入暱稱 → 龍虎榜
 */
(function () {
  'use strict';

  const CONFIG = window.GAME_CONFIG;
  const Core = window.HRDCore;
  const LEVELS = CONFIG.levels;
  const KEY_RECORDS = 'xgzl.records.v1';
  const KEY_SETTINGS = 'xgzl.settings.v1';
  const NUMERALS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

  const $ = sel => document.querySelector(sel);
  const app = $('#app');
  const board = $('#board');

  /* ---------- 儲存（每部機各自保存） ---------- */
  let storageOk = true;
  const memory = {};

  function load(key, fallback) {
    let raw = null;
    try {
      raw = localStorage.getItem(key);
    } catch (err) {
      storageOk = false;
      return key in memory ? memory[key] : fallback;
    }
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function save(key, value) {
    memory[key] = value;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      storageOk = false;
      return false;
    }
  }

  const settings = Object.assign({ muted: false, timeLimits: [] }, load(KEY_SETTINGS, {}));
  let records = load(KEY_RECORDS, []);
  if (!Array.isArray(records)) records = [];

  function timeLimit(i) {
    const t = settings.timeLimits && settings.timeLimits[i];
    return typeof t === 'number' && t > 0 ? t : LEVELS[i].timeLimit;
  }

  // 總用時最短排先；同時間比總步數；再同則先完成者排先
  function ranked() {
    return records.slice().sort((a, b) => a.total - b.total || a.steps - b.steps || a.at - b.at);
  }

  /* ---------- 格式 ---------- */
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const cssUrl = path => 'url("' + encodeURI(path) + '")';

  function fmtClock(ms) {
    const s = Math.floor(ms / 1000);
    return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  }
  function fmtTime(ms) {
    const tenths = Math.floor(ms / 100);
    return Math.floor(tenths / 600) + ':' + pad(Math.floor(tenths / 10) % 60) + '.' + (tenths % 10);
  }
  function fmtLimit(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (!s) return m + ' 分鐘';
    return (m ? m + ' 分 ' : '') + s + ' 秒';
  }
  function fmtDate(ms) {
    try {
      return new Date(ms).toLocaleString('zh-HK', {
        timeZone: 'Asia/Hong_Kong', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
      });
    } catch (err) {
      return new Date(ms).toISOString().slice(5, 16).replace('T', ' ');
    }
  }
  const numeral = n => NUMERALS[n] || String(n);

  /* ---------- 音效（無需音檔） ---------- */
  const Sound = (function () {
    let ctx = null;
    function audio() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { ctx = new AC(); } catch (err) { return null; }
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    }
    function note(freq, at, dur, type, vol) {
      if (settings.muted) return;
      const c = audio();
      if (!c) return;
      const t = c.currentTime + at;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    }
    return {
      unlock() { audio(); },
      move() { note(660, 0, 0.09, 'triangle', 0.07); },
      win() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(f, i * 0.11, 0.55, 'sine', 0.12)); },
      finale() { [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => note(f, i * 0.12, 0.9, 'sine', 0.11)); },
      fail() { [392, 311.13].forEach((f, i) => note(f, i * 0.24, 0.5, 'triangle', 0.1)); },
    };
  })();

  /* ---------- 畫面切換 ---------- */
  function showScreen(name) {
    for (const id of ['home', 'game', 'admin']) $('#' + id).hidden = id !== name;
    app.dataset.screen = name;
  }

  function rowHtml(rec, rank, me) {
    return `<li class="${me ? 'me' : ''}"><span class="rank">${rank}</span><span class="name">${esc(rec.name)}</span>` +
      `<span class="time">${fmtTime(rec.total)}</span><span class="moves">${rec.steps} 步</span></li>`;
  }

  function ranksHtml(list, meId) {
    if (!list.length) return '<li class="empty">暫時未有紀錄。<br>完成三關，成為第一位登上龍虎榜的人！</li>';
    return list.map((r, i) => rowHtml(r, i + 1, r.id === meId)).join('');
  }

  function renderHome() {
    $('#home').style.backgroundImage = cssUrl(CONFIG.images.home);
    $('#home-title').textContent = CONFIG.title;
    $('#home-subtitle').textContent = CONFIG.subtitle;
    $('#home-story').textContent = CONFIG.story;
    $('#home-howto').innerHTML = CONFIG.howTo.map(t => `<li>${esc(t)}</li>`).join('');
    $('#home-ranks').innerHTML = ranksHtml(ranked().slice(0, CONFIG.leaderboardSize));
  }

  /* ---------- 遊戲狀態 ---------- */
  const game = { level: 0, phase: 'idle', pieces: [], history: [], steps: 0, startAt: 0, elapsed: 0, raf: 0, results: [] };
  const pieceEls = new Map();
  let cell = 100;
  let drag = null;
  let exitTimer = 0;

  function pieceImage(type, level) {
    return (level.pieces && level.pieces[type]) || CONFIG.images.pieces[type];
  }

  function startJourney() {
    Sound.unlock();
    requestWakeLock();
    game.results = [];
    showScreen('game');
    prepareLevel(0);
    showCard(introCard());
  }

  function prepareLevel(i) {
    const level = LEVELS[i];
    game.level = i;
    game.phase = 'ready';
    game.pieces = Core.parseLayout(level.layout);
    game.history = [];
    game.steps = 0;
    game.elapsed = 0;
    $('#game').style.backgroundImage = cssUrl(level.background);
    board.style.backgroundImage = cssUrl(CONFIG.images.board);
    $('#exit-glow').style.backgroundImage = cssUrl(CONFIG.images.exit);
    clearPieces();
    fitBoard();
    updateHud();
  }

  // 按「開始」才擺出棋子及開始計時，避免玩家預先思考
  function beginLevel() {
    hideCard();
    buildPieces(true);
    game.phase = 'playing';
    game.startAt = performance.now();
    game.elapsed = 0;
    updateHud();
    tick();
  }

  function clearPieces() {
    board.textContent = '';
    pieceEls.clear();
  }

  function buildPieces(appear) {
    clearPieces();
    const level = LEVELS[game.level];
    for (const p of game.pieces) {
      const el = document.createElement('div');
      el.className = 'piece' + (p.type === 'B' ? ' lamb' : '') + (appear ? ' appear' : '');
      el.dataset.id = p.id;
      el.dataset.type = p.type;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.style.backgroundImage = cssUrl(pieceImage(p.type, level));
      el.appendChild(tile);
      board.appendChild(el);
      pieceEls.set(p.id, el);
      placePiece(p, false);
    }
    if (appear) setTimeout(() => pieceEls.forEach(el => el.classList.remove('appear')), 500);
  }

  function setOffset(el, p, ox, oy) {
    el.style.transform = `translate3d(${p.x * cell + ox}px, ${p.y * cell + oy}px, 0)`;
  }

  function placePiece(p, animate) {
    const el = pieceEls.get(p.id);
    if (!el) return;
    el.style.width = p.w * cell + 'px';
    el.style.height = p.h * cell + 'px';
    el.dataset.x = p.x;
    el.dataset.y = p.y;
    if (!animate) el.style.transition = 'none';
    setOffset(el, p, 0, 0);
    if (!animate) {
      void el.offsetWidth;
      el.style.transition = '';
    }
  }

  function fitBoard() {
    if (app.dataset.screen !== 'game') return;
    const area = $('#board-area').getBoundingClientRect();
    if (!area.width || !area.height) return;
    // 棋盤 4 × 5 格，加外框及底部出口光暈
    cell = Math.max(36, Math.floor(Math.min(area.width / 4.3, area.height / 5.65)));
    $('#game').style.setProperty('--cell', cell + 'px');
    for (const p of game.pieces) placePiece(p, false);
  }

  /* ---------- 拖動及輕按 ---------- */
  board.addEventListener('pointerdown', e => {
    if (game.phase !== 'playing' || drag) return;
    const el = e.target.closest('.piece');
    if (!el) return;
    e.preventDefault();
    const p = game.pieces[Number(el.dataset.id)];
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* 部分瀏覽器不支援 */ }
    const r = el.getBoundingClientRect();
    drag = {
      p, el, pointer: e.pointerId, sx: e.clientX, sy: e.clientY, axis: null, offset: 0,
      fx: (e.clientX - (r.left + r.width / 2)) / (r.width / 2),
      fy: (e.clientY - (r.top + r.height / 2)) / (r.height / 2),
      range: {
        left: Core.reach(game.pieces, p, -1, 0),
        right: Core.reach(game.pieces, p, 1, 0),
        up: Core.reach(game.pieces, p, 0, -1),
        down: Core.reach(game.pieces, p, 0, 1),
      },
    };
    el.classList.add('dragging');
  });

  board.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.pointer || game.phase !== 'playing') return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.axis) {
      if (Math.hypot(dx, dy) < 10) return;
      const canX = drag.range.left + drag.range.right > 0;
      const canY = drag.range.up + drag.range.down > 0;
      if (Math.abs(dx) >= Math.abs(dy)) drag.axis = canX ? 'x' : canY ? 'y' : 'none';
      else drag.axis = canY ? 'y' : canX ? 'x' : 'none';
    }
    if (drag.axis === 'none') return;
    const along = drag.axis === 'x' ? dx : dy;
    const lo = -(drag.axis === 'x' ? drag.range.left : drag.range.up) * cell;
    const hi = (drag.axis === 'x' ? drag.range.right : drag.range.down) * cell;
    drag.offset = Math.max(lo, Math.min(hi, along));
    setOffset(drag.el, drag.p, drag.axis === 'x' ? drag.offset : 0, drag.axis === 'y' ? drag.offset : 0);
  });

  function endDrag(e, cancelled) {
    if (!drag || e.pointerId !== drag.pointer) return;
    const d = drag;
    drag = null;
    d.el.classList.remove('dragging');
    if (game.phase !== 'playing' || cancelled) return placePiece(d.p, true);
    if (!d.axis) return tapPiece(d);
    if (d.axis === 'none') return wiggle(d.el);
    let n = Math.round(d.offset / cell);
    if (n === 0 && Math.abs(d.offset) >= cell * 0.3) n = Math.sign(d.offset);
    if (n === 0) return placePiece(d.p, true);
    movePiece(d.p, d.axis === 'x' ? n : 0, d.axis === 'y' ? n : 0);
  }
  board.addEventListener('pointerup', e => endDrag(e, false));
  board.addEventListener('pointercancel', e => endDrag(e, true));

  // 輕按：只有一個方向可移便直接移；多於一個方向時按較接近的一邊
  function tapPiece(d) {
    const dirs = Core.legalDirections(game.pieces, d.p);
    let dir = dirs.length === 1 ? dirs[0] : null;
    if (dirs.length > 1) {
      let best = 0.25;
      for (const name of dirs) {
        const dot = Core.DIRS[name][0] * d.fx + Core.DIRS[name][1] * d.fy;
        if (dot > best) { best = dot; dir = name; }
      }
    }
    if (!dir) return wiggle(d.el);
    movePiece(d.p, Core.DIRS[dir][0], Core.DIRS[dir][1]);
  }

  function wiggle(el) {
    el.classList.remove('wiggle');
    void el.offsetWidth;
    el.classList.add('wiggle');
  }

  function movePiece(p, dx, dy) {
    game.history.push({ id: p.id, fx: p.x, fy: p.y, tx: p.x + dx, ty: p.y + dy });
    p.x += dx;
    p.y += dy;
    game.steps = Core.countSteps(game.history);
    placePiece(p, true);
    Sound.move();
    updateHud();
    if (Core.isSolved(game.pieces)) levelSolved();
  }

  function undo() {
    if (game.phase !== 'playing') return;
    const m = game.history.pop();
    if (!m) return;
    const p = game.pieces[m.id];
    p.x = m.fx;
    p.y = m.fy;
    game.steps = Core.countSteps(game.history);
    placePiece(p, true);
    updateHud();
  }

  async function resetBoard() {
    if (game.phase !== 'playing' || !game.history.length) return;
    const ok = await confirmDialog({ title: '重新排列？', body: '方塊會回到本關起點，步數重新計算；用時會繼續計算。', ok: '重新排列' });
    if (!ok || game.phase !== 'playing') return;
    game.pieces = Core.parseLayout(LEVELS[game.level].layout);
    game.history = [];
    game.steps = 0;
    buildPieces(true);
    updateHud();
  }

  async function quit() {
    if (game.phase !== 'playing') return;
    const done = game.level;
    const ok = await confirmDialog({
      title: '結束挑戰？',
      body: (done ? `你已完成 ${done} 關。` : '你仍未完成第一關。') + '結束後不會登上龍虎榜。',
      ok: '結束挑戰',
      danger: true,
    });
    if (!ok || game.phase !== 'playing') return;
    stopClock('over');
    showCard(overCard('quit'));
  }

  /* ---------- 計時 ---------- */
  function tick() {
    if (game.phase !== 'playing') return;
    const limit = timeLimit(game.level) * 1000;
    game.elapsed = performance.now() - game.startAt;
    if (game.elapsed >= limit) {
      game.elapsed = limit;
      stopClock('over');
      Sound.fail();
      showCard(overCard('timeup'));
      return;
    }
    updateClock();
    game.raf = requestAnimationFrame(tick);
  }

  function stopClock(phase) {
    cancelAnimationFrame(game.raf);
    game.phase = phase;
    closeDialog(false);
    if (drag) {
      drag.el.classList.remove('dragging');
      drag = null;
    }
    updateHud();
  }

  function updateClock() {
    const limit = timeLimit(game.level) * 1000;
    const left = Math.max(0, limit - game.elapsed);
    $('#timer').textContent = fmtClock(game.elapsed);
    $('#limit-fill').style.transform = `scaleX(${left / limit})`;
    $('#limit-text').textContent = '剩餘 ' + fmtClock(Math.ceil(left / 1000) * 1000);
    $('#limit').classList.toggle('low', left <= 30000);
  }

  function updateHud() {
    const level = LEVELS[game.level];
    const playing = game.phase === 'playing';
    $('#level-name').textContent = level.name;
    $('#level-title').textContent = level.title;
    $('#steps').textContent = game.steps;
    $('#btn-undo').disabled = !playing || !game.history.length;
    $('#btn-reset').disabled = !playing || !game.history.length;
    $('#btn-quit').disabled = !playing;
    document.querySelectorAll('#progress li').forEach((li, i) => {
      li.className = i < game.level || (i === game.level && game.results[i]) ? 'done' : i === game.level ? 'current' : '';
    });
    updateClock();
  }

  function levelSolved() {
    game.elapsed = performance.now() - game.startAt;
    game.results[game.level] = { time: game.elapsed, steps: game.steps };
    stopClock('won');
    const lamb = game.pieces.find(p => p.type === 'B');
    const el = pieceEls.get(lamb.id);
    el.classList.add('exiting');
    setOffset(el, lamb, 0, cell * 2.2);
    const last = game.level === LEVELS.length - 1;
    if (last) Sound.finale(); else Sound.win();
    clearTimeout(exitTimer);
    exitTimer = setTimeout(() => {
      if (game.phase !== 'won') return;
      if (last) showCard(finaleCard(), true);
      else showCard(levelDoneCard());
    }, 1100);
  }

  /* ---------- 卡片 ---------- */
  function showCard(html, top) {
    $('#card').innerHTML = html;
    $('#card-layer').classList.toggle('top', !!top);
    $('#card-layer').hidden = false;
    $('#card').scrollTop = 0;
  }

  function hideCard() {
    $('#card-layer').hidden = true;
    $('#card').innerHTML = '';
  }

  const verseHtml = v => (v && v.text ? `<blockquote class="verse">「${esc(v.text)}」<cite>${esc(v.ref || '')}</cite></blockquote>` : '');
  const totals = () => game.results.reduce((acc, r) => ({ time: acc.time + r.time, steps: acc.steps + r.steps }), { time: 0, steps: 0 });

  function introCard() {
    const level = LEVELS[0];
    return `
      <p class="eyebrow">${esc(level.name)} · ${esc(level.title)}</p>
      <h2>準備出發</h2>
      <ol class="howto">${CONFIG.howTo.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
      <button type="button" class="btn btn-primary btn-xl" data-act="begin">開始</button>
      <p class="meta">本關時限 ${fmtLimit(timeLimit(0))} · 按「開始」後才計時</p>
      <button type="button" class="btn btn-ghost" data-act="home">返回主頁</button>`;
  }

  function levelDoneCard() {
    const i = game.level;
    const level = LEVELS[i];
    const next = LEVELS[i + 1];
    const r = game.results[i];
    return `
      <p class="eyebrow">${esc(level.name)}完成</p>
      <h2>過關！</h2>
      ${verseHtml(level.verse)}
      <div class="result-row"><div><b>${fmtTime(r.time)}</b><span>用時</span></div><div><b>${r.steps}</b><span>步數</span></div></div>
      <button type="button" class="btn btn-primary btn-xl" data-act="next">開始${esc(next.name)}</button>
      <p class="meta">${esc(next.name)}「${esc(next.title)}」時限 ${fmtLimit(timeLimit(i + 1))} · 按下即開始計時</p>`;
  }

  function finaleCard() {
    const t = totals();
    return `
      <p class="eyebrow">${numeral(LEVELS.length)}關全部完成</p>
      <h2>恭喜你完成${esc(CONFIG.title)}！</h2>
      <div class="result-row"><div><b>${fmtTime(t.time)}</b><span>總用時</span></div><div><b>${t.steps}</b><span>總步數</span></div></div>
      <form class="name-form" id="name-form" autocomplete="off" novalidate>
        <label for="name-input">輸入暱稱，登上龍虎榜</label>
        <div class="name-row">
          <input class="name-input" id="name-input" name="nickname" type="text" placeholder="暱稱" enterkeyhint="done" autocapitalize="off" autocorrect="off" spellcheck="false">
          <button type="submit" class="btn btn-primary">上榜</button>
        </div>
        <p class="name-help"><span id="name-count">0 / ${CONFIG.nameMaxLength}</span><span class="error" id="name-error"></span></p>
      </form>
      ${verseHtml(LEVELS[LEVELS.length - 1].verse)}`;
  }

  function overCard(reason) {
    const done = game.level;
    const level = LEVELS[game.level];
    const lead = done ? `你完成了 ${done} 關，做得好！歡迎再來挑戰。` : '今次未能完成第一關，歡迎再來挑戰！';
    return `
      <p class="eyebrow">${esc(level.name)} · ${esc(level.title)}</p>
      <h2>${reason === 'timeup' ? '時間到！' : '挑戰結束'}</h2>
      <div class="levels-done">${done}<small>/ ${LEVELS.length} 關</small></div>
      <p class="lead">${lead}</p>
      <button type="button" class="btn btn-primary btn-xl" data-act="home">返回主頁</button>`;
  }

  let resultTimer = 0;
  function resultCard(rec, savedOk) {
    const list = ranked();
    const rank = list.findIndex(r => r.id === rec.id) + 1;
    let rows = ranksHtml(list.slice(0, CONFIG.leaderboardSize), rec.id);
    if (rank > CONFIG.leaderboardSize) rows += '<li class="gap">⋯</li>' + rowHtml(rec, rank, true);
    return `
      <p class="eyebrow">龍虎榜</p>
      <h2><span class="ui-font">${esc(rec.name)}</span>，你排第 ${rank} 名！</h2>
      <ol class="ranks">${rows}</ol>
      ${savedOk ? '' : '<p class="meta">這部機未能儲存紀錄，請通知職員。</p>'}
      <button type="button" class="btn btn-primary btn-xl" data-act="home">完成</button>
      <p class="meta"><span id="auto-return">${CONFIG.resultAutoReturnSeconds}</span> 秒後自動返回主頁</p>`;
  }

  function nameLength(value) {
    return Array.from(value.trim()).length;
  }

  function updateNameCount() {
    const input = $('#name-input');
    if (!input) return;
    const n = nameLength(input.value);
    $('#name-count').textContent = `${n} / ${CONFIG.nameMaxLength}`;
    if (n <= CONFIG.nameMaxLength) $('#name-error').textContent = '';
  }

  function submitName() {
    const input = $('#name-input');
    const name = input.value.trim().replace(/\s+/g, ' ');
    const n = nameLength(name);
    if (!n) {
      $('#name-error').textContent = '請輸入暱稱';
      return;
    }
    if (n > CONFIG.nameMaxLength) {
      $('#name-error').textContent = `暱稱最多 ${CONFIG.nameMaxLength} 個字`;
      return;
    }
    input.blur();
    const t = totals();
    const rec = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name,
      total: Math.round(t.time),
      steps: t.steps,
      times: game.results.map(r => Math.round(r.time)),
      moves: game.results.map(r => r.steps),
      at: Date.now(),
    };
    records.push(rec);
    const ok = save(KEY_RECORDS, records);
    game.phase = 'done';
    showCard(resultCard(rec, ok));
    startResultCountdown();
  }

  function startResultCountdown() {
    clearInterval(resultTimer);
    let left = CONFIG.resultAutoReturnSeconds;
    resultTimer = setInterval(() => {
      left -= 1;
      const el = $('#auto-return');
      if (el) el.textContent = left;
      if (left <= 0) goHome();
    }, 1000);
  }

  $('#card').addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'begin' && game.phase === 'ready') beginLevel();
    else if (act === 'next' && game.phase === 'won') {
      prepareLevel(game.level + 1);
      beginLevel();
    } else if (act === 'home') goHome();
  });
  $('#card').addEventListener('submit', e => {
    if (e.target.id !== 'name-form') return;
    e.preventDefault();
    submitName();
  });
  $('#card').addEventListener('input', e => {
    if (e.target.id === 'name-input') updateNameCount();
  });

  function goHome() {
    cancelAnimationFrame(game.raf);
    clearTimeout(exitTimer);
    clearInterval(resultTimer);
    resultTimer = 0;
    game.phase = 'idle';
    game.pieces = [];
    drag = null;
    closeDialog(false);
    hideIdle();
    hideCard();
    clearPieces();
    $('#pin').hidden = true;
    renderHome();
    showScreen('home');
  }

  /* ---------- 確認視窗 ---------- */
  let dialogResolve = null;
  function confirmDialog({ title, body, ok = '確定', cancel = '取消', danger = false }) {
    closeDialog(false);
    $('#dialog-title').textContent = title;
    $('#dialog-body').textContent = body;
    $('#dialog-ok').textContent = ok;
    $('#dialog-cancel').textContent = cancel;
    $('#dialog .dialog').classList.toggle('danger', danger);
    $('#dialog').hidden = false;
    return new Promise(resolve => { dialogResolve = resolve; });
  }
  function closeDialog(result) {
    $('#dialog').hidden = true;
    if (!dialogResolve) return;
    const resolve = dialogResolve;
    dialogResolve = null;
    resolve(result);
  }
  $('#dialog-ok').addEventListener('click', () => closeDialog(true));
  $('#dialog-cancel').addEventListener('click', () => closeDialog(false));

  /* ---------- 閒置 ---------- */
  let lastActive = Date.now();
  let idleShown = false;
  ['pointerdown', 'keydown'].forEach(type => document.addEventListener(type, () => { lastActive = Date.now(); }, true));

  function hideIdle() {
    idleShown = false;
    $('#idle').hidden = true;
  }
  $('#idle').addEventListener('pointerdown', hideIdle);

  setInterval(() => {
    if (app.dataset.screen === 'home' || resultTimer) return;
    const idleFor = (Date.now() - lastActive) / 1000;
    if (!idleShown && idleFor >= CONFIG.idleSeconds) {
      idleShown = true;
      $('#idle').hidden = false;
    }
    if (idleShown) {
      const left = Math.max(0, Math.ceil(CONFIG.idleSeconds + CONFIG.idleCountdownSeconds - idleFor));
      $('#idle-count').textContent = left;
      if (left <= 0) goHome();
    }
  }, 500);

  /* ---------- 管理頁 ---------- */
  let pressTimer = 0;
  const title = $('#home-title');
  title.addEventListener('pointerdown', () => {
    clearTimeout(pressTimer);
    pressTimer = setTimeout(openPin, 2000);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => title.addEventListener(type, () => clearTimeout(pressTimer)));

  let pinValue = '';
  const pinLength = String(CONFIG.adminPin).length;
  function renderPin() {
    $('#pin-dots').innerHTML = Array.from({ length: pinLength }, (_, i) => `<i class="${i < pinValue.length ? 'on' : ''}"></i>`).join('');
  }
  function openPin() {
    pinValue = '';
    renderPin();
    $('#pin').hidden = false;
  }
  $('#pin-pad').addEventListener('click', e => {
    const btn = e.target.closest('[data-key]');
    if (!btn) return;
    const key = btn.dataset.key;
    if (key === 'cancel') {
      $('#pin').hidden = true;
      return;
    }
    if (key === 'back') pinValue = pinValue.slice(0, -1);
    else if (pinValue.length < pinLength) pinValue += key;
    renderPin();
    if (pinValue.length < pinLength) return;
    if (pinValue === String(CONFIG.adminPin)) {
      $('#pin').hidden = true;
      openAdmin();
    } else {
      const dots = $('#pin-dots');
      dots.classList.remove('shake');
      void dots.offsetWidth;
      dots.classList.add('shake');
      pinValue = '';
      setTimeout(renderPin, 380);
    }
  });

  function openAdmin() {
    adminMessage('');
    renderAdmin();
    showScreen('admin');
  }

  function adminMessage(text) {
    $('#admin-msg').textContent = text;
  }

  function renderAdmin() {
    const list = ranked();
    $('#admin-count').textContent = `龍虎榜紀錄（${list.length} 條）`;
    $('#admin-rows').innerHTML = list.length
      ? list.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td>${fmtTime(r.total)}</td><td>${r.steps}</td>` +
          LEVELS.map((_, j) => `<td>${r.times[j] != null ? fmtTime(r.times[j]) + '（' + r.moves[j] + ' 步）' : '—'}</td>`).join('') +
          `<td>${esc(fmtDate(r.at))}</td><td><button type="button" class="btn btn-danger" data-del="${esc(r.id)}">刪除</button></td></tr>`).join('')
      : `<tr><td class="none" colspan="${LEVELS.length + 6}">暫時未有紀錄</td></tr>`;
    $('#admin-limits').innerHTML = LEVELS.map((level, i) => `
      <div class="limit-item"><span>${esc(level.name)}「${esc(level.title)}」</span>
        <div class="stepper"><button type="button" class="btn" data-limit="${i}" data-delta="-30" aria-label="減少 30 秒">−</button><b>${fmtLimit(timeLimit(i))}</b><button type="button" class="btn" data-limit="${i}" data-delta="30" aria-label="增加 30 秒">＋</button></div>
      </div>`).join('');
    $('#admin-status').textContent = storageOk
      ? `紀錄儲存在這部機的瀏覽器內（共 ${records.length} 條）。清除 Safari 網站資料或使用私密瀏覽會令紀錄消失，請定期匯出備份。`
      : '注意：這部機目前無法儲存紀錄（可能正使用私密瀏覽）。重新整理後紀錄會消失。';
  }

  $('#admin-rows').addEventListener('click', async e => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    const rec = records.find(r => r.id === btn.dataset.del);
    if (!rec) return;
    const ok = await confirmDialog({ title: '刪除紀錄？', body: `會刪除「${rec.name}」（${fmtTime(rec.total)}）。此操作不能復原。`, ok: '刪除', danger: true });
    if (!ok) return;
    records = records.filter(r => r.id !== rec.id);
    save(KEY_RECORDS, records);
    adminMessage(`已刪除「${rec.name}」`);
    renderAdmin();
  });

  $('#admin-limits').addEventListener('click', e => {
    const btn = e.target.closest('[data-limit]');
    if (!btn) return;
    const i = Number(btn.dataset.limit);
    const next = Math.min(1200, Math.max(60, timeLimit(i) + Number(btn.dataset.delta)));
    settings.timeLimits = LEVELS.map((_, j) => (j === i ? next : timeLimit(j)));
    save(KEY_SETTINGS, settings);
    renderAdmin();
  });

  $('#btn-clear').addEventListener('click', async () => {
    if (!records.length) return adminMessage('沒有紀錄需要清除');
    const ok = await confirmDialog({ title: '清除全部紀錄？', body: `會刪除全部 ${records.length} 條紀錄。建議先匯出備份。此操作不能復原。`, ok: '全部清除', danger: true });
    if (!ok) return;
    records = [];
    save(KEY_RECORDS, records);
    adminMessage('已清除全部紀錄');
    renderAdmin();
  });

  function csvText() {
    const field = v => {
      let s = String(v);
      if (/^[=+\-@]/.test(s)) s = "'" + s; // 防止試算表把暱稱當成公式
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const head = ['名次', '暱稱', '總用時(秒)', '總步數'];
    LEVELS.forEach(level => head.push(level.name + '用時(秒)', level.name + '步數'));
    head.push('完成時間(香港)');
    const rows = ranked().map((r, i) => {
      const row = [i + 1, r.name, (r.total / 1000).toFixed(1), r.steps];
      LEVELS.forEach((_, j) => row.push(r.times[j] != null ? (r.times[j] / 1000).toFixed(1) : '', r.moves[j] != null ? r.moves[j] : ''));
      row.push(fmtDate(r.at));
      return row.map(field).join(',');
    });
    return [head.map(field).join(',')].concat(rows).join('\r\n');
  }

  $('#btn-export').addEventListener('click', async () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `${CONFIG.title}龍虎榜-${stamp}.csv`;
    const blob = new Blob(['﻿' + csvText()], { type: 'text/csv;charset=utf-8' });
    try {
      const file = new File([blob], filename, { type: 'text/csv' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        adminMessage('已開啟分享選單，可儲存到「檔案」或用 AirDrop／電郵傳送。');
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return adminMessage('已取消匯出');
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    adminMessage(`已下載 ${filename}。如沒有反應，請改用「複製 CSV」。`);
  });

  $('#btn-copy').addEventListener('click', () => {
    const text = csvText();
    if (!navigator.clipboard || !navigator.clipboard.writeText) return adminMessage('這部機不支援複製，請改用「匯出 CSV」。');
    navigator.clipboard.writeText(text)
      .then(() => adminMessage('已複製，可貼到 Excel、Numbers 或電郵。'))
      .catch(() => adminMessage('未能複製，請改用「匯出 CSV」。'));
  });

  $('#btn-admin-close').addEventListener('click', goHome);

  /* ---------- 其他 ---------- */
  function renderSound() {
    const btn = $('#btn-sound');
    btn.classList.toggle('muted', settings.muted);
    btn.setAttribute('aria-label', settings.muted ? '開啟音效' : '關閉音效');
  }
  $('#btn-sound').addEventListener('click', () => {
    settings.muted = !settings.muted;
    save(KEY_SETTINGS, settings);
    renderSound();
    if (!settings.muted) {
      Sound.unlock();
      Sound.move();
    }
  });

  let wakeLock = null;
  function requestWakeLock() {
    if (wakeLock || !('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(lock => {
      wakeLock = lock;
      lock.addEventListener('release', () => { wakeLock = null; });
    }).catch(() => { wakeLock = null; });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && app.dataset.screen !== 'home') requestWakeLock();
  });

  // 防止 iPad 雙指縮放、長按選單
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('contextmenu', e => {
    if (!e.target.closest('input, #admin')) e.preventDefault();
  });

  $('#btn-start').addEventListener('click', startJourney);
  $('#btn-undo').addEventListener('click', undo);
  $('#btn-reset').addEventListener('click', resetBoard);
  $('#btn-quit').addEventListener('click', quit);
  window.addEventListener('resize', fitBoard);
  window.addEventListener('orientationchange', () => setTimeout(fitBoard, 250));

  // 預覽環境更新版本時保留進行中的關卡
  function snapshot() {
    if (app.dataset.screen !== 'game' || game.phase !== 'playing') return {};
    return {
      level: game.level,
      results: game.results,
      positions: game.pieces.map(p => [p.x, p.y]),
      history: game.history,
      elapsed: performance.now() - game.startAt,
    };
  }

  function restore(data) {
    if (!data || typeof data.level !== 'number' || !LEVELS[data.level] || !Array.isArray(data.positions)) return false;
    try {
      const pieces = Core.parseLayout(LEVELS[data.level].layout);
      if (pieces.length !== data.positions.length) return false;
      pieces.forEach((p, i) => { p.x = data.positions[i][0]; p.y = data.positions[i][1]; });
      const area = pieces.reduce((n, p) => n + p.w * p.h, 0);
      const filled = Core.encode(pieces).replace(/\./g, '').length;
      if (filled !== area || pieces.some(p => p.x < 0 || p.y < 0 || p.x + p.w > Core.COLS || p.y + p.h > Core.ROWS)) return false;
      showScreen('game');
      prepareLevel(data.level);
      game.results = Array.isArray(data.results) ? data.results : [];
      game.pieces = pieces;
      game.history = Array.isArray(data.history) ? data.history : [];
      game.steps = Core.countSteps(game.history);
      buildPieces(false);
      game.phase = 'playing';
      game.startAt = performance.now() - (Number(data.elapsed) || 0);
      updateHud();
      tick();
      return true;
    } catch (err) {
      return false;
    }
  }

  let booted = false;
  function boot(data) {
    if (booted) return;
    booted = true;
    $('#progress').innerHTML = LEVELS.map(() => '<li></li>').join('');
    renderSound();
    renderHome();
    if (!restore(data)) showScreen('home');
  }

  const hot = window.claude && window.claude.hot;
  if (hot && typeof hot.snapshot === 'function') {
    try { hot.snapshot(snapshot); } catch (err) { /* 非預覽環境 */ }
  }
  if (hot && typeof hot.ready === 'function') {
    hot.ready(boot);
    setTimeout(() => boot({}), 1500);
  } else {
    boot((hot && hot.data) || {});
  }

  // 離線使用：只在正式網址（HTTPS）註冊
  const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && window.self === window.top && (location.protocol === 'https:' || local)) {
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker.register('sw.js').catch(() => {});
        if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
      } catch (err) { /* 受限環境（例如預覽）不支援離線功能 */ }
    });
  }
})();
