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
  | 'show_work'
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

export interface ShowWorkData {
  problem: string              // The problem to solve (supports LaTeX)
  expectedAnswer: string       // Correct final answer (for fallback evaluator)
  hints?: string[]             // Optional hints shown to the student
  solutionSteps: string[]      // Key steps the AI checks for (supports LaTeX)
  rubricKeyTerms: string[]     // Math terms to look for in the response
  minimumWords: number         // Minimum words required to submit
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
  data: QuizQuestion[] | FillBlankData | WritingMissionData | ShowWorkData | Record<string, unknown>
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
