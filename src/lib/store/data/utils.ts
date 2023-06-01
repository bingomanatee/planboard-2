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

export function byContentReducer(memo: Map<string, ImageData>, r: StoreRecord) {
  const content_id = r.content.content_id;
  if (content_id) {
    memo.set(content_id, r);
  }
  return memo;
}
