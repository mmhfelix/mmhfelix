// p2-hifi.jsx — Hi-fi L1 Coordinate Geometry inner page
// 3 操練卡片: A 距離/斜率/中點, B 直線方程, C 圖象與應用

const L1_DRILLS = [
  { id: 'a', n: 'A', zh: '距離 / 斜率 / 中點', en: 'Distance · Slope · Midpoint',
    qcount: 12, mins: 8, status: 'open', tag: '入門 · 必做', color: HF.coral },
  { id: 'b', n: 'B', zh: '直線方程', en: 'Equation of a Line',
    qcount: 10, mins: 12, status: 'open', tag: '進階', color: HF.electric },
  { id: 'c', n: 'C', zh: '圖象與應用', en: 'Graphs & Applications',
    qcount: 8, mins: 15, status: 'locked', tag: '挑戰', color: HF.oilBlue },
];

function P2Hifi({ onBack, onOpenA }) {
  return (
    <HFPhone w={360} h={780} label="L1 · 坐標幾何">
      {/* Top nav */}
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{
          appearance: 'none', cursor: 'pointer',
          background: HF.paper, border: `2.5px solid ${HF.ink}`,
          width: 38, height: 38, borderRadius: 10,
          fontFamily: HF.display, fontWeight: 800, fontSize: 18,
          boxShadow: `3px 3px 0 0 ${HF.ink}`,
        }}>←</button>
        <div style={{ fontFamily: HF.mono, fontSize: 10, letterSpacing: 2, color: HF.pencil }}>L1 / 9</div>
        <div style={{ width: 38 }} />
      </div>

      {/* Hero card */}
      <div style={{ padding: '14px 22px 16px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: HF.coral, border: `2.5px solid ${HF.ink}`, borderRadius: 20,
          boxShadow: `5px 5px 0 0 ${HF.ink}`, padding: '20px 18px',
          color: HF.paper,
        }}>
          <HFSpeedLines color={HF.paper} count={20} opacity={0.18} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: HF.mono, fontSize: 10, letterSpacing: 2, color: HF.electric, marginBottom: 4 }}>CHAPTER 1</div>
              <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 30, lineHeight: 0.95, letterSpacing: -1 }}>
                坐標幾何
              </div>
              <div style={{ fontFamily: HF.body, fontSize: 12, color: HF.paper, opacity: 0.9, marginTop: 6 }}>
                Coordinate Geometry · 3 場操練
              </div>
            </div>
            <HFStamp color={HF.electric} ink={HF.ink} rotate={8} size="md">L1</HFStamp>
          </div>
          {/* progress strip */}
          <div style={{ position: 'relative', marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              flex: 1, height: 12, background: 'rgba(0,0,0,0.25)',
              border: `2px solid ${HF.ink}`, borderRadius: 999, overflow: 'hidden',
            }}>
              <div style={{ width: '0%', height: '100%', background: HF.electric }} />
            </div>
            <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 13 }}>0 / 30</div>
          </div>
        </div>
      </div>

      {/* Drills */}
      <div style={{ padding: '4px 22px 14px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: HF.mono, fontSize: 10, letterSpacing: 2, color: HF.coralDeep }}>DRILLS · 操練</div>
        <div style={{ fontFamily: HF.body, fontSize: 11, color: HF.pencil }}>由 A 開始 →</div>
      </div>
      <div style={{ padding: '0 22px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {L1_DRILLS.map((d, i) => {
          const locked = d.status === 'locked';
          return (
            <div key={d.id}
              onClick={d.id === 'a' ? onOpenA : undefined}
              style={{
                position: 'relative', overflow: 'hidden',
                background: locked ? HF.paperWarm : HF.paper,
                border: `2.5px solid ${HF.ink}`, borderRadius: 18,
                boxShadow: locked ? `3px 3px 0 0 ${HF.pencil}` : `5px 5px 0 0 ${HF.ink}`,
                cursor: d.id === 'a' ? 'pointer' : 'default',
                opacity: locked ? 0.55 : 1,
              }}>
              {/* color band */}
              <div style={{
                height: 8, background: locked ? HF.ghost : d.color,
                borderBottom: `2.5px solid ${HF.ink}`,
              }} />
              <div style={{ padding: '14px 16px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 52, height: 52, flexShrink: 0,
                  background: locked ? HF.ghost : d.color,
                  border: `2.5px solid ${HF.ink}`, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: HF.display, fontWeight: 800, fontSize: 26,
                  color: d.color === HF.electric ? HF.ink : HF.paper,
                  position: 'relative',
                }}>
                  {d.n}
                  {locked && <div style={{
                    position: 'absolute', top: -8, right: -8,
                    width: 22, height: 22, borderRadius: '50%',
                    background: HF.paper, border: `2px solid ${HF.ink}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                  }}>🔒</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: HF.mono, fontSize: 9, letterSpacing: 1,
                      background: HF.ink, color: HF.paper, padding: '2px 6px',
                    }}>{d.tag}</span>
                  </div>
                  <div style={{ fontFamily: HF.display, fontWeight: 800, fontSize: 17, color: HF.ink, marginTop: 6, lineHeight: 1.15 }}>{d.zh}</div>
                  <div style={{ fontFamily: HF.body, fontSize: 11, color: HF.pencil, marginTop: 2 }}>{d.en}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 8, fontFamily: HF.mono, fontSize: 10, color: HF.inkSoft }}>
                    <span>📝 {d.qcount} 題</span>
                    <span>⏱ ~{d.mins} 分鐘</span>
                  </div>
                </div>
                <div style={{
                  fontFamily: HF.display, fontWeight: 800, fontSize: 22,
                  color: locked ? HF.ghost : HF.coral, alignSelf: 'center',
                }}>{locked ? '' : '→'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </HFPhone>
  );
}

Object.assign(window, { P2Hifi, L1_DRILLS });
