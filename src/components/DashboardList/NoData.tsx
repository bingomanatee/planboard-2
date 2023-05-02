import { memo } from 'react'
import { BoxColumn } from '~/components/BoxVariants'
import { Text } from 'grommet';

const NoData = memo(function NoDataBase({ children }) {
  return <BoxColumn pad="medium" align="center" justify="center">
    <Text color="status-info"> {children || 'no items'}</Text>
  </BoxColumn>
})

export default NoData;
