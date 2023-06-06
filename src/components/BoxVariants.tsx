import { Box, ResponsiveContext } from 'grommet'
import { GenericProps } from '~/types'
import { useContext, useMemo } from 'react'
import { DirectionType } from 'grommet/utils'
import { generalObj } from '@wonderlandlabs/collect/lib/types'


export const BoxRow = ({ children, ...rest }: generalObj & GenericProps) => (<Box direction="row" focusIndicator={false}  {...rest}>{children}</Box>)
export const BoxColumn = ({ children, ...rest }: generalObj & GenericProps) => (
  <Box direction="column" focusIndicator={false}  {...rest}>{children}</Box>)

const sizes = ['small', 'medium', 'large']
export const BoxFlip = ({ direction, flip='medium', children, ...rest }: {
  direction: DirectionType, flip?: string
} & generalObj & GenericProps) => {
  const size = useContext(ResponsiveContext);
  const realDirection: DirectionType = useMemo(() => {
    const index = sizes.indexOf(size);
    if (index === -1) {
      return direction;
    }
    if (index >= sizes.indexOf(flip)) {
      return direction === 'row' ? 'column' : 'row';
    }
    return direction;
  }, [size, direction, flip]);
  return (
    <Box direction={realDirection} focusIndicator={false} {...rest}>
      {children}
    </Box>
  )
}
