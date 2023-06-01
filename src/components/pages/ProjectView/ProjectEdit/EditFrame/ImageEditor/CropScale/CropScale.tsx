import { useState, useEffect, useRef, useContext } from 'react';
import { Text, Box, Heading, Nav, RangeInput } from 'grommet';
import styles from './CropScale.module.scss';
import stateFactory from './CropScale.state.ts';
import useForest from '~/lib/useForest';
import { BoxRow } from '~/components/BoxVariants'
import { DataProvided } from '~/components/GlobalState/types'
import { DataStateContext } from '~/components/GlobalState/GlobalState'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestInput from '~/lib/useForestInput'
import getImageUrl from '~/components/utils/getImageUrl'

type CropScaleProps = { id: string, contentDataState: leafI, imageId?: string | null }

function percent(n: number) {
  return Math.round(100 * n) + '%'
}

export default function CropScale(props: CropScaleProps) {
  const { dataState } = useContext<DataProvided>(DataStateContext)
  const displayImage = useRef(null);
  const { contentDataState, imageId } = props;

  console.log('contentDataState value:', contentDataState);
  const [scale, handleScale] = useForestInput(contentDataState,  'scale',
    {filter:   (value) => {
        console.log('scale value:', value);
        return Number(value)
      }}
  )

  useEffect(() => {
    const reader = contentDataState.getMeta('fileReader');
    const { id, project_id } = contentDataState.value;
    if (reader) {
      displayImage.current.src = reader.result;
    } else if (id) {
      getImageUrl(id, project_id)
        .then((url) => displayImage.current.src = url)
        .catch((err) => {
            console.warn('error trying to get di url', err);
          })
    }

  }, [contentDataState])

  return (<div className={styles.container}>
    <Heading level={3}>Image: Crop / Scale</Heading>
    <Nav direction="horizontal" fill="horizontal">
      <BoxRow width="50%" gap="medium">
        <Text>Scale</Text>
        <RangeInput min={0.1} max={4} step={0.05} value={scale}
                    onChange={handleScale}/>
        {percent(scale)} ({scale})
      </BoxRow>
      <Text>{props.id}</Text>
    </Nav>
    <section className={styles['image-preview']}>
      <img ref={displayImage}
           alt="display image"
           id="image-editor-display-image"
           style={contentDataState.$.imageStyle()}/>
    </section>
  </div>);
}
