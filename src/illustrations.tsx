import type { ReactNode } from 'react';
import type { ExerciseId } from './domain/types';

const art: Record<ExerciseId, ReactNode> = {
  'incline-press': (
    <>
      <line className="il-f" x1="20" y1="138" x2="150" y2="138" />
      <line className="il-f" x1="30" y1="138" x2="30" y2="20" />
      <line className="il-f" x1="30" y1="20" x2="52" y2="20" />
      <line className="il-f" x1="30" y1="70" x2="44" y2="70" />
      <line className="il-f" x1="75" y1="106" x2="75" y2="138" />
      <polygon className="il-p" points="62.2,94.3 42.2,44.3 33.8,47.7 53.8,97.7" />
      <rect className="il-p" x="55" y="98" width="40" height="8" rx="3" />
      <circle className="il-h" cx="42" cy="39" r="7" />
      <polyline className="il-b" points="67,92 47,50" />
      <polyline className="il-b" points="67,92 98,94 102,134" />
      <polyline className="il-b" points="47,50 71,40 95,28" />
      <line className="il-m" x1="52" y1="20" x2="95" y2="28" />
      <circle className="il-m" cx="66" cy="23" r="10" />
      <circle className="il-c" cx="95" cy="28" r="4.5" />
      <circle className="il-pivot" cx="52" cy="20" r="3.5" />
    </>
  ),
  'high-row': (
    <>
      <line className="il-f" x1="25" y1="138" x2="172" y2="138" />
      <line className="il-f" x1="160" y1="138" x2="160" y2="30" />
      <line className="il-f" x1="141" y1="64" x2="160" y2="64" />
      <line className="il-f" x1="100" y1="94" x2="160" y2="94" />
      <line className="il-f" x1="60" y1="112" x2="60" y2="138" />
      <rect className="il-p" x="40" y="104" width="40" height="8" rx="3" />
      <circle className="il-h" cx="56" cy="43" r="7" />
      <polyline className="il-b" points="55,100 58,56" />
      <polyline className="il-b" points="55,100 92,104 95,136" />
      <polyline className="il-b" points="58,56 42,72 70,72" />
      <rect className="il-p" x="78" y="90" width="22" height="8" rx="4" />
      <line className="il-m" x1="141" y1="64" x2="70" y2="72" />
      <circle className="il-m" cx="109" cy="68" r="10" />
      <circle className="il-c" cx="70" cy="72" r="4.5" />
      <circle className="il-pivot" cx="141" cy="64" r="3.5" />
    </>
  ),
  'db-lateral-raise': (
    <>
      <line className="il-f" x1="60" y1="138" x2="140" y2="138" />
      <line className="il-f" x1="78" y1="110" x2="78" y2="138" />
      <line className="il-f" x1="122" y1="110" x2="122" y2="138" />
      <rect className="il-p" x="82" y="40" width="36" height="62" rx="4" />
      <rect className="il-p" x="70" y="102" width="60" height="8" rx="3" />
      <polyline className="il-b" points="92,106 90,136" />
      <polyline className="il-b" points="108,106 110,136" />
      <rect className="il-h" x="88" y="46" width="24" height="54" rx="9" />
      <circle className="il-h" cx="100" cy="33" r="8" />
      <polyline className="il-b" points="88,52 48,56" />
      <polyline className="il-b" points="112,52 152,56" />
      <circle className="il-m" cx="44" cy="56" r="6" />
      <circle className="il-m" cx="156" cy="56" r="6" />
    </>
  ),
  'db-curl': (
    <>
      <line className="il-f" x1="36" y1="138" x2="104" y2="138" />
      <line className="il-f" x1="66" y1="108" x2="66" y2="138" />
      <rect className="il-p" x="44" y="38" width="9" height="62" rx="3" />
      <rect className="il-p" x="44" y="100" width="46" height="8" rx="3" />
      <circle className="il-h" cx="63" cy="39" r="8" />
      <polyline className="il-b" points="62,96 62,52" />
      <polyline className="il-b" points="62,96 98,98 100,136" />
      <polyline className="il-b" points="62,52 64,80 84,58" />
      <circle className="il-m" cx="86" cy="56" r="6" />
    </>
  ),
  'cable-pushdown': (
    <>
      <line className="il-f" x1="60" y1="138" x2="172" y2="138" />
      <rect className="il-p" x="150" y="10" width="14" height="128" rx="2" />
      <circle className="il-f" cx="146" cy="22" r="5" />
      <circle className="il-h" cx="100" cy="39" r="8" />
      <polyline className="il-b" points="92,92 98,52" />
      <polyline className="il-b" points="92,92 94,114 94,137" />
      <polyline className="il-b" points="92,92 84,114 82,137" />
      <polyline className="il-b" points="98,52 100,80 104,108" />
      <line className="il-m" x1="143" y1="25" x2="106" y2="106" strokeWidth="1.5" />
      <line className="il-m" x1="99" y1="109" x2="109" y2="107" strokeWidth="5" />
    </>
  ),
  'bench-press': (
    <>
      <line className="il-f" x1="20" y1="138" x2="170" y2="138" />
      <line className="il-f" x1="30" y1="138" x2="30" y2="40" />
      <polyline className="il-f" points="30,52 38,52 38,47" />
      <line className="il-f" x1="46" y1="102" x2="46" y2="138" />
      <line className="il-f" x1="122" y1="102" x2="122" y2="138" />
      <rect className="il-p" x="36" y="94" width="96" height="8" rx="3" />
      <circle className="il-h" cx="46" cy="86" r="8" />
      <polyline className="il-b" points="58,88 112,88" />
      <polyline className="il-b" points="112,88 140,90 148,136" />
      <polyline className="il-b" points="62,88 63,64 64,42" />
      <circle className="il-m" cx="64" cy="40" r="15" />
      <circle className="il-c" cx="64" cy="40" r="3" />
    </>
  ),
  'lat-pulldown': (
    <>
      <line className="il-f" x1="56" y1="138" x2="144" y2="138" />
      <rect className="il-p" x="93" y="8" width="14" height="130" rx="2" />
      <circle className="il-f" cx="100" cy="16" r="4" />
      <rect className="il-p" x="74" y="104" width="52" height="8" rx="3" />
      <polyline className="il-b" points="92,108 90,136" />
      <polyline className="il-b" points="108,108 110,136" />
      <rect className="il-h" x="86" y="58" width="28" height="48" rx="9" />
      <circle className="il-h" cx="100" cy="46" r="8" />
      <polyline className="il-b" points="88,64 64,82 66,62" />
      <polyline className="il-b" points="112,64 136,82 134,62" />
      <rect className="il-p" x="76" y="94" width="48" height="8" rx="4" />
      <line className="il-m" x1="100" y1="20" x2="100" y2="62" strokeWidth="1.5" />
      <polyline className="il-m" points="50,56 56,62 144,62 150,56" />
    </>
  ),
  'machine-lateral-raise': (
    <>
      <line className="il-f" x1="40" y1="138" x2="160" y2="138" />
      <line className="il-f" x1="100" y1="112" x2="100" y2="138" />
      <polyline className="il-f" points="76,46 76,38 124,38 124,46" />
      <rect className="il-p" x="84" y="44" width="32" height="60" rx="4" />
      <rect className="il-p" x="72" y="104" width="56" height="8" rx="3" />
      <polyline className="il-b" points="92,108 90,136" />
      <polyline className="il-b" points="108,108 110,136" />
      <rect className="il-h" x="88" y="46" width="24" height="54" rx="9" />
      <circle className="il-h" cx="100" cy="34" r="8" />
      <polyline className="il-b" points="88,54 52,52" />
      <polyline className="il-b" points="112,54 148,52" />
      <line className="il-m" x1="76" y1="46" x2="34" y2="52" />
      <line className="il-m" x1="124" y1="46" x2="166" y2="52" />
      <rect className="il-c" x="60" y="42" width="14" height="6" rx="3" />
      <rect className="il-c" x="126" y="42" width="14" height="6" rx="3" />
      <circle className="il-m" cx="34" cy="52" r="10" />
      <circle className="il-m" cx="166" cy="52" r="10" />
      <circle className="il-pivot" cx="76" cy="46" r="4" />
      <circle className="il-pivot" cx="124" cy="46" r="4" />
    </>
  ),
  'machine-preacher-curl': (
    <>
      <line className="il-f" x1="30" y1="138" x2="160" y2="138" />
      <line className="il-f" x1="60" y1="112" x2="60" y2="138" />
      <line className="il-f" x1="99" y1="90" x2="100" y2="138" />
      <rect className="il-p" x="42" y="104" width="36" height="8" rx="3" />
      <circle className="il-m" cx="116" cy="86" r="12" />
      <polygon className="il-p" points="88,74 118,91 113.6,98.8 83.6,81.8" />
      <polyline className="il-b" points="58,100 90,102 92,136" />
      <polyline className="il-b" points="58,100 84,66" />
      <circle className="il-h" cx="91" cy="56" r="8" />
      <polyline className="il-b" points="84,66 114,84 103,58" />
      <line className="il-m" x1="116" y1="86" x2="104" y2="57" />
      <circle className="il-c" cx="103" cy="55" r="4.5" />
      <circle className="il-pivot" cx="116" cy="86" r="3" />
    </>
  ),
};

export function Illustration({ id, label }: { id: ExerciseId; label: string }) {
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label={label}>
      {art[id]}
    </svg>
  );
}
