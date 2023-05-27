export type FieldDef = {
  name: string,
  type?: string | string[],
  optional?: boolean,
  indexed?: boolean,
  default?: any,
  test?: (value: any) => boolean,
  primary?: boolean
}

export type GoodAsync = { data: any };
export type BadAsync = { error: Error };
export type AsyncResponse = GoodAsync | BadAsync;
export type Engine = {
  save: (collection: string, value: any, id?: any, saved?: boolean) => Promise<AsyncResponse>
  addStore: (collection: string, schema?: FieldDef[]) => void
  fetch: (collection: string, id: any) => Promise<AsyncResponse>
  query: (collection: string, conditions: FieldQuery[]) => Promise<AsyncResponse>
  deleteIds: (ids: any[]) => Promise<void>;
  initialize() : void
}

export type StoreRecord<IdType = string, ContentType = any> = {
  id: IdType,
  content: ContentType,
  saved?: boolean
}

export function isStoreRecord(a: unknown) : a is StoreRecord {
  if (!(a && typeof a === 'object')) {
    return false;
  }
  return 'id' in a && 'content' in a;
}

export type StoreMap = Map<any, StoreRecord>

export type FieldQuery = {
  field: string,
  value: any,
}

export type Filter = ((value: StoreRecord) => boolean) | FieldQuery[]
