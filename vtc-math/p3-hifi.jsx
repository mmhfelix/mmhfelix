// p3-hifi.jsx — Hi-fi Drill A: 距離 / 斜率 / 中點
// Phase 1: generated 6-question loop + 過關畫面

// ── HFFrac ────────────────────────────────────────────────────
function HFFrac({ top, bottom, size = 16, color }) {
  const c = color || HF.ink;
  return (
    <span style={{
      display: 'inline-block', verticalAlign: 'middle',
      textAlign: 'center', lineHeight: 1.1, margin: '0 4px', fontSize: size, flex: 'none',
    }}>
      <span style={{ display: 'block', padding: '0 6px 3px', whiteSpace: 'nowrap' }}>{top}</span>
      <span style={{ display: 'block', height: 2, background: c, borderRadius: 2 }} />
      <span style={{ display: 'block', padding: '3px 6px 0', whiteSpace: 'nowrap' }}>{bottom}</span>
    </span>
  );
}

// ── HFSqrt — SVG radical with extending vinculum ──────────────
function HFSqrt({ children, color }) {
  const c = color || HF.ink;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-start', verticalAlign: 'middle' }}>
      <svg width="16" height="36" viewBox="0 0 16 36" style={{ flex: 'none' }}>
        {/* tick: foot → dip → diagonal → horizontal stub that meets vinculum */}
        <polyline
          points="1,22 6,33 13,4 16,4"
          fill="none" stroke={c} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
      <span style={{
        borderTop: `2.2px solid ${c}`,
        marginTop: '3px',
        paddingTop: 3, paddingLeft: 2, paddingRight: 4,
        lineHeight: 1.35,
      }}>
        {children}
      </span>
    </span>
  );
}

// ── Teach tabs ────────────────────────────────────────────────
const P3_TEACH_TABS = [
  {
    id: 'distance', label: '距離', en: 'Distance',
    formula: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
        <span>d =</span>
        <HFSqrt>(x₂ − x₁)² + (y₂ − y₁)²</HFSqrt>
      </span>
    ),
    note: '兩點間距離 Distance = √( 橫距² + 直距² )',
  },
  {
    id: 'slope', label: '斜率', en: 'Slope',
    formula: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
        <span>m =</span>
        <HFFrac top={<span>y₂ − y₁</span>} bottom={<span>x₂ − x₁</span>} size={15} />
      </span>
    ),
    note: '斜率 Slope = 直距差 ÷ 橫距差；垂直線 vertical line 斜率為 undefined',
  },
  {
    id: 'midpoint', label: '中點', en: 'Midpoint',
    formula: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
        <span>M = (</span>
        <HFFrac top={<span>x₁ + x₂</span>} bottom={<span>2</span>} size={14} />
        <span>,</span>
        <HFFrac top={<span>y₁ + y₂</span>} bottom={<span>2</span>} size={14} />
        <span>)</span>
      </span>
    ),
    note: '中點 Midpoint = 兩坐標各取平均值 average of both coordinates',
  },
];

// ── Helpers ───────────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Display formatter: proper minus sign, no change for positives
function fmtN(n) {
  return n < 0 ? '−' + Math.abs(n) : String(n);
}

function fmtPt(label, x, y) {
  return label + ' ( ' + fmtN(x) + ', ' + fmtN(y) + ' )';
}

// ── Question generation ───────────────────────────────────────
const Q_SEQUENCE = [
  { type: 'slope',    p1: 'A', p2: 'B' },
  { type: 'distance', p1: 'P', p2: 'Q' },
  { type: 'midpoint', p1: 'E', p2: 'F' },
  { type: 'slope',    p1: 'C', p2: 'D' },
  { type: 'distance', p1: 'R', p2: 'S' },
  { type: 'midpoint', p1: 'G', p2: 'H' },
];

