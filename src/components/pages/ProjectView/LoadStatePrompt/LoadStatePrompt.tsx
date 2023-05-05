import { Text, Box, Layer, Spinner, Paragraph, Markdown } from 'grommet';
import Popup from '~/components/Popup/Popup'
import { MessageModal } from '~/components/utils/MessageModal'
import helpText from '~/components/utils/helpText.json'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestFiltered from '~/lib/useForestFiltered'
import styles from './LoadStatePrompt.module.scss';

type LoadStatePromptProps = { state: leafI }

function FooterPrompt({children}) {
  return <Box pad={{horizontal: 'small', vertical: 'medium'}}
              background="nav-background"
              className={styles.footerPrompt}>
    <Text size="small">{children}</Text>
  </Box>
}

export default function LoadStatePrompt({ state }: LoadStatePromptProps) {

  const { loadState, keyData } = useForestFiltered(state, ['keyData', 'loadState']);

  if (loadState === 'loading') {
    return <Layer>
      <Spinner size="large"/>
    </Layer>
  }

  if (loadState === 'error') {
    return (
      <Popup>
        <MessageModal heading={'Error Loading Project'}>
          <Paragraph>
            {`There was an error loading project ${state.getMeta('id')}":`}
          </Paragraph>
          <code>
            {state.value.loadError?.message || ''}
          </code>
        </MessageModal>
      </Popup>
    )
  }

  if (loadState === 'loaded') {
    return (
      <Popup observer={(showing) => {
        if (!showing) {
          state.do.set_loadState('finished');
        }
      }}>
        <MessageModal heading="Loaded Project" cancelLabel="Proceed">
          <Paragraph>
            {`Loaded Project ${state.getMeta('id')}"`}
          </Paragraph>
          {state.value.frames.length ? '' : (
            <article>
              <Markdown>
              {helpText.startProjectText}
            </Markdown>
            </article>
          )}
        </MessageModal>
      </Popup>
    )
  }

  if (loadState === 'finished') {
    if (keyData) {
      switch (keyData.key) {
        case  'f':
          return (<FooterPrompt>
            Mouse drag to create a Frame
          </FooterPrompt>)
          break;
      }
    }
  }

  return null;
}
