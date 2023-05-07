import { useState, useEffect } from 'react';
import { Text, Box } from 'grommet';
import styles from './Image.module.scss';
import stateFactory from './Image.state.ts';
import useForest from '~/lib/useForest';

type ImageProps = {}

export default function ImageContent(props: ImageProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;

  return (<div className={styles.container}>

  </div>);
}
