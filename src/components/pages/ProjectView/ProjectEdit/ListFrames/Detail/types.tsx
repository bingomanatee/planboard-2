import { leafI } from '@wonderlandlabs/forest/lib/types'

export type DetailProps = { state: leafI, selected: string }
export const numField = {
  filter(n) {
    return n || 0
  }
}
export const toString = (name) => {
  return typeof name === 'string' ? name : '';
};