function generateQuestions() {
  return Q_SEQUENCE.map(({ type, p1, p2 }, idx) => {
    let x1, y1, x2, y2, tries = 0;
    do {
      x1 = randInt(-8, 8); y1 = randInt(-8, 8);
      x2 = randInt(-8, 8); y2 = randInt(-8, 8);
      tries++;
    } while (
      tries < 300 && (
        (x1 === x2 && y1 === y2) ||
        (type === 'slope' && x1 === x2)
      )
    );

    let answers, zh, en, pts, hintNote;

    if (type === 'slope') {
      const a = y2 - y1, b = x2 - x1;
      answers = { a, b };
      zh = '求 ' + p1 + ' 與 ' + p2 + ' 的斜率';
      en = 'Find the slope of ' + p1 + ' and ' + p2;
      pts = fmtPt(p1, x1, y1) + '   ' + fmtPt(p2, x2, y2);
      hintNote = '分子 numerator 係 y 的差，分母 denominator 係 x 的差。' +
        p2 + '(' + fmtN(y2) + ') − ' + p1 + '(' + fmtN(y1) + ') = ' + fmtN(a) +
        '，' + p2 + '(' + fmtN(x2) + ') − ' + p1 + '(' + fmtN(x1) + ') = ' + fmtN(b);
    } else if (type === 'distance') {
      const dx = x2 - x1, dy = y2 - y1;
      answers = { dx, dy };
      zh = '求 ' + p1 + ' 與 ' + p2 + ' 的距離';
      en = 'Find the distance between ' + p1 + ' and ' + p2;
      pts = fmtPt(p1, x1, y1) + '   ' + fmtPt(p2, x2, y2);
      hintNote = '橫距 = ' + fmtN(x2) + ' − (' + fmtN(x1) + ') = ' + Math.abs(dx) +
        '，直距 = ' + fmtN(y2) + ' − (' + fmtN(y1) + ') = ' + Math.abs(dy);
    } else {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      answers = { mx, my };
      zh = '求 ' + p1 + ' 與 ' + p2 + ' 的中點 M';
      en = 'Find the midpoint M of ' + p1 + ' and ' + p2;
      pts = fmtPt(p1, x1, y1) + ' 和 ' + fmtPt(p2, x2, y2);
      hintNote = 'x 坐標 = (' + fmtN(x1) + ' + ' + fmtN(x2) + ') \xf7 2 = ' + mx +
        '，y 坐標 = (' + fmtN(y1) + ' + ' + fmtN(y2) + ') \xf7 2 = ' + my;
    }

    return {
      id: idx + 1, type, xp: 20,
      topicZh: { slope: '斜率', distance: '距離', midpoint: '中點' }[type],
      topicEn: { slope: 'Slope', distance: 'Distance', midpoint: 'Midpoint' }[type],
      p1, p2, x1, y1, x2, y2,
      answers, zh, en, pts, hintNote,
    };
  });
}

// ── Validation ────────────────────────────────────────────────
// Safe eval for simple arithmetic expressions (distance dynamic check)
function evalSafe(input) {
  const s = String(input || '').trim().replace(/[−–]/g, '-').replace(/\s/g, '');
  if (!s || !/^[0-9+\-*/().]+$/.test(s)) return null;
  try {
    const v = new Function('return (' + s + ')')();
    return (typeof v === 'number' && isFinite(v)) ? v : null;
  } catch (_) { return null; }
}

function checkDistanceVal(input, expectedDiff) {
  const v = evalSafe(input);
  return v !== null && Math.abs(v) === Math.abs(expectedDiff);
}

// Pattern matching for midpoint: exact decimal OR (a+b)/2 form
function checkMidpointVal(input, v1, v2) {
  const expected = (v1 + v2) / 2;
  const s = String(input || '').trim().replace(/[−–]/g, '-').replace(/\s/g, '');
  if (!s) return false;

  // Pattern 1: exact numeric value
  const num = parseFloat(s);
  if (!isNaN(num) && num === expected) {
    if (Number.isInteger(expected)) return s === String(Math.round(expected)); // reject "2.0"
    return s === String(expected); // e.g. "2.5"
  }

  // Pattern 2: (a+b)/2 — normalise inner parens around negatives first
  const norm = s.replace(/\((-?\d+)\)/g, '$1');
  const m = norm.match(/^\((-?\d+)\+(-?\d+)\)\/2$/);
  if (m) {
    const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
    return (a === v1 && b === v2) || (a === v2 && b === v1);
  }
  return false;
}

