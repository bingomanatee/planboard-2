import { useState, useEffect } from 'react';
import { Text, Box, Button, Stack } from 'grommet';
import styles from './GoArrow.module.scss';
import useForest from '~/lib/useForest';
import { GenericProps, triggerFn } from '~/types'
import Img from '~/components/Img'
import { BoxRow } from '~/components/BoxVariants'

type GoArrowProps = { onClick: triggerFn } & GenericProps

export default function GoArrow(props: GoArrowProps) {
  const { children, onClick } = props;

  return (
    <Button focusIndicator={false}  plain className={styles.container} onClick={onClick}>
      <div className={styles['arrow-container']}>
        <Img src="/img/icons/go-arrow.svg" width={24} height={24}/>
      </div>
      <div className={styles['arrow-blur']} data-type="arrow-blur">
        &nbsp;
      </div>
      <BoxRow justify="end" align="center" className={styles['label']}>
        {typeof children === 'string' ? <Text size="medium" weight="bold">{children}</Text> : children}
      </BoxRow>
    </Button>);
}