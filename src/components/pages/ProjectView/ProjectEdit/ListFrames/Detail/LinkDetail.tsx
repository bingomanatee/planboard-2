import { linkVector } from '~/lib/store/data/stores/links.factory'
import { MouseEventHandler } from 'react'
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import AccordionThumb from '~/components/icons/AccordionThumb'
import LinksButton from '~/components/icons/LinkButton'
import { Text } from 'grommet'
import { FrameInfo } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/types'
import EditLink from '~/components/pages/ProjectView/ProjectEdit/ListFrames/Detail/EditLink/EditLink'
import styles from './Detail.module.scss';

function label(frames: FrameInfo[], id) {
  const frame = frames.find((fi) => fi.id === id);
  return frame?.frame.name ? `"${frame?.frame.name}"` : <code>{id}</code>;
}

export function LinkDetail(props: linkVector & { currentLink: string, frames: FrameInfo[], onClick: MouseEventHandler, selected: string }) {
  const { selected, id, from_frame_id, to_frame_id, onClick, currentLink, frames } = props;
  if (from_frame_id === selected || to_frame_id === selected) {
    const identity = from_frame_id === selected ? label(frames, to_frame_id) : label(frames, from_frame_id);
    return <div className={styles['link-detail']}>
      <BoxRow fill="horizontal" gap="small" align="center">
        <AccordionThumb onClick={onClick} up={id !== currentLink}/>
        <Text>&nbsp;</Text>
        <LinksButton/>
      {
        from_frame_id === selected ? (
          <Text weight="bold" title={to_frame_id}>To {identity}</Text>
        ) : ( // we are assuming that one or the other is the case
          <Text weight="bold" title={from_frame_id}>From {identity}</Text>
        )
      }</BoxRow>
        {id === currentLink? <EditLink id={id} />: null}
    </div>
  }

}
