import { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { Text, Box, Drop } from 'grommet';
import styles from './ContentPrompt.module.scss';
import stateFactory from './ContentPrompt.state.ts';
import useForest from '~/lib/useForest';
import Img from '~/components/Img'
import { BoxColumn, BoxRow } from '~/components/BoxVariants'
import { Frame, triggerFn } from '~/types'
import MarkdownIcon from '~/components/icons/MarkdownIcon'
import ImageIcon from '~/components/icons/ImageIcon'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { DataStateContext, DataStateContextValue } from '~/components/GlobalState/GlobalState'

type ContentPromptProps = {
  frameId: string,
  frame: Frame
}

const iconMap = new Map([
  ['markdown', {
    icon: MarkdownIcon,
    label: 'MarkdownContent/Text'
  }],
  ['image', {
    icon: ImageIcon,
    label: 'Image'
  }]
]);
const align = { top: 'bottom', left: 'left' };

type ContentChoiceIconProps = { onClick: triggerFn, type: string };

function ContentChoiceIcon(props: ContentChoiceIconProps) {
  const { icon: Icon, label } = iconMap.get(props.type)!;
  return (<BoxColumn
    focusIndicator={false}
    onClick={props.onClick}
    align="center" pad="small"
    className={styles.icon}>
    {<div className={styles.iconWrapper}><Icon/></div>}
    <Text size="xsmall">{label}</Text>
  </BoxColumn>)
}

export default function ContentPrompt(props: ContentPromptProps) {
  const {dataState} = useContext<DataStateContextValue>(DataStateContext)
  const [value, state] = useForest([stateFactory, props, dataState]);

  const { showOptions } = value;

  return <div className={styles.container}>
    <BoxColumn align="center"
               gap="xsmall"
               fill
               justify="center"
               focusIndicator={false}
               onClick={state.do.showOptions}
    >
      <Img src="/img/icons/make-content.svg"
           onClick={state.do.showOptions} width={40} height={40}/>
      <Text size="xsmall">Choose content</Text>
    </BoxColumn>
    {showOptions && window.document.getElementById(`frame-${props.frameId}`) ?
      <Drop target={window.document.getElementById(`frame-${props.frameId}`)}
            align={align}
            style={{ zIndex: 100000 }}>
        <BoxRow gap="small" className={styles.options}>
          {['markdown', 'image'].map((type) => (
            <ContentChoiceIcon onClick={(e) => state.do.select(type, e)} key={type} type={type}/>
          ))
          }
        </BoxRow>
      </Drop> : ''}
  </div>;
}
