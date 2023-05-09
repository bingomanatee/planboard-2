import { useState, useEffect, useContext } from 'react';
import { Text, Box, Heading, Markdown, Spinner } from 'grommet';
import styles from './Markdown.module.scss';
import stateFactory from './Markdown.state.ts';
import useForest from '~/lib/useForest';
import { Content } from '~/types'
import { DataStateContext } from '~/components/GlobalState/GlobalState'
import { DataProvided } from '~/components/GlobalState/types'

type MarkdownProps = { content: Content }

export default function MarkdownContent(props: MarkdownProps) {
  const { dataState } = useContext<DataProvided>(DataStateContext)

  const [value, state] = useForest([stateFactory, props, dataState],
    (localState) => {
      let sub;
      localState.do.loadContent().then(() => {
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
      });
      return () => sub?.unsubscribe();
    });

  const { markdown } = value;

  return (<div className={styles.container}>
    {!markdown ? <Spinner/> : (
      <>
        <Heading level={2} size="small">
          {markdown.title}
        </Heading>
        <article>
          <Markdown>{markdown.text}</Markdown>
        </article>
      </>
    )}
  </div>);
}
