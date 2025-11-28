export interface AABB {
  x: number
  y: number
  width: number
  height: number
}

export function aabbIntersects(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export function pointInAABB(px: number, py: number, box: AABB): boolean {
  return px >= box.x && px <= box.x + box.width && py >= box.y && py <= box.y + box.height
}

export function circleIntersects(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const dx = x2 - x1
  const dy = y2 - y1
  const distSq = dx * dx + dy * dy
  const radiusSum = r1 + r2
  return distSq < radiusSum * radiusSum
}

export function normalize(x: number, y: number): { x: number; y: number } {
  const len = Math.sqrt(x * x + y * y)
  if (len === 0) return { x: 0, y: 0 }
  return { x: x / len, y: y / len }
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1)
}
