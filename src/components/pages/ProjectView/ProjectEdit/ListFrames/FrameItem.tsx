import { useCallback, useMemo } from 'react'
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import styles from '~/components/pages/ProjectView/ProjectEdit/ListFrames/ListFrames.module.scss'
import { Text } from 'grommet'

const FRAME_ITEM_BORDER = {
  width: 1,
  border: 'black'
}

export function FrameItem({ frame, state, selected, lock }) {
  const { frame: frameInfo, content } = frame;
  const clickHandler = useCallback(() => {
    state.do.clickFrame(frameInfo.id);
  }, [state]);
  const enterHandler = useCallback(() => {
    state.do.overFrame(frameInfo.id);
  }, [state]);

  const classes = useMemo(() => {
    return [styles['frame-item'],
      (selected === frameInfo.id) ? styles['active-frame'] : '',
      (lock === frameInfo.id ? styles['active-frame-locked'] : '')
    ].join(' ')
  }, [selected, frameInfo.id])

  return (
    <BoxRow fill="horizontal" border={FRAME_ITEM_BORDER} pad="small"
            onClick={clickHandler}
            onMouseEnter={enterHandler}
            className={classes}
            focusIndicator={false}
    >
      <BoxColumn gap="2px" focusIndicator={false}
      >
        <Text
          weight="bold">{frameInfo.name}{frameInfo.name && content?.type ? ': ' : ''}{content?.type || '(no content)'}</Text>
        <Text weight="bold">{frameInfo.id}</Text>
      </BoxColumn>
      <span className={styles.order}>
          <Text size="small">
            {frameInfo.order}</Text>
          </span>
    </BoxRow>
  )
}
