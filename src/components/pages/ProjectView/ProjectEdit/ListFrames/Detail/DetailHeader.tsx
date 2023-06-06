import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import styles from '~/components/pages/ProjectView/ProjectEdit/ListFrames/Detail/Detail.module.scss'
import { Button, Header, Heading, Text } from 'grommet'
import MoveButtonUp from '~/components/icons/MoveButtonUp'
import MoveButtonDown from '~/components/icons/MoveButtonDown'
import { DetailProps } from '~/components/pages/ProjectView/ProjectEdit/ListFrames/Detail/types'
import { Content, Frame } from '~/types'

export default function DetailHeader({ mode, props, content, frame }: {
  props: DetailProps, content: Content, mode: string, frame: Frame }) {
  return (
    <Header>
      {(mode === 'links') ? null : (<BoxRow gap="small" className={styles['move-button']}>
        <Button plain onClick={props.state.do.moveTop}>
          <MoveButtonUp top/>
        </Button>
        <Button plain onClick={props.state.do.moveUp}>
          <MoveButtonUp/>
        </Button>
      </BoxRow>)}
      <BoxColumn fill="horizontal" className={styles['detail-head']}>
        <Heading level={2} textAlign="center"
                 weight="bold">Frame &quot;{frame.name || '(unnamed) '}&quot; {(content?.type) ? ': ' : ''}{content?.type || '(no content)'}</Heading>
        <Text weight="bold" as="div" textAlign="center" size="large">{frame.id}</Text>
        <span className={styles.order}>
  <Text size="small">
    {frame.order}</Text>
    </span>
      </BoxColumn>
      {(mode === 'links') ? null : (<BoxRow gap="small" plain className={styles['move-button']}>
        <Button plain onClick={props.state.do.moveDown}>
          <MoveButtonDown/>
        </Button>
        <Button plain onClick={props.state.do.moveBottom}>
          <MoveButtonDown bottom/>
        </Button>
      </BoxRow>)}
    </Header>
  )
}
