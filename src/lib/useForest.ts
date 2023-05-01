import { useEffect, useMemo, useState } from 'react'
import { Forest } from '@wonderlandlabs/forest'
import { leafConfig, leafI } from '@wonderlandlabs/forest/lib/types'

type configArray = [initializer: (...args: any) => leafConfig, ...rest: any];

export default function useForest<valueType>(
  config: leafConfig | configArray,
  onCreate?: (leaf: leafI) => unknown
)
  : [value: valueType, state: leafI] {

  const state = useMemo(() => {
    let initializer = config;
    if (Array.isArray(config)) {
      initializer = config[0](...config.slice(1))
    }
    return new Forest(initializer);
  }, []);
  const [value, setValue] = useState<valueType>(state.value);

  useEffect(() => {
    const sub = state.subscribe(setValue);
    let onComplete: unknown = null;
    if (onCreate) {
      onComplete = onCreate(state);
    }
    return () => {
      sub.unsubscribe()
      if (typeof onComplete === 'function') {
        onComplete();
      }
    };
  }, [state]);

  return [value, state];
}
