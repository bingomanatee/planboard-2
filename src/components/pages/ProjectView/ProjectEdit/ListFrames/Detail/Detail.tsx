import { useEffect, useContext } from 'react';
import { Text, Header, Button, TextInput, Grid, Spinner } from 'grommet';
import styles from './Detail.module.scss';
import stateFactory from './Detail.state.ts';
import useForest from '~/lib/useForest';
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import MoveButtonUp from '~/components/MoveButtonUp'
import MoveButtonDown from '~/components/MoveButtonDown'
import FormEntry from '~/components/FormEntry/FormEntry'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestInput from '~/lib/useForestInput'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'

type DetailProps = { state: leafI, selected: string }

const POSITION_GRID_AREAS = [
  { name: 'top-label', start: [0, 0], end: [0, 0] },
  { name: 'top-input', start: [1, 0], end: [1, 0] },
  { name: 'left-label', start: [2, 0], end: [2, 0] },
  { name: 'left-input', start: [3, 0], end: [3, 0] },
  { name: 'width-label', start: [0, 1], end: [0, 1] },
  { name: 'width-input', start: [1, 1], end: [1, 1] },
  { name: 'height-label', start: [2, 1], end: [2, 1] },
  { name: 'height-input', start: [3, 1], end: [3, 1] },
];

const POSITION_GRID_COLUMNS = ['1fr', 'minmax(auto, 9em)', '1fr', 'minmax(auto, 9em)'];
const POSITION_GRID_ROWS = ['auto', 'auto'];

const numField = {
  filter(n) {
    return n || 0
  }
}
const toString = (name) => {
  return typeof name === 'string' ? name : '';
};

export default function Detail(props: DetailProps) {
  const { selected } = props;
  const { dataState } = useContext<DataStateContextValue>(DataStateContext)

  const [value, state] = useForest([stateFactory, dataState],
    (localState) => {
      console.log('watching', selected, localState.value);
      const sub = localState.do.watch();
      return () => {
        console.log('not watching ', selected, localState.value);
        sub.unsubscribe();
      }
    });

  useEffect(() => {
    console.log('loading', selected);
    state.do.load(selected);
  }, [selected, state])

  const { frame, content, loaded } = value;

  const frameState = state.child('frame')!;
  const [name, handleName] = useForestInput(frameState, 'name', {
    filter: toString,
    inFilter: toString
  });
  const [left, handleLeft] = useForestInput(frameState, 'left', numField);
  const [top, handleTop] = useForestInput(frameState, 'top', numField);
  const [height, handleHeight] = useForestInput(frameState, 'height', numField);
  const [width, handleWidth] = useForestInput(frameState, 'width', numField);

  // loaded is null if there is nothing to load (!selected);
  // false if it is loading;
  // true after it loads;
  if (!loaded) {
    return <BoxColumn pad={{ horizontal: 'medium', vertical: 'small' }}>
      {loaded === false ? <Spinner/> : ''}
    </BoxColumn>
  }

  return <BoxColumn pad={{ horizontal: 'medium', vertical: 'small' }}>
    <Header>
      <BoxRow gap="small" className={styles['move-button']}>
        <Button plain onClick={props.state.do.moveTop}>
          <MoveButtonUp top/>
        </Button>
        <Button plain onClick={props.state.do.moveUp}>
          <MoveButtonUp/>
        </Button>
      </BoxRow>
      <BoxColumn fill="horizontal" className={styles['detail-head']}>
        <Text size="large" as="div" textAlign="center"
              weight="bold">{frame.name}{(frame.name && content?.type) ? ': ' : ''}{content?.type || '(no content)'}</Text>
        <Text weight="bold" as="div" textAlign="center"
              size="large"
        >{frame.id}</Text>
        <span className={styles.order}>
          <Text size="small">
            {frame.order}</Text>
          </span>
      </BoxColumn>
      <BoxRow gap="small" plain className={styles['move-button']}>
        <Button plain onClick={props.state.do.moveDown}>
          <MoveButtonDown/>
        </Button>
        <Button plain onClick={props.state.do.moveBottom}>
          <MoveButtonDown bottom/>
        </Button>
      </BoxRow>
    </Header>
    <BoxColumn>
      <FormEntry label="Name">
        <TextInput value={name} onChange={handleName}/>
      </FormEntry>
      <FormEntry label="Position">
        <Grid areas={POSITION_GRID_AREAS} rows={POSITION_GRID_ROWS} columns={POSITION_GRID_COLUMNS}>
          <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                  align="center"
                  gridArea="left-label">
            <Text>left</Text>
          </BoxRow>
          <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                  align="center"
                  gridArea="left-input">
            <TextInput type="number"
                       value={left} onChange={handleLeft}/>
          </BoxRow>

          <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                  align="center"
                  gridArea="top-label">
            <Text>Top</Text>
          </BoxRow>
          <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                  align="center"
                  gridArea="top-input">
            <TextInput type="number"
                       value={top} onChange={handleTop}/>
          </BoxRow>

          <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                  align="center"
                  gridArea="width-label">
            <Text>Width</Text>
          </BoxRow>
          <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                  align="center"
                  gridArea="width-input">
            <TextInput type="number"
                       value={width} onChange={handleWidth}/>
          </BoxRow>

          <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                  align="center"
                  gridArea="top-input">
            <TextInput type="number"
                       value={top} onChange={handleTop}/>
          </BoxRow>

          <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                  align="center"
                  gridArea="height-label">
            <Text>Height</Text>
          </BoxRow>

          <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                  align="center"
                  gridArea="height-input">
            <TextInput type="number"
                       value={height} onChange={handleHeight}/>
          </BoxRow>
        </Grid>
      </FormEntry>
    </BoxColumn>
    <div>
      TODO: links
    </div>
  </BoxColumn>
}
