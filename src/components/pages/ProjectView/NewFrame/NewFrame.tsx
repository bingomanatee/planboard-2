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


    const first = new Vector2(Math.min(startPoint.x, endPoint.x), Math.min(startPoint.y, endPoint.y));
    const second = new Vector2(Math.max(startPoint.x, endPoint.x), Math.max(startPoint.y, endPoint.y));

    const firstPx = propsToPx(first);
    const sizePx = propsToPx(first.subVectors(second, first));

    return { top: firstPx.y, left: firstPx.x, width: sizePx.x, height: sizePx.y };
  }, [startPoint, endPoint])

  return (<div className={styles.container} style={style}>
    <BoxRow border={{ color: 'new-frame-border', size: '2px' }} fill>
    </BoxRow>
  </div>);
}
