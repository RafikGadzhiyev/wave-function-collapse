export function getRandomNumberFromRange(from: number, to: number) {
  return Math.floor(
    Math.random() * (to - from) + from
  )
}
