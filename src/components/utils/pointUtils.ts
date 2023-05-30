import { Vector2 } from 'three'

export function roundPoint(p: Vector2, resolution, up = false) {
  let r = p.clone();
  let remX = p.x % resolution;
  let remY = p.y % resolution;

  const offset = new Vector2(remX, remY);
  r.sub(offset);
  if (up) {
    const upOffset = new Vector2(remX ? resolution : 0, remY ? resolution : 0);
    r.add(upOffset);
  }
  return r;
}
