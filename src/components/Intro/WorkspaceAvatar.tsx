import { useRef } from 'react';
import { useLipSync } from '../../hooks/useLipSync';

/**
 * Imagined presenter: a stylized developer seated at a workspace wearing a
 * call-center headset. Fully coded (SVG) — no photo, no external assets. The
 * mouth lip-syncs to the narration via useLipSync; eyes blink and the figure
 * breathes (idle), all pausable for reduced-motion.
 */
export default function WorkspaceAvatar({
  speaking,
  reduce,
}: {
  speaking: boolean;
  reduce: boolean;
}) {
  const mouthRef = useRef<SVGEllipseElement>(null);
  useLipSync(mouthRef, speaking && !reduce);

  const idle = reduce ? '' : ' wa--animated';

  return (
    <svg
      className={`wa${idle}`}
      viewBox="0 0 360 300"
      role="img"
      aria-label="Animated developer presenting from a workspace"
    >
      <defs>
        <linearGradient id="wa-room" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1426" />
          <stop offset="1" stopColor="#070c18" />
        </linearGradient>
        <linearGradient id="wa-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14233e" />
          <stop offset="1" stopColor="#0c1730" />
        </linearGradient>
        <linearGradient id="wa-hoodie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22344f" />
          <stop offset="1" stopColor="#172741" />
        </linearGradient>
        <radialGradient id="wa-lampglow" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor="rgba(255,79,31,0.5)" />
          <stop offset="1" stopColor="rgba(255,79,31,0)" />
        </radialGradient>
        <radialGradient id="wa-screenglow" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="rgba(14,165,233,0.35)" />
          <stop offset="1" stopColor="rgba(14,165,233,0)" />
        </radialGradient>
        <clipPath id="wa-window"><rect x="232" y="28" width="96" height="64" rx="4" /></clipPath>
      </defs>

      {/* Room */}
      <rect x="6" y="6" width="348" height="288" rx="16" fill="url(#wa-room)" stroke="rgba(14,165,233,0.14)" />

      {/* Window with night skyline */}
      <g clipPath="url(#wa-window)">
        <rect x="232" y="28" width="96" height="64" fill="#0c1a32" />
        <circle cx="312" cy="46" r="9" fill="#cfe0f0" opacity="0.85" />
        {[244, 258, 270, 284, 300].map((x, i) => (
          <circle key={i} cx={x} cy={40 + (i % 3) * 6} r="1" fill="#cfe0f0" opacity="0.5" />
        ))}
        <g fill="#060b16">
          <rect x="236" y="66" width="16" height="26" />
          <rect x="256" y="56" width="14" height="36" />
          <rect x="274" y="70" width="12" height="22" />
          <rect x="290" y="60" width="16" height="32" />
          <rect x="310" y="72" width="14" height="20" />
        </g>
        <g stroke="rgba(14,165,233,0.18)" strokeWidth="1">
          <line x1="244" y1="74" x2="244" y2="88" /><line x1="262" y1="64" x2="262" y2="88" />
          <line x1="296" y1="68" x2="296" y2="88" />
        </g>
      </g>
      <rect x="232" y="28" width="96" height="64" rx="4" fill="none" stroke="rgba(14,165,233,0.2)" />

      {/* Shelf + plant (left) */}
      <rect x="28" y="74" width="58" height="5" rx="2" fill="#0f1d36" />
      <g>
        <path d="M52 74 C44 60 40 54 46 44 C52 52 54 60 54 70 Z" fill="#1f7a4d" />
        <path d="M56 74 C64 58 70 54 66 42 C58 50 56 60 56 70 Z" fill="#26925c" />
        <rect x="48" y="74" width="16" height="10" rx="2" fill="#1a2b46" />
      </g>

      {/* Monitor (left) */}
      <g>
        <rect x="36" y="150" width="78" height="56" rx="4" fill="#0a1a2e" stroke="rgba(14,165,233,0.25)" />
        <rect x="40" y="154" width="70" height="48" rx="2" fill="#0b1f33" />
        <ellipse cx="75" cy="178" rx="60" ry="40" fill="url(#wa-screenglow)" />
        <g className="wa-code">
          <rect x="46" y="160" width="34" height="3" rx="1.5" fill="rgba(14,165,233,0.7)" />
          <rect x="46" y="167" width="50" height="3" rx="1.5" fill="rgba(255,79,31,0.6)" />
          <rect x="52" y="174" width="40" height="3" rx="1.5" fill="rgba(232,239,248,0.45)" />
          <rect x="52" y="181" width="28" height="3" rx="1.5" fill="rgba(14,165,233,0.5)" />
          <rect x="46" y="188" width="44" height="3" rx="1.5" fill="rgba(232,239,248,0.3)" />
        </g>
        <rect x="70" y="206" width="10" height="14" fill="#0c1830" />
        <rect x="58" y="220" width="34" height="5" rx="2" fill="#0f1d36" />
      </g>

      {/* Desk lamp (right) with glow */}
      <ellipse cx="296" cy="150" rx="46" ry="40" fill="url(#wa-lampglow)" />
      <g stroke="#1a2b46" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M312 226 L308 186 L288 150" />
      </g>
      <circle cx="312" cy="226" r="9" fill="#16263f" />
      <path d="M278 142 L300 142 L292 158 L286 158 Z" fill="#1f3151" />
      <circle cx="289" cy="156" r="3" fill="#ffd9a8" />

      {/* Chair back */}
      <rect x="146" y="158" width="68" height="86" rx="22" fill="#101d33" />

      {/* Character (breathing group) */}
      <g className="wa-figure">
        {/* Torso / hoodie */}
        <path d="M138 244 L146 192 Q150 174 180 170 Q210 174 214 192 L222 244 Z" fill="url(#wa-hoodie)" />
        <path d="M180 170 L180 244" stroke="rgba(14,165,233,0.18)" strokeWidth="2" />
        <path d="M170 172 Q180 186 190 172" fill="none" stroke="rgba(14,165,233,0.25)" strokeWidth="2" />

        {/* Neck */}
        <rect x="171" y="148" width="18" height="18" rx="6" fill="#d39e78" />

        {/* Head group (head bob) */}
        <g className="wa-head">
          {/* Ears */}
          <ellipse cx="147" cy="120" rx="6" ry="9" fill="#e7b48f" />
          <ellipse cx="213" cy="120" rx="6" ry="9" fill="#e7b48f" />
          {/* Head */}
          <ellipse cx="180" cy="118" rx="34" ry="37" fill="#e7b48f" />
          {/* Hair */}
          <path d="M146 116 Q146 78 180 78 Q214 78 214 116 Q214 96 196 92 Q188 104 162 98 Q150 100 146 116 Z" fill="#2a2320" />
          {/* Eyebrows */}
          <rect className="wa-brow" x="160" y="104" width="14" height="3" rx="1.5" fill="#2a2320" />
          <rect className="wa-brow" x="186" y="104" width="14" height="3" rx="1.5" fill="#2a2320" />
          {/* Eyes */}
          <g>
            <ellipse cx="167" cy="115" rx="5" ry="6" fill="#f2f7fc" />
            <circle cx="168" cy="116" r="2.6" fill="#1b2330" />
            <ellipse cx="193" cy="115" rx="5" ry="6" fill="#f2f7fc" />
            <circle cx="194" cy="116" r="2.6" fill="#1b2330" />
            {/* Eyelids (blink) */}
            <rect className="wa-eyelid" x="161" y="108" width="12" height="14" rx="5" fill="#e7b48f" />
            <rect className="wa-eyelid" x="187" y="108" width="12" height="14" rx="5" fill="#e7b48f" />
          </g>
          {/* Glasses */}
          <g fill="none" stroke="rgba(14,165,233,0.85)" strokeWidth="2">
            <circle cx="167" cy="115" r="9" />
            <circle cx="193" cy="115" r="9" />
            <line x1="176" y1="115" x2="184" y2="115" />
          </g>
          {/* Nose */}
          <path d="M180 120 L177 130 L183 130 Z" fill="#d39e78" />
          {/* Mouth (lip-sync target) */}
          <ellipse ref={mouthRef} cx="180" cy="139" rx="6" ry="1.5" fill="#7a3b33" />

          {/* Headset */}
          <path d="M146 116 Q146 70 180 70 Q214 70 214 116" fill="none" stroke="#0f1726" strokeWidth="6" strokeLinecap="round" />
          <rect x="139" y="112" width="12" height="20" rx="5" fill="#16243c" stroke="rgba(14,165,233,0.3)" />
          <rect x="209" y="112" width="12" height="20" rx="5" fill="#16243c" stroke="rgba(14,165,233,0.3)" />
          {/* Mic boom */}
          <path d="M145 130 Q150 150 168 144" fill="none" stroke="#0f1726" strokeWidth="3" strokeLinecap="round" />
          <circle className="wa-mic" cx="168" cy="144" r="3.2" fill="#FF4F1F" />
        </g>
      </g>

      {/* Desk (in front of torso) */}
      <rect x="20" y="232" width="320" height="58" fill="url(#wa-desk)" />
      <rect x="20" y="232" width="320" height="3" fill="rgba(14,165,233,0.25)" />

      {/* Keyboard + hands */}
      <rect x="150" y="246" width="60" height="11" rx="3" fill="#0e1b30" stroke="rgba(14,165,233,0.18)" />
      <ellipse cx="158" cy="244" rx="9" ry="6" fill="#e7b48f" />
      <ellipse cx="202" cy="244" rx="9" ry="6" fill="#e7b48f" />

      {/* Coffee mug */}
      <g>
        <rect x="246" y="238" width="20" height="20" rx="3" fill="#16243c" stroke="rgba(255,79,31,0.4)" />
        <path d="M266 242 q8 0 8 6 q0 6 -8 6" fill="none" stroke="rgba(255,79,31,0.4)" strokeWidth="2" />
        <path className="wa-steam" d="M252 234 q3 -4 0 -8 M260 234 q3 -4 0 -8" fill="none" stroke="rgba(232,239,248,0.25)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
