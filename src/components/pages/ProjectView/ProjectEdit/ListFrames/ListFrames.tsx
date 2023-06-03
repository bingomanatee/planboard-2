import { useContext } from 'react';
import { Card, CardBody, Grid, Heading } from 'grommet';
import styles from './ListFrames.module.scss';
import stateFactory from './ListFrames.state.ts';
import useForest from '~/lib/useForest';
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import PopupCardHeader from '~/components/Popup/PopupCardHeader'
import { pad } from '~/components/utils/constants'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import Detail from '~/components/pages/ProjectView/ProjectEdit/ListFrames/Detail/Detail'
import { FrameItem } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/FrameItem'

type ListFramesProps = {}

const GRID_AREAS = [
  { name: 'header', start: [0, 0], end: [1, 0] },
  { name: 'list', start: [0, 1], end: [0, 1] },
  { name: 'detail', start: [1, 1], end: [1, 1] }
];

const border = { width: 1, color: 'dark-2' };

const GRID_COLUMNS = ['1fr', '1fr'];
const GRID_ROWS = ['auto', '1fr'];

export default function ListFrames(props: ListFramesProps) {
  const { dataState } = useContext<DataStateContextValue>(DataStateContext)
  const [value, state] = useForest([stateFactory, props, dataState],
    (localState) => {
      localState.do.watchFrames();
    });

  const { selected, frames , lockSelected } = value;

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
              {frames.map(frame => <FrameItem state={state} selected={selected} lock={lockSelected} key={frame.id} frame={frame}/>)}
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
