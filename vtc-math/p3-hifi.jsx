// p3-hifi.jsx — Hi-fi Drill A: 距離 / 斜率 / 中點
// Phase 1: 6-question loop + 過關畫面 (pass screen)

// ─── Fraction renderer ────────────────────────────────────────
function HFFrac({ top, bottom, size = 16, color }) {
  const c = color || HF.ink;
  return (
    <span style={{
      display: 'inline-block', verticalAlign: 'middle',
      textAlign: 'center', lineHeight: 1.1, margin: '0 4px', fontSize: size,
      flex: 'none',
    }}>
      <span style={{ display: 'block', padding: '0 6px 3px', whiteSpace: 'nowrap' }}>{top}</span>
      <span style={{ display: 'block', height: 2, background: c, borderRadius: 2 }} />
      <span style={{ display: 'block', padding: '3px 6px 0', whiteSpace: 'nowrap' }}>{bottom}</span>
    </span>
  );
}

// ─── Fill-in input box ────────────────────────────────────────
function HFFillBox({ value, setValue, stage, expected, placeholder, disabled }) {
  const norm = (s) => String(s).trim().replace(/[−–]/g, '-');
  const isCorrect = stage === 'correct';
  const isWrong = stage === 'wrong' && norm(value) !== norm(expected);
  const bg = isCorrect ? HF.electric : isWrong ? HF.coralSoft : HF.paper;
  const border = isWrong ? HF.coralDeep : HF.ink;
  return (
    <input
      inputMode="numeric"
      value={value}
      disabled={disabled}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      style={{
        appearance: 'none',
        width: 64, height: 44, textAlign: 'center',
        background: bg, color: HF.ink,
        border: `2.5px solid ${border}`,
        boxShadow: `3px 3px 0 0 ${HF.ink}`,
        borderRadius: 10,
        fontFamily: HF.display, fontWeight: 800, fontSize: 20,
        outline: 'none', caretColor: HF.coral,
      }}
    />
  );
}

// ─── Teach tabs data ──────────────────────────────────────────
const P3_TEACH_TABS = [
  { id: 'distance', label: '距離', en: 'Distance',
    formula: <span>d = √[ (x₂ − x₁)² + (y₂ − y₁)² ]</span>,
    note: '兩點間距離 Distance = √(Δx² + Δy²)' },
  { id: 'slope', label: '斜率', en: 'Slope',
    formula: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
        <span>m =</span>
        <HFFrac top={<span>y₂ − y₁</span>} bottom={<span>x₂ − x₁</span>} size={15} />
      </span>),
    note: '斜率 Slope = 縱差 Δy ÷ 橫差 Δx；垂直線 vertical line 斜率為 undefined' },
  { id: 'midpoint', label: '中點', en: 'Midpoint',
    formula: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
        <span>M = (</span>
        <HFFrac top={<span>x₁ + x₂</span>} bottom={<span>2</span>} size={14} />
        <span>,</span>
        <HFFrac top={<span>y₁ + y₂</span>} bottom={<span>2</span>} size={14} />
        <span>)</span>
      </span>),
    note: '中點 Midpoint = 兩坐標各取平均值 average of both coordinates' },
];

