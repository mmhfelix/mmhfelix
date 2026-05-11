// hifi-kit.jsx — Hi-fi shōnen/manga primitives shared across all 3 screens
// Vibes: sketch (default coral+paper), marker (chalkboard), neon (electric).
// Energy: calm / default / hyped (more shake, sparkle, speed-lines).

const HF = {
  // Core palette
  coral: '#FF5A36',
  coralDeep: '#D63A1A',
  coralSoft: '#FFE2D8',
  ink: '#14110F',
  inkSoft: '#3A3530',
  paper: '#FAF6EE',
  paperWarm: '#F2EBD8',
  pencil: '#7C746C',
  ghost: '#C8C0B6',
  electric: '#F5E844',     // dark-horse: electric yellow
  oilBlue: '#1B4FE0',
  // Type
  display: "'Bricolage Grotesque', 'Noto Serif TC', sans-serif",
  body: "'Noto Sans TC', system-ui, sans-serif",
  shout: "'Caveat', 'Kalam', cursive",
  mono: "ui-monospace, 'SF Mono', Menlo, monospace",
};

// ─── Halftone dot pattern (used as accent texture) ─────────────────
function HFHalftone({ color = HF.ink, size = 3, gap = 7, opacity = 0.35, style = {} }) {
  const id = React.useMemo(() => 'ht' + Math.random().toString(36).slice(2, 8), []);
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity, ...style }}>
      <defs>
        <pattern id={id} x="0" y="0" width={gap} height={gap} patternUnits="userSpaceOnUse">
          <circle cx={gap / 2} cy={gap / 2} r={size / 2} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// ─── Speed lines (manga radial action lines) ───────────────────────
function HFSpeedLines({ color = HF.ink, count = 28, opacity = 0.7, style = {} }) {
  const lines = React.useMemo(() => Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.05;
    const r1 = 90 + Math.random() * 10;
    const r2 = 50 + Math.random() * 35;
    return { x1: 50 + Math.cos(a) * r1, y1: 50 + Math.sin(a) * r1,
             x2: 50 + Math.cos(a) * r2, y2: 50 + Math.sin(a) * r2,
             w: 0.8 + Math.random() * 1.4 };
  }), [count]);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity, ...style }}>
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth={l.w} strokeLinecap="round" />
      ))}
    </svg>
  );
}

// ─── Burst / starburst (BAM-style speech callout) ──────────────────
function HFBurst({ children, color = HF.electric, ink = HF.ink, points = 14, size = 130, rotate = -8, style = {}, onClick }) {
  const path = React.useMemo(() => {
    const r1 = 50, r2 = 38;
    let d = '';
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? r1 : r2;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = 50 + Math.cos(a) * r;
      const y = 50 + Math.sin(a) * r;
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    return d + 'Z';
  }, [points]);
  return (
    <div onClick={onClick} style={{
      position: 'relative', width: size, height: size,
      transform: `rotate(${rotate}deg)`, cursor: onClick ? 'pointer' : 'default',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style,
    }}>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d={path} fill={color} stroke={ink} strokeWidth="2.5" strokeLinejoin="miter" />
      </svg>
      <div style={{
        position: 'relative', textAlign: 'center', fontFamily: HF.display, fontWeight: 800,
        color: ink, lineHeight: 0.9, padding: '0 12px',
      }}>{children}</div>
    </div>
  );
}

// ─── Tilted stamp box (for badges, "L1", "GO") ────────────────────
function HFStamp({ children, color = HF.coral, ink = HF.paper, rotate = -4, size = 'md', style = {} }) {
  const sizes = { sm: { p: '4px 8px', f: 12 }, md: { p: '6px 12px', f: 16 }, lg: { p: '10px 18px', f: 22 } };
  const s = sizes[size];
  return (
    <span style={{
      display: 'inline-block', padding: s.p, background: color, color: ink,
      fontFamily: HF.display, fontWeight: 800, fontSize: s.f, letterSpacing: 0.5,
      transform: `rotate(${rotate}deg)`, border: `2.5px solid ${HF.ink}`,
      boxShadow: `3px 3px 0 0 ${HF.ink}`, ...style,
    }}>{children}</span>
  );
}

// ─── Heavy button with offset shadow ──────────────────────────────
function HFBtn({ children, primary, dark, full, size = 'md', onClick, disabled, style = {} }) {
  const sizes = {
    sm: { p: '8px 14px', f: 13, h: 36 },
    md: { p: '12px 20px', f: 15, h: 48 },
    lg: { p: '16px 24px', f: 18, h: 56 },
  };
  const s = sizes[size];
  const bg = disabled ? HF.ghost : primary ? HF.coral : dark ? HF.ink : HF.paper;
  const fg = disabled ? HF.pencil : primary ? HF.paper : dark ? HF.electric : HF.ink;
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        appearance: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        padding: s.p, minHeight: s.h, width: full ? '100%' : 'auto',
        background: bg, color: fg,
        fontFamily: HF.display, fontWeight: 800, fontSize: s.f, letterSpacing: 0.3,
        border: `2.5px solid ${HF.ink}`,
        boxShadow: pressed ? `1px 1px 0 0 ${HF.ink}` : `4px 4px 0 0 ${HF.ink}`,
        transform: pressed ? 'translate(3px, 3px)' : 'translate(0, 0)',
        transition: 'transform 0.08s ease, box-shadow 0.08s ease',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        ...style,
      }}
    >{children}</button>
  );
}