function checkQuestion(q, vals) {
  const norm = (s) => String(s || '').trim().replace(/[−–]/g, '-');
  if (q.type === 'slope') {
    return norm(vals.a) === String(q.answers.a) && norm(vals.b) === String(q.answers.b);
  }
  if (q.type === 'distance') {
    return checkDistanceVal(vals.dx, q.answers.dx) && checkDistanceVal(vals.dy, q.answers.dy);
  }
  if (q.type === 'midpoint') {
    return checkMidpointVal(vals.mx, q.x1, q.x2) && checkMidpointVal(vals.my, q.y1, q.y2);
  }
  return false;
}

function isComplete(q, vals) {
  const keys = { slope: ['a','b'], distance: ['dx','dy'], midpoint: ['mx','my'] };
  return (keys[q.type] || []).every((k) => !!(vals[k] || '').trim());
}

// ── HFFillBox ─────────────────────────────────────────────────
function HFFillBox({ value, setValue, stage, checkFn, placeholder, disabled }) {
  const isCorrect = stage === 'correct';
  const isWrong   = stage === 'wrong' && checkFn && !checkFn(value);
  const bg     = isCorrect ? HF.electric : isWrong ? HF.coralSoft : HF.paper;
  const border = isWrong ? HF.coralDeep : HF.ink;
  return (
    <input
      inputMode="decimal"
      value={value}
      disabled={disabled}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      style={{
        appearance: 'none',
        width: 64, height: 44, textAlign: 'center',
        background: bg, color: HF.ink,
        border: '2.5px solid ' + border,
        boxShadow: '3px 3px 0 0 ' + HF.ink,
        borderRadius: 10,
        fontFamily: HF.display, fontWeight: 800, fontSize: 20,
        outline: 'none', caretColor: HF.coral,
      }}
    />
  );
}

