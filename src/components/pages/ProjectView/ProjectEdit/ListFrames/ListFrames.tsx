import { useContext, useMemo } from 'react';
import { Card, CardBody, Grid, Heading, Paragraph, Text } from 'grommet';
import styles from './ListFrames.module.scss';
import stateFactory from './ListFrames.state.ts';
import useForest from '~/lib/useForest';
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import PopupCardHeader from '~/components/Popup/PopupCardHeader'
import { pad } from '~/components/utils/constants'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import Detail from '~/components/pages/ProjectView/ProjectEdit/ListFrames/Detail/Detail'
import { FrameItem } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/FrameItem'
import { FrameInfo } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/types'
import { Button } from 'grommet/es6'
import ButtonRow from '~/components/ButtonRow'
import { Link } from '~/types'

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

  const { selected, frames, lockSelected, mode } = value;

  const activeFrames = useMemo(() => {
    if (mode === 'links' && selected) {
      return frames.filter((fd: FrameInfo) => {
        if (fd.id === selected) {
          return true;
        }
        return fd.links.find((link: Link) => link.from_frame_id === selected || link.to_frame_id === selected)
      })
    }
    return frames;
  }, [frames, mode, selected])

  return (
    <BoxColumn fill align="center" justify="center" pad="large">
      <Card background="background-back" id="edit-frame"
            width="100%"
            fill
      >
        <PopupCardHeader>
          <Heading justify="stretch" textAlign="center" color="text-reverse" level={2}>
            Frames</Heading>
        </PopupCardHeader>
        <CardBody pad={pad} fill>
          <Grid areas={GRID_AREAS} rows={GRID_ROWS} columns={GRID_COLUMNS} fill>
            <BoxRow pad="small" gridArea="header"><Paragraph>
              All the frames in your diagram. You can change the order of frames here
              by clicking on the buttons on the headers. Roll the mouse button over a frame to scan its properties.
              Click it to &quot;Lock&quot; and edit that frame.
              {lockSelected ? <b>Click the frame again to unlock it</b> : ' Click it again to unlock frame.'}
            </Paragraph></BoxRow>
            <BoxColumn
              overflow={{ vertical: 'scroll' }}
              className={selected ? styles['locked-frame'] : ''}
              gridArea="list">
              {activeFrames.map(frameInfo => <FrameItem state={state} selected={selected} lock={lockSelected}
                                                        key={frameInfo.id} frameInfo={frameInfo}/>)}

              <ButtonRow>
                {mode === 'standard' ? '' : (<Button plain={false} onClick={state.do.viewAll}>
                  View All Frames
                </Button>)
                }
                {!lockSelected ? '' : <Button plain={false} onClick={state.do.unlock}>Unlock Frame</Button>}
              </ButtonRow>

            </BoxColumn>
            <BoxColumn border={border} gridArea="detail">
              {selected ? <Detail state={state} selected={selected}/> : null}
            </BoxColumn>
          </Grid>
        </CardBody>
      </Card>
    </BoxColumn>
  );
}