// ─── 6-question data ──────────────────────────────────────────
// Each question: type, labels, coordinates, correct answers, xp
const P3_QUESTIONS = [
  { id: 1, type: 'slope', topicZh: '斜率', topicEn: 'Slope', xp: 20,
    zh: '求 A 與 B 的斜率', en: 'Find the slope of A and B',
    pts: 'A ( 3, 7 )   B ( −1, 4 )',
    answers: { a: '-3', b: '-4' },
    hintNote: '分子 numerator 係 y₂ − y₁，分母 denominator 係 x₂ − x₁',
  },
  { id: 2, type: 'distance', topicZh: '距離', topicEn: 'Distance', xp: 20,
    zh: '求 P 與 Q 的距離', en: 'Find the distance between P and Q',
    pts: 'P ( 1, 2 )   Q ( 4, 6 )',
    answers: { dx: '3', dy: '4' },
    hintNote: 'Δx = x₂ − x₁，Δy = y₂ − y₁，答案 d = √(9+16) = 5',
  },
  { id: 3, type: 'midpoint', topicZh: '中點', topicEn: 'Midpoint', xp: 20,
    zh: '求 E 與 F 的中點 M', en: 'Find the midpoint M of E and F',
    pts: 'E ( −2, 4 )   F ( 6, −2 )',
    answers: { mx: '2', my: '1' },
    hintNote: 'x 坐標 = (−2 + 6) ÷ 2，y 坐標 = (4 + (−2)) ÷ 2',
  },
  { id: 4, type: 'slope', topicZh: '斜率', topicEn: 'Slope', xp: 20,
    zh: '求 C 與 D 的斜率', en: 'Find the slope of C and D',
    pts: 'C ( 2, −1 )   D ( 5, 5 )',
    answers: { a: '6', b: '3' },
    hintNote: '分子 numerator = 5 − (−1)，分母 denominator = 5 − 2',
  },
  { id: 5, type: 'distance', topicZh: '距離', topicEn: 'Distance', xp: 20,
    zh: '求 R 與 S 的距離', en: 'Find the distance between R and S',
    pts: 'R ( −3, 0 )   S ( 0, 4 )',
    answers: { dx: '3', dy: '4' },
    hintNote: 'Δx = 0 − (−3)，Δy = 4 − 0，答案 d = √(9+16) = 5',
  },
  { id: 6, type: 'midpoint', topicZh: '中點', topicEn: 'Midpoint', xp: 20,
    zh: '求 A 與 B 的中點 M', en: 'Find the midpoint M of A and B',
    pts: 'A ( 1, 7 )   B ( 5, 3 )',
    answers: { mx: '3', my: '5' },
    hintNote: 'x 坐標 = (1 + 5) ÷ 2，y 坐標 = (7 + 3) ÷ 2',
  },
];

// ─── QuestionBody — renders fill-in layout per question type ──
function QuestionBody({ q, vals, setVals, stage }) {
  const set = (key) => (v) => setVals((prev) => ({ ...prev, [key]: v }));
  const dis = stage !== 'practice';

  if (q.type === 'slope') {
    return (
      <div style={{
        marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, fontFamily: HF.display, fontWeight: 800, fontSize: 22, color: HF.ink,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ flexShrink: 0 }}>m =</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <HFFillBox value={vals.a || ''} setValue={set('a')} stage={stage} expected={q.answers.a} placeholder="?" disabled={dis} />
          <div style={{ height: 3, width: 86, background: HF.ink, borderRadius: 2 }} />
          <HFFillBox value={vals.b || ''} setValue={set('b')} stage={stage} expected={q.answers.b} placeholder="?" disabled={dis} />
        </div>
      </div>
    );
  }

  if (q.type === 'distance') {
    return (
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, fontFamily: HF.display, fontWeight: 800, fontSize: 18, color: HF.ink }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <HFFillBox value={vals.dx || ''} setValue={set('dx')} stage={stage} expected={q.answers.dx} placeholder="Δx" disabled={dis} />
            <span style={{ fontFamily: HF.mono, fontSize: 9, letterSpacing: 1, color: HF.pencil }}>Δx</span>
          </div>
          <span style={{ paddingBottom: 18 }}>² +</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <HFFillBox value={vals.dy || ''} setValue={set('dy')} stage={stage} expected={q.answers.dy} placeholder="Δy" disabled={dis} />
            <span style={{ fontFamily: HF.mono, fontSize: 9, letterSpacing: 1, color: HF.pencil }}>Δy</span>
          </div>
        </div>
        <div style={{ fontFamily: HF.body, fontSize: 12, color: HF.pencil, textAlign: 'center' }}>
          d = √( Δx² + Δy² )
        </div>
      </div>
    );
  }

  if (q.type === 'midpoint') {
    return (
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, fontFamily: HF.display, fontWeight: 800, fontSize: 18, color: HF.ink }}>
        <span style={{ paddingBottom: 18 }}>M = (</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <HFFillBox value={vals.mx || ''} setValue={set('mx')} stage={stage} expected={q.answers.mx} placeholder="x" disabled={dis} />
          <span style={{ fontFamily: HF.mono, fontSize: 9, letterSpacing: 1, color: HF.pencil }}>x 坐標</span>
        </div>
        <span style={{ paddingBottom: 18 }}>,</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <HFFillBox value={vals.my || ''} setValue={set('my')} stage={stage} expected={q.answers.my} placeholder="y" disabled={dis} />
          <span style={{ fontFamily: HF.mono, fontSize: 9, letterSpacing: 1, color: HF.pencil }}>y 坐標</span>
        </div>
        <span style={{ paddingBottom: 18 }}>)</span>
      </div>
    );
  }

  return null;
}

