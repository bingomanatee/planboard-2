import { useState, useEffect, useMemo } from 'react';
import { Text, Box } from 'grommet';
import styles from './TextCounter.module.scss';
import stateFactory from './TextCounter.state.ts';
import useForest from '~/lib/useForest';

type TextCounterProps = {text: string | number, max: number }

export default function TextCounter(props: TextCounterProps) {
  const {text, max} = props;

  const textLength = useMemo(() => {
    if (typeof text === 'string') return text.length;
    if (typeof text === 'number') return text;
    return 0;
  }, [props.text]);

  const ratio = textLength / max;

  const color = useMemo(() => {
    if(ratio < 0.8) {
      return 'status-info';
    }
    if (ratio <= 1) {
      return 'status-warning';
    }
    if (ratio > 1) {
      return 'status-danger';
    }
  }, [ratio]);
  if (max <= 0) return null;
  return (<div className={styles.container}>
    <Text size="xsmall" textAlign="center" color={color}>
      {textLength}/{max} chars. {ratio > 1 ? <b>TOO LONG</b> : ''}
    </Text>
  </div>);
}
