import { memo, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { number } from "../utils/date";

const Bead = memo(function Bead({ x, y, radius, lit, current, next, recent, pulse, shimmer, delay }: {
  x: number; y: number; radius: number; lit: boolean; current: boolean;
  next: boolean; recent: boolean; pulse: number; shimmer: number; delay: number;
}) {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    if (!pulse || !ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = ref.current.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.5)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
      { duration: 250, easing: "ease-out" },
    );
    return () => animation.cancel();
  }, [pulse]);
  useEffect(() => {
    if (!shimmer || !ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = ref.current.animate(
      [{ strokeOpacity: 0.4 }, { strokeOpacity: 1, strokeWidth: 3 }, { strokeOpacity: 0.4 }],
      { duration: 300, easing: "ease-out" },
    );
    return () => animation.cancel();
  }, [shimmer]);
  return (
    <g ref={ref} className={`mala-bead-node${lit ? " is-lit" : ""}${current ? " is-current" : ""}${next ? " is-next" : ""}${recent ? " is-recent" : ""}`} style={{ "--wave-delay": `${delay}ms` } as CSSProperties}>
      <circle className="mala-bead" cx={x} cy={y} r={radius} />
      <circle className="mala-bead-light" cx={x} cy={y} r={radius} />
    </g>
  );
});

export function CounterButton({ count, target, rounds, style, glow, disabled, onClick }: {
  count: number; target: number; rounds: number; style: "gold" | "jade" | "wood"; glow: boolean; disabled?: boolean; onClick: () => void;
}) {
  const gradient = useId();
  const previous = useRef({ count, rounds });
  const [wave, setWave] = useState(0);
  const [forwardCount, setForwardCount] = useState<number | null>(null);
  const forward = forwardCount === count;
  const visualCount = Math.min(target, 108);
  const litCount = Math.floor(count * visualCount / target);
  const radius = Math.min(13, 440 / visualCount);

  useEffect(() => {
    const completed = rounds > previous.current.rounds && count === 0;
    const wentBack = rounds < previous.current.rounds || (rounds === previous.current.rounds && count < previous.current.count);
    setForwardCount(count > previous.current.count ? count : null);
    previous.current = { count, rounds };
    if (wentBack) setWave(0);
    if (!completed) return;
    setWave(previousWave => previousWave + 1);
  }, [count, rounds]);
  useEffect(() => {
    if (!wave) return;
    const timer = window.setTimeout(() => setWave(0), 1050);
    return () => window.clearTimeout(timer);
  }, [wave]);

  return (
    <div className={`bead-orbit${wave ? " mala-wave" : ""}`} data-style={style} data-glow={glow}>
      <svg className="mala-ring" viewBox="0 0 400 420" aria-hidden="true" style={{ "--bead-fill": `url(#${gradient})` } as CSSProperties}>
        <defs>
          <radialGradient id={gradient} cx="32%" cy="25%">
            <stop offset="0" className="bead-highlight" />
            <stop offset="1" className="bead-shadow" />
          </radialGradient>
        </defs>
        <circle className="mala-cord" cx="200" cy="210" r="167" />
        {Array.from({ length: visualCount }, (_, index) => {
          const angle = (index + 1) * 2 * Math.PI / (visualCount + 1) - Math.PI / 2;
          return <Bead key={index} x={200 + 167 * Math.cos(angle)} y={210 + 167 * Math.sin(angle)} radius={radius} lit={index < litCount} current={index === litCount - 1} next={index === litCount} recent={index < litCount && index >= litCount - 3} pulse={forward && index === litCount - 1 ? count : 0} shimmer={forward && index === litCount ? count : 0} delay={index * 600 / visualCount} />;
        })}
        <path className="guru-tassel" d="M200 37 L200 25 M194 25 Q200 21 206 25 L208 14 M196 25 L192 14 M200 25 L200 12 M204 25 L204 14" />
        <circle className="guru-bead" cx="200" cy="43" r={Math.max(9, radius + 3)} fill={`url(#${gradient})`} />
      </svg>
      <button className="bead-button" onClick={onClick} disabled={disabled} aria-label="ပုတီး တစ်ကြိမ်စိပ်မည်">
        <span className="bead-inner">
          <span className="bead-small">ယခုပတ်:</span>
          <strong className="bead-count">{number(count)}</strong>
          <span className="bead-target">/ {number(target)}</span>
          <span className="bead-hint">နှိပ်၍ စိပ်ပါ</span>
        </span>
      </button>
      <span className="sr-only" aria-live="polite">ယခုပတ် {number(count)} / {number(target)}</span>
    </div>
  );
}
