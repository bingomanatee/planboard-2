import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type UserObj = {
  email: string,
  aud: string,
  id: string
}

export type GlobalStateValue = {
  user?: UserObj,
};

export type GlobalProvided = { globalState: typedLeaf<GlobalStateValue>, globalValue: GlobalStateValue }

export type DataMap = Map<string, any>
export type DataStateValue = Map<string, DataMap>
export type DataProvided = { dataState: typedLeaf<DataStateValue>, dataValue: DataStateValue }
