/** Maps JSON icon name strings → display emoji for tema cards */
const ICON_MAP: Record<string, string> = {
  castle:    '🏰',
  shield:    '🛡️',
  crown:     '👑',
  sword:     '⚔️',
  scroll:    '📜',
  globe:     '🌍',
  mountain:  '⛰️',
  compass:   '🧭',
  map:       '🗺️',
  church:    '⛪',
  book:      '📖',
  star:      '⭐',
  flame:     '🔥',
  sun:       '☀️',
  leaf:      '🍃',
  tree:      '🌲',
  ship:      '⛵',
  city:      '🏙️',
  people:    '👥',
  climate:   '🌡️',
  wheat:     '🌾',
  tools:     '⚒️',
  art:       '🎨',
  music:     '🎵',
  palace:    '🏯',
  flag:      '🚩',
  trade:     '⚖️',
  calculator:'🧮',
  numbers:   '🔢',
  geometry:  '📐',
  algebra:   '➗',
  chart:     '📊',
}

export function getTemaEmoji(iconName: string): string {
  return ICON_MAP[iconName] ?? '📚'
}
