import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ListMusic,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "./ConfirmDialog";
import { defaultCombos } from "../data/defaultCombos";
import { useApp } from "../store/AppContextValue";
import { availableCategories } from "../utils/data";
import { localizeDigits, number } from "../utils/date";
import type { Combo, ComboStep } from "../types";

export function ComboManager() {
  const {
    categories: storedCategories,
    combos,
    setCombos,
    clearComboSession,
    setCounterMode,
    groupRounds,
  } = useApp();
  const [editing, setEditing] = useState<Combo | "new" | null>(null);
  const [deleting, setDeleting] = useState<Combo | null>(null);
  const [resetting, setResetting] = useState(false);
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<ComboStep[]>([]);
  const [error, setError] = useState("");
  const categories = availableCategories(storedCategories);
  const items = categories.flatMap((category) => category.items);
  const itemIds = new Set(items.map((item) => item.id));

  function edit(combo: Combo | "new") {
    setName(combo === "new" ? "" : combo.name);
    setSteps(combo === "new" ? [] : combo.steps.map((step) => ({ ...step })));
    setError("");
    setEditing(combo);
  }
  function save() {
    if (
      !name.trim() ||
      !steps.length ||
      steps.some(
        (step) =>
          !itemIds.has(step.itemId) ||
          !Number.isSafeInteger(step.repeat) ||
          step.repeat < 1 ||
          step.repeat > 1000000,
      )
    ) {
      setError(`အမည်၊ စာသားနှင့် ${number(1)} မှ ${number(1000000)} အတွင်း အကြိမ်ရေကို ဖြည့်ပါ။`);
      return;
    }
    const combo = {
      id: editing === "new" ? crypto.randomUUID() : (editing as Combo).id,
      name: name.trim(),
      steps,
    };
    setCombos((previous) =>
      editing === "new"
        ? [...previous, combo]
        : previous.map((existing) =>
            existing.id === combo.id ? combo : existing,
          ),
    );
    if (
      editing !== "new" &&
      editing &&
      JSON.stringify(editing.steps) !== JSON.stringify(steps)
    )
      clearComboSession(combo.id);
    setEditing(null);
  }
  function updateStep(index: number, patch: Partial<ComboStep>) {
    setSteps((previous) =>
      previous.map((step, position) =>
        position === index ? { ...step, ...patch } : step,
      ),
    );
  }
  function moveStep(index: number, offset: number) {
    setSteps((previous) => {
      const result = [...previous];
      const destination = index + offset;
      [result[index], result[destination]] = [
        result[destination],
        result[index],
      ];
      return result;
    });
  }
  return (
    <section className="combo-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">အစဉ်လိုက်စိပ်ရန်</span>
          <h2>စိပ်ရန်အစီအစဉ်များ</h2>
        </div>
        <div className="category-heading-actions">
          {!combos.some((combo) => combo.id === defaultCombos[0].id) && (
            <button
              className="button-outline"
              onClick={() => setResetting(true)}
            >
              <RotateCcw size={17} /> မူလအစီအစဉ် ပြန်ယူမည်
            </button>
          )}
          <button className="button-outline" onClick={() => edit("new")}>
            <Plus size={19} /> အစီအစဉ်ထည့်မည်
          </button>
        </div>
      </div>
      <div className="combo-list">
        {combos.map((combo) => {
          const missing = combo.steps.some((step) => !itemIds.has(step.itemId));
          return (
            <article className="combo-row" key={combo.id}>
              <div className="combo-info">
                <strong>{localizeDigits(combo.name)}</strong>
                <span>
                  {number(combo.steps.length)} မျိုး ·{" "}
                  {number(groupRounds[combo.id] ?? 0)} ပတ်
                </span>
                {missing && <small>ဖျက်ထားသော စာသားပါရှိသည်။ ပြင်ဆင်ပါ။</small>}
              </div>
              <div className="combo-actions">
                {!missing && (
                  <Link
                    className="button-outline"
                    to={`/combo/${encodeURIComponent(combo.id)}`}
                  >
                    <Play size={17} /> စိပ်မည်
                  </Link>
                )}
                <button
                  className="icon-button"
                  title="ပြင်မည်"
                  aria-label={`${combo.name} ပြင်မည်`}
                  onClick={() => edit(combo)}
                >
                  <Pencil size={17} />
                </button>
                {combo.id === defaultCombos[0].id && (
                  <button
                    className="icon-button"
                    title="မူလအစီအစဉ် ပြန်ယူမည်"
                    aria-label={`${combo.name} မူလအစီအစဉ် ပြန်ယူမည်`}
                    disabled
                    onClick={() => setResetting(true)}
                  >
                    <RotateCcw size={17} />
                  </button>
                )}
                <button
                  className="icon-button"
                  title="ဖျက်မည်"
                  aria-label={`${combo.name} ဖျက်မည်`}
                  disabled
                  onClick={() => setDeleting(combo)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          );
        })}
        {!combos.length && (
          <div className="empty-state"><ListMusic size={28} aria-hidden="true" />အစီအစဉ် မရှိသေးပါ။</div>
        )}
      </div>
      {editing && (
        <ConfirmDialog
          title={editing === "new" ? "အစီအစဉ်အသစ်" : "အစီအစဉ်ပြင်မည်"}
          onClose={() => setEditing(null)}
          onConfirm={save}
          confirmLabel="သိမ်းမည်"
        >
          <label className="field-label" htmlFor="combo-name">
            အစီအစဉ်အမည်
          </label>
          <input
            id="combo-name"
            className="text-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            maxLength={150}
          />
          <div className="combo-editor-list">
            {steps.map((step, index) => (
              <div className="combo-editor-step" key={index}>
                <div className="combo-step-heading">
                  <strong>{number(index + 1)}</strong>
                  <div>
                    <button
                      className="icon-button"
                      title="အပေါ်သို့"
                      aria-label={`${number(index + 1)} အပေါ်သို့`}
                      disabled={index === 0}
                      onClick={() => moveStep(index, -1)}
                    >
                      <ArrowUp size={17} />
                    </button>
                    <button
                      className="icon-button"
                      title="အောက်သို့"
                      aria-label={`${number(index + 1)} အောက်သို့`}
                      disabled={index === steps.length - 1}
                      onClick={() => moveStep(index, 1)}
                    >
                      <ArrowDown size={17} />
                    </button>
                    <button
                      className="icon-button"
                      title="ဖယ်မည်"
                      aria-label={`${number(index + 1)} ဖယ်မည်`}
                      onClick={() =>
                        setSteps((previous) =>
                          previous.filter((_, position) => position !== index),
                        )
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
                <label className="field-label" htmlFor={`combo-item-${index}`}>
                  စာသား
                </label>
                <select
                  className="text-input"
                  id={`combo-item-${index}`}
                  value={step.itemId}
                  onChange={(event) =>
                    updateStep(index, { itemId: event.target.value })
                  }
                >
                  {!itemIds.has(step.itemId) && (
                    <option value={step.itemId}>ဖျက်ထားသော စာသား</option>
                  )}
                  {categories.map((category) => (
                    <optgroup key={category.id} label={localizeDigits(category.name)}>
                      {category.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.group ? `${item.group} · ` : ""}
                          {localizeDigits(item.name)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <label
                  className="field-label mt-2"
                  htmlFor={`combo-repeat-${index}`}
                >
                  စိပ်မည့်အကြိမ်ရေ
                </label>
                <input
                  className="text-input"
                  id={`combo-repeat-${index}`}
                  type="number"
                  min="1"
                  max="1000000"
                  value={step.repeat}
                  onChange={(event) =>
                    updateStep(index, { repeat: Number(event.target.value) })
                  }
                />
              </div>
            ))}
          </div>
          <button
            className="button-outline"
            disabled={!items.length}
            onClick={() =>
              setSteps((previous) => [
                ...previous,
                { itemId: items[0].id, repeat: 1 },
              ])
            }
          >
            <Plus size={18} /> စာသားထည့်မည်
          </button>
          {error && (
            <p className="combo-error" role="alert">
              {error}
            </p>
          )}
        </ConfirmDialog>
      )}
      {deleting && (
        <ConfirmDialog
          title="အစီအစဉ် ဖျက်မည်လား"
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            setCombos((previous) =>
              previous.filter((combo) => combo.id !== deleting.id),
            );
            clearComboSession(deleting.id);
            setDeleting(null);
          }}
          confirmLabel="ဖျက်မည်"
          danger
        >
          <p>
            “{deleting.name}” ကို ဖျက်ပါမည်။ စာသားများနှင့် မှတ်တမ်းများ
            မပျက်ပါ။
          </p>
        </ConfirmDialog>
      )}
      {resetting && (
        <ConfirmDialog
          title="မူလအစီအစဉ် ပြန်ယူမည်လား"
          onClose={() => setResetting(false)}
          onConfirm={() => {
            const original = defaultCombos[0];
            setCombos((previous) =>
              previous.some((combo) => combo.id === original.id)
                ? previous.map((combo) =>
                    combo.id === original.id ? original : combo,
                  )
                : [...previous, original],
            );
            clearComboSession(original.id);
            setCounterMode(original.id, undefined, "sequence");
            setResetting(false);
          }}
          confirmLabel="ပြန်ယူမည်"
        >
          <p>
            စာသားအစီအစဉ်နှင့် အကြိမ်ရေများကို မူလအတိုင်း ပြန်ထားပါမည်။
            စုစုပေါင်းနှင့် မှတ်တမ်းများ မပျက်ပါ။
          </p>
        </ConfirmDialog>
      )}
    </section>
  );
}
