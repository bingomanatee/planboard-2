export type FieldDef = {
  name: string,
  type?: string | string[],
  optional?: boolean,
  indexed?: boolean,
  default?: any,
  test?: (value: any) => boolean,
  primary?: boolean,
  version?: number,
}

export type GoodAsync = { data: any };
export type BadAsync = { error: Error };
export type AsyncResponse = GoodAsync | BadAsync;
export type Engine = {
  save: (collection: string, value: any, id?: any, saved?: boolean) => Promise<AsyncResponse>
  addStore: (collection: string, schema?: FieldDef[]) => void
  fetch: (collection: string, id: any) => Promise<AsyncResponse>
  query: (collection: string, conditions: FieldQuery[]) => Promise<AsyncResponse>
  deleteIds: (ids: any[]) => Promise<void>,
  tables: () =>  Map<number, IndexDbTables>,
  schema(string): FieldDef[],
  schemas: Record<string, Map<number, FieldDef[]>>
  // an object of tables, indexed by name,
  // whose values are a map of version number to FieldDef array
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
export type IndexDbTables = Record<string, string>
