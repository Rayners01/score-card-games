import { Player, Colour, bgClasses } from './types'

export function getScore(player: Player): number {
  return (player.scores || []).reduce((sum, s) => sum + s, 0);
}

export function getWinner(players: Player[]): Player {
  return players.reduce((bestPlayer, currentPlayer) => {
    return getScore(currentPlayer) > getScore(bestPlayer) ? currentPlayer : bestPlayer;
  })
}

export function isWinner(player: Player, players: Player[]) {
  return getWinner(players).id === player.id;
}


export function randomBg(id: string): Colour {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return bgClasses[hash % bgClasses.length];
}

export function generateAlphanumeric(n: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < n; i++) res += chars[Math.floor(Math.random() * chars.length)];
  return res;
}

export function generateGameCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let res = '';
  for (let i = 0; i < 5; i++) res += chars[Math.floor(Math.random() * chars.length)];
  return res;
}

export function minRounds(players: Player[]) {
  if (players.length === 0) return 0;
  return Math.min(...players.map(p => p.scores.length));
}
