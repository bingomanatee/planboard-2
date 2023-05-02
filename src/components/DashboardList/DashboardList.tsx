import { NameId } from '~/types'
import { List } from 'grommet'


export default function DashboardList(props: { data: NameId[] }) {

  return (<div>
    <List data={props.data} primaryKey="id" secondaryKey="name"/>
  </div>)
}
