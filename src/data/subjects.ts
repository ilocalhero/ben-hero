import type { Tema } from '../types/tema'

export interface CategoryConfig {
  id: string
  label: string
  color: string
}

export interface SubjectConfig {
  id: string
  label: string
  shortLabel: string
  color: string
  icon: string
  description: string
  categories: CategoryConfig[]
}

export const SUBJECTS: Record<string, SubjectConfig> = {
  historia_geografia: {
    id: 'historia_geografia',
    label: 'Historia y Geografía',
    shortLabel: 'Historia y Geo',
    color: '#ff6b35',
    icon: 'scroll',
    description: 'Historia y Geografía de España',
    categories: [
      { id: 'historia', label: 'Historia', color: '#ff6b35' },
      { id: 'geografia', label: 'Geografía', color: '#00d4ff' },
    ],
  },
  matematicas: {
    id: 'matematicas',
    label: 'Matemáticas',
    shortLabel: 'Mates',
    color: '#b24bff',
    icon: 'calculator',
    description: 'Matemáticas 2 ESO',
    categories: [
      { id: 'numeros', label: 'Números', color: '#00d4ff' },
      { id: 'geometria', label: 'Geometría', color: '#00ff88' },
      { id: 'algebra', label: 'Álgebra', color: '#b24bff' },
      { id: 'estadistica', label: 'Estadística', color: '#ffd700' },
    ],
  },
}

export const SUBJECT_LIST = Object.values(SUBJECTS)

export function getSubjectConfig(subjectId: string): SubjectConfig | undefined {
  return SUBJECTS[subjectId]
}

export function getCategoryConfig(tema: Tema): CategoryConfig | undefined {
  const subject = SUBJECTS[tema.subject]
  if (!subject) return undefined
  return subject.categories.find(c => c.id === tema.category)
}

export function getCategoryColor(tema: Tema): string {
  return getCategoryConfig(tema)?.color ?? tema.color
}

export function getCategoryLabel(tema: Tema): string {
  return getCategoryConfig(tema)?.label ?? tema.category
}
