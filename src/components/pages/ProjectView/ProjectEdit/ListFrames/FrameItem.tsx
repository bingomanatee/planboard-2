import { ReactNode, useCallback, useMemo } from 'react'
import { BoxColumn, BoxFlip, BoxRow } from '~/components/BoxVariants'
import styles from '~/components/pages/ProjectView/ProjectEdit/ListFrames/ListFrames.module.scss'
import { Button, Text } from 'grommet'
import { linkVector } from '~/lib/store/data/stores/links.factory'
import LinksButton from '~/components/icons/LinkButton';
import styled from 'styled-components';
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Link } from '~/types'

const FRAME_ITEM_BORDER = {
  width: 1,
  border: 'black'
}

const LbWrapper = styled.div`
  #from-anchor {
    visibility: ${(
            { showFrom }
    ) => showFrom ? 'visible' : 'hidden'};
  }

  #to-anchor {
    visibility: ${({ showTo }) => showTo ? 'visible' : 'hidden'};
  }
`

function LinkButtons(props: { state: leafI, id: string, selected: string, links: Link[] }) {
  const direction = new Set();
  const {state, id, selected} = props;
  props.links.forEach((link) => {
    if (link.to_frame_id === selected) {
      direction.add('from');
    }
    if (link.from_frame_id === selected) {
      direction.add('to');
    }
  })
  const showLinks = useCallback((e) => {
    e.stopPropagation();
    state.do.showLinks(id);
  }, [state, id]);

  if (direction.size === 0) {
    return null;
  }
  return <Button plain={false} className={styles['from-to-button']} margin={{ horizontal: 'medium' }}
                 pad={{ horizontal: 'medium' }} onClick={showLinks}>
    <BoxRow gap="small" align="center" justify="center">
      {direction.has('from') ? <Text>From</Text> : ''}
      <LbWrapper showFrom={direction.has('from')} showTo={direction.has('to')}>
        <LinksButton />
      </LbWrapper>
      {direction.has('to') ? <Text>To</Text> : ''}
    </BoxRow>
  </Button>
}

export function FrameItem({ frameInfo, state, lock }) {
  const { frame, content, id, links } = frameInfo;
  const { mode, selected } = state.value;

  const clickHandler = useCallback(() => {
    state.do.clickFrame(id);
  }, [state]);
  const enterHandler = useCallback(() => {
    state.do.overFrame(id);
  }, [state]);

  const classes = useMemo(() => {
    if (lock === id) {
      return styles['active-frame-locked'];
    }
    if ((selected === id) && lock) {
      return styles['active-frame-other-locked'];
    }
    if (selected === id) {
      return styles['active-frame'];
    }
    return styles['inactive-under-lock'];
  }, [id, selected, lock]);

  return (
    <BoxFlip fill="horizontal" pad="small"
             direction="column"
            onClick={clickHandler}
            onMouseEnter={enterHandler}
            className={classes}
            focusIndicator={false}
            justify="between"
            align="center"
    >
        <Text truncate weight="bold">{frame.name}{frame.name && content?.type ? ': ' : ''}{content?.type || ''}
          <code>{id}</code>
        </Text>
      {(selected !== id && mode === 'links' || mode === 'links-all') && selected && (links.find((link: Link) => link.from_frame_id === selected || link.to_frame_id === selected)) ?
        <LinkButtons state={state} id={id} links={links} selected={selected}/>
        : ''}
      <div >
          <Text size="small">{frame.order}</Text>
          </div>
    </BoxFlip>
  )
}
