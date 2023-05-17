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
  projectId: string,
  frames: Frame[] | null,
  keyData: KeyData | null,
  loadState: LoadState,
  mouseMode: ProjectMode,
  startPoint: Vector2 | null,
  endPoint: Vector2 | null,
  editItem: TargetData | null;
  moveItem: TargetData | null;
  screenOffset: Vector2;
  screenOffsetDelta: Vector2 | null;
  settings: Map<string, any>;
  editMode: string | null;
}

const META_MOVE = 'handleMouseMove';
const META_UP = 'handleMouseUp';
const META_DOWN_LISTENERS = 'downListeners';

const MOUSE_MOVE = 'mousemove';
const MOUSE_UP = 'mouseup';

const MODE_DRAG_SCREEN = 'dragging-screen'

const ProjectViewState = ({ id }, dataState: leafI, globalState: leafI, backRef) => {
  const initial: ProjectViewValue = {
    loadError: null,
    project: null,
    projectId: id,
    frames: null,
    loadState: 'start',
    keyData: null,
    mouseMode: '',
    startPoint: null,
    endPoint: null,
    editType: null,
    moveItem: null,
    screenOffset: new Vector2(0, 0),
    screenOffsetDelta: null,
    settings: new Map(),
    editMode: null
  };

  return {
    $value: initial,
    selectors: {
      // NOTE: it does NOT clear mouseMode.
      clearMouseListeners(state: leafI, ...rest) {
        const mouseUpListener = state.getMeta(META_UP);
        state.setMeta(META_UP, null, true);
        const mouseMoveListener = state.getMeta(META_MOVE);
        state.setMeta(META_MOVE, null, true);
        window.removeEventListener(MOUSE_UP, mouseUpListener);
        window.removeEventListener(MOUSE_MOVE, mouseMoveListener);
        state.$.clearListeners(mouseUpListener, mouseMoveListener, ...rest)
      },
      clearListeners(state: leafI, ...rest) {
        // brute-force remove all other arguments from all possible hooks
        rest.forEach((listener) => {
          if (typeof listener === 'function') {
            window.removeEventListener(MOUSE_UP, listener);
            window.removeEventListener(MOUSE_MOVE, listener);
          }
        })
      },
      addMouseListeners(state, mouseMoveListener, mouseUpListener) {
        state.$.clearMouseListeners(mouseMoveListener, mouseUpListener);
        // just for sanity's sake make sure the listeners are only queued once.
        // May be done automatically by the DOM system, but it doesn't hurt to be sure.
        window.addEventListener(MOUSE_UP, mouseUpListener);
        window.addEventListener(MOUSE_MOVE, mouseMoveListener);
        state.setMeta(META_UP, mouseUpListener, true);
        state.setMeta(META_MOVE, mouseMoveListener, true);
      }
    },
    meta: {
      id, // id of the current project
    },
    actions: {
      editGrid(state: typedLeaf<ProjectViewValue>) {
        state.do.set_editMode('grid');
      },
      initNavMenu(state: typedLeaf<ProjectViewValue>) {
        globalState.do.clearMenuItems();
        const items = [
          {
            type: 'button', label: 'grid', props: {
              onClick: state.do.editGrid,
              plain: true
            }
          }
        ]
        globalState.do.addMenuItems(items);
      },
      editItem(state: typedLeaf<ProjectViewValue>, editType) {
        state.do.set_editType(editType || null);
      },
      closeEdit(state: typedLeaf<ProjectViewValue>) {
        state.do.set_editType(null);
        state.do.set_editMode(null);
      },
      finishFrame(state: typedLeaf<ProjectViewValue>, skipCreate) {
        const { startPoint, endPoint, screenOffset } = state.value;
        startPoint.sub(screenOffset);
        endPoint.sub(screenOffset);
        state.$.clearMouseListeners();
        state.do.set_startPoint(null);
        state.do.set_endPoint(null);
        state.do.releaseProjectMode('drawing-frame');
        if (!skipCreate) {
          dataState.child('frames')!.do.createFrame(state.value.project?.id, startPoint, endPoint);
        }
      },
      initMove(state: leafI, targetData: TargetData) {
        const { loadState, mouseMode, keyData } = state.value;
        if ((!['loaded', 'finished'].includes(loadState)) || (mouseMode)) {
          return;
        }
        if (state.do.claimProjectMode('moving-item') === 'moving-item') {
          state.do.set_moveItem(targetData);

          state.do.addDownListener((e) => {
            e.stopPropagation();
            if (state.value.mouseMode === 'moving-item') {
              state.do.completeMove('downListener');
            }
          });
        }

      },
      addDownListener(state: leafI, trigger: triggerFn) {
        setTimeout(() => {
          const listeners = state.getMeta(META_DOWN_LISTENERS);
          if (!listeners) {
            state.setMeta(META_DOWN_LISTENERS, new Set([trigger]), true);
          } else { // just add to the existing one
            listeners.add(trigger);
          }
        }, 10);
      },
      completeMove(state: leafI, e) {
        state.$.clearMouseListeners();
        state.do.releaseProjectMode('moving-item');
      },
      // downListeners are any "extra hooks" that components may add to handle down conditions
      // typically to close opened dialogs

      execDownListeners(state: leafI, e: MouseEvent) {
        const listeners = state.getMeta(META_DOWN_LISTENERS);
        if (listeners) {
          listeners.forEach((fn: triggerFn) => {
            if (typeof fn === 'function') {
              fn(e);
            }
          });
        }
        state.setMeta(META_DOWN_LISTENERS, null, true);
      },
      mouseDown(state: leafI, e: MouseEvent) {
        const { loadState, mouseMode, keyData } = state.value;

        if (isMouseResponder(e.target)) {
          // another process is going to handle the mouseDown event
          return;
        }

        state.do.execDownListeners(e);

        e.stopPropagation();

        if (mouseMode === 'moving-item') {
          state.do.completeMove('projectView.mouseDown');
          return;
        }

        if ((!['loaded', 'finished'].includes(loadState)) || (mouseMode) || (!backRef.current)) {
          return;
        }

        if (keyData?.key === 'f') {
          return state.do.startDrawingFrame(e);
        }
        if (keyData?.key === ' ') {
          return state.do.startDraggingScreen(e);
        }
      },
      startDraggingScreen(state: leafI, e: MouseEvent) {
        state.do.claimProjectMode(MODE_DRAG_SCREEN);
        const startPoint = toPoint(e);
        state.do.set_startPoint(startPoint);

        const mouseUpListener = () => {
          state.$.clearMouseListeners(mouseMoveListener, mouseUpListener);
          state.do.set_screenOffset(
            state.value.screenOffset
              .clone()
              .add(state.value.screenOffsetDelta)
          )
          state.do.set_screenOffsetDelta(null);
          state.do.releaseProjectMode(MODE_DRAG_SCREEN)
        }

        const mouseMoveListener = (e2) => {
          const endPoint = toPoint(e2);
          state.do.set_endPoint(endPoint);
          const delta = endPoint.clone().sub(state.value.startPoint);
          state.do.set_screenOffsetDelta(delta);
        }
        window.addEventListener(MOUSE_MOVE, mouseMoveListener);
        window.addEventListener(MOUSE_UP, mouseUpListener);
      },
      startDrawingFrame(state: leafI, e: MouseEvent) {
        state.do.claimProjectMode('drawing-frame');
        const startPoint = toPoint(e);
        state.do.set_startPoint(startPoint);

        const mouseUpListener = (e2) => {
          state.do.set_endPoint(toPoint(e2));
          // if for some reason the start point is not the same one that began this cycle,
          // do not save the frame data / add a new frame based on the points
          state.do.finishFrame(!isEqual(startPoint, state.value.startPoint));
        }

        const mouseMoveListener = (e2) => {
          if (isEqual(startPoint, state.value.startPoint)) {
            state.do.set_endPoint(toPoint(e2));
          } else { // some amodal error - stop the process.
            state.$.clearListeners(mouseMoveListener, mouseUpListener);
          }
        }
        state.$.addMouseListeners(mouseMoveListener, mouseUpListener);
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
        return state.do.doLoad();
      },
      async doLoad(state: leafI) {
        try {
          const loaded = await dataState.do.loadProject(id);
          const { project, frames, content, settings } = loaded;
          state.do.set_project(project);
          await state.do.set_frames(frames);
          state.do.set_settings(settings);
          state.do.set_loadState('loaded');
        } catch (err) {
          console.warn('load error:', err);
          state.do.set_loadError(err.message);
          state.do.set_loadState('error');
        }
      },
      claimProjectMode(state: leafI, token) {
        if (state.value.mouseMode || !token) {
          return false;
        }
        state.do.set_mouseMode(token);
        return token;
      },
      releaseProjectMode(state: leafI, token: ProjectMode) {
        if (state.value.mouseMode === token) {
          state.do.set_mouseMode('');
        } else {
          console.warn('releaseProjectMode:: mouseMode', state.value.mouseMode, ' !== ', token);
        }
      },
    }
  };
};

export default ProjectViewState;
