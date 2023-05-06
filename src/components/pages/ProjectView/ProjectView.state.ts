import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { isEqual } from 'lodash'
import { Vector2 } from 'three'
import { Frame, Project } from '~/types'

function toPoint(e: MouseEvent) {
  return new Vector2(e.pageX, e.pageY);
}

type KeyData = {
  key: string,
  shiftKey: boolean,
  altKey: boolean
}

type LoadState = '' | 'loading' | 'error' | 'finished';
type ProjectState = '' | 'drawing-frame';

export type ProjectViewValue = {
  loadError: any,
  project: Project | null,
  frames: Frame[] | null,
  keyData: KeyData | null,
  loadState: LoadState,
  projectState: ProjectState,
  startPoint: Vector2 | null,
  endPoint: Vector2 | null
}

const ProjectViewState = ({ id }, dataState: leafI, backRef) => {
  const initial: ProjectViewValue = {
    loadError: null,
    project: null,
    frames: null,
    loadState: 'start',
    keyData: null,
    projectState: '',
    startPoint: null,
    endPoint: null,
  };

  console.log('dataState:', dataState, 'backRef: ', backRef);

  return {
    $value: initial,
    selectors: {},
    meta: {
      id,
    },
    actions: {
      finishFrame(state: typedLeaf<ProjectViewValue>) {
        console.log('finishing frame');
        const { startPoint, endPoint } = state.value;
        window.removeEventListener('mouseup', state.getMeta('mouseUpListener'));
        window.removeEventListener('mouseup', state.getMeta('mouseMoveListener'));
        state.do.set_startPoint(null);
        state.do.set_startPoint(null);
        state.do.set_projectState('');
        dataState.child('frames')!.do.createFrame(state.value.project?.id, startPoint, endPoint);
        console.log('finished frame');
      },
      mouseDown(state: leafI, e: MouseEvent) {
        e.stopPropagation();
        const { loadState, projectState, keyData } = state.value;
        if ((loadState !== 'finished') || (projectState) || (keyData?.key !== 'f') || (!backRef.current)) {
          console.log('--- skipping mousedown: loadState ', loadState,
            'projectState:', projectState,
            'keyData.key', keyData?.key,
            'backRef', backRef);
          return;
        }
        console.log('mouseDown with backRef:', backRef, e);

        state.do.set_projectState('drawing-frame');
        const startPoint = toPoint(e);
        state.do.set_startPoint(startPoint);

        const mouseUpListener = (e2) => {
          console.log('--- end of drag');
          window.removeEventListener('mouseup', mouseUpListener);
          window.removeEventListener('mousemove', mouseMoveListener);

          if (isEqual(startPoint, state.value.startPoint)) {
            state.do.set_endPoint(toPoint(e2));
            state.do.finishFrame();
          }
        }

        const mouseMoveListener = (e2) => {
          console.log('mouse moving', toPoint(e2));
          if (isEqual(startPoint, state.value.startPoint)) {
            state.do.set_endPoint(toPoint(e2));
            console.log('--- endPoint set to', state.value.endPoint);
          } else {
            console.log('--- startPoint changed -- aborting');
            window.removeEventListener('mousemove', mouseMoveListener);
            window.removeEventListener('mouseup', mouseUpListener)
          }
        }

        window.removeEventListener('mouseup', state.getMeta('mouseUpListener'));
        window.removeEventListener('mousemove', state.getMeta('mouseMoveListener'));
        state.setMeta('mouseUpListener', mouseUpListener, true);
        state.setMeta('mouseMoveListener', mouseMoveListener, true);

        window.addEventListener('mouseup', mouseUpListener);
        window.addEventListener('mousemove', mouseMoveListener);
        console.log('finished mouseDown');
      },
      keyDown(state: leafI, e: KeyboardEvent) {
        const { key, shiftKey, altKey } = e;
        const data = { key, shiftKey, altKey };
        if (!isEqual(data, state.value.keyData)) {
          state.do.set_keyData(data);
        }
        e.stopPropagation();
      },
      keyUp(state: leafI, e: KeyboardEvent) {
        state.do.set_keyData(null);
        e.stopPropagation();
      },
      load(state: leafI) {
        state.do.set_loadState('loading');
        state.do.doLoad();
      },
      async doLoad(state: leafI) {
        try {
          const loaded = await dataState.do.loadProject(id);
          const { project, frames, content } = loaded;
          state.do.set_project(project);
          state.do.set_frames(frames);
          state.do.set_loadState('loaded');
        } catch (err) {
          state.do.set_loadError(err.message);
          state.do.set_loadState('error');
        }
      }
    }
  };
};

export default ProjectViewState;
