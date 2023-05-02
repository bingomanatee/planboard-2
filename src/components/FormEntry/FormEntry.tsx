import { useState, useEffect, ReactNode } from 'react';
import { Text, Box, Grid } from 'grommet';
import styles from './FormEntry.module.scss';
import stateFactory from './FormEntry.state.ts';
import useForest from '~/lib/useForest';
import { GenericProps } from '~/types'
import { BoxRow } from '~/components/BoxVariants'

type FormEntryProps = {
  label: string | ReactNode,
}

export default function FormEntry(props: FormEntryProps & GenericProps) {
  const [value, state] = useForest([stateFactory, props]);
  const { label } = props;

  return (<BoxRow fill="horizontal" className={styles.container} as="section" data-id="form-entry">
    <Grid areas={state.$.grid()} columns={['50px', 'flex']} rows={state.$.rows()} fill="horizontal">
      <Box pad="xsmall" gridArea="label">{typeof label === 'string' ? <Text>{label}</Text> : label}</Box>
      <Box pad="xsmall" gridArea="input">{props.children}</Box>
    </Grid>
  </BoxRow>);
}
