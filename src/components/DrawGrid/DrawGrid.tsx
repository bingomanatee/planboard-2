import { useState, useEffect, useRef, useMemo } from 'react';
import { Text, Box } from 'grommet';
import styles from './DrawGrid.module.scss';
import stateFactory from './DrawGrid.state.ts';
import useForest from '~/lib/useForest';
import { GridStateValue } from '~/components/pages/ProjectView/ProjectEdit/EditGrid/EditGrid.state'
import { RgbaColor } from 'react-colorful'
import { GenericProps } from '~/types'

type DrawGridProps = GridStateValue;

function purgeTemp(root) {
  const oldTemp = root.getElementByClassName('temp');
  if (oldTemp) {
    oldTemp.parentElement?.removeChild(oldTemp);
  }
}

function makeGridStyle(div: HTMLDivElement, color: RgbaColor, size: number) {
  const { r, g, b, a } = color;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.rect(0,0, size, 1);
  ctx.rect(0,0,1, size);
  ctx.lineWidth = 1;
  ctx.fillStyle = `rgba(${r},${g},${b},${a})`
  ctx.fill();

  const url = canvas.toDataURL('image/png');

  div.style.background = `url("${url}")`;

}

export default function DrawGrid(props: DrawGridProps & GenericProps) {
  const { gridColor, resolution, active } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && gridColor && active && (resolution >= 8)) {
      makeGridStyle(containerRef.current, gridColor, resolution);
    } else {
      if (containerRef.current) containerRef.current.style .background = null;
    }
  }, [gridColor, resolution, gridColor])

  return (<div data-role="grid-sample" className={styles.container} ref={containerRef}>
    {props.children}
  </div>);
}
