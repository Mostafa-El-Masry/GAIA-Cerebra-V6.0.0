export const MAX_SESSIONS_PER_WEEK = 3;
export const MAX_CHARACTERS_PER_SESSION = 2000;
export const ALLOWED_TIME_WINDOWS: [number, number][] = [
  [6, 8],
  [20, 22],
];

export function canEnterSanctum(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const inWindow = ALLOWED_TIME_WINDOWS.some(([s, e]) => hour >= s && hour < e);
  return inWindow;
}

export function canWrite(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const inWindow = ALLOWED_TIME_WINDOWS.some(([s, e]) => hour >= s && hour < e);
  return inWindow;
}

export function mustExit(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const inWindow = ALLOWED_TIME_WINDOWS.some(([s, e]) => hour >= s && hour < e);
  return !inWindow;
}
