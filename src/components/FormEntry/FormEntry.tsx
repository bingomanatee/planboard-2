import { ReactNode, useRef, useState } from 'react';
import { Box, Drop, Grid } from 'grommet';
import styles from './FormEntry.module.scss';
import stateFactory from './FormEntry.state.ts';
import useForest from '~/lib/useForest';
import { GenericProps } from '~/types'
import { BoxRow } from '~/components/BoxVariants'
import asText from '~/components/utils/asText'


type FormEntryProps = {
  label: string | ReactNode,
  tip?: string | ReactNode
}

function Tip({ children }: GenericProps) {
  const imageRef = useRef(null);
  const [hover, setHover] = useState(false);

  if (!children) {
    return null;
  }
  return (
    <>
      <img src="/img/icons/help.svg" ref={imageRef} alt="help-icon" width={20} height={20}
           onMouseOut={() => setHover(false)}
           onMouseOver={() => setHover(true)}/>
      {(imageRef.current && hover) ? <Drop align={{ left: 'left', top: 'bottom' }} target={imageRef.current}>
        <Box className={styles.drop} pad={{horizontal: 'small', vertical: '2px'}} width={{max: '50vw'}}>
          {asText(children)}
        </Box>
      </Drop> : null}
    </>
  )
}

export default function FormEntry(props: FormEntryProps & GenericProps) {
  const [_value, state] = useForest([stateFactory, props]); //@TODO: remove state in place of rows function
  const { label, tip } = props;

  return (<BoxRow fill="horizontal" className={styles.container} as="section" data-id="form-entry">
    <Grid areas={state.$.grid()} columns={['50px', 'flex']} rows={state.$.rows()} fill="horizontal">
      <BoxRow pad="xsmall" gridArea="label" gap="small">
        {tip ? <Tip>{tip}</Tip> : ''}
        {asText(label)}</BoxRow>
      <Box pad="xsmall" gridArea="input">{props.children}</Box>
    </Grid>
  </BoxRow>);
}
