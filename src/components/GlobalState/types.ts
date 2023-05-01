import { leafI } from '@wonderlandlabs/forest/lib/types'

export type UserObj = {
  email: string,
  aud: string,
  id: string
}

export type GlobalStateValue = {
  user?: UserObj,
};

export type GlobalProvided = { globalState: leafI, globalValue: GlobalStateValue }
