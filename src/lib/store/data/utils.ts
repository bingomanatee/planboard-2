import { isStoreRecord, StoreRecord } from '~/lib/store/types'

export function combine(...itemLists: StoreRecord[][]) {
  let map = new Map();
  itemLists.flat().forEach((storeRecord) => {
    if (isStoreRecord(storeRecord)) {
      map.set(storeRecord.id, storeRecord)
    }
  });

  return Array.from(map.values());
}
