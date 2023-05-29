import globalFactory from '~/lib/store/global.factory'
import { createContext, useEffect, useMemo, useState } from 'react'
import { GenericProps } from '~/types'
import {
  DataProvided, DataStateValue,
  GlobalProvided,
  GlobalStateValue,
} from './types'
import indexedEngine from '~/lib/store/data/engines/indexedEngine'
import dataStoreFactory from '~/lib/store/data/dataStore.factory'
import { typedLeaf } from '@wonderlandlabs/forest/lib/types'


// @ts-ignore
export const GlobalStateContext = createContext<GlobalProvided>(null);
export const DataStateContext = createContext<DataProvided>(null);
export type DataStateContextValue = {dataState: typedLeaf<DataStateValue>, dataValue: DataStateValue}
export default function GlobalState({ children }: GenericProps) {
  const { globalState, dataState } = useMemo(() => {
    const engine = indexedEngine( {});
    const data = dataStoreFactory(engine);
    const global = globalFactory(data);
    return {globalState: global, dataState: data}
  }, []);

  const [globalValue, setGlobalValue] = useState<GlobalStateValue>(globalState.value);
  const [dataValue, setDataValue] = useState<DataStateValue>(new Map());

  useEffect(() => {
    const globalSub = globalState.subscribe(setGlobalValue);
    const dataSub = dataState.subscribe(setDataValue);

    return () => {
      globalSub.unsubscribe();
      dataSub.unsubscribe();
    };
  }, [globalState, dataState]);

  return <GlobalStateContext.Provider value={{ globalState, globalValue }}>
    <DataStateContext.Provider value={{ dataState, dataValue }}>
    {children}
    </DataStateContext.Provider>
    </GlobalStateContext.Provider>
}
