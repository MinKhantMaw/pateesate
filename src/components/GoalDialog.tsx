import { Sparkles } from "lucide-react";
import { number } from "../utils/date";

export function GoalDialog({
  rounds,
  beadsPerRound,
  onContinue,
  onReset,
  onDone,
}: {
  rounds: number;
  beadsPerRound: number;
  onContinue: () => void;
  onReset: () => void;
  onDone: () => void;
}) {
  return (
    <div
      className="goal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-title"
    >
      <div className="goal-content">
        <Sparkles className="goal-sparkle" size={40} aria-hidden="true" />
        <h2 id="goal-title">{number(rounds)} ပတ်ပြည့်ပါပြီ 🙏</h2>
        <p>စုစုပေါင်း {number(rounds * beadsPerRound)} ကြိမ် စိပ်ပြီးပါပြီ</p>
        <p className="goal-closing">သာဓု သာဓု သာဓု</p>
        <div className="goal-actions">
          <button className="button-primary" autoFocus onClick={onContinue}>
            ဆက်စိပ်မည်
          </button>
          <button className="button-outline" onClick={onReset}>
            အသစ်ပြန်စမည်
          </button>
          <button className="button-outline" onClick={onDone}>
            ပြီးပါပြီ
          </button>
        </div>
      </div>
    </div>
  );
}
