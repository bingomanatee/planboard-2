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
import { ProjectViewStateContext, ProjectViewStateContextProvider } from '~/components/pages/ProjectView/ProjectView'
import useForestFiltered from '~/lib/useForestFiltered'

type ContentPromptProps = {
  frameId: string,
  frame: Frame,
  frameState: leafI
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
  const projectState = useContext<ProjectViewStateContextProvider>(ProjectViewStateContext);
  const { dataState } = useContext<DataStateContextValue>(DataStateContext)
  const [value, state] = useForest([stateFactory, props, dataState, projectState]);

  const { show, closed } = value;
  const { mouseMode } = useForestFiltered(projectState, ['mouseMode']);

  const target = useMemo(() => {
    return mouseMode ? null : window.document.getElementById(`frame-${props.frameId}`)
  }, [mouseMode, props.frameId])

  const { floatId } = useForestFiltered(props.frameState, ['floatId']);

  useEffect(() => {
    if (show && (props.frameId !== floatId)) {
      state.do.closeOptions();
    }
  }, [props.frameId, floatId, show, state]);

  if (closed && show) {
    state.do.reopen();
    return null;
  }

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
    {show && (!mouseMode) && (floatId === props.frameId) && target ?
      <Drop target={target}
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
