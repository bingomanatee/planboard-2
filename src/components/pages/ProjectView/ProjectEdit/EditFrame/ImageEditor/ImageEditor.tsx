import { FileInput, Heading, TextArea, TextInput } from 'grommet';
import { DataEditorProps } from '~/components/pages/ProjectView/ProjectEdit/EditFrame/types'
import { useRef } from 'react'
import FormEntry from '~/components/FormEntry/FormEntry'
import styles from './ImageEditor.module.scss';
import { BoxColumn } from '~/components/BoxVariants'

export default function ImageEditor(props: DataEditorProps) {
  const { frameState } = props;
  const displayImage = useRef(null);
  const contentData = frameState.child('contentData')!;
  contentData.setMeta('displayImage', displayImage, true);
  return (
    <div className={styles.container}>
      <Heading level={3}>Image</Heading>
      <FormEntry label="File Upload">
        <div className={styles['image-upload-frame']}>
          <FileInput name="imageFile" onChange={contentData.do.onFileChange}/>
        </div>
      </FormEntry>
      <BoxColumn align="center" margein="small" style={styles.imageFrame}>
        <img ref={displayImage} alt="display image"/>
      </BoxColumn>
    </div>
  );
}
