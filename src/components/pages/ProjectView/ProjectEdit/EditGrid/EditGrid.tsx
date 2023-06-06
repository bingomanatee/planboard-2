import { useContext, useEffect } from 'react';
import { Box, Card, CardBody, CardFooter, CheckBox, Heading, ResponsiveContext, Spinner, TextInput } from 'grommet';
import styles from './EditGrid.module.scss';
import stateFactory, { GridStateValue } from './EditGrid.state.ts';
import useForest from '~/lib/useForest';
import { BoxColumn, BoxFlip } from '~/components/BoxVariants'
import PopupCardHeader from '~/components/Popup/PopupCardHeader'
import { pad } from '~/components/utils/constants'
import BackButton from '~/components/ActionButton/BackButton'
import GoButton from '~/components/ActionButton/GoButton'
import FormEntry from '~/components/FormEntry/FormEntry'
import useForestInput from '~/lib/useForestInput'
import { RgbaColorPicker } from "react-colorful";
import DrawGrid from '~/components/DrawGrid/DrawGrid'
import { ProjectViewStateContext, ProjectViewStateContextProvider } from '~/components/pages/ProjectView/ProjectView'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import { EditGridProps } from '~/components/pages/ProjectView/ProjectEdit/EditGrid/types'

function GridPreview (props: GridStateValue) {
  return(
    <Box fill="horizontal" height="250px">
      <DrawGrid {...props} />
    </Box>
  )
}

export default function EditGrid(props: EditGridProps) {
  const projectState = useContext<ProjectViewStateContextProvider>(ProjectViewStateContext);
  const {dataState} = useContext<DataStateContextValue>(DataStateContext);
  const [value, state] = useForest([stateFactory, props, dataState, projectState.value.projectId],
    (localState) => {
    localState.do.load();
    });
  const {gridColor, loaded} = value;
  const size = useContext(ResponsiveContext)

  const [resText, handleResField] = useForestInput(state, 'resText');
  const [active, handleActive] = useForestInput(state, 'active', { targetField: 'checked' });

  useEffect(() => state.do.setRes(resText), [resText, state])
  return (
    <BoxColumn fill align="center" justify="center">
      <Card margin="large" background="background-back" id="edit-frame"
            width={size === 'large' ? { max: '800px', min: '50vw' } : '100%'}
            className={styles.container}
      >
        <PopupCardHeader>
          <Heading justify="stretch" textAlign="center" color="text-reverse" level={2}>Edit Grid</Heading>
        </PopupCardHeader>
        <CardBody pad={pad} fill="horizontal">
          <BoxFlip direction="column">
            <BoxColumn basis="50%">
              {!loaded ? <Spinner /> : (
                <div>
                  <FormEntry label="Use Grid">
                    <CheckBox checked={active} onChange={handleActive}/>
                  </FormEntry>
                  <FormEntry label="Grid Resolution">
                    <TextInput type="number" name="resolution"
                               min={10}
                               value={resText} onChange={handleResField}/>
                  </FormEntry>
                </div>
              )}

            </BoxColumn>

            <BoxColumn basis="50%">
              <div>
                <Heading level={3}>Color</Heading>
                <RgbaColorPicker color={gridColor || {r: 0,g: 0, b: 0, a: 0.5}} onChange={(color) => state.do.set_gridColor(color)} />
                <GridPreview {...value} />
              </div>
            </BoxColumn>
          </BoxFlip>
        </CardBody>
        <CardFooter justify="between">
          <BackButton onClick={props.closeTrigger}>Cancel</BackButton>
          <GoButton onClick={() => state.do.commit()}>Update Grid</GoButton>
        </CardFooter>
      </Card>
    </BoxColumn>
  );
}

/**
 *             <Menu label="presets" items={[
 *               {
 *                 label: 'no grid',
 *                 onClick: () => state.do.setGrid(null)
 *               },
 *               [10, 12, 24, 25, 30, 36, 40, 48, 50].map((size) => ({
 *                 label: `${size}px`,
 *                 onClick: () => state.do.setGrid(size)
 *               }))
 *             ]} />
 */
