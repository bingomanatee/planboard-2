import { useState, useEffect, useContext, useRef } from 'react';
import { Text, Box } from 'grommet';
import styles from './FrameLinks.module.scss';
import stateFactory from './FrameLinks.state.ts';
import useForest from '~/lib/useForest';
import { ProjectViewStateContext, ProjectViewStateContextProvider } from '~/components/pages/ProjectView/ProjectView'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import { extent } from '~/lib/utils'
import { SVG } from '@svgdotjs/svg.js'

type FrameLinksProps = {}

export default function FrameLinks(props: FrameLinksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const projectState = useContext<ProjectViewStateContextProvider>(ProjectViewStateContext);
  const { dataState } = useContext<DataStateContextValue>(DataStateContext)

  const [value, state] = useForest([
      stateFactory,
      props,
      projectState,
      dataState,
      containerRef
    ],
    (localState) => {
      const sub = dataState.child('links')!
        .subscribe((links) => localState.set('links', links));
      const subFrames = dataState.child('frames')!
        .subscribe((frames) => localState.set('frames', frames))
      return () => {
        sub.unsubscribe();
        subFrames.unsubscribe();
      };
    });

  useEffect(() => {

    try {
      state.$.renderLinks();
    } catch (err) {
      console.log('svg error:', err);
    }
  }, [value.links, state.$])


  return (<div className={styles.container} ref={containerRef}>
  </div>);
}
