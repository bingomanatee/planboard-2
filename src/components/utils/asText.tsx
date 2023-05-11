import { Text } from 'grommet'

const asText = (item) => (
  typeof item === 'string' ? <Text>{item}</Text> : item
);
export default asText
