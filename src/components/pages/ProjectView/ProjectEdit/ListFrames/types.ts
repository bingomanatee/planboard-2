import { Content, Frame } from '~/types'
import { linkVector } from '~/lib/store/data/stores/links.factory'

export type FrameInfo = {
  id: string,
  frame: Frame,
  content: Content | null,
  contentData: any,
  links: Map<string, linkVector[]>
};
