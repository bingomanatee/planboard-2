import { Suspense, useContext } from 'react';
import { Text, Box, Card, Heading, CardBody, TextInput, CardFooter, ResponsiveContext, Spinner } from 'grommet';
import styles from './EditFrame.module.scss';
import stateFactory from './EditFrame.state.ts';
import useForest from '~/lib/useForest';
import { BoxColumn } from '~/components/BoxVariants'
import PopupCardHeader from '~/components/Popup/PopupCardHeader'
import FormEntry from '~/components/FormEntry/FormEntry'
import BackButton from '~/components/ActionButton/BackButton'
import GoButton from '~/components/ActionButton/GoButton'
import { pad } from '~/components/utils/constants'
import Note from '~/components/Note'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import FrameEditor from '~/components/pages/ProjectView/ProjectEdit/EditFrame/FrameEditor/FrameEditor'
import DeleteButton from '~/components/ActionButton/DeelteButton'
import dynamic from 'next/dynamic'
import { ProjectViewStateContext } from '~/components/pages/ProjectView/ProjectView'
import { triggerFn } from '~/types'

type EditFrameProps = { id: string, onCancel: triggerFn }

const DataEditor = new Map();

export default function EditFrame(props: EditFrameProps) {
  const { dataState } = useContext<DataStateContextValue>(DataStateContext)
  const projectState = useContext(ProjectViewStateContext);
  const [value, state] = useForest([stateFactory, dataState, props.onCancel],
    (localState) => {
      localState.do.load(props.id);
    });

  const { content } = value;
  const size = useContext(ResponsiveContext)

  let DataEditorComponent = null;
  switch (content.type) {
    case 'markdown':
      if (!DataEditor.has('markdown')) {
        DataEditor.set('markdown', dynamic(() => import ( './MarkdownEditor/MarkdownEditor'), {
          suspense: true
        }))
      }
      DataEditorComponent = DataEditor.get('markdown');
      break;

    case 'image':
      if (!DataEditor.has('image')) {
        DataEditor.set('image', dynamic(() => import ( './ImageEditor/ImageEditor'), {
          suspense: true
        }))
      }
      DataEditorComponent = DataEditor.get('image');
      break;
  }

  return (
    <BoxColumn fill align="center" justify="center">
      <Card margin="large" background="background-back" id="edit-frame"
            width={size === 'large' ? { max: '800px', min: '50vw' } : '100%'}
            className={styles.container}
      >
        <Note>frame {props.id}</Note>
        <PopupCardHeader>
          <Heading justify="stretch" textAlign="center" color="text-reverse" level={2}>Edit Frame</Heading>
        </PopupCardHeader>
        <CardBody pad={pad} fill="horizontal">
          <FrameEditor frameState={state.child('frame')!}/>
          {
            DataEditorComponent && state.child('contentData') ? (
              <Suspense fallback={<Spinner />}>
                <DataEditorComponent frameState={state} />
            </Suspense>) : null
          }
        </CardBody>
        <CardFooter justify="between">
          <BackButton onClick={state.do.cancel}>Cancel</BackButton>
          <DeleteButton layout="square" onClick={state.do.cancel}>Delete Frame</DeleteButton>
          <GoButton onClick={state.do.commit}>Update Frame</GoButton>
        </CardFooter>
      </Card>
    </BoxColumn>);
}
