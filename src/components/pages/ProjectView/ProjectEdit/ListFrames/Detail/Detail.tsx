import { useContext, useEffect, useMemo } from 'react';
import { Button, DataTable, Grid, Header, Heading, Spinner, Text, TextInput } from 'grommet';
import styles from './Detail.module.scss';
import stateFactory from './Detail.state.ts';
import useForest from '~/lib/useForest';
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import FormEntry from '~/components/FormEntry/FormEntry'
import useForestInput from '~/lib/useForestInput'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import Tabs from '~/components/Tabs/Tabs'
import { DetailProps, numField, toString } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/Detail/types'
import { LinkDetail } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/Detail/LinkDetail'
import DetailHeader from '~/components/pages/ProjectView/ProjectEdit/ListFrames/Detail/DetailHeader'
import FrameEditor from '~/components/pages/ProjectView/ProjectEdit/ListFrames/Detail/FrameEditor'

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

export default function Detail(props: DetailProps) {
  const { selected, state: lfState } = props;
  const { dataState } = useContext<DataStateContextValue>(DataStateContext);

  const [value, state] = useForest([stateFactory, dataState, lfState],
    (localState) => {
      const sub = localState.do.watch();
      return () => {
        sub.unsubscribe();
      }
    });

  useEffect(() => {
    state?.do.load(selected);
  }, [selected, state])

  const { frame, content, loaded, links, currentLink } = value;
  const { mode } = lfState.value;

  const frameState = state.child('frame')!;

  const linksLabel = useMemo(() => {
    if (!links) {
      return 'Links';
    }

    return <Text>Links&nbsp;(&nbsp;<span className={styles.count}>{links.length}</span>&nbsp;)</Text>
  }, [links, selected])

  // loaded is null if there is nothing to load (!selected);
  // false if it is loading;
  // true after it loads;
  if (!loaded) {
    return <BoxColumn pad={{ horizontal: 'medium', vertical: 'small' }}>
      {loaded === false ? <Spinner/> : ''}
    </BoxColumn>
  }

  return <BoxColumn pad={{ horizontal: 'medium', vertical: 'small' }}>
    <DetailHeader  content={content} frame={frame} mode={mode} props={props}/>
    <Tabs headers={['Frame', linksLabel]} onChange={state.do.onFrameDetailChange}>
      <FrameEditor frameState={frameState} />
      <BoxColumn>
        <Heading level={3} textAlign="center"
                 weight="bold">Links</Heading>
        {links?.map((link) => {
          if (!(link && (typeof link === 'object'))) {
            return '---';
          }
          return (
            <LinkDetail key={link.id} {...link}
                        selected={selected}
                        currentLink={currentLink}
                        frames={lfState.value.frames}
                        onClick={(e) => state.do.handleLinkClick(e, link)}/>
          )
        })}
      </BoxColumn>
    </Tabs>
  </BoxColumn>
}
/**
 *     <DataTable data={links} columns={[{ property: 'id', header: 'id' },
 *           { property: 'from_frame_id', header: 'from' },
 *           { property: 'to_frame_id', header: 'to' }
 *         ]}/>
 */
