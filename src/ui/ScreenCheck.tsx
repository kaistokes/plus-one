import { useEffect, useState } from 'react';

const probe = (style: Partial<CSSStyleDeclaration>) => {
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'fixed', left: '0', top: '0', width: '0', visibility: 'hidden' }, style);
  document.body.appendChild(el);
  const h = el.getBoundingClientRect().height;
  el.remove();
  return Math.round(h);
};

function measure(): [string, string | number][] {
  const screenEl = document.querySelector('.screen')?.getBoundingClientRect();
  const button = [...document.querySelectorAll('.btn-primary')].at(-1)?.getBoundingClientRect();
  const vv = window.visualViewport;
  return [
    ['iOS', /OS (\d+[_\d]*)/.exec(navigator.userAgent)?.[1]?.replace(/_/g, '.') ?? '?'],
    ['standalone', `${matchMedia('(display-mode: standalone)').matches} / ${(navigator as { standalone?: boolean }).standalone}`],
    ['screen', `${screen.width} × ${screen.height}`],
    ['inner', `${innerWidth} × ${innerHeight}`],
    ['client height', document.documentElement.clientHeight],
    ['visual viewport', vv ? `${Math.round(vv.height)} (top ${Math.round(vv.offsetTop)})` : '?'],
    ['100vh / dvh / lvh / svh', ['100vh', '100dvh', '100lvh', '100svh'].map((h) => probe({ height: h })).join(' / ')],
    ['safe top / bottom', `${probe({ height: 'env(safe-area-inset-top)' })} / ${probe({ height: 'env(safe-area-inset-bottom)' })}`],
    ['layout top / bottom', screenEl ? `${Math.round(screenEl.top)} / ${Math.round(screenEl.bottom)}` : '?'],
    ['button bottom', button ? Math.round(button.bottom) : '?'],
  ];
}

export function ScreenCheck({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<[string, string | number][]>([]);
  useEffect(() => {
    const update = () => requestAnimationFrame(() => setRows(measure()));
    update();
    addEventListener('resize', update);
    return () => removeEventListener('resize', update);
  }, []);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, border: '3px dashed var(--sage)', pointerEvents: 'none', zIndex: 20 }} />
      <div style={{ position: 'fixed', left: 0, right: 0, top: 0, height: '100lvh', borderBottom: '3px solid var(--dusk)', pointerEvents: 'none', zIndex: 20 }} />
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          left: 16,
          right: 16,
          top: '30%',
          zIndex: 21,
          background: 'var(--steel)',
          borderRadius: 14,
          padding: 14,
          textAlign: 'left',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span className="muted">{k}</span>
            <span className="num">{String(v)}</span>
          </div>
        ))}
        <div className="muted" style={{ marginTop: 8 }}>
          Green dashes mark the page edge, the blue line marks 100lvh. Tap to close.
        </div>
      </button>
    </>
  );
}
