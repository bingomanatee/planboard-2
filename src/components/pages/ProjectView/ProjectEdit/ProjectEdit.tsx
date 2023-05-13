import { Suspense, useMemo } from 'react';
import styles from './ProjectEdit.module.scss';
import dynamic from 'next/dynamic'
import { Spinner } from 'grommet'
import Popup from '~/components/Popup/Popup'
import { TargetData } from '~/components/pages/ProjectView/ProjectView.state'
import { Mouse } from 'grommet-icons'
import MouseActionTerminator from '~/components/MouseActionTerminator'
import { triggerFn } from '~/types'

/**
 * ProjectEdit is a "generic" portal for displaying ANY edit popup -- ensuring they are displayed one at a time.
 */
type ProjectEditProps = { editItem: TargetData | null, onCancel: triggerFn }

// this is a storage for compoennts used to edit various types of data, indexed by type,
const projectEditorsMap = new Map();

export default function ProjectEdit(props: ProjectEditProps) {

  const Editor = useMemo(() => {
    if (!props.editItem) {
      console.log('ProjectEdit: not displaying anything');
      return null;
    }
    switch (props.editItem.type) {
      case 'frame':
        if (!projectEditorsMap.has('frame')) {
          projectEditorsMap.set('frame', dynamic(() => import('./EditFrame/EditFrame'), { suspense: true }))
        }
        break;
    }

    console.log('ProjectEdit displaying ', props.editItem);
    return projectEditorsMap.get(props.editItem.type);
  }, [props.editItem?.type, props.editItem?.id])

  return (
    <Popup>
      <MouseActionTerminator>
        <Suspense fallback={<Spinner/>}>
          <Editor id={props.editItem?.id} onCancel={props.onCancel}/>
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
