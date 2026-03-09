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
  type: 'text' | 'image' | 'map' | 'callout' | 'source' | 'timeline'
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

export interface Activity {
  id: string
  lessonId?: string
  type: ActivityType
  title: string
  description: string
  difficulty: 1 | 2 | 3
  xpReward: number
  estimatedMinutes: number
  data: QuizQuestion[] | FillBlankData | WritingMissionData | Record<string, unknown>
}

export interface Tema {
  id: string
  number: number
  title: string
  subtitle: string
  category: 'historia' | 'geografia'
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
