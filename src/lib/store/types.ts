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
}

export type StoreRecord<IdType = string, ContentType = any> = {
  id: IdType,
  content: ContentType,
  saved: boolean
}

export type FieldQuery = {
  field: string,
  value: any,
}
