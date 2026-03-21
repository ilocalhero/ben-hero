import temaRuptura from './temas/tema-ruptura.json'
import tema01 from './temas/tema01.json'
import tema02 from './temas/tema02.json'
import tema04 from './temas/tema04.json'
import tema05 from './temas/tema05.json'
import tema06 from './temas/tema06.json'
import tema07 from './temas/tema07.json'
import tema08 from './temas/tema08.json'
import mat01 from './temas/mat01.json'
import mat02 from './temas/mat02.json'
import type { Tema } from '../types/tema'

export const TEMAS: Tema[] = [
  temaRuptura,
  tema01,
  tema02,
  tema04,
  tema05,
  tema06,
  tema07,
  tema08,
  mat01,
  mat02,
].sort((a, b) => (a as unknown as Tema).number - (b as unknown as Tema).number) as unknown as Tema[]

export function getTema(id: string): Tema | undefined {
  return TEMAS.find(t => t.id === id)
}

export function getTemaByNumber(num: number): Tema | undefined {
  return TEMAS.find(t => t.number === num)
}

export function getTemasForSubject(subjectId: string): Tema[] {
  return TEMAS.filter(t => t.subject === subjectId)
}
