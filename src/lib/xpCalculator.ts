export interface LevelData {
  level: number
  title: string
  xpRequired: number  // total XP needed to reach this level
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Novato', 2: 'Aprendiz', 3: 'Iniciado', 4: 'Explorador', 5: 'Aventurero',
  6: 'Cronista', 7: 'Escriba', 8: 'Escudero', 9: 'Paje', 10: 'Heraldo',
  11: 'Caballero', 12: 'Cruzado', 13: 'Navegante', 14: 'Artesano', 15: 'Mercader',
  16: 'Arquitecto', 17: 'Estratega', 18: 'Consejero', 19: 'Noble', 20: 'Embajador',
  21: 'Conde', 22: 'Marqués', 23: 'Duque', 24: 'Virrey', 25: 'Canciller',
  26: 'Erudito', 27: 'Filósofo', 28: 'Maestro', 29: 'Sabio', 30: 'Rey Sabio',
}

// Build cumulative XP table: level N requires sum of (100 + (n-2)*50) for n=2..N
export const LEVELS: LevelData[] = Array.from({ length: 30 }, (_, i) => {
  const level = i + 1
  if (level === 1) return { level: 1, title: 'Novato', xpRequired: 0 }
  let total = 0
  for (let n = 2; n <= level; n++) {
    total += 300 + (n - 2) * 200
  }
  return { level, title: LEVEL_TITLES[level], xpRequired: total }
})

export function getLevelFromXP(xp: number): number {
  let level = 1
  for (const ld of LEVELS) {
    if (xp >= ld.xpRequired) level = ld.level
    else break
  }
  return level
}

export function getLevelData(level: number): LevelData {
  return LEVELS[Math.min(level - 1, LEVELS.length - 1)]
}

export function getNextLevelData(level: number): LevelData | null {
  if (level >= 30) return null
  return LEVELS[level]
}

export function getXPProgress(xp: number): { current: number; needed: number; percent: number } {
  const level = getLevelFromXP(xp)
  const currentLevelData = getLevelData(level)
  const nextLevelData = getNextLevelData(level)
  if (!nextLevelData) return { current: xp - currentLevelData.xpRequired, needed: 0, percent: 100 }
  const current = xp - currentLevelData.xpRequired
  const needed = nextLevelData.xpRequired - currentLevelData.xpRequired
  return { current, needed, percent: Math.round((current / needed) * 100) }
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] || 'Leyenda'
}
