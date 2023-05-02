import { Text } from 'grommet'
import styles from './DashboardCard.module.scss'
import { BoxRow } from '~/components/BoxVariants'

export default function DashboardCard({ label, children, headContent }) {
  return <section className={styles.card}>
    <header>
      <BoxRow justify="between" pad="small">
        {headContent}
        <Text size="small">{label}</Text>
      </BoxRow>
    </header>
    <div>
      {children}
    </div>
  </section>
}
