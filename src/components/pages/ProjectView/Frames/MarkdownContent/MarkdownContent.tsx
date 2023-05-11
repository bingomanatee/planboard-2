import { useState, useEffect, useContext } from 'react';
import { Text, Box, Heading, Markdown, Spinner } from 'grommet';
import styles from './Markdown.module.scss';
import stateFactory from './Markdown.state.ts';
import useForest from '~/lib/useForest';
import { Content } from '~/types'
import { DataStateContext } from '~/components/GlobalState/GlobalState'
import { DataProvided } from '~/components/GlobalState/types'
import { BoxColumn } from '~/components/BoxVariants'
import Info from '~/components/Info'

type MarkdownProps = { content: Content }

function NoMarkdown() {
  return <BoxColumn fill align="center" justify="center">
    <Info>Please set the content of this markdown frame by clicking the gear at the upper right corner</Info>
  </BoxColumn>
}

export default function MarkdownContent(props: MarkdownProps) {
  const { dataState } = useContext<DataProvided>(DataStateContext)

  const [value, state] = useForest([stateFactory, props, dataState],
    (localState) => {
      let sub;
      localState.do.loadContent().then(
        () => {
          if (localState.value.id) {
            sub = dataState.child('markdown')!
              .$.watchId(localState.value.id, (markdownRecord) => {
                if (markdownRecord) {
                  if (markdownRecord.content) {
                    localState.do.set_markdown({ ...markdownRecord?.content })
                  }
                } else {
                  console.warn('subscription to ', localState.value.id, 'gave empty record');
                }
                // note - not set up to handle the markdown record being deleted/removed.
                // hopefully in this scenario this whole view will be terminated first...
              });
          }
        }).catch(() => {
        console.warn('no content to watch');
        state.do.set_markdown(false);
      })
      return () => sub?.unsubscribe();
    });

  const { markdown } = value;

  if (markdown === null) {
    return (<div className={styles.container}>
      <Spinner/>
    </div>);
  } else if (markdown === false) {
    return (<div className={styles.container}>
      <NoMarkdown/>
    </div>);
  } else {
    return (<div className={styles.container}>
      <Heading level={2} size="small">
        {markdown.title}
      </Heading>
      <article>
        <Markdown>{markdown.text}</Markdown>
      </article>
    </div>);
  }
}
