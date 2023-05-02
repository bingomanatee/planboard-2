import { ChangeEvent, ReactNode } from 'react'
import { ReactNodeLike } from 'prop-types'
import { Vector2 } from 'three'

export interface ReactNodeArray extends Iterable<ReactNodeLike> {}
export type GenericProps = { children: ReactNode | ReactNodeArray | null };

// ------ general utility

export type triggerFn = () => void

export function isVector2(arg: unknown): arg is Vector2 {

  return !!(arg && typeof arg === 'object' &&
    'x' in arg && 'y' in arg &&
    typeof arg.x === 'number' && typeof arg.y === 'number'
  )

}

export type NameId = {
  name: string,
  id: string
}
