import { Text, Button } from 'grommet';
import styles from './ActionButton.module.scss';
import { generalObj, GenericProps, triggerFn } from '~/types'
import Img from '~/components/Img'
import { BoxRow } from '~/components/BoxVariants'


export type MetaActionButtonProps = { onClick: triggerFn, textProps?: generalObj } & GenericProps;
type ActionButtonProps = { iconName } & MetaActionButtonProps;

export default function ActionButton(props: ActionButtonProps) {
  const { children, onClick, textProps } = props;

  return (
    <Button focusIndicator={false} plain className={styles.container} onClick={onClick}>
      <div className={styles.icon}>
        <Img src={`/img/icons/${props.iconName}.svg`} width={24} height={24}/>
      </div>
      <div className={styles['blur-layer']} data-type="blur-layer">
        &nbsp;
      </div>
      <BoxRow justify="end" align="center" className={styles['label']}>
        {typeof children === 'string' ? <Text size="medium" weight="bold" {...(textProps || {})}>{children}</Text> : children}
      </BoxRow>
    </Button>);
}
