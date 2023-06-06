import { BoxRow } from '~/components/BoxVariants'
import { GenericProps } from '~/types'

const ButtonRow = ({children}: GenericProps) =>(<BoxRow justify="between" pad="small">{children}</BoxRow>);

export default ButtonRow;
