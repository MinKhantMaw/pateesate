import { useState } from "react";
import { Plus } from "lucide-react";
import { CategoryCard } from "../components/CategoryCard";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ComboManager } from "../components/ComboManager";
import { useApp } from "../store/AppContextValue";
import { number } from "../utils/date";
import type { Category, CounterMode } from "../types";

export function Home() {
  const { categories, setCategories, counts, clearCounterModes } = useApp();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<CounterMode>("sequence");
  const [deleting, setDeleting] = useState<Category | null>(null);
  const total = Object.values(counts).reduce(
    (sum, item) => sum + item.total,
    0,
  );
  function edit(category: Category | "new") {
    setName(category === "new" ? "" : category.name);
    setMode(category === "new" ? "sequence" : category.mode);
    setEditing(category);
  }
  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editing === "new")
      setCategories((previous) => [
        ...previous,
        { id: crypto.randomUUID(), name: trimmed, mode, items: [] },
      ]);
    else if (editing) {
      setCategories((previous) =>
        previous.map((category) =>
          category.id === editing.id
            ? { ...category, name: trimmed, mode }
            : category,
        ),
      );
      if (mode !== editing.mode) clearCounterModes(editing.id);
    }
    setEditing(null);
  }
  return (
    <main className="page-wrap">
      <div className="page-heading home-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> နေ့စဉ်ကုသိုလ်
          </div>
          <h1>ပုတီးစိပ်မယ်</h1>
          <p>စိတ်ကိုငြိမ်သက်စေပြီး ကုသိုလ်ပွားများကြပါစို့။</p>
        </div>
        <div className="home-total">
          <span>ယနေ့အထိ စုစုပေါင်း</span>
          <strong>
            {number(total)} <small>ကြိမ်</small>
          </strong>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <span className="section-kicker">စိပ်ရန်ရွေးချယ်ပါ</span>
          <h2>ဂုဏ်တော်နှင့် ဓမ္မစကား</h2>
        </div>
        <button className="button-outline" onClick={() => edit("new")}>
          <Plus size={19} /> <span>အမျိုးအစားထည့်မည်</span>
        </button>
      </div>
      <div className="category-grid">
        {categories
          .filter((category) => category.id !== "combo")
          .map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              counts={counts}
              index={index}
              onEdit={() => edit(category)}
              onDelete={() => setDeleting(category)}
            />
          ))}
      </div>
      <ComboManager />
      {editing && (
        <ConfirmDialog
          title={editing === "new" ? "အမျိုးအစားအသစ်" : "အမျိုးအစားပြင်မည်"}
          onClose={() => setEditing(null)}
          onConfirm={save}
          confirmLabel="သိမ်းမည်"
        >
          <label className="field-label" htmlFor="category-name">
            အမျိုးအစားအမည်
          </label>
          <input
            id="category-name"
            className="text-input"
            autoFocus
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") save();
            }}
          />
          <label className="field-label mt-4" htmlFor="category-mode">
            စိပ်မည့်ပုံစံ
          </label>
          <select
            id="category-mode"
            className="text-input"
            value={mode}
            onChange={(event) => setMode(event.target.value as CounterMode)}
          >
            <option value="single">တစ်ခုတည်းစိပ်မည်</option>
            <option value="sequence">အစဉ်လိုက်စိပ်မည်</option>
          </select>
        </ConfirmDialog>
      )}
      {deleting && (
        <ConfirmDialog
          title="အမျိုးအစား ဖျက်မည်လား"
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            setCategories((previous) =>
              previous.filter((category) => category.id !== deleting.id),
            );
            setDeleting(null);
          }}
          confirmLabel="ဖျက်မည်"
          danger
        >
          <p>
            “{deleting.name}” နှင့် ၎င်းအတွင်းရှိ စာသားများကို ဖျက်ပါမည်။
            စိပ်ခဲ့သော အရေအတွက်နှင့် မှတ်တမ်းများကို ဆက်လက်ထိန်းသိမ်းထားပါမည်။
          </p>
        </ConfirmDialog>
      )}
    </main>
  );
}
