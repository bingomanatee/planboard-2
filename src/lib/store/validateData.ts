import { c } from '@wonderlandlabs/collect'
import { type } from '@wonderlandlabs/walrus'
import { FieldDef } from '~/lib/store/types'

function str (val) {
  try {
    return JSON.stringify(val, undefined, 2);
  } catch (_e) {
    return `<<${val}>>`;
  }
}
const validateData = (value, schema: FieldDef[], collection: string) => {
  const coll = c(value);
  for (let field of schema) {
    if (coll.hasKey(field.name)) {
      const value = coll.get(field.name);
      if ('type' in field) {
        if (typeof field.type === 'string') {
          const valType = type.describe(value, true);
          if (valType !== field.type) {
            throw new Error(`${field.name} (${str(value)}) must be ${field.type} for ${collection}`);
          }
        }
      }
    } else {
      if (!(field.optional || field.primary)) {
        console.warn('bad', collection, value, field);
        throw new Error(`missing required field "${field.name}" for ${collection}`);
      }
    }
  }
}

export default validateData;
