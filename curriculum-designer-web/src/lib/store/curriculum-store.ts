import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CurriculumStore,
  CurriculumState,
  SuggestedModule,
  CurriculumModule,
  EnhancementState,
  UploadedFile,
  AnalysisReport,
  EnhancementProposal,
  ChangeItem,
  ChangelogEntry,
  Phase,
  GapAction,
  StrengthAction,
  WhatsNewItem,
  TopicLandscape,
} from "@/lib/types/curriculum";
import { generateId } from "@/lib/parsers";

const initialCreateState: CurriculumState = {
  courseInfo: null,
  topicLandscape: null,
  topicLandscapeStructured: null,
  suggestedModules: null,
  suggestedModulesStructured: null,
  modules: [],
  currentModuleIndex: 0,
  selectedAssessmentTypes: [],
  assessmentsContent: null,
  selectedDeliveryFormats: [],
  deliveryContent: null,
  currentPhase: 0,
};

const initialEnhanceState: EnhancementState = {
  mode: "create",
  uploadedFiles: [],
  analysisReportRaw: null,
  analysisReportStructured: null,
  whatsNewContent: null,
  whatsNewItems: null,
  enhancementProposals: [],
  changes: [],
  changelog: [],
  enhancePhase: 0,
};

const initialState = { ...initialCreateState, ...initialEnhanceState };

// Migrate old module shape to new (add missing fields)
function migrateModule(m: CurriculumModule): CurriculumModule {
  return {
    name: m.name,
    description: m.description ?? undefined,
    status: m.status,
    proposal: m.proposal ?? null,
    content: m.content ?? null,
    prerequisites: m.prerequisites ?? null,
    coreConcepts: m.coreConcepts ?? null,
    lessonPlan: m.lessonPlan ?? null,
  };
}

