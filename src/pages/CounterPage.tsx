import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Undo2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CounterButton } from "../components/CounterButton";
import { counterFeedback, useCounter } from "../hooks/useCounter";
import { useWakeLock } from "../hooks/useWakeLock";
import { useApp } from "../store/AppContextValue";
import { availableCategories, sequenceKey } from "../utils/data";
import { defaultCombos } from "../data/defaultCombos";
import { number } from "../utils/date";
import type {
  Category,
  ChantItem,
  Combo,
  CounterMode,
  SequenceSession,
} from "../types";

export function CounterPage() {
  const { categoryId, itemId = "" } = useParams();
  const store = useApp();
  const category = store.categories.find((entry) => entry.id === categoryId);
  const item = category?.items.find((entry) => entry.id === itemId);
  const wake = useWakeLock();
  if (!category || !item)
    return (
      <main className="page-wrap">
        <p>စိပ်ရန်စာသားကို ရှာမတွေ့ပါ။</p>
        <Link className="back-link" to="/">
          မူလစာမျက်နှာသို့
        </Link>
      </main>
    );
  const mode =
    store.sessionData.modes?.[sequenceKey(category.id, item.group)] ??
    category.mode;
  const setMode = (next: CounterMode) =>
    store.setCounterMode(category.id, item.group, next);
  return mode === "sequence" ? (
    <SequenceScreen
      key={itemId}
      category={category}
      entry={item}
      wake={wake}
      onModeChange={setMode}
    />
  ) : (
    <CounterScreen
      key={itemId}
      category={category}
      item={item}
      wake={wake}
      onModeChange={setMode}
    />
  );
}

export function ComboCounterPage() {
  const { comboId = "" } = useParams();
  const store = useApp();
  const combo = store.combos.find((entry) => entry.id === comboId);
  const wake = useWakeLock();
  const owners = new Map(
    availableCategories(store.categories).flatMap((category) =>
      category.items.map((item) => [item.id, { category, item }] as const),
    ),
  );
  const resolved = combo?.steps.map((step) => owners.get(step.itemId));
  if (!combo || !resolved?.length || resolved.some((entry) => !entry))
    return (
      <main className="page-wrap">
        <p>
          စိပ်ရန်အစီအစဉ် သို့မဟုတ် စာသားကို ရှာမတွေ့ပါ။ အစီအစဉ်ကို ပြင်ဆင်ပါ။
        </p>
        <Link className="back-link" to="/">
          မူလစာမျက်နှာသို့
        </Link>
      </main>
    );
  const entries = resolved as { category: Category; item: ChantItem }[];
  const saved = store.sessionData.sequences[combo.id];
  const index =
    saved && saved.currentIndex < entries.length ? saved.currentIndex : 0;
  const mode = store.sessionData.modes?.[sequenceKey(combo.id)] ?? "sequence";
  const setMode = (next: CounterMode) =>
    store.setCounterMode(combo.id, undefined, next);
  const current = entries[index];
  const changeStep = (nextIndex: number) =>
    store.saveSequence({
      ...(saved ?? {
        categoryId: entries[0].category.id,
        sourceType: "combo",
        sourceId: combo.id,
        entryItemId: entries[0].item.id,
        currentIndex: 0,
        sessionTaps: 0,
        passes: 0,
        target: 3,
        undo: [],
      }),
      currentIndex: nextIndex,
      repeatIndex: 0,
    });
  return mode === "sequence" ? (
    <SequenceScreen
      key={combo.id}
      category={entries[0].category}
      entry={entries[0].item}
      combo={combo}
      wake={wake}
      onModeChange={setMode}
    />
  ) : (
    <CounterScreen
      key={`${combo.id}:${index}`}
      category={current.category}
      item={current.item}
      comboName={combo.name}
      onPrevious={() =>
        changeStep((index + entries.length - 1) % entries.length)
      }
      onNext={() => changeStep((index + 1) % entries.length)}
      wake={wake}
      onModeChange={setMode}
    />
  );
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: CounterMode;
  onChange: (mode: CounterMode) => void;
}) {
  return (
    <div className="mode-switch" role="group" aria-label="စိပ်မည့်ပုံစံ">
      <button
        type="button"
        aria-pressed={mode === "sequence"}
        onClick={() => onChange("sequence")}
      >
        အစဉ်လိုက်စိပ်မည်
      </button>
      <button
        type="button"
        aria-pressed={mode === "single"}
        onClick={() => onChange("single")}
      >
        တစ်ခုတည်းစိပ်မည်
      </button>
    </div>
  );
}

