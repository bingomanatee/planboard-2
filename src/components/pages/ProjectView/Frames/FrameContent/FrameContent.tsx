import { useState, useEffect } from 'react';
import { Text, Box } from 'grommet';
import styles from './FrameContent.module.scss';
import stateFactory from './FrameContent.state.ts';
import useForest from '~/lib/useForest';

type FrameContentProps = {}

export default function FrameContent(props: FrameContentProps) {
  const [state, value] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;

  return (<div className={styles.container}>

  </div>);
}
