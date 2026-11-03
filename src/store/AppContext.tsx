import { useEffect, type ReactNode } from "react";
import { AppContext } from "./AppContextValue";
import { defaultCategories, defaultSettings } from "../data/defaultCategories";
import { defaultCombos } from "../data/defaultCombos";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { dateKey } from "../utils/date";
import {
  addArahanSiddhi,
  normalizeCategories,
  normalizeData,
  normalizeSettings,
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
  GoalHistory,
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
    (value) => normalizeSettings(value as Settings),
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
  const [goalHistory, setGoalHistory, goalHistoryError] =
    useLocalStorage<GoalHistory>(
      "pawtiza:goalHistory",
      {},
      validatePart("goalHistory"),
    );
  const [version, setVersion, versionError] = useLocalStorage<number>(
    "pawtiza:version",
    1,
    (value) =>
      value === 1 ||
      value === 2 ||
      value === 3 ||
      value === 4 ||
      value === 5 ||
      value === 6 ||
      value === 7,
  );
  const session = sessionData.singles;

  useEffect(() => {
    if (
      version >= 7 ||
      versionError ||
      categoriesError ||
      sessionError ||
      combosError
    )
      return;
    const combo = defaultCategories.find((category) => category.id === "combo");
    setCategories((previous) =>
      addArahanSiddhi(version === 1 &&
      combo &&
      !previous.some((category) => category.id === combo.id)
        ? [...previous, combo]
        : previous),
    );
    if (version < 5) setCombos((previous) => upgradeLegacyCombos(previous));
    setSettings((previous) => normalizeSettings(previous));
    setSessionData((previous) => previous);
    setVersion(7);
  }, [
    version,
    versionError,
    categoriesError,
    sessionError,
    combosError,
    setCategories,
    setCombos,
    setSessionData,
    setSettings,
    setVersion,
  ]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark",
    );
  }, [settings.theme]);

  function recordGoal(date: string, goalRounds: number, beadsPerRound: number) {
    const id = crypto.randomUUID();
    setGoalHistory((previous) => ({
      ...previous,
      [date]: [...(previous[date] ?? []), { id, goalRounds, beadsPerRound }],
    }));
    return id;
  }
  function removeGoal(date: string, id?: string) {
    if (id)
      setGoalHistory((previous) => ({
        ...previous,
        [date]: (previous[date] ?? []).filter((entry) => entry.id !== id),
      }));
  }

  function increment(id: string) {
    const current = session[id] ?? {
      count: 0,
      target: settings.beadsPerRound,
      roundsDone: 0,
      goalRounds: settings.goalRounds,
      goalReached: false,
      undo: [],
    };
    const date = dateKey();
    const completed = current.count + 1 >= current.target;
    const roundsDone = (current.roundsDone ?? 0) + (completed ? 1 : 0);
    const goalRounds = current.goalRounds ?? settings.goalRounds;
    const goalId =
      completed && roundsDone % goalRounds === 0
        ? recordGoal(date, goalRounds, current.target)
        : undefined;
    setSessionData((previous) => ({
      ...previous,
      sourceType: "single",
      sourceId: id,
      stepIndex: 0,
      repeatIndex: 0,
      tapsInRound: completed ? 0 : current.count + 1,
      roundsDone,
      goalReached: !!goalId,
      singles: {
        ...previous.singles,
        [id]: {
          ...current,
          count: completed ? 0 : current.count + 1,
          roundsDone,
          goalRounds,
          goalReached: !!goalId,
          undo: [
            ...current.undo,
            { date, completed, target: current.target, goalId },
          ],
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
    const roundsDone = Math.max(
      0,
      (current.roundsDone ?? 0) - (last.completed ? 1 : 0),
    );
    const count = last.completed
      ? last.target - 1
      : Math.max(0, current.count - 1);
    removeGoal(last.date, last.goalId);
    setSessionData((previous) => ({
      ...previous,
      sourceType: "single",
      sourceId: id,
      tapsInRound: count,
      roundsDone,
      goalReached: false,
      singles: {
        ...previous.singles,
        [id]: {
          ...current,
          target: last.target,
          count,
          roundsDone,
          goalReached: false,
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

  function resetSession(id: string, target?: number, goalRounds?: number) {
    setSessionData((previous) => ({
      ...previous,
      sourceType: "single",
      sourceId: id,
      stepIndex: 0,
      repeatIndex: 0,
      tapsInRound: 0,
      roundsDone: 0,
      goalReached: false,
      singles: {
        ...previous.singles,
        [id]: {
          count: 0,
          target:
            target ?? previous.singles[id]?.target ?? settings.beadsPerRound,
          roundsDone: 0,
          goalRounds:
            goalRounds ??
            previous.singles[id]?.goalRounds ??
            settings.goalRounds,
          goalReached: false,
          undo: [],
        },
      },
    }));
  }
  function dismissSingleGoal(id: string) {
    setSessionData((previous) => ({
      ...previous,
      goalReached: false,
      singles: {
        ...previous.singles,
        [id]: { ...previous.singles[id], goalReached: false },
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
      tapsInRound:
        sequence.sessionTaps %
        (sequence.beadsPerRound ?? settings.beadsPerRound),
      roundsDone: sequence.passes,
      goalReached: sequence.goalReached ?? false,
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
    const beadsPerRound = current.beadsPerRound ?? settings.beadsPerRound;
    const goalRounds = current.goalRounds ?? settings.goalRounds;
    const completed = (current.sessionTaps + 1) % beadsPerRound === 0;
    const roundsDone = current.passes + (completed ? 1 : 0);
    const goalId =
      completed && roundsDone % goalRounds === 0
        ? recordGoal(date, goalRounds, beadsPerRound)
        : undefined;
    saveSequence({
      ...current,
      currentIndex: stepCompleted
        ? (current.currentIndex + 1) % steps.length
        : current.currentIndex,
      repeatIndex: stepCompleted ? 0 : repeatBefore + 1,
      progress: completed ? 0 : progress,
      sessionTaps: current.sessionTaps + 1,
      passes: roundsDone,
      beadsPerRound,
      goalRounds,
      goalReached: !!goalId,
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
          goalId,
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
    removeGoal(last.date, last.goalId);
    saveSequence({
      ...current,
      currentIndex: last.previousIndex,
      repeatIndex: last.repeatBefore ?? 0,
      progress: last.progressBefore ?? 0,
      sessionTaps: last.sessionTapsBefore,
      passes: last.passesBefore,
      goalReached: false,
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
  function replaceData(data: AppData, upgradeLegacy = false, addNewCategory = false) {
    const normalized = normalizeData(data);
    setCategories(addNewCategory ? addArahanSiddhi(normalized.categories) : normalized.categories);
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
    setGoalHistory(normalized.goalHistory ?? {});
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
    goalHistory,
    increment,
    undo,
    resetSession,
    dismissSingleGoal,
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
      goalHistoryError ||
      versionError,
  };
}

export type Store = ReturnType<typeof useAppStore>;
export function AppProvider({ children }: { children: ReactNode }) {
  const store = useAppStore();
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}
