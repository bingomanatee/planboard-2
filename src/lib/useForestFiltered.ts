import { leafI } from '@wonderlandlabs/forest/lib/types'
import { useCallback, useEffect, useState } from 'react'
import { c } from '@wonderlandlabs/collect'
import { isEqual } from 'lodash'

type YfiConfig = {
  filter?: (update: unknown) => unknown,
  targetField?: string
}

export default function useForestFiltered<InputElement = HTMLInputElement>(
  leaf: leafI,
  filter: (value: any) => any | any[],
): any {

  const pick = useCallback((value) => {
    if (!value) {
      console.warn('cannot get value for leaf ', leaf);
      return {};
    }
    return (Array.isArray(filter)) ?
      c(value)
        .getReduce((data, value, field) => {
          if ((filter as any[]).includes(field)) {
            data[field] = value;
          }
          return data;
        }, {}) : filter(value);
  }, [filter]);
  const [result, setResult] = useState(pick(leaf.value));

  useEffect(() => {
    let sub = leaf.select((summary)=> {
      if (!isEqual(summary, result)) setResult(summary);
    }, (value) => {
      return pick(value);
    });

    return () => sub.unsubscribe();
  }, [leaf, filter])

  return result;
}

