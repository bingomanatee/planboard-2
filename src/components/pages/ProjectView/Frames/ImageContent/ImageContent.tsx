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
    async (localState) => {
      await state.do.loadContent();
      const {id, stored} = localState.value;
      if (!(id && stored)) return;

      const sub = dataState.child('images')!.$.watchId(id, (record) => {
        localState.do.set_image(record.content);
      });

      return () => sub.unsubscribe();
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
    content = <img src={imageUrl} alt={id} style={state.$.imageStyle() }/>
  } else {
    content = <Spinner/>
  }

  return (<div className={styles.container}>
    {content}
  </div>);
}
