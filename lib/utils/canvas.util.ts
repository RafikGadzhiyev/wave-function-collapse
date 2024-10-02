export function drawLine(
  ctx: CanvasRenderingContext2D,
  coords: [x1: number, y1: number, x2: number, y2: number],
  color?: string
) {
  let actualColor = color
    || 'white'

  let prevStrokeStyle = ctx.strokeStyle

  ctx.strokeStyle = actualColor

  ctx.beginPath()
  ctx.moveTo(coords[0], coords[1])
  ctx.lineTo(coords[2], coords[3])
  ctx.stroke()
  ctx.closePath()

  ctx.strokeStyle = prevStrokeStyle
}
