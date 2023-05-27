import { generalObj } from '@wonderlandlabs/collect/lib/types'
import { c } from '@wonderlandlabs/collect'
import { Vector2 } from 'three'
import { AsyncResponse } from '~/lib/store/types'
import { Frame } from '~/types'

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
  e?.stopPropagation();
}

export const without = (itemA, fieldList: any[]) => {
  return (c(itemA)).clone().filter((_value, field) => !fieldList.includes(field)).value;
}

export function toPoint(e: MouseEvent) {
  return new Vector2(e.pageX, e.pageY);
}

export const isMouseResponder = (target: HTMLElement) => {
  let current = target;
  while (current) {
    if (current.dataset.mouseResponder === 'responder') {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

export const eventFrame = (target: HTMLElement) => {
  let current = target;
  while (current) {
    console.log('eventFrame: checking', current.dataset);
    if (current.dataset.frameid) {
      return current.dataset.frameid;
    }
    current = current.parentElement;
  }
  return false;
}

export async function dataOrThrow(p: Promise<AsyncResponse>) {
  const {data, error} = await p;
  if (error) throw error;
  return data;
}

export function clickOnId(id) {
  const target = window.document.getElementById(id);
  if (target) {
    const clickEvent = new MouseEvent("click", {
      "view": window,
      "bubbles": true,
      "cancelable": false
    });
    target.dispatchEvent(clickEvent);
  }
}

export function extent(f: Frame): Record<string, Vector2> {

  const {left, top, width, height} = f;
  const dir = {};
  const widthC = Math.round(width/2);
  const heightC = Math.round(height/2);
  'lct'.split('').forEach((horiz) =>{
    'tmb'.split('').forEach(vert => {
      let x = left;
      let y = top;
      switch(horiz) {
        case 'c':
          x += widthC;
          break;

        case 'r':
          x += width;
          break;
      }
      switch (vert) {
        case 'm':
          y += heightC;
          break;
        case 'b':
          y += height;
          break;
      }

      dir[`${horiz}${vert}`] = new Vector2(x, y);
    })
  });

  return dir;
}
