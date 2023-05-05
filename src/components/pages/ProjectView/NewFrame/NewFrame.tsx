import { useState, useEffect, useMemo } from 'react';
import { Text, Box } from 'grommet';
import styles from './NewFrame.module.scss';
import stateFactory from './NewFrame.state.ts';
import useForest from '~/lib/useForest';
import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { ProjectViewValue } from '~/components/pages/ProjectView/ProjectView.state'
import useForestFiltered from '~/lib/useForestFiltered'
import { Vector2 } from 'three'
import { propsToPx } from '~/lib/utils'
import { BoxRow } from '~/components/BoxVariants'

type NewFrameProps = {
  projectState: typedLeaf<ProjectViewValue>
}

export default function NewFrame(props: NewFrameProps) {
  /*  const [state, value] = useForest([stateFactory, props],
      (localState) => {
      });

    const {} = value;*/

  const { projectState, startPoint, endPoint }: Partial<ProjectViewValue> = useForestFiltered(props.projectState,
    ['startPoint', 'endPoint', 'projectState']);

  const style = useMemo(() => {
    if (!(startPoint && endPoint)) {
      return {};
    }

    const coords = [startPoint, endPoint]
      .filter(a => !!a)
      .reduce(
        //@ignore-type
        (coords: { x: number[], y: number[] }, point) => {
          if (point) {
            coords.x.push(point.x);
            coords.y.push(point.y);
          }
          return coords
        }, { x: [], y: [] });

    const first = new Vector2(Math.min(...coords.x), Math.min(...coords.y));
    const second = new Vector2(Math.max(...coords.x), Math.max(...coords.y));

    const firstPx = propsToPx(first);
    const sizePx = propsToPx(first.subVectors(second, first));

    return { top: firstPx.y, left: firstPx.x, width: sizePx.x, height: sizePx.y };
  }, [startPoint, endPoint])

  console.log('newFrame: ', style);

  return (<BoxRow border={{ color: 'new-frame-border', size: '2px' }}
                  className={styles.container} style={style}>
  </BoxRow>);
}
