import { leafI } from '@wonderlandlabs/forest/lib/types'
import { useContext } from 'react'
import { PopupContext } from '~/components/Popup/Popup'
import { DataStateContext } from '~/components/GlobalState/GlobalState'
import useForest from '~/lib/useForest'
import useForestInput from '~/lib/useForestInput'
import { Card, CardBody, CardFooter, Heading, ResponsiveContext, TextInput } from 'grommet'
import { BoxColumn } from '~/components/BoxVariants'
import styles from '~/components/Popup/Popup.module.scss'
import PopupCardHeader from '~/components/Popup/PopupCardHeader'
import FormEntry from '~/components/FormEntry/FormEntry'
import GoButton from '~/components/ActionButton/GoButton'
import BackButton from '~/components/ActionButton/BackButton'
import { pad } from '~/components/utils/constants'

function createProjectState(dataState, popupState) {
  return {
    $value: {
      name: '',
      saving: false,
    },
    actions: {
      cancel() {
        popupState.do.hideModal();
      },
      commit(leaf: leafI) {
        leaf.do.set_saving(true);
        leaf.do.save();
      },
      async save(leaf: leafI) {
        const user_id = dataState.$.userId();
        const project = { name: leaf.value.name, user_id };
        const projects = dataState.child('projects');
        const projectRecord = await projects.do.add(project);
        console.log('saving project', projectRecord);
        await projects.do.save(projectRecord.id);
        popupState.do.hideModal();
        leaf.do.set_saving(false);
      }
    }
  }
}

export function CreateProjectModal() {
  const { popupState, popupValue } = useContext(PopupContext);
  const { dataState } = useContext(DataStateContext);
  const [value, state] = useForest([createProjectState, dataState, popupState]);

  const [name, handleName] = useForestInput(state, 'name');
  const size = useContext(ResponsiveContext);
  return (
    <BoxColumn fill align="center" justify="center">
      <Card margin="large" background="background-back"
            width={size === 'large' ? { max: '800px', min: '50vw' } : '100%'}
            className={styles.popupCard}
      >
        <PopupCardHeader>
          <Heading justify="stretch" textAlign="center" color="text-reverse" level={2}>Create Project_id</Heading>
        </PopupCardHeader>
        <CardBody pad={pad} fill="horizontal">
          <FormEntry label="Project_id Name">
            <TextInput name="name" value={name} onChange={handleName}/>
          </FormEntry>
        </CardBody>
        <CardFooter justify="between">
          <BackButton onClick={state.do.cancel}>Cancel</BackButton>
          <GoButton onClick={state.do.commit}>Create Project</GoButton>
        </CardFooter>
      </Card>
    </BoxColumn>
  )
}
