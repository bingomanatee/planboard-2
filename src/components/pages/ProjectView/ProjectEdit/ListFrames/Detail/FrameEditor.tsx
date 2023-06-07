import FormEntry from '~/components/FormEntry/FormEntry'
import { Grid, Select, Text, TextInput } from 'grommet'
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import useForestInput from '~/lib/useForestInput'
import { numField, toString } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/Detail/types'
import { linkModeOptions } from '~/types'

const POSITION_GRID_AREAS = [
  { name: 'top-label', start: [0, 0], end: [0, 0] },
  { name: 'top-input', start: [1, 0], end: [1, 0] },
  { name: 'left-label', start: [2, 0], end: [2, 0] },
  { name: 'left-input', start: [3, 0], end: [3, 0] },
  { name: 'width-label', start: [0, 1], end: [0, 1] },
  { name: 'width-input', start: [1, 1], end: [1, 1] },
  { name: 'height-label', start: [2, 1], end: [2, 1] },
  { name: 'height-input', start: [3, 1], end: [3, 1] },
];

const POSITION_GRID_COLUMNS = ['1fr', 'minmax(auto, 9em)', '1fr', 'minmax(auto, 9em)'];
const POSITION_GRID_ROWS = ['auto', 'auto'];
export default function FrameEditor({frameState}) {

  const [name, handleName] = useForestInput(frameState, 'name', {
    filter: toString,
    inFilter: toString
  });
  const [left, handleLeft] = useForestInput(frameState, 'left', numField);
  const [top, handleTop] = useForestInput(frameState, 'top', numField);
  const [height, handleHeight] = useForestInput(frameState, 'height', numField);
  const [width, handleWidth] = useForestInput(frameState, 'width', numField);

  const [mode, handleMode] = useForestInput(frameState.child('style')!, 'mode');
  return (
      <BoxColumn>
        <FormEntry label="Name">
          <TextInput value={name} onChange={handleName}/>
        </FormEntry>
        <FormEntry label="Position">
          <Grid areas={POSITION_GRID_AREAS} rows={POSITION_GRID_ROWS} columns={POSITION_GRID_COLUMNS}>
            <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                    align="center"
                    gridArea="left-label">
              <Text>left</Text>
            </BoxRow>
            <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                    align="center"
                    gridArea="left-input">
              <TextInput type="number"
                         value={left} onChange={handleLeft}/>
            </BoxRow>

            <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                    align="center"
                    gridArea="top-label">
              <Text>Top</Text>
            </BoxRow>
            <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                    align="center"
                    gridArea="top-input">
              <TextInput type="number"
                         value={top} onChange={handleTop}/>
            </BoxRow>

            <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                    align="center"
                    gridArea="width-label">
              <Text>Width</Text>
            </BoxRow>
            <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                    align="center"
                    gridArea="width-input">
              <TextInput type="number"
                         value={width} onChange={handleWidth}/>
            </BoxRow>

            <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                    align="center"
                    gridArea="top-input">
              <TextInput type="number"
                         value={top} onChange={handleTop}/>
            </BoxRow>

            <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                    align="center"
                    gridArea="height-label">
              <Text>Height</Text>
            </BoxRow>

            <BoxRow pad={{ horizontal: 'small', vertical: 'xsmall' }}
                    align="center"
                    gridArea="height-input">
              <TextInput type="number"
                         value={height} onChange={handleHeight}/>
            </BoxRow>
          </Grid>
        </FormEntry>
        <FormEntry label="Link Attachment Mode">
          <Select value={mode || 'straight'} options={linkModeOptions}
          onChange={handleMode}
          />
        </FormEntry>
      </BoxColumn>
    )

}
