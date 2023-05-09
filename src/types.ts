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

export type Project = {} & NameId;
export type Frame = {project_id: string, order: number } & NameId;
export type MarkdownData = {title: string, text: string, id: string};
export type ImageData = {crop: string, scale: number, name?: string, id: string};
export type Content = {frame_id: string, project_id: string, type: string, id: string}
export type generalObj = Record<string, any>
