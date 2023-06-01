import { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic'
import { Spinner } from 'grommet'
import Popup from '~/components/Popup/Popup'
import {
  MODE_ADD_FRAME,
  MODE_EDIT_GRID,
  MODE_FRAMES_LIST,
  TargetData
} from '~/components/pages/ProjectView/ProjectView.state'
import MouseActionTerminator from '~/components/MouseActionTerminator'
import { triggerFn } from '~/types'

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
        case MODE_ADD_FRAME:
          projectEditorsMap.set(MODE_ADD_FRAME, dynamic(() => import('./EditFrame/EditFrame'),
            { suspense: true }));
          break;
        case MODE_EDIT_GRID:
          projectEditorsMap.set(MODE_EDIT_GRID, dynamic(() => import('./EditGrid/EditGrid'),
            { suspense: true }));
          break;

        case MODE_FRAMES_LIST:
          projectEditorsMap.set(MODE_FRAMES_LIST, dynamic(() => import('./ListFrames/ListFrames'),
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
