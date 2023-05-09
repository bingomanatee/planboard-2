import { Heading, TextArea, TextInput } from 'grommet';
import FormEntry from '~/components/FormEntry/FormEntry'
import useForestInput from '~/lib/useForestInput'
import { DataEditorProps } from '~/components/pages/ProjectView/ProjectEdit/EditFrame/types'
import TextCounter from '~/components/TextCounter/TextCounter'

const MAX_TEXT_LENGTH = 1000;
export default function MarkdownEditor(props: DataEditorProps) {

  const contentData = props.frameState.child('contentData');
  const [title, handleTitle] = useForestInput(contentData!, 'title')
  const [text, handleText] = useForestInput(contentData, 'text')
  return (<div>
    <Heading level={3}>Frame</Heading>
    <FormEntry label="Title">
      <TextInput name="title" value={title} onChange={handleTitle}/>
    </FormEntry>
    <FormEntry label="Text">
      <TextArea name="text" value={text} onChange={handleText} rows={8} maxLength={MAX_TEXT_LENGTH} />
      <TextCounter text={text} max={MAX_TEXT_LENGTH}/>
    </FormEntry>
  </div>);
}
