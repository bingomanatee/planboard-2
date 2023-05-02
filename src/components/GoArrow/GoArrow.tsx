import { useState, useEffect } from 'react';
import { Text, Box, Button, Stack } from 'grommet';
import styles from './GoArrow.module.scss';
import stateFactory from './GoArrow.state.ts';
import useForest from '~/lib/useForest';
import { GenericProps, triggerFn } from '~/types'
import Img from '~/components/Img'
import { BoxRow } from '~/components/BoxVariants'

type GoArrowProps = { onClick: triggerFn } & GenericProps

export default function GoArrow(props: GoArrowProps) {
  const [state, value] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;
  const { children, onClick } = props;

  return (
    <Button plain className={styles.container} onClick={onClick}>
      <div className={styles['arrow-container']}>
        <Img src="/img/icons/go-arrow.svg" width={96} height={20}/>
      </div>
      <div className={styles['arrow-blur']} data-type="arrow-blur">
        &nbsp;
      </div>
      <BoxRow justify="end" align="center" className={styles['label']}>
        {typeof children === 'string' ? <Text size="medium" weight="bold">{children}</Text> : children}
      </BoxRow>
    </Button>);
}
