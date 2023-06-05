import { ReactNode, useCallback, useMemo } from 'react'
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import styles from '~/components/pages/ProjectView/ProjectEdit/ListFrames/ListFrames.module.scss'
import { Button, Text } from 'grommet'
import { linkVector } from '~/lib/store/data/stores/links.factory'
import LinksButton from '~/components/icons/LinkButton';
import styled from 'styled-components';

const FRAME_ITEM_BORDER = {
  width: 1,
  border: 'black'
}

const LbWrapper = styled.div`
  #from-anchor {
    visibility: ${(
    {from}
    ) => from ? 'visible' : 'hidden'};
  }
  #to-anchor {
    visibility: ${({to}) => to ? 'visible' : 'hidden'};
  }
`

function LinkButtons(props: { links: linkVector[] }) {
  const direction = new Set();
  props.links.forEach((link) => direction.add(link.dir));
  if (direction.size === 0) {
    return null;
  }
  return <Button plain={false} className={styles['from-to-button']} margin={{horizontal: 'medium'}} pad={{horizontal: 'medium'}}>
      <BoxRow gap="small" align="center" justify="center">
    {direction.has('from') ? <Text>From</Text> : ''}
    <LbWrapper from={direction.has('from')} to={direction.has('to')}>
    <LinksButton/>
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
    return [styles['frame-item'],
      (selected === id) ? styles['active-frame'] : '',
      (lock === id ? styles['active-frame-locked'] : '')
    ].join(' ')
  }, [id]);


  return (
    <BoxRow fill="horizontal" border={FRAME_ITEM_BORDER} pad="small"
          onClick={clickHandler}
          onMouseEnter={enterHandler}
          className={classes}
          focusIndicator={false}
    >
      <BoxColumn gap="2px" focusIndicator={false}>
        <Text weight="bold">{frame.name}{frameInfo.name && content?.type ? ': ' : ''}{content?.type || ''}</Text>
        <Text weight="bold">{id}</Text>
      </BoxColumn>
      {(mode === 'links') && selected && links.has(selected) ?
          <LinkButtons links={links.get(selected)}/>
          : ''}
      <span className={styles.order}>
          <Text size="small">{frame.order}</Text>
          </span>
    </BoxRow>
  )
}
