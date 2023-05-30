import { useContext, useMemo } from 'react';
import styles from './NewFrame.module.scss';
import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { ProjectViewValue } from '~/components/pages/ProjectView/ProjectView.state'
import useForestFiltered from '~/lib/useForestFiltered'
import { Vector2 } from 'three'
import { propsToPx } from '~/lib/utils'
import { BoxRow } from '~/components/BoxVariants'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'
import { roundPoint } from '~/components/utils/pointUtils'

type NewFrameProps = {
  projectState: typedLeaf<ProjectViewValue>
}

export default function NewFrame(props: NewFrameProps) {
  const { screenOffset, startPoint, endPoint }: Partial<ProjectViewValue> = useForestFiltered(props.projectState,
    ['startPoint', 'endPoint', 'projectState', 'screenOffset']);
  const { dataState } = useContext<DataStateContextValue>(DataStateContext);

  const grid = useMemo(() => {
    return dataState.child('settings')!.$.grid();
  }, [dataState]);

  const style = useMemo(() => {
    if (!(startPoint && endPoint)) {
      return {};
    }

    let first = new Vector2(Math.min(startPoint.x, endPoint.x), Math.min(startPoint.y, endPoint.y)).round();
    let second = new Vector2(Math.max(startPoint.x, endPoint.x), Math.max(startPoint.y, endPoint.y)).round();
    first.sub(screenOffset);
    second.sub(screenOffset);
    if (grid?.resolution >= 8) {
      first = roundPoint(first, grid.resolution);
      second = roundPoint(second, grid.resolution, true);
    }

    const firstPx = propsToPx(first);
    const sizePx = propsToPx(first.subVectors(second, first));

    const style = { top: firstPx.y, left: firstPx.x, width: sizePx.x, height: sizePx.y };
    return style;
  }, [startPoint, endPoint])

  return (<div className={styles.container} style={style}>
    <BoxRow border={{ color: 'new-frame-border', size: '2px' }} fill>
    </BoxRow>
  </div>);
}
