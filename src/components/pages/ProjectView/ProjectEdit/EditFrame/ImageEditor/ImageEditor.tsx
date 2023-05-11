import { Button, CheckBox, FileInput, Heading, TextArea, TextInput } from 'grommet';
import { DataEditorProps } from '~/components/pages/ProjectView/ProjectEdit/EditFrame/types'
import { useRef } from 'react'
import FormEntry from '~/components/FormEntry/FormEntry'
import styles from './ImageEditor.module.scss';
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import Note from '~/components/Note'
import Info from '~/components/Info'
import useForestFiltered from '~/lib/useForestFiltered'
import useForestInput from '~/lib/useForestInput'

export default function ImageEditor(props: DataEditorProps) {
  const { frameState } = props;
  const displayImage = useRef(null);
  const contentData = frameState.child('contentData')!;
  contentData.setMeta('displayImage', displayImage, true);

  const { saved, width, height } = useForestFiltered(contentData, ['saved', 'width', 'height']);

  const [syncSize, handleSyncSize] = useForestInput(contentData, 'syncSize', { targetField: 'checked' })

  return (
    <div className={styles.container}>
      <Heading level={3}>Image</Heading>
      {saved ? (<BoxRow fill="horizontal" justify="center">
        <Button onClick={contentData.do.reUpload} plain={false}>Re-upload image</Button>
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
                 style={{ display: saved ? 'flex' : 'none' }}
      >
        <Info>
          <span>Extension: <b>{contentData.$.extension() || '--'}</b></span>
          <span>Content Type: <b>{contentData.$.contentType() || '--'}</b></span>
          <span>size: <b>{width} wide x {height} high</b></span>
        </Info>
        {width && height ? (
          <FormEntry label="Sync Image Size and Frame Size">
            <CheckBox label="Use the image's dimenstions as the frame dimensions" value={syncSize} onChange={handleSyncSize} />
          </FormEntry>
        ) : null}
        <div className={styles['image-frame']}>
          <img ref={displayImage} alt="display image"
               style={saved ? { backgroundSize: 'contain', height: '200px' } : null}/>
        </div>
      </BoxColumn>
    </div>
  );
}
