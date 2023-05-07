import { useState, useEffect, useMemo, Suspense } from 'react';
import { Text, Box, Spinner } from 'grommet';
import styles from './FrameContent.module.scss';
import stateFactory from './FrameContent.state.ts';
import useForest from '~/lib/useForest';
import { Content, Frame } from '~/types'
import MarkdownContent from './MarkdownContent/MarkdownContent'
import ImageContent from './ImageContent/ImageContent'

type FrameContentProps = { frame: Frame, content: Content }

function Unknownn() {
  return <p>Uknown Content Type</p>;
}

export default function FrameContent(props: FrameContentProps) {
  const { frame, content } = props;
  const [state, value] = useForest([stateFactory, frame, content],
    (localState) => {
    });

  const {} = value;

  console.log('========= FrameContent: content ', content, 'frame:', frame)
  const InnerComponent = useMemo(() => {
    switch (content.type) {
      case 'markdown':
        return MarkdownContent;
        break;

      case 'image':
        return ImageContent
        break;

      default:
        return Unknownn;
    }
  }, [content.type])

  return (<div className={styles.container}>
    <header>
      <Text size="xxsmall">
        {content.type} frame {frame.id}
      </Text>
    </header>
    <InnerComponent content={content} />
  </div>);
}
