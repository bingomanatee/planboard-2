import { ChangeEvent, ReactNode } from 'react'
import { ReactNodeLike } from 'prop-types'

export interface ReactNodeArray extends Iterable<ReactNodeLike> {}
export type GenericProps = { children: ReactNode | ReactNodeArray | null };
