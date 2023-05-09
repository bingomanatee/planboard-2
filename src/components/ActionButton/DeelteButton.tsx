import ActionButton, { MetaActionButtonProps } from '~/components/ActionButton/ActionButton'

export default function DeleteButton(props: MetaActionButtonProps) {
  const { onClick } = props;

  return (
    <ActionButton onClick={onClick}
                  textProps={{color: 'status-critical'}}
                  iconName="ab-delete-button">{props.children}</ActionButton>
  );
}

