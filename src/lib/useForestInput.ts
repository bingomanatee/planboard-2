import { leafI } from '@wonderlandlabs/forest/lib/types'
import { FormEvent, useCallback, useMemo } from 'react'
import { generalObj } from '@wonderlandlabs/collect/lib/types'

type ufiConfig = {
  filter?: (update: unknown) => unknown,
  targetField?: string
}
export default function useForestInput<InputElement = HTMLInputElement>(
  leaf: leafI,
  fieldName: string,
  config?: ufiConfig):
  [value: any, handler: (e: FormEvent<InputElement>) => void] {
  const setter = useMemo(() => `set_${fieldName}`, [fieldName]);

  const {filter, targetField} = {filter: null, targetField: 'value', ...(config || {})}

  const handler = useCallback((e: FormEvent<InputElement  >) => {

    const target =  e.target as generalObj;
    const next  = target[targetField];

    if (!(setter in leaf.do)) {
      console.warn('bad field spec for leaf: ', fieldName, leaf);
      return;
    }
    if (filter) {
      try {
        leaf.do[setter](filter(next));
      } catch (err) {
        if (err instanceof Error) {
          console.warn('cannot filter field:', err.message);
        }
      }
    } else {
      leaf.do[setter](next);
    }
  }, [setter, leaf]);

  return [leaf.get(fieldName), handler]
}


export function useForestTextAreaInput(leaf: leafI,
                                       fieldName: string,
                                       filter?: (update: string) => any):
  [value: any, handler: (e: FormEvent<HTMLTextAreaElement>) => void] {
  const setter = useMemo(() => `set_${fieldName}`, [fieldName]);

  const handler = useCallback((e: FormEvent<HTMLTextAreaElement>) => {

    const next = (e.target as HTMLTextAreaElement).value;
    if (!(setter in leaf.do)) {
      console.warn('bad field spec for leaf: ', fieldName, leaf);
      return;
    }
    if (filter) {
      try {
        leaf.do[setter](filter(next));
      } catch (err) {
        if (err instanceof Error) {
          console.warn('cannot filter field:', err.message);
        }
      }
    } else {
      leaf.do[setter](next);
    }
  }, [setter, leaf]);

  return [leaf.get(fieldName), handler]
}