export const useCurriculumStore = create<CurriculumStore>()(
  persist(
    (set) => ({
      ...initialState,

      // --- Create mode actions ---
      setCourseInfo: (info) => set({ courseInfo: info }),
      setTopicLandscape: (landscape) => set({ topicLandscape: landscape }),
      setTopicLandscapeStructured: (landscape) =>
        set({ topicLandscapeStructured: landscape }),
      setSuggestedModules: (modules) => set({ suggestedModules: modules }),
      setSuggestedModulesStructured: (modules) =>
        set({ suggestedModulesStructured: modules }),
      setModules: (modules) => set({ modules }),
      updateModule: (index, updates) =>
        set((state) => ({
          modules: state.modules.map((m, i) =>
            i === index ? { ...m, ...updates } : m
          ),
        })),

      addModule: (module: SuggestedModule) =>
        set((state) => ({
          suggestedModulesStructured: [
            ...(state.suggestedModulesStructured ?? []),
            module,
          ],
        })),

      removeModule: (id: string) =>
        set((state) => ({
          suggestedModulesStructured: (
            state.suggestedModulesStructured ?? []
          ).filter((m) => m.id !== id),
        })),

      reorderModules: (fromIndex: number, toIndex: number) =>
        set((state) => {
          const arr = [...(state.suggestedModulesStructured ?? [])];
          const [item] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, item);
          return { suggestedModulesStructured: arr };
        }),

      updateSuggestedModule: (id: string, updates: Partial<SuggestedModule>) =>
        set((state) => ({
          suggestedModulesStructured: (
            state.suggestedModulesStructured ?? []
          ).map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      setCurrentModuleIndex: (index) => set({ currentModuleIndex: index }),
      setSelectedAssessmentTypes: (types) =>
        set({ selectedAssessmentTypes: types }),
      setAssessmentsContent: (content) =>
        set({ assessmentsContent: content }),
      setSelectedDeliveryFormats: (formats) =>
        set({ selectedDeliveryFormats: formats }),
      setDeliveryContent: (content) => set({ deliveryContent: content }),
      setCurrentPhase: (phase) => set({ currentPhase: phase }),

      toggleLandscapeItem: (category, id) =>
        set((state) => {
          if (!state.topicLandscapeStructured) return {};
          return {
            topicLandscapeStructured: {
              ...state.topicLandscapeStructured,
              [category]: state.topicLandscapeStructured[category].map((item) =>
                item.id === id ? { ...item, included: !item.included } : item
              ),
            },
          };
        }),

      // --- Enhancement mode actions ---
      setMode: (mode) =>
        set(() => {
          if (mode === "enhance") {
            return { ...initialCreateState, ...initialEnhanceState, mode: "enhance" };
          }
          return { ...initialCreateState, ...initialEnhanceState, mode: "create" };
        }),

      setUploadedFiles: (files: UploadedFile[]) =>
        set({ uploadedFiles: files }),
      addUploadedFile: (file: UploadedFile) =>
        set((state) => ({
          uploadedFiles: [...state.uploadedFiles, file],
        })),
      removeUploadedFile: (id: string) =>
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter((f) => f.id !== id),
        })),
      setAnalysisReportRaw: (content: string) =>
        set({ analysisReportRaw: content }),
      setAnalysisReportStructured: (report: AnalysisReport | null) =>
        set({ analysisReportStructured: report }),
      updateGapAction: (id: string, action: GapAction) =>
        set((state) => {
          if (!state.analysisReportStructured) return {};
          return {
            analysisReportStructured: {
              ...state.analysisReportStructured,
              gaps: state.analysisReportStructured.gaps.map((g) =>
                g.id === id ? { ...g, action } : g
              ),
            },
          };
        }),
      updateStrengthAction: (id: string, action: StrengthAction) =>
        set((state) => {
          if (!state.analysisReportStructured) return {};
          return {
            analysisReportStructured: {
              ...state.analysisReportStructured,
              strengths: state.analysisReportStructured.strengths.map((s) =>
                s.id === id ? { ...s, action } : s
              ),
            },
          };
        }),
      addCustomGap: (description: string, type: "missing" | "outdated" | "opportunity") =>
        set((state) => {
          if (!state.analysisReportStructured) return {};
          return {
            analysisReportStructured: {
              ...state.analysisReportStructured,
              gaps: [
                ...state.analysisReportStructured.gaps,
                { id: generateId(), type, description, action: "include" as const },
              ],
            },
          };
        }),
      setWhatsNewContent: (content: string) =>
        set({ whatsNewContent: content }),
      setWhatsNewItems: (items: WhatsNewItem[]) =>
        set({ whatsNewItems: items }),
      toggleWhatsNewItemSelection: (id: string) =>
        set((state) => ({
          whatsNewItems: state.whatsNewItems?.map((item) =>
            item.id === id ? { ...item, selected: !item.selected } : item
          ) ?? null,
        })),
      toggleWhatsNewItemExpanded: (id: string) =>
        set((state) => ({
          whatsNewItems: state.whatsNewItems?.map((item) =>
            item.id === id ? { ...item, expanded: !item.expanded } : item
          ) ?? null,
        })),
      setEnhancementProposals: (proposals: EnhancementProposal[]) =>
        set({ enhancementProposals: proposals }),
      toggleProposalSelection: (id: string) =>
        set((state) => ({
          enhancementProposals: state.enhancementProposals.map((p) =>
            p.id === id ? { ...p, selected: !p.selected } : p
          ),
        })),
      setChanges: (changes: ChangeItem[]) => set({ changes }),
      updateChange: (id: string, updates: Partial<ChangeItem>) =>
        set((state) => ({
          changes: state.changes.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      setChangeFeedback: (id: string, feedback: string) =>
        set((state) => ({
          changes: state.changes.map((c) =>
            c.id === id ? { ...c, feedback } : c
          ),
        })),
      addChangelogEntry: (entry: ChangelogEntry) =>
        set((state) => ({
          changelog: [...state.changelog, entry],
        })),
      setChangelog: (entries: ChangelogEntry[]) =>
        set({ changelog: entries }),
      setEnhancePhase: (phase: Phase) => set({ enhancePhase: phase }),

      reset: () => set(initialState),
    }),
    {
      name: "curriculum-designer-storage",
      version: 4,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;

        // v0 → v1: add structured fields and migrate modules
        if (version < 1) {
          state.topicLandscapeStructured =
            state.topicLandscapeStructured ?? null;
          state.suggestedModulesStructured =
            state.suggestedModulesStructured ?? null;
          state.modules = Array.isArray(state.modules)
            ? (state.modules as CurriculumModule[]).map(migrateModule)
            : [];
        }

        // v1 → v2: add mode + all enhance fields
        if (version < 2) {
          state.mode = state.mode ?? "create";
          state.uploadedFiles = state.uploadedFiles ?? [];
          state.analysisReportRaw = state.analysisReportRaw ?? null;
          state.analysisReportStructured =
            state.analysisReportStructured ?? null;
          state.whatsNewContent = state.whatsNewContent ?? null;
          state.enhancementProposals = state.enhancementProposals ?? [];
          state.changes = state.changes ?? [];
          state.changelog = state.changelog ?? [];
          state.enhancePhase = state.enhancePhase ?? 0;
        }

        // v2 → v3: add action fields to gaps/strengths, whatsNewItems
        if (version < 3) {
          state.whatsNewItems = state.whatsNewItems ?? null;
          const report = state.analysisReportStructured as AnalysisReport | null;
          if (report) {
            report.gaps = report.gaps.map((g) => ({
              ...g,
              action: g.action ?? "include",
            }));
            report.strengths = report.strengths.map((s) => ({
              ...s,
              action: s.action ?? "keep",
            }));
            state.analysisReportStructured = report;
          }
        }

        // v3 → v4: add `included` field to landscape items
        if (version < 4) {
          const landscape = state.topicLandscapeStructured as TopicLandscape | null;
          if (landscape) {
            landscape.trends = landscape.trends.map((t) => ({
              ...t,
              included: typeof t.included === "boolean" ? t.included : true,
            }));
            landscape.tools = landscape.tools.map((t) => ({
              ...t,
              included: typeof t.included === "boolean" ? t.included : true,
            }));
            landscape.resources = landscape.resources.map((r) => ({
              ...r,
              included: typeof r.included === "boolean" ? r.included : true,
            }));
            state.topicLandscapeStructured = landscape;
          }
        }

        return state as unknown as CurriculumStore;
      },
      partialize: (state) => {
        // Exclude uploadedFiles from localStorage to avoid 5MB limit
        const { uploadedFiles: _uploadedFiles, ...rest } = state;
        return rest as unknown as CurriculumStore;
      },
    }
  )
);
