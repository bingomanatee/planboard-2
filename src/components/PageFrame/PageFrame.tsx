import { Grid, Grommet, Main } from 'grommet'
import Navigation from '~/components/Navigation/Navigation'
import GlobalState from '~/components/GlobalState/GlobalState'
//import Messages from '~/components/Messages/Messages'
import { GenericProps } from '~/types'
import theme from '~/grommet-theme';

const AREAS = [
  { name: 'nav', start: [0, 0], end: [0, 0] },
  { name: 'main', start: [0, 1], end: [0, 1] },
];

const ROWS = ['auto', 'flex'];

const COLUMNS = ['100%'];

export default function PageFrame({ children }: GenericProps) {
  return (<GlobalState>
    <Grommet theme={theme}>
      <Grid
        rows={ROWS}
        columns={COLUMNS}
        gap="none"
        areas={AREAS}
        height="100vh"
      >
        <Navigation/>
        <Main gridArea="main" style={{zIndex: 1}}>
          {children}
        </Main>
      </Grid>
    </Grommet>
  </GlobalState>)
}
//          <Messages/>
