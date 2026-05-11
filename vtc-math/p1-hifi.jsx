// p1-hifi.jsx — Hi-fi home / course index
// Manga shōnen vibe, coral + ink + electric yellow, 9 courses, only L1 unlocked.

const HF_COURSES = [
  { n: 'L1', zh: '坐標幾何', en: 'Coordinate Geometry', icon: 'axes',     open: true },
  { n: 'L2', zh: '對稱、變換與相似', en: 'Symmetry & Transformation', icon: 'symmetry' },
  { n: 'L3', zh: '正弦函數', en: 'Sinusoidal Function', icon: 'sine' },
  { n: 'L4', zh: '解三角形', en: 'Solving Triangles', icon: 'triangle' },
  { n: 'L5', zh: '離散概率分佈', en: 'Discrete Probability', icon: 'bars' },
  { n: 'L6', zh: '正態分佈', en: 'Normal Distribution', icon: 'bell' },
  { n: 'L7', zh: '二次方程', en: 'Quadratic Equations', icon: 'parabola' },
  { n: 'L8', zh: '圓', en: 'Circles', icon: 'circle' },
  { n: 'L9', zh: '軌跡', en: 'Loci', icon: 'loci' },
];

function HFCourseIcon({ kind, size = 32, color = HF.ink, strokeWidth = 2.2 }) {
  const c = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const map = {
    axes:     <g {...c}><path d="M5 21 L21 5"/><path d="M3 19 L21 19"/><path d="M5 21 L5 3"/><circle cx="9" cy="15" r="1.6" fill={color}/><circle cx="16" cy="9" r="1.6" fill={color}/></g>,
    symmetry: <g {...c}><path d="M4 19 L9 6 L13 19 Z"/><path d="M22 19 L17 6 L13 19 Z" strokeDasharray="2.5 2"/><line x1="13" y1="3" x2="13" y2="21" strokeDasharray="2 2"/></g>,
    sine:     <g {...c}><path d="M3 12 Q7 3 12 12 T21 12"/><line x1="3" y1="12" x2="21" y2="12" strokeDasharray="2 2" opacity="0.5"/></g>,
    triangle: <g {...c}><path d="M4 19 L20 19 L8 5 Z"/><path d="M8 5 L8 19" strokeDasharray="2 2" opacity="0.7"/></g>,
    bars:     <g {...c}><line x1="3" y1="20" x2="21" y2="20"/><rect x="5" y="13" width="3.5" height="7"/><rect x="10.5" y="8" width="3.5" height="12"/><rect x="16" y="11" width="3.5" height="9"/></g>,
    bell:     <g {...c}><line x1="3" y1="19" x2="21" y2="19"/><path d="M3 19 Q8 19 9 14 Q11 4 12 4 Q13 4 15 14 Q16 19 21 19"/></g>,
    parabola: <g {...c}><path d="M4 5 Q12 25 20 5"/><line x1="3" y1="19" x2="21" y2="19" strokeDasharray="2 2" opacity="0.5"/></g>,
    circle:   <g {...c}><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="1" fill={color}/><line x1="12" y1="12" x2="18.5" y2="9"/></g>,
    loci:     <g {...c}><path d="M5 12 Q5 5 12 5 Q19 5 19 12" strokeDasharray="2.5 2"/><circle cx="5" cy="12" r="1.6" fill={color}/><circle cx="12" cy="5" r="1.6" fill={color}/><circle cx="19" cy="12" r="1.6" fill={color}/></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block' }}>{map[kind] || map.axes}</svg>;
}

function P1Hifi({ onOpenL1 }) {
  return (
    <HFPhone w={360} h={780} label="主頁 / Home">
      {/* Hero */}
      <div style={{ position: 'relative', padding: '20px 22px 24px', background: HF.ink, color: HF.paper, overflow: 'hidden' }}>
        <HFHalftone color={HF.coral} opacity={0.5} size={2.5} gap={6} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: HF.mono, fontSize: 10, letterSpacing: 2, color: HF.electric, marginBottom: 6 }}>VTC · DSE 數3</div>
            <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 36, lineHeight: 0.95, letterSpacing: -1 }}>
              熱血<br/>操練場
            </div>
            <div style={{ fontFamily: HF.body, fontWeight: 600, fontSize: 12, color: HF.electric, marginTop: 8 }}>
              馬Sir 監製 · ヤル気MAX！
            </div>
          </div>
          <HFMascot mood="fire" size={86} rotate={6} />
        </div>
        {/* Streak strip */}
        <div style={{ position: 'relative', marginTop: 16, display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, padding: '8px 12px', background: HF.coral, color: HF.paper,
            border: `2px solid ${HF.paper}`, fontFamily: HF.display, fontWeight: 800, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>🔥 連勝</span><span style={{ fontSize: 18 }}>3 日</span>
          </div>
          <div style={{
            flex: 1, padding: '8px 12px', background: HF.electric, color: HF.ink,
            border: `2px solid ${HF.paper}`, fontFamily: HF.display, fontWeight: 800, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>⚡ 經驗</span><span style={{ fontSize: 18 }}>240 XP</span>
          </div>
        </div>
      </div>

      {/* Section eyebrow */}
      <div style={{ padding: '20px 22px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: HF.mono, fontSize: 10, letterSpacing: 2, color: HF.coralDeep }}>CHAPTERS · 9 課題</div>
          <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 22, color: HF.ink, marginTop: 2 }}>選擇下一場操練</div>
        </div>
        <HFStamp color={HF.electric} ink={HF.ink} rotate={-6} size="sm">NEW</HFStamp>
      </div>

      {/* Course list */}
      <div style={{ padding: '0 22px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {HF_COURSES.map((c) => (
          <div key={c.n}
            onClick={c.open ? onOpenL1 : undefined}
            style={{
              position: 'relative',
              background: c.open ? HF.paper : HF.paperWarm,
              border: `2.5px solid ${HF.ink}`,
              borderRadius: 16,
              padding: '14px 14px 14px 12px',
              boxShadow: c.open ? `5px 5px 0 0 ${HF.ink}` : `3px 3px 0 0 ${HF.pencil}`,
              opacity: c.open ? 1 : 0.55,
              cursor: c.open ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: 14,
              overflow: 'hidden',
            }}
          >
            {c.open && (
              <div style={{ position: 'absolute', top: -2, right: -2, transform: 'rotate(8deg)' }}>
                <HFStamp color={HF.coral} ink={HF.paper} rotate={0} size="sm">START</HFStamp>
              </div>
            )}
            {/* Icon tile */}
            <div style={{
              width: 56, height: 56, flexShrink: 0,
              background: c.open ? HF.electric : HF.ghost,
              border: `2.5px solid ${HF.ink}`, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <HFCourseIcon kind={c.icon} size={32} color={HF.ink} strokeWidth={2.4} />
              <div style={{
                position: 'absolute', top: -8, left: -8,
                background: HF.ink, color: HF.paper,
                fontFamily: HF.display, fontWeight: 800, fontSize: 11,
                padding: '2px 6px', border: `2px solid ${HF.ink}`, borderRadius: 4,
              }}>{c.n}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 17, color: HF.ink, lineHeight: 1.1 }}>{c.zh}</div>
              <div style={{ fontFamily: HF.body, fontSize: 11, color: HF.pencil, marginTop: 3 }}>{c.en}</div>
            </div>
            <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 22, color: c.open ? HF.coral : HF.ghost }}>
              {c.open ? '→' : '🔒'}
            </div>
          </div>
        ))}
      </div>
    </HFPhone>
  );
}

Object.assign(window, { P1Hifi, HFCourseIcon, HF_COURSES });
