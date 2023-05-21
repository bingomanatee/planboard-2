import { useState, useEffect, useContext } from 'react';
import { Text, Box, Paragraph, Spinner } from 'grommet';
import styles from './Image.module.scss';
import stateFactory from './Image.state.ts';
import useForest from '~/lib/useForest';
import { DataProvided } from '~/components/GlobalState/types'
import { DataStateContext } from '~/components/GlobalState/GlobalState'
import { BoxColumn } from '~/components/BoxVariants'

type ImageProps = {}

export default function ImageContent(props: ImageProps) {
  const { dataState } = useContext<DataProvided>(DataStateContext)
  const [value, state] = useForest([stateFactory, props, dataState],
    (localState) => {
      state.do.loadContent();
      //@TODO: watch for changes
    });

  const { imageUrlLoadError, imageUrl, id } = value;

  let content = null;

  if (imageUrlLoadError) {
    content = (
      <BoxColumn fill={true} align="center" justify="center">
        <Paragraph margin="medium">
         Click the gear at the upper right to choose an image.
        </Paragraph>
      </BoxColumn>
    )
  } else if (imageUrl) {
    content = <img src={imageUrl} alt={id}/>
  } else {
    content = <Spinner/>
  }

  return (<div className={styles.container}>
    {content}
  </div>);
}
