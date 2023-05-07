import { Text, Box, Layer, Spinner, Paragraph, Markdown } from 'grommet';
import Popup from '~/components/Popup/Popup'
import helpText from '~/components/utils/helpText.json'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestFiltered from '~/lib/useForestFiltered'
import styles from './LoadStatePrompt.module.scss';
import { BoxColumn } from '~/components/BoxVariants';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

type LoadStatePromptProps = { state: leafI }
let MessageModal;

function FooterPrompt({ children }) {
  return <Box pad={{ horizontal: 'small', vertical: 'medium' }}
              background="nav-background"
              className={styles.footerPrompt}>
    <Text size="small">{children}</Text>
  </Box>
}

export default function LoadStatePrompt({ state }: LoadStatePromptProps) {

  const { loadState, keyData } = useForestFiltered(state, ['keyData', 'loadState']);

  if (loadState === 'loading') {
    return <Layer>
      <BoxColumn align="center" justify="center">
        <Spinner size="large"/>
      </BoxColumn>
    </Layer>
  }

  if (loadState === 'error') {
    if (!MessageModal) {
      MessageModal = dynamic(() => import('~/components/utils/MessageModal'), { suspense: true })
    }
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
      if (!MessageModal) {
        MessageModal = dynamic(() => import('~/components/utils/MessageModal'), { suspense: true })
      }
      return (
        <Popup observer={(showing) => {
          if (!showing) {
            state.do.set_loadState('finished');
          }
        }}>
          <Suspense fallback={<Spinner/>}>
            <MessageModal heading="Loaded Project" cancelLabel="Proceed">
              <Paragraph>
                {`Loaded Project ${state.getMeta('id')}"`}
              </Paragraph>

              <article>
                <Markdown>
                  {helpText.startProjectText}
                </Markdown>
              </article>
            </MessageModal>
          </Suspense>
        </Popup>
      )
    } else {
      state.do.set_loadState('finished');
    }
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
