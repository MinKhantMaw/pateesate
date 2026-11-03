import { useState } from "react";
import { number } from "../utils/date";

export function RoundSettings({
  beadsPerRound,
  goalRounds,
  onChange,
}: {
  beadsPerRound: number;
  goalRounds: number;
  onChange: (beadsPerRound: number, goalRounds: number) => void;
}) {
  const [customBeads, setCustomBeads] = useState(
    ![9, 27, 54, 108].includes(beadsPerRound),
  );
  const [customGoal, setCustomGoal] = useState(
    ![1, 3, 7, 9].includes(goalRounds),
  );
  const [beadsInput, setBeadsInput] = useState(String(beadsPerRound));
  const [goalInput, setGoalInput] = useState(String(goalRounds));
  function apply(value: string, type: "beads" | "goal") {
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 1000000) return;
    onChange(
      type === "beads" ? parsed : beadsPerRound,
      type === "goal" ? parsed : goalRounds,
    );
  }
  return (
    <div className="round-settings">
      <div>
        <label className="field-label" htmlFor="beads-per-round">
          တစ်ပတ်လျှင် အကြိမ်ရေ
        </label>
        <select
          id="beads-per-round"
          className="text-input"
          value={customBeads ? "custom" : beadsPerRound}
          onChange={(event) => {
            if (event.target.value === "custom") {
              setCustomBeads(true);
              setBeadsInput(String(beadsPerRound));
            } else {
              setCustomBeads(false);
              apply(event.target.value, "beads");
            }
          }}
        >
          {[9, 27, 54, 108].map((value) => (
            <option key={value} value={value}>
              {number(value)}
            </option>
          ))}
          <option value="custom">ကိုယ်တိုင်သတ်မှတ်မည်</option>
        </select>
        {customBeads && (
          <div className="custom-target">
            <input
              aria-label="တစ်ပတ်လျှင် ကိုယ်တိုင်သတ်မှတ်မည့် အကြိမ်ရေ"
              className="text-input"
              type="number"
              min="1"
              max="1000000"
              value={beadsInput}
              onChange={(event) => setBeadsInput(event.target.value)}
            />
            <button
              className="button-outline"
              onClick={() => apply(beadsInput, "beads")}
            >
              သတ်မှတ်မည်
            </button>
          </div>
        )}
      </div>
      <div>
        <label className="field-label" htmlFor="goal-rounds">
          ရည်မှန်းချက် (ပတ်ရေ)
        </label>
        <select
          id="goal-rounds"
          className="text-input"
          value={customGoal ? "custom" : goalRounds}
          onChange={(event) => {
            if (event.target.value === "custom") {
              setCustomGoal(true);
              setGoalInput(String(goalRounds));
            } else {
              setCustomGoal(false);
              apply(event.target.value, "goal");
            }
          }}
        >
          {[1, 3, 7, 9].map((value) => (
            <option key={value} value={value}>
              {number(value)}
            </option>
          ))}
          <option value="custom">ကိုယ်တိုင်သတ်မှတ်မည်</option>
        </select>
        {customGoal && (
          <div className="custom-target">
            <input
              aria-label="ကိုယ်တိုင်သတ်မှတ်မည့် ရည်မှန်းချက်ပတ်ရေ"
              className="text-input"
              type="number"
              min="1"
              max="1000000"
              value={goalInput}
              onChange={(event) => setGoalInput(event.target.value)}
            />
            <button
              className="button-outline"
              onClick={() => apply(goalInput, "goal")}
            >
              သတ်မှတ်မည်
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
