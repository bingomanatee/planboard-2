import { useState, useEffect } from 'react';
import { Text, Box, TextInput, Heading } from 'grommet';
import styles from './FrameEditor.module.scss';
import stateFactory from './FrameEditor.state.ts';
import useForest from '~/lib/useForest';
import FormEntry from '~/components/FormEntry/FormEntry'
import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Frame } from '~/types'
import useForestInput from '~/lib/useForestInput'
import { DataEditorProps } from '~/components/pages/ProjectView/ProjectEdit/EditFrame/types'

export default function FrameEditor(props: DataEditorProps) {

  const [name, handleName] = useForestInput(props.frameState, 'name')
  return (<div>
    <Heading level={3}>Frame</Heading>
    <FormEntry label="Frame name">
      <TextInput name="name" value={name} onChange={handleName}/>
    </FormEntry>
  </div>);
}
