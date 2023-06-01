import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { Text, Grid, Heading, Card, CardBody, Button } from 'grommet';
import styles from './ListFrames.module.scss';
import stateFactory from './ListFrames.state.ts';
import useForest from '~/lib/useForest';
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import PopupCardHeader from '~/components/Popup/PopupCardHeader'
import { pad } from '~/components/utils/constants'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import Img from '~/components/Img'
import MoveButton from '~/components/pages/ProjectView/MoveButton/MoveButton'
import MoveButtonDown from '~/components/MoveButtonDown'
import MoveButtonUp from '~/components/MoveButtonUp'
import { leafI } from '@wonderlandlabs/forest/lib/types'

type ListFramesProps = {}

const GRID_AREAS = [
  { name: 'header', start: [0, 0], end: [1, 0] },
  { name: 'list', start: [0, 1], end: [0, 1] },
  { name: 'detail', start: [1, 1], end: [1, 1] }
];

const border = { width: 1, color: 'dark-2' };

const GRID_COLUMNS = ['1fr', '1fr'];
const GRID_ROWS = ['auto', '1fr'];
const FRAME_ITEM_BORDER = {
  width: 1,
  border: 'black'
}

function FrameItem({ frame, state, selected }) {
  const { frame: frameInfo, content } = frame;
  const clickHandler = useCallback(() => {
    state.do.toggleSelectFrame(frameInfo.id);
  }, [state]);

  return (
    <BoxRow fill="horizontal" border={FRAME_ITEM_BORDER} pad="small" onClick={clickHandler}
            className={[styles['frame-item'], (selected === frameInfo.id) ? styles['active-frame'] : ''].join(' ')}
            focusIndicator={false}
    >
      <BoxColumn gap="2px" focusIndicator={false}
      >
        <Text
          weight="bold">{frameInfo.name}{frameInfo.name && content?.type ? ': ' : ''}{content?.type || '(no content)'}</Text>
        <Text weight="bold">{frameInfo.id}</Text>
      </BoxColumn>
      <span className={styles.order}>
          <Text size="small">
            {frameInfo.order}</Text>
          </span>
    </BoxRow>
  )
}

function Detail({ state, selected }: {state: leafI, selected: string}) {
  const current = useMemo(() => {
    if (!selected) {
      return null;
    }
    return state.value.frames.find((fr) => fr.frame.id === selected) || null;
  }, [state.value.frames, selected]);

  if (!current) {
    return null;
  }

  const { frame: frameInfo, content } = current;
  return <BoxColumn pad={{ horizontal: 'medium', vertical: 'small' }}>
    <BoxRow>
      <BoxRow gap="small" className={styles['move-button']}>
        <Button plain onClick={state.do.moveTop}>
          <MoveButtonUp top/>
        </Button>
        <Button plain onClick={state.do.moveUp}>
          <MoveButtonUp/>
        </Button>
      </BoxRow>
      <BoxColumn fill="horizontal" className={styles['detail-head']}>
        <Text size="large" as="div" textAlign="center"
              weight="bold">{frameInfo.name}{frameInfo.name && content?.type ? ': ' : ''}{content?.type || '(no content)'}</Text>
        <Text weight="bold" as="div" textAlign="center"
              size="large"
        >{frameInfo.id}</Text>
        <span className={styles.order}>
          <Text size="small">
            {frameInfo.order}</Text>
          </span>
      </BoxColumn>
      <BoxRow gap="small" plain className={styles['move-button']}>
        <Button plain onClick={state.do.moveDown}>
          <MoveButtonDown/>
        </Button>
        <Button plain  onClick={state.do.moveBottom}>
          <MoveButtonDown bottom/>
        </Button>
      </BoxRow>
    </BoxRow>
  </BoxColumn>
}

export default function ListFrames(props: ListFramesProps) {
  const { dataState } = useContext<DataStateContextValue>(DataStateContext)
  const [value, state] = useForest([stateFactory, props, dataState],
    (localState) => {
      localState.do.watchFrames();
    });

  const { selected, frames } = value;

  return (
    <BoxColumn fill align="center" justify="center" pad="large">
      <Card background="background-back" id="edit-frame"
            width="100%"
            fill
      >
        <PopupCardHeader>
          <Heading justify="stretch" textAlign="center" color="text-reverse" level={2}>
            Frames {selected}</Heading>
        </PopupCardHeader>
        <CardBody pad={pad} fill>
          <Grid areas={GRID_AREAS} rows={GRID_ROWS} columns={GRID_COLUMNS} fill>
            <BoxRow border={border} gridArea="header">Header</BoxRow>
            <BoxColumn
              border={border}
              overflow={{ vertical: 'scroll' }}
              className={selected ? styles['locked-frame'] : ''}
              gridArea="list">
              {frames.map(frame => <FrameItem state={state} selected={selected} key={frame.id} frame={frame}/>)}
            </BoxColumn>
            <BoxColumn border={border} gridArea="detail">
              <Detail state={state} selected={selected}/>
            </BoxColumn>
          </Grid>
        </CardBody>
      </Card>
    </BoxColumn>
  );
}
