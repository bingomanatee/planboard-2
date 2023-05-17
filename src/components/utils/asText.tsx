import { Text } from 'grommet'

const asText = (item, props={}) => (
  typeof item === 'string' ? <Text {...props}>{item}</Text> : item
);
export default asText
