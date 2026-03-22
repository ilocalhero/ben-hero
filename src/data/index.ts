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
import mat03 from './temas/mat03.json'
import mat04 from './temas/mat04.json'
import mat05 from './temas/mat05.json'
import mat06 from './temas/mat06.json'
import mat07 from './temas/mat07.json'
import mat08 from './temas/mat08.json'
import mat09 from './temas/mat09.json'
import mat10 from './temas/mat10.json'
import mat11 from './temas/mat11.json'
import type { Tema } from '../types/tema'

export { MATE_SEASON_2 } from './seasons/mate-season-2'
export type { Season, SeasonItem } from './seasons/mate-season-2'

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
  mat03,
  mat04,
  mat05,
  mat06,
  mat07,
  mat08,
  mat09,
  mat10,
  mat11,
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
