import { Suspense, useMemo } from 'react';
import styles from './ProjectEdit.module.scss';
import dynamic from 'next/dynamic'
import { Spinner } from 'grommet'
import Popup from '~/components/Popup/Popup'
import { TargetData } from '~/components/pages/ProjectView/ProjectView.state'
import { Mouse } from 'grommet-icons'
import MouseActionTerminator from '~/components/MouseActionTerminator'
import { triggerFn } from '~/types'
import EditGrid from '~/components/pages/ProjectView/ProjectEdit/EditGrid/EditGrid'

/**
 * ProjectEdit is a "generic" portal for displaying ANY edit popup -- ensuring they are displayed one at a time.
 */
type ProjectEditProps = {
  editItem?: TargetData | null,
  closeTrigger: triggerFn,
  editMode?: string | null
}

// this is a storage for compoennts used to edit various types of data, indexed by type,
const projectEditorsMap = new Map();

export default function ProjectEdit(props: ProjectEditProps) {

  const Editor = useMemo(() => {
    let editType = null;
    if (props.editItem) {

      editType = props.editItem.type;
    } else if (props.editMode) {
      editType = props.editMode
    } else {
      return null;
    }
    if (!projectEditorsMap.has(editType)) {
      switch (editType) {
        case 'frame':
          projectEditorsMap.set('frame', dynamic(() => import('./EditFrame/EditFrame'),
            { suspense: true }));
          break;
        case 'grid':
          projectEditorsMap.set('grid', dynamic(() => import('./EditGrid/EditGrid'),
            { suspense: true }));
          break;
      }
    }
    return projectEditorsMap.get(editType);

  }, [props.editItem?.type, props.editItem?.id, props.editMode]);

  return (
    <Popup>
      <MouseActionTerminator>
        <Suspense fallback={<Spinner/>}>
          <Editor id={props.editItem?.id} closeTrigger={props.closeTrigger}/>
        </Suspense>
      </MouseActionTerminator>
    </Popup>
  );
}

/**
 * <Popup>
 *     <Suspense fallback={<Spinner/>}>
 *       <Editor id={props.id}/>
 *     </Suspense>
 *   </Popup>
 */
