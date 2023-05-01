import globalFactory from '~/lib/store/global.factory'
import { createContext, useEffect, useMemo, useState } from 'react'
import { GenericProps } from '~/types'
import {
  GlobalProvided,
  GlobalStateValue,
} from './types'


// @ts-ignore
export const GlobalStateContext = createContext<GlobalProvided>({});

export default function GlobalState({ children }: GenericProps) {
  const globalState = useMemo(() => globalFactory(), []);

  const [globalValue, setGlobalValue] = useState<GlobalStateValue>(globalState.value);

  useEffect(() => {
    // window.addEventListener('mousedown', globalState.do.mouseDown);
  }, []);


  useEffect(() => {
    const sub = globalState.subscribe(setGlobalValue);

    return () => {
      sub.unsubscribe();
    };
  }, [globalState]);

  const providerValue = useMemo(() => ({ globalState, globalValue }), [globalValue, globalState])

  return <GlobalStateContext.Provider value={providerValue}>{children}</GlobalStateContext.Provider>
}
