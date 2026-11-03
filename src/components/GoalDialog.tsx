import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
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
  const [confirmReset, setConfirmReset] = useState(false);
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
          <button className="button-outline" onClick={() => setConfirmReset(true)}>
            အသစ်ပြန်စမည်
          </button>
          <button className="button-outline" onClick={onDone}>
            ပြီးပါပြီ
          </button>
        </div>
        {confirmReset && <ConfirmDialog title="ယခုအကြိမ် ပြန်စမည်လား" onClose={() => setConfirmReset(false)} onConfirm={onReset} confirmLabel="ပြန်စမည်"><p>ယခုအကြိမ်ကို ပြန်စပါမည်။ မှတ်တမ်းများ မပျက်ပါ။</p></ConfirmDialog>}
      </div>
    </div>
  );
}
