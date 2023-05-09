import ActionButton, { MetaActionButtonProps } from '~/components/ActionButton/ActionButton'

export default function BackButton(props: MetaActionButtonProps) {
  const { onClick } = props;

  return (
    <ActionButton onClick={onClick} iconName="ab-close-button">{props.children}</ActionButton>
  );
}
