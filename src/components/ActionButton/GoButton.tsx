import ActionButton, { MetaActionButtonProps } from '~/components/ActionButton/ActionButton'
export default function GoButton(props: MetaActionButtonProps) {
  const { children, onClick } = props;

  return <ActionButton  iconName="ab-go-button" onClick={onClick}>{children}</ActionButton>
}
