import { useState, useEffect, useContext } from 'react';
import { Text, Box, Heading, TextInput } from 'grommet';
import styles from './EditLink.module.scss';
import stateFactory from './EditLink.state.ts';
import useForest from '~/lib/useForest';
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import { BoxColumn, BoxFlip, BoxRow } from '~/components/BoxVariants'
import FormEntry from '~/components/FormEntry/FormEntry'
import useForestInput from '~/lib/useForestInput'
import { RgbaColorPicker } from 'react-colorful'

type EditLinkProps = {
  id: string
}

function EditLinkPoint({ store, heading }) {
  const [label, handleLabel] = useForestInput(store, 'label');
  return (
    <BoxColumn basis="50%">
      <Heading textAlign="center" level={4} pad={0}>{heading}</Heading>
      <FormEntry label="label">
        <TextInput name="label" size="medium" value={label} onChange={handleLabel}/>
      </FormEntry>
    </BoxColumn>
  )
}

export default function EditLink(props: EditLinkProps) {
  const { dataState } = useContext<DataStateContextValue>(DataStateContext)

  const [value, state] = useForest([stateFactory, props, dataState],
    (localState) => {
    });

  const { style: linkStyle } = value;

  const [label, handleLabel] = useForestInput(state, 'label');
  const [width, handleWidth] = useForestInput(state.child('style')!, 'width')
  return (<div className={styles.container}>
    <FormEntry label="label">
      <TextInput name="label" size="medium" value={label} onChange={handleLabel}/>
    </FormEntry>
    <Heading level={4}>Stroke</Heading>
    <BoxFlip direction="column" fill="horizontal">
      <FormEntry label="Width" basis="33%">
        <TextInput type="number" min={0} step={1} value={width} update={handleWidth}/>
      </FormEntry>
      <FormEntry label="Color">
        <RgbaColorPicker color={linkStyle.color || { r: 0, g: 0, b: 0, a: 0.5 }}
                         onChange={(color) => state.child('style')!.do.set_color(color)}
        />
      </FormEntry>
    </BoxFlip>
    <Heading textAlign="center" level={3}>Link Ends</Heading>
    <BoxRow fill="horizontal">
      <EditLinkPoint heading="From Anchor" store={state.child('from_detail')!}/>
      <EditLinkPoint heading="to Anchor" store={state.child('to_detail')!}/>
    </BoxRow>

  </div>);
}
