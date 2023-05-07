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
  console.log('MarkdownContent - making state from ', props);
  const [value, state] = useForest([stateFactory, props, dataState],
    (localState) => {
      state.do.loadContent();
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
