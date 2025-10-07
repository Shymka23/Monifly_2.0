import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  LifeCalendarEntry,
  LifeCalendarSettings,
  FutureVision,
  PersonalMilestone,
  FinancialGoal,
  Reminder,
} from "@/lib/types";

interface LifePlanningState {
  initialized: boolean;
  settings: LifeCalendarSettings | null;
  calendar: Record<number, LifeCalendarEntry>;
  futureVision: FutureVision | null;

  // Actions for calendar management
  initializeCalendar: (settings: LifeCalendarSettings) => Promise<void>;
  updateCalendarEntry: (
    year: number,
    entry: Partial<LifeCalendarEntry>
  ) => void;
  addPersonalMilestone: (year: number, milestone: PersonalMilestone) => void;
  updatePersonalMilestone: (
    year: number,
    milestoneId: string,
    updates: Partial<PersonalMilestone>
  ) => void;
  removePersonalMilestone: (year: number, milestoneId: string) => void;

  // Actions for financial goals
  addFinancialGoal: (year: number, goal: FinancialGoal) => void;
  updateFinancialGoal: (
    year: number,
    goalId: string,
    updates: Partial<FinancialGoal>
  ) => void;
  removeFinancialGoal: (year: number, goalId: string) => void;

  // Actions for reminders
  addReminder: (year: number, milestoneId: string, reminder: Reminder) => void;
  updateReminder: (
    year: number,
    milestoneId: string,
    reminderId: string,
    updates: Partial<Reminder>
  ) => void;
  removeReminder: (
    year: number,
    milestoneId: string,
    reminderId: string
  ) => void;

  // Actions for future vision
  updateFutureVision: (vision: FutureVision) => void;

  // Actions for settings
  updateSettings: (settings: Partial<LifeCalendarSettings>) => void;

  // Utility functions
  getYearEntry: (year: number) => LifeCalendarEntry | null;
  getMilestoneById: (
    year: number,
    milestoneId: string
  ) => PersonalMilestone | null;
  getFinancialGoalById: (year: number, goalId: string) => FinancialGoal | null;
  getRemindersForMilestone: (year: number, milestoneId: string) => Reminder[];

  // Analytics and insights
  getProgressStats: () => {
    totalMilestones: number;
    completedMilestones: number;
    totalFinancialGoals: number;
    completedFinancialGoals: number;
    progressPercentage: number;
  };

  dispatch: (action: { type: string; payload?: unknown }) => void;
}