// ─── Heavy card with offset shadow ────────────────────────────────
function HFCard({ children, accent, dark, padding = 16, radius = 18, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        background: accent ? HF.coralSoft : dark ? HF.ink : HF.paper,
        color: dark ? HF.paper : HF.ink,
        border: `2.5px solid ${HF.ink}`,
        borderRadius: radius,
        boxShadow: `5px 5px 0 0 ${HF.ink}`,
        padding,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >{children}</div>
  );
}

// ─── Section heading: tiny eyebrow + huge display ──────────────────
function HFTitle({ eyebrow, children, size = 32, style = {} }) {
  return (
    <div style={style}>
      {eyebrow && (
        <div style={{
          fontFamily: HF.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
          color: HF.coralDeep, marginBottom: 4,
        }}>{eyebrow}</div>
      )}
      <div style={{
        fontFamily: HF.display, fontWeight: 800, fontSize: size, lineHeight: 0.95,
        letterSpacing: -0.5, color: HF.ink,
      }}>{children}</div>
    </div>
  );
}

// ─── Phone frame (clean iOS-y bezel) ───────────────────────────────
function HFPhone({ children, w = 360, h = 720, label, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, ...style }}>
      <div className="hf-phone-frame" style={{
        width: w, height: h,
        background: HF.paper,
        border: `2.5px solid ${HF.ink}`,
        borderRadius: 36,
        boxShadow: `8px 8px 0 0 ${HF.ink}`,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* status bar */}
        <div style={{
          height: 36, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: HF.display, fontWeight: 700, fontSize: 13, color: HF.ink,
        }}>
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontFamily: HF.mono, fontSize: 10 }}>●●●</span>
          </span>
        </div>
        <div style={{ height: h - 36, overflow: 'hidden', position: 'relative' }}>{children}</div>
      </div>
      {label && (
        <div style={{ fontFamily: HF.mono, fontSize: 11, color: HF.pencil, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      )}
    </div>
  );
}

// ─── Confetti burst (one-shot) ────────────────────────────────────
function HFConfetti({ active }) {
  const pieces = React.useMemo(() => Array.from({ length: 24 }, () => ({
    x: (Math.random() - 0.5) * 100,
    y: -Math.random() * 60 - 10,
    r: Math.random() * 360,
    c: [HF.coral, HF.electric, HF.ink, HF.oilBlue][Math.floor(Math.random() * 4)],
    d: 0.4 + Math.random() * 0.6,
  })), [active]);
  if (!active) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: '50%', top: '40%',
          width: 8, height: 12, background: p.c,
          border: `1.5px solid ${HF.ink}`,
          transform: `translate(${p.x * 3}px, ${p.y * 3}px) rotate(${p.r}deg)`,
          animation: `hf-confetti-fall ${p.d + 1.4}s ease-out forwards`,
        }} />
      ))}
    </div>
  );
}

// Mascot character — 火柴人/圓臉 evolved into a confident manga sphere
function HFMascot({ mood = 'pumped', size = 80, rotate = -4 }) {
  const expressions = {
    pumped:  { eyes: '◣ ◢', mouth: 'M30 70 Q50 88 70 70', cheek: true },
    happy:   { eyes: '＾ ＾', mouth: 'M30 68 Q50 82 70 68', cheek: false },
    think:   { eyes: '◔ ◔', mouth: 'M35 75 L65 75', cheek: false },
    sad:     { eyes: 'T T', mouth: 'M30 78 Q50 65 70 78', cheek: false },
    fire:    { eyes: '◆ ◆', mouth: 'M30 70 Q50 90 70 70', cheek: true },
  };
  const e = expressions[mood] || expressions.pumped;
  return (
    <div style={{ width: size, height: size, transform: `rotate(${rotate}deg)`, position: 'relative', flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="42" fill={HF.electric} stroke={HF.ink} strokeWidth="3" />
        {e.cheek && <>
          <circle cx="22" cy="62" r="6" fill={HF.coral} stroke={HF.ink} strokeWidth="1.5" />
          <circle cx="78" cy="62" r="6" fill={HF.coral} stroke={HF.ink} strokeWidth="1.5" />
        </>}
        <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="800" fontFamily={HF.display} fill={HF.ink}>{e.eyes}</text>
        <path d={e.mouth} fill="none" stroke={HF.ink} strokeWidth="3" strokeLinecap="round" />
        {/* tuft of hair */}
        <path d="M30 18 Q40 5 50 14 Q60 4 72 18" fill={HF.ink} />
      </svg>
    </div>
  );
}

Object.assign(window, { HF, HFHalftone, HFSpeedLines, HFBurst, HFStamp, HFBtn, HFCard, HFTitle, HFPhone, HFConfetti, HFMascot });
