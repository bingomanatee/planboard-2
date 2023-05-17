import { Text, Box, Layer, Spinner, Paragraph, Markdown } from 'grommet';
import Popup from '~/components/Popup/Popup'
import helpText from '~/components/utils/helpText.json'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestFiltered from '~/lib/useForestFiltered'
import styles from './LoadStatePrompt.module.scss';
import { Suspense, useContext } from 'react';
import { ProjectViewStateContext, ProjectViewStateContextProvider } from '~/components/pages/ProjectView/ProjectView'
import MessageModal from '~/components/utils/MessageModal'

type LoadStatePromptProps = { state: leafI }

function FooterPrompt({ children }) {
  return <Box pad={{ horizontal: 'small', vertical: 'medium' }}
              background="nav-background"
              className={styles.footerPrompt}>
    <Text size="small">{children}</Text>
  </Box>
}

export default function LoadStatePrompt({ state }: LoadStatePromptProps) {
  const projectState = useContext<ProjectViewStateContextProvider>(ProjectViewStateContext);

  const { mouseMode, moveItem } = useForestFiltered(projectState, ['mouseMode', 'moveItem']);

  const { loadState, keyData } = useForestFiltered(state, ['keyData', 'loadState']);

  if (loadState === 'error') {
    return (
      <Popup>
        <Suspense fallback={<Spinner/>}>
          <MessageModal heading={'Error Loading Project'}>
            <Paragraph>
              {`There was an error loading project ${state.getMeta('id')}":`}
            </Paragraph>
            <code>
              {state.value.loadError?.message || ''}
            </code>
          </MessageModal>
        </Suspense>
      </Popup>
    )
  }

  if (loadState === 'loaded') {
    if (!state.value.frames.length) {
      return (
        <Popup observer={(showing) => {
          if (!showing) {
            state.do.set_loadState('finished');
          }
        }}>
          <Suspense fallback={<Spinner/>}>
            <MessageModal heading="Loaded Project" cancelLabel="Proceed">
              <article>
                <Markdown>
                  {helpText.startProjectText}
                </Markdown>
              </article>
            </MessageModal>
          </Suspense>
        </Popup>
      )
    }
  }

  if (keyData) {
    switch (keyData.key) {
      case  'f':
        return (<FooterPrompt>
          Mouse drag to create a Frame
        </FooterPrompt>)
        break;
      case  ' ':
        return (<FooterPrompt>
          Mouse drag to move the diagram
        </FooterPrompt>)
        break;
    }
  }

  switch (mouseMode) {
    case 'moving-item':
      return <FooterPrompt>
        Moving&nbsp;{moveItem?.type}&nbsp;{moveItem?.id}
      </FooterPrompt>
      break;

    case '':
      return null;
      break;

    default:
      return <FooterPrompt>
        Mode: {mouseMode}
      </FooterPrompt>
  }

}