const useLifePlanningStore = create<LifePlanningState>()(
  persist(
    (set, get) => ({
      initialized: false,
      settings: null,
      calendar: {},
      futureVision: null,

      initializeCalendar: async settings => {
        set({
          initialized: true,
          settings,
          calendar: {},
          futureVision: null,
        });
      },

      updateCalendarEntry: (year, entry) =>
        set(state => ({
          calendar: {
            ...state.calendar,
            [year]: {
              ...state.calendar[year],
              year,
              age:
                year -
                (state.settings?.currentAge || 0) +
                (state.settings?.currentAge || 0),
              status: "empty",
              personalMilestones: [],
              financialGoals: [],
              notes: "",
              ...entry,
            },
          },
        })),

      addPersonalMilestone: (year, milestone) =>
        set(state => {
          const currentEntry = state.calendar[year] || {
            year,
            age:
              year -
              (state.settings?.currentAge || 0) +
              (state.settings?.currentAge || 0),
            status: "empty",
            personalMilestones: [],
            financialGoals: [],
            notes: "",
          };

          return {
            calendar: {
              ...state.calendar,
              [year]: {
                ...currentEntry,
                personalMilestones: [
                  ...currentEntry.personalMilestones,
                  milestone,
                ],
                status: "in_progress",
              },
            },
          };
        }),

      updatePersonalMilestone: (year, milestoneId, updates) =>
        set(state => {
          const currentEntry = state.calendar[year];
          if (!currentEntry) return state;

          return {
            calendar: {
              ...state.calendar,
              [year]: {
                ...currentEntry,
                personalMilestones: currentEntry.personalMilestones.map(
                  milestone =>
                    milestone.id === milestoneId
                      ? { ...milestone, ...updates }
                      : milestone
                ),
              },
            },
          };
        }),

      removePersonalMilestone: (year, milestoneId) =>
        set(state => {
          const currentEntry = state.calendar[year];
          if (!currentEntry) return state;

          return {
            calendar: {
              ...state.calendar,
              [year]: {
                ...currentEntry,
                personalMilestones: currentEntry.personalMilestones.filter(
                  milestone => milestone.id !== milestoneId
                ),
              },
            },
          };
        }),

      addFinancialGoal: (year, goal) =>
        set(state => {
          const currentEntry = state.calendar[year] || {
            year,
            age:
              year -
              (state.settings?.currentAge || 0) +
              (state.settings?.currentAge || 0),
            status: "empty",
            personalMilestones: [],
            financialGoals: [],
            notes: "",
          };

          return {
            calendar: {
              ...state.calendar,
              [year]: {
                ...currentEntry,
                financialGoals: [...currentEntry.financialGoals, goal],
                status: "in_progress",
              },
            },
          };
        }),

      updateFinancialGoal: (year, goalId, updates) =>
        set(state => {
          const currentEntry = state.calendar[year];
          if (!currentEntry) return state;

          return {
            calendar: {
              ...state.calendar,
              [year]: {
                ...currentEntry,
                financialGoals: currentEntry.financialGoals.map(goal =>
                  goal.id === goalId ? { ...goal, ...updates } : goal
                ),
              },
            },
          };
        }),

      removeFinancialGoal: (year, goalId) =>
        set(state => {
          const currentEntry = state.calendar[year];
          if (!currentEntry) return state;

          return {
            calendar: {
              ...state.calendar,
              [year]: {
                ...currentEntry,
                financialGoals: currentEntry.financialGoals.filter(
                  goal => goal.id !== goalId
                ),
              },
            },
          };
        }),

      addReminder: (year, milestoneId, reminder) =>
        set(state => {
          const currentEntry = state.calendar[year];
          if (!currentEntry) return state;

          return {
            calendar: {
              ...state.calendar,
              [year]: {
                ...currentEntry,
                personalMilestones: currentEntry.personalMilestones.map(
                  milestone =>
                    milestone.id === milestoneId
                      ? {
                          ...milestone,
                          reminders: [...milestone.reminders, reminder],
                        }
                      : milestone
                ),
              },
            },
          };
        }),

      updateReminder: (year, milestoneId, reminderId, updates) =>
        set(state => {
          const currentEntry = state.calendar[year];
          if (!currentEntry) return state;

          return {
            calendar: {
              ...state.calendar,
              [year]: {
                ...currentEntry,
                personalMilestones: currentEntry.personalMilestones.map(
                  milestone =>
                    milestone.id === milestoneId
                      ? {
                          ...milestone,
                          reminders: milestone.reminders.map(reminder =>
                            reminder.id === reminderId
                              ? { ...reminder, ...updates }
                              : reminder
                          ),
                        }
                      : milestone
                ),
              },
            },
          };
        }),

      removeReminder: (year, milestoneId, reminderId) =>
        set(state => {
          const currentEntry = state.calendar[year];
          if (!currentEntry) return state;

          return {
            calendar: {
              ...state.calendar,
              [year]: {
                ...currentEntry,
                personalMilestones: currentEntry.personalMilestones.map(
                  milestone =>
                    milestone.id === milestoneId
                      ? {
                          ...milestone,
                          reminders: milestone.reminders.filter(
                            reminder => reminder.id !== reminderId
                          ),
                        }
                      : milestone
                ),
              },
            },
          };
        }),

      updateFutureVision: vision =>
        set({
          futureVision: vision,
        }),

      updateSettings: settings =>
        set(state => ({
          settings: state.settings
            ? { ...state.settings, ...settings }
            : (settings as LifeCalendarSettings),
        })),

      getYearEntry: year => {
        const state = get();
        return state.calendar[year] || null;
      },

      getMilestoneById: (year, milestoneId) => {
        const state = get();
        const entry = state.calendar[year];
        if (!entry) return null;
        return entry.personalMilestones.find(m => m.id === milestoneId) || null;
      },

      getFinancialGoalById: (year, goalId) => {
        const state = get();
        const entry = state.calendar[year];
        if (!entry) return null;
        return entry.financialGoals.find(g => g.id === goalId) || null;
      },

      getRemindersForMilestone: (year, milestoneId) => {
        const milestone = get().getMilestoneById(year, milestoneId);
        return milestone?.reminders || [];
      },

      getProgressStats: () => {
        const state = get();
        const entries = Object.values(state.calendar);

        const totalMilestones = entries.reduce(
          (acc, entry) => acc + entry.personalMilestones.length,
          0
        );

        const completedMilestones = entries.reduce(
          (acc, entry) =>
            acc + entry.personalMilestones.filter(m => m.isCompleted).length,
          0
        );

        const totalFinancialGoals = entries.reduce(
          (acc, entry) => acc + entry.financialGoals.length,
          0
        );

        const completedFinancialGoals = entries.reduce(
          (acc, entry) =>
            acc +
            entry.financialGoals.filter(g => g.status === "completed").length,
          0
        );

        const totalItems = totalMilestones + totalFinancialGoals;
        const completedItems = completedMilestones + completedFinancialGoals;
        const progressPercentage =
          totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        return {
          totalMilestones,
          completedMilestones,
          totalFinancialGoals,
          completedFinancialGoals,
          progressPercentage,
        };
      },

      dispatch: (action: { type: string; payload?: unknown }) => {
        const state = get();
        switch (action.type) {
          case "ADD_REMINDER":
            if (action.payload && typeof action.payload === "object") {
              const { year, milestoneId, reminder } = action.payload as {
                year: number;
                milestoneId: string;
                reminder: Reminder;
              };
              state.addReminder(year, milestoneId, reminder);
            }
            break;
          case "REMOVE_REMINDER":
            if (action.payload && typeof action.payload === "object") {
              const { year, milestoneId, reminderId } = action.payload as {
                year: number;
                milestoneId: string;
                reminderId: string;
              };
              state.removeReminder(year, milestoneId, reminderId);
            }
            break;
          case "UPDATE_NOTIFICATION_SETTINGS":
            if (action.payload && typeof action.payload === "object") {
              const settings = action.payload as Partial<LifeCalendarSettings>;
              state.updateSettings(settings);
            }
            break;
          default:
            // Unknown action type
            break;
        }
      },
    }),
    {
      name: "life-planning-storage",
    }
  )
);

export default useLifePlanningStore;
