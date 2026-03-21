export type ActivityType =
  | 'quiz'
  | 'fill_blank'
  | 'timeline_drag'
  | 'map_label'
  | 'image_label'
  | 'match_pairs'
  | 'sort_order'
  | 'sentence_builder'
  | 'paragraph_template'
  | 'writing_mission'
  | 'equation_builder'
  | 'exam'
  | 'source_analysis'
  | 'compare_contrast'

export interface KeyDate {
  year: string
  event: string
  detail: string
}

export interface KeyTerm {
  term: string
  definition: string
  example?: string
}

export interface LessonSection {
  type: 'text' | 'image' | 'map' | 'callout' | 'source' | 'timeline' | 'math'
  title?: string
  content?: string
  imageUrl?: string
  caption?: string
  highlights?: string[]
}

export interface Lesson {
  id: string
  order: number
  title: string
  subtitle?: string
  sections: LessonSection[]
}

// Activity data variants
export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  image?: string
}

export interface FillBlankData {
  paragraph: string // use ___ for blanks
  blanks: string[]  // correct answers in order
  wordBank: string[]
}

export interface WritingMissionData {
  prompt: string
  scaffoldLevel: 1 | 2 | 3 | 4 | 5
  sentenceStarters?: string[]
  vocabularyHints?: string[]
  connectors?: string[]
  keyPointsToAddress?: string[]
  minimumWords: number
  rubricKeyTerms: string[]
  rubricConnectors?: string[]
}

export interface EquationBuilderStep {
  prompt: string              // The expression at this step (supports LaTeX)
  correctParts: string[]      // Parts that form the correct next step, in order
  distractors: string[]       // Wrong parts mixed in
  hint: string                // Hint about what operation to do
}

export interface EquationBuilderProblem {
  problem: string              // The full starting expression (LaTeX)
  steps: EquationBuilderStep[] // Each step to solve
  finalAnswer: string          // The final numeric answer
}

export interface EquationBuilderData {
  problems: EquationBuilderProblem[]  // Multiple problems per activity
}

export type ExamQuestion =
  | { type: 'quiz'; data: QuizQuestion }
  | { type: 'fill_blank'; data: FillBlankData }
  | { type: 'equation_builder'; data: EquationBuilderProblem }

export interface ExamData {
  timePerQuestion: number   // seconds for quiz/fill_blank (equation_builder = no limit)
  questions: ExamQuestion[]
}

export interface Activity {
  id: string
  lessonId?: string
  type: ActivityType
  title: string
  description: string
  difficulty: 1 | 2 | 3
  xpReward: number
  estimatedMinutes: number
  data: QuizQuestion[] | FillBlankData | WritingMissionData | EquationBuilderData | ExamData | Record<string, unknown>
}

export interface Tema {
  id: string
  number: number
  title: string
  subtitle: string
  subject: string
  category: 'historia' | 'geografia' | 'numeros' | 'geometria' | 'algebra' | 'estadistica'
  color: string
  icon: string
  heroImage?: string
  iconImage?: string
  description: string
  textbookPages: string
  keyDates?: KeyDate[]
  keyTerms: KeyTerm[]
  lessons: Lesson[]
  activities: Activity[]
}
