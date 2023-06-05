import { GenericPageProps } from '~/types'
import { useCallback, useContext, useMemo } from 'react'
import { generalObj } from '@wonderlandlabs/collect/lib/types'
import { ResponsiveContext, Text, ThemeContext } from 'grommet'
import { normalizeColor } from 'grommet/utils'
import styles from '~/components/Tabs/Tabs.module.scss'
function getEdgeSize(theme: generalObj, size: string, subSize = 'xsmall') {
  const { global: themeGlobal } = theme;
  const { breakpoints, edgeSize } = themeGlobal;
  if (breakpoints?.[size].edgeSize?.[subSize]) {
    return breakpoints[size].edgeSize[subSize];
  }
  if (subSize in edgeSize) {
    return edgeSize[subSize];
  }
  return '';
}

function getBorderSize(theme: generalObj, size: string, subSize = 'xsmall') {
  const { global: themeGlobal } = theme;
  const { breakpoints, borderSize } = themeGlobal;
  if (breakpoints?.[size].borderSize?.[subSize]) {
    return breakpoints[size].borderSize[subSize];
  }
  return borderSize[subSize];
}

export function Tab({ index, setCurrent, current, children }: {
  index: number,
  current: number,
  setCurrent: (n: number) => void,
} & GenericPageProps) {

  const theme = useContext<generalObj>(ThemeContext);
  const size = useContext(ResponsiveContext);

  const {
    edgeSize,
    borderSize,
    background,
    tabFill,
    color,
    padSize,
    reversedColor,
    borderColor
  } = useMemo(() => {
    const edgeSize = getEdgeSize(theme, size)
    const padSize = getEdgeSize(theme, 'medium')
    const borderSize = getBorderSize(theme, size)
    const background = normalizeColor('custom-tab-head-background', theme);
    const tabFill = normalizeColor('custom-tab-fill', theme);
    const color = normalizeColor('text-strong', { ...theme, dark: !theme.dark });
    const reversedColor = normalizeColor('text', theme);
    const borderColor = normalizeColor('dark-3', theme);
    return {
      edgeSize, borderSize, background, tabFill, color, reversedColor, borderColor, padSize
    }
  }, [theme, size]);
  const active = current === index;

  const updateCurrent = useCallback(() => setCurrent(index), [setCurrent, index])
  return (<div style={{
    padding: `calc(${edgeSize}/2) ${edgeSize}`,
    background: background,
    marginRight: edgeSize,
    borderWidth: borderSize,
    borderColor: borderColor
  }}
               onClick={updateCurrent}>
    <Text margin={{ horizontal: padSize }} truncate style={{ color: color }}>{children}</Text>
    {active ? (
      <div className={styles.overlay} style={{
        padding: `calc(${edgeSize}/2) ${edgeSize}`,
        background: tabFill,
        top: borderSize
      }}
           onClick={updateCurrent}>
        <Text margin={{ horizontal: padSize }} truncate style={{ color: reversedColor }}>{children}</Text>

      </div>
    ) : null}
  </div>)
}
