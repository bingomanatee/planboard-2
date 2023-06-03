import { Content, Frame } from '~/types'

export type FrameInfo = { id: string,
  frame: Frame,
  content: Content | null,
  contentData: any
};
