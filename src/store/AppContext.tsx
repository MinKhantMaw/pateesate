import { useEffect, type ReactNode } from "react";
import { AppContext } from "./AppContextValue";
import { defaultCategories, defaultSettings } from "../data/defaultCategories";
import { defaultCombos } from "../data/defaultCombos";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { dateKey } from "../utils/date";
import {
  normalizeCategories,
  normalizeData,
  normalizeSession,
  sequenceKey,
  upgradeLegacyCombos,
  validData,
} from "../utils/data";
import type {
  AppData,
  Category,
  Combo,
  ComboStep,
  CounterMode,
  Counts,
  GroupRounds,
  History,
  SequenceSession,
  SessionData,
  Settings,
} from "../types";

const empty: AppData = {
  categories: defaultCategories,
  combos: defaultCombos,
  counts: {},
  history: {},
  settings: defaultSettings,
  session: { singles: {}, sequences: {} },
  groupRounds: {},
};
const validatePart = (key: keyof AppData) => (value: unknown) =>
  validData({ ...empty, [key]: value });

function useAppStore() {
  const [categories, setCategories, categoriesError] = useLocalStorage<
    Category[]
  >(
    "pawtiza:categories",
    defaultCategories,
    validatePart("categories"),
    (value) => normalizeCategories(value as Category[]),
  );
  const [combos, setCombos, combosError] = useLocalStorage<Combo[]>(
    "pawtiza:combos",
    defaultCombos,
    validatePart("combos"),
  );
  const [counts, setCounts, countsError] = useLocalStorage<Counts>(
    "pawtiza:counts",
    {},
    validatePart("counts"),
  );
  const [history, setHistory, historyError] = useLocalStorage<History>(
    "pawtiza:history",
    {},
    validatePart("history"),
  );
  const [settings, setSettings, settingsError] = useLocalStorage<Settings>(
    "pawtiza:settings",
    defaultSettings,
    validatePart("settings"),
  );
  const [sessionData, setSessionData, sessionError] =
    useLocalStorage<SessionData>(
      "pawtiza:session",
      empty.session,
      validatePart("session"),
      normalizeSession,
    );
  const [groupRounds, setGroupRounds, groupRoundsError] =
    useLocalStorage<GroupRounds>(
      "pawtiza:groupRounds",
      {},
      validatePart("groupRounds"),
    );
  const [version, setVersion, versionError] = useLocalStorage<number>(
    "pawtiza:version",
    1,
    (value) =>
      value === 1 || value === 2 || value === 3 || value === 4 || value === 5,
  );
  const session = sessionData.singles;

  useEffect(() => {
    if (
      version >= 5 ||
      versionError ||
      categoriesError ||
      sessionError ||
      combosError
    )
      return;
    const combo = defaultCategories.find((category) => category.id === "combo");
    setCategories((previous) =>
      version === 1 &&
      combo &&
      !previous.some((category) => category.id === combo.id)
        ? [...previous, combo]
        : previous,
    );
    setCombos((previous) => upgradeLegacyCombos(previous));
    setSessionData((previous) => previous);
    setVersion(5);
  }, [
    version,
    versionError,
    categoriesError,
    sessionError,
    combosError,
    setCategories,
    setCombos,
    setSessionData,
    setVersion,
  ]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark",
    );
  }, [settings.theme]);

  function increment(id: string) {
    const current = session[id] ?? {
      count: 0,
      target: settings.defaultTarget,
      undo: [],
    };
    const date = dateKey();
    const completed = current.count + 1 >= current.target;
    setSessionData((previous) => ({
      ...previous,
      singles: {
        ...previous.singles,
        [id]: {
          ...current,
          count: completed ? 0 : current.count + 1,
          undo: [...current.undo, { date, completed, target: current.target }],
        },
      },
    }));
    setCounts((previous) => ({
      ...previous,
      [id]: {
        total: (previous[id]?.total ?? 0) + 1,
        rounds: (previous[id]?.rounds ?? 0) + (completed ? 1 : 0),
      },
    }));
    setHistory((previous) => ({
      ...previous,
      [date]: { ...previous[date], [id]: (previous[date]?.[id] ?? 0) + 1 },
    }));
    return completed;
  }

  function undo(id: string) {
    const current = session[id];
    const last = current?.undo.at(-1);
    if (!current || !last) return;
    setSessionData((previous) => ({
      ...previous,
      singles: {
        ...previous.singles,
        [id]: {
          ...current,
          target: last.target,
          count: last.completed
            ? last.target - 1
            : Math.max(0, current.count - 1),
          undo: current.undo.slice(0, -1),
        },
      },
    }));
    setCounts((previous) => ({
      ...previous,
      [id]: {
        total: Math.max(0, (previous[id]?.total ?? 0) - 1),
        rounds: Math.max(
          0,
          (previous[id]?.rounds ?? 0) - (last.completed ? 1 : 0),
        ),
      },
    }));
    setHistory((previous) => ({
      ...previous,
      [last.date]: {
        ...previous[last.date],
        [id]: Math.max(0, (previous[last.date]?.[id] ?? 0) - 1),
      },
    }));
  }

  function resetSession(id: string, target?: number) {
    setSessionData((previous) => ({
      ...previous,
      singles: {
        ...previous.singles,
        [id]: {
          count: 0,
          target:
            target ?? previous.singles[id]?.target ?? settings.defaultTarget,
          undo: [],
        },
      },
    }));
  }
  function saveSequence(sequence: SequenceSession) {
    const key =
      sequence.sourceType === "combo"
        ? sequence.sourceId!
        : sequenceKey(sequence.categoryId, sequence.group);
    setSessionData((previous) => ({
      ...previous,
      categoryId: sequence.categoryId,
      group: sequence.group,
      currentIndex: sequence.currentIndex,
      sessionTaps: sequence.sessionTaps,
      sourceType:
        sequence.sourceType ?? (sequence.group ? "group" : "category"),
      sourceId: sequence.sourceId ?? sequence.categoryId,
      stepIndex: sequence.currentIndex,
      repeatIndex: sequence.repeatIndex ?? 0,
      passesDone: sequence.passes,
      sequences: { ...previous.sequences, [key]: sequence },
    }));
  }
  function clearComboSession(id: string) {
    setSessionData((previous) => {
      const sequences = { ...previous.sequences };
      delete sequences[id];
      return { ...previous, sequences };
    });
  }
  function setCounterMode(
    categoryId: string,
    group: string | undefined,
    mode: CounterMode,
  ) {
    setSessionData((previous) => ({
      ...previous,
      modes: { ...previous.modes, [sequenceKey(categoryId, group)]: mode },
    }));
  }
  function clearCounterModes(categoryId: string) {
    setSessionData((previous) => ({
      ...previous,
      modes: Object.fromEntries(
        Object.entries(previous.modes ?? {}).filter(
          ([key]) => !key.startsWith(`${categoryId}:`),
        ),
      ),
    }));
  }
  function incrementSequence(current: SequenceSession, steps: ComboStep[]) {
    const step = steps[current.currentIndex];
    if (!step) return false;
    const itemId = step.itemId;
    const date = dateKey();
    const progressBefore = current.progress ?? 0;
    const repeatBefore = current.repeatIndex ?? 0;
    const stepCompleted = repeatBefore + 1 >= step.repeat;
    const progress = !stepCompleted
      ? progressBefore
      : current.currentIndex === 0
        ? 1
        : current.currentIndex === progressBefore
          ? progressBefore + 1
          : 0;
    const completed = stepCompleted && progress === steps.length;
    const reachedTarget = completed && current.passes + 1 >= current.target;
    saveSequence({
      ...current,
      currentIndex: stepCompleted
        ? (current.currentIndex + 1) % steps.length
        : current.currentIndex,
      repeatIndex: stepCompleted ? 0 : repeatBefore + 1,
      progress: completed ? 0 : progress,
      sessionTaps: reachedTarget ? 0 : current.sessionTaps + 1,
      passes: completed
        ? reachedTarget
          ? 0
          : current.passes + 1
        : current.passes,
      undo: [
        ...current.undo,
        {
          itemId,
          date,
          previousIndex: current.currentIndex,
          completed,
          sessionTapsBefore: current.sessionTaps,
          passesBefore: current.passes,
          progressBefore,
          repeatBefore,
        },
      ],
    });
    setCounts((previous) => ({
      ...previous,
      [itemId]: {
        total: (previous[itemId]?.total ?? 0) + 1,
        rounds: previous[itemId]?.rounds ?? 0,
      },
    }));
    setHistory((previous) => ({
      ...previous,
      [date]: {
        ...previous[date],
        [itemId]: (previous[date]?.[itemId] ?? 0) + 1,
      },
    }));
    if (completed)
      setGroupRounds((previous) => {
        const key =
          current.sourceType === "combo"
            ? current.sourceId!
            : sequenceKey(current.categoryId, current.group);
        return { ...previous, [key]: (previous[key] ?? 0) + 1 };
      });
    return completed;
  }
  function undoSequence(current: SequenceSession) {
    const last = current.undo.at(-1);
    if (!last) return;
    saveSequence({
      ...current,
      currentIndex: last.previousIndex,
      repeatIndex: last.repeatBefore ?? 0,
      progress: last.progressBefore ?? 0,
      sessionTaps: last.sessionTapsBefore,
      passes: last.passesBefore,
      undo: current.undo.slice(0, -1),
    });
    setCounts((previous) => ({
      ...previous,
      [last.itemId]: {
        total: Math.max(0, (previous[last.itemId]?.total ?? 0) - 1),
        rounds: previous[last.itemId]?.rounds ?? 0,
      },
    }));
    setHistory((previous) => ({
      ...previous,
      [last.date]: {
        ...previous[last.date],
        [last.itemId]: Math.max(
          0,
          (previous[last.date]?.[last.itemId] ?? 0) - 1,
        ),
      },
    }));
    if (last.completed)
      setGroupRounds((previous) => {
        const key =
          current.sourceType === "combo"
            ? current.sourceId!
            : sequenceKey(current.categoryId, current.group);
        return { ...previous, [key]: Math.max(0, (previous[key] ?? 0) - 1) };
      });
  }
  function replaceData(data: AppData, upgradeLegacy = false) {
    const normalized = normalizeData(data);
    setCategories(normalized.categories);
    setCombos(
      upgradeLegacy
        ? upgradeLegacyCombos(normalized.combos)
        : normalized.combos,
    );
    setCounts(normalized.counts);
    setHistory(normalized.history);
    setSettings(normalized.settings);
    setSessionData(normalized.session);
    setGroupRounds(normalized.groupRounds);
  }
  return {
    categories,
    setCategories,
    combos,
    setCombos,
    clearComboSession,
    counts,
    history,
    settings,
    setSettings,
    session,
    sessionData,
    groupRounds,
    increment,
    undo,
    resetSession,
    saveSequence,
    setCounterMode,
    clearCounterModes,
    incrementSequence,
    undoSequence,
    replaceData,
    storageError:
      categoriesError ||
      combosError ||
      countsError ||
      historyError ||
      settingsError ||
      sessionError ||
      groupRoundsError ||
      versionError,
  };
}

export type Store = ReturnType<typeof useAppStore>;
export function AppProvider({ children }: { children: ReactNode }) {
  const store = useAppStore();
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}
