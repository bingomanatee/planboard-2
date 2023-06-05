import { Children, useEffect, useMemo, useState } from 'react'
import { GenericPageProps } from '~/types'
import styles from './Tabs.module.scss';
import { Box } from 'grommet'
import { generalObj } from '@wonderlandlabs/collect/lib/types'
import { Tab } from '~/components/Tabs/Tab'

export default function Tabs({
                               headers,
                               style = {},
                               contentBoxProps = {},
                               onChange = null,
                               children
                             }: {
  headers: string[],
  contentBoxProps?: generalObj,
  style?: generalObj,
  onChange: ((index: number, header: string) => void) | null;
} & GenericPageProps) {

  const [current, setCurrent] = useState(0);
  const currentChild = useMemo(() => {
    return Children.toArray(children)[current] || '';
  }, [children, current]);

  useEffect(() => {
    if (typeof onChange === 'function') {
      console.log('current set to ', current);
      onChange(current, headers[current] || '');
    }
  }, [current, onChange]);
  return (
    <div style={style} data-type="tab-set" className={styles.tabs}>
      <header>
        {headers.map((headerContent, index) => <Tab
          index={index}
          key={`${headerContent}-${index}`}
          setCurrent={setCurrent}
          current={current}>{headerContent}</Tab>)}
      </header>
      <Box as="section" pad="medium" border={{ size: 'xsmall', color: 'dark-3' }} {...contentBoxProps}>
        {currentChild}
      </Box>
    </div>)
}
