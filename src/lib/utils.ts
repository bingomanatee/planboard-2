import { generalObj } from '@wonderlandlabs/collect/lib/types'
import { c } from '@wonderlandlabs/collect'

export function numToPx(value: number | string): string {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  if (/^[\d]+$/.test(value)) {
    return numToPx(Number(value));
  }
  return value;
}

export function propsToPx(obj: generalObj) {
  return c(obj).getMap(numToPx);
}

export const terminate = (e) => {
  e.stopPropagation();
}
