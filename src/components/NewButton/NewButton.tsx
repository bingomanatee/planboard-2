import { ReactNode } from 'react'
import { triggerFn } from '~/types'
import { Button, Text } from 'grommet'
import { BoxRow } from '~/components/BoxVariants'
import Img from '~/components/Img'
import styles from './NewButton.module.scss';

export function NewButton(props: { onClick: triggerFn, icon: string, children: ReactNode }) {
  return <Button size="large" plain elevation="large">
    <BoxRow background="light-2"
            align="center"
            gap="medium"
            size="large"
            className={styles.button}
            pad={{ horizontal: '3px', top: '3px', bottom: '3px', right: '1em' }}>
      <Img width={32} height={32} src={props.icon}/>
      <Text weight="bold" as="span">{props.children}</Text>
    </BoxRow>
  </Button>
}