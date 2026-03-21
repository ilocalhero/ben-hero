export interface Prize {
  level: number
  title: string
  description: string
  image: string
  emoji: string
}

export const PRIZES: Prize[] = [
  {
    level: 10,
    title: 'Burger at Tarantin Chiflado',
    description: 'Epic Glop-Burger — 100 Health, 50 Shield',
    image: '/images/prizes/prize-burger.png',
    emoji: '🍔',
  },
  {
    level: 13,
    title: 'Latin Fest 2026',
    description: 'Latin Fest Valencia — the ultimate event',
    image: '/images/prizes/prize-latinfest.png',
    emoji: '🎶',
  },
  {
    level: 15,
    title: 'New Game',
    description: 'PS5, Switch, Steam — tu eliges',
    image: '/images/prizes/prize-game.png',
    emoji: '🎮',
  },
  {
    level: 17,
    title: 'Goalkeeper Gloves',
    description: 'Fort-Keeper gloves — guard the goal',
    image: '/images/prizes/prize-gloves.png',
    emoji: '🧤',
  },
  {
    level: 20,
    title: 'Solo Trip to Barcelona',
    description: 'Victory Royale — Barcelona is yours',
    image: '/images/prizes/prize-barcelona.png',
    emoji: '✈️',
  },
  {
    level: 25,
    title: 'Levante Season Tickets',
    description: 'Levante UD — season tickets',
    image: '/images/prizes/prize-levante.png',
    emoji: '⚽',
  },
]