function CounterScreen({
  category,
  item,
  comboName,
  onPrevious,
  onNext,
  wake,
  onModeChange,
}: {
  category: Category;
  item: ChantItem;
  comboName?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  wake: ReturnType<typeof useWakeLock>;
  onModeChange: (mode: CounterMode) => void;
}) {
  const counter = useCounter(item.id);
  const [completed, setCompleted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<number | null>(null);
  const [customTarget, setCustomTarget] = useState("");
  useEffect(() => {
    if (completed) {
      const timer = window.setTimeout(() => setCompleted(false), 3500);
      return () => window.clearTimeout(timer);
    }
  }, [completed, counter.count.rounds]);
  const itemIndex = category.items.findIndex((entry) => entry.id === item.id);
  const previous = category.items[itemIndex - 1];
  const next = category.items[itemIndex + 1];
  function changeTarget(target: number) {
    if (
      !Number.isSafeInteger(target) ||
      target < 1 ||
      target > 1000000 ||
      target === counter.session.target
    )
      return;
    if (counter.session.count || counter.session.undo.length)
      setPendingTarget(target);
    else counter.reset(target);
  }
  return (
    <main className="counter-page">
      <div className="counter-top">
        <Link
          className="back-link"
          to={comboName ? "/" : `/category/${category.id}`}
        >
          <ArrowLeft size={18} /> နောက်သို့
        </Link>
        <span className="counter-category">{comboName || category.name}</span>
      </div>
      <ModeSwitch mode="single" onChange={onModeChange} />
      <div className="counter-heading">
        <div className="eyebrow justify-center">
          <span className="eyebrow-dot" /> ယခုစိပ်နေသည်
        </div>
        <h1>{item.name}</h1>
        {item.description && <p>{item.description}</p>}
      </div>
      <div className="counter-stage">
        <div className="bead-orbit">
          <CounterButton
            count={counter.session.count}
            target={counter.session.target}
            onClick={() => {
              if (counter.tap()) setCompleted(true);
            }}
          />
        </div>
      </div>
      <div className="round-message" aria-live="polite">
        {completed ? "တစ်ပတ်ပြည့်ပါပြီ" : "\u00a0"}
      </div>
      <div className="counter-summary">
        <div>
          <span>စုစုပေါင်း</span>
          <strong>
            {number(counter.count.total)} <small>ကြိမ်</small>
          </strong>
        </div>
        <div>
          <span>ပတ်ရေ</span>
          <strong>
            {number(counter.count.rounds)} <small>ပတ်</small>
          </strong>
        </div>
      </div>
      <div className="counter-actions">
        <button
          className="button-secondary"
          disabled={!counter.session.undo.length}
          onClick={() => {
            counter.undo();
            setCompleted(false);
          }}
        >
          <Undo2 size={19} /> တစ်ကြိမ်ပြန်ယူမည်
        </button>
        <button
          className="button-secondary"
          onClick={() => setConfirmReset(true)}
        >
          <RotateCcw size={19} /> ယခုအကြိမ် ပြန်စမည်
        </button>
      </div>
      <nav className="counter-navigation" aria-label="စိပ်ရန်စာသားများ">
        {onPrevious ? (
          <button className="button-outline" onClick={onPrevious}>
            <ChevronLeft size={19} /> ရှေ့စာသား
          </button>
        ) : previous ? (
          <Link
            className="button-outline"
            to={`/category/${category.id}/item/${previous.id}`}
          >
            <ChevronLeft size={19} /> ရှေ့စာသား
          </Link>
        ) : (
          <span />
        )}
        {onNext ? (
          <button className="button-outline" onClick={onNext}>
            နောက်စာသား <ChevronRight size={19} />
          </button>
        ) : next ? (
          <Link
            className="button-outline"
            to={`/category/${category.id}/item/${next.id}`}
          >
            နောက်စာသား <ChevronRight size={19} />
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <div className="counter-settings">
        <div>
          <label className="field-label" htmlFor="target-select">
            တစ်ပတ်လျှင် အကြိမ်ရေ
          </label>
          <select
            id="target-select"
            className="text-input"
            value={
              [9, 27, 54, 108].includes(counter.session.target)
                ? counter.session.target
                : "custom"
            }
            onChange={(event) => {
              if (event.target.value === "custom") {
                setCustomTarget(String(counter.session.target));
                return;
              }
              changeTarget(Number(event.target.value));
            }}
          >
            <option value="9">၉ ကြိမ်</option>
            <option value="27">၂၇ ကြိမ်</option>
            <option value="54">၅၄ ကြိမ်</option>
            <option value="108">၁၀၈ ကြိမ်</option>
            <option value="custom">ကိုယ်တိုင်သတ်မှတ်မည်</option>
          </select>
          {(customTarget !== "" ||
            ![9, 27, 54, 108].includes(counter.session.target)) && (
            <div className="custom-target">
              <input
                aria-label="ကိုယ်တိုင်သတ်မှတ်မည့် အကြိမ်ရေ"
                className="text-input"
                type="number"
                min="1"
                max="1000000"
                value={customTarget || counter.session.target}
                onChange={(event) => setCustomTarget(event.target.value)}
              />
              <button
                className="button-outline"
                onClick={() => {
                  changeTarget(Number(customTarget));
                  setCustomTarget("");
                }}
              >
                သတ်မှတ်မည်
              </button>
            </div>
          )}
        </div>
        <label className="wake-row">
          <span>
            မျက်နှာပြင်ဖွင့်ထားမည်
            {!wake.supported && <small>ဤဘရောက်ဇာတွင် မရနိုင်ပါ</small>}
            {wake.error && <small>မျက်နှာပြင်ဖွင့်ထား၍ မရပါ</small>}
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={wake.enabled}
            disabled={!wake.supported}
            onChange={(event) => wake.setEnabled(event.target.checked)}
          />
        </label>
      </div>
      {confirmReset && (
        <ConfirmDialog
          title="ယခုအကြိမ် ပြန်စမည်လား"
          onClose={() => setConfirmReset(false)}
          onConfirm={() => {
            counter.reset();
            setCompleted(false);
            setConfirmReset(false);
          }}
          confirmLabel="ပြန်စမည်"
        >
          <p>
            ယခုအကြိမ်ကို သုညမှ ပြန်စပါမည်။ စုစုပေါင်းနှင့် မှတ်တမ်းများ မပျက်ပါ။
          </p>
        </ConfirmDialog>
      )}
      {pendingTarget !== null && (
        <ConfirmDialog
          title="အကြိမ်ရေ ပြောင်းမည်လား"
          onClose={() => setPendingTarget(null)}
          onConfirm={() => {
            counter.reset(pendingTarget);
            setCompleted(false);
            setPendingTarget(null);
          }}
          confirmLabel="ပြောင်းမည်"
        >
          <p>
            အကြိမ်ရေပြောင်းလျှင် ယခုအကြိမ်ကို သုညမှ ပြန်စပါမည်။ စုစုပေါင်းနှင့်
            မှတ်တမ်းများ မပျက်ပါ။
          </p>
        </ConfirmDialog>
      )}
    </main>
  );
}

function SequenceScreen({
  category,
  entry,
  combo,
  wake,
  onModeChange,
}: {
  category: Category;
  entry: ChantItem;
  combo?: Combo;
  wake: ReturnType<typeof useWakeLock>;
  onModeChange: (mode: CounterMode) => void;
}) {
  const store = useApp();
  const navigate = useNavigate();
  const itemMap = new Map(
    availableCategories(store.categories).flatMap((category) =>
      category.items.map((item) => [item.id, item] as const),
    ),
  );
  const items = combo
    ? combo.steps.map((step) => itemMap.get(step.itemId)!)
    : category.items.filter(
        (item) => (item.group || "") === (entry.group || ""),
      );
  const steps =
    combo?.steps ?? items.map((item) => ({ itemId: item.id, repeat: 1 }));
  const entryIndex = items.findIndex((item) => item.id === entry.id);
  const key = combo?.id ?? sequenceKey(category.id, entry.group);
  const rounds = store.groupRounds[key] ?? 0;
  const saved = store.sessionData.sequences[key];
  const initial: SequenceSession = {
    categoryId: category.id,
    group: combo ? undefined : entry.group,
    sourceType: combo ? "combo" : entry.group ? "group" : "category",
    sourceId: combo?.id ?? category.id,
    entryItemId: entry.id,
    currentIndex: entryIndex,
    repeatIndex: 0,
    sessionTaps: 0,
    passes: 0,
    target: 3,
    undo: [],
  };
  const sequence = saved
    ? {
        ...saved,
        entryItemId: entry.id,
        currentIndex:
          saved.entryItemId === entry.id && saved.currentIndex < items.length
            ? saved.currentIndex
            : entryIndex,
      }
    : initial;
  const current = items[sequence.currentIndex];
  const next = items[(sequence.currentIndex + 1) % items.length];
  const section =
    combo?.id === defaultCombos[0].id
      ? current.id.startsWith("combo-saranagon-")
        ? "သရဏဂုံ"
        : current.id.startsWith("combo-guna9-")
          ? "ဂုဏ်တော် ၉ ပါး"
          : current.id.startsWith("combo-paccaya-")
            ? "၂၄ ပစ္စည်း"
            : ""
      : "";
  const [completed, setCompleted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<number | null>(null);
  const [target, setTarget] = useState(String(sequence.target));
  useEffect(() => {
    if (completed) {
      const timer = window.setTimeout(() => setCompleted(false), 3500);
      return () => window.clearTimeout(timer);
    }
  }, [completed, rounds]);
  function move(index: number) {
    store.saveSequence({ ...sequence, currentIndex: index, repeatIndex: 0 });
    setCompleted(false);
  }
  function reset(newTarget = sequence.target) {
    store.saveSequence({
      ...sequence,
      currentIndex: 0,
      repeatIndex: 0,
      sessionTaps: 0,
      passes: 0,
      progress: 0,
      target: newTarget,
      undo: [],
    });
    setCompleted(false);
  }
  function changeTarget(value: number) {
    if (!Number.isSafeInteger(value) || value < 1 || value > 1000000) {
      setTarget(String(sequence.target));
      return;
    }
    setTarget(String(value));
    if (value !== sequence.target) {
      if (sequence.sessionTaps || sequence.undo.length) setPendingTarget(value);
      else reset(value);
    }
  }
  function switchMode(mode: CounterMode) {
    if (mode === "single" && !combo)
      navigate(`/category/${category.id}/item/${current.id}`, {
        replace: true,
      });
    onModeChange(mode);
  }
  return (
    <main className="counter-page">
      <div className="counter-top">
        <Link
          className="back-link"
          to={combo ? "/" : `/category/${category.id}`}
        >
          <ArrowLeft size={18} /> နောက်သို့
        </Link>
        <span className="counter-category">
          {combo?.name || entry.group || category.name}
        </span>
      </div>
      <ModeSwitch mode="sequence" onChange={switchMode} />
      <div className="counter-heading sequence-heading">
        <div className="eyebrow justify-center">
          <span className="eyebrow-dot" /> ယခုစိပ်နေသည်
        </div>
        <div
          key={`${sequence.currentIndex}:${current.id}`}
          className="sequence-name"
        >
          <h1>{current.name}</h1>
          {current.description && <p>{current.description}</p>}
        </div>
        {steps[sequence.currentIndex].repeat > 1 && (
          <p className="sequence-repeat">
            အကြိမ်ရေ {number(sequence.repeatIndex ?? 0)} /{" "}
            {number(steps[sequence.currentIndex].repeat)}
          </p>
        )}
        <p className="sequence-next">နောက်တစ်ခု: {next.name}</p>
      </div>
      <div className="sequence-progress">
        <span>
          {number(sequence.currentIndex + 1)} / {number(items.length)}
        </span>
        <div
          className="sequence-track"
          role="progressbar"
          aria-label="စာသားအစဉ်"
          aria-valuemin={1}
          aria-valuemax={items.length}
          aria-valuenow={sequence.currentIndex + 1}
        >
          <span
            style={{
              width: `${((sequence.currentIndex + 1) / items.length) * 100}%`,
            }}
          />
        </div>
      </div>
      {section && <p className="sequence-section">{section}</p>}
      <div className="counter-stage">
        <div className="bead-orbit">
          <CounterButton
            passes
            count={sequence.passes}
            target={sequence.target}
            onClick={() => {
              counterFeedback(store.settings.vibration, store.settings.sound);
              if (store.incrementSequence(sequence, steps)) setCompleted(true);
            }}
          />
        </div>
      </div>
      <div className="round-message" aria-live="polite">
        {completed ? "တစ်ပတ်ပြည့်ပါပြီ" : "\u00a0"}
      </div>
      <div className="counter-summary sequence-summary">
        <div>
          <span>ယခုစာသား</span>
          <strong>
            {number(store.counts[current.id]?.total ?? 0)} <small>ကြိမ်</small>
          </strong>
        </div>
        <div>
          <span>ယခုစိပ်ခဲ့သည့်အကြိမ်</span>
          <strong>
            {number(sequence.sessionTaps)} <small>ကြိမ်</small>
          </strong>
        </div>
        <div>
          <span>စုစုပေါင်းပတ်ရေ</span>
          <strong>
            {number(rounds)} <small>ပတ်</small>
          </strong>
        </div>
      </div>
      <div className="counter-actions">
        <button
          className="button-secondary"
          disabled={!sequence.undo.length}
          onClick={() => {
            store.undoSequence(sequence);
            setCompleted(false);
          }}
        >
          <Undo2 size={19} /> တစ်ကြိမ်ပြန်ယူမည်
        </button>
        <button
          className="button-secondary"
          onClick={() => setConfirmReset(true)}
        >
          <RotateCcw size={19} /> ယခုအကြိမ် ပြန်စမည်
        </button>
      </div>
      <nav className="counter-navigation" aria-label="စိပ်ရန်စာသားများ">
        <button
          className="button-outline"
          onClick={() =>
            move((sequence.currentIndex + items.length - 1) % items.length)
          }
        >
          <ChevronLeft size={19} /> ရှေ့စာသား
        </button>
        <button
          className="button-outline"
          onClick={() => move((sequence.currentIndex + 1) % items.length)}
        >
          နောက်စာသား <ChevronRight size={19} />
        </button>
      </nav>
      <details className="sequence-drawer">
        <summary>စာသားရွေးမည်</summary>
        <div>
          {items.map((item, index) => (
            <button
              key={`${item.id}:${index}`}
              className={index === sequence.currentIndex ? "selected" : ""}
              aria-current={
                index === sequence.currentIndex ? "true" : undefined
              }
              onClick={() => move(index)}
            >
              <span>{number(index + 1)}</span>
              {item.name}
              {steps[index].repeat > 1 && ` × ${number(steps[index].repeat)}`}
            </button>
          ))}
        </div>
      </details>
      <div className="counter-settings">
        <div>
          <label className="field-label" htmlFor="sequence-target">
            ရည်မှန်းချက် (ပတ်ရေ)
          </label>
          <div
            className="target-presets"
            role="group"
            aria-label="ရည်မှန်းချက်ပတ်ရေ"
          >
            {[1, 3, 7, 9].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={sequence.target === value}
                onClick={() => changeTarget(value)}
              >
                {number(value)}
              </button>
            ))}
          </div>
          <div className="custom-target">
            <input
              id="sequence-target"
              className="text-input"
              type="number"
              min="1"
              max="1000000"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
            <button
              className="button-outline"
              onClick={() => changeTarget(Number(target))}
            >
              သတ်မှတ်မည်
            </button>
          </div>
        </div>
        <label className="wake-row">
          <span>
            မျက်နှာပြင်ဖွင့်ထားမည်
            {!wake.supported && <small>ဤဘရောက်ဇာတွင် မရနိုင်ပါ</small>}
            {wake.error && <small>မျက်နှာပြင်ဖွင့်ထား၍ မရပါ</small>}
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={wake.enabled}
            disabled={!wake.supported}
            onChange={(event) => wake.setEnabled(event.target.checked)}
          />
        </label>
      </div>
      {confirmReset && (
        <ConfirmDialog
          title="ယခုအကြိမ် ပြန်စမည်လား"
          onClose={() => setConfirmReset(false)}
          onConfirm={() => {
            reset();
            setConfirmReset(false);
          }}
          confirmLabel="ပြန်စမည်"
        >
          <p>
            ယခုအကြိမ်နှင့် ရည်မှန်းချက်ပတ်ရေကို ပြန်စပါမည်။ စုစုပေါင်းနှင့်
            မှတ်တမ်းများ မပျက်ပါ။
          </p>
        </ConfirmDialog>
      )}
      {pendingTarget !== null && (
        <ConfirmDialog
          title="ပတ်ရေ ပြောင်းမည်လား"
          onClose={() => {
            setTarget(String(sequence.target));
            setPendingTarget(null);
          }}
          onConfirm={() => {
            reset(pendingTarget);
            setPendingTarget(null);
          }}
          confirmLabel="ပြောင်းမည်"
        >
          <p>
            ရည်မှန်းချက်ပြောင်းလျှင် ယခုအကြိမ်ကို ပြန်စပါမည်။ စုစုပေါင်းနှင့်
            မှတ်တမ်းများ မပျက်ပါ။
          </p>
        </ConfirmDialog>
      )}
    </main>
  );
}
