import {Text} from 'grommet';

export default function Note({children}) {
  return <div data-role="note" className="note">
    <Text size="xsmall">{children}</Text>
  </div>
}
