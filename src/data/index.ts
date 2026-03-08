import tema01 from './temas/tema01.json'
import tema02 from './temas/tema02.json'
import type { Tema } from '../types/tema'

export const TEMAS: Tema[] = [
  tema01 as unknown as Tema,
  tema02 as unknown as Tema,
]

export function getTema(id: string): Tema | undefined {
  return TEMAS.find(t => t.id === id)
}

export function getTemaByNumber(num: number): Tema | undefined {
  return TEMAS.find(t => t.number === num)
}
