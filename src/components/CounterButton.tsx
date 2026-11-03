import { useState } from "react";
import { number } from "../utils/date";

export function CounterButton({
  count,
  target,
  onClick,
  passes = false,
}: {
  count: number;
  target: number;
  onClick: () => void;
  passes?: boolean;
}) {
  const [animation, setAnimation] = useState(0);
  return (
    <button
      className="bead-button"
      onClick={() => {
        setAnimation((value) => value + 1);
        onClick();
      }}
      aria-label="ပုတီး တစ်ကြိမ်စိပ်မည်"
    >
      <span key={animation} className={animation ? "bead-ripple" : ""} />
      <span className="bead-inner">
        <span className="bead-small">{passes ? "ယခုပတ်ရေ" : "ယခုအကြိမ်"}</span>
        <strong className="bead-count">{number(count)}</strong>
        <span className="bead-target">
          / {number(target)}
          {passes && " ပတ်"}
        </span>
        <span className="bead-hint">နှိပ်၍ စိပ်ပါ</span>
      </span>
    </button>
  );
}