// ─── HintLine — below fill-in, only in practice stage ─────────
function HintLine({ q }) {
  if (q.type === 'slope') {
    return (
      <div style={{ marginTop: 10, textAlign: 'center', fontFamily: HF.body, fontSize: 11, color: HF.pencil, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span>提示 Hint：m =</span>
        <HFFrac top={<span>y₂ − y₁</span>} bottom={<span>x₂ − x₁</span>} size={11} color={HF.pencil} />
      </div>
    );
  }
  if (q.type === 'distance') {
    return (
      <div style={{ marginTop: 10, textAlign: 'center', fontFamily: HF.body, fontSize: 11, color: HF.pencil }}>
        提示 Hint：填入 Δx 同 Δy 嘅值
      </div>
    );
  }
  if (q.type === 'midpoint') {
    return (
      <div style={{ marginTop: 10, textAlign: 'center', fontFamily: HF.body, fontSize: 11, color: HF.pencil, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
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

// ─── AnswerBox — correct answer shown in wrong feedback ───────
function AnswerBox({ q }) {
  const a = q.answers;
  if (q.type === 'slope') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span>正解 Answer：m =</span>
        <HFFrac
          top={<span style={{ color: HF.coralDeep }}>{a.a}</span>}
          bottom={<span style={{ color: HF.coralDeep }}>{a.b}</span>}
          size={13}
        />
      </div>
    );
  }
  if (q.type === 'distance') {
    return (
      <span>
        正解 Answer：Δx = <b style={{ color: HF.coralDeep }}>{a.dx}</b>，Δy = <b style={{ color: HF.coralDeep }}>{a.dy}</b>
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

// ─── checkQuestion ────────────────────────────────────────────
function checkQuestion(q, vals) {
  const norm = (s) => String(s || '').trim().replace(/[−–]/g, '-');
  return Object.entries(q.answers).every(([k, v]) => norm(vals[k]) === norm(v));
}

function isComplete(q, vals) {
  return Object.keys(q.answers).every((k) => !!(vals[k] || '').trim());
}

// ─── FeedbackCorrect ──────────────────────────────────────────
function FeedbackCorrect({ q, qIdx, xpTotal, isLast, onNext }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '20px 18px 24px',
      background: HF.ink, color: HF.paper,
      borderTop: `2.5px solid ${HF.ink}`,
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
        <span>+{q.xp} XP</span>
        <span>·</span>
        <span>累計 {xpTotal} XP ⚡</span>
        <span>·</span>
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

// ─── FeedbackWrong ────────────────────────────────────────────
function FeedbackWrong({ q, onRetry }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '20px 18px 24px',
      background: HF.coralSoft, color: HF.ink,
      borderTop: `2.5px solid ${HF.ink}`,
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
        background: HF.paper, border: `2px dashed ${HF.coralDeep}`,
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

// ─── PassScreen — 過關畫面 ─────────────────────────────────────
function PassScreen({ xpTotal, onBack }) {
  const [confetti, setConfetti] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setConfetti(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: HF.ink,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      overflow: 'hidden',
    }}>
      <HFSpeedLines color={HF.electric} count={24} opacity={0.18} />
      <HFConfetti active={confetti} />

      {/* Top stamp */}
      <div style={{ position: 'relative', marginTop: 48, display: 'flex', justifyContent: 'center' }}>
        <HFStamp color={HF.electric} ink={HF.ink} rotate={-6} size="lg">CLEAR!</HFStamp>
      </div>

      {/* Main title */}
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

      {/* Mascot */}
      <div style={{ position: 'relative', marginTop: 24 }}>
        <HFMascot mood="fire" size={100} rotate={8} />
      </div>

      {/* XP card */}
      <div style={{ position: 'relative', marginTop: 20, width: 'calc(100% - 48px)' }}>
        <div style={{
          background: HF.inkSoft, border: `2.5px solid ${HF.electric}`,
          borderRadius: 16, padding: '16px 20px',
          boxShadow: `4px 4px 0 0 ${HF.electric}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: HF.mono, fontSize: 9, letterSpacing: 1.5, color: HF.ghost, marginBottom: 4 }}>XP EARNED</div>
              <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 36, color: HF.electric, lineHeight: 1 }}>+{xpTotal}</div>
            </div>
            <div style={{ width: '1.5px', background: HF.pencil, alignSelf: 'stretch' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: HF.mono, fontSize: 9, letterSpacing: 1.5, color: HF.ghost, marginBottom: 4 }}>QUESTIONS</div>
              <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 36, color: HF.paper, lineHeight: 1 }}>6 / 6</div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '8px 10px', background: HF.ink, borderRadius: 8, fontFamily: HF.mono, fontSize: 11, color: HF.electric, textAlign: 'center', letterSpacing: 0.5 }}>
            🔥 連勝繼續！下一關等緊你
          </div>
        </div>
      </div>

      {/* Topic badges */}
      <div style={{ position: 'relative', marginTop: 16, display: 'flex', gap: 8 }}>
        {['距離 Distance', '斜率 Slope', '中點 Midpoint'].map((t, i) => (
          <div key={i} style={{
            background: HF.coral, color: HF.paper,
            border: `2px solid ${HF.paper}`,
            padding: '5px 10px',
            fontFamily: HF.display, fontWeight: 800, fontSize: 11,
            boxShadow: `2px 2px 0 0 ${HF.electric}`,
          }}>✓ {t}</div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ position: 'relative', marginTop: 'auto', width: 'calc(100% - 36px)', paddingBottom: 28 }}>
        <HFBtn dark full size="lg" onClick={onBack}>← 返回操練選擇</HFBtn>
      </div>
    </div>
  );
}

// ─── P3Hifi — main component ──────────────────────────────────
function P3Hifi({ onBack }) {
  const [tab, setTab] = React.useState('slope');
  const [qIdx, setQIdx] = React.useState(0);
  const [stage, setStage] = React.useState('practice'); // practice | correct | wrong
  const [vals, setVals] = React.useState({});
  const [xpTotal, setXpTotal] = React.useState(0);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);

  const q = P3_QUESTIONS[qIdx];
  const isLast = qIdx === P3_QUESTIONS.length - 1;
  const progressPct = ((qIdx + (stage === 'correct' ? 1 : 0)) / P3_QUESTIONS.length) * 100;

  // Auto-switch teach tab to match current question type
  React.useEffect(() => {
    setTab(q.type);
  }, [qIdx]);

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

  const retry = () => {
    setVals({});
    setStage('practice');
  };

  const nextQuestion = () => {
    if (isLast) {
      setShowPass(true);
    } else {
      setQIdx((i) => i + 1);
      setVals({});
      setStage('practice');
    }
  };

  return (
    <HFPhone w={360} h={780} label="操練 A · 距離 / 斜率 / 中點">
      {showPass && <PassScreen xpTotal={xpTotal} onBack={onBack} />}

      {/* Top nav with progress bar */}
      <div style={{ padding: '12px 18px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{
          appearance: 'none', cursor: 'pointer',
          background: HF.paper, border: `2.5px solid ${HF.ink}`,
          width: 36, height: 36, borderRadius: 10,
          fontFamily: HF.display, fontWeight: 800, fontSize: 16,
          boxShadow: `3px 3px 0 0 ${HF.ink}`, flexShrink: 0,
        }}>←</button>
        <div style={{
          flex: 1, height: 14, background: HF.paper,
          border: `2.5px solid ${HF.ink}`, borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPct}%`, height: '100%', background: HF.coral,
            transition: 'width 0.5s cubic-bezier(.5,1.6,.4,1)',
          }} />
        </div>
        <div style={{ fontFamily: HF.mono, fontSize: 11, color: HF.ink, fontWeight: 700, flexShrink: 0 }}>
          {qIdx + (stage === 'correct' ? 1 : 0)} / 6
        </div>
      </div>

      {/* Teach tabs */}
      <div style={{ padding: '8px 18px 12px' }}>
        <div style={{ display: 'flex', gap: 6, background: HF.ink, padding: 4, border: `2.5px solid ${HF.ink}`, borderRadius: 12 }}>
          {P3_TEACH_TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, appearance: 'none', cursor: 'pointer',
              padding: '8px 6px', borderRadius: 8, border: 'none',
              background: tab === t.id ? HF.electric : 'transparent',
              color: tab === t.id ? HF.ink : HF.paper,
              fontFamily: HF.display, fontWeight: 800, fontSize: 13, letterSpacing: 0.3,
              transition: 'background 0.15s ease',
              outline: q.type === t.id && tab !== t.id ? `2px solid ${HF.coral}` : 'none',
              outlineOffset: -2,
            }}>{t.label}</button>
          ))}
        </div>

        {/* Formula card */}
        <div style={{
          marginTop: 10, padding: '12px 14px',
          background: HF.paperWarm, border: `2.5px solid ${HF.ink}`, borderRadius: 12,
          boxShadow: `3px 3px 0 0 ${HF.ink}`,
        }}>
          <div style={{ fontFamily: HF.mono, fontSize: 9, letterSpacing: 1.5, color: HF.coralDeep }}>
            {tabObj.label} · {tabObj.en.toUpperCase()} · 公式 FORMULA
          </div>
          <div style={{ fontFamily: HF.display, fontWeight: 700, fontSize: 17, color: HF.ink, marginTop: 6, lineHeight: 1.3 }}>
            {tabObj.formula}
          </div>
          <div style={{ fontFamily: HF.body, fontSize: 11, color: HF.inkSoft, marginTop: 6 }}>{tabObj.note}</div>
        </div>
      </div>

      {/* Question card */}
      <div style={{ padding: '4px 18px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: HF.paper, border: `2.5px solid ${HF.ink}`, borderRadius: 18,
          boxShadow: `5px 5px 0 0 ${HF.ink}`, padding: '16px 16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: HF.mono, fontSize: 10, letterSpacing: 2, color: HF.coralDeep }}>
              QUESTION {qIdx + 1} / 6
            </div>
            <HFStamp color={HF.electric} ink={HF.ink} rotate={-4} size="sm">{q.topicEn.toUpperCase()}</HFStamp>
          </div>

          <div style={{ fontFamily: HF.display, fontWeight: 700, fontSize: 16, color: HF.ink, marginTop: 8, lineHeight: 1.3 }}>
            {q.zh}
            <span style={{ display: 'block', fontFamily: HF.body, fontWeight: 500, fontSize: 11, color: HF.pencil, marginTop: 2, letterSpacing: 0.2 }}>
              {q.en}
            </span>
          </div>

          <div style={{
            marginTop: 10, padding: '10px 12px',
            background: HF.coralSoft, border: `2px dashed ${HF.coralDeep}`,
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
        <FeedbackCorrect q={q} qIdx={qIdx} xpTotal={xpTotal} isLast={isLast} onNext={nextQuestion} />
      )}
      {stage === 'wrong' && (
        <FeedbackWrong q={q} onRetry={retry} />
      )}

      <HFConfetti active={showConfetti} />
    </HFPhone>
  );
}

Object.assign(window, { P3Hifi, HFFrac, HFFillBox });
