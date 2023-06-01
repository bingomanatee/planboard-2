import { Button, CheckBox, FileInput, Heading, Text } from 'grommet';
import { DataEditorProps } from '~/components/pages/ProjectView/ProjectEdit/EditFrame/types'
import { useRef } from 'react'
import FormEntry from '~/components/FormEntry/FormEntry'
import styles from './ImageEditor.module.scss';
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import Info from '~/components/Info'
import useForestFiltered from '~/lib/useForestFiltered'
import useForestInput from '~/lib/useForestInput'
import useForest from '~/lib/useForest'
import stateFactory from './ImageEditor.state'
import CropScale from '~/components/pages/ProjectView/ProjectEdit/EditFrame/ImageEditor/CropScale/CropScale'

export default function ImageEditor(props: DataEditorProps) {
  const { frameState } = props;
  const displayImage = useRef(null);
  const contentData = frameState.child('contentData')!;
  contentData.setMeta('displayImage', displayImage, true);

  const { saved, width, height } = useForestFiltered(contentData, ['saved', 'width', 'height']);
  const [value, state] = useForest([stateFactory, frameState]);
  const { editImage} = value;
  const [syncSize, handleSyncSize] = useForestInput(contentData, 'syncSize', { targetField: 'checked' })

  console.log('frameState value: ', frameState.value)
  const { id, project_id, uploaded} = frameState.value.contentData;
  if (editImage) {
    return <CropScale id={id} projectId={project_id} contentDataState={contentData} imageId={frameState.value.image?.id} />
  }

  return (
    <div className={styles.container}>
      <Heading level={3}>Image</Heading>
      {uploaded || saved ? (<BoxRow fill="horizontal" justify="center" gap="large">
            <Button onClick={contentData.do.reUpload} plain={false}>Re-upload image</Button>

            <Button onClick={() => state.do.set_editImage(true)} plain={false}>Crop/Scale image</Button>
          </BoxRow>
        )
        : (
          <FormEntry label="File Upload">
            <div className={styles['image-upload-frame']}>
              <FileInput name="imageFile" onChange={contentData.do.onFileChange}/>
            </div>
          </FormEntry>
        )}

      <BoxColumn align="center"
                 margin="small"
                 style={{ display: (uploaded || saved) ? 'flex' : 'none' }}
      >
        <Info>
          <span>Extension: <b>{contentData.$.extension() || '--'}</b></span>
          <span>Content Type: <b>{contentData.$.contentType() || '--'}</b></span>
          <span>size: <b>{width} wide x {height} high</b></span>
        </Info>
        {width && height ? (
          <FormEntry label="Sync Image Size and Frame Size" tip={
            <ul>
              <li><Text>re-sizes the frame to the image dimensions.</Text></li>
              <li><Text>Requires an image with at greater than 10 x 10 pixels size,
                or the frame will not be re-sized.</Text>
              </li>
            </ul>
          }>
            <CheckBox label={<Text>Use the image dimensions as the frame size</Text>} value={syncSize}
                      onChange={handleSyncSize}/>
          </FormEntry>
        ) : null}
        <div className={styles['image-frame']}>
          <img ref={displayImage} alt="display image" id="image-editor-display-image"
               style={contentData.$.imageStyle()}/>
        </div>
      </BoxColumn>
    </div>
  );
}