// ── QuestionBody ──────────────────────────────────────────────
function QuestionBody({ q, vals, setVals, stage }) {
  const set = (key) => (v) => setVals((prev) => ({ ...prev, [key]: v }));
  const dis = stage !== 'practice';
  const mono9 = { fontFamily: HF.mono, fontSize: 9, letterSpacing: 1, color: HF.pencil };

  if (q.type === 'slope') {
    return (
      <div style={{
        marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, fontFamily: HF.display, fontWeight: 800, fontSize: 22, color: HF.ink,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ flexShrink: 0 }}>m =</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <HFFillBox value={vals.a || ''} setValue={set('a')} stage={stage} disabled={dis}
            checkFn={(v) => String(v||'').trim().replace(/[−–]/g,'-') === String(q.answers.a)}
            placeholder="?" />
          <div style={{ height: 3, width: 86, background: HF.ink, borderRadius: 2 }} />
          <HFFillBox value={vals.b || ''} setValue={set('b')} stage={stage} disabled={dis}
            checkFn={(v) => String(v||'').trim().replace(/[−–]/g,'-') === String(q.answers.b)}
            placeholder="?" />
        </div>
      </div>
    );
  }

  if (q.type === 'distance') {
    return (
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10,
          fontFamily: HF.display, fontWeight: 800, fontSize: 18, color: HF.ink }}>
          {/* 橫距 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span>(</span>
              <HFFillBox value={vals.dx || ''} setValue={set('dx')} stage={stage} disabled={dis}
                checkFn={(v) => checkDistanceVal(v, q.answers.dx)} placeholder="?" />
              <span>)²</span>
            </div>
            <span style={mono9}>橫距</span>
          </div>
          <span style={{ paddingBottom: 22 }}>+</span>
          {/* 直距 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span>(</span>
              <HFFillBox value={vals.dy || ''} setValue={set('dy')} stage={stage} disabled={dis}
                checkFn={(v) => checkDistanceVal(v, q.answers.dy)} placeholder="?" />
              <span>)²</span>
            </div>
            <span style={mono9}>直距</span>
          </div>
        </div>
        <div style={{ fontFamily: HF.body, fontSize: 11, color: HF.pencil }}>
          d = √( 橫距² + 直距² )
        </div>
      </div>
    );
  }

  if (q.type === 'midpoint') {
    return (
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        gap: 8, fontFamily: HF.display, fontWeight: 800, fontSize: 18, color: HF.ink }}>
        <span style={{ paddingBottom: 20 }}>M = (</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <HFFillBox value={vals.mx || ''} setValue={set('mx')} stage={stage} disabled={dis}
            checkFn={(v) => checkMidpointVal(v, q.x1, q.x2)} placeholder="x" />
          <span style={mono9}>x 坐標</span>
        </div>
        <span style={{ paddingBottom: 20 }}>,</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <HFFillBox value={vals.my || ''} setValue={set('my')} stage={stage} disabled={dis}
            checkFn={(v) => checkMidpointVal(v, q.y1, q.y2)} placeholder="y" />
          <span style={mono9}>y 坐標</span>
        </div>
        <span style={{ paddingBottom: 20 }}>)</span>
      </div>
    );
  }
  return null;
}

// ── HintLine ──────────────────────────────────────────────────
function HintLine({ q }) {
  if (q.type === 'slope') {
    return (
      <div style={{ marginTop: 10, textAlign: 'center', fontFamily: HF.body, fontSize: 11,
        color: HF.pencil, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, flexWrap: 'wrap' }}>
        <span>提示 Hint：m =</span>
        <HFFrac top={<span>y₂ − y₁</span>} bottom={<span>x₂ − x₁</span>} size={11} color={HF.pencil} />
      </div>
    );
  }
  if (q.type === 'distance') {
    return (
      <div style={{ marginTop: 10, textAlign: 'center', fontFamily: HF.body, fontSize: 11, color: HF.pencil }}>
        提示 Hint：可以填數值或算式，例如 4−1
      </div>
    );
  }
  if (q.type === 'midpoint') {
    return (
      <div style={{ marginTop: 10, textAlign: 'center', fontFamily: HF.body, fontSize: 11,
        color: HF.pencil, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 4, flexWrap: 'wrap' }}>
        <span>提示 Hint：M = (</span>
        <HFFrac top={<span>x₁+x₂</span>} bottom={<span>2</span>} size={10} color={HF.pencil} />
        <span>,</span>
        <HFFrac top={<span>y₁+y₂</span>} bottom={<span>2</span>} size={10} color={HF.pencil} />
        <span>)</span>
      </div>
    );
  }
  return null;
}

// ── AnswerBox ─────────────────────────────────────────────────
function AnswerBox({ q }) {
  const a = q.answers;
  if (q.type === 'slope') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span>正解 Answer：m =</span>
        <HFFrac
          top={<span style={{ color: HF.coralDeep }}>{fmtN(a.a)}</span>}
          bottom={<span style={{ color: HF.coralDeep }}>{fmtN(a.b)}</span>}
          size={13}
        />
      </div>
    );
  }
  if (q.type === 'distance') {
    return (
      <span>
        正解 Answer：橫距 = <b style={{ color: HF.coralDeep }}>{Math.abs(a.dx)}</b>，
        直距 = <b style={{ color: HF.coralDeep }}>{Math.abs(a.dy)}</b>
      </span>
    );
  }
  if (q.type === 'midpoint') {
    return (
      <span>
        正解 Answer：M = (<b style={{ color: HF.coralDeep }}>{a.mx}</b>, <b style={{ color: HF.coralDeep }}>{a.my}</b>)
      </span>
    );
  }
  return null;
}

// ── FeedbackCorrect ───────────────────────────────────────────
function FeedbackCorrect({ q, qIdx, xpTotal, isLast, onNext }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '20px 18px 24px',
      background: HF.ink, color: HF.paper,
      borderTop: '2.5px solid ' + HF.ink,
      animation: 'hf-slide-up 0.35s cubic-bezier(.5,1.6,.4,1)',
    }}>
      <div style={{ position: 'absolute', top: -28, right: 24 }}>
        <HFBurst color={HF.electric} ink={HF.ink} size={88} rotate={-12}>正確！</HFBurst>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HFMascot mood="pumped" size={56} rotate={-4} />
        <div>
          <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 22, color: HF.electric }}>NICE！</div>
          <div style={{ fontFamily: HF.body, fontSize: 12, color: HF.paper, opacity: 0.85, marginTop: 2 }}>
            {q.topicZh} {q.topicEn} — 答得正確！
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 12, padding: '8px 12px',
        background: HF.inkSoft, borderRadius: 10,
        fontFamily: HF.mono, fontSize: 11, color: HF.electric,
        display: 'flex', gap: 12,
      }}>
        <span>+{q.xp} XP</span><span>·</span>
        <span>累計 {xpTotal} XP ⚡</span><span>·</span>
        <span>{qIdx + 1} / 6 完成</span>
      </div>
      <div style={{ marginTop: 14 }}>
        <HFBtn primary full size="lg" onClick={onNext}>
          {isLast ? '查看成績 🏆' : '下一題 →'}
        </HFBtn>
      </div>
    </div>
  );
}

// ── FeedbackWrong ─────────────────────────────────────────────
function FeedbackWrong({ q, onRetry }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '20px 18px 24px',
      background: HF.coralSoft, color: HF.ink,
      borderTop: '2.5px solid ' + HF.ink,
      animation: 'hf-slide-up 0.35s cubic-bezier(.5,1.6,.4,1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <HFMascot mood="think" size={56} rotate={-4} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 18, color: HF.coralDeep }}>差少少！再試一次</div>
          <div style={{ fontFamily: HF.body, fontSize: 12, color: HF.inkSoft, marginTop: 4 }}>
            {q.hintNote}
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 10, padding: '10px 12px',
        background: HF.paper, border: '2px dashed ' + HF.coralDeep,
        borderRadius: 10, fontFamily: HF.display, fontWeight: 700, fontSize: 13, color: HF.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap',
      }}>
        <AnswerBox q={q} />
      </div>
      <div style={{ marginTop: 14 }}>
        <HFBtn primary full size="lg" onClick={onRetry}>再試一次 🔥</HFBtn>
      </div>
    </div>
  );
}

// ── PassScreen ────────────────────────────────────────────────
function PassScreen({ xpTotal, onBack }) {
  const [confetti, setConfetti] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setConfetti(false), 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0, background: HF.ink,
      display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden',
    }}>
      <HFSpeedLines color={HF.electric} count={24} opacity={0.18} />
      <HFConfetti active={confetti} />
      <div style={{ position: 'relative', marginTop: 48 }}>
        <HFStamp color={HF.electric} ink={HF.ink} rotate={-6} size="lg">CLEAR!</HFStamp>
      </div>
      <div style={{ position: 'relative', marginTop: 20, textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontFamily: HF.mono, fontSize: 11, letterSpacing: 2, color: HF.coral, marginBottom: 6 }}>
          操練 A · 距離 / 斜率 / 中點
        </div>
        <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 48, lineHeight: 0.9, color: HF.electric, letterSpacing: -2 }}>
          過關！
        </div>
        <div style={{ fontFamily: HF.body, fontSize: 13, color: HF.paper, opacity: 0.8, marginTop: 8 }}>
          Drill A Complete — All 6 questions done!
        </div>
      </div>
      <div style={{ position: 'relative', marginTop: 20 }}>
        <HFMascot mood="fire" size={100} rotate={8} />
      </div>
      <div style={{ position: 'relative', marginTop: 16, width: 'calc(100% - 48px)' }}>
        <div style={{
          background: HF.inkSoft, border: '2.5px solid ' + HF.electric,
          borderRadius: 16, padding: '16px 20px',
          boxShadow: '4px 4px 0 0 ' + HF.electric,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: HF.mono, fontSize: 9, letterSpacing: 1.5, color: HF.ghost, marginBottom: 4 }}>XP EARNED</div>
              <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 36, color: HF.electric, lineHeight: 1 }}>+{xpTotal}</div>
            </div>
            <div style={{ width: 1.5, background: HF.pencil, alignSelf: 'stretch' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: HF.mono, fontSize: 9, letterSpacing: 1.5, color: HF.ghost, marginBottom: 4 }}>QUESTIONS</div>
              <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 36, color: HF.paper, lineHeight: 1 }}>6 / 6</div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '8px 10px', background: HF.ink, borderRadius: 8,
            fontFamily: HF.mono, fontSize: 11, color: HF.electric, textAlign: 'center' }}>
            🔥 連勝繼續！下一關等緊你
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', marginTop: 14, display: 'flex', gap: 6 }}>
        {['距離 Distance', '斜率 Slope', '中點 Midpoint'].map((t, i) => (
          <div key={i} style={{
            background: HF.coral, color: HF.paper, border: '2px solid ' + HF.paper,
            padding: '5px 8px', fontFamily: HF.display, fontWeight: 800, fontSize: 10,
            boxShadow: '2px 2px 0 0 ' + HF.electric,
          }}>✓ {t}</div>
        ))}
      </div>
      <div style={{ position: 'relative', marginTop: 'auto', width: 'calc(100% - 36px)', paddingBottom: 28 }}>
        <HFBtn dark full size="lg" onClick={onBack}>← 返回操練選擇</HFBtn>
      </div>
    </div>
  );
}

// ── P3Hifi ────────────────────────────────────────────────────
function P3Hifi({ onBack }) {
  const [questions]    = React.useState(() => generateQuestions());
  const [tab, setTab]  = React.useState('slope');
  const [qIdx, setQIdx] = React.useState(0);
  const [stage, setStage] = React.useState('practice'); // practice | correct | wrong
  const [vals, setVals]   = React.useState({});
  const [xpTotal, setXpTotal] = React.useState(0);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);

  const q       = questions[qIdx];
  const isLast  = qIdx === questions.length - 1;
  const pct     = ((qIdx + (stage === 'correct' ? 1 : 0)) / questions.length) * 100;

  // Auto-switch teach tab to match current question type
  React.useEffect(() => { setTab(q.type); }, [qIdx]);

  const tabObj = P3_TEACH_TABS.find((t) => t.id === tab);

  const submit = () => {
    if (checkQuestion(q, vals)) {
      setStage('correct');
      setXpTotal((x) => x + q.xp);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    } else {
      setStage('wrong');
    }
  };

  const retry = () => { setVals({}); setStage('practice'); };

  const nextQ = () => {
    if (isLast) { setShowPass(true); }
    else { setQIdx((i) => i + 1); setVals({}); setStage('practice'); }
  };

  return (
    <HFPhone w={360} h={780} label="操練 A · 距離 / 斜率 / 中點">
      {showPass && <PassScreen xpTotal={xpTotal} onBack={onBack} />}

      {/* Nav + progress */}
      <div style={{ padding: '12px 18px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{
          appearance: 'none', cursor: 'pointer',
          background: HF.paper, border: '2.5px solid ' + HF.ink,
          width: 36, height: 36, borderRadius: 10,
          fontFamily: HF.display, fontWeight: 800, fontSize: 16,
          boxShadow: '3px 3px 0 0 ' + HF.ink, flexShrink: 0,
        }}>←</button>
        <div style={{ flex: 1, height: 14, background: HF.paper,
          border: '2.5px solid ' + HF.ink, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: pct + '%', height: '100%', background: HF.coral,
            transition: 'width 0.5s cubic-bezier(.5,1.6,.4,1)' }} />
        </div>
        <div style={{ fontFamily: HF.mono, fontSize: 11, color: HF.ink, fontWeight: 700, flexShrink: 0 }}>
          {qIdx + (stage === 'correct' ? 1 : 0)} / 6
        </div>
      </div>

      {/* Teach tabs */}
      <div style={{ padding: '8px 18px 12px' }}>
        <div style={{ display: 'flex', gap: 6, background: HF.ink, padding: 4,
          border: '2.5px solid ' + HF.ink, borderRadius: 12 }}>
          {P3_TEACH_TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, appearance: 'none', cursor: 'pointer',
              padding: '8px 6px', borderRadius: 8, border: 'none',
              background: tab === t.id ? HF.electric : 'transparent',
              color: tab === t.id ? HF.ink : HF.paper,
              fontFamily: HF.display, fontWeight: 800, fontSize: 13,
              outline: (q.type === t.id && tab !== t.id) ? '2px solid ' + HF.coral : 'none',
              outlineOffset: -2,
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: '12px 14px',
          background: HF.paperWarm, border: '2.5px solid ' + HF.ink, borderRadius: 12,
          boxShadow: '3px 3px 0 0 ' + HF.ink }}>
          <div style={{ fontFamily: HF.mono, fontSize: 9, letterSpacing: 1.5, color: HF.coralDeep }}>
            {tabObj.label} · {tabObj.en.toUpperCase()} · 公式 FORMULA
          </div>
          <div style={{ fontFamily: HF.display, fontWeight: 700, fontSize: 17, color: HF.ink, marginTop: 6, lineHeight: 1.3 }}>
            {tabObj.formula}
          </div>
          <div style={{ fontFamily: HF.body, fontSize: 11, color: HF.inkSoft, marginTop: 6 }}>
            {tabObj.note}
          </div>
        </div>
      </div>

      {/* Question card */}
      <div style={{ padding: '4px 18px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: HF.paper, border: '2.5px solid ' + HF.ink, borderRadius: 18,
          boxShadow: '5px 5px 0 0 ' + HF.ink, padding: '16px 16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: HF.mono, fontSize: 10, letterSpacing: 2, color: HF.coralDeep }}>
              QUESTION {qIdx + 1} / 6
            </div>
            <HFStamp color={HF.electric} ink={HF.ink} rotate={-4} size="sm">
              {q.topicEn.toUpperCase()}
            </HFStamp>
          </div>
          <div style={{ fontFamily: HF.display, fontWeight: 700, fontSize: 16, color: HF.ink, marginTop: 8, lineHeight: 1.3 }}>
            {q.zh}
            <span style={{ display: 'block', fontFamily: HF.body, fontWeight: 500, fontSize: 11, color: HF.pencil, marginTop: 2 }}>
              {q.en}
            </span>
          </div>
          <div style={{
            marginTop: 10, padding: '10px 12px',
            background: HF.coralSoft, border: '2px dashed ' + HF.coralDeep,
            borderRadius: 10, fontFamily: HF.display, fontWeight: 800, fontSize: 17,
            color: HF.ink, textAlign: 'center', letterSpacing: 0.5,
          }}>
            {q.pts}
          </div>

          <QuestionBody q={q} vals={vals} setVals={setVals} stage={stage} />

          {stage === 'practice' && <HintLine q={q} />}

          {stage === 'practice' && (
            <div style={{ marginTop: 16 }}>
              <HFBtn primary full size="lg" onClick={submit} disabled={!isComplete(q, vals)}>
                送出 ⚡
              </HFBtn>
            </div>
          )}
        </div>
      </div>

      {stage === 'correct' && (
        <FeedbackCorrect q={q} qIdx={qIdx} xpTotal={xpTotal} isLast={isLast} onNext={nextQ} />
      )}
      {stage === 'wrong' && <FeedbackWrong q={q} onRetry={retry} />}

      <HFConfetti active={showConfetti} />
    </HFPhone>
  );
}

Object.assign(window, { P3Hifi, HFFrac, HFFillBox, HFSqrt });
