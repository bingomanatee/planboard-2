import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { isEqual } from 'lodash'
import { Vector2 } from 'three'
import { Frame, Project, triggerFn } from '~/types'
import { isMouseResponder, toPoint } from '~/lib/utils'

type KeyData = {
  key: string,
  shiftKey: boolean,
  altKey: boolean
}

type LoadState = '' | 'loading' | 'error' | 'finished';
type ProjectMode = '' | 'drawing-frame' | 'moving-item';
export type TargetData = { type: string, id: string };

export type ProjectViewValue = {
  loadError: any,
  project: Project | null,
  frames: Frame[] | null,
  keyData: KeyData | null,
  loadState: LoadState,
  projectMode: ProjectMode,
  startPoint: Vector2 | null,
  endPoint: Vector2 | null,
  editItem: TargetData | null;
  moveItem: TargetData | null;
}

const ProjectViewState = ({ id }, dataState: leafI, backRef) => {
  const initial: ProjectViewValue = {
    loadError: null,
    project: null,
    frames: null,
    loadState: 'start',
    keyData: null,
    projectMode: '',
    startPoint: null,
    endPoint: null,
    editType: null,
    moveItem: null,
  };

  return {
    $value: initial,
    selectors: {},
    meta: {
      id,
    },
    actions: {
      editItem(state: typedLeaf<ProjectViewValue>, editType) {
        state.do.set_editType(editType || null);
      },
      cancelEdit(state: typedLeaf<ProjectViewValue>) {
        state.do.set_editType(null);
      },
      finishFrame(state: typedLeaf<ProjectViewValue>) {
        console.log('finishing frame');
        const { startPoint, endPoint } = state.value;
        window.removeEventListener('mouseup', state.getMeta('mouseUpListener'));
        window.removeEventListener('mouseup', state.getMeta('mouseMoveListener'));
        state.do.set_startPoint(null);
        state.do.set_startPoint(null);
        state.do.releaseProjectMode('drawing-frame');
        dataState.child('frames')!.do.createFrame(state.value.project?.id, startPoint, endPoint);
      },
      initMove(state: leafI, targetData: TargetData) {
        const { loadState, projectMode, keyData } = state.value;
        if ((!['loaded', 'finished'].includes(loadState)) || (projectMode)) {
          console.log('interrupting initMove state = ', loadState, projectMode, keyData?.key, backRef.current);
          return;
        }

        if (state.do.claimProjectMode('moving-item') === 'moving-item') {
          state.do.set_moveItem(targetData);

          state.do.addDownListener((e) => {
            e.stopPropagation();
            if (state.value.projectMode  === 'moving-item') {
              state.do.completeMove('downListener');
            }
          });
        } else {
          console.log('cannot claim project mode:', state.value.projectMode);
        }

      },
      addDownListener(state: leafI, trigger: triggerFn) {
        const listeners = state.getMeta('downListeners');
        if(!listeners) {
          state.setMeta('downListeners', new Set([trigger]), true);
        } else {
          listeners.add(trigger);
        }
      },
      completeMove(state: leafI, e) {
        console.log('completing move, ', e);
        let listener = state.getMeta('mouseDownListener');
        if (listener){
          window.removeEventListener('mousedown', listener);
          state.setMeta('mouseDownListener', null, true);
        }
        state.do.releaseProjectMode('moving-item');
      },
      execDownListeners(state: leafI, e: MouseEvent) {
        const listeners = state.getMeta('downListeners');
        if (listeners) {
          listeners.forEach((fn: triggerFn) =>{
            if (typeof fn === 'function') fn(e);
          });
        }
        state.setMeta('downListeners', null, true);
      },
      mouseDown(state: leafI, e: MouseEvent) {
        const { loadState, projectMode, keyData } = state.value;

        if (isMouseResponder(e.target)){
          return;
        }
        e.stopPropagation();

        state.do.execDownListeners(e);

        if (projectMode === 'moving-item') {
          console.log('museDown in project -- completing move')
          state.do.completeMove('projectView.mouseDown');
          return;
        }

        if ((!['loaded', 'finished'].includes(loadState)) || (projectMode) || (keyData?.key !== 'f') || (!backRef.current)) {
          console.log('stopping mousedown - state = ', loadState, projectMode, keyData?.key, backRef.current);
          return;
        }

        state.do.claimProjectMode('drawing-frame');
        const startPoint = toPoint(e);
        state.do.set_startPoint(startPoint);

        const mouseUpListener = (e2) => {
          window.removeEventListener('mouseup', mouseUpListener);
          window.removeEventListener('mousemove', mouseMoveListener);

          if (isEqual(startPoint, state.value.startPoint)) {
            state.do.set_endPoint(toPoint(e2));
            state.do.finishFrame();
          }
        }

        const mouseMoveListener = (e2) => {
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
      claimProjectMode(state: leafI, token) {
        if (state.value.projectMode || !token) return false;
        state.do.set_projectMode(token);
        return token;
      },
      releaseProjectMode(state: leafI, token: ProjectMode){
        if (state.value.projectMode === token) {
          state.do.set_projectMode('');
        }
      },
      async doLoad(state: leafI) {
        try {
          const loaded = await dataState.do.loadProject(id);
          const { project, frames, content } = loaded;
          state.do.set_project(project);
          state.do.set_frames(frames);
          state.do.set_loadState('loaded');
        } catch (err) {
          console.warn('load error:', err);
          state.do.set_loadError(err.message);
          state.do.set_loadState('error');
        }
      }
    }
  };
};

export default ProjectViewState;
