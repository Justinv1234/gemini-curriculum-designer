export interface CourseInfo {
  topic: string;
  audience: "beginners" | "intermediate" | "advanced" | "mixed";
  format: "semester" | "bootcamp" | "workshop" | "self-paced";
  philosophy: "project-based" | "theory-first" | "problem-based" | "hands-on";
}

// --- Topic Landscape types (Phase 1) ---

export interface TrendItem {
  id: string;
  name: string;
  description: string;
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: string; // "book" | "course" | "website" | etc.
  description: string;
  url?: string;
}

export interface TopicLandscape {
  trends: TrendItem[];
  tools: ToolItem[];
  resources: ResourceItem[];
  industryContext: string;
}

export interface SuggestedModule {
  id: string;
  name: string;
  description: string;
  estimatedDuration: string;
}

// --- Module Interview types (Phase 2) ---

export type PrerequisiteStatus = "include" | "recap" | "skip";

export interface Prerequisite {
  id: string;
  name: string;
  description: string;
  status: PrerequisiteStatus;
}

export type ConceptPriority = "emphasize" | "normal" | "optional";

export interface CoreConcept {
  id: string;
  name: string;
  description: string;
  priority: ConceptPriority;
}

export interface LessonPlanItem {
  id: string;
  title: string;
  description: string;
  teachingApproach: string;
  enabled: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  type: string; // "hands-on" | "interactive" | "group" | "individual"
  enabled: boolean;
}

export interface ModuleLessonPlan {
  lessons: LessonPlanItem[];
  activities: ActivityItem[];
}

// --- Module status ---

export type ModuleStatus =
  // Legacy statuses (still rendered for backward compatibility)
  | "pending"
  | "proposing"
  | "proposed"
  | "approved"
  // Interview flow statuses
  | "interviewing-prereqs"
  | "prereqs-confirmed"
  | "interviewing-concepts"
  | "concepts-confirmed"
  | "interviewing-lessons"
  | "lessons-approved"
  // Shared statuses
  | "generating"
  | "complete";

export interface CurriculumModule {
  name: string;
  description?: string;
  status: ModuleStatus;
  proposal: string | null;
  content: string | null;
  // Interview data (Phase 2 new flow)
  prerequisites: Prerequisite[] | null;
  coreConcepts: CoreConcept[] | null;
  lessonPlan: ModuleLessonPlan | null;
}

export type AssessmentType =
  | "quizzes"
  | "labs"
  | "projects"
  | "written"
  | "peer-reviews"
  | "portfolio";

export type DeliveryFormat =
  | "slides"
  | "jupyter"
  | "lms"
  | "video-scripts"
  | "github-repo";

export type Phase = 0 | 1 | 2 | 3 | 4;

export interface CurriculumState {
  courseInfo: CourseInfo | null;
  topicLandscape: string | null;
  topicLandscapeStructured: TopicLandscape | null;
  suggestedModules: string | null;
  suggestedModulesStructured: SuggestedModule[] | null;
  modules: CurriculumModule[];
  currentModuleIndex: number;
  selectedAssessmentTypes: AssessmentType[];
  assessmentsContent: string | null;
  selectedDeliveryFormats: DeliveryFormat[];
  deliveryContent: string | null;
  currentPhase: Phase;
}

export interface CurriculumActions {
  setCourseInfo: (info: CourseInfo) => void;
  setTopicLandscape: (landscape: string) => void;
  setTopicLandscapeStructured: (landscape: TopicLandscape | null) => void;
  setSuggestedModules: (modules: string) => void;
  setSuggestedModulesStructured: (modules: SuggestedModule[] | null) => void;
  setModules: (modules: CurriculumModule[]) => void;
  updateModule: (index: number, updates: Partial<CurriculumModule>) => void;
  addModule: (module: SuggestedModule) => void;
  removeModule: (id: string) => void;
  reorderModules: (fromIndex: number, toIndex: number) => void;
  updateSuggestedModule: (id: string, updates: Partial<SuggestedModule>) => void;
  setCurrentModuleIndex: (index: number) => void;
  setSelectedAssessmentTypes: (types: AssessmentType[]) => void;
  setAssessmentsContent: (content: string) => void;
  setSelectedDeliveryFormats: (formats: DeliveryFormat[]) => void;
  setDeliveryContent: (content: string) => void;
  setCurrentPhase: (phase: Phase) => void;
  reset: () => void;
}

// --- Enhancement types (Mode A) ---

export type AppMode = "create" | "enhance";

export interface UploadedFile {
  id: string;
  name: string;
  content: string;
}

export type ContentStatus = "current" | "needs-update" | "outdated";

export interface ContentInventoryItem {
  id: string;
  moduleName: string;
  topicsCovered: string[];
  estimatedRecency: string;
  status: ContentStatus;
}

export interface GapItem {
  id: string;
  type: "missing" | "outdated" | "opportunity";
  description: string;
}

export interface StrengthItem {
  id: string;
  description: string;
}

export interface AnalysisReport {
  courseName: string;
  moduleCount: number;
  format: string;
  depth: string;
  contentInventory: ContentInventoryItem[];
  gaps: GapItem[];
  strengths: StrengthItem[];
}

export type EnhancementCategory =
  | "update-outdated"
  | "add-modules"
  | "refresh-examples"
  | "add-delivery"
  | "enhance-assessments"
  | "add-interactive";

export interface EnhancementProposal {
  id: string;
  category: EnhancementCategory;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  selected: boolean;
}

export type ChangeStatus =
  | "pending"
  | "generating"
  | "generated"
  | "approved"
  | "rejected";

export interface ChangeItem {
  id: string;
  enhancementId: string;
  title: string;
  before?: string;
  after: string;
  status: ChangeStatus;
}

export interface ChangelogEntry {
  id: string;
  date: string;
  category: EnhancementCategory;
  description: string;
}

export interface EnhancementState {
  mode: AppMode;
  uploadedFiles: UploadedFile[];
  analysisReportRaw: string | null;
  analysisReportStructured: AnalysisReport | null;
  whatsNewContent: string | null;
  enhancementProposals: EnhancementProposal[];
  changes: ChangeItem[];
  changelog: ChangelogEntry[];
  enhancePhase: Phase;
}

export interface EnhancementActions {
  setMode: (mode: AppMode) => void;
  setUploadedFiles: (files: UploadedFile[]) => void;
  addUploadedFile: (file: UploadedFile) => void;
  removeUploadedFile: (id: string) => void;
  setAnalysisReportRaw: (content: string) => void;
  setAnalysisReportStructured: (report: AnalysisReport | null) => void;
  setWhatsNewContent: (content: string) => void;
  setEnhancementProposals: (proposals: EnhancementProposal[]) => void;
  toggleProposalSelection: (id: string) => void;
  setChanges: (changes: ChangeItem[]) => void;
  updateChange: (id: string, updates: Partial<ChangeItem>) => void;
  addChangelogEntry: (entry: ChangelogEntry) => void;
  setChangelog: (entries: ChangelogEntry[]) => void;
  setEnhancePhase: (phase: Phase) => void;
}

export type CurriculumStore = CurriculumState &
  CurriculumActions &
  EnhancementState &
  EnhancementActions;
